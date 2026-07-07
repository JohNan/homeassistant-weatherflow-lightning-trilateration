# WeatherFlow Lightning Trilateration Coding Rules

This workspace represents a Home Assistant custom integration codebase. All agent operations should strictly adhere to the following project-scoped instructions:

## Code Layout & Project Structure
- All constants must be centralized in [const.py](file:///workspace/tempest_trilateration/custom_components/weatherflow_lightning_trilateration/const.py). Do not hardcode config keys, domain namespaces, or event identifiers inside implementation modules.
- Maintain localization strings inside [en.json](file:///workspace/tempest_trilateration/custom_components/weatherflow_lightning_trilateration/translations/en.json) for English. Never use placeholders in custom integration translations.

## Asynchronous Execution Best Practices
- Never execute blocking I/O calls (such as synchronous network requests, disk reads/writes, or heavy numeric calculations) directly on the main event thread. Always wrap blocking functions in `hass.async_add_executor_job` or execute them in a background worker task using `hass.async_create_background_task`.
- File system checks (e.g. `os.path.exists`, `os.path.getmtime`) and file reads/writes must be completely wrapped inside the executor function, not evaluated on the event loop thread before calling it.
- Prevent memory and loop timer leaks: always capture the cancel callback of `async_call_later` and unregister/cancel it upon entity removal (e.g., using `self.async_on_remove`).
- To prevent write contention and disk I/O bottlenecks during active storms, batch and throttle database/JSON caches using `store.async_delay_save` instead of triggering immediate synchronous `async_save` calls.
- Exclude large, high-frequency, or telemetry-heavy attributes (like elevation grids or station lists) from database history writes using `_unrecorded_attributes = frozenset({...})` to avoid SQLite recorder bloat.
- Define `_attr_should_poll = False` on all coordinator-driven push entities to eliminate redundant polling checks.
- Keep platform setup callbacks entry-scoped (bound via closures or direct entry contexts) rather than module-global tracking arrays (e.g. `_ADD_ENTITIES_CALLBACKS`), preventing duplicate entity registrations across multiple integration instances.

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
- **WebGL Memory Management:**
  - Dispose of materials and geometries properly (`material.dispose()`, `geometry.dispose()`) when transient or dynamic meshes/sprites (such as volumetric glows or heatmap points) are evicted from the scene to prevent memory leaks.
  - Separate texture memory cleanup: dynamic/canvas-backed textures must have their map explicitly cleared (`material.map.dispose()`) in addition to material disposal.
  - Prevent post-teardown execution errors: track all detached animation frames (e.g. `requestAnimationFrame` sequences) in a collection (`this._activeRafIds`) and call `cancelAnimationFrame` in `disconnectedCallback()` to avoid running callbacks against a torn-down scene.
  - Guard canvas context access: check that the 2D context exists (`if (!ctx)`) before performing operations to handle headless or restricted GPU sandboxes gracefully.
