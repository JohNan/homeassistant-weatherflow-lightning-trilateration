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

## Frontend Build Artifact — NEVER Edit the JS Directly
- **Source of truth:** All Lovelace card logic lives in [`src/weatherflow-lightning-card.ts`](file:///workspace/tempest_trilateration/src/weatherflow-lightning-card.ts).
- **`dist/weatherflow-lightning-card.js` is a generated build artifact** produced by `npm run build` (esbuild). It carries a `/* AUTO-GENERATED */` banner at the top. **Never edit this file directly.** Any manual edits will be overwritten on the next build.
- **Workflow for all card changes:**
  1. Edit `src/weatherflow-lightning-card.ts`.
  2. Run `npm run build` from the repo root to regenerate the JS.
  3. Update the **cache buster** in `_async_register_lovelace_resource` inside `__init__.py`: set `url = f"{base_url}?v=<new-git-short-hash>"` to the new HEAD commit hash so browsers pick up the rebuilt JS.
  4. Commit the `.ts` source, the rebuilt `.js`, and the updated `__init__.py` together in the same commit.
- **Syntax Validation:** After building, verify with `node --check custom_components/weatherflow_lightning_trilateration/dist/weatherflow-lightning-card.js` before committing.
- **Geographic Terrain Alignment:** Ensure all visual elements (weather stations, concentric range rings, crosshair lines, strike targets, and heatmap indicators) sample the terrain altitude via `getTerrainHeight(x, z)` to prevent clipping or floating above the displaced 3D mesh.
- **WebGL Memory Management:** Dispose of materials and geometries properly (`material.dispose()`, `geometry.dispose()`) when transient or dynamic meshes/sprites (such as volumetric glows or heatmap points) are evicted from the scene to prevent memory leaks.
