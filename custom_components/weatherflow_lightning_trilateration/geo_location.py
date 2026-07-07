"""Geolocation platform for WeatherFlow Lightning Trilateration integration."""

import logging
import time

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store

from . import event_key
from .const import CONF_NAME, STRIKE_MARKER_TTL_SEC

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY_PREFIX = "weatherflow_lightning_trilateration.strikes"
STORAGE_VERSION = 1


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities) -> None:
    """Set up the geo_location platform for WeatherFlow Lightning Trilateration."""
    instance_name = str(entry.data.get(CONF_NAME, entry.entry_id[:8])).strip()

    # Initialize strike storage
    storage = WeatherFlowStrikeStorage(hass, entry.entry_id)
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
        if age < STRIKE_MARKER_TTL_SEC:
            valid_strikes.append(strike)
            entity = WeatherFlowLightningStrikeEntity(
                strike["latitude"],
                strike["longitude"],
                strike["time"],
                STRIKE_MARKER_TTL_SEC - age,
                storage,
                instance_name,
                strike.get("stations", []),
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
        if latitude is None or longitude is None:
            return

        # Live strikes carry no timestamp (default to now); backfilled/replayed
        # strikes carry their original epoch so retention and expiry are correct.
        timestamp = event.data.get("timestamp")
        if timestamp is None:
            timestamp = time.time()

        remaining = STRIKE_MARKER_TTL_SEC - (time.time() - timestamp)
        if remaining <= 0:
            # Strike is already older than the retention window; nothing to show.
            return

        if storage.has_strike(latitude, longitude, timestamp):
            # Avoid duplicate markers when a replay overlaps existing strikes.
            return

        stations = event.data.get("stations", [])
        storage.add_strike(latitude, longitude, timestamp, stations)
        entity = WeatherFlowLightningStrikeEntity(
            latitude, longitude, timestamp, remaining, storage, instance_name, stations
        )
        # Add only to this entry's platform; a module-global callback list would
        # duplicate the marker across every config entry.
        async_add_entities([entity])

    remove_listener = hass.bus.async_listen(event_key(entry.entry_id), _handle_strike_event)
    entry.async_on_unload(remove_listener)


class WeatherFlowStrikeStorage:
    """Manages persistence of active lightning strikes."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        """Initialize the storage helper."""
        self.hass = hass
        self.store = Store(hass, STORAGE_VERSION, f"{STORAGE_KEY_PREFIX}_{entry_id}")
        self.strikes = []

    async def async_load(self) -> None:
        """Load strikes from store."""
        data = await self.store.async_load()
        self.strikes = data.get("strikes", []) if data else []

    async def async_save(self) -> None:
        """Save strikes to store."""
        await self.store.async_save({"strikes": self.strikes})

    def has_strike(self, latitude: float, longitude: float, timestamp: float) -> bool:
        """Return True if a matching strike is already stored (replay dedup)."""
        return any(
            int(s["time"]) == int(timestamp)
            and abs(s["latitude"] - latitude) < 1e-4
            and abs(s["longitude"] - longitude) < 1e-4
            for s in self.strikes
        )

    def add_strike(
        self, latitude: float, longitude: float, timestamp: float, stations: list = None
    ) -> None:
        """Add a strike and schedule save."""
        self.strikes.append(
            {
                "latitude": latitude,
                "longitude": longitude,
                "time": timestamp,
                "stations": stations or [],
            }
        )
        self._schedule_save()

    def remove_strike(self, timestamp: float) -> None:
        """Remove a strike and schedule save."""
        self.strikes = [s for s in self.strikes if s["time"] != timestamp]
        self._schedule_save()

    def _schedule_save(self) -> None:
        """Schedule a coalesced serialization of active strikes."""
        current_time = time.time()
        self.strikes = [s for s in self.strikes if current_time - s["time"] < STRIKE_MARKER_TTL_SEC]
        # Coalesce bursts of adds/removes (e.g. during a storm) into one write.
        self.store.async_delay_save(lambda: {"strikes": self.strikes}, 5)


class WeatherFlowLightningStrikeEntity(GeolocationEvent):
    """Representation of a lightning strike geolocation event."""

    _attr_source = "weatherflow_lightning_trilateration"
    _attr_icon = "mdi:flash"

    def __init__(
        self,
        latitude: float,
        longitude: float,
        timestamp: float,
        remaining_time: float,
        storage: WeatherFlowStrikeStorage,
        instance_name: str,
        stations: list = None,
    ) -> None:
        """Initialize the entity."""
        self._attr_name = f"{instance_name} Lightning Strike"
        self._attr_latitude = latitude
        self._attr_longitude = longitude
        self.timestamp = timestamp
        self.remaining_time = remaining_time
        self.storage = storage
        self.stations = stations or []
        self._expiry_unsub = None

    @property
    def extra_state_attributes(self) -> dict:
        """Return entity specific state attributes."""
        return {
            "stations": self.stations,
        }

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
            self._expiry_unsub = None
            self.storage.remove_strike(self.timestamp)
            self.hass.async_create_task(self.async_remove())

        self._expiry_unsub = async_call_later(self.hass, self.remaining_time, _remove)
        self.async_on_remove(self._cancel_expiry)

    @callback
    def _cancel_expiry(self) -> None:
        """Cancel the pending expiry timer if the entity is removed early."""
        if self._expiry_unsub is not None:
            self._expiry_unsub()
            self._expiry_unsub = None
