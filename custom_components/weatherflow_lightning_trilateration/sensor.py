"""Sensor platform for WeatherFlow Lightning Trilateration."""

import logging

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the sensor platform."""
    _LOGGER.debug(
        "Setting up WeatherFlow Lightning Trilateration sensor platform for entry: %s",
        entry.entry_id,
    )
    coordinator = hass.data[DOMAIN][entry.entry_id]

    entities = [
        WeatherFlowTrilaterationSensor(coordinator, entry),
        WeatherFlowStrikeRateSensor(coordinator, entry),
    ]

    # Register a separate sensor for each configured station to monitor individual strike counts
    for station_id in coordinator.all_stations:
        if "," not in station_id and station_id.strip().isdigit():
            entities.append(WeatherFlowStationStrikesSensor(coordinator, entry, station_id))

    async_add_entities(entities)
    _LOGGER.debug("Dispatched WeatherFlowTrilateration sensors registration")


class WeatherFlowTrilaterationSensor(SensorEntity):
    """Representation of a WeatherFlow Lightning Trilateration Sensor."""

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._coordinator = coordinator
        self._entry = entry
        self._attr_name = f"{coordinator.instance_name} Lightning Trilateration Stations"
        self._attr_unique_id = f"{entry.entry_id}_stations"
        self._attr_icon = "mdi:lightning-bolt"
        _LOGGER.debug(
            "Initialized WeatherFlowTrilaterationSensor: name=%s, unique_id=%s",
            self._attr_name,
            self._attr_unique_id,
        )

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
        _LOGGER.debug(
            "WeatherFlowTrilaterationSensor successfully added to HASS: unique_id=%s",
            self.unique_id,
        )
        self._coordinator.async_add_listener(self.async_write_ha_state)

    async def async_will_remove_from_hass(self) -> None:
        """Call when entity will be removed from HASS."""
        self._coordinator.async_remove_listener(self.async_write_ha_state)

    async def async_update(self) -> None:
        """Update the sensor."""
        # The coordinator updates its internal lists, this method triggers a state refresh
        pass


class WeatherFlowStationStrikesSensor(SensorEntity):
    """Representation of a WeatherFlow Station Lightning Strike Sensor."""

    def __init__(self, coordinator, entry: ConfigEntry, station_id: str) -> None:
        """Initialize the sensor."""
        self._coordinator = coordinator
        self._entry = entry
        self._station_id = station_id

        # Retrieve mapped name if available
        name = coordinator.station_names.get(station_id, f"Station {station_id}")
        self._attr_name = f"{coordinator.instance_name} {name} Lightning Strikes"
        self._attr_unique_id = f"{entry.entry_id}_station_{station_id}_strikes"
        self._attr_icon = "mdi:lightning-bolt"
        _LOGGER.debug(
            "Initialized WeatherFlowStationStrikesSensor: name=%s, unique_id=%s",
            self._attr_name,
            self._attr_unique_id,
        )

    @property
    def state(self) -> int:
        """Return the state of the sensor (count of strikes detected by the station)."""
        count = self._coordinator.station_strikes.get(self._station_id, 0)
        return count

    @property
    def extra_state_attributes(self) -> dict:
        """Return entity specific state attributes."""
        last_strike = self._coordinator.station_last_strike.get(self._station_id, {})
        attrs = {
            "station_id": self._station_id,
            "last_strike_timestamp": last_strike.get("timestamp"),
            "last_strike_distance": last_strike.get("distance"),
        }
        return attrs

    async def async_added_to_hass(self) -> None:
        """Call when entity is added to hass."""
        self._coordinator.async_add_listener(self.async_write_ha_state)

    async def async_will_remove_from_hass(self) -> None:
        """Call when entity will be removed from HASS."""
        self._coordinator.async_remove_listener(self.async_write_ha_state)


class WeatherFlowStrikeRateSensor(SensorEntity):
    """Representation of a WeatherFlow Strike Rate Sensor (Strikes per Minute)."""

    def __init__(self, coordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._coordinator = coordinator
        self._entry = entry
        self._attr_name = f"{coordinator.instance_name} Strike Rate"
        self._attr_unique_id = f"{entry.entry_id}_strike_rate"
        self._attr_icon = "mdi:flash"
        self._attr_native_unit_of_measurement = "strikes/min"

        _LOGGER.debug(
            "Initialized WeatherFlowStrikeRateSensor: name=%s, unique_id=%s",
            self._attr_name,
            self._attr_unique_id,
        )

    @property
    def native_value(self) -> int:
        """Return the native value of the sensor (count of recent strikes)."""
        return len(self._coordinator.recent_strike_timestamps)

    async def async_added_to_hass(self) -> None:
        """Call when entity is added to hass."""
        self._coordinator.async_add_listener(self.async_write_ha_state)

    async def async_will_remove_from_hass(self) -> None:
        """Call when entity will be removed from HASS."""
        self._coordinator.async_remove_listener(self.async_write_ha_state)

    async def async_update(self) -> None:
        """Update the sensor."""
        # The coordinator updates its internal lists, this method triggers a state refresh
        pass

