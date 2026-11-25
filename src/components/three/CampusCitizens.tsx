import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Small articulated silhouettes, batched by material. Paths follow pedestrian
// lanes rather than the vehicle lanes or the footprints of the facilities.
export function CampusCitizens({ motion }: { motion: boolean }) {
  const narrow = useThree(s => s.size.width < 900);
  const count = narrow ? 14 : 38;
  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const limbs = useRef<THREE.InstancedMesh>(null);
  const strips = useRef<THREE.InstancedMesh>(null);
  const elapsed = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const local = useMemo(() => new THREE.Vector3(), []);
  const palette = useMemo(() => ['#647f94','#b1bec7','#435263','#9b816d','#7d8eaa'].map(c => new THREE.Color(c)), []);
  const actors = useMemo(() => Array.from({length:count},(_,i)=>({
    radius: [8.55,13.15,25.9,37.6,48.6][i%5],
    phase: ((i*37)%101)/101, direction: i%2===0?1:-1,
    speed: .55+(i%5)*.09, height: .88+(i%4)*.065,
  })),[count]);
  function update(time:number) {
    if(!bodies.current || !heads.current || !limbs.current || !strips.current)return;
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
      set(bodies.current!,i,0,.46*h,0,.19*h,.28*h,.12*h);
      set(heads.current!,i,0,.68*h,0,.118*h,.135*h,.118*h);
      for(const side of [-1,1]){
        const k=side===-1?0:1;
        set(limbs.current!,i*4+k,side*.052*h,.17*h,side*swing*.23,.065*h,.32*h,.07*h,side*swing);
        set(limbs.current!,i*4+2+k,side*.13*h,.44*h,-side*swing*.21,.055*h,.23*h,.055*h,-side*swing);
      }
      set(strips.current!,i,0,.49*h,-.067*h,.13*h,.022*h,.02*h);
    });
    for(const mesh of [bodies.current,heads.current,limbs.current,strips.current])mesh.instanceMatrix.needsUpdate=true;
  }
  useLayoutEffect(()=>{
    for(const mesh of [bodies.current,heads.current,limbs.current,strips.current])mesh?.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    actors.forEach((_,i)=>bodies.current?.setColorAt(i,palette[i%palette.length]));
    if(bodies.current?.instanceColor)bodies.current.instanceColor.needsUpdate=true;
    update(elapsed.current);
    // update uses the current actor count and motion state; reset the poses when either changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[actors,motion,palette]);
  useFrame((_,dt)=>{if(motion){elapsed.current+=Math.min(dt,.05);update(elapsed.current);}});
  return <group>
    <instancedMesh key={`body-${count}`} ref={bodies} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><boxGeometry/><meshStandardMaterial color="#ffffff" roughness={.75}/></instancedMesh>
    <instancedMesh key={`head-${count}`} ref={heads} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><sphereGeometry args={[.5,8,6]}/><meshStandardMaterial color="#b3b7b9" roughness={.65}/></instancedMesh>
    <instancedMesh key={`limb-${count}`} ref={limbs} args={[undefined,undefined,count*4]} frustumCulled={false} raycast={()=>null}><boxGeometry/><meshStandardMaterial color="#263746" roughness={.72}/></instancedMesh>
    <instancedMesh key={`stripe-${count}`} ref={strips} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}><boxGeometry/><meshBasicMaterial color="#76c7df" toneMapped={false}/></instancedMesh>
  </group>;
}
