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
- **Map Visualizations:** Places temporary geolocation markers representing strikes on the map, which automatically disappear after 6 hours.
- **Simulation/Testing Service:** Exposes a custom service to trigger simulated strikes anywhere, allowing end-to-end testing of map markers and dashboard animations.
- **3D Dashboard Card:** Includes a custom WebGL Lovelace dashboard card visualizing strikes, shockwaves, and expanding trilateration range intersection spheres in 3D.
- **Robust Connection Handling:** Automatically handles connection drops with exponential backoff retries.

---

## Project Structure

```text
.agents/
└── AGENTS.md            # Coding standards & architectural rules
.github/workflows/
├── hacs.yaml            # HACS repository validation
├── hassfest.yaml        # Home Assistant code structure validation
└── lint.yaml            # Code linting (Ruff/Black/Isort)
custom_components/weatherflow_lightning_trilateration/
├── __init__.py          # Life-cycle hooks, coordinator, and services
├── config_flow.py       # Integration setup flow UI logic & auto-discovery
├── const.py             # Centralized constant definitions
├── dist/
│   └── weatherflow-lightning-card.js   # 3D WebGL Lovelace Custom Card
├── geo_location.py      # GeolocationEvent entities for map plotting
├── manifest.json        # Integration manifest metadata
├── services.yaml        # Configuration fields for simulate_strike service
└── translations/
    └── en.json          # English translation strings for Setup UI
hacs.json                # HACS configuration properties
mise.toml                # Developer environment task orchestrator
```

---

## Installation & Setup

### Step 1: Install Integration via HACS
1. Open **HACS** in your Home Assistant instance.
2. Click the three dots in the top right corner and select **Custom repositories**.
3. Add the repository URL `https://github.com/JohNan/homeassistant-weatherflow-lightning-trilateration` under the **Integration** category.
4. Click **Download**.
5. Restart Home Assistant.

### Step 2: Configure Custom Lovelace Card (No Manual Files Needed!)
The 3D WebGL Lovelace card is automatically downloaded and served by the integration. To register it:
1. In the Home Assistant UI, navigate to **Settings > Dashboards**.
2. Click the three dots in the top right corner and select **Resources**.
3. Click **Add Resource** and enter:
   - **URL:** `/weatherflow_lightning_trilateration/weatherflow-lightning-card.js`
   - **Resource Type:** `JavaScript Module`

---

## Configuration

### Set Up Integration
1. Navigate to **Settings > Devices & Services**.
2. Click **Add Integration** and search for **WeatherFlow Lightning Trilateration**.
3. The Setup UI will search for any local weather stations:
   - If found, it will suggest the detected station ID as the **Primary Station**.
   - If none is configured, it will suggest the home coordinates from your Home Assistant configuration (`latitude,longitude`).
4. Enter the **Neighboring Stations** as a comma-separated list of Tempest device IDs (e.g. `1234, 5678`).
5. Click **Submit** to finalize the setup.

### Dashboard Setup
Add the custom card to your dashboard code editor:
```yaml
type: custom:weatherflow-lightning-card
height: 400px
```

---

## Testing & Visual Verification
To visually test the entire mapping and 3D animation stack without waiting for an actual storm:
1. Navigate to the **Developer Tools > Services** tab.
2. Select the service `weatherflow_lightning_trilateration.simulate_strike`.
3. (Optional) Provide target `latitude` and `longitude` values. If omitted, the system generates random coordinates nearby.
4. Click **Call Service**.
5. Check your Home Assistant map card to view the lightning strike marker, and open your custom Lovelace card to view the real-time 3D lightning flash and expanding trilateration ring intersection animation.

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
