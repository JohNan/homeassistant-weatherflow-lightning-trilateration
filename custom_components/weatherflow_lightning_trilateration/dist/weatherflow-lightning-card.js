/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class Y extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null,this.showHeightColor=!0}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const s=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,show_height_color:!0,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const i=this.config.height;if(i.endsWith("px")){const n=parseInt(i);this.container.style.height=`${n-40}px`}else this.container.style.height=i}this.initialized&&this.applyConfigChanges(s||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const s=parseFloat(this.config.zoom_level);isNaN(s)||(this.zoomRadius=s,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(i=>i.dispose()):s.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),s=this.zoomRadius*Math.cos(this.cameraPhi),i=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+s,this.cameraTarget.z+i),this.camera.lookAt(this.cameraTarget))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const e=parseInt(t);this.container.style.height=`${e-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const s=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,s,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const i=document.createElement("style");i.textContent=`
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
    `,this.container.appendChild(i),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const n=e=>e.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(e=>{this.weatherOverlay.addEventListener(e,n)}),this.weatherOverlay.addEventListener("click",e=>{if(e.target.closest(".hud-color-btn")){e.stopPropagation(),this.showHeightColor=!this.showHeightColor,this._paintHypsometricColours(),this.updateWeatherOverlay();return}(e.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(e.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let r=!1,h=!1,l={x:0,y:0};this.container.addEventListener("contextmenu",e=>{e.preventDefault()}),this.container.addEventListener("mousedown",e=>{this.lastInteractionTime=Date.now(),e.button===2||e.button===1||e.shiftKey?(h=!0,r=!1,this.container.style.cursor="move"):(r=!0,h=!1,this.container.style.cursor="grabbing"),l={x:e.clientX,y:e.clientY}}),this.container.addEventListener("mousemove",e=>{if(this.lastInteractionTime=Date.now(),r){const a=e.clientX-l.x,d=e.clientY-l.y;this.cameraTheta-=a*.005,this.cameraPhi+=d*.005,this.updateCameraPosition(),l={x:e.clientX,y:e.clientY}}else if(h){const a=e.clientX-l.x,d=e.clientY-l.y,p=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),f=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),u=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(p,-a*u),this.cameraTarget.addScaledVector(f,d*u),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),l={x:e.clientX,y:e.clientY}}else{const a=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-a.left)/a.width*2-1,this.mouse.y=-((e.clientY-a.top)/a.height)*2+1,this.checkHover(e.clientX-a.left,e.clientY-a.top)}}),this._mouseupHandler=()=>{r=!1,h=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",e=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),e.preventDefault(),this.zoomRadius+=e.deltaY*.02,this.updateCameraPosition()},{passive:!1});let c=0;this.container.addEventListener("touchstart",e=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),e.touches.length===1?(r=!0,l={x:e.touches[0].clientX,y:e.touches[0].clientY}):e.touches.length===2&&(r=!1,c=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))}),this.container.addEventListener("touchmove",e=>{if(this.lastInteractionTime=Date.now(),e.preventDefault(),e.touches.length===1&&r){const a=e.touches[0].clientX-l.x,d=e.touches[0].clientY-l.y;this.cameraTheta-=a*.007,this.cameraPhi+=d*.007,this.updateCameraPosition(),l={x:e.touches[0].clientX,y:e.touches[0].clientY}}else if(e.touches.length===2){const a=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),d=a-c;this.zoomRadius-=d*.15,this.updateCameraPosition(),c=a}},{passive:!1}),this.container.addEventListener("touchend",()=>{r=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const e=this.container.clientWidth,a=this.container.clientHeight;this.camera.aspect=e/a,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,a)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),i=s.createRadialGradient(32,32,0,32,32,32);return i.addColorStop(0,"rgba(0, 242, 254, 1.0)"),i.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),i.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),i.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=i,s.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const s=document.createElement("canvas");s.width=128,s.height=64;const i=s.getContext("2d");i.fillStyle="rgba(0, 0, 0, 0)",i.fillRect(0,0,128,64),i.font="bold 24px sans-serif",i.fillStyle="#00f2fe",i.textAlign="center",i.textBaseline="middle",i.fillText(t,64,32);const n=new THREE.CanvasTexture(s),o=new THREE.SpriteMaterial({map:n,transparent:!0,depthWrite:!1,depthTest:!0}),r=new THREE.Sprite(o);return r.scale.set(2,1,1),r}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(a=>{const d=[];for(let y=0;y<=128;y++){const g=y/128*Math.PI*2,m=a*Math.cos(g),E=a*Math.sin(g),_=this.getTerrainHeight(m,E)+.15;d.push(new THREE.Vector3(m,_,E))}const f=new THREE.BufferGeometry().setFromPoints(d),u=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),w=new THREE.Line(f,u);this.rangeRingsGroup.add(w)});const s=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),i=[],n=40;for(let a=0;a<=n;a++){const d=-30+a/n*60,p=this.getTerrainHeight(0,d)+.15;i.push(new THREE.Vector3(0,p,d))}const o=new THREE.BufferGeometry().setFromPoints(i),r=new THREE.Line(o,s);this.rangeRingsGroup.add(r);const h=[];for(let a=0;a<=n;a++){const d=-30+a/n*60,p=this.getTerrainHeight(d,0)+.15;h.push(new THREE.Vector3(d,p,0))}const l=new THREE.BufferGeometry().setFromPoints(h),c=new THREE.Line(l,s);this.rangeRingsGroup.add(c);const e=Math.SQRT2/2;this.ringLabels=[],t.forEach(a=>{const d=this.createRingLabelSprite(`${a}km`);d.position.set(a*e,.5,-a*e),this.rangeRingsGroup.add(d),this.ringLabels.push({sprite:d,r:a})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((r,h)=>{const l=t[h];if(l){const c=l.geometry.attributes.position,e=128;for(let a=0;a<=e;a++){const d=a/e*Math.PI*2,p=r*Math.cos(d),f=r*Math.sin(d),u=this.getTerrainHeight(p,f)+.15;c.setY(a,u)}c.needsUpdate=!0}});const i=t[3];if(i){const r=i.geometry.attributes.position,h=40;for(let l=0;l<=h;l++){const c=-30+l/h*60,e=this.getTerrainHeight(0,c)+.15;r.setXYZ(l,0,e,c)}r.needsUpdate=!0}const n=t[4];if(n){const r=n.geometry.attributes.position,h=40;for(let l=0;l<=h;l++){const c=-30+l/h*60,e=this.getTerrainHeight(c,0)+.15;r.setXYZ(l,c,e,0)}r.needsUpdate=!0}const o=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(r=>{const h=r.r*o,l=-r.r*o,c=this.getTerrainHeight(h,l)+.4;r.sprite.position.set(h,c,l)})}getTerrainHeight(t,s){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const i=(t+20)*14/40,n=(s+20)*14/40;if(i<0||i>14||n<0||n>14)return 0;const o=Math.floor(i),r=Math.min(14,o+1),h=Math.floor(n),l=Math.min(14,h+1),c=i-o,e=n-h,a=this.getGridHeight(h,o),d=this.getGridHeight(h,r),p=this.getGridHeight(l,o),f=this.getGridHeight(l,r),u=a*(1-c)+d*c,w=p*(1-c)+f*c;return u*(1-e)+w*e}getGridHeight(t,s){return this.scaledHeights?this.scaledHeights[(14-t)*15+s]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let o=0;o<15;o++){const r=o-7;for(let h=0;h<15;h++){const l=h-7,c=Math.sqrt(r*r+l*l);let e=80+Math.sin(r*.4)*Math.cos(l*.4)*45;if(e+=Math.sin(c*.8)*15,o===7&&h===7)e=100;else{const a=Math.min(1,c/3);e=100*(1-a)+e*a}this.elevationGrid.push(e)}}const t=100,i=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let o=0;o<225;o++)this.scaledHeights[o]=((this.elevationGrid[o]||0)-t)*i;const n=this.terrainGeo.attributes.position;for(let o=0;o<=14;o++){const r=14-o;for(let h=0;h<=14;h++){const l=h,c=o*15+h,e=this.scaledHeights[r*15+l];n.setZ(c,e)}}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,s){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const i=10,n=40,o=n/111.1,r=Math.cos(t*Math.PI/180),h=r>0?n/(111.1*r):n/111.1,l=t-o/2,c=t+o/2,e=s-h/2,a=s+h/2,d=(v,b)=>(v+180)/360*Math.pow(2,b),p=(v,b)=>(1-Math.log(Math.tan(v*Math.PI/180)+1/Math.cos(v*Math.PI/180))/Math.PI)/2*Math.pow(2,b),f=(v,b)=>v/Math.pow(2,b)*360-180,u=(v,b)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*v/Math.pow(2,b)))*180/Math.PI,w=Math.floor(d(e,i)),y=Math.floor(d(a,i)),g=Math.floor(p(c,i)),m=Math.floor(p(l,i)),E=document.createElement("canvas");E.width=1024,E.height=1024;const _=E.getContext("2d");_.fillStyle="#050b14",_.fillRect(0,0,1024,1024);const G=[];for(let v=w;v<=y;v++)for(let b=g;b<=m;b++){const B=f(v,i),F=f(v+1,i),A=u(b+1,i),W=u(b,i),D=(B-e)/(a-e),R=(F-e)/(a-e),k=(A-l)/(c-l),I=(W-l)/(c-l),C=D*1024,L=(1-I)*1024,x=(R-D)*1024,H=(I-k)*1024,M=`https://basemaps.cartocdn.com/dark_all/${i}/${v}/${b}.png`,S=new Promise(T=>{const P=new Image;P.crossOrigin="anonymous",P.onload=()=>{_.drawImage(P,C,L,x,H),T()},P.onerror=()=>T(),P.src=M});G.push(S)}Promise.all(G).then(()=>{const v=new THREE.CanvasTexture(E);this.terrainMapMesh&&this.terrainMapMesh.material&&(this.terrainMapMesh.material.map=v,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0)})}async loadVectorData(t,s){this.vectorDataLoading=!0;try{const i=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(i,t,s),this.vectorDataLoaded=!0}catch(i){console.error("Failed to load 3D vector features:",i)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,s,i){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(r=>{r.geometry&&r.geometry.dispose(),r.material&&(Array.isArray(r.material)?r.material.forEach(h=>h.dispose()):r.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const n=6371,o=Math.cos(s*Math.PI/180);if(t.water&&Array.isArray(t.water)){const r=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(h=>{if(!h.coordinates||h.coordinates.length<3)return;const l=[];let c=0,e=0;if(h.coordinates.forEach(f=>{const u=f[0],w=f[1],y=n*(w-i)*(Math.PI/180)*o,g=-n*(u-s)*(Math.PI/180);y<-20||y>20||g<-20||g>20||(l.push(new THREE.Vector2(y,-g)),c+=this.getTerrainHeight(y,g),e++)}),l.length<3)return;c/=e;const a=new THREE.Shape(l),d=new THREE.ShapeGeometry(a),p=new THREE.Mesh(d,r);p.rotation.x=-Math.PI/2,p.position.y=c+.08,this.features3DGroup.add(p)})}if(t.forest&&Array.isArray(t.forest)){const r=[],h=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0}),l=[],c=[],e=[];let a=0;const d=1500,p=(R,k)=>{const I=R[0],C=R[1];let L=!1;for(let x=0,H=k.length-1;x<k.length;H=x++){const M=k[x][0],S=k[x][1],T=k[H][0],P=k[H][1];S>C!=P>C&&I<(T-M)*(C-S)/(P-S)+M&&(L=!L)}return L};t.forest.forEach(R=>{if(!R.coordinates||R.coordinates.length<3)return;const k=[];let I=0,C=0;const L=R.coordinates.map(x=>{const H=x[0],M=x[1],S=n*(M-i)*(Math.PI/180)*o,T=-n*(H-s)*(Math.PI/180);return S>=-20&&S<=20&&T>=-20&&T<=20&&(k.push(new THREE.Vector2(S,-T)),I+=this.getTerrainHeight(S,T),C++),[S,T]});if(r.push(L),k.length>=3){I/=C;const x=new THREE.Shape(k),H=new THREE.ShapeGeometry(x),M=new THREE.Mesh(H,h);M.rotation.x=-Math.PI/2,M.position.y=I+.06,this.features3DGroup.add(M)}if(L.length>0&&a<d){let x=0,H=0;L.forEach(V=>{x+=V[0],H+=V[1]});const M=Math.max(-19.5,Math.min(19.5,x/L.length)),S=Math.max(-19.5,Math.min(19.5,H/L.length)),T=this.getTerrainHeight(M,S),P=.85+Math.random()*.4,O=Math.random()*Math.PI*2,z=new THREE.Object3D;z.position.set(M,T,S),z.rotation.y=O,z.scale.set(P,P,P),z.updateMatrix();const N=Math.random();N<.33?l.push(z.matrix.clone()):N<.66?c.push(z.matrix.clone()):e.push(z.matrix.clone()),a++}});const f=.45,u=f*.35,w=R=>{for(const k of r)if(p(R,k))return!0;return!1};for(let R=-19.5;R<=19.5;R+=f)for(let k=-19.5;k<=19.5&&!(a>=d);k+=f){const I=R+(Math.random()*2-1)*u,C=k+(Math.random()*2-1)*u,L=Math.max(-19.5,Math.min(19.5,I)),x=Math.max(-19.5,Math.min(19.5,C));if(w([L,x])){const H=this.getTerrainHeight(L,x),M=.85+Math.random()*.4,S=Math.random()*Math.PI*2,T=new THREE.Object3D;T.position.set(L,H,x),T.rotation.y=S,T.scale.set(M,M,M),T.updateMatrix();const P=Math.random();P<.33?l.push(T.matrix.clone()):P<.66?c.push(T.matrix.clone()):e.push(T.matrix.clone()),a++}}const y=(R,k,I,C,L)=>{if(R.length===0)return;const x=new THREE.InstancedMesh(k,I,R.length);R.forEach((H,M)=>x.setMatrixAt(M,H)),x.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(x);for(let H=0;H<C.length;H++){const M=new THREE.InstancedMesh(C[H],L[H],R.length);R.forEach((S,T)=>M.setMatrixAt(T,S)),M.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(M)}},g=new THREE.CylinderGeometry(.04,.04,.2,4);g.translate(0,.1,0);const m=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),_=[new THREE.ConeGeometry(.18,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1,.2,5).translate(0,.6,0)];y(l,g,m,_,[E,E,E]);const G=new THREE.CylinderGeometry(.06,.08,.25,5);G.translate(0,.125,0);const v=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),b=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),B=[new THREE.SphereGeometry(.18,6,6).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).translate(.05,.35,0)];y(c,G,v,B,[b,b]);const F=new THREE.CylinderGeometry(.03,.03,.3,4);F.translate(0,.15,0);const A=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),W=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),D=new THREE.SphereGeometry(.15,6,6);D.scale(1,1.8,1),D.translate(0,.4,0),y(e,F,A,[D],[W])}}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,s=-1/0;for(let e=0;e<225;e++)this.scaledHeights[e]<t&&(t=this.scaledHeights[e]),this.scaledHeights[e]>s&&(s=this.scaledHeights[e]);const i=s-t||1,n=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],o=e=>{let a=n[0],d=n[n.length-1];for(let f=0;f<n.length-1;f++)if(e>=n[f].t&&e<=n[f+1].t){a=n[f],d=n[f+1];break}const p=d.t===a.t?0:(e-a.t)/(d.t-a.t);return{r:a.r+(d.r-a.r)*p,g:a.g+(d.g-a.g)*p,b:a.b+(d.b-a.b)*p}},r=this.terrainGeo.attributes.position,h=this.terrainGeo.attributes.color;if(!h)return;const l=r.count,c=this.showHeightColor!==!1;for(let e=0;e<l;e++)if(!c)h.setXYZ(e,.02,.02,.02);else{const a=r.getX(e),d=r.getY(e),f=(this.getTerrainHeight(a,-d)-t)/i,u=o(Math.max(0,Math.min(1,f)));h.setXYZ(e,u.r,u.g,u.b)}h.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const s=7*15+7,i=t[s]||0,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let l=0;l<225;l++)this.scaledHeights[l]=((t[l]||0)-i)*o;const r=this.terrainGeo.attributes.position,h=r.count;for(let l=0;l<h;l++){const c=r.getX(l),e=r.getY(l),a=this.getTerrainHeight(c,-e);r.setZ(l,a)}r.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,s)=>{const i=this.stationMeshes[s];if(i&&i.mesh){const n=this.getTerrainHeight(t.x,t.z);i.mesh.position.y=n}})}showTooltip(t,s,i){if(!this.tooltip)return;let n="Discovered Station";t.type==="primary"?n="Primary Station":t.type==="neighbor"&&(n="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${n}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const o=this.container.getBoundingClientRect();let r=s+15,h=i+15;r+150>o.width&&(r=s-165),h+60>o.height&&(h=i-75),this.tooltip.style.left=`${r}px`,this.tooltip.style.top=`${h}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,s){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const i=this.raycaster.intersectObjects(this.stationMeshes.map(n=>n.mesh),!0);if(i.length>0){let n=i[0].object;for(;n&&n.parent&&(!n.userData||!n.userData.station);)n=n.parent;if(n&&n.userData&&n.userData.station){const o=n.userData.station;this.showTooltip(o,t,s),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,s=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const i=new Set;for(let n=0;n<this.strikeHistory.length;n++){const o=this.strikeHistory[n],r=s-o.time;if(r>=0&&r<=t){i.add(o.id);const h=r/t,l=.7*(1-h),c=1-h*.4;let e=this.heatmapMeshes.get(o.id);if(e)e.material.opacity=l,e.mesh.scale.set(c,c,c),e.mesh.position.y=this.getTerrainHeight(o.x,o.z);else{const a=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:l,depthWrite:!1}),d=new THREE.Mesh(this.heatGeo,a),p=this.getTerrainHeight(o.x,o.z);d.position.set(o.x,p,o.z),d.scale.set(c,c,c),this.scene.add(d),e={mesh:d,material:a},this.heatmapMeshes.set(o.id,e)}}}for(const[n,o]of this.heatmapMeshes.entries())i.has(n)||(this.scene.remove(o.mesh),o.material&&o.material.dispose(),this.heatmapMeshes.delete(n))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),s=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,s),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const i=new THREE.BufferGeometry,n=500,o=new Float32Array(n*3);for(let p=0;p<n*3;p+=3){const f=100+Math.random()*50,u=Math.random(),w=Math.random(),y=u*2*Math.PI,g=Math.acos(2*w-1);o[p]=f*Math.sin(g)*Math.cos(y),o[p+1]=f*Math.sin(g)*Math.sin(y),o[p+2]=f*Math.cos(g)}i.setAttribute("position",new THREE.BufferAttribute(o,3));const r=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(i,r),this.scene.add(this.starField);const h=40;this.terrainGeo=new THREE.PlaneGeometry(h,h,30,30);const l=this.terrainGeo.attributes.position.count,c=new Float32Array(l*3);c.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(c,3));const e=new THREE.MeshBasicMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(this.terrainGeo,e),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.005,this.scene.add(this.terrainMapMesh);const a=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,a),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const d=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,d),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const s=new THREE.Group,i=this.getTerrainHeight(t.x,t.z);s.position.set(t.x,i,t.z),s.userData={station:t};const n=new THREE.RingGeometry(.8,1,32),o=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),r=new THREE.Mesh(n,o);r.rotation.x=-Math.PI/2,r.position.y=.02,s.add(r);const h=new THREE.CylinderGeometry(.08,.08,2.5,8),l=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),c=new THREE.Mesh(h,l);c.position.y=1.25,s.add(c);const e=new THREE.SphereGeometry(.25,16,16),a=new THREE.MeshBasicMaterial({color:t.color}),d=new THREE.Mesh(e,a);d.position.y=2.5,s.add(d),this.scene.add(s),this.stationMeshes.push({mesh:s,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const n=new THREE.BufferGeometry,o=new Float32Array(800*3);for(let a=0;a<800*3;a+=3)o[a]=(Math.random()-.5)*40,o[a+1]=18+Math.random()*4,o[a+2]=(Math.random()-.5)*40;n.setAttribute("position",new THREE.BufferAttribute(o,3));const r=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(n,r),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const h=300,l=new THREE.BufferGeometry,c=new Float32Array(h*3);for(let a=0;a<h*3;a+=3)c[a]=(Math.random()-.5)*40,c[a+1]=Math.random()*8,c[a+2]=(Math.random()-.5)*40;l.setAttribute("position",new THREE.BufferAttribute(c,3));const e=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(l,e),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),s=(this.rainRate||0).toFixed(1),i=this.windDirection||0;if(this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
            <div class="hud-value">${s} mm/h</div>
          </div>
        </div>
      </div>
    `}updateWeatherSystem(t){if(!this.initialized)return;const s=this.config.show_weather!==!1,i=s&&this.rainRate>0,n=s&&this.windSpeed>0,o=(this.windDirection||0)*Math.PI/180,r=Math.sin(o),h=Math.cos(o);if(this.rainParticles&&(this.rainParticles.visible=i,i)){const l=this.rainParticles.geometry.attributes.position,c=l.array,e=l.count,a=-r*(this.windSpeed||0)*.1,d=-h*(this.windSpeed||0)*.1,p=10+Math.min(20,this.rainRate*2);for(let f=0;f<e;f++){const u=f*3;let w=c[u],y=c[u+1],g=c[u+2];y-=p*t,w+=a*t,g+=d*t;const m=this.getTerrainHeight(w,g);(y<m||y<0)&&(y=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),w=(Math.random()-.5)*40,g=(Math.random()-.5)*40),c[u]=w,c[u+1]=y,c[u+2]=g}l.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=n,n)){const l=this.windParticles.geometry.attributes.position,c=l.array,e=l.count,a=-r*(this.windSpeed||0)*.5,d=-h*(this.windSpeed||0)*.5;for(let p=0;p<e;p++){const f=p*3;let u=c[f],w=c[f+1],y=c[f+2];u+=a*t,y+=d*t,w+=Math.sin(u*.5+y*.5)*.02,(u<-20||u>20||y<-20||y>20)&&(Math.abs(a)>Math.abs(d)?(u=a>0?-20:20,y=(Math.random()-.5)*40):(u=(Math.random()-.5)*40,y=d>0?-20:20),w=Math.random()*8),c[f]=u,c[f+1]=w,c[f+2]=y}l.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const s=this._skyCanvas.getContext("2d"),i=this._skyCanvas.height,n=s.createLinearGradient(0,0,0,i),o=[2,4,10],r=[14,42,90],h=Math.round(o[0]+(r[0]-o[0])*t),l=Math.round(o[1]+(r[1]-o[1])*t),c=Math.round(o[2]+(r[2]-o[2])*t),e=Math.sin(t*Math.PI),a=Math.round(h+60*e),d=Math.round(l+20*e),p=Math.round(c+10*e);n.addColorStop(0,`rgb(${h},${l},${c})`),n.addColorStop(1,`rgb(${Math.min(255,a)},${Math.min(255,d)},${Math.min(255,p)})`),s.fillStyle=n,s.fillRect(0,0,2,i),this._skyTexture.needsUpdate=!0}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const o=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(o,1),this.scene.fog&&this.scene.fog.color.copy(o),this._paintSkyGradient(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const o=this._hass.states["sun.sun"],r=o.attributes.elevation!==void 0?parseFloat(o.attributes.elevation):0;r>0?t=1:r<-6?t=0:t=(r+6)/6}else{const o=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,o/1e3))}if(this.ambientLight){const o=new THREE.Color(3359061),r=new THREE.Color(12573694),h=new THREE.Color(659744),l=new THREE.Color(1980958);this.ambientLight.color.copy(o).lerp(r,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(h).lerp(l,t);const c=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=c+t*(1.5-c)}if(this.dirLight){this.dirLight.intensity=t*1.5;const o=t*Math.PI-Math.PI/2,r=15*Math.sin(o),h=15*Math.cos(o);this.dirLight.position.set(r,h,7);const c=new THREE.Color(16753920),e=new THREE.Color(16707722);this.dirLight.color.copy(c).lerp(e,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const s=new THREE.Color(132106),i=new THREE.Color(529189),n=s.clone().lerp(i,t);if(this.renderer&&this.renderer.setClearColor(n,1),this.scene.fog){this.scene.fog.color.copy(n);const o=.008,r=.003,h=.01,l=Math.sin(t*Math.PI),c=o+(r-o)*t;this.scene.fog.density=c+(h-o)*l*.5}this._paintSkyGradient(t)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),s=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(s),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const i of this.heatmapMeshes.values())this.scene.remove(i.mesh),i.material&&i.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(i=>{i.pulseVal+=.04;const n=Math.sin(i.pulseVal);let o=1+n*.1,r=.5+n*.3;if(i.strikeIntensity&&i.strikeIntensity>0){i.strikeIntensity-=.02;const h=1+i.strikeIntensity*1.5;o*=h,r=Math.min(1,r+i.strikeIntensity*.5),i.mesh.children&&i.mesh.children[2]&&(i.mesh.children[2].scale.set(h,h,h),i.mesh.children[2].material.color.setHex(16777215)),i.mesh.children&&i.mesh.children[1]&&i.mesh.children[1].material.color.setHex(16777215)}else{const h=i.mesh.userData.station.color;i.mesh.children&&i.mesh.children[2]&&(i.mesh.children[2].scale.set(1,1,1),i.mesh.children[2].material.color.setHex(h)),i.mesh.children&&i.mesh.children[1]&&(i.mesh.children[1].scale.set(1,1,1),i.mesh.children[1].material.color.setHex(h))}i.mesh.children&&i.mesh.children[0]&&(i.mesh.children[0].scale.set(o,o,1),i.mesh.children[0].material.opacity=r)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const s=[1,5,10,30,60,120,300,600];s.includes(this.playbackSpeed)||(s.push(this.playbackSpeed),s.sort((i,n)=>i-n)),s.forEach(i=>{const n=document.createElement("option");n.value=i.toString(),n.innerText=`${i}x`,i===this.playbackSpeed&&(n.selected=!0),this.speedSelect.appendChild(n)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",i=>this.handleSliderInput(i)),this.slider.addEventListener("change",()=>this.handleSliderChange()),this.speedSelect.addEventListener("change",i=>{this.playbackSpeed=parseFloat(i.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5,s=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=s,this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=s.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const i=Date.now(),n=i-(this.lastPlayTickTime||i);this.lastPlayTickTime=i,this.playbackTime+=n*this.playbackSpeed,this.playbackTime>=s?(this.playbackTime=s,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const s=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),i=Math.round((Date.now()-this.playbackTime)/1e3);let n="";if(i<60)n=`-${i}s`;else{const o=Math.floor(i/60),r=i%60;n=`-${o}m ${r}s`}this.timeLabel&&(this.timeLabel.innerText=`${s} (${n})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(s=>{s.time<=this.playbackTime?s.animated=!0:s.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,s,i=10){const n=[],o=new THREE.Vector3().subVectors(s,t);n.push(t.clone());for(let r=1;r<i;r++){const h=r/i,l=new THREE.Vector3().addVectors(t,o.clone().multiplyScalar(h)),c=(1-h)*1;l.add(new THREE.Vector3((Math.random()-.5)*c,(Math.random()-.5)*c,(Math.random()-.5)*c)),n.push(l)}return n.push(s.clone()),n}createLightningBranches(t,s,i=8){const n=this.createLightningPath(t,s,i),o=[n];for(let r=1;r<n.length-2;r++)if(Math.random()<.25){const h=n[r].clone(),c=(1-r/n.length)*6,e=new THREE.Vector3().subVectors(s,t).normalize();e.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const a=new THREE.Vector3().addVectors(h,e.multiplyScalar(c)),d=this.createLightningPath(h,a,4);o.push(d)}return o}triggerStrikeAnimation(t,s,i=[]){if(!this.initialized)return;const n=this.getTerrainHeight(t,s),o=new THREE.Vector3(t,n,s),r=new THREE.Vector3(t+(Math.random()-.5)*4,n+18,s+(Math.random()-.5)*4);if(this.stationMeshes&&this.stationMeshes.forEach(g=>{(!i||i.length===0||i.some(E=>String(E)===String(g.mesh.userData.station.id)))&&(g.strikeIntensity=1)}),this.ambientLight){const g=this.ambientLight.intensity;this.ambientLight.intensity=4;let m=0;const E=()=>{m++,this.ambientLight.intensity=Math.max(g,4*(1-m/8)),m<8&&requestAnimationFrame(E)};requestAnimationFrame(E)}const h=[];this.createLightningBranches(r,o).forEach((g,m)=>{const E=new THREE.CatmullRomCurve3(g),_=m===0,G=new THREE.TubeGeometry(E,Math.max(10,g.length*3),_?.06:.03,5,!1),v=new THREE.MeshStandardMaterial({color:_?16777215:16769126,emissive:_?16766720:16757504,emissiveIntensity:_?3:1.5,transparent:!0,opacity:_?1:.75,depthWrite:!1}),b=new THREE.Mesh(G,v);this.strikeLayer.add(b),h.push(b)});const c=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),e=new THREE.Sprite(c);e.position.copy(o),e.position.y+=.1,e.scale.set(.1,.1,1),this.strikeLayer.add(e);const a=new THREE.RingGeometry(.1,.2,32),d=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),p=new THREE.Mesh(a,d);p.position.copy(o),p.position.y+=.05,p.rotation.x=-Math.PI/2,this.strikeLayer.add(p);const f=[];this.stations.forEach(g=>{const m=this.getTerrainHeight(g.x,g.z),E=new THREE.Vector3(g.x,m,g.z),_=E.distanceTo(o),G=new THREE.RingGeometry(_-.08,_+.08,64),v=new THREE.MeshBasicMaterial({color:g.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),b=new THREE.Mesh(G,v);b.position.copy(E),b.position.y+=.05,b.rotation.x=-Math.PI/2,this.strikeLayer.add(b),f.push({mesh:b,targetOpacity:.5})});let u=0;const w=60,y=()=>{u++;const g=u/w;if(g<.2?h.forEach(m=>m.material.opacity=Math.random()>.3?1:.2):g<.5?h.forEach(m=>{m.material.opacity=1-(g-.2)/.3}):h.forEach(m=>{m.parent&&(this.strikeLayer.remove(m),m.geometry&&m.geometry.dispose(),m.material&&m.material.dispose())}),g<.6){const m=g*12;e.scale.set(m,m,1),e.material.opacity=1*(1-g/.6)}else e.parent&&(this.strikeLayer.remove(e),e.material.dispose());if(g<.8){const m=1+g*25;p.scale.set(m,m,1),p.material.opacity=.8*(1-g/.8)}else p.parent&&(this.strikeLayer.remove(p),p.geometry&&p.geometry.dispose(),p.material&&p.material.dispose());f.forEach(m=>{g<.3?m.mesh.material.opacity=m.targetOpacity*(g/.3):g<.9?m.mesh.material.opacity=m.targetOpacity*(1-(g-.3)/.6):m.mesh.parent&&(this.strikeLayer.remove(m.mesh),m.mesh.geometry&&m.mesh.geometry.dispose(),m.mesh.material&&m.mesh.material.dispose())}),u<w&&requestAnimationFrame(y)};y()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const s=this.config.entity||this.config.entity_id||Object.keys(t.states).find(e=>e.startsWith("sensor.")&&e.endsWith("_stations")&&t.states[e].attributes.stations!==void 0&&t.states[e].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(e=>e.startsWith("sensor.")&&t.states[e].attributes.stations!==void 0);let i=t.config.latitude,n=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",i,n),s){const a=t.states[s].attributes.stations;if(Array.isArray(a)){const d=a.find(p=>p.type==="primary");if(d&&d.latitude!==void 0&&d.longitude!==void 0){const p=parseFloat(d.latitude),f=parseFloat(d.longitude);!isNaN(p)&&!isNaN(f)?(i=p,n=f,console.log("WeatherFlow Card: Resolved primary station coordinate:",i,n)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",d.latitude,d.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",a)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",a)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==i||this.lastRefLon!==n)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",i,n),this.lastRefLat=i,this.lastRefLon=n,this.loadMapTexture(i,n),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(i,n),s){const e=t.states[s].attributes.elevation_grid;e&&JSON.stringify(e)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(e);const a=t.states[s].attributes;this.windSpeed=a.wind_speed!==void 0?parseFloat(a.wind_speed):0,this.windDirection=a.wind_direction!==void 0?parseFloat(a.wind_direction):0,this.solarRadiation=a.solar_radiation!==void 0?parseFloat(a.solar_radiation):1e3,this.rainRate=a.rain_rate!==void 0?parseFloat(a.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay(),this.lastStationStrikes||(this.lastStationStrikes={}),Object.keys(t.states).forEach(p=>{if(p.startsWith("sensor.")){const f=t.states[p],u=f.attributes.station_id;if(u!==void 0){const w=parseInt(f.state)||0,y=this.lastStationStrikes[u];y!==void 0&&w>y&&this.stationMeshes&&this.stationMeshes.forEach(g=>{String(g.mesh.userData.station.id)===String(u)&&(g.strikeIntensity=1)}),this.lastStationStrikes[u]=w}}});const d=a.stations;if(Array.isArray(d)){let p=!1;if(this.stations.length!==d.length)p=!0;else for(let f=0;f<d.length;f++)if(!this.stations.find(w=>w.id===d[f].id)){p=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",p,"Current length:",this.stations.length,"New length:",d.length),p){const u=Math.cos(i*Math.PI/180);this.stations=d.map(w=>{const y=parseFloat(w.latitude),g=parseFloat(w.longitude),m=6371*(g-n)*(Math.PI/180)*u,E=-6371*(y-i)*(Math.PI/180);let _=6583435;return w.type==="primary"?_=1096065:w.type==="neighbor"&&(_=3718648),console.log("WeatherFlow Card: Mapped station:",w.id,"type:",w.type,"lat:",y,"lon:",g,"to grid coords:",m,E),{id:w.id,x:m,z:E,color:_,type:w.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(w=>{this.scene.remove(w.mesh)})),this.addWeatherStations()}}}const o="weatherflow_lightning_trilateration",r=Object.keys(t.states).filter(e=>e.startsWith("geo_location.")&&t.states[e].attributes.source===o),h=6371,l=Math.cos(i*Math.PI/180),c=[];r.forEach(e=>{const a=t.states[e],d=parseFloat(a.attributes.latitude),p=parseFloat(a.attributes.longitude),f=a.attributes.stations||[];if(!isNaN(d)&&!isNaN(p)){const u=h*(p-n)*(Math.PI/180)*l,w=-h*(d-i)*(Math.PI/180),y=new Date(a.last_changed).getTime();c.push({id:e,time:y,x:u,z:w,stations:f})}}),c.sort((e,a)=>e.time-a.time),c.forEach(e=>{if(!this.strikeHistory.some(a=>a.id===e.id)){const a=!this.knownStrikes.has(e.id);a&&this.knownStrikes.add(e.id);const d=this.playbackMode==="live"&&a;this.strikeHistory.push({id:e.id,time:e.time,x:e.x,z:e.z,stations:e.stations,animated:d||this.playbackMode!=="live"&&e.time<=this.playbackTime}),d&&this.triggerStrikeAnimation(e.x,e.z,e.stations)}}),this.strikeHistory=this.strikeHistory.filter(e=>c.some(a=>a.id===e.id)),this.strikeHistory.sort((e,a)=>e.time-a.time);for(const e of this.knownStrikes)t.states[e]||this.knownStrikes.delete(e)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",Y),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class j extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const s=this.shadowRoot.getElementById("height");s&&(s.value=this._config.height||"350px");const i=this.shadowRoot.getElementById("zoom_level");i&&(i.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const n=this.shadowRoot.getElementById("show_grid");n&&(n.checked=this._config.show_grid!==!1);const o=this.shadowRoot.getElementById("show_map");o&&(o.checked=this._config.show_map!==!1);const r=this.shadowRoot.getElementById("show_rings");r&&(r.checked=this._config.show_rings!==!1);const h=this.shadowRoot.getElementById("show_heatmap");h&&(h.checked=this._config.show_heatmap!==!1);const l=this.shadowRoot.getElementById("auto_orbit");l&&(l.checked=this._config.auto_orbit!==!1);const c=this.shadowRoot.getElementById("show_weather");c&&(c.checked=this._config.show_weather!==!1);const e=this.shadowRoot.getElementById("show_daynight");e&&(e.checked=this._config.show_daynight!==!1);const a=this.shadowRoot.getElementById("min_brightness");a&&(a.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const d=this.shadowRoot.getElementById("elevation_scale");d&&(d.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const p=this.shadowRoot.getElementById("show_3d_features");p&&(p.checked=this._config.show_3d_features===!0);const f=this.shadowRoot.getElementById("playback_speed");f&&(f.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(s=>{s.addEventListener("change",i=>this.toggleChanged(i))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(s=>{s.addEventListener("input",i=>this.textChanged(i))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",s=>{const i=s.detail&&s.detail.value!=null?s.detail.value:null;this._onEntityPicked(i)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const s=t.target;this.dispatchConfigChange(s.id,s.checked)}textChanged(t){if(!this._config)return;const s=t.target;let i=s.value;if(s.id==="zoom_level"||s.id==="min_brightness"||s.id==="elevation_scale"||s.id==="playback_speed"){const n=parseFloat(i);isNaN(n)||(i=n)}this.dispatchConfigChange(s.id,i)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=i=>i.attributes&&Array.isArray(i.attributes.stations)&&i.attributes.icon==="mdi:lightning-bolt";const s=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==s&&(t.value=s)}_onEntityPicked(t){let s;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(s=t.slice(7,-9));const i={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:s||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}dispatchConfigChange(t,s){if(this._config[t]===s)return;const i={...this._config,[t]:s},n=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(n)}}customElements.define("weatherflow-lightning-card-editor",j);export{};
