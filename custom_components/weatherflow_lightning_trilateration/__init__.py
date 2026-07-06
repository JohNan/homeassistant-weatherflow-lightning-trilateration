"""Core initialization for WeatherFlow Lightning Trilateration integration."""

import asyncio
import json
import logging
import math
import os
import random
import ssl
import time

import voluptuous as vol
import websockets
from homeassistant.components.http import HomeAssistantView, StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from websockets.connection import State as WsState

from .const import (
    CONF_API_TOKEN,
    CONF_DISTANCE_FILTER,
    CONF_NAME,
    CONF_NEIGHBOR_STATIONS,
    CONF_PRIMARY_STATION,
    DOMAIN,
    EVENT_STRIKE_CALCULATED,
    MAX_TRILATERATION_RESIDUAL_KM,
    RAW_STRIKE_RETENTION_SEC,
    STORAGE_KEY_RAW_STRIKES,
    STORAGE_VERSION,
    WS_ENDPOINT,
)

_LOGGER = logging.getLogger(__name__)


def event_key(entry_id: str) -> str:
    """Return the scoped event key for a specific entry."""
    return f"{EVENT_STRIKE_CALCULATED}_{entry_id}"


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up WeatherFlow Lightning Trilateration from a config entry."""
    _LOGGER.debug("Setting up WeatherFlow Lightning Trilateration config entry: %s", entry.entry_id)
    coordinator = TempestStrikeCoordinator(hass, entry)
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    coordinator.start_websocket_listener()

    # Register service for strike simulation
    async def async_simulate_strike(service_call) -> None:
        """Simulate a lightning strike by firing EVENT_STRIKE_CALCULATED."""
        latitude = service_call.data.get("latitude")
        longitude = service_call.data.get("longitude")
        entry_id = service_call.data.get("entry_id")

        if latitude is None:
            latitude = hass.config.latitude + random.uniform(-0.15, 0.15)
        if longitude is None:
            longitude = hass.config.longitude + random.uniform(-0.15, 0.15)

        data = {
            "latitude": float(latitude),
            "longitude": float(longitude),
        }

        if entry_id:
            hass.bus.async_fire(event_key(entry_id), data)
        else:
            for eid in hass.data[DOMAIN]:
                if eid == "_infra_registered" or eid == "_shared_ws":
                    continue
                hass.bus.async_fire(event_key(eid), data)

    # Register service for weather telemetry simulation
    async def async_simulate_weather(service_call) -> None:
        """Simulate weather conditions on the stations sensor."""
        wind_speed = service_call.data.get("wind_speed")
        wind_direction = service_call.data.get("wind_direction")
        solar_radiation = service_call.data.get("solar_radiation")
        rain_rate = service_call.data.get("rain_rate")
        entry_id = service_call.data.get("entry_id")

        coordinators = []
        if entry_id:
            coord = hass.data[DOMAIN].get(entry_id)
            if coord:
                coordinators.append(coord)
        else:
            for key, val in hass.data[DOMAIN].items():
                if key not in ("_infra_registered", "_shared_ws") and isinstance(
                    val, TempestStrikeCoordinator
                ):
                    coordinators.append(val)

        for coordinator in coordinators:
            if wind_speed is not None:
                coordinator.wind_speed = float(wind_speed)
            if wind_direction is not None:
                coordinator.wind_direction = float(wind_direction)
            if solar_radiation is not None:
                coordinator.solar_radiation = float(solar_radiation)
            if rain_rate is not None:
                coordinator.rain_rate = float(rain_rate)
            coordinator.async_update_listeners()

    # Register service for storm path simulation
    async def async_simulate_storm(service_call) -> None:
        """Simulate a moving storm path over time."""
        strike_count = int(service_call.data.get("strike_count", 5))
        speed_kmh = float(service_call.data.get("speed_kmh", 30.0))
        direction_deg = float(service_call.data.get("direction_deg", 45.0))
        interval_sec = int(service_call.data.get("interval_sec", 5))
        entry_id = service_call.data.get("entry_id")

        async def run_storm():
            ref_lat = hass.config.latitude
            ref_lon = hass.config.longitude
            R = 6371.0

            dir_rad = math.radians(direction_deg)
            speed_kms = speed_kmh / 3600.0

            start_offset_km = -5.0
            start_x = start_offset_km * math.sin(dir_rad)
            start_y = start_offset_km * math.cos(dir_rad)

            for i in range(strike_count):
                dt_sec = i * interval_sec
                current_x = start_x + (speed_kms * dt_sec * math.sin(dir_rad))
                current_y = start_y + (speed_kms * dt_sec * math.cos(dir_rad))

                cos_lat = math.cos(math.radians(ref_lat))
                lat = ref_lat + (current_y / R) * (180.0 / math.pi)
                lon = (
                    ref_lon + (current_x / (R * cos_lat)) * (180.0 / math.pi)
                    if cos_lat > 0
                    else ref_lon
                )

                lat += random.uniform(-0.01, 0.01)
                lon += random.uniform(-0.01, 0.01)

                data = {
                    "latitude": float(lat),
                    "longitude": float(lon),
                }

                if entry_id:
                    hass.bus.async_fire(event_key(entry_id), data)
                else:
                    for eid in hass.data[DOMAIN]:
                        if eid == "_infra_registered" or eid == "_shared_ws":
                            continue
                        hass.bus.async_fire(event_key(eid), data)

                _LOGGER.info(
                    "Simulated storm strike %d/%d at coords: %f, %f", i + 1, strike_count, lat, lon
                )

                if i < strike_count - 1:
                    await asyncio.sleep(interval_sec)

        hass.async_create_background_task(
            run_storm(), "weatherflow_lightning_trilateration_storm_simulation"
        )

    # Register service to backfill/replay strikes through trilateration
    async def async_replay_strikes(service_call) -> None:
        """Re-run trilateration over stored or supplied raw strike observations."""
        entry_id = service_call.data.get("entry_id")
        events = service_call.data.get("events")
        tolerance = int(service_call.data.get("variance_tolerance", 3))

        coordinators = []
        if entry_id:
            coord = hass.data[DOMAIN].get(entry_id)
            if isinstance(coord, TempestStrikeCoordinator):
                coordinators.append(coord)
        else:
            for key, val in hass.data[DOMAIN].items():
                if key not in ("_infra_registered", "_shared_ws") and isinstance(
                    val, TempestStrikeCoordinator
                ):
                    coordinators.append(val)

        for coordinator in coordinators:
            source = events if events is not None else coordinator.raw_strikes
            summary = coordinator.replay_strikes(source, tolerance)
            _LOGGER.info("Replayed strikes for %s: %s", coordinator.instance_name, summary)

    if not hass.services.has_service(DOMAIN, "simulate_strike"):
        hass.services.async_register(
            DOMAIN,
            "simulate_strike",
            async_simulate_strike,
            schema=vol.Schema(
                {
                    vol.Optional("latitude"): cv.latitude,
                    vol.Optional("longitude"): cv.longitude,
                    vol.Optional("entry_id"): str,
                }
            ),
        )

    if not hass.services.has_service(DOMAIN, "simulate_weather"):
        hass.services.async_register(
            DOMAIN,
            "simulate_weather",
            async_simulate_weather,
            schema=vol.Schema(
                {
                    vol.Optional("wind_speed"): vol.Coerce(float),
                    vol.Optional("wind_direction"): vol.Coerce(float),
                    vol.Optional("solar_radiation"): vol.Coerce(float),
                    vol.Optional("rain_rate"): vol.Coerce(float),
                    vol.Optional("entry_id"): str,
                }
            ),
        )

    if not hass.services.has_service(DOMAIN, "simulate_storm"):
        hass.services.async_register(
            DOMAIN,
            "simulate_storm",
            async_simulate_storm,
            schema=vol.Schema(
                {
                    vol.Optional("strike_count"): vol.Coerce(int),
                    vol.Optional("speed_kmh"): vol.Coerce(float),
                    vol.Optional("direction_deg"): vol.Coerce(float),
                    vol.Optional("interval_sec"): vol.Coerce(int),
                    vol.Optional("entry_id"): str,
                }
            ),
        )

    if not hass.services.has_service(DOMAIN, "replay_strikes"):
        hass.services.async_register(
            DOMAIN,
            "replay_strikes",
            async_replay_strikes,
            schema=vol.Schema(
                {
                    vol.Optional("events"): [
                        vol.Schema(
                            {
                                vol.Required("timestamp"): vol.Coerce(int),
                                vol.Required("distance"): vol.Coerce(float),
                                vol.Optional("station_id"): str,
                                vol.Optional("device_id"): vol.Coerce(str),
                            }
                        )
                    ],
                    vol.Optional("variance_tolerance"): vol.Coerce(int),
                    vol.Optional("entry_id"): str,
                }
            ),
        )

    _infra_registered = hass.data[DOMAIN].get("_infra_registered", False)
    if not _infra_registered:
        # Register static path for the custom Lovelace card
        dist_dir = os.path.join(os.path.dirname(__file__), "dist")
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    "/weatherflow_lightning_trilateration",
                    dist_dir,
                    cache_headers=False,
                )
            ]
        )

        # Register Lovelace resource automatically
        async def _register_resource(event=None) -> None:
            try:
                await _async_register_lovelace_resource(hass)
            except Exception as e:
                _LOGGER.warning("Could not automatically register Lovelace resource: %s", e)

        if hass.is_running:
            await _register_resource()
        else:
            hass.bus.async_listen_once("homeassistant_started", _register_resource)

        # Register vector data HTTP view
        hass.http.register_view(WeatherFlowVectorDataView(hass))

        hass.data[DOMAIN]["_infra_registered"] = True

    _LOGGER.debug("Forwarding config entry setups to platforms: ['geo_location', 'sensor']")
    await hass.config_entries.async_forward_entry_setups(entry, ["geo_location", "sensor"])

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload config entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, ["geo_location", "sensor"])
    if unload_ok:
        coordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.async_stop()

        # Unregister service if there are no more active entries for DOMAIN
        active_coordinators = [
            v for k, v in hass.data[DOMAIN].items() if k not in ("_infra_registered", "_shared_ws")
        ]
        if not active_coordinators:
            hass.data[DOMAIN]["_infra_registered"] = False
            if hass.services.has_service(DOMAIN, "simulate_strike"):
                hass.services.async_remove(DOMAIN, "simulate_strike")
    return unload_ok


class SharedWebSocketSession:
    """Manages a shared WebSocket connection for an API token."""

    def __init__(self, hass: HomeAssistant, api_token: str) -> None:
        """Initialize the shared websocket session."""
        self.hass = hass
        self.api_token = api_token
        self.coordinators: list[TempestStrikeCoordinator] = []
        self._listener_task = None
        self._running = False
        self._websocket = None

    def register(self, coordinator: "TempestStrikeCoordinator") -> None:
        """Register a coordinator with the shared session."""
        if coordinator not in self.coordinators:
            self.coordinators.append(coordinator)

        if self._websocket and self._websocket.state == WsState.OPEN:
            self.hass.async_create_task(self._send_listen_start_for_coordinator(coordinator))

        if not self._running:
            self._running = True
            self._listener_task = self.hass.async_create_background_task(
                self._async_listen_loop(),
                name=f"weatherflow_trilateration_shared_ws_{self.api_token[:4] if self.api_token else 'default'}",
            )

    async def deregister(self, coordinator: "TempestStrikeCoordinator") -> None:
        """Deregister a coordinator from the shared session."""
        if coordinator in self.coordinators:
            self.coordinators.remove(coordinator)
            if self._websocket and self._websocket.state == WsState.OPEN:
                await self._send_listen_stop_for_coordinator(coordinator)

        if not self.coordinators:
            await self.async_stop()

    async def async_stop(self) -> None:
        """Stop the shared websocket session."""
        self._running = False
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
            self._listener_task = None

        _shared_ws = self.hass.data[DOMAIN].get("_shared_ws", {})
        if self.api_token in _shared_ws:
            del _shared_ws[self.api_token]

    async def _send_listen_start_for_coordinator(
        self, coordinator: "TempestStrikeCoordinator"
    ) -> None:
        """Send listen_start commands for all devices of a coordinator."""
        if not self._websocket or self._websocket.state != WsState.OPEN:
            return

        for device_id in coordinator.device_ids:
            if not device_id.strip().isdigit():
                continue
            sub_msg = {
                "type": "listen_start",
                "device_id": int(device_id),
                "id": f"sub_{device_id}",
            }
            rapid_sub_msg = {
                "type": "listen_rapid_start",
                "device_id": int(device_id),
                "id": f"sub_rapid_{device_id}",
            }
            try:
                await self._websocket.send(json.dumps(sub_msg))
                _LOGGER.info("Subscribed to device: %s via shared WS", device_id)
            except Exception as e:
                _LOGGER.error("Failed to send listen_start for %s: %s", device_id, e)
            try:
                await self._websocket.send(json.dumps(rapid_sub_msg))
                _LOGGER.info("Subscribed to rapid wind for device: %s via shared WS", device_id)
            except Exception as e:
                _LOGGER.error("Failed to send listen_rapid_start for %s: %s", device_id, e)

    async def _send_listen_stop_for_coordinator(
        self, coordinator: "TempestStrikeCoordinator"
    ) -> None:
        """Send listen_stop commands for all devices of a coordinator."""
        if not self._websocket or self._websocket.state != WsState.OPEN:
            return

        for device_id in coordinator.device_ids:
            if not device_id.strip().isdigit():
                continue
            sub_msg = {
                "type": "listen_stop",
                "device_id": int(device_id),
                "id": f"unsub_{device_id}",
            }
            rapid_unsub_msg = {
                "type": "listen_rapid_stop",
                "device_id": int(device_id),
                "id": f"unsub_rapid_{device_id}",
            }
            try:
                await self._websocket.send(json.dumps(sub_msg))
                _LOGGER.info("Unsubscribed from device: %s via shared WS", device_id)
            except Exception as e:
                _LOGGER.error("Failed to send listen_stop for %s: %s", device_id, e)
            try:
                await self._websocket.send(json.dumps(rapid_unsub_msg))
                _LOGGER.info("Unsubscribed from rapid wind for device: %s via shared WS", device_id)
            except Exception as e:
                _LOGGER.error("Failed to send listen_rapid_stop for %s: %s", device_id, e)

    async def _async_listen_loop(self) -> None:
        """Handle the infinite WebSocket connection loop."""
        try:
            ssl_context = await self.hass.async_add_executor_job(ssl.create_default_context)
        except Exception as e:
            _LOGGER.error("Failed to create SSL context: %s", e)
            ssl_context = None

        retry_delay = 5
        while self._running:
            try:
                ws_url = WS_ENDPOINT
                if self.api_token:
                    ws_url = f"{WS_ENDPOINT}?token={self.api_token}"

                _LOGGER.info(
                    "Connecting to shared Tempest WebSocket: %s",
                    ws_url.replace(self.api_token, "***") if self.api_token else ws_url,
                )
                async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                    self._websocket = websocket
                    retry_delay = 5

                    for coordinator in self.coordinators:
                        await self._send_listen_start_for_coordinator(coordinator)

                    _LOGGER.info("Shared Tempest WebSocket connection established successfully")
                    async for message in websocket:
                        if not self._running:
                            break
                        try:
                            _LOGGER.info("Shared WebSocket message received: %s", message)
                            message_data = json.loads(message)
                            self._dispatch(message_data)
                        except json.JSONDecodeError:
                            _LOGGER.warning("Received invalid JSON message from shared WebSocket")
                        except Exception as e:
                            _LOGGER.exception("Error processing shared WebSocket message: %s", e)

            except asyncio.CancelledError:
                _LOGGER.info("Shared WebSocket listener task cancelled")
                break
            except Exception as e:
                _LOGGER.error(
                    "Shared WebSocket connection error: %s. Retrying in %d seconds...",
                    e,
                    retry_delay,
                )
                self._websocket = None
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, 60)

        self._websocket = None

    def _dispatch(self, message_data: dict) -> None:
        """Dispatch a message to all registered coordinators."""
        for coordinator in self.coordinators:
            coordinator._process_incoming_message(message_data)


class TempestStrikeCoordinator:
    """Manages the WeatherFlow WebSocket connection and trilateration."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.entry = entry
        self.instance_name = str(entry.data.get(CONF_NAME, entry.entry_id[:8])).strip()
        self.strike_buffer = {}
        self._strike_timers = {}
        self.station_coords = {}
        self.device_to_station = {}
        self.device_ids = set()
        self.elevation_grid = []
        self.station_strikes = {}
        self.station_last_strike = {}
        self.station_names = {}
        self.recent_strike_timestamps = []
        # Raw per-station strike observations retained for later backfill/replay.
        self.raw_strikes = []
        self._raw_strike_store = Store(
            hass, STORAGE_VERSION, f"{STORAGE_KEY_RAW_STRIKES}_{entry.entry_id}"
        )
        self._listeners = []
        self.last_trilateration_status = "no_strikes"
        self.last_trilateration_timestamp = None
        self.last_trilateration_error = None
        self.last_trilateration_reporting = []
        self.wind_speed = 0.0
        self.wind_direction = 0.0
        self.solar_radiation = 1000.0
        self.rain_rate = 0.0

        self.primary_station = str(entry.data.get(CONF_PRIMARY_STATION, "")).strip()
        neighbor_raw = str(
            entry.options.get(CONF_NEIGHBOR_STATIONS, entry.data.get(CONF_NEIGHBOR_STATIONS, ""))
        )
        self.neighbor_stations = [s.strip() for s in neighbor_raw.split(",") if s.strip()]
        self.api_token = str(
            entry.options.get(CONF_API_TOKEN, entry.data.get(CONF_API_TOKEN, ""))
        ).strip()
        self.distance_filter = float(entry.options.get(CONF_DISTANCE_FILTER, 100.0))
        self.all_stations = [self.primary_station] + self.neighbor_stations

        # Parse coordinate if primary station is coordinates
        ref_lat = hass.config.latitude
        ref_lon = hass.config.longitude
        if "," in self.primary_station:
            try:
                parts = self.primary_station.split(",")
                ref_lat = float(parts[0])
                ref_lon = float(parts[1])
                self.station_coords[self.primary_station] = (ref_lat, ref_lon)
            except ValueError:
                pass

        self._listener_task = None
        self._running = False

    def async_add_listener(self, update_callback) -> None:
        """Add a listener for coordinator state updates."""
        self._listeners.append(update_callback)

    def async_remove_listener(self, update_callback) -> None:
        """Remove a listener."""
        if update_callback in self._listeners:
            self._listeners.remove(update_callback)

    def async_update_listeners(self) -> None:
        """Trigger update callbacks for all listeners."""
        for update_callback in self._listeners:
            update_callback()

    def start_websocket_listener(self) -> None:
        """Start the WebSocket listener task."""
        # We launch the setup as a background task, which will then register with the shared session
        self._running = True
        self._listener_task = self.hass.async_create_background_task(
            self._async_setup_and_register(),
            name=f"weatherflow_trilateration_setup_{self.instance_name}_{self.entry.entry_id}",
        )

    def _detect_local_stations(self) -> list[str]:
        """Detect local weather station IDs from official integrations."""
        detected = []
        target_domains = {
            "weatherflow",
            "weatherflow_cloud",
            "weatherflow_forecast",
            "weatherflow_udp",
        }

        # Query Config Entries
        for domain in target_domains:
            for entry in self.hass.config_entries.async_entries(domain):
                for key in ("station_id", "station"):
                    val = entry.data.get(key) or entry.options.get(key)
                    if val:
                        val_str = str(val).strip()
                        if val_str.isdigit() and len(val_str) <= 6 and not val_str.startswith("0"):
                            detected.append(val_str)

        # Deduplicate and filter out empty strings
        return list(set(s for s in detected if s))

    async def _async_detect_nearby_public_stations(self) -> list[str]:
        """Query the WeatherFlow REST API to discover nearby public stations."""
        if not self.api_token:
            _LOGGER.debug("No API token configured; skipping public station discovery")
            return []

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

        url = "https://swd.weatherflow.com/swd/rest/metadata/network/stations"
        # Search radius: 50km (50,000 meters)
        params = {
            "token": self.api_token,
            "center_lat": ref_lat,
            "center_lon": ref_lon,
            "radius": 50000,
        }

        detected = []
        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, params=params, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    stations = data.get("stations", [])
                    for station in stations:
                        station_id = str(station.get("station_id", ""))
                        lat = station.get("latitude")
                        lon = station.get("longitude")
                        if (
                            station_id
                            and station_id.isdigit()
                            and lat is not None
                            and lon is not None
                        ):
                            self.station_coords[station_id] = (float(lat), float(lon))
                            detected.append(station_id)

                            name = station.get("public_name") or station.get("name", "")
                            if name:
                                self.station_names[station_id] = name

                            # Extract and map devices for public stations
                            devices = station.get("devices", [])
                            for device in devices:
                                dev_id = str(device.get("device_id", ""))
                                if dev_id and dev_id.isdigit():
                                    self.device_to_station[dev_id] = station_id
                    _LOGGER.info(
                        "Discovered %d nearby public WeatherFlow stations: %s",
                        len(detected),
                        detected,
                    )
                else:
                    _LOGGER.warning(
                        "Failed to query nearby WeatherFlow stations: HTTP %d",
                        response.status,
                    )
        except Exception as e:
            _LOGGER.error("Error querying nearby WeatherFlow stations: %s", e)

        return detected

    def _detect_api_token(self) -> str:
        """Detect API token dynamically from other WeatherFlow config entries if missing."""
        target_domains = {
            "weatherflow",
            "weatherflow_cloud",
        }
        for domain in target_domains:
            for entry in self.hass.config_entries.async_entries(domain):
                for key in ("api_token", "token"):
                    val = entry.data.get(key) or entry.options.get(key)
                    if val:
                        val_str = str(val).strip()
                        if val_str:
                            _LOGGER.debug(
                                "Found API token in config entry for domain %s: %s",
                                domain,
                                val_str[:4] + "..." if len(val_str) > 4 else "***",
                            )
                            return val_str
        return ""

    async def _async_resolve_stations_metadata(self) -> None:
        """Resolve device IDs and coordinates for all configured and discovered stations."""
        session = async_get_clientsession(self.hass)
        self.device_ids = set()

        # If token is empty at runtime, try to dynamically detect it from other integrations
        if not self.api_token:
            self.api_token = self._detect_api_token()

        _LOGGER.debug(
            "Starting station metadata resolution. Configured stations/IDs: %s",
            self.all_stations,
        )

        # 0. Offline resolution from other integrations' config entries and device registry
        try:
            device_registry = dr.async_get(self.hass)
            target_domains = {
                "weatherflow",
                "weatherflow_cloud",
                "weatherflow_forecast",
                "weatherflow_udp",
            }
            for domain in target_domains:
                for entry in self.hass.config_entries.async_entries(domain):
                    station_id = None
                    for key in ("station_id", "station"):
                        val = entry.data.get(key) or entry.options.get(key)
                        if val:
                            val_str = str(val).strip()
                            if val_str.isdigit():
                                station_id = val_str
                                break

                    if not station_id:
                        continue

                    # Map devices registered under this config entry to the entry's station_id
                    for device_entry in device_registry.devices.values():
                        if entry.entry_id in device_entry.config_entries:
                            for identifier in device_entry.identifiers:
                                if len(identifier) == 2 and identifier[0] == entry.domain:
                                    val = str(identifier[1]).strip()
                                    self.device_to_station[val] = station_id

                                    # Strip prefix to map serial/ID without prefix
                                    clean_val = val
                                    for prefix in ("ST-", "HB-"):
                                        if clean_val.startswith(prefix):
                                            clean_val = clean_val[len(prefix) :]
                                    if clean_val:
                                        self.device_to_station[clean_val] = station_id

                            if device_entry.name:
                                name_str = str(device_entry.name).strip()
                                self.device_to_station[name_str] = station_id
                                clean_name = name_str
                                for prefix in ("ST-", "HB-"):
                                    if clean_name.startswith(prefix):
                                        clean_name = clean_name[len(prefix) :]
                                if clean_name:
                                    self.device_to_station[clean_name] = station_id
        except Exception as e:
            _LOGGER.debug("Error performing offline resolution from device registry: %s", e)

        # 1. If we have a token, fetch the user's own stations and devices list first.
        # This allows us to map device IDs/serial numbers (like 00172794) to their correct station IDs.
        if self.api_token:
            user_stations_url = "https://swd.weatherflow.com/swd/rest/stations"
            params = {"token": self.api_token}
            _LOGGER.debug(
                "Fetching user stations list from REST API via URL: %s", user_stations_url
            )
            try:
                async with session.get(user_stations_url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        _LOGGER.debug("User stations list response: %s", data)
                        stations = data.get("stations", [])
                        for station in stations:
                            station_id = str(station.get("station_id", ""))
                            lat = station.get("latitude")
                            lon = station.get("longitude")
                            name = station.get("public_name") or station.get("name", "")
                            if name:
                                self.station_names[station_id] = name
                            if lat is not None and lon is not None:
                                self.station_coords[station_id] = (
                                    float(lat),
                                    float(lon),
                                )

                            devices = station.get("devices", [])
                            for device in devices:
                                dev_id = str(device.get("device_id", ""))
                                serial = str(device.get("serial_number", ""))
                                dev_type = device.get("device_type")

                                is_hub = dev_type == "HB" or serial.startswith("HB")

                                if dev_id and dev_id.isdigit():
                                    self.device_to_station[dev_id] = station_id
                                    if not is_hub:
                                        self.device_ids.add(dev_id)
                                    _LOGGER.debug(
                                        "Mapped user device_id %s (serial %s, type %s) to station_id %s",
                                        dev_id,
                                        serial,
                                        dev_type,
                                        station_id,
                                    )
                                    if lat is not None and lon is not None:
                                        self.station_coords[dev_id] = (
                                            float(lat),
                                            float(lon),
                                        )
                                    if serial:
                                        self.device_to_station[serial] = station_id
                                        self.station_coords[serial] = (
                                            float(lat),
                                            float(lon),
                                        )
                                        # Map serial without prefix
                                        clean_serial = serial
                                        for prefix in ("ST-", "HB-"):
                                            if clean_serial.startswith(prefix):
                                                clean_serial = clean_serial[len(prefix) :]
                                        if clean_serial:
                                            self.device_to_station[clean_serial] = station_id
                                            self.station_coords[clean_serial] = (
                                                float(lat),
                                                float(lon),
                                            )
                    else:
                        _LOGGER.debug(
                            "Failed to fetch user stations list: HTTP %d",
                            response.status,
                        )
            except Exception as e:
                _LOGGER.debug("Error fetching user stations list: %s", e)

        # 2. Update any configured device ID or serial number in self.all_stations to the resolved station ID
        _LOGGER.debug("Mapping configured device/station IDs to resolved station IDs")
        for idx, s_id in enumerate(self.all_stations):
            if s_id in self.device_to_station:
                resolved_station = self.device_to_station[s_id]
                _LOGGER.info(
                    "Resolved configured ID %s to station %s",
                    s_id,
                    resolved_station,
                )
                self.all_stations[idx] = resolved_station

        # 3. For any remaining station ID, query the public/metadata stations endpoint if not already resolved.
        # If the API token is missing, we skip and use the fallback.
        _LOGGER.debug(
            "Resolving remaining station metadata from public REST API. Active stations list: %s",
            self.all_stations,
        )
        if not self.api_token:
            # Fallback mapping: assume device_id is station_id
            for station in self.all_stations:
                if "," not in station and station.strip().isdigit():
                    self.device_to_station[station] = station
                    self.device_ids.add(station)
            return

        for station_id in list(self.all_stations):
            if "," in station_id or not station_id.strip().isdigit():
                continue

            # If we already have the coordinates and devices resolved for this station, skip querying
            if station_id in self.station_coords and any(
                sid == station_id for sid in self.device_to_station.values()
            ):
                _LOGGER.debug(
                    "Station %s is already resolved (coords: %s). Skipping query.",
                    station_id,
                    self.station_coords[station_id],
                )
                continue

            url = f"https://swd.weatherflow.com/swd/rest/stations/{station_id}"
            params = {"token": self.api_token}
            _LOGGER.debug("Querying metadata for station %s via URL: %s", station_id, url)
            try:
                async with session.get(url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        stations = data.get("stations", [])
                        for station in stations:
                            lat = station.get("latitude")
                            lon = station.get("longitude")
                            name = station.get("public_name") or station.get("name", "")
                            if name:
                                self.station_names[station_id] = name
                            if lat is not None and lon is not None:
                                self.station_coords[station_id] = (
                                    float(lat),
                                    float(lon),
                                )

                            devices = station.get("devices", [])
                            for device in devices:
                                dev_id = str(device.get("device_id", ""))
                                dev_type = device.get("device_type")
                                serial = str(device.get("serial_number", ""))

                                is_hub = dev_type == "HB" or serial.startswith("HB")

                                if dev_id and dev_id.isdigit():
                                    self.device_to_station[dev_id] = station_id
                                    if not is_hub:
                                        self.device_ids.add(dev_id)
                                    _LOGGER.debug(
                                        "Mapped device %s (%s) to station %s",
                                        dev_id,
                                        dev_type,
                                        station_id,
                                    )
                                    if serial:
                                        self.device_to_station[serial] = station_id
                                        # Map serial without prefix
                                        clean_serial = serial
                                        for prefix in ("ST-", "HB-"):
                                            if clean_serial.startswith(prefix):
                                                clean_serial = clean_serial[len(prefix) :]
                                        if clean_serial:
                                            self.device_to_station[clean_serial] = station_id
                    else:
                        # Log 404 as info since it could be an unresolved device ID or serial number
                        log_level = logging.INFO if response.status == 404 else logging.WARNING
                        _LOGGER.log(
                            log_level,
                            "Could not resolve metadata for ID/station %s: HTTP %d",
                            station_id,
                            response.status,
                        )
            except Exception as e:
                _LOGGER.error(
                    "Error resolving metadata for station %s: %s",
                    station_id,
                    e,
                )

        # 4. Fallback mapping for any station that failed to resolve or has no mapped devices
        for station in self.all_stations:
            if "," not in station and station.strip().isdigit():
                if station not in self.device_to_station.values():
                    self.device_to_station[station] = station
                    self.device_ids.add(station)

        # 5. Deduplicate all_stations to remove duplicate station IDs after device-to-station resolution
        self.all_stations = list(dict.fromkeys(self.all_stations))

        # Also map self.primary_station and self.neighbor_stations if they were configured as device serials/IDs
        if self.primary_station in self.device_to_station:
            self.primary_station = self.device_to_station[self.primary_station]
        self.neighbor_stations = list(
            dict.fromkeys([self.device_to_station.get(s, s) for s in self.neighbor_stations])
        )

        _LOGGER.debug(
            "Deduplicated active stations list: %s",
            self.all_stations,
        )

        # 6. Filter out any stations that are too far from the primary station (e.g. > 100 km)
        primary_coords = self.station_coords.get(self.primary_station)
        if not primary_coords:
            primary_coords = self._get_station_coords(self.primary_station)

        if primary_coords:
            ref_lat, ref_lon = primary_coords
            filtered_stations = []
            for station_id in self.all_stations:
                coords = self.station_coords.get(station_id)
                if not coords:
                    coords = self._get_station_coords(station_id)

                if coords:
                    lat, lon = coords
                    dist = self._calculate_distance(ref_lat, ref_lon, lat, lon)
                    if dist <= self.distance_filter:
                        filtered_stations.append(station_id)
                    else:
                        _LOGGER.warning(
                            "Filtering out station %s because it is too far (%.1f km > %.1f km) from primary station",
                            station_id,
                            dist,
                            self.distance_filter,
                        )
                else:
                    # Keep stations with unresolved coordinates for now so we can still try to listen
                    filtered_stations.append(station_id)
            self.all_stations = filtered_stations

        # 7. Fetch the real terrain elevation grid centered at the primary station
        try:
            await self._async_fetch_elevation_grid()
        except Exception as e:
            _LOGGER.error("Failed to fetch elevation grid: %s", e)

        # 8. Fetch the vector geodata (waterbodies & forests) centered at the primary station
        try:
            await self._async_fetch_vector_data()
        except Exception as e:
            _LOGGER.error("Failed to fetch vector data: %s", e)

    async def _async_fetch_elevation_grid(self) -> None:
        """Fetch real terrain elevation data for a grid around the primary station."""
        primary_coords = self.station_coords.get(self.primary_station)
        if not primary_coords:
            primary_coords = self._get_station_coords(self.primary_station)

        if not primary_coords:
            _LOGGER.debug("Could not resolve primary coordinates for elevation grid")
            return

        ref_lat, ref_lon = primary_coords

        # Define grid dimensions: 15x15 points spanning 40km
        grid_size = 15
        span_km = 40.0

        # Calculate latitude and longitude ranges
        lat_span = span_km / 111.1
        cos_lat = math.cos(math.radians(ref_lat))
        lon_span = span_km / (111.1 * cos_lat) if cos_lat > 0 else span_km / 111.1

        lats = []
        lons = []
        for i in range(grid_size):
            lat = ref_lat - (lat_span / 2) + (lat_span * i / (grid_size - 1))
            for j in range(grid_size):
                lon = ref_lon - (lon_span / 2) + (lon_span * j / (grid_size - 1))
                lats.append(f"{lat:.5f}")
                lons.append(f"{lon:.5f}")

        url = "https://api.open-meteo.com/v1/elevation"
        params = {"latitude": ",".join(lats), "longitude": ",".join(lons)}

        try:
            session = async_get_clientsession(self.hass)
            _LOGGER.debug("Querying Open-Meteo elevation grid api...")
            async with session.get(url, params=params, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()
                    self.elevation_grid = data.get("elevation", [])
                    _LOGGER.info(
                        "Successfully fetched %d elevation points for the terrain grid",
                        len(self.elevation_grid),
                    )
                else:
                    _LOGGER.warning(
                        "Failed to query Open-Meteo elevation API: HTTP %d",
                        response.status,
                    )
        except Exception as e:
            _LOGGER.error("Error fetching elevation grid: %s", e)

    async def _async_fetch_vector_data(self) -> None:
        """Fetch lakes and forests from OSM Overpass API and cache them."""
        primary_coords = self.station_coords.get(self.primary_station)
        if not primary_coords:
            primary_coords = self._get_station_coords(self.primary_station)

        if not primary_coords:
            _LOGGER.debug("Could not resolve primary coordinates for vector data")
            return

        ref_lat, ref_lon = primary_coords
        safe_primary = str(self.primary_station).replace(",", "_").replace(" ", "_")
        safe_coords = f"{ref_lat}_{ref_lon}".replace(".", "_")
        cache_filename = f"vector_cache_{safe_primary}_{safe_coords}.json"
        cache_path = self.hass.config.path(
            f"custom_components/weatherflow_lightning_trilateration/{cache_filename}"
        )

        if os.path.exists(cache_path):
            mtime = os.path.getmtime(cache_path)
            if time.time() - mtime < 604800:  # 7 days
                _LOGGER.info("Using cached OSM vector data")
                return

        radius = 15000
        query = f"""
        [out:json][timeout:30];
        (
          way["natural"="water"](around:{radius},{ref_lat},{ref_lon});
          relation["natural"="water"](around:{radius},{ref_lat},{ref_lon});
          way["landuse"="forest"](around:{radius},{ref_lat},{ref_lon});
          relation["landuse"="forest"](around:{radius},{ref_lat},{ref_lon});
        );
        out geom;
        """
        urls = [
            "https://overpass.openstreetmap.fr/api/interpreter",
            "https://de.overpass-api.de/api/interpreter",
            "https://overpass-api.de/api/interpreter",
        ]
        headers = {
            "User-Agent": "HomeAssistantWeatherFlowLightningTrilateration/1.0 (github.com/JohNan/homeassistant-weatherflow-lightning-trilateration)",
        }

        session = async_get_clientsession(self.hass)
        success = False

        for url in urls:
            try:
                _LOGGER.info("Querying OSM Overpass API for vector data from %s...", url)
                async with session.post(
                    url, data={"data": query}, headers=headers, timeout=30
                ) as response:
                    if response.status == 200:
                        raw_data = await response.json()
                        processed = self._process_vector_data(raw_data)

                        def _write_cache() -> None:
                            cache_dir = os.path.dirname(cache_path)
                            os.makedirs(cache_dir, exist_ok=True)

                            for f_name in os.listdir(cache_dir):
                                if f_name.startswith("vector_cache_") and f_name.endswith(".json"):
                                    if f_name != cache_filename:
                                        try:
                                            os.remove(os.path.join(cache_dir, f_name))
                                        except OSError:
                                            pass

                            with open(cache_path, "w", encoding="utf-8") as f:
                                json.dump(processed, f, ensure_ascii=False, indent=2)

                        await self.hass.async_add_executor_job(_write_cache)
                        _LOGGER.info("Successfully fetched and cached vector data from %s", url)
                        success = True
                        break
                    else:
                        _LOGGER.warning(
                            "Failed to query Overpass API at %s: HTTP %d", url, response.status
                        )
            except Exception as e:
                _LOGGER.warning("Error fetching vector data from %s: %s", url, e)

        if not success:
            _LOGGER.error("All Overpass API mirrors failed to return vector data")

    def _process_vector_data(self, raw_data) -> dict:
        """Process and simplify OSM JSON Overpass geometry data."""
        elements = raw_data.get("elements", [])
        water_features = []
        forest_features = []

        def merge_ways_into_rings(ways_geom):
            unmerged = []
            for geom in ways_geom:
                if not geom:
                    continue
                pts = []
                for pt in geom:
                    lat = pt.get("lat")
                    lon = pt.get("lon")
                    if lat is not None and lon is not None:
                        pts.append((lat, lon))
                if len(pts) >= 2:
                    unmerged.append(pts)

            rings = []
            while unmerged:
                current = unmerged.pop(0)
                extended = True
                while extended:
                    extended = False
                    for i, seg in enumerate(unmerged):
                        if (
                            abs(seg[0][0] - current[-1][0]) < 1e-7
                            and abs(seg[0][1] - current[-1][1]) < 1e-7
                        ):
                            current.extend(seg[1:])
                            unmerged.pop(i)
                            extended = True
                            break
                        elif (
                            abs(seg[-1][0] - current[-1][0]) < 1e-7
                            and abs(seg[-1][1] - current[-1][1]) < 1e-7
                        ):
                            current.extend(seg[:-1][::-1])
                            unmerged.pop(i)
                            extended = True
                            break

                    if extended:
                        continue

                    for i, seg in enumerate(unmerged):
                        if (
                            abs(seg[-1][0] - current[0][0]) < 1e-7
                            and abs(seg[-1][1] - current[0][1]) < 1e-7
                        ):
                            current = seg[:-1] + current
                            unmerged.pop(i)
                            extended = True
                            break
                        elif (
                            abs(seg[0][0] - current[0][0]) < 1e-7
                            and abs(seg[0][1] - current[0][1]) < 1e-7
                        ):
                            current = seg[1:][::-1] + current
                            unmerged.pop(i)
                            extended = True
                            break

                rings.append(current)
            return rings

        for elem in elements:
            tags = elem.get("tags", {})
            elem_type = elem.get("type")

            is_water = tags.get("natural") == "water" or tags.get("waterway") == "riverbank"
            is_forest = tags.get("landuse") == "forest" or tags.get("natural") == "wood"

            if not (is_water or is_forest):
                continue

            geometries_to_process = []

            if elem_type == "way":
                geom = elem.get("geometry", [])
                if geom and len(geom) >= 3:
                    geometries_to_process.append(geom)
            elif elem_type == "relation":
                members = elem.get("members", [])
                outer_ways = []
                for member in members:
                    if member.get("type") == "way" and member.get("role") in ("outer", ""):
                        geom = member.get("geometry", [])
                        if geom:
                            outer_ways.append(geom)
                rings = merge_ways_into_rings(outer_ways)
                for ring in rings:
                    geom = [{"lat": pt[0], "lon": pt[1]} for pt in ring]
                    if len(geom) >= 3:
                        geometries_to_process.append(geom)

            for geom in geometries_to_process:
                coords = []
                for pt in geom:
                    lat = pt.get("lat")
                    lon = pt.get("lon")
                    if lat is not None and lon is not None:
                        coords.append([round(lat, 5), round(lon, 5)])

                if len(coords) > 100:
                    step = len(coords) // 100 + 1
                    coords = coords[::step]
                    if coords and coords[0] != coords[-1]:
                        coords.append(coords[0])

                feature = {"coordinates": coords}
                if is_water:
                    water_features.append(feature)
                elif is_forest:
                    forest_features.append(feature)

        return {"water": water_features[:200], "forest": forest_features[:200]}

    async def async_stop(self) -> None:
        """Stop the coordinator and deregister from shared websocket session."""
        self._running = False
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
            self._listener_task = None

        _shared_ws = self.hass.data[DOMAIN].get("_shared_ws", {})
        shared_session = _shared_ws.get(self.api_token)
        if shared_session:
            await shared_session.deregister(self)

    async def _async_setup_and_register(self) -> None:
        """Setup metadata and register with shared websocket session."""
        # Restore persisted raw strike observations for backfill/replay
        try:
            stored = await self._raw_strike_store.async_load()
            if stored:
                self.raw_strikes = stored.get("strikes", [])
                self._prune_raw_strikes()
        except Exception as e:
            _LOGGER.debug("Could not load stored raw strikes: %s", e)

        # Detect local weather stations from official and other WeatherFlow integrations
        local_stations = self._detect_local_stations()
        _LOGGER.info("Detected local weather stations: %s", local_stations)
        for station in local_stations:
            if station not in self.all_stations:
                self.all_stations.append(station)
                _LOGGER.info("Added local weather station %s to calculations", station)

        # Discover nearby public stations first
        try:
            nearby_stations = await self._async_detect_nearby_public_stations()
            for station in nearby_stations:
                if station not in self.all_stations:
                    self.all_stations.append(station)
                    _LOGGER.info("Added nearby public station %s to calculations", station)
        except Exception as e:
            _LOGGER.exception("Failed to discover nearby public stations: %s", e)

        # Resolve devices and coordinates for all stations
        try:
            await self._async_resolve_stations_metadata()
        except Exception as e:
            _LOGGER.exception("Failed to resolve station metadata: %s", e)

        _shared_ws = self.hass.data[DOMAIN].setdefault("_shared_ws", {})
        shared_session = _shared_ws.get(self.api_token)
        if not shared_session:
            shared_session = SharedWebSocketSession(self.hass, self.api_token)
            _shared_ws[self.api_token] = shared_session

        shared_session.register(self)

    def _get_station_coords(self, device_id: str):
        """Retrieve coordinates for a specific station ID."""
        if device_id in self.station_coords:
            return self.station_coords[device_id]

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

    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great-circle distance between two coordinates (in km)."""
        R = 6371.0
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)

        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _process_incoming_message(self, message_data: dict) -> None:
        """Process an incoming WebSocket message."""
        now_time = time.time()

        # Clean up old timestamps (older than 60 seconds)
        original_length = len(self.recent_strike_timestamps)
        self.recent_strike_timestamps = [
            ts for ts in self.recent_strike_timestamps if now_time - ts <= 60
        ]
        if len(self.recent_strike_timestamps) < original_length:
            self.async_update_listeners()

        msg_type = message_data.get("type")
        _LOGGER.debug("Processing WebSocket message of type: %s", msg_type)

        if msg_type == "obs_st":
            # obs_st payload indices (WeatherFlow Tempest WS spec):
            #  [0] epoch  [1] interval(min)  [2] wind_lull  [3] wind_avg
            #  [4] wind_gust  [5] wind_direction  [6] wind_sample_interval
            #  [7] pressure  [8] temperature  [9] humidity  [10] illuminance
            #  [11] uv  [12] solar_radiation  [13] rain_accumulated(mm/interval)
            #  [14] precip_type  [15] local_daily_rain  [16] precip_analysis
            #  [17] battery  [18] report_interval
            obs = message_data.get("obs", [])
            if obs and len(obs[0]) >= 14:
                interval_min = float(obs[0][1]) if obs[0][1] else 1.0
                rain_accum_mm = float(obs[0][13])
                self.wind_speed = float(obs[0][3])
                self.wind_direction = float(obs[0][5])
                self.solar_radiation = float(obs[0][12])
                # Convert per-interval accumulation (mm) to mm/h
                self.rain_rate = round(rain_accum_mm * (60.0 / interval_min), 2)
                _LOGGER.debug(
                    "Parsed weather telemetry: wind_speed=%f, wind_direction=%f,"
                    " solar_radiation=%f, rain_rate=%f (accum=%f mm over %f min)",
                    self.wind_speed,
                    self.wind_direction,
                    self.solar_radiation,
                    self.rain_rate,
                    rain_accum_mm,
                    interval_min,
                )
                self.async_update_listeners()
            return

        if msg_type == "rapid_wind":
            ob = message_data.get("ob", [])
            if ob and len(ob) >= 3:
                self.wind_speed = float(ob[1])
                self.wind_direction = float(ob[2])
                _LOGGER.debug(
                    "Parsed rapid wind telemetry: wind_speed=%f, wind_direction=%f",
                    self.wind_speed,
                    self.wind_direction,
                )
                self.async_update_listeners()
            return

        if msg_type != "evt_strike":
            return

        device_id = str(message_data.get("device_id"))
        evt = message_data.get("evt", [])
        if len(evt) < 2:
            _LOGGER.debug("Skipping strike event with incomplete payload")
            return

        timestamp = int(evt[0])
        distance = float(evt[1])
        _LOGGER.info(
            "Parsed strike event: device_id=%s, timestamp=%d, distance=%f",
            device_id,
            timestamp,
            distance,
        )

        # Map device_id to station_id
        station_id = self.device_to_station.get(device_id, device_id)
        _LOGGER.info("Mapped device_id %s to station_id %s", device_id, station_id)

        # Track strike counts and last strike parameters per station
        self.station_strikes[station_id] = self.station_strikes.get(station_id, 0) + 1
        self.station_last_strike[station_id] = {
            "timestamp": timestamp,
            "distance": distance,
        }
        # Persist the raw observation so a backfill/replay can be run later
        self._record_raw_strike(device_id, station_id, timestamp, distance)
        self.async_update_listeners()

        # Find or create a group bucket matching timestamp within a 3-second variance tolerance
        matched_timestamp = None
        for bucket_ts in list(self.strike_buffer.keys()):
            if abs(bucket_ts - timestamp) <= 3:
                matched_timestamp = bucket_ts
                break

        if matched_timestamp is None:
            matched_timestamp = timestamp
            self.strike_buffer[matched_timestamp] = {}
            self.recent_strike_timestamps.append(timestamp)
            _LOGGER.info("Created new strike buffer bucket for timestamp %d", matched_timestamp)

            @callback
            def _process_bucket(_: object) -> None:
                """Process a bucket of strike events after a short delay."""
                # The timer executed, remove it from the tracking dict
                if matched_timestamp in self._strike_timers:
                    del self._strike_timers[matched_timestamp]

                bucket = self.strike_buffer.get(matched_timestamp)
                if not bucket:
                    return

                _LOGGER.info("Processing strike buffer bucket %d: %s", matched_timestamp, bucket)

                strike_events = []
                for dev_id, dist in list(bucket.items()):
                    coords = self._get_station_coords(dev_id)
                    if coords:
                        strike_events.append((coords[0], coords[1], dist))
                    else:
                        _LOGGER.warning(
                            "Trilateration: Could not resolve coordinates for station/device: %s",
                            dev_id,
                        )

                station_info = []
                for dev_id, dist in list(bucket.items()):
                    name = self.station_names.get(dev_id, dev_id)
                    station_info.append(f"{name} ({dist} km)")

                if len(strike_events) >= 3:
                    _LOGGER.info(
                        "Invoking MLAT calculation with coordinates/distances: %s", strike_events
                    )
                    self._calculate_trilateration(
                        strike_events, station_info, timestamp=float(matched_timestamp)
                    )
                else:
                    _LOGGER.info(
                        "Trilateration could not be calculated: only %d stations reported this strike "
                        "(minimum 3 required). Reporting stations: %s",
                        len(strike_events),
                        ", ".join(station_info),
                    )
                    self.last_trilateration_status = "insufficient_stations"
                    self.last_trilateration_timestamp = float(matched_timestamp)
                    self.last_trilateration_error = f"Only {len(strike_events)} stations reported this strike (minimum 3 required)."
                    self.last_trilateration_reporting = station_info
                    self.async_update_listeners()

                # Evict from buffer to prevent reprocessing
                del self.strike_buffer[matched_timestamp]

            # Allow 3.0 seconds to collect all N stations
            timer = async_call_later(self.hass, 3.0, _process_bucket)
            self._strike_timers[matched_timestamp] = timer

        self.strike_buffer[matched_timestamp][station_id] = distance
        bucket = self.strike_buffer[matched_timestamp]
        _LOGGER.info("Current strike buffer status for bucket %d: %s", matched_timestamp, bucket)

        # Cleanup old entries to prevent memory leak
        for bucket_ts in list(self.strike_buffer.keys()):
            # Fallback cleanup for very old buckets (e.g. if a timer was cancelled or failed)
            if timestamp - bucket_ts > 10:
                del self.strike_buffer[bucket_ts]
                if bucket_ts in self._strike_timers:
                    timer = self._strike_timers.pop(bucket_ts)
                    timer()  # Cancel timer

    def _solve_trilateration(self, strike_events: list):
        """Least-squares strike location from station coordinates and distances.

        Returns a tuple ``(latitude, longitude, status, max_residual_km)`` where
        ``status`` is one of ``"success"``, ``"collinear"``, ``"out_of_bounds"``,
        ``"unreliable"`` or ``"insufficient_stations"``. ``latitude``/``longitude``
        are ``None`` when no location could be computed. This method is pure: it
        has no side effects, so it can be reused by both the live path and replay.
        """
        if len(strike_events) < 3:
            return None, None, "insufficient_stations", None

        # Earth radius in kilometers
        R = 6371.0

        lat1, lon1, d1 = strike_events[0]
        lat1_rad = math.radians(lat1)
        cos_lat1 = math.cos(lat1_rad)

        M11 = 0.0
        M12 = 0.0
        M22 = 0.0
        V1 = 0.0
        V2 = 0.0

        for i in range(1, len(strike_events)):
            lat_i, lon_i, d_i = strike_events[i]

            # Project coordinates onto a flat Cartesian plane relative to (lat1, lon1)
            x_i = R * math.radians(lon_i - lon1) * cos_lat1
            y_i = R * math.radians(lat_i - lat1)

            A_i1 = 2 * x_i
            A_i2 = 2 * y_i
            b_i = (d1**2) - (d_i**2) + (x_i**2) + (y_i**2)

            M11 += A_i1 * A_i1
            M12 += A_i1 * A_i2
            M22 += A_i2 * A_i2

            V1 += A_i1 * b_i
            V2 += A_i2 * b_i

        det = M11 * M22 - M12 * M12
        if abs(det) < 1e-9:
            return None, None, "collinear", None

        # x = (A^T A)^-1 A^T b
        x = (M22 * V1 - M12 * V2) / det
        y = (-M12 * V1 + M11 * V2) / det

        calculated_latitude = lat1 + math.degrees(y / R)
        calculated_longitude = lon1 + math.degrees(x / (R * cos_lat1))

        if not (-90.0 <= calculated_latitude <= 90.0 and -180.0 <= calculated_longitude <= 180.0):
            return calculated_latitude, calculated_longitude, "out_of_bounds", None

        # Validate the fit: the great-circle distance from the computed location
        # back to each reporting station must match that station's reported
        # distance. A large residual means the readings are mutually inconsistent
        # (coarse/noisy data or fabricated station coordinates) and the exact
        # 3-station solve has diverged to a meaningless point.
        max_residual = 0.0
        for lat_s, lon_s, d_s in strike_events:
            actual = self._calculate_distance(
                calculated_latitude, calculated_longitude, lat_s, lon_s
            )
            max_residual = max(max_residual, abs(actual - d_s))

        if max_residual > MAX_TRILATERATION_RESIDUAL_KM:
            return calculated_latitude, calculated_longitude, "unreliable", max_residual

        return calculated_latitude, calculated_longitude, "success", max_residual

    def _calculate_trilateration(
        self, strike_events: list, station_info: list = None, timestamp: float = None
    ) -> None:
        """Solve for the strike location and report/emit the result."""
        lat, lon, status, residual = self._solve_trilateration(strike_events)

        self.last_trilateration_timestamp = (
            float(timestamp) if timestamp is not None else time.time()
        )
        self.last_trilateration_reporting = station_info or []

        if status == "insufficient_stations":
            return

        if status == "collinear":
            _LOGGER.warning("Collinear station arrangement or invalid distance data detected.")
            self.last_trilateration_status = "collinear"
            self.last_trilateration_error = (
                "Collinear station arrangement or invalid distance data detected."
            )
            self.async_update_listeners()
            return

        if status == "out_of_bounds":
            _LOGGER.warning(
                "Calculated strike location coords out of bounds: lat=%f, lon=%f", lat, lon
            )
            self.last_trilateration_status = "out_of_bounds"
            self.last_trilateration_error = (
                f"Calculated strike location coords out of bounds: lat={lat}, lon={lon}."
            )
            self.async_update_listeners()
            return

        if status == "unreliable":
            _LOGGER.info(
                "Discarding unreliable trilateration (lat=%f, lon=%f): max distance residual "
                "%.1f km exceeds the %.1f km threshold; reported distances are inconsistent.",
                lat,
                lon,
                residual,
                MAX_TRILATERATION_RESIDUAL_KM,
            )
            self.last_trilateration_status = "unreliable"
            self.last_trilateration_error = (
                f"Reported distances are inconsistent (max residual {residual:.1f} km); "
                "strike location discarded."
            )
            self.async_update_listeners()
            return

        _LOGGER.info(
            "Calculated strike location: lat=%f, lon=%f (max residual %.2f km)",
            lat,
            lon,
            residual,
        )
        self.last_trilateration_status = "success"
        self.last_trilateration_error = None
        self.async_update_listeners()

        self._fire_strike(lat, lon, self.last_trilateration_timestamp)

    def _fire_strike(self, latitude: float, longitude: float, timestamp: float) -> None:
        """Fire the strike-calculated event that creates a map marker."""
        self.hass.bus.async_fire(
            event_key(self.entry.entry_id),
            {
                "latitude": latitude,
                "longitude": longitude,
                "timestamp": timestamp,
            },
        )

    def _prune_raw_strikes(self) -> None:
        """Drop raw strike observations older than the retention window."""
        cutoff = time.time() - RAW_STRIKE_RETENTION_SEC
        self.raw_strikes = [s for s in self.raw_strikes if s.get("timestamp", 0) >= cutoff]

    @callback
    def _record_raw_strike(
        self, device_id: str, station_id: str, timestamp: int, distance: float
    ) -> None:
        """Persist a raw per-station strike observation for later backfill/replay."""
        self.raw_strikes.append(
            {
                "device_id": device_id,
                "station_id": station_id,
                "timestamp": timestamp,
                "distance": distance,
            }
        )
        self._prune_raw_strikes()
        # Coalesced, loop-safe write to disk.
        self._raw_strike_store.async_delay_save(lambda: {"strikes": self.raw_strikes}, 30)

    def replay_strikes(self, raw_events: list, tolerance: int = 3) -> dict:
        """Re-run trilateration over raw strike observations and emit markers.

        ``raw_events`` is an iterable of dicts with ``timestamp`` and ``distance``
        plus either ``station_id`` or ``device_id``. Events are grouped by
        timestamp (within ``tolerance`` seconds), and every group that produces a
        reliable fix fires a strike marker using the strike's original timestamp.
        Returns a summary dict.
        """
        buckets = {}
        for ev in sorted(raw_events, key=lambda e: e.get("timestamp", 0)):
            try:
                ts = int(ev["timestamp"])
                distance = float(ev["distance"])
            except (KeyError, TypeError, ValueError):
                continue
            station_id = ev.get("station_id")
            if not station_id:
                device_id = str(ev.get("device_id", ""))
                station_id = self.device_to_station.get(device_id, device_id)

            matched = None
            for b_ts in buckets:
                if abs(b_ts - ts) <= tolerance:
                    matched = b_ts
                    break
            if matched is None:
                matched = ts
                buckets[matched] = {}
            buckets[matched][station_id] = distance

        summary = {"buckets": len(buckets), "fired": 0, "skipped": 0}
        for matched_ts, bucket in sorted(buckets.items()):
            strike_events = []
            for station_id, dist in bucket.items():
                coords = self._get_station_coords(station_id)
                if coords:
                    strike_events.append((coords[0], coords[1], dist))

            lat, lon, status, residual = self._solve_trilateration(strike_events)
            if status == "success":
                self._fire_strike(lat, lon, float(matched_ts))
                summary["fired"] += 1
            else:
                summary["skipped"] += 1
                _LOGGER.debug(
                    "Replay bucket %d skipped (%s, %d stations)",
                    matched_ts,
                    status,
                    len(strike_events),
                )

        _LOGGER.info(
            "Strike replay for %s: %d bucket(s), %d marker(s) emitted, %d skipped",
            self.instance_name,
            summary["buckets"],
            summary["fired"],
            summary["skipped"],
        )
        return summary


async def _async_register_lovelace_resource(hass: HomeAssistant) -> None:
    """Register custom Lovelace resource automatically."""
    lovelace = hass.data.get("lovelace")
    if not lovelace:
        return

    resources = getattr(lovelace, "resources", None)
    if not resources:
        return

    if hasattr(resources, "loaded") and not resources.loaded:
        if hasattr(resources, "async_load"):
            await resources.async_load()

    base_url = "/weatherflow_lightning_trilateration/weatherflow-lightning-card.js"
    url = f"{base_url}?v=f968b3e"

    existing_item = None
    if hasattr(resources, "async_items"):
        for item in resources.async_items():
            item_url = item.get("url") if isinstance(item, dict) else getattr(item, "url", None)
            if item_url and item_url.startswith(base_url):
                existing_item = item
                break

    if existing_item:
        existing_url = (
            existing_item.get("url")
            if isinstance(existing_item, dict)
            else getattr(existing_item, "url", None)
        )
        if existing_url == url:
            _LOGGER.debug("Lovelace resource already registered: %s", url)
            return

        # Update the existing resource URL to force reload
        _LOGGER.info(
            "Updating Lovelace resource from %s to %s to force reload",
            existing_url,
            url,
        )
        if hasattr(resources, "async_update_item"):
            item_id = (
                existing_item.get("id")
                if isinstance(existing_item, dict)
                else getattr(existing_item, "id", None)
            )
            if item_id:
                await resources.async_update_item(
                    item_id,
                    {
                        "res_type": "module",
                        "url": url,
                    },
                )
                return

    if hasattr(resources, "async_create_item"):
        await resources.async_create_item(
            {
                "res_type": "module",
                "url": url,
            }
        )
        _LOGGER.info("Registered Lovelace resource: %s", url)


class WeatherFlowVectorDataView(HomeAssistantView):
    """View to serve cached OSM vector data."""

    url = "/api/weatherflow_lightning/vector_data"
    name = "api:weatherflow_lightning:vector_data"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the view."""
        self.hass = hass

    async def get(self, request):
        """Handle GET request for vector data."""
        entry_id = request.query.get("entry_id")

        coordinator = None
        if entry_id:
            coordinator = self.hass.data[DOMAIN].get(entry_id)

        if not coordinator:
            for key, val in self.hass.data[DOMAIN].items():
                if key not in ("_infra_registered", "_shared_ws") and isinstance(
                    val, TempestStrikeCoordinator
                ):
                    coordinator = val
                    break

        if not coordinator:
            return self.json({"water": [], "forest": []})

        primary_coords = coordinator.station_coords.get(coordinator.primary_station)
        if not primary_coords:
            primary_coords = coordinator._get_station_coords(coordinator.primary_station)

        if not primary_coords:
            return self.json({"water": [], "forest": []})

        ref_lat, ref_lon = primary_coords

        safe_primary = str(coordinator.primary_station).replace(",", "_").replace(" ", "_")
        safe_coords = f"{ref_lat}_{ref_lon}".replace(".", "_")
        cache_filename = f"vector_cache_{safe_primary}_{safe_coords}.json"
        cache_path = self.hass.config.path(
            f"custom_components/weatherflow_lightning_trilateration/{cache_filename}"
        )
        if os.path.exists(cache_path):
            try:

                def _read_cache() -> dict:
                    with open(cache_path, "r", encoding="utf-8") as f:
                        return json.load(f)

                data = await request.app["hass"].async_add_executor_job(_read_cache)
                return self.json(data)
            except Exception as e:
                _LOGGER.error("Failed to read vector cache: %s", e)
        return self.json({"water": [], "forest": []})
