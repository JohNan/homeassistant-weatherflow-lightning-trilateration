#!/usr/bin/env python3
"""Standalone test script for WeatherFlow Tempest WebSocket integration.

Allows monitoring real-time telemetry from specified stations or simulating
strike events to test trilateration calculations.
"""

import argparse
import asyncio
import json
import logging
import math
import sys

import websockets

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
_LOGGER = logging.getLogger(__name__)

# Constants
DEFAULT_TOKEN = "cf963a54-46f1-4ef6-bcf6-e96eed0d5138"
WS_ENDPOINT = "wss://ws.weatherflow.com/swd/data"

# Station mappings
STATIONS = {
    "125048": {
        "name": "Furuboda",
        "device_id": 309874,
        "latitude": 55.82497,
        "longitude": 14.20466,
    },
    "79812": {
        "name": "Havrevägen",
        "device_id": 211650,
        "latitude": 55.66647,
        "longitude": 13.36595,
    },
    "39429": {
        "name": "UTSÄTTER",
        "device_id": 118792,
        "latitude": 58.55573,
        "longitude": 16.81518,
    },
}


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two coordinates in km."""
    r = 6371.0
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def trilaterate(stations_data: list[tuple[float, float, float]]) -> tuple[float, float]:
    """Execute trilateration calculation for given stations and distances.

    Each tuple in stations_data contains: (latitude, longitude, distance_in_km)
    """
    _LOGGER.info("Executing trilateration on data: %s", stations_data)
    # Simple centroid fallback for demo / testing
    if len(stations_data) < 3:
        _LOGGER.warning("Trilateration requires at least 3 stations. Returning centroid fallback.")
        avg_lat = sum(s[0] for s in stations_data) / len(stations_data)
        avg_lon = sum(s[1] for s in stations_data) / len(stations_data)
        return avg_lat, avg_lon

    # Least squares optimization (simplified implementation)
    ref_lat = stations_data[0][0]
    ref_lon = stations_data[0][1]

    # Convert coordinates to local grid offsets (km)
    points = []
    for lat, lon, dist in stations_data:
        dy = (lat - ref_lat) * 111.1
        dx = (lon - ref_lon) * 111.1 * math.cos(math.radians(ref_lat))
        points.append((dx, dy, dist))

    # Grid search optimization around the centroid
    best_x, best_y = 0.0, 0.0
    min_error = float("inf")

    # Coarse to fine search grid
    for step in [1.0, 0.1, 0.01, 0.001]:
        for x_offset in range(-100, 101):
            for y_offset in range(-100, 101):
                tx = best_x + x_offset * step
                ty = best_y + y_offset * step
                error = sum(
                    (math.sqrt((tx - px) ** 2 + (ty - py) ** 2) - d) ** 2 for px, py, d in points
                )
                if error < min_error:
                    min_error = error
                    best_x = tx
                    best_y = ty

    final_lat = ref_lat + (best_y / 111.1)
    final_lon = ref_lon + (best_x / (111.1 * math.cos(math.radians(ref_lat))))
    return final_lat, final_lon


async def run_monitor(token: str):
    """Establish connection and monitor real-time WebSocket events."""
    ws_url = f"{WS_ENDPOINT}?token={token}"
    _LOGGER.info("Connecting to Tempest WebSocket endpoint...")

    try:
        async with websockets.connect(ws_url) as websocket:
            _LOGGER.info("WebSocket connection established successfully.")

            # Subscribe to the target devices
            for station_id, info in STATIONS.items():
                dev_id = info["device_id"]
                sub_msg = {
                    "type": "listen_start",
                    "device_id": dev_id,
                    "id": f"sub_{dev_id}",
                }
                await websocket.send(json.dumps(sub_msg))
                _LOGGER.info(
                    "Subscribed to %s (Device: %s, Station: %s)", info["name"], dev_id, station_id
                )

            _LOGGER.info("Monitoring stream. Press Ctrl+C to terminate.")
            async for message in websocket:
                data = json.loads(message)
                msg_type = data.get("type")

                if msg_type == "evt_strike":
                    evt = data.get("evt", [])
                    ts, dist = evt[0], evt[1]
                    _LOGGER.info(
                        "⚡ LIGHTNING STRIKE DETECTED - Device: %s, Time: %d, Distance: %f km",
                        data.get("device_id"),
                        ts,
                        dist,
                    )
                elif msg_type == "obs_st":
                    summary = data.get("summary", {})
                    _LOGGER.info(
                        "📊 Observation Update - Device: %s, Temperature: %s°C, Wind: %s m/s, Dewpoint: %s°C, "
                        "Lightning: [1h count: %s, last dist: %s km, last epoch: %s]",
                        data.get("device_id"),
                        data.get("obs", [[None] * 8])[0][7],
                        data.get("obs", [[None] * 3])[0][2],
                        summary.get("dew_point"),
                        summary.get("strike_count_1h"),
                        summary.get("strike_last_dist"),
                        summary.get("strike_last_epoch"),
                    )
                elif msg_type == "ack":
                    _LOGGER.info("Server Acknowledged subscription: %s", data.get("id"))
                else:
                    _LOGGER.debug("Received message: %s", message)

    except asyncio.CancelledError:
        _LOGGER.info("Monitoring task terminated.")
    except Exception as e:
        _LOGGER.error("WebSocket exception encountered: %s", e)


def run_simulation():
    """Simulate a lightning strike and calculate the trilateration coordinate."""
    _LOGGER.info("Initializing lightning strike simulation...")

    # Simulated target strike location
    target_lat = 55.75000
    target_lon = 13.80000
    _LOGGER.info(
        "Simulated Strike Location Target: Latitude %f, Longitude %f", target_lat, target_lon
    )

    # Calculate distances from each station
    strike_events = []
    for station_id, info in STATIONS.items():
        dist = calculate_distance(info["latitude"], info["longitude"], target_lat, target_lon)
        _LOGGER.info(
            "Station %s (%s) registers strike at distance: %.2f km",
            station_id,
            info["name"],
            dist,
        )
        strike_events.append((info["latitude"], info["longitude"], dist))

    # Add a mock third station to perform correct mathematical trilateration
    mock_third_station = {
        "name": "Mock Station C",
        "latitude": 55.90000,
        "longitude": 13.50000,
    }
    dist_c = calculate_distance(
        mock_third_station["latitude"],
        mock_third_station["longitude"],
        target_lat,
        target_lon,
    )
    _LOGGER.info("Mock Station C registers strike at distance: %.2f km", dist_c)
    strike_events.append((mock_third_station["latitude"], mock_third_station["longitude"], dist_c))

    # Execute trilateration calculation
    calc_lat, calc_lon = trilaterate(strike_events)
    _LOGGER.info(
        "Trilaterated Location: Latitude %f, Longitude %f (Error: %.4f km)",
        calc_lat,
        calc_lon,
        calculate_distance(target_lat, target_lon, calc_lat, calc_lon),
    )


def main():
    """Application entry point."""
    parser = argparse.ArgumentParser(description="WeatherFlow Tempest integration test tool.")
    parser.add_argument(
        "--mode",
        choices=["monitor", "simulate"],
        default="monitor",
        help="Execution mode: monitor (WebSocket listener) or simulate (trilateration test).",
    )
    parser.add_argument(
        "--token",
        default=DEFAULT_TOKEN,
        help="WeatherFlow developer token for WebSocket monitoring.",
    )

    args = parser.parse_args()

    if args.mode == "monitor":
        try:
            asyncio.run(run_monitor(args.token))
        except KeyboardInterrupt:
            _LOGGER.info("Execution interrupted by user.")
    elif args.mode == "simulate":
        run_simulation()


if __name__ == "__main__":
    main()
