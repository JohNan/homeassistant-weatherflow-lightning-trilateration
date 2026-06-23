"""Sensor platform for WeatherFlow Lightning Trilateration."""

import logging

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the sensor platform."""
    _LOGGER.debug("Setting up WeatherFlow Lightning Trilateration sensor platform for entry: %s", entry.entry_id)
    coordinator = hass.data[DOMAIN][entry.entry_id]
    sensor = WeatherFlowTrilaterationSensor(coordinator, entry)
    async_add_entities([sensor])
    _LOGGER.debug("Dispatched WeatherFlowTrilaterationSensor registration")


class WeatherFlowTrilaterationSensor(SensorEntity):
    """Representation of a WeatherFlow Lightning Trilateration Sensor."""

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._coordinator = coordinator
        self._entry = entry
        self._attr_name = "WeatherFlow Lightning Trilateration Stations"
        self._attr_unique_id = f"{entry.entry_id}_stations"
        self._attr_icon = "mdi:lightning-bolt"
        _LOGGER.debug("Initialized WeatherFlowTrilaterationSensor: name=%s, unique_id=%s", self._attr_name, self._attr_unique_id)

    @property
    def state(self) -> int:
        """Return the state of the sensor (count of configured/discovered stations)."""
        count = len(self._coordinator.all_stations)
        _LOGGER.debug("WeatherFlowTrilaterationSensor state queried: %d stations", count)
        return count

    @property
    def extra_state_attributes(self) -> dict:
        """Return entity specific state attributes."""
        stations_data = []
        for station_id in self._coordinator.all_stations:
            coords = self._coordinator.station_coords.get(station_id)
            if not coords:
                coords = self._coordinator._get_station_coords(station_id)

            if coords:
                lat, lon = coords
                # Determine type
                station_type = "discovered"
                if station_id == self._coordinator.primary_station:
                    station_type = "primary"
                elif station_id in self._coordinator.neighbor_stations:
                    station_type = "neighbor"

                stations_data.append(
                    {
                        "id": station_id,
                        "latitude": lat,
                        "longitude": lon,
                        "type": station_type,
                    }
                )

        attrs = {
            "stations": stations_data,
            "elevation_grid": self._coordinator.elevation_grid,
            "wind_speed": self._coordinator.wind_speed,
            "wind_direction": self._coordinator.wind_direction,
            "solar_radiation": self._coordinator.solar_radiation,
            "rain_rate": self._coordinator.rain_rate,
        }
        _LOGGER.debug("WeatherFlowTrilaterationSensor attributes queried: %s", attrs)
        return attrs

    async def async_added_to_hass(self) -> None:
        """Call when entity is added to hass."""
        _LOGGER.debug("WeatherFlowTrilaterationSensor successfully added to HASS: unique_id=%s", self.unique_id)
        self._coordinator.async_add_listener(self.async_write_ha_state)

    async def async_will_remove_from_hass(self) -> None:
        """Call when entity will be removed from HASS."""
        self._coordinator.async_remove_listener(self.async_write_ha_state)

    async def async_update(self) -> None:
        """Update the sensor."""
        # The coordinator updates its internal lists, this method triggers a state refresh
        pass
