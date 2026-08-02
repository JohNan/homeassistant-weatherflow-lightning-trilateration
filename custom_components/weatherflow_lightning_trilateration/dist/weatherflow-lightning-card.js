/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
const Q=6371,J=111.1,tt=15,et=14,it=225,C=Math.floor(7),P=40,z=P/2,U=60,D=36e5,Y=9e4,Z=60,j=1e3/Z;class K extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null,this.showHeightColor=!0,this._activeRafIds=new Set,this._warnedKeys=new Set}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const i=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,show_height_color:!0,show_stars:!0,show_clouds:!0,...t},i||(this.showHeightColor=this.config.show_height_color!==!1),this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const e=String(this.config.height);if(e.endsWith("px")){const s=parseInt(e);this.container.style.height=`${s-40}px`}else this.container.style.height=e}this.titleEl&&(this.titleEl.textContent=this.config.title||"",this.titleEl.style.display=this.config.title?"block":"none"),this.initialized&&this.applyConfigChanges(i||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const i=parseFloat(this.config.zoom_level);isNaN(i)||(this.zoomRadius=i,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.treeInstancedMeshes=[],this.forestFloorMats=[],this.canopyMaterials=[],this.vectorDataLoaded=!1)),this.starField&&(this.starField.visible=this.config.show_stars!==!1),this.cloudGroup&&(this.cloudGroup.visible=this.config.show_clouds!==!1)}connectedCallback(){if(window.THREE){this.initVisualizer();return}if(this._threeScriptLoading)return;this._threeScriptLoading=!0;const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>{this._threeScriptLoading=!1,this.initVisualizer()},t.onerror=i=>{this._threeScriptLoading=!1,console.error("WeatherFlow Card: Failed to load three.min.js",i)},document.head.appendChild(t)}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this._activeRafIds&&(this._activeRafIds.forEach(t=>cancelAnimationFrame(t)),this._activeRafIds.clear()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.treeInstancedMeshes=[],this.forestFloorMats=[],this.canopyMaterials=[],this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.cloudGroup&&(this.disposeHierarchy(this.cloudGroup),this.scene.remove(this.cloudGroup),this.cloudGroup=null),this._skyDome&&(this.scene.remove(this._skyDome),this._skyDome.geometry&&this._skyDome.geometry.dispose(),this._skyDome.material&&this._skyDome.material.dispose(),this._skyDome=null),this._skyTexture&&(this._skyTexture.dispose(),this._skyTexture=null),this._skyCanvas=null,this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.strikeFlashLight&&(this.scene.remove(this.strikeFlashLight),this.strikeFlashLight=null),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(i=>{i.geometry&&i.geometry.dispose(),i.material&&(Array.isArray(i.material)?i.material:[i.material]).forEach(s=>{s.map&&s.map.dispose(),s.dispose()})})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),i=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+i,this.cameraTarget.z+e),this.camera.lookAt(this.cameraTarget)),this.updateForestLOD()}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.titleEl=document.createElement("div"),this.titleEl.style.padding="10px 16px 0",this.titleEl.style.fontSize="16px",this.titleEl.style.fontWeight="500",this.titleEl.style.color="var(--primary-text-color, #e2e8f0)",this.titleEl.style.fontFamily="var(--paper-font-body1_-_font-family, sans-serif)",this.titleEl.textContent=this.config.title||"",this.titleEl.style.display=this.config.title?"block":"none",this.wrapper.appendChild(this.titleEl),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=String(this.config.height||"350px");if(t.endsWith("px")){const a=parseInt(t);this.container.style.height=`${a-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const i=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,i,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=THREE.PCFSoftShadowMap,this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const s=a=>a.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(a=>{this.weatherOverlay.addEventListener(a,s)}),this.weatherOverlay.addEventListener("click",a=>{if(a.target.closest(".hud-color-btn")){a.stopPropagation(),this.showHeightColor=!this.showHeightColor,this._paintHypsometricColours(),this.updateWeatherOverlay();return}(a.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(a.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let n=!1,r=!1,h={x:0,y:0};this.container.addEventListener("contextmenu",a=>{a.preventDefault()}),this.container.addEventListener("mousedown",a=>{this.lastInteractionTime=Date.now(),a.button===2||a.button===1||a.shiftKey?(r=!0,n=!1,this.container.style.cursor="move"):(n=!0,r=!1,this.container.style.cursor="grabbing"),h={x:a.clientX,y:a.clientY}}),this.container.addEventListener("mousemove",a=>{if(this.lastInteractionTime=Date.now(),n){const o=a.clientX-h.x,f=a.clientY-h.y;this.cameraTheta-=o*.005,this.cameraPhi+=f*.005,this.updateCameraPosition(),h={x:a.clientX,y:a.clientY}}else if(r){const o=a.clientX-h.x,f=a.clientY-h.y,c=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),d=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),u=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(c,-o*u),this.cameraTarget.addScaledVector(d,f*u),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),h={x:a.clientX,y:a.clientY}}else{const o=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(a.clientX-o.left)/o.width*2-1,this.mouse.y=-((a.clientY-o.top)/o.height)*2+1,this.checkHover(a.clientX-o.left,a.clientY-o.top)}}),this._mouseupHandler=()=>{n=!1,r=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.preventDefault(),this.zoomRadius+=a.deltaY*.02,this.updateCameraPosition()},{passive:!1});let p=0;this.container.addEventListener("touchstart",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.touches.length===1?(n=!0,h={x:a.touches[0].clientX,y:a.touches[0].clientY}):a.touches.length===2&&(n=!1,p=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY))}),this.container.addEventListener("touchmove",a=>{if(this.lastInteractionTime=Date.now(),a.preventDefault(),a.touches.length===1&&n){const o=a.touches[0].clientX-h.x,f=a.touches[0].clientY-h.y;this.cameraTheta-=o*.007,this.cameraPhi+=f*.007,this.updateCameraPosition(),h={x:a.touches[0].clientX,y:a.touches[0].clientY}}else if(a.touches.length===2){const o=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY),f=o-p;this.zoomRadius-=f*.15,this.updateCameraPosition(),p=o}},{passive:!1}),this.container.addEventListener("touchend",()=>{n=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const a=this.container.clientWidth,o=this.container.clientHeight;this.camera.aspect=a/o,this.camera.updateProjectionMatrix(),this.renderer.setSize(a,o)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const i=t.getContext("2d"),e=new THREE.CanvasTexture(t);if(!i)return e;const s=i.createRadialGradient(32,32,0,32,32,32);return s.addColorStop(0,"rgba(0, 242, 254, 1.0)"),s.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),s.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),s.addColorStop(1,"rgba(0, 0, 0, 0)"),i.fillStyle=s,i.fillRect(0,0,64,64),e.needsUpdate=!0,e}createRingLabelSprite(t){const i=document.createElement("canvas");i.width=128,i.height=64;const e=i.getContext("2d");if(!e){const r=new THREE.CanvasTexture(i),h=new THREE.SpriteMaterial({map:r,transparent:!0,depthWrite:!1}),p=new THREE.Sprite(h);return p.scale.set(2,1,1),p}e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const s=new THREE.CanvasTexture(i),l=new THREE.SpriteMaterial({map:s,transparent:!0,depthWrite:!1,depthTest:!0}),n=new THREE.Sprite(l);return n.scale.set(2,1,1),n}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(c=>{const d=[];for(let g=0;g<=128;g++){const m=g/128*Math.PI*2,T=c*Math.cos(m),E=c*Math.sin(m),v=this.getTerrainHeight(T,E)+.15;d.push(new THREE.Vector3(T,v,E))}const y=new THREE.BufferGeometry().setFromPoints(d),w=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),M=new THREE.Line(y,w);this.rangeRingsGroup.add(M)});const i=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),e=[],s=40;for(let c=0;c<=s;c++){const d=-30+c/s*60,u=this.getTerrainHeight(0,d)+.15;e.push(new THREE.Vector3(0,u,d))}const l=new THREE.BufferGeometry().setFromPoints(e),n=new THREE.Line(l,i);this.rangeRingsGroup.add(n);const r=[];for(let c=0;c<=s;c++){const d=-30+c/s*60,u=this.getTerrainHeight(d,0)+.15;r.push(new THREE.Vector3(d,u,0))}const h=new THREE.BufferGeometry().setFromPoints(r),p=new THREE.Line(h,i);this.rangeRingsGroup.add(p);const a=Math.SQRT2/2;this.ringLabels=[],t.forEach(c=>{const d=this.createRingLabelSprite(`${c}km`);d.position.set(c*a,.5,-c*a),this.rangeRingsGroup.add(d),this.ringLabels.push({sprite:d,r:c})});const o=t[t.length-1]+5,f=[{label:"N",x:0,z:-o},{label:"S",x:0,z:o},{label:"E",x:o,z:0},{label:"W",x:-o,z:0}];this.compassLabels=[],f.forEach(c=>{const d=this.createRingLabelSprite(c.label),u=this.getTerrainHeight(c.x,c.z)+.5;d.position.set(c.x,u,c.z),this.rangeRingsGroup.add(d),this.compassLabels.push({sprite:d,x:c.x,z:c.z})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((n,r)=>{const h=t[r];if(h){const p=h.geometry.attributes.position,a=128;for(let o=0;o<=a;o++){const f=o/a*Math.PI*2,c=n*Math.cos(f),d=n*Math.sin(f),u=this.getTerrainHeight(c,d)+.15;p.setY(o,u)}p.needsUpdate=!0}});const e=t[3];if(e){const n=e.geometry.attributes.position,r=40;for(let h=0;h<=r;h++){const p=-30+h/r*60,a=this.getTerrainHeight(0,p)+.15;n.setXYZ(h,0,a,p)}n.needsUpdate=!0}const s=t[4];if(s){const n=s.geometry.attributes.position,r=40;for(let h=0;h<=r;h++){const p=-30+h/r*60,a=this.getTerrainHeight(p,0)+.15;n.setXYZ(h,p,a,0)}n.needsUpdate=!0}const l=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(n=>{const r=n.r*l,h=-n.r*l,p=this.getTerrainHeight(r,h)+.4;n.sprite.position.set(r,p,h)}),this.compassLabels&&this.compassLabels.forEach(n=>{const r=this.getTerrainHeight(n.x,n.z)+.5;n.sprite.position.set(n.x,r,n.z)})}getTerrainHeight(t,i){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const e=(t+z)*14/P,s=(i+z)*14/P;if(e<0||e>14||s<0||s>14)return 0;const l=Math.floor(e),n=Math.min(14,l+1),r=Math.floor(s),h=Math.min(14,r+1),p=e-l,a=s-r,o=this.getGridHeight(r,l),f=this.getGridHeight(r,n),c=this.getGridHeight(h,l),d=this.getGridHeight(h,n),u=o*(1-p)+f*p,y=c*(1-p)+d*p;return u*(1-a)+y*a}getGridHeight(t,i){return this.scaledHeights?this.scaledHeights[(14-t)*15+i]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let n=0;n<15;n++){const r=n-C;for(let h=0;h<15;h++){const p=h-C,a=Math.sqrt(r*r+p*p);let o=80+Math.sin(r*.4)*Math.cos(p*.4)*45;if(o+=Math.sin(a*.8)*15,n===C&&h===C)o=100;else{const f=Math.min(1,a/3);o=100*(1-f)+o*f}this.elevationGrid.push(o)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let n=0;n<225;n++)this.scaledHeights[n]=((this.elevationGrid[n]||0)-t)*e;const s=this.terrainGeo.attributes.position,l=s.count;for(let n=0;n<l;n++){const r=s.getX(n),h=s.getY(n),p=this.getTerrainHeight(r,-h);s.setZ(n,p)}s.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,i){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const e=12,s=P,l=s/111.1,n=Math.cos(t*Math.PI/180),r=n>0?s/(111.1*n):s/111.1,h=t-l/2,p=t+l/2,a=i-r/2,o=i+r/2,f=(b,_)=>(b+180)/360*Math.pow(2,_),c=(b,_)=>(1-Math.log(Math.tan(b*Math.PI/180)+1/Math.cos(b*Math.PI/180))/Math.PI)/2*Math.pow(2,_),d=(b,_)=>b/Math.pow(2,_)*360-180,u=(b,_)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*b/Math.pow(2,_)))*180/Math.PI,y=Math.floor(f(a,e)),w=Math.floor(f(o,e)),M=Math.floor(c(p,e)),g=Math.floor(c(h,e)),m=2048,T=document.createElement("canvas");T.width=m,T.height=m;const E=T.getContext("2d");if(!E)return;E.fillStyle="#050b14",E.fillRect(0,0,m,m);const v=[];for(let b=y;b<=w;b++)for(let _=M;_<=g;_++){const L=d(b,e),R=d(b+1,e),x=u(_+1,e),H=u(_,e),k=(L-a)/(o-a),S=(R-a)/(o-a),I=(x-h)/(p-h),A=(H-h)/(p-h),N=k*m,B=(1-A)*m,V=(S-k)*m,W=(A-I)*m,X=`https://basemaps.cartocdn.com/dark_all/${e}/${b}/${_}.png`,$=new Promise(F=>{const G=new Image;G.crossOrigin="anonymous",G.onload=()=>{E.drawImage(G,N,B,V,W),F()},G.onerror=()=>F(),G.src=X});v.push($)}Promise.all(v).then(()=>{const b=new THREE.CanvasTexture(T);this.terrainMapMesh&&this.terrainMapMesh.material?(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.map=b,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0):b.dispose()})}async loadVectorData(t,i){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,i),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}_latLonToGrid(t,i,e,s){const l=Math.cos(e*Math.PI/180),n=6371*(i-s)*(Math.PI/180)*l,r=-6371*(t-e)*(Math.PI/180);return{x:n,z:r}}render3DFeatures(t,i,e){if(this.scene){if(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup)),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup),this.forestFloorMats=[],this.treeInstancedMeshes=[],this.canopyMaterials=[],t.water&&Array.isArray(t.water)){const s=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(l=>{if(!l.coordinates||l.coordinates.length<3)return;const n=[];let r=0,h=0;if(l.coordinates.forEach(f=>{const c=f[0],d=f[1],{x:u,z:y}=this._latLonToGrid(c,d,i,e);u<-20||u>20||y<-20||y>20||(n.push(new THREE.Vector2(u,-y)),r+=this.getTerrainHeight(u,y),h++)}),n.length<3)return;r/=h;const p=new THREE.Shape(n),a=new THREE.ShapeGeometry(p),o=new THREE.Mesh(a,s);o.rotation.x=-Math.PI/2,o.position.y=r+.08,this.features3DGroup.add(o)})}if(t.forest&&Array.isArray(t.forest)){const s=[],l=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0});this.forestFloorMats.push(l);const n=[],r=[],h=[];let p=0;const a=3e3,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,f=6,c={pine:20,oak:15,birch:18},d={pine:.7,oak:.55,birch:.67},u={pine:c.pine*o*f/d.pine,oak:c.oak*o*f/d.oak,birch:c.birch*o*f/d.birch},y=(E,v,b)=>{const _=.85+Math.random()*.4,L=Math.random()*Math.PI*2,R=Math.random(),x=R<.33?"pine":R<.66?"oak":"birch",H=u[x]*_,k=new THREE.Object3D;k.position.set(E,v,b),k.rotation.y=L,k.scale.set(H,H,H),k.updateMatrix(),x==="pine"?n.push(k.matrix.clone()):x==="oak"?r.push(k.matrix.clone()):h.push(k.matrix.clone())},w=(E,v)=>{const b=E[0],_=E[1];let L=!1;for(let R=0,x=v.length-1;R<v.length;x=R++){const H=v[R][0],k=v[R][1],S=v[x][0],I=v[x][1];k>_!=I>_&&b<(S-H)*(_-k)/(I-k)+H&&(L=!L)}return L};t.forest.forEach(E=>{if(!E.coordinates||E.coordinates.length<3)return;const v=[];let b=0,_=0;const L=E.coordinates.map(R=>{const x=R[0],H=R[1],{x:k,z:S}=this._latLonToGrid(x,H,i,e);return k>=-20&&k<=20&&S>=-20&&S<=20&&(v.push(new THREE.Vector2(k,-S)),b+=this.getTerrainHeight(k,S),_++),[k,S]});if(s.push(L),v.length>=3){b/=_;const R=new THREE.Shape(v),x=new THREE.ShapeGeometry(R),H=new THREE.Mesh(x,l);H.rotation.x=-Math.PI/2,H.position.y=b+.06,this.features3DGroup.add(H)}if(L.length>0&&p<a){let R=0,x=0;L.forEach(I=>{R+=I[0],x+=I[1]});const H=Math.max(-19.5,Math.min(19.5,R/L.length)),k=Math.max(-19.5,Math.min(19.5,x/L.length)),S=this.getTerrainHeight(H,k);y(H,S,k),p++}});const M=.35,g=M*.35,m=E=>{for(const v of s)if(w(E,v))return!0;return!1};for(let E=-19.5;E<=19.5;E+=M)for(let v=-19.5;v<=19.5&&!(p>=a);v+=M){const b=E+(Math.random()*2-1)*g,_=v+(Math.random()*2-1)*g,L=Math.max(-19.5,Math.min(19.5,b)),R=Math.max(-19.5,Math.min(19.5,_));if(m([L,R])){const x=this.getTerrainHeight(L,R);y(L,x,R),p++}}const T=(E,v,b,_,L)=>{if(E.length===0)return;const R=new THREE.InstancedMesh(v,b,E.length);E.forEach((x,H)=>R.setMatrixAt(H,x)),R.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(R),this.treeInstancedMeshes.push(R);for(let x=0;x<_.length;x++){const H=new THREE.InstancedMesh(_[x],L[x],E.length);E.forEach((k,S)=>H.setMatrixAt(S,k)),H.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(H),this.treeInstancedMeshes.push(H)}};if(n.length>0){const E=new THREE.CylinderGeometry(.04,.04,.2,4);E.translate(0,.1,0);const v=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),b=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),_=[new THREE.ConeGeometry(.18*1.3,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14*1.3,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1*1.3,.2,5).translate(0,.6,0)];T(n,E,v,_,[b,b,b]),b.userData.baseColor=b.color.clone(),this.canopyMaterials.push(b)}if(r.length>0){const E=new THREE.CylinderGeometry(.06,.08,.25,5);E.translate(0,.125,0);const v=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),b=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),_=[new THREE.SphereGeometry(.18,6,6).scale(1.3,1,1.3).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).scale(1.3,1,1.3).translate(.05,.35,0)];T(r,E,v,_,[b,b]),b.userData.baseColor=b.color.clone(),this.canopyMaterials.push(b)}if(h.length>0){const E=new THREE.CylinderGeometry(.03,.03,.3,4);E.translate(0,.15,0);const v=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),b=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),_=new THREE.SphereGeometry(.15,6,6);_.scale(1.3,1.8,1.3),_.translate(0,.4,0),T(h,E,v,[_],[b]),b.userData.baseColor=b.color.clone(),this.canopyMaterials.push(b)}}if(t.road&&Array.isArray(t.road)){const s=new THREE.MeshLambertMaterial({color:4674921,transparent:!0,opacity:.85}),l=.12;t.road.forEach(n=>{if(!n.coordinates||n.coordinates.length<2)return;const r=[];if(n.coordinates.forEach(a=>{const o=a[0],f=a[1],{x:c,z:d}=this._latLonToGrid(o,f,i,e);if(c<-20||c>20||d<-20||d>20)return;const u=this.getTerrainHeight(c,d)+.02;r.push(new THREE.Vector3(c,u,d))}),r.length<2)return;const h=this._buildRoadRibbonGeometry(r,l),p=new THREE.Mesh(h,s);p.receiveShadow=!0,this.features3DGroup.add(p)})}if(t.building&&Array.isArray(t.building)){const s=new THREE.MeshPhongMaterial({color:1976635,transparent:!0,opacity:.7,flatShading:!0});t.building.forEach(l=>{if(!l.coordinates||l.coordinates.length<3)return;const n=[];let r=0,h=0,p=0;if(l.coordinates.forEach(M=>{const g=M[0],m=M[1],{x:T,z:E}=this._latLonToGrid(g,m,i,e);T<-20||T>20||E<-20||E>20||(n.push(new THREE.Vector2(T,-E)),r+=T,h+=E,p++)}),n.length<3)return;r/=p,h/=p;const a=this.getTerrainHeight(r,h),o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,c=(l.height!==void 0?l.height:8)*o,d=new THREE.Shape(n),u={depth:c,bevelEnabled:!1},y=new THREE.ExtrudeGeometry(d,u),w=new THREE.Mesh(y,s);w.rotation.x=-Math.PI/2,w.position.y=a,w.castShadow=!0,w.receiveShadow=!0,this.features3DGroup.add(w)})}this.updateForestLOD()}}updateForestLOD(){if(!this.treeInstancedMeshes&&!this.forestFloorMats)return;const t=45,i=.85,e=.45,s=(this.zoomRadius||0)>t;this.treeInstancedMeshes&&this.treeInstancedMeshes.forEach(l=>{l.visible=!s}),this.forestFloorMats&&this.forestFloorMats.forEach(l=>{l.opacity=s?i:e})}_buildRoadRibbonGeometry(t,i){const e=i/2,s=[],l=[];for(let o=0;o<t.length;o++){const f=t[Math.max(0,o-1)],c=t[Math.min(t.length-1,o+1)];let d=c.x-f.x,u=c.z-f.z;const y=Math.sqrt(d*d+u*u)||1;d/=y,u/=y;const w=-u,M=d,g=t[o];s.push(new THREE.Vector3(g.x+w*e,g.y,g.z+M*e)),l.push(new THREE.Vector3(g.x-w*e,g.y,g.z-M*e))}const n=[],r=[],h=[];for(let o=0;o<t.length;o++)n.push(s[o].x,s[o].y,s[o].z),r.push(0,1,0),h.push(0,o/(t.length-1)),n.push(l[o].x,l[o].y,l[o].z),r.push(0,1,0),h.push(1,o/(t.length-1));const p=[];for(let o=0;o<t.length-1;o++){const f=o*2,c=o*2+1,d=o*2+2,u=o*2+3;p.push(f,c,d),p.push(c,u,d)}const a=new THREE.BufferGeometry;return a.setAttribute("position",new THREE.Float32BufferAttribute(n,3)),a.setAttribute("normal",new THREE.Float32BufferAttribute(r,3)),a.setAttribute("uv",new THREE.Float32BufferAttribute(h,2)),a.setIndex(p),a}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,i=-1/0;for(let a=0;a<225;a++)this.scaledHeights[a]<t&&(t=this.scaledHeights[a]),this.scaledHeights[a]>i&&(i=this.scaledHeights[a]);const e=i-t||1,s=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],l=a=>{let o=s[0],f=s[s.length-1];for(let d=0;d<s.length-1;d++)if(a>=s[d].t&&a<=s[d+1].t){o=s[d],f=s[d+1];break}const c=f.t===o.t?0:(a-o.t)/(f.t-o.t);return{r:o.r+(f.r-o.r)*c,g:o.g+(f.g-o.g)*c,b:o.b+(f.b-o.b)*c}},n=this.terrainGeo.attributes.position,r=this.terrainGeo.attributes.color;if(!r)return;const h=n.count,p=this.showHeightColor!==!1;for(let a=0;a<h;a++)if(!p)r.setXYZ(a,.02,.02,.02);else{const o=n.getX(a),f=n.getY(a),d=(this.getTerrainHeight(o,-f)-t)/e,u=l(Math.max(0,Math.min(1,d)));r.setXYZ(a,u.r,u.g,u.b)}r.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const i=C*15+C,e=t[i]||0,l=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let h=0;h<225;h++)this.scaledHeights[h]=((t[h]||0)-e)*l;const n=this.terrainGeo.attributes.position,r=n.count;for(let h=0;h<r;h++){const p=n.getX(h),a=n.getY(h),o=this.getTerrainHeight(p,-a);n.setZ(h,o)}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,i)=>{const e=this.stationMeshes[i];if(e&&e.mesh){const s=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=s}})}showTooltip(t,i,e){if(!this.tooltip)return;let s="Discovered Station";t.type==="primary"?s="Primary Station":t.type==="neighbor"&&(s="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${s}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const l=this.container.getBoundingClientRect();let n=i+15,r=e+15;n+150>l.width&&(n=i-165),r+60>l.height&&(r=e-75),this.tooltip.style.left=`${n}px`,this.tooltip.style.top=`${r}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,i){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(s=>s.mesh),!0);if(e.length>0){let s=e[0].object;for(;s&&s.parent&&(!s.userData||!s.userData.station);)s=s.parent;if(s&&s.userData&&s.userData.station){const l=s.userData.station;this.showTooltip(l,t,i),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=Y,i=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let s=0;s<this.strikeHistory.length;s++){const l=this.strikeHistory[s],n=i-l.time;if(n>=0&&n<=t){e.add(l.id);const r=n/t,h=.7*(1-r),p=1-r*.4;let a=this.heatmapMeshes.get(l.id);if(a)a.material.opacity=h,a.mesh.scale.set(p,p,p),a.mesh.position.y=this.getTerrainHeight(l.x,l.z);else{const o=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:h,depthWrite:!1}),f=new THREE.Mesh(this.heatGeo,o),c=this.getTerrainHeight(l.x,l.z);f.position.set(l.x,c,l.z),f.scale.set(p,p,p),this.scene.add(f),a={mesh:f,material:o},this.heatmapMeshes.set(l.id,a)}}}for(const[s,l]of this.heatmapMeshes.entries())e.has(s)||(this.scene.remove(l.mesh),l.material&&l.material.dispose(),this.heatmapMeshes.delete(s))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),i=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,i),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,25,7),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.set(2048,2048),this.dirLight.shadow.camera.near=1,this.dirLight.shadow.camera.far=80,this.dirLight.shadow.camera.left=-30,this.dirLight.shadow.camera.right=30,this.dirLight.shadow.camera.top=30,this.dirLight.shadow.camera.bottom=-30,this.dirLight.shadow.bias=-.0015,this.scene.add(this.dirLight),this.strikeFlashLight=new THREE.PointLight(12577279,0,60,2),this.strikeFlashLight.position.set(0,6,0),this.scene.add(this.strikeFlashLight);const e=new THREE.BufferGeometry,s=500,l=new Float32Array(s*3);for(let M=0;M<s*3;M+=3){const g=100+Math.random()*50,m=Math.random(),T=Math.random(),E=m*2*Math.PI,v=Math.acos(2*T-1);l[M]=g*Math.sin(v)*Math.cos(E),l[M+1]=g*Math.sin(v)*Math.sin(E),l[M+2]=g*Math.cos(v)}e.setAttribute("position",new THREE.BufferAttribute(l,3));const n=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(e,n),this.starField.visible=this.config.show_stars!==!1,this.scene.add(this.starField),this.cloudGroup=new THREE.Group;const r=document.createElement("canvas");r.width=128,r.height=128;const h=r.getContext("2d"),p=h.createRadialGradient(64,64,0,64,64,64);p.addColorStop(0,"rgba(148,163,184,0.35)"),p.addColorStop(1,"rgba(148,163,184,0)"),h.fillStyle=p,h.fillRect(0,0,128,128);const a=new THREE.CanvasTexture(r),o=new THREE.SpriteMaterial({map:a,transparent:!0,opacity:.5,depthWrite:!1});for(let M=0;M<14;M++){const g=new THREE.Sprite(o),m=10+Math.random()*14;g.scale.set(m,m*.5,1),g.position.set((Math.random()-.5)*90,18+Math.random()*10,(Math.random()-.5)*90),this.cloudGroup.add(g)}this.cloudGroup.visible=this.config.show_clouds!==!1,this.scene.add(this.cloudGroup);const f=40;this.terrainGeo=new THREE.PlaneGeometry(f,f,60,60);const c=this.terrainGeo.attributes.position.count,d=new Float32Array(c*3);d.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(d,3));const u=new THREE.MeshLambertMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(this.terrainGeo,u),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.005,this.terrainMapMesh.receiveShadow=!0,this.scene.add(this.terrainMapMesh);const y=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,y),this.terrainMesh.rotation.x=-Math.PI/2,this.terrainMesh.receiveShadow=!0,this.scene.add(this.terrainMesh);const w=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,w),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const i=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);i.position.set(t.x,e,t.z),i.userData={station:t};const s=.15,l=.5,n=Math.sqrt(l*l+s*s),r=new THREE.CylinderGeometry(.04,.05,n,6),h=new THREE.MeshStandardMaterial({color:3359061,roughness:.6,metalness:.5});for(let b=0;b<3;b++){const _=b/3*Math.PI*2,L=Math.cos(_)*l,R=Math.sin(_)*l,x=new THREE.Mesh(r,h);x.position.set(L/2,s/2,R/2);const H=new THREE.Vector3(-L,s,-R).normalize();x.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),H),x.castShadow=!0,x.receiveShadow=!0,i.add(x)}const p=new THREE.CylinderGeometry(.12,.14,.1,12),a=new THREE.Mesh(p,h);a.position.y=s,a.castShadow=!0,a.receiveShadow=!0,i.add(a);const o=new THREE.RingGeometry(.8,1,32),f=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),c=new THREE.Mesh(o,f);c.rotation.x=-Math.PI/2,c.position.y=.03,i.add(c),i.userData.pulseRing=c;const d=new THREE.CylinderGeometry(.08,.15,2.5,8),u=new THREE.MeshStandardMaterial({color:t.color,roughness:.5,metalness:.4,transparent:!0,opacity:.6}),y=new THREE.Mesh(d,u);y.position.y=1.35,y.castShadow=!0,i.add(y),i.userData.towerCyl=y;const w=new THREE.BoxGeometry(.9,.06,.06),M=new THREE.MeshStandardMaterial({color:9741240,metalness:.5,roughness:.4}),g=new THREE.Mesh(w,M);g.position.y=2.3,g.castShadow=!0,i.add(g);const m=new THREE.SphereGeometry(.25,16,16),T=new THREE.MeshBasicMaterial({color:t.color}),E=new THREE.Mesh(m,T);E.position.y=2.7,i.add(E),i.userData.topSphere=E;const v=this.createRingLabelSprite(t.id);v.scale.set(3.2,1.6,1),v.position.y=3.6,i.add(v),this.scene.add(i),this.stationMeshes.push({mesh:i,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const s=new THREE.BufferGeometry,l=new Float32Array(800*3);for(let o=0;o<800*3;o+=3)l[o]=(Math.random()-.5)*40,l[o+1]=18+Math.random()*4,l[o+2]=(Math.random()-.5)*40;s.setAttribute("position",new THREE.BufferAttribute(l,3));const n=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(s,n),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const r=300,h=new THREE.BufferGeometry,p=new Float32Array(r*3);for(let o=0;o<r*3;o+=3)p[o]=(Math.random()-.5)*40,p[o+1]=Math.random()*8,p[o+2]=(Math.random()-.5)*40;h.setAttribute("position",new THREE.BufferAttribute(p,3));const a=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(h,a),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),i=(this.rainRate||0).toFixed(1),e=this.windDirection||0,s=`${this.hudCollapsed?1:0}|${this.showHeightColor?1:0}|${t}|${i}|${e}`;if(this._lastWeatherOverlaySignature!==s){if(this._lastWeatherOverlaySignature=s,this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
              <span class="wind-arrow" style="transform: rotate(${e}deg); margin-left: 4px;">
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
            <div class="hud-value">${i} mm/h</div>
          </div>
        </div>
      </div>
    `}}updateWeatherSystem(t){if(!this.initialized)return;const i=this.config.show_weather!==!1,e=i&&this.rainRate>0,s=i&&this.windSpeed>0,l=(this.windDirection||0)*Math.PI/180,n=Math.sin(l),r=Math.cos(l);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const h=this.rainParticles.geometry.attributes.position,p=h.array,a=h.count,o=-n*(this.windSpeed||0)*.1,f=-r*(this.windSpeed||0)*.1,c=10+Math.min(20,this.rainRate*2);for(let d=0;d<a;d++){const u=d*3;let y=p[u],w=p[u+1],M=p[u+2];w-=c*t,y+=o*t,M+=f*t;const g=this.getTerrainHeight(y,M);(w<g||w<0)&&(w=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),y=(Math.random()-.5)*40,M=(Math.random()-.5)*40),p[u]=y,p[u+1]=w,p[u+2]=M}h.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=s,s)){const h=this.windParticles.geometry.attributes.position,p=h.array,a=h.count,o=-n*(this.windSpeed||0)*.5,f=-r*(this.windSpeed||0)*.5;for(let c=0;c<a;c++){const d=c*3;let u=p[d],y=p[d+1],w=p[d+2];u+=o*t,w+=f*t,y+=Math.sin(u*.5+w*.5)*.02,(u<-20||u>20||w<-20||w>20)&&(Math.abs(o)>Math.abs(f)?(u=o>0?-20:20,w=(Math.random()-.5)*40):(u=(Math.random()-.5)*40,w=f>0?-20:20),y=Math.random()*8),p[d]=u,p[d+1]=y,p[d+2]=w}h.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const i=this._skyCanvas.getContext("2d");if(!i)return;const e=this._skyCanvas.height,s=i.createLinearGradient(0,0,0,e),l=[2,4,10],n=[14,42,90],r=Math.round(l[0]+(n[0]-l[0])*t),h=Math.round(l[1]+(n[1]-l[1])*t),p=Math.round(l[2]+(n[2]-l[2])*t),a=Math.sin(t*Math.PI),o=Math.round(r+60*a),f=Math.round(h+20*a),c=Math.round(p+10*a);s.addColorStop(0,`rgb(${r},${h},${p})`),s.addColorStop(1,`rgb(${Math.min(255,o)},${Math.min(255,f)},${Math.min(255,c)})`),i.fillStyle=s,i.fillRect(0,0,2,e),this._skyTexture.needsUpdate=!0}_tintCanopyMaterials(t){if(!this.canopyMaterials||this.canopyMaterials.length===0)return;const i=new THREE.Color(16754253);this.canopyMaterials.forEach(e=>{const s=e.userData&&e.userData.baseColor;s&&e.color.copy(s).lerp(i,t*.35)})}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const n=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(n,1),this.scene.fog&&this.scene.fog.color.copy(n),this._paintSkyGradient(0),this._tintCanopyMaterials(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const n=this._hass.states["sun.sun"],r=n.attributes.elevation!==void 0?parseFloat(n.attributes.elevation):0;r>0?t=1:r<-6?t=0:t=(r+6)/6}else{const n=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,n/1e3))}if(this.ambientLight){const n=new THREE.Color(3359061),r=new THREE.Color(12573694),h=new THREE.Color(659744),p=new THREE.Color(1980958);this.ambientLight.color.copy(n).lerp(r,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(h).lerp(p,t);const a=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=a+t*(1.5-a)}if(this.dirLight){this.dirLight.intensity=t*1.5;const n=t*Math.PI-Math.PI/2,r=15*Math.sin(n),h=15*Math.cos(n);this.dirLight.position.set(r,h,7);const a=new THREE.Color(16753920),o=new THREE.Color(16707722);this.dirLight.color.copy(a).lerp(o,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const i=new THREE.Color(132106),e=new THREE.Color(529189),s=i.clone().lerp(e,t);if(this.renderer&&this.renderer.setClearColor(s,1),this.scene.fog){this.scene.fog.color.copy(s);const n=.008,r=.003,h=.01,p=Math.sin(t*Math.PI),a=n+(r-n)*t;this.scene.fog.density=a+(h-n)*p*.5}this._paintSkyGradient(t);const l=Math.sin(t*Math.PI);this._tintCanopyMaterials(l)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop());const t=Date.now();if(this.lastFrameTime!==null&&t-this.lastFrameTime<j)return;this.tickPlayback();const i=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(i),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.cloudGroup&&(this.cloudGroup.rotation.y+=15e-5),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const s=Math.sin(e.pulseVal);let l=1+s*.1,n=.5+s*.3;if(e.strikeIntensity&&e.strikeIntensity>0){e.strikeIntensity-=.02;const r=1+e.strikeIntensity*1.5;l*=r,n=Math.min(1,n+e.strikeIntensity*.5),e.mesh.userData.topSphere&&(e.mesh.userData.topSphere.scale.set(r,r,r),e.mesh.userData.topSphere.material.color.setHex(16777215)),e.mesh.userData.towerCyl&&e.mesh.userData.towerCyl.material.color.setHex(16777215)}else{const r=e.mesh.userData.station.color;e.mesh.userData.topSphere&&(e.mesh.userData.topSphere.scale.set(1,1,1),e.mesh.userData.topSphere.material.color.setHex(r)),e.mesh.userData.towerCyl&&(e.mesh.userData.towerCyl.scale.set(1,1,1),e.mesh.userData.towerCyl.material.color.setHex(r))}e.mesh.userData.pulseRing&&(e.mesh.userData.pulseRing.scale.set(l,l,1),e.mesh.userData.pulseRing.material.opacity=n)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const i=[1,5,10,30,60,120,300,600];i.includes(this.playbackSpeed)||(i.push(this.playbackSpeed),i.sort((e,s)=>e-s)),i.forEach(e=>{const s=document.createElement("option");s.value=e.toString(),s.innerText=`${e}x`,e===this.playbackSpeed&&(s.selected=!0),this.speedSelect.appendChild(s)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",e=>this.handleSliderInput(e)),this.speedSelect.addEventListener("change",e=>{this.playbackSpeed=parseFloat(e.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-D,this.strikeHistory[0].time):Date.now()-D,i=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=i,this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString(),this.slider.value=i.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),s=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=s*this.playbackSpeed,this.playbackTime>=i?(this.playbackTime=i,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-D,this.strikeHistory[0].time):Date.now()-D;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const i=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let s="";if(e<60)s=`-${e}s`;else{const l=Math.floor(e/60),n=e%60;s=`-${l}m ${n}s`}this.timeLabel&&(this.timeLabel.innerText=`${i} (${s})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(i=>{i.time<=this.playbackTime?i.animated=!0:i.animated=!1})}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,i,e=10){const s=[],l=new THREE.Vector3().subVectors(i,t);s.push(t.clone());for(let n=1;n<e;n++){const r=n/e,h=new THREE.Vector3().addVectors(t,l.clone().multiplyScalar(r)),p=(1-r)*1;h.add(new THREE.Vector3((Math.random()-.5)*p,(Math.random()-.5)*p,(Math.random()-.5)*p)),s.push(h)}return s.push(i.clone()),s}createLightningBranches(t,i,e=8){const s=this.createLightningPath(t,i,e),l=[s];for(let n=1;n<s.length-2;n++)if(Math.random()<.25){const r=s[n].clone(),p=(1-n/s.length)*6,a=new THREE.Vector3().subVectors(i,t).normalize();a.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const o=new THREE.Vector3().addVectors(r,a.multiplyScalar(p)),f=this.createLightningPath(r,o,4);l.push(f)}return l}_scheduleRaf(t){const i=requestAnimationFrame(e=>{this._activeRafIds.delete(i),t(e)});return this._activeRafIds.add(i),i}triggerStrikeAnimation(t,i,e=[]){if(!this.initialized)return;const s=this.getTerrainHeight(t,i),l=new THREE.Vector3(t,s,i),n=new THREE.Vector3(t+(Math.random()-.5)*4,s+18,i+(Math.random()-.5)*4),r=4+Math.random()*4;if(this.strikeFlashLight&&(this.strikeFlashLight.position.set(t,s+4,i),this.strikeFlashLight.intensity=r),this.stationMeshes&&this.stationMeshes.forEach(g=>{(!e||e.length===0||e.some(T=>String(T)===String(g.mesh.userData.station.id)))&&(g.strikeIntensity=1)}),this.ambientLight){const g=this.ambientLight.intensity;this.ambientLight.intensity=4;let m=0;const T=()=>{!this.initialized||!this.ambientLight||(m++,this.ambientLight.intensity=Math.max(g,4*(1-m/8)),m<8&&this._scheduleRaf(T))};this._scheduleRaf(T)}const h=[];this.createLightningBranches(n,l).forEach((g,m)=>{const T=new THREE.CatmullRomCurve3(g),E=m===0,v=new THREE.TubeGeometry(T,Math.max(10,g.length*3),E?.06:.03,5,!1),b=new THREE.MeshStandardMaterial({color:E?16777215:16769126,emissive:E?16766720:16757504,emissiveIntensity:E?3:1.5,transparent:!0,opacity:E?1:.75,depthWrite:!1}),_=new THREE.Mesh(v,b);this.strikeLayer.add(_),h.push(_)});const a=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),o=new THREE.Sprite(a);o.position.copy(l),o.position.y+=.1,o.scale.set(.1,.1,1),this.strikeLayer.add(o);const f=new THREE.RingGeometry(.1,.2,32),c=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(f,c);d.position.copy(l),d.position.y+=.05,d.rotation.x=-Math.PI/2,this.strikeLayer.add(d);const u=[];this.stations.forEach(g=>{const m=this.getTerrainHeight(g.x,g.z),T=new THREE.Vector3(g.x,m,g.z),E=T.distanceTo(l),v=new THREE.RingGeometry(E-.08,E+.08,64),b=new THREE.MeshBasicMaterial({color:g.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),_=new THREE.Mesh(v,b);_.position.copy(T),_.position.y+=.05,_.rotation.x=-Math.PI/2,this.strikeLayer.add(_),u.push({mesh:_,targetOpacity:.5})});let y=0;const w=U,M=()=>{if(!this.initialized||!this.strikeLayer)return;y++;const g=y/w;if(g<.2?h.forEach(m=>m.material.opacity=Math.random()>.3?1:.2):g<.5?h.forEach(m=>{m.material.opacity=1-(g-.2)/.3}):h.forEach(m=>{m.parent&&(this.strikeLayer.remove(m),m.geometry&&m.geometry.dispose(),m.material&&m.material.dispose())}),g<.6){const m=g*12;o.scale.set(m,m,1),o.material.opacity=1*(1-g/.6)}else o.parent&&(this.strikeLayer.remove(o),o.material.dispose());if(this.strikeFlashLight&&(g<.2?this.strikeFlashLight.intensity=r:g<.5?this.strikeFlashLight.intensity=r*(1-(g-.2)/.3):this.strikeFlashLight.intensity=0),g<.8){const m=1+g*25;d.scale.set(m,m,1),d.material.opacity=.8*(1-g/.8)}else d.parent&&(this.strikeLayer.remove(d),d.geometry&&d.geometry.dispose(),d.material&&d.material.dispose());u.forEach(m=>{g<.3?m.mesh.material.opacity=m.targetOpacity*(g/.3):g<.9?m.mesh.material.opacity=m.targetOpacity*(1-(g-.3)/.6):m.mesh.parent&&(this.strikeLayer.remove(m.mesh),m.mesh.geometry&&m.mesh.geometry.dispose(),m.mesh.material&&m.mesh.material.dispose())}),y<w&&this._scheduleRaf(M)};this._scheduleRaf(M)}_warnOnce(t,...i){this._warnedKeys.has(t)||(this._warnedKeys.add(t),console.warn(...i))}_elevationGridChanged(t){const i=this.elevationGrid;if(!i||t.length!==i.length)return!0;const e=t.length;if(e===0)return!1;const s=[0,Math.floor(e/4),Math.floor(e/2),Math.floor(3*e/4),e-1];for(const l of s)if(t[l]!==i[l])return!0;return!1}set hass(t){if(this._hass=t,!t||!this.initialized)return;const i=t.states,e="weatherflow_lightning_trilateration";let s,l;const n=[],r=[],h=Object.keys(i);for(let c=0;c<h.length;c++){const d=h[c],u=i[d];if(d.startsWith("sensor.")){const y=u.attributes;y.stations!==void 0&&(l||(l=d),!s&&d.endsWith("_stations")&&y.icon==="mdi:lightning-bolt"&&(s=d)),y.station_id!==void 0&&n.push({stationId:y.station_id,count:parseInt(u.state)||0})}else d.startsWith("geo_location.")&&u.attributes.source===e&&r.push(d)}const p=this.config.entity||this.config.entity_id||s||l;let a=t.config?.latitude??0,o=t.config?.longitude??0;if(p){const d=i[p].attributes.stations;if(Array.isArray(d)){const u=d.find(y=>y.type==="primary");if(u&&u.latitude!==void 0&&u.longitude!==void 0){const y=parseFloat(u.latitude),w=parseFloat(u.longitude);!isNaN(y)&&!isNaN(w)?(a=y,o=w):this._warnOnce("nan-primary-coords","WeatherFlow Card: Parsed primary station coordinates are NaN:",u.latitude,u.longitude)}else this._warnOnce("no-primary-station","WeatherFlow Card: No primary station found in stations list.")}else this._warnOnce("stations-not-array","WeatherFlow Card: stations attribute is not an array.")}else this._warnOnce("no-stations-sensor","WeatherFlow Card: No station sensor found \u2014 configure `entity` in the card config.");if((this.lastRefLat!==a||this.lastRefLon!==o)&&(this.lastRefLat=a,this.lastRefLon=o,this.loadMapTexture(a,o),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(a,o),p){const c=i[p].attributes,d=c.elevation_grid;d&&this._elevationGridChanged(d)&&this.updateTerrainGeometry(d),this.windSpeed=c.wind_speed!==void 0?parseFloat(c.wind_speed):0,this.windDirection=c.wind_direction!==void 0?parseFloat(c.wind_direction):0,this.solarRadiation=c.solar_radiation!==void 0?parseFloat(c.solar_radiation):1e3,this.rainRate=c.rain_rate!==void 0?parseFloat(c.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay(),this.lastStationStrikes||(this.lastStationStrikes={});for(const{stationId:y,count:w}of n){const M=this.lastStationStrikes[y];M!==void 0&&w>M&&this.stationMeshes&&this.stationMeshes.forEach(g=>{String(g.mesh.userData.station.id)===String(y)&&(g.strikeIntensity=1)}),this.lastStationStrikes[y]=w}const u=c.stations;if(Array.isArray(u)){let y=this.stations.length!==u.length;if(!y)for(let w=0;w<u.length;w++){const M=this.stations.find(T=>T.id===u[w].id),g=parseFloat(u[w].latitude),m=parseFloat(u[w].longitude);if(!M||M.lat!==g||M.lon!==m){y=!0;break}}y&&(this.stations=u.map(w=>{const M=parseFloat(w.latitude),g=parseFloat(w.longitude),{x:m,z:T}=this._latLonToGrid(M,g,a,o);let E=6583435;return w.type==="primary"?E=1096065:w.type==="neighbor"&&(E=3718648),{id:w.id,x:m,z:T,lat:M,lon:g,color:E,type:w.type}}),this.stationMeshes&&this.stationMeshes.forEach(w=>{this.scene.remove(w.mesh),this.disposeHierarchy(w.mesh)}),this.addWeatherStations())}}const f=[];r.forEach(c=>{const d=i[c],u=parseFloat(d.attributes.latitude),y=parseFloat(d.attributes.longitude),w=d.attributes.stations||[];if(!isNaN(u)&&!isNaN(y)){const{x:M,z:g}=this._latLonToGrid(u,y,a,o),m=new Date(d.last_changed).getTime();f.push({id:c,time:m,x:M,z:g,stations:w})}}),f.sort((c,d)=>c.time-d.time),f.forEach(c=>{if(!this.strikeHistory.some(d=>d.id===c.id)){const d=!this.knownStrikes.has(c.id);d&&this.knownStrikes.add(c.id);const u=this.playbackMode==="live"&&d;this.strikeHistory.push({id:c.id,time:c.time,x:c.x,z:c.z,stations:c.stations,animated:u||this.playbackMode!=="live"&&c.time<=this.playbackTime}),u&&this.triggerStrikeAnimation(c.x,c.z,c.stations)}}),this.strikeHistory=this.strikeHistory.filter(c=>f.some(d=>d.id===c.id)),this.strikeHistory.sort((c,d)=>c.time-d.time);for(const c of this.knownStrikes)t.states[c]||this.knownStrikes.delete(c)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",K),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const i=this.shadowRoot.getElementById("height");i&&(i.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const s=this.shadowRoot.getElementById("show_grid");s&&(s.checked=this._config.show_grid!==!1);const l=this.shadowRoot.getElementById("show_map");l&&(l.checked=this._config.show_map!==!1);const n=this.shadowRoot.getElementById("show_rings");n&&(n.checked=this._config.show_rings!==!1);const r=this.shadowRoot.getElementById("show_heatmap");r&&(r.checked=this._config.show_heatmap!==!1);const h=this.shadowRoot.getElementById("auto_orbit");h&&(h.checked=this._config.auto_orbit!==!1);const p=this.shadowRoot.getElementById("show_weather");p&&(p.checked=this._config.show_weather!==!1);const a=this.shadowRoot.getElementById("show_daynight");a&&(a.checked=this._config.show_daynight!==!1);const o=this.shadowRoot.getElementById("min_brightness");o&&(o.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const f=this.shadowRoot.getElementById("elevation_scale");f&&(f.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const c=this.shadowRoot.getElementById("show_3d_features");c&&(c.checked=this._config.show_3d_features===!0);const d=this.shadowRoot.getElementById("playback_speed");d&&(d.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120");const u=this.shadowRoot.getElementById("title");u&&(u.value=this._config.title||"");const y=this.shadowRoot.getElementById("show_height_color");y&&(y.checked=this._config.show_height_color!==!1);const w=this.shadowRoot.getElementById("show_stars");w&&(w.checked=this._config.show_stars!==!1);const M=this.shadowRoot.getElementById("show_clouds");M&&(M.checked=this._config.show_clouds!==!1),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
        <div class="config-row">
          <label for="show_height_color">Show Hypsometric Height-Colour Map</label>
          <label class="switch">
            <input type="checkbox" id="show_height_color" ${this._config.show_height_color!==!1?"checked":""}>
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
        <div class="config-row">
          <label for="show_stars">Show Night Starfield</label>
          <label class="switch">
            <input type="checkbox" id="show_stars" ${this._config.show_stars!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="config-row">
          <label for="show_clouds">Show Ambient Cloud Layer</label>
          <label class="switch">
            <input type="checkbox" id="show_clouds" ${this._config.show_clouds!==!1?"checked":""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(i=>{i.addEventListener("change",e=>this.toggleChanged(e))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(i=>{i.addEventListener("input",e=>this.textChanged(e))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",i=>{const e=i.detail&&i.detail.value!=null?i.detail.value:null;this._onEntityPicked(e)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const i=t.target;this.dispatchConfigChange(i.id,i.checked)}textChanged(t){if(!this._config)return;const i=t.target;let e=i.value;if(i.id==="zoom_level"||i.id==="min_brightness"||i.id==="elevation_scale"||i.id==="playback_speed"){const s=parseFloat(e);isNaN(s)||(e=s)}this.dispatchConfigChange(i.id,e)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=e=>e.attributes&&Array.isArray(e.attributes.stations)&&e.attributes.icon==="mdi:lightning-bolt";const i=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==i&&(t.value=i)}_onEntityPicked(t){const i={...this._config,entity:t||void 0,entity_id:t||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}dispatchConfigChange(t,i){if(this._config[t]===i)return;const e={...this._config,[t]:i},s=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(s)}}customElements.define("weatherflow-lightning-card-editor",q);export{};
