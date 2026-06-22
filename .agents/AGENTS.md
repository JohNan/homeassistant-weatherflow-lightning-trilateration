# WeatherFlow Lightning Trilateration Coding Rules

This workspace represents a Home Assistant custom integration codebase. All agent operations should strictly adhere to the following project-scoped instructions:

## Code Layout & Project Structure
- All constants must be centralized in [const.py](file:///workspace/tempest_trilateration/custom_components/weatherflow_lightning_trilateration/const.py). Do not hardcode config keys, domain namespaces, or event identifiers inside implementation modules.
- Maintain localization strings inside [en.json](file:///workspace/tempest_trilateration/custom_components/weatherflow_lightning_trilateration/translations/en.json) for English. Never use placeholders in custom integration translations.

## Asynchronous Execution Best Practices
- Never execute blocking I/O calls (such as synchronous network requests, disk reads/writes, or heavy numeric calculations) directly on the main event thread. Always wrap blocking functions in `hass.async_add_executor_job` or execute them in a background worker task using `hass.async_create_background_task`.
- Schedule temporary entity removals or delays using the Home Assistant event loop helper `async_call_later` from `homeassistant.helpers.event`.

## Linting and Code Styling
- Organize all import modules alphabetically and group them according to PEP 8 / isort specifications:
  1. Standard library imports.
  2. Third-party imports (voluptuous, websockets, homeassistant core helper imports).
  3. Local integration-relative imports.
- Format python script contents strictly using standard formatting specs (pep8/black style). Double-quote all strings unless escaping is avoided.
