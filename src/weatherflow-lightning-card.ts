declare global {
  interface Window {
    THREE: any;
    customCards: any[];
  }
}

declare const THREE: any;

class WeatherFlowLightningCard extends HTMLElement {
  [key: string]: any;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.initialized = false;
    this.knownStrikes = new Set();
    this.stations = [
      { id: 'Primary (Home)', x: 0, z: 0, color: 0x10b981 },
      { id: 'Neighbor 1', x: 10, z: 10, color: 0x38bdf8 },
      { id: 'Neighbor 2', x: -10, z: 10, color: 0x38bdf8 }
    ];
    this.domeRings = [];
    this.strikeLayer = null;
    this.strikeHistory = [];
    this.isPlaying = false;
    this.playbackMode = 'live';
    this.playbackTime = Date.now();
    this.playbackSpeed = 120; // 120x speed playback
    this.lastTickTime = Date.now();
    this.lastPlayTickTime = Date.now();
    this.lastInteractionTime = Date.now();
    this.heatmapMeshes = new Map();
    this.elevationGrid = [];
    this.glowTexture = null;
    this.heatGeo = null;
    this.lastRefLat = null;
    this.lastRefLon = null;
    this.windSpeed = 0.0;
    this.windDirection = 0.0;
    this.solarRadiation = 1000.0;
    this.rainRate = 0.0;
    this.rainParticles = null;
    this.windParticles = null;
    this.lastFrameTime = null;
  }

  static getConfigElement() {
    return document.createElement('weatherflow-lightning-card-editor');
  }

  static getStubConfig() {
    return {
      height: '350px'
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    const oldConfig = this.config;
    this.config = {
      height: '350px',
      show_grid: true,
      show_map: true,
      show_rings: true,
      show_heatmap: true,
      auto_orbit: true,
      zoom_level: 18.0,
      show_weather: true,
      show_daynight: true,
      min_brightness: 0.8,
      elevation_scale: 1.5,
      show_3d_features: false,
      playback_speed: 120,
      ...config
    };
    this.playbackSpeed = parseFloat(this.config.playback_speed) || 120;
    if (this.speedSelect) {
      this.speedSelect.value = this.playbackSpeed.toString();
    }
    if (this.container) {
      const height = this.config.height;
      if (height.endsWith('px')) {
        const val = parseInt(height);
        this.container.style.height = `${val - 40}px`;
      } else {
        this.container.style.height = height;
      }
    }
    if (this.initialized) {
      this.applyConfigChanges(oldConfig || {});
    }
  }

  applyConfigChanges(oldConfig) {
    if (this.terrainWire) {
      this.terrainWire.visible = this.config.show_grid !== false;
    }
    if (this.rangeRingsGroup) {
      this.rangeRingsGroup.visible = this.config.show_rings !== false;
    }
    if (this.config.show_weather === false) {
      if (this.rainParticles) this.rainParticles.visible = false;
      if (this.windParticles) this.windParticles.visible = false;
      if (this.weatherOverlay) this.weatherOverlay.style.display = 'none';
    } else {
      if (this.weatherOverlay) this.weatherOverlay.style.display = 'flex';
    }

    if (oldConfig.show_map !== this.config.show_map) {
      if (this.config.show_map) {
        if (this.lastRefLat && this.lastRefLon) {
          this.loadMapTexture(this.lastRefLat, this.lastRefLon);
        }
      } else {
        if (this.terrainMesh && this.terrainMesh.material) {
          this.terrainMesh.material.map = null;
          this.terrainMesh.material.color.setHex(0x050b14);
          this.terrainMesh.material.needsUpdate = true;
        }
      }
    }

    if (
      oldConfig.show_daynight !== this.config.show_daynight ||
      oldConfig.min_brightness !== this.config.min_brightness
    ) {
      this.updateDayNightEngine();
    }

    if (oldConfig.zoom_level !== this.config.zoom_level) {
      const parsed = parseFloat(this.config.zoom_level);
      if (!isNaN(parsed)) {
        this.zoomRadius = parsed;
        this.updateCameraPosition();
      }
    }

    if (oldConfig.elevation_scale !== this.config.elevation_scale) {
      if (this.elevationGrid && this.elevationGrid.length === 225) {
        this.updateTerrainGeometry(this.elevationGrid);
      } else {
        this.generateProceduralTerrain();
      }
    }

    if (oldConfig.show_3d_features !== this.config.show_3d_features) {
      if (this.config.show_3d_features) {
        if (this.lastRefLat && this.lastRefLon) {
          this.loadVectorData(this.lastRefLat, this.lastRefLon);
        }
      } else {
        if (this.features3DGroup) {
          this.scene.remove(this.features3DGroup);
          this.features3DGroup = null;
        }
        this.vectorDataLoaded = false;
      }
    }
  }

  connectedCallback() {
    if (window.THREE) {
      this.initVisualizer();
    } else {
      const script = document.createElement('script');
      script.src = '/weatherflow_lightning_trilateration/three.min.js';
      script.onload = () => this.initVisualizer();
      document.head.appendChild(script);
    }
  }

  disconnectedCallback() {
    this.cleanupThreeJS();
  }

  cleanupThreeJS() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this._mouseupHandler) {
      window.removeEventListener('mouseup', this._mouseupHandler);
      this._mouseupHandler = null;
    }

    // Dispose 3D Vector Features Group
    if (this.features3DGroup) {
      this.scene.remove(this.features3DGroup);
      this.disposeHierarchy(this.features3DGroup);
      this.features3DGroup = null;
    }

    // Dispose Station Meshes
    if (this.stationMeshes) {
      this.stationMeshes.forEach((sm) => {
        this.scene.remove(sm.mesh);
        this.disposeHierarchy(sm.mesh);
      });
      this.stationMeshes = [];
    }

    // Dispose Heatmap Meshes
    if (this.heatmapMeshes) {
      for (const hm of this.heatmapMeshes.values()) {
        this.scene.remove(hm.mesh);
        if (hm.material) hm.material.dispose();
      }
      this.heatmapMeshes.clear();
    }

    // Dispose Range Rings Group
    if (this.rangeRingsGroup) {
      this.scene.remove(this.rangeRingsGroup);
      this.disposeHierarchy(this.rangeRingsGroup);
      this.rangeRingsGroup = null;
    }

    // Dispose Strike Layer (fixes WebGL memory leak)
    if (this.strikeLayer) {
      this.scene.remove(this.strikeLayer);
      this.disposeHierarchy(this.strikeLayer);
      this.strikeLayer = null;
    }

    // Dispose Static Elements
    if (this.terrainMapMesh) {
      this.scene.remove(this.terrainMapMesh);
      if (this.terrainMapMesh.geometry) this.terrainMapMesh.geometry.dispose();
      if (this.terrainMapMesh.material) {
        if (this.terrainMapMesh.material.map) this.terrainMapMesh.material.map.dispose();
        this.terrainMapMesh.material.dispose();
      }
    }
    if (this.terrainMesh) {
      this.scene.remove(this.terrainMesh);
      if (this.terrainMesh.geometry) this.terrainMesh.geometry.dispose();
      if (this.terrainMesh.material) this.terrainMesh.material.dispose();
    }
    if (this.terrainWire) {
      this.scene.remove(this.terrainWire);
      if (this.terrainWire.geometry) this.terrainWire.geometry.dispose();
      if (this.terrainWire.material) this.terrainWire.material.dispose();
    }
    if (this.starField) {
      this.scene.remove(this.starField);
      if (this.starField.geometry) this.starField.geometry.dispose();
      if (this.starField.material) this.starField.material.dispose();
    }
    if (this.rainParticles) {
      this.scene.remove(this.rainParticles);
      if (this.rainParticles.geometry) this.rainParticles.geometry.dispose();
      if (this.rainParticles.material) this.rainParticles.material.dispose();
    }
    if (this.windParticles) {
      this.scene.remove(this.windParticles);
      if (this.windParticles.geometry) this.windParticles.geometry.dispose();
      if (this.windParticles.material) this.windParticles.material.dispose();
    }

    // Shared geometries/textures
    if (this.heatGeo) this.heatGeo.dispose();
    if (this.glowTexture) this.glowTexture.dispose();

    // Lights
    if (this.ambientLight) this.scene.remove(this.ambientLight);
    if (this.dirLight) this.scene.remove(this.dirLight);

    // Renderer
    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
      this.wrapper = null;
    }

    this.initialized = false;
  }

  disposeHierarchy(obj) {
    if (!obj) return;
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  updateCameraPosition() {
    this.cameraPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.cameraPhi));
    this.zoomRadius = Math.max(2.0, Math.min(150, this.zoomRadius));

    if (!this.cameraTarget) {
      this.cameraTarget = new THREE.Vector3(0, 0, 0);
    }

    const x = this.zoomRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.zoomRadius * Math.cos(this.cameraPhi);
    const z = this.zoomRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    if (this.camera) {
      this.camera.position.set(this.cameraTarget.x + x, this.cameraTarget.y + y, this.cameraTarget.z + z);
      this.camera.lookAt(this.cameraTarget);
    }
  }

  initVisualizer() {
    if (this.initialized) return;
    this.initialized = true;

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.style.position = 'relative';
    this.wrapper.style.width = '100%';
    this.wrapper.style.display = 'flex';
    this.wrapper.style.flexDirection = 'column';
    this.wrapper.style.backgroundColor = '#02040a';
    this.wrapper.style.borderRadius = '12px';
    this.wrapper.style.overflow = 'hidden';
    this.wrapper.style.border = '1px solid rgba(56, 189, 248, 0.15)';
    this.shadowRoot.appendChild(this.wrapper);

    // Create container
    this.container = document.createElement('div');
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    const height = this.config.height || '350px';
    if (height.endsWith('px')) {
      const val = parseInt(height);
      this.container.style.height = `${val - 40}px`;
    } else {
      this.container.style.height = height;
    }
    this.container.style.overflow = 'hidden';
    this.container.style.cursor = 'grab';
    this.container.style.userSelect = 'none';
    this.container.style.webkitUserSelect = 'none';
    this.container.style.touchAction = 'none';
    this.wrapper.appendChild(this.container);

    this.createPlaybackControls();

    // Three.js setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.005);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);

    // Custom camera controls setup
    this.zoomRadius = this.config.zoom_level !== undefined ? parseFloat(this.config.zoom_level) : 18.0;
    this.cameraTheta = 0.0;
    // [E] 45° oblique angle — terrain relief reads clearly against the horizon
    this.cameraPhi = Math.PI / 4;
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x02040a, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    // [3] ACES filmic tone mapping — prevents blown-out glow/lightning whites
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // Tooltip DOM element creation
    this.tooltip = document.createElement('div');
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.backgroundColor = 'rgba(8, 12, 20, 0.95)';
    this.tooltip.style.color = '#e2e8f0';
    this.tooltip.style.padding = '8px 12px';
    this.tooltip.style.borderRadius = '6px';
    this.tooltip.style.border = '1px solid rgba(56, 189, 248, 0.4)';
    this.tooltip.style.fontSize = '12px';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.display = 'none';
    this.tooltip.style.zIndex = '10';
    this.tooltip.style.fontFamily = 'sans-serif';
    this.tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
    this.container.appendChild(this.tooltip);

    // Weather Telemetry HUD creation
    const hudStyle = document.createElement('style');
    hudStyle.textContent = `
      .weather-telemetry-hud {
        position: absolute;
        top: 16px;
        left: 16px;
        background-color: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 5;
        color: #e2e8f0;
        font-family: var(--paper-font-body1_-_font-family, sans-serif);
        pointer-events: auto;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .weather-telemetry-hud.collapsed {
        padding: 8px;
        gap: 0;
        border-radius: 50%;
        cursor: pointer;
        background-color: rgba(15, 23, 42, 0.85);
        border-color: rgba(56, 189, 248, 0.4);
      }
      .hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        width: 100%;
      }
      .weather-telemetry-hud.collapsed .hud-header {
        gap: 0;
        justify-content: center;
      }
      .hud-title {
        font-size: 11px;
        font-weight: bold;
        color: #38bdf8;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      .weather-telemetry-hud.collapsed .hud-title {
        display: none;
      }
      .hud-toggle-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .hud-toggle-btn:hover {
        color: #38bdf8;
        background-color: rgba(56, 189, 248, 0.1);
      }
      .hud-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: opacity 0.2s ease;
      }
      .weather-telemetry-hud.collapsed .hud-content {
        display: none;
      }
      .hud-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .hud-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        color: #38bdf8;
      }
      .hud-data {
        display: flex;
        flex-direction: column;
      }
      .hud-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }
      .hud-value {
        font-size: 14px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .wind-arrow {
        display: inline-block;
        transition: transform 0.3s ease;
      }
    `;
    this.container.appendChild(hudStyle);

    this.weatherOverlay = document.createElement('div');
    this.weatherOverlay.className = 'weather-telemetry-hud';
    this.weatherOverlay.style.display = this.config.show_weather !== false ? 'flex' : 'none';
    this.container.appendChild(this.weatherOverlay);

    this.hudCollapsed = false;

    // Prevent interactions on HUD elements from leaking into 3D scene
    const stopPropagation = (e: Event) => e.stopPropagation();
    const eventTypes = ['mousedown', 'mousemove', 'mouseup', 'click', 'touchstart', 'touchmove', 'touchend', 'wheel'];
    eventTypes.forEach((evt) => {
      this.weatherOverlay.addEventListener(evt, stopPropagation);
    });

    this.weatherOverlay.addEventListener('click', (e) => {
      const toggleBtn = (e.target as HTMLElement).closest('.hud-toggle-btn');
      if (toggleBtn || this.hudCollapsed) {
        e.stopPropagation();
        this.hudCollapsed = !this.hudCollapsed;
        if (this.hudCollapsed) {
          this.weatherOverlay.classList.add('collapsed');
          this.weatherOverlay.title = 'Expand Weather HUD';
        } else {
          this.weatherOverlay.classList.remove('collapsed');
          this.weatherOverlay.removeAttribute('title');
        }
        this.updateWeatherOverlay();
      }
    });

    // Interactive helper variables
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.glowTexture = this.createGlowTexture();
    this.heatGeo = new THREE.SphereGeometry(0.15, 8, 8);
    this.lastInteractionTime = Date.now();

    // Add mouse & touch event listeners for rotation/zoom
    let isDragging = false;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    this.container.addEventListener('mousedown', (e) => {
      this.lastInteractionTime = Date.now();
      if (e.button === 2 || e.button === 1 || e.shiftKey) {
        isPanning = true;
        isDragging = false;
        this.container.style.cursor = 'move';
      } else {
        isDragging = true;
        isPanning = false;
        this.container.style.cursor = 'grabbing';
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    this.container.addEventListener('mousemove', (e) => {
      this.lastInteractionTime = Date.now();
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        this.cameraTheta -= deltaX * 0.005;
        this.cameraPhi += deltaY * 0.005;
        this.updateCameraPosition();

        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else if (isPanning) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        const localRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        const localUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);

        const factor = this.zoomRadius * 0.0015;
        this.cameraTarget.addScaledVector(localRight, -deltaX * factor);
        this.cameraTarget.addScaledVector(localUp, deltaY * factor);
        this.cameraTarget.x = Math.max(-30, Math.min(30, this.cameraTarget.x));
        this.cameraTarget.y = Math.max(-5, Math.min(15, this.cameraTarget.y));
        this.cameraTarget.z = Math.max(-30, Math.min(30, this.cameraTarget.z));

        this.updateCameraPosition();
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.checkHover(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    this._mouseupHandler = () => {
      isDragging = false;
      isPanning = false;
      this.container.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', this._mouseupHandler);

    this.container.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });

    this.container.addEventListener(
      'wheel',
      (e) => {
        this.lastInteractionTime = Date.now();
        this.hideTooltip();
        e.preventDefault();
        this.zoomRadius += e.deltaY * 0.02;
        this.updateCameraPosition();
      },
      { passive: false }
    );

    let touchStartDist = 0;

    this.container.addEventListener('touchstart', (e) => {
      this.lastInteractionTime = Date.now();
      this.hideTooltip();
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.container.addEventListener(
      'touchmove',
      (e) => {
        this.lastInteractionTime = Date.now();
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
          const deltaX = e.touches[0].clientX - previousMousePosition.x;
          const deltaY = e.touches[0].clientY - previousMousePosition.y;

          this.cameraTheta -= deltaX * 0.007;
          this.cameraPhi += deltaY * 0.007;
          this.updateCameraPosition();

          previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const deltaDist = dist - touchStartDist;
          this.zoomRadius -= deltaDist * 0.15;
          this.updateCameraPosition();
          touchStartDist = dist;
        }
      },
      { passive: false }
    );

    this.container.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Add elements
    this.addStaticElements();
    this.initWeatherSystem();
    this.updateDayNightEngine();
    this.addWeatherStations();

    // Generate default procedural terrain
    this.generateProceduralTerrain();

    this.strikeLayer = new THREE.Group();
    this.scene.add(this.strikeLayer);

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      if (this.renderer && this.container) {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    });
    this.resizeObserver.observe(this.container);

    // Start animation loop
    this.animateLoop();

    if (this._hass) {
      console.log('WeatherFlow Card: Re-applying cached state on init completion');
      this.hass = this._hass;
    }
  }

  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 242, 254, 1.0)');
    grad.addColorStop(0.2, 'rgba(0, 242, 254, 0.8)');
    grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  createRingLabelSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 128, 64);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#00f2fe';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2.0, 1.0, 1.0);
    return sprite;
  }

  addRangeRings() {
    this.rangeRingsGroup = new THREE.Group();
    this.rangeRingsGroup.visible = this.config.show_rings !== false;
    this.scene.add(this.rangeRingsGroup);

    const radii = [10, 20, 30];

    radii.forEach((r) => {
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        points.push(new THREE.Vector3(x, 0.05, z));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.5
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      this.rangeRingsGroup.add(ringLine);
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.3
    });

    // N-S line (41 points)
    const nsPoints = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const z = -30 + (i / segments) * 60;
      nsPoints.push(new THREE.Vector3(0, 0.05, z));
    }
    const nsGeo = new THREE.BufferGeometry().setFromPoints(nsPoints);
    const nsLine = new THREE.Line(nsGeo, lineMat);
    this.rangeRingsGroup.add(nsLine);

    // E-W line (41 points)
    const ewPoints = [];
    for (let i = 0; i <= segments; i++) {
      const x = -30 + (i / segments) * 60;
      ewPoints.push(new THREE.Vector3(x, 0.05, 0));
    }
    const ewGeo = new THREE.BufferGeometry().setFromPoints(ewPoints);
    const ewLine = new THREE.Line(ewGeo, lineMat);
    this.rangeRingsGroup.add(ewLine);

    // Distance labels on rings — placed at 45° NE on the ring circumference
    // (r·sin45°, y, -r·cos45°) so each label sits exactly on its ring
    // between the two crosshair arms with no ambiguity.
    const SIN45 = Math.SQRT2 / 2;
    this.ringLabels = [];
    radii.forEach((r) => {
      const labelSprite = this.createRingLabelSprite(`${r}km`);
      labelSprite.position.set(r * SIN45, 0.5, -r * SIN45);
      this.rangeRingsGroup.add(labelSprite);
      this.ringLabels.push({ sprite: labelSprite, r: r });
    });
  }

  updateRangeRings() {
    if (!this.rangeRingsGroup || !this.rangeRingsGroup.children) return;

    const children = this.rangeRingsGroup.children;
    const radii = [10, 20, 30];

    radii.forEach((r, idx) => {
      const ringLine = children[idx];
      if (ringLine) {
        const posAttr = ringLine.geometry.attributes.position;
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const x = r * Math.cos(theta);
          const z = r * Math.sin(theta);
          const y = this.getTerrainHeight(x, z) + 0.1;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }
    });

    // Update crosshair lines (index 3 and 4)
    const nsLine = children[3];
    if (nsLine) {
      const posAttr = nsLine.geometry.attributes.position;
      const segments = 40;
      for (let i = 0; i <= segments; i++) {
        const z = -30 + (i / segments) * 60;
        const y = this.getTerrainHeight(0, z) + 0.1;
        posAttr.setXYZ(i, 0, y, z);
      }
      posAttr.needsUpdate = true;
    }

    const ewLine = children[4];
    if (ewLine) {
      const posAttr = ewLine.geometry.attributes.position;
      const segments = 40;
      for (let i = 0; i <= segments; i++) {
        const x = -30 + (i / segments) * 60;
        const y = this.getTerrainHeight(x, 0) + 0.1;
        posAttr.setXYZ(i, x, y, 0);
      }
      posAttr.needsUpdate = true;
    }

    // Update ring labels — keep them on the 45° NE ring intercept
    const SIN45 = Math.SQRT2 / 2;
    if (this.ringLabels) {
      this.ringLabels.forEach((label) => {
        const x = label.r * SIN45;
        const z = -label.r * SIN45;
        const y = this.getTerrainHeight(x, z) + 0.4;
        label.sprite.position.set(x, y, z);
      });
    }
  }

  getTerrainHeight(x, z) {
    if (!this.elevationGrid || this.elevationGrid.length !== 225) return 0;

    const c = ((x + 20) * 14) / 40;
    const r = ((z + 20) * 14) / 40;

    if (c < 0 || c > 14 || r < 0 || r > 14) return 0;

    const c0 = Math.floor(c);
    const c1 = Math.min(14, c0 + 1);
    const r0 = Math.floor(r);
    const r1 = Math.min(14, r0 + 1);

    const tx = c - c0;
    const tz = r - r0;

    const h00 = this.getGridHeight(r0, c0);
    const h10 = this.getGridHeight(r0, c1);
    const h01 = this.getGridHeight(r1, c0);
    const h11 = this.getGridHeight(r1, c1);

    const h0 = h00 * (1 - tx) + h10 * tx;
    const h1 = h01 * (1 - tx) + h11 * tx;

    return h0 * (1 - tz) + h1 * tz;
  }

  getGridHeight(r, c) {
    if (!this.scaledHeights) return 0;
    return this.scaledHeights[(14 - r) * 15 + c];
  }

  generateProceduralTerrain() {
    this.elevationGrid = [];

    for (let i = 0; i < 15; i++) {
      const x = i - 7;
      for (let j = 0; j < 15; j++) {
        const y = j - 7;
        const dist = Math.sqrt(x * x + y * y);
        let elev = 80 + Math.sin(x * 0.4) * Math.cos(y * 0.4) * 45;
        elev += Math.sin(dist * 0.8) * 15;
        if (i === 7 && j === 7) {
          elev = 100;
        } else {
          const weight = Math.min(1.0, dist / 3.0);
          elev = 100 * (1.0 - weight) + elev * weight;
        }
        this.elevationGrid.push(elev);
      }
    }

    const refElevation = 100;
    const exaggeration = this.config.elevation_scale !== undefined ? parseFloat(this.config.elevation_scale) : 1.5;
    const scaleFactor = exaggeration / 1000.0;
    this.scaledHeights = new Float32Array(225);
    for (let i = 0; i < 225; i++) {
      this.scaledHeights[i] = ((this.elevationGrid[i] || 0) - refElevation) * scaleFactor;
    }

    const posAttr = this.terrainGeo.attributes.position;
    for (let r = 0; r <= 14; r++) {
      const i = 14 - r;
      for (let c = 0; c <= 14; c++) {
        const j = c;
        const vertexIndex = r * 15 + c;
        const relElev = this.scaledHeights[i * 15 + j];
        posAttr.setZ(vertexIndex, relElev);
      }
    }
    posAttr.needsUpdate = true;
    this.terrainGeo.computeVertexNormals();
    this._paintHypsometricColours(); // [C] hypsometric vertex colours on procedural terrain

    this.updateStationHeights();
    this.updateRangeRings();
  }

  loadMapTexture(refLat, refLon) {
    if (this.config.show_map === false) {
      // [B] Hide the flat map layer; relief mesh stays visible
      if (this.terrainMapMesh) this.terrainMapMesh.visible = false;
      return;
    }
    if (this.terrainMapMesh) this.terrainMapMesh.visible = true;
    const zoom = 10;
    const spanKm = 40.0;

    const latSpan = spanKm / 111.1;
    const cosLat = Math.cos((refLat * Math.PI) / 180.0);
    const lonSpan = cosLat > 0 ? spanKm / (111.1 * cosLat) : spanKm / 111.1;

    const minLat = refLat - latSpan / 2;
    const maxLat = refLat + latSpan / 2;
    const minLon = refLon - lonSpan / 2;
    const maxLon = refLon + lonSpan / 2;

    const lon2tile = (lon, z) => ((lon + 180) / 360) * Math.pow(2, z);
    const lat2tile = (lat, z) =>
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, z);
    const tile2lon = (x, z) => (x / Math.pow(2, z)) * 360 - 180;
    const tile2lat = (y, z) => (Math.atan(Math.sinh(Math.PI - (2 * Math.PI * y) / Math.pow(2, z))) * 180) / Math.PI;

    const x0 = Math.floor(lon2tile(minLon, zoom));
    const x1 = Math.floor(lon2tile(maxLon, zoom));
    const y0 = Math.floor(lat2tile(maxLat, zoom));
    const y1 = Math.floor(lat2tile(minLat, zoom));

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#050b14';
    ctx.fillRect(0, 0, 1024, 1024);

    const promises = [];

    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const tileMinLon = tile2lon(x, zoom);
        const tileMaxLon = tile2lon(x + 1, zoom);
        const tileMinLat = tile2lat(y + 1, zoom);
        const tileMaxLat = tile2lat(y, zoom);

        const leftPct = (tileMinLon - minLon) / (maxLon - minLon);
        const rightPct = (tileMaxLon - minLon) / (maxLon - minLon);
        const bottomPct = (tileMinLat - minLat) / (maxLat - minLat);
        const topPct = (tileMaxLat - minLat) / (maxLat - minLat);

        const dx = leftPct * 1024;
        const dy = (1.0 - topPct) * 1024;
        const dw = (rightPct - leftPct) * 1024;
        const dh = (topPct - bottomPct) * 1024;

        const tileUrl = `https://basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`;

        const p = new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, dx, dy, dw, dh);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = tileUrl;
        });
        promises.push(p);
      }
    }

    Promise.all(promises).then(() => {
      const texture = new THREE.CanvasTexture(canvas);
      // [B] Apply tile to the FLAT map mesh only — never to the displaced relief mesh
      if (this.terrainMapMesh && this.terrainMapMesh.material) {
        this.terrainMapMesh.material.map = texture;
        this.terrainMapMesh.material.color.setHex(0xffffff);
        this.terrainMapMesh.material.needsUpdate = true;
      }
    });
  }

  async loadVectorData(refLat, refLon) {
    this.vectorDataLoading = true;
    try {
      const data = await this._hass.callApi('GET', 'weatherflow_lightning/vector_data');
      this.render3DFeatures(data, refLat, refLon);
      this.vectorDataLoaded = true;
    } catch (e) {
      console.error('Failed to load 3D vector features:', e);
    } finally {
      this.vectorDataLoading = false;
    }
  }

  render3DFeatures(data, refLat, refLon) {
    if (!this.scene) return;

    if (this.features3DGroup) {
      this.scene.remove(this.features3DGroup);
      this.features3DGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    this.features3DGroup = new THREE.Group();
    this.scene.add(this.features3DGroup);

    const R = 6371.0;
    const cosLat = Math.cos((refLat * Math.PI) / 180.0);

    // 1. Render Waterbodies (Lakes)
    if (data.water && Array.isArray(data.water)) {
      const waterMat = new THREE.MeshPhongMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        flatShading: true
      });

      data.water.forEach((poly) => {
        if (!poly.coordinates || poly.coordinates.length < 3) return;

        const shapePoints = [];
        let avgY = 0;
        let validPoints = 0;

        poly.coordinates.forEach((pt) => {
          const lat = pt[0];
          const lon = pt[1];
          const x = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
          const worldZ = -R * (lat - refLat) * (Math.PI / 180.0);

          if (x < -20 || x > 20 || worldZ < -20 || worldZ > 20) return;

          shapePoints.push(new THREE.Vector2(x, -worldZ));
          avgY += this.getTerrainHeight(x, worldZ);
          validPoints++;
        });

        if (shapePoints.length < 3) return;
        avgY /= validPoints;

        const shape = new THREE.Shape(shapePoints);
        const shapeGeo = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(shapeGeo, waterMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = avgY + 0.08;
        this.features3DGroup.add(mesh);
      });
    }

    // 2. Render Forests (Point-in-Polygon Grid generation & Forest Floor)
    if (data.forest && Array.isArray(data.forest)) {
      const forestPolygons = [];
      const forestMat = new THREE.MeshPhongMaterial({
        color: 0x14532d, // dark forest green
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        flatShading: true
      });

      const pineInstances = [];
      const oakInstances = [];
      const birchInstances = [];
      let treeCount = 0;
      const MAX_TREES = 1500;

      const isPointInPolygon = (point, vs) => {
        const x = point[0],
          y = point[1];
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          const xi = vs[i][0],
            yi = vs[i][1];
          const xj = vs[j][0],
            yj = vs[j][1];
          const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
          if (intersect) inside = !inside;
        }
        return inside;
      };

      data.forest.forEach((poly) => {
        if (!poly.coordinates || poly.coordinates.length < 3) return;

        const shapePoints = [];
        let avgY = 0;
        let validPoints = 0;

        const pts = poly.coordinates.map((pt) => {
          const lat = pt[0];
          const lon = pt[1];
          const x = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
          const worldZ = -R * (lat - refLat) * (Math.PI / 180.0);
          if (x >= -20 && x <= 20 && worldZ >= -20 && worldZ <= 20) {
            shapePoints.push(new THREE.Vector2(x, -worldZ));
            avgY += this.getTerrainHeight(x, worldZ);
            validPoints++;
          }
          return [x, worldZ];
        });

        forestPolygons.push(pts);

        // A. Render Flat Forest Floor mesh
        if (shapePoints.length >= 3) {
          avgY /= validPoints;
          const shape = new THREE.Shape(shapePoints);
          const shapeGeo = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(shapeGeo, forestMat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.position.y = avgY + 0.06;
          this.features3DGroup.add(mesh);
        }

        // B. Add Centroid fallback tree to guarantee every forest patch has a tree
        if (pts.length > 0 && treeCount < MAX_TREES) {
          let sumX = 0,
            sumZ = 0;
          pts.forEach((p) => {
            sumX += p[0];
            sumZ += p[1];
          });
          const cx = Math.max(-19.5, Math.min(19.5, sumX / pts.length));
          const cz = Math.max(-19.5, Math.min(19.5, sumZ / pts.length));
          const y = this.getTerrainHeight(cx, cz);
          const scale = 0.85 + Math.random() * 0.4;
          const rotY = Math.random() * Math.PI * 2;

          const dummy = new THREE.Object3D();
          dummy.position.set(cx, y, cz);
          dummy.rotation.y = rotY;
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();

          const r = Math.random();
          if (r < 0.33) {
            pineInstances.push(dummy.matrix.clone());
          } else if (r < 0.66) {
            oakInstances.push(dummy.matrix.clone());
          } else {
            birchInstances.push(dummy.matrix.clone());
          }
          treeCount++;
        }
      });

      const SPACING = 0.45;
      const MAX_JITTER = SPACING * 0.35;

      const isInsideAnyForest = (pt) => {
        for (const poly of forestPolygons) {
          if (isPointInPolygon(pt, poly)) return true;
        }
        return false;
      };

      // Candidate grid fill
      for (let x = -19.5; x <= 19.5; x += SPACING) {
        for (let z = -19.5; z <= 19.5; z += SPACING) {
          if (treeCount >= MAX_TREES) break;

          const jx = x + (Math.random() * 2 - 1) * MAX_JITTER;
          const jz = z + (Math.random() * 2 - 1) * MAX_JITTER;

          const cx = Math.max(-19.5, Math.min(19.5, jx));
          const cz = Math.max(-19.5, Math.min(19.5, jz));

          if (isInsideAnyForest([cx, cz])) {
            const y = this.getTerrainHeight(cx, cz);
            const scale = 0.85 + Math.random() * 0.4;
            const rotY = Math.random() * Math.PI * 2;

            const dummy = new THREE.Object3D();
            dummy.position.set(cx, y, cz);
            dummy.rotation.y = rotY;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();

            const r = Math.random();
            if (r < 0.33) {
              pineInstances.push(dummy.matrix.clone());
            } else if (r < 0.66) {
              oakInstances.push(dummy.matrix.clone());
            } else {
              birchInstances.push(dummy.matrix.clone());
            }

            treeCount++;
          }
        }
      }

      const addInstancedGroup = (matrices, trunkGeo, trunkMat, leafGeos, leafMats) => {
        if (matrices.length === 0) return;
        const imTrunk = new THREE.InstancedMesh(trunkGeo, trunkMat, matrices.length);
        matrices.forEach((mat, idx) => imTrunk.setMatrixAt(idx, mat));
        imTrunk.instanceMatrix.needsUpdate = true;
        this.features3DGroup.add(imTrunk);

        for (let i = 0; i < leafGeos.length; i++) {
          const imLeaf = new THREE.InstancedMesh(leafGeos[i], leafMats[i], matrices.length);
          matrices.forEach((mat, idx) => imLeaf.setMatrixAt(idx, mat));
          imLeaf.instanceMatrix.needsUpdate = true;
          this.features3DGroup.add(imLeaf);
        }
      };

      // Pine
      const pineTrunkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 4);
      pineTrunkGeo.translate(0, 0.1, 0);
      const pineTrunkMat = new THREE.MeshPhongMaterial({ color: 0x3d2817, flatShading: true }); // dark brown
      const pineLeafMat = new THREE.MeshPhongMaterial({ color: 0x0f3b1b, flatShading: true }); // dark green
      const pineCones = [
        new THREE.ConeGeometry(0.18, 0.3, 5).translate(0, 0.3, 0),
        new THREE.ConeGeometry(0.14, 0.25, 5).translate(0, 0.45, 0),
        new THREE.ConeGeometry(0.1, 0.2, 5).translate(0, 0.6, 0)
      ];

      addInstancedGroup(pineInstances, pineTrunkGeo, pineTrunkMat, pineCones, [pineLeafMat, pineLeafMat, pineLeafMat]);

      // Oak
      const oakTrunkGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 5);
      oakTrunkGeo.translate(0, 0.125, 0);
      const oakTrunkMat = new THREE.MeshPhongMaterial({ color: 0x5c4033, flatShading: true }); // warm brown
      const oakLeafMat = new THREE.MeshPhongMaterial({ color: 0x228b22, flatShading: true }); // leafy green
      const oakSpheres = [
        new THREE.SphereGeometry(0.18, 6, 6).translate(-0.05, 0.3, 0),
        new THREE.SphereGeometry(0.2, 6, 6).translate(0.05, 0.35, 0)
      ];

      addInstancedGroup(oakInstances, oakTrunkGeo, oakTrunkMat, oakSpheres, [oakLeafMat, oakLeafMat]);

      // Birch
      const birchTrunkGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 4);
      birchTrunkGeo.translate(0, 0.15, 0);
      const birchTrunkMat = new THREE.MeshPhongMaterial({ color: 0xd3d3d3, flatShading: true }); // light grey
      const birchLeafMat = new THREE.MeshPhongMaterial({ color: 0x90ee90, flatShading: true }); // light green
      // vertically stretched sphere: scale Y, then translate
      const birchCanopyGeo = new THREE.SphereGeometry(0.15, 6, 6);
      birchCanopyGeo.scale(1, 1.8, 1);
      birchCanopyGeo.translate(0, 0.4, 0);

      addInstancedGroup(birchInstances, birchTrunkGeo, birchTrunkMat, [birchCanopyGeo], [birchLeafMat]);
    }
  }

  // [C] Shared helper — maps scaledHeights (scene units) to a hypsometric
  // green → brown → grey-white ramp and writes into terrainGeo's vertex colours.
  // Assumes scaledHeights is already populated.
  _paintHypsometricColours() {
    if (!this.scaledHeights || !this.terrainGeo) return;

    // Find min/max of the current scaled heights for normalisation
    let minH = Infinity;
    let maxH = -Infinity;
    for (let i = 0; i < 225; i++) {
      if (this.scaledHeights[i] < minH) minH = this.scaledHeights[i];
      if (this.scaledHeights[i] > maxH) maxH = this.scaledHeights[i];
    }
    const range = maxH - minH || 1.0;

    // Hypsometric colour stops (linear RGB, gamma-corrected visually)
    // t=0.00 deep valley  → dark forest green
    // t=0.35 lowland      → medium green
    // t=0.55 mid slope    → olive-brown
    // t=0.75 high slope   → warm brown
    // t=1.00 peak         → near-white grey
    const stops = [
      { t: 0.0, r: 0.05, g: 0.15, b: 0.05 },
      { t: 0.35, r: 0.12, g: 0.28, b: 0.08 },
      { t: 0.55, r: 0.3, g: 0.22, b: 0.08 },
      { t: 0.75, r: 0.45, g: 0.3, b: 0.18 },
      { t: 1.0, r: 0.82, g: 0.8, b: 0.78 }
    ];

    const lerpStop = (t) => {
      let lo = stops[0];
      let hi = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i].t && t <= stops[i + 1].t) {
          lo = stops[i];
          hi = stops[i + 1];
          break;
        }
      }
      const f = hi.t === lo.t ? 0 : (t - lo.t) / (hi.t - lo.t);
      return {
        r: lo.r + (hi.r - lo.r) * f,
        g: lo.g + (hi.g - lo.g) * f,
        b: lo.b + (hi.b - lo.b) * f
      };
    };

    const colAttr = this.terrainGeo.attributes.color;
    // terrainGeo vertices: row r = 0..14, col c = 0..14, vertexIndex = r*15+c
    // scaledHeights index: i = (14-r)*15+c  (matches PlaneGeometry row flip)
    for (let r = 0; r <= 14; r++) {
      const i = 14 - r;
      for (let c = 0; c <= 14; c++) {
        const h = this.scaledHeights[i * 15 + c];
        const t = (h - minH) / range;
        const col = lerpStop(Math.max(0, Math.min(1, t)));
        const vi = r * 15 + c;
        colAttr.setXYZ(vi, col.r, col.g, col.b);
      }
    }
    colAttr.needsUpdate = true;
  }

  updateTerrainGeometry(elevationGrid) {
    if (!elevationGrid || elevationGrid.length !== 225) {
      this.generateProceduralTerrain();
      return;
    }
    this.elevationGrid = elevationGrid;

    const centerIndex = 7 * 15 + 7;
    const refElevation = elevationGrid[centerIndex] || 0;
    const exaggeration = this.config.elevation_scale !== undefined ? parseFloat(this.config.elevation_scale) : 1.5;
    const scaleFactor = exaggeration / 1000.0;
    this.scaledHeights = new Float32Array(225);
    for (let i = 0; i < 225; i++) {
      this.scaledHeights[i] = ((elevationGrid[i] || 0) - refElevation) * scaleFactor;
    }

    const posAttr = this.terrainGeo.attributes.position;
    for (let r = 0; r <= 14; r++) {
      const i = 14 - r;
      for (let c = 0; c <= 14; c++) {
        const j = c;
        const vertexIndex = r * 15 + c;
        const relElev = this.scaledHeights[i * 15 + j];
        posAttr.setZ(vertexIndex, relElev);
      }
    }
    posAttr.needsUpdate = true;
    this.terrainGeo.computeVertexNormals();
    this._paintHypsometricColours(); // [C] repaint vertex colours

    this.updateStationHeights();
    this.updateRangeRings();
  }

  updateStationHeights() {
    if (!this.stationMeshes || !this.stations) return;
    this.stations.forEach((st, idx) => {
      const sm = this.stationMeshes[idx];
      if (sm && sm.mesh) {
        const terrainY = this.getTerrainHeight(st.x, st.z);
        sm.mesh.position.y = terrainY;
      }
    });
  }

  showTooltip(st, x, y) {
    if (!this.tooltip) return;
    let typeLabel = 'Discovered Station';
    if (st.type === 'primary') typeLabel = 'Primary Station';
    else if (st.type === 'neighbor') typeLabel = 'Neighbor Station';

    this.tooltip.innerHTML = `
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${st.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${typeLabel}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${st.x.toFixed(2)}, ${st.z.toFixed(2)} km</div>
    `;
    this.tooltip.style.display = 'block';

    const rect = this.container.getBoundingClientRect();
    let left = x + 15;
    let top = y + 15;

    if (left + 150 > rect.width) {
      left = x - 165;
    }
    if (top + 60 > rect.height) {
      top = y - 75;
    }

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  checkHover(clientX, clientY) {
    if (!this.camera || !this.stationMeshes || !this.raycaster) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.stationMeshes.map((sm) => sm.mesh),
      true
    );

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && obj.parent && (!obj.userData || !obj.userData.station)) {
        obj = obj.parent;
      }

      if (obj && obj.userData && obj.userData.station) {
        const st = obj.userData.station;
        this.showTooltip(st, clientX, clientY);
        this.container.style.cursor = 'pointer';
        return;
      }
    }

    this.hideTooltip();
    if (this.container.style.cursor === 'pointer') {
      this.container.style.cursor = 'grab';
    }
  }

  updateHeatmap() {
    if (!this.scene) return;
    const lifespan = 90000;
    const nowVirtual = this.playbackTime;

    if (!this.heatmapMeshes) {
      this.heatmapMeshes = new Map();
    }

    const activeIds = new Set();

    for (let i = 0; i < this.strikeHistory.length; i++) {
      const s = this.strikeHistory[i];
      const age = nowVirtual - s.time;
      if (age >= 0 && age <= lifespan) {
        activeIds.add(s.id);
        const pct = age / lifespan;
        const opacity = 0.7 * (1.0 - pct);
        const scale = 1.0 - pct * 0.4;

        let hm = this.heatmapMeshes.get(s.id);
        if (!hm) {
          const mat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: opacity,
            depthWrite: false
          });
          const mesh = new THREE.Mesh(this.heatGeo, mat);
          const y = this.getTerrainHeight(s.x, s.z);
          mesh.position.set(s.x, y, s.z);
          mesh.scale.set(scale, scale, scale);
          this.scene.add(mesh);

          hm = { mesh, material: mat };
          this.heatmapMeshes.set(s.id, hm);
        } else {
          hm.material.opacity = opacity;
          hm.mesh.scale.set(scale, scale, scale);
          hm.mesh.position.y = this.getTerrainHeight(s.x, s.z);
        }
      }
    }

    for (const [id, hm] of this.heatmapMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(hm.mesh);
        if (hm.material) hm.material.dispose();
        this.heatmapMeshes.delete(id);
      }
    }
  }

  addStaticElements() {
    // [4] Hemisphere light — sky colour above, ground colour below.
    // Much more natural than a flat ambient: terrain slopes facing up
    // get a cool blue-white tint, slopes facing down stay dark.
    this.ambientLight = new THREE.HemisphereLight(
      0x334155, // sky colour (night default — updated by day/night engine)
      0x0a1120, // ground colour
      1.5
    );
    this.scene.add(this.ambientLight);

    // [13] Procedural sky dome — large inverted sphere with a canvas-baked
    // horizon-to-zenith gradient that the day/night engine repaints each tick.
    this._skyCanvas = document.createElement('canvas');
    this._skyCanvas.width = 2;
    this._skyCanvas.height = 128;
    this._skyTexture = new THREE.CanvasTexture(this._skyCanvas);
    const skyGeo = new THREE.SphereGeometry(450, 16, 8);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this._skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    this._skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this._skyDome);
    this._paintSkyGradient(0); // paint night sky immediately

    this.dirLight = new THREE.DirectionalLight(0x38bdf8, 1);
    this.dirLight.position.set(5, 10, 7);
    this.scene.add(this.dirLight);

    // Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 500;
    const starsPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const radius = 100 + Math.random() * 50;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      starsPos[i] = radius * Math.sin(phi) * Math.cos(theta);
      starsPos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starsPos[i + 2] = radius * Math.cos(phi);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });
    this.starField = new THREE.Points(starsGeo, starsMat);
    this.scene.add(this.starField);

    // ── Terrain layer stack ──────────────────────────────────────────────
    // Two independent geometries so the map tile stays orthographically
    // correct regardless of how much vertical exaggeration is applied.
    const mapSize = 40;

    // [B/D] LAYER 1 — flat map tile plane, permanently undeformed, at y=-0.01
    // The CartoDB overhead imagery is applied here so it never gets
    // stretched across slope faces.
    const terrainMapGeo = new THREE.PlaneGeometry(mapSize, mapSize);
    const terrainMapMat = new THREE.MeshBasicMaterial({
      color: 0x050b14,
      side: THREE.FrontSide
    });
    this.terrainMapMesh = new THREE.Mesh(terrainMapGeo, terrainMapMat);
    this.terrainMapMesh.rotation.x = -Math.PI / 2;
    this.terrainMapMesh.position.y = -0.2; // [D] just below relief mesh — prevents z-fighting and covering valleys/waterbodies
    this.scene.add(this.terrainMapMesh);

    // [C] LAYER 2 — displaced relief mesh with hypsometric vertex colouring.
    // Uses a separate geometry so vertices can be pushed up without warping
    // the tile. MeshStandardMaterial responds correctly to the hemisphere
    // light added in the previous commit.
    this.terrainGeo = new THREE.PlaneGeometry(mapSize, mapSize, 14, 14);
    // Initialise vertex colours (will be repainted in updateTerrainGeometry)
    const vertCount = 15 * 15;
    const colours = new Float32Array(vertCount * 3);
    colours.fill(0.02); // near-black until first elevation data arrives
    this.terrainGeo.setAttribute('color', new THREE.BufferAttribute(colours, 3));

    const reliefMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
      side: THREE.FrontSide
    });
    this.terrainMesh = new THREE.Mesh(this.terrainGeo, reliefMat);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.terrainMesh);

    // Wireframe on the same displaced geometry
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.terrainWire = new THREE.Mesh(this.terrainGeo, wireMat);
    this.terrainWire.rotation.x = -Math.PI / 2;
    this.terrainWire.visible = this.config.show_grid !== false;
    this.scene.add(this.terrainWire);

    // Range rings & compass crosshairs
    this.addRangeRings();
  }

  addWeatherStations() {
    this.stationMeshes = [];
    this.stations.forEach((st) => {
      const group = new THREE.Group();
      const terrainY = this.getTerrainHeight(st.x, st.z);
      group.position.set(st.x, terrainY, st.z);
      group.userData = { station: st };

      const ringGeo = new THREE.RingGeometry(0.8, 1, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: st.color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      group.add(ring);

      const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
      const cylMat = new THREE.MeshBasicMaterial({
        color: st.color,
        transparent: true,
        opacity: 0.6
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.y = 1.25;
      group.add(cyl);

      const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: st.color
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 2.5;
      group.add(sphere);

      this.scene.add(group);
      this.stationMeshes.push({
        mesh: group,
        pulseVal: Math.random() * Math.PI,
        strikeIntensity: 0.0
      });
    });
  }

  initWeatherSystem() {
    // [8] Rain particles — all spawned at cloud layer (y = 18–22) so they
    // visually fall from above rather than popping into existence mid-air.
    const CLOUD_BASE = 18;
    const CLOUD_SPREAD = 4;
    const rainCount = 800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 40;
      rainPositions[i + 1] = CLOUD_BASE + Math.random() * CLOUD_SPREAD;
      rainPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this._rainCloudBase = CLOUD_BASE;
    this._rainCloudSpread = CLOUD_SPREAD;
    this.scene.add(this.rainParticles);
    this.rainParticles.visible = false;

    // Wind Particles
    const windCount = 300;
    const windGeo = new THREE.BufferGeometry();
    const windPositions = new Float32Array(windCount * 3);
    for (let i = 0; i < windCount * 3; i += 3) {
      windPositions[i] = (Math.random() - 0.5) * 40;
      windPositions[i + 1] = Math.random() * 8;
      windPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));

    const windMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.1,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });
    this.windParticles = new THREE.Points(windGeo, windMat);
    this.scene.add(this.windParticles);
    this.windParticles.visible = false;
  }

  updateWeatherOverlay() {
    if (!this.weatherOverlay) return;

    const windSpeedStr = (this.windSpeed || 0).toFixed(1);
    const rainRateStr = (this.rainRate || 0).toFixed(1);
    const windDir = this.windDirection || 0;

    if (this.hudCollapsed) {
      this.weatherOverlay.innerHTML = `
        <div class="hud-header">
          <div class="hud-toggle-btn" style="padding: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
            </svg>
          </div>
        </div>
      `;
      return;
    }

    this.weatherOverlay.innerHTML = `
      <div class="hud-header">
        <div class="hud-title">Telemetry</div>
        <button class="hud-toggle-btn" title="Minimize Weather HUD">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="10" y1="14" x2="3" y2="21"></line>
          </svg>
        </button>
      </div>
      <div class="hud-content">
        <div class="hud-row">
          <div class="hud-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
            </svg>
          </div>
          <div class="hud-data">
            <div class="hud-label">Wind</div>
            <div class="hud-value">
              ${windSpeedStr} m/s
              <span class="wind-arrow" style="transform: rotate(${windDir}deg); margin-left: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div class="hud-row">
          <div class="hud-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22a5 5 0 0 0 5-5c0-2-5-10-5-10S7 15 7 17a5 5 0 0 0 5 5z"/>
            </svg>
          </div>
          <div class="hud-data">
            <div class="hud-label">Precipitation</div>
            <div class="hud-value">${rainRateStr} mm/h</div>
          </div>
        </div>
      </div>
    `;
  }

  updateWeatherSystem(deltaTime) {
    if (!this.initialized) return;

    const showWeather = this.config.show_weather !== false;
    const showRain = showWeather && this.rainRate > 0;
    const showWind = showWeather && this.windSpeed > 0;

    const windRad = ((this.windDirection || 0) * Math.PI) / 180.0;
    const sinWind = Math.sin(windRad);
    const cosWind = Math.cos(windRad);

    if (this.rainParticles) {
      this.rainParticles.visible = showRain;
      if (showRain) {
        const posAttr = this.rainParticles.geometry.attributes.position;
        const positions = posAttr.array;
        const count = posAttr.count;

        const driftX = -sinWind * (this.windSpeed || 0) * 0.1;
        const driftZ = -cosWind * (this.windSpeed || 0) * 0.1;
        const fallSpeed = 10.0 + Math.min(20.0, this.rainRate * 2.0);

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          let x = positions[idx];
          let y = positions[idx + 1];
          let z = positions[idx + 2];

          y -= fallSpeed * deltaTime;
          x += driftX * deltaTime;
          z += driftZ * deltaTime;

          const terrainY = this.getTerrainHeight(x, z);
          if (y < terrainY || y < 0) {
            // [8] Reset to cloud layer, not random mid-air height
            y = (this._rainCloudBase || 18) + Math.random() * (this._rainCloudSpread || 4);
            x = (Math.random() - 0.5) * 40;
            z = (Math.random() - 0.5) * 40;
          }

          positions[idx] = x;
          positions[idx + 1] = y;
          positions[idx + 2] = z;
        }
        posAttr.needsUpdate = true;
      }
    }

    if (this.windParticles) {
      this.windParticles.visible = showWind;
      if (showWind) {
        const posAttr = this.windParticles.geometry.attributes.position;
        const positions = posAttr.array;
        const count = posAttr.count;

        const driftX = -sinWind * (this.windSpeed || 0) * 0.5;
        const driftZ = -cosWind * (this.windSpeed || 0) * 0.5;

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          let x = positions[idx];
          let y = positions[idx + 1];
          let z = positions[idx + 2];

          x += driftX * deltaTime;
          z += driftZ * deltaTime;
          y += Math.sin(x * 0.5 + z * 0.5) * 0.02;

          if (x < -20 || x > 20 || z < -20 || z > 20) {
            if (Math.abs(driftX) > Math.abs(driftZ)) {
              x = driftX > 0 ? -20 : 20;
              z = (Math.random() - 0.5) * 40;
            } else {
              x = (Math.random() - 0.5) * 40;
              z = driftZ > 0 ? -20 : 20;
            }
            y = Math.random() * 8;
          }

          positions[idx] = x;
          positions[idx + 1] = y;
          positions[idx + 2] = z;
        }
        posAttr.needsUpdate = true;
      }
    }
  }

  // [13] Paint the sky dome canvas with a horizon→zenith gradient.
  // factor=0 → night, factor=1 → noon.
  _paintSkyGradient(factor) {
    if (!this._skyCanvas || !this._skyTexture) return;
    const ctx = this._skyCanvas.getContext('2d');
    const h = this._skyCanvas.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h);

    // Zenith colour: deep night → clear noon blue
    const zenithNight = [2, 4, 10];
    const zenithDay = [14, 42, 90];
    const zR = Math.round(zenithNight[0] + (zenithDay[0] - zenithNight[0]) * factor);
    const zG = Math.round(zenithNight[1] + (zenithDay[1] - zenithNight[1]) * factor);
    const zB = Math.round(zenithNight[2] + (zenithDay[2] - zenithNight[2]) * factor);

    // Horizon colour: slightly lighter, warm orange tint at sunrise/sunset
    const tHorizon = Math.sin(factor * Math.PI); // peaks at factor=0.5 (sunrise/set)
    const hR = Math.round(zR + 60 * tHorizon);
    const hG = Math.round(zG + 20 * tHorizon);
    const hB = Math.round(zB + 10 * tHorizon);

    grad.addColorStop(0, `rgb(${zR},${zG},${zB})`);
    grad.addColorStop(1, `rgb(${Math.min(255, hR)},${Math.min(255, hG)},${Math.min(255, hB)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, h);
    this._skyTexture.needsUpdate = true;
  }

  updateDayNightEngine() {
    if (!this.initialized || !this.scene) return;

    if (this.config.show_daynight === false) {
      if (this.ambientLight) {
        // [4] HemisphereLight: sky colour stays neutral night blue
        this.ambientLight.color.setHex(0x334155);
        (this.ambientLight as any).groundColor?.setHex(0x0a1120);
        this.ambientLight.intensity = 1.5;
      }
      if (this.dirLight) {
        this.dirLight.color.setHex(0x38bdf8);
        this.dirLight.intensity = 1.0;
        this.dirLight.position.set(5, 10, 7);
      }
      if (this.starField && this.starField.material) {
        this.starField.material.opacity = 0.6;
        this.starField.visible = true;
      }
      const defaultBg = new THREE.Color(0x02040a);
      if (this.renderer) {
        this.renderer.setClearColor(defaultBg, 1);
      }
      if (this.scene.fog) {
        this.scene.fog.color.copy(defaultBg);
      }
      this._paintSkyGradient(0);
      return;
    }

    let factor = 1.0;
    if (this._hass && this._hass.states['sun.sun']) {
      const sunState = this._hass.states['sun.sun'];
      const elevation = sunState.attributes.elevation !== undefined ? parseFloat(sunState.attributes.elevation) : 0;
      if (elevation > 0) {
        factor = 1.0;
      } else if (elevation < -6) {
        factor = 0.0;
      } else {
        factor = (elevation + 6) / 6.0;
      }
    } else {
      // Fallback if sun.sun is unavailable
      const rad = this.solarRadiation !== undefined ? this.solarRadiation : 1000.0;
      factor = Math.max(0.0, Math.min(1.0, rad / 1000.0));
    }

    // [4] HemisphereLight sky/ground colours follow day/night factor
    if (this.ambientLight) {
      const nightSky = new THREE.Color(0x334155);
      const daySky = new THREE.Color(0xbfdbfe); // pale sky blue
      const nightGround = new THREE.Color(0x0a1120);
      const dayGround = new THREE.Color(0x1e3a1e); // dark green-earth
      this.ambientLight.color.copy(nightSky).lerp(daySky, factor);
      if ((this.ambientLight as any).groundColor) {
        (this.ambientLight as any).groundColor.copy(nightGround).lerp(dayGround, factor);
      }
      const minB = this.config.min_brightness !== undefined ? parseFloat(this.config.min_brightness) : 0.8;
      this.ambientLight.intensity = minB + factor * (1.5 - minB);
    }

    if (this.dirLight) {
      this.dirLight.intensity = factor * 1.5;
      const angle = factor * Math.PI - Math.PI / 2;
      const x = 15 * Math.sin(angle);
      const y = 15 * Math.cos(angle);
      const z = 7;
      this.dirLight.position.set(x, y, z);

      const sunColor = new THREE.Color(0xffa500);
      const noonColor = new THREE.Color(0xfef08a);
      this.dirLight.color.copy(sunColor).lerp(noonColor, factor);
    }

    if (this.starField && this.starField.material) {
      this.starField.material.opacity = 0.8 * (1.0 - factor);
      this.starField.visible = this.starField.material.opacity > 0.01;
    }

    const nightBg = new THREE.Color(0x02040a);
    const dayBg = new THREE.Color(0x081325);
    const bg = nightBg.clone().lerp(dayBg, factor);

    if (this.renderer) {
      this.renderer.setClearColor(bg, 1);
    }

    // [12] Fog density: thicker at dusk/dawn (factor≈0.5), thinner at noon
    if (this.scene.fog) {
      this.scene.fog.color.copy(bg);
      const fogNight = 0.008;
      const fogDay = 0.003;
      const fogDusk = 0.01; // peaks at sunrise/sunset
      const tDusk = Math.sin(factor * Math.PI);
      const baseDensity = fogNight + (fogDay - fogNight) * factor;
      (this.scene.fog as any).density = baseDensity + (fogDusk - fogNight) * tDusk * 0.5;
    }

    // [13] Repaint sky dome gradient
    this._paintSkyGradient(factor);
  }

  animateLoop() {
    if (!this.initialized) return;
    this.animationFrameId = requestAnimationFrame(() => this.animateLoop());

    this.tickPlayback();

    const now = Date.now();
    const deltaTime = this.lastFrameTime ? (now - this.lastFrameTime) / 1000.0 : 0.016;
    this.lastFrameTime = now;

    this.updateWeatherSystem(deltaTime);

    // Idle camera orbit
    if (this.config.auto_orbit !== false && now - this.lastInteractionTime > 8000) {
      this.cameraTheta += 0.0005;
      this.updateCameraPosition();
    }

    // Update heatmap
    if (this.config.show_heatmap !== false) {
      this.updateHeatmap();
    } else {
      if (this.heatmapMeshes && this.heatmapMeshes.size > 0) {
        for (const hm of this.heatmapMeshes.values()) {
          this.scene.remove(hm.mesh);
          if (hm.material) hm.material.dispose();
        }
        this.heatmapMeshes.clear();
      }
    }

    if (this.starField) this.starField.rotation.y += 0.0001;

    if (this.stationMeshes) {
      this.stationMeshes.forEach((sm) => {
        sm.pulseVal += 0.04;
        const sinVal = Math.sin(sm.pulseVal);
        let scale = 1 + sinVal * 0.1;
        let baseOpacity = 0.5 + sinVal * 0.3;

        // If a strike was recorded, apply flash/glow effect to the station
        if (sm.strikeIntensity && sm.strikeIntensity > 0) {
          sm.strikeIntensity -= 0.02; // decay over ~1s
          const flashScale = 1.0 + sm.strikeIntensity * 1.5;
          scale *= flashScale;
          baseOpacity = Math.min(1.0, baseOpacity + sm.strikeIntensity * 0.5);

          // Flash top sphere (index 2) white and scale it up
          if (sm.mesh.children && sm.mesh.children[2]) {
            sm.mesh.children[2].scale.set(flashScale, flashScale, flashScale);
            sm.mesh.children[2].material.color.setHex(0xffffff);
          }
          // Flash tower cylinder (index 1) white
          if (sm.mesh.children && sm.mesh.children[1]) {
            sm.mesh.children[1].material.color.setHex(0xffffff);
          }
        } else {
          // Reset colors and scale to original station color
          const originalColor = sm.mesh.userData.station.color;
          if (sm.mesh.children && sm.mesh.children[2]) {
            sm.mesh.children[2].scale.set(1, 1, 1);
            sm.mesh.children[2].material.color.setHex(originalColor);
          }
          if (sm.mesh.children && sm.mesh.children[1]) {
            sm.mesh.children[1].scale.set(1, 1, 1);
            sm.mesh.children[1].material.color.setHex(originalColor);
          }
        }

        if (sm.mesh.children && sm.mesh.children[0]) {
          sm.mesh.children[0].scale.set(scale, scale, 1);
          sm.mesh.children[0].material.opacity = baseOpacity;
        }
      });
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  createPlaybackControls() {
    const style = document.createElement('style');
    style.textContent = `
      .timeline-slider {
        -webkit-appearance: none;
        appearance: none;
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: #1e293b;
        outline: none;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .timeline-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #38bdf8;
        cursor: pointer;
        box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        transition: transform 0.1s ease;
      }
      .timeline-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      .timeline-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border: none;
        border-radius: 50%;
        background: #38bdf8;
        cursor: pointer;
        box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        transition: transform 0.1s ease;
      }
      .timeline-slider::-moz-range-thumb:hover {
        transform: scale(1.2);
      }
      .play-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #38bdf8;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none;
        transition: transform 0.15s ease;
      }
      .play-btn:hover {
        transform: scale(1.2);
      }
      .speed-select {
        background: #0f172a;
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 500;
        outline: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .speed-select:hover {
        border-color: #38bdf8;
        background: #1e293b;
        box-shadow: 0 0 6px rgba(56, 189, 248, 0.2);
      }
      .speed-select:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
      }
      .speed-select option {
        background: #080c14;
        color: #e2e8f0;
      }
    `;
    this.wrapper.appendChild(style);

    this.controls = document.createElement('div');
    this.controls.style.display = 'flex';
    this.controls.style.alignItems = 'center';
    this.controls.style.padding = '8px 12px';
    this.controls.style.backgroundColor = '#080c14';
    this.controls.style.borderTop = '1px solid rgba(56, 189, 248, 0.1)';
    this.controls.style.gap = '12px';
    this.controls.style.fontFamily = 'var(--paper-font-body1_-_font-family, inherit)';
    this.controls.style.color = '#e2e8f0';
    this.wrapper.appendChild(this.controls);

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'play-btn';
    this.playBtn.innerHTML = this.getPlayIcon();
    this.controls.appendChild(this.playBtn);

    this.slider = document.createElement('input');
    this.slider.type = 'range';
    this.slider.className = 'timeline-slider';
    this.slider.min = '0';
    this.slider.max = '1000';
    this.slider.value = '1000';
    this.controls.appendChild(this.slider);

    this.speedSelect = document.createElement('select');
    this.speedSelect.className = 'speed-select';
    const speeds = [1, 5, 10, 30, 60, 120, 300, 600];
    if (!speeds.includes(this.playbackSpeed)) {
      speeds.push(this.playbackSpeed);
      speeds.sort((a, b) => a - b);
    }
    speeds.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.toString();
      opt.innerText = `${s}x`;
      if (s === this.playbackSpeed) {
        opt.selected = true;
      }
      this.speedSelect.appendChild(opt);
    });
    this.controls.appendChild(this.speedSelect);

    this.timeLabel = document.createElement('span');
    this.timeLabel.style.fontSize = '12px';
    this.timeLabel.style.minWidth = '130px';
    this.timeLabel.style.textAlign = 'right';
    this.timeLabel.style.color = '#94a3b8';
    this.timeLabel.style.fontVariantNumeric = 'tabular-nums';
    this.timeLabel.innerText = 'Live';
    this.controls.appendChild(this.timeLabel);

    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.slider.addEventListener('input', (e) => this.handleSliderInput(e));
    this.slider.addEventListener('change', () => this.handleSliderChange());
    this.speedSelect.addEventListener('change', (e) => {
      this.playbackSpeed = parseFloat((e.target as HTMLSelectElement).value) || 120;
    });
  }

  getPlayIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>`;
  }

  getPauseIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>`;
  }

  tickPlayback() {
    const minTime =
      this.strikeHistory.length > 0 ? Math.min(Date.now() - 3600000, this.strikeHistory[0].time) : Date.now() - 3600000;
    const maxTime = Date.now();

    if (this.slider) this.slider.disabled = false;

    if (this.playbackMode === 'live') {
      this.playbackTime = maxTime;
      if (this.slider) {
        this.slider.min = minTime.toString();
        this.slider.max = maxTime.toString();
        this.slider.value = maxTime.toString();
      }
      if (this.timeLabel) this.timeLabel.innerText = 'Live';
    } else {
      if (this.isPlaying) {
        const now = Date.now();
        const dt = now - (this.lastPlayTickTime || now);
        this.lastPlayTickTime = now;

        this.playbackTime += dt * this.playbackSpeed;

        if (this.playbackTime >= maxTime) {
          this.playbackTime = maxTime;
          this.setLiveMode();
        } else {
          if (this.slider) {
            this.slider.min = minTime.toString();
            this.slider.max = maxTime.toString();
            this.slider.value = this.playbackTime.toString();
          }
          this.updateTimeLabel();
          this.checkAndTriggerPlaybackStrikes();
        }
      } else {
        if (this.slider) {
          this.slider.min = minTime.toString();
          this.slider.max = maxTime.toString();
        }
        this.updateTimeLabel();
      }
    }
  }

  togglePlay() {
    const minTime =
      this.strikeHistory.length > 0 ? Math.min(Date.now() - 3600000, this.strikeHistory[0].time) : Date.now() - 3600000;
    if (this.playbackMode === 'live') {
      this.playbackMode = 'playback';
      this.isPlaying = true;
      this.lastPlayTickTime = Date.now();
      this.playbackTime = minTime;
      this.strikeHistory.forEach((s) => {
        s.animated = s.time <= this.playbackTime;
      });
    } else {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.lastPlayTickTime = Date.now();
        if (this.playbackTime >= Date.now()) {
          this.playbackTime = minTime;
          this.strikeHistory.forEach((s) => {
            s.animated = s.time <= this.playbackTime;
          });
        }
      }
    }
    this.updatePlayBtnIcon();
  }

  setLiveMode() {
    this.playbackMode = 'live';
    this.isPlaying = false;
    this.updatePlayBtnIcon();
    if (this.slider) {
      this.slider.value = Date.now();
    }
    if (this.timeLabel) {
      this.timeLabel.innerText = 'Live';
    }
    this.strikeHistory.forEach((s) => (s.animated = true));
  }

  updatePlayBtnIcon() {
    if (this.isPlaying) {
      this.playBtn.innerHTML = this.getPauseIcon();
      this.playBtn.style.color = '#ef4444';
    } else {
      this.playBtn.innerHTML = this.getPlayIcon();
      this.playBtn.style.color = '#38bdf8';
    }
  }

  updateTimeLabel() {
    const date = new Date(this.playbackTime);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const diffSecs = Math.round((Date.now() - this.playbackTime) / 1000);
    let relStr = '';
    if (diffSecs < 60) {
      relStr = `-${diffSecs}s`;
    } else {
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      relStr = `-${mins}m ${secs}s`;
    }

    if (this.timeLabel) {
      this.timeLabel.innerText = `${timeStr} (${relStr})`;
    }
  }

  handleSliderInput(e) {
    this.playbackMode = 'playback';
    this.isPlaying = false;
    this.playbackTime = parseFloat(e.target.value);
    this.updatePlayBtnIcon();
    this.updateTimeLabel();

    this.strikeHistory.forEach((strike) => {
      if (strike.time <= this.playbackTime) {
        strike.animated = true;
      } else {
        strike.animated = false;
      }
    });
  }

  handleSliderChange() {
    // Left empty for potential future hooks on slider release
  }

  checkAndTriggerPlaybackStrikes() {
    this.strikeHistory.forEach((strike) => {
      if (strike.time <= this.playbackTime) {
        if (!strike.animated) {
          strike.animated = true;
          this.triggerStrikeAnimation(strike.x, strike.z);
        }
      } else {
        strike.animated = false;
      }
    });
  }

  createLightningPath(start, end, segments = 10) {
    const points = [];
    const dir = new THREE.Vector3().subVectors(end, start);
    points.push(start.clone());

    for (let i = 1; i < segments; i++) {
      const fraction = i / segments;
      const point = new THREE.Vector3().addVectors(start, dir.clone().multiplyScalar(fraction));
      const offsetAmount = (1.0 - fraction) * 1.0;
      point.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * offsetAmount,
          (Math.random() - 0.5) * offsetAmount,
          (Math.random() - 0.5) * offsetAmount
        )
      );
      points.push(point);
    }

    points.push(end.clone());
    return points;
  }

  createLightningBranches(start, end, segments = 8) {
    const mainPath = this.createLightningPath(start, end, segments);
    const paths = [mainPath];

    for (let i = 1; i < mainPath.length - 2; i++) {
      if (Math.random() < 0.25) {
        const branchStart = mainPath[i].clone();
        const remainingFraction = 1.0 - i / mainPath.length;
        const branchLength = remainingFraction * 6.0;

        const dir = new THREE.Vector3().subVectors(end, start).normalize();
        dir.add(new THREE.Vector3((Math.random() - 0.5) * 1.5, -0.2, (Math.random() - 0.5) * 1.5)).normalize();

        const branchEnd = new THREE.Vector3().addVectors(branchStart, dir.multiplyScalar(branchLength));
        const branchPath = this.createLightningPath(branchStart, branchEnd, 4);
        paths.push(branchPath);
      }
    }
    return paths;
  }

  triggerStrikeAnimation(x, z) {
    if (!this.initialized) return;

    const terrainY = this.getTerrainHeight(x, z);
    const targetPos = new THREE.Vector3(x, terrainY, z);
    const startPos = new THREE.Vector3(x + (Math.random() - 0.5) * 4, terrainY + 18, z + (Math.random() - 0.5) * 4);

    if (this.stationMeshes) {
      this.stationMeshes.forEach((sm) => {
        sm.strikeIntensity = 1.0;
      });
    }

    // [6] Screen-flash: spike ambient intensity to simulate sky illumination
    if (this.ambientLight) {
      const preFlashIntensity = this.ambientLight.intensity;
      this.ambientLight.intensity = 4.0;
      let flashFrame = 0;
      const decayFlash = () => {
        flashFrame++;
        this.ambientLight.intensity = Math.max(preFlashIntensity, 4.0 * (1.0 - flashFrame / 8));
        if (flashFrame < 8) requestAnimationFrame(decayFlash);
      };
      requestAnimationFrame(decayFlash);
    }

    // [5] Tube geometry bolts — visible at all zoom levels, true 3D volume
    const lines = [];
    const paths = this.createLightningBranches(startPos, targetPos);

    paths.forEach((path, pathIdx) => {
      const curve = new THREE.CatmullRomCurve3(path);
      const isMain = pathIdx === 0;
      const tubeGeo = new THREE.TubeGeometry(
        curve,
        Math.max(10, path.length * 3), // segments
        isMain ? 0.06 : 0.03, // radius (km)
        5, // radial segments
        false
      );
      const tubeMat = new THREE.MeshStandardMaterial({
        color: isMain ? 0xffffff : 0xffe066,
        emissive: isMain ? 0xffd700 : 0xffb300,
        emissiveIntensity: isMain ? 3.0 : 1.5,
        transparent: true,
        opacity: isMain ? 1.0 : 0.75,
        depthWrite: false
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      this.strikeLayer.add(tube);
      lines.push(tube);
    });

    // Volumetric Glow Sprite
    const spriteMat = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const glowSprite = new THREE.Sprite(spriteMat);
    glowSprite.position.copy(targetPos);
    glowSprite.position.y += 0.1; // Float slightly above terrain
    glowSprite.scale.set(0.1, 0.1, 1);
    this.strikeLayer.add(glowSprite);

    // Expanding Wave Ring
    const waveGeo = new THREE.RingGeometry(0.1, 0.2, 32);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.position.copy(targetPos);
    wave.position.y += 0.05; // Float slightly above terrain
    wave.rotation.x = -Math.PI / 2;
    this.strikeLayer.add(wave);

    // Trilateration domes/circles
    const domes = [];
    this.stations.forEach((st) => {
      const stY = this.getTerrainHeight(st.x, st.z);
      const stPos = new THREE.Vector3(st.x, stY, st.z);
      const dist = stPos.distanceTo(targetPos);
      const ringGeo = new THREE.RingGeometry(dist - 0.08, dist + 0.08, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: st.color,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(stPos);
      ring.position.y += 0.05; // Float slightly above terrain
      ring.rotation.x = -Math.PI / 2;
      this.strikeLayer.add(ring);
      domes.push({ mesh: ring, targetOpacity: 0.5 });
    });

    let progress = 0;
    const duration = 60;

    const animateSequence = () => {
      progress++;
      const frac = progress / duration;

      if (frac < 0.2) {
        lines.forEach((l) => (l.material.opacity = Math.random() > 0.3 ? 1.0 : 0.2));
      } else if (frac < 0.5) {
        lines.forEach((l) => {
          l.material.opacity = 1.0 - (frac - 0.2) / 0.3;
        });
      } else {
        lines.forEach((l) => {
          if (l.parent) {
            this.strikeLayer.remove(l);
            if (l.geometry) l.geometry.dispose();
            if (l.material) l.material.dispose();
          }
        });
      }

      if (frac < 0.6) {
        const spriteScale = frac * 12.0;
        glowSprite.scale.set(spriteScale, spriteScale, 1);
        glowSprite.material.opacity = 1.0 * (1.0 - frac / 0.6);
      } else {
        if (glowSprite.parent) {
          this.strikeLayer.remove(glowSprite);
          glowSprite.material.dispose();
        }
      }

      if (frac < 0.8) {
        const scale = 1 + frac * 25;
        wave.scale.set(scale, scale, 1);
        wave.material.opacity = 0.8 * (1 - frac / 0.8);
      } else {
        if (wave.parent) {
          this.strikeLayer.remove(wave);
          if (wave.geometry) wave.geometry.dispose();
          if (wave.material) wave.material.dispose();
        }
      }

      domes.forEach((d) => {
        if (frac < 0.3) {
          d.mesh.material.opacity = d.targetOpacity * (frac / 0.3);
        } else if (frac < 0.9) {
          d.mesh.material.opacity = d.targetOpacity * (1 - (frac - 0.3) / 0.6);
        } else {
          if (d.mesh.parent) {
            this.strikeLayer.remove(d.mesh);
            if (d.mesh.geometry) d.mesh.geometry.dispose();
            if (d.mesh.material) d.mesh.material.dispose();
          }
        }
      });

      if (progress < duration) {
        requestAnimationFrame(animateSequence);
      }
    };

    animateSequence();
  }

  set hass(hass) {
    this._hass = hass;
    if (!hass || !this.initialized) return;

    // Find the station sensor (prefer configured entity, fallback to auto-detection)
    const stationsSensorId =
      this.config.entity ||
      this.config.entity_id ||
      Object.keys(hass.states).find(
        (key) =>
          key.startsWith('sensor.') &&
          key.endsWith('_stations') &&
          hass.states[key].attributes.stations !== undefined &&
          hass.states[key].attributes.icon === 'mdi:lightning-bolt'
      ) ||
      Object.keys(hass.states).find(
        (key) => key.startsWith('sensor.') && hass.states[key].attributes.stations !== undefined
      );

    let refLat = hass.config.latitude;
    let refLon = hass.config.longitude;
    console.log('WeatherFlow Card: Home coordinates:', refLat, refLon);

    if (stationsSensorId) {
      const attrs = hass.states[stationsSensorId].attributes;
      const stationsAttr = attrs.stations;
      if (Array.isArray(stationsAttr)) {
        const primaryStation = stationsAttr.find((st: any) => st.type === 'primary');
        if (primaryStation && primaryStation.latitude !== undefined && primaryStation.longitude !== undefined) {
          const latVal = parseFloat(primaryStation.latitude);
          const lonVal = parseFloat(primaryStation.longitude);
          if (!isNaN(latVal) && !isNaN(lonVal)) {
            refLat = latVal;
            refLon = lonVal;
            console.log('WeatherFlow Card: Resolved primary station coordinate:', refLat, refLon);
          } else {
            console.warn(
              'WeatherFlow Card: Parsed primary station coordinates are NaN:',
              primaryStation.latitude,
              primaryStation.longitude
            );
          }
        } else {
          console.warn('WeatherFlow Card: No primary station found in stations list:', stationsAttr);
        }
      } else {
        console.warn('WeatherFlow Card: stationsAttr is not an array:', stationsAttr);
      }
    } else {
      console.warn('WeatherFlow Card: stationsSensorId not found');
    }

    // Load/Cache CartoDB Dark Matter map texture
    if (this.lastRefLat !== refLat || this.lastRefLon !== refLon) {
      console.log(
        'WeatherFlow Card: Reference coordinates changed from',
        this.lastRefLat,
        this.lastRefLon,
        'to',
        refLat,
        refLon
      );
      this.lastRefLat = refLat;
      this.lastRefLon = refLon;
      this.loadMapTexture(refLat, refLon);
      this.vectorDataLoaded = false;
    }

    if (this.config.show_3d_features && !this.vectorDataLoading && !this.vectorDataLoaded) {
      this.loadVectorData(refLat, refLon);
    }

    if (stationsSensorId) {
      // Process elevation grid updates first
      const elevationGrid = hass.states[stationsSensorId].attributes.elevation_grid;
      if (elevationGrid && JSON.stringify(elevationGrid) !== JSON.stringify(this.elevationGrid)) {
        this.updateTerrainGeometry(elevationGrid);
      }

      const attrs = hass.states[stationsSensorId].attributes;
      this.windSpeed = attrs.wind_speed !== undefined ? parseFloat(attrs.wind_speed) : 0.0;
      this.windDirection = attrs.wind_direction !== undefined ? parseFloat(attrs.wind_direction) : 0.0;
      this.solarRadiation = attrs.solar_radiation !== undefined ? parseFloat(attrs.solar_radiation) : 1000.0;
      this.rainRate = attrs.rain_rate !== undefined ? parseFloat(attrs.rain_rate) : 0.0;

      this.updateDayNightEngine();
      this.updateWeatherOverlay();

      const stationsAttr = attrs.stations;

      if (Array.isArray(stationsAttr)) {
        let stationsChanged = false;

        // Compare existing stations to new ones
        if (this.stations.length !== stationsAttr.length) {
          stationsChanged = true;
        } else {
          // Check if any station changed
          for (let i = 0; i < stationsAttr.length; i++) {
            const oldSt = this.stations.find((s) => s.id === stationsAttr[i].id);
            if (!oldSt) {
              stationsChanged = true;
              break;
            }
          }
        }

        console.log(
          'WeatherFlow Card: Stations changed status:',
          stationsChanged,
          'Current length:',
          this.stations.length,
          'New length:',
          stationsAttr.length
        );

        if (stationsChanged) {
          const R = 6371.0;
          const cosLat = Math.cos((refLat * Math.PI) / 180.0);

          this.stations = stationsAttr.map((st) => {
            const lat = parseFloat(st.latitude);
            const lon = parseFloat(st.longitude);

            const gridX = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
            const gridZ = -R * (lat - refLat) * (Math.PI / 180.0);

            let color = 0x64748b; // subtle blue-gray for discovered/public
            if (st.type === 'primary')
              color = 0x10b981; // vibrant emerald green for local/primary
            else if (st.type === 'neighbor') color = 0x38bdf8; // sky blue for neighbors

            console.log(
              'WeatherFlow Card: Mapped station:',
              st.id,
              'type:',
              st.type,
              'lat:',
              lat,
              'lon:',
              lon,
              'to grid coords:',
              gridX,
              gridZ
            );

            return {
              id: st.id,
              x: gridX,
              z: gridZ,
              color: color,
              type: st.type
            };
          });

          // Remove old meshes
          if (this.stationMeshes) {
            console.log('WeatherFlow Card: Removing', this.stationMeshes.length, 'old meshes');
            this.stationMeshes.forEach((sm) => {
              this.scene.remove(sm.mesh);
            });
          }

          // Re-add meshes
          this.addWeatherStations();
        }
      }
    }

    // Detect lightning strike entities from the trilateration integration
    const sourceNamespace = 'weatherflow_lightning_trilateration';
    const strikes = Object.keys(hass.states).filter(
      (key) => key.startsWith('geo_location.') && hass.states[key].attributes.source === sourceNamespace
    );

    const R = 6371.0;
    const cosLat = Math.cos((refLat * Math.PI) / 180.0);

    const activeStrikes = [];
    strikes.forEach((entityId) => {
      const stateObj = hass.states[entityId];
      const lat = parseFloat(stateObj.attributes.latitude);
      const lon = parseFloat(stateObj.attributes.longitude);

      if (!isNaN(lat) && !isNaN(lon)) {
        const gridX = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
        const gridZ = -R * (lat - refLat) * (Math.PI / 180.0);
        const time = new Date(stateObj.last_changed).getTime();
        activeStrikes.push({
          id: entityId,
          time: time,
          x: gridX,
          z: gridZ
        });
      }
    });

    // Sort strikes by time ascending
    activeStrikes.sort((a, b) => a.time - b.time);

    // Sync activeStrikes with this.strikeHistory
    activeStrikes.forEach((strike) => {
      if (!this.strikeHistory.some((s) => s.id === strike.id)) {
        const isNewToCard = !this.knownStrikes.has(strike.id);
        if (isNewToCard) {
          this.knownStrikes.add(strike.id);
        }

        const shouldAnimateNow = this.playbackMode === 'live' && isNewToCard;

        this.strikeHistory.push({
          id: strike.id,
          time: strike.time,
          x: strike.x,
          z: strike.z,
          animated: shouldAnimateNow || (this.playbackMode !== 'live' && strike.time <= this.playbackTime)
        });

        if (shouldAnimateNow) {
          this.triggerStrikeAnimation(strike.x, strike.z);
        }
      }
    });

    // Evict items from strikeHistory that are no longer in activeStrikes
    this.strikeHistory = this.strikeHistory.filter((s) => activeStrikes.some((as) => as.id === s.id));
    this.strikeHistory.sort((a, b) => a.time - b.time);

    // Cleanup old/removed entities from tracked set
    for (const id of this.knownStrikes) {
      if (!hass.states[id]) {
        this.knownStrikes.delete(id);
      }
    }
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('weatherflow-lightning-card', WeatherFlowLightningCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'weatherflow-lightning-card',
  name: 'WeatherFlow Lightning Trilateration Card',
  description: 'WebGL 3D visualizer showing real-time lightning strike trilaterations.'
});

class WeatherFlowLightningCardEditor extends HTMLElement {
  [key: string]: any;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    if (!this._initializedEditor) {
      this.render();
      this._initializedEditor = true;
    } else {
      const heightInput = this.shadowRoot.getElementById('height') as HTMLInputElement;
      if (heightInput) {
        heightInput.value = this._config.height || '350px';
      }
      const zoomInput = this.shadowRoot.getElementById('zoom_level') as HTMLInputElement;
      if (zoomInput) {
        zoomInput.value = this._config.zoom_level !== undefined ? this._config.zoom_level : '18.0';
      }
      const showGridInput = this.shadowRoot.getElementById('show_grid') as HTMLInputElement;
      if (showGridInput) {
        showGridInput.checked = this._config.show_grid !== false;
      }
      const showMapInput = this.shadowRoot.getElementById('show_map') as HTMLInputElement;
      if (showMapInput) {
        showMapInput.checked = this._config.show_map !== false;
      }
      const showRingsInput = this.shadowRoot.getElementById('show_rings') as HTMLInputElement;
      if (showRingsInput) {
        showRingsInput.checked = this._config.show_rings !== false;
      }
      const showHeatmapInput = this.shadowRoot.getElementById('show_heatmap') as HTMLInputElement;
      if (showHeatmapInput) {
        showHeatmapInput.checked = this._config.show_heatmap !== false;
      }
      const autoOrbitInput = this.shadowRoot.getElementById('auto_orbit') as HTMLInputElement;
      if (autoOrbitInput) {
        autoOrbitInput.checked = this._config.auto_orbit !== false;
      }
      const showWeatherInput = this.shadowRoot.getElementById('show_weather') as HTMLInputElement;
      if (showWeatherInput) {
        showWeatherInput.checked = this._config.show_weather !== false;
      }
      const showDayNightInput = this.shadowRoot.getElementById('show_daynight') as HTMLInputElement;
      if (showDayNightInput) {
        showDayNightInput.checked = this._config.show_daynight !== false;
      }
      const minBrightnessInput = this.shadowRoot.getElementById('min_brightness') as HTMLInputElement;
      if (minBrightnessInput) {
        minBrightnessInput.value = this._config.min_brightness !== undefined ? this._config.min_brightness : '0.8';
      }
      const elevationScaleInput = this.shadowRoot.getElementById('elevation_scale') as HTMLInputElement;
      if (elevationScaleInput) {
        elevationScaleInput.value = this._config.elevation_scale !== undefined ? this._config.elevation_scale : '1.5';
      }
      const show3DFeaturesInput = this.shadowRoot.getElementById('show_3d_features') as HTMLInputElement;
      if (show3DFeaturesInput) {
        show3DFeaturesInput.checked = this._config.show_3d_features === true;
      }
      const playbackSpeedInput = this.shadowRoot.getElementById('playback_speed') as HTMLInputElement;
      if (playbackSpeedInput) {
        playbackSpeedInput.value =
          this._config.playback_speed !== undefined ? this._config.playback_speed.toString() : '120';
      }
      this._syncEntityPicker();
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._syncEntityPicker();
  }

  render() {
    if (!this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        .card-config {
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-family: var(--paper-font-body1_-_font-family, inherit);
        }
        .config-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .paper-input-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        label {
          color: var(--secondary-text-color, #727272);
          font-size: 13px;
        }
        input[type="text"] {
          padding: 8px;
          background: var(--card-background-color, transparent);
          color: var(--primary-text-color, #212121);
          border: 0;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
          font-family: inherit;
        }
        input[type="text"]:focus {
          outline: none;
          border-bottom: 2px solid var(--primary-color, #03a9f4);
        }
        /* Custom toggle switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .2s;
          border-radius: 20px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 14px;
          width: 14px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .2s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--primary-color, #03a9f4);
        }
        input:checked + .slider:before {
          transform: translateX(16px);
        }
        .section-header {
          font-weight: bold;
          font-size: 12px;
          color: var(--primary-color, #03a9f4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 18px;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        }
        .section-header:first-of-type {
          margin-top: 0;
        }
      </style>
      <div class="card-config">
        <div class="section-header">General Settings</div>
        
        <div class="paper-input-container">
          <label>Instance</label>
          <ha-entity-picker
            id="entity_id_picker"
            allow-custom-entity
            style="display:block;"
          ></ha-entity-picker>
          <div style="font-size:11px;color:var(--secondary-text-color,#727272);margin-top:2px;">Only shows WeatherFlow trilateration station sensors</div>
        </div>
        <div class="paper-input-container">
          <label for="title">Card Title (optional)</label>
          <input type="text" id="title" value="${this._config.title || ''}">
        </div>
        <div class="paper-input-container">
          <label for="height">Card Height (e.g. 350px)</label>
          <input type="text" id="height" value="${this._config.height || '350px'}">
        </div>
        <div class="paper-input-container">
          <label for="zoom_level">Default Zoom Radius (2-150)</label>
          <input type="text" id="zoom_level" value="${this._config.zoom_level !== undefined ? this._config.zoom_level : '18.0'}">
        </div>
        <div class="paper-input-container">
          <label for="playback_speed">Default Playback Speed Multiplier</label>
          <input type="text" id="playback_speed" value="${this._config.playback_speed !== undefined ? this._config.playback_speed : '120'}">
        </div>
        <div class="config-row">
          <label for="auto_orbit">Enable Idle Camera Orbit</label>
          <label class="switch">
            <input type="checkbox" id="auto_orbit" ${this._config.auto_orbit !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="section-header">Terrain & Map Layers</div>
        
        <div class="config-row">
          <label for="show_grid">Show Terrain Grid Overlay</label>
          <label class="switch">
            <input type="checkbox" id="show_grid" ${this._config.show_grid !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_map">Show Ground Map Texture</label>
          <label class="switch">
            <input type="checkbox" id="show_map" ${this._config.show_map !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_rings">Show Range Rings & Crosshairs</label>
          <label class="switch">
            <input type="checkbox" id="show_rings" ${this._config.show_rings !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="paper-input-container">
          <label for="elevation_scale">Vertical Terrain Exaggeration Scale (0.0 to 10.0)</label>
          <input type="text" id="elevation_scale" value="${this._config.elevation_scale !== undefined ? this._config.elevation_scale : '1.5'}">
        </div>
        <div class="config-row">
          <label for="show_3d_features">Show 3D Vector Features (Experimental Lakes & Forests)</label>
          <label class="switch">
            <input type="checkbox" id="show_3d_features" ${this._config.show_3d_features === true ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="section-header">Atmospheric & Telemetry Simulations</div>
        
        <div class="config-row">
          <label for="show_weather">Show Weather Telemetry (Precipitation & Wind)</label>
          <label class="switch">
            <input type="checkbox" id="show_weather" ${this._config.show_weather !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_daynight">Show Day/Night Solar Engine</label>
          <label class="switch">
            <input type="checkbox" id="show_daynight" ${this._config.show_daynight !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="paper-input-container">
          <label for="min_brightness">Min Night Ambient Brightness (0.1 - 1.5)</label>
          <input type="text" id="min_brightness" value="${this._config.min_brightness !== undefined ? this._config.min_brightness : '0.8'}">
        </div>
        <div class="config-row">
          <label for="show_heatmap">Show Storm Path Heatmap</label>
          <label class="switch">
            <input type="checkbox" id="show_heatmap" ${this._config.show_heatmap !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => this.toggleChanged(e));
    });

    this.shadowRoot.querySelectorAll('input[type="text"]').forEach((input) => {
      input.addEventListener('input', (e) => this.textChanged(e));
    });

    const picker = this.shadowRoot.getElementById('entity_id_picker') as any;
    if (picker) {
      picker.addEventListener('value-changed', (e: CustomEvent) => {
        const val: string | null = e.detail && e.detail.value != null ? e.detail.value : null;
        this._onEntityPicked(val);
      });
    }
    this._syncEntityPicker();
  }

  toggleChanged(e) {
    if (!this._config) return;
    const target = e.target;
    this.dispatchConfigChange(target.id, target.checked);
  }

  textChanged(e) {
    if (!this._config) return;
    const target = e.target;
    let value = target.value;
    if (
      target.id === 'zoom_level' ||
      target.id === 'min_brightness' ||
      target.id === 'elevation_scale' ||
      target.id === 'playback_speed'
    ) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        value = parsed;
      }
    }
    this.dispatchConfigChange(target.id, value);
  }

  _syncEntityPicker() {
    if (!this.shadowRoot) return;
    const picker = this.shadowRoot.getElementById('entity_id_picker') as any;
    if (!picker) return;
    picker.hass = this._hass;
    // Filter to only weatherflow trilateration station sensors
    picker.entityFilter = (entity: any) =>
      entity.attributes && Array.isArray(entity.attributes.stations) && entity.attributes.icon === 'mdi:lightning-bolt';
    const current =
      this._config && (this._config.entity || this._config.entity_id)
        ? this._config.entity || this._config.entity_id
        : null;
    if (picker.value !== current) {
      picker.value = current;
    }
  }

  _onEntityPicked(entityId: string | null) {
    // Auto-derive entry_id from the sensor unique_id pattern: sensor.<entry_id>_stations
    let entry_id: string | undefined;
    if (entityId && entityId.startsWith('sensor.') && entityId.endsWith('_stations')) {
      entry_id = entityId.slice('sensor.'.length, -'_stations'.length);
    }
    const newConfig = {
      ...this._config,
      entity: entityId || undefined,
      entity_id: entityId || undefined,
      entry_id: entry_id || undefined
    };
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
        composed: true
      })
    );
  }

  dispatchConfigChange(key, value) {
    if (this._config[key] === value) return;
    const newConfig = {
      ...this._config,
      [key]: value
    };
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('weatherflow-lightning-card-editor', WeatherFlowLightningCardEditor);

export {};
