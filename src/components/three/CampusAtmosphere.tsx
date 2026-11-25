import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

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
      for (const [radius, height] of [[8.25, 1.65], [13.0, 1.95], [25.55, 2.35], [37.3, 2.55], [48.3, 2.75]]) {
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

// Original, lightweight street furniture: two small shops between the first
// outer sidewalk and the skyline, with shared geometry/material batches.
export function CampusStreetLife({ motion }: { motion: boolean }) {
  const { bodies, emitters } = useMemo(() => {
    const bodies: Part[] = [], emitters: Part[] = [];
    for (const [angle, accent] of [[-.84, '#ffd3a0'], [.84, '#9bafff']] as const) {
      const add = (target: Part[], x: number, y: number, z: number, scale: Vector, color: string) => {
        const center = point(angle, 27.15, y);
        target.push({ position: [center[0]+x*Math.cos(angle)-z*Math.sin(angle), y, center[2]+x*Math.sin(angle)+z*Math.cos(angle)], scale, rotation: -angle, color });
      };
      add(bodies,0,.02,0,[2.3,.14,1.02],'#384b56');
      add(bodies,0,.64,-.28,[2.05,1.22,.48],'#263745');
      add(bodies,0,1.36,0,[2.28,.16,1.05],'#4b626f');
      add(bodies,0,.44,.32,[1.92,.64,.35],'#4a5b65');
      add(bodies,0,.79,.34,[2.0,.10,.47],'#8799a2');
      for(const side of [-1,1]){
        add(bodies,side, .77,.38,[.09,1.15,.09],'#768b99');
        add(emitters,side, .85,.43,[.04,.85,.04],accent);
        add(bodies,side*.65,.13,.81,[.26,.23,.26],'#344651');
        add(bodies,side*.65,.28,.81,[.33,.08,.33],'#607782');
      }
      add(emitters,0,1.27,.54,[1.85,.07,.045],accent);
      add(emitters,0,1.10,.005,[1.62,.31,.045],'#e7bd86');
      for(let i=0;i<5;i++)add(bodies,-.65+i*.32,.98,.04,[.12,.21,.12],i%2?'#8b6a52':'#5a8191');
      // Low bollards near the shop frontage, away from the road.
      for(const x of [-1.25,1.25]){
        add(bodies,x,.22,.62,[.09,.47,.09],'#526d7c');
        add(emitters,x,.45,.62,[.11,.065,.11],accent);
      }
    }
    return { bodies, emitters };
  }, []);
  return <group>
    <Batch parts={bodies}/><Batch parts={emitters} lit/>
    {[-.84,.84].map((angle,i)=><Html key={angle} position={point(angle,27.05,1.65)} center distanceFactor={18} zIndexRange={[2,0]} style={{pointerEvents:'none',whiteSpace:'nowrap'}}>
      <span className="campus-street-sign">{i===0?'NEON CAFÉ':'ORBIT BAR'}</span>
    </Html>)}
    <PlazaFountain motion={motion}/>
  </group>;
}

// Shallow illuminated water and two animated ripples, no reflection pass,
// fluid simulation or additional shadow-casting light.
function PlazaFountain({ motion }: { motion: boolean }) {
  const rings = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useFrame((_,dt)=>{
    const group=rings.current;
    if(!group||!motion)return;
    elapsed.current=(elapsed.current+Math.min(dt,.05)*.26)%1;
    group.children.forEach((child,i)=>{
      const phase=(elapsed.current+i*.5)%1;
      child.scale.setScalar(.25+phase*.75);
    });
  });
  return <group position={[-4.65,0,5.3]}>
    <mesh position={[0,.065,0]}><cylinderGeometry args={[1.06,1.12,.20,32]}/><meshStandardMaterial color="#3b5666" metalness={.52} roughness={.38}/></mesh>
    <mesh position={[0,.18,0]}><cylinderGeometry args={[.91,.91,.035,32]}/><meshPhysicalMaterial color="#23718a" metalness={.28} roughness={.19} clearcoat={1}/></mesh>
    <mesh position={[0,.20,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.99,.032,6,40]}/><meshBasicMaterial color="#73e3ff" toneMapped={false}/></mesh>
    <group ref={rings} position={[0,.209,0]}>
      {[.55,.85].map(scale=><mesh key={scale} scale={scale} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.79,.012,5,32]}/><meshBasicMaterial color="#b5efff" transparent opacity={.55} depthWrite={false}/></mesh>)}
    </group>
    <mesh position={[0,.32,0]}><cylinderGeometry args={[.09,.13,.28,12]}/><meshStandardMaterial color="#6b8794" metalness={.7} roughness={.3}/></mesh>
    <mesh position={[0,.57,0]}><cylinderGeometry args={[.021,.035,.24,8]}/><meshBasicMaterial color="#a7eaff" transparent opacity={.75}/></mesh>
  </group>;
}
