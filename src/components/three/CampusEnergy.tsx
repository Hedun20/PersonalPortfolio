import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FusionReactor } from './FusionReactor';
import { EnergyBeam } from './CampusBeams';
import { energyPoint } from './campusEnergyGeometry';
import { ArchitecturalFinish } from './CampusMaterials';

const CENTER_Z = 4;
const NO_RAYCAST = () => null;

type Channel = {
  radius: number;
  width: number;
  height: number;
  end: number;
  color: string;
  speed: number;
  phase: number;
  packets: number;
};

// A single ribbon mesh and analytic fragment shader per channel; the pulse
// runs along the continuous UV rather than moving vehicle geometry.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uPhase;
  uniform float uPackets;
  uniform vec3 uColor;
  void main() {
    float x = fract(vUv.x * uPackets - uTime * uSpeed + uPhase);
    float distanceToHead = (x - 0.68) * 10.0;
    float head = exp(-distanceToHead * distanceToHead);
    float tail = exp(-abs(x - 0.60) * 8.0) * 0.65;
    float across = abs(vUv.y * 2.0 - 1.0);
    float spine = exp(-across * across * 20.0);
    float halo = exp(-across * across * 3.6);
    float envelope = smoothstep(0.0, 0.025, vUv.x) * (1.0 - smoothstep(0.975, 1.0, vUv.x));
    float strandDistance = (across - 0.36) * 9.0;
    float strands = exp(-strandDistance * strandDistance);
    float modulation = 0.70 + 0.30 * sin(vUv.x * 145.0 - uTime * uSpeed * 5.0);
    float strength = 0.42 + 2.1 * head + tail;
    vec3 light = uColor * (0.20 * halo + spine * strength + strands * modulation * 0.85)
      + vec3(0.36,0.7,1.0) * spine * head * 1.15;
    gl_FragColor = vec4(light, envelope * min(1.0, 0.27 * halo + 0.65 * spine + 0.5 * strands));
    #include <colorspace_fragment>
  }
`;

function ringGeometry(radius: number, width: number, height: number, end: number) {
  const positions: number[] = [], uv: number[] = [], indices: number[] = [];
  const segments = end > 3 ? 160 : 96;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, angle = -end + 2 * end * t;
    for (const side of [-1, 1]) {
      const r = radius + side * width / 2;
      positions.push(Math.sin(angle) * r, height, CENTER_Z - Math.cos(angle) * r);
      uv.push(t, (side + 1) / 2);
    }
    if (i < segments) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 2, n + 3, n + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function radialGeometry(angle: number, start: number, end: number, width: number, height: number) {
  const positions: number[] = [];
  for (const radius of [start, end]) for (const side of [-1, 1]) {
    positions.push(
      Math.sin(angle) * radius + Math.cos(angle) * side * width / 2,
      height,
      CENTER_Z - Math.cos(angle) * radius + Math.sin(angle) * side * width / 2,
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0,0,0,1,1,0,1,1], 2));
  geometry.setIndex([0,1,2,1,3,2]);
  geometry.computeVertexNormals();
  return geometry;
}

function EnergyRibbon({ geometry, color, speed, phase, packets, motion }: {
  geometry: THREE.BufferGeometry; color: string; speed: number; phase: number;
  packets: number; motion: boolean;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uSpeed: { value: speed },
    uPhase: { value: phase },
    uPackets: { value: packets },
  }), [color, speed, phase, packets]);
  useFrame((_, dt) => {
    if (!motion || !material.current) return;
    elapsed.current = (elapsed.current + Math.min(dt, .05)) % 4096;
    material.current.uniforms.uTime.value = elapsed.current;
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} raycast={NO_RAYCAST}>
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader}
      transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false}/>
  </mesh>;
}

function curvedRail(radius:number, height:number, end:number, thickness:number) {
  const points=Array.from({length:Math.ceil(end*24)+1},(_,i)=>{
    const angle=-end+2*end*i/Math.ceil(end*24);
    return new THREE.Vector3(Math.sin(angle)*radius,height,CENTER_Z-Math.cos(angle)*radius);
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),end>3?160:96,thickness,6,false);
}

function RingChannel({ channel, motion }: { channel: Channel; motion: boolean }) {
  const { radius, width, height, end, color, speed, phase, packets } = channel;
  const geometry = useMemo(() => ringGeometry(radius, width, height+.055, end), [radius, width, height, end]);
  const housing = useMemo(() => ringGeometry(radius,width+.28,height+.012,end),[radius,width,height,end]);
  const rails = useMemo(()=>[-1,1].map(side=>curvedRail(radius+side*(width*.5+.08),height+.045,end,.055)),[radius,width,height,end]);
  useEffect(()=>()=>{housing.dispose();rails.forEach(g=>g.dispose());},[housing,rails]);
  return <group>
    <mesh geometry={housing} raycast={NO_RAYCAST}><meshStandardMaterial color="#263b4a" metalness={.78} roughness={.38} side={THREE.DoubleSide}/></mesh>
    {rails.map((rail,index)=><mesh key={index} geometry={rail} raycast={NO_RAYCAST}><meshStandardMaterial color="#718a9b" metalness={.83} roughness={.28} emissive={color} emissiveIntensity={.11} side={THREE.DoubleSide}/></mesh>)}
    <EnergyRibbon geometry={geometry} color={color} speed={speed} phase={phase} packets={packets} motion={motion}/>
  </group>;
}

function RadialConduit({angle,start,end,width,height,color,motion,speed,packets}:{
  angle:number;start:number;end:number;width:number;height:number;color:string;motion:boolean;speed:number;packets:number;
}) {
  const geometry=useMemo(()=>radialGeometry(angle,start,end,width,height+.067),[angle,start,end,width,height]);
  const housing=useMemo(()=>radialGeometry(angle,start,end,width+.28,height+.015),[angle,start,end,width,height]);
  useEffect(()=>()=>housing.dispose(),[housing]);
  const middle=(start+end)/2;
  return <group>
    <mesh geometry={housing} raycast={NO_RAYCAST}><ArchitecturalFinish color="#263b4a" finish="titanium" detail={false}/></mesh>
    <group position={[Math.sin(angle)*middle,height+.04,CENTER_Z-Math.cos(angle)*middle]} rotation={[0,-angle,0]}>
      {[-1,1].map(side=><mesh key={side} position={[side*(width*.5+.08),0,0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[.09,.11,end-start]}/>
        <meshStandardMaterial color="#718a9b" metalness={.83} roughness={.28} emissive={color} emissiveIntensity={.11}/>
      </mesh>)}
    </group>
    <EnergyRibbon geometry={geometry} color={color} speed={speed} phase={angle} packets={packets} motion={motion}/>
  </group>;
}

export function FacilityEnergyLink({ angle, color, motion }: { angle: number; color: string; motion: boolean }) {
  return <group>
    <RadialConduit angle={angle} start={4.18} end={13.9} width={.74} height={.13} color={color} speed={.88} packets={3} motion={motion}/>
    <EnergyBeam from={energyPoint(angle,3.85,1.04)} to={energyPoint(angle,13.95,.59)} color={color} radius={.22} motion={motion}/>
  </group>;
}

const channels: Channel[] = [
  { radius: 5.4, width: .46, height: .04, end: Math.PI, color: '#57d5ff', speed: .55, phase: .1, packets: 4 },
  { radius: 7.0, width: .28, height: .05, end: Math.PI, color: '#9e9fff', speed: -.48, phase: .35, packets: 5 },
  { radius: 9.65, width: .66, height: .10, end: 1.68, color: '#38c7ff', speed: .74, phase: .2, packets: 5 },
  { radius: 10.8, width: .88, height: .10, end: 1.68, color: '#5fe5ff', speed: -.62, phase: .4, packets: 6 },
  { radius: 11.95, width: .56, height: .10, end: 1.68, color: '#9b8cff', speed: .46, phase: .7, packets: 4 },
  { radius: 20.3, width: .92, height: 6.46, end: 1.72, color: '#5dd7ff', speed: .64, phase: .15, packets: 6 },
  { radius: 18.85, width: .44, height: 3.83, end: 1.52, color: '#a49bff', speed: -.55, phase: .5, packets: 4 },
  { radius: 24, width: 1.18, height: -.065, end: 1.68, color: '#5bbfff', speed: .57, phase: .1, packets: 8 },
  { radius: 35.7, width: 1.10, height: -.065, end: 1.68, color: '#8a9dff', speed: -.48, phase: .4, packets: 9 },
  { radius: 46.7, width: .95, height: -.065, end: 1.68, color: '#4bbfdd', speed: .4, phase: .75, packets: 11 },
];

export function CampusEnergy({ motion, focused }: { motion: boolean; focused: boolean }) {
  const narrow = useThree(state => state.size.width < 900);
  return <group>
    <FusionReactor motion={motion}/>
    {!focused && <EnergyBeam from={[0,3.12,4]} to={[0,16.8,4]} color="#70e6ff" radius={.43} motion={motion} fadeEnd/>}
    <RingBridges motion={motion}/>
    {channels.map((channel,index)=> (!narrow || index!==9) && <RingChannel key={channel.radius} channel={channel} motion={motion}/>)}
    {[-1.68,-1.12,-.56,0,.56,1.12,1.68].filter((_,i)=>!narrow||i%2===0).map(angle=><PeripheralFeed key={angle} angle={angle} motion={motion} end={narrow?35.7:46.7}/>)}
  </group>;
}

function PeripheralFeed({ angle, motion, end }: { angle: number; motion: boolean; end: number }) {
  // The previous road-spoke corridors are clear of tower footprints; use them as energy feeds.
  return <RadialConduit angle={angle} start={22} end={end} width={.48} height={-.045} color="#6bbfff" speed={.6} packets={5} motion={motion}/>;
}

// Bridge the gap through the open corridors BETWEEN the five facilities.
// The outer spokes meet these bridges on the radius-24 distribution ring.
function RingBridges({motion}:{motion:boolean}) {
  return <group>
    {[-1.48,-.8625,-.2875,.2875,.8625,1.48].map((angle,i)=><group key={angle}>
      <RadialConduit angle={angle} start={11.95} end={24} width={.65} height={.09} color={i%2?'#a39aff':'#64d9ff'} speed={.63} packets={4} motion={motion}/>
      <EnergyBeam from={energyPoint(angle,11.95,.50)} to={energyPoint(angle,24,.50)} radius={.14} color="#55d7ff" motion={motion}/>
      {[11.95,24].map(radius=><mesh key={radius} position={energyPoint(angle,radius,.19)} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[.42,.51,.27,12]}/><meshStandardMaterial color="#4a7187" metalness={.76} roughness={.34} emissive="#36c4ef" emissiveIntensity={.35}/>
      </mesh>)}
    </group>)}
    {[-1.48,1.48].map(angle=><group key={angle}>
      <EnergyBeam from={energyPoint(angle,18.85,.34)} to={energyPoint(angle,18.85,3.9)} radius={.16} color="#969dff" motion={motion}/>
      <EnergyBeam from={energyPoint(angle,18.85,3.9)} to={energyPoint(angle,20.3,6.52)} radius={.17} color="#63dfff" motion={motion}/>
      <EnergyBeam from={energyPoint(angle,20.3,6.52)} to={energyPoint(angle,24,.50)} radius={.18} color="#63dfff" motion={motion}/>
    </group>)}
  </group>;
}
