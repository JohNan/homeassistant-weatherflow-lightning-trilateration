/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class O extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const s=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const i=this.config.height;if(i.endsWith("px")){const a=parseInt(i);this.container.style.height=`${a-40}px`}else this.container.style.height=i}this.initialized&&this.applyConfigChanges(s||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const s=parseFloat(this.config.zoom_level);isNaN(s)||(this.zoomRadius=s,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(i=>i.dispose()):s.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(10,Math.min(150,this.zoomRadius));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),s=this.zoomRadius*Math.cos(this.cameraPhi),i=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(t,s,i),this.camera.lookAt(0,0,0))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const e=parseInt(t);this.container.style.height=`${e-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const s=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,s,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const i=document.createElement("style");i.textContent=`
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
    `,this.container.appendChild(i),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const a=e=>e.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(e=>{this.weatherOverlay.addEventListener(e,a)}),this.weatherOverlay.addEventListener("click",e=>{(e.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(e.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let l=!1,o={x:0,y:0};this.container.addEventListener("mousedown",e=>{this.lastInteractionTime=Date.now(),l=!0,this.container.style.cursor="grabbing",o={x:e.clientX,y:e.clientY}}),this.container.addEventListener("mousemove",e=>{if(this.lastInteractionTime=Date.now(),l){const n=e.clientX-o.x,r=e.clientY-o.y;this.cameraTheta-=n*.005,this.cameraPhi+=r*.005,this.updateCameraPosition(),o={x:e.clientX,y:e.clientY}}else{const n=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-n.left)/n.width*2-1,this.mouse.y=-((e.clientY-n.top)/n.height)*2+1,this.checkHover(e.clientX-n.left,e.clientY-n.top)}}),this._mouseupHandler=()=>{l=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",e=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),e.preventDefault(),this.zoomRadius+=e.deltaY*.02,this.updateCameraPosition()},{passive:!1});let c=0;this.container.addEventListener("touchstart",e=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),e.touches.length===1?(l=!0,o={x:e.touches[0].clientX,y:e.touches[0].clientY}):e.touches.length===2&&(l=!1,c=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))}),this.container.addEventListener("touchmove",e=>{if(this.lastInteractionTime=Date.now(),e.preventDefault(),e.touches.length===1&&l){const n=e.touches[0].clientX-o.x,r=e.touches[0].clientY-o.y;this.cameraTheta-=n*.007,this.cameraPhi+=r*.007,this.updateCameraPosition(),o={x:e.touches[0].clientX,y:e.touches[0].clientY}}else if(e.touches.length===2){const n=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),r=n-c;this.zoomRadius-=r*.15,this.updateCameraPosition(),c=n}},{passive:!1}),this.container.addEventListener("touchend",()=>{l=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const e=this.container.clientWidth,n=this.container.clientHeight;this.camera.aspect=e/n,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,n)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),i=s.createRadialGradient(32,32,0,32,32,32);return i.addColorStop(0,"rgba(0, 242, 254, 1.0)"),i.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),i.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),i.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=i,s.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const s=document.createElement("canvas");s.width=128,s.height=64;const i=s.getContext("2d");i.fillStyle="rgba(0, 0, 0, 0)",i.fillRect(0,0,128,64),i.font="bold 24px sans-serif",i.fillStyle="#00f2fe",i.textAlign="center",i.textBaseline="middle",i.fillText(t,64,32);const a=new THREE.CanvasTexture(s),h=new THREE.SpriteMaterial({map:a,transparent:!0,depthWrite:!1,depthTest:!0}),l=new THREE.Sprite(h);return l.scale.set(2,1,1),l}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(r=>{const d=[];for(let f=0;f<=128;f++){const p=f/128*Math.PI*2,b=r*Math.cos(p),v=r*Math.sin(p);d.push(new THREE.Vector3(b,.05,v))}const u=new THREE.BufferGeometry().setFromPoints(d),m=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5}),y=new THREE.Line(u,m);this.rangeRingsGroup.add(y)});const s=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3}),i=[],a=40;for(let r=0;r<=a;r++){const d=-30+r/a*60;i.push(new THREE.Vector3(0,.05,d))}const h=new THREE.BufferGeometry().setFromPoints(i),l=new THREE.Line(h,s);this.rangeRingsGroup.add(l);const o=[];for(let r=0;r<=a;r++){const d=-30+r/a*60;o.push(new THREE.Vector3(d,.05,0))}const c=new THREE.BufferGeometry().setFromPoints(o),e=new THREE.Line(c,s);this.rangeRingsGroup.add(e);const n=Math.SQRT2/2;this.ringLabels=[],t.forEach(r=>{const d=this.createRingLabelSprite(`${r}km`);d.position.set(r*n,.5,-r*n),this.rangeRingsGroup.add(d),this.ringLabels.push({sprite:d,r})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((l,o)=>{const c=t[o];if(c){const e=c.geometry.attributes.position,n=128;for(let r=0;r<=n;r++){const d=r/n*Math.PI*2,g=l*Math.cos(d),u=l*Math.sin(d),m=this.getTerrainHeight(g,u)+.1;e.setY(r,m)}e.needsUpdate=!0}});const i=t[3];if(i){const l=i.geometry.attributes.position,o=40;for(let c=0;c<=o;c++){const e=-30+c/o*60,n=this.getTerrainHeight(0,e)+.1;l.setXYZ(c,0,n,e)}l.needsUpdate=!0}const a=t[4];if(a){const l=a.geometry.attributes.position,o=40;for(let c=0;c<=o;c++){const e=-30+c/o*60,n=this.getTerrainHeight(e,0)+.1;l.setXYZ(c,e,n,0)}l.needsUpdate=!0}const h=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(l=>{const o=l.r*h,c=-l.r*h,e=this.getTerrainHeight(o,c)+.4;l.sprite.position.set(o,e,c)})}getTerrainHeight(t,s){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const i=(t+20)*14/40,a=(s+20)*14/40;if(i<0||i>14||a<0||a>14)return 0;const h=Math.floor(i),l=Math.min(14,h+1),o=Math.floor(a),c=Math.min(14,o+1),e=i-h,n=a-o,r=this.getGridHeight(o,h),d=this.getGridHeight(o,l),g=this.getGridHeight(c,h),u=this.getGridHeight(c,l),m=r*(1-e)+d*e,y=g*(1-e)+u*e;return m*(1-n)+y*n}getGridHeight(t,s){return this.scaledHeights?this.scaledHeights[(14-t)*15+s]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let h=0;h<15;h++){const l=h-7;for(let o=0;o<15;o++){const c=o-7,e=Math.sqrt(l*l+c*c);let n=80+Math.sin(l*.4)*Math.cos(c*.4)*45;if(n+=Math.sin(e*.8)*15,h===7&&o===7)n=100;else{const r=Math.min(1,e/3);n=100*(1-r)+n*r}this.elevationGrid.push(n)}}const t=100,i=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let h=0;h<225;h++)this.scaledHeights[h]=((this.elevationGrid[h]||0)-t)*i;const a=this.terrainGeo.attributes.position;for(let h=0;h<=14;h++){const l=14-h;for(let o=0;o<=14;o++){const c=o,e=h*15+o,n=this.scaledHeights[l*15+c];a.setZ(e,n)}}a.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,s){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const i=10,a=40,h=a/111.1,l=Math.cos(t*Math.PI/180),o=l>0?a/(111.1*l):a/111.1,c=t-h/2,e=t+h/2,n=s-o/2,r=s+o/2,d=(w,E)=>(w+180)/360*Math.pow(2,E),g=(w,E)=>(1-Math.log(Math.tan(w*Math.PI/180)+1/Math.cos(w*Math.PI/180))/Math.PI)/2*Math.pow(2,E),u=(w,E)=>w/Math.pow(2,E)*360-180,m=(w,E)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*w/Math.pow(2,E)))*180/Math.PI,y=Math.floor(d(n,i)),f=Math.floor(d(r,i)),p=Math.floor(g(e,i)),b=Math.floor(g(c,i)),v=document.createElement("canvas");v.width=1024,v.height=1024;const M=v.getContext("2d");M.fillStyle="#050b14",M.fillRect(0,0,1024,1024);const x=[];for(let w=y;w<=f;w++)for(let E=p;E<=b;E++){const L=u(w,i),S=u(w+1,i),P=m(E+1,i),C=m(E,i),_=(L-n)/(r-n),G=(S-n)/(r-n),I=(P-c)/(e-c),R=(C-c)/(e-c),z=_*1024,D=(1-R)*1024,F=(G-_)*1024,B=(R-I)*1024,A=`https://basemaps.cartocdn.com/dark_all/${i}/${w}/${E}.png`,W=new Promise(H=>{const T=new Image;T.crossOrigin="anonymous",T.onload=()=>{M.drawImage(T,z,D,F,B),H()},T.onerror=()=>H(),T.src=A});x.push(W)}Promise.all(x).then(()=>{const w=new THREE.CanvasTexture(v);this.terrainMapMesh&&this.terrainMapMesh.material&&(this.terrainMapMesh.material.map=w,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0)})}async loadVectorData(t,s){this.vectorDataLoading=!0;try{const i=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(i,t,s),this.vectorDataLoaded=!0}catch(i){console.error("Failed to load 3D vector features:",i)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,s,i){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(l=>{l.geometry&&l.geometry.dispose(),l.material&&(Array.isArray(l.material)?l.material.forEach(o=>o.dispose()):l.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const a=6371,h=Math.cos(s*Math.PI/180);if(t.water&&Array.isArray(t.water)){const l=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(o=>{if(!o.coordinates||o.coordinates.length<3)return;const c=[];let e=0,n=0;if(o.coordinates.forEach(u=>{const m=u[0],y=u[1],f=a*(y-i)*(Math.PI/180)*h,p=-a*(m-s)*(Math.PI/180);f<-20||f>20||p<-20||p>20||(c.push(new THREE.Vector2(f,-p)),e+=this.getTerrainHeight(f,p),n++)}),c.length<3)return;e/=n;const r=new THREE.Shape(c),d=new THREE.ShapeGeometry(r),g=new THREE.Mesh(d,l);g.rotation.x=-Math.PI/2,g.position.y=e+.08,this.features3DGroup.add(g)})}if(t.forest&&Array.isArray(t.forest)){const l=[];if(t.forest.forEach(o=>{!o.coordinates||o.coordinates.length<3||o.coordinates.forEach((c,e)=>{if(e%4!==0)return;const n=c[0],r=c[1],d=a*(r-i)*(Math.PI/180)*h,g=-a*(n-s)*(Math.PI/180);if(d<-19.5||d>19.5||g<-19.5||g>19.5)return;const u=this.getTerrainHeight(d,g);l.push(new THREE.Vector3(d,u,g))})}),l.length>0){const o=new THREE.ConeGeometry(.12,.45,4);o.translate(0,.225,0);const c=new THREE.MeshPhongMaterial({color:1467700,flatShading:!0}),e=new THREE.InstancedMesh(o,c,l.length),n=new THREE.Object3D;l.forEach((r,d)=>{n.position.copy(r);const g=.8+Math.random()*.4;n.scale.set(g,g,g),n.updateMatrix(),e.setMatrixAt(d,n.matrix)}),e.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(e)}}}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,s=-1/0;for(let o=0;o<225;o++)this.scaledHeights[o]<t&&(t=this.scaledHeights[o]),this.scaledHeights[o]>s&&(s=this.scaledHeights[o]);const i=s-t||1,a=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],h=o=>{let c=a[0],e=a[a.length-1];for(let r=0;r<a.length-1;r++)if(o>=a[r].t&&o<=a[r+1].t){c=a[r],e=a[r+1];break}const n=e.t===c.t?0:(o-c.t)/(e.t-c.t);return{r:c.r+(e.r-c.r)*n,g:c.g+(e.g-c.g)*n,b:c.b+(e.b-c.b)*n}},l=this.terrainGeo.attributes.color;for(let o=0;o<=14;o++){const c=14-o;for(let e=0;e<=14;e++){const r=(this.scaledHeights[c*15+e]-t)/i,d=h(Math.max(0,Math.min(1,r))),g=o*15+e;l.setXYZ(g,d.r,d.g,d.b)}}l.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const s=7*15+7,i=t[s]||0,h=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let o=0;o<225;o++)this.scaledHeights[o]=((t[o]||0)-i)*h;const l=this.terrainGeo.attributes.position;for(let o=0;o<=14;o++){const c=14-o;for(let e=0;e<=14;e++){const n=e,r=o*15+e,d=this.scaledHeights[c*15+n];l.setZ(r,d)}}l.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,s)=>{const i=this.stationMeshes[s];if(i&&i.mesh){const a=this.getTerrainHeight(t.x,t.z);i.mesh.position.y=a}})}showTooltip(t,s,i){if(!this.tooltip)return;let a="Discovered Station";t.type==="primary"?a="Primary Station":t.type==="neighbor"&&(a="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${a}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const h=this.container.getBoundingClientRect();let l=s+15,o=i+15;l+150>h.width&&(l=s-165),o+60>h.height&&(o=i-75),this.tooltip.style.left=`${l}px`,this.tooltip.style.top=`${o}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,s){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const i=this.raycaster.intersectObjects(this.stationMeshes.map(a=>a.mesh),!0);if(i.length>0){let a=i[0].object;for(;a&&a.parent&&(!a.userData||!a.userData.station);)a=a.parent;if(a&&a.userData&&a.userData.station){const h=a.userData.station;this.showTooltip(h,t,s),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,s=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const i=new Set;for(let a=0;a<this.strikeHistory.length;a++){const h=this.strikeHistory[a],l=s-h.time;if(l>=0&&l<=t){i.add(h.id);const o=l/t,c=.7*(1-o),e=1-o*.4;let n=this.heatmapMeshes.get(h.id);if(n)n.material.opacity=c,n.mesh.scale.set(e,e,e),n.mesh.position.y=this.getTerrainHeight(h.x,h.z);else{const r=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:c,depthWrite:!1}),d=new THREE.Mesh(this.heatGeo,r),g=this.getTerrainHeight(h.x,h.z);d.position.set(h.x,g,h.z),d.scale.set(e,e,e),this.scene.add(d),n={mesh:d,material:r},this.heatmapMeshes.set(h.id,n)}}}for(const[a,h]of this.heatmapMeshes.entries())i.has(a)||(this.scene.remove(h.mesh),h.material&&h.material.dispose(),this.heatmapMeshes.delete(a))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),s=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,s),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const i=new THREE.BufferGeometry,a=500,h=new Float32Array(a*3);for(let u=0;u<a*3;u+=3){const m=100+Math.random()*50,y=Math.random(),f=Math.random(),p=y*2*Math.PI,b=Math.acos(2*f-1);h[u]=m*Math.sin(b)*Math.cos(p),h[u+1]=m*Math.sin(b)*Math.sin(p),h[u+2]=m*Math.cos(b)}i.setAttribute("position",new THREE.BufferAttribute(h,3));const l=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(i,l),this.scene.add(this.starField);const o=40,c=new THREE.PlaneGeometry(o,o),e=new THREE.MeshBasicMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(c,e),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.01,this.scene.add(this.terrainMapMesh),this.terrainGeo=new THREE.PlaneGeometry(o,o,14,14);const n=15*15,r=new Float32Array(n*3);r.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(r,3));const d=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,d),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const g=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,g),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const s=new THREE.Group,i=this.getTerrainHeight(t.x,t.z);s.position.set(t.x,i,t.z),s.userData={station:t};const a=new THREE.RingGeometry(.8,1,32),h=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),l=new THREE.Mesh(a,h);l.rotation.x=-Math.PI/2,l.position.y=.02,s.add(l);const o=new THREE.CylinderGeometry(.08,.08,2.5,8),c=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),e=new THREE.Mesh(o,c);e.position.y=1.25,s.add(e);const n=new THREE.SphereGeometry(.25,16,16),r=new THREE.MeshBasicMaterial({color:t.color}),d=new THREE.Mesh(n,r);d.position.y=2.5,s.add(d),this.scene.add(s),this.stationMeshes.push({mesh:s,pulseVal:Math.random()*Math.PI})})}initWeatherSystem(){const a=new THREE.BufferGeometry,h=new Float32Array(800*3);for(let r=0;r<800*3;r+=3)h[r]=(Math.random()-.5)*40,h[r+1]=18+Math.random()*4,h[r+2]=(Math.random()-.5)*40;a.setAttribute("position",new THREE.BufferAttribute(h,3));const l=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(a,l),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const o=300,c=new THREE.BufferGeometry,e=new Float32Array(o*3);for(let r=0;r<o*3;r+=3)e[r]=(Math.random()-.5)*40,e[r+1]=Math.random()*8,e[r+2]=(Math.random()-.5)*40;c.setAttribute("position",new THREE.BufferAttribute(e,3));const n=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(c,n),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),s=(this.rainRate||0).toFixed(1),i=this.windDirection||0;if(this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
    `}updateWeatherSystem(t){if(!this.initialized)return;const s=this.config.show_weather!==!1,i=s&&this.rainRate>0,a=s&&this.windSpeed>0,h=(this.windDirection||0)*Math.PI/180,l=Math.sin(h),o=Math.cos(h);if(this.rainParticles&&(this.rainParticles.visible=i,i)){const c=this.rainParticles.geometry.attributes.position,e=c.array,n=c.count,r=-l*(this.windSpeed||0)*.1,d=-o*(this.windSpeed||0)*.1,g=10+Math.min(20,this.rainRate*2);for(let u=0;u<n;u++){const m=u*3;let y=e[m],f=e[m+1],p=e[m+2];f-=g*t,y+=r*t,p+=d*t;const b=this.getTerrainHeight(y,p);(f<b||f<0)&&(f=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),y=(Math.random()-.5)*40,p=(Math.random()-.5)*40),e[m]=y,e[m+1]=f,e[m+2]=p}c.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=a,a)){const c=this.windParticles.geometry.attributes.position,e=c.array,n=c.count,r=-l*(this.windSpeed||0)*.5,d=-o*(this.windSpeed||0)*.5;for(let g=0;g<n;g++){const u=g*3;let m=e[u],y=e[u+1],f=e[u+2];m+=r*t,f+=d*t,y+=Math.sin(m*.5+f*.5)*.02,(m<-20||m>20||f<-20||f>20)&&(Math.abs(r)>Math.abs(d)?(m=r>0?-20:20,f=(Math.random()-.5)*40):(m=(Math.random()-.5)*40,f=d>0?-20:20),y=Math.random()*8),e[u]=m,e[u+1]=y,e[u+2]=f}c.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const s=this._skyCanvas.getContext("2d"),i=this._skyCanvas.height,a=s.createLinearGradient(0,0,0,i),h=[2,4,10],l=[14,42,90],o=Math.round(h[0]+(l[0]-h[0])*t),c=Math.round(h[1]+(l[1]-h[1])*t),e=Math.round(h[2]+(l[2]-h[2])*t),n=Math.sin(t*Math.PI),r=Math.round(o+60*n),d=Math.round(c+20*n),g=Math.round(e+10*n);a.addColorStop(0,`rgb(${o},${c},${e})`),a.addColorStop(1,`rgb(${Math.min(255,r)},${Math.min(255,d)},${Math.min(255,g)})`),s.fillStyle=a,s.fillRect(0,0,2,i),this._skyTexture.needsUpdate=!0}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const h=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(h,1),this.scene.fog&&this.scene.fog.color.copy(h),this._paintSkyGradient(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const h=this._hass.states["sun.sun"],l=h.attributes.elevation!==void 0?parseFloat(h.attributes.elevation):0;l>0?t=1:l<-6?t=0:t=(l+6)/6}else{const h=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,h/1e3))}if(this.ambientLight){const h=new THREE.Color(3359061),l=new THREE.Color(12573694),o=new THREE.Color(659744),c=new THREE.Color(1980958);this.ambientLight.color.copy(h).lerp(l,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(o).lerp(c,t);const e=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=e+t*(1.5-e)}if(this.dirLight){this.dirLight.intensity=t*1.5;const h=t*Math.PI-Math.PI/2,l=15*Math.sin(h),o=15*Math.cos(h);this.dirLight.position.set(l,o,7);const e=new THREE.Color(16753920),n=new THREE.Color(16707722);this.dirLight.color.copy(e).lerp(n,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const s=new THREE.Color(132106),i=new THREE.Color(529189),a=s.clone().lerp(i,t);if(this.renderer&&this.renderer.setClearColor(a,1),this.scene.fog){this.scene.fog.color.copy(a);const h=.008,l=.003,o=.01,c=Math.sin(t*Math.PI),e=h+(l-h)*t;this.scene.fog.density=e+(o-h)*c*.5}this._paintSkyGradient(t)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),s=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(s),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const i of this.heatmapMeshes.values())this.scene.remove(i.mesh),i.material&&i.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(i=>{i.pulseVal+=.04;const a=Math.sin(i.pulseVal),h=1+a*.1;i.mesh.children&&i.mesh.children[0]&&(i.mesh.children[0].scale.set(h,h,1),i.mesh.children[0].material.opacity=.5+a*.3)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const s=[1,5,10,30,60,120,300,600];s.includes(this.playbackSpeed)||(s.push(this.playbackSpeed),s.sort((i,a)=>i-a)),s.forEach(i=>{const a=document.createElement("option");a.value=i.toString(),a.innerText=`${i}x`,i===this.playbackSpeed&&(a.selected=!0),this.speedSelect.appendChild(a)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",i=>this.handleSliderInput(i)),this.slider.addEventListener("change",()=>this.handleSliderChange()),this.speedSelect.addEventListener("change",i=>{this.playbackSpeed=parseFloat(i.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5,s=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=s,this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=s.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const i=Date.now(),a=i-(this.lastPlayTickTime||i);this.lastPlayTickTime=i,this.playbackTime+=a*this.playbackSpeed,this.playbackTime>=s?(this.playbackTime=s,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const s=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),i=Math.round((Date.now()-this.playbackTime)/1e3);let a="";if(i<60)a=`-${i}s`;else{const h=Math.floor(i/60),l=i%60;a=`-${h}m ${l}s`}this.timeLabel&&(this.timeLabel.innerText=`${s} (${a})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(s=>{s.time<=this.playbackTime?s.animated=!0:s.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z)):t.animated=!1})}createLightningPath(t,s,i=10){const a=[],h=new THREE.Vector3().subVectors(s,t);a.push(t.clone());for(let l=1;l<i;l++){const o=l/i,c=new THREE.Vector3().addVectors(t,h.clone().multiplyScalar(o)),e=(1-o)*1;c.add(new THREE.Vector3((Math.random()-.5)*e,(Math.random()-.5)*e,(Math.random()-.5)*e)),a.push(c)}return a.push(s.clone()),a}createLightningBranches(t,s,i=8){const a=this.createLightningPath(t,s,i),h=[a];for(let l=1;l<a.length-2;l++)if(Math.random()<.25){const o=a[l].clone(),e=(1-l/a.length)*6,n=new THREE.Vector3().subVectors(s,t).normalize();n.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const r=new THREE.Vector3().addVectors(o,n.multiplyScalar(e)),d=this.createLightningPath(o,r,4);h.push(d)}return h}triggerStrikeAnimation(t,s){if(!this.initialized)return;const i=this.getTerrainHeight(t,s),a=new THREE.Vector3(t,i,s),h=new THREE.Vector3(t+(Math.random()-.5)*4,i+18,s+(Math.random()-.5)*4);if(this.ambientLight){const f=this.ambientLight.intensity;this.ambientLight.intensity=4;let p=0;const b=()=>{p++,this.ambientLight.intensity=Math.max(f,4*(1-p/8)),p<8&&requestAnimationFrame(b)};requestAnimationFrame(b)}const l=[];this.createLightningBranches(h,a).forEach((f,p)=>{const b=new THREE.CatmullRomCurve3(f),v=p===0,M=new THREE.TubeGeometry(b,Math.max(10,f.length*3),v?.06:.03,5,!1),x=new THREE.MeshStandardMaterial({color:v?16777215:16769126,emissive:v?16766720:16757504,emissiveIntensity:v?3:1.5,transparent:!0,opacity:v?1:.75,depthWrite:!1}),w=new THREE.Mesh(M,x);this.strikeLayer.add(w),l.push(w)});const c=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),e=new THREE.Sprite(c);e.position.copy(a),e.position.y+=.1,e.scale.set(.1,.1,1),this.strikeLayer.add(e);const n=new THREE.RingGeometry(.1,.2,32),r=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(n,r);d.position.copy(a),d.position.y+=.05,d.rotation.x=-Math.PI/2,this.strikeLayer.add(d);const g=[];this.stations.forEach(f=>{const p=this.getTerrainHeight(f.x,f.z),b=new THREE.Vector3(f.x,p,f.z),v=b.distanceTo(a),M=new THREE.RingGeometry(v-.08,v+.08,64),x=new THREE.MeshBasicMaterial({color:f.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),w=new THREE.Mesh(M,x);w.position.copy(b),w.position.y+=.05,w.rotation.x=-Math.PI/2,this.strikeLayer.add(w),g.push({mesh:w,targetOpacity:.5})});let u=0;const m=60,y=()=>{u++;const f=u/m;if(f<.2?l.forEach(p=>p.material.opacity=Math.random()>.3?1:.2):f<.5?l.forEach(p=>{p.material.opacity=1-(f-.2)/.3}):l.forEach(p=>{p.parent&&(this.strikeLayer.remove(p),p.geometry&&p.geometry.dispose(),p.material&&p.material.dispose())}),f<.6){const p=f*12;e.scale.set(p,p,1),e.material.opacity=1*(1-f/.6)}else e.parent&&(this.strikeLayer.remove(e),e.material.dispose());if(f<.8){const p=1+f*25;d.scale.set(p,p,1),d.material.opacity=.8*(1-f/.8)}else d.parent&&(this.strikeLayer.remove(d),d.geometry&&d.geometry.dispose(),d.material&&d.material.dispose());g.forEach(p=>{f<.3?p.mesh.material.opacity=p.targetOpacity*(f/.3):f<.9?p.mesh.material.opacity=p.targetOpacity*(1-(f-.3)/.6):p.mesh.parent&&(this.strikeLayer.remove(p.mesh),p.mesh.geometry&&p.mesh.geometry.dispose(),p.mesh.material&&p.mesh.material.dispose())}),u<m&&requestAnimationFrame(y)};y()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const s=this.config.entity||this.config.entity_id||Object.keys(t.states).find(n=>n.startsWith("sensor.")&&n.endsWith("_stations")&&t.states[n].attributes.stations!==void 0&&t.states[n].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(n=>n.startsWith("sensor.")&&t.states[n].attributes.stations!==void 0);let i=t.config.latitude,a=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",i,a),s){const r=t.states[s].attributes.stations;if(Array.isArray(r)){const d=r.find(g=>g.type==="primary");if(d&&d.latitude!==void 0&&d.longitude!==void 0){const g=parseFloat(d.latitude),u=parseFloat(d.longitude);!isNaN(g)&&!isNaN(u)?(i=g,a=u,console.log("WeatherFlow Card: Resolved primary station coordinate:",i,a)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",d.latitude,d.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",r)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",r)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==i||this.lastRefLon!==a)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",i,a),this.lastRefLat=i,this.lastRefLon=a,this.loadMapTexture(i,a),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(i,a),s){const n=t.states[s].attributes.elevation_grid;n&&JSON.stringify(n)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(n);const r=t.states[s].attributes;this.windSpeed=r.wind_speed!==void 0?parseFloat(r.wind_speed):0,this.windDirection=r.wind_direction!==void 0?parseFloat(r.wind_direction):0,this.solarRadiation=r.solar_radiation!==void 0?parseFloat(r.solar_radiation):1e3,this.rainRate=r.rain_rate!==void 0?parseFloat(r.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay();const d=r.stations;if(Array.isArray(d)){let g=!1;if(this.stations.length!==d.length)g=!0;else for(let u=0;u<d.length;u++)if(!this.stations.find(y=>y.id===d[u].id)){g=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",g,"Current length:",this.stations.length,"New length:",d.length),g){const m=Math.cos(i*Math.PI/180);this.stations=d.map(y=>{const f=parseFloat(y.latitude),p=parseFloat(y.longitude),b=6371*(p-a)*(Math.PI/180)*m,v=-6371*(f-i)*(Math.PI/180);let M=6583435;return y.type==="primary"?M=1096065:y.type==="neighbor"&&(M=3718648),console.log("WeatherFlow Card: Mapped station:",y.id,"type:",y.type,"lat:",f,"lon:",p,"to grid coords:",b,v),{id:y.id,x:b,z:v,color:M,type:y.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(y=>{this.scene.remove(y.mesh)})),this.addWeatherStations()}}}const h="weatherflow_lightning_trilateration",l=Object.keys(t.states).filter(n=>n.startsWith("geo_location.")&&t.states[n].attributes.source===h),o=6371,c=Math.cos(i*Math.PI/180),e=[];l.forEach(n=>{const r=t.states[n],d=parseFloat(r.attributes.latitude),g=parseFloat(r.attributes.longitude);if(!isNaN(d)&&!isNaN(g)){const u=o*(g-a)*(Math.PI/180)*c,m=-o*(d-i)*(Math.PI/180),y=new Date(r.last_changed).getTime();e.push({id:n,time:y,x:u,z:m})}}),e.sort((n,r)=>n.time-r.time),e.forEach(n=>{if(!this.strikeHistory.some(r=>r.id===n.id)){const r=!this.knownStrikes.has(n.id);r&&this.knownStrikes.add(n.id);const d=this.playbackMode==="live"&&r;this.strikeHistory.push({id:n.id,time:n.time,x:n.x,z:n.z,animated:d||this.playbackMode!=="live"&&n.time<=this.playbackTime}),d&&this.triggerStrikeAnimation(n.x,n.z)}}),this.strikeHistory=this.strikeHistory.filter(n=>e.some(r=>r.id===n.id)),this.strikeHistory.sort((n,r)=>n.time-r.time);for(const n of this.knownStrikes)t.states[n]||this.knownStrikes.delete(n)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",O),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const s=this.shadowRoot.getElementById("height");s&&(s.value=this._config.height||"350px");const i=this.shadowRoot.getElementById("zoom_level");i&&(i.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const a=this.shadowRoot.getElementById("show_grid");a&&(a.checked=this._config.show_grid!==!1);const h=this.shadowRoot.getElementById("show_map");h&&(h.checked=this._config.show_map!==!1);const l=this.shadowRoot.getElementById("show_rings");l&&(l.checked=this._config.show_rings!==!1);const o=this.shadowRoot.getElementById("show_heatmap");o&&(o.checked=this._config.show_heatmap!==!1);const c=this.shadowRoot.getElementById("auto_orbit");c&&(c.checked=this._config.auto_orbit!==!1);const e=this.shadowRoot.getElementById("show_weather");e&&(e.checked=this._config.show_weather!==!1);const n=this.shadowRoot.getElementById("show_daynight");n&&(n.checked=this._config.show_daynight!==!1);const r=this.shadowRoot.getElementById("min_brightness");r&&(r.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const d=this.shadowRoot.getElementById("elevation_scale");d&&(d.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const g=this.shadowRoot.getElementById("show_3d_features");g&&(g.checked=this._config.show_3d_features===!0);const u=this.shadowRoot.getElementById("playback_speed");u&&(u.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(s=>{s.addEventListener("change",i=>this.toggleChanged(i))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(s=>{s.addEventListener("input",i=>this.textChanged(i))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",s=>{const i=s.detail&&s.detail.value!=null?s.detail.value:null;this._onEntityPicked(i)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const s=t.target;this.dispatchConfigChange(s.id,s.checked)}textChanged(t){if(!this._config)return;const s=t.target;let i=s.value;if(s.id==="zoom_level"||s.id==="min_brightness"||s.id==="elevation_scale"||s.id==="playback_speed"){const a=parseFloat(i);isNaN(a)||(i=a)}this.dispatchConfigChange(s.id,i)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=i=>i.attributes&&Array.isArray(i.attributes.stations)&&i.attributes.icon==="mdi:lightning-bolt";const s=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==s&&(t.value=s)}_onEntityPicked(t){let s;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(s=t.slice(7,-9));const i={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:s||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}dispatchConfigChange(t,s){if(this._config[t]===s)return;const i={...this._config,[t]:s},a=new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0});this.dispatchEvent(a)}}customElements.define("weatherflow-lightning-card-editor",N);export{};
