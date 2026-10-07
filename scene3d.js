import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const TAU = Math.PI * 2;
const rand = (()=>{let s=9137;return ()=>((s=Math.imul(s^s>>>15,1|s),s^=s+Math.imul(s^s>>>7,61|s),((s^s>>>14)>>>0)/4294967296))})();

function neonMaterial(color,intensity=1){
  return new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.3,metalness:.15});
}
function darkMaterial(color=0x080711, metal=.72, rough=.27){
  return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});
}
function addEdgeBox(group,w,h,d,x,y,z,color){
  const geo=new THREE.BoxGeometry(w,h,d), mat=neonMaterial(color,2.2), m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m;
}
function monitorFrame(w,h,x,y,z,color,ry=0){
  const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;
  const back=new THREE.Mesh(new THREE.BoxGeometry(w,h,.16),darkMaterial(0x050611,.85,.2));g.add(back);
  addEdgeBox(g,w+.08,.045,.19,0,h/2+.015,.02,color);addEdgeBox(g,w+.08,.045,.19,0,-h/2-.015,.02,color);
  addEdgeBox(g,.045,h,.19,-w/2-.015,0,.02,color);addEdgeBox(g,.045,h,.19,w/2+.015,0,.02,color);
  return g;
}
function makeRobot(){
  const g=new THREE.Group();
  const white=new THREE.MeshStandardMaterial({color:0xdedbe9,metalness:.78,roughness:.22});
  const dark=darkMaterial(0x11101a,.8,.22), gold=neonMaterial(0xffd35a,2.4), violet=neonMaterial(0x7c4dff,2.2);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.46,.72,6,12),dark);body.scale.set(1.15,1,1);body.position.y=1.25;g.add(body);
  const chest=new THREE.Mesh(new THREE.BoxGeometry(.12,.75,.05),gold);chest.position.set(0,1.28,.48);g.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,18),white);head.scale.set(1.15,.82,1);head.position.y=2.23;g.add(head);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.72,.23,.08),violet);visor.position.set(0,2.23,.44);visor.material.color.set(0x171125);visor.material.emissive.set(0x7a46ff);g.add(visor);
  for(const sx of [-.18,.18]){const eye=new THREE.Mesh(new THREE.BoxGeometry(.12,.025,.018),neonMaterial(0xf6eeff,4));eye.position.set(sx,2.23,.49);g.add(eye)}
  const earGeo=new THREE.TorusGeometry(.12,.035,8,20);for(const sx of [-.57,.57]){const e=new THREE.Mesh(earGeo,gold);e.position.set(sx,2.2,0);e.rotation.y=Math.PI/2;g.add(e)}
  const ant=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.32,8),white);ant.position.set(0,2.77,0);g.add(ant);const antTop=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),neonMaterial(0xff2dce,3));antTop.position.set(0,2.96,0);g.add(antTop);
  const armGeo=new THREE.CapsuleGeometry(.12,.68,4,8);for(const [sx,rz] of [[-.65,.44],[.65,-.44]]){const a=new THREE.Mesh(armGeo,white);a.position.set(sx,1.35,.05);a.rotation.z=rz;g.add(a)}
  const chair=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.25,.36),dark);chair.position.set(0,1.05,-.37);chair.rotation.x=-.08;g.add(chair);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.1,.18,.95),dark);seat.position.set(0,.6,-.03);g.add(seat);
  return {group:g,head,visor};
}
function addCity(scene){
  const city=new THREE.Group();
  const buildingMat=darkMaterial(0x080918,.58,.48);
  const winGeo=new THREE.BoxGeometry(.035,.055,.012);
  const winGold=neonMaterial(0xffc95a,1.7),winCyan=neonMaterial(0x21b7ff,1.5),winPink=neonMaterial(0xff2dce,1.35);
  for(let i=0;i<58;i++){
    const w=.7+rand()*1.25,d=.7+rand()*1.1,h=2+rand()*6.2;
    const x=(rand()-.5)*22,z=-5-rand()*28;
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMat.clone());b.material.color.offsetHSL(0,0,rand()*.018);b.position.set(x,h/2-.05,z);city.add(b);
    const rows=Math.min(8,Math.floor(h/.62)),cols=Math.max(1,Math.floor(w/.34));
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(rand()>.42){
      const mat=rand()>.78?winCyan:(rand()>.84?winPink:winGold), win=new THREE.Mesh(winGeo,mat);
      win.position.set(x-w/2+.22+c*.31,.45+r*.61,z+d/2+.008);city.add(win);
    }
  }
  scene.add(city);return city;
}
function addDesk(scene){
  const desk=new THREE.Group();desk.position.set(0,.52,1.3);
  const top=new THREE.Mesh(new THREE.BoxGeometry(5.8,.18,1.45),darkMaterial(0x0b0a14,.9,.16));top.rotation.x=-.03;desk.add(top);
  const edge=new THREE.Mesh(new THREE.BoxGeometry(5.9,.055,1.5),neonMaterial(0xffd35a,1.8));edge.position.y=-.085;desk.add(edge);
  const inset=new THREE.Mesh(new THREE.BoxGeometry(2.3,.025,.74),neonMaterial(0x6f37ff,.7));inset.position.set(.65,.11,-.04);desk.add(inset);
  const legGeo=new THREE.BoxGeometry(.26,1.25,.38);for(const x of [-2.3,2.3]){const leg=new THREE.Mesh(legGeo,darkMaterial());leg.position.set(x,-.62,.12);desk.add(leg)}
  scene.add(desk);return desk;
}
function addRings(scene){
  const rings=new THREE.Group();rings.position.set(-1.25,.045,1.05);rings.rotation.x=Math.PI/2;
  const data=[[1.08,0xff2dce],[1.45,0x6f37ff],[1.86,0xffd35a]];
  data.forEach(([r,c],i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,.018,8,96),neonMaterial(c,2.5-i*.35));m.userData.speed=(i%2?-.06:.05)*(i+1);rings.add(m)});scene.add(rings);return rings;
}

export function initScene3D(canvas){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.45:1.8));renderer.setSize(innerWidth,innerHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x03020a);scene.fog=new THREE.FogExp2(0x070316,.033);
  const camera=new THREE.PerspectiveCamera(innerWidth<700?43:37,innerWidth/innerHeight,.1,80);camera.position.set(0,4.35,11.3);camera.lookAt(0,2.3,-4.8);
  scene.add(new THREE.HemisphereLight(0x7351ff,0x100515,1.05));const key=new THREE.PointLight(0xff2dce,55,18,2);key.position.set(-5,6,3);scene.add(key);const fill=new THREE.PointLight(0x28d8ff,44,17,2);fill.position.set(5,4.2,1);scene.add(fill);const gold=new THREE.PointLight(0xffd35a,28,10,2);gold.position.set(0,1.2,4);scene.add(gold);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(52,52),new THREE.MeshStandardMaterial({color:0x03030a,metalness:.9,roughness:.18}));floor.rotation.x=-Math.PI/2;floor.position.z=-8;scene.add(floor);
  const grid=new THREE.GridHelper(50,58,0x6033aa,0x24153e);grid.position.set(0,.012,-8);grid.material.opacity=.35;grid.material.transparent=true;scene.add(grid);
  const city=addCity(scene);
  const wall=new THREE.Group();wall.position.set(0,0,-2.6);wall.add(monitorFrame(2.65,1.22,-3.15,5.2,0,0x35ffa7,.07));wall.add(monitorFrame(2.9,1.3,0,5.25,.18,0xff2dce,0));wall.add(monitorFrame(2.65,1.22,3.15,5.2,0,0x27d7ff,-.07));wall.add(monitorFrame(1.95,2.62,-3.7,2.7,.1,0xffd35a,.08));wall.add(monitorFrame(5.25,2.8,0,2.7,.25,0x6f37ff,0));wall.add(monitorFrame(1.9,2.62,3.72,2.7,.1,0x6f37ff,-.08));scene.add(wall);
  const desk=addDesk(scene),rings=addRings(scene);const robot=makeRobot();robot.group.position.set(-1.25,.08,1.25);robot.group.scale.setScalar(.82);scene.add(robot.group);
  const ambientOrb=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),neonMaterial(0x6f37ff,2.2));ambientOrb.position.set(0,5.2,-7);scene.add(ambientOrb);
  let running=false,mx=0,my=0,last=performance.now(),raf=0;
  const onPointer=e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5)};addEventListener('pointermove',onPointer,{passive:true});
  const onResize=()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?43:37;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.45:1.8));renderer.setSize(innerWidth,innerHeight,false)};addEventListener('resize',onResize,{passive:true});
  const animate=t=>{raf=requestAnimationFrame(animate);const dt=Math.min(.05,(t-last)/1000);last=t;const pulse=running?1+.08*Math.sin(t*.006):1+.02*Math.sin(t*.0018);key.intensity=55*pulse;fill.intensity=44*(1+(running?.05:.015)*Math.sin(t*.005+1.2));ambientOrb.material.emissiveIntensity=running?3.2:2.2;
    if(!reduced){const tx=mx*.48,ty=4.35-my*.14;camera.position.x+=(tx-camera.position.x)*.028;camera.position.y+=(ty-camera.position.y)*.028;camera.lookAt(mx*.22,2.3-my*.1,-4.8);robot.head.rotation.y=Math.sin(t*.00055)*.07+mx*.12;robot.group.position.y=.08+Math.sin(t*.0013)*.015;city.rotation.y=Math.sin(t*.00009)*.0015;rings.children.forEach(r=>r.rotation.z+=r.userData.speed*dt)}
    renderer.render(scene,camera)};animate(performance.now());
  return {setRunning(v){running=!!v},destroy(){cancelAnimationFrame(raf);removeEventListener('pointermove',onPointer);removeEventListener('resize',onResize);renderer.dispose()}};
}
