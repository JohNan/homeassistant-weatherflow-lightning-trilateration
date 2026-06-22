class WeatherFlowLightningCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.initialized = false;
    this.knownStrikes = new Set();
    this.stations = [
      { id: "Primary (Home)", x: 0, z: 0, color: 0x00f2fe },
      { id: "Neighbor 1", x: 10, z: 10, color: 0x38bdf8 },
      { id: "Neighbor 2", x: -10, z: 10, color: 0x38bdf8 }
    ];
    this.domeRings = [];
    this.strikeLayer = null;
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
    this.config = config;
    if (this.container) {
      this.container.style.height = this.config.height || '350px';
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

  initVisualizer() {
    if (this.initialized) return;
    this.initialized = true;

    // Create container
    this.container = document.createElement('div');
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = this.config.height || '350px';
    this.container.style.backgroundColor = '#02040a';
    this.container.style.borderRadius = '12px';
    this.container.style.overflow = 'hidden';
    this.container.style.border = '1px solid rgba(56, 189, 248, 0.15)';
    this.shadowRoot.appendChild(this.container);

    // Three.js setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.005);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 15, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x02040a, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.container.appendChild(this.renderer.domElement);

    // Add elements
    this.addStaticElements();
    this.addWeatherStations();

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

  addStaticElements() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

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
    const gridGeo = new THREE.PlaneGeometry(mapSize, mapSize, 20, 20);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0c4a6e,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.terrainGrid = new THREE.Mesh(gridGeo, gridMat);
    this.terrainGrid.rotation.x = -Math.PI / 2;
    this.scene.add(this.terrainGrid);
  }

  addWeatherStations() {
    this.stationMeshes = [];
    this.stations.forEach(st => {
      const group = new THREE.Group();
      group.position.set(st.x, 0, st.z);

      const ringGeo = new THREE.RingGeometry(0.8, 1, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: st.color,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
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

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.starField) this.starField.rotation.y += 0.0001;
    if (this.terrainGrid) this.terrainGrid.rotation.z -= 0.0002;

    if (this.stationMeshes) {
      this.stationMeshes.forEach(sm => {
        sm.pulseVal += 0.04;
        const scale = 1 + Math.sin(sm.pulseVal) * 0.1;
        sm.mesh.children[0].scale.set(scale, scale, 1);
        sm.mesh.children[0].material.opacity = 0.5 + Math.sin(sm.pulseVal) * 0.3;
      });
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
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

    const targetPos = new THREE.Vector3(x, 0, z);
    const startPos = new THREE.Vector3(x + (Math.random() - 0.5) * 4, 18, z + (Math.random() - 0.5) * 4);

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
    wave.rotation.x = -Math.PI / 2;
    this.strikeLayer.add(wave);

    // Trilateration domes/circles
    const domes = [];
    this.stations.forEach(st => {
      const stPos = new THREE.Vector3(st.x, 0, st.z);
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
        lines.forEach(l => l.material.opacity = 1.0 - (frac - 0.2) / 0.3; });
      } else {
        lines.forEach(l => { if (l.parent) this.strikeLayer.remove(l); });
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

    // Detect new lightning strike entities from the trilateration integration
    const sourceNamespace = 'weatherflow_lightning_trilateration';
    const strikes = Object.keys(hass.states).filter(
      key => key.startsWith('geo_location.') && hass.states[key].attributes.source === sourceNamespace
    );

    strikes.forEach(entityId => {
      if (!this.knownStrikes.has(entityId)) {
        this.knownStrikes.add(entityId);
        
        // Extract coordinate attributes
        const stateObj = hass.states[entityId];
        const lat = parseFloat(stateObj.attributes.latitude);
        const lon = parseFloat(stateObj.attributes.longitude);

        if (!isNaN(lat) && !isNaN(lon)) {
          // Resolve relative grid coordinates based on HA configured location
          const refLat = hass.config.latitude;
          const refLon = hass.config.longitude;
          const R = 6371.0;
          const cosLat = Math.cos(refLat * Math.PI / 180.0);
          
          // Map distance differences to grid space (in km)
          const gridX = R * (lon - refLon) * (Math.PI / 180.0) * cosLat;
          const gridZ = R * (lat - refLat) * (Math.PI / 180.0);

          // Trigger WebGL animation!
          this.triggerStrikeAnimation(gridX, gridZ);
        }
      }
    });

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
          gap: 16px;
        }
        .paper-input-container {
          display: flex;
          flex-direction: column;
        }
        label {
          color: var(--secondary-text-color, #727272);
          font-size: 12px;
          margin-bottom: 4px;
        }
        input {
          padding: 8px;
          background: var(--card-background-color, transparent);
          color: var(--primary-text-color, #212121);
          border: 0;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
          font-family: inherit;
        }
        input:focus {
          outline: none;
          border-bottom: 2px solid var(--primary-color, #03a9f4);
        }
      </style>
      <div class="card-config">
        <div class="paper-input-container">
          <label for="height">Height (e.g. 350px)</label>
          <input type="text" id="height" value="${this._config.height || '350px'}">
        </div>
      </div>
    `;

    const heightInput = this.shadowRoot.getElementById('height');
    heightInput.addEventListener('input', (e) => this.configChanged(e));
  }

  configChanged(e) {
    if (!this._config) return;

    const target = e.target;
    if (this._config[target.id] === target.value) return;

    const newConfig = {
      ...this._config,
      [target.id]: target.value,
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
