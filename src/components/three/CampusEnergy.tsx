import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CENTER_Z = 4;
const NO_RAYCAST = () => null;
const TAU = Math.PI * 2;

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
    float head = exp(-pow((x - 0.68) * 10.0, 2.0));
    float tail = exp(-abs(x - 0.60) * 8.0) * 0.65;
    float across = abs(vUv.y * 2.0 - 1.0);
    float spine = exp(-across * across * 20.0);
    float halo = exp(-across * across * 3.6);
    float envelope = smoothstep(0.0, 0.025, vUv.x) * (1.0 - smoothstep(0.975, 1.0, vUv.x));
    float strength = 0.22 + 2.6 * head + tail;
    vec3 light = uColor * (0.12 * halo + spine * strength) + vec3(0.5,0.8,1.0) * spine * head * 1.6;
    gl_FragColor = vec4(light, envelope * (0.28 * halo + 0.72 * spine));
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
  const geometry = useMemo(() => ringGeometry(radius, width, height, end), [radius, width, height, end]);
  return <EnergyRibbon geometry={geometry} color={color} speed={speed} phase={phase} packets={packets} motion={motion}/>;
}

export function FacilityEnergyLink({ angle, color, motion }: { angle: number; color: string; motion: boolean }) {
  const geometry = useMemo(() => radialGeometry(angle, 3.45, 13.9, .66, .13), [angle]);
  return <EnergyRibbon geometry={geometry} color={color} speed={.88} phase={angle} packets={3} motion={motion}/>;
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

function FusionCore({ motion }: { motion: boolean }) {
  const plasma = useRef<THREE.Mesh>(null);
  const field = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  useFrame((_, dt) => {
    if (!motion) return;
    elapsed.current += Math.min(dt, .05);
    const t = elapsed.current;
    if (plasma.current) plasma.current.scale.setScalar(1 + .055 * Math.sin(t * 2.3));
    if (field.current) field.current.rotation.y = t * .19;
  });
  return <group position={[0, .02, CENTER_Z]} raycast={NO_RAYCAST}>
    <mesh position={[0,.12,0]}><cylinderGeometry args={[3.15,3.38,.24,64]}/><meshStandardMaterial color="#243b4e" metalness={.76} roughness={.32}/></mesh>
    <mesh position={[0,.27,0]}><cylinderGeometry args={[2.76,3.1,.13,64]}/><meshStandardMaterial color="#10232f" metalness={.6} roughness={.3}/></mesh>
    {[2.5,2.88,3.19].map((radius,i)=><mesh key={radius} position={[0,.36+i*.025,0]} rotation={[-Math.PI/2,0,0]}>
      <torusGeometry args={[radius,i===1?.065:.035,8,80]}/><meshStandardMaterial color="#5bd9ff" emissive={i===1?'#89ddff':'#4ca2ef'} emissiveIntensity={i===1?2.8:1.7} toneMapped={false}/>
    </mesh>)}
    <mesh ref={plasma} position={[0,.38,0]}>
      <sphereGeometry args={[1.58,32,20,0,TAU,0,Math.PI/2]}/><meshStandardMaterial color="#96eaff" emissive="#67dfff" emissiveIntensity={2.6} roughness={.25} toneMapped={false}/>
    </mesh>
    <mesh position={[0,.38,0]}>
      <sphereGeometry args={[2.08,24,12,0,TAU,0,Math.PI/2]}/><meshBasicMaterial color="#70caff" wireframe transparent opacity={.22} depthWrite={false} toneMapped={false}/>
    </mesh>
    <group ref={field} position={[0,.38,0]}>
      {Array.from({length:4},(_,i)=><mesh key={i} rotation={[Math.PI/2-.22,i*Math.PI/4,0]}>
        <torusGeometry args={[2.19,.023,6,64]}/><meshBasicMaterial color={i%2?'#a69bff':'#86eaff'} toneMapped={false} transparent opacity={.72}/>
      </mesh>)}
    </group>
    {Array.from({length:12},(_,i)=>{
      const angle=i/12*TAU;
      return <group key={i} position={[Math.sin(angle)*2.82,.39,Math.cos(angle)*2.82]} rotation={[0,angle,0]}>
        <mesh><boxGeometry args={[.57,.29,.46]}/><meshStandardMaterial color="#456479" metalness={.7} roughness={.35}/></mesh>
        <mesh position={[0,.16,0]}><boxGeometry args={[.42,.045,.36]}/><meshBasicMaterial color="#8be4ff" toneMapped={false}/></mesh>
      </group>;
    })}
  </group>;
}

export function CampusEnergy({ motion, focused }: { motion: boolean; focused: boolean }) {
  const narrow = useThree(state => state.size.width < 900);
  return <group>
    <FusionCore motion={motion}/>
    {channels.map((channel,index)=> (!narrow || index!==9) && <RingChannel key={channel.radius} channel={channel} motion={motion}/>)}
    {[-1.42, -0.84, 0, .84, 1.42].map(angle=><PeripheralFeed key={angle} angle={angle} motion={motion && !focused}/>)}
  </group>;
}

function PeripheralFeed({ angle, motion }: { angle: number; motion: boolean }) {
  // Short feeds terminate at the first outer ring, avoiding the five buildings.
  const geometry = useMemo(() => radialGeometry(angle, 22, 26.0, .52, -.045), [angle]);
  return <EnergyRibbon geometry={geometry} color="#6bbfff" speed={.6} phase={angle} packets={2} motion={motion}/>;
}
