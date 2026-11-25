import { Component, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useInView, useReducedMotion } from 'framer-motion';
import { Group, Vector3, MathUtils } from 'three';
import { colors, labels, shapes, vertices, buffers, type Variant, type Vec } from './classicGeometry';
import { pointAngle } from '../../utils/classicRotation';

export interface SceneInteraction {
  rotation: RefObject<number>;
  markers: RefObject<HTMLDivElement | null>;
  count: number;
  active: number;
}
function hotspot(index: number, count: number): Vec {
  const angle = pointAngle(index, count);
  return [3.0 * Math.sin(angle), .25 * Math.sin(angle * 2), 3.0 * Math.cos(angle)];
}

function StaticArt({ variant, interaction }: { variant: Variant; interaction?: SceneInteraction }) {
  const angle = interaction ? -pointAngle(interaction.active, interaction.count) : 0;
  const project = ([x,y,z]: Vec) => {
    const X = x * Math.cos(angle) + z * Math.sin(angle);
    const Z = -x * Math.sin(angle) + z * Math.cos(angle);
    return [200 + 49*(X + Z*.22), 200 - 49*(y - Z*.28)];
  };
  const segments = shapes[variant].map(([a,b])=>{const [x1,y1]=project(a);const [x2,y2]=project(b);return {x1,y1,x2,y2};});
  const filterId = `classic-glow-${variant}`;
  return <svg className="classic-art-static" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><filter id={filterId} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <g fill="none" stroke={colors[variant]} strokeWidth="6" opacity=".46" filter={`url(#${filterId})`}>
      {segments.map((segment,i)=><line key={i} {...segment}/>)}
    </g>
    <g fill="none" stroke={colors[variant]} strokeWidth="1.8" opacity=".92" strokeLinecap="round">
      {segments.map((segment,i)=><line key={i} {...segment}/>)}
    </g>
    {interaction && Array.from({length:interaction.count},(_,i)=>{
      const [x,y]=project(hotspot(i,interaction.count));
      return <g key={i}><circle cx={x} cy={y} r={i===interaction.active?9:4} fill={i===interaction.active?'#e7faff':colors[variant]} opacity={i===interaction.active?1:.55}/>{i===interaction.active&&<circle cx={x} cy={y} r="15" fill="none" stroke={colors[variant]} strokeWidth="1.4"/>}</g>;
    })}
  </svg>;
}

function ArtReady({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => { if (frames.current < 2 && ++frames.current === 2) onReady(); });
  return null;
}

function AnimatedArt({ variant, interaction }: { variant: Variant; interaction?: SceneInteraction }) {
  const group = useRef<Group>(null);
  const core = useRef<Group>(null);
  const position = useRef(new Vector3());
  const projected = useRef(new Vector3());
  useFrame(({ clock, camera, viewport, size },delta) => {
    if (!group.current || !core.current) return;
    const dt = Math.min(delta,.05);
    const g = group.current;
    const desktop = size.width >= 800;
    const scale = Math.min(1.42, viewport.width / (desktop ? 7.4 : 7), viewport.height / 7.2);
    g.scale.setScalar(scale);
    g.position.x = desktop ? viewport.width * .095 : 0;
    g.position.y = 0;
    const elapsed = clock.elapsedTime;
    if (interaction) {
      g.rotation.y = MathUtils.damp(g.rotation.y, interaction.rotation.current, 9, dt);
      core.current.rotation.y += dt * .16;
      core.current.rotation.x = .18 + Math.sin(elapsed*.35)*.12;
      g.updateMatrixWorld(true);
      const buttons = interaction.markers.current?.children;
      if (buttons) for (let i=0; i<interaction.count; i++) {
        const element = buttons[i] as HTMLButtonElement | undefined;
        if (!element) continue;
        position.current.set(...hotspot(i,interaction.count));
        g.localToWorld(position.current);
        projected.current.copy(position.current).project(camera);
        const p = projected.current;
        const front = position.current.z > -.2 && Math.abs(p.x)<.97 && Math.abs(p.y)<.96;
        element.style.visibility = front ? 'visible' : 'hidden';
        element.style.left = `${(p.x+1)*50}%`;
        element.style.top = `${(1-p.y)*50}%`;
      }
    } else {
      g.rotation.y += dt * .28;
      core.current.rotation.x = .32 + Math.sin(elapsed*.35)*.12;
    }
  });
  return <group ref={group}>
    <group ref={core}>
      <Line points={vertices[variant]} segments color={colors[variant]} lineWidth={5} transparent opacity={.17} depthWrite={false} />
      <Line points={vertices[variant]} segments color={colors[variant]} lineWidth={2.1} transparent opacity={.95} depthWrite={false} />
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[buffers[variant],3]} /></bufferGeometry>
        <pointsMaterial color={colors[variant]} size={.065} transparent opacity={.95} depthWrite={false}/>
      </points>
      <mesh rotation={[.3,.5,.2]}>
        <icosahedronGeometry args={[.42,1]} />
        <meshBasicMaterial color={colors[variant]} wireframe transparent opacity={.7} />
      </mesh>
    </group>
    {interaction && Array.from({length:interaction.count},(_,i)=><group key={i} position={hotspot(i,interaction.count)}>
      <mesh><sphereGeometry args={[i===interaction.active?.12:.065,12,8]}/><meshBasicMaterial color={i===interaction.active?'#e8fbff':colors[variant]}/></mesh>
      {i===interaction.active&&<mesh><sphereGeometry args={[.25,12,8]}/><meshBasicMaterial color={colors[variant]} wireframe transparent opacity={.5}/></mesh>}
    </group>)}
  </group>;
}
class ArtBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function LiveArt({ variant, renderLive, interaction }: { variant: Variant; renderLive?: (onReady: () => void) => ReactNode; interaction?: SceneInteraction }) {
  const [ready, setReady] = useState(false);
  const markReady = () => setReady(true);
  return <ArtBoundary>
    <div className="classic-art-live" data-ready={ready}>
      {renderLive ? renderLive(markReady) : <Canvas camera={{ position:[0,0,10.4],fov:46 }} dpr={[1,1.5]} gl={{alpha:true,antialias:true}} fallback={null}>
        <AnimatedArt variant={variant} interaction={interaction}/><ArtReady onReady={markReady}/>
      </Canvas>}
    </div>
  </ArtBoundary>;
}
export default function ClassicBackdrop({ variant, renderLive, interaction }: { variant: Variant; renderLive?: (onReady: () => void) => ReactNode; interaction?: SceneInteraction }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: .02 });
  const reduced = useReducedMotion();
  return <div ref={ref} className="classic-backdrop" data-classic-scene={variant} aria-hidden="true">
    <div className="classic-art-stage">
      <StaticArt variant={variant} interaction={interaction}/>
      {visible && !reduced && <LiveArt variant={variant} renderLive={renderLive} interaction={interaction}/>}
      <span className="classic-art-label">{labels[variant]}</span>
    </div>
  </div>;
}
