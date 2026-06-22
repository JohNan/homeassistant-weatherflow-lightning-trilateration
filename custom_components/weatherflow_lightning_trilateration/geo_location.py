"""Geolocation platform for WeatherFlow Lightning Trilateration integration."""

import logging
import time

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_call_later

from .const import EVENT_STRIKE_CALCULATED

_LOGGER = logging.getLogger(__name__)

_ADD_ENTITIES_CALLBACKS = []


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up the geo_location platform for WeatherFlow Lightning Trilateration."""
    _ADD_ENTITIES_CALLBACKS.append(async_add_entities)

    remove_listener = hass.bus.async_listen(
        EVENT_STRIKE_CALCULATED, _handle_strike_event
    )
    entry.async_on_unload(remove_listener)

    entry.async_on_unload(lambda: _ADD_ENTITIES_CALLBACKS.remove(async_add_entities))


@callback
def _handle_strike_event(event) -> None:
    """Handle calculated strike events."""
    latitude = event.data.get("latitude")
    longitude = event.data.get("longitude")
    if latitude is not None and longitude is not None:
        entity = WeatherFlowLightningStrikeEntity(latitude, longitude)
        for async_add_entities in _ADD_ENTITIES_CALLBACKS:
            async_add_entities([entity])


class WeatherFlowLightningStrikeEntity(GeolocationEvent):
    """Representation of a lightning strike geolocation event."""

    _attr_name = "Lightning Strike"
    _attr_source = "weatherflow_lightning_trilateration"
    _attr_icon = "mdi:flash"

    def __init__(self, latitude: float, longitude: float) -> None:
        """Initialize the entity."""
        self._attr_latitude = latitude
        self._attr_longitude = longitude
        self._attr_unique_id = (
            f"weatherflow_strike_{latitude}_{longitude}_{time.time()}"
        )

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

    @property
    def unique_id(self) -> str:
        """Return unique ID."""
        return self._attr_unique_id

    async def async_added_to_hass(self) -> None:
        """Call when entity is added to hass."""
        if hasattr(super(), "async_added_to_hass"):
            await super().async_added_to_hass()

        @callback
        def _remove(now):
            self.hass.async_create_task(self.async_remove())

        async_call_later(self.hass, 21600, _remove)
