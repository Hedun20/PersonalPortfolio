import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ArchitecturalFinish } from './CampusMaterials';

const TAU = Math.PI * 2;
const NO_RAYCAST = () => null;
type Vec3 = [number, number, number];
type Surface = 'alloy' | 'dark' | 'copper' | 'edge' | 'light';
const surfaces: Surface[] = ['alloy','dark','copper','edge','light'];

// Machined annular sections, rather than a solid disk or an unbroken cylinder.
function sector(inner:number,outer:number,depth:number,start:number,span:number) {
  const shape=new THREE.Shape();
  shape.moveTo(Math.cos(start)*outer,Math.sin(start)*outer);
  shape.absarc(0,0,outer,start,start+span,false);
  shape.lineTo(Math.cos(start+span)*inner,Math.sin(start+span)*inner);
  shape.absarc(0,0,inner,start+span,start,true);
  shape.closePath();
  const bevel=Math.min(.035,depth*.15);
  const g=new THREE.ExtrudeGeometry(shape,{depth:depth-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:12,steps:1});
  g.rotateX(-Math.PI/2);
  g.translate(0,-(depth-2*bevel)/2,0);
  return g;
}

// Reuse the campus's architectural materials. Merge all static mechanical
// components by finish; only plasma and the field assembly animate.
function makeReactor(narrow:boolean) {
  const parts:Record<Surface,THREE.BufferGeometry[]>={alloy:[],dark:[],copper:[],edge:[],light:[]};
  function add(surface:Surface,g:THREE.BufferGeometry,p:Vec3=[0,0,0],r:Vec3=[0,0,0]) {
    g.rotateX(r[0]);g.rotateY(r[1]);g.rotateZ(r[2]);g.translate(...p);
    const flat=g.index?g.toNonIndexed():g;
    if(flat!==g)g.dispose();
    flat.clearGroups();parts[surface].push(flat);
  }
  function collar(surface:Surface,profile:[number,number][],y=0) {
    add(surface,new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),96),[0,y,0]);
  }
  function ring(surface:Surface,r:number,y:number,t:number) {
    add(surface,new THREE.TorusGeometry(r,t,6,96),[0,y,0],[-Math.PI/2,0,0]);
  }
  function tube(surface:Surface,a:Vec3,b:Vec3,radius:number) {
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);
    const g=new THREE.CylinderGeometry(radius,radius,delta.length(),8);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
    from.add(to).multiplyScalar(.5);add(surface,g,[from.x,from.y,from.z]);
  }
  function box(surface:Surface,p:Vec3,size:Vec3,yaw=0){add(surface,new THREE.BoxGeometry(...size),p,[0,yaw,0]);}
  const point=(angle:number,r:number,y:number):Vec3=>[Math.sin(angle)*r,y,Math.cos(angle)*r];

  // Wide structural foundation and stepped, hollow containment vessel.
  add('dark',new THREE.CylinderGeometry(4.12,4.30,.23,96),[0,.12,0]);
  collar('alloy',[[3.25,.20],[4.16,.20],[4.22,.27],[3.98,.44],[3.72,.48],[3.25,.48],[3.25,.20]]);
  collar('dark',[[2.26,.27],[3.75,.27],[3.75,.50],[3.54,.72],[2.68,.72],[2.26,.55],[2.26,.27]]);
  collar('edge',[[2.12,.50],[2.47,.50],[2.63,.66],[2.52,.79],[2.18,.79],[2.12,.50]]);
  add('dark',new THREE.CylinderGeometry(2.16,2.16,.08,64),[0,.55,0]);
  for(const [radius,y,thickness] of [[4.05,.31,.025],[3.76,.51,.038],[2.51,.76,.035],[2.17,.74,.025]])ring('light',radius,y,thickness);
  ring('edge',3.99,.42,.045);
  ring('alloy',2.65,.85,.08);

  const count=narrow?12:16;
  for(let i=0;i<count;i++){
    const angle=i*TAU/count, span=TAU/count;
    // The visible wedge is aligned with the coil at angle; gaps reveal the darker foundation.
    const start=Math.PI/2-angle-span*.42;
    add('alloy',sector(3.20,4.02,.18,start,span*.84),[0,.54,0]);
    add('edge',sector(3.36,3.93,.045,start+.025,span*.84-.05),[0,.66,0]);
    add('dark',sector(2.70,3.14,.44,start+.022,span*.84-.044),[0,.72,0]);
    add('copper',sector(2.75,3.19,.18,start+.045,span*.84-.09),[0,.98,0]);
    // Coil windings and inset cyan conductors; no separate draw call per winding.
    for(let winding=0;winding<(narrow?3:5);winding++){
      const r=2.78+winding*.083;
      add('edge',sector(r,r+.027,.07,start+.05,span*.84-.10),[0,1.095,0]);
    }
    box('dark',point(angle,3.58,.74),[.42,.12,.54],angle);
    box('light',point(angle,3.58,.815),[.27,.028,.36],angle);
    box('edge',point(angle,3.93,.68),[.19,.12,.17],angle);
    add('edge',new THREE.CylinderGeometry(.065,.065,.045,8),point(angle,3.31,.67));
    add('dark',new THREE.CylinderGeometry(.037,.037,.052,8),point(angle,3.31,.68));
    // Sixteen arched containment ribs follow the glass chamber profile.
    const points=[point(angle,2.64,.79),point(angle,2.45,1.53),point(angle,1.98,2.22),point(angle,1.18,2.78),point(angle,.60,2.94)];
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    add('alloy',new THREE.TubeGeometry(curve,18,.076,6,false));
    const inner=points.map(([x,y,z])=>new THREE.Vector3(x*.965,y+.035,z*.965));
    add('light',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(inner),18,.014,5,false));
    if(i%2===0)tube('edge',point(angle,3.0,1.07),point(angle,2.43,1.51),.073);
  }

  collar('alloy',[[.42,2.91],[.76,2.91],[.85,2.98],[.76,3.10],[.42,3.10],[.42,2.91]]);
  ring('light',.66,3.105,.028);
  ring('edge',.83,2.99,.035);
  for(const y of [1.25,1.89]) {
    const radius=y===1.25?2.48:2.15;
    ring('edge',radius,y,.034);
  }
  return surfaces.map(surface=>{
    const list=parts[surface];
    const geometry=mergeGeometries(list);
    list.forEach(g=>g.dispose());
    if(!geometry)throw Error('Unable to assemble reactor geometry: '+surface);
    geometry.computeBoundingSphere();
    return {surface,geometry};
  });
}

const plasmaVertex=`
  varying vec3 vP;
  varying vec3 vN;
  varying vec3 vV;
  void main(){
    vP=position;
    vN=normalize(normalMatrix*normal);
    vec4 mv=modelViewMatrix*vec4(position,1.0);
    vV=-mv.xyz;
    gl_Position=projectionMatrix*mv;
  }
`;
const plasmaFragment=`
  varying vec3 vP;
  varying vec3 vN;
  varying vec3 vV;
  uniform float uTime;
  void main(){
    vec3 p=normalize(vP);
    float az=atan(p.z,p.x);
    float band=sin(p.y*22.0+az*4.0+2.1*sin(az*3.0-uTime*.8)-uTime*1.65);
    float thread=pow(0.5+0.5*band,6.0);
    float crossFlow=pow(0.5+0.5*sin(p.y*13.0-az*7.0+uTime*1.1),8.0);
    float rim=1.0-abs(dot(normalize(vN),normalize(vV)));
    float beat=.85+.15*sin(uTime*1.7);
    vec3 dark=vec3(.015,.085,.18);
    vec3 light=vec3(.07,.60,1.20)*thread+vec3(.36,.32,.90)*crossFlow*.56;
    vec3 edge=vec3(.32,.82,1.10)*rim*rim;
    gl_FragColor=vec4((dark+light+edge)*beat,1.0);
    #include <colorspace_fragment>
  }
`;

export function FusionReactor({motion}:{motion:boolean}) {
  const narrow=useThree(state=>state.size.width<900);
  const assembly=useMemo(()=>makeReactor(narrow),[narrow]);
  useEffect(()=>()=>assembly.forEach(part=>part.geometry.dispose()),[assembly]);
  const plasmaMaterial=useRef<THREE.ShaderMaterial>(null);
  const plasma=useRef<THREE.Mesh>(null);
  const rings=useRef<THREE.Group>(null);
  const elapsed=useRef(0);
  const uniforms=useMemo(()=>({uTime:{value:0}}),[]);
  useFrame((_,dt)=>{
    if(!motion)return;
    elapsed.current+=Math.min(dt,.05);
    const t=elapsed.current;
    if(plasmaMaterial.current)plasmaMaterial.current.uniforms.uTime.value=t;
    if(plasma.current)plasma.current.scale.setScalar(1+.018*Math.sin(t*1.7));
    if(rings.current)rings.current.rotation.y=t*.12;
  });
  return <group position={[0,.02,4]} name="Fusion Reactor">
    {assembly.map(({surface,geometry})=><mesh key={surface} geometry={geometry} raycast={NO_RAYCAST} receiveShadow={surface!=='light'}>
      {surface==='light'?<meshStandardMaterial color="#7edcff" emissive="#4bbfff" emissiveIntensity={1.65} toneMapped={false}/>:surface==='copper'?<meshStandardMaterial color="#a37b52" metalness={.84} roughness={.32}/>:<ArchitecturalFinish color={surface==='alloy'?'#627b8e':surface==='edge'?'#a2b2be':'#162938'} finish={surface==='dark'?'ceramic':'titanium'} detail={surface!=='edge'}/>}
    </mesh>)}
    <mesh ref={plasma} position={[0,.76,0]} raycast={NO_RAYCAST}>
      <sphereGeometry args={[1.83,narrow?32:48,24,0,TAU,0,Math.PI/2]}/>
      <shaderMaterial ref={plasmaMaterial} uniforms={uniforms} vertexShader={plasmaVertex} fragmentShader={plasmaFragment} toneMapped={false}/>
    </mesh>
    <group ref={rings} position={[0,1.26,0]}>
      {[0,1,2].map(i=><mesh key={i} rotation={[Math.PI/2-.23,0,i*TAU/3]} raycast={NO_RAYCAST}>
        <torusGeometry args={[2.08,.023,6,72,Math.PI*1.25]}/>
        <meshBasicMaterial color={i===1?'#b19aff':'#81ddff'} toneMapped={false}/>
      </mesh>)}
    </group>
    <mesh position={[0,.77,0]} raycast={NO_RAYCAST}>
      <sphereGeometry args={[2.31,48,24,0,TAU,0,Math.PI/2]}/>
      <meshPhysicalMaterial color="#90c9df" metalness={.12} roughness={.13} clearcoat={1} transparent opacity={.10} depthWrite={false} side={THREE.FrontSide} envMapIntensity={1.25}/>
    </mesh>
  </group>;
}
