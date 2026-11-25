import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FusionReactor } from './FusionReactor';
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

function RingChannel({ channel, motion }: { channel: Channel; motion: boolean }) {
  const { radius, width, height, end, color, speed, phase, packets } = channel;
  const geometry = useMemo(() => ringGeometry(radius, width, height+.055, end), [radius, width, height, end]);
  const housing = useMemo(() => ringGeometry(radius,width+.28,height+.012,end),[radius,width,height,end]);
  const rails = useMemo(()=>[-1,1].map(side=>ringGeometry(radius+side*(width*.5+.08),.075,height+.043,end)),[radius,width,height,end]);
  useEffect(()=>()=>{housing.dispose();rails.forEach(g=>g.dispose());},[housing,rails]);
  return <group>
    <mesh geometry={housing} raycast={NO_RAYCAST}><meshStandardMaterial color="#263b4a" metalness={.78} roughness={.38} side={THREE.DoubleSide}/></mesh>
    {rails.map((rail,index)=><mesh key={index} geometry={rail} raycast={NO_RAYCAST}><meshStandardMaterial color="#718a9b" metalness={.83} roughness={.28} emissive={color} emissiveIntensity={.11} side={THREE.DoubleSide}/></mesh>)}
    <EnergyRibbon geometry={geometry} color={color} speed={speed} phase={phase} packets={packets} motion={motion}/>
  </group>;
}

export function FacilityEnergyLink({ angle, color, motion }: { angle: number; color: string; motion: boolean }) {
  const geometry = useMemo(() => radialGeometry(angle, 4.18, 13.9, .74, .17), [angle]);
  const housing = useMemo(() => radialGeometry(angle, 4.18, 13.9, 1.07, .13), [angle]);
  const left = useMemo(() => radialGeometry(angle-.001, 4.18, 13.9, 1.00, .15), [angle]);
  useEffect(()=>()=>{housing.dispose();left.dispose();},[housing,left]);
  return <group>
    <mesh geometry={housing} raycast={NO_RAYCAST}><ArchitecturalFinish color="#1b303d" finish="titanium" detail={false}/></mesh>
    <mesh geometry={left} raycast={NO_RAYCAST}><meshStandardMaterial color="#3e5868" metalness={.72} roughness={.38} side={THREE.DoubleSide}/></mesh>
    <EnergyRibbon geometry={geometry} color={color} speed={.88} phase={angle} packets={3} motion={motion}/>
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
    {channels.map((channel,index)=> (!narrow || index!==9) && <RingChannel key={channel.radius} channel={channel} motion={motion}/>)}
    {[-1.68,-1.12,-.56,0,.56,1.12,1.68].filter((_,i)=>!narrow||i%2===0).map(angle=><PeripheralFeed key={angle} angle={angle} motion={motion && !focused} end={narrow?35.7:46.7}/>)}
  </group>;
}

function PeripheralFeed({ angle, motion, end }: { angle: number; motion: boolean; end: number }) {
  // The previous road-spoke corridors are clear of tower footprints; use them as energy feeds.
  const geometry = useMemo(() => radialGeometry(angle, 22, end, .48, -.045), [angle,end]);
  return <EnergyRibbon geometry={geometry} color="#6bbfff" speed={.6} phase={angle} packets={5} motion={motion}/>;
}
