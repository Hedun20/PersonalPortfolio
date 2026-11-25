import { Component, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useInView, useReducedMotion } from 'framer-motion';
import type { Group } from 'three';

type Variant = 'home' | 'about' | 'expertise' | 'architecture' | 'projects' | 'techstack' | 'contact';
type Vec = [number, number, number];
type Segment = [Vec, Vec];
const TAU = Math.PI * 2;
const labels: Record<Variant, string> = { home: 'Neural network', about: 'Digital DNA', expertise: 'Modular systems', architecture: 'System layers', projects: 'Connected ecosystem', techstack: 'Technology orbit', contact: 'Signal array' };
const colors: Record<Variant, string> = { home: '#38bdf8', about: '#60a5fa', expertise: '#38bdf8', architecture: '#818cf8', projects: '#34d399', techstack: '#a78bfa', contact: '#67e8f9' };

function ring(radius: number, tilt = 0, height = 0): Segment[] {
  const at = (i: number): Vec => [radius * Math.cos(i * TAU / 64), height + radius * Math.sin(i * TAU / 64) * Math.cos(tilt), radius * Math.sin(i * TAU / 64) * Math.sin(tilt)];
  return Array.from({length: 64}, (_, i) => [at(i), at(i + 1)]);
}
function cube([x,y,z]: Vec, size: number): Segment[] {
  const pts: Vec[] = Array.from({length: 8}, (_, i) => [x + (i & 1 ? size : -size), y + (i & 2 ? size : -size), z + (i & 4 ? size : -size)]);
  return pts.flatMap((p,i) => [1,2,4].filter(bit => !(i & bit)).map(bit => [p,pts[i | bit]] as Segment));
}
function geometry(variant: Variant): Segment[] {
  if (variant === 'home') return [0,.5,1,1.5,2,2.5].flatMap(tilt => ring(2.5,tilt));
  if (variant === 'about') {
    const helix = (i: number, side: number): Vec => [Math.cos(i*.19+side*Math.PI)*1.35, (i-24)*.115, Math.sin(i*.19+side*Math.PI)*1.35];
    return Array.from({length:48},(_,i) => {
      const pair: Segment[] = [[helix(i,0),helix(i+1,0)],[helix(i,1),helix(i+1,1)]];
      if (i%3===0) pair.push([helix(i,0),helix(i,1)]);
      return pair;
    }).flat();
  }
  if (variant === 'expertise') return [-1,1].flatMap(x=>[-1,1].flatMap(y=>[-1,1].flatMap(z=>cube([x*1.05,y*1.05,z*1.05],.66))));
  if (variant === 'architecture') return [-2,-1,0,1,2].flatMap((y,i) => {
    const r = 2.05-i*.12;
    const corners: Vec[] = [[-r,y,-r],[r,y,-r],[r,y,r],[-r,y,r]];
    const result: Segment[] = corners.map((p,j)=>[p,corners[(j+1)%4]]);
    result.push([corners[0],corners[2]],[corners[1],corners[3]]);
    if (i<4) result.push([[0,y,0],[0,y+1,0]]);
    return result;
  });
  if (variant === 'projects') {
    const nodes: Vec[] = Array.from({length:9},(_,i)=>[2.6*Math.cos(i*TAU/9), .85*Math.sin(i*2.1),2.6*Math.sin(i*TAU/9)]);
    return [...cube([0,0,0],.55),...nodes.flatMap((p,i)=>[...cube(p,.22),[[0,0,0],p] as Segment,[p,nodes[(i+1)%nodes.length]] as Segment])];
  }
  if (variant === 'techstack') return [...cube([0,0,0],.55),...ring(1.45,.2),...ring(2.1,1.1),...ring(2.8,2.2),...Array.from({length:6},(_,i)=>cube([2.1*Math.cos(i*TAU/6),2.1*Math.sin(i*TAU/6)*Math.cos(1.1),2.1*Math.sin(i*TAU/6)*Math.sin(1.1)],.16)).flat()];
  return [.55,1.1,1.65,2.2,2.75].flatMap(r=>ring(r,.7)).concat([[[0,-.4,0],[0,.4,0]]]);
}
const shapes = Object.fromEntries(Object.keys(colors).map(key => [key,geometry(key as Variant)])) as Record<Variant, Segment[]>;
const vertices = Object.fromEntries(Object.keys(shapes).map(key => [key, shapes[key as Variant].flat()])) as Record<Variant, Vec[]>;
const buffers = Object.fromEntries(Object.keys(shapes).map(key => [key,new Float32Array(shapes[key as Variant].flat(2))])) as Record<Variant, Float32Array>;

function StaticArt({ variant }: { variant: Variant }) {
  const project = ([x,y,z]: Vec) => [160 + 42*(x + z*.45), 160 - 42*(y - z*.34)];
  const segments = shapes[variant].map(([a,b])=>{const [x1,y1]=project(a);const [x2,y2]=project(b);return {x1,y1,x2,y2};});
  const filterId = `classic-glow-${variant}`;
  return <svg className="classic-art-static" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><filter id={filterId} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <g fill="none" stroke={colors[variant]} strokeWidth="5" opacity=".6" filter={`url(#${filterId})`}>
      {segments.map((segment,i)=><line key={i} {...segment}/>)}
    </g>
    <g fill="none" stroke={colors[variant]} strokeWidth="1.7" opacity=".95" strokeLinecap="round">
      {segments.map((segment,i)=><line key={i} {...segment}/>)}
    </g>
    <g fill="#d6f4ff" opacity=".85">
      {segments.filter((_,i)=>i%4===0).map(({x1,y1},i)=><circle key={i} cx={x1} cy={y1} r="1.5"/>)}
    </g>
  </svg>;
}
function ArtReady({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => { if (frames.current < 2 && ++frames.current === 2) onReady(); });
  return null;
}
function AnimatedArt({ variant }: { variant: Variant }) {
  const group = useRef<Group>(null);
  useFrame(({ clock },delta) => {
    if (!group.current) return;
    group.current.rotation.y += Math.min(delta,.05)*.28;
    group.current.rotation.x = .32 + Math.sin(clock.elapsedTime*.35)*.12;
    group.current.position.y = Math.sin(clock.elapsedTime*.65)*.13;
  });
  return <group ref={group} rotation={[.32,.55,0]}>
    <Line points={vertices[variant]} segments color={colors[variant]} lineWidth={5} transparent opacity={.17} depthWrite={false} />
    <Line points={vertices[variant]} segments color={colors[variant]} lineWidth={2.2} transparent opacity={.98} depthWrite={false} />
    <mesh rotation={[.3,.5,.2]}>
      <icosahedronGeometry args={[.44,1]} />
      <meshBasicMaterial color={colors[variant]} wireframe transparent opacity={.75} />
    </mesh>
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[buffers[variant],3]} /></bufferGeometry>
      <pointsMaterial color={colors[variant]} size={.065} transparent opacity={.95} depthWrite={false}/>
    </points>
  </group>;
}
class ArtBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
function LiveArt({ variant, renderLive }: { variant: Variant; renderLive?: (onReady: () => void) => ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = () => setReady(true);
  return <ArtBoundary>
    <div className="classic-art-live" data-ready={ready}>
      {renderLive ? renderLive(markReady) : <Canvas camera={{ position:[0,0,9.1],fov:43 }} dpr={[1,1.5]} gl={{alpha:true,antialias:true}} fallback={null}>
        <AnimatedArt variant={variant}/><ArtReady onReady={markReady}/>
      </Canvas>}
    </div>
  </ArtBoundary>;
}
export default function ClassicBackdrop({ variant, renderLive }: { variant: Variant; renderLive?: (onReady: () => void) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: .02 });
  const reduced = useReducedMotion();
  return <div ref={ref} className="classic-backdrop" data-classic-scene={variant} aria-hidden="true">
    <div className="classic-art-stage">
      <StaticArt variant={variant} />
      {visible && !reduced && <LiveArt variant={variant} renderLive={renderLive}/>}
      <span className="classic-art-label">{labels[variant]}</span>
    </div>
  </div>;
}
