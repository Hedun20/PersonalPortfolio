import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Small articulated silhouettes, batched by material. Paths follow pedestrian
// lanes rather than the vehicle lanes or the footprints of the facilities.
export function CampusCitizens({ motion }: { motion: boolean }) {
  const narrow = useThree(s => s.size.width < 900);
  const count = narrow ? 20 : 50;
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const limbs = useRef<THREE.InstancedMesh>(null);
  const strips = useRef<THREE.InstancedMesh>(null);
  const coats = useRef<THREE.InstancedMesh>(null);
  const visors = useRef<THREE.InstancedMesh>(null);
  const elapsed = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const local = useMemo(() => new THREE.Vector3(), []);
  const palette = useMemo(() => ['#263b4e','#a5b7c3','#4c3e68','#283e40','#a08260'].map(c => new THREE.Color(c)), []);
  const neon = useMemo(() => ['#60dfff','#a98aff','#ffd09b','#61f2c5'].map(c => new THREE.Color(c)), []);
  const actors = useMemo(() => Array.from({length:count},(_,i)=>({
    radius: [8.55,13.15,25.9,25.9,37.6,48.6][i%6],
    phase: ((i*37)%101)/101, direction: i%2===0?1:-1,
    speed: .55+(i%5)*.09, height: 1.02+(i%4)*.085, coat: i%3!==1,
  })),[count]);
  function update(time:number) {
    if(!bodies.current || !heads.current || !limbs.current || !strips.current || !coats.current || !visors.current)return;
    actors.forEach((actor,i)=>{
      // Ping-pong on continuous curved sidewalks; no teleport through buildings.
      const progress=(actor.phase+time*actor.speed/(actor.radius*2.85))%2;
      const reverse=progress>1;
      const fraction=reverse?2-progress:progress;
      const a=-1.42+(actor.direction===1?fraction:1-fraction)*2.84;
      const yaw=a*-1+((reverse? -actor.direction:actor.direction)>0?Math.PI/2:-Math.PI/2);
      const x=Math.sin(a)*actor.radius,z=4-Math.cos(a)*actor.radius;
      const y=actor.radius<20?.025:-.075;
      const h=actor.height;
      const swing=motion?Math.sin(time*8+i*1.7)*.22:0;
      const set=(mesh:THREE.InstancedMesh,index:number,px:number,py:number,pz:number,sx:number,sy:number,sz:number,tilt=0)=>{
        local.set(px,py,pz).applyAxisAngle(THREE.Object3D.DEFAULT_UP,yaw);
        dummy.position.set(x+local.x,y+local.y,z+local.z);
        dummy.rotation.set(tilt,yaw,0,'YXZ');dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);
      };
      set(bodies.current!,i,0,.59*h,0,.28*h,.34*h,.18*h);
      set(heads.current!,i,0,.83*h,0,.17*h,.20*h,.17*h);
      set(visors.current!,i,0,.86*h,.082*h,.122*h,.035*h,.035*h);
      set(coats.current!,i,0,.38*h,-.015*h,actor.coat?.28*h:.19*h,actor.coat?.33*h:.12*h,.19*h,actor.coat?swing*.12:0);
      for(const side of [-1,1]){
        const k=side===-1?0:1;
        set(limbs.current!,i*4+k,side*.065*h,.18*h,side*swing*.26,.086*h,.36*h,.085*h,side*swing);
        set(limbs.current!,i*4+2+k,side*.155*h,.53*h,-side*swing*.21,.075*h,.30*h,.075*h,-side*swing);
      }
      set(strips.current!,i*2,0,.65*h,.094*h,.19*h,.023*h,.022*h);
      set(strips.current!,i*2+1,0,.62*h,-.095*h,.025*h,.22*h,.025*h);
    });
    for(const mesh of [bodies.current,heads.current,limbs.current,strips.current,coats.current,visors.current])if(mesh)mesh.instanceMatrix.needsUpdate=true;
  }
  useLayoutEffect(()=>{
    for(const mesh of [bodies.current,heads.current,limbs.current,strips.current,coats.current,visors.current])mesh?.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    actors.forEach((_,i)=>{
      bodies.current?.setColorAt(i,palette[i%palette.length]);
      coats.current?.setColorAt(i,palette[(i+1)%palette.length]);
      visors.current?.setColorAt(i,neon[i%neon.length]);
      strips.current?.setColorAt(i*2,neon[i%neon.length]);
      strips.current?.setColorAt(i*2+1,neon[i%neon.length]);
    });
    for(const mesh of [bodies.current,coats.current,visors.current,strips.current])if(mesh?.instanceColor)mesh.instanceColor.needsUpdate=true;
    update(elapsed.current);
    // update uses the current actor count and motion state; reset the poses when either changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[actors,motion,palette,neon]);
  useFrame((_,dt)=>{if(motion){elapsed.current+=Math.min(dt,.05);update(elapsed.current);}});
  return <group>
    <instancedMesh key={`body-${count}`} ref={bodies} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><cylinderGeometry args={[.58,.43,1,6]}/><meshStandardMaterial color="#ffffff" metalness={.35} roughness={.52}/></instancedMesh>
    <instancedMesh key={`head-${count}`} ref={heads} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><sphereGeometry args={[.5,10,8]}/><meshStandardMaterial color="#263745" metalness={.62} roughness={.26}/></instancedMesh>
    <instancedMesh key={`limb-${count}`} ref={limbs} args={[undefined,undefined,count*4]} frustumCulled={false} raycast={()=>null}><cylinderGeometry args={[.5,.42,1,5]}/><meshStandardMaterial color="#263746" roughness={.62}/></instancedMesh>
    <instancedMesh key={`coat-${count}`} ref={coats} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><cylinderGeometry args={[.36,.58,1,6]}/><meshStandardMaterial color="#ffffff" metalness={.18} roughness={.64}/></instancedMesh>
    <instancedMesh key={`visor-${count}`} ref={visors} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><boxGeometry/><meshBasicMaterial color="#ffffff" toneMapped={false}/></instancedMesh>
    <instancedMesh key={`stripe-${count}`} ref={strips} args={[undefined,undefined,count*2]} frustumCulled={false} raycast={()=>null}><boxGeometry/><meshBasicMaterial color="#ffffff" toneMapped={false}/></instancedMesh>
  </group>;
}
