/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
const Q=6371,J=111.1,tt=15,et=14,it=225,L=Math.floor(7),C=40,z=C/2,U=60,P=36e5,Y=9e4,Z=60,j=1e3/Z;class K extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null,this.showHeightColor=!0,this._activeRafIds=new Set,this._warnedKeys=new Set}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const e=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,show_height_color:!0,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const i=String(this.config.height);if(i.endsWith("px")){const s=parseInt(i);this.container.style.height=`${s-40}px`}else this.container.style.height=i}this.initialized&&this.applyConfigChanges(e||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const e=parseFloat(this.config.zoom_level);isNaN(e)||(this.zoomRadius=e,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE){this.initVisualizer();return}if(this._threeScriptLoading)return;this._threeScriptLoading=!0;const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>{this._threeScriptLoading=!1,this.initVisualizer()},t.onerror=e=>{this._threeScriptLoading=!1,console.error("WeatherFlow Card: Failed to load three.min.js",e)},document.head.appendChild(t)}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this._activeRafIds&&(this._activeRafIds.forEach(t=>cancelAnimationFrame(t)),this._activeRafIds.clear()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.cloudGroup&&(this.disposeHierarchy(this.cloudGroup),this.scene.remove(this.cloudGroup),this.cloudGroup=null),this._skyDome&&(this.scene.remove(this._skyDome),this._skyDome.geometry&&this._skyDome.geometry.dispose(),this._skyDome.material&&this._skyDome.material.dispose(),this._skyDome=null),this._skyTexture&&(this._skyTexture.dispose(),this._skyTexture=null),this._skyCanvas=null,this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.strikeFlashLight&&(this.scene.remove(this.strikeFlashLight),this.strikeFlashLight=null),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material:[e.material]).forEach(s=>{s.map&&s.map.dispose(),s.dispose()})})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),e=this.zoomRadius*Math.cos(this.cameraPhi),i=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+e,this.cameraTarget.z+i),this.camera.lookAt(this.cameraTarget))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=String(this.config.height||"350px");if(t.endsWith("px")){const a=parseInt(t);this.container.style.height=`${a-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const e=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,e,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=THREE.PCFSoftShadowMap,this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const i=document.createElement("style");i.textContent=`
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
    `,this.container.appendChild(i),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const s=a=>a.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(a=>{this.weatherOverlay.addEventListener(a,s)}),this.weatherOverlay.addEventListener("click",a=>{if(a.target.closest(".hud-color-btn")){a.stopPropagation(),this.showHeightColor=!this.showHeightColor,this._paintHypsometricColours(),this.updateWeatherOverlay();return}(a.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(a.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let n=!1,l=!1,r={x:0,y:0};this.container.addEventListener("contextmenu",a=>{a.preventDefault()}),this.container.addEventListener("mousedown",a=>{this.lastInteractionTime=Date.now(),a.button===2||a.button===1||a.shiftKey?(l=!0,n=!1,this.container.style.cursor="move"):(n=!0,l=!1,this.container.style.cursor="grabbing"),r={x:a.clientX,y:a.clientY}}),this.container.addEventListener("mousemove",a=>{if(this.lastInteractionTime=Date.now(),n){const h=a.clientX-r.x,w=a.clientY-r.y;this.cameraTheta-=h*.005,this.cameraPhi+=w*.005,this.updateCameraPosition(),r={x:a.clientX,y:a.clientY}}else if(l){const h=a.clientX-r.x,w=a.clientY-r.y,c=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),p=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),g=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(c,-h*g),this.cameraTarget.addScaledVector(p,w*g),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),r={x:a.clientX,y:a.clientY}}else{const h=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(a.clientX-h.left)/h.width*2-1,this.mouse.y=-((a.clientY-h.top)/h.height)*2+1,this.checkHover(a.clientX-h.left,a.clientY-h.top)}}),this._mouseupHandler=()=>{n=!1,l=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.preventDefault(),this.zoomRadius+=a.deltaY*.02,this.updateCameraPosition()},{passive:!1});let d=0;this.container.addEventListener("touchstart",a=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),a.touches.length===1?(n=!0,r={x:a.touches[0].clientX,y:a.touches[0].clientY}):a.touches.length===2&&(n=!1,d=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY))}),this.container.addEventListener("touchmove",a=>{if(this.lastInteractionTime=Date.now(),a.preventDefault(),a.touches.length===1&&n){const h=a.touches[0].clientX-r.x,w=a.touches[0].clientY-r.y;this.cameraTheta-=h*.007,this.cameraPhi+=w*.007,this.updateCameraPosition(),r={x:a.touches[0].clientX,y:a.touches[0].clientY}}else if(a.touches.length===2){const h=Math.hypot(a.touches[0].clientX-a.touches[1].clientX,a.touches[0].clientY-a.touches[1].clientY),w=h-d;this.zoomRadius-=w*.15,this.updateCameraPosition(),d=h}},{passive:!1}),this.container.addEventListener("touchend",()=>{n=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const a=this.container.clientWidth,h=this.container.clientHeight;this.camera.aspect=a/h,this.camera.updateProjectionMatrix(),this.renderer.setSize(a,h)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const e=t.getContext("2d"),i=new THREE.CanvasTexture(t);if(!e)return i;const s=e.createRadialGradient(32,32,0,32,32,32);return s.addColorStop(0,"rgba(0, 242, 254, 1.0)"),s.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),s.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),s.addColorStop(1,"rgba(0, 0, 0, 0)"),e.fillStyle=s,e.fillRect(0,0,64,64),i.needsUpdate=!0,i}createRingLabelSprite(t){const e=document.createElement("canvas");e.width=128,e.height=64;const i=e.getContext("2d");if(!i){const l=new THREE.CanvasTexture(e),r=new THREE.SpriteMaterial({map:l,transparent:!0,depthWrite:!1}),d=new THREE.Sprite(r);return d.scale.set(2,1,1),d}i.fillStyle="rgba(0, 0, 0, 0)",i.fillRect(0,0,128,64),i.font="bold 24px sans-serif",i.fillStyle="#00f2fe",i.textAlign="center",i.textBaseline="middle",i.fillText(t,64,32);const s=new THREE.CanvasTexture(e),o=new THREE.SpriteMaterial({map:s,transparent:!0,depthWrite:!1,depthTest:!0}),n=new THREE.Sprite(o);return n.scale.set(2,1,1),n}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(c=>{const p=[];for(let u=0;u<=128;u++){const y=u/128*Math.PI*2,M=c*Math.cos(y),b=c*Math.sin(y),_=this.getTerrainHeight(M,b)+.15;p.push(new THREE.Vector3(M,_,b))}const f=new THREE.BufferGeometry().setFromPoints(p),m=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),E=new THREE.Line(f,m);this.rangeRingsGroup.add(E)});const e=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),i=[],s=40;for(let c=0;c<=s;c++){const p=-30+c/s*60,g=this.getTerrainHeight(0,p)+.15;i.push(new THREE.Vector3(0,g,p))}const o=new THREE.BufferGeometry().setFromPoints(i),n=new THREE.Line(o,e);this.rangeRingsGroup.add(n);const l=[];for(let c=0;c<=s;c++){const p=-30+c/s*60,g=this.getTerrainHeight(p,0)+.15;l.push(new THREE.Vector3(p,g,0))}const r=new THREE.BufferGeometry().setFromPoints(l),d=new THREE.Line(r,e);this.rangeRingsGroup.add(d);const a=Math.SQRT2/2;this.ringLabels=[],t.forEach(c=>{const p=this.createRingLabelSprite(`${c}km`);p.position.set(c*a,.5,-c*a),this.rangeRingsGroup.add(p),this.ringLabels.push({sprite:p,r:c})});const h=t[t.length-1]+5,w=[{label:"N",x:0,z:-h},{label:"S",x:0,z:h},{label:"E",x:h,z:0},{label:"W",x:-h,z:0}];this.compassLabels=[],w.forEach(c=>{const p=this.createRingLabelSprite(c.label),g=this.getTerrainHeight(c.x,c.z)+.5;p.position.set(c.x,g,c.z),this.rangeRingsGroup.add(p),this.compassLabels.push({sprite:p,x:c.x,z:c.z})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((n,l)=>{const r=t[l];if(r){const d=r.geometry.attributes.position,a=128;for(let h=0;h<=a;h++){const w=h/a*Math.PI*2,c=n*Math.cos(w),p=n*Math.sin(w),g=this.getTerrainHeight(c,p)+.15;d.setY(h,g)}d.needsUpdate=!0}});const i=t[3];if(i){const n=i.geometry.attributes.position,l=40;for(let r=0;r<=l;r++){const d=-30+r/l*60,a=this.getTerrainHeight(0,d)+.15;n.setXYZ(r,0,a,d)}n.needsUpdate=!0}const s=t[4];if(s){const n=s.geometry.attributes.position,l=40;for(let r=0;r<=l;r++){const d=-30+r/l*60,a=this.getTerrainHeight(d,0)+.15;n.setXYZ(r,d,a,0)}n.needsUpdate=!0}const o=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(n=>{const l=n.r*o,r=-n.r*o,d=this.getTerrainHeight(l,r)+.4;n.sprite.position.set(l,d,r)}),this.compassLabels&&this.compassLabels.forEach(n=>{const l=this.getTerrainHeight(n.x,n.z)+.5;n.sprite.position.set(n.x,l,n.z)})}getTerrainHeight(t,e){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const i=(t+z)*14/C,s=(e+z)*14/C;if(i<0||i>14||s<0||s>14)return 0;const o=Math.floor(i),n=Math.min(14,o+1),l=Math.floor(s),r=Math.min(14,l+1),d=i-o,a=s-l,h=this.getGridHeight(l,o),w=this.getGridHeight(l,n),c=this.getGridHeight(r,o),p=this.getGridHeight(r,n),g=h*(1-d)+w*d,f=c*(1-d)+p*d;return g*(1-a)+f*a}getGridHeight(t,e){return this.scaledHeights?this.scaledHeights[(14-t)*15+e]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let n=0;n<15;n++){const l=n-L;for(let r=0;r<15;r++){const d=r-L,a=Math.sqrt(l*l+d*d);let h=80+Math.sin(l*.4)*Math.cos(d*.4)*45;if(h+=Math.sin(a*.8)*15,n===L&&r===L)h=100;else{const w=Math.min(1,a/3);h=100*(1-w)+h*w}this.elevationGrid.push(h)}}const t=100,i=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let n=0;n<225;n++)this.scaledHeights[n]=((this.elevationGrid[n]||0)-t)*i;const s=this.terrainGeo.attributes.position,o=s.count;for(let n=0;n<o;n++){const l=s.getX(n),r=s.getY(n),d=this.getTerrainHeight(l,-r);s.setZ(n,d)}s.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,e){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const i=12,s=C,o=s/111.1,n=Math.cos(t*Math.PI/180),l=n>0?s/(111.1*n):s/111.1,r=t-o/2,d=t+o/2,a=e-l/2,h=e+l/2,w=(x,v)=>(x+180)/360*Math.pow(2,v),c=(x,v)=>(1-Math.log(Math.tan(x*Math.PI/180)+1/Math.cos(x*Math.PI/180))/Math.PI)/2*Math.pow(2,v),p=(x,v)=>x/Math.pow(2,v)*360-180,g=(x,v)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*x/Math.pow(2,v)))*180/Math.PI,f=Math.floor(w(a,i)),m=Math.floor(w(h,i)),E=Math.floor(c(d,i)),u=Math.floor(c(r,i)),y=2048,M=document.createElement("canvas");M.width=y,M.height=y;const b=M.getContext("2d");if(!b)return;b.fillStyle="#050b14",b.fillRect(0,0,y,y);const _=[];for(let x=f;x<=m;x++)for(let v=E;v<=u;v++){const R=p(x,i),H=p(x+1,i),T=g(v+1,i),k=g(v,i),S=(R-a)/(h-a),F=(H-a)/(h-a),O=(T-r)/(d-r),G=(k-r)/(d-r),N=S*y,B=(1-G)*y,V=(F-S)*y,W=(G-O)*y,X=`https://basemaps.cartocdn.com/dark_all/${i}/${x}/${v}.png`,$=new Promise(D=>{const I=new Image;I.crossOrigin="anonymous",I.onload=()=>{b.drawImage(I,N,B,V,W),D()},I.onerror=()=>D(),I.src=X});_.push($)}Promise.all(_).then(()=>{const x=new THREE.CanvasTexture(M);this.terrainMapMesh&&this.terrainMapMesh.material?(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.map=x,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0):x.dispose()})}async loadVectorData(t,e){this.vectorDataLoading=!0;try{const i=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(i,t,e),this.vectorDataLoaded=!0}catch(i){console.error("Failed to load 3D vector features:",i)}finally{this.vectorDataLoading=!1}}_latLonToGrid(t,e,i,s){const o=Math.cos(i*Math.PI/180),n=6371*(e-s)*(Math.PI/180)*o,l=-6371*(t-i)*(Math.PI/180);return{x:n,z:l}}render3DFeatures(t,e,i){if(this.scene){if(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup)),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup),t.water&&Array.isArray(t.water)){const s=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(o=>{if(!o.coordinates||o.coordinates.length<3)return;const n=[];let l=0,r=0;if(o.coordinates.forEach(w=>{const c=w[0],p=w[1],{x:g,z:f}=this._latLonToGrid(c,p,e,i);g<-20||g>20||f<-20||f>20||(n.push(new THREE.Vector2(g,-f)),l+=this.getTerrainHeight(g,f),r++)}),n.length<3)return;l/=r;const d=new THREE.Shape(n),a=new THREE.ShapeGeometry(d),h=new THREE.Mesh(a,s);h.rotation.x=-Math.PI/2,h.position.y=l+.08,this.features3DGroup.add(h)})}if(t.forest&&Array.isArray(t.forest)){const s=[],o=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0}),n=[],l=[],r=[];let d=0;const a=1500,h=(f,m)=>{const E=f[0],u=f[1];let y=!1;for(let M=0,b=m.length-1;M<m.length;b=M++){const _=m[M][0],x=m[M][1],v=m[b][0],R=m[b][1];x>u!=R>u&&E<(v-_)*(u-x)/(R-x)+_&&(y=!y)}return y};t.forest.forEach(f=>{if(!f.coordinates||f.coordinates.length<3)return;const m=[];let E=0,u=0;const y=f.coordinates.map(M=>{const b=M[0],_=M[1],{x,z:v}=this._latLonToGrid(b,_,e,i);return x>=-20&&x<=20&&v>=-20&&v<=20&&(m.push(new THREE.Vector2(x,-v)),E+=this.getTerrainHeight(x,v),u++),[x,v]});if(s.push(y),m.length>=3){E/=u;const M=new THREE.Shape(m),b=new THREE.ShapeGeometry(M),_=new THREE.Mesh(b,o);_.rotation.x=-Math.PI/2,_.position.y=E+.06,this.features3DGroup.add(_)}if(y.length>0&&d<a){let M=0,b=0;y.forEach(S=>{M+=S[0],b+=S[1]});const _=Math.max(-19.5,Math.min(19.5,M/y.length)),x=Math.max(-19.5,Math.min(19.5,b/y.length)),v=this.getTerrainHeight(_,x),R=.85+Math.random()*.4,H=Math.random()*Math.PI*2,T=new THREE.Object3D;T.position.set(_,v,x),T.rotation.y=H,T.scale.set(R,R,R),T.updateMatrix();const k=Math.random();k<.33?n.push(T.matrix.clone()):k<.66?l.push(T.matrix.clone()):r.push(T.matrix.clone()),d++}});const w=.45,c=w*.35,p=f=>{for(const m of s)if(h(f,m))return!0;return!1};for(let f=-19.5;f<=19.5;f+=w)for(let m=-19.5;m<=19.5&&!(d>=a);m+=w){const E=f+(Math.random()*2-1)*c,u=m+(Math.random()*2-1)*c,y=Math.max(-19.5,Math.min(19.5,E)),M=Math.max(-19.5,Math.min(19.5,u));if(p([y,M])){const b=this.getTerrainHeight(y,M),_=.85+Math.random()*.4,x=Math.random()*Math.PI*2,v=new THREE.Object3D;v.position.set(y,b,M),v.rotation.y=x,v.scale.set(_,_,_),v.updateMatrix();const R=Math.random();R<.33?n.push(v.matrix.clone()):R<.66?l.push(v.matrix.clone()):r.push(v.matrix.clone()),d++}}const g=(f,m,E,u,y)=>{if(f.length===0)return;const M=new THREE.InstancedMesh(m,E,f.length);f.forEach((b,_)=>M.setMatrixAt(_,b)),M.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(M);for(let b=0;b<u.length;b++){const _=new THREE.InstancedMesh(u[b],y[b],f.length);f.forEach((x,v)=>_.setMatrixAt(v,x)),_.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(_)}};if(n.length>0){const f=new THREE.CylinderGeometry(.04,.04,.2,4);f.translate(0,.1,0);const m=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),u=[new THREE.ConeGeometry(.18,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1,.2,5).translate(0,.6,0)];g(n,f,m,u,[E,E,E])}if(l.length>0){const f=new THREE.CylinderGeometry(.06,.08,.25,5);f.translate(0,.125,0);const m=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),u=[new THREE.SphereGeometry(.18,6,6).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).translate(.05,.35,0)];g(l,f,m,u,[E,E])}if(r.length>0){const f=new THREE.CylinderGeometry(.03,.03,.3,4);f.translate(0,.15,0);const m=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),u=new THREE.SphereGeometry(.15,6,6);u.scale(1,1.8,1),u.translate(0,.4,0),g(r,f,m,[u],[E])}}if(t.road&&Array.isArray(t.road)){const s=new THREE.LineBasicMaterial({color:4674921,transparent:!0,opacity:.6});t.road.forEach(o=>{if(!o.coordinates||o.coordinates.length<2)return;const n=[];if(o.coordinates.forEach(d=>{const a=d[0],h=d[1],{x:w,z:c}=this._latLonToGrid(a,h,e,i);if(w<-20||w>20||c<-20||c>20)return;const p=this.getTerrainHeight(w,c)+.02;n.push(new THREE.Vector3(w,p,c))}),n.length<2)return;const l=new THREE.BufferGeometry().setFromPoints(n),r=new THREE.Line(l,s);this.features3DGroup.add(r)})}if(t.building&&Array.isArray(t.building)){const s=new THREE.MeshPhongMaterial({color:1976635,transparent:!0,opacity:.7,flatShading:!0});t.building.forEach(o=>{if(!o.coordinates||o.coordinates.length<3)return;const n=[];let l=0,r=0,d=0;if(o.coordinates.forEach(E=>{const u=E[0],y=E[1],{x:M,z:b}=this._latLonToGrid(u,y,e,i);M<-20||M>20||b<-20||b>20||(n.push(new THREE.Vector2(M,-b)),l+=M,r+=b,d++)}),n.length<3)return;l/=d,r/=d;const a=this.getTerrainHeight(l,r),h=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3,c=(o.height!==void 0?o.height:8)*h,p=new THREE.Shape(n),g={depth:c,bevelEnabled:!1},f=new THREE.ExtrudeGeometry(p,g),m=new THREE.Mesh(f,s);m.rotation.x=-Math.PI/2,m.position.y=a,m.castShadow=!0,m.receiveShadow=!0,this.features3DGroup.add(m)})}}}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,e=-1/0;for(let a=0;a<225;a++)this.scaledHeights[a]<t&&(t=this.scaledHeights[a]),this.scaledHeights[a]>e&&(e=this.scaledHeights[a]);const i=e-t||1,s=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],o=a=>{let h=s[0],w=s[s.length-1];for(let p=0;p<s.length-1;p++)if(a>=s[p].t&&a<=s[p+1].t){h=s[p],w=s[p+1];break}const c=w.t===h.t?0:(a-h.t)/(w.t-h.t);return{r:h.r+(w.r-h.r)*c,g:h.g+(w.g-h.g)*c,b:h.b+(w.b-h.b)*c}},n=this.terrainGeo.attributes.position,l=this.terrainGeo.attributes.color;if(!l)return;const r=n.count,d=this.showHeightColor!==!1;for(let a=0;a<r;a++)if(!d)l.setXYZ(a,.02,.02,.02);else{const h=n.getX(a),w=n.getY(a),p=(this.getTerrainHeight(h,-w)-t)/i,g=o(Math.max(0,Math.min(1,p)));l.setXYZ(a,g.r,g.g,g.b)}l.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const e=L*15+L,i=t[e]||0,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let r=0;r<225;r++)this.scaledHeights[r]=((t[r]||0)-i)*o;const n=this.terrainGeo.attributes.position,l=n.count;for(let r=0;r<l;r++){const d=n.getX(r),a=n.getY(r),h=this.getTerrainHeight(d,-a);n.setZ(r,h)}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,e)=>{const i=this.stationMeshes[e];if(i&&i.mesh){const s=this.getTerrainHeight(t.x,t.z);i.mesh.position.y=s}})}showTooltip(t,e,i){if(!this.tooltip)return;let s="Discovered Station";t.type==="primary"?s="Primary Station":t.type==="neighbor"&&(s="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${s}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const o=this.container.getBoundingClientRect();let n=e+15,l=i+15;n+150>o.width&&(n=e-165),l+60>o.height&&(l=i-75),this.tooltip.style.left=`${n}px`,this.tooltip.style.top=`${l}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,e){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const i=this.raycaster.intersectObjects(this.stationMeshes.map(s=>s.mesh),!0);if(i.length>0){let s=i[0].object;for(;s&&s.parent&&(!s.userData||!s.userData.station);)s=s.parent;if(s&&s.userData&&s.userData.station){const o=s.userData.station;this.showTooltip(o,t,e),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=Y,e=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const i=new Set;for(let s=0;s<this.strikeHistory.length;s++){const o=this.strikeHistory[s],n=e-o.time;if(n>=0&&n<=t){i.add(o.id);const l=n/t,r=.7*(1-l),d=1-l*.4;let a=this.heatmapMeshes.get(o.id);if(a)a.material.opacity=r,a.mesh.scale.set(d,d,d),a.mesh.position.y=this.getTerrainHeight(o.x,o.z);else{const h=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:r,depthWrite:!1}),w=new THREE.Mesh(this.heatGeo,h),c=this.getTerrainHeight(o.x,o.z);w.position.set(o.x,c,o.z),w.scale.set(d,d,d),this.scene.add(w),a={mesh:w,material:h},this.heatmapMeshes.set(o.id,a)}}}for(const[s,o]of this.heatmapMeshes.entries())i.has(s)||(this.scene.remove(o.mesh),o.material&&o.material.dispose(),this.heatmapMeshes.delete(s))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),e=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,e),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,25,7),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.set(2048,2048),this.dirLight.shadow.camera.near=1,this.dirLight.shadow.camera.far=80,this.dirLight.shadow.camera.left=-30,this.dirLight.shadow.camera.right=30,this.dirLight.shadow.camera.top=30,this.dirLight.shadow.camera.bottom=-30,this.dirLight.shadow.bias=-.0015,this.scene.add(this.dirLight),this.strikeFlashLight=new THREE.PointLight(12577279,0,60,2),this.strikeFlashLight.position.set(0,6,0),this.scene.add(this.strikeFlashLight);const i=new THREE.BufferGeometry,s=500,o=new Float32Array(s*3);for(let E=0;E<s*3;E+=3){const u=100+Math.random()*50,y=Math.random(),M=Math.random(),b=y*2*Math.PI,_=Math.acos(2*M-1);o[E]=u*Math.sin(_)*Math.cos(b),o[E+1]=u*Math.sin(_)*Math.sin(b),o[E+2]=u*Math.cos(_)}i.setAttribute("position",new THREE.BufferAttribute(o,3));const n=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(i,n),this.scene.add(this.starField),this.cloudGroup=new THREE.Group;const l=document.createElement("canvas");l.width=128,l.height=128;const r=l.getContext("2d"),d=r.createRadialGradient(64,64,0,64,64,64);d.addColorStop(0,"rgba(148,163,184,0.35)"),d.addColorStop(1,"rgba(148,163,184,0)"),r.fillStyle=d,r.fillRect(0,0,128,128);const a=new THREE.CanvasTexture(l),h=new THREE.SpriteMaterial({map:a,transparent:!0,opacity:.5,depthWrite:!1});for(let E=0;E<14;E++){const u=new THREE.Sprite(h),y=10+Math.random()*14;u.scale.set(y,y*.5,1),u.position.set((Math.random()-.5)*90,18+Math.random()*10,(Math.random()-.5)*90),this.cloudGroup.add(u)}this.scene.add(this.cloudGroup);const w=40;this.terrainGeo=new THREE.PlaneGeometry(w,w,30,30);const c=this.terrainGeo.attributes.position.count,p=new Float32Array(c*3);p.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(p,3));const g=new THREE.MeshLambertMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(this.terrainGeo,g),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.005,this.terrainMapMesh.receiveShadow=!0,this.scene.add(this.terrainMapMesh);const f=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,f),this.terrainMesh.rotation.x=-Math.PI/2,this.terrainMesh.receiveShadow=!0,this.scene.add(this.terrainMesh);const m=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,m),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const e=new THREE.Group,i=this.getTerrainHeight(t.x,t.z);e.position.set(t.x,i,t.z),e.userData={station:t};const s=.15,o=.5,n=Math.sqrt(o*o+s*s),l=new THREE.CylinderGeometry(.04,.05,n,6),r=new THREE.MeshStandardMaterial({color:3359061,roughness:.6,metalness:.5});for(let x=0;x<3;x++){const v=x/3*Math.PI*2,R=Math.cos(v)*o,H=Math.sin(v)*o,T=new THREE.Mesh(l,r);T.position.set(R/2,s/2,H/2);const k=new THREE.Vector3(-R,s,-H).normalize();T.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),k),T.castShadow=!0,T.receiveShadow=!0,e.add(T)}const d=new THREE.CylinderGeometry(.12,.14,.1,12),a=new THREE.Mesh(d,r);a.position.y=s,a.castShadow=!0,a.receiveShadow=!0,e.add(a);const h=new THREE.RingGeometry(.8,1,32),w=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),c=new THREE.Mesh(h,w);c.rotation.x=-Math.PI/2,c.position.y=.03,e.add(c),e.userData.pulseRing=c;const p=new THREE.CylinderGeometry(.08,.15,2.5,8),g=new THREE.MeshStandardMaterial({color:t.color,roughness:.5,metalness:.4,transparent:!0,opacity:.6}),f=new THREE.Mesh(p,g);f.position.y=1.35,f.castShadow=!0,e.add(f),e.userData.towerCyl=f;const m=new THREE.BoxGeometry(.9,.06,.06),E=new THREE.MeshStandardMaterial({color:9741240,metalness:.5,roughness:.4}),u=new THREE.Mesh(m,E);u.position.y=2.3,u.castShadow=!0,e.add(u);const y=new THREE.SphereGeometry(.25,16,16),M=new THREE.MeshBasicMaterial({color:t.color}),b=new THREE.Mesh(y,M);b.position.y=2.7,e.add(b),e.userData.topSphere=b;const _=this.createRingLabelSprite(t.id);_.scale.set(3.2,1.6,1),_.position.y=3.6,e.add(_),this.scene.add(e),this.stationMeshes.push({mesh:e,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const s=new THREE.BufferGeometry,o=new Float32Array(800*3);for(let h=0;h<800*3;h+=3)o[h]=(Math.random()-.5)*40,o[h+1]=18+Math.random()*4,o[h+2]=(Math.random()-.5)*40;s.setAttribute("position",new THREE.BufferAttribute(o,3));const n=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(s,n),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const l=300,r=new THREE.BufferGeometry,d=new Float32Array(l*3);for(let h=0;h<l*3;h+=3)d[h]=(Math.random()-.5)*40,d[h+1]=Math.random()*8,d[h+2]=(Math.random()-.5)*40;r.setAttribute("position",new THREE.BufferAttribute(d,3));const a=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(r,a),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),e=(this.rainRate||0).toFixed(1),i=this.windDirection||0,s=`${this.hudCollapsed?1:0}|${this.showHeightColor?1:0}|${t}|${e}|${i}`;if(this._lastWeatherOverlaySignature!==s){if(this._lastWeatherOverlaySignature=s,this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
    `}}updateWeatherSystem(t){if(!this.initialized)return;const e=this.config.show_weather!==!1,i=e&&this.rainRate>0,s=e&&this.windSpeed>0,o=(this.windDirection||0)*Math.PI/180,n=Math.sin(o),l=Math.cos(o);if(this.rainParticles&&(this.rainParticles.visible=i,i)){const r=this.rainParticles.geometry.attributes.position,d=r.array,a=r.count,h=-n*(this.windSpeed||0)*.1,w=-l*(this.windSpeed||0)*.1,c=10+Math.min(20,this.rainRate*2);for(let p=0;p<a;p++){const g=p*3;let f=d[g],m=d[g+1],E=d[g+2];m-=c*t,f+=h*t,E+=w*t;const u=this.getTerrainHeight(f,E);(m<u||m<0)&&(m=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),f=(Math.random()-.5)*40,E=(Math.random()-.5)*40),d[g]=f,d[g+1]=m,d[g+2]=E}r.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=s,s)){const r=this.windParticles.geometry.attributes.position,d=r.array,a=r.count,h=-n*(this.windSpeed||0)*.5,w=-l*(this.windSpeed||0)*.5;for(let c=0;c<a;c++){const p=c*3;let g=d[p],f=d[p+1],m=d[p+2];g+=h*t,m+=w*t,f+=Math.sin(g*.5+m*.5)*.02,(g<-20||g>20||m<-20||m>20)&&(Math.abs(h)>Math.abs(w)?(g=h>0?-20:20,m=(Math.random()-.5)*40):(g=(Math.random()-.5)*40,m=w>0?-20:20),f=Math.random()*8),d[p]=g,d[p+1]=f,d[p+2]=m}r.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const e=this._skyCanvas.getContext("2d");if(!e)return;const i=this._skyCanvas.height,s=e.createLinearGradient(0,0,0,i),o=[2,4,10],n=[14,42,90],l=Math.round(o[0]+(n[0]-o[0])*t),r=Math.round(o[1]+(n[1]-o[1])*t),d=Math.round(o[2]+(n[2]-o[2])*t),a=Math.sin(t*Math.PI),h=Math.round(l+60*a),w=Math.round(r+20*a),c=Math.round(d+10*a);s.addColorStop(0,`rgb(${l},${r},${d})`),s.addColorStop(1,`rgb(${Math.min(255,h)},${Math.min(255,w)},${Math.min(255,c)})`),e.fillStyle=s,e.fillRect(0,0,2,i),this._skyTexture.needsUpdate=!0}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const o=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(o,1),this.scene.fog&&this.scene.fog.color.copy(o),this._paintSkyGradient(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const o=this._hass.states["sun.sun"],n=o.attributes.elevation!==void 0?parseFloat(o.attributes.elevation):0;n>0?t=1:n<-6?t=0:t=(n+6)/6}else{const o=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,o/1e3))}if(this.ambientLight){const o=new THREE.Color(3359061),n=new THREE.Color(12573694),l=new THREE.Color(659744),r=new THREE.Color(1980958);this.ambientLight.color.copy(o).lerp(n,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(l).lerp(r,t);const d=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=d+t*(1.5-d)}if(this.dirLight){this.dirLight.intensity=t*1.5;const o=t*Math.PI-Math.PI/2,n=15*Math.sin(o),l=15*Math.cos(o);this.dirLight.position.set(n,l,7);const d=new THREE.Color(16753920),a=new THREE.Color(16707722);this.dirLight.color.copy(d).lerp(a,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const e=new THREE.Color(132106),i=new THREE.Color(529189),s=e.clone().lerp(i,t);if(this.renderer&&this.renderer.setClearColor(s,1),this.scene.fog){this.scene.fog.color.copy(s);const o=.008,n=.003,l=.01,r=Math.sin(t*Math.PI),d=o+(n-o)*t;this.scene.fog.density=d+(l-o)*r*.5}this._paintSkyGradient(t)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop());const t=Date.now();if(this.lastFrameTime!==null&&t-this.lastFrameTime<j)return;this.tickPlayback();const e=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(e),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const i of this.heatmapMeshes.values())this.scene.remove(i.mesh),i.material&&i.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.cloudGroup&&(this.cloudGroup.rotation.y+=15e-5),this.stationMeshes&&this.stationMeshes.forEach(i=>{i.pulseVal+=.04;const s=Math.sin(i.pulseVal);let o=1+s*.1,n=.5+s*.3;if(i.strikeIntensity&&i.strikeIntensity>0){i.strikeIntensity-=.02;const l=1+i.strikeIntensity*1.5;o*=l,n=Math.min(1,n+i.strikeIntensity*.5),i.mesh.userData.topSphere&&(i.mesh.userData.topSphere.scale.set(l,l,l),i.mesh.userData.topSphere.material.color.setHex(16777215)),i.mesh.userData.towerCyl&&i.mesh.userData.towerCyl.material.color.setHex(16777215)}else{const l=i.mesh.userData.station.color;i.mesh.userData.topSphere&&(i.mesh.userData.topSphere.scale.set(1,1,1),i.mesh.userData.topSphere.material.color.setHex(l)),i.mesh.userData.towerCyl&&(i.mesh.userData.towerCyl.scale.set(1,1,1),i.mesh.userData.towerCyl.material.color.setHex(l))}i.mesh.userData.pulseRing&&(i.mesh.userData.pulseRing.scale.set(o,o,1),i.mesh.userData.pulseRing.material.opacity=n)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const e=[1,5,10,30,60,120,300,600];e.includes(this.playbackSpeed)||(e.push(this.playbackSpeed),e.sort((i,s)=>i-s)),e.forEach(i=>{const s=document.createElement("option");s.value=i.toString(),s.innerText=`${i}x`,i===this.playbackSpeed&&(s.selected=!0),this.speedSelect.appendChild(s)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",i=>this.handleSliderInput(i)),this.speedSelect.addEventListener("change",i=>{this.playbackSpeed=parseFloat(i.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-P,this.strikeHistory[0].time):Date.now()-P,e=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=e,this.slider&&(this.slider.min=t.toString(),this.slider.max=e.toString(),this.slider.value=e.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const i=Date.now(),s=i-(this.lastPlayTickTime||i);this.lastPlayTickTime=i,this.playbackTime+=s*this.playbackSpeed,this.playbackTime>=e?(this.playbackTime=e,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=e.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=e.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-P,this.strikeHistory[0].time):Date.now()-P;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(e=>{e.animated=e.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(e=>{e.animated=e.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const e=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),i=Math.round((Date.now()-this.playbackTime)/1e3);let s="";if(i<60)s=`-${i}s`;else{const o=Math.floor(i/60),n=i%60;s=`-${o}m ${n}s`}this.timeLabel&&(this.timeLabel.innerText=`${e} (${s})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(e=>{e.time<=this.playbackTime?e.animated=!0:e.animated=!1})}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,e,i=10){const s=[],o=new THREE.Vector3().subVectors(e,t);s.push(t.clone());for(let n=1;n<i;n++){const l=n/i,r=new THREE.Vector3().addVectors(t,o.clone().multiplyScalar(l)),d=(1-l)*1;r.add(new THREE.Vector3((Math.random()-.5)*d,(Math.random()-.5)*d,(Math.random()-.5)*d)),s.push(r)}return s.push(e.clone()),s}createLightningBranches(t,e,i=8){const s=this.createLightningPath(t,e,i),o=[s];for(let n=1;n<s.length-2;n++)if(Math.random()<.25){const l=s[n].clone(),d=(1-n/s.length)*6,a=new THREE.Vector3().subVectors(e,t).normalize();a.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const h=new THREE.Vector3().addVectors(l,a.multiplyScalar(d)),w=this.createLightningPath(l,h,4);o.push(w)}return o}_scheduleRaf(t){const e=requestAnimationFrame(i=>{this._activeRafIds.delete(e),t(i)});return this._activeRafIds.add(e),e}triggerStrikeAnimation(t,e,i=[]){if(!this.initialized)return;const s=this.getTerrainHeight(t,e),o=new THREE.Vector3(t,s,e),n=new THREE.Vector3(t+(Math.random()-.5)*4,s+18,e+(Math.random()-.5)*4),l=4+Math.random()*4;if(this.strikeFlashLight&&(this.strikeFlashLight.position.set(t,s+4,e),this.strikeFlashLight.intensity=l),this.stationMeshes&&this.stationMeshes.forEach(u=>{(!i||i.length===0||i.some(M=>String(M)===String(u.mesh.userData.station.id)))&&(u.strikeIntensity=1)}),this.ambientLight){const u=this.ambientLight.intensity;this.ambientLight.intensity=4;let y=0;const M=()=>{!this.initialized||!this.ambientLight||(y++,this.ambientLight.intensity=Math.max(u,4*(1-y/8)),y<8&&this._scheduleRaf(M))};this._scheduleRaf(M)}const r=[];this.createLightningBranches(n,o).forEach((u,y)=>{const M=new THREE.CatmullRomCurve3(u),b=y===0,_=new THREE.TubeGeometry(M,Math.max(10,u.length*3),b?.06:.03,5,!1),x=new THREE.MeshStandardMaterial({color:b?16777215:16769126,emissive:b?16766720:16757504,emissiveIntensity:b?3:1.5,transparent:!0,opacity:b?1:.75,depthWrite:!1}),v=new THREE.Mesh(_,x);this.strikeLayer.add(v),r.push(v)});const a=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),h=new THREE.Sprite(a);h.position.copy(o),h.position.y+=.1,h.scale.set(.1,.1,1),this.strikeLayer.add(h);const w=new THREE.RingGeometry(.1,.2,32),c=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),p=new THREE.Mesh(w,c);p.position.copy(o),p.position.y+=.05,p.rotation.x=-Math.PI/2,this.strikeLayer.add(p);const g=[];this.stations.forEach(u=>{const y=this.getTerrainHeight(u.x,u.z),M=new THREE.Vector3(u.x,y,u.z),b=M.distanceTo(o),_=new THREE.RingGeometry(b-.08,b+.08,64),x=new THREE.MeshBasicMaterial({color:u.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),v=new THREE.Mesh(_,x);v.position.copy(M),v.position.y+=.05,v.rotation.x=-Math.PI/2,this.strikeLayer.add(v),g.push({mesh:v,targetOpacity:.5})});let f=0;const m=U,E=()=>{if(!this.initialized||!this.strikeLayer)return;f++;const u=f/m;if(u<.2?r.forEach(y=>y.material.opacity=Math.random()>.3?1:.2):u<.5?r.forEach(y=>{y.material.opacity=1-(u-.2)/.3}):r.forEach(y=>{y.parent&&(this.strikeLayer.remove(y),y.geometry&&y.geometry.dispose(),y.material&&y.material.dispose())}),u<.6){const y=u*12;h.scale.set(y,y,1),h.material.opacity=1*(1-u/.6)}else h.parent&&(this.strikeLayer.remove(h),h.material.dispose());if(this.strikeFlashLight&&(u<.2?this.strikeFlashLight.intensity=l:u<.5?this.strikeFlashLight.intensity=l*(1-(u-.2)/.3):this.strikeFlashLight.intensity=0),u<.8){const y=1+u*25;p.scale.set(y,y,1),p.material.opacity=.8*(1-u/.8)}else p.parent&&(this.strikeLayer.remove(p),p.geometry&&p.geometry.dispose(),p.material&&p.material.dispose());g.forEach(y=>{u<.3?y.mesh.material.opacity=y.targetOpacity*(u/.3):u<.9?y.mesh.material.opacity=y.targetOpacity*(1-(u-.3)/.6):y.mesh.parent&&(this.strikeLayer.remove(y.mesh),y.mesh.geometry&&y.mesh.geometry.dispose(),y.mesh.material&&y.mesh.material.dispose())}),f<m&&this._scheduleRaf(E)};this._scheduleRaf(E)}_warnOnce(t,...e){this._warnedKeys.has(t)||(this._warnedKeys.add(t),console.warn(...e))}_elevationGridChanged(t){const e=this.elevationGrid;if(!e||t.length!==e.length)return!0;const i=t.length;if(i===0)return!1;const s=[0,Math.floor(i/4),Math.floor(i/2),Math.floor(3*i/4),i-1];for(const o of s)if(t[o]!==e[o])return!0;return!1}set hass(t){if(this._hass=t,!t||!this.initialized)return;const e=t.states,i="weatherflow_lightning_trilateration";let s,o;const n=[],l=[],r=Object.keys(e);for(let c=0;c<r.length;c++){const p=r[c],g=e[p];if(p.startsWith("sensor.")){const f=g.attributes;f.stations!==void 0&&(o||(o=p),!s&&p.endsWith("_stations")&&f.icon==="mdi:lightning-bolt"&&(s=p)),f.station_id!==void 0&&n.push({stationId:f.station_id,count:parseInt(g.state)||0})}else p.startsWith("geo_location.")&&g.attributes.source===i&&l.push(p)}const d=this.config.entity||this.config.entity_id||s||o;let a=t.config?.latitude??0,h=t.config?.longitude??0;if(d){const p=e[d].attributes.stations;if(Array.isArray(p)){const g=p.find(f=>f.type==="primary");if(g&&g.latitude!==void 0&&g.longitude!==void 0){const f=parseFloat(g.latitude),m=parseFloat(g.longitude);!isNaN(f)&&!isNaN(m)?(a=f,h=m):this._warnOnce("nan-primary-coords","WeatherFlow Card: Parsed primary station coordinates are NaN:",g.latitude,g.longitude)}else this._warnOnce("no-primary-station","WeatherFlow Card: No primary station found in stations list.")}else this._warnOnce("stations-not-array","WeatherFlow Card: stations attribute is not an array.")}else this._warnOnce("no-stations-sensor","WeatherFlow Card: No station sensor found \u2014 configure `entity` in the card config.");if((this.lastRefLat!==a||this.lastRefLon!==h)&&(this.lastRefLat=a,this.lastRefLon=h,this.loadMapTexture(a,h),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(a,h),d){const c=e[d].attributes,p=c.elevation_grid;p&&this._elevationGridChanged(p)&&this.updateTerrainGeometry(p),this.windSpeed=c.wind_speed!==void 0?parseFloat(c.wind_speed):0,this.windDirection=c.wind_direction!==void 0?parseFloat(c.wind_direction):0,this.solarRadiation=c.solar_radiation!==void 0?parseFloat(c.solar_radiation):1e3,this.rainRate=c.rain_rate!==void 0?parseFloat(c.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay(),this.lastStationStrikes||(this.lastStationStrikes={});for(const{stationId:f,count:m}of n){const E=this.lastStationStrikes[f];E!==void 0&&m>E&&this.stationMeshes&&this.stationMeshes.forEach(u=>{String(u.mesh.userData.station.id)===String(f)&&(u.strikeIntensity=1)}),this.lastStationStrikes[f]=m}const g=c.stations;if(Array.isArray(g)){let f=this.stations.length!==g.length;if(!f)for(let m=0;m<g.length;m++){const E=this.stations.find(M=>M.id===g[m].id),u=parseFloat(g[m].latitude),y=parseFloat(g[m].longitude);if(!E||E.lat!==u||E.lon!==y){f=!0;break}}f&&(this.stations=g.map(m=>{const E=parseFloat(m.latitude),u=parseFloat(m.longitude),{x:y,z:M}=this._latLonToGrid(E,u,a,h);let b=6583435;return m.type==="primary"?b=1096065:m.type==="neighbor"&&(b=3718648),{id:m.id,x:y,z:M,lat:E,lon:u,color:b,type:m.type}}),this.stationMeshes&&this.stationMeshes.forEach(m=>{this.scene.remove(m.mesh),this.disposeHierarchy(m.mesh)}),this.addWeatherStations())}}const w=[];l.forEach(c=>{const p=e[c],g=parseFloat(p.attributes.latitude),f=parseFloat(p.attributes.longitude),m=p.attributes.stations||[];if(!isNaN(g)&&!isNaN(f)){const{x:E,z:u}=this._latLonToGrid(g,f,a,h),y=new Date(p.last_changed).getTime();w.push({id:c,time:y,x:E,z:u,stations:m})}}),w.sort((c,p)=>c.time-p.time),w.forEach(c=>{if(!this.strikeHistory.some(p=>p.id===c.id)){const p=!this.knownStrikes.has(c.id);p&&this.knownStrikes.add(c.id);const g=this.playbackMode==="live"&&p;this.strikeHistory.push({id:c.id,time:c.time,x:c.x,z:c.z,stations:c.stations,animated:g||this.playbackMode!=="live"&&c.time<=this.playbackTime}),g&&this.triggerStrikeAnimation(c.x,c.z,c.stations)}}),this.strikeHistory=this.strikeHistory.filter(c=>w.some(p=>p.id===c.id)),this.strikeHistory.sort((c,p)=>c.time-p.time);for(const c of this.knownStrikes)t.states[c]||this.knownStrikes.delete(c)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",K),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class q extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const e=this.shadowRoot.getElementById("height");e&&(e.value=this._config.height||"350px");const i=this.shadowRoot.getElementById("zoom_level");i&&(i.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const s=this.shadowRoot.getElementById("show_grid");s&&(s.checked=this._config.show_grid!==!1);const o=this.shadowRoot.getElementById("show_map");o&&(o.checked=this._config.show_map!==!1);const n=this.shadowRoot.getElementById("show_rings");n&&(n.checked=this._config.show_rings!==!1);const l=this.shadowRoot.getElementById("show_heatmap");l&&(l.checked=this._config.show_heatmap!==!1);const r=this.shadowRoot.getElementById("auto_orbit");r&&(r.checked=this._config.auto_orbit!==!1);const d=this.shadowRoot.getElementById("show_weather");d&&(d.checked=this._config.show_weather!==!1);const a=this.shadowRoot.getElementById("show_daynight");a&&(a.checked=this._config.show_daynight!==!1);const h=this.shadowRoot.getElementById("min_brightness");h&&(h.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const w=this.shadowRoot.getElementById("elevation_scale");w&&(w.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const c=this.shadowRoot.getElementById("show_3d_features");c&&(c.checked=this._config.show_3d_features===!0);const p=this.shadowRoot.getElementById("playback_speed");p&&(p.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(e=>{e.addEventListener("change",i=>this.toggleChanged(i))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(e=>{e.addEventListener("input",i=>this.textChanged(i))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",e=>{const i=e.detail&&e.detail.value!=null?e.detail.value:null;this._onEntityPicked(i)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const e=t.target;this.dispatchConfigChange(e.id,e.checked)}textChanged(t){if(!this._config)return;const e=t.target;let i=e.value;if(e.id==="zoom_level"||e.id==="min_brightness"||e.id==="elevation_scale"||e.id==="playback_speed"){const s=parseFloat(i);isNaN(s)||(i=s)}this.dispatchConfigChange(e.id,i)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=i=>i.attributes&&Array.isArray(i.attributes.stations)&&i.attributes.icon==="mdi:lightning-bolt";const e=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==e&&(t.value=e)}_onEntityPicked(t){let e;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(e=t.slice(7,-9));const i={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:e||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}dispatchConfigChange(t,e){if(this._config[t]===e)return;const i={...this._config,[t]:e},s=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(s)}}customElements.define("weatherflow-lightning-card-editor",q);export{};
