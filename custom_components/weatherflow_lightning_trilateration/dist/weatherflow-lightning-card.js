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
      const height = this.config.height || '350px';
      if (height.endsWith('px')) {
        const val = parseInt(height);
        this.container.style.height = `${val - 40}px`;
      } else {
        this.container.style.height = height;
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
    this.zoomRadius = 33.54;
    this.cameraTheta = 0.0;
    this.cameraPhi = Math.atan2(30, 15);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x02040a, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.container.appendChild(this.renderer.domElement);

    // Add mouse & touch event listeners for rotation/zoom
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.container.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.container.style.cursor = 'grabbing';
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    this.container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      this.cameraTheta -= deltaX * 0.005;
      this.cameraPhi += deltaY * 0.005;
      this.updateCameraPosition();

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    this._mouseupHandler = () => {
      isDragging = false;
      this.container.style.cursor = 'grab';
    };
    window.addEventListener('mouseup', this._mouseupHandler);

    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomRadius += e.deltaY * 0.02;
      this.updateCameraPosition();
    }, { passive: false });

    let touchStartDist = 0;

    this.container.addEventListener('touchstart', (e) => {
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

    this.tickPlayback();

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
        lines.forEach(l => { l.material.opacity = 1.0 - (frac - 0.2) / 0.3; });
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

    // Find the station sensor
    const stationsSensorId = Object.keys(hass.states).find(
      key => key.startsWith('sensor.') && key.endsWith('_stations') &&
             hass.states[key].attributes.stations !== undefined &&
             hass.states[key].attributes.icon === "mdi:lightning-bolt" // or another way to distinguish
    ) || Object.keys(hass.states).find(key => key.startsWith('sensor.') && hass.states[key].attributes.stations !== undefined);

    if (stationsSensorId) {
      const stationsAttr = hass.states[stationsSensorId].attributes.stations;

      if (Array.isArray(stationsAttr)) {
        let stationsChanged = false;

        // We need to compare existing stations to new ones
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
          const refLat = hass.config.latitude;
          const refLon = hass.config.longitude;
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

    const refLat = hass.config.latitude;
    const refLon = hass.config.longitude;
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
