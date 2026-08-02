/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
const Q=6371,J=111.1,tt=15,et=14,it=225,k=Math.floor(7),C=40,A=C/2,U=60,P=36e5,Y=9e4,Z=60,j=1e3/Z;class K extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null,this.showHeightColor=!0,this._activeRafIds=new Set,this._warnedKeys=new Set}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const e=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,show_height_color:!0,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const i=String(this.config.height);if(i.endsWith("px")){const a=parseInt(i);this.container.style.height=`${a-40}px`}else this.container.style.height=i}this.initialized&&this.applyConfigChanges(e||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const e=parseFloat(this.config.zoom_level);isNaN(e)||(this.zoomRadius=e,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE){this.initVisualizer();return}if(this._threeScriptLoading)return;this._threeScriptLoading=!0;const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>{this._threeScriptLoading=!1,this.initVisualizer()},t.onerror=e=>{this._threeScriptLoading=!1,console.error("WeatherFlow Card: Failed to load three.min.js",e)},document.head.appendChild(t)}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this._activeRafIds&&(this._activeRafIds.forEach(t=>cancelAnimationFrame(t)),this._activeRafIds.clear()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this._skyDome&&(this.scene.remove(this._skyDome),this._skyDome.geometry&&this._skyDome.geometry.dispose(),this._skyDome.material&&this._skyDome.material.dispose(),this._skyDome=null),this._skyTexture&&(this._skyTexture.dispose(),this._skyTexture=null),this._skyCanvas=null,this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material:[e.material]).forEach(a=>{a.map&&a.map.dispose(),a.dispose()})})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),e=this.zoomRadius*Math.cos(this.cameraPhi),i=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+e,this.cameraTarget.z+i),this.camera.lookAt(this.cameraTarget))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=String(this.config.height||"350px");if(t.endsWith("px")){const s=parseInt(t);this.container.style.height=`${s-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const e=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,e,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=THREE.PCFSoftShadowMap,this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const i=document.createElement("style");i.textContent=`
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
      .hud-toggle-btn, .hud-color-btn {
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
      .hud-toggle-btn:hover, .hud-color-btn:hover {
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
    `,this.container.appendChild(i),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const a=s=>s.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(s=>{this.weatherOverlay.addEventListener(s,a)}),this.weatherOverlay.addEventListener("click",s=>{if(s.target.closest(".hud-color-btn")){s.stopPropagation(),this.showHeightColor=!this.showHeightColor,this._paintHypsometricColours(),this.updateWeatherOverlay();return}(s.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(s.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let n=!1,l=!1,h={x:0,y:0};this.container.addEventListener("contextmenu",s=>{s.preventDefault()}),this.container.addEventListener("mousedown",s=>{this.lastInteractionTime=Date.now(),s.button===2||s.button===1||s.shiftKey?(l=!0,n=!1,this.container.style.cursor="move"):(n=!0,l=!1,this.container.style.cursor="grabbing"),h={x:s.clientX,y:s.clientY}}),this.container.addEventListener("mousemove",s=>{if(this.lastInteractionTime=Date.now(),n){const r=s.clientX-h.x,p=s.clientY-h.y;this.cameraTheta-=r*.005,this.cameraPhi+=p*.005,this.updateCameraPosition(),h={x:s.clientX,y:s.clientY}}else if(l){const r=s.clientX-h.x,p=s.clientY-h.y,d=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),f=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),w=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(d,-r*w),this.cameraTarget.addScaledVector(f,p*w),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),h={x:s.clientX,y:s.clientY}}else{const r=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(s.clientX-r.left)/r.width*2-1,this.mouse.y=-((s.clientY-r.top)/r.height)*2+1,this.checkHover(s.clientX-r.left,s.clientY-r.top)}}),this._mouseupHandler=()=>{n=!1,l=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",s=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),s.preventDefault(),this.zoomRadius+=s.deltaY*.02,this.updateCameraPosition()},{passive:!1});let c=0;this.container.addEventListener("touchstart",s=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),s.touches.length===1?(n=!0,h={x:s.touches[0].clientX,y:s.touches[0].clientY}):s.touches.length===2&&(n=!1,c=Math.hypot(s.touches[0].clientX-s.touches[1].clientX,s.touches[0].clientY-s.touches[1].clientY))}),this.container.addEventListener("touchmove",s=>{if(this.lastInteractionTime=Date.now(),s.preventDefault(),s.touches.length===1&&n){const r=s.touches[0].clientX-h.x,p=s.touches[0].clientY-h.y;this.cameraTheta-=r*.007,this.cameraPhi+=p*.007,this.updateCameraPosition(),h={x:s.touches[0].clientX,y:s.touches[0].clientY}}else if(s.touches.length===2){const r=Math.hypot(s.touches[0].clientX-s.touches[1].clientX,s.touches[0].clientY-s.touches[1].clientY),p=r-c;this.zoomRadius-=p*.15,this.updateCameraPosition(),c=r}},{passive:!1}),this.container.addEventListener("touchend",()=>{n=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const s=this.container.clientWidth,r=this.container.clientHeight;this.camera.aspect=s/r,this.camera.updateProjectionMatrix(),this.renderer.setSize(s,r)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const e=t.getContext("2d"),i=new THREE.CanvasTexture(t);if(!e)return i;const a=e.createRadialGradient(32,32,0,32,32,32);return a.addColorStop(0,"rgba(0, 242, 254, 1.0)"),a.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),a.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),a.addColorStop(1,"rgba(0, 0, 0, 0)"),e.fillStyle=a,e.fillRect(0,0,64,64),i.needsUpdate=!0,i}createRingLabelSprite(t){const e=document.createElement("canvas");e.width=128,e.height=64;const i=e.getContext("2d");if(!i){const l=new THREE.CanvasTexture(e),h=new THREE.SpriteMaterial({map:l,transparent:!0,depthWrite:!1}),c=new THREE.Sprite(h);return c.scale.set(2,1,1),c}i.fillStyle="rgba(0, 0, 0, 0)",i.fillRect(0,0,128,64),i.font="bold 24px sans-serif",i.fillStyle="#00f2fe",i.textAlign="center",i.textBaseline="middle",i.fillText(t,64,32);const a=new THREE.CanvasTexture(e),o=new THREE.SpriteMaterial({map:a,transparent:!0,depthWrite:!1,depthTest:!0}),n=new THREE.Sprite(o);return n.scale.set(2,1,1),n}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(r=>{const p=[];for(let u=0;u<=128;u++){const y=u/128*Math.PI*2,m=r*Math.cos(y),E=r*Math.sin(y),b=this.getTerrainHeight(m,E)+.15;p.push(new THREE.Vector3(m,b,E))}const f=new THREE.BufferGeometry().setFromPoints(p),w=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),g=new THREE.Line(f,w);this.rangeRingsGroup.add(g)});const e=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),i=[],a=40;for(let r=0;r<=a;r++){const p=-30+r/a*60,d=this.getTerrainHeight(0,p)+.15;i.push(new THREE.Vector3(0,d,p))}const o=new THREE.BufferGeometry().setFromPoints(i),n=new THREE.Line(o,e);this.rangeRingsGroup.add(n);const l=[];for(let r=0;r<=a;r++){const p=-30+r/a*60,d=this.getTerrainHeight(p,0)+.15;l.push(new THREE.Vector3(p,d,0))}const h=new THREE.BufferGeometry().setFromPoints(l),c=new THREE.Line(h,e);this.rangeRingsGroup.add(c);const s=Math.SQRT2/2;this.ringLabels=[],t.forEach(r=>{const p=this.createRingLabelSprite(`${r}km`);p.position.set(r*s,.5,-r*s),this.rangeRingsGroup.add(p),this.ringLabels.push({sprite:p,r})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((n,l)=>{const h=t[l];if(h){const c=h.geometry.attributes.position,s=128;for(let r=0;r<=s;r++){const p=r/s*Math.PI*2,d=n*Math.cos(p),f=n*Math.sin(p),w=this.getTerrainHeight(d,f)+.15;c.setY(r,w)}c.needsUpdate=!0}});const i=t[3];if(i){const n=i.geometry.attributes.position,l=40;for(let h=0;h<=l;h++){const c=-30+h/l*60,s=this.getTerrainHeight(0,c)+.15;n.setXYZ(h,0,s,c)}n.needsUpdate=!0}const a=t[4];if(a){const n=a.geometry.attributes.position,l=40;for(let h=0;h<=l;h++){const c=-30+h/l*60,s=this.getTerrainHeight(c,0)+.15;n.setXYZ(h,c,s,0)}n.needsUpdate=!0}const o=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(n=>{const l=n.r*o,h=-n.r*o,c=this.getTerrainHeight(l,h)+.4;n.sprite.position.set(l,c,h)})}getTerrainHeight(t,e){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const i=(t+A)*14/C,a=(e+A)*14/C;if(i<0||i>14||a<0||a>14)return 0;const o=Math.floor(i),n=Math.min(14,o+1),l=Math.floor(a),h=Math.min(14,l+1),c=i-o,s=a-l,r=this.getGridHeight(l,o),p=this.getGridHeight(l,n),d=this.getGridHeight(h,o),f=this.getGridHeight(h,n),w=r*(1-c)+p*c,g=d*(1-c)+f*c;return w*(1-s)+g*s}getGridHeight(t,e){return this.scaledHeights?this.scaledHeights[(14-t)*15+e]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let n=0;n<15;n++){const l=n-k;for(let h=0;h<15;h++){const c=h-k,s=Math.sqrt(l*l+c*c);let r=80+Math.sin(l*.4)*Math.cos(c*.4)*45;if(r+=Math.sin(s*.8)*15,n===k&&h===k)r=100;else{const p=Math.min(1,s/3);r=100*(1-p)+r*p}this.elevationGrid.push(r)}}const t=100,i=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let n=0;n<225;n++)this.scaledHeights[n]=((this.elevationGrid[n]||0)-t)*i;const a=this.terrainGeo.attributes.position,o=a.count;for(let n=0;n<o;n++){const l=a.getX(n),h=a.getY(n),c=this.getTerrainHeight(l,-h);a.setZ(n,c)}a.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,e){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const i=12,a=C,o=a/111.1,n=Math.cos(t*Math.PI/180),l=n>0?a/(111.1*n):a/111.1,h=t-o/2,c=t+o/2,s=e-l/2,r=e+l/2,p=(M,_)=>(M+180)/360*Math.pow(2,_),d=(M,_)=>(1-Math.log(Math.tan(M*Math.PI/180)+1/Math.cos(M*Math.PI/180))/Math.PI)/2*Math.pow(2,_),f=(M,_)=>M/Math.pow(2,_)*360-180,w=(M,_)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*M/Math.pow(2,_)))*180/Math.PI,g=Math.floor(p(s,i)),u=Math.floor(p(r,i)),y=Math.floor(d(c,i)),m=Math.floor(d(h,i)),E=2048,b=document.createElement("canvas");b.width=E,b.height=E;const v=b.getContext("2d");if(!v)return;v.fillStyle="#050b14",v.fillRect(0,0,E,E);const x=[];for(let M=g;M<=u;M++)for(let _=y;_<=m;_++){const R=f(M,i),H=f(M+1,i),T=w(_+1,i),S=w(_,i),L=(R-s)/(r-s),F=(H-s)/(r-s),O=(T-h)/(c-h),D=(S-h)/(c-h),N=L*E,B=(1-D)*E,V=(F-L)*E,W=(D-O)*E,X=`https://basemaps.cartocdn.com/dark_all/${i}/${M}/${_}.png`,$=new Promise(G=>{const I=new Image;I.crossOrigin="anonymous",I.onload=()=>{v.drawImage(I,N,B,V,W),G()},I.onerror=()=>G(),I.src=X});x.push($)}Promise.all(x).then(()=>{const M=new THREE.CanvasTexture(b);this.terrainMapMesh&&this.terrainMapMesh.material?(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.map=M,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0):M.dispose()})}async loadVectorData(t,e){this.vectorDataLoading=!0;try{const i=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(i,t,e),this.vectorDataLoaded=!0}catch(i){console.error("Failed to load 3D vector features:",i)}finally{this.vectorDataLoading=!1}}_latLonToGrid(t,e,i,a){const o=Math.cos(i*Math.PI/180),n=6371*(e-a)*(Math.PI/180)*o,l=-6371*(t-i)*(Math.PI/180);return{x:n,z:l}}render3DFeatures(t,e,i){if(this.scene){if(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup)),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup),t.water&&Array.isArray(t.water)){const a=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(o=>{if(!o.coordinates||o.coordinates.length<3)return;const n=[];let l=0,h=0;if(o.coordinates.forEach(p=>{const d=p[0],f=p[1],{x:w,z:g}=this._latLonToGrid(d,f,e,i);w<-20||w>20||g<-20||g>20||(n.push(new THREE.Vector2(w,-g)),l+=this.getTerrainHeight(w,g),h++)}),n.length<3)return;l/=h;const c=new THREE.Shape(n),s=new THREE.ShapeGeometry(c),r=new THREE.Mesh(s,a);r.rotation.x=-Math.PI/2,r.position.y=l+.08,this.features3DGroup.add(r)})}if(t.forest&&Array.isArray(t.forest)){const a=[],o=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0}),n=[],l=[],h=[];let c=0;const s=1500,r=(g,u)=>{const y=g[0],m=g[1];let E=!1;for(let b=0,v=u.length-1;b<u.length;v=b++){const x=u[b][0],M=u[b][1],_=u[v][0],R=u[v][1];M>m!=R>m&&y<(_-x)*(m-M)/(R-M)+x&&(E=!E)}return E};t.forest.forEach(g=>{if(!g.coordinates||g.coordinates.length<3)return;const u=[];let y=0,m=0;const E=g.coordinates.map(b=>{const v=b[0],x=b[1],{x:M,z:_}=this._latLonToGrid(v,x,e,i);return M>=-20&&M<=20&&_>=-20&&_<=20&&(u.push(new THREE.Vector2(M,-_)),y+=this.getTerrainHeight(M,_),m++),[M,_]});if(a.push(E),u.length>=3){y/=m;const b=new THREE.Shape(u),v=new THREE.ShapeGeometry(b),x=new THREE.Mesh(v,o);x.rotation.x=-Math.PI/2,x.position.y=y+.06,this.features3DGroup.add(x)}if(E.length>0&&c<s){let b=0,v=0;E.forEach(L=>{b+=L[0],v+=L[1]});const x=Math.max(-19.5,Math.min(19.5,b/E.length)),M=Math.max(-19.5,Math.min(19.5,v/E.length)),_=this.getTerrainHeight(x,M),R=.85+Math.random()*.4,H=Math.random()*Math.PI*2,T=new THREE.Object3D;T.position.set(x,_,M),T.rotation.y=H,T.scale.set(R,R,R),T.updateMatrix();const S=Math.random();S<.33?n.push(T.matrix.clone()):S<.66?l.push(T.matrix.clone()):h.push(T.matrix.clone()),c++}});const p=.45,d=p*.35,f=g=>{for(const u of a)if(r(g,u))return!0;return!1};for(let g=-19.5;g<=19.5;g+=p)for(let u=-19.5;u<=19.5&&!(c>=s);u+=p){const y=g+(Math.random()*2-1)*d,m=u+(Math.random()*2-1)*d,E=Math.max(-19.5,Math.min(19.5,y)),b=Math.max(-19.5,Math.min(19.5,m));if(f([E,b])){const v=this.getTerrainHeight(E,b),x=.85+Math.random()*.4,M=Math.random()*Math.PI*2,_=new THREE.Object3D;_.position.set(E,v,b),_.rotation.y=M,_.scale.set(x,x,x),_.updateMatrix();const R=Math.random();R<.33?n.push(_.matrix.clone()):R<.66?l.push(_.matrix.clone()):h.push(_.matrix.clone()),c++}}const w=(g,u,y,m,E)=>{if(g.length===0)return;const b=new THREE.InstancedMesh(u,y,g.length);g.forEach((v,x)=>b.setMatrixAt(x,v)),b.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(b);for(let v=0;v<m.length;v++){const x=new THREE.InstancedMesh(m[v],E[v],g.length);g.forEach((M,_)=>x.setMatrixAt(_,M)),x.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(x)}};if(n.length>0){const g=new THREE.CylinderGeometry(.04,.04,.2,4);g.translate(0,.1,0);const u=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),y=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),m=[new THREE.ConeGeometry(.18,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1,.2,5).translate(0,.6,0)];w(n,g,u,m,[y,y,y])}if(l.length>0){const g=new THREE.CylinderGeometry(.06,.08,.25,5);g.translate(0,.125,0);const u=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),y=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),m=[new THREE.SphereGeometry(.18,6,6).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).translate(.05,.35,0)];w(l,g,u,m,[y,y])}if(h.length>0){const g=new THREE.CylinderGeometry(.03,.03,.3,4);g.translate(0,.15,0);const u=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),y=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),m=new THREE.SphereGeometry(.15,6,6);m.scale(1,1.8,1),m.translate(0,.4,0),w(h,g,u,[m],[y])}}if(t.road&&Array.isArray(t.road)){const a=new THREE.LineBasicMaterial({color:4674921,transparent:!0,opacity:.6});t.road.forEach(o=>{if(!o.coordinates||o.coordinates.length<2)return;const n=[];if(o.coordinates.forEach(c=>{const s=c[0],r=c[1],{x:p,z:d}=this._latLonToGrid(s,r,e,i);if(p<-20||p>20||d<-20||d>20)return;const f=this.getTerrainHeight(p,d)+.02;n.push(new THREE.Vector3(p,f,d))}),n.length<2)return;const l=new THREE.BufferGeometry().setFromPoints(n),h=new THREE.Line(l,a);this.features3DGroup.add(h)})}if(t.building&&Array.isArray(t.building)){const a=new THREE.MeshPhongMaterial({color:1976635,transparent:!0,opacity:.7,flatShading:!0});t.building.forEach(o=>{if(!o.coordinates||o.coordinates.length<3)return;const n=[];let l=0,h=0,c=0;if(o.coordinates.forEach(y=>{const m=y[0],E=y[1],{x:b,z:v}=this._latLonToGrid(m,E,e,i);b<-20||b>20||v<-20||v>20||(n.push(new THREE.Vector2(b,-v)),l+=b,h+=v,c++)}),n.length<3)return;l/=c,h/=c;const s=this.getTerrainHeight(l,h),r=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,d=(o.height!==void 0?o.height:8)*r,f=new THREE.Shape(n),w={depth:d,bevelEnabled:!1},g=new THREE.ExtrudeGeometry(f,w),u=new THREE.Mesh(g,a);u.rotation.x=-Math.PI/2,u.position.y=s,u.castShadow=!0,u.receiveShadow=!0,this.features3DGroup.add(u)})}}}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,e=-1/0;for(let s=0;s<225;s++)this.scaledHeights[s]<t&&(t=this.scaledHeights[s]),this.scaledHeights[s]>e&&(e=this.scaledHeights[s]);const i=e-t||1,a=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],o=s=>{let r=a[0],p=a[a.length-1];for(let f=0;f<a.length-1;f++)if(s>=a[f].t&&s<=a[f+1].t){r=a[f],p=a[f+1];break}const d=p.t===r.t?0:(s-r.t)/(p.t-r.t);return{r:r.r+(p.r-r.r)*d,g:r.g+(p.g-r.g)*d,b:r.b+(p.b-r.b)*d}},n=this.terrainGeo.attributes.position,l=this.terrainGeo.attributes.color;if(!l)return;const h=n.count,c=this.showHeightColor!==!1;for(let s=0;s<h;s++)if(!c)l.setXYZ(s,.02,.02,.02);else{const r=n.getX(s),p=n.getY(s),f=(this.getTerrainHeight(r,-p)-t)/i,w=o(Math.max(0,Math.min(1,f)));l.setXYZ(s,w.r,w.g,w.b)}l.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const e=k*15+k,i=t[e]||0,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let h=0;h<225;h++)this.scaledHeights[h]=((t[h]||0)-i)*o;const n=this.terrainGeo.attributes.position,l=n.count;for(let h=0;h<l;h++){const c=n.getX(h),s=n.getY(h),r=this.getTerrainHeight(c,-s);n.setZ(h,r)}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,e)=>{const i=this.stationMeshes[e];if(i&&i.mesh){const a=this.getTerrainHeight(t.x,t.z);i.mesh.position.y=a}})}showTooltip(t,e,i){if(!this.tooltip)return;let a="Discovered Station";t.type==="primary"?a="Primary Station":t.type==="neighbor"&&(a="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${a}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const o=this.container.getBoundingClientRect();let n=e+15,l=i+15;n+150>o.width&&(n=e-165),l+60>o.height&&(l=i-75),this.tooltip.style.left=`${n}px`,this.tooltip.style.top=`${l}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,e){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const i=this.raycaster.intersectObjects(this.stationMeshes.map(a=>a.mesh),!0);if(i.length>0){let a=i[0].object;for(;a&&a.parent&&(!a.userData||!a.userData.station);)a=a.parent;if(a&&a.userData&&a.userData.station){const o=a.userData.station;this.showTooltip(o,t,e),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=Y,e=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const i=new Set;for(let a=0;a<this.strikeHistory.length;a++){const o=this.strikeHistory[a],n=e-o.time;if(n>=0&&n<=t){i.add(o.id);const l=n/t,h=.7*(1-l),c=1-l*.4;let s=this.heatmapMeshes.get(o.id);if(s)s.material.opacity=h,s.mesh.scale.set(c,c,c),s.mesh.position.y=this.getTerrainHeight(o.x,o.z);else{const r=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:h,depthWrite:!1}),p=new THREE.Mesh(this.heatGeo,r),d=this.getTerrainHeight(o.x,o.z);p.position.set(o.x,d,o.z),p.scale.set(c,c,c),this.scene.add(p),s={mesh:p,material:r},this.heatmapMeshes.set(o.id,s)}}}for(const[a,o]of this.heatmapMeshes.entries())i.has(a)||(this.scene.remove(o.mesh),o.material&&o.material.dispose(),this.heatmapMeshes.delete(a))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),e=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,e),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,25,7),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.set(2048,2048),this.dirLight.shadow.camera.near=1,this.dirLight.shadow.camera.far=80,this.dirLight.shadow.camera.left=-30,this.dirLight.shadow.camera.right=30,this.dirLight.shadow.camera.top=30,this.dirLight.shadow.camera.bottom=-30,this.dirLight.shadow.bias=-.0015,this.scene.add(this.dirLight);const i=new THREE.BufferGeometry,a=500,o=new Float32Array(a*3);for(let d=0;d<a*3;d+=3){const f=100+Math.random()*50,w=Math.random(),g=Math.random(),u=w*2*Math.PI,y=Math.acos(2*g-1);o[d]=f*Math.sin(y)*Math.cos(u),o[d+1]=f*Math.sin(y)*Math.sin(u),o[d+2]=f*Math.cos(y)}i.setAttribute("position",new THREE.BufferAttribute(o,3));const n=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(i,n),this.scene.add(this.starField);const l=40;this.terrainGeo=new THREE.PlaneGeometry(l,l,30,30);const h=this.terrainGeo.attributes.position.count,c=new Float32Array(h*3);c.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(c,3));const s=new THREE.MeshLambertMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(this.terrainGeo,s),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.005,this.terrainMapMesh.receiveShadow=!0,this.scene.add(this.terrainMapMesh);const r=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,r),this.terrainMesh.rotation.x=-Math.PI/2,this.terrainMesh.receiveShadow=!0,this.scene.add(this.terrainMesh);const p=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,p),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const e=new THREE.Group,i=this.getTerrainHeight(t.x,t.z);e.position.set(t.x,i,t.z),e.userData={station:t};const a=.15,o=.5,n=Math.sqrt(o*o+a*a),l=new THREE.CylinderGeometry(.04,.05,n,6),h=new THREE.MeshStandardMaterial({color:3359061,roughness:.6,metalness:.5});for(let M=0;M<3;M++){const _=M/3*Math.PI*2,R=Math.cos(_)*o,H=Math.sin(_)*o,T=new THREE.Mesh(l,h);T.position.set(R/2,a/2,H/2);const S=new THREE.Vector3(-R,a,-H).normalize();T.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),S),T.castShadow=!0,T.receiveShadow=!0,e.add(T)}const c=new THREE.CylinderGeometry(.12,.14,.1,12),s=new THREE.Mesh(c,h);s.position.y=a,s.castShadow=!0,s.receiveShadow=!0,e.add(s);const r=new THREE.RingGeometry(.8,1,32),p=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(r,p);d.rotation.x=-Math.PI/2,d.position.y=.03,e.add(d),e.userData.pulseRing=d;const f=new THREE.CylinderGeometry(.08,.15,2.5,8),w=new THREE.MeshStandardMaterial({color:t.color,roughness:.5,metalness:.4,transparent:!0,opacity:.6}),g=new THREE.Mesh(f,w);g.position.y=1.35,g.castShadow=!0,e.add(g),e.userData.towerCyl=g;const u=new THREE.BoxGeometry(.9,.06,.06),y=new THREE.MeshStandardMaterial({color:9741240,metalness:.5,roughness:.4}),m=new THREE.Mesh(u,y);m.position.y=2.3,m.castShadow=!0,e.add(m);const E=new THREE.SphereGeometry(.25,16,16),b=new THREE.MeshBasicMaterial({color:t.color}),v=new THREE.Mesh(E,b);v.position.y=2.7,e.add(v),e.userData.topSphere=v;const x=this.createRingLabelSprite(t.id);x.scale.set(3.2,1.6,1),x.position.y=3.6,e.add(x),this.scene.add(e),this.stationMeshes.push({mesh:e,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const a=new THREE.BufferGeometry,o=new Float32Array(800*3);for(let r=0;r<800*3;r+=3)o[r]=(Math.random()-.5)*40,o[r+1]=18+Math.random()*4,o[r+2]=(Math.random()-.5)*40;a.setAttribute("position",new THREE.BufferAttribute(o,3));const n=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(a,n),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const l=300,h=new THREE.BufferGeometry,c=new Float32Array(l*3);for(let r=0;r<l*3;r+=3)c[r]=(Math.random()-.5)*40,c[r+1]=Math.random()*8,c[r+2]=(Math.random()-.5)*40;h.setAttribute("position",new THREE.BufferAttribute(c,3));const s=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(h,s),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),e=(this.rainRate||0).toFixed(1),i=this.windDirection||0,a=`${this.hudCollapsed?1:0}|${this.showHeightColor?1:0}|${t}|${e}|${i}`;if(this._lastWeatherOverlaySignature!==a){if(this._lastWeatherOverlaySignature=a,this.hudCollapsed){this.weatherOverlay.innerHTML=`
        <div class="hud-header">
          <div class="hud-toggle-btn" style="padding: 0;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
            </svg>
          </div>
        </div>
      `;return}this.weatherOverlay.innerHTML=`
      <div class="hud-header">
        <div class="hud-title">Telemetry</div>
        <div class="hud-actions" style="display: flex; gap: 8px;">
          <button class="hud-color-btn" title="Toggle Height Map Color" style="color: ${this.showHeightColor?"#10b981":"#94a3b8"};">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/>
            </svg>
          </button>
          <button class="hud-toggle-btn" title="Minimize Weather HUD">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
              <line x1="14" y1="10" x2="21" y2="3"></line>
              <line x1="10" y1="14" x2="3" y2="21"></line>
            </svg>
          </button>
        </div>
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
              ${t} m/s
              <span class="wind-arrow" style="transform: rotate(${i}deg); margin-left: 4px;">
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
            <div class="hud-value">${e} mm/h</div>
          </div>
        </div>
      </div>
    `}}updateWeatherSystem(t){if(!this.initialized)return;const e=this.config.show_weather!==!1,i=e&&this.rainRate>0,a=e&&this.windSpeed>0,o=(this.windDirection||0)*Math.PI/180,n=Math.sin(o),l=Math.cos(o);if(this.rainParticles&&(this.rainParticles.visible=i,i)){const h=this.rainParticles.geometry.attributes.position,c=h.array,s=h.count,r=-n*(this.windSpeed||0)*.1,p=-l*(this.windSpeed||0)*.1,d=10+Math.min(20,this.rainRate*2);for(let f=0;f<s;f++){const w=f*3;let g=c[w],u=c[w+1],y=c[w+2];u-=d*t,g+=r*t,y+=p*t;const m=this.getTerrainHeight(g,y);(u<m||u<0)&&(u=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),g=(Math.random()-.5)*40,y=(Math.random()-.5)*40),c[w]=g,c[w+1]=u,c[w+2]=y}h.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=a,a)){const h=this.windParticles.geometry.attributes.position,c=h.array,s=h.count,r=-n*(this.windSpeed||0)*.5,p=-l*(this.windSpeed||0)*.5;for(let d=0;d<s;d++){const f=d*3;let w=c[f],g=c[f+1],u=c[f+2];w+=r*t,u+=p*t,g+=Math.sin(w*.5+u*.5)*.02,(w<-20||w>20||u<-20||u>20)&&(Math.abs(r)>Math.abs(p)?(w=r>0?-20:20,u=(Math.random()-.5)*40):(w=(Math.random()-.5)*40,u=p>0?-20:20),g=Math.random()*8),c[f]=w,c[f+1]=g,c[f+2]=u}h.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const e=this._skyCanvas.getContext("2d");if(!e)return;const i=this._skyCanvas.height,a=e.createLinearGradient(0,0,0,i),o=[2,4,10],n=[14,42,90],l=Math.round(o[0]+(n[0]-o[0])*t),h=Math.round(o[1]+(n[1]-o[1])*t),c=Math.round(o[2]+(n[2]-o[2])*t),s=Math.sin(t*Math.PI),r=Math.round(l+60*s),p=Math.round(h+20*s),d=Math.round(c+10*s);a.addColorStop(0,`rgb(${l},${h},${c})`),a.addColorStop(1,`rgb(${Math.min(255,r)},${Math.min(255,p)},${Math.min(255,d)})`),e.fillStyle=a,e.fillRect(0,0,2,i),this._skyTexture.needsUpdate=!0}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const o=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(o,1),this.scene.fog&&this.scene.fog.color.copy(o),this._paintSkyGradient(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const o=this._hass.states["sun.sun"],n=o.attributes.elevation!==void 0?parseFloat(o.attributes.elevation):0;n>0?t=1:n<-6?t=0:t=(n+6)/6}else{const o=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,o/1e3))}if(this.ambientLight){const o=new THREE.Color(3359061),n=new THREE.Color(12573694),l=new THREE.Color(659744),h=new THREE.Color(1980958);this.ambientLight.color.copy(o).lerp(n,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(l).lerp(h,t);const c=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=c+t*(1.5-c)}if(this.dirLight){this.dirLight.intensity=t*1.5;const o=t*Math.PI-Math.PI/2,n=15*Math.sin(o),l=15*Math.cos(o);this.dirLight.position.set(n,l,7);const c=new THREE.Color(16753920),s=new THREE.Color(16707722);this.dirLight.color.copy(c).lerp(s,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const e=new THREE.Color(132106),i=new THREE.Color(529189),a=e.clone().lerp(i,t);if(this.renderer&&this.renderer.setClearColor(a,1),this.scene.fog){this.scene.fog.color.copy(a);const o=.008,n=.003,l=.01,h=Math.sin(t*Math.PI),c=o+(n-o)*t;this.scene.fog.density=c+(l-o)*h*.5}this._paintSkyGradient(t)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop());const t=Date.now();if(this.lastFrameTime!==null&&t-this.lastFrameTime<j)return;this.tickPlayback();const e=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(e),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const i of this.heatmapMeshes.values())this.scene.remove(i.mesh),i.material&&i.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(i=>{i.pulseVal+=.04;const a=Math.sin(i.pulseVal);let o=1+a*.1,n=.5+a*.3;if(i.strikeIntensity&&i.strikeIntensity>0){i.strikeIntensity-=.02;const l=1+i.strikeIntensity*1.5;o*=l,n=Math.min(1,n+i.strikeIntensity*.5),i.mesh.userData.topSphere&&(i.mesh.userData.topSphere.scale.set(l,l,l),i.mesh.userData.topSphere.material.color.setHex(16777215)),i.mesh.userData.towerCyl&&i.mesh.userData.towerCyl.material.color.setHex(16777215)}else{const l=i.mesh.userData.station.color;i.mesh.userData.topSphere&&(i.mesh.userData.topSphere.scale.set(1,1,1),i.mesh.userData.topSphere.material.color.setHex(l)),i.mesh.userData.towerCyl&&(i.mesh.userData.towerCyl.scale.set(1,1,1),i.mesh.userData.towerCyl.material.color.setHex(l))}i.mesh.userData.pulseRing&&(i.mesh.userData.pulseRing.scale.set(o,o,1),i.mesh.userData.pulseRing.material.opacity=n)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const e=[1,5,10,30,60,120,300,600];e.includes(this.playbackSpeed)||(e.push(this.playbackSpeed),e.sort((i,a)=>i-a)),e.forEach(i=>{const a=document.createElement("option");a.value=i.toString(),a.innerText=`${i}x`,i===this.playbackSpeed&&(a.selected=!0),this.speedSelect.appendChild(a)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",i=>this.handleSliderInput(i)),this.speedSelect.addEventListener("change",i=>{this.playbackSpeed=parseFloat(i.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-P,this.strikeHistory[0].time):Date.now()-P,e=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=e,this.slider&&(this.slider.min=t.toString(),this.slider.max=e.toString(),this.slider.value=e.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const i=Date.now(),a=i-(this.lastPlayTickTime||i);this.lastPlayTickTime=i,this.playbackTime+=a*this.playbackSpeed,this.playbackTime>=e?(this.playbackTime=e,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=e.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=e.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-P,this.strikeHistory[0].time):Date.now()-P;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(e=>{e.animated=e.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(e=>{e.animated=e.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const e=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),i=Math.round((Date.now()-this.playbackTime)/1e3);let a="";if(i<60)a=`-${i}s`;else{const o=Math.floor(i/60),n=i%60;a=`-${o}m ${n}s`}this.timeLabel&&(this.timeLabel.innerText=`${e} (${a})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(e=>{e.time<=this.playbackTime?e.animated=!0:e.animated=!1})}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,e,i=10){const a=[],o=new THREE.Vector3().subVectors(e,t);a.push(t.clone());for(let n=1;n<i;n++){const l=n/i,h=new THREE.Vector3().addVectors(t,o.clone().multiplyScalar(l)),c=(1-l)*1;h.add(new THREE.Vector3((Math.random()-.5)*c,(Math.random()-.5)*c,(Math.random()-.5)*c)),a.push(h)}return a.push(e.clone()),a}createLightningBranches(t,e,i=8){const a=this.createLightningPath(t,e,i),o=[a];for(let n=1;n<a.length-2;n++)if(Math.random()<.25){const l=a[n].clone(),c=(1-n/a.length)*6,s=new THREE.Vector3().subVectors(e,t).normalize();s.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const r=new THREE.Vector3().addVectors(l,s.multiplyScalar(c)),p=this.createLightningPath(l,r,4);o.push(p)}return o}_scheduleRaf(t){const e=requestAnimationFrame(i=>{this._activeRafIds.delete(e),t(i)});return this._activeRafIds.add(e),e}triggerStrikeAnimation(t,e,i=[]){if(!this.initialized)return;const a=this.getTerrainHeight(t,e),o=new THREE.Vector3(t,a,e),n=new THREE.Vector3(t+(Math.random()-.5)*4,a+18,e+(Math.random()-.5)*4);if(this.stationMeshes&&this.stationMeshes.forEach(y=>{(!i||i.length===0||i.some(E=>String(E)===String(y.mesh.userData.station.id)))&&(y.strikeIntensity=1)}),this.ambientLight){const y=this.ambientLight.intensity;this.ambientLight.intensity=4;let m=0;const E=()=>{!this.initialized||!this.ambientLight||(m++,this.ambientLight.intensity=Math.max(y,4*(1-m/8)),m<8&&this._scheduleRaf(E))};this._scheduleRaf(E)}const l=[];this.createLightningBranches(n,o).forEach((y,m)=>{const E=new THREE.CatmullRomCurve3(y),b=m===0,v=new THREE.TubeGeometry(E,Math.max(10,y.length*3),b?.06:.03,5,!1),x=new THREE.MeshStandardMaterial({color:b?16777215:16769126,emissive:b?16766720:16757504,emissiveIntensity:b?3:1.5,transparent:!0,opacity:b?1:.75,depthWrite:!1}),M=new THREE.Mesh(v,x);this.strikeLayer.add(M),l.push(M)});const c=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),s=new THREE.Sprite(c);s.position.copy(o),s.position.y+=.1,s.scale.set(.1,.1,1),this.strikeLayer.add(s);const r=new THREE.RingGeometry(.1,.2,32),p=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(r,p);d.position.copy(o),d.position.y+=.05,d.rotation.x=-Math.PI/2,this.strikeLayer.add(d);const f=[];this.stations.forEach(y=>{const m=this.getTerrainHeight(y.x,y.z),E=new THREE.Vector3(y.x,m,y.z),b=E.distanceTo(o),v=new THREE.RingGeometry(b-.08,b+.08,64),x=new THREE.MeshBasicMaterial({color:y.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),M=new THREE.Mesh(v,x);M.position.copy(E),M.position.y+=.05,M.rotation.x=-Math.PI/2,this.strikeLayer.add(M),f.push({mesh:M,targetOpacity:.5})});let w=0;const g=U,u=()=>{if(!this.initialized||!this.strikeLayer)return;w++;const y=w/g;if(y<.2?l.forEach(m=>m.material.opacity=Math.random()>.3?1:.2):y<.5?l.forEach(m=>{m.material.opacity=1-(y-.2)/.3}):l.forEach(m=>{m.parent&&(this.strikeLayer.remove(m),m.geometry&&m.geometry.dispose(),m.material&&m.material.dispose())}),y<.6){const m=y*12;s.scale.set(m,m,1),s.material.opacity=1*(1-y/.6)}else s.parent&&(this.strikeLayer.remove(s),s.material.dispose());if(y<.8){const m=1+y*25;d.scale.set(m,m,1),d.material.opacity=.8*(1-y/.8)}else d.parent&&(this.strikeLayer.remove(d),d.geometry&&d.geometry.dispose(),d.material&&d.material.dispose());f.forEach(m=>{y<.3?m.mesh.material.opacity=m.targetOpacity*(y/.3):y<.9?m.mesh.material.opacity=m.targetOpacity*(1-(y-.3)/.6):m.mesh.parent&&(this.strikeLayer.remove(m.mesh),m.mesh.geometry&&m.mesh.geometry.dispose(),m.mesh.material&&m.mesh.material.dispose())}),w<g&&this._scheduleRaf(u)};this._scheduleRaf(u)}_warnOnce(t,...e){this._warnedKeys.has(t)||(this._warnedKeys.add(t),console.warn(...e))}_elevationGridChanged(t){const e=this.elevationGrid;if(!e||t.length!==e.length)return!0;const i=t.length;if(i===0)return!1;const a=[0,Math.floor(i/4),Math.floor(i/2),Math.floor(3*i/4),i-1];for(const o of a)if(t[o]!==e[o])return!0;return!1}set hass(t){if(this._hass=t,!t||!this.initialized)return;const e=t.states,i="weatherflow_lightning_trilateration";let a,o;const n=[],l=[],h=Object.keys(e);for(let d=0;d<h.length;d++){const f=h[d],w=e[f];if(f.startsWith("sensor.")){const g=w.attributes;g.stations!==void 0&&(o||(o=f),!a&&f.endsWith("_stations")&&g.icon==="mdi:lightning-bolt"&&(a=f)),g.station_id!==void 0&&n.push({stationId:g.station_id,count:parseInt(w.state)||0})}else f.startsWith("geo_location.")&&w.attributes.source===i&&l.push(f)}const c=this.config.entity||this.config.entity_id||a||o;let s=t.config?.latitude??0,r=t.config?.longitude??0;if(c){const f=e[c].attributes.stations;if(Array.isArray(f)){const w=f.find(g=>g.type==="primary");if(w&&w.latitude!==void 0&&w.longitude!==void 0){const g=parseFloat(w.latitude),u=parseFloat(w.longitude);!isNaN(g)&&!isNaN(u)?(s=g,r=u):this._warnOnce("nan-primary-coords","WeatherFlow Card: Parsed primary station coordinates are NaN:",w.latitude,w.longitude)}else this._warnOnce("no-primary-station","WeatherFlow Card: No primary station found in stations list.")}else this._warnOnce("stations-not-array","WeatherFlow Card: stations attribute is not an array.")}else this._warnOnce("no-stations-sensor","WeatherFlow Card: No station sensor found \u2014 configure `entity` in the card config.");if((this.lastRefLat!==s||this.lastRefLon!==r)&&(this.lastRefLat=s,this.lastRefLon=r,this.loadMapTexture(s,r),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(s,r),c){const d=e[c].attributes,f=d.elevation_grid;f&&this._elevationGridChanged(f)&&this.updateTerrainGeometry(f),this.windSpeed=d.wind_speed!==void 0?parseFloat(d.wind_speed):0,this.windDirection=d.wind_direction!==void 0?parseFloat(d.wind_direction):0,this.solarRadiation=d.solar_radiation!==void 0?parseFloat(d.solar_radiation):1e3,this.rainRate=d.rain_rate!==void 0?parseFloat(d.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay(),this.lastStationStrikes||(this.lastStationStrikes={});for(const{stationId:g,count:u}of n){const y=this.lastStationStrikes[g];y!==void 0&&u>y&&this.stationMeshes&&this.stationMeshes.forEach(m=>{String(m.mesh.userData.station.id)===String(g)&&(m.strikeIntensity=1)}),this.lastStationStrikes[g]=u}const w=d.stations;if(Array.isArray(w)){let g=this.stations.length!==w.length;if(!g)for(let u=0;u<w.length;u++){const y=this.stations.find(b=>b.id===w[u].id),m=parseFloat(w[u].latitude),E=parseFloat(w[u].longitude);if(!y||y.lat!==m||y.lon!==E){g=!0;break}}g&&(this.stations=w.map(u=>{const y=parseFloat(u.latitude),m=parseFloat(u.longitude),{x:E,z:b}=this._latLonToGrid(y,m,s,r);let v=6583435;return u.type==="primary"?v=1096065:u.type==="neighbor"&&(v=3718648),{id:u.id,x:E,z:b,lat:y,lon:m,color:v,type:u.type}}),this.stationMeshes&&this.stationMeshes.forEach(u=>{this.scene.remove(u.mesh),this.disposeHierarchy(u.mesh)}),this.addWeatherStations())}}const p=[];l.forEach(d=>{const f=e[d],w=parseFloat(f.attributes.latitude),g=parseFloat(f.attributes.longitude),u=f.attributes.stations||[];if(!isNaN(w)&&!isNaN(g)){const{x:y,z:m}=this._latLonToGrid(w,g,s,r),E=new Date(f.last_changed).getTime();p.push({id:d,time:E,x:y,z:m,stations:u})}}),p.sort((d,f)=>d.time-f.time),p.forEach(d=>{if(!this.strikeHistory.some(f=>f.id===d.id)){const f=!this.knownStrikes.has(d.id);f&&this.knownStrikes.add(d.id);const w=this.playbackMode==="live"&&f;this.strikeHistory.push({id:d.id,time:d.time,x:d.x,z:d.z,stations:d.stations,animated:w||this.playbackMode!=="live"&&d.time<=this.playbackTime}),w&&this.triggerStrikeAnimation(d.x,d.z,d.stations)}}),this.strikeHistory=this.strikeHistory.filter(d=>p.some(f=>f.id===d.id)),this.strikeHistory.sort((d,f)=>d.time-f.time);for(const d of this.knownStrikes)t.states[d]||this.knownStrikes.delete(d)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",K),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const e=this.shadowRoot.getElementById("height");e&&(e.value=this._config.height||"350px");const i=this.shadowRoot.getElementById("zoom_level");i&&(i.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const a=this.shadowRoot.getElementById("show_grid");a&&(a.checked=this._config.show_grid!==!1);const o=this.shadowRoot.getElementById("show_map");o&&(o.checked=this._config.show_map!==!1);const n=this.shadowRoot.getElementById("show_rings");n&&(n.checked=this._config.show_rings!==!1);const l=this.shadowRoot.getElementById("show_heatmap");l&&(l.checked=this._config.show_heatmap!==!1);const h=this.shadowRoot.getElementById("auto_orbit");h&&(h.checked=this._config.auto_orbit!==!1);const c=this.shadowRoot.getElementById("show_weather");c&&(c.checked=this._config.show_weather!==!1);const s=this.shadowRoot.getElementById("show_daynight");s&&(s.checked=this._config.show_daynight!==!1);const r=this.shadowRoot.getElementById("min_brightness");r&&(r.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const p=this.shadowRoot.getElementById("elevation_scale");p&&(p.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const d=this.shadowRoot.getElementById("show_3d_features");d&&(d.checked=this._config.show_3d_features===!0);const f=this.shadowRoot.getElementById("playback_speed");f&&(f.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
          <input type="text" id="title" value="${this._config.title||""}">
        </div>
        <div class="paper-input-container">
          <label for="height">Card Height (e.g. 350px)</label>
          <input type="text" id="height" value="${this._config.height||"350px"}">
        </div>
        <div class="paper-input-container">
          <label for="zoom_level">Default Zoom Radius (2-150)</label>
          <input type="text" id="zoom_level" value="${this._config.zoom_level!==void 0?this._config.zoom_level:"18.0"}">
        </div>
        <div class="paper-input-container">
          <label for="playback_speed">Default Playback Speed Multiplier</label>
          <input type="text" id="playback_speed" value="${this._config.playback_speed!==void 0?this._config.playback_speed:"120"}">
        </div>
        <div class="config-row">
          <label for="auto_orbit">Enable Idle Camera Orbit</label>
          <label class="switch">
            <input type="checkbox" id="auto_orbit" ${this._config.auto_orbit!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="section-header">Terrain & Map Layers</div>
        
        <div class="config-row">
          <label for="show_grid">Show Terrain Grid Overlay</label>
          <label class="switch">
            <input type="checkbox" id="show_grid" ${this._config.show_grid!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_map">Show Ground Map Texture</label>
          <label class="switch">
            <input type="checkbox" id="show_map" ${this._config.show_map!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_rings">Show Range Rings & Crosshairs</label>
          <label class="switch">
            <input type="checkbox" id="show_rings" ${this._config.show_rings!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="paper-input-container">
          <label for="elevation_scale">Vertical Terrain Exaggeration Scale (0.0 to 10.0)</label>
          <input type="text" id="elevation_scale" value="${this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5"}">
        </div>
        <div class="config-row">
          <label for="show_3d_features">Show 3D Vector Features (Experimental Lakes & Forests)</label>
          <label class="switch">
            <input type="checkbox" id="show_3d_features" ${this._config.show_3d_features===!0?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="section-header">Atmospheric & Telemetry Simulations</div>
        
        <div class="config-row">
          <label for="show_weather">Show Weather Telemetry (Precipitation & Wind)</label>
          <label class="switch">
            <input type="checkbox" id="show_weather" ${this._config.show_weather!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_daynight">Show Day/Night Solar Engine</label>
          <label class="switch">
            <input type="checkbox" id="show_daynight" ${this._config.show_daynight!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="paper-input-container">
          <label for="min_brightness">Min Night Ambient Brightness (0.1 - 1.5)</label>
          <input type="text" id="min_brightness" value="${this._config.min_brightness!==void 0?this._config.min_brightness:"0.8"}">
        </div>
        <div class="config-row">
          <label for="show_heatmap">Show Storm Path Heatmap</label>
          <label class="switch">
            <input type="checkbox" id="show_heatmap" ${this._config.show_heatmap!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(e=>{e.addEventListener("change",i=>this.toggleChanged(i))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(e=>{e.addEventListener("input",i=>this.textChanged(i))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",e=>{const i=e.detail&&e.detail.value!=null?e.detail.value:null;this._onEntityPicked(i)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const e=t.target;this.dispatchConfigChange(e.id,e.checked)}textChanged(t){if(!this._config)return;const e=t.target;let i=e.value;if(e.id==="zoom_level"||e.id==="min_brightness"||e.id==="elevation_scale"||e.id==="playback_speed"){const a=parseFloat(i);isNaN(a)||(i=a)}this.dispatchConfigChange(e.id,i)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=i=>i.attributes&&Array.isArray(i.attributes.stations)&&i.attributes.icon==="mdi:lightning-bolt";const e=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==e&&(t.value=e)}_onEntityPicked(t){let e;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(e=t.slice(7,-9));const i={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:e||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}dispatchConfigChange(t,e){if(this._config[t]===e)return;const i={...this._config,[t]:e},a=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(a)}}customElements.define("weatherflow-lightning-card-editor",q);export{};
