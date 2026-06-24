"""Geolocation platform for WeatherFlow Lightning Trilateration integration."""

import logging
import time

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store

from .const import EVENT_STRIKE_CALCULATED

_LOGGER = logging.getLogger(__name__)

_ADD_ENTITIES_CALLBACKS = []
STORAGE_KEY = "weatherflow_lightning_trilateration.strikes"
STORAGE_VERSION = 1


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up the geo_location platform for WeatherFlow Lightning Trilateration."""
    _ADD_ENTITIES_CALLBACKS.append(async_add_entities)

    # Initialize strike storage
    storage = WeatherFlowStrikeStorage(hass)
    await storage.async_load()
    hass.data.setdefault("weatherflow_lightning_trilateration_storage", {})[
        entry.entry_id
    ] = storage

    # Restore active strikes
    current_time = time.time()
    restored_strikes = []
    valid_strikes = []

    for strike in storage.strikes:
        age = current_time - strike["time"]
        if age < 21600:
            valid_strikes.append(strike)
            entity = WeatherFlowLightningStrikeEntity(
                strike["latitude"],
                strike["longitude"],
                strike["time"],
                21600 - age,
                storage,
            )
            restored_strikes.append(entity)

    storage.strikes = valid_strikes
    await storage.async_save()

    if restored_strikes:
        async_add_entities(restored_strikes)

    @callback
    def _handle_strike_event(event) -> None:
        """Handle calculated strike events."""
        latitude = event.data.get("latitude")
        longitude = event.data.get("longitude")
        if latitude is not None and longitude is not None:
            timestamp = time.time()
            storage.add_strike(latitude, longitude, timestamp)
            entity = WeatherFlowLightningStrikeEntity(
                latitude, longitude, timestamp, 21600, storage
            )
            for add_callback in _ADD_ENTITIES_CALLBACKS:
                add_callback([entity])

    remove_listener = hass.bus.async_listen(
        EVENT_STRIKE_CALCULATED, _handle_strike_event
    )
    entry.async_on_unload(remove_listener)

    entry.async_on_unload(lambda: _ADD_ENTITIES_CALLBACKS.remove(async_add_entities))


class WeatherFlowStrikeStorage:
    """Manages persistence of active lightning strikes."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage helper."""
        self.hass = hass
        self.store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.strikes = []

    async def async_load(self) -> None:
        """Load strikes from store."""
        data = await self.store.async_load()
        self.strikes = data.get("strikes", []) if data else []

    async def async_save(self) -> None:
        """Save strikes to store."""
        await self.store.async_save({"strikes": self.strikes})

    def add_strike(self, latitude: float, longitude: float, timestamp: float) -> None:
        """Add a strike and schedule save."""
        self.strikes.append(
            {"latitude": latitude, "longitude": longitude, "time": timestamp}
        )
        self._schedule_save()

    def remove_strike(self, timestamp: float) -> None:
        """Remove a strike and schedule save."""
        self.strikes = [s for s in self.strikes if s["time"] != timestamp]
        self._schedule_save()

    def _schedule_save(self) -> None:
        """Schedule serialization of active strikes."""
        current_time = time.time()
        self.strikes = [s for s in self.strikes if current_time - s["time"] < 21600]
        self.hass.async_create_task(self.async_save())


class WeatherFlowLightningStrikeEntity(GeolocationEvent):
    """Representation of a lightning strike geolocation event."""

    _attr_name = "Lightning Strike"
    _attr_source = "weatherflow_lightning_trilateration"
    _attr_icon = "mdi:flash"

    def __init__(
        self,
        latitude: float,
        longitude: float,
        timestamp: float,
        remaining_time: float,
        storage: WeatherFlowStrikeStorage,
    ) -> None:
        """Initialize the entity."""
        self._attr_latitude = latitude
        self._attr_longitude = longitude
        self.timestamp = timestamp
        self.remaining_time = remaining_time
        self.storage = storage

    @property
    def latitude(self) -> float:
        """Return the latitude."""
        return self._attr_latitude

    @property
    def longitude(self) -> float:
        """Return the longitude."""
        return self._attr_longitude

    @property
    def source(self) -> str:
        """Return the source."""
        return self._attr_source

    @property
    def icon(self) -> str:
        """Return the icon."""
        return self._attr_icon

    @property
    def name(self) -> str:
        """Return the name."""
        return self._attr_name

    async def async_added_to_hass(self) -> None:
        """Call when entity is added to hass."""
        if hasattr(super(), "async_added_to_hass"):
            await super().async_added_to_hass()

        @callback
        def _remove(now):
            self.storage.remove_strike(self.timestamp)
            self.hass.async_create_task(self.async_remove())

        async_call_later(self.hass, self.remaining_time, _remove)
