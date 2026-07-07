/* AUTO-GENERATED — do not edit. Source: src/weatherflow-lightning-card.ts. Run: npm run build */
class j extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.initialized=!1,this.knownStrikes=new Set,this.stations=[{id:"Primary (Home)",x:0,z:0,color:1096065},{id:"Neighbor 1",x:10,z:10,color:3718648},{id:"Neighbor 2",x:-10,z:10,color:3718648}],this.domeRings=[],this.strikeLayer=null,this.strikeHistory=[],this.isPlaying=!1,this.playbackMode="live",this.playbackTime=Date.now(),this.playbackSpeed=120,this.lastTickTime=Date.now(),this.lastPlayTickTime=Date.now(),this.lastInteractionTime=Date.now(),this.heatmapMeshes=new Map,this.elevationGrid=[],this.glowTexture=null,this.heatGeo=null,this.lastRefLat=null,this.lastRefLon=null,this.windSpeed=0,this.windDirection=0,this.solarRadiation=1e3,this.rainRate=0,this.rainParticles=null,this.windParticles=null,this.lastFrameTime=null}static getConfigElement(){return document.createElement("weatherflow-lightning-card-editor")}static getStubConfig(){return{height:"350px"}}setConfig(t){if(!t)throw new Error("Invalid configuration");const s=this.config;if(this.config={height:"350px",show_grid:!0,show_map:!0,show_rings:!0,show_heatmap:!0,auto_orbit:!0,zoom_level:18,show_weather:!0,show_daynight:!0,min_brightness:.8,elevation_scale:1.5,show_3d_features:!1,playback_speed:120,...t},this.playbackSpeed=parseFloat(this.config.playback_speed)||120,this.speedSelect&&(this.speedSelect.value=this.playbackSpeed.toString()),this.container){const e=this.config.height;if(e.endsWith("px")){const a=parseInt(e);this.container.style.height=`${a-40}px`}else this.container.style.height=e}this.initialized&&this.applyConfigChanges(s||{})}applyConfigChanges(t){if(this.terrainWire&&(this.terrainWire.visible=this.config.show_grid!==!1),this.rangeRingsGroup&&(this.rangeRingsGroup.visible=this.config.show_rings!==!1),this.config.show_weather===!1?(this.rainParticles&&(this.rainParticles.visible=!1),this.windParticles&&(this.windParticles.visible=!1),this.weatherOverlay&&(this.weatherOverlay.style.display="none")):this.weatherOverlay&&(this.weatherOverlay.style.display="flex"),t.show_map!==this.config.show_map&&(this.config.show_map?this.lastRefLat&&this.lastRefLon&&this.loadMapTexture(this.lastRefLat,this.lastRefLon):this.terrainMesh&&this.terrainMesh.material&&(this.terrainMesh.material.map=null,this.terrainMesh.material.color.setHex(330516),this.terrainMesh.material.needsUpdate=!0)),(t.show_daynight!==this.config.show_daynight||t.min_brightness!==this.config.min_brightness)&&this.updateDayNightEngine(),t.zoom_level!==this.config.zoom_level){const s=parseFloat(this.config.zoom_level);isNaN(s)||(this.zoomRadius=s,this.updateCameraPosition())}t.elevation_scale!==this.config.elevation_scale&&(this.elevationGrid&&this.elevationGrid.length===225?this.updateTerrainGeometry(this.elevationGrid):this.generateProceduralTerrain()),t.show_3d_features!==this.config.show_3d_features&&(this.config.show_3d_features?this.lastRefLat&&this.lastRefLon&&this.loadVectorData(this.lastRefLat,this.lastRefLon):(this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup=null),this.vectorDataLoaded=!1))}connectedCallback(){if(window.THREE)this.initVisualizer();else{const t=document.createElement("script");t.src="/weatherflow_lightning_trilateration/three.min.js",t.onload=()=>this.initVisualizer(),document.head.appendChild(t)}}disconnectedCallback(){this.cleanupThreeJS()}cleanupThreeJS(){if(this.isPlaying=!1,this.animationFrameId&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this._mouseupHandler&&(window.removeEventListener("mouseup",this._mouseupHandler),this._mouseupHandler=null),this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.disposeHierarchy(this.features3DGroup),this.features3DGroup=null),this.stationMeshes&&(this.stationMeshes.forEach(t=>{this.scene.remove(t.mesh),this.disposeHierarchy(t.mesh)}),this.stationMeshes=[]),this.heatmapMeshes){for(const t of this.heatmapMeshes.values())this.scene.remove(t.mesh),t.material&&t.material.dispose();this.heatmapMeshes.clear()}this.rangeRingsGroup&&(this.scene.remove(this.rangeRingsGroup),this.disposeHierarchy(this.rangeRingsGroup),this.rangeRingsGroup=null),this.strikeLayer&&(this.scene.remove(this.strikeLayer),this.disposeHierarchy(this.strikeLayer),this.strikeLayer=null),this.terrainMapMesh&&(this.scene.remove(this.terrainMapMesh),this.terrainMapMesh.geometry&&this.terrainMapMesh.geometry.dispose(),this.terrainMapMesh.material&&(this.terrainMapMesh.material.map&&this.terrainMapMesh.material.map.dispose(),this.terrainMapMesh.material.dispose())),this.terrainMesh&&(this.scene.remove(this.terrainMesh),this.terrainMesh.geometry&&this.terrainMesh.geometry.dispose(),this.terrainMesh.material&&this.terrainMesh.material.dispose()),this.terrainWire&&(this.scene.remove(this.terrainWire),this.terrainWire.geometry&&this.terrainWire.geometry.dispose(),this.terrainWire.material&&this.terrainWire.material.dispose()),this.starField&&(this.scene.remove(this.starField),this.starField.geometry&&this.starField.geometry.dispose(),this.starField.material&&this.starField.material.dispose()),this.rainParticles&&(this.scene.remove(this.rainParticles),this.rainParticles.geometry&&this.rainParticles.geometry.dispose(),this.rainParticles.material&&this.rainParticles.material.dispose()),this.windParticles&&(this.scene.remove(this.windParticles),this.windParticles.geometry&&this.windParticles.geometry.dispose(),this.windParticles.material&&this.windParticles.material.dispose()),this.heatGeo&&this.heatGeo.dispose(),this.glowTexture&&this.glowTexture.dispose(),this.ambientLight&&this.scene.remove(this.ambientLight),this.dirLight&&this.scene.remove(this.dirLight),this.renderer&&(this.renderer.domElement&&this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement),this.renderer.dispose(),this.renderer=null),this.wrapper&&this.wrapper.parentNode&&(this.wrapper.parentNode.removeChild(this.wrapper),this.wrapper=null),this.initialized=!1}disposeHierarchy(t){t&&t.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&(Array.isArray(s.material)?s.material.forEach(e=>e.dispose()):s.material.dispose())})}updateCameraPosition(){this.cameraPhi=Math.max(.1,Math.min(Math.PI/2-.05,this.cameraPhi)),this.zoomRadius=Math.max(2,Math.min(150,this.zoomRadius)),this.cameraTarget||(this.cameraTarget=new THREE.Vector3(0,0,0));const t=this.zoomRadius*Math.sin(this.cameraPhi)*Math.sin(this.cameraTheta),s=this.zoomRadius*Math.cos(this.cameraPhi),e=this.zoomRadius*Math.sin(this.cameraPhi)*Math.cos(this.cameraTheta);this.camera&&(this.camera.position.set(this.cameraTarget.x+t,this.cameraTarget.y+s,this.cameraTarget.z+e),this.camera.lookAt(this.cameraTarget))}initVisualizer(){if(this.initialized)return;this.initialized=!0,this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.width="100%",this.wrapper.style.display="flex",this.wrapper.style.flexDirection="column",this.wrapper.style.backgroundColor="#02040a",this.wrapper.style.borderRadius="12px",this.wrapper.style.overflow="hidden",this.wrapper.style.border="1px solid rgba(56, 189, 248, 0.15)",this.shadowRoot.appendChild(this.wrapper),this.container=document.createElement("div"),this.container.style.position="relative",this.container.style.width="100%";const t=this.config.height||"350px";if(t.endsWith("px")){const i=parseInt(t);this.container.style.height=`${i-40}px`}else this.container.style.height=t;this.container.style.overflow="hidden",this.container.style.cursor="grab",this.container.style.userSelect="none",this.container.style.webkitUserSelect="none",this.container.style.touchAction="none",this.wrapper.appendChild(this.container),this.createPlaybackControls(),this.scene=new THREE.Scene,this.scene.fog=new THREE.FogExp2(132106,.005);const s=this.container.clientWidth/this.container.clientHeight;this.camera=new THREE.PerspectiveCamera(60,s,.1,1e3),this.zoomRadius=this.config.zoom_level!==void 0?parseFloat(this.config.zoom_level):18,this.cameraTheta=0,this.cameraPhi=Math.PI/4,this.cameraTarget=new THREE.Vector3(0,0,0),this.updateCameraPosition(),this.renderer=new THREE.WebGLRenderer({antialias:!0}),this.renderer.setSize(this.container.clientWidth,this.container.clientHeight),this.renderer.setClearColor(132106,1),this.renderer.setPixelRatio(window.devicePixelRatio||1),this.renderer.toneMapping=THREE.ACESFilmicToneMapping,this.renderer.toneMappingExposure=1,this.container.appendChild(this.renderer.domElement),this.tooltip=document.createElement("div"),this.tooltip.style.position="absolute",this.tooltip.style.backgroundColor="rgba(8, 12, 20, 0.95)",this.tooltip.style.color="#e2e8f0",this.tooltip.style.padding="8px 12px",this.tooltip.style.borderRadius="6px",this.tooltip.style.border="1px solid rgba(56, 189, 248, 0.4)",this.tooltip.style.fontSize="12px",this.tooltip.style.pointerEvents="none",this.tooltip.style.display="none",this.tooltip.style.zIndex="10",this.tooltip.style.fontFamily="sans-serif",this.tooltip.style.boxShadow="0 4px 12px rgba(0, 0, 0, 0.5)",this.container.appendChild(this.tooltip);const e=document.createElement("style");e.textContent=`
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
    `,this.container.appendChild(e),this.weatherOverlay=document.createElement("div"),this.weatherOverlay.className="weather-telemetry-hud",this.weatherOverlay.style.display=this.config.show_weather!==!1?"flex":"none",this.container.appendChild(this.weatherOverlay),this.hudCollapsed=!1;const a=i=>i.stopPropagation();["mousedown","mousemove","mouseup","click","touchstart","touchmove","touchend","wheel"].forEach(i=>{this.weatherOverlay.addEventListener(i,a)}),this.weatherOverlay.addEventListener("click",i=>{(i.target.closest(".hud-toggle-btn")||this.hudCollapsed)&&(i.stopPropagation(),this.hudCollapsed=!this.hudCollapsed,this.hudCollapsed?(this.weatherOverlay.classList.add("collapsed"),this.weatherOverlay.title="Expand Weather HUD"):(this.weatherOverlay.classList.remove("collapsed"),this.weatherOverlay.removeAttribute("title")),this.updateWeatherOverlay())}),this.raycaster=new THREE.Raycaster,this.mouse=new THREE.Vector2,this.glowTexture=this.createGlowTexture(),this.heatGeo=new THREE.SphereGeometry(.15,8,8),this.lastInteractionTime=Date.now();let l=!1,o=!1,c={x:0,y:0};this.container.addEventListener("contextmenu",i=>{i.preventDefault()}),this.container.addEventListener("mousedown",i=>{this.lastInteractionTime=Date.now(),i.button===2||i.button===1||i.shiftKey?(o=!0,l=!1,this.container.style.cursor="move"):(l=!0,o=!1,this.container.style.cursor="grabbing"),c={x:i.clientX,y:i.clientY}}),this.container.addEventListener("mousemove",i=>{if(this.lastInteractionTime=Date.now(),l){const n=i.clientX-c.x,d=i.clientY-c.y;this.cameraTheta-=n*.005,this.cameraPhi+=d*.005,this.updateCameraPosition(),c={x:i.clientX,y:i.clientY}}else if(o){const n=i.clientX-c.x,d=i.clientY-c.y,p=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion),u=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion),m=this.zoomRadius*.0015;this.cameraTarget.addScaledVector(p,-n*m),this.cameraTarget.addScaledVector(u,d*m),this.cameraTarget.x=Math.max(-30,Math.min(30,this.cameraTarget.x)),this.cameraTarget.y=Math.max(-5,Math.min(15,this.cameraTarget.y)),this.cameraTarget.z=Math.max(-30,Math.min(30,this.cameraTarget.z)),this.updateCameraPosition(),c={x:i.clientX,y:i.clientY}}else{const n=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(i.clientX-n.left)/n.width*2-1,this.mouse.y=-((i.clientY-n.top)/n.height)*2+1,this.checkHover(i.clientX-n.left,i.clientY-n.top)}}),this._mouseupHandler=()=>{l=!1,o=!1,this.container.style.cursor="grab"},window.addEventListener("mouseup",this._mouseupHandler),this.container.addEventListener("mouseleave",()=>{this.hideTooltip()}),this.container.addEventListener("wheel",i=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),i.preventDefault(),this.zoomRadius+=i.deltaY*.02,this.updateCameraPosition()},{passive:!1});let h=0;this.container.addEventListener("touchstart",i=>{this.lastInteractionTime=Date.now(),this.hideTooltip(),i.touches.length===1?(l=!0,c={x:i.touches[0].clientX,y:i.touches[0].clientY}):i.touches.length===2&&(l=!1,h=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY))}),this.container.addEventListener("touchmove",i=>{if(this.lastInteractionTime=Date.now(),i.preventDefault(),i.touches.length===1&&l){const n=i.touches[0].clientX-c.x,d=i.touches[0].clientY-c.y;this.cameraTheta-=n*.007,this.cameraPhi+=d*.007,this.updateCameraPosition(),c={x:i.touches[0].clientX,y:i.touches[0].clientY}}else if(i.touches.length===2){const n=Math.hypot(i.touches[0].clientX-i.touches[1].clientX,i.touches[0].clientY-i.touches[1].clientY),d=n-h;this.zoomRadius-=d*.15,this.updateCameraPosition(),h=n}},{passive:!1}),this.container.addEventListener("touchend",()=>{l=!1}),this.addStaticElements(),this.initWeatherSystem(),this.updateDayNightEngine(),this.addWeatherStations(),this.generateProceduralTerrain(),this.strikeLayer=new THREE.Group,this.scene.add(this.strikeLayer),this.resizeObserver=new ResizeObserver(()=>{if(this.renderer&&this.container){const i=this.container.clientWidth,n=this.container.clientHeight;this.camera.aspect=i/n,this.camera.updateProjectionMatrix(),this.renderer.setSize(i,n)}}),this.resizeObserver.observe(this.container),this.animateLoop(),this._hass&&(console.log("WeatherFlow Card: Re-applying cached state on init completion"),this.hass=this._hass)}createGlowTexture(){const t=document.createElement("canvas");t.width=64,t.height=64;const s=t.getContext("2d"),e=s.createRadialGradient(32,32,0,32,32,32);return e.addColorStop(0,"rgba(0, 242, 254, 1.0)"),e.addColorStop(.2,"rgba(0, 242, 254, 0.8)"),e.addColorStop(.5,"rgba(239, 68, 68, 0.3)"),e.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=e,s.fillRect(0,0,64,64),new THREE.CanvasTexture(t)}createRingLabelSprite(t){const s=document.createElement("canvas");s.width=128,s.height=64;const e=s.getContext("2d");e.fillStyle="rgba(0, 0, 0, 0)",e.fillRect(0,0,128,64),e.font="bold 24px sans-serif",e.fillStyle="#00f2fe",e.textAlign="center",e.textBaseline="middle",e.fillText(t,64,32);const a=new THREE.CanvasTexture(s),r=new THREE.SpriteMaterial({map:a,transparent:!0,depthWrite:!1,depthTest:!0}),l=new THREE.Sprite(r);return l.scale.set(2,1,1),l}addRangeRings(){this.rangeRingsGroup=new THREE.Group,this.rangeRingsGroup.visible=this.config.show_rings!==!1,this.scene.add(this.rangeRingsGroup);const t=[10,20,30];t.forEach(n=>{const d=[];for(let w=0;w<=128;w++){const f=w/128*Math.PI*2,g=n*Math.cos(f),E=n*Math.sin(f);d.push(new THREE.Vector3(g,.05,E))}const u=new THREE.BufferGeometry().setFromPoints(d),m=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.5}),y=new THREE.Line(u,m);this.rangeRingsGroup.add(y)});const s=new THREE.LineBasicMaterial({color:62206,transparent:!0,opacity:.3}),e=[],a=40;for(let n=0;n<=a;n++){const d=-30+n/a*60;e.push(new THREE.Vector3(0,.05,d))}const r=new THREE.BufferGeometry().setFromPoints(e),l=new THREE.Line(r,s);this.rangeRingsGroup.add(l);const o=[];for(let n=0;n<=a;n++){const d=-30+n/a*60;o.push(new THREE.Vector3(d,.05,0))}const c=new THREE.BufferGeometry().setFromPoints(o),h=new THREE.Line(c,s);this.rangeRingsGroup.add(h);const i=Math.SQRT2/2;this.ringLabels=[],t.forEach(n=>{const d=this.createRingLabelSprite(`${n}km`);d.position.set(n*i,.5,-n*i),this.rangeRingsGroup.add(d),this.ringLabels.push({sprite:d,r:n})})}updateRangeRings(){if(!this.rangeRingsGroup||!this.rangeRingsGroup.children)return;const t=this.rangeRingsGroup.children;[10,20,30].forEach((l,o)=>{const c=t[o];if(c){const h=c.geometry.attributes.position,i=128;for(let n=0;n<=i;n++){const d=n/i*Math.PI*2,p=l*Math.cos(d),u=l*Math.sin(d),m=this.getTerrainHeight(p,u)+.1;h.setY(n,m)}h.needsUpdate=!0}});const e=t[3];if(e){const l=e.geometry.attributes.position,o=40;for(let c=0;c<=o;c++){const h=-30+c/o*60,i=this.getTerrainHeight(0,h)+.1;l.setXYZ(c,0,i,h)}l.needsUpdate=!0}const a=t[4];if(a){const l=a.geometry.attributes.position,o=40;for(let c=0;c<=o;c++){const h=-30+c/o*60,i=this.getTerrainHeight(h,0)+.1;l.setXYZ(c,h,i,0)}l.needsUpdate=!0}const r=Math.SQRT2/2;this.ringLabels&&this.ringLabels.forEach(l=>{const o=l.r*r,c=-l.r*r,h=this.getTerrainHeight(o,c)+.4;l.sprite.position.set(o,h,c)})}getTerrainHeight(t,s){if(!this.elevationGrid||this.elevationGrid.length!==225)return 0;const e=(t+20)*14/40,a=(s+20)*14/40;if(e<0||e>14||a<0||a>14)return 0;const r=Math.floor(e),l=Math.min(14,r+1),o=Math.floor(a),c=Math.min(14,o+1),h=e-r,i=a-o,n=this.getGridHeight(o,r),d=this.getGridHeight(o,l),p=this.getGridHeight(c,r),u=this.getGridHeight(c,l),m=n*(1-h)+d*h,y=p*(1-h)+u*h;return m*(1-i)+y*i}getGridHeight(t,s){return this.scaledHeights?this.scaledHeights[(14-t)*15+s]:0}generateProceduralTerrain(){this.elevationGrid=[];for(let r=0;r<15;r++){const l=r-7;for(let o=0;o<15;o++){const c=o-7,h=Math.sqrt(l*l+c*c);let i=80+Math.sin(l*.4)*Math.cos(c*.4)*45;if(i+=Math.sin(h*.8)*15,r===7&&o===7)i=100;else{const n=Math.min(1,h/3);i=100*(1-n)+i*n}this.elevationGrid.push(i)}}const t=100,e=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let r=0;r<225;r++)this.scaledHeights[r]=((this.elevationGrid[r]||0)-t)*e;const a=this.terrainGeo.attributes.position;for(let r=0;r<=14;r++){const l=14-r;for(let o=0;o<=14;o++){const c=o,h=r*15+o,i=this.scaledHeights[l*15+c];a.setZ(h,i)}}a.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}loadMapTexture(t,s){if(this.config.show_map===!1){this.terrainMapMesh&&(this.terrainMapMesh.visible=!1);return}this.terrainMapMesh&&(this.terrainMapMesh.visible=!0);const e=10,a=40,r=a/111.1,l=Math.cos(t*Math.PI/180),o=l>0?a/(111.1*l):a/111.1,c=t-r/2,h=t+r/2,i=s-o/2,n=s+o/2,d=(x,b)=>(x+180)/360*Math.pow(2,b),p=(x,b)=>(1-Math.log(Math.tan(x*Math.PI/180)+1/Math.cos(x*Math.PI/180))/Math.PI)/2*Math.pow(2,b),u=(x,b)=>x/Math.pow(2,b)*360-180,m=(x,b)=>Math.atan(Math.sinh(Math.PI-2*Math.PI*x/Math.pow(2,b)))*180/Math.PI,y=Math.floor(d(i,e)),w=Math.floor(d(n,e)),f=Math.floor(p(h,e)),g=Math.floor(p(c,e)),E=document.createElement("canvas");E.width=1024,E.height=1024;const k=E.getContext("2d");k.fillStyle="#050b14",k.fillRect(0,0,1024,1024);const G=[];for(let x=y;x<=w;x++)for(let b=f;b<=g;b++){const A=u(x,e),F=u(x+1,e),B=m(b+1,e),W=m(b,e),D=(A-i)/(n-i),R=(F-i)/(n-i),H=(B-c)/(h-c),I=(W-c)/(h-c),C=D*1024,P=(1-I)*1024,v=(R-D)*1024,_=(I-H)*1024,M=`https://basemaps.cartocdn.com/dark_all/${e}/${x}/${b}.png`,S=new Promise(T=>{const L=new Image;L.crossOrigin="anonymous",L.onload=()=>{k.drawImage(L,C,P,v,_),T()},L.onerror=()=>T(),L.src=M});G.push(S)}Promise.all(G).then(()=>{const x=new THREE.CanvasTexture(E);this.terrainMapMesh&&this.terrainMapMesh.material&&(this.terrainMapMesh.material.map=x,this.terrainMapMesh.material.color.setHex(16777215),this.terrainMapMesh.material.needsUpdate=!0)})}async loadVectorData(t,s){this.vectorDataLoading=!0;try{const e=await this._hass.callApi("GET","weatherflow_lightning/vector_data");this.render3DFeatures(e,t,s),this.vectorDataLoaded=!0}catch(e){console.error("Failed to load 3D vector features:",e)}finally{this.vectorDataLoading=!1}}render3DFeatures(t,s,e){if(!this.scene)return;this.features3DGroup&&(this.scene.remove(this.features3DGroup),this.features3DGroup.traverse(l=>{l.geometry&&l.geometry.dispose(),l.material&&(Array.isArray(l.material)?l.material.forEach(o=>o.dispose()):l.material.dispose())})),this.features3DGroup=new THREE.Group,this.scene.add(this.features3DGroup);const a=6371,r=Math.cos(s*Math.PI/180);if(t.water&&Array.isArray(t.water)){const l=new THREE.MeshPhongMaterial({color:165063,transparent:!0,opacity:.5,side:THREE.DoubleSide,flatShading:!0});t.water.forEach(o=>{if(!o.coordinates||o.coordinates.length<3)return;const c=[];let h=0,i=0;if(o.coordinates.forEach(u=>{const m=u[0],y=u[1],w=a*(y-e)*(Math.PI/180)*r,f=-a*(m-s)*(Math.PI/180);w<-20||w>20||f<-20||f>20||(c.push(new THREE.Vector2(w,-f)),h+=this.getTerrainHeight(w,f),i++)}),c.length<3)return;h/=i;const n=new THREE.Shape(c),d=new THREE.ShapeGeometry(n),p=new THREE.Mesh(d,l);p.rotation.x=-Math.PI/2,p.position.y=h+.08,this.features3DGroup.add(p)})}if(t.forest&&Array.isArray(t.forest)){const l=[],o=new THREE.MeshPhongMaterial({color:1332013,transparent:!0,opacity:.45,side:THREE.DoubleSide,flatShading:!0}),c=[],h=[],i=[];let n=0;const d=1500,p=(R,H)=>{const I=R[0],C=R[1];let P=!1;for(let v=0,_=H.length-1;v<H.length;_=v++){const M=H[v][0],S=H[v][1],T=H[_][0],L=H[_][1];S>C!=L>C&&I<(T-M)*(C-S)/(L-S)+M&&(P=!P)}return P};t.forest.forEach(R=>{if(!R.coordinates||R.coordinates.length<3)return;const H=[];let I=0,C=0;const P=R.coordinates.map(v=>{const _=v[0],M=v[1],S=a*(M-e)*(Math.PI/180)*r,T=-a*(_-s)*(Math.PI/180);return S>=-20&&S<=20&&T>=-20&&T<=20&&(H.push(new THREE.Vector2(S,-T)),I+=this.getTerrainHeight(S,T),C++),[S,T]});if(l.push(P),H.length>=3){I/=C;const v=new THREE.Shape(H),_=new THREE.ShapeGeometry(v),M=new THREE.Mesh(_,o);M.rotation.x=-Math.PI/2,M.position.y=I+.06,this.features3DGroup.add(M)}if(P.length>0&&n<d){let v=0,_=0;P.forEach(V=>{v+=V[0],_+=V[1]});const M=Math.max(-19.5,Math.min(19.5,v/P.length)),S=Math.max(-19.5,Math.min(19.5,_/P.length)),T=this.getTerrainHeight(M,S),L=.85+Math.random()*.4,O=Math.random()*Math.PI*2,z=new THREE.Object3D;z.position.set(M,T,S),z.rotation.y=O,z.scale.set(L,L,L),z.updateMatrix();const N=Math.random();N<.33?c.push(z.matrix.clone()):N<.66?h.push(z.matrix.clone()):i.push(z.matrix.clone()),n++}});const u=.45,m=u*.35,y=R=>{for(const H of l)if(p(R,H))return!0;return!1};for(let R=-19.5;R<=19.5;R+=u)for(let H=-19.5;H<=19.5&&!(n>=d);H+=u){const I=R+(Math.random()*2-1)*m,C=H+(Math.random()*2-1)*m,P=Math.max(-19.5,Math.min(19.5,I)),v=Math.max(-19.5,Math.min(19.5,C));if(y([P,v])){const _=this.getTerrainHeight(P,v),M=.85+Math.random()*.4,S=Math.random()*Math.PI*2,T=new THREE.Object3D;T.position.set(P,_,v),T.rotation.y=S,T.scale.set(M,M,M),T.updateMatrix();const L=Math.random();L<.33?c.push(T.matrix.clone()):L<.66?h.push(T.matrix.clone()):i.push(T.matrix.clone()),n++}}const w=(R,H,I,C,P)=>{if(R.length===0)return;const v=new THREE.InstancedMesh(H,I,R.length);R.forEach((_,M)=>v.setMatrixAt(M,_)),v.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(v);for(let _=0;_<C.length;_++){const M=new THREE.InstancedMesh(C[_],P[_],R.length);R.forEach((S,T)=>M.setMatrixAt(T,S)),M.instanceMatrix.needsUpdate=!0,this.features3DGroup.add(M)}},f=new THREE.CylinderGeometry(.04,.04,.2,4);f.translate(0,.1,0);const g=new THREE.MeshPhongMaterial({color:4007959,flatShading:!0}),E=new THREE.MeshPhongMaterial({color:998171,flatShading:!0}),k=[new THREE.ConeGeometry(.18,.3,5).translate(0,.3,0),new THREE.ConeGeometry(.14,.25,5).translate(0,.45,0),new THREE.ConeGeometry(.1,.2,5).translate(0,.6,0)];w(c,f,g,k,[E,E,E]);const G=new THREE.CylinderGeometry(.06,.08,.25,5);G.translate(0,.125,0);const x=new THREE.MeshPhongMaterial({color:6045747,flatShading:!0}),b=new THREE.MeshPhongMaterial({color:2263842,flatShading:!0}),A=[new THREE.SphereGeometry(.18,6,6).translate(-.05,.3,0),new THREE.SphereGeometry(.2,6,6).translate(.05,.35,0)];w(h,G,x,A,[b,b]);const F=new THREE.CylinderGeometry(.03,.03,.3,4);F.translate(0,.15,0);const B=new THREE.MeshPhongMaterial({color:13882323,flatShading:!0}),W=new THREE.MeshPhongMaterial({color:9498256,flatShading:!0}),D=new THREE.SphereGeometry(.15,6,6);D.scale(1,1.8,1),D.translate(0,.4,0),w(i,F,B,[D],[W])}}_paintHypsometricColours(){if(!this.scaledHeights||!this.terrainGeo)return;let t=1/0,s=-1/0;for(let o=0;o<225;o++)this.scaledHeights[o]<t&&(t=this.scaledHeights[o]),this.scaledHeights[o]>s&&(s=this.scaledHeights[o]);const e=s-t||1,a=[{t:0,r:.05,g:.15,b:.05},{t:.35,r:.12,g:.28,b:.08},{t:.55,r:.3,g:.22,b:.08},{t:.75,r:.45,g:.3,b:.18},{t:1,r:.82,g:.8,b:.78}],r=o=>{let c=a[0],h=a[a.length-1];for(let n=0;n<a.length-1;n++)if(o>=a[n].t&&o<=a[n+1].t){c=a[n],h=a[n+1];break}const i=h.t===c.t?0:(o-c.t)/(h.t-c.t);return{r:c.r+(h.r-c.r)*i,g:c.g+(h.g-c.g)*i,b:c.b+(h.b-c.b)*i}},l=this.terrainGeo.attributes.color;for(let o=0;o<=14;o++){const c=14-o;for(let h=0;h<=14;h++){const n=(this.scaledHeights[c*15+h]-t)/e,d=r(Math.max(0,Math.min(1,n))),p=o*15+h;l.setXYZ(p,d.r,d.g,d.b)}}l.needsUpdate=!0}updateTerrainGeometry(t){if(!t||t.length!==225){this.generateProceduralTerrain();return}this.elevationGrid=t;const s=7*15+7,e=t[s]||0,r=(this.config.elevation_scale!==void 0?parseFloat(this.config.elevation_scale):1.5)/1e3;this.scaledHeights=new Float32Array(225);for(let o=0;o<225;o++)this.scaledHeights[o]=((t[o]||0)-e)*r;const l=this.terrainGeo.attributes.position;for(let o=0;o<=14;o++){const c=14-o;for(let h=0;h<=14;h++){const i=h,n=o*15+h,d=this.scaledHeights[c*15+i];l.setZ(n,d)}}l.needsUpdate=!0,this.terrainGeo.computeVertexNormals(),this._paintHypsometricColours(),this.updateStationHeights(),this.updateRangeRings()}updateStationHeights(){!this.stationMeshes||!this.stations||this.stations.forEach((t,s)=>{const e=this.stationMeshes[s];if(e&&e.mesh){const a=this.getTerrainHeight(t.x,t.z);e.mesh.position.y=a}})}showTooltip(t,s,e){if(!this.tooltip)return;let a="Discovered Station";t.type==="primary"?a="Primary Station":t.type==="neighbor"&&(a="Neighbor Station"),this.tooltip.innerHTML=`
      <div style="font-weight: bold; color: #38bdf8; margin-bottom: 2px;">ID: ${t.id}</div>
      <div style="font-size: 11px; color: #94a3b8;">Type: ${a}</div>
      <div style="font-size: 11px; color: #94a3b8;">Coords: ${t.x.toFixed(2)}, ${t.z.toFixed(2)} km</div>
    `,this.tooltip.style.display="block";const r=this.container.getBoundingClientRect();let l=s+15,o=e+15;l+150>r.width&&(l=s-165),o+60>r.height&&(o=e-75),this.tooltip.style.left=`${l}px`,this.tooltip.style.top=`${o}px`}hideTooltip(){this.tooltip&&(this.tooltip.style.display="none")}checkHover(t,s){if(!this.camera||!this.stationMeshes||!this.raycaster)return;this.raycaster.setFromCamera(this.mouse,this.camera);const e=this.raycaster.intersectObjects(this.stationMeshes.map(a=>a.mesh),!0);if(e.length>0){let a=e[0].object;for(;a&&a.parent&&(!a.userData||!a.userData.station);)a=a.parent;if(a&&a.userData&&a.userData.station){const r=a.userData.station;this.showTooltip(r,t,s),this.container.style.cursor="pointer";return}}this.hideTooltip(),this.container.style.cursor==="pointer"&&(this.container.style.cursor="grab")}updateHeatmap(){if(!this.scene)return;const t=9e4,s=this.playbackTime;this.heatmapMeshes||(this.heatmapMeshes=new Map);const e=new Set;for(let a=0;a<this.strikeHistory.length;a++){const r=this.strikeHistory[a],l=s-r.time;if(l>=0&&l<=t){e.add(r.id);const o=l/t,c=.7*(1-o),h=1-o*.4;let i=this.heatmapMeshes.get(r.id);if(i)i.material.opacity=c,i.mesh.scale.set(h,h,h),i.mesh.position.y=this.getTerrainHeight(r.x,r.z);else{const n=new THREE.MeshBasicMaterial({color:16096779,transparent:!0,opacity:c,depthWrite:!1}),d=new THREE.Mesh(this.heatGeo,n),p=this.getTerrainHeight(r.x,r.z);d.position.set(r.x,p,r.z),d.scale.set(h,h,h),this.scene.add(d),i={mesh:d,material:n},this.heatmapMeshes.set(r.id,i)}}}for(const[a,r]of this.heatmapMeshes.entries())e.has(a)||(this.scene.remove(r.mesh),r.material&&r.material.dispose(),this.heatmapMeshes.delete(a))}addStaticElements(){this.ambientLight=new THREE.HemisphereLight(3359061,659744,1.5),this.scene.add(this.ambientLight),this._skyCanvas=document.createElement("canvas"),this._skyCanvas.width=2,this._skyCanvas.height=128,this._skyTexture=new THREE.CanvasTexture(this._skyCanvas);const t=new THREE.SphereGeometry(450,16,8),s=new THREE.MeshBasicMaterial({map:this._skyTexture,side:THREE.BackSide,depthWrite:!1,fog:!1});this._skyDome=new THREE.Mesh(t,s),this.scene.add(this._skyDome),this._paintSkyGradient(0),this.dirLight=new THREE.DirectionalLight(3718648,1),this.dirLight.position.set(5,10,7),this.scene.add(this.dirLight);const e=new THREE.BufferGeometry,a=500,r=new Float32Array(a*3);for(let u=0;u<a*3;u+=3){const m=100+Math.random()*50,y=Math.random(),w=Math.random(),f=y*2*Math.PI,g=Math.acos(2*w-1);r[u]=m*Math.sin(g)*Math.cos(f),r[u+1]=m*Math.sin(g)*Math.sin(f),r[u+2]=m*Math.cos(g)}e.setAttribute("position",new THREE.BufferAttribute(r,3));const l=new THREE.PointsMaterial({color:16777215,size:.5,transparent:!0,opacity:.6});this.starField=new THREE.Points(e,l),this.scene.add(this.starField);const o=40,c=new THREE.PlaneGeometry(o,o),h=new THREE.MeshBasicMaterial({color:330516,side:THREE.FrontSide});this.terrainMapMesh=new THREE.Mesh(c,h),this.terrainMapMesh.rotation.x=-Math.PI/2,this.terrainMapMesh.position.y=-.2,this.scene.add(this.terrainMapMesh),this.terrainGeo=new THREE.PlaneGeometry(o,o,14,14);const i=15*15,n=new Float32Array(i*3);n.fill(.02),this.terrainGeo.setAttribute("color",new THREE.BufferAttribute(n,3));const d=new THREE.MeshStandardMaterial({vertexColors:!0,roughness:.85,metalness:0,transparent:!0,opacity:.6,side:THREE.FrontSide});this.terrainMesh=new THREE.Mesh(this.terrainGeo,d),this.terrainMesh.rotation.x=-Math.PI/2,this.scene.add(this.terrainMesh);const p=new THREE.MeshBasicMaterial({color:62206,wireframe:!0,transparent:!0,opacity:.15});this.terrainWire=new THREE.Mesh(this.terrainGeo,p),this.terrainWire.rotation.x=-Math.PI/2,this.terrainWire.visible=this.config.show_grid!==!1,this.scene.add(this.terrainWire),this.addRangeRings()}addWeatherStations(){this.stationMeshes=[],this.stations.forEach(t=>{const s=new THREE.Group,e=this.getTerrainHeight(t.x,t.z);s.position.set(t.x,e,t.z),s.userData={station:t};const a=new THREE.RingGeometry(.8,1,32),r=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.8,side:THREE.DoubleSide}),l=new THREE.Mesh(a,r);l.rotation.x=-Math.PI/2,l.position.y=.02,s.add(l);const o=new THREE.CylinderGeometry(.08,.08,2.5,8),c=new THREE.MeshBasicMaterial({color:t.color,transparent:!0,opacity:.6}),h=new THREE.Mesh(o,c);h.position.y=1.25,s.add(h);const i=new THREE.SphereGeometry(.25,16,16),n=new THREE.MeshBasicMaterial({color:t.color}),d=new THREE.Mesh(i,n);d.position.y=2.5,s.add(d),this.scene.add(s),this.stationMeshes.push({mesh:s,pulseVal:Math.random()*Math.PI,strikeIntensity:0})})}initWeatherSystem(){const a=new THREE.BufferGeometry,r=new Float32Array(800*3);for(let n=0;n<800*3;n+=3)r[n]=(Math.random()-.5)*40,r[n+1]=18+Math.random()*4,r[n+2]=(Math.random()-.5)*40;a.setAttribute("position",new THREE.BufferAttribute(r,3));const l=new THREE.PointsMaterial({color:9684477,size:.15,transparent:!0,opacity:.6,depthWrite:!1});this.rainParticles=new THREE.Points(a,l),this._rainCloudBase=18,this._rainCloudSpread=4,this.scene.add(this.rainParticles),this.rainParticles.visible=!1;const o=300,c=new THREE.BufferGeometry,h=new Float32Array(o*3);for(let n=0;n<o*3;n+=3)h[n]=(Math.random()-.5)*40,h[n+1]=Math.random()*8,h[n+2]=(Math.random()-.5)*40;c.setAttribute("position",new THREE.BufferAttribute(h,3));const i=new THREE.PointsMaterial({color:3718648,size:.1,transparent:!0,opacity:.3,depthWrite:!1});this.windParticles=new THREE.Points(c,i),this.scene.add(this.windParticles),this.windParticles.visible=!1}updateWeatherOverlay(){if(!this.weatherOverlay)return;const t=(this.windSpeed||0).toFixed(1),s=(this.rainRate||0).toFixed(1),e=this.windDirection||0;if(this.hudCollapsed){this.weatherOverlay.innerHTML=`
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
    `}updateWeatherSystem(t){if(!this.initialized)return;const s=this.config.show_weather!==!1,e=s&&this.rainRate>0,a=s&&this.windSpeed>0,r=(this.windDirection||0)*Math.PI/180,l=Math.sin(r),o=Math.cos(r);if(this.rainParticles&&(this.rainParticles.visible=e,e)){const c=this.rainParticles.geometry.attributes.position,h=c.array,i=c.count,n=-l*(this.windSpeed||0)*.1,d=-o*(this.windSpeed||0)*.1,p=10+Math.min(20,this.rainRate*2);for(let u=0;u<i;u++){const m=u*3;let y=h[m],w=h[m+1],f=h[m+2];w-=p*t,y+=n*t,f+=d*t;const g=this.getTerrainHeight(y,f);(w<g||w<0)&&(w=(this._rainCloudBase||18)+Math.random()*(this._rainCloudSpread||4),y=(Math.random()-.5)*40,f=(Math.random()-.5)*40),h[m]=y,h[m+1]=w,h[m+2]=f}c.needsUpdate=!0}if(this.windParticles&&(this.windParticles.visible=a,a)){const c=this.windParticles.geometry.attributes.position,h=c.array,i=c.count,n=-l*(this.windSpeed||0)*.5,d=-o*(this.windSpeed||0)*.5;for(let p=0;p<i;p++){const u=p*3;let m=h[u],y=h[u+1],w=h[u+2];m+=n*t,w+=d*t,y+=Math.sin(m*.5+w*.5)*.02,(m<-20||m>20||w<-20||w>20)&&(Math.abs(n)>Math.abs(d)?(m=n>0?-20:20,w=(Math.random()-.5)*40):(m=(Math.random()-.5)*40,w=d>0?-20:20),y=Math.random()*8),h[u]=m,h[u+1]=y,h[u+2]=w}c.needsUpdate=!0}}_paintSkyGradient(t){if(!this._skyCanvas||!this._skyTexture)return;const s=this._skyCanvas.getContext("2d"),e=this._skyCanvas.height,a=s.createLinearGradient(0,0,0,e),r=[2,4,10],l=[14,42,90],o=Math.round(r[0]+(l[0]-r[0])*t),c=Math.round(r[1]+(l[1]-r[1])*t),h=Math.round(r[2]+(l[2]-r[2])*t),i=Math.sin(t*Math.PI),n=Math.round(o+60*i),d=Math.round(c+20*i),p=Math.round(h+10*i);a.addColorStop(0,`rgb(${o},${c},${h})`),a.addColorStop(1,`rgb(${Math.min(255,n)},${Math.min(255,d)},${Math.min(255,p)})`),s.fillStyle=a,s.fillRect(0,0,2,e),this._skyTexture.needsUpdate=!0}updateDayNightEngine(){if(!this.initialized||!this.scene)return;if(this.config.show_daynight===!1){this.ambientLight&&(this.ambientLight.color.setHex(3359061),this.ambientLight.groundColor?.setHex(659744),this.ambientLight.intensity=1.5),this.dirLight&&(this.dirLight.color.setHex(3718648),this.dirLight.intensity=1,this.dirLight.position.set(5,10,7)),this.starField&&this.starField.material&&(this.starField.material.opacity=.6,this.starField.visible=!0);const r=new THREE.Color(132106);this.renderer&&this.renderer.setClearColor(r,1),this.scene.fog&&this.scene.fog.color.copy(r),this._paintSkyGradient(0);return}let t=1;if(this._hass&&this._hass.states["sun.sun"]){const r=this._hass.states["sun.sun"],l=r.attributes.elevation!==void 0?parseFloat(r.attributes.elevation):0;l>0?t=1:l<-6?t=0:t=(l+6)/6}else{const r=this.solarRadiation!==void 0?this.solarRadiation:1e3;t=Math.max(0,Math.min(1,r/1e3))}if(this.ambientLight){const r=new THREE.Color(3359061),l=new THREE.Color(12573694),o=new THREE.Color(659744),c=new THREE.Color(1980958);this.ambientLight.color.copy(r).lerp(l,t),this.ambientLight.groundColor&&this.ambientLight.groundColor.copy(o).lerp(c,t);const h=this.config.min_brightness!==void 0?parseFloat(this.config.min_brightness):.8;this.ambientLight.intensity=h+t*(1.5-h)}if(this.dirLight){this.dirLight.intensity=t*1.5;const r=t*Math.PI-Math.PI/2,l=15*Math.sin(r),o=15*Math.cos(r);this.dirLight.position.set(l,o,7);const h=new THREE.Color(16753920),i=new THREE.Color(16707722);this.dirLight.color.copy(h).lerp(i,t)}this.starField&&this.starField.material&&(this.starField.material.opacity=.8*(1-t),this.starField.visible=this.starField.material.opacity>.01);const s=new THREE.Color(132106),e=new THREE.Color(529189),a=s.clone().lerp(e,t);if(this.renderer&&this.renderer.setClearColor(a,1),this.scene.fog){this.scene.fog.color.copy(a);const r=.008,l=.003,o=.01,c=Math.sin(t*Math.PI),h=r+(l-r)*t;this.scene.fog.density=h+(o-r)*c*.5}this._paintSkyGradient(t)}animateLoop(){if(!this.initialized)return;this.animationFrameId=requestAnimationFrame(()=>this.animateLoop()),this.tickPlayback();const t=Date.now(),s=this.lastFrameTime?(t-this.lastFrameTime)/1e3:.016;if(this.lastFrameTime=t,this.updateWeatherSystem(s),this.config.auto_orbit!==!1&&t-this.lastInteractionTime>8e3&&(this.cameraTheta+=5e-4,this.updateCameraPosition()),this.config.show_heatmap!==!1)this.updateHeatmap();else if(this.heatmapMeshes&&this.heatmapMeshes.size>0){for(const e of this.heatmapMeshes.values())this.scene.remove(e.mesh),e.material&&e.material.dispose();this.heatmapMeshes.clear()}this.starField&&(this.starField.rotation.y+=1e-4),this.stationMeshes&&this.stationMeshes.forEach(e=>{e.pulseVal+=.04;const a=Math.sin(e.pulseVal);let r=1+a*.1,l=.5+a*.3;if(e.strikeIntensity&&e.strikeIntensity>0){e.strikeIntensity-=.02;const o=1+e.strikeIntensity*1.5;r*=o,l=Math.min(1,l+e.strikeIntensity*.5),e.mesh.children&&e.mesh.children[2]&&(e.mesh.children[2].scale.set(o,o,o),e.mesh.children[2].material.color.setHex(16777215)),e.mesh.children&&e.mesh.children[1]&&e.mesh.children[1].material.color.setHex(16777215)}else{const o=e.mesh.userData.station.color;e.mesh.children&&e.mesh.children[2]&&(e.mesh.children[2].scale.set(1,1,1),e.mesh.children[2].material.color.setHex(o)),e.mesh.children&&e.mesh.children[1]&&(e.mesh.children[1].scale.set(1,1,1),e.mesh.children[1].material.color.setHex(o))}e.mesh.children&&e.mesh.children[0]&&(e.mesh.children[0].scale.set(r,r,1),e.mesh.children[0].material.opacity=l)}),this.renderer&&this.scene&&this.camera&&this.renderer.render(this.scene,this.camera)}createPlaybackControls(){const t=document.createElement("style");t.textContent=`
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
    `,this.wrapper.appendChild(t),this.controls=document.createElement("div"),this.controls.style.display="flex",this.controls.style.alignItems="center",this.controls.style.padding="8px 12px",this.controls.style.backgroundColor="#080c14",this.controls.style.borderTop="1px solid rgba(56, 189, 248, 0.1)",this.controls.style.gap="12px",this.controls.style.fontFamily="var(--paper-font-body1_-_font-family, inherit)",this.controls.style.color="#e2e8f0",this.wrapper.appendChild(this.controls),this.playBtn=document.createElement("button"),this.playBtn.className="play-btn",this.playBtn.innerHTML=this.getPlayIcon(),this.controls.appendChild(this.playBtn),this.slider=document.createElement("input"),this.slider.type="range",this.slider.className="timeline-slider",this.slider.min="0",this.slider.max="1000",this.slider.value="1000",this.controls.appendChild(this.slider),this.speedSelect=document.createElement("select"),this.speedSelect.className="speed-select";const s=[1,5,10,30,60,120,300,600];s.includes(this.playbackSpeed)||(s.push(this.playbackSpeed),s.sort((e,a)=>e-a)),s.forEach(e=>{const a=document.createElement("option");a.value=e.toString(),a.innerText=`${e}x`,e===this.playbackSpeed&&(a.selected=!0),this.speedSelect.appendChild(a)}),this.controls.appendChild(this.speedSelect),this.timeLabel=document.createElement("span"),this.timeLabel.style.fontSize="12px",this.timeLabel.style.minWidth="130px",this.timeLabel.style.textAlign="right",this.timeLabel.style.color="#94a3b8",this.timeLabel.style.fontVariantNumeric="tabular-nums",this.timeLabel.innerText="Live",this.controls.appendChild(this.timeLabel),this.playBtn.addEventListener("click",()=>this.togglePlay()),this.slider.addEventListener("input",e=>this.handleSliderInput(e)),this.slider.addEventListener("change",()=>this.handleSliderChange()),this.speedSelect.addEventListener("change",e=>{this.playbackSpeed=parseFloat(e.target.value)||120})}getPlayIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M320-203v-554l440 277-440 277Z"/></svg>'}getPauseIcon(){return'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>'}tickPlayback(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5,s=Date.now();if(this.slider&&(this.slider.disabled=!1),this.playbackMode==="live")this.playbackTime=s,this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=s.toString()),this.timeLabel&&(this.timeLabel.innerText="Live");else if(this.isPlaying){const e=Date.now(),a=e-(this.lastPlayTickTime||e);this.lastPlayTickTime=e,this.playbackTime+=a*this.playbackSpeed,this.playbackTime>=s?(this.playbackTime=s,this.setLiveMode()):(this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString(),this.slider.value=this.playbackTime.toString()),this.updateTimeLabel(),this.checkAndTriggerPlaybackStrikes())}else this.slider&&(this.slider.min=t.toString(),this.slider.max=s.toString()),this.updateTimeLabel()}togglePlay(){const t=this.strikeHistory.length>0?Math.min(Date.now()-36e5,this.strikeHistory[0].time):Date.now()-36e5;this.playbackMode==="live"?(this.playbackMode="playback",this.isPlaying=!0,this.lastPlayTickTime=Date.now(),this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})):(this.isPlaying=!this.isPlaying,this.isPlaying&&(this.lastPlayTickTime=Date.now(),this.playbackTime>=Date.now()&&(this.playbackTime=t,this.strikeHistory.forEach(s=>{s.animated=s.time<=this.playbackTime})))),this.updatePlayBtnIcon()}setLiveMode(){this.playbackMode="live",this.isPlaying=!1,this.updatePlayBtnIcon(),this.slider&&(this.slider.value=Date.now()),this.timeLabel&&(this.timeLabel.innerText="Live"),this.strikeHistory.forEach(t=>t.animated=!0)}updatePlayBtnIcon(){this.isPlaying?(this.playBtn.innerHTML=this.getPauseIcon(),this.playBtn.style.color="#ef4444"):(this.playBtn.innerHTML=this.getPlayIcon(),this.playBtn.style.color="#38bdf8")}updateTimeLabel(){const s=new Date(this.playbackTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}),e=Math.round((Date.now()-this.playbackTime)/1e3);let a="";if(e<60)a=`-${e}s`;else{const r=Math.floor(e/60),l=e%60;a=`-${r}m ${l}s`}this.timeLabel&&(this.timeLabel.innerText=`${s} (${a})`)}handleSliderInput(t){this.playbackMode="playback",this.isPlaying=!1,this.playbackTime=parseFloat(t.target.value),this.updatePlayBtnIcon(),this.updateTimeLabel(),this.strikeHistory.forEach(s=>{s.time<=this.playbackTime?s.animated=!0:s.animated=!1})}handleSliderChange(){}checkAndTriggerPlaybackStrikes(){this.strikeHistory.forEach(t=>{t.time<=this.playbackTime?t.animated||(t.animated=!0,this.triggerStrikeAnimation(t.x,t.z,t.stations)):t.animated=!1})}createLightningPath(t,s,e=10){const a=[],r=new THREE.Vector3().subVectors(s,t);a.push(t.clone());for(let l=1;l<e;l++){const o=l/e,c=new THREE.Vector3().addVectors(t,r.clone().multiplyScalar(o)),h=(1-o)*1;c.add(new THREE.Vector3((Math.random()-.5)*h,(Math.random()-.5)*h,(Math.random()-.5)*h)),a.push(c)}return a.push(s.clone()),a}createLightningBranches(t,s,e=8){const a=this.createLightningPath(t,s,e),r=[a];for(let l=1;l<a.length-2;l++)if(Math.random()<.25){const o=a[l].clone(),h=(1-l/a.length)*6,i=new THREE.Vector3().subVectors(s,t).normalize();i.add(new THREE.Vector3((Math.random()-.5)*1.5,-.2,(Math.random()-.5)*1.5)).normalize();const n=new THREE.Vector3().addVectors(o,i.multiplyScalar(h)),d=this.createLightningPath(o,n,4);r.push(d)}return r}triggerStrikeAnimation(t,s,e=[]){if(!this.initialized)return;const a=this.getTerrainHeight(t,s),r=new THREE.Vector3(t,a,s),l=new THREE.Vector3(t+(Math.random()-.5)*4,a+18,s+(Math.random()-.5)*4);if(this.stationMeshes&&this.stationMeshes.forEach(f=>{(!e||e.length===0||e.some(E=>String(E)===String(f.mesh.userData.station.id)))&&(f.strikeIntensity=1)}),this.ambientLight){const f=this.ambientLight.intensity;this.ambientLight.intensity=4;let g=0;const E=()=>{g++,this.ambientLight.intensity=Math.max(f,4*(1-g/8)),g<8&&requestAnimationFrame(E)};requestAnimationFrame(E)}const o=[];this.createLightningBranches(l,r).forEach((f,g)=>{const E=new THREE.CatmullRomCurve3(f),k=g===0,G=new THREE.TubeGeometry(E,Math.max(10,f.length*3),k?.06:.03,5,!1),x=new THREE.MeshStandardMaterial({color:k?16777215:16769126,emissive:k?16766720:16757504,emissiveIntensity:k?3:1.5,transparent:!0,opacity:k?1:.75,depthWrite:!1}),b=new THREE.Mesh(G,x);this.strikeLayer.add(b),o.push(b)});const h=new THREE.SpriteMaterial({map:this.glowTexture,color:16777215,transparent:!0,blending:THREE.AdditiveBlending,depthWrite:!1}),i=new THREE.Sprite(h);i.position.copy(r),i.position.y+=.1,i.scale.set(.1,.1,1),this.strikeLayer.add(i);const n=new THREE.RingGeometry(.1,.2,32),d=new THREE.MeshBasicMaterial({color:15680580,transparent:!0,opacity:.8,side:THREE.DoubleSide}),p=new THREE.Mesh(n,d);p.position.copy(r),p.position.y+=.05,p.rotation.x=-Math.PI/2,this.strikeLayer.add(p);const u=[];this.stations.forEach(f=>{const g=this.getTerrainHeight(f.x,f.z),E=new THREE.Vector3(f.x,g,f.z),k=E.distanceTo(r),G=new THREE.RingGeometry(k-.08,k+.08,64),x=new THREE.MeshBasicMaterial({color:f.color,transparent:!0,opacity:0,side:THREE.DoubleSide}),b=new THREE.Mesh(G,x);b.position.copy(E),b.position.y+=.05,b.rotation.x=-Math.PI/2,this.strikeLayer.add(b),u.push({mesh:b,targetOpacity:.5})});let m=0;const y=60,w=()=>{m++;const f=m/y;if(f<.2?o.forEach(g=>g.material.opacity=Math.random()>.3?1:.2):f<.5?o.forEach(g=>{g.material.opacity=1-(f-.2)/.3}):o.forEach(g=>{g.parent&&(this.strikeLayer.remove(g),g.geometry&&g.geometry.dispose(),g.material&&g.material.dispose())}),f<.6){const g=f*12;i.scale.set(g,g,1),i.material.opacity=1*(1-f/.6)}else i.parent&&(this.strikeLayer.remove(i),i.material.dispose());if(f<.8){const g=1+f*25;p.scale.set(g,g,1),p.material.opacity=.8*(1-f/.8)}else p.parent&&(this.strikeLayer.remove(p),p.geometry&&p.geometry.dispose(),p.material&&p.material.dispose());u.forEach(g=>{f<.3?g.mesh.material.opacity=g.targetOpacity*(f/.3):f<.9?g.mesh.material.opacity=g.targetOpacity*(1-(f-.3)/.6):g.mesh.parent&&(this.strikeLayer.remove(g.mesh),g.mesh.geometry&&g.mesh.geometry.dispose(),g.mesh.material&&g.mesh.material.dispose())}),m<y&&requestAnimationFrame(w)};w()}set hass(t){if(this._hass=t,!t||!this.initialized)return;const s=this.config.entity||this.config.entity_id||Object.keys(t.states).find(i=>i.startsWith("sensor.")&&i.endsWith("_stations")&&t.states[i].attributes.stations!==void 0&&t.states[i].attributes.icon==="mdi:lightning-bolt")||Object.keys(t.states).find(i=>i.startsWith("sensor.")&&t.states[i].attributes.stations!==void 0);let e=t.config.latitude,a=t.config.longitude;if(console.log("WeatherFlow Card: Home coordinates:",e,a),s){const n=t.states[s].attributes.stations;if(Array.isArray(n)){const d=n.find(p=>p.type==="primary");if(d&&d.latitude!==void 0&&d.longitude!==void 0){const p=parseFloat(d.latitude),u=parseFloat(d.longitude);!isNaN(p)&&!isNaN(u)?(e=p,a=u,console.log("WeatherFlow Card: Resolved primary station coordinate:",e,a)):console.warn("WeatherFlow Card: Parsed primary station coordinates are NaN:",d.latitude,d.longitude)}else console.warn("WeatherFlow Card: No primary station found in stations list:",n)}else console.warn("WeatherFlow Card: stationsAttr is not an array:",n)}else console.warn("WeatherFlow Card: stationsSensorId not found");if((this.lastRefLat!==e||this.lastRefLon!==a)&&(console.log("WeatherFlow Card: Reference coordinates changed from",this.lastRefLat,this.lastRefLon,"to",e,a),this.lastRefLat=e,this.lastRefLon=a,this.loadMapTexture(e,a),this.vectorDataLoaded=!1),this.config.show_3d_features&&!this.vectorDataLoading&&!this.vectorDataLoaded&&this.loadVectorData(e,a),s){const i=t.states[s].attributes.elevation_grid;i&&JSON.stringify(i)!==JSON.stringify(this.elevationGrid)&&this.updateTerrainGeometry(i);const n=t.states[s].attributes;this.windSpeed=n.wind_speed!==void 0?parseFloat(n.wind_speed):0,this.windDirection=n.wind_direction!==void 0?parseFloat(n.wind_direction):0,this.solarRadiation=n.solar_radiation!==void 0?parseFloat(n.solar_radiation):1e3,this.rainRate=n.rain_rate!==void 0?parseFloat(n.rain_rate):0,this.updateDayNightEngine(),this.updateWeatherOverlay(),this.lastStationStrikes||(this.lastStationStrikes={}),Object.keys(t.states).forEach(p=>{if(p.startsWith("sensor.")){const u=t.states[p],m=u.attributes.station_id;if(m!==void 0){const y=parseInt(u.state)||0,w=this.lastStationStrikes[m];w!==void 0&&y>w&&this.stationMeshes&&this.stationMeshes.forEach(f=>{String(f.mesh.userData.station.id)===String(m)&&(f.strikeIntensity=1)}),this.lastStationStrikes[m]=y}}});const d=n.stations;if(Array.isArray(d)){let p=!1;if(this.stations.length!==d.length)p=!0;else for(let u=0;u<d.length;u++)if(!this.stations.find(y=>y.id===d[u].id)){p=!0;break}if(console.log("WeatherFlow Card: Stations changed status:",p,"Current length:",this.stations.length,"New length:",d.length),p){const m=Math.cos(e*Math.PI/180);this.stations=d.map(y=>{const w=parseFloat(y.latitude),f=parseFloat(y.longitude),g=6371*(f-a)*(Math.PI/180)*m,E=-6371*(w-e)*(Math.PI/180);let k=6583435;return y.type==="primary"?k=1096065:y.type==="neighbor"&&(k=3718648),console.log("WeatherFlow Card: Mapped station:",y.id,"type:",y.type,"lat:",w,"lon:",f,"to grid coords:",g,E),{id:y.id,x:g,z:E,color:k,type:y.type}}),this.stationMeshes&&(console.log("WeatherFlow Card: Removing",this.stationMeshes.length,"old meshes"),this.stationMeshes.forEach(y=>{this.scene.remove(y.mesh)})),this.addWeatherStations()}}}const r="weatherflow_lightning_trilateration",l=Object.keys(t.states).filter(i=>i.startsWith("geo_location.")&&t.states[i].attributes.source===r),o=6371,c=Math.cos(e*Math.PI/180),h=[];l.forEach(i=>{const n=t.states[i],d=parseFloat(n.attributes.latitude),p=parseFloat(n.attributes.longitude),u=n.attributes.stations||[];if(!isNaN(d)&&!isNaN(p)){const m=o*(p-a)*(Math.PI/180)*c,y=-o*(d-e)*(Math.PI/180),w=new Date(n.last_changed).getTime();h.push({id:i,time:w,x:m,z:y,stations:u})}}),h.sort((i,n)=>i.time-n.time),h.forEach(i=>{if(!this.strikeHistory.some(n=>n.id===i.id)){const n=!this.knownStrikes.has(i.id);n&&this.knownStrikes.add(i.id);const d=this.playbackMode==="live"&&n;this.strikeHistory.push({id:i.id,time:i.time,x:i.x,z:i.z,stations:i.stations,animated:d||this.playbackMode!=="live"&&i.time<=this.playbackTime}),d&&this.triggerStrikeAnimation(i.x,i.z,i.stations)}}),this.strikeHistory=this.strikeHistory.filter(i=>h.some(n=>n.id===i.id)),this.strikeHistory.sort((i,n)=>i.time-n.time);for(const i of this.knownStrikes)t.states[i]||this.knownStrikes.delete(i)}getCardSize(){return 3}}customElements.define("weatherflow-lightning-card",j),window.customCards=window.customCards||[],window.customCards.push({type:"weatherflow-lightning-card",name:"WeatherFlow Lightning Trilateration Card",description:"WebGL 3D visualizer showing real-time lightning strike trilaterations."});class Y extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}setConfig(t){if(this._config=t,!this._initializedEditor)this.render(),this._initializedEditor=!0;else{const s=this.shadowRoot.getElementById("height");s&&(s.value=this._config.height||"350px");const e=this.shadowRoot.getElementById("zoom_level");e&&(e.value=this._config.zoom_level!==void 0?this._config.zoom_level:"18.0");const a=this.shadowRoot.getElementById("show_grid");a&&(a.checked=this._config.show_grid!==!1);const r=this.shadowRoot.getElementById("show_map");r&&(r.checked=this._config.show_map!==!1);const l=this.shadowRoot.getElementById("show_rings");l&&(l.checked=this._config.show_rings!==!1);const o=this.shadowRoot.getElementById("show_heatmap");o&&(o.checked=this._config.show_heatmap!==!1);const c=this.shadowRoot.getElementById("auto_orbit");c&&(c.checked=this._config.auto_orbit!==!1);const h=this.shadowRoot.getElementById("show_weather");h&&(h.checked=this._config.show_weather!==!1);const i=this.shadowRoot.getElementById("show_daynight");i&&(i.checked=this._config.show_daynight!==!1);const n=this.shadowRoot.getElementById("min_brightness");n&&(n.value=this._config.min_brightness!==void 0?this._config.min_brightness:"0.8");const d=this.shadowRoot.getElementById("elevation_scale");d&&(d.value=this._config.elevation_scale!==void 0?this._config.elevation_scale:"1.5");const p=this.shadowRoot.getElementById("show_3d_features");p&&(p.checked=this._config.show_3d_features===!0);const u=this.shadowRoot.getElementById("playback_speed");u&&(u.value=this._config.playback_speed!==void 0?this._config.playback_speed.toString():"120"),this._syncEntityPicker()}}set hass(t){this._hass=t,this._syncEntityPicker()}render(){if(!this._config)return;this.shadowRoot.innerHTML=`
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
    `,this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach(s=>{s.addEventListener("change",e=>this.toggleChanged(e))}),this.shadowRoot.querySelectorAll('input[type="text"]').forEach(s=>{s.addEventListener("input",e=>this.textChanged(e))});const t=this.shadowRoot.getElementById("entity_id_picker");t&&t.addEventListener("value-changed",s=>{const e=s.detail&&s.detail.value!=null?s.detail.value:null;this._onEntityPicked(e)}),this._syncEntityPicker()}toggleChanged(t){if(!this._config)return;const s=t.target;this.dispatchConfigChange(s.id,s.checked)}textChanged(t){if(!this._config)return;const s=t.target;let e=s.value;if(s.id==="zoom_level"||s.id==="min_brightness"||s.id==="elevation_scale"||s.id==="playback_speed"){const a=parseFloat(e);isNaN(a)||(e=a)}this.dispatchConfigChange(s.id,e)}_syncEntityPicker(){if(!this.shadowRoot)return;const t=this.shadowRoot.getElementById("entity_id_picker");if(!t)return;t.hass=this._hass,t.entityFilter=e=>e.attributes&&Array.isArray(e.attributes.stations)&&e.attributes.icon==="mdi:lightning-bolt";const s=this._config&&(this._config.entity||this._config.entity_id)?this._config.entity||this._config.entity_id:null;t.value!==s&&(t.value=s)}_onEntityPicked(t){let s;t&&t.startsWith("sensor.")&&t.endsWith("_stations")&&(s=t.slice(7,-9));const e={...this._config,entity:t||void 0,entity_id:t||void 0,entry_id:s||void 0};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}dispatchConfigChange(t,s){if(this._config[t]===s)return;const e={...this._config,[t]:s},a=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(a)}}customElements.define("weatherflow-lightning-card-editor",Y);export{};
