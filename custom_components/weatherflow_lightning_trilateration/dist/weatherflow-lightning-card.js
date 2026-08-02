/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
const Q=6371,J=111.1,tt=21,et=20,it=441,C=Math.floor(10),D=40,F=D/2,U=60,P=36e5,Y=9e4,Z=60,j=1e3/Z;class K extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null,this.showHeightColor=!0,this._activeRafIds=new Set,this._warnedKeys=new Set}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const i=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,show_height_color:!0,show_stars:!0,show_clouds:!0,...t},i||(this.showHeightColor=this.config.show_height_color!==!1),this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const e=String(this.config.height);if(e.endsWith("px")){const s=parseInt(e);this.container.style.height=`${s-40}px`}else this.container.style.height=e}this.titleEl&&(this.titleEl.textContent=this.config.title||"",this.titleEl.style.display=this.config.title?"block":"none"),this.initialized&&this.applyConfigChanges(i||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const i=parseFloat(this.config.zoom_level);isNaN(i)||(this.zoomRadius=i,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===441?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.treeInstancedMeshes=[],this.forestFloorMats=[],this.canopyMaterials=[],this.buildingMeshes=[],this.vectorDataLoaded=!1)),this.starField&&(this.starField.visible=this.config.show_stars!==!1),this.cloudGroup&&(this.cloudGroup.visible=this.config.show_clouds!==!1)}connectedCallback(){if(window.THREE){this.initVisualizer();return}if(this._threeScriptLoading)return;this._threeScriptLoading=!0;const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>{this._threeScriptLoading=!1,this.initVisualizer()},t.onerror=i=>{this._threeScriptLoading=!1,console.error("WeatherFlow Card: Failed to load three.min.js",i)},document.head.appendChild(t)}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this._activeRafIds&&(this._activeRafIds.forEach(t=>cancelAnimationFrame(t)),this._activeRafIds.clear()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.treeInstancedMeshes=[],this.forestFloorMats=[],this.canopyMaterials=[],this.buildingMeshes=[],this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.cloudGroup&&(this.disposeHierarchy(this.cloudGroup),this.scene.remove(this.cloudGroup),this.cloudGroup=null),this._skyDome&&(this.scene.remove(this._skyDome),this._skyDome.geometry&&this._skyDome.geometry.dispose(),this._skyDome.material&&this._skyDome.material.dispose(),this._skyDome=null),this._skyTexture&&(this._skyTexture.dispose(),this._skyTexture=null),this._skyCanvas=null,this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.strikeFlashLight&&(this.scene.remove(this.strikeFlashLight),this.strikeFlashLight=null),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(i=>{i.geometry&&i.geometry.dispose(),i.material&&(Array.isArray(i.material)?i.material:[i.material]).forEach(s=>{s.map&&s.map.dispose(),s.dispose()})})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),i=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+i,this.cameraTarget.z+e),this.camera.lookAt(this.cameraTarget)),this.updateForestLOD(),this.updateBuildingLOD()}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.titleEl=document.createElement("div"),this.titleEl.style.padding="10px 16px 0",this.titleEl.style.fontSize="16px",this.titleEl.style.fontWeight="500",this.titleEl.style.color="var(--primary-text-color, #e2e8f0)",this.titleEl.style.fontFamily="var(--paper-font-body1_-_font-family, sans-serif)",this.titleEl.textContent=this.config.title||"",this.titleEl.style.display=this.config.title?"block":"none",this.wrapper.appendChild(this.titleEl),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=String(this.config.height||"350px");if(t.endsWith("px")){const a=parseInt(t);this.container.style.height=`${a-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const i=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,i,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=THREE.PCFSoftShadowMap,this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const s=a=>a.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(a=>{this.weatherOverlay.addEventListener(a,s)}),this.weatherOverlay.addEventListener("click",a=>{if(a.target.closest(".hud-color-btn")){a.stopPropagation(),this.showHeightColor=!this.showHeightColor,this._paintHypsometricColours(),this.updateWeatherOverlay();return}(a.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(a.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let n=!1,h=!1,l={x:0,y:0};this.container.addEventListener("contextmenu",a=>{a.preventDefault()}),this.container.addEventListener("mousedown",a=>{this.lastInteractionTime=Date.now(),a.button===2||a.button===1||a.shiftKey?(h=!0,n=!1,this.container.style.cursor="move"):(n=!0,h=!1,this.container.style.cursor="grabbing"),l={x:a.clientX,y:a.clientY}}),this.container.addEventListener("mousemove",a=>{if(this.lastInteractionTime=Date.now(),n){const o=a.clientX-l.x,f=a.clientY-l.y;this.cameraTheta-=o*.005,this.cameraPhi+=f*.005,this.updateCameraPosition(),l={x:a.clientX,y:a.clientY}}else if(h){const o=a.clientX-l.x,f=a.clientY-l.y,d=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),p=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),u=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(d,-o*u),this.cameraTarget.addScaledVector(p,f*u),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),l={x:a.clientX,y:a.clientY}}else{const o=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(a.clientX-o.left)/o.width*2-1,this.mouse.y=-((a.clientY-o.top)/o.height)*2+1,this.checkHover(a.clientX-o.left,a.clientY-o.top)}}),this._mouseupHandler=()=>{n=!1,h=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.preventDefault(),this.zoomRadius+=a.deltaY*.02,this.updateCameraPosition()},{passive:!1});let c=0;this.container.addEventListener("touchstart",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.touches.length===1?(n=!0,l={x:a.touches[0].clientX,y:a.touches[0].clientY}):a.touches.length===2&&(n=!1,c=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY))}),this.container.addEventListener("touchmove",a=>{if(this.lastInteractionTime=Date.now(),a.preventDefault(),a.touches.length===1&&n){const o=a.touches[0].clientX-l.x,f=a.touches[0].clientY-l.y;this.cameraTheta-=o*.007,this.cameraPhi+=f*.007,this.updateCameraPosition(),l={x:a.touches[0].clientX,y:a.touches[0].clientY}}else if(a.touches.length===2){const o=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY),f=o-c;this.zoomRadius-=f*.15,this.updateCameraPosition(),c=o}},{passive:!1}),this.container.addEventListener("touchend",()=>{n=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const a=this.container.clientWidth,o=this.container.clientHeight;this.camera.aspect=a/o,this.camera.updateProjectionMatrix(),this.renderer.setSize(a,o)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const i=t.getContext("2d"),e=new THREE.CanvasTexture(t);if(!i)return e;const s=i.createRadialGradient(32,32,0,32,32,32);return s.addColorStop(0,"rgba(0, 242, 254, 1.0)"),s.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),s.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),s.addColorStop(1,"rgba(0, 0, 0, 0)"),i.fillStyle=s,i.fillRect(0,0,64,64),e.needsUpdate=!0,e}createRingLabelSprite(t){const i=document.createElement("canvas");i.width=128,i.height=64;const e=i.getContext("2d");if(!e){const h=new THREE.CanvasTexture(i),l=new THREE.SpriteMaterial({map:h,transparent:!0,depthWrite:!1}),c=new THREE.Sprite(l);return c.scale.set(2,1,1),c}e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const s=new THREE.CanvasTexture(i),r=new THREE.SpriteMaterial({map:s,transparent:!0,depthWrite:!1,depthTest:!0}),n=new THREE.Sprite(r);return n.scale.set(2,1,1),n}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(d=>{const p=[];for(let g=0;g<=128;g++){const m=g/128*Math.PI*2,R=d*Math.cos(m),w=d*Math.sin(m),M=this.getTerrainHeight(R,w)+.15;p.push(new THREE.Vector3(R,M,w))}const y=new THREE.BufferGeometry().setFromPoints(p),b=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),_=new THREE.Line(y,b);this.rangeRingsGroup.add(_)});const i=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),e=[],s=40;for(let d=0;d<=s;d++){const p=-30+d/s*60,u=this.getTerrainHeight(0,p)+.15;e.push(new THREE.Vector3(0,u,p))}const r=new THREE.BufferGeometry().setFromPoints(e),n=new THREE.Line(r,i);this.rangeRingsGroup.add(n);const h=[];for(let d=0;d<=s;d++){const p=-30+d/s*60,u=this.getTerrainHeight(p,0)+.15;h.push(new THREE.Vector3(p,u,0))}const l=new THREE.BufferGeometry().setFromPoints(h),c=new THREE.Line(l,i);this.rangeRingsGroup.add(c);const a=Math.SQRT2/2;this.ringLabels=[],t.forEach(d=>{const p=this.createRingLabelSprite(`${d}km`);p.position.set(d*a,.5,-d*a),this.rangeRingsGroup.add(p),this.ringLabels.push({sprite:p,r:d})});const o=t[t.length-1]+5,f=[{label:"N",x:0,z:-o},{label:"S",x:0,z:o},{label:"E",x:o,z:0},{label:"W",x:-o,z:0}];this.compassLabels=[],f.forEach(d=>{const p=this.createRingLabelSprite(d.label),u=this.getTerrainHeight(d.x,d.z)+.5;p.position.set(d.x,u,d.z),this.rangeRingsGroup.add(p),this.compassLabels.push({sprite:p,x:d.x,z:d.z})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((n,h)=>{const l=t[h];if(l){const c=l.geometry.attributes.position,a=128;for(let o=0;o<=a;o++){const f=o/a*Math.PI*2,d=n*Math.cos(f),p=n*Math.sin(f),u=this.getTerrainHeight(d,p)+.15;c.setY(o,u)}c.needsUpdate=!0}});const e=t[3];if(e){const n=e.geometry.attributes.position,h=40;for(let l=0;l<=h;l++){const c=-30+l/h*60,a=this.getTerrainHeight(0,c)+.15;n.setXYZ(l,0,a,c)}n.needsUpdate=!0}const s=t[4];if(s){const n=s.geometry.attributes.position,h=40;for(let l=0;l<=h;l++){const c=-30+l/h*60,a=this.getTerrainHeight(c,0)+.15;n.setXYZ(l,c,a,0)}n.needsUpdate=!0}const r=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(n=>{const h=n.r*r,l=-n.r*r,c=this.getTerrainHeight(h,l)+.4;n.sprite.position.set(h,c,l)}),this.compassLabels&&this.compassLabels.forEach(n=>{const h=this.getTerrainHeight(n.x,n.z)+.5;n.sprite.position.set(n.x,h,n.z)})}getTerrainHeight(t,i){if(!this.elevationGrid||this.elevationGrid.length!==441)return 0;const e=(t+F)*20/D,s=(i+F)*20/D;if(e<0||e>20||s<0||s>20)return 0;const r=Math.floor(e),n=Math.min(20,r+1),h=Math.floor(s),l=Math.min(20,h+1),c=e-r,a=s-h,o=this.getGridHeight(h,r),f=this.getGridHeight(h,n),d=this.getGridHeight(l,r),p=this.getGridHeight(l,n),u=o*(1-c)+f*c,y=d*(1-c)+p*c;return u*(1-a)+y*a}getGridHeight(t,i){return this.scaledHeights?this.scaledHeights[(20-t)*21+i]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let n=0;n<21;n++){const h=n-C;for(let l=0;l<21;l++){const c=l-C,a=Math.sqrt(h*h+c*c);let o=80+Math.sin(h*.4)*Math.cos(c*.4)*45;if(o+=Math.sin(a*.8)*15,n===C&&l===C)o=100;else{const f=Math.min(1,a/3);o=100*(1-f)+o*f}this.elevationGrid.push(o)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(441);for(let n=0;n<441;n++)this.scaledHeights[n]=((this.elevationGrid[n]||0)-t)*e;const s=this.terrainGeo.attributes.position,r=s.count;for(let n=0;n<r;n++){const h=s.getX(n),l=s.getY(n),c=this.getTerrainHeight(h,-l);s.setZ(n,c)}s.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,i){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const e=12,s=D,r=s/111.1,n=Math.cos(t*Math.PI/180),h=n>0?s/(111.1*n):s/111.1,l=t-r/2,c=t+r/2,a=i-h/2,o=i+h/2,f=(E,v)=>(E+180)/360*Math.pow(2,v),d=(E,v)=>(1-Math.log(Math.tan(E*Math.PI/180)+1/Math.cos(E*Math.PI/180))/Math.PI)/2*Math.pow(2,v),p=(E,v)=>E/Math.pow(2,v)*360-180,u=(E,v)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*E/Math.pow(2,v)))*180/Math.PI,y=Math.floor(f(a,e)),b=Math.floor(f(o,e)),_=Math.floor(d(c,e)),g=Math.floor(d(l,e)),m=2048,R=document.createElement("canvas");R.width=m,R.height=m;const w=R.getContext("2d");if(!w)return;w.fillStyle="#050b14",w.fillRect(0,0,m,m);const M=[];for(let E=y;E<=b;E++)for(let v=_;v<=g;v++){const S=p(E,e),H=p(E+1,e),x=u(v+1,e),k=u(v,e),T=(S-a)/(o-a),L=(H-a)/(o-a),I=(x-l)/(c-l),A=(k-l)/(c-l),N=T*m,B=(1-A)*m,V=(L-T)*m,W=(A-I)*m,$=`https://basemaps.cartocdn.com/dark_all/${e}/${E}/${v}.png`,X=new Promise(z=>{const G=new Image;G.crossOrigin="anonymous",G.onload=()=>{w.drawImage(G,N,B,V,W),z()},G.onerror=()=>z(),G.src=$});M.push(X)}Promise.all(M).then(()=>{const E=new THREE.CanvasTexture(R);this.terrainMapMesh&&this.terrainMapMesh.material?(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.map=E,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0):E.dispose()})}async loadVectorData(t,i){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,i),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}_latLonToGrid(t,i,e,s){const r=Math.cos(e*Math.PI/180),n=6371*(i-s)*(Math.PI/180)*r,h=-6371*(t-e)*(Math.PI/180);return{x:n,z:h}}render3DFeatures(t,i,e){if(this.scene){if(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup)),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup),this.forestFloorMats=[],this.treeInstancedMeshes=[],this.canopyMaterials=[],this.buildingMeshes=[],t.water&&Array.isArray(t.water)){const s=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(r=>{if(!r.coordinates||r.coordinates.length<3)return;const n=[];let h=0,l=0;if(r.coordinates.forEach(f=>{const d=f[0],p=f[1],{x:u,z:y}=this._latLonToGrid(d,p,i,e);u<-20||u>20||y<-20||y>20||(n.push(new THREE.Vector2(u,-y)),h+=this.getTerrainHeight(u,y),l++)}),n.length<3)return;h/=l;const c=new THREE.Shape(n),a=new THREE.ShapeGeometry(c),o=new THREE.Mesh(a,s);o.rotation.x=-Math.PI/2,o.position.y=h+.08,this.features3DGroup.add(o)})}if(t.forest&&Array.isArray(t.forest)){const s=[],r=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0});this.forestFloorMats.push(r);const n=[],h=[],l=[];let c=0;const a=3e3,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,f=6,d={pine:20,oak:15,birch:18},p={pine:.7,oak:.55,birch:.67},u={pine:d.pine*o*f/p.pine,oak:d.oak*o*f/p.oak,birch:d.birch*o*f/p.birch},y=(w,M,E)=>{const v=.85+Math.random()*.4,S=Math.random()*Math.PI*2,H=Math.random(),x=H<.33?"pine":H<.66?"oak":"birch",k=u[x]*v,T=new THREE.Object3D;T.position.set(w,M,E),T.rotation.y=S,T.scale.set(k,k,k),T.updateMatrix(),x==="pine"?n.push(T.matrix.clone()):x==="oak"?h.push(T.matrix.clone()):l.push(T.matrix.clone())},b=(w,M)=>{const E=w[0],v=w[1];let S=!1;for(let H=0,x=M.length-1;H<M.length;x=H++){const k=M[H][0],T=M[H][1],L=M[x][0],I=M[x][1];T>v!=I>v&&E<(L-k)*(v-T)/(I-T)+k&&(S=!S)}return S};t.forest.forEach(w=>{if(!w.coordinates||w.coordinates.length<3)return;const M=[];let E=0,v=0;const S=w.coordinates.map(H=>{const x=H[0],k=H[1],{x:T,z:L}=this._latLonToGrid(x,k,i,e);return T>=-20&&T<=20&&L>=-20&&L<=20&&(M.push(new THREE.Vector2(T,-L)),E+=this.getTerrainHeight(T,L),v++),[T,L]});if(s.push(S),M.length>=3){E/=v;const H=new THREE.Shape(M),x=new THREE.ShapeGeometry(H),k=new THREE.Mesh(x,r);k.rotation.x=-Math.PI/2,k.position.y=E+.06,this.features3DGroup.add(k)}if(S.length>0&&c<a){let H=0,x=0;S.forEach(I=>{H+=I[0],x+=I[1]});const k=Math.max(-19.5,Math.min(19.5,H/S.length)),T=Math.max(-19.5,Math.min(19.5,x/S.length)),L=this.getTerrainHeight(k,T);y(k,L,T),c++}});const _=.35,g=_*.35,m=w=>{for(const M of s)if(b(w,M))return!0;return!1};for(let w=-19.5;w<=19.5;w+=_)for(let M=-19.5;M<=19.5&&!(c>=a);M+=_){const E=w+(Math.random()*2-1)*g,v=M+(Math.random()*2-1)*g,S=Math.max(-19.5,Math.min(19.5,E)),H=Math.max(-19.5,Math.min(19.5,v));if(m([S,H])){const x=this.getTerrainHeight(S,H);y(S,x,H),c++}}const R=(w,M,E,v,S)=>{if(w.length===0)return;const H=new THREE.InstancedMesh(M,E,w.length);w.forEach((x,k)=>H.setMatrixAt(k,x)),H.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(H),this.treeInstancedMeshes.push(H);for(let x=0;x<v.length;x++){const k=new THREE.InstancedMesh(v[x],S[x],w.length);w.forEach((T,L)=>k.setMatrixAt(L,T)),k.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(k),this.treeInstancedMeshes.push(k)}};if(n.length>0){const w=new THREE.CylinderGeometry(.04,.04,.2,4);w.translate(0,.1,0);const M=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),v=[new THREE.ConeGeometry(.18*1.3,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14*1.3,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1*1.3,.2,5).translate(0,.6,0)];R(n,w,M,v,[E,E,E]),E.userData.baseColor=E.color.clone(),this.canopyMaterials.push(E)}if(h.length>0){const w=new THREE.CylinderGeometry(.06,.08,.25,5);w.translate(0,.125,0);const M=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),v=[new THREE.SphereGeometry(.18,6,6).scale(1.3,1,1.3).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).scale(1.3,1,1.3).translate(.05,.35,0)];R(h,w,M,v,[E,E]),E.userData.baseColor=E.color.clone(),this.canopyMaterials.push(E)}if(l.length>0){const w=new THREE.CylinderGeometry(.03,.03,.3,4);w.translate(0,.15,0);const M=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),v=new THREE.SphereGeometry(.15,6,6);v.scale(1.3,1.8,1.3),v.translate(0,.4,0),R(l,w,M,[v],[E]),E.userData.baseColor=E.color.clone(),this.canopyMaterials.push(E)}}if(t.road&&Array.isArray(t.road)){const s=new THREE.MeshLambertMaterial({color:4674921,transparent:!0,opacity:.85}),r=.12;t.road.forEach(n=>{if(!n.coordinates||n.coordinates.length<2)return;const h=[];if(n.coordinates.forEach(a=>{const o=a[0],f=a[1],{x:d,z:p}=this._latLonToGrid(o,f,i,e);if(d<-20||d>20||p<-20||p>20)return;const u=this.getTerrainHeight(d,p)+.02;h.push(new THREE.Vector3(d,u,p))}),h.length<2)return;const l=this._buildRoadRibbonGeometry(h,r),c=new THREE.Mesh(l,s);c.receiveShadow=!0,this.features3DGroup.add(c)})}if(this.buildingMeshes=[],t.building&&Array.isArray(t.building)){const s=new THREE.MeshPhongMaterial({color:1976635,transparent:!0,opacity:.7,flatShading:!0}),r=new THREE.MeshPhongMaterial({color:8330525,flatShading:!0}),n=new Set(["house","residential","detached","semidetached_house","terrace"]);t.building.forEach(h=>{if(!h.coordinates||h.coordinates.length<3)return;const l=[];let c=0,a=0,o=1/0,f=-1/0,d=1/0,p=-1/0,u=0;if(h.coordinates.forEach(x=>{const k=x[0],T=x[1],{x:L,z:I}=this._latLonToGrid(k,T,i,e);L<-20||L>20||I<-20||I>20||(l.push(new THREE.Vector2(L,-I)),c+=L,a+=I,o=Math.min(o,L),f=Math.max(f,L),d=Math.min(d,I),p=Math.max(p,I),u++)}),l.length<3)return;c/=u,a/=u;const y=this.getTerrainHeight(c,a),b=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,g=(h.height!==void 0?h.height:8)*b,m=new THREE.Shape(l),R={depth:g,bevelEnabled:!1},w=new THREE.ExtrudeGeometry(m,R),M=new THREE.Group,E=new THREE.Mesh(w,s);E.castShadow=!0,E.receiveShadow=!0,M.add(E);const v=Math.max(.001,f-o),S=Math.max(.001,p-d),H=v*S;if(n.has(h.type)){const x=Math.max(g*.35,.004),k=this._buildGableRoofGeometry(v,S,x),T=new THREE.Mesh(k,r);T.position.set((o+f)/2,(d+p)/2,g),T.castShadow=!0,T.receiveShadow=!0,M.add(T)}M.rotation.x=-Math.PI/2,M.position.y=y,this.features3DGroup.add(M),this.buildingMeshes.push({group:M,footprintArea:H})})}this.updateForestLOD(),this.updateBuildingLOD()}}_buildGableRoofGeometry(t,i,e){const s=t/2,r=i/2,n=t>=i;let h;n?h=[[-s,-r,0],[s,-r,0],[s,r,0],[-s,r,0],[-s,0,e],[s,0,e]]:h=[[-s,-r,0],[s,-r,0],[s,r,0],[-s,r,0],[0,-r,e],[0,r,e]];const l=[],c=(o,f,d)=>{l.push(...h[o],...h[f],...h[d])};n?(c(0,1,5),c(0,5,4),c(3,4,5),c(3,5,2),c(0,4,3),c(1,2,5)):(c(0,4,3),c(4,5,3),c(1,2,5),c(1,5,4),c(0,1,4),c(3,5,2));const a=new THREE.BufferGeometry;return a.setAttribute("position",new THREE.Float32BufferAttribute(l,3)),a.computeVertexNormals(),a}updateBuildingLOD(){if(!this.buildingMeshes||this.buildingMeshes.length===0)return;const t=45,i=.02,e=(this.zoomRadius||0)>t;this.buildingMeshes.forEach(({group:s,footprintArea:r})=>{s.visible=!e||r>=i})}updateForestLOD(){if(!this.treeInstancedMeshes&&!this.forestFloorMats)return;const t=45,i=.85,e=.45,s=(this.zoomRadius||0)>t;this.treeInstancedMeshes&&this.treeInstancedMeshes.forEach(r=>{r.visible=!s}),this.forestFloorMats&&this.forestFloorMats.forEach(r=>{r.opacity=s?i:e})}_buildRoadRibbonGeometry(t,i){const e=i/2,s=[],r=[];for(let o=0;o<t.length;o++){const f=t[Math.max(0,o-1)],d=t[Math.min(t.length-1,o+1)];let p=d.x-f.x,u=d.z-f.z;const y=Math.sqrt(p*p+u*u)||1;p/=y,u/=y;const b=-u,_=p,g=t[o];s.push(new THREE.Vector3(g.x+b*e,g.y,g.z+_*e)),r.push(new THREE.Vector3(g.x-b*e,g.y,g.z-_*e))}const n=[],h=[],l=[];for(let o=0;o<t.length;o++)n.push(s[o].x,s[o].y,s[o].z),h.push(0,1,0),l.push(0,o/(t.length-1)),n.push(r[o].x,r[o].y,r[o].z),h.push(0,1,0),l.push(1,o/(t.length-1));const c=[];for(let o=0;o<t.length-1;o++){const f=o*2,d=o*2+1,p=o*2+2,u=o*2+3;c.push(f,d,p),c.push(d,u,p)}const a=new THREE.BufferGeometry;return a.setAttribute("position",new THREE.Float32BufferAttribute(n,3)),a.setAttribute("normal",new THREE.Float32BufferAttribute(h,3)),a.setAttribute("uv",new THREE.Float32BufferAttribute(l,2)),a.setIndex(c),a}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,i=-1/0;for(let a=0;a<441;a++)this.scaledHeights[a]<t&&(t=this.scaledHeights[a]),this.scaledHeights[a]>i&&(i=this.scaledHeights[a]);const e=i-t||1,s=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],r=a=>{let o=s[0],f=s[s.length-1];for(let p=0;p<s.length-1;p++)if(a>=s[p].t&&a<=s[p+1].t){o=s[p],f=s[p+1];break}const d=f.t===o.t?0:(a-o.t)/(f.t-o.t);return{r:o.r+(f.r-o.r)*d,g:o.g+(f.g-o.g)*d,b:o.b+(f.b-o.b)*d}},n=this.terrainGeo.attributes.position,h=this.terrainGeo.attributes.color;if(!h)return;const l=n.count,c=this.showHeightColor!==!1;for(let a=0;a<l;a++)if(!c)h.setXYZ(a,.02,.02,.02);else{const o=n.getX(a),f=n.getY(a),p=(this.getTerrainHeight(o,-f)-t)/e,u=r(Math.max(0,Math.min(1,p)));h.setXYZ(a,u.r,u.g,u.b)}h.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==441){this.generateProceduralTerrain();return}this.elevationGrid=t;const i=C*21+C,e=t[i]||0,r=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(441);for(let l=0;l<441;l++)this.scaledHeights[l]=((t[l]||0)-e)*r;const n=this.terrainGeo.attributes.position,h=n.count;for(let l=0;l<h;l++){const c=n.getX(l),a=n.getY(l),o=this.getTerrainHeight(c,-a);n.setZ(l,o)}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,i)=>{const e=this.stationMeshes[i];if(e&&e.mesh){const s=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=s}})}showTooltip(t,i,e){if(!this.tooltip)return;let s="Discovered Station";t.type==="primary"?s="Primary Station":t.type==="neighbor"&&(s="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${s}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const r=this.container.getBoundingClientRect();let n=i+15,h=e+15;n+150>r.width&&(n=i-165),h+60>r.height&&(h=e-75),this.tooltip.style.left=`${n}px`,this.tooltip.style.top=`${h}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,i){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(s=>s.mesh),!0);if(e.length>0){let s=e[0].object;for(;s&&s.parent&&(!s.userData||!s.userData.station);)s=s.parent;if(s&&s.userData&&s.userData.station){const r=s.userData.station;this.showTooltip(r,t,i),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=Y,i=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let s=0;s<this.strikeHistory.length;s++){const r=this.strikeHistory[s],n=i-r.time;if(n>=0&&n<=t){e.add(r.id);const h=n/t,l=.7*(1-h),c=1-h*.4;let a=this.heatmapMeshes.get(r.id);if(a)a.material.opacity=l,a.mesh.scale.set(c,c,c),a.mesh.position.y=this.getTerrainHeight(r.x,r.z);else{const o=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:l,depthWrite:!1}),f=new THREE.Mesh(this.heatGeo,o),d=this.getTerrainHeight(r.x,r.z);f.position.set(r.x,d,r.z),f.scale.set(c,c,c),this.scene.add(f),a={mesh:f,material:o},this.heatmapMeshes.set(r.id,a)}}}for(const[s,r]of this.heatmapMeshes.entries())e.has(s)||(this.scene.remove(r.mesh),r.material&&r.material.dispose(),this.heatmapMeshes.delete(s))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),i=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,i),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,25,7),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.set(2048,2048),this.dirLight.shadow.camera.near=1,this.dirLight.shadow.camera.far=80,this.dirLight.shadow.camera.left=-30,this.dirLight.shadow.camera.right=30,this.dirLight.shadow.camera.top=30,this.dirLight.shadow.camera.bottom=-30,this.dirLight.shadow.bias=-.0015,this.scene.add(this.dirLight),this.strikeFlashLight=new THREE.PointLight(12577279,0,60,2),this.strikeFlashLight.position.set(0,6,0),this.scene.add(this.strikeFlashLight);const e=new THREE.BufferGeometry,s=500,r=new Float32Array(s*3);for(let _=0;_<s*3;_+=3){const g=100+Math.random()*50,m=Math.random(),R=Math.random(),w=m*2*Math.PI,M=Math.acos(2*R-1);r[_]=g*Math.sin(M)*Math.cos(w),r[_+1]=g*Math.sin(M)*Math.sin(w),r[_+2]=g*Math.cos(M)}e.setAttribute("position",new THREE.BufferAttribute(r,3));const n=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(e,n),this.starField.visible=this.config.show_stars!==!1,this.scene.add(this.starField),this.cloudGroup=new THREE.Group;const h=document.createElement("canvas");h.width=128,h.height=128;const l=h.getContext("2d"),c=l.createRadialGradient(64,64,0,64,64,64);c.addColorStop(0,"rgba(148,163,184,0.35)"),c.addColorStop(1,"rgba(148,163,184,0)"),l.fillStyle=c,l.fillRect(0,0,128,128);const a=new THREE.CanvasTexture(h),o=new THREE.SpriteMaterial({map:a,transparent:!0,opacity:.5,depthWrite:!1});for(let _=0;_<14;_++){const g=new THREE.Sprite(o),m=10+Math.random()*14;g.scale.set(m,m*.5,1),g.position.set((Math.random()-.5)*90,18+Math.random()*10,(Math.random()-.5)*90),this.cloudGroup.add(g)}this.cloudGroup.visible=this.config.show_clouds!==!1,this.scene.add(this.cloudGroup);const f=40;this.terrainGeo=new THREE.PlaneGeometry(f,f,60,60);const d=this.terrainGeo.attributes.position.count,p=new Float32Array(d*3);p.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(p,3));const u=new THREE.MeshLambertMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(this.terrainGeo,u),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.005,this.terrainMapMesh.receiveShadow=!0,this.scene.add(this.terrainMapMesh);const y=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,y),this.terrainMesh.rotation.x=-Math.PI/2,this.terrainMesh.receiveShadow=!0,this.scene.add(this.terrainMesh);const b=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,b),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const i=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);i.position.set(t.x,e,t.z),i.userData={station:t};const s=.15,r=.5,n=Math.sqrt(r*r+s*s),h=new THREE.CylinderGeometry(.04,.05,n,6),l=new THREE.MeshStandardMaterial({color:3359061,roughness:.6,metalness:.5});for(let E=0;E<3;E++){const v=E/3*Math.PI*2,S=Math.cos(v)*r,H=Math.sin(v)*r,x=new THREE.Mesh(h,l);x.position.set(S/2,s/2,H/2);const k=new THREE.Vector3(-S,s,-H).normalize();x.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),k),x.castShadow=!0,x.receiveShadow=!0,i.add(x)}const c=new THREE.CylinderGeometry(.12,.14,.1,12),a=new THREE.Mesh(c,l);a.position.y=s,a.castShadow=!0,a.receiveShadow=!0,i.add(a);const o=new THREE.RingGeometry(.8,1,32),f=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(o,f);d.rotation.x=-Math.PI/2,d.position.y=.03,i.add(d),i.userData.pulseRing=d;const p=new THREE.CylinderGeometry(.08,.15,2.5,8),u=new THREE.MeshStandardMaterial({color:t.color,roughness:.5,metalness:.4,transparent:!0,opacity:.6}),y=new THREE.Mesh(p,u);y.position.y=1.35,y.castShadow=!0,i.add(y),i.userData.towerCyl=y;const b=new THREE.BoxGeometry(.9,.06,.06),_=new THREE.MeshStandardMaterial({color:9741240,metalness:.5,roughness:.4}),g=new THREE.Mesh(b,_);g.position.y=2.3,g.castShadow=!0,i.add(g);const m=new THREE.SphereGeometry(.25,16,16),R=new THREE.MeshBasicMaterial({color:t.color}),w=new THREE.Mesh(m,R);w.position.y=2.7,i.add(w),i.userData.topSphere=w;const M=this.createRingLabelSprite(t.id);M.scale.set(3.2,1.6,1),M.position.y=3.6,i.add(M),this.scene.add(i),this.stationMeshes.push({mesh:i,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const s=new THREE.BufferGeometry,r=new Float32Array(800*3);for(let o=0;o<800*3;o+=3)r[o]=(Math.random()-.5)*40,r[o+1]=18+Math.random()*4,r[o+2]=(Math.random()-.5)*40;s.setAttribute("position",new THREE.BufferAttribute(r,3));const n=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(s,n),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const h=300,l=new THREE.BufferGeometry,c=new Float32Array(h*3);for(let o=0;o<h*3;o+=3)c[o]=(Math.random()-.5)*40,c[o+1]=Math.random()*8,c[o+2]=(Math.random()-.5)*40;l.setAttribute("position",new THREE.BufferAttribute(c,3));const a=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(l,a),this.scene.add(this.windParticles),this.windParticles.visible=!1}_bearingToCompass(t){const i=["N","NE","E","SE","S","SW","W","NW"],e=Math.round((t%360+360)%360/45)%8;return i[e]}_getNearestStrikeInfo(){if(!this.strikeHistory||this.strikeHistory.length===0)return null;let t=null,i=1/0;for(const r of this.strikeHistory){const n=Math.sqrt(r.x*r.x+r.z*r.z);n<i&&(i=n,t=r)}if(!t)return null;const e=Math.atan2(t.x,-t.z)*180/Math.PI,s=Math.max(0,Math.round((Date.now()-t.time)/1e3));return{distanceKm:i,compass:this._bearingToCompass(e),ageSec:s}}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),i=(this.rainRate||0).toFixed(1),e=this.windDirection||0,s=Math.round(this.solarRadiation||0).toString(),r=Date.now(),n=(this.strikeHistory||[]).filter(a=>r-a.time<=36e5).length,h=this._getNearestStrikeInfo(),l=h?`${h.distanceKm.toFixed(1)} km ${h.compass} \xB7 ${h.ageSec}s ago`:"None nearby",c=`${this.hudCollapsed?1:0}|${this.showHeightColor?1:0}|${t}|${i}|${e}|${s}|${n}|${l}`;if(this._lastWeatherOverlaySignature!==c){if(this._lastWeatherOverlaySignature=c,this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
        <div class="hud-row">
          <div class="hud-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </div>
          <div class="hud-data">
            <div class="hud-label">Solar Radiation</div>
            <div class="hud-value">${s} W/m\xB2</div>
          </div>
        </div>
        <div class="hud-row">
          <div class="hud-icon" style="color: ${h?"#facc15":"#38bdf8"};">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div class="hud-data">
            <div class="hud-label">Nearest Strike</div>
            <div class="hud-value">${l}</div>
          </div>
        </div>
        <div class="hud-row">
          <div class="hud-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
              <circle cx="19" cy="5" r="2"/>
            </svg>
          </div>
          <div class="hud-data">
            <div class="hud-label">Strikes (1h)</div>
            <div class="hud-value">${n}</div>
          </div>
        </div>
      </div>
    `}}updateWeatherSystem(t){if(!this.initialized)return;const i=this.config.show_weather!==!1,e=i&&this.rainRate>0,s=i&&this.windSpeed>0,r=(this.windDirection||0)*Math.PI/180,n=Math.sin(r),h=Math.cos(r);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const l=this.rainParticles.geometry.attributes.position,c=l.array,a=l.count,o=-n*(this.windSpeed||0)*.1,f=-h*(this.windSpeed||0)*.1,d=10+Math.min(20,this.rainRate*2);for(let p=0;p<a;p++){const u=p*3;let y=c[u],b=c[u+1],_=c[u+2];b-=d*t,y+=o*t,_+=f*t;const g=this.getTerrainHeight(y,_);(b<g||b<0)&&(b=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),y=(Math.random()-.5)*40,_=(Math.random()-.5)*40),c[u]=y,c[u+1]=b,c[u+2]=_}l.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=s,s)){const l=this.windParticles.geometry.attributes.position,c=l.array,a=l.count,o=-n*(this.windSpeed||0)*.5,f=-h*(this.windSpeed||0)*.5;for(let d=0;d<a;d++){const p=d*3;let u=c[p],y=c[p+1],b=c[p+2];u+=o*t,b+=f*t,y+=Math.sin(u*.5+b*.5)*.02,(u<-20||u>20||b<-20||b>20)&&(Math.abs(o)>Math.abs(f)?(u=o>0?-20:20,b=(Math.random()-.5)*40):(u=(Math.random()-.5)*40,b=f>0?-20:20),y=Math.random()*8),c[p]=u,c[p+1]=y,c[p+2]=b}l.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const i=this._skyCanvas.getContext("2d");if(!i)return;const e=this._skyCanvas.height,s=i.createLinearGradient(0,0,0,e),r=[2,4,10],n=[14,42,90],h=Math.round(r[0]+(n[0]-r[0])*t),l=Math.round(r[1]+(n[1]-r[1])*t),c=Math.round(r[2]+(n[2]-r[2])*t),a=Math.sin(t*Math.PI),o=Math.round(h+60*a),f=Math.round(l+20*a),d=Math.round(c+10*a);s.addColorStop(0,`rgb(${h},${l},${c})`),s.addColorStop(1,`rgb(${Math.min(255,o)},${Math.min(255,f)},${Math.min(255,d)})`),i.fillStyle=s,i.fillRect(0,0,2,e),this._skyTexture.needsUpdate=!0}_tintCanopyMaterials(t){if(!this.canopyMaterials||this.canopyMaterials.length===0)return;const i=new THREE.Color(16754253);this.canopyMaterials.forEach(e=>{const s=e.userData&&e.userData.baseColor;s&&e.color.copy(s).lerp(i,t*.35)})}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const n=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(n,1),this.scene.fog&&this.scene.fog.color.copy(n),this._paintSkyGradient(0),this._tintCanopyMaterials(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const n=this._hass.states["sun.sun"],h=n.attributes.elevation!==void 0?parseFloat(n.attributes.elevation):0;h>0?t=1:h<-6?t=0:t=(h+6)/6}else{const n=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,n/1e3))}if(this.ambientLight){const n=new THREE.Color(3359061),h=new THREE.Color(12573694),l=new THREE.Color(659744),c=new THREE.Color(1980958);this.ambientLight.color.copy(n).lerp(h,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(l).lerp(c,t);const a=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=a+t*(1.5-a)}if(this.dirLight){this.dirLight.intensity=t*1.5;const n=t*Math.PI-Math.PI/2,h=15*Math.sin(n),l=15*Math.cos(n);this.dirLight.position.set(h,l,7);const a=new THREE.Color(16753920),o=new THREE.Color(16707722);this.dirLight.color.copy(a).lerp(o,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const i=new THREE.Color(132106),e=new THREE.Color(529189),s=i.clone().lerp(e,t);if(this.renderer&&this.renderer.setClearColor(s,1),this.scene.fog){this.scene.fog.color.copy(s);const n=.008,h=.003,l=.01,c=Math.sin(t*Math.PI),a=n+(h-n)*t;this.scene.fog.density=a+(l-n)*c*.5}this._paintSkyGradient(t);const r=Math.sin(t*Math.PI);this._tintCanopyMaterials(r)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop());const t=Date.now();if(this.lastFrameTime!==null&&t-this.lastFrameTime<j)return;this.tickPlayback();const i=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(i),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.cloudGroup&&(this.cloudGroup.rotation.y+=15e-5),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const s=Math.sin(e.pulseVal);let r=1+s*.1,n=.5+s*.3;if(e.strikeIntensity&&e.strikeIntensity>0){e.strikeIntensity-=.02;const h=1+e.strikeIntensity*1.5;r*=h,n=Math.min(1,n+e.strikeIntensity*.5),e.mesh.userData.topSphere&&(e.mesh.userData.topSphere.scale.set(h,h,h),e.mesh.userData.topSphere.material.color.setHex(16777215)),e.mesh.userData.towerCyl&&e.mesh.userData.towerCyl.material.color.setHex(16777215)}else{const h=e.mesh.userData.station.color;e.mesh.userData.topSphere&&(e.mesh.userData.topSphere.scale.set(1,1,1),e.mesh.userData.topSphere.material.color.setHex(h)),e.mesh.userData.towerCyl&&(e.mesh.userData.towerCyl.scale.set(1,1,1),e.mesh.userData.towerCyl.material.color.setHex(h))}e.mesh.userData.pulseRing&&(e.mesh.userData.pulseRing.scale.set(r,r,1),e.mesh.userData.pulseRing.material.opacity=n)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const i=[1,5,10,30,60,120,300,600];i.includes(this.playbackSpeed)||(i.push(this.playbackSpeed),i.sort((e,s)=>e-s)),i.forEach(e=>{const s=document.createElement("option");s.value=e.toString(),s.innerText=`${e}x`,e===this.playbackSpeed&&(s.selected=!0),this.speedSelect.appendChild(s)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",e=>this.handleSliderInput(e)),this.speedSelect.addEventListener("change",e=>{this.playbackSpeed=parseFloat(e.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-P,this.strikeHistory[0].time):Date.now()-P,i=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=i,this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString(),this.slider.value=i.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),s=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=s*this.playbackSpeed,this.playbackTime>=i?(this.playbackTime=i,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-P,this.strikeHistory[0].time):Date.now()-P;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const i=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let s="";if(e<60)s=`-${e}s`;else{const r=Math.floor(e/60),n=e%60;s=`-${r}m ${n}s`}this.timeLabel&&(this.timeLabel.innerText=`${i} (${s})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(i=>{i.time<=this.playbackTime?i.animated=!0:i.animated=!1})}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,i,e=10){const s=[],r=new THREE.Vector3().subVectors(i,t);s.push(t.clone());for(let n=1;n<e;n++){const h=n/e,l=new THREE.Vector3().addVectors(t,r.clone().multiplyScalar(h)),c=(1-h)*1;l.add(new THREE.Vector3((Math.random()-.5)*c,(Math.random()-.5)*c,(Math.random()-.5)*c)),s.push(l)}return s.push(i.clone()),s}createLightningBranches(t,i,e=8){const s=this.createLightningPath(t,i,e),r=[s];for(let n=1;n<s.length-2;n++)if(Math.random()<.25){const h=s[n].clone(),c=(1-n/s.length)*6,a=new THREE.Vector3().subVectors(i,t).normalize();a.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const o=new THREE.Vector3().addVectors(h,a.multiplyScalar(c)),f=this.createLightningPath(h,o,4);r.push(f)}return r}_scheduleRaf(t){const i=requestAnimationFrame(e=>{this._activeRafIds.delete(i),t(e)});return this._activeRafIds.add(i),i}triggerStrikeAnimation(t,i,e=[]){if(!this.initialized)return;const s=this.getTerrainHeight(t,i),r=new THREE.Vector3(t,s,i),n=new THREE.Vector3(t+(Math.random()-.5)*4,s+18,i+(Math.random()-.5)*4),h=4+Math.random()*4;if(this.strikeFlashLight&&(this.strikeFlashLight.position.set(t,s+4,i),this.strikeFlashLight.intensity=h),this.stationMeshes&&this.stationMeshes.forEach(g=>{(!e||e.length===0||e.some(R=>String(R)===String(g.mesh.userData.station.id)))&&(g.strikeIntensity=1)}),this.ambientLight){const g=this.ambientLight.intensity;this.ambientLight.intensity=4;let m=0;const R=()=>{!this.initialized||!this.ambientLight||(m++,this.ambientLight.intensity=Math.max(g,4*(1-m/8)),m<8&&this._scheduleRaf(R))};this._scheduleRaf(R)}const l=[];this.createLightningBranches(n,r).forEach((g,m)=>{const R=new THREE.CatmullRomCurve3(g),w=m===0,M=new THREE.TubeGeometry(R,Math.max(10,g.length*3),w?.06:.03,5,!1),E=new THREE.MeshStandardMaterial({color:w?16777215:16769126,emissive:w?16766720:16757504,emissiveIntensity:w?3:1.5,transparent:!0,opacity:w?1:.75,depthWrite:!1}),v=new THREE.Mesh(M,E);this.strikeLayer.add(v),l.push(v)});const a=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),o=new THREE.Sprite(a);o.position.copy(r),o.position.y+=.1,o.scale.set(.1,.1,1),this.strikeLayer.add(o);const f=new THREE.RingGeometry(.1,.2,32),d=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),p=new THREE.Mesh(f,d);p.position.copy(r),p.position.y+=.05,p.rotation.x=-Math.PI/2,this.strikeLayer.add(p);const u=[];this.stations.forEach(g=>{const m=this.getTerrainHeight(g.x,g.z),R=new THREE.Vector3(g.x,m,g.z),w=R.distanceTo(r),M=new THREE.RingGeometry(w-.08,w+.08,64),E=new THREE.MeshBasicMaterial({color:g.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),v=new THREE.Mesh(M,E);v.position.copy(R),v.position.y+=.05,v.rotation.x=-Math.PI/2,this.strikeLayer.add(v),u.push({mesh:v,targetOpacity:.5})});let y=0;const b=U,_=()=>{if(!this.initialized||!this.strikeLayer)return;y++;const g=y/b;if(g<.2?l.forEach(m=>m.material.opacity=Math.random()>.3?1:.2):g<.5?l.forEach(m=>{m.material.opacity=1-(g-.2)/.3}):l.forEach(m=>{m.parent&&(this.strikeLayer.remove(m),m.geometry&&m.geometry.dispose(),m.material&&m.material.dispose())}),g<.6){const m=g*12;o.scale.set(m,m,1),o.material.opacity=1*(1-g/.6)}else o.parent&&(this.strikeLayer.remove(o),o.material.dispose());if(this.strikeFlashLight&&(g<.2?this.strikeFlashLight.intensity=h:g<.5?this.strikeFlashLight.intensity=h*(1-(g-.2)/.3):this.strikeFlashLight.intensity=0),g<.8){const m=1+g*25;p.scale.set(m,m,1),p.material.opacity=.8*(1-g/.8)}else p.parent&&(this.strikeLayer.remove(p),p.geometry&&p.geometry.dispose(),p.material&&p.material.dispose());u.forEach(m=>{g<.3?m.mesh.material.opacity=m.targetOpacity*(g/.3):g<.9?m.mesh.material.opacity=m.targetOpacity*(1-(g-.3)/.6):m.mesh.parent&&(this.strikeLayer.remove(m.mesh),m.mesh.geometry&&m.mesh.geometry.dispose(),m.mesh.material&&m.mesh.material.dispose())}),y<b&&this._scheduleRaf(_)};this._scheduleRaf(_)}_warnOnce(t,...i){this._warnedKeys.has(t)||(this._warnedKeys.add(t),console.warn(...i))}_elevationGridChanged(t){const i=this.elevationGrid;if(!i||t.length!==i.length)return!0;const e=t.length;if(e===0)return!1;const s=[0,Math.floor(e/4),Math.floor(e/2),Math.floor(3*e/4),e-1];for(const r of s)if(t[r]!==i[r])return!0;return!1}set hass(t){if(this._hass=t,!t||!this.initialized)return;const i=t.states,e="weatherflow_lightning_trilateration";let s,r;const n=[],h=[],l=Object.keys(i);for(let d=0;d<l.length;d++){const p=l[d],u=i[p];if(p.startsWith("sensor.")){const y=u.attributes;y.stations!==void 0&&(r||(r=p),!s&&p.endsWith("_stations")&&y.icon==="mdi:lightning-bolt"&&(s=p)),y.station_id!==void 0&&n.push({stationId:y.station_id,count:parseInt(u.state)||0})}else p.startsWith("geo_location.")&&u.attributes.source===e&&h.push(p)}const c=this.config.entity||this.config.entity_id||s||r;let a=t.config?.latitude??0,o=t.config?.longitude??0;if(c){const p=i[c].attributes.stations;if(Array.isArray(p)){const u=p.find(y=>y.type==="primary");if(u&&u.latitude!==void 0&&u.longitude!==void 0){const y=parseFloat(u.latitude),b=parseFloat(u.longitude);!isNaN(y)&&!isNaN(b)?(a=y,o=b):this._warnOnce("nan-primary-coords","WeatherFlow Card: Parsed primary station coordinates are NaN:",u.latitude,u.longitude)}else this._warnOnce("no-primary-station","WeatherFlow Card: No primary station found in stations list.")}else this._warnOnce("stations-not-array","WeatherFlow Card: stations attribute is not an array.")}else this._warnOnce("no-stations-sensor","WeatherFlow Card: No station sensor found \u2014 configure `entity` in the card config.");if((this.lastRefLat!==a||this.lastRefLon!==o)&&(this.lastRefLat=a,this.lastRefLon=o,this.loadMapTexture(a,o),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(a,o),c){const d=i[c].attributes,p=d.elevation_grid;p&&this._elevationGridChanged(p)&&this.updateTerrainGeometry(p),this.windSpeed=d.wind_speed!==void 0?parseFloat(d.wind_speed):0,this.windDirection=d.wind_direction!==void 0?parseFloat(d.wind_direction):0,this.solarRadiation=d.solar_radiation!==void 0?parseFloat(d.solar_radiation):1e3,this.rainRate=d.rain_rate!==void 0?parseFloat(d.rain_rate):0,this.updateDayNightEngine(),this.lastStationStrikes||(this.lastStationStrikes={});for(const{stationId:y,count:b}of n){const _=this.lastStationStrikes[y];_!==void 0&&b>_&&this.stationMeshes&&this.stationMeshes.forEach(g=>{String(g.mesh.userData.station.id)===String(y)&&(g.strikeIntensity=1)}),this.lastStationStrikes[y]=b}const u=d.stations;if(Array.isArray(u)){let y=this.stations.length!==u.length;if(!y)for(let b=0;b<u.length;b++){const _=this.stations.find(R=>R.id===u[b].id),g=parseFloat(u[b].latitude),m=parseFloat(u[b].longitude);if(!_||_.lat!==g||_.lon!==m){y=!0;break}}y&&(this.stations=u.map(b=>{const _=parseFloat(b.latitude),g=parseFloat(b.longitude),{x:m,z:R}=this._latLonToGrid(_,g,a,o);let w=6583435;return b.type==="primary"?w=1096065:b.type==="neighbor"&&(w=3718648),{id:b.id,x:m,z:R,lat:_,lon:g,color:w,type:b.type}}),this.stationMeshes&&this.stationMeshes.forEach(b=>{this.scene.remove(b.mesh),this.disposeHierarchy(b.mesh)}),this.addWeatherStations())}}const f=[];h.forEach(d=>{const p=i[d],u=parseFloat(p.attributes.latitude),y=parseFloat(p.attributes.longitude),b=p.attributes.stations||[];if(!isNaN(u)&&!isNaN(y)){const{x:_,z:g}=this._latLonToGrid(u,y,a,o),m=new Date(p.last_changed).getTime();f.push({id:d,time:m,x:_,z:g,stations:b})}}),f.sort((d,p)=>d.time-p.time),f.forEach(d=>{if(!this.strikeHistory.some(p=>p.id===d.id)){const p=!this.knownStrikes.has(d.id);p&&this.knownStrikes.add(d.id);const u=this.playbackMode==="live"&&p;this.strikeHistory.push({id:d.id,time:d.time,x:d.x,z:d.z,stations:d.stations,animated:u||this.playbackMode!=="live"&&d.time<=this.playbackTime}),u&&this.triggerStrikeAnimation(d.x,d.z,d.stations)}}),this.strikeHistory=this.strikeHistory.filter(d=>f.some(p=>p.id===d.id)),this.strikeHistory.sort((d,p)=>d.time-p.time);for(const d of this.knownStrikes)t.states[d]||this.knownStrikes.delete(d);this.updateWeatherOverlay()}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",K),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const i=this.shadowRoot.getElementById("height");i&&(i.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const s=this.shadowRoot.getElementById("show_grid");s&&(s.checked=this._config.show_grid!==!1);const r=this.shadowRoot.getElementById("show_map");r&&(r.checked=this._config.show_map!==!1);const n=this.shadowRoot.getElementById("show_rings");n&&(n.checked=this._config.show_rings!==!1);const h=this.shadowRoot.getElementById("show_heatmap");h&&(h.checked=this._config.show_heatmap!==!1);const l=this.shadowRoot.getElementById("auto_orbit");l&&(l.checked=this._config.auto_orbit!==!1);const c=this.shadowRoot.getElementById("show_weather");c&&(c.checked=this._config.show_weather!==!1);const a=this.shadowRoot.getElementById("show_daynight");a&&(a.checked=this._config.show_daynight!==!1);const o=this.shadowRoot.getElementById("min_brightness");o&&(o.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const f=this.shadowRoot.getElementById("elevation_scale");f&&(f.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const d=this.shadowRoot.getElementById("show_3d_features");d&&(d.checked=this._config.show_3d_features===!0);const p=this.shadowRoot.getElementById("playback_speed");p&&(p.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120");const u=this.shadowRoot.getElementById("title");u&&(u.value=this._config.title||"");const y=this.shadowRoot.getElementById("show_height_color");y&&(y.checked=this._config.show_height_color!==!1);const b=this.shadowRoot.getElementById("show_stars");b&&(b.checked=this._config.show_stars!==!1);const _=this.shadowRoot.getElementById("show_clouds");_&&(_.checked=this._config.show_clouds!==!1),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
