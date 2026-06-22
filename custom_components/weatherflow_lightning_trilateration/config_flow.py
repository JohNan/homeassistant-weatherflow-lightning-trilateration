"""Config flow for WeatherFlow Lightning Trilateration integration."""
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.helpers import device_registry as dr

from .const import CONF_NEIGHBOR_STATIONS, CONF_PRIMARY_STATION, DOMAIN


class TempestTrilaterationConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for WeatherFlow Lightning Trilateration."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}
        if user_input is not None:
            primary = user_input.get(CONF_PRIMARY_STATION, "").strip()
            if not primary:
                errors[CONF_PRIMARY_STATION] = "empty_primary"
            else:
                return self.async_create_entry(
                    title=f"WeatherFlow Trilateration ({primary})",
                    data=user_input,
                )

        # Detect local station or fall back to HA coordinates
        detected_station = self._detect_local_station()
        if detected_station:
            default_primary = detected_station
        else:
            default_primary = (
                f"{self.hass.config.latitude},{self.hass.config.longitude}"
            )

        data_schema = vol.Schema(
            {
                vol.Required(CONF_PRIMARY_STATION, default=default_primary): str,
                vol.Optional(CONF_NEIGHBOR_STATIONS, default=""): str,
            }
        )

        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors
        )

    def _detect_local_station(self) -> str | None:
        """Detect local weather station/device ID from official integrations."""
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
                            return val_str

        # 2. Query Device Registry
        try:
            device_registry = dr.async_get(self.hass)
            for device_entry in device_registry.devices.values():
                for entry_id in device_entry.config_entries:
                    entry = self.hass.config_entries.async_get_entry(entry_id)
                    if entry and entry.domain in target_domains:
                        for identifier in device_entry.identifiers:
                            if (
                                len(identifier) == 2
                                and identifier[0] == entry.domain
                            ):
                                val = str(identifier[1])
                                if val.isdigit():
                                    return val
                                elif "-" in val:
                                    parts = val.split("-")
                                    if parts[-1].isdigit():
                                        return parts[-1]
        except Exception:
            pass

        return None
