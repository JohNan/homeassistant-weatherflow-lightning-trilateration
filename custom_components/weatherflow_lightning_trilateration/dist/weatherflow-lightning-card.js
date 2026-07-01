/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class N extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const i=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,...t},this.container){const e=this.config.height;if(e.endsWith("px")){const a=parseInt(e);this.container.style.height=`${a-40}px`}else this.container.style.height=e}this.initialized&&this.applyConfigChanges(i||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const i=parseFloat(this.config.zoom_level);isNaN(i)||(this.zoomRadius=i,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&(this.terrainMesh.material.map&&this.terrainMesh.material.map.dispose(),this.terrainMesh.material.dispose())),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(i=>{i.geometry&&i.geometry.dispose(),i.material&&(Array.isArray(i.material)?i.material.forEach(e=>e.dispose()):i.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(10,Math.min(150,this.zoomRadius));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),i=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(t,i,e),this.camera.lookAt(0,0,0))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const s=parseInt(t);this.container.style.height=`${s-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const i=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,i,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.atan2(30,15),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
        pointer-events: none;
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let a=!1,n={x:0,y:0};this.container.addEventListener("mousedown",s=>{this.lastInteractionTime=Date.now(),a=!0,this.container.style.cursor="grabbing",n={x:s.clientX,y:s.clientY}}),this.container.addEventListener("mousemove",s=>{if(this.lastInteractionTime=Date.now(),a){const l=s.clientX-n.x,r=s.clientY-n.y;this.cameraTheta-=l*.005,this.cameraPhi+=r*.005,this.updateCameraPosition(),n={x:s.clientX,y:s.clientY}}else{const l=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(s.clientX-l.left)/l.width*2-1,this.mouse.y=-((s.clientY-l.top)/l.height)*2+1,this.checkHover(s.clientX-l.left,s.clientY-l.top)}}),this._mouseupHandler=()=>{a=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",s=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),s.preventDefault(),this.zoomRadius+=s.deltaY*.02,this.updateCameraPosition()},{passive:!1});let h=0;this.container.addEventListener("touchstart",s=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),s.touches.length===1?(a=!0,n={x:s.touches[0].clientX,y:s.touches[0].clientY}):s.touches.length===2&&(a=!1,h=Math.hypot(s.touches[0].clientX-s.touches[1].clientX,s.touches[0].clientY-s.touches[1].clientY))}),this.container.addEventListener("touchmove",s=>{if(this.lastInteractionTime=Date.now(),s.preventDefault(),s.touches.length===1&&a){const l=s.touches[0].clientX-n.x,r=s.touches[0].clientY-n.y;this.cameraTheta-=l*.007,this.cameraPhi+=r*.007,this.updateCameraPosition(),n={x:s.touches[0].clientX,y:s.touches[0].clientY}}else if(s.touches.length===2){const l=Math.hypot(s.touches[0].clientX-s.touches[1].clientX,s.touches[0].clientY-s.touches[1].clientY),r=l-h;this.zoomRadius-=r*.15,this.updateCameraPosition(),h=l}},{passive:!1}),this.container.addEventListener("touchend",()=>{a=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const s=this.container.clientWidth,l=this.container.clientHeight;this.camera.aspect=s/l,this.camera.updateProjectionMatrix(),this.renderer.setSize(s,l)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const i=t.getContext("2d"),e=i.createRadialGradient(32,32,0,32,32,32);return e.addColorStop(0,"rgba(0, 242, 254, 1.0)"),e.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),e.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),e.addColorStop(1,"rgba(0, 0, 0, 0)"),i.fillStyle=e,i.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const i=document.createElement("canvas");i.width=128,i.height=64;const e=i.getContext("2d");e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const a=new THREE.CanvasTexture(i),n=new THREE.SpriteMaterial({map:a,transparent:!0,depthWrite:!1,depthTest:!0}),h=new THREE.Sprite(n);return h.scale.set(2,1,1),h}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(o=>{const c=[];for(let u=0;u<=128;u++){const f=u/128*Math.PI*2,m=o*Math.cos(f),E=o*Math.sin(f);c.push(new THREE.Vector3(m,.05,E))}const p=new THREE.BufferGeometry().setFromPoints(c),g=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5}),y=new THREE.Line(p,g);this.rangeRingsGroup.add(y)});const i=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3}),e=[],a=40;for(let o=0;o<=a;o++){const c=-30+o/a*60;e.push(new THREE.Vector3(0,.05,c))}const n=new THREE.BufferGeometry().setFromPoints(e),h=new THREE.Line(n,i);this.rangeRingsGroup.add(h);const s=[];for(let o=0;o<=a;o++){const c=-30+o/a*60;s.push(new THREE.Vector3(c,.05,0))}const l=new THREE.BufferGeometry().setFromPoints(s),r=new THREE.Line(l,i);this.rangeRingsGroup.add(r),this.ringLabels=[],t.forEach(o=>{const c=this.createRingLabelSprite(`${o}km`);c.position.set(.8,.5,-o),this.rangeRingsGroup.add(c),this.ringLabels.push({sprite:c,r:o})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((n,h)=>{const s=t[h];if(s){const l=s.geometry.attributes.position,r=128;for(let o=0;o<=r;o++){const c=o/r*Math.PI*2,d=n*Math.cos(c),p=n*Math.sin(c),g=this.getTerrainHeight(d,p)+.1;l.setY(o,g)}l.needsUpdate=!0}});const e=t[3];if(e){const n=e.geometry.attributes.position,h=40;for(let s=0;s<=h;s++){const l=-30+s/h*60,r=this.getTerrainHeight(0,l)+.1;n.setXYZ(s,0,r,l)}n.needsUpdate=!0}const a=t[4];if(a){const n=a.geometry.attributes.position,h=40;for(let s=0;s<=h;s++){const l=-30+s/h*60,r=this.getTerrainHeight(l,0)+.1;n.setXYZ(s,l,r,0)}n.needsUpdate=!0}this.ringLabels&&this.ringLabels.forEach(n=>{const s=-n.r,l=this.getTerrainHeight(.8,s)+.4;n.sprite.position.set(.8,l,s)})}getTerrainHeight(t,i){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const e=(t+20)*14/40,a=(i+20)*14/40;if(e<0||e>14||a<0||a>14)return 0;const n=Math.floor(e),h=Math.min(14,n+1),s=Math.floor(a),l=Math.min(14,s+1),r=e-n,o=a-s,c=this.getGridHeight(s,n),d=this.getGridHeight(s,h),p=this.getGridHeight(l,n),g=this.getGridHeight(l,h),y=c*(1-r)+d*r,u=p*(1-r)+g*r;return y*(1-o)+u*o}getGridHeight(t,i){return this.scaledHeights?this.scaledHeights[(14-t)*15+i]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let n=0;n<15;n++){const h=n-7;for(let s=0;s<15;s++){const l=s-7,r=Math.sqrt(h*h+l*l);let o=80+Math.sin(h*.4)*Math.cos(l*.4)*45;if(o+=Math.sin(r*.8)*15,n===7&&s===7)o=100;else{const c=Math.min(1,r/3);o=100*(1-c)+o*c}this.elevationGrid.push(o)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let n=0;n<225;n++)this.scaledHeights[n]=((this.elevationGrid[n]||0)-t)*e;const a=this.terrainGeo.attributes.position;for(let n=0;n<=14;n++){const h=14-n;for(let s=0;s<=14;s++){const l=s,r=n*15+s,o=this.scaledHeights[h*15+l];a.setZ(r,o)}}a.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,i){if(this.config.show_map===!1){this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0);return}const e=10,a=40,n=a/111.1,h=Math.cos(t*Math.PI/180),s=h>0?a/(111.1*h):a/111.1,l=t-n/2,r=t+n/2,o=i-s/2,c=i+s/2,d=(w,b)=>(w+180)/360*Math.pow(2,b),p=(w,b)=>(1-Math.log(Math.tan(w*Math.PI/180)+1/Math.cos(w*Math.PI/180))/Math.PI)/2*Math.pow(2,b),g=(w,b)=>w/Math.pow(2,b)*360-180,y=(w,b)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*w/Math.pow(2,b)))*180/Math.PI,u=Math.floor(d(o,e)),f=Math.floor(d(c,e)),m=Math.floor(p(r,e)),E=Math.floor(p(l,e)),v=document.createElement("canvas");v.width=1024,v.height=1024;const x=v.getContext("2d");x.fillStyle="#050b14",x.fillRect(0,0,1024,1024);const M=[];for(let w=u;w<=f;w++)for(let b=m;b<=E;b++){const L=g(w,e),P=g(w+1,e),S=y(b+1,e),C=y(b,e),_=(L-o)/(c-o),I=(P-o)/(c-o),G=(S-l)/(r-l),R=(C-l)/(r-l),z=_*1024,F=(1-R)*1024,D=(I-_)*1024,B=(R-G)*1024,W=`https://basemaps.cartocdn.com/dark_all/${e}/${w}/${b}.png`,A=new Promise(H=>{const T=new Image;T.crossOrigin="anonymous",T.onload=()=>{x.drawImage(T,z,F,D,B),H()},T.onerror=()=>H(),T.src=W});M.push(A)}Promise.all(M).then(()=>{const w=new THREE.CanvasTexture(v);this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=w,this.terrainMesh.material.color.setHex(16777215),this.terrainMesh.material.needsUpdate=!0)})}async loadVectorData(t,i){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,i),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,i,e){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(h=>{h.geometry&&h.geometry.dispose(),h.material&&(Array.isArray(h.material)?h.material.forEach(s=>s.dispose()):h.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const a=6371,n=Math.cos(i*Math.PI/180);if(t.water&&Array.isArray(t.water)){const h=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(s=>{if(!s.coordinates||s.coordinates.length<3)return;const l=[];let r=0,o=0;if(s.coordinates.forEach(g=>{const y=g[0],u=g[1],f=a*(u-e)*(Math.PI/180)*n,m=-a*(y-i)*(Math.PI/180);f<-20||f>20||m<-20||m>20||(l.push(new THREE.Vector2(f,-m)),r+=this.getTerrainHeight(f,m),o++)}),l.length<3)return;r/=o;const c=new THREE.Shape(l),d=new THREE.ShapeGeometry(c),p=new THREE.Mesh(d,h);p.rotation.x=-Math.PI/2,p.position.y=r+.08,this.features3DGroup.add(p)})}if(t.forest&&Array.isArray(t.forest)){const h=[];if(t.forest.forEach(s=>{!s.coordinates||s.coordinates.length<3||s.coordinates.forEach((l,r)=>{if(r%4!==0)return;const o=l[0],c=l[1],d=a*(c-e)*(Math.PI/180)*n,p=-a*(o-i)*(Math.PI/180);if(d<-19.5||d>19.5||p<-19.5||p>19.5)return;const g=this.getTerrainHeight(d,p);h.push(new THREE.Vector3(d,g,p))})}),h.length>0){const s=new THREE.ConeGeometry(.12,.45,4);s.translate(0,.225,0);const l=new THREE.MeshPhongMaterial({color:1467700,flatShading:!0}),r=new THREE.InstancedMesh(s,l,h.length),o=new THREE.Object3D;h.forEach((c,d)=>{o.position.copy(c);const p=.8+Math.random()*.4;o.scale.set(p,p,p),o.updateMatrix(),r.setMatrixAt(d,o.matrix)}),r.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(r)}}}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const i=7*15+7,e=t[i]||0,n=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let s=0;s<225;s++)this.scaledHeights[s]=((t[s]||0)-e)*n;const h=this.terrainGeo.attributes.position;for(let s=0;s<=14;s++){const l=14-s;for(let r=0;r<=14;r++){const o=r,c=s*15+r,d=this.scaledHeights[l*15+o];h.setZ(c,d)}}h.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,i)=>{const e=this.stationMeshes[i];if(e&&e.mesh){const a=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=a}})}showTooltip(t,i,e){if(!this.tooltip)return;let a="Discovered Station";t.type==="primary"?a="Primary Station":t.type==="neighbor"&&(a="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${a}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const n=this.container.getBoundingClientRect();let h=i+15,s=e+15;h+150>n.width&&(h=i-165),s+60>n.height&&(s=e-75),this.tooltip.style.left=`${h}px`,this.tooltip.style.top=`${s}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,i){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(a=>a.mesh),!0);if(e.length>0){let a=e[0].object;for(;a&&a.parent&&(!a.userData||!a.userData.station);)a=a.parent;if(a&&a.userData&&a.userData.station){const n=a.userData.station;this.showTooltip(n,t,i),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,i=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let a=0;a<this.strikeHistory.length;a++){const n=this.strikeHistory[a],h=i-n.time;if(h>=0&&h<=t){e.add(n.id);const s=h/t,l=.7*(1-s),r=1-s*.4;let o=this.heatmapMeshes.get(n.id);if(o)o.material.opacity=l,o.mesh.scale.set(r,r,r),o.mesh.position.y=this.getTerrainHeight(n.x,n.z);else{const c=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:l,depthWrite:!1}),d=new THREE.Mesh(this.heatGeo,c),p=this.getTerrainHeight(n.x,n.z);d.position.set(n.x,p,n.z),d.scale.set(r,r,r),this.scene.add(d),o={mesh:d,material:c},this.heatmapMeshes.set(n.id,o)}}}for(const[a,n]of this.heatmapMeshes.entries())e.has(a)||(this.scene.remove(n.mesh),n.material&&n.material.dispose(),this.heatmapMeshes.delete(a))}addStaticElements(){this.ambientLight=new THREE.AmbientLight(988970,1.5),this.scene.add(this.ambientLight),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const t=new THREE.BufferGeometry,i=500,e=new Float32Array(i*3);for(let l=0;l<i*3;l+=3){const r=100+Math.random()*50,o=Math.random(),c=Math.random(),d=o*2*Math.PI,p=Math.acos(2*c-1);e[l]=r*Math.sin(p)*Math.cos(d),e[l+1]=r*Math.sin(p)*Math.sin(d),e[l+2]=r*Math.cos(p)}t.setAttribute("position",new THREE.BufferAttribute(e,3));const a=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(t,a),this.scene.add(this.starField);const n=40;this.terrainGeo=new THREE.PlaneGeometry(n,n,14,14);const h=new THREE.MeshPhongMaterial({color:330516,emissive:66826,specular:1121838,shininess:30,flatShading:!0,side:THREE.DoubleSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,h),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const s=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,s),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const i=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);i.position.set(t.x,e,t.z),i.userData={station:t};const a=new THREE.RingGeometry(.8,1,32),n=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),h=new THREE.Mesh(a,n);h.rotation.x=-Math.PI/2,h.position.y=.02,i.add(h);const s=new THREE.CylinderGeometry(.08,.08,2.5,8),l=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),r=new THREE.Mesh(s,l);r.position.y=1.25,i.add(r);const o=new THREE.SphereGeometry(.25,16,16),c=new THREE.MeshBasicMaterial({color:t.color}),d=new THREE.Mesh(o,c);d.position.y=2.5,i.add(d),this.scene.add(i),this.stationMeshes.push({mesh:i,pulseVal:Math.random()*Math.PI})})}initWeatherSystem(){const i=new THREE.BufferGeometry,e=new Float32Array(800*3);for(let r=0;r<800*3;r+=3)e[r]=(Math.random()-.5)*40,e[r+1]=Math.random()*20,e[r+2]=(Math.random()-.5)*40;i.setAttribute("position",new THREE.BufferAttribute(e,3));const a=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(i,a),this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const n=300,h=new THREE.BufferGeometry,s=new Float32Array(n*3);for(let r=0;r<n*3;r+=3)s[r]=(Math.random()-.5)*40,s[r+1]=Math.random()*8,s[r+2]=(Math.random()-.5)*40;h.setAttribute("position",new THREE.BufferAttribute(s,3));const l=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(h,l),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),i=(this.rainRate||0).toFixed(1),e=this.windDirection||0;this.weatherOverlay.innerHTML=`
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
    `}updateWeatherSystem(t){if(!this.initialized)return;const i=this.config.show_weather!==!1,e=i&&this.rainRate>0,a=i&&this.windSpeed>0,n=(this.windDirection||0)*Math.PI/180,h=Math.sin(n),s=Math.cos(n);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const l=this.rainParticles.geometry.attributes.position,r=l.array,o=l.count,c=-h*(this.windSpeed||0)*.1,d=-s*(this.windSpeed||0)*.1,p=10+Math.min(20,this.rainRate*2);for(let g=0;g<o;g++){const y=g*3;let u=r[y],f=r[y+1],m=r[y+2];f-=p*t,u+=c*t,m+=d*t;const E=this.getTerrainHeight(u,m);(f<E||f<0)&&(f=20+Math.random()*2,u=(Math.random()-.5)*40,m=(Math.random()-.5)*40),r[y]=u,r[y+1]=f,r[y+2]=m}l.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=a,a)){const l=this.windParticles.geometry.attributes.position,r=l.array,o=l.count,c=-h*(this.windSpeed||0)*.5,d=-s*(this.windSpeed||0)*.5;for(let p=0;p<o;p++){const g=p*3;let y=r[g],u=r[g+1],f=r[g+2];y+=c*t,f+=d*t,u+=Math.sin(y*.5+f*.5)*.02,(y<-20||y>20||f<-20||f>20)&&(Math.abs(c)>Math.abs(d)?(y=c>0?-20:20,f=(Math.random()-.5)*40):(y=(Math.random()-.5)*40,f=d>0?-20:20),u=Math.random()*8),r[g]=y,r[g+1]=u,r[g+2]=f}l.needsUpdate=!0}}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(988970),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const n=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(n,1),this.scene.fog&&this.scene.fog.color.copy(n);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const n=this._hass.states["sun.sun"],h=n.attributes.elevation!==void 0?parseFloat(n.attributes.elevation):0;h>0?t=1:h<-6?t=0:t=(h+6)/6}else{const n=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,n/1e3))}if(this.ambientLight){const n=new THREE.Color(3359061),h=new THREE.Color(16777215);this.ambientLight.color.copy(n).lerp(h,t);const s=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=s+t*(1.5-s)}if(this.dirLight){this.dirLight.intensity=t*1.5;const n=t*Math.PI-Math.PI/2,h=15*Math.sin(n),s=15*Math.cos(n);this.dirLight.position.set(h,s,7);const r=new THREE.Color(16753920),o=new THREE.Color(16707722);this.dirLight.color.copy(r).lerp(o,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const i=new THREE.Color(132106),e=new THREE.Color(529189),a=i.clone().lerp(e,t);this.renderer&&this.renderer.setClearColor(a,1),this.scene.fog&&this.scene.fog.color.copy(a)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),i=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(i),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const a=Math.sin(e.pulseVal),n=1+a*.1;e.mesh.children&&e.mesh.children[0]&&(e.mesh.children[0].scale.set(n,n,1),e.mesh.children[0].material.opacity=.5+a*.3)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",i=>this.handleSliderInput(i)),this.slider.addEventListener("change",()=>this.handleSliderChange())}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){if(this.strikeHistory.length===0){this.slider&&(this.slider.disabled=!0),this.timeLabel&&(this.timeLabel.innerText="No strikes");return}this.slider&&(this.slider.disabled=!1);const t=this.strikeHistory[0].time,i=Date.now();if(this.playbackMode==="live")this.playbackTime=i,this.slider&&(this.slider.min=t,this.slider.max=i,this.slider.value=i),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),a=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=a*this.playbackSpeed,this.playbackTime>=i?(this.playbackTime=i,this.setLiveMode()):(this.slider&&(this.slider.min=t,this.slider.max=i,this.slider.value=this.playbackTime),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t,this.slider.max=i),this.updateTimeLabel()}togglePlay(){if(this.playbackMode==="live")if(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.strikeHistory.length>0){const t=Date.now()-3e4;this.playbackTime=Math.max(this.strikeHistory[0].time,t),this.strikeHistory.forEach(i=>{i.animated=i.time<=this.playbackTime})}else this.playbackTime=Date.now();else this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now());this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){if(this.strikeHistory.length===0)return;const i=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let a="";if(e<60)a=`-${e}s`;else{const n=Math.floor(e/60),h=e%60;a=`-${n}m ${h}s`}this.timeLabel&&(this.timeLabel.innerText=`${i} (${a})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(i=>{i.time<=this.playbackTime?i.animated=!0:i.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z)):t.animated=!1})}createLightningPath(t,i,e=10){const a=[],n=new THREE.Vector3().subVectors(i,t);a.push(t.clone());for(let h=1;h<e;h++){const s=h/e,l=new THREE.Vector3().addVectors(t,n.clone().multiplyScalar(s)),r=(1-s)*1;l.add(new THREE.Vector3((Math.random()-.5)*r,(Math.random()-.5)*r,(Math.random()-.5)*r)),a.push(l)}return a.push(i.clone()),a}createLightningBranches(t,i,e=8){const a=this.createLightningPath(t,i,e),n=[a];for(let h=1;h<a.length-2;h++)if(Math.random()<.25){const s=a[h].clone(),r=(1-h/a.length)*6,o=new THREE.Vector3().subVectors(i,t).normalize();o.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const c=new THREE.Vector3().addVectors(s,o.multiplyScalar(r)),d=this.createLightningPath(s,c,4);n.push(d)}return n}triggerStrikeAnimation(t,i){if(!this.initialized)return;const e=this.getTerrainHeight(t,i),a=new THREE.Vector3(t,e,i),n=new THREE.Vector3(t+(Math.random()-.5)*4,e+18,i+(Math.random()-.5)*4),h=[];this.createLightningBranches(n,a).forEach((f,m)=>{const v=new THREE.CatmullRomCurve3(f).getPoints(30),x=new THREE.BufferGeometry().setFromPoints(v),M=m===0,w=new THREE.LineBasicMaterial({color:M?16768768:16758528,transparent:!0,opacity:M?1:.7}),b=new THREE.Line(x,w);this.strikeLayer.add(b),h.push(b)});const l=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),r=new THREE.Sprite(l);r.position.copy(a),r.position.y+=.1,r.scale.set(.1,.1,1),this.strikeLayer.add(r);const o=new THREE.RingGeometry(.1,.2,32),c=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),d=new THREE.Mesh(o,c);d.position.copy(a),d.position.y+=.05,d.rotation.x=-Math.PI/2,this.strikeLayer.add(d);const p=[];this.stations.forEach(f=>{const m=this.getTerrainHeight(f.x,f.z),E=new THREE.Vector3(f.x,m,f.z),v=E.distanceTo(a),x=new THREE.RingGeometry(v-.08,v+.08,64),M=new THREE.MeshBasicMaterial({color:f.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),w=new THREE.Mesh(x,M);w.position.copy(E),w.position.y+=.05,w.rotation.x=-Math.PI/2,this.strikeLayer.add(w),p.push({mesh:w,targetOpacity:.5})});let g=0;const y=60,u=()=>{g++;const f=g/y;if(f<.2?h.forEach(m=>m.material.opacity=Math.random()>.3?1:.2):f<.5?h.forEach(m=>{m.material.opacity=1-(f-.2)/.3}):h.forEach(m=>{m.parent&&(this.strikeLayer.remove(m),m.geometry&&m.geometry.dispose(),m.material&&m.material.dispose())}),f<.6){const m=f*12;r.scale.set(m,m,1),r.material.opacity=1*(1-f/.6)}else r.parent&&(this.strikeLayer.remove(r),r.material.dispose());if(f<.8){const m=1+f*25;d.scale.set(m,m,1),d.material.opacity=.8*(1-f/.8)}else d.parent&&(this.strikeLayer.remove(d),d.geometry&&d.geometry.dispose(),d.material&&d.material.dispose());p.forEach(m=>{f<.3?m.mesh.material.opacity=m.targetOpacity*(f/.3):f<.9?m.mesh.material.opacity=m.targetOpacity*(1-(f-.3)/.6):m.mesh.parent&&(this.strikeLayer.remove(m.mesh),m.mesh.geometry&&m.mesh.geometry.dispose(),m.mesh.material&&m.mesh.material.dispose())}),g<y&&requestAnimationFrame(u)};u()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const i=Object.keys(t.states).find(o=>o.startsWith("sensor.")&&o.endsWith("_stations")&&t.states[o].attributes.stations!==void 0&&t.states[o].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(o=>o.startsWith("sensor.")&&t.states[o].attributes.stations!==void 0);let e=t.config.latitude,a=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",e,a),i){const c=t.states[i].attributes.stations;if(Array.isArray(c)){const d=c.find(p=>p.type==="primary");if(d&&d.latitude!==void 0&&d.longitude!==void 0){const p=parseFloat(d.latitude),g=parseFloat(d.longitude);!isNaN(p)&&!isNaN(g)?(e=p,a=g,console.log("WeatherFlow Card: Resolved primary station coordinate:",e,a)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",d.latitude,d.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",c)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",c)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==e||this.lastRefLon!==a)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",e,a),this.lastRefLat=e,this.lastRefLon=a,this.loadMapTexture(e,a),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(e,a),i){const o=t.states[i].attributes.elevation_grid;o&&JSON.stringify(o)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(o);const c=t.states[i].attributes;this.windSpeed=c.wind_speed!==void 0?parseFloat(c.wind_speed):0,this.windDirection=c.wind_direction!==void 0?parseFloat(c.wind_direction):0,this.solarRadiation=c.solar_radiation!==void 0?parseFloat(c.solar_radiation):1e3,this.rainRate=c.rain_rate!==void 0?parseFloat(c.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay();const d=c.stations;if(Array.isArray(d)){let p=!1;if(this.stations.length!==d.length)p=!0;else for(let g=0;g<d.length;g++)if(!this.stations.find(u=>u.id===d[g].id)){p=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",p,"Current length:",this.stations.length,"New length:",d.length),p){const y=Math.cos(e*Math.PI/180);this.stations=d.map(u=>{const f=parseFloat(u.latitude),m=parseFloat(u.longitude),E=6371*(m-a)*(Math.PI/180)*y,v=-6371*(f-e)*(Math.PI/180);let x=6583435;return u.type==="primary"?x=1096065:u.type==="neighbor"&&(x=3718648),console.log("WeatherFlow Card: Mapped station:",u.id,"type:",u.type,"lat:",f,"lon:",m,"to grid coords:",E,v),{id:u.id,x:E,z:v,color:x,type:u.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(u=>{this.scene.remove(u.mesh)})),this.addWeatherStations()}}}const n="weatherflow_lightning_trilateration",h=Object.keys(t.states).filter(o=>o.startsWith("geo_location.")&&t.states[o].attributes.source===n),s=6371,l=Math.cos(e*Math.PI/180),r=[];h.forEach(o=>{const c=t.states[o],d=parseFloat(c.attributes.latitude),p=parseFloat(c.attributes.longitude);if(!isNaN(d)&&!isNaN(p)){const g=s*(p-a)*(Math.PI/180)*l,y=-s*(d-e)*(Math.PI/180),u=new Date(c.last_changed).getTime();r.push({id:o,time:u,x:g,z:y})}}),r.sort((o,c)=>o.time-c.time),r.forEach(o=>{if(!this.strikeHistory.some(c=>c.id===o.id)){const c=!this.knownStrikes.has(o.id);c&&this.knownStrikes.add(o.id);const d=this.playbackMode==="live"&&c;this.strikeHistory.push({id:o.id,time:o.time,x:o.x,z:o.z,animated:d||this.playbackMode!=="live"&&o.time<=this.playbackTime}),d&&this.triggerStrikeAnimation(o.x,o.z)}}),this.strikeHistory=this.strikeHistory.filter(o=>r.some(c=>c.id===o.id)),this.strikeHistory.sort((o,c)=>o.time-c.time);for(const o of this.knownStrikes)t.states[o]||this.knownStrikes.delete(o)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",N),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class V extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const i=this.shadowRoot.getElementById("height");i&&(i.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const a=this.shadowRoot.getElementById("show_grid");a&&(a.checked=this._config.show_grid!==!1);const n=this.shadowRoot.getElementById("show_map");n&&(n.checked=this._config.show_map!==!1);const h=this.shadowRoot.getElementById("show_rings");h&&(h.checked=this._config.show_rings!==!1);const s=this.shadowRoot.getElementById("show_heatmap");s&&(s.checked=this._config.show_heatmap!==!1);const l=this.shadowRoot.getElementById("auto_orbit");l&&(l.checked=this._config.auto_orbit!==!1);const r=this.shadowRoot.getElementById("show_weather");r&&(r.checked=this._config.show_weather!==!1);const o=this.shadowRoot.getElementById("show_daynight");o&&(o.checked=this._config.show_daynight!==!1);const c=this.shadowRoot.getElementById("min_brightness");c&&(c.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const d=this.shadowRoot.getElementById("elevation_scale");d&&(d.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const p=this.shadowRoot.getElementById("show_3d_features");p&&(p.checked=this._config.show_3d_features===!0),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(i=>{i.addEventListener("change",e=>this.toggleChanged(e))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(i=>{i.addEventListener("input",e=>this.textChanged(e))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",i=>{const e=i.detail&&i.detail.value!=null?i.detail.value:null;this._onEntityPicked(e)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const i=t.target;this.dispatchConfigChange(i.id,i.checked)}textChanged(t){if(!this._config)return;const i=t.target;let e=i.value;if(i.id==="zoom_level"||i.id==="min_brightness"||i.id==="elevation_scale"){const a=parseFloat(e);isNaN(a)||(e=a)}this.dispatchConfigChange(i.id,e)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=e=>e.attributes&&Array.isArray(e.attributes.stations)&&e.attributes.icon==="mdi:lightning-bolt";const i=this._config&&this._config.entity_id?this._config.entity_id:null;t.value!==i&&(t.value=i)}_onEntityPicked(t){let i;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(i=t.slice(7,-9));const e={...this._config,entity_id:t||void 0,entry_id:i||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}dispatchConfigChange(t,i){if(this._config[t]===i)return;const e={...this._config,[t]:i},a=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(a)}}customElements.define("weatherflow-lightning-card-editor",V);export{};
