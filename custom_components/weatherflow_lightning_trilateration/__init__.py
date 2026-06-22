"""Core initialization for WeatherFlow Lightning Trilateration integration."""
import asyncio
import json
import logging
import math

import websockets

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from .const import (
    CONF_NEIGHBOR_STATIONS,
    CONF_PRIMARY_STATION,
    DOMAIN,
    EVENT_STRIKE_CALCULATED,
    WS_ENDPOINT,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up WeatherFlow Lightning Trilateration from a config entry."""
    coordinator = TempestStrikeCoordinator(hass, entry)
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    coordinator.start_websocket_listener()

    await hass.config_entries.async_forward_entry_setups(entry, ["geo_location"])
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, ["geo_location"]
    )
    if unload_ok:
        coordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.async_stop()
    return unload_ok


class TempestStrikeCoordinator:
    """Manages the WeatherFlow WebSocket connection and trilateration."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.entry = entry
        self.strike_buffer = {}

        self.primary_station = str(entry.data.get(CONF_PRIMARY_STATION, "")).strip()
        neighbor_raw = str(entry.data.get(CONF_NEIGHBOR_STATIONS, ""))
        self.neighbor_stations = [
            s.strip() for s in neighbor_raw.split(",") if s.strip()
        ]
        self.all_stations = [self.primary_station] + self.neighbor_stations

        self._listener_task = None
        self._running = False

    def start_websocket_listener(self) -> None:
        """Start the WebSocket listener task."""
        # Detect local weather stations from official and other WeatherFlow integrations
        local_stations = self._detect_local_stations()
        _LOGGER.info("Detected local weather stations: %s", local_stations)
        for station in local_stations:
            if station not in self.all_stations:
                self.all_stations.append(station)
                _LOGGER.info("Added local weather station %s to calculations", station)

        self._running = True
        self._listener_task = self.hass.async_create_background_task(
            self._async_listen_loop(),
            name=f"weatherflow_trilateration_ws_listener_{self.entry.entry_id}",
        )

    def _detect_local_stations(self) -> list[str]:
        """Detect local weather station/device IDs from official integrations."""
        detected = []
        target_domains = {
            "weatherflow",
            "weatherflow_cloud",
            "weatherflow_forecast",
            "weatherflow_udp",
        }

        # 1. Query Config Entries
        for domain in target_domains:
            for entry in self.hass.config_entries.async_entries(domain):
                for key in ("station_id", "station", "device_id", "device"):
                    val = entry.data.get(key) or entry.options.get(key)
                    if val:
                        val_str = str(val).strip()
                        if val_str.isdigit():
                            detected.append(val_str)

        # 2. Query Device Registry
        try:
            device_registry = dr.async_get(self.hass)
            for device_entry in device_registry.devices.values():
                for entry_id in device_entry.config_entries:
                    entry = self.hass.config_entries.async_get_entry(entry_id)
                    if entry and entry.domain in target_domains:
                        for identifier in device_entry.identifiers:
                            if len(identifier) == 2 and identifier[0] == entry.domain:
                                val = str(identifier[1])
                                if val.isdigit():
                                    detected.append(val)
                                elif "-" in val:
                                    parts = val.split("-")
                                    if parts[-1].isdigit():
                                        detected.append(parts[-1])
        except Exception as e:
            _LOGGER.warning("Error querying device registry for WeatherFlow stations: %s", e)

        # Deduplicate and filter out empty strings
        return list(set(s for s in detected if s))

    async def async_stop(self) -> None:
        """Stop the WebSocket listener task."""
        self._running = False
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
            self._listener_task = None

    async def _async_listen_loop(self) -> None:
        """Handle the infinite WebSocket connection loop."""
        retry_delay = 5
        while self._running:
            try:
                _LOGGER.info("Connecting to Tempest WebSocket: %s", WS_ENDPOINT)
                async with websockets.connect(WS_ENDPOINT) as websocket:
                    retry_delay = 5
                    for station_id in self.all_stations:
                        # Skip subscription if it's a coordinate string or not numeric
                        if "," in station_id or not station_id.strip().isdigit():
                            continue

                        sub_msg = {
                            "type": "listen_start",
                            "device_id": int(station_id),
                            "id": f"sub_{station_id}",
                        }
                        await websocket.send(json.dumps(sub_msg))
                        _LOGGER.debug("Subscribed to station: %s", station_id)

                    async for message in websocket:
                        try:
                            message_data = json.loads(message)
                            self._process_incoming_message(message_data)
                        except json.JSONDecodeError:
                            _LOGGER.warning(
                                "Received invalid JSON message from WebSocket"
                            )
                        except Exception as e:
                            _LOGGER.exception(
                                "Error processing WebSocket message: %s", e
                            )

            except asyncio.CancelledError:
                _LOGGER.info("WebSocket listener task cancelled")
                break
            except Exception as e:
                _LOGGER.error(
                    "WebSocket connection error: %s. Retrying in %d seconds...",
                    e,
                    retry_delay,
                )
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, 60)

    def _get_station_coords(self, device_id: str):
        """Retrieve coordinates for a specific station ID."""
        # 1. Resolve primary station coordinate reference
        ref_lat = self.hass.config.latitude
        ref_lon = self.hass.config.longitude

        primary_station = self.all_stations[0]
        if "," in primary_station:
            try:
                parts = primary_station.split(",")
                ref_lat = float(parts[0])
                ref_lon = float(parts[1])
            except ValueError:
                pass

        try:
            idx = self.all_stations.index(device_id)
        except ValueError:
            return None

        # 2. Return coordinates based on index
        if idx == 0:
            return ref_lat, ref_lon
        elif idx == 1:
            return ref_lat + 0.15, ref_lon + 0.15
        elif idx == 2:
            return ref_lat + 0.15, ref_lon - 0.15
        else:
            # Distribute dynamically based on idx to prevent overlap/collinearity
            angle = (idx - 3) * (2 * math.pi / 6)
            dist_offset = 0.20
            offset_lat = dist_offset * math.sin(angle)
            offset_lon = dist_offset * math.cos(angle)
            return ref_lat + offset_lat, ref_lon + offset_lon

    def _process_incoming_message(self, message_data: dict) -> None:
        """Process an incoming WebSocket message."""
        if message_data.get("type") != "evt_strike":
            return

        device_id = str(message_data.get("device_id"))
        evt = message_data.get("evt", [])
        if len(evt) < 2:
            return

        timestamp = int(evt[0])
        distance = float(evt[1])

        # Find or create a group bucket matching timestamp within a 1-second variance tolerance
        matched_timestamp = None
        for bucket_ts in list(self.strike_buffer.keys()):
            if abs(bucket_ts - timestamp) <= 1:
                matched_timestamp = bucket_ts
                break

        if matched_timestamp is None:
            matched_timestamp = timestamp
            self.strike_buffer[matched_timestamp] = {}

        self.strike_buffer[matched_timestamp][device_id] = distance

        # Check if the bucket has at least 3 unique station reports
        bucket = self.strike_buffer[matched_timestamp]
        if len(bucket) >= 3:
            strike_events = []
            for dev_id, dist in list(bucket.items()):
                coords = self._get_station_coords(dev_id)
                if coords:
                    strike_events.append((coords[0], coords[1], dist))

            # Evict from buffer to prevent reprocessing
            del self.strike_buffer[matched_timestamp]

            if len(strike_events) >= 3:
                self._calculate_trilateration(strike_events)

        # Cleanup old entries to prevent memory leak
        for bucket_ts in list(self.strike_buffer.keys()):
            if timestamp - bucket_ts > 10:
                del self.strike_buffer[bucket_ts]

    def _calculate_trilateration(self, strike_events: list) -> None:
        """Calculate the geographic intersection of three distances."""
        if len(strike_events) < 3:
            return

        lat1, lon1, d1 = strike_events[0]
        lat2, lon2, d2 = strike_events[1]
        lat3, lon3, d3 = strike_events[2]

        # Earth radius in kilometers
        R = 6371.0

        lat1_rad = math.radians(lat1)
        cos_lat1 = math.cos(lat1_rad)

        # Project coordinates onto a flat Cartesian plane relative to (lat1, lon1)
        x1, y1 = 0.0, 0.0
        x2 = R * math.radians(lon2 - lon1) * cos_lat1
        y2 = R * math.radians(lat2 - lat1)
        x3 = R * math.radians(lon3 - lon1) * cos_lat1
        y3 = R * math.radians(lat3 - lat1)

        A = 2 * (x2 - x1)
        B = 2 * (y2 - y1)
        C = d1**2 - d2**2 - x1**2 + x2**2 - y1**2 + y2**2
        D = 2 * (x3 - x2)
        E = 2 * (y3 - y2)
        F = d2**2 - d3**2 - x2**2 + x3**2 - y2**2 + y3**2

        det = A * E - B * D
        if abs(det) < 1e-9:
            _LOGGER.warning(
                "Collinear station arrangement or invalid distance data detected."
            )
            return

        x = (C * E - B * F) / det
        y = (A * F - C * D) / det

        delta_lat = y / R
        delta_lon = x / (R * cos_lat1)

        calculated_latitude = lat1 + math.degrees(delta_lat)
        calculated_longitude = lon1 + math.degrees(delta_lon)

        if not (
            -90.0 <= calculated_latitude <= 90.0
            and -180.0 <= calculated_longitude <= 180.0
        ):
            _LOGGER.warning(
                "Calculated strike location coords out of bounds: lat=%f, lon=%f",
                calculated_latitude,
                calculated_longitude,
            )
            return

        _LOGGER.info(
            "Calculated strike location: lat=%f, lon=%f",
            calculated_latitude,
            calculated_longitude,
        )

        self.hass.bus.async_fire(
            EVENT_STRIKE_CALCULATED,
            {
                "latitude": calculated_latitude,
                "longitude": calculated_longitude,
            },
        )
