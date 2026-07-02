/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const s=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,...t},this.container){const i=this.config.height;if(i.endsWith("px")){const n=parseInt(i);this.container.style.height=`${n-40}px`}else this.container.style.height=i}this.initialized&&this.applyConfigChanges(s||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const s=parseFloat(this.config.zoom_level);isNaN(s)||(this.zoomRadius=s,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&(this.terrainMesh.material.map&&this.terrainMesh.material.map.dispose(),this.terrainMesh.material.dispose())),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(i=>i.dispose()):s.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(10,Math.min(150,this.zoomRadius));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),s=this.zoomRadius*Math.cos(this.cameraPhi),i=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(t,s,i),this.camera.lookAt(0,0,0))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const e=parseInt(t);this.container.style.height=`${e-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const s=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,s,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.atan2(30,15),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const i=document.createElement("style");i.textContent=`
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
    `,this.container.appendChild(i),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const n=e=>e.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(e=>{this.weatherOverlay.addEventListener(e,n)}),this.weatherOverlay.addEventListener("click",e=>{(e.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(e.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let h=!1,r={x:0,y:0};this.container.addEventListener("mousedown",e=>{this.lastInteractionTime=Date.now(),h=!0,this.container.style.cursor="grabbing",r={x:e.clientX,y:e.clientY}}),this.container.addEventListener("mousemove",e=>{if(this.lastInteractionTime=Date.now(),h){const a=e.clientX-r.x,l=e.clientY-r.y;this.cameraTheta-=a*.005,this.cameraPhi+=l*.005,this.updateCameraPosition(),r={x:e.clientX,y:e.clientY}}else{const a=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-a.left)/a.width*2-1,this.mouse.y=-((e.clientY-a.top)/a.height)*2+1,this.checkHover(e.clientX-a.left,e.clientY-a.top)}}),this._mouseupHandler=()=>{h=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",e=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),e.preventDefault(),this.zoomRadius+=e.deltaY*.02,this.updateCameraPosition()},{passive:!1});let c=0;this.container.addEventListener("touchstart",e=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),e.touches.length===1?(h=!0,r={x:e.touches[0].clientX,y:e.touches[0].clientY}):e.touches.length===2&&(h=!1,c=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))}),this.container.addEventListener("touchmove",e=>{if(this.lastInteractionTime=Date.now(),e.preventDefault(),e.touches.length===1&&h){const a=e.touches[0].clientX-r.x,l=e.touches[0].clientY-r.y;this.cameraTheta-=a*.007,this.cameraPhi+=l*.007,this.updateCameraPosition(),r={x:e.touches[0].clientX,y:e.touches[0].clientY}}else if(e.touches.length===2){const a=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),l=a-c;this.zoomRadius-=l*.15,this.updateCameraPosition(),c=a}},{passive:!1}),this.container.addEventListener("touchend",()=>{h=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const e=this.container.clientWidth,a=this.container.clientHeight;this.camera.aspect=e/a,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,a)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),i=s.createRadialGradient(32,32,0,32,32,32);return i.addColorStop(0,"rgba(0, 242, 254, 1.0)"),i.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),i.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),i.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=i,s.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const s=document.createElement("canvas");s.width=128,s.height=64;const i=s.getContext("2d");i.fillStyle="rgba(0, 0, 0, 0)",i.fillRect(0,0,128,64),i.font="bold 24px sans-serif",i.fillStyle="#00f2fe",i.textAlign="center",i.textBaseline="middle",i.fillText(t,64,32);const n=new THREE.CanvasTexture(s),o=new THREE.SpriteMaterial({map:n,transparent:!0,depthWrite:!1,depthTest:!0}),h=new THREE.Sprite(o);return h.scale.set(2,1,1),h}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(a=>{const l=[];for(let m=0;m<=128;m++){const f=m/128*Math.PI*2,u=a*Math.cos(f),v=a*Math.sin(f);l.push(new THREE.Vector3(u,.05,v))}const p=new THREE.BufferGeometry().setFromPoints(l),g=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5}),y=new THREE.Line(p,g);this.rangeRingsGroup.add(y)});const s=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3}),i=[],n=40;for(let a=0;a<=n;a++){const l=-30+a/n*60;i.push(new THREE.Vector3(0,.05,l))}const o=new THREE.BufferGeometry().setFromPoints(i),h=new THREE.Line(o,s);this.rangeRingsGroup.add(h);const r=[];for(let a=0;a<=n;a++){const l=-30+a/n*60;r.push(new THREE.Vector3(l,.05,0))}const c=new THREE.BufferGeometry().setFromPoints(r),e=new THREE.Line(c,s);this.rangeRingsGroup.add(e),this.ringLabels=[],t.forEach(a=>{const l=this.createRingLabelSprite(`${a}km`);l.position.set(.8,.5,-a),this.rangeRingsGroup.add(l),this.ringLabels.push({sprite:l,r:a})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((o,h)=>{const r=t[h];if(r){const c=r.geometry.attributes.position,e=128;for(let a=0;a<=e;a++){const l=a/e*Math.PI*2,d=o*Math.cos(l),p=o*Math.sin(l),g=this.getTerrainHeight(d,p)+.1;c.setY(a,g)}c.needsUpdate=!0}});const i=t[3];if(i){const o=i.geometry.attributes.position,h=40;for(let r=0;r<=h;r++){const c=-30+r/h*60,e=this.getTerrainHeight(0,c)+.1;o.setXYZ(r,0,e,c)}o.needsUpdate=!0}const n=t[4];if(n){const o=n.geometry.attributes.position,h=40;for(let r=0;r<=h;r++){const c=-30+r/h*60,e=this.getTerrainHeight(c,0)+.1;o.setXYZ(r,c,e,0)}o.needsUpdate=!0}this.ringLabels&&this.ringLabels.forEach(o=>{const r=-o.r,c=this.getTerrainHeight(.8,r)+.4;o.sprite.position.set(.8,c,r)})}getTerrainHeight(t,s){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const i=(t+20)*14/40,n=(s+20)*14/40;if(i<0||i>14||n<0||n>14)return 0;const o=Math.floor(i),h=Math.min(14,o+1),r=Math.floor(n),c=Math.min(14,r+1),e=i-o,a=n-r,l=this.getGridHeight(r,o),d=this.getGridHeight(r,h),p=this.getGridHeight(c,o),g=this.getGridHeight(c,h),y=l*(1-e)+d*e,m=p*(1-e)+g*e;return y*(1-a)+m*a}getGridHeight(t,s){return this.scaledHeights?this.scaledHeights[(14-t)*15+s]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let o=0;o<15;o++){const h=o-7;for(let r=0;r<15;r++){const c=r-7,e=Math.sqrt(h*h+c*c);let a=80+Math.sin(h*.4)*Math.cos(c*.4)*45;if(a+=Math.sin(e*.8)*15,o===7&&r===7)a=100;else{const l=Math.min(1,e/3);a=100*(1-l)+a*l}this.elevationGrid.push(a)}}const t=100,i=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let o=0;o<225;o++)this.scaledHeights[o]=((this.elevationGrid[o]||0)-t)*i;const n=this.terrainGeo.attributes.position;for(let o=0;o<=14;o++){const h=14-o;for(let r=0;r<=14;r++){const c=r,e=o*15+r,a=this.scaledHeights[h*15+c];n.setZ(e,a)}}n.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,s){if(this.config.show_map===!1){this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0);return}const i=10,n=40,o=n/111.1,h=Math.cos(t*Math.PI/180),r=h>0?n/(111.1*h):n/111.1,c=t-o/2,e=t+o/2,a=s-r/2,l=s+r/2,d=(w,b)=>(w+180)/360*Math.pow(2,b),p=(w,b)=>(1-Math.log(Math.tan(w*Math.PI/180)+1/Math.cos(w*Math.PI/180))/Math.PI)/2*Math.pow(2,b),g=(w,b)=>w/Math.pow(2,b)*360-180,y=(w,b)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*w/Math.pow(2,b)))*180/Math.PI,m=Math.floor(d(a,i)),f=Math.floor(d(l,i)),u=Math.floor(p(e,i)),v=Math.floor(p(c,i)),E=document.createElement("canvas");E.width=1024,E.height=1024;const x=E.getContext("2d");x.fillStyle="#050b14",x.fillRect(0,0,1024,1024);const M=[];for(let w=m;w<=f;w++)for(let b=u;b<=v;b++){const L=g(w,i),P=g(w+1,i),C=y(b+1,i),S=y(b,i),_=(L-a)/(l-a),I=(P-a)/(l-a),z=(C-c)/(e-c),R=(S-c)/(e-c),G=_*1024,F=(1-R)*1024,D=(I-_)*1024,B=(R-z)*1024,W=`https://basemaps.cartocdn.com/dark_all/${i}/${w}/${b}.png`,A=new Promise(H=>{const T=new Image;T.crossOrigin="anonymous",T.onload=()=>{x.drawImage(T,G,F,D,B),H()},T.onerror=()=>H(),T.src=W});M.push(A)}Promise.all(M).then(()=>{const w=new THREE.CanvasTexture(E);this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=w,this.terrainMesh.material.color.setHex(16777215),this.terrainMesh.material.needsUpdate=!0)})}async loadVectorData(t,s){this.vectorDataLoading=!0;try{const i=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(i,t,s),this.vectorDataLoaded=!0}catch(i){console.error("Failed to load 3D vector features:",i)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,s,i){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(h=>{h.geometry&&h.geometry.dispose(),h.material&&(Array.isArray(h.material)?h.material.forEach(r=>r.dispose()):h.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const n=6371,o=Math.cos(s*Math.PI/180);if(t.water&&Array.isArray(t.water)){const h=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(r=>{if(!r.coordinates||r.coordinates.length<3)return;const c=[];let e=0,a=0;if(r.coordinates.forEach(g=>{const y=g[0],m=g[1],f=n*(m-i)*(Math.PI/180)*o,u=-n*(y-s)*(Math.PI/180);f<-20||f>20||u<-20||u>20||(c.push(new THREE.Vector2(f,-u)),e+=this.getTerrainHeight(f,u),a++)}),c.length<3)return;e/=a;const l=new THREE.Shape(c),d=new THREE.ShapeGeometry(l),p=new THREE.Mesh(d,h);p.rotation.x=-Math.PI/2,p.position.y=e+.08,this.features3DGroup.add(p)})}if(t.forest&&Array.isArray(t.forest)){const h=[];if(t.forest.forEach(r=>{!r.coordinates||r.coordinates.length<3||r.coordinates.forEach((c,e)=>{if(e%4!==0)return;const a=c[0],l=c[1],d=n*(l-i)*(Math.PI/180)*o,p=-n*(a-s)*(Math.PI/180);if(d<-19.5||d>19.5||p<-19.5||p>19.5)return;const g=this.getTerrainHeight(d,p);h.push(new THREE.Vector3(d,g,p))})}),h.length>0){const r=new THREE.ConeGeometry(.12,.45,4);r.translate(0,.225,0);const c=new THREE.MeshPhongMaterial({color:1467700,flatShading:!0}),e=new THREE.InstancedMesh(r,c,h.length),a=new THREE.Object3D;h.forEach((l,d)=>{a.position.copy(l);const p=.8+Math.random()*.4;a.scale.set(p,p,p),a.updateMatrix(),e.setMatrixAt(d,a.matrix)}),e.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(e)}}}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const s=7*15+7,i=t[s]||0,o=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let r=0;r<225;r++)this.scaledHeights[r]=((t[r]||0)-i)*o;const h=this.terrainGeo.attributes.position;for(let r=0;r<=14;r++){const c=14-r;for(let e=0;e<=14;e++){const a=e,l=r*15+e,d=this.scaledHeights[c*15+a];h.setZ(l,d)}}h.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,s)=>{const i=this.stationMeshes[s];if(i&&i.mesh){const n=this.getTerrainHeight(t.x,t.z);i.mesh.position.y=n}})}showTooltip(t,s,i){if(!this.tooltip)return;let n="Discovered Station";t.type==="primary"?n="Primary Station":t.type==="neighbor"&&(n="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${n}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const o=this.container.getBoundingClientRect();let h=s+15,r=i+15;h+150>o.width&&(h=s-165),r+60>o.height&&(r=i-75),this.tooltip.style.left=`${h}px`,this.tooltip.style.top=`${r}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,s){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const i=this.raycaster.intersectObjects(this.stationMeshes.map(n=>n.mesh),!0);if(i.length>0){let n=i[0].object;for(;n&&n.parent&&(!n.userData||!n.userData.station);)n=n.parent;if(n&&n.userData&&n.userData.station){const o=n.userData.station;this.showTooltip(o,t,s),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,s=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const i=new Set;for(let n=0;n<this.strikeHistory.length;n++){const o=this.strikeHistory[n],h=s-o.time;if(h>=0&&h<=t){i.add(o.id);const r=h/t,c=.7*(1-r),e=1-r*.4;let a=this.heatmapMeshes.get(o.id);if(a)a.material.opacity=c,a.mesh.scale.set(e,e,e),a.mesh.position.y=this.getTerrainHeight(o.x,o.z);else{const l=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:c,depthWrite:!1}),d=new THREE.Mesh(this.heatGeo,l),p=this.getTerrainHeight(o.x,o.z);d.position.set(o.x,p,o.z),d.scale.set(e,e,e),this.scene.add(d),a={mesh:d,material:l},this.heatmapMeshes.set(o.id,a)}}}for(const[n,o]of this.heatmapMeshes.entries())i.has(n)||(this.scene.remove(o.mesh),o.material&&o.material.dispose(),this.heatmapMeshes.delete(n))}addStaticElements(){this.ambientLight=new THREE.AmbientLight(988970,1.5),this.scene.add(this.ambientLight),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const t=new THREE.BufferGeometry,s=500,i=new Float32Array(s*3);for(let c=0;c<s*3;c+=3){const e=100+Math.random()*50,a=Math.random(),l=Math.random(),d=a*2*Math.PI,p=Math.acos(2*l-1);i[c]=e*Math.sin(p)*Math.cos(d),i[c+1]=e*Math.sin(p)*Math.sin(d),i[c+2]=e*Math.cos(p)}t.setAttribute("position",new THREE.BufferAttribute(i,3));const n=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(t,n),this.scene.add(this.starField);const o=40;this.terrainGeo=new THREE.PlaneGeometry(o,o,14,14);const h=new THREE.MeshPhongMaterial({color:330516,emissive:66826,specular:1121838,shininess:30,flatShading:!0,side:THREE.DoubleSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,h),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const r=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,r),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const s=new THREE.Group,i=this.getTerrainHeight(t.x,t.z);s.position.set(t.x,i,t.z),s.userData={station:t};const n=new THREE.RingGeometry(.8,1,32),o=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),h=new THREE.Mesh(n,o);h.rotation.x=-Math.PI/2,h.position.y=.02,s.add(h);const r=new THREE.CylinderGeometry(.08,.08,2.5,8),c=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),e=new THREE.Mesh(r,c);e.position.y=1.25,s.add(e);const a=new THREE.SphereGeometry(.25,16,16),l=new THREE.MeshBasicMaterial({color:t.color}),d=new THREE.Mesh(a,l);d.position.y=2.5,s.add(d),this.scene.add(s),this.stationMeshes.push({mesh:s,pulseVal:Math.random()*Math.PI})})}initWeatherSystem(){const s=new THREE.BufferGeometry,i=new Float32Array(800*3);for(let e=0;e<800*3;e+=3)i[e]=(Math.random()-.5)*40,i[e+1]=Math.random()*20,i[e+2]=(Math.random()-.5)*40;s.setAttribute("position",new THREE.BufferAttribute(i,3));const n=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(s,n),this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const o=300,h=new THREE.BufferGeometry,r=new Float32Array(o*3);for(let e=0;e<o*3;e+=3)r[e]=(Math.random()-.5)*40,r[e+1]=Math.random()*8,r[e+2]=(Math.random()-.5)*40;h.setAttribute("position",new THREE.BufferAttribute(r,3));const c=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(h,c),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),s=(this.rainRate||0).toFixed(1),i=this.windDirection||0;if(this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
    `}updateWeatherSystem(t){if(!this.initialized)return;const s=this.config.show_weather!==!1,i=s&&this.rainRate>0,n=s&&this.windSpeed>0,o=(this.windDirection||0)*Math.PI/180,h=Math.sin(o),r=Math.cos(o);if(this.rainParticles&&(this.rainParticles.visible=i,i)){const c=this.rainParticles.geometry.attributes.position,e=c.array,a=c.count,l=-h*(this.windSpeed||0)*.1,d=-r*(this.windSpeed||0)*.1,p=10+Math.min(20,this.rainRate*2);for(let g=0;g<a;g++){const y=g*3;let m=e[y],f=e[y+1],u=e[y+2];f-=p*t,m+=l*t,u+=d*t;const v=this.getTerrainHeight(m,u);(f<v||f<0)&&(f=20+Math.random()*2,m=(Math.random()-.5)*40,u=(Math.random()-.5)*40),e[y]=m,e[y+1]=f,e[y+2]=u}c.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=n,n)){const c=this.windParticles.geometry.attributes.position,e=c.array,a=c.count,l=-h*(this.windSpeed||0)*.5,d=-r*(this.windSpeed||0)*.5;for(let p=0;p<a;p++){const g=p*3;let y=e[g],m=e[g+1],f=e[g+2];y+=l*t,f+=d*t,m+=Math.sin(y*.5+f*.5)*.02,(y<-20||y>20||f<-20||f>20)&&(Math.abs(l)>Math.abs(d)?(y=l>0?-20:20,f=(Math.random()-.5)*40):(y=(Math.random()-.5)*40,f=d>0?-20:20),m=Math.random()*8),e[g]=y,e[g+1]=m,e[g+2]=f}c.needsUpdate=!0}}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(988970),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const o=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(o,1),this.scene.fog&&this.scene.fog.color.copy(o);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const o=this._hass.states["sun.sun"],h=o.attributes.elevation!==void 0?parseFloat(o.attributes.elevation):0;h>0?t=1:h<-6?t=0:t=(h+6)/6}else{const o=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,o/1e3))}if(this.ambientLight){const o=new THREE.Color(3359061),h=new THREE.Color(16777215);this.ambientLight.color.copy(o).lerp(h,t);const r=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=r+t*(1.5-r)}if(this.dirLight){this.dirLight.intensity=t*1.5;const o=t*Math.PI-Math.PI/2,h=15*Math.sin(o),r=15*Math.cos(o);this.dirLight.position.set(h,r,7);const e=new THREE.Color(16753920),a=new THREE.Color(16707722);this.dirLight.color.copy(e).lerp(a,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const s=new THREE.Color(132106),i=new THREE.Color(529189),n=s.clone().lerp(i,t);this.renderer&&this.renderer.setClearColor(n,1),this.scene.fog&&this.scene.fog.color.copy(n)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),s=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(s),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const i of this.heatmapMeshes.values())this.scene.remove(i.mesh),i.material&&i.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(i=>{i.pulseVal+=.04;const n=Math.sin(i.pulseVal),o=1+n*.1;i.mesh.children&&i.mesh.children[0]&&(i.mesh.children[0].scale.set(o,o,1),i.mesh.children[0].material.opacity=.5+n*.3)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",s=>this.handleSliderInput(s)),this.slider.addEventListener("change",()=>this.handleSliderChange())}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){if(this.strikeHistory.length===0){this.slider&&(this.slider.disabled=!0),this.timeLabel&&(this.timeLabel.innerText="No strikes");return}this.slider&&(this.slider.disabled=!1);const t=this.strikeHistory[0].time,s=Date.now();if(this.playbackMode==="live")this.playbackTime=s,this.slider&&(this.slider.min=t,this.slider.max=s,this.slider.value=s),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const i=Date.now(),n=i-(this.lastPlayTickTime||i);this.lastPlayTickTime=i,this.playbackTime+=n*this.playbackSpeed,this.playbackTime>=s?(this.playbackTime=s,this.setLiveMode()):(this.slider&&(this.slider.min=t,this.slider.max=s,this.slider.value=this.playbackTime),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t,this.slider.max=s),this.updateTimeLabel()}togglePlay(){if(this.playbackMode==="live")if(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.strikeHistory.length>0){const t=Date.now()-3e4;this.playbackTime=Math.max(this.strikeHistory[0].time,t),this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})}else this.playbackTime=Date.now();else this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now());this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){if(this.strikeHistory.length===0)return;const s=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),i=Math.round((Date.now()-this.playbackTime)/1e3);let n="";if(i<60)n=`-${i}s`;else{const o=Math.floor(i/60),h=i%60;n=`-${o}m ${h}s`}this.timeLabel&&(this.timeLabel.innerText=`${s} (${n})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(s=>{s.time<=this.playbackTime?s.animated=!0:s.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z)):t.animated=!1})}createLightningPath(t,s,i=10){const n=[],o=new THREE.Vector3().subVectors(s,t);n.push(t.clone());for(let h=1;h<i;h++){const r=h/i,c=new THREE.Vector3().addVectors(t,o.clone().multiplyScalar(r)),e=(1-r)*1;c.add(new THREE.Vector3((Math.random()-.5)*e,(Math.random()-.5)*e,(Math.random()-.5)*e)),n.push(c)}return n.push(s.clone()),n}createLightningBranches(t,s,i=8){const n=this.createLightningPath(t,s,i),o=[n];for(let h=1;h<n.length-2;h++)if(Math.random()<.25){const r=n[h].clone(),e=(1-h/n.length)*6,a=new THREE.Vector3().subVectors(s,t).normalize();a.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const l=new THREE.Vector3().addVectors(r,a.multiplyScalar(e)),d=this.createLightningPath(r,l,4);o.push(d)}return o}triggerStrikeAnimation(t,s){if(!this.initialized)return;const i=this.getTerrainHeight(t,s),n=new THREE.Vector3(t,i,s),o=new THREE.Vector3(t+(Math.random()-.5)*4,i+18,s+(Math.random()-.5)*4),h=[];this.createLightningBranches(o,n).forEach((f,u)=>{const E=new THREE.CatmullRomCurve3(f).getPoints(30),x=new THREE.BufferGeometry().setFromPoints(E),M=u===0,w=new THREE.LineBasicMaterial({color:M?16768768:16758528,transparent:!0,opacity:M?1:.7}),b=new THREE.Line(x,w);this.strikeLayer.add(b),h.push(b)});const c=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),e=new THREE.Sprite(c);e.position.copy(n),e.position.y+=.1,e.scale.set(.1,.1,1),this.strikeLayer.add(e);const a=new THREE.RingGeometry(.1,.2,32),l=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(a,l);d.position.copy(n),d.position.y+=.05,d.rotation.x=-Math.PI/2,this.strikeLayer.add(d);const p=[];this.stations.forEach(f=>{const u=this.getTerrainHeight(f.x,f.z),v=new THREE.Vector3(f.x,u,f.z),E=v.distanceTo(n),x=new THREE.RingGeometry(E-.08,E+.08,64),M=new THREE.MeshBasicMaterial({color:f.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),w=new THREE.Mesh(x,M);w.position.copy(v),w.position.y+=.05,w.rotation.x=-Math.PI/2,this.strikeLayer.add(w),p.push({mesh:w,targetOpacity:.5})});let g=0;const y=60,m=()=>{g++;const f=g/y;if(f<.2?h.forEach(u=>u.material.opacity=Math.random()>.3?1:.2):f<.5?h.forEach(u=>{u.material.opacity=1-(f-.2)/.3}):h.forEach(u=>{u.parent&&(this.strikeLayer.remove(u),u.geometry&&u.geometry.dispose(),u.material&&u.material.dispose())}),f<.6){const u=f*12;e.scale.set(u,u,1),e.material.opacity=1*(1-f/.6)}else e.parent&&(this.strikeLayer.remove(e),e.material.dispose());if(f<.8){const u=1+f*25;d.scale.set(u,u,1),d.material.opacity=.8*(1-f/.8)}else d.parent&&(this.strikeLayer.remove(d),d.geometry&&d.geometry.dispose(),d.material&&d.material.dispose());p.forEach(u=>{f<.3?u.mesh.material.opacity=u.targetOpacity*(f/.3):f<.9?u.mesh.material.opacity=u.targetOpacity*(1-(f-.3)/.6):u.mesh.parent&&(this.strikeLayer.remove(u.mesh),u.mesh.geometry&&u.mesh.geometry.dispose(),u.mesh.material&&u.mesh.material.dispose())}),g<y&&requestAnimationFrame(m)};m()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const s=Object.keys(t.states).find(a=>a.startsWith("sensor.")&&a.endsWith("_stations")&&t.states[a].attributes.stations!==void 0&&t.states[a].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(a=>a.startsWith("sensor.")&&t.states[a].attributes.stations!==void 0);let i=t.config.latitude,n=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",i,n),s){const l=t.states[s].attributes.stations;if(Array.isArray(l)){const d=l.find(p=>p.type==="primary");if(d&&d.latitude!==void 0&&d.longitude!==void 0){const p=parseFloat(d.latitude),g=parseFloat(d.longitude);!isNaN(p)&&!isNaN(g)?(i=p,n=g,console.log("WeatherFlow Card: Resolved primary station coordinate:",i,n)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",d.latitude,d.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",l)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",l)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==i||this.lastRefLon!==n)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",i,n),this.lastRefLat=i,this.lastRefLon=n,this.loadMapTexture(i,n),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(i,n),s){const a=t.states[s].attributes.elevation_grid;a&&JSON.stringify(a)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(a);const l=t.states[s].attributes;this.windSpeed=l.wind_speed!==void 0?parseFloat(l.wind_speed):0,this.windDirection=l.wind_direction!==void 0?parseFloat(l.wind_direction):0,this.solarRadiation=l.solar_radiation!==void 0?parseFloat(l.solar_radiation):1e3,this.rainRate=l.rain_rate!==void 0?parseFloat(l.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay();const d=l.stations;if(Array.isArray(d)){let p=!1;if(this.stations.length!==d.length)p=!0;else for(let g=0;g<d.length;g++)if(!this.stations.find(m=>m.id===d[g].id)){p=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",p,"Current length:",this.stations.length,"New length:",d.length),p){const y=Math.cos(i*Math.PI/180);this.stations=d.map(m=>{const f=parseFloat(m.latitude),u=parseFloat(m.longitude),v=6371*(u-n)*(Math.PI/180)*y,E=-6371*(f-i)*(Math.PI/180);let x=6583435;return m.type==="primary"?x=1096065:m.type==="neighbor"&&(x=3718648),console.log("WeatherFlow Card: Mapped station:",m.id,"type:",m.type,"lat:",f,"lon:",u,"to grid coords:",v,E),{id:m.id,x:v,z:E,color:x,type:m.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(m=>{this.scene.remove(m.mesh)})),this.addWeatherStations()}}}const o="weatherflow_lightning_trilateration",h=Object.keys(t.states).filter(a=>a.startsWith("geo_location.")&&t.states[a].attributes.source===o),r=6371,c=Math.cos(i*Math.PI/180),e=[];h.forEach(a=>{const l=t.states[a],d=parseFloat(l.attributes.latitude),p=parseFloat(l.attributes.longitude);if(!isNaN(d)&&!isNaN(p)){const g=r*(p-n)*(Math.PI/180)*c,y=-r*(d-i)*(Math.PI/180),m=new Date(l.last_changed).getTime();e.push({id:a,time:m,x:g,z:y})}}),e.sort((a,l)=>a.time-l.time),e.forEach(a=>{if(!this.strikeHistory.some(l=>l.id===a.id)){const l=!this.knownStrikes.has(a.id);l&&this.knownStrikes.add(a.id);const d=this.playbackMode==="live"&&l;this.strikeHistory.push({id:a.id,time:a.time,x:a.x,z:a.z,animated:d||this.playbackMode!=="live"&&a.time<=this.playbackTime}),d&&this.triggerStrikeAnimation(a.x,a.z)}}),this.strikeHistory=this.strikeHistory.filter(a=>e.some(l=>l.id===a.id)),this.strikeHistory.sort((a,l)=>a.time-l.time);for(const a of this.knownStrikes)t.states[a]||this.knownStrikes.delete(a)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",N),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class O extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const s=this.shadowRoot.getElementById("height");s&&(s.value=this._config.height||"350px");const i=this.shadowRoot.getElementById("zoom_level");i&&(i.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const n=this.shadowRoot.getElementById("show_grid");n&&(n.checked=this._config.show_grid!==!1);const o=this.shadowRoot.getElementById("show_map");o&&(o.checked=this._config.show_map!==!1);const h=this.shadowRoot.getElementById("show_rings");h&&(h.checked=this._config.show_rings!==!1);const r=this.shadowRoot.getElementById("show_heatmap");r&&(r.checked=this._config.show_heatmap!==!1);const c=this.shadowRoot.getElementById("auto_orbit");c&&(c.checked=this._config.auto_orbit!==!1);const e=this.shadowRoot.getElementById("show_weather");e&&(e.checked=this._config.show_weather!==!1);const a=this.shadowRoot.getElementById("show_daynight");a&&(a.checked=this._config.show_daynight!==!1);const l=this.shadowRoot.getElementById("min_brightness");l&&(l.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const d=this.shadowRoot.getElementById("elevation_scale");d&&(d.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const p=this.shadowRoot.getElementById("show_3d_features");p&&(p.checked=this._config.show_3d_features===!0),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(s=>{s.addEventListener("change",i=>this.toggleChanged(i))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(s=>{s.addEventListener("input",i=>this.textChanged(i))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",s=>{const i=s.detail&&s.detail.value!=null?s.detail.value:null;this._onEntityPicked(i)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const s=t.target;this.dispatchConfigChange(s.id,s.checked)}textChanged(t){if(!this._config)return;const s=t.target;let i=s.value;if(s.id==="zoom_level"||s.id==="min_brightness"||s.id==="elevation_scale"){const n=parseFloat(i);isNaN(n)||(i=n)}this.dispatchConfigChange(s.id,i)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=i=>i.attributes&&Array.isArray(i.attributes.stations)&&i.attributes.icon==="mdi:lightning-bolt";const s=this._config&&this._config.entity_id?this._config.entity_id:null;t.value!==s&&(t.value=s)}_onEntityPicked(t){let s;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(s=t.slice(7,-9));const i={...this._config,entity_id:t||void 0,entry_id:s||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}dispatchConfigChange(t,s){if(this._config[t]===s)return;const i={...this._config,[t]:s},n=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(n)}}customElements.define("weatherflow-lightning-card-editor",O);export{};
