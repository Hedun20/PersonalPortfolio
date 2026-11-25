import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Vector = [number, number, number];
type Part = { position: Vector; scale: Vector; rotation: number; color: string };
const palette = ['#8cddf6', '#4aa8db', '#d5f2ff', '#b1c1fa', '#c4b394'];
const random = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const point = (angle: number, radius: number, y: number): Vector => [Math.sin(angle) * radius, y, 4 - Math.cos(angle) * radius];

function Batch({ parts, lit = false }: { parts: Part[]; lit?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const transform = new THREE.Object3D();
    const color = new THREE.Color();
    parts.forEach((part, index) => {
      transform.position.set(...part.position);
      transform.scale.set(...part.scale);
      transform.rotation.set(0, part.rotation, 0);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix);
      mesh.setColorAt(index, color.set(part.color).multiplyScalar(lit?2.1:1));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [parts,lit]);
  return <instancedMesh ref={ref} args={[undefined, undefined, parts.length]} raycast={() => null}>
    <boxGeometry args={[1, 1, 1]}/>
    {lit ? <meshBasicMaterial toneMapped={false}/> : <meshStandardMaterial metalness={.66} roughness={.34}/>}
  </instancedMesh>;
}

// Independent luminaire layer: all fixtures share just two geometry/material batches.
export function NeonStreetlights() {
  const { bodies, emitters } = useMemo(() => {
    const bodies: Part[] = [], emitters: Part[] = [];
    for (let i = 0; i < 17; i++) {
      const a = -1.48 + i * 2.96 / 16;
      for (const [radius, height] of [[8.25, 1.65], [13.0, 1.95], [24.8, 2.75]]) {
        const rot = -a;
        const add = (target: Part[], r: number, y: number, scale: Vector, color: string) => target.push({ position: point(a, r, y), scale, rotation: rot, color });
        add(bodies, radius, .13, [.23,.27,.28], '#456070');
        add(bodies, radius, height*.5, [.075,height,.095], '#8298a3');
        add(bodies, radius-.21, height+.02, [.135,.09,.55], '#596f80');
        add(emitters, radius-.035, height*.57, [.035,height*.70,.032], '#54cde8');
        add(emitters, radius-.23, height-.03, [.10,.045,.43], i%5===0?'#ffe0ab':'#b4edff');
        add(emitters, radius-.36, .036, [.25,.025,.53], '#29748e');
      }
    }
    return { bodies, emitters };
  }, []);
  return <group><Batch parts={bodies}/><Batch parts={emitters} lit/>
    {[-1.02,0,1.02].map(a=><pointLight key={a} position={point(a,10.9,2.6)} color="#6bdcff" intensity={13} distance={8} decay={2}/>)}
  </group>;
}

// Two depth layers: a world-space rain field and a restrained camera-near layer.
export function DataRain({ motion, focused }: { motion: boolean; focused: boolean }) {
  const { size } = useThree();
  const count = size.width < 800 ? 64 : 144;
  const foregroundCount = size.width < 800 ? 16 : 36;
  const ref = useRef<THREE.InstancedMesh>(null);
  const transform = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => palette.map(value => new THREE.Color(value).multiplyScalar(1.6)), []);
  const particles = useMemo(() => Array.from({length:count}, (_, i) => ({
    angle: -1.7 + random(i*7+1)*3.4,
    radius: 9 + random(i*7+2)*31,
    phase: random(i*7+3), speed: .022 + random(i*7+4)*.04,
    scale: .075 + random(i*7+5)*.14, rotation: random(i*7+6)*Math.PI,
  })), [count]);
  const time = useRef(0);
  useFrame((_, dt) => {
    const mesh=ref.current;
    if (!mesh) return;
    if(motion) time.current += Math.min(dt,.06);
    particles.forEach((p,i)=>{
      const progress = (p.phase + time.current*p.speed)%1;
      const envelope = Math.min(1, progress*12, (1-progress)*12);
      const height = 24*(1-progress)+.25;
      transform.position.set(...point(p.angle+Math.sin(progress*4+p.rotation)*.013,p.radius,height));
      transform.rotation.set(p.rotation+time.current*.18,p.rotation+time.current*.32,progress*3);
      transform.scale.setScalar(Math.max(.001,p.scale*envelope));
      transform.updateMatrix();
      mesh.setMatrixAt(i,transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;
  });
  useLayoutEffect(()=>{
    const mesh=ref.current;
    if (!mesh) return;
    particles.forEach((_,i)=>mesh.setColorAt(i,colors[i%colors.length]));
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  },[particles,colors]);
  return <group><ForegroundRain motion={motion} count={foregroundCount} focused={focused}/><instancedMesh key={count} ref={ref} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}>
    <boxGeometry args={[1,1,1]}/><meshBasicMaterial toneMapped={false} transparent opacity={.82} depthWrite={false}/>
  </instancedMesh></group>;
}

// Camera-space distribution guarantees a visible foreground at any zoom. Depth testing is
// retained; cubes never render over an intervening opaque building. Keep the central view clear.
function ForegroundRain({motion,count,focused}:{motion:boolean;count:number;focused:boolean}){
  const ref=useRef<THREE.InstancedMesh>(null);
  const transform=useMemo(()=>new THREE.Object3D(),[]);
  const viewPoint=useMemo(()=>new THREE.Vector3(),[]);
  const elapsed=useRef(0);
  const particles=useMemo(()=>Array.from({length:count},(_,i)=>({
    x:(i%2===0?-1:1)*(.48+random(i*11+80)*.46),
    phase:random(i*11+81), speed:.075+random(i*11+82)*.065,
    depth:5.5+random(i*11+83)*6.5, size:.045+random(i*11+84)*.060,
    spin:random(i*11+85)*6.28,
  })),[count]);
  useLayoutEffect(()=>{
    const mesh=ref.current;if(!mesh)return;
    const color=new THREE.Color();
    particles.forEach((_,i)=>mesh.setColorAt(i,color.set(palette[i%palette.length]).multiplyScalar(1.8)));
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  },[particles]);
  useFrame(({camera},dt)=>{
    const mesh=ref.current;if(!mesh)return;
    if(motion)elapsed.current+=Math.min(dt,.05);
    const projection=camera.projectionMatrix.elements;
    camera.updateMatrixWorld();
    particles.forEach((p,i)=>{
      const phase=(p.phase+elapsed.current*p.speed)%1;
      const fade=Math.min(1,phase*9,(1-phase)*9);
      const x=focused&&p.x>0?p.x*.29:p.x;
      const y=1.08-2.16*phase;
      viewPoint.set(x*p.depth/projection[0],y*p.depth/projection[5],-p.depth).applyMatrix4(camera.matrixWorld);
      transform.position.copy(viewPoint);
      transform.rotation.set(p.spin+elapsed.current*.23,p.spin+elapsed.current*.31,phase*4);
      transform.scale.setScalar(Math.max(.001,p.size*fade));transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;
  });
  return <instancedMesh key={count} ref={ref} args={[undefined,undefined,count]} frustumCulled={false} raycast={()=>null}>
    <boxGeometry args={[1,1,1]}/><meshBasicMaterial toneMapped={false} transparent opacity={.67} depthWrite={false}/>
  </instancedMesh>;
}
