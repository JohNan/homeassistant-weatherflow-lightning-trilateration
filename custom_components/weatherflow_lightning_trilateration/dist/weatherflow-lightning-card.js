/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
const Q=6371,J=111.1,tt=21,et=20,it=441,G=Math.floor(10),A=40,O=A/2,U=60,z=36e5,Y=9e4,Z=60,j=1e3/Z;class K extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.waterMaterials=[],this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null,this.showHeightColor=!0,this._activeRafIds=new Set,this._warnedKeys=new Set}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const i=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,show_height_color:!0,show_stars:!0,show_clouds:!0,...t},i||(this.showHeightColor=this.config.show_height_color!==!1),this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const e=String(this.config.height);if(e.endsWith("px")){const s=parseInt(e);this.container.style.height=`${s-40}px`}else this.container.style.height=e}this.titleEl&&(this.titleEl.textContent=this.config.title||"",this.titleEl.style.display=this.config.title?"block":"none"),this.initialized&&this.applyConfigChanges(i||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const i=parseFloat(this.config.zoom_level);isNaN(i)||(this.zoomRadius=i,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===441?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.treeInstancedMeshes=[],this.forestFloorMats=[],this.canopyMaterials=[],this.buildingMeshes=[],this.waterMaterials=[],this.vectorDataLoaded=!1)),this.starField&&(this.starField.visible=this.config.show_stars!==!1),this.cloudGroup&&(this.cloudGroup.visible=this.config.show_clouds!==!1)}connectedCallback(){if(window.THREE){this.initVisualizer();return}if(this._threeScriptLoading)return;this._threeScriptLoading=!0;const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>{this._threeScriptLoading=!1,this.initVisualizer()},t.onerror=i=>{this._threeScriptLoading=!1,console.error("WeatherFlow Card: Failed to load three.min.js",i)},document.head.appendChild(t)}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this._activeRafIds&&(this._activeRafIds.forEach(t=>cancelAnimationFrame(t)),this._activeRafIds.clear()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.treeInstancedMeshes=[],this.forestFloorMats=[],this.canopyMaterials=[],this.buildingMeshes=[],this.waterMaterials=[],this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.cloudGroup&&(this.disposeHierarchy(this.cloudGroup),this.scene.remove(this.cloudGroup),this.cloudGroup=null),this._skyDome&&(this.scene.remove(this._skyDome),this._skyDome.geometry&&this._skyDome.geometry.dispose(),this._skyDome.material&&this._skyDome.material.dispose(),this._skyDome=null),this._skyTexture&&(this._skyTexture.dispose(),this._skyTexture=null),this._skyCanvas=null,this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.strikeFlashLight&&(this.scene.remove(this.strikeFlashLight),this.strikeFlashLight=null),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(i=>{i.geometry&&i.geometry.dispose(),i.material&&(Array.isArray(i.material)?i.material:[i.material]).forEach(s=>{s.map&&s.map.dispose(),s.dispose()})})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),i=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+i,this.cameraTarget.z+e),this.camera.lookAt(this.cameraTarget)),this.updateForestLOD(),this.updateBuildingLOD()}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.titleEl=document.createElement("div"),this.titleEl.style.padding="10px 16px 0",this.titleEl.style.fontSize="16px",this.titleEl.style.fontWeight="500",this.titleEl.style.color="var(--primary-text-color, #e2e8f0)",this.titleEl.style.fontFamily="var(--paper-font-body1_-_font-family, sans-serif)",this.titleEl.textContent=this.config.title||"",this.titleEl.style.display=this.config.title?"block":"none",this.wrapper.appendChild(this.titleEl),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=String(this.config.height||"350px");if(t.endsWith("px")){const a=parseInt(t);this.container.style.height=`${a-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const i=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,i,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=THREE.PCFSoftShadowMap,this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const s=a=>a.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(a=>{this.weatherOverlay.addEventListener(a,s)}),this.weatherOverlay.addEventListener("click",a=>{if(a.target.closest(".hud-color-btn")){a.stopPropagation(),this.showHeightColor=!this.showHeightColor,this._paintHypsometricColours(),this.updateWeatherOverlay();return}(a.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(a.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let o=!1,h=!1,d={x:0,y:0};this.container.addEventListener("contextmenu",a=>{a.preventDefault()}),this.container.addEventListener("mousedown",a=>{this.lastInteractionTime=Date.now(),a.button===2||a.button===1||a.shiftKey?(h=!0,o=!1,this.container.style.cursor="move"):(o=!0,h=!1,this.container.style.cursor="grabbing"),d={x:a.clientX,y:a.clientY}}),this.container.addEventListener("mousemove",a=>{if(this.lastInteractionTime=Date.now(),o){const r=a.clientX-d.x,g=a.clientY-d.y;this.cameraTheta-=r*.005,this.cameraPhi+=g*.005,this.updateCameraPosition(),d={x:a.clientX,y:a.clientY}}else if(h){const r=a.clientX-d.x,g=a.clientY-d.y,l=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),p=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),u=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(l,-r*u),this.cameraTarget.addScaledVector(p,g*u),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),d={x:a.clientX,y:a.clientY}}else{const r=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(a.clientX-r.left)/r.width*2-1,this.mouse.y=-((a.clientY-r.top)/r.height)*2+1,this.checkHover(a.clientX-r.left,a.clientY-r.top)}}),this._mouseupHandler=()=>{o=!1,h=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.preventDefault(),this.zoomRadius+=a.deltaY*.02,this.updateCameraPosition()},{passive:!1});let c=0;this.container.addEventListener("touchstart",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.touches.length===1?(o=!0,d={x:a.touches[0].clientX,y:a.touches[0].clientY}):a.touches.length===2&&(o=!1,c=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY))}),this.container.addEventListener("touchmove",a=>{if(this.lastInteractionTime=Date.now(),a.preventDefault(),a.touches.length===1&&o){const r=a.touches[0].clientX-d.x,g=a.touches[0].clientY-d.y;this.cameraTheta-=r*.007,this.cameraPhi+=g*.007,this.updateCameraPosition(),d={x:a.touches[0].clientX,y:a.touches[0].clientY}}else if(a.touches.length===2){const r=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY),g=r-c;this.zoomRadius-=g*.15,this.updateCameraPosition(),c=r}},{passive:!1}),this.container.addEventListener("touchend",()=>{o=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const a=this.container.clientWidth,r=this.container.clientHeight;this.camera.aspect=a/r,this.camera.updateProjectionMatrix(),this.renderer.setSize(a,r)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const i=t.getContext("2d"),e=new THREE.CanvasTexture(t);if(!i)return e;const s=i.createRadialGradient(32,32,0,32,32,32);return s.addColorStop(0,"rgba(0, 242, 254, 1.0)"),s.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),s.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),s.addColorStop(1,"rgba(0, 0, 0, 0)"),i.fillStyle=s,i.fillRect(0,0,64,64),e.needsUpdate=!0,e}createContactShadowTexture(){if(this._contactShadowTexture)return this._contactShadowTexture;const t=document.createElement("canvas");t.width=64,t.height=64;const i=t.getContext("2d"),e=new THREE.CanvasTexture(t);if(!i)return e;const s=i.createRadialGradient(32,32,0,32,32,32);return s.addColorStop(0,"rgba(0, 0, 0, 0.55)"),s.addColorStop(.7,"rgba(0, 0, 0, 0.25)"),s.addColorStop(1,"rgba(0, 0, 0, 0)"),i.fillStyle=s,i.fillRect(0,0,64,64),e.needsUpdate=!0,this._contactShadowTexture=e,e}createContactShadowDecal(t,i=!1){const e=new THREE.CircleGeometry(t,24),s=new THREE.MeshBasicMaterial({map:this.createContactShadowTexture(),transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),n=new THREE.Mesh(e,s);return i||(n.rotation.x=-Math.PI/2),n}createRingLabelSprite(t){const i=document.createElement("canvas");i.width=128,i.height=64;const e=i.getContext("2d");if(!e){const h=new THREE.CanvasTexture(i),d=new THREE.SpriteMaterial({map:h,transparent:!0,depthWrite:!1}),c=new THREE.Sprite(d);return c.scale.set(2,1,1),c}e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const s=new THREE.CanvasTexture(i),n=new THREE.SpriteMaterial({map:s,transparent:!0,depthWrite:!1,depthTest:!0}),o=new THREE.Sprite(n);return o.scale.set(2,1,1),o}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(l=>{const p=[];for(let v=0;v<=128;v++){const R=v/128*Math.PI*2,k=l*Math.cos(R),M=l*Math.sin(R),m=this.getTerrainHeight(k,M)+.15;p.push(new THREE.Vector3(k,m,M))}const w=new THREE.BufferGeometry().setFromPoints(p),y=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),E=new THREE.Line(w,y);this.rangeRingsGroup.add(E)});const i=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),e=[],s=40;for(let l=0;l<=s;l++){const p=-30+l/s*60,u=this.getTerrainHeight(0,p)+.15;e.push(new THREE.Vector3(0,u,p))}const n=new THREE.BufferGeometry().setFromPoints(e),o=new THREE.Line(n,i);this.rangeRingsGroup.add(o);const h=[];for(let l=0;l<=s;l++){const p=-30+l/s*60,u=this.getTerrainHeight(p,0)+.15;h.push(new THREE.Vector3(p,u,0))}const d=new THREE.BufferGeometry().setFromPoints(h),c=new THREE.Line(d,i);this.rangeRingsGroup.add(c);const a=Math.SQRT2/2;this.ringLabels=[],t.forEach(l=>{const p=this.createRingLabelSprite(`${l}km`);p.position.set(l*a,.5,-l*a),this.rangeRingsGroup.add(p),this.ringLabels.push({sprite:p,r:l})});const r=t[t.length-1]+5,g=[{label:"N",x:0,z:-r},{label:"S",x:0,z:r},{label:"E",x:r,z:0},{label:"W",x:-r,z:0}];this.compassLabels=[],g.forEach(l=>{const p=this.createRingLabelSprite(l.label),u=this.getTerrainHeight(l.x,l.z)+.5;p.position.set(l.x,u,l.z),this.rangeRingsGroup.add(p),this.compassLabels.push({sprite:p,x:l.x,z:l.z})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((o,h)=>{const d=t[h];if(d){const c=d.geometry.attributes.position,a=128;for(let r=0;r<=a;r++){const g=r/a*Math.PI*2,l=o*Math.cos(g),p=o*Math.sin(g),u=this.getTerrainHeight(l,p)+.15;c.setY(r,u)}c.needsUpdate=!0}});const e=t[3];if(e){const o=e.geometry.attributes.position,h=40;for(let d=0;d<=h;d++){const c=-30+d/h*60,a=this.getTerrainHeight(0,c)+.15;o.setXYZ(d,0,a,c)}o.needsUpdate=!0}const s=t[4];if(s){const o=s.geometry.attributes.position,h=40;for(let d=0;d<=h;d++){const c=-30+d/h*60,a=this.getTerrainHeight(c,0)+.15;o.setXYZ(d,c,a,0)}o.needsUpdate=!0}const n=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(o=>{const h=o.r*n,d=-o.r*n,c=this.getTerrainHeight(h,d)+.4;o.sprite.position.set(h,c,d)}),this.compassLabels&&this.compassLabels.forEach(o=>{const h=this.getTerrainHeight(o.x,o.z)+.5;o.sprite.position.set(o.x,h,o.z)})}getTerrainHeight(t,i){if(!this.elevationGrid||this.elevationGrid.length!==441)return 0;const e=(t+O)*20/A,s=(i+O)*20/A;if(e<0||e>20||s<0||s>20)return 0;const n=Math.floor(e),o=Math.min(20,n+1),h=Math.floor(s),d=Math.min(20,h+1),c=e-n,a=s-h,r=this.getGridHeight(h,n),g=this.getGridHeight(h,o),l=this.getGridHeight(d,n),p=this.getGridHeight(d,o),u=r*(1-c)+g*c,w=l*(1-c)+p*c;return u*(1-a)+w*a}getGridHeight(t,i){return this.scaledHeights?this.scaledHeights[(20-t)*21+i]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let o=0;o<21;o++){const h=o-G;for(let d=0;d<21;d++){const c=d-G,a=Math.sqrt(h*h+c*c);let r=80+Math.sin(h*.4)*Math.cos(c*.4)*45;if(r+=Math.sin(a*.8)*15,o===G&&d===G)r=100;else{const g=Math.min(1,a/3);r=100*(1-g)+r*g}this.elevationGrid.push(r)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(441);for(let o=0;o<441;o++)this.scaledHeights[o]=((this.elevationGrid[o]||0)-t)*e;const s=this.terrainGeo.attributes.position,n=s.count;for(let o=0;o<n;o++){const h=s.getX(o),d=s.getY(o),c=this.getTerrainHeight(h,-d);s.setZ(o,c)}s.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,i){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const e=12,s=A,n=s/111.1,o=Math.cos(t*Math.PI/180),h=o>0?s/(111.1*o):s/111.1,d=t-n/2,c=t+n/2,a=i-h/2,r=i+h/2,g=(f,b)=>(f+180)/360*Math.pow(2,b),l=(f,b)=>(1-Math.log(Math.tan(f*Math.PI/180)+1/Math.cos(f*Math.PI/180))/Math.PI)/2*Math.pow(2,b),p=(f,b)=>f/Math.pow(2,b)*360-180,u=(f,b)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*f/Math.pow(2,b)))*180/Math.PI,w=Math.floor(g(a,e)),y=Math.floor(g(r,e)),E=Math.floor(l(c,e)),v=Math.floor(l(d,e)),R=2048,k=document.createElement("canvas");k.width=R,k.height=R;const M=k.getContext("2d");if(!M)return;M.fillStyle="#050b14",M.fillRect(0,0,R,R);const m=[];for(let f=w;f<=y;f++)for(let b=E;b<=v;b++){const x=p(f,e),T=p(f+1,e),H=u(b+1,e),_=u(b,e),S=(x-a)/(r-a),L=(T-a)/(r-a),I=(H-d)/(c-d),C=(_-d)/(c-d),D=S*R,B=(1-C)*R,W=(L-S)*R,V=(C-I)*R,$=`https://basemaps.cartocdn.com/dark_all/${e}/${f}/${b}.png`,X=new Promise(F=>{const P=new Image;P.crossOrigin="anonymous",P.onload=()=>{M.drawImage(P,D,B,W,V),F()},P.onerror=()=>F(),P.src=$});m.push(X)}Promise.all(m).then(()=>{const f=new THREE.CanvasTexture(k);this.terrainMapMesh&&this.terrainMapMesh.material?(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.map=f,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0):f.dispose()})}async loadVectorData(t,i){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,i),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}_latLonToGrid(t,i,e,s){const n=Math.cos(e*Math.PI/180),o=6371*(i-s)*(Math.PI/180)*n,h=-6371*(t-e)*(Math.PI/180);return{x:o,z:h}}render3DFeatures(t,i,e){if(this.scene){if(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup)),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup),this.forestFloorMats=[],this.treeInstancedMeshes=[],this.canopyMaterials=[],this.buildingMeshes=[],this.waterMaterials=[],t.water&&Array.isArray(t.water)){const s=this._createWaterMaterial();this.waterMaterials.push(s),t.water.forEach(n=>{if(!n.coordinates||n.coordinates.length<3)return;const o=[];let h=0,d=0;if(n.coordinates.forEach(g=>{const l=g[0],p=g[1],{x:u,z:w}=this._latLonToGrid(l,p,i,e);u<-20||u>20||w<-20||w>20||(o.push(new THREE.Vector2(u,-w)),h+=this.getTerrainHeight(u,w),d++)}),o.length<3)return;h/=d;const c=new THREE.Shape(o),a=new THREE.ShapeGeometry(c),r=new THREE.Mesh(a,s);r.rotation.x=-Math.PI/2,r.position.y=h+.08,this.features3DGroup.add(r)})}if(t.forest&&Array.isArray(t.forest)){const s=[],n=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0});this.forestFloorMats.push(n);const o=[],h=[],d=[];let c=0;const a=3e3,r=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,g=6,l={pine:20,oak:15,birch:18},p={pine:.7,oak:.55,birch:.67},u={pine:l.pine*r*g/p.pine,oak:l.oak*r*g/p.oak,birch:l.birch*r*g/p.birch},w=(M,m,f)=>{const b=.85+Math.random()*.4,x=Math.random()*Math.PI*2,T=Math.random(),H=T<.33?"pine":T<.66?"oak":"birch",_=u[H]*b,S=new THREE.Object3D;S.position.set(M,m,f),S.rotation.y=x,S.scale.set(_,_,_),S.updateMatrix(),H==="pine"?o.push(S.matrix.clone()):H==="oak"?h.push(S.matrix.clone()):d.push(S.matrix.clone())},y=(M,m)=>{const f=M[0],b=M[1];let x=!1;for(let T=0,H=m.length-1;T<m.length;H=T++){const _=m[T][0],S=m[T][1],L=m[H][0],I=m[H][1];S>b!=I>b&&f<(L-_)*(b-S)/(I-S)+_&&(x=!x)}return x};t.forest.forEach(M=>{if(!M.coordinates||M.coordinates.length<3)return;const m=[];let f=0,b=0;const x=M.coordinates.map(T=>{const H=T[0],_=T[1],{x:S,z:L}=this._latLonToGrid(H,_,i,e);return S>=-20&&S<=20&&L>=-20&&L<=20&&(m.push(new THREE.Vector2(S,-L)),f+=this.getTerrainHeight(S,L),b++),[S,L]});if(s.push(x),m.length>=3){f/=b;const T=new THREE.Shape(m),H=new THREE.ShapeGeometry(T),_=new THREE.Mesh(H,n);_.rotation.x=-Math.PI/2,_.position.y=f+.06,this.features3DGroup.add(_)}if(x.length>0&&c<a){let T=0,H=0;x.forEach(I=>{T+=I[0],H+=I[1]});const _=Math.max(-19.5,Math.min(19.5,T/x.length)),S=Math.max(-19.5,Math.min(19.5,H/x.length)),L=this.getTerrainHeight(_,S);w(_,L,S),c++}});const E=.35,v=E*.35,R=M=>{for(const m of s)if(y(M,m))return!0;return!1};for(let M=-19.5;M<=19.5;M+=E)for(let m=-19.5;m<=19.5&&!(c>=a);m+=E){const f=M+(Math.random()*2-1)*v,b=m+(Math.random()*2-1)*v,x=Math.max(-19.5,Math.min(19.5,f)),T=Math.max(-19.5,Math.min(19.5,b));if(R([x,T])){const H=this.getTerrainHeight(x,T);w(x,H,T),c++}}const k=(M,m,f,b,x)=>{if(M.length===0)return;const T=new THREE.InstancedMesh(m,f,M.length);M.forEach((H,_)=>T.setMatrixAt(_,H)),T.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(T),this.treeInstancedMeshes.push(T);for(let H=0;H<b.length;H++){const _=new THREE.InstancedMesh(b[H],x[H],M.length);M.forEach((S,L)=>_.setMatrixAt(L,S)),_.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(_),this.treeInstancedMeshes.push(_)}};if(o.length>0){const M=new THREE.CylinderGeometry(.04,.04,.2,4);M.translate(0,.1,0);const m=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),f=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),b=[new THREE.ConeGeometry(.18*1.3,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14*1.3,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1*1.3,.2,5).translate(0,.6,0)];k(o,M,m,b,[f,f,f]),f.userData.baseColor=f.color.clone(),this.canopyMaterials.push(f)}if(h.length>0){const M=new THREE.CylinderGeometry(.06,.08,.25,5);M.translate(0,.125,0);const m=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),f=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),b=[new THREE.SphereGeometry(.18,6,6).scale(1.3,1,1.3).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).scale(1.3,1,1.3).translate(.05,.35,0)];k(h,M,m,b,[f,f]),f.userData.baseColor=f.color.clone(),this.canopyMaterials.push(f)}if(d.length>0){const M=new THREE.CylinderGeometry(.03,.03,.3,4);M.translate(0,.15,0);const m=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),f=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),b=new THREE.SphereGeometry(.15,6,6);b.scale(1.3,1.8,1.3),b.translate(0,.4,0),k(d,M,m,[b],[f]),f.userData.baseColor=f.color.clone(),this.canopyMaterials.push(f)}}if(t.road&&Array.isArray(t.road)){const s=new THREE.MeshLambertMaterial({color:4674921,transparent:!0,opacity:.85}),n=.12;t.road.forEach(o=>{if(!o.coordinates||o.coordinates.length<2)return;const h=[];if(o.coordinates.forEach(a=>{const r=a[0],g=a[1],{x:l,z:p}=this._latLonToGrid(r,g,i,e);if(l<-20||l>20||p<-20||p>20)return;const u=this.getTerrainHeight(l,p)+.02;h.push(new THREE.Vector3(l,u,p))}),h.length<2)return;const d=this._buildRoadRibbonGeometry(h,n),c=new THREE.Mesh(d,s);c.receiveShadow=!0,this.features3DGroup.add(c)})}if(this.buildingMeshes=[],t.building&&Array.isArray(t.building)){const s=new THREE.MeshPhongMaterial({color:1976635,transparent:!0,opacity:.7,flatShading:!0}),n=new THREE.MeshPhongMaterial({color:8330525,flatShading:!0}),o=new Set(["house","residential","detached","semidetached_house","terrace"]);t.building.forEach(h=>{if(!h.coordinates||h.coordinates.length<3)return;const d=[];let c=0,a=0,r=1/0,g=-1/0,l=1/0,p=-1/0,u=0;if(h.coordinates.forEach(S=>{const L=S[0],I=S[1],{x:C,z:D}=this._latLonToGrid(L,I,i,e);C<-20||C>20||D<-20||D>20||(d.push(new THREE.Vector2(C,-D)),c+=C,a+=D,r=Math.min(r,C),g=Math.max(g,C),l=Math.min(l,D),p=Math.max(p,D),u++)}),d.length<3)return;c/=u,a/=u;const w=this.getTerrainHeight(c,a),y=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,v=(h.height!==void 0?h.height:8)*y,R=new THREE.Shape(d),k={depth:v,bevelEnabled:!1},M=new THREE.ExtrudeGeometry(R,k),m=new THREE.Group,f=new THREE.Mesh(M,s);f.castShadow=!0,f.receiveShadow=!0,m.add(f);const b=Math.max(.001,g-r),x=Math.max(.001,p-l),T=b*x,H=Math.sqrt(b*b+x*x)/2,_=this.createContactShadowDecal(H*1.15,!0);if(_.position.set((r+g)/2,-(l+p)/2,.005),m.add(_),o.has(h.type)){const S=Math.max(v*.35,.004),L=this._buildGableRoofGeometry(b,x,S),I=new THREE.Mesh(L,n);I.position.set((r+g)/2,-(l+p)/2,v),I.castShadow=!0,I.receiveShadow=!0,m.add(I)}m.rotation.x=-Math.PI/2,m.position.y=w,this.features3DGroup.add(m),this.buildingMeshes.push({group:m,footprintArea:T})})}this.updateForestLOD(),this.updateBuildingLOD()}}_createWaterMaterial(){return new THREE.ShaderMaterial({transparent:!0,side:THREE.DoubleSide,uniforms:{uTime:{value:0},uDeepColor:{value:new THREE.Color(277355)},uShallowColor:{value:new THREE.Color(3718648)},uOpacity:{value:.75}},vertexShader:`
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform float uOpacity;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          // Two scrolling sine-wave layers at different scales/speeds/directions
          // approximate a normal-map ripple without needing a texture asset.
          float wave1 = sin(vWorldPosition.x * 2.2 + vWorldPosition.z * 1.3 + uTime * 0.9);
          float wave2 = sin(vWorldPosition.x * 4.1 - vWorldPosition.z * 3.0 + uTime * 1.6);
          vec3 rippleNormal = normalize(vNormal + vec3(wave1 * 0.08, wave2 * 0.08, 0.0));

          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - clamp(dot(rippleNormal, viewDir), 0.0, 1.0), 3.0);

          vec3 color = mix(uDeepColor, uShallowColor, fresnel);
          // Small specular-like glints from the ripple pattern itself.
          float glint = pow(max(wave1 * wave2, 0.0), 4.0) * 0.5;
          color += vec3(glint);

          gl_FragColor = vec4(color, uOpacity + fresnel * 0.2);
        }
      `})}_buildGableRoofGeometry(t,i,e){const s=t/2,n=i/2,o=t>=i;let h;o?h=[[-s,-n,0],[s,-n,0],[s,n,0],[-s,n,0],[-s,0,e],[s,0,e]]:h=[[-s,-n,0],[s,-n,0],[s,n,0],[-s,n,0],[0,-n,e],[0,n,e]];const d=[],c=(r,g,l)=>{d.push(...h[r],...h[g],...h[l])};o?(c(0,1,5),c(0,5,4),c(3,4,5),c(3,5,2),c(0,4,3),c(1,2,5)):(c(0,4,3),c(4,5,3),c(1,2,5),c(1,5,4),c(0,1,4),c(3,5,2));const a=new THREE.BufferGeometry;return a.setAttribute("position",new THREE.Float32BufferAttribute(d,3)),a.computeVertexNormals(),a}updateBuildingLOD(){if(!this.buildingMeshes||this.buildingMeshes.length===0)return;const t=45,i=.02,e=(this.zoomRadius||0)>t;this.buildingMeshes.forEach(({group:s,footprintArea:n})=>{s.visible=!e||n>=i})}updateForestLOD(){if(!this.treeInstancedMeshes&&!this.forestFloorMats)return;const t=45,i=.85,e=.45,s=(this.zoomRadius||0)>t;this.treeInstancedMeshes&&this.treeInstancedMeshes.forEach(n=>{n.visible=!s}),this.forestFloorMats&&this.forestFloorMats.forEach(n=>{n.opacity=s?i:e})}_buildRoadRibbonGeometry(t,i){const e=i/2,s=[],n=[];for(let r=0;r<t.length;r++){const g=t[Math.max(0,r-1)],l=t[Math.min(t.length-1,r+1)];let p=l.x-g.x,u=l.z-g.z;const w=Math.sqrt(p*p+u*u)||1;p/=w,u/=w;const y=-u,E=p,v=t[r];s.push(new THREE.Vector3(v.x+y*e,v.y,v.z+E*e)),n.push(new THREE.Vector3(v.x-y*e,v.y,v.z-E*e))}const o=[],h=[],d=[];for(let r=0;r<t.length;r++)o.push(s[r].x,s[r].y,s[r].z),h.push(0,1,0),d.push(0,r/(t.length-1)),o.push(n[r].x,n[r].y,n[r].z),h.push(0,1,0),d.push(1,r/(t.length-1));const c=[];for(let r=0;r<t.length-1;r++){const g=r*2,l=r*2+1,p=r*2+2,u=r*2+3;c.push(g,l,p),c.push(l,u,p)}const a=new THREE.BufferGeometry;return a.setAttribute("position",new THREE.Float32BufferAttribute(o,3)),a.setAttribute("normal",new THREE.Float32BufferAttribute(h,3)),a.setAttribute("uv",new THREE.Float32BufferAttribute(d,2)),a.setIndex(c),a}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,i=-1/0;for(let a=0;a<441;a++)this.scaledHeights[a]<t&&(t=this.scaledHeights[a]),this.scaledHeights[a]>i&&(i=this.scaledHeights[a]);const e=i-t||1,s=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],n=a=>{let r=s[0],g=s[s.length-1];for(let p=0;p<s.length-1;p++)if(a>=s[p].t&&a<=s[p+1].t){r=s[p],g=s[p+1];break}const l=g.t===r.t?0:(a-r.t)/(g.t-r.t);return{r:r.r+(g.r-r.r)*l,g:r.g+(g.g-r.g)*l,b:r.b+(g.b-r.b)*l}},o=this.terrainGeo.attributes.position,h=this.terrainGeo.attributes.color;if(!h)return;const d=o.count,c=this.showHeightColor!==!1;for(let a=0;a<d;a++)if(!c)h.setXYZ(a,.02,.02,.02);else{const r=o.getX(a),g=o.getY(a),p=(this.getTerrainHeight(r,-g)-t)/e,u=n(Math.max(0,Math.min(1,p)));h.setXYZ(a,u.r,u.g,u.b)}h.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==441){this.generateProceduralTerrain();return}this.elevationGrid=t;const i=G*21+G,e=t[i]||0,n=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(441);for(let d=0;d<441;d++)this.scaledHeights[d]=((t[d]||0)-e)*n;const o=this.terrainGeo.attributes.position,h=o.count;for(let d=0;d<h;d++){const c=o.getX(d),a=o.getY(d),r=this.getTerrainHeight(c,-a);o.setZ(d,r)}o.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,i)=>{const e=this.stationMeshes[i];if(e&&e.mesh){const s=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=s}})}showTooltip(t,i,e){if(!this.tooltip)return;let s="Discovered Station";t.type==="primary"?s="Primary Station":t.type==="neighbor"&&(s="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${s}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const n=this.container.getBoundingClientRect();let o=i+15,h=e+15;o+150>n.width&&(o=i-165),h+60>n.height&&(h=e-75),this.tooltip.style.left=`${o}px`,this.tooltip.style.top=`${h}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,i){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(s=>s.mesh),!0);if(e.length>0){let s=e[0].object;for(;s&&s.parent&&(!s.userData||!s.userData.station);)s=s.parent;if(s&&s.userData&&s.userData.station){const n=s.userData.station;this.showTooltip(n,t,i),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=Y,i=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let s=0;s<this.strikeHistory.length;s++){const n=this.strikeHistory[s],o=i-n.time;if(o>=0&&o<=t){e.add(n.id);const h=o/t,d=.7*(1-h),c=1-h*.4;let a=this.heatmapMeshes.get(n.id);if(a)a.material.opacity=d,a.mesh.scale.set(c,c,c),a.mesh.position.y=this.getTerrainHeight(n.x,n.z);else{const r=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:d,depthWrite:!1}),g=new THREE.Mesh(this.heatGeo,r),l=this.getTerrainHeight(n.x,n.z);g.position.set(n.x,l,n.z),g.scale.set(c,c,c),this.scene.add(g),a={mesh:g,material:r},this.heatmapMeshes.set(n.id,a)}}}for(const[s,n]of this.heatmapMeshes.entries())e.has(s)||(this.scene.remove(n.mesh),n.material&&n.material.dispose(),this.heatmapMeshes.delete(s))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),i=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,i),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,25,7),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.set(2048,2048),this.dirLight.shadow.camera.near=1,this.dirLight.shadow.camera.far=80,this.dirLight.shadow.camera.left=-30,this.dirLight.shadow.camera.right=30,this.dirLight.shadow.camera.top=30,this.dirLight.shadow.camera.bottom=-30,this.dirLight.shadow.bias=-.0015,this.scene.add(this.dirLight),this.strikeFlashLight=new THREE.PointLight(12577279,0,60,2),this.strikeFlashLight.position.set(0,6,0),this.scene.add(this.strikeFlashLight);const e=new THREE.BufferGeometry,s=500,n=new Float32Array(s*3);for(let E=0;E<s*3;E+=3){const v=100+Math.random()*50,R=Math.random(),k=Math.random(),M=R*2*Math.PI,m=Math.acos(2*k-1);n[E]=v*Math.sin(m)*Math.cos(M),n[E+1]=v*Math.sin(m)*Math.sin(M),n[E+2]=v*Math.cos(m)}e.setAttribute("position",new THREE.BufferAttribute(n,3));const o=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(e,o),this.starField.visible=this.config.show_stars!==!1,this.scene.add(this.starField),this.cloudGroup=new THREE.Group;const h=document.createElement("canvas");h.width=128,h.height=128;const d=h.getContext("2d"),c=d.createRadialGradient(64,64,0,64,64,64);c.addColorStop(0,"rgba(148,163,184,0.35)"),c.addColorStop(1,"rgba(148,163,184,0)"),d.fillStyle=c,d.fillRect(0,0,128,128);const a=new THREE.CanvasTexture(h),r=new THREE.SpriteMaterial({map:a,transparent:!0,opacity:.5,depthWrite:!1});for(let E=0;E<14;E++){const v=new THREE.Sprite(r),R=10+Math.random()*14;v.scale.set(R,R*.5,1),v.position.set((Math.random()-.5)*90,18+Math.random()*10,(Math.random()-.5)*90),this.cloudGroup.add(v)}this.cloudGroup.visible=this.config.show_clouds!==!1,this.scene.add(this.cloudGroup);const g=40;this.terrainGeo=new THREE.PlaneGeometry(g,g,60,60);const l=this.terrainGeo.attributes.position.count,p=new Float32Array(l*3);p.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(p,3));const u=new THREE.MeshLambertMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(this.terrainGeo,u),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.005,this.terrainMapMesh.receiveShadow=!0,this.scene.add(this.terrainMapMesh);const w=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,w),this.terrainMesh.rotation.x=-Math.PI/2,this.terrainMesh.receiveShadow=!0,this.scene.add(this.terrainMesh);const y=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,y),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const i=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);i.position.set(t.x,e,t.z),i.userData={station:t};const s=this.createContactShadowDecal(.65);s.position.y=.015,i.add(s);const n=.15,o=.5,h=Math.sqrt(o*o+n*n),d=new THREE.CylinderGeometry(.04,.05,h,6),c=new THREE.MeshStandardMaterial({color:3359061,roughness:.6,metalness:.5});for(let b=0;b<3;b++){const x=b/3*Math.PI*2,T=Math.cos(x)*o,H=Math.sin(x)*o,_=new THREE.Mesh(d,c);_.position.set(T/2,n/2,H/2);const S=new THREE.Vector3(-T,n,-H).normalize();_.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),S),_.castShadow=!0,_.receiveShadow=!0,i.add(_)}const a=new THREE.CylinderGeometry(.12,.14,.1,12),r=new THREE.Mesh(a,c);r.position.y=n,r.castShadow=!0,r.receiveShadow=!0,i.add(r);const g=new THREE.RingGeometry(.8,1,32),l=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),p=new THREE.Mesh(g,l);p.rotation.x=-Math.PI/2,p.position.y=.03,i.add(p),i.userData.pulseRing=p;const u=new THREE.CylinderGeometry(.08,.15,2.5,8),w=new THREE.MeshStandardMaterial({color:t.color,roughness:.5,metalness:.4,transparent:!0,opacity:.6}),y=new THREE.Mesh(u,w);y.position.y=1.35,y.castShadow=!0,i.add(y),i.userData.towerCyl=y;const E=new THREE.BoxGeometry(.9,.06,.06),v=new THREE.MeshStandardMaterial({color:9741240,metalness:.5,roughness:.4}),R=new THREE.Mesh(E,v);R.position.y=2.3,R.castShadow=!0,i.add(R);const k=new THREE.SphereGeometry(.25,16,16),M=new THREE.MeshBasicMaterial({color:t.color}),m=new THREE.Mesh(k,M);m.position.y=2.7,i.add(m),i.userData.topSphere=m;const f=this.createRingLabelSprite(t.id);f.scale.set(3.2,1.6,1),f.position.y=3.6,i.add(f),this.scene.add(i),this.stationMeshes.push({mesh:i,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const s=new THREE.BufferGeometry,n=new Float32Array(800*3);for(let r=0;r<800*3;r+=3)n[r]=(Math.random()-.5)*40,n[r+1]=18+Math.random()*4,n[r+2]=(Math.random()-.5)*40;s.setAttribute("position",new THREE.BufferAttribute(n,3));const o=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(s,o),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const h=300,d=new THREE.BufferGeometry,c=new Float32Array(h*3);for(let r=0;r<h*3;r+=3)c[r]=(Math.random()-.5)*40,c[r+1]=Math.random()*8,c[r+2]=(Math.random()-.5)*40;d.setAttribute("position",new THREE.BufferAttribute(c,3));const a=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(d,a),this.scene.add(this.windParticles),this.windParticles.visible=!1}_bearingToCompass(t){const i=["N","NE","E","SE","S","SW","W","NW"],e=Math.round((t%360+360)%360/45)%8;return i[e]}_getNearestStrikeInfo(){if(!this.strikeHistory||this.strikeHistory.length===0)return null;let t=null,i=1/0;for(const n of this.strikeHistory){const o=Math.sqrt(n.x*n.x+n.z*n.z);o<i&&(i=o,t=n)}if(!t)return null;const e=Math.atan2(t.x,-t.z)*180/Math.PI,s=Math.max(0,Math.round((Date.now()-t.time)/1e3));return{distanceKm:i,compass:this._bearingToCompass(e),ageSec:s}}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),i=(this.rainRate||0).toFixed(1),e=this.windDirection||0,s=Math.round(this.solarRadiation||0).toString(),n=Date.now(),o=(this.strikeHistory||[]).filter(a=>n-a.time<=36e5).length,h=this._getNearestStrikeInfo(),d=h?`${h.distanceKm.toFixed(1)} km ${h.compass} \xB7 ${h.ageSec}s ago`:"None nearby",c=`${this.hudCollapsed?1:0}|${this.showHeightColor?1:0}|${t}|${i}|${e}|${s}|${o}|${d}`;if(this._lastWeatherOverlaySignature!==c){if(this._lastWeatherOverlaySignature=c,this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
            <div class="hud-value">${d}</div>
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
            <div class="hud-value">${o}</div>
          </div>
        </div>
      </div>
    `}}updateWeatherSystem(t){if(!this.initialized)return;const i=this.config.show_weather!==!1,e=i&&this.rainRate>0,s=i&&this.windSpeed>0,n=(this.windDirection||0)*Math.PI/180,o=Math.sin(n),h=Math.cos(n);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const d=this.rainParticles.geometry.attributes.position,c=d.array,a=d.count,r=-o*(this.windSpeed||0)*.1,g=-h*(this.windSpeed||0)*.1,l=10+Math.min(20,this.rainRate*2);for(let p=0;p<a;p++){const u=p*3;let w=c[u],y=c[u+1],E=c[u+2];y-=l*t,w+=r*t,E+=g*t;const v=this.getTerrainHeight(w,E);(y<v||y<0)&&(y=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),w=(Math.random()-.5)*40,E=(Math.random()-.5)*40),c[u]=w,c[u+1]=y,c[u+2]=E}d.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=s,s)){const d=this.windParticles.geometry.attributes.position,c=d.array,a=d.count,r=-o*(this.windSpeed||0)*.5,g=-h*(this.windSpeed||0)*.5;for(let l=0;l<a;l++){const p=l*3;let u=c[p],w=c[p+1],y=c[p+2];u+=r*t,y+=g*t,w+=Math.sin(u*.5+y*.5)*.02,(u<-20||u>20||y<-20||y>20)&&(Math.abs(r)>Math.abs(g)?(u=r>0?-20:20,y=(Math.random()-.5)*40):(u=(Math.random()-.5)*40,y=g>0?-20:20),w=Math.random()*8),c[p]=u,c[p+1]=w,c[p+2]=y}d.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const i=this._skyCanvas.getContext("2d");if(!i)return;const e=this._skyCanvas.height,s=i.createLinearGradient(0,0,0,e),n=[2,4,10],o=[14,42,90],h=Math.round(n[0]+(o[0]-n[0])*t),d=Math.round(n[1]+(o[1]-n[1])*t),c=Math.round(n[2]+(o[2]-n[2])*t),a=Math.sin(t*Math.PI),r=Math.round(h+60*a),g=Math.round(d+20*a),l=Math.round(c+10*a);s.addColorStop(0,`rgb(${h},${d},${c})`),s.addColorStop(1,`rgb(${Math.min(255,r)},${Math.min(255,g)},${Math.min(255,l)})`),i.fillStyle=s,i.fillRect(0,0,2,e),this._skyTexture.needsUpdate=!0}_tintCanopyMaterials(t){if(!this.canopyMaterials||this.canopyMaterials.length===0)return;const i=new THREE.Color(16754253);this.canopyMaterials.forEach(e=>{const s=e.userData&&e.userData.baseColor;s&&e.color.copy(s).lerp(i,t*.35)})}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const o=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(o,1),this.scene.fog&&this.scene.fog.color.copy(o),this._paintSkyGradient(0),this._tintCanopyMaterials(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const o=this._hass.states["sun.sun"],h=o.attributes.elevation!==void 0?parseFloat(o.attributes.elevation):0;h>0?t=1:h<-6?t=0:t=(h+6)/6}else{const o=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,o/1e3))}if(this.ambientLight){const o=new THREE.Color(3359061),h=new THREE.Color(12573694),d=new THREE.Color(659744),c=new THREE.Color(1980958);this.ambientLight.color.copy(o).lerp(h,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(d).lerp(c,t);const a=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=a+t*(1.5-a)}if(this.dirLight){this.dirLight.intensity=t*1.5;const o=t*Math.PI-Math.PI/2,h=15*Math.sin(o),d=15*Math.cos(o);this.dirLight.position.set(h,d,7);const a=new THREE.Color(16753920),r=new THREE.Color(16707722);this.dirLight.color.copy(a).lerp(r,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const i=new THREE.Color(132106),e=new THREE.Color(529189),s=i.clone().lerp(e,t);if(this.renderer&&this.renderer.setClearColor(s,1),this.scene.fog){this.scene.fog.color.copy(s);const o=.008,h=.003,d=.01,c=Math.sin(t*Math.PI),a=o+(h-o)*t;this.scene.fog.density=a+(d-o)*c*.5}this._paintSkyGradient(t);const n=Math.sin(t*Math.PI);this._tintCanopyMaterials(n)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop());const t=Date.now();if(this.lastFrameTime!==null&&t-this.lastFrameTime<j)return;this.tickPlayback();const i=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(i),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.cloudGroup&&(this.cloudGroup.rotation.y+=15e-5),this.waterMaterials&&this.waterMaterials.length>0&&this.waterMaterials.forEach(e=>{e.uniforms.uTime.value+=i}),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const s=Math.sin(e.pulseVal);let n=1+s*.1,o=.5+s*.3;if(e.strikeIntensity&&e.strikeIntensity>0){e.strikeIntensity-=.02;const h=1+e.strikeIntensity*1.5;n*=h,o=Math.min(1,o+e.strikeIntensity*.5),e.mesh.userData.topSphere&&(e.mesh.userData.topSphere.scale.set(h,h,h),e.mesh.userData.topSphere.material.color.setHex(16777215)),e.mesh.userData.towerCyl&&e.mesh.userData.towerCyl.material.color.setHex(16777215)}else{const h=e.mesh.userData.station.color;e.mesh.userData.topSphere&&(e.mesh.userData.topSphere.scale.set(1,1,1),e.mesh.userData.topSphere.material.color.setHex(h)),e.mesh.userData.towerCyl&&(e.mesh.userData.towerCyl.scale.set(1,1,1),e.mesh.userData.towerCyl.material.color.setHex(h))}e.mesh.userData.pulseRing&&(e.mesh.userData.pulseRing.scale.set(n,n,1),e.mesh.userData.pulseRing.material.opacity=o)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const i=[1,5,10,30,60,120,300,600];i.includes(this.playbackSpeed)||(i.push(this.playbackSpeed),i.sort((e,s)=>e-s)),i.forEach(e=>{const s=document.createElement("option");s.value=e.toString(),s.innerText=`${e}x`,e===this.playbackSpeed&&(s.selected=!0),this.speedSelect.appendChild(s)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",e=>this.handleSliderInput(e)),this.speedSelect.addEventListener("change",e=>{this.playbackSpeed=parseFloat(e.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-z,this.strikeHistory[0].time):Date.now()-z,i=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=i,this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString(),this.slider.value=i.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),s=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=s*this.playbackSpeed,this.playbackTime>=i?(this.playbackTime=i,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=i.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-z,this.strikeHistory[0].time):Date.now()-z;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const i=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let s="";if(e<60)s=`-${e}s`;else{const n=Math.floor(e/60),o=e%60;s=`-${n}m ${o}s`}this.timeLabel&&(this.timeLabel.innerText=`${i} (${s})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(i=>{i.time<=this.playbackTime?i.animated=!0:i.animated=!1})}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,i,e=10){const s=[],n=new THREE.Vector3().subVectors(i,t);s.push(t.clone());for(let o=1;o<e;o++){const h=o/e,d=new THREE.Vector3().addVectors(t,n.clone().multiplyScalar(h)),c=(1-h)*1;d.add(new THREE.Vector3((Math.random()-.5)*c,(Math.random()-.5)*c,(Math.random()-.5)*c)),s.push(d)}return s.push(i.clone()),s}createLightningBranches(t,i,e=8){const s=this.createLightningPath(t,i,e),n=[s];for(let o=1;o<s.length-2;o++)if(Math.random()<.25){const h=s[o].clone(),c=(1-o/s.length)*6,a=new THREE.Vector3().subVectors(i,t).normalize();a.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const r=new THREE.Vector3().addVectors(h,a.multiplyScalar(c)),g=this.createLightningPath(h,r,4);n.push(g)}return n}_scheduleRaf(t){const i=requestAnimationFrame(e=>{this._activeRafIds.delete(i),t(e)});return this._activeRafIds.add(i),i}triggerStrikeAnimation(t,i,e=[]){if(!this.initialized)return;const s=this.getTerrainHeight(t,i),n=new THREE.Vector3(t,s,i),o=new THREE.Vector3(t+(Math.random()-.5)*4,s+18,i+(Math.random()-.5)*4),h=4+Math.random()*4;if(this.strikeFlashLight&&(this.strikeFlashLight.position.set(t,s+4,i),this.strikeFlashLight.intensity=h),this.stationMeshes&&this.stationMeshes.forEach(m=>{(!e||e.length===0||e.some(b=>String(b)===String(m.mesh.userData.station.id)))&&(m.strikeIntensity=1)}),this.ambientLight){const m=this.ambientLight.intensity;this.ambientLight.intensity=4;let f=0;const b=()=>{!this.initialized||!this.ambientLight||(f++,this.ambientLight.intensity=Math.max(m,4*(1-f/8)),f<8&&this._scheduleRaf(b))};this._scheduleRaf(b)}const d=[];this.createLightningBranches(o,n).forEach((m,f)=>{const b=new THREE.CatmullRomCurve3(m),x=f===0,T=new THREE.TubeGeometry(b,Math.max(10,m.length*3),x?.06:.03,5,!1),H=new THREE.MeshStandardMaterial({color:x?16777215:16769126,emissive:x?16766720:16757504,emissiveIntensity:x?3:1.5,transparent:!0,opacity:x?1:.75,depthWrite:!1}),_=new THREE.Mesh(T,H);this.strikeLayer.add(_),d.push(_)});const a=o.y-n.y,r=new THREE.CylinderGeometry(.05,.5,a,12,1,!0),g=new THREE.MeshBasicMaterial({map:this.glowTexture,color:12577279,transparent:!0,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:!1,side:THREE.DoubleSide}),l=new THREE.Mesh(r,g);l.position.set(n.x,n.y+a/2,n.z),this.strikeLayer.add(l);const p=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),u=new THREE.Sprite(p);u.position.copy(n),u.position.y+=.1,u.scale.set(.1,.1,1),this.strikeLayer.add(u);const w=new THREE.RingGeometry(.1,.2,32),y=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),E=new THREE.Mesh(w,y);E.position.copy(n),E.position.y+=.05,E.rotation.x=-Math.PI/2,this.strikeLayer.add(E);const v=[];this.stations.forEach(m=>{const f=this.getTerrainHeight(m.x,m.z),b=new THREE.Vector3(m.x,f,m.z),x=b.distanceTo(n),T=new THREE.RingGeometry(x-.08,x+.08,64),H=new THREE.MeshBasicMaterial({color:m.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),_=new THREE.Mesh(T,H);_.position.copy(b),_.position.y+=.05,_.rotation.x=-Math.PI/2,this.strikeLayer.add(_),v.push({mesh:_,targetOpacity:.5})});let R=0;const k=U,M=()=>{if(!this.initialized||!this.strikeLayer)return;R++;const m=R/k;if(m<.2?d.forEach(f=>f.material.opacity=Math.random()>.3?1:.2):m<.5?d.forEach(f=>{f.material.opacity=1-(m-.2)/.3}):d.forEach(f=>{f.parent&&(this.strikeLayer.remove(f),f.geometry&&f.geometry.dispose(),f.material&&f.material.dispose())}),m<.6){const f=m*12;u.scale.set(f,f,1),u.material.opacity=1*(1-m/.6)}else u.parent&&(this.strikeLayer.remove(u),u.material.dispose());if(m<.25?l.material.opacity=.35*(Math.random()>.2?1:.4):m<.5?l.material.opacity=.35*(1-(m-.25)/.25):l.parent&&(this.strikeLayer.remove(l),l.geometry&&l.geometry.dispose(),l.material&&l.material.dispose()),this.strikeFlashLight&&(m<.2?this.strikeFlashLight.intensity=h:m<.5?this.strikeFlashLight.intensity=h*(1-(m-.2)/.3):this.strikeFlashLight.intensity=0),m<.8){const f=1+m*25;E.scale.set(f,f,1),E.material.opacity=.8*(1-m/.8)}else E.parent&&(this.strikeLayer.remove(E),E.geometry&&E.geometry.dispose(),E.material&&E.material.dispose());v.forEach(f=>{m<.3?f.mesh.material.opacity=f.targetOpacity*(m/.3):m<.9?f.mesh.material.opacity=f.targetOpacity*(1-(m-.3)/.6):f.mesh.parent&&(this.strikeLayer.remove(f.mesh),f.mesh.geometry&&f.mesh.geometry.dispose(),f.mesh.material&&f.mesh.material.dispose())}),R<k&&this._scheduleRaf(M)};this._scheduleRaf(M)}_warnOnce(t,...i){this._warnedKeys.has(t)||(this._warnedKeys.add(t),console.warn(...i))}_elevationGridChanged(t){const i=this.elevationGrid;if(!i||t.length!==i.length)return!0;const e=t.length;if(e===0)return!1;const s=[0,Math.floor(e/4),Math.floor(e/2),Math.floor(3*e/4),e-1];for(const n of s)if(t[n]!==i[n])return!0;return!1}set hass(t){if(this._hass=t,!t||!this.initialized)return;const i=t.states,e="weatherflow_lightning_trilateration";let s,n;const o=[],h=[],d=Object.keys(i);for(let l=0;l<d.length;l++){const p=d[l],u=i[p];if(p.startsWith("sensor.")){const w=u.attributes;w.stations!==void 0&&(n||(n=p),!s&&p.endsWith("_stations")&&w.icon==="mdi:lightning-bolt"&&(s=p)),w.station_id!==void 0&&o.push({stationId:w.station_id,count:parseInt(u.state)||0})}else p.startsWith("geo_location.")&&u.attributes.source===e&&h.push(p)}const c=this.config.entity||this.config.entity_id||s||n;let a=t.config?.latitude??0,r=t.config?.longitude??0;if(c){const p=i[c].attributes.stations;if(Array.isArray(p)){const u=p.find(w=>w.type==="primary");if(u&&u.latitude!==void 0&&u.longitude!==void 0){const w=parseFloat(u.latitude),y=parseFloat(u.longitude);!isNaN(w)&&!isNaN(y)?(a=w,r=y):this._warnOnce("nan-primary-coords","WeatherFlow Card: Parsed primary station coordinates are NaN:",u.latitude,u.longitude)}else this._warnOnce("no-primary-station","WeatherFlow Card: No primary station found in stations list.")}else this._warnOnce("stations-not-array","WeatherFlow Card: stations attribute is not an array.")}else this._warnOnce("no-stations-sensor","WeatherFlow Card: No station sensor found \u2014 configure `entity` in the card config.");if((this.lastRefLat!==a||this.lastRefLon!==r)&&(this.lastRefLat=a,this.lastRefLon=r,this.loadMapTexture(a,r),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(a,r),c){const l=i[c].attributes,p=l.elevation_grid;p&&this._elevationGridChanged(p)&&this.updateTerrainGeometry(p),this.windSpeed=l.wind_speed!==void 0?parseFloat(l.wind_speed):0,this.windDirection=l.wind_direction!==void 0?parseFloat(l.wind_direction):0,this.solarRadiation=l.solar_radiation!==void 0?parseFloat(l.solar_radiation):1e3,this.rainRate=l.rain_rate!==void 0?parseFloat(l.rain_rate):0,this.updateDayNightEngine(),this.lastStationStrikes||(this.lastStationStrikes={});for(const{stationId:w,count:y}of o){const E=this.lastStationStrikes[w];E!==void 0&&y>E&&this.stationMeshes&&this.stationMeshes.forEach(v=>{String(v.mesh.userData.station.id)===String(w)&&(v.strikeIntensity=1)}),this.lastStationStrikes[w]=y}const u=l.stations;if(Array.isArray(u)){let w=this.stations.length!==u.length;if(!w)for(let y=0;y<u.length;y++){const E=this.stations.find(k=>k.id===u[y].id),v=parseFloat(u[y].latitude),R=parseFloat(u[y].longitude);if(!E||E.lat!==v||E.lon!==R){w=!0;break}}w&&(this.stations=u.map(y=>{const E=parseFloat(y.latitude),v=parseFloat(y.longitude),{x:R,z:k}=this._latLonToGrid(E,v,a,r);let M=6583435;return y.type==="primary"?M=1096065:y.type==="neighbor"&&(M=3718648),{id:y.id,x:R,z:k,lat:E,lon:v,color:M,type:y.type}}),this.stationMeshes&&this.stationMeshes.forEach(y=>{this.scene.remove(y.mesh),this.disposeHierarchy(y.mesh)}),this.addWeatherStations())}}const g=[];h.forEach(l=>{const p=i[l],u=parseFloat(p.attributes.latitude),w=parseFloat(p.attributes.longitude),y=p.attributes.stations||[];if(!isNaN(u)&&!isNaN(w)){const{x:E,z:v}=this._latLonToGrid(u,w,a,r),R=new Date(p.last_changed).getTime();g.push({id:l,time:R,x:E,z:v,stations:y})}}),g.sort((l,p)=>l.time-p.time),g.forEach(l=>{if(!this.strikeHistory.some(p=>p.id===l.id)){const p=!this.knownStrikes.has(l.id);p&&this.knownStrikes.add(l.id);const u=this.playbackMode==="live"&&p;this.strikeHistory.push({id:l.id,time:l.time,x:l.x,z:l.z,stations:l.stations,animated:u||this.playbackMode!=="live"&&l.time<=this.playbackTime}),u&&this.triggerStrikeAnimation(l.x,l.z,l.stations)}}),this.strikeHistory=this.strikeHistory.filter(l=>g.some(p=>p.id===l.id)),this.strikeHistory.sort((l,p)=>l.time-p.time);for(const l of this.knownStrikes)t.states[l]||this.knownStrikes.delete(l);this.updateWeatherOverlay()}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",K),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const i=this.shadowRoot.getElementById("height");i&&(i.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const s=this.shadowRoot.getElementById("show_grid");s&&(s.checked=this._config.show_grid!==!1);const n=this.shadowRoot.getElementById("show_map");n&&(n.checked=this._config.show_map!==!1);const o=this.shadowRoot.getElementById("show_rings");o&&(o.checked=this._config.show_rings!==!1);const h=this.shadowRoot.getElementById("show_heatmap");h&&(h.checked=this._config.show_heatmap!==!1);const d=this.shadowRoot.getElementById("auto_orbit");d&&(d.checked=this._config.auto_orbit!==!1);const c=this.shadowRoot.getElementById("show_weather");c&&(c.checked=this._config.show_weather!==!1);const a=this.shadowRoot.getElementById("show_daynight");a&&(a.checked=this._config.show_daynight!==!1);const r=this.shadowRoot.getElementById("min_brightness");r&&(r.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const g=this.shadowRoot.getElementById("elevation_scale");g&&(g.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const l=this.shadowRoot.getElementById("show_3d_features");l&&(l.checked=this._config.show_3d_features===!0);const p=this.shadowRoot.getElementById("playback_speed");p&&(p.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120");const u=this.shadowRoot.getElementById("title");u&&(u.value=this._config.title||"");const w=this.shadowRoot.getElementById("show_height_color");w&&(w.checked=this._config.show_height_color!==!1);const y=this.shadowRoot.getElementById("show_stars");y&&(y.checked=this._config.show_stars!==!1);const E=this.shadowRoot.getElementById("show_clouds");E&&(E.checked=this._config.show_clouds!==!1),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
