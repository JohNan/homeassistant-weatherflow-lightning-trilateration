"""Constants for the WeatherFlow Lightning Trilateration integration."""

DOMAIN = "weatherflow_lightning_trilateration"
EVENT_STRIKE_CALCULATED = "weatherflow_strike_calculated"
WS_ENDPOINT = "wss://ws.weatherflow.com/swd/data"

CONF_PRIMARY_STATION = "primary_station"
CONF_NEIGHBOR_STATIONS = "neighbor_stations"
CONF_API_TOKEN = "api_token"
CONF_NAME = "name"
CONF_DISTANCE_FILTER = "distance_filter"

# Maximum acceptable per-station distance residual (km) for a trilateration
# result to be trusted. If the distance from the computed location back to any
# reporting station differs from that station's reported distance by more than
# this, the readings are mutually inconsistent (coarse/noisy data or fabricated
# coordinates) and the fix is discarded instead of being reported as "success".
MAX_TRILATERATION_RESIDUAL_KM = 5.0

# How long raw per-station strike observations are retained (seconds) so a
# backfill/replay can be run later. Defaults to 7 days.
RAW_STRIKE_RETENTION_SEC = 7 * 24 * 3600

# Storage key prefix for the persisted raw strike observations.
STORAGE_KEY_RAW_STRIKES = "weatherflow_lightning_trilateration.raw_strikes"
STORAGE_VERSION = 1

# Active strike marker lifetime (seconds); markers older than this are pruned.
STRIKE_MARKER_TTL_SEC = 21600
