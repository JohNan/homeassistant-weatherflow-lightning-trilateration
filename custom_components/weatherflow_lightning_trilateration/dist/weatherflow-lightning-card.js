/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class O extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const s=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const e=this.config.height;if(e.endsWith("px")){const n=parseInt(e);this.container.style.height=`${n-40}px`}else this.container.style.height=e}this.initialized&&this.applyConfigChanges(s||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const s=parseFloat(this.config.zoom_level);isNaN(s)||(this.zoomRadius=s,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&(this.terrainMesh.material.map&&this.terrainMesh.material.map.dispose(),this.terrainMesh.material.dispose())),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(e=>e.dispose()):s.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(10,Math.min(150,this.zoomRadius));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),s=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(t,s,e),this.camera.lookAt(0,0,0))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const i=parseInt(t);this.container.style.height=`${i-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const s=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,s,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.atan2(30,15),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const n=i=>i.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(i=>{this.weatherOverlay.addEventListener(i,n)}),this.weatherOverlay.addEventListener("click",i=>{(i.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(i.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let h=!1,l={x:0,y:0};this.container.addEventListener("mousedown",i=>{this.lastInteractionTime=Date.now(),h=!0,this.container.style.cursor="grabbing",l={x:i.clientX,y:i.clientY}}),this.container.addEventListener("mousemove",i=>{if(this.lastInteractionTime=Date.now(),h){const a=i.clientX-l.x,r=i.clientY-l.y;this.cameraTheta-=a*.005,this.cameraPhi+=r*.005,this.updateCameraPosition(),l={x:i.clientX,y:i.clientY}}else{const a=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(i.clientX-a.left)/a.width*2-1,this.mouse.y=-((i.clientY-a.top)/a.height)*2+1,this.checkHover(i.clientX-a.left,i.clientY-a.top)}}),this._mouseupHandler=()=>{h=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",i=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),i.preventDefault(),this.zoomRadius+=i.deltaY*.02,this.updateCameraPosition()},{passive:!1});let d=0;this.container.addEventListener("touchstart",i=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),i.touches.length===1?(h=!0,l={x:i.touches[0].clientX,y:i.touches[0].clientY}):i.touches.length===2&&(h=!1,d=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY))}),this.container.addEventListener("touchmove",i=>{if(this.lastInteractionTime=Date.now(),i.preventDefault(),i.touches.length===1&&h){const a=i.touches[0].clientX-l.x,r=i.touches[0].clientY-l.y;this.cameraTheta-=a*.007,this.cameraPhi+=r*.007,this.updateCameraPosition(),l={x:i.touches[0].clientX,y:i.touches[0].clientY}}else if(i.touches.length===2){const a=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY),r=a-d;this.zoomRadius-=r*.15,this.updateCameraPosition(),d=a}},{passive:!1}),this.container.addEventListener("touchend",()=>{h=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const i=this.container.clientWidth,a=this.container.clientHeight;this.camera.aspect=i/a,this.camera.updateProjectionMatrix(),this.renderer.setSize(i,a)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),e=s.createRadialGradient(32,32,0,32,32,32);return e.addColorStop(0,"rgba(0, 242, 254, 1.0)"),e.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),e.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),e.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=e,s.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const s=document.createElement("canvas");s.width=128,s.height=64;const e=s.getContext("2d");e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const n=new THREE.CanvasTexture(s),o=new THREE.SpriteMaterial({map:n,transparent:!0,depthWrite:!1,depthTest:!0}),h=new THREE.Sprite(o);return h.scale.set(2,1,1),h}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(r=>{const c=[];for(let f=0;f<=128;f++){const p=f/128*Math.PI*2,v=r*Math.cos(p),b=r*Math.sin(p);c.push(new THREE.Vector3(v,.05,b))}const u=new THREE.BufferGeometry().setFromPoints(c),m=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5}),y=new THREE.Line(u,m);this.rangeRingsGroup.add(y)});const s=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3}),e=[],n=40;for(let r=0;r<=n;r++){const c=-30+r/n*60;e.push(new THREE.Vector3(0,.05,c))}const o=new THREE.BufferGeometry().setFromPoints(e),h=new THREE.Line(o,s);this.rangeRingsGroup.add(h);const l=[];for(let r=0;r<=n;r++){const c=-30+r/n*60;l.push(new THREE.Vector3(c,.05,0))}const d=new THREE.BufferGeometry().setFromPoints(l),i=new THREE.Line(d,s);this.rangeRingsGroup.add(i);const a=Math.SQRT2/2;this.ringLabels=[],t.forEach(r=>{const c=this.createRingLabelSprite(`${r}km`);c.position.set(r*a,.5,-r*a),this.rangeRingsGroup.add(c),this.ringLabels.push({sprite:c,r})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((h,l)=>{const d=t[l];if(d){const i=d.geometry.attributes.position,a=128;for(let r=0;r<=a;r++){const c=r/a*Math.PI*2,g=h*Math.cos(c),u=h*Math.sin(c),m=this.getTerrainHeight(g,u)+.1;i.setY(r,m)}i.needsUpdate=!0}});const e=t[3];if(e){const h=e.geometry.attributes.position,l=40;for(let d=0;d<=l;d++){const i=-30+d/l*60,a=this.getTerrainHeight(0,i)+.1;h.setXYZ(d,0,a,i)}h.needsUpdate=!0}const n=t[4];if(n){const h=n.geometry.attributes.position,l=40;for(let d=0;d<=l;d++){const i=-30+d/l*60,a=this.getTerrainHeight(i,0)+.1;h.setXYZ(d,i,a,0)}h.needsUpdate=!0}const o=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(h=>{const l=h.r*o,d=-h.r*o,i=this.getTerrainHeight(l,d)+.4;h.sprite.position.set(l,i,d)})}getTerrainHeight(t,s){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const e=(t+20)*14/40,n=(s+20)*14/40;if(e<0||e>14||n<0||n>14)return 0;const o=Math.floor(e),h=Math.min(14,o+1),l=Math.floor(n),d=Math.min(14,l+1),i=e-o,a=n-l,r=this.getGridHeight(l,o),c=this.getGridHeight(l,h),g=this.getGridHeight(d,o),u=this.getGridHeight(d,h),m=r*(1-i)+c*i,y=g*(1-i)+u*i;return m*(1-a)+y*a}getGridHeight(t,s){return this.scaledHeights?this.scaledHeights[(14-t)*15+s]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let o=0;o<15;o++){const h=o-7;for(let l=0;l<15;l++){const d=l-7,i=Math.sqrt(h*h+d*d);let a=80+Math.sin(h*.4)*Math.cos(d*.4)*45;if(a+=Math.sin(i*.8)*15,o===7&&l===7)a=100;else{const r=Math.min(1,i/3);a=100*(1-r)+a*r}this.elevationGrid.push(a)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let o=0;o<225;o++)this.scaledHeights[o]=((this.elevationGrid[o]||0)-t)*e;const n=this.terrainGeo.attributes.position;for(let o=0;o<=14;o++){const h=14-o;for(let l=0;l<=14;l++){const d=l,i=o*15+l,a=this.scaledHeights[h*15+d];n.setZ(i,a)}}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,s){if(this.config.show_map===!1){this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0);return}const e=10,n=40,o=n/111.1,h=Math.cos(t*Math.PI/180),l=h>0?n/(111.1*h):n/111.1,d=t-o/2,i=t+o/2,a=s-l/2,r=s+l/2,c=(w,E)=>(w+180)/360*Math.pow(2,E),g=(w,E)=>(1-Math.log(Math.tan(w*Math.PI/180)+1/Math.cos(w*Math.PI/180))/Math.PI)/2*Math.pow(2,E),u=(w,E)=>w/Math.pow(2,E)*360-180,m=(w,E)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*w/Math.pow(2,E)))*180/Math.PI,y=Math.floor(c(a,e)),f=Math.floor(c(r,e)),p=Math.floor(g(i,e)),v=Math.floor(g(d,e)),b=document.createElement("canvas");b.width=1024,b.height=1024;const x=b.getContext("2d");x.fillStyle="#050b14",x.fillRect(0,0,1024,1024);const M=[];for(let w=y;w<=f;w++)for(let E=p;E<=v;E++){const L=u(w,e),S=u(w+1,e),P=m(E+1,e),C=m(E,e),_=(L-a)/(r-a),G=(S-a)/(r-a),I=(P-d)/(i-d),R=(C-d)/(i-d),z=_*1024,D=(1-R)*1024,F=(G-_)*1024,B=(R-I)*1024,A=`https://basemaps.cartocdn.com/dark_all/${e}/${w}/${E}.png`,W=new Promise(k=>{const T=new Image;T.crossOrigin="anonymous",T.onload=()=>{x.drawImage(T,z,D,F,B),k()},T.onerror=()=>k(),T.src=A});M.push(W)}Promise.all(M).then(()=>{const w=new THREE.CanvasTexture(b);this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=w,this.terrainMesh.material.color.setHex(16777215),this.terrainMesh.material.needsUpdate=!0)})}async loadVectorData(t,s){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,s),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,s,e){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(h=>{h.geometry&&h.geometry.dispose(),h.material&&(Array.isArray(h.material)?h.material.forEach(l=>l.dispose()):h.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const n=6371,o=Math.cos(s*Math.PI/180);if(t.water&&Array.isArray(t.water)){const h=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(l=>{if(!l.coordinates||l.coordinates.length<3)return;const d=[];let i=0,a=0;if(l.coordinates.forEach(u=>{const m=u[0],y=u[1],f=n*(y-e)*(Math.PI/180)*o,p=-n*(m-s)*(Math.PI/180);f<-20||f>20||p<-20||p>20||(d.push(new THREE.Vector2(f,-p)),i+=this.getTerrainHeight(f,p),a++)}),d.length<3)return;i/=a;const r=new THREE.Shape(d),c=new THREE.ShapeGeometry(r),g=new THREE.Mesh(c,h);g.rotation.x=-Math.PI/2,g.position.y=i+.08,this.features3DGroup.add(g)})}if(t.forest&&Array.isArray(t.forest)){const h=[];if(t.forest.forEach(l=>{!l.coordinates||l.coordinates.length<3||l.coordinates.forEach((d,i)=>{if(i%4!==0)return;const a=d[0],r=d[1],c=n*(r-e)*(Math.PI/180)*o,g=-n*(a-s)*(Math.PI/180);if(c<-19.5||c>19.5||g<-19.5||g>19.5)return;const u=this.getTerrainHeight(c,g);h.push(new THREE.Vector3(c,u,g))})}),h.length>0){const l=new THREE.ConeGeometry(.12,.45,4);l.translate(0,.225,0);const d=new THREE.MeshPhongMaterial({color:1467700,flatShading:!0}),i=new THREE.InstancedMesh(l,d,h.length),a=new THREE.Object3D;h.forEach((r,c)=>{a.position.copy(r);const g=.8+Math.random()*.4;a.scale.set(g,g,g),a.updateMatrix(),i.setMatrixAt(c,a.matrix)}),i.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(i)}}}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const s=7*15+7,e=t[s]||0,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let l=0;l<225;l++)this.scaledHeights[l]=((t[l]||0)-e)*o;const h=this.terrainGeo.attributes.position;for(let l=0;l<=14;l++){const d=14-l;for(let i=0;i<=14;i++){const a=i,r=l*15+i,c=this.scaledHeights[d*15+a];h.setZ(r,c)}}h.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,s)=>{const e=this.stationMeshes[s];if(e&&e.mesh){const n=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=n}})}showTooltip(t,s,e){if(!this.tooltip)return;let n="Discovered Station";t.type==="primary"?n="Primary Station":t.type==="neighbor"&&(n="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${n}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const o=this.container.getBoundingClientRect();let h=s+15,l=e+15;h+150>o.width&&(h=s-165),l+60>o.height&&(l=e-75),this.tooltip.style.left=`${h}px`,this.tooltip.style.top=`${l}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,s){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(n=>n.mesh),!0);if(e.length>0){let n=e[0].object;for(;n&&n.parent&&(!n.userData||!n.userData.station);)n=n.parent;if(n&&n.userData&&n.userData.station){const o=n.userData.station;this.showTooltip(o,t,s),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,s=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let n=0;n<this.strikeHistory.length;n++){const o=this.strikeHistory[n],h=s-o.time;if(h>=0&&h<=t){e.add(o.id);const l=h/t,d=.7*(1-l),i=1-l*.4;let a=this.heatmapMeshes.get(o.id);if(a)a.material.opacity=d,a.mesh.scale.set(i,i,i),a.mesh.position.y=this.getTerrainHeight(o.x,o.z);else{const r=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:d,depthWrite:!1}),c=new THREE.Mesh(this.heatGeo,r),g=this.getTerrainHeight(o.x,o.z);c.position.set(o.x,g,o.z),c.scale.set(i,i,i),this.scene.add(c),a={mesh:c,material:r},this.heatmapMeshes.set(o.id,a)}}}for(const[n,o]of this.heatmapMeshes.entries())e.has(n)||(this.scene.remove(o.mesh),o.material&&o.material.dispose(),this.heatmapMeshes.delete(n))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),s=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,s),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const e=new THREE.BufferGeometry,n=500,o=new Float32Array(n*3);for(let a=0;a<n*3;a+=3){const r=100+Math.random()*50,c=Math.random(),g=Math.random(),u=c*2*Math.PI,m=Math.acos(2*g-1);o[a]=r*Math.sin(m)*Math.cos(u),o[a+1]=r*Math.sin(m)*Math.sin(u),o[a+2]=r*Math.cos(m)}e.setAttribute("position",new THREE.BufferAttribute(o,3));const h=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(e,h),this.scene.add(this.starField);const l=40;this.terrainGeo=new THREE.PlaneGeometry(l,l,14,14);const d=new THREE.MeshPhongMaterial({color:330516,emissive:66826,specular:1121838,shininess:30,flatShading:!0,side:THREE.DoubleSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,d),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const i=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,i),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const s=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);s.position.set(t.x,e,t.z),s.userData={station:t};const n=new THREE.RingGeometry(.8,1,32),o=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),h=new THREE.Mesh(n,o);h.rotation.x=-Math.PI/2,h.position.y=.02,s.add(h);const l=new THREE.CylinderGeometry(.08,.08,2.5,8),d=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),i=new THREE.Mesh(l,d);i.position.y=1.25,s.add(i);const a=new THREE.SphereGeometry(.25,16,16),r=new THREE.MeshBasicMaterial({color:t.color}),c=new THREE.Mesh(a,r);c.position.y=2.5,s.add(c),this.scene.add(s),this.stationMeshes.push({mesh:s,pulseVal:Math.random()*Math.PI})})}initWeatherSystem(){const n=new THREE.BufferGeometry,o=new Float32Array(800*3);for(let r=0;r<800*3;r+=3)o[r]=(Math.random()-.5)*40,o[r+1]=18+Math.random()*4,o[r+2]=(Math.random()-.5)*40;n.setAttribute("position",new THREE.BufferAttribute(o,3));const h=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(n,h),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const l=300,d=new THREE.BufferGeometry,i=new Float32Array(l*3);for(let r=0;r<l*3;r+=3)i[r]=(Math.random()-.5)*40,i[r+1]=Math.random()*8,i[r+2]=(Math.random()-.5)*40;d.setAttribute("position",new THREE.BufferAttribute(i,3));const a=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(d,a),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),s=(this.rainRate||0).toFixed(1),e=this.windDirection||0;if(this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
            <div class="hud-value">${s} mm/h</div>
          </div>
        </div>
      </div>
    `}updateWeatherSystem(t){if(!this.initialized)return;const s=this.config.show_weather!==!1,e=s&&this.rainRate>0,n=s&&this.windSpeed>0,o=(this.windDirection||0)*Math.PI/180,h=Math.sin(o),l=Math.cos(o);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const d=this.rainParticles.geometry.attributes.position,i=d.array,a=d.count,r=-h*(this.windSpeed||0)*.1,c=-l*(this.windSpeed||0)*.1,g=10+Math.min(20,this.rainRate*2);for(let u=0;u<a;u++){const m=u*3;let y=i[m],f=i[m+1],p=i[m+2];f-=g*t,y+=r*t,p+=c*t;const v=this.getTerrainHeight(y,p);(f<v||f<0)&&(f=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),y=(Math.random()-.5)*40,p=(Math.random()-.5)*40),i[m]=y,i[m+1]=f,i[m+2]=p}d.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=n,n)){const d=this.windParticles.geometry.attributes.position,i=d.array,a=d.count,r=-h*(this.windSpeed||0)*.5,c=-l*(this.windSpeed||0)*.5;for(let g=0;g<a;g++){const u=g*3;let m=i[u],y=i[u+1],f=i[u+2];m+=r*t,f+=c*t,y+=Math.sin(m*.5+f*.5)*.02,(m<-20||m>20||f<-20||f>20)&&(Math.abs(r)>Math.abs(c)?(m=r>0?-20:20,f=(Math.random()-.5)*40):(m=(Math.random()-.5)*40,f=c>0?-20:20),y=Math.random()*8),i[u]=m,i[u+1]=y,i[u+2]=f}d.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const s=this._skyCanvas.getContext("2d"),e=this._skyCanvas.height,n=s.createLinearGradient(0,0,0,e),o=[2,4,10],h=[14,42,90],l=Math.round(o[0]+(h[0]-o[0])*t),d=Math.round(o[1]+(h[1]-o[1])*t),i=Math.round(o[2]+(h[2]-o[2])*t),a=Math.sin(t*Math.PI),r=Math.round(l+60*a),c=Math.round(d+20*a),g=Math.round(i+10*a);n.addColorStop(0,`rgb(${l},${d},${i})`),n.addColorStop(1,`rgb(${Math.min(255,r)},${Math.min(255,c)},${Math.min(255,g)})`),s.fillStyle=n,s.fillRect(0,0,2,e),this._skyTexture.needsUpdate=!0}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const o=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(o,1),this.scene.fog&&this.scene.fog.color.copy(o),this._paintSkyGradient(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const o=this._hass.states["sun.sun"],h=o.attributes.elevation!==void 0?parseFloat(o.attributes.elevation):0;h>0?t=1:h<-6?t=0:t=(h+6)/6}else{const o=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,o/1e3))}if(this.ambientLight){const o=new THREE.Color(3359061),h=new THREE.Color(12573694),l=new THREE.Color(659744),d=new THREE.Color(1980958);this.ambientLight.color.copy(o).lerp(h,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(l).lerp(d,t);const i=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=i+t*(1.5-i)}if(this.dirLight){this.dirLight.intensity=t*1.5;const o=t*Math.PI-Math.PI/2,h=15*Math.sin(o),l=15*Math.cos(o);this.dirLight.position.set(h,l,7);const i=new THREE.Color(16753920),a=new THREE.Color(16707722);this.dirLight.color.copy(i).lerp(a,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const s=new THREE.Color(132106),e=new THREE.Color(529189),n=s.clone().lerp(e,t);if(this.renderer&&this.renderer.setClearColor(n,1),this.scene.fog){this.scene.fog.color.copy(n);const o=.008,h=.003,l=.01,d=Math.sin(t*Math.PI),i=o+(h-o)*t;this.scene.fog.density=i+(l-o)*d*.5}this._paintSkyGradient(t)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),s=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(s),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const n=Math.sin(e.pulseVal),o=1+n*.1;e.mesh.children&&e.mesh.children[0]&&(e.mesh.children[0].scale.set(o,o,1),e.mesh.children[0].material.opacity=.5+n*.3)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const s=[1,5,10,30,60,120,300,600];s.includes(this.playbackSpeed)||(s.push(this.playbackSpeed),s.sort((e,n)=>e-n)),s.forEach(e=>{const n=document.createElement("option");n.value=e.toString(),n.innerText=`${e}x`,e===this.playbackSpeed&&(n.selected=!0),this.speedSelect.appendChild(n)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",e=>this.handleSliderInput(e)),this.slider.addEventListener("change",()=>this.handleSliderChange()),this.speedSelect.addEventListener("change",e=>{this.playbackSpeed=parseFloat(e.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5,s=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=s,this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=s.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),n=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=n*this.playbackSpeed,this.playbackTime>=s?(this.playbackTime=s,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const s=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let n="";if(e<60)n=`-${e}s`;else{const o=Math.floor(e/60),h=e%60;n=`-${o}m ${h}s`}this.timeLabel&&(this.timeLabel.innerText=`${s} (${n})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(s=>{s.time<=this.playbackTime?s.animated=!0:s.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z)):t.animated=!1})}createLightningPath(t,s,e=10){const n=[],o=new THREE.Vector3().subVectors(s,t);n.push(t.clone());for(let h=1;h<e;h++){const l=h/e,d=new THREE.Vector3().addVectors(t,o.clone().multiplyScalar(l)),i=(1-l)*1;d.add(new THREE.Vector3((Math.random()-.5)*i,(Math.random()-.5)*i,(Math.random()-.5)*i)),n.push(d)}return n.push(s.clone()),n}createLightningBranches(t,s,e=8){const n=this.createLightningPath(t,s,e),o=[n];for(let h=1;h<n.length-2;h++)if(Math.random()<.25){const l=n[h].clone(),i=(1-h/n.length)*6,a=new THREE.Vector3().subVectors(s,t).normalize();a.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const r=new THREE.Vector3().addVectors(l,a.multiplyScalar(i)),c=this.createLightningPath(l,r,4);o.push(c)}return o}triggerStrikeAnimation(t,s){if(!this.initialized)return;const e=this.getTerrainHeight(t,s),n=new THREE.Vector3(t,e,s),o=new THREE.Vector3(t+(Math.random()-.5)*4,e+18,s+(Math.random()-.5)*4);if(this.ambientLight){const f=this.ambientLight.intensity;this.ambientLight.intensity=4;let p=0;const v=()=>{p++,this.ambientLight.intensity=Math.max(f,4*(1-p/8)),p<8&&requestAnimationFrame(v)};requestAnimationFrame(v)}const h=[];this.createLightningBranches(o,n).forEach((f,p)=>{const v=new THREE.CatmullRomCurve3(f),b=p===0,x=new THREE.TubeGeometry(v,Math.max(10,f.length*3),b?.06:.03,5,!1),M=new THREE.MeshStandardMaterial({color:b?16777215:16769126,emissive:b?16766720:16757504,emissiveIntensity:b?3:1.5,transparent:!0,opacity:b?1:.75,depthWrite:!1}),w=new THREE.Mesh(x,M);this.strikeLayer.add(w),h.push(w)});const d=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),i=new THREE.Sprite(d);i.position.copy(n),i.position.y+=.1,i.scale.set(.1,.1,1),this.strikeLayer.add(i);const a=new THREE.RingGeometry(.1,.2,32),r=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),c=new THREE.Mesh(a,r);c.position.copy(n),c.position.y+=.05,c.rotation.x=-Math.PI/2,this.strikeLayer.add(c);const g=[];this.stations.forEach(f=>{const p=this.getTerrainHeight(f.x,f.z),v=new THREE.Vector3(f.x,p,f.z),b=v.distanceTo(n),x=new THREE.RingGeometry(b-.08,b+.08,64),M=new THREE.MeshBasicMaterial({color:f.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),w=new THREE.Mesh(x,M);w.position.copy(v),w.position.y+=.05,w.rotation.x=-Math.PI/2,this.strikeLayer.add(w),g.push({mesh:w,targetOpacity:.5})});let u=0;const m=60,y=()=>{u++;const f=u/m;if(f<.2?h.forEach(p=>p.material.opacity=Math.random()>.3?1:.2):f<.5?h.forEach(p=>{p.material.opacity=1-(f-.2)/.3}):h.forEach(p=>{p.parent&&(this.strikeLayer.remove(p),p.geometry&&p.geometry.dispose(),p.material&&p.material.dispose())}),f<.6){const p=f*12;i.scale.set(p,p,1),i.material.opacity=1*(1-f/.6)}else i.parent&&(this.strikeLayer.remove(i),i.material.dispose());if(f<.8){const p=1+f*25;c.scale.set(p,p,1),c.material.opacity=.8*(1-f/.8)}else c.parent&&(this.strikeLayer.remove(c),c.geometry&&c.geometry.dispose(),c.material&&c.material.dispose());g.forEach(p=>{f<.3?p.mesh.material.opacity=p.targetOpacity*(f/.3):f<.9?p.mesh.material.opacity=p.targetOpacity*(1-(f-.3)/.6):p.mesh.parent&&(this.strikeLayer.remove(p.mesh),p.mesh.geometry&&p.mesh.geometry.dispose(),p.mesh.material&&p.mesh.material.dispose())}),u<m&&requestAnimationFrame(y)};y()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const s=this.config.entity||this.config.entity_id||Object.keys(t.states).find(a=>a.startsWith("sensor.")&&a.endsWith("_stations")&&t.states[a].attributes.stations!==void 0&&t.states[a].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(a=>a.startsWith("sensor.")&&t.states[a].attributes.stations!==void 0);let e=t.config.latitude,n=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",e,n),s){const r=t.states[s].attributes.stations;if(Array.isArray(r)){const c=r.find(g=>g.type==="primary");if(c&&c.latitude!==void 0&&c.longitude!==void 0){const g=parseFloat(c.latitude),u=parseFloat(c.longitude);!isNaN(g)&&!isNaN(u)?(e=g,n=u,console.log("WeatherFlow Card: Resolved primary station coordinate:",e,n)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",c.latitude,c.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",r)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",r)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==e||this.lastRefLon!==n)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",e,n),this.lastRefLat=e,this.lastRefLon=n,this.loadMapTexture(e,n),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(e,n),s){const a=t.states[s].attributes.elevation_grid;a&&JSON.stringify(a)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(a);const r=t.states[s].attributes;this.windSpeed=r.wind_speed!==void 0?parseFloat(r.wind_speed):0,this.windDirection=r.wind_direction!==void 0?parseFloat(r.wind_direction):0,this.solarRadiation=r.solar_radiation!==void 0?parseFloat(r.solar_radiation):1e3,this.rainRate=r.rain_rate!==void 0?parseFloat(r.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay();const c=r.stations;if(Array.isArray(c)){let g=!1;if(this.stations.length!==c.length)g=!0;else for(let u=0;u<c.length;u++)if(!this.stations.find(y=>y.id===c[u].id)){g=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",g,"Current length:",this.stations.length,"New length:",c.length),g){const m=Math.cos(e*Math.PI/180);this.stations=c.map(y=>{const f=parseFloat(y.latitude),p=parseFloat(y.longitude),v=6371*(p-n)*(Math.PI/180)*m,b=-6371*(f-e)*(Math.PI/180);let x=6583435;return y.type==="primary"?x=1096065:y.type==="neighbor"&&(x=3718648),console.log("WeatherFlow Card: Mapped station:",y.id,"type:",y.type,"lat:",f,"lon:",p,"to grid coords:",v,b),{id:y.id,x:v,z:b,color:x,type:y.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(y=>{this.scene.remove(y.mesh)})),this.addWeatherStations()}}}const o="weatherflow_lightning_trilateration",h=Object.keys(t.states).filter(a=>a.startsWith("geo_location.")&&t.states[a].attributes.source===o),l=6371,d=Math.cos(e*Math.PI/180),i=[];h.forEach(a=>{const r=t.states[a],c=parseFloat(r.attributes.latitude),g=parseFloat(r.attributes.longitude);if(!isNaN(c)&&!isNaN(g)){const u=l*(g-n)*(Math.PI/180)*d,m=-l*(c-e)*(Math.PI/180),y=new Date(r.last_changed).getTime();i.push({id:a,time:y,x:u,z:m})}}),i.sort((a,r)=>a.time-r.time),i.forEach(a=>{if(!this.strikeHistory.some(r=>r.id===a.id)){const r=!this.knownStrikes.has(a.id);r&&this.knownStrikes.add(a.id);const c=this.playbackMode==="live"&&r;this.strikeHistory.push({id:a.id,time:a.time,x:a.x,z:a.z,animated:c||this.playbackMode!=="live"&&a.time<=this.playbackTime}),c&&this.triggerStrikeAnimation(a.x,a.z)}}),this.strikeHistory=this.strikeHistory.filter(a=>i.some(r=>r.id===a.id)),this.strikeHistory.sort((a,r)=>a.time-r.time);for(const a of this.knownStrikes)t.states[a]||this.knownStrikes.delete(a)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",O),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const s=this.shadowRoot.getElementById("height");s&&(s.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const n=this.shadowRoot.getElementById("show_grid");n&&(n.checked=this._config.show_grid!==!1);const o=this.shadowRoot.getElementById("show_map");o&&(o.checked=this._config.show_map!==!1);const h=this.shadowRoot.getElementById("show_rings");h&&(h.checked=this._config.show_rings!==!1);const l=this.shadowRoot.getElementById("show_heatmap");l&&(l.checked=this._config.show_heatmap!==!1);const d=this.shadowRoot.getElementById("auto_orbit");d&&(d.checked=this._config.auto_orbit!==!1);const i=this.shadowRoot.getElementById("show_weather");i&&(i.checked=this._config.show_weather!==!1);const a=this.shadowRoot.getElementById("show_daynight");a&&(a.checked=this._config.show_daynight!==!1);const r=this.shadowRoot.getElementById("min_brightness");r&&(r.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const c=this.shadowRoot.getElementById("elevation_scale");c&&(c.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const g=this.shadowRoot.getElementById("show_3d_features");g&&(g.checked=this._config.show_3d_features===!0);const u=this.shadowRoot.getElementById("playback_speed");u&&(u.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
          <label for="zoom_level">Default Zoom Radius (10-150)</label>
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(s=>{s.addEventListener("change",e=>this.toggleChanged(e))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(s=>{s.addEventListener("input",e=>this.textChanged(e))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",s=>{const e=s.detail&&s.detail.value!=null?s.detail.value:null;this._onEntityPicked(e)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const s=t.target;this.dispatchConfigChange(s.id,s.checked)}textChanged(t){if(!this._config)return;const s=t.target;let e=s.value;if(s.id==="zoom_level"||s.id==="min_brightness"||s.id==="elevation_scale"||s.id==="playback_speed"){const n=parseFloat(e);isNaN(n)||(e=n)}this.dispatchConfigChange(s.id,e)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=e=>e.attributes&&Array.isArray(e.attributes.stations)&&e.attributes.icon==="mdi:lightning-bolt";const s=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==s&&(t.value=s)}_onEntityPicked(t){let s;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(s=t.slice(7,-9));const e={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:s||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}dispatchConfigChange(t,s){if(this._config[t]===s)return;const e={...this._config,[t]:s},n=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(n)}}customElements.define("weatherflow-lightning-card-editor",N);export{};
