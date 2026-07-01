# ruff: noqa: E402
import math
import sys
from unittest.mock import MagicMock

import pytest


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
mock_helpers.event = MagicMock()
mock_helpers.entity_platform = MagicMock()


class MockSensorEntity:
    pass


mock_sensor = MagicMock()
mock_sensor.SensorEntity = MockSensorEntity


class MockConfigFlow:
    @classmethod
    def __init_subclass__(cls, **kwargs):
        pass


class MockOptionsFlow:
    @classmethod
    def __init_subclass__(cls, **kwargs):
        pass

    def async_create_entry(self, title, data):
        return {"type": "create_entry", "title": title, "data": data}


mock_config_entries = MagicMock()
mock_config_entries.ConfigFlow = MockConfigFlow
mock_config_entries.OptionsFlow = MockOptionsFlow

mock_homeassistant = MagicMock()
mock_homeassistant.components = MagicMock()
mock_homeassistant.components.http = mock_http
mock_homeassistant.components.sensor = mock_sensor
mock_homeassistant.config_entries = mock_config_entries
mock_homeassistant.core = mock_core
mock_homeassistant.helpers = mock_helpers
mock_homeassistant.helpers.config_validation = mock_helpers.config_validation
mock_homeassistant.helpers.device_registry = mock_helpers.device_registry
mock_homeassistant.helpers.aiohttp_client = mock_helpers.aiohttp_client
mock_homeassistant.helpers.event = mock_helpers.event
mock_homeassistant.helpers.entity_platform = mock_helpers.entity_platform

sys.modules["homeassistant"] = mock_homeassistant
sys.modules["homeassistant.components"] = mock_homeassistant.components
sys.modules["homeassistant.components.http"] = mock_http
sys.modules["homeassistant.components.sensor"] = mock_sensor
sys.modules["homeassistant.config_entries"] = mock_config_entries
sys.modules["homeassistant.core"] = mock_core
sys.modules["homeassistant.helpers"] = mock_helpers
sys.modules["homeassistant.helpers.config_validation"] = mock_helpers.config_validation
sys.modules["homeassistant.helpers.device_registry"] = mock_helpers.device_registry
sys.modules["homeassistant.helpers.aiohttp_client"] = mock_helpers.aiohttp_client
sys.modules["homeassistant.helpers.event"] = mock_helpers.event
sys.modules["homeassistant.helpers.entity_platform"] = mock_helpers.entity_platform

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
        "api_token": "mock_token",
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
    assert call_args[0] == f"{EVENT_STRIKE_CALCULATED}_{mock_entry.entry_id}"

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
                "tags": {"natural": "water", "type": "multipolygon"},
                "members": [
                    {
                        "type": "way",
                        "ref": 1,
                        "role": "outer",
                        "geometry": [
                            {"lat": 10.0, "lon": 10.0},
                            {"lat": 10.0, "lon": 15.0},
                            {"lat": 10.0, "lon": 20.0},
                        ],
                    },
                    {
                        "type": "way",
                        "ref": 2,
                        "role": "outer",
                        "geometry": [{"lat": 20.0, "lon": 15.0}, {"lat": 10.0, "lon": 20.0}],
                    },
                    {
                        "type": "way",
                        "ref": 3,
                        "role": "outer",
                        "geometry": [{"lat": 20.0, "lon": 15.0}, {"lat": 10.0, "lon": 10.0}],
                    },
                ],
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


def test_station_strikes_tracking(mock_hass, mock_entry):
    coordinator = TempestStrikeCoordinator(mock_hass, mock_entry)

    # Set up device-to-station mapping
    coordinator.device_to_station = {"309874": "125048"}

    # Mock listener callback
    listener_called = False

    def mock_listener():
        nonlocal listener_called
        listener_called = True

    coordinator.async_add_listener(mock_listener)

    # Simulate strike event message
    message = {"type": "evt_strike", "device_id": 309874, "evt": [1782640276, 17.0, 3848]}

    coordinator._process_incoming_message(message)

    # Assert strike stats were updated
    assert coordinator.station_strikes.get("125048") == 1
    assert coordinator.station_last_strike.get("125048") == {
        "timestamp": 1782640276,
        "distance": 17.0,
    }
    assert listener_called is True


def test_osm_vector_cache_invalidation(mock_hass, mock_entry):
    import asyncio
    from unittest.mock import AsyncMock, mock_open, patch

    # Configure mock path return values
    paths_queried = []

    def mock_path_builder(filename):
        paths_queried.append(filename)
        return f"/mock/path/{filename}"

    async def mock_async_add_executor_job(func, *args):
        return func(*args)

    mock_hass.config.path = mock_path_builder
    mock_hass.async_add_executor_job = mock_async_add_executor_job
    coordinator = TempestStrikeCoordinator(mock_hass, mock_entry)

    # Mock coordinates and primary station
    coordinator.primary_station = "172103"
    coordinator.station_coords = {"172103": (59.847, 17.61482)}

    # Mock dynamic OS operations
    exists_mock = MagicMock(return_value=False)
    remove_mock = MagicMock()
    listdir_mock = MagicMock(
        return_value=[
            "vector_cache_172103_59_847_17_61482.json",
            "vector_cache_172103_different.json",
        ]
    )

    # Mock HTTP client responses
    mock_resp = AsyncMock()
    mock_resp.status = 200
    mock_resp.json = AsyncMock(return_value={"elements": []})

    mock_ctx = MagicMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_resp)
    mock_ctx.__aexit__ = AsyncMock(return_value=None)

    mock_session = MagicMock()
    mock_session.post = MagicMock(return_value=mock_ctx)

    with (
        patch(
            "custom_components.weatherflow_lightning_trilateration.async_get_clientsession",
            return_value=mock_session,
        ),
        patch("os.path.exists", exists_mock),
        patch("os.makedirs"),
        patch("os.listdir", listdir_mock),
        patch("os.remove", remove_mock),
        patch("builtins.open", mock_open()),
    ):

        # Trigger cache fetch with first coords
        asyncio.run(coordinator._async_fetch_vector_data())

        # Check cache filename constructed correctly
        assert any("vector_cache_172103_59_847_17_61482.json" in p for p in paths_queried)

        # Verify old cache cleanup was called (vector_cache_172103_different.json should be removed)
        # Verify vector_cache_172103_59_847_17_61482.json was NOT removed
        remove_calls = [c[0][0] for c in remove_mock.call_args_list]
        assert any("vector_cache_172103_different.json" in rc for rc in remove_calls)
        assert not any("vector_cache_172103_59_847_17_61482.json" in rc for rc in remove_calls)


def test_mlat_calculation_n4(mock_hass, mock_entry):
    coordinator = TempestStrikeCoordinator(mock_hass, mock_entry)

    # Target is (40.1, -74.9)
    target_lat, target_lon = 40.1, -74.9
    stations = [(40.0, -75.0), (40.15, -74.85), (40.15, -75.15), (39.9, -74.8)]
    R = 6371.0

    def compute_dist(s_lat, s_lon):
        cos_lat = math.cos(math.radians(s_lat))
        return R * math.sqrt(
            (math.radians(target_lon - s_lon) * cos_lat) ** 2
            + (math.radians(target_lat - s_lat)) ** 2
        )

    strike_events = [(lat, lon, compute_dist(lat, lon)) for lat, lon in stations]

    # Run MLAT calculation with N=4
    coordinator._calculate_trilateration(strike_events)

    # Verify event was fired with the correct coordinates
    mock_hass.bus.async_fire.assert_called_once()
    call_args = mock_hass.bus.async_fire.call_args[0]
    assert call_args[0] == f"{EVENT_STRIKE_CALCULATED}_{mock_entry.entry_id}"

    payload = mock_hass.bus.async_fire.call_args[0][1]
    assert pytest.approx(payload["latitude"], abs=1e-3) == target_lat
    assert pytest.approx(payload["longitude"], abs=1e-3) == target_lon


def test_strike_rate_sensor_tracking(mock_hass, mock_entry):
    from unittest.mock import patch

    from custom_components.weatherflow_lightning_trilateration.sensor import (
        WeatherFlowStrikeRateSensor,
    )

    coordinator = TempestStrikeCoordinator(mock_hass, mock_entry)
    sensor = WeatherFlowStrikeRateSensor(coordinator, mock_entry)

    # Initial state
    assert sensor.native_value == 0

    # Simulate strike event message
    timestamp = 1782640276
    message = {"type": "evt_strike", "device_id": 309874, "evt": [timestamp, 17.0, 3848]}

    with patch("time.time", return_value=timestamp):
        coordinator._process_incoming_message(message)

    assert sensor.native_value == 1
    assert coordinator.recent_strike_timestamps == [timestamp]

    # Simulate time passing (65 seconds later)
    message_new = {"type": "evt_strike", "device_id": 309874, "evt": [timestamp + 65, 12.0, 3849]}
    with patch("time.time", return_value=timestamp + 65):
        coordinator._process_incoming_message(message_new)

    # Stale strike should be pruned, new one added
    assert sensor.native_value == 1
    assert coordinator.recent_strike_timestamps == [timestamp + 65]


def test_options_flow_handler(mock_hass, mock_entry):
    import asyncio

    from custom_components.weatherflow_lightning_trilateration.config_flow import (
        TempestTrilaterationOptionsFlowHandler,
    )

    mock_entry.options = {
        "neighbor_stations": "215396,81149",
        "api_token": "mock_token",
        "distance_filter": 100.0,
    }

    handler = TempestTrilaterationOptionsFlowHandler(mock_entry)
    handler.hass = mock_hass

    # Call step_init with user input
    user_input = {
        "neighbor_stations": "111111,222222",
        "api_token": "new_token",
        "distance_filter": 50.0,
    }
    result = asyncio.run(handler.async_step_init(user_input=user_input))

    assert result["type"] == "create_entry"
    assert result["data"] == user_input
