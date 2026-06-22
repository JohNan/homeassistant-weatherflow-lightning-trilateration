# WeatherFlow Lightning Trilateration Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![Hassfest](https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration/actions/workflows/hassfest.yaml/badge.svg)](https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration/actions/workflows/hassfest.yaml)
[![HACS Validation](https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration/actions/workflows/hacs.yaml/badge.svg)](https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration/actions/workflows/hacs.yaml)
[![Linting](https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration/actions/workflows/lint.yaml/badge.svg)](https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration/actions/workflows/lint.yaml)

A native Home Assistant custom integration that connects to the WeatherFlow Tempest WebSocket API, listens for lightning strikes across multiple weather stations, and trilaterates the geographic strike location in real time. Calculated strikes are plotted directly on the Home Assistant map.

---

## Features
- **WebSocket Listener:** Connects directly to the official WeatherFlow WebSocket stream.
- **Auto-Discovery:** Automatically detects configured local weather station IDs from existing official/third-party WeatherFlow integrations.
- **Trilateration Engine:** Employs a flat-plane Cramer's rule approximation to dynamically calculate the intersection of lightning strike distances from 3 or more stations.
- **Map Visualizations:** Places temporary geolocation markers representing strikes on the map, which automatically disappear after 15 minutes.
- **Robust Connection Handling:** Automatically handles connection drops with exponential backoff retries.

---

## Project Structure

```text
custom_components/weatherflow_lightning_trilateration/
├── __init__.py          # Life-cycle hooks & WebSockets connection coordinator
├── config_flow.py       # Integration setup flow UI logic & auto-discovery
├── const.py             # Centralized constant definitions
├── geo_location.py      # GeolocationEvent entities for map plotting
├── manifest.json        # Integration manifest metadata
└── translations/
    └── en.json          # English translation strings for Setup UI
```

---

## Installation

### Method 1: HACS (Recommended)
1. Open **HACS** in your Home Assistant instance.
2. Click the three dots in the top right corner and select **Custom repositories**.
3. Add the repository URL `https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration` under the **Integration** category.
4. Click **Download**.
5. Restart Home Assistant.

### Method 2: Manual
1. Copy the `custom_components/weatherflow_lightning_trilateration` directory to your Home Assistant configuration directory.
2. Restart Home Assistant.

---

## Configuration
1. Navigate to **Settings > Devices & Services**.
2. Click **Add Integration** and search for **WeatherFlow Lightning Trilateration**.
3. The Setup UI will search for any local weather stations:
   - If found, it will suggest the detected station ID as the **Primary Station**.
   - If none is configured, it will suggest the home coordinates from your Home Assistant configuration (`latitude,longitude`).
4. Enter the **Neighboring Stations** as a comma-separated list of Tempest device IDs (e.g. `1234, 5678`).
5. Click **Submit** to finalize the setup.

---

## Mathematical Design
The trilateration algorithm projects spherical geodetic coordinates to a local Cartesian plane relative to the primary station coordinates (using an Equirectangular projection). Given three non-collinear stations $S_i$ with known coordinates $(x_i, y_i)$ and strike distances $d_i$:

1. Formulates the equations of intersection:
   $$(x - x_i)^2 + (y - y_i)^2 = d_i^2$$
2. Subtracts equation 2 from 1, and 3 from 2 to linearize the system:
   $$Ax + By = C$$
   $$Dx + Ey = F$$
3. Solves for $(x, y)$ analytically using Cramer's rule:
   $$\text{det} = AE - BD$$
   $$x = \frac{CE - BF}{\text{det}}, \quad y = \frac{AF - CD}{\text{det}}$$
4. Transforms $(x, y)$ back to latitude and longitude, firing the `weatherflow_strike_calculated` event.
