"""Core initialization for WeatherFlow Lightning Trilateration integration."""

import asyncio
import json
import logging
import math
import os
import random
import ssl

import voluptuous as vol
import websockets
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_API_TOKEN,
    CONF_NEIGHBOR_STATIONS,
    CONF_PRIMARY_STATION,
    DOMAIN,
    EVENT_STRIKE_CALCULATED,
    WS_ENDPOINT,
)

_LOGGER = logging.getLogger(__name__)


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

        if latitude is None:
            latitude = hass.config.latitude + random.uniform(-0.15, 0.15)
        if longitude is None:
            longitude = hass.config.longitude + random.uniform(-0.15, 0.15)

        hass.bus.async_fire(
            EVENT_STRIKE_CALCULATED,
            {
                "latitude": float(latitude),
                "longitude": float(longitude),
            },
        )

    if not hass.services.has_service(DOMAIN, "simulate_strike"):
        hass.services.async_register(
            DOMAIN,
            "simulate_strike",
            async_simulate_strike,
            schema=vol.Schema(
                {
                    vol.Optional("latitude"): cv.latitude,
                    vol.Optional("longitude"): cv.longitude,
                }
            ),
        )

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

    _LOGGER.debug("Forwarding config entry setups to platforms: ['geo_location', 'sensor']")
    await hass.config_entries.async_forward_entry_setups(
        entry, ["geo_location", "sensor"]
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        entry, ["geo_location", "sensor"]
    )
    if unload_ok:
        coordinator = hass.data[DOMAIN].pop(entry.entry_id)
        await coordinator.async_stop()

        # Unregister service if there are no more active entries for DOMAIN
        if not hass.data[DOMAIN]:
            if hass.services.has_service(DOMAIN, "simulate_strike"):
                hass.services.async_remove(DOMAIN, "simulate_strike")
    return unload_ok


class TempestStrikeCoordinator:
    """Manages the WeatherFlow WebSocket connection and trilateration."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.entry = entry
        self.strike_buffer = {}
        self.station_coords = {}
        self.device_to_station = {}

        self.primary_station = str(entry.data.get(CONF_PRIMARY_STATION, "")).strip()
        neighbor_raw = str(entry.data.get(CONF_NEIGHBOR_STATIONS, ""))
        self.neighbor_stations = [
            s.strip() for s in neighbor_raw.split(",") if s.strip()
        ]
        self.api_token = str(entry.data.get(CONF_API_TOKEN, "")).strip()
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
            _LOGGER.warning(
                "Error querying device registry for WeatherFlow stations: %s", e
            )

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

    async def _async_resolve_stations_metadata(self) -> None:
        """Resolve device IDs and coordinates for all configured and discovered stations."""
        session = async_get_clientsession(self.hass)
        _LOGGER.debug(
            "Starting station metadata resolution. Configured stations/IDs: %s",
            self.all_stations,
        )

        # 1. If we have a token, fetch the user's own stations and devices list first.
        # This allows us to map device IDs/serial numbers (like 00172794) to their correct station IDs.
        if self.api_token:
            user_stations_url = "https://swd.weatherflow.com/swd/rest/stations"
            params = {"token": self.api_token}
            _LOGGER.debug("Fetching user stations list from REST API via URL: %s", user_stations_url)
            try:
                async with session.get(
                    user_stations_url, params=params, timeout=10
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        _LOGGER.debug("User stations list response: %s", data)
                        stations = data.get("stations", [])
                        for station in stations:
                            station_id = str(station.get("station_id", ""))
                            lat = station.get("latitude")
                            lon = station.get("longitude")
                            if lat is not None and lon is not None:
                                self.station_coords[station_id] = (
                                    float(lat),
                                    float(lon),
                                )

                            devices = station.get("devices", [])
                            for device in devices:
                                dev_id = str(device.get("device_id", ""))
                                serial = str(device.get("serial_number", ""))
                                if dev_id and dev_id.isdigit():
                                    self.device_to_station[dev_id] = station_id
                                    _LOGGER.debug(
                                        "Mapped user device_id %s (serial %s) to station_id %s",
                                        dev_id,
                                        serial,
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
        _LOGGER.debug("Resolving remaining station metadata from public REST API. Active stations list: %s", self.all_stations)
        if not self.api_token:
            # Fallback mapping: assume device_id is station_id
            for station in self.all_stations:
                if "," not in station and station.strip().isdigit():
                    self.device_to_station[station] = station
            return

        for station_id in list(self.all_stations):
            if "," in station_id or not station_id.strip().isdigit():
                continue

            # If we already have the coordinates and devices resolved for this station, skip querying
            if station_id in self.station_coords and any(
                sid == station_id for sid in self.device_to_station.values()
            ):
                _LOGGER.debug("Station %s is already resolved (coords: %s). Skipping query.", station_id, self.station_coords[station_id])
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
                            if lat is not None and lon is not None:
                                self.station_coords[station_id] = (
                                    float(lat),
                                    float(lon),
                                )

                            devices = station.get("devices", [])
                            for device in devices:
                                dev_id = str(device.get("device_id", ""))
                                dev_type = device.get("device_type")
                                if dev_id and dev_id.isdigit():
                                    self.device_to_station[dev_id] = station_id
                                    _LOGGER.debug(
                                        "Mapped device %s (%s) to station %s",
                                        dev_id,
                                        dev_type,
                                        station_id,
                                    )
                    else:
                        # Log 404 as info since it could be an unresolved device ID or serial number
                        log_level = (
                            logging.INFO if response.status == 404 else logging.WARNING
                        )
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
        # Discover nearby public stations first
        try:
            nearby_stations = await self._async_detect_nearby_public_stations()
            for station in nearby_stations:
                if station not in self.all_stations:
                    self.all_stations.append(station)
                    _LOGGER.info(
                        "Added nearby public station %s to calculations", station
                    )
        except Exception as e:
            _LOGGER.exception("Failed to discover nearby public stations: %s", e)

        # Resolve devices and coordinates for all stations
        try:
            await self._async_resolve_stations_metadata()
        except Exception as e:
            _LOGGER.exception("Failed to resolve station metadata: %s", e)

        # Create SSL context in executor to avoid blocking call in event loop
        try:
            ssl_context = await self.hass.async_add_executor_job(
                ssl.create_default_context
            )
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
                    "Connecting to Tempest WebSocket: %s",
                    ws_url.replace(self.api_token, "***") if self.api_token else ws_url,
                )
                async with websockets.connect(ws_url, ssl=ssl_context) as websocket:
                    retry_delay = 5
                    for device_id in self.device_to_station.keys():
                        # Skip subscription if it's a coordinate string or not numeric
                        if not device_id.strip().isdigit():
                            continue

                        sub_msg = {
                            "type": "listen_start",
                            "device_id": int(device_id),
                            "id": f"sub_{device_id}",
                        }
                        await websocket.send(json.dumps(sub_msg))
                        _LOGGER.debug("Subscribed to device: %s", device_id)

                    _LOGGER.info("Tempest WebSocket connection established successfully")
                    async for message in websocket:
                        try:
                            _LOGGER.debug("WebSocket message received: %s", message)
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

    def _process_incoming_message(self, message_data: dict) -> None:
        """Process an incoming WebSocket message."""
        msg_type = message_data.get("type")
        _LOGGER.debug("Processing WebSocket message of type: %s", msg_type)
        if msg_type != "evt_strike":
            return

        device_id = str(message_data.get("device_id"))
        evt = message_data.get("evt", [])
        if len(evt) < 2:
            _LOGGER.debug("Skipping strike event with incomplete payload")
            return

        timestamp = int(evt[0])
        distance = float(evt[1])
        _LOGGER.debug("Parsed strike event: device_id=%s, timestamp=%d, distance=%f", device_id, timestamp, distance)

        # Map device_id to station_id
        station_id = self.device_to_station.get(device_id, device_id)
        _LOGGER.debug("Mapped device_id %s to station_id %s", device_id, station_id)

        # Find or create a group bucket matching timestamp within a 1-second variance tolerance
        matched_timestamp = None
        for bucket_ts in list(self.strike_buffer.keys()):
            if abs(bucket_ts - timestamp) <= 1:
                matched_timestamp = bucket_ts
                break

        if matched_timestamp is None:
            matched_timestamp = timestamp
            self.strike_buffer[matched_timestamp] = {}
            _LOGGER.debug("Created new strike buffer bucket for timestamp %d", matched_timestamp)

        self.strike_buffer[matched_timestamp][station_id] = distance
        bucket = self.strike_buffer[matched_timestamp]
        _LOGGER.debug("Current strike buffer status for bucket %d: %s", matched_timestamp, bucket)

        # Check if the bucket has at least 3 unique station reports
        if len(bucket) >= 3:
            strike_events = []
            for dev_id, dist in list(bucket.items()):
                coords = self._get_station_coords(dev_id)
                if coords:
                    strike_events.append((coords[0], coords[1], dist))

            _LOGGER.debug("Clearing bucket %d from buffer and invoking trilateration calculations", matched_timestamp)
            # Evict from buffer to prevent reprocessing
            del self.strike_buffer[matched_timestamp]

            if len(strike_events) >= 3:
                _LOGGER.debug("Invoking trilateration with coordinates/distances: %s", strike_events)
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
    url = f"{base_url}?v=2.0.0"

    existing_item = None
    if hasattr(resources, "async_items"):
        for item in resources.async_items():
            item_url = (
                item.get("url")
                if isinstance(item, dict)
                else getattr(item, "url", None)
            )
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
