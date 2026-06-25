import sys
from unittest.mock import MagicMock

# Mock Home Assistant modules before they are imported
class StaticPathConfig:
    def __init__(self, *args, **kwargs):
        pass

mock_http = MagicMock()
mock_http.StaticPathConfig = StaticPathConfig

mock_core = MagicMock()
mock_core.HomeAssistant = MagicMock

mock_helpers = MagicMock()
mock_helpers.config_validation = MagicMock()
mock_helpers.device_registry = MagicMock()
mock_helpers.aiohttp_client = MagicMock()

sys.modules['homeassistant'] = MagicMock()
sys.modules['homeassistant.components'] = MagicMock()
sys.modules['homeassistant.components.http'] = mock_http
sys.modules['homeassistant.config_entries'] = MagicMock()
sys.modules['homeassistant.core'] = mock_core
sys.modules['homeassistant.helpers'] = mock_helpers
sys.modules['homeassistant.helpers.config_validation'] = mock_helpers.config_validation
sys.modules['homeassistant.helpers.device_registry'] = mock_helpers.device_registry
sys.modules['homeassistant.helpers.aiohttp_client'] = mock_helpers.aiohttp_client

import math
import pytest

from custom_components.weatherflow_lightning_trilateration import TempestStrikeCoordinator
from custom_components.weatherflow_lightning_trilateration.const import EVENT_STRIKE_CALCULATED


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.config = MagicMock()
    hass.config.latitude = 59.847
    hass.config.longitude = 17.61482
    hass.config.path = lambda *args: "/mock/path"
    return hass


@pytest.fixture
def mock_entry():
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    entry.data = {
        "primary_station": "172103",
        "neighbor_stations": "215396,81149",
        "api_token": "mock_token"
    }
    return entry


def test_trilateration_calculation(mock_hass, mock_entry):
    coordinator = TempestStrikeCoordinator(mock_hass, mock_entry)

    # Target is (40.1, -74.9)
    target_lat, target_lon = 40.1, -74.9
    stations = [(40.0, -75.0), (40.15, -74.85), (40.15, -75.15)]
    R = 6371.0

    def compute_dist(s_lat, s_lon):
        cos_lat = math.cos(math.radians(s_lat))
        return R * math.sqrt(
            (math.radians(target_lon - s_lon) * cos_lat) ** 2
            + (math.radians(target_lat - s_lat)) ** 2
        )

    strike_events = [(lat, lon, compute_dist(lat, lon)) for lat, lon in stations]

    # Run trilateration
    coordinator._calculate_trilateration(strike_events)

    # Verify event was fired with the correct coordinates
    mock_hass.bus.async_fire.assert_called_once()
    call_args = mock_hass.bus.async_fire.call_args[0]
    assert call_args[0] == EVENT_STRIKE_CALCULATED

    payload = mock_hass.bus.async_fire.call_args[0][1]
    assert pytest.approx(payload["latitude"], abs=1e-3) == target_lat
    assert pytest.approx(payload["longitude"], abs=1e-3) == target_lon


def test_process_vector_data_relation_merge(mock_hass, mock_entry):
    coordinator = TempestStrikeCoordinator(mock_hass, mock_entry)

    # Mock Overpass response containing a relation with 3 outer member ways
    # forming a closed triangle: (10, 10) -> (10, 20) -> (20, 15) -> (10, 10)
    raw_data = {
        "elements": [
            {
                "type": "relation",
                "id": 999999,
                "tags": {
                    "natural": "water",
                    "type": "multipolygon"
                },
                "members": [
                    {
                        "type": "way",
                        "ref": 1,
                        "role": "outer",
                        "geometry": [
                            {"lat": 10.0, "lon": 10.0},
                            {"lat": 10.0, "lon": 15.0},
                            {"lat": 10.0, "lon": 20.0}
                        ]
                    },
                    {
                        "type": "way",
                        "ref": 2,
                        "role": "outer",
                        "geometry": [
                            {"lat": 20.0, "lon": 15.0},
                            {"lat": 10.0, "lon": 20.0}
                        ]
                    },
                    {
                        "type": "way",
                        "ref": 3,
                        "role": "outer",
                        "geometry": [
                            {"lat": 20.0, "lon": 15.0},
                            {"lat": 10.0, "lon": 10.0}
                        ]
                    }
                ]
            }
        ]
    }

    processed = coordinator._process_vector_data(raw_data)

    assert "water" in processed
    assert len(processed["water"]) == 1

    water_body = processed["water"][0]
    coords = water_body["coordinates"]

    assert len(coords) >= 4
    assert coords[0] == coords[-1]
