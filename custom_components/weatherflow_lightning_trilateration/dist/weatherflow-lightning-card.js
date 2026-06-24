class WeatherFlowLightningCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.initialized = false;
    this.knownStrikes = new Set();
    this.stations = [
      { id: "Primary (Home)", x: 0, z: 0, color: 0x10b981 },
      { id: "Neighbor 1", x: 10, z: 10, color: 0x38bdf8 },
      { id: "Neighbor 2", x: -10, z: 10, color: 0x38bdf8 }
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
    return document.createElement("weatherflow-lightning-card-editor");
  }

  static getStubConfig() {
    return {
      height: "350px"
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    const oldConfig = this.config;
    this.config = {
      height: "350px",
      show_grid: true,
      show_map: true,
      show_rings: true,
      show_heatmap: true,
      auto_orbit: true,
      zoom_level: 18.0,
      show_weather: true,
      show_daynight: true,
      ...config
    };
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
    
    if (oldConfig.show_daynight !== this.config.show_daynight) {
      this.updateDayNightEngine();
    }
    
    if (oldConfig.zoom_level !== this.config.zoom_level) {
      const parsed = parseFloat(this.config.zoom_level);
      if (!isNaN(parsed)) {
        this.zoomRadius = parsed;
        this.updateCameraPosition();
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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this._mouseupHandler) {
      window.removeEventListener('mouseup', this._mouseupHandler);
    }
  }

  updateCameraPosition() {
    this.cameraPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, this.cameraPhi));
    this.zoomRadius = Math.max(10, Math.min(150, this.zoomRadius));

    const x = this.zoomRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.zoomRadius * Math.cos(this.cameraPhi);
    const z = this.zoomRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    if (this.camera) {
      this.camera.position.set(x, y, z);
      this.camera.lookAt(0, 0, 0);
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
    this.cameraPhi = Math.atan2(30, 15);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x02040a, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
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

    // Interactive helper variables
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.glowTexture = this.createGlowTexture();
    this.heatGeo = new THREE.SphereGeometry(0.15, 8, 8);
    this.lastInteractionTime = Date.now();

    // Add mouse & touch event listeners for rotation/zoom
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.container.addEventListener('mousedown', (e) => {
      this.lastInteractionTime = Date.now();
      isDragging = true;
      this.container.style.cursor = 'grabbing';
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
      } else {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.checkHover(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    this._mouseupHandler = () => {
      isDragging = false;
      this.container.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', this._mouseupHandler);

    this.container.addEventListener('mouseleave', () => {
      this.hideTooltip();
    });

    this.container.addEventListener('wheel', (e) => {
      this.lastInteractionTime = Date.now();
      this.hideTooltip();
      e.preventDefault();
      this.zoomRadius += e.deltaY * 0.02;
      this.updateCameraPosition();
    }, { passive: false });

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

    this.container.addEventListener('touchmove', (e) => {
      this.lastInteractionTime = Date.now();
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        this.cameraTheta -= deltaX * 0.007;
        this.cameraPhi += deltaY * 0.007;
        this.updateCameraPosition();

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const deltaDist = dist - touchStartDist;
        this.zoomRadius -= deltaDist * 0.15;
        this.updateCameraPosition();
        touchStartDist = dist;
      }
    }, { passive: false });

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
    this.animate();
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
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.2
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      this.rangeRingsGroup.add(ringLine);
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15
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
  }

  getTerrainHeight(x, z) {
    if (!this.elevationGrid || this.elevationGrid.length !== 225) return 0;
    
    const c = (x + 20) * 14 / 40;
    const r = (z + 20) * 14 / 40;
    
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
    if (!this.elevationGrid || this.elevationGrid.length !== 225) return 0;
    const i = 14 - r;
    const j = c;
    const rawElev = this.elevationGrid[i * 15 + j] || 0;
    const centerIndex = 7 * 15 + 7;
    const refElevation = this.elevationGrid[centerIndex] || 0;
    const scaleFactor = 1.5 / 1250.0;
    return (rawElev - refElevation) * scaleFactor;
  }

  generateProceduralTerrain() {
    this.elevationGrid = [];
    const centerIndex = 7 * 15 + 7;
    
    for (let i = 0; i < 15; i++) {
      const x = i - 7;
      for (let j = 0; j < 15; j++) {
        const y = j - 7;
        const dist = Math.sqrt(x*x + y*y);
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

    const posAttr = this.terrainGeo.attributes.position;
    const refElevation = 100;
    const scaleFactor = 1.5 / 1250.0;

    for (let r = 0; r <= 14; r++) {
      const i = 14 - r;
      for (let c = 0; c <= 14; c++) {
        const j = c;
        const vertexIndex = r * 15 + c;
        const rawElev = this.elevationGrid[i * 15 + j] || 0;
        const relElev = (rawElev - refElevation) * scaleFactor;
        posAttr.setZ(vertexIndex, relElev);
      }
    }
    posAttr.needsUpdate = true;
    this.terrainGeo.computeVertexNormals();

    this.updateStationHeights();
    this.updateRangeRings();
  }

  loadMapTexture(refLat, refLon) {
    if (this.config.show_map === false) {
      if (this.terrainMesh && this.terrainMesh.material) {
        this.terrainMesh.material.map = null;
        this.terrainMesh.material.color.setHex(0x050b14);
        this.terrainMesh.material.needsUpdate = true;
      }
      return;
    }
    const zoom = 10;
    const spanKm = 50.0;
    
    const latSpan = spanKm / 111.1;
    const cosLat = Math.cos(refLat * Math.PI / 180.0);
    const lonSpan = cosLat > 0 ? spanKm / (111.1 * cosLat) : spanKm / 111.1;
    
    const minLat = refLat - latSpan / 2;
    const maxLat = refLat + latSpan / 2;
    const minLon = refLon - lonSpan / 2;
    const maxLon = refLon + lonSpan / 2;
    
    const lon2tile = (lon, z) => (lon + 180) / 360 * Math.pow(2, z);
    const lat2tile = (lat, z) => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z);
    const tile2lon = (x, z) => x / Math.pow(2, z) * 360 - 180;
    const tile2lat = (y, z) => Math.atan(Math.sinh(Math.PI - 2 * Math.PI * y / Math.pow(2, z))) * 180 / Math.PI;
    
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
        
        const p = new Promise((resolve) => {
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
      if (this.terrainMesh && this.terrainMesh.material) {
        this.terrainMesh.material.map = texture;
        this.terrainMesh.material.color.setHex(0xffffff); // change to white to prevent multiplication darkening
        this.terrainMesh.material.needsUpdate = true;
      }
    });
  }

  updateTerrainGeometry(elevationGrid) {
    if (!elevationGrid || elevationGrid.length !== 225) {
      this.generateProceduralTerrain();
      return;
    }
    this.elevationGrid = elevationGrid;
    
    const posAttr = this.terrainGeo.attributes.position;
    const centerIndex = 7 * 15 + 7;
    const refElevation = elevationGrid[centerIndex] || 0;
    const scaleFactor = 1.5 / 1250.0;

    for (let r = 0; r <= 14; r++) {
      const i = 14 - r;
      for (let c = 0; c <= 14; c++) {
        const j = c;
        const vertexIndex = r * 15 + c;
        const rawElev = elevationGrid[i * 15 + j] || 0;
        const relElev = (rawElev - refElevation) * scaleFactor;
        posAttr.setZ(vertexIndex, relElev);
      }
    }
    posAttr.needsUpdate = true;
    this.terrainGeo.computeVertexNormals();
    
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
    let typeLabel = "Discovered Station";
    if (st.type === "primary") typeLabel = "Primary Station";
    else if (st.type === "neighbor") typeLabel = "Neighbor Station";

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
    const intersects = this.raycaster.intersectObjects(this.stationMeshes.map(sm => sm.mesh), true);

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
    
    const activeHeatmapStrikes = this.strikeHistory.filter(s => {
      const age = nowVirtual - s.time;
      return age >= 0 && age <= lifespan;
    });

    if (!this.heatmapMeshes) {
      this.heatmapMeshes = new Map();
    }

    for (const [id, hm] of this.heatmapMeshes.entries()) {
      if (!activeHeatmapStrikes.some(s => s.id === id)) {
        this.scene.remove(hm.mesh);
        if (hm.material) hm.material.dispose();
        this.heatmapMeshes.delete(id);
      }
    }

    activeHeatmapStrikes.forEach(s => {
      const age = nowVirtual - s.time;
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
        const y = this.getTerrainHeight(s.x, s.z);
        hm.mesh.position.y = y;
      }
    });
  }

  addStaticElements() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    this.scene.add(this.ambientLight);

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

    // Terrain grid
    const mapSize = 40;
    this.terrainGeo = new THREE.PlaneGeometry(mapSize, mapSize, 14, 14);
    
    const terrainMat = new THREE.MeshPhongMaterial({
      color: 0x050b14,
      emissive: 0x01050a,
      specular: 0x111e2e,
      shininess: 30,
      flatShading: true,
      side: THREE.DoubleSide
    });
    
    this.terrainMesh = new THREE.Mesh(this.terrainGeo, terrainMat);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.terrainMesh);

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
    this.stations.forEach(st => {
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
        pulseVal: Math.random() * Math.PI
      });
    });
  }

  initWeatherSystem() {
    // Rain Particles
    const rainCount = 800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 40;
      rainPositions[i + 1] = Math.random() * 20;
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

  updateWeatherSystem(deltaTime) {
    if (!this.initialized) return;

    const showWeather = this.config.show_weather !== false;
    const showRain = showWeather && (this.rainRate > 0);
    const showWind = showWeather && (this.windSpeed > 0);

    if (this.rainParticles) {
      this.rainParticles.visible = showRain;
      if (showRain) {
        const posAttr = this.rainParticles.geometry.attributes.position;
        const count = posAttr.count;
        
        const windRad = (this.windDirection || 0) * Math.PI / 180.0;
        const driftX = -Math.sin(windRad) * (this.windSpeed || 0) * 0.1;
        const driftZ = -Math.cos(windRad) * (this.windSpeed || 0) * 0.1;
        const fallSpeed = 10.0 + Math.min(20.0, this.rainRate * 2.0);

        for (let i = 0; i < count; i++) {
          let x = posAttr.getX(i);
          let y = posAttr.getY(i);
          let z = posAttr.getZ(i);

          y -= fallSpeed * deltaTime;
          x += driftX * deltaTime;
          z += driftZ * deltaTime;

          const terrainY = this.getTerrainHeight(x, z);
          if (y < terrainY || y < 0) {
            y = 20 + Math.random() * 2;
            x = (Math.random() - 0.5) * 40;
            z = (Math.random() - 0.5) * 40;
          }

          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }
    }

    if (this.windParticles) {
      this.windParticles.visible = showWind;
      if (showWind) {
        const posAttr = this.windParticles.geometry.attributes.position;
        const count = posAttr.count;

        const windRad = (this.windDirection || 0) * Math.PI / 180.0;
        const driftX = -Math.sin(windRad) * (this.windSpeed || 0) * 0.5;
        const driftZ = -Math.cos(windRad) * (this.windSpeed || 0) * 0.5;

        for (let i = 0; i < count; i++) {
          let x = posAttr.getX(i);
          let y = posAttr.getY(i);
          let z = posAttr.getZ(i);

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

          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }
    }
  }

  updateDayNightEngine() {
    if (!this.initialized || !this.scene) return;
    
    if (this.config.show_daynight === false) {
      if (this.ambientLight) {
        this.ambientLight.color.setHex(0x0f172a);
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
      return;
    }

    const rad = this.solarRadiation !== undefined ? this.solarRadiation : 1000.0;
    const factor = Math.max(0.0, Math.min(1.0, rad / 1000.0));

    if (this.ambientLight) {
      const nightColor = new THREE.Color(0x334155);
      const dayColor = new THREE.Color(0xffffff);
      this.ambientLight.color.copy(nightColor).lerp(dayColor, factor);
      this.ambientLight.intensity = 0.8 + factor * 0.7;
    }

    if (this.dirLight) {
      this.dirLight.intensity = factor * 1.5;
      const angle = (factor * Math.PI) - (Math.PI / 2);
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
    if (this.scene.fog) {
      this.scene.fog.color.copy(bg);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.tickPlayback();

    const now = Date.now();
    const deltaTime = this.lastFrameTime ? (now - this.lastFrameTime) / 1000.0 : 0.016;
    this.lastFrameTime = now;

    this.updateWeatherSystem(deltaTime);

    // Idle camera orbit
    if (this.config.auto_orbit !== false && (now - this.lastInteractionTime > 8000)) {
      this.cameraTheta += 0.0005;
      this.updateCameraPosition();
    }

    // Update heatmap
    if (this.config.show_heatmap !== false) {
      this.updateHeatmap();
    } else {
      if (this.heatmapMeshes && this.heatmapMeshes.size > 0) {
        for (const [id, hm] of this.heatmapMeshes.entries()) {
          this.scene.remove(hm.mesh);
          if (hm.material) hm.material.dispose();
        }
        this.heatmapMeshes.clear();
      }
    }

    if (this.starField) this.starField.rotation.y += 0.0001;

    if (this.stationMeshes) {
      this.stationMeshes.forEach(sm => {
        sm.pulseVal += 0.04;
        const scale = 1 + Math.sin(sm.pulseVal) * 0.1;
        if (sm.mesh.children && sm.mesh.children[0]) {
          sm.mesh.children[0].scale.set(scale, scale, 1);
          sm.mesh.children[0].material.opacity = 0.5 + Math.sin(sm.pulseVal) * 0.3;
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
    `;
    this.shadowRoot.appendChild(style);

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
  }

  getPlayIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>`;
  }

  getPauseIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>`;
  }

  tickPlayback() {
    if (this.strikeHistory.length === 0) {
      if (this.slider) this.slider.disabled = true;
      if (this.timeLabel) this.timeLabel.innerText = 'No strikes';
      return;
    }

    if (this.slider) this.slider.disabled = false;

    const minTime = this.strikeHistory[0].time;
    const maxTime = Date.now();

    if (this.playbackMode === 'live') {
      this.playbackTime = maxTime;
      if (this.slider) {
        this.slider.min = minTime;
        this.slider.max = maxTime;
        this.slider.value = maxTime;
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
            this.slider.min = minTime;
            this.slider.max = maxTime;
            this.slider.value = this.playbackTime;
          }
          this.updateTimeLabel();
          this.checkAndTriggerPlaybackStrikes();
        }
      } else {
        if (this.slider) {
          this.slider.min = minTime;
          this.slider.max = maxTime;
        }
        this.updateTimeLabel();
      }
    }
  }

  togglePlay() {
    if (this.playbackMode === 'live') {
      this.playbackMode = 'playback';
      this.isPlaying = true;
      this.lastPlayTickTime = Date.now();
      if (this.strikeHistory.length > 0) {
        const thirtySecsAgo = Date.now() - 30000;
        this.playbackTime = Math.max(this.strikeHistory[0].time, thirtySecsAgo);
        this.strikeHistory.forEach(s => {
          s.animated = (s.time <= this.playbackTime);
        });
      } else {
        this.playbackTime = Date.now();
      }
    } else {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.lastPlayTickTime = Date.now();
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
    this.strikeHistory.forEach(s => s.animated = true);
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
    if (this.strikeHistory.length === 0) return;
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

    this.strikeHistory.forEach(strike => {
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
    this.strikeHistory.forEach(strike => {
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
      point.add(new THREE.Vector3(
        (Math.random() - 0.5) * offsetAmount,
        (Math.random() - 0.5) * offsetAmount,
        (Math.random() - 0.5) * offsetAmount
      ));
      points.push(point);
    }

    points.push(end.clone());
    return points;
  }

  triggerStrikeAnimation(x, z) {
    if (!this.initialized) return;

    const terrainY = this.getTerrainHeight(x, z);
    const targetPos = new THREE.Vector3(x, terrainY, z);
    const startPos = new THREE.Vector3(x + (Math.random() - 0.5) * 4, terrainY + 18, z + (Math.random() - 0.5) * 4);

    // Lightning Bolt Lines
    const lines = [];
    const branches = 2;
    for (let b = 0; b < branches; b++) {
      const path = this.createLightningPath(startPos, targetPos);
      const curve = new THREE.CatmullRomCurve3(path);
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 1.0
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.strikeLayer.add(line);
      lines.push(line);
    }

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
    this.stations.forEach(st => {
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
    const duration = 40;

    const animateSequence = () => {
      progress++;
      const frac = progress / duration;

      if (frac < 0.2) {
        lines.forEach(l => l.material.opacity = Math.random() > 0.3 ? 1.0 : 0.2);
      } else if (frac < 0.5) {
        lines.forEach(l => { l.material.opacity = 1.0 - (frac - 0.2) / 0.3; });
      } else {
        lines.forEach(l => { if (l.parent) this.strikeLayer.remove(l); });
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
        if (wave.parent) this.strikeLayer.remove(wave);
      }

      domes.forEach(d => {
        if (frac < 0.3) {
          d.mesh.material.opacity = d.targetOpacity * (frac / 0.3);
        } else if (frac < 0.9) {
          d.mesh.material.opacity = d.targetOpacity * (1 - (frac - 0.3) / 0.6);
        } else {
          if (d.mesh.parent) this.strikeLayer.remove(d.mesh);
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

    // Load/Cache CartoDB Dark Matter map texture
    const refLat = hass.config.latitude;
    const refLon = hass.config.longitude;
    if (this.lastRefLat !== refLat || this.lastRefLon !== refLon) {
      this.lastRefLat = refLat;
      this.lastRefLon = refLon;
      this.loadMapTexture(refLat, refLon);
    }

    // Find the station sensor
    const stationsSensorId = Object.keys(hass.states).find(
      key => key.startsWith('sensor.') && key.endsWith('_stations') &&
             hass.states[key].attributes.stations !== undefined &&
             hass.states[key].attributes.icon === "mdi:lightning-bolt"
    ) || Object.keys(hass.states).find(key => key.startsWith('sensor.') && hass.states[key].attributes.stations !== undefined);

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

      const stationsAttr = attrs.stations;

      if (Array.isArray(stationsAttr)) {
        let stationsChanged = false;

        // Compare existing stations to new ones
        if (this.stations.length !== stationsAttr.length) {
          stationsChanged = true;
        } else {
          // Check if any station changed
          for (let i = 0; i < stationsAttr.length; i++) {
            const oldSt = this.stations.find(s => s.id === stationsAttr[i].id);
            if (!oldSt) {
              stationsChanged = true;
              break;
            }
          }
        }

        if (stationsChanged) {
          const R = 6371.0;
          const cosLat = Math.cos(refLat * Math.PI / 180.0);

          this.stations = stationsAttr.map(st => {
            const lat = parseFloat(st.latitude);
            const lon = parseFloat(st.longitude);

            const gridX = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
            const gridZ = R * (lat - refLat) * (Math.PI / 180.0);

            let color = 0x64748b; // subtle blue-gray for discovered/public
            if (st.type === "primary") color = 0x10b981; // vibrant emerald green for local/primary
            else if (st.type === "neighbor") color = 0x38bdf8; // sky blue for neighbors

            return {
              id: st.id,
              x: gridX,
              z: gridZ,
              color: color
            };
          });

          // Remove old meshes
          if (this.stationMeshes) {
            this.stationMeshes.forEach(sm => {
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
      key => key.startsWith('geo_location.') && hass.states[key].attributes.source === sourceNamespace
    );

    const R = 6371.0;
    const cosLat = Math.cos(refLat * Math.PI / 180.0);

    const activeStrikes = [];
    strikes.forEach(entityId => {
      const stateObj = hass.states[entityId];
      const lat = parseFloat(stateObj.attributes.latitude);
      const lon = parseFloat(stateObj.attributes.longitude);

      if (!isNaN(lat) && !isNaN(lon)) {
        const gridX = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
        const gridZ = R * (lat - refLat) * (Math.PI / 180.0);
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
    activeStrikes.forEach(strike => {
      if (!this.strikeHistory.some(s => s.id === strike.id)) {
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
    this.strikeHistory = this.strikeHistory.filter(s => activeStrikes.some(as => as.id === s.id));
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
  type: "weatherflow-lightning-card",
  name: "WeatherFlow Lightning Trilateration Card",
  description: "WebGL 3D visualizer showing real-time lightning strike trilaterations."
});

class WeatherFlowLightningCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = config;
    if (!this._initializedEditor) {
      this.render();
      this._initializedEditor = true;
    } else {
      const heightInput = this.shadowRoot.getElementById('height');
      if (heightInput) {
        heightInput.value = this._config.height || '350px';
      }
      const zoomInput = this.shadowRoot.getElementById('zoom_level');
      if (zoomInput) {
        zoomInput.value = this._config.zoom_level !== undefined ? this._config.zoom_level : '18.0';
      }
      const showGridInput = this.shadowRoot.getElementById('show_grid');
      if (showGridInput) {
        showGridInput.checked = this._config.show_grid !== false;
      }
      const showMapInput = this.shadowRoot.getElementById('show_map');
      if (showMapInput) {
        showMapInput.checked = this._config.show_map !== false;
      }
      const showRingsInput = this.shadowRoot.getElementById('show_rings');
      if (showRingsInput) {
        showRingsInput.checked = this._config.show_rings !== false;
      }
      const showHeatmapInput = this.shadowRoot.getElementById('show_heatmap');
      if (showHeatmapInput) {
        showHeatmapInput.checked = this._config.show_heatmap !== false;
      }
      const autoOrbitInput = this.shadowRoot.getElementById('auto_orbit');
      if (autoOrbitInput) {
        autoOrbitInput.checked = this._config.auto_orbit !== false;
      }
      const showWeatherInput = this.shadowRoot.getElementById('show_weather');
      if (showWeatherInput) {
        showWeatherInput.checked = this._config.show_weather !== false;
      }
      const showDayNightInput = this.shadowRoot.getElementById('show_daynight');
      if (showDayNightInput) {
        showDayNightInput.checked = this._config.show_daynight !== false;
      }
    }
  }

  set hass(hass) {
    this._hass = hass;
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
          <label for="height">Card Height (e.g. 350px)</label>
          <input type="text" id="height" value="${this._config.height || '350px'}">
        </div>
        <div class="paper-input-container">
          <label for="zoom_level">Default Zoom Radius (10-150)</label>
          <input type="text" id="zoom_level" value="${this._config.zoom_level !== undefined ? this._config.zoom_level : '18.0'}">
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
        <div class="config-row">
          <label for="show_heatmap">Show Storm Path Heatmap</label>
          <label class="switch">
            <input type="checkbox" id="show_heatmap" ${this._config.show_heatmap !== false ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.toggleChanged(e));
    });
    
    this.shadowRoot.querySelectorAll('input[type="text"]').forEach(input => {
      input.addEventListener('input', (e) => this.textChanged(e));
    });
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
    if (target.id === 'zoom_level') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        value = parsed;
      }
    }
    this.dispatchConfigChange(target.id, value);
  }

  dispatchConfigChange(key, value) {
    if (this._config[key] === value) return;
    const newConfig = {
      ...this._config,
      [key]: value
    };
    const event = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

customElements.define("weatherflow-lightning-card-editor", WeatherFlowLightningCardEditor);
