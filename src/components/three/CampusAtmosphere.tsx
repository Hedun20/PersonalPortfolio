import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const palette=['#52dfff','#9cb4ff','#d7f6ff','#b197ff','#64f3d3'];
const random=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const NO_RAYCAST=()=>null;

// Twelve metallic edge bars, one merged geometry for all cube instances.
function makeFrame(){
  const pieces:THREE.BufferGeometry[]=[];
  for(let axis=0;axis<3;axis++)for(const a of [-1,1])for(const b of [-1,1]){
    const size=[.085,.085,.085];
    const pos=[0,0,0];
    size[axis]=1;
    pos[(axis+1)%3]=a*.46;pos[(axis+2)%3]=b*.46;
    const g=new THREE.BoxGeometry(size[0],size[1],size[2]);
    g.translate(pos[0],pos[1],pos[2]);pieces.push(g);
  }
  const merged=mergeGeometries(pieces);
  pieces.forEach(g=>g.dispose());
  if(!merged)throw Error('Invalid particle frame geometry');
  return merged;
}

function CubeRainLayer({count,near,motion,focused}:{count:number;near:boolean;motion:boolean;focused:boolean}){
  const frame=useRef<THREE.InstancedMesh>(null),core=useRef<THREE.InstancedMesh>(null);
  const transform=useMemo(()=>new THREE.Object3D(),[]);
  const point=useMemo(()=>new THREE.Vector3(),[]);
  const elapsed=useRef(0);
  const frameGeometry=useMemo(makeFrame,[]);
  useEffect(()=>()=>frameGeometry.dispose(),[frameGeometry]);
  const particles=useMemo(()=>Array.from({length:count},(_,i)=>({
    angle:-1.7+random(i*13+1)*3.4,
    radius:7+random(i*13+2)*36,
    phase:random(i*13+3),
    speed:near?.065+random(i*13+4)*.06:.022+random(i*13+4)*.037,
    size:near?.065+random(i*13+5)*.065:.14+random(i*13+5)*.18,
    spin:random(i*13+6)*6.28,
    x:(i%2===0?-1:1)*(.50+random(i*13+7)*.46),
    depth:5.5+random(i*13+8)*7.5,
  })),[count,near]);
  useLayoutEffect(()=>{
    const metal=frame.current,light=core.current;
    if(!metal||!light)return;
    const color=new THREE.Color();
    particles.forEach((_,i)=>{
      metal.setColorAt(i,color.set(i%3===0?'#c0d9e6':'#7394ad'));
      light.setColorAt(i,color.set(palette[i%palette.length]).multiplyScalar(2.35));
    });
    for(const mesh of [metal,light]){
      if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
  },[particles]);
  useFrame(({camera},dt)=>{
    const metal=frame.current,light=core.current;
    if(!metal||!light)return;
    if(motion)elapsed.current+=Math.min(dt,.05);
    const t=elapsed.current;
    if(near)camera.updateMatrixWorld();
    const projection=camera.projectionMatrix.elements;
    particles.forEach((p,i)=>{
      const phase=(p.phase+t*p.speed)%1;
      const fade=Math.min(1,phase*10,(1-phase)*10);
      const scale=Math.max(.001,p.size*fade);
      if(near){
        const x=focused&&p.x>0?p.x*.29:p.x;
        point.set(x*p.depth/projection[0],(1.08-2.16*phase)*p.depth/projection[5],-p.depth).applyMatrix4(camera.matrixWorld);
      }else{
        const angle=p.angle+Math.sin(phase*5+p.spin)*.016;
        point.set(Math.sin(angle)*p.radius,26*(1-phase)+.35,4-Math.cos(angle)*p.radius);
      }
      transform.position.copy(point);
      transform.rotation.set(p.spin+t*.19,p.spin+t*.28,phase*4);
      transform.scale.setScalar(scale);transform.updateMatrix();
      metal.setMatrixAt(i,transform.matrix);
      // Energy inside each metal cage pulses independently, not the cage itself.
      transform.scale.setScalar(scale*(.56+.14*Math.sin(t*3.0+p.spin)));
      transform.updateMatrix();light.setMatrixAt(i,transform.matrix);
    });
    metal.instanceMatrix.needsUpdate=true;light.instanceMatrix.needsUpdate=true;
  });
  return <group>
    <instancedMesh key={`frame-${count}`} ref={frame} args={[undefined,undefined,count]} geometry={frameGeometry} frustumCulled={false} raycast={NO_RAYCAST}>
      <meshStandardMaterial color="#ffffff" metalness={.74} roughness={.27} emissive="#22516c" emissiveIntensity={.25}/>
    </instancedMesh>
    <instancedMesh key={`core-${count}`} ref={core} args={[undefined,undefined,count]} frustumCulled={false} raycast={NO_RAYCAST}>
      <boxGeometry args={[1,1,1]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/>
    </instancedMesh>
  </group>;
}

export function DataRain({motion,focused}:{motion:boolean;focused:boolean}){
  const narrow=useThree(state=>state.size.width<800);
  return <group>
    <CubeRainLayer count={narrow?64:152} near={false} motion={motion} focused={focused}/>
    <CubeRainLayer count={narrow?16:38} near motion={motion} focused={focused}/>
  </group>;
}
