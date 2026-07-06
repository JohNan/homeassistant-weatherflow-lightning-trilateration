/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const s=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const e=this.config.height;if(e.endsWith("px")){const a=parseInt(e);this.container.style.height=`${a-40}px`}else this.container.style.height=e}this.initialized&&this.applyConfigChanges(s||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const s=parseFloat(this.config.zoom_level);isNaN(s)||(this.zoomRadius=s,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&(this.terrainMesh.material.map&&this.terrainMesh.material.map.dispose(),this.terrainMesh.material.dispose())),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(e=>e.dispose()):s.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(10,Math.min(150,this.zoomRadius));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),s=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(t,s,e),this.camera.lookAt(0,0,0))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const i=parseInt(t);this.container.style.height=`${i-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const s=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,s,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.atan2(30,15),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const a=i=>i.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(i=>{this.weatherOverlay.addEventListener(i,a)}),this.weatherOverlay.addEventListener("click",i=>{(i.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(i.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let o=!1,r={x:0,y:0};this.container.addEventListener("mousedown",i=>{this.lastInteractionTime=Date.now(),o=!0,this.container.style.cursor="grabbing",r={x:i.clientX,y:i.clientY}}),this.container.addEventListener("mousemove",i=>{if(this.lastInteractionTime=Date.now(),o){const n=i.clientX-r.x,l=i.clientY-r.y;this.cameraTheta-=n*.005,this.cameraPhi+=l*.005,this.updateCameraPosition(),r={x:i.clientX,y:i.clientY}}else{const n=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(i.clientX-n.left)/n.width*2-1,this.mouse.y=-((i.clientY-n.top)/n.height)*2+1,this.checkHover(i.clientX-n.left,i.clientY-n.top)}}),this._mouseupHandler=()=>{o=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",i=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),i.preventDefault(),this.zoomRadius+=i.deltaY*.02,this.updateCameraPosition()},{passive:!1});let d=0;this.container.addEventListener("touchstart",i=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),i.touches.length===1?(o=!0,r={x:i.touches[0].clientX,y:i.touches[0].clientY}):i.touches.length===2&&(o=!1,d=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY))}),this.container.addEventListener("touchmove",i=>{if(this.lastInteractionTime=Date.now(),i.preventDefault(),i.touches.length===1&&o){const n=i.touches[0].clientX-r.x,l=i.touches[0].clientY-r.y;this.cameraTheta-=n*.007,this.cameraPhi+=l*.007,this.updateCameraPosition(),r={x:i.touches[0].clientX,y:i.touches[0].clientY}}else if(i.touches.length===2){const n=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY),l=n-d;this.zoomRadius-=l*.15,this.updateCameraPosition(),d=n}},{passive:!1}),this.container.addEventListener("touchend",()=>{o=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const i=this.container.clientWidth,n=this.container.clientHeight;this.camera.aspect=i/n,this.camera.updateProjectionMatrix(),this.renderer.setSize(i,n)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),e=s.createRadialGradient(32,32,0,32,32,32);return e.addColorStop(0,"rgba(0, 242, 254, 1.0)"),e.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),e.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),e.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=e,s.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const s=document.createElement("canvas");s.width=128,s.height=64;const e=s.getContext("2d");e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const a=new THREE.CanvasTexture(s),h=new THREE.SpriteMaterial({map:a,transparent:!0,depthWrite:!1,depthTest:!0}),o=new THREE.Sprite(h);return o.scale.set(2,1,1),o}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(l=>{const c=[];for(let f=0;f<=128;f++){const g=f/128*Math.PI*2,E=l*Math.cos(g),v=l*Math.sin(g);c.push(new THREE.Vector3(E,.05,v))}const u=new THREE.BufferGeometry().setFromPoints(c),y=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5}),m=new THREE.Line(u,y);this.rangeRingsGroup.add(m)});const s=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3}),e=[],a=40;for(let l=0;l<=a;l++){const c=-30+l/a*60;e.push(new THREE.Vector3(0,.05,c))}const h=new THREE.BufferGeometry().setFromPoints(e),o=new THREE.Line(h,s);this.rangeRingsGroup.add(o);const r=[];for(let l=0;l<=a;l++){const c=-30+l/a*60;r.push(new THREE.Vector3(c,.05,0))}const d=new THREE.BufferGeometry().setFromPoints(r),i=new THREE.Line(d,s);this.rangeRingsGroup.add(i);const n=Math.SQRT2/2;this.ringLabels=[],t.forEach(l=>{const c=this.createRingLabelSprite(`${l}km`);c.position.set(l*n,.5,-l*n),this.rangeRingsGroup.add(c),this.ringLabels.push({sprite:c,r:l})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((o,r)=>{const d=t[r];if(d){const i=d.geometry.attributes.position,n=128;for(let l=0;l<=n;l++){const c=l/n*Math.PI*2,p=o*Math.cos(c),u=o*Math.sin(c),y=this.getTerrainHeight(p,u)+.1;i.setY(l,y)}i.needsUpdate=!0}});const e=t[3];if(e){const o=e.geometry.attributes.position,r=40;for(let d=0;d<=r;d++){const i=-30+d/r*60,n=this.getTerrainHeight(0,i)+.1;o.setXYZ(d,0,n,i)}o.needsUpdate=!0}const a=t[4];if(a){const o=a.geometry.attributes.position,r=40;for(let d=0;d<=r;d++){const i=-30+d/r*60,n=this.getTerrainHeight(i,0)+.1;o.setXYZ(d,i,n,0)}o.needsUpdate=!0}const h=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(o=>{const r=o.r*h,d=-o.r*h,i=this.getTerrainHeight(r,d)+.4;o.sprite.position.set(r,i,d)})}getTerrainHeight(t,s){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const e=(t+20)*14/40,a=(s+20)*14/40;if(e<0||e>14||a<0||a>14)return 0;const h=Math.floor(e),o=Math.min(14,h+1),r=Math.floor(a),d=Math.min(14,r+1),i=e-h,n=a-r,l=this.getGridHeight(r,h),c=this.getGridHeight(r,o),p=this.getGridHeight(d,h),u=this.getGridHeight(d,o),y=l*(1-i)+c*i,m=p*(1-i)+u*i;return y*(1-n)+m*n}getGridHeight(t,s){return this.scaledHeights?this.scaledHeights[(14-t)*15+s]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let h=0;h<15;h++){const o=h-7;for(let r=0;r<15;r++){const d=r-7,i=Math.sqrt(o*o+d*d);let n=80+Math.sin(o*.4)*Math.cos(d*.4)*45;if(n+=Math.sin(i*.8)*15,h===7&&r===7)n=100;else{const l=Math.min(1,i/3);n=100*(1-l)+n*l}this.elevationGrid.push(n)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let h=0;h<225;h++)this.scaledHeights[h]=((this.elevationGrid[h]||0)-t)*e;const a=this.terrainGeo.attributes.position;for(let h=0;h<=14;h++){const o=14-h;for(let r=0;r<=14;r++){const d=r,i=h*15+r,n=this.scaledHeights[o*15+d];a.setZ(i,n)}}a.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,s){if(this.config.show_map===!1){this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0);return}const e=10,a=40,h=a/111.1,o=Math.cos(t*Math.PI/180),r=o>0?a/(111.1*o):a/111.1,d=t-h/2,i=t+h/2,n=s-r/2,l=s+r/2,c=(w,b)=>(w+180)/360*Math.pow(2,b),p=(w,b)=>(1-Math.log(Math.tan(w*Math.PI/180)+1/Math.cos(w*Math.PI/180))/Math.PI)/2*Math.pow(2,b),u=(w,b)=>w/Math.pow(2,b)*360-180,y=(w,b)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*w/Math.pow(2,b)))*180/Math.PI,m=Math.floor(c(n,e)),f=Math.floor(c(l,e)),g=Math.floor(p(i,e)),E=Math.floor(p(d,e)),v=document.createElement("canvas");v.width=1024,v.height=1024;const x=v.getContext("2d");x.fillStyle="#050b14",x.fillRect(0,0,1024,1024);const M=[];for(let w=m;w<=f;w++)for(let b=g;b<=E;b++){const L=u(w,e),P=u(w+1,e),S=y(b+1,e),C=y(b,e),_=(L-n)/(l-n),I=(P-n)/(l-n),z=(S-d)/(i-d),R=(C-d)/(i-d),G=_*1024,F=(1-R)*1024,D=(I-_)*1024,B=(R-z)*1024,W=`https://basemaps.cartocdn.com/dark_all/${e}/${w}/${b}.png`,A=new Promise(H=>{const T=new Image;T.crossOrigin="anonymous",T.onload=()=>{x.drawImage(T,G,F,D,B),H()},T.onerror=()=>H(),T.src=W});M.push(A)}Promise.all(M).then(()=>{const w=new THREE.CanvasTexture(v);this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=w,this.terrainMesh.material.color.setHex(16777215),this.terrainMesh.material.needsUpdate=!0)})}async loadVectorData(t,s){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,s),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,s,e){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(o=>{o.geometry&&o.geometry.dispose(),o.material&&(Array.isArray(o.material)?o.material.forEach(r=>r.dispose()):o.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const a=6371,h=Math.cos(s*Math.PI/180);if(t.water&&Array.isArray(t.water)){const o=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(r=>{if(!r.coordinates||r.coordinates.length<3)return;const d=[];let i=0,n=0;if(r.coordinates.forEach(u=>{const y=u[0],m=u[1],f=a*(m-e)*(Math.PI/180)*h,g=-a*(y-s)*(Math.PI/180);f<-20||f>20||g<-20||g>20||(d.push(new THREE.Vector2(f,-g)),i+=this.getTerrainHeight(f,g),n++)}),d.length<3)return;i/=n;const l=new THREE.Shape(d),c=new THREE.ShapeGeometry(l),p=new THREE.Mesh(c,o);p.rotation.x=-Math.PI/2,p.position.y=i+.08,this.features3DGroup.add(p)})}if(t.forest&&Array.isArray(t.forest)){const o=[];if(t.forest.forEach(r=>{!r.coordinates||r.coordinates.length<3||r.coordinates.forEach((d,i)=>{if(i%4!==0)return;const n=d[0],l=d[1],c=a*(l-e)*(Math.PI/180)*h,p=-a*(n-s)*(Math.PI/180);if(c<-19.5||c>19.5||p<-19.5||p>19.5)return;const u=this.getTerrainHeight(c,p);o.push(new THREE.Vector3(c,u,p))})}),o.length>0){const r=new THREE.ConeGeometry(.12,.45,4);r.translate(0,.225,0);const d=new THREE.MeshPhongMaterial({color:1467700,flatShading:!0}),i=new THREE.InstancedMesh(r,d,o.length),n=new THREE.Object3D;o.forEach((l,c)=>{n.position.copy(l);const p=.8+Math.random()*.4;n.scale.set(p,p,p),n.updateMatrix(),i.setMatrixAt(c,n.matrix)}),i.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(i)}}}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const s=7*15+7,e=t[s]||0,h=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let r=0;r<225;r++)this.scaledHeights[r]=((t[r]||0)-e)*h;const o=this.terrainGeo.attributes.position;for(let r=0;r<=14;r++){const d=14-r;for(let i=0;i<=14;i++){const n=i,l=r*15+i,c=this.scaledHeights[d*15+n];o.setZ(l,c)}}o.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,s)=>{const e=this.stationMeshes[s];if(e&&e.mesh){const a=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=a}})}showTooltip(t,s,e){if(!this.tooltip)return;let a="Discovered Station";t.type==="primary"?a="Primary Station":t.type==="neighbor"&&(a="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${a}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const h=this.container.getBoundingClientRect();let o=s+15,r=e+15;o+150>h.width&&(o=s-165),r+60>h.height&&(r=e-75),this.tooltip.style.left=`${o}px`,this.tooltip.style.top=`${r}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,s){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(a=>a.mesh),!0);if(e.length>0){let a=e[0].object;for(;a&&a.parent&&(!a.userData||!a.userData.station);)a=a.parent;if(a&&a.userData&&a.userData.station){const h=a.userData.station;this.showTooltip(h,t,s),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,s=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let a=0;a<this.strikeHistory.length;a++){const h=this.strikeHistory[a],o=s-h.time;if(o>=0&&o<=t){e.add(h.id);const r=o/t,d=.7*(1-r),i=1-r*.4;let n=this.heatmapMeshes.get(h.id);if(n)n.material.opacity=d,n.mesh.scale.set(i,i,i),n.mesh.position.y=this.getTerrainHeight(h.x,h.z);else{const l=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:d,depthWrite:!1}),c=new THREE.Mesh(this.heatGeo,l),p=this.getTerrainHeight(h.x,h.z);c.position.set(h.x,p,h.z),c.scale.set(i,i,i),this.scene.add(c),n={mesh:c,material:l},this.heatmapMeshes.set(h.id,n)}}}for(const[a,h]of this.heatmapMeshes.entries())e.has(a)||(this.scene.remove(h.mesh),h.material&&h.material.dispose(),this.heatmapMeshes.delete(a))}addStaticElements(){this.ambientLight=new THREE.AmbientLight(988970,1.5),this.scene.add(this.ambientLight),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const t=new THREE.BufferGeometry,s=500,e=new Float32Array(s*3);for(let d=0;d<s*3;d+=3){const i=100+Math.random()*50,n=Math.random(),l=Math.random(),c=n*2*Math.PI,p=Math.acos(2*l-1);e[d]=i*Math.sin(p)*Math.cos(c),e[d+1]=i*Math.sin(p)*Math.sin(c),e[d+2]=i*Math.cos(p)}t.setAttribute("position",new THREE.BufferAttribute(e,3));const a=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(t,a),this.scene.add(this.starField);const h=40;this.terrainGeo=new THREE.PlaneGeometry(h,h,14,14);const o=new THREE.MeshPhongMaterial({color:330516,emissive:66826,specular:1121838,shininess:30,flatShading:!0,side:THREE.DoubleSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,o),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const r=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,r),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const s=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);s.position.set(t.x,e,t.z),s.userData={station:t};const a=new THREE.RingGeometry(.8,1,32),h=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),o=new THREE.Mesh(a,h);o.rotation.x=-Math.PI/2,o.position.y=.02,s.add(o);const r=new THREE.CylinderGeometry(.08,.08,2.5,8),d=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),i=new THREE.Mesh(r,d);i.position.y=1.25,s.add(i);const n=new THREE.SphereGeometry(.25,16,16),l=new THREE.MeshBasicMaterial({color:t.color}),c=new THREE.Mesh(n,l);c.position.y=2.5,s.add(c),this.scene.add(s),this.stationMeshes.push({mesh:s,pulseVal:Math.random()*Math.PI})})}initWeatherSystem(){const s=new THREE.BufferGeometry,e=new Float32Array(800*3);for(let i=0;i<800*3;i+=3)e[i]=(Math.random()-.5)*40,e[i+1]=Math.random()*20,e[i+2]=(Math.random()-.5)*40;s.setAttribute("position",new THREE.BufferAttribute(e,3));const a=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(s,a),this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const h=300,o=new THREE.BufferGeometry,r=new Float32Array(h*3);for(let i=0;i<h*3;i+=3)r[i]=(Math.random()-.5)*40,r[i+1]=Math.random()*8,r[i+2]=(Math.random()-.5)*40;o.setAttribute("position",new THREE.BufferAttribute(r,3));const d=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(o,d),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),s=(this.rainRate||0).toFixed(1),e=this.windDirection||0;if(this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
    `}updateWeatherSystem(t){if(!this.initialized)return;const s=this.config.show_weather!==!1,e=s&&this.rainRate>0,a=s&&this.windSpeed>0,h=(this.windDirection||0)*Math.PI/180,o=Math.sin(h),r=Math.cos(h);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const d=this.rainParticles.geometry.attributes.position,i=d.array,n=d.count,l=-o*(this.windSpeed||0)*.1,c=-r*(this.windSpeed||0)*.1,p=10+Math.min(20,this.rainRate*2);for(let u=0;u<n;u++){const y=u*3;let m=i[y],f=i[y+1],g=i[y+2];f-=p*t,m+=l*t,g+=c*t;const E=this.getTerrainHeight(m,g);(f<E||f<0)&&(f=20+Math.random()*2,m=(Math.random()-.5)*40,g=(Math.random()-.5)*40),i[y]=m,i[y+1]=f,i[y+2]=g}d.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=a,a)){const d=this.windParticles.geometry.attributes.position,i=d.array,n=d.count,l=-o*(this.windSpeed||0)*.5,c=-r*(this.windSpeed||0)*.5;for(let p=0;p<n;p++){const u=p*3;let y=i[u],m=i[u+1],f=i[u+2];y+=l*t,f+=c*t,m+=Math.sin(y*.5+f*.5)*.02,(y<-20||y>20||f<-20||f>20)&&(Math.abs(l)>Math.abs(c)?(y=l>0?-20:20,f=(Math.random()-.5)*40):(y=(Math.random()-.5)*40,f=c>0?-20:20),m=Math.random()*8),i[u]=y,i[u+1]=m,i[u+2]=f}d.needsUpdate=!0}}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(988970),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const h=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(h,1),this.scene.fog&&this.scene.fog.color.copy(h);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const h=this._hass.states["sun.sun"],o=h.attributes.elevation!==void 0?parseFloat(h.attributes.elevation):0;o>0?t=1:o<-6?t=0:t=(o+6)/6}else{const h=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,h/1e3))}if(this.ambientLight){const h=new THREE.Color(3359061),o=new THREE.Color(16777215);this.ambientLight.color.copy(h).lerp(o,t);const r=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=r+t*(1.5-r)}if(this.dirLight){this.dirLight.intensity=t*1.5;const h=t*Math.PI-Math.PI/2,o=15*Math.sin(h),r=15*Math.cos(h);this.dirLight.position.set(o,r,7);const i=new THREE.Color(16753920),n=new THREE.Color(16707722);this.dirLight.color.copy(i).lerp(n,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const s=new THREE.Color(132106),e=new THREE.Color(529189),a=s.clone().lerp(e,t);this.renderer&&this.renderer.setClearColor(a,1),this.scene.fog&&this.scene.fog.color.copy(a)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),s=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(s),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const a=Math.sin(e.pulseVal),h=1+a*.1;e.mesh.children&&e.mesh.children[0]&&(e.mesh.children[0].scale.set(h,h,1),e.mesh.children[0].material.opacity=.5+a*.3)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const s=[1,5,10,30,60,120,300,600];s.includes(this.playbackSpeed)||(s.push(this.playbackSpeed),s.sort((e,a)=>e-a)),s.forEach(e=>{const a=document.createElement("option");a.value=e.toString(),a.innerText=`${e}x`,e===this.playbackSpeed&&(a.selected=!0),this.speedSelect.appendChild(a)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",e=>this.handleSliderInput(e)),this.slider.addEventListener("change",()=>this.handleSliderChange()),this.speedSelect.addEventListener("change",e=>{this.playbackSpeed=parseFloat(e.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5,s=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=s,this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=s.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),a=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=a*this.playbackSpeed,this.playbackTime>=s?(this.playbackTime=s,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const s=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let a="";if(e<60)a=`-${e}s`;else{const h=Math.floor(e/60),o=e%60;a=`-${h}m ${o}s`}this.timeLabel&&(this.timeLabel.innerText=`${s} (${a})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(s=>{s.time<=this.playbackTime?s.animated=!0:s.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z)):t.animated=!1})}createLightningPath(t,s,e=10){const a=[],h=new THREE.Vector3().subVectors(s,t);a.push(t.clone());for(let o=1;o<e;o++){const r=o/e,d=new THREE.Vector3().addVectors(t,h.clone().multiplyScalar(r)),i=(1-r)*1;d.add(new THREE.Vector3((Math.random()-.5)*i,(Math.random()-.5)*i,(Math.random()-.5)*i)),a.push(d)}return a.push(s.clone()),a}createLightningBranches(t,s,e=8){const a=this.createLightningPath(t,s,e),h=[a];for(let o=1;o<a.length-2;o++)if(Math.random()<.25){const r=a[o].clone(),i=(1-o/a.length)*6,n=new THREE.Vector3().subVectors(s,t).normalize();n.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const l=new THREE.Vector3().addVectors(r,n.multiplyScalar(i)),c=this.createLightningPath(r,l,4);h.push(c)}return h}triggerStrikeAnimation(t,s){if(!this.initialized)return;const e=this.getTerrainHeight(t,s),a=new THREE.Vector3(t,e,s),h=new THREE.Vector3(t+(Math.random()-.5)*4,e+18,s+(Math.random()-.5)*4),o=[];this.createLightningBranches(h,a).forEach((f,g)=>{const v=new THREE.CatmullRomCurve3(f).getPoints(30),x=new THREE.BufferGeometry().setFromPoints(v),M=g===0,w=new THREE.LineBasicMaterial({color:M?16768768:16758528,transparent:!0,opacity:M?1:.7}),b=new THREE.Line(x,w);this.strikeLayer.add(b),o.push(b)});const d=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),i=new THREE.Sprite(d);i.position.copy(a),i.position.y+=.1,i.scale.set(.1,.1,1),this.strikeLayer.add(i);const n=new THREE.RingGeometry(.1,.2,32),l=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),c=new THREE.Mesh(n,l);c.position.copy(a),c.position.y+=.05,c.rotation.x=-Math.PI/2,this.strikeLayer.add(c);const p=[];this.stations.forEach(f=>{const g=this.getTerrainHeight(f.x,f.z),E=new THREE.Vector3(f.x,g,f.z),v=E.distanceTo(a),x=new THREE.RingGeometry(v-.08,v+.08,64),M=new THREE.MeshBasicMaterial({color:f.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),w=new THREE.Mesh(x,M);w.position.copy(E),w.position.y+=.05,w.rotation.x=-Math.PI/2,this.strikeLayer.add(w),p.push({mesh:w,targetOpacity:.5})});let u=0;const y=60,m=()=>{u++;const f=u/y;if(f<.2?o.forEach(g=>g.material.opacity=Math.random()>.3?1:.2):f<.5?o.forEach(g=>{g.material.opacity=1-(f-.2)/.3}):o.forEach(g=>{g.parent&&(this.strikeLayer.remove(g),g.geometry&&g.geometry.dispose(),g.material&&g.material.dispose())}),f<.6){const g=f*12;i.scale.set(g,g,1),i.material.opacity=1*(1-f/.6)}else i.parent&&(this.strikeLayer.remove(i),i.material.dispose());if(f<.8){const g=1+f*25;c.scale.set(g,g,1),c.material.opacity=.8*(1-f/.8)}else c.parent&&(this.strikeLayer.remove(c),c.geometry&&c.geometry.dispose(),c.material&&c.material.dispose());p.forEach(g=>{f<.3?g.mesh.material.opacity=g.targetOpacity*(f/.3):f<.9?g.mesh.material.opacity=g.targetOpacity*(1-(f-.3)/.6):g.mesh.parent&&(this.strikeLayer.remove(g.mesh),g.mesh.geometry&&g.mesh.geometry.dispose(),g.mesh.material&&g.mesh.material.dispose())}),u<y&&requestAnimationFrame(m)};m()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const s=this.config.entity||this.config.entity_id||Object.keys(t.states).find(n=>n.startsWith("sensor.")&&n.endsWith("_stations")&&t.states[n].attributes.stations!==void 0&&t.states[n].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(n=>n.startsWith("sensor.")&&t.states[n].attributes.stations!==void 0);let e=t.config.latitude,a=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",e,a),s){const l=t.states[s].attributes.stations;if(Array.isArray(l)){const c=l.find(p=>p.type==="primary");if(c&&c.latitude!==void 0&&c.longitude!==void 0){const p=parseFloat(c.latitude),u=parseFloat(c.longitude);!isNaN(p)&&!isNaN(u)?(e=p,a=u,console.log("WeatherFlow Card: Resolved primary station coordinate:",e,a)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",c.latitude,c.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",l)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",l)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==e||this.lastRefLon!==a)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",e,a),this.lastRefLat=e,this.lastRefLon=a,this.loadMapTexture(e,a),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(e,a),s){const n=t.states[s].attributes.elevation_grid;n&&JSON.stringify(n)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(n);const l=t.states[s].attributes;this.windSpeed=l.wind_speed!==void 0?parseFloat(l.wind_speed):0,this.windDirection=l.wind_direction!==void 0?parseFloat(l.wind_direction):0,this.solarRadiation=l.solar_radiation!==void 0?parseFloat(l.solar_radiation):1e3,this.rainRate=l.rain_rate!==void 0?parseFloat(l.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay();const c=l.stations;if(Array.isArray(c)){let p=!1;if(this.stations.length!==c.length)p=!0;else for(let u=0;u<c.length;u++)if(!this.stations.find(m=>m.id===c[u].id)){p=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",p,"Current length:",this.stations.length,"New length:",c.length),p){const y=Math.cos(e*Math.PI/180);this.stations=c.map(m=>{const f=parseFloat(m.latitude),g=parseFloat(m.longitude),E=6371*(g-a)*(Math.PI/180)*y,v=-6371*(f-e)*(Math.PI/180);let x=6583435;return m.type==="primary"?x=1096065:m.type==="neighbor"&&(x=3718648),console.log("WeatherFlow Card: Mapped station:",m.id,"type:",m.type,"lat:",f,"lon:",g,"to grid coords:",E,v),{id:m.id,x:E,z:v,color:x,type:m.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(m=>{this.scene.remove(m.mesh)})),this.addWeatherStations()}}}const h="weatherflow_lightning_trilateration",o=Object.keys(t.states).filter(n=>n.startsWith("geo_location.")&&t.states[n].attributes.source===h),r=6371,d=Math.cos(e*Math.PI/180),i=[];o.forEach(n=>{const l=t.states[n],c=parseFloat(l.attributes.latitude),p=parseFloat(l.attributes.longitude);if(!isNaN(c)&&!isNaN(p)){const u=r*(p-a)*(Math.PI/180)*d,y=-r*(c-e)*(Math.PI/180),m=new Date(l.last_changed).getTime();i.push({id:n,time:m,x:u,z:y})}}),i.sort((n,l)=>n.time-l.time),i.forEach(n=>{if(!this.strikeHistory.some(l=>l.id===n.id)){const l=!this.knownStrikes.has(n.id);l&&this.knownStrikes.add(n.id);const c=this.playbackMode==="live"&&l;this.strikeHistory.push({id:n.id,time:n.time,x:n.x,z:n.z,animated:c||this.playbackMode!=="live"&&n.time<=this.playbackTime}),c&&this.triggerStrikeAnimation(n.x,n.z)}}),this.strikeHistory=this.strikeHistory.filter(n=>i.some(l=>l.id===n.id)),this.strikeHistory.sort((n,l)=>n.time-l.time);for(const n of this.knownStrikes)t.states[n]||this.knownStrikes.delete(n)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",N),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class O extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const s=this.shadowRoot.getElementById("height");s&&(s.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const a=this.shadowRoot.getElementById("show_grid");a&&(a.checked=this._config.show_grid!==!1);const h=this.shadowRoot.getElementById("show_map");h&&(h.checked=this._config.show_map!==!1);const o=this.shadowRoot.getElementById("show_rings");o&&(o.checked=this._config.show_rings!==!1);const r=this.shadowRoot.getElementById("show_heatmap");r&&(r.checked=this._config.show_heatmap!==!1);const d=this.shadowRoot.getElementById("auto_orbit");d&&(d.checked=this._config.auto_orbit!==!1);const i=this.shadowRoot.getElementById("show_weather");i&&(i.checked=this._config.show_weather!==!1);const n=this.shadowRoot.getElementById("show_daynight");n&&(n.checked=this._config.show_daynight!==!1);const l=this.shadowRoot.getElementById("min_brightness");l&&(l.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const c=this.shadowRoot.getElementById("elevation_scale");c&&(c.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const p=this.shadowRoot.getElementById("show_3d_features");p&&(p.checked=this._config.show_3d_features===!0);const u=this.shadowRoot.getElementById("playback_speed");u&&(u.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(s=>{s.addEventListener("change",e=>this.toggleChanged(e))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(s=>{s.addEventListener("input",e=>this.textChanged(e))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",s=>{const e=s.detail&&s.detail.value!=null?s.detail.value:null;this._onEntityPicked(e)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const s=t.target;this.dispatchConfigChange(s.id,s.checked)}textChanged(t){if(!this._config)return;const s=t.target;let e=s.value;if(s.id==="zoom_level"||s.id==="min_brightness"||s.id==="elevation_scale"||s.id==="playback_speed"){const a=parseFloat(e);isNaN(a)||(e=a)}this.dispatchConfigChange(s.id,e)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=e=>e.attributes&&Array.isArray(e.attributes.stations)&&e.attributes.icon==="mdi:lightning-bolt";const s=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==s&&(t.value=s)}_onEntityPicked(t){let s;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(s=t.slice(7,-9));const e={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:s||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}dispatchConfigChange(t,s){if(this._config[t]===s)return;const e={...this._config,[t]:s},a=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(a)}}customElements.define("weatherflow-lightning-card-editor",O);export{};
