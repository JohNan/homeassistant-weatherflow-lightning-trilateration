"""Config flow for WeatherFlow Lightning Trilateration integration."""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_API_TOKEN,
    CONF_DISTANCE_FILTER,
    CONF_NAME,
    CONF_NEIGHBOR_STATIONS,
    CONF_PRIMARY_STATION,
    DOMAIN,
)


class TempestTrilaterationConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for WeatherFlow Lightning Trilateration."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return TempestTrilaterationOptionsFlowHandler(config_entry)

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        detected_station = self._detect_local_station()
        default_token = self._detect_local_token()

        if user_input is not None:
            primary = user_input.get(CONF_PRIMARY_STATION, "").strip()
            token = user_input.get(CONF_API_TOKEN, "").strip()

            # Resolve if it looks like a serial number/device ID (more than 6 digits)
            if primary.isdigit() and len(primary) > 6:
                if token:
                    resolved = await self._async_resolve_serial_to_station(primary, token)
                    if resolved:
                        user_input[CONF_PRIMARY_STATION] = resolved
                        primary = resolved
                    else:
                        errors[CONF_PRIMARY_STATION] = "invalid_station_id"
                else:
                    errors[CONF_PRIMARY_STATION] = "invalid_station_id"

            if not primary:
                errors[CONF_PRIMARY_STATION] = "empty_primary"

            if not errors:
                return self.async_create_entry(
                    title=user_input[CONF_NAME],
                    data=user_input,
                )

        # Pre-resolve detected station ID if it's a serial number and we have a token
        default_primary = ""
        if detected_station:
            if detected_station.isdigit() and len(detected_station) > 6 and default_token:
                resolved = await self._async_resolve_serial_to_station(
                    detected_station, default_token
                )
                default_primary = resolved or detected_station
            else:
                default_primary = detected_station
        else:
            default_primary = f"{self.hass.config.latitude},{self.hass.config.longitude}"

        data_schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default="My Location"): str,
                vol.Required(CONF_PRIMARY_STATION, default=default_primary): str,
                vol.Optional(CONF_NEIGHBOR_STATIONS, default=""): str,
                vol.Optional(CONF_API_TOKEN, default=default_token): str,
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "local_station_id": default_primary or "172103",
            },
        )

    def _detect_local_station(self) -> str | None:
        """Detect local weather station ID from official integrations."""
        target_domains = {
            "weatherflow",
            "weatherflow_cloud",
            "weatherflow_forecast",
            "weatherflow_udp",
        }

        # 1. Query Config Entries
        for domain in target_domains:
            for entry in self.hass.config_entries.async_entries(domain):
                for key in ("station_id", "station"):
                    val = entry.data.get(key) or entry.options.get(key)
                    if val:
                        val_str = str(val).strip()
                        if val_str.isdigit() and len(val_str) <= 6 and not val_str.startswith("0"):
                            return val_str

        return None

    def _detect_local_token(self) -> str:
        """Detect local API token from official integrations."""
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
                            return val_str
        return ""

    async def _async_resolve_serial_to_station(self, serial: str, token: str) -> str | None:
        """Resolve a device serial number (e.g., 00172794) to a station ID via WeatherFlow API."""
        url = "https://swd.weatherflow.com/swd/rest/stations"
        params = {"token": token}

        try:
            session = async_get_clientsession(self.hass)
            async with session.get(url, params=params, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    stations = data.get("stations", [])
                    for station in stations:
                        station_id = str(station.get("station_id", ""))
                        devices = station.get("devices", [])
                        for device in devices:
                            dev_serial = str(device.get("serial_number", ""))
                            if serial in dev_serial or dev_serial in serial:
                                return station_id
        except Exception:
            pass

        return None


class TempestTrilaterationOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for the WeatherFlow Lightning Trilateration integration."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        options = self.config_entry.options
        data = self.config_entry.data

        current_neighbor_stations = options.get(
            CONF_NEIGHBOR_STATIONS, data.get(CONF_NEIGHBOR_STATIONS, "")
        )
        current_api_token = options.get(CONF_API_TOKEN, data.get(CONF_API_TOKEN, ""))
        current_distance_filter = options.get(CONF_DISTANCE_FILTER, 100.0)

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_NEIGHBOR_STATIONS, default=current_neighbor_stations
                ): str,
                vol.Optional(CONF_API_TOKEN, default=current_api_token): str,
                vol.Optional(
                    CONF_DISTANCE_FILTER, default=current_distance_filter
                ): vol.Coerce(float),
            }
        )

        return self.async_show_form(step_id="init", data_schema=data_schema)

