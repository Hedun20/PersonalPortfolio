import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentRef, type CSSProperties, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { DataRain } from './CampusAtmosphere';
import { CampusEnergy, FacilityEnergyLink } from './CampusEnergy';
import { ArchitecturalFinish, CampusMaterialProvider, ContactFootprint, PolishedPlaza } from './CampusMaterials';
import { ArchitecturalSlab, FacilityArchitecture } from './CampusArchitecture';
import { ArchitecturalSky, CityLighting } from './CampusVisuals';
import { CampusProjectDemo, WorkflowSignal } from './CampusProjectDemo';
import { contact } from '../../data/contact';
import './EngineeringCampus.css';

type Vec3 = [number, number, number];
type ZoneId = 'ai' | 'software' | 'data' | 'command' | 'research';
type Zone = { angle: number; id: ZoneId; label: string; name: string; position: Vec3; color: string; description: string; section: string };

// Five facilities surround the central energy distribution core.
const ARC_CENTER_Z = 4;
const FACILITY_RADIUS = 16.1;
const ARC_END = Math.PI / 2;
function arcPoint(angle: number, radius: number, y = 0): Vec3 {
  return [Math.sin(angle) * radius, y, ARC_CENTER_Z - Math.cos(angle) * radius];
}
const zones: Zone[] = [
  { id: 'software', label: '01', name: 'Software Engineering Lab', angle: -1.15, position: arcPoint(-1.15, FACILITY_RADIUS), color: '#65e9d6', description: 'Full-stack systems, application architecture and maintainable engineering.', section: '#projects' },
  { id: 'data', label: '02', name: 'Data Center', angle: -.575, position: arcPoint(-.575, FACILITY_RADIUS), color: '#65a5ff', description: 'Infrastructure, data pipelines and resilient operations.', section: '#expertise' },
  { id: 'ai', label: '03', name: 'AI Core', angle: 0, position: arcPoint(0, FACILITY_RADIUS), color: '#50d5ff', description: 'Local inference, document intelligence and agent architectures.', section: '#expertise' },
  { id: 'command', label: '04', name: 'Command Center', angle: .575, position: arcPoint(.575, FACILITY_RADIUS), color: '#e6c18b', description: 'Deployment, CI/CD and observability.', section: '#architecture' },
  { id: 'research', label: '05', name: 'Research Lab', angle: 1.15, position: arcPoint(1.15, FACILITY_RADIUS), color: '#a7b4ff', description: 'Experiments, model evaluation and emerging technical approaches.', section: '#projects' },
];

const dossiers: Record<ZoneId, { subtitle: string; intro: string; capabilities: string[]; route: string; caseName: string; caseStatus: string; caseText: string }> = {
  ai: { subtitle: 'PRIVATE INTELLIGENCE / SYSTEM DESIGN', intro: 'Engineering AI that can work close to the data. Local inference, document understanding and retrieval are connected through an architecture designed for privacy-sensitive workflows.', capabilities: ['Local LLM inference & routing', 'Document OCR & retrieval', 'Agent orchestration', 'Privacy-oriented architecture'], route: 'Explore AI expertise', caseName: 'THAI — Document intelligence', caseStatus: 'IN DEVELOPMENT', caseText: 'An offline-first document platform combining OCR, retrieval and local language models. Focus: system architecture, model integration and reliable document workflows.' },
  software: { subtitle: 'APPLICATIONS / FULL-STACK ENGINEERING', intro: 'From a user interaction to the database: build applications as coherent systems rather than isolated screens. Emphasis on maintainability, predictable APIs and production support.', capabilities: ['React & TypeScript', 'Node.js & REST APIs', 'Data modeling & authorization', 'Application testing'], route: 'Explore software projects', caseName: 'Internal CRM', caseStatus: 'ENGINEERING CASE', caseText: 'Full-stack application development spanning interface, backend, data model and deployment. The focus is a maintainable application architecture and practical business workflows.' },
  data: { subtitle: 'INFRASTRUCTURE / DATA OPERATIONS', intro: 'The physical and logical foundations of reliable computing: infrastructure coordination, data movement and the operational work that keeps complex systems running.', capabilities: ['Data center operations', 'Data pipelines', 'SQL & databases', 'Infrastructure reliability'], route: 'Explore infrastructure expertise', caseName: 'Data center operations', caseStatus: 'PROFESSIONAL EXPERIENCE', caseText: 'Coordinating technical work in a data center environment, with attention to dependencies, operational handovers and reliable execution.' },
  command: { subtitle: 'DELIVERY / PLATFORM OPERATIONS', intro: 'Make change repeatable. Connect source control, deployment and maintenance with clear release boundaries and operational visibility.', capabilities: ['Linux & Nginx', 'Git & CI/CD', 'Service deployment', 'Operational monitoring'], route: 'Explore system architecture', caseName: 'Application delivery', caseStatus: 'ENGINEERING PRACTICE', caseText: 'Version-controlled releases, Linux application hosting and reproducible deployment practices. The objective is a system that can be maintained after the initial build.' },
  research: { subtitle: 'EXPERIMENTS / APPLIED RESEARCH', intro: 'Test ambitious ideas against real constraints. Investigate local inference, agent workflows and interactive interfaces through prototypes and measurable experiments.', capabilities: ['Local model evaluation', 'Agent experiments', 'Context management', 'Interactive prototypes'], route: 'Explore experimental work', caseName: 'Built with local intelligence', caseStatus: 'ONGOING EXPERIMENT', caseText: 'This portfolio is a human-directed experiment in local AI development. Qwen and Inkling were tested on consumer hardware; generated work is reviewed and refined rather than accepted blindly.' },
};

type Topic = { name: string; anchor: Vec3; marker: Vec3; title: string; text: string; tags: string[] };
const topics: Record<ZoneId, Topic[]> = {
  software: [
    { name: 'Interface', anchor: [-1.06,1.7,1.42], marker: [-2.4,1.55,2.15], title: 'The experience layer', text: 'React and TypeScript turn application workflows into interfaces with explicit state, reusable components and predictable interactions.', tags: ['React','TypeScript','UI architecture'] },
    { name: 'Application', anchor: [0,2.65,.35], marker: [0,3.45,1.15], title: 'Internal CRM', text: 'A full-stack CRM built around business workflows, application state, backend services and deployment. The frontend and API are designed as one maintainable system.', tags: ['Node.js','REST','Application architecture'] },
    { name: 'Data & access', anchor: [1.06,1.2,1.42], marker: [2.35,.95,2.1], title: 'Data and authorization', text: 'Model the data, enforce authorization at the API boundary and maintain a clear path from the interface to persistent storage.', tags: ['MongoDB','SQL','RBAC'] },
  ],
  data: [
    { name: 'Infrastructure', anchor: [-1.2,1.8,1.4], marker: [-2.45,1.6,2.0], title: 'Data center operations', text: 'Physical infrastructure needs dependable coordination: technical dependencies, operational handovers and the execution of work across teams.', tags: ['Infrastructure','Operations','Coordination'] },
    { name: 'Data movement', anchor: [0,2.58,.7], marker: [0,3.52,1.2], title: 'Data pipelines', text: 'Data flows connect source systems, transformation and storage. Reliable processing starts with clear dependencies and observable execution.', tags: ['IBM DataStage','SQL','Data pipelines'] },
    { name: 'Reliability', anchor: [1.2,1.0,1.4], marker: [2.35,.95,2.1], title: 'Operational continuity', text: 'Treat maintenance and handovers as engineering work, with attention to dependencies, monitoring and repeatable execution.', tags: ['Reliability','Maintenance','Operations'] },
  ],
  ai: [
    { name: 'Inference', anchor: [-1.38,1.8,.8], marker: [-2.65,1.65,2.05], title: 'Local inference', text: 'Run language models close to the data. Model selection, memory limits, context length and inference speed are tested against practical workloads.', tags: ['Local LLMs','Strata','LM Studio'] },
    { name: 'THAI', anchor: [0,3.45,0], marker: [0,4.65,1.0], title: 'THAI — Document intelligence', text: 'An offline-first document platform in development, combining OCR, retrieval and language models for privacy-sensitive workflows. The focus is architecture and local integration.', tags: ['OCR','RAG','Offline-first'] },
    { name: 'Agents', anchor: [1.4,.9,1.0], marker: [2.65,1.0,2.1], title: 'Agent orchestration', text: 'Separate task planning, model execution and verification. Experiments explore how local models can perform bounded tasks without carrying the entire project in context.', tags: ['Tool calling','Orchestration','Context'] },
  ],
  command: [
    { name: 'Source control', anchor: [-1.1,1.45,.8], marker: [-2.5,1.35,1.95], title: 'Versioned delivery', text: 'Keep changes reviewable and releases traceable. Git makes a known working state recoverable while incremental changes are tested.', tags: ['Git','GitHub','Release workflow'] },
    { name: 'Deployment', anchor: [0,3.25,1.0], marker: [0,4.65,1.5], title: 'Application delivery', text: 'Connect application architecture to reproducible hosting and deployment. Linux, Nginx and service management form the operating foundation.', tags: ['Linux','Nginx','PM2'] },
    { name: 'Operations', anchor: [1.1,2.1,.8], marker: [2.45,1.85,2.0], title: 'Operational visibility', text: 'Keep the path from an application change to its runtime behavior understandable. Logs, build checks and operational feedback support maintenance.', tags: ['Logs','CI/CD','Monitoring'] },
  ],
  research: [
    { name: 'Models', anchor: [-1.33,1.3,1.2], marker: [-2.5,1.1,2.0], title: 'Local model evaluation', text: 'Compare local models on real programming tasks, not only benchmark scores. Measure generation speed, context use and the quality of the resulting code.', tags: ['MoE','Quantization','Evaluation'] },
    { name: 'Experiments', anchor: [0,2.45,.15], marker: [0,3.95,1.15], title: 'Built with local intelligence', text: 'This portfolio is a human-directed experiment. Qwen and Inkling contributed to earlier prototypes, with subsequent design and engineering iteration and explicit review.', tags: ['Three.js','Agent workflows','Prototyping'] },
    { name: 'Context', anchor: [1.33,1.1,1.2], marker: [2.5,.95,2.0], title: 'Context efficiency', text: 'Explore how task decomposition, prompt reuse and adaptive reasoning budgets affect local agents on consumer hardware.', tags: ['KV cache','Reasoning','Context management'] },
  ],
};
const facilityNames: Record<ZoneId, string> = { software: 'Software Lab', data: 'Data Center', ai: 'AI Core', command: 'Command Center', research: 'Research Lab' };
const labelHeights: Record<ZoneId, number> = { software: 3.65, data: 3.55, ai: 4.75, command: 4.9, research: 3.85 };

const steel = '#344455';
const dark = '#172333';
const panel = '#202e40';

function Block({ position, size, color = steel, rotation = [0, 0, 0], light = false, finish }: { position: Vec3; size: Vec3; color?: string; rotation?: Vec3; light?: boolean; finish?: 'titanium'|'ceramic'|'stone'|'glass' }) {
  const darkPanel = parseInt(color.slice(1,3),16)<45 && parseInt(color.slice(3,5),16)<70;
  const surface = finish ?? (darkPanel?'ceramic':'titanium');
  return <mesh position={position} rotation={rotation} castShadow={!light && Math.max(...size)>.45} receiveShadow={!light && Math.max(...size)>.45}>
    <boxGeometry args={size} />
    {light ? <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} /> : <ArchitecturalFinish color={color} finish={surface} detail={Math.max(...size)>.40} />}
  </mesh>;
}

// Shared materials are applied to repeated UVs rather than allocating one texture per floor.
function SurfaceFloor({size,position,color,repeat,finish='stone'}:{size:[number,number];position:Vec3;color:string;repeat:number;finish?:'stone'|'asphalt'}){
  const [width,depth]=size;
  const geometry=useMemo(()=>{
    const g=new THREE.PlaneGeometry(width,depth);
    const uv=g.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*repeat,uv.getY(i)*repeat*depth/width);
    return g;
  },[width,depth,repeat]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh position={position} rotation={[-Math.PI/2,0,0]} geometry={geometry} receiveShadow><ArchitecturalFinish color={color} finish={finish}/></mesh>;
}

function Glazing({ position, size, color = '#365b71' }: { position: Vec3; size: Vec3; color?: string }) {
  return <mesh position={position}><boxGeometry args={size}/><ArchitecturalFinish color={color} finish="glass"/></mesh>;
}

function Cylinder({ position, radius, height, color = steel, sides = 8, light = false, rotation = [0, 0, 0] }: { position: Vec3; radius: number; height: number; color?: string; sides?: number; light?: boolean; rotation?: Vec3 }) {
  return <mesh position={position} rotation={rotation} castShadow={!light && radius>.25} receiveShadow={!light && radius>.25}>
    <cylinderGeometry args={[radius, radius, height, sides]} />
    {light ? <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.3} toneMapped={false} /> : <ArchitecturalFinish color={color} finish="titanium" detail={radius>.25}/>}
  </mesh>;
}

function Rail({ from, to, color = steel, width = 0.045, light = false }: { from: Vec3; to: Vec3; color?: string; width?: number; light?: boolean }) {
  const { midpoint, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const delta = end.clone().sub(start);
    return { midpoint: start.clone().add(end).multiplyScalar(0.5), quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize()), length: delta.length() };
  }, [from, to]);
  return <mesh position={midpoint} quaternion={quaternion}>
    <boxGeometry args={[width, length, width]} />
    {light ? <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} /> : <meshStandardMaterial color={color} metalness={0.45} roughness={0.45} />}
  </mesh>;
}

function Pad({ color, active, wide = false }: { color: string; active: boolean; wide?: boolean }) {
  const x = wide ? 4.9 : 4.5;
  const z = wide ? 4.0 : 3.7;
  return <group>
    <Block position={[0, 0.12, 0]} size={[x, 0.24, z]} color="#253747" />
    <Block position={[0, 0.27, 0]} size={[x - 0.22, 0.1, z - 0.22]} color={dark} />
    {[-1, 1].map(s => <group key={s}>
      <Block position={[s * (x / 2 - 0.16), 0.33, 0]} size={[0.045, 0.035, z - 0.4]} color={color} light={active} />
      <Block position={[0, 0.33, s * (z / 2 - 0.16)]} size={[x - 0.4, 0.035, 0.045]} color={color} light={active} />
      {[-1, 1].map(t => <Block key={t} position={[s * (x / 2 - 0.36), 0.38, t * (z / 2 - 0.36)]} size={[0.35, 0.14, 0.35]} color={color} light />)}
    </group>)}
  </group>;
}

function Core({ color, motion }: { color: string; motion: boolean }) {
  const ring = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ring.current && motion) ring.current.rotation.y += Math.min(dt, 0.05) * 0.38; });
  return <group>
    <Cylinder position={[0, 0.48, 0]} radius={1.8} height={0.33} />
    <Cylinder position={[0, 0.76, 0]} radius={1.22} height={0.2} color={color} light />
    <Cylinder position={[0, 1.02, 0]} radius={0.8} height={0.36} color={dark} />
    <Cylinder position={[0, 2.03, 0]} radius={0.49} height={1.8} color={color} sides={32} light />
    <Cylinder position={[0, 3.02, 0]} radius={0.78} height={0.22} color={steel} />
    <Cylinder position={[0, 3.17, 0]} radius={0.57} height={0.08} color={color} light />
    <Cylinder position={[0,3.38,0]} radius={1.27} height={.17} color="#78909e" sides={12}/>
    <Cylinder position={[0,3.50,0]} radius={1.14} height={.055} color={color} sides={24} light/>
    <Cylinder position={[0,3.61,0]} radius={.65} height={.18} color="#334e60" sides={12}/>

    {Array.from({ length: 6 }, (_, i) => {
      const a = i * Math.PI / 3;
      const p: Vec3 = [Math.cos(a) * 1.44, 1.9, Math.sin(a) * 1.44];
      return <group key={i} position={p} rotation={[0, -a, 0]}>
        <Block position={[0, 0, 0]} size={[0.3, 2.70, 0.33]} color={steel} />
        <Block position={[0.17, 0.08, 0]} size={[0.055, 2.35, 0.14]} color={color} light />
        <Block position={[0, -1.17, 0]} size={[0.66, 0.3, 0.61]} color={dark} />
      </group>;
    })}
    <mesh position={[0,2.03,0]}>
      <cylinderGeometry args={[1.16,1.16,1.78,48,1,true]}/>
      <meshPhysicalMaterial color="#a6d5e6" metalness={0} roughness={.14} clearcoat={1} ior={1.45} transparent opacity={.11} depthWrite={false} side={THREE.DoubleSide} envMapIntensity={1.25}/>
    </mesh>
    {[1.22, 2.85].map(y => <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.45, 0.085, 8, 48]} /><meshStandardMaterial color={steel} metalness={0.5} roughness={0.35} />
    </mesh>)}
    <group ref={ring} position={[0, 2.05, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.12, 0.035, 8, 48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.3} toneMapped={false} /></mesh>
      {Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return <Block key={i} position={[Math.cos(a) * 1.12, 0, Math.sin(a) * 1.12]} size={[0.14, 0.12, 0.14]} color={color} light />; })}
    </group>
  </group>;
}

function Software({ color }: { color: string }) {
  return <group>
    {/* Twin glazed engineering wings, connected by a raised, enclosed skybridge. */}
    {[-1.08,1.08].map((x,wing)=><group key={x} position={[x,0,0]}>
      <Block position={[0,.48,0]} size={[1.72,.28,2.78]} color="#647784"/>
      <Block position={[0,1.43,-.06]} size={[1.5,1.74,2.6]} color="#172c3b"/>
      <Glazing position={[0,1.46,1.26]} size={[1.43,1.48,.055]}/>
      <Glazing position={[0,1.46,-1.38]} size={[1.43,1.48,.055]}/>
      {[-1,1].map(side=><group key={side}>
        <Glazing position={[side*.765,1.46,-.06]} size={[.045,1.48,2.48]} color="#29495e"/>
        {[-1,1].map(end=><Block key={end} position={[side*.81,1.43,end*1.25-.06]} size={[.13,1.86,.15]} color="#83949f"/>)}
        {Array.from({length:7},(_,i)=><Block key={i} position={[side*.795,1.45,-1.12+i*.35]} size={[.058,1.54,.055]} color="#7c909b"/>)}
      </group>)}
      {Array.from({length:5},(_,i)=><Block key={i} position={[-.65+i*.325,1.46,1.30]} size={[.05,1.54,.06]} color="#8e9da6"/>)}
      {[.77,1.47,2.18].map(y=><group key={y}><Block position={[0,y,0]} size={[1.66,.07,2.72]} color="#a1aeb4"/><Block position={[0,y+.05,1.38]} size={[1.28,.025,.035]} color={color} light/></group>)}
      <ArchitecturalSlab position={[0,2.34,0]} size={[1.82,.22,2.89]} color="#657985" cut={.22}/>
      <Block position={[0,2.48,-.12]} size={[1.64,.09,2.68]} color="#253c4b"/>
      <Block position={[0,2.54,-.54]} size={[1.18,.13,1.23]} color="#213644"/>
      {Array.from({length:8},(_,i)=><Block key={i} position={[0,2.63,-1.01+i*.13]} size={[.99,.035,.045]} color="#718894"/>)}
      <Block position={[0,.76,1.42]} size={[.59,.71,.065]} color="#0d1d29"/>
      <Block position={[0,1.13,1.46]} size={[.76,.07,.14]} color={color} light/>
      <Block position={[0,.40,1.46]} size={[.85,.07,.29]} color="#526c7c"/>
      {wing===0&&<Block position={[0,2.62,.5]} size={[.91,.12,.73]} color="#536e7f"/>}
    </group>)}
    <Block position={[0,1.85,-.16]} size={[.8,.16,1.24]} color="#92a3aa"/>
    <Block position={[0,2.42,-.16]} size={[.91,.13,1.35]} color="#627d8e"/>
    <Glazing position={[0,2.13,.47]} size={[.75,.44,.05]}/>
    <Glazing position={[0,2.13,-.79]} size={[.75,.44,.05]}/>
    <Block position={[0,2.49,.49]} size={[.8,.025,.045]} color={color} light/>
    {[-1,1].map(side=><Rail key={side} from={[side*.37,.46,.98]} to={[side*.37,1.82,.55]} width={.105} color="#718895"/>)}
    <Block position={[0,2.74,.35]} size={[1.45,.12,.48]} color="#3f5869"/>
    <Block position={[0,2.82,.57]} size={[1.2,.035,.045]} color={color} light/>
  </group>;
}

function DataCenter({ color }: { color: string }) {
  return <group>
    {/* Open, glazed equipment hall: racks remain visible from the avenue. */}
    {[-1.88,1.88].map(x=><group key={x}>
      {[-1.46,1.46].map(z=><group key={z}><Block position={[x,1.57,z]} size={[.17,2.52,.17]} color="#899da8"/><Block position={[x,1.57,z+.1]} size={[.045,2.10,.045]} color={color} light/></group>)}
      <Glazing position={[x,1.64,0]} size={[.055,1.94,2.69]} color="#294457"/>
      <Block position={[x,2.84,0]} size={[.2,.19,3.15]} color="#8397a5"/>
    </group>)}
    <ArchitecturalSlab position={[0,2.86,-.03]} size={[3.98,.2,3.20]} color="#405563" cut={.28}/>
    <ArchitecturalSlab position={[0,3.0,0]} size={[3.66,.1,2.88]} color="#273c4c" cut={.23}/>
    <Block position={[0,2.87,1.63]} size={[3.65,.045,.045]} color={color} light/>
    {[-1.2,0,1.2].map(x=><group key={x}><Block position={[x,3.06,-.56]} size={[.92,.16,1.05]} color="#536e7e"/>{Array.from({length:6},(_,i)=><Block key={i} position={[x,3.16,-.96+i*.15]} size={[.77,.035,.05]} color="#8c9faa"/>)}</group>)}
    {[-1.2, 0, 1.2].map((x, col) => <group key={x} position={[x, 0, 0]}>
      <Block position={[0, 1.25, 0]} size={[0.92, 1.84, 2.55]} color={dark} />
      <Block position={[0, 2.24, 0]} size={[1.02, 0.17, 2.65]} color={steel} />
      {Array.from({ length: 7 }, (_, i) => <group key={i}>
        <Block position={[0, 0.56 + i * 0.23, 1.3]} size={[0.73, 0.15, 0.045]} color={panel} />
        <Block position={[-0.23, 0.56 + i * 0.23, 1.33]} size={[0.105, 0.06, 0.025]} color={color} light />
        <Block position={[0.1, 0.56 + i * 0.23, 1.33]} size={[0.32, 0.055, 0.025]} color={i % 3 === col ? color : steel} light={i % 3 === col} />
      </group>)}
      <Block position={[0, 0.46, -1.32]} size={[0.66, 0.1, 0.08]} color={color} light />
      {[-0.65, 0.65].map(z => <Cylinder key={z} position={[0, 2.36, z]} radius={0.31} height={0.13} sides={16} color={panel} />)}
    </group>)}
    <Block position={[0, 2.55, -0.9]} size={[3.65, 0.12, 0.2]} color={color} light />
    {[-1.8, 1.8].map(x => <Block key={x} position={[x, 1.45, -0.9]} size={[0.12, 2.2, 0.2]} color={steel} />)}
  </group>;
}

function Command({ color, motion }: { color: string; motion: boolean }) {
  const radar = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (motion && radar.current) radar.current.rotation.y += Math.min(dt, .1) * .35; });
  return <group>
    {/* A stepped observation tower, with dark glazing, champagne-metal fins and roof communications. */}
    <ArchitecturalSlab position={[0,.49,0]} size={[3.57,.3,2.90]} color="#354858" cut={.32}/>
    <Block position={[0,1.12,-.23]} size={[2.12,1.2,1.73]} color="#152532" />
    <Block position={[0,2.23,-.23]} size={[2.55,1.1,2.03]} color="#243847" />
    <ArchitecturalSlab position={[0,2.88,-.23]} size={[3.48,.24,2.63]} color="#7c8a92" cut={.34}/>
    <ArchitecturalSlab position={[0,3.16,-.23]} size={[3.25,.36,2.4]} color="#102636" cut={.30}/>
    <ArchitecturalSlab position={[0,2.88,-.23]} size={[3.54,.14,2.69]} color="#a7a4a0" cut={.34}/>
    <ArchitecturalSlab position={[0,3.41,-.23]} size={[3.55,.16,2.69]} color="#344b5b" cut={.40}/>
    <Block position={[0,3.57,-.23]} size={[2.7,.17,1.94]} color="#172a39" />
    <Block position={[0,3.68,-.23]} size={[2.8,.035,2.02]} color={color} light />
    <Block position={[0,3.72,-.23]} size={[2.52,.055,1.78]} color="#192e3c" />
    {[-1,1].map(side=><group key={side}>
      <Rail from={[side*1.5,.65,.9]} to={[side*1.12,2.8,.82]} width={.19} color="#82939e" />
      <Rail from={[side*1.3,.66,-1.24]} to={[side*1.1,2.8,-1.21]} width={.18} color="#617889" />
      <Rail from={[side*1.5,.7,1]} to={[side*1.12,2.76,.92]} width={.038} color={color} light />
      <Block position={[side*1.73,3.16,-.23]} size={[.075,.29,2.36]} color="#2b5268" finish="glass" />
      <Block position={[side*1.79,2.93,-.23]} size={[.055,.055,2.62]} color={color} light />
    </group>)}
    {[-1,1].map(side=><group key={side}>
      <Block position={[0,3.16,-.23+side*1.225]} size={[3.18,.30,.035]} color="#29536a" finish="glass" />
      {Array.from({length:9},(_,i)=><Block key={i} position={[-1.48+i*.37,3.16,-.23+side*1.25]} size={[.035,.32,.05]} color="#9aa8ac" />)}
      <Block position={[0,3.02,-.23+side*1.26]} size={[3.15,.027,.035]} color={color} light />
    </group>)}
    <group ref={radar} position={[0,3.94,-.23]}>
      <Cylinder position={[0,0,0]} radius={.56} height={.25} color="#263c4b" sides={24} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.15,0]}><torusGeometry args={[.56,.025,8,48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} /></mesh>
      <Block position={[0,.27,0]} size={[1.12,.08,.23]} color="#a4b4bb" />
      <Block position={[0,.32,0]} size={[.98,.035,.14]} color={color} light />
    </group>
    <Cylinder position={[.91,4.07,-.72]} radius={.045} height={.75} sides={12} color="#8ba2b0" />
    <Cylinder position={[.91,4.47,-.72]} radius={.085} height={.09} color={color} light />
  </group>;
}

function Research({ color, motion }: { color: string; motion: boolean }) {
  const lattice = useRef<THREE.Group>(null);
  useFrame((_,dt)=>{if(motion && lattice.current) lattice.current.rotation.y += Math.min(dt,.1)*.22;});
  return <group>
    {/* Twin research wings flank a faceted, transparent computational observatory. */}
    <ArchitecturalSlab position={[0,.46,0]} size={[3.80,.26,2.93]} color="#344658" cut={.24}/>
    {[-1,1].map(side=><group key={side} position={[side*1.33,0,-.05]}>
      <Block position={[0,1.03,0]} size={[1.02,1.08,2.35]} color="#24374a" />
      <ArchitecturalSlab position={[0,1.66,0]} size={[1.10,.18,2.40]} color="#7c8d9f" cut={.17}/>
      <Block position={[0,1.81,-.3]} size={[.72,.14,1.35]} color="#172b40" />
      <Block position={[0,1.9,-.3]} size={[.6,.03,1.12]} color="#526f9c" />
      {Array.from({length:6},(_,i)=><group key={i}><Block position={[side*.53,1.16,-.93+i*.37]} size={[.035,.59,.26]} color="#3f5d7a" finish="glass" /><Block position={[side*.56,.89,-.93+i*.37]} size={[.028,.027,.22]} color={color} light /></group>)}
      <Block position={[0,1.03,1.19]} size={[.78,.63,.045]} color="#3b5777" finish="glass" />
      <Block position={[0,1.38,1.22]} size={[.78,.035,.04]} color={color} light />
    </group>)}
    <Cylinder position={[0,.76,-.13]} radius={.78} height={.44} sides={12} color="#546b82" />
    <Cylinder position={[0,1.01,-.13]} radius={.69} height={.075} sides={24} color={color} light />
    <Cylinder position={[0,1.15,-.13]} radius={.35} height={.26} sides={16} color="#213d52" />
    <group ref={lattice} position={[0,2.0,-.13]}>
      <mesh><icosahedronGeometry args={[.75,1]} /><meshStandardMaterial color="#8ca8df" metalness={.3} roughness={.18} transparent opacity={.26} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <mesh><icosahedronGeometry args={[.77,1]} /><meshBasicMaterial color={color} wireframe transparent opacity={.48} toneMapped={false} /></mesh>
      <mesh rotation={[.65,0,.45]}><torusGeometry args={[.52,.035,8,48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} toneMapped={false} /></mesh>
      <mesh><octahedronGeometry args={[.3,0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} /></mesh>
    </group>
  </group>;
}

// Continuous annular housing for the energy conduits.
function ArcStrip({ inner, outer, y, color, glow = false, end = ARC_END, finish }: { inner: number; outer: number; y: number; color: string; glow?: boolean; end?: number; finish?: 'asphalt'|'stone' }) {
  const geometry = useMemo(()=>{
    const vertices: number[] = [], indices: number[] = [], uvs: number[] = [];
    for(let i=0;i<=96;i++) {
      const a=-end+i/96*end*2;
      vertices.push(...arcPoint(a,inner,y),...arcPoint(a,outer,y));
      const u=i/96*end*(inner+outer)/2; uvs.push(u,0,u,(outer-inner)/2);
      if(i<96) { const n=i*2; indices.push(n,n+2,n+1,n+2,n+3,n+1); }
    }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(indices); g.computeVertexNormals(); return g;
  },[inner,outer,y,end]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} receiveShadow={!glow}>{glow ? <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} toneMapped={false} /> : <ArchitecturalFinish color={color} finish={finish??'titanium'} detail={Boolean(finish)}/>}</mesh>;
}

function Base() {
  return <group>
    <SurfaceFloor position={[0,-.2,-8]} size={[126,104]} color="#14232e" repeat={40} finish="stone"/>
    <gridHelper args={[70,35,'#274b62','#142b3a']} position={[0,-.17,-8]} />
    <ArcStrip inner={8.7} outer={FACILITY_RADIUS+2.65} y={-.10} color="#263943" finish="stone"/>
    <ArcStrip inner={12.65} outer={14.35} y={-.025} color="#354b59" finish="stone"/>
    <ArcStrip inner={12.59} outer={12.67} y={.022} color="#748d9e"/>
    <ArcStrip inner={14.33} outer={14.42} y={.022} color="#748d9e"/>
    <ArcStrip inner={13.42} outer={13.49} y={.027} color="#4388ad" glow/>
    <MainAvenueDetails/>
    <ArcStrip inner={9.25} outer={12.35} y={.015} color="#142631"/>
    <Cylinder position={[0,-.12,ARC_CENTER_Z]} radius={7.5} height={.15} sides={64} color="#182b39"/>
    <PolishedPlaza/>
  </group>;
}

type DetailBox = { position: Vec3; size: Vec3; color: string; rotation?: Vec3 };

// Static city detail is batched to avoid adding hundreds of individual draw calls.
function DetailInstances({ items, glowing = false }: { items: DetailBox[]; glowing?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const object = new THREE.Object3D();
    items.forEach((item, i) => {
      object.position.set(...item.position);
      object.scale.set(...item.size);
      object.rotation.set(...(item.rotation ?? [0,0,0]));
      object.updateMatrix();
      mesh.setMatrixAt(i, object.matrix);
      mesh.setColorAt(i, new THREE.Color(item.color).multiplyScalar(glowing?1.6:1));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, glowing]);
  return <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
    <boxGeometry args={[1, 1, 1]} />
    {glowing ? <meshBasicMaterial color="#ffffff" toneMapped={false} /> : <meshStandardMaterial color="#ffffff" roughness={0.42} metalness={0.53} />}
  </instancedMesh>;
}

// Premium technical concourse: modular paving, seam details and low energy
// terminals, all batched; leave the radial connections and facility pads open.
function MainAvenueDetails(){
  const {structures,lights}=useMemo(()=>{
    const structures:DetailBox[]=[],lights:DetailBox[]=[];
    for(let i=0;i<64;i++){
      const a=-1.50+i*3/63,rotation:Vec3=[0,-a,0];
      if(zones.some(zone=>Math.abs(zone.angle-a)<.055))continue;
      for(const radius of [12.88,14.12]){
        structures.push({position:arcPoint(a,radius,.02),size:[.53,.045,.29],color:i%2?'#465e6f':'#3a515f',rotation});
        lights.push({position:arcPoint(a,radius,.051),size:[.32,.018,.026],color:i%5===0?'#9eafff':'#57bddd',rotation});
      }
      if(i%6===0 && !zones.some(zone=>Math.abs(zone.angle-a)<.16)){
        structures.push({position:arcPoint(a,13.05,.15),size:[.32,.28,.40],color:'#384f60',rotation});
        structures.push({position:arcPoint(a,13.05,.34),size:[.18,.20,.26],color:'#78909f',rotation});
        lights.push({position:arcPoint(a,13.05,.45),size:[.16,.028,.18],color:'#b4eeff',rotation});
      }
    }
    return {structures,lights};
  },[]);
  return <group><DetailInstances items={structures}/><DetailInstances items={lights} glowing/></group>;
}

// Three outer infrastructure rings surround the facility network.
function MetropolitanBackdrop() {
  const narrow=useThree(state=>state.size.width<900);
  const {structures,lights}=useMemo(()=>{
    const structures:DetailBox[]=[],lights:DetailBox[]=[];
    const put=(target:DetailBox[],position:Vec3,size:Vec3,color:string,rotation:Vec3=[0,0,0])=>target.push({position,size,color,rotation});
    const sectors=6, end=1.68, span=2*end/sectors;
    // The skyline remains an architectural backdrop, not a traffic simulation.
    for(let ring=0;ring<3;ring++){
      const r=[30.0,41.9,53.1][ring];
      for(let sector=0;sector<sectors;sector++){
        const bays=ring===0?2:3;
        for(let bay=0;bay<bays;bay++){
          const edge=2.5/r;
          const a=-end+sector*span+edge+(bay+.5)*(span-2*edge)/bays;
          const i=ring*18+sector*3+bay;
          const w=Math.min(3.6,(span-2*edge)*r/bays-.65),d=3.2+(i%3)*.75;
          const h=3.8+ring*3.1+((i*13)%9)*.58;
          const rotation:Vec3=[0,-a,0];
          const local=(x:number,y:number,z:number):Vec3=>{const p=arcPoint(a,r,y);return [p[0]+x*Math.cos(a)-z*Math.sin(a),y,p[2]+x*Math.sin(a)+z*Math.cos(a)];};
          const add=(x:number,y:number,z:number,size:Vec3,c:string)=>put(structures,local(x,y,z),size,c,rotation);
          const glow=(x:number,y:number,z:number,size:Vec3,c:string)=>put(lights,local(x,y,z),size,c,rotation);
          add(0,.015,0,[w+.5,.24,d+.5],'#293d49');
          add(0,h*.39,0,[w,h*.78,d],i%3===0?'#243b4c':'#24323f');
          add(0,h*.85,0,[w*.74,h*.20,d*.78],'#3b5260');
          add(0,h*.95,0,[w*.81,.12,d*.83],'#5d717c');
          add(0,h*.97+.14,0,[w*.42,.26,d*.42],'#354c58');
          for(const side of [-1,1]){
            add(side*w*.47,h*.39,d*.51,[.10,h*.77,.09],'#536c7b');
            glow(side*w*.42,h*.37,d*.518,[.035,h*.66,.022],i%5===0?'#c2a379':'#477c98');
          }
          for(let floor=0;floor<Math.floor(h*.73/.61);floor++){
            const y=.4+floor*.61;
            if(!narrow||floor%2===0)add(0,y,d*.505,[w*.86,.045,.05],'#526774');
            for(let win=0;win<(narrow?3:5);win++){
              if((i*7+floor*3+win*5)%11<3)continue;
              const x=(win-(narrow?1:2))*w*(narrow?.24:.16);
              const c=(i+floor+win)%7===0?'#e2c492':(i+win)%4===0?'#a3c4e8':'#72b9d5';
              glow(x,y+.23,d*.516,[w*.11,.20,.025],c);
              if(!narrow)glow(x,y+.23,-d*.516,[w*.11,.20,.025],c);
            }
            for(const side of [-1,1])if((floor+i)%3!==0)glow(side*w*.51,y+.23,0,[.025,.19,d*.54],'#6994b1');
          }
          if(i%3===0){add(0,h+.43,0,[.08,.96,.08],'#718a99');glow(0,h+.93,0,[.13,.10,.13],'#c3e5f1');}
        }
      }
    }
    // Sparse perimeter relays with vertical illuminated conductors.
    for(const radius of [26.1,37.8,48.8])for(let i=0;i<(narrow?8:14);i++){
      const a=-1.50+i*3/((narrow?8:14)-1),rotation:Vec3=[0,-a,0];
      put(structures,arcPoint(a,radius,.12),[.56,.35,.56],'#344b58',rotation);
      put(structures,arcPoint(a,radius,.85),[.20,1.50,.24],'#4a6678',rotation);
      put(lights,arcPoint(a,radius-.14,.86),[.07,1.25,.06],'#63d4ff',rotation);
      put(lights,arcPoint(a,radius,1.61),[.26,.13,.26],i%4===0?'#b4a1ff':'#94ebff',rotation);
    }
    return {structures,lights};
  },[narrow]);
  return <group>
    {[24,35.7,46.7].map(radius=><ArcStrip key={radius} inner={radius-1.1} outer={radius+1.1} y={-.12} color="#1a303d" end={1.68}/>)}
    <DetailInstances key={`district-${structures.length}`} items={structures}/><DetailInstances key={`windows-${lights.length}`} items={lights} glowing/>
  </group>;
}

const UPPER_RADIUS = 20.3;
const UPPER_Y = 6.4;
function ArcWall({ radius, bottom, top, color, end = 1.65 }: { radius:number; bottom:number; top:number; color:string; end?:number }) {
  const geometry=useMemo(()=>{
    const vertices:number[]=[], indices:number[]=[];
    for(let i=0;i<=96;i++){
      const a=-end+i/96*end*2;
      vertices.push(...arcPoint(a,radius,bottom),...arcPoint(a,radius,top));
      if(i<96){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
  },[radius,bottom,top,end]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} metalness={.55} roughness={.38} side={THREE.DoubleSide}/></mesh>;
}
function ElevatedDistrict() {
  const { structures, lights } = useMemo(()=>{
    const structures:DetailBox[]=[], lights:DetailBox[]=[];
    const add=(position:Vec3,size:Vec3,color:string,rotation:Vec3=[0,0,0])=>structures.push({position,size,color,rotation});
    const glow=(position:Vec3,size:Vec3,color:string,rotation:Vec3=[0,0,0])=>lights.push({position,size,color,rotation});
    for(let i=0;i<12;i++){
      const a=-1.57+i/11*3.14;
      const rot:Vec3=[0,-a,0];
      add(arcPoint(a,UPPER_RADIUS,3.08),[.32,6.3,.49],'#526878',rot);
      add(arcPoint(a,UPPER_RADIUS,6.02),[.86,.32,1.68],'#8495a0',rot);
      add(arcPoint(a,UPPER_RADIUS,.19),[.85,.5,.92],'#3b5261',rot);
      glow(arcPoint(a,UPPER_RADIUS-.27,3.45),[.065,4.6,.04],'#457d92',rot);
      add(arcPoint(a,UPPER_RADIUS,5.9),[.3,.21,2.1],'#5d7888',rot);
    }
    // Electrical risers take the power feed above the facility row.
    for(let i=0;i<5;i++){
      const a=zones[i].angle+.16;
      const rot:Vec3=[0,-a,0];
      add(arcPoint(a,18.85,1.86),[.66,3.85,.78],'#39566a',rot);
      add(arcPoint(a,18.85,3.84),[.92,.19,1.04],'#8495a0',rot);
      glow(arcPoint(a,18.40,1.90),[.16,2.9,.035],'#6599ae',rot);
    }
    return {structures,lights};
  },[]);
  return <group>
    <ArcStrip inner={UPPER_RADIUS-.44} outer={UPPER_RADIUS+.44} y={UPPER_Y-.08} color="#203948" end={1.72}/>
    <ArcWall radius={UPPER_RADIUS+.44} bottom={UPPER_Y-.31} top={UPPER_Y-.08} color="#42677c" end={1.72}/>
    <ArcStrip inner={18.62} outer={19.03} y={3.78} color="#233b49" end={1.52}/>
    <DetailInstances items={structures}/><DetailInstances items={lights} glowing/>
  </group>;
}

function FacilityDetails({ zone }: { zone: Zone }) {
  const face = 1;
  return <group>
    {/* Service trenches, access steps, perimeter luminaires and cable conduits. */}
    {[-1, 1].map(side => <group key={side} position={[side * 1.94, 0, 0]}>
      <Block position={[0, 0.39, 0]} size={[0.12, 0.13, 2.9]} color="#0d1823" />
      {Array.from({ length: 7 }, (_, i) => <Block key={i} position={[0, 0.47, -1.2 + i * 0.4]} size={[0.17, 0.045, 0.16]} color={i % 3 === 0 ? zone.color : '#647689'} light={i % 3 === 0} />)}
      <Block position={[0, 0.60, -face * 1.4]} size={[0.32, 0.52, 0.36]} color={steel} />
      <Block position={[0, 0.88, -face * 1.4]} size={[0.21, 0.04, 0.25]} color={zone.color} light />
    </group>)}
    {[0, 1, 2].map(i => <Block key={i} position={[0, 0.07 + i * 0.085, face * (1.99 - i * 0.12)]} size={[1.14, 0.13 + i * 0.08, 0.28]} color={i === 2 ? steel : dark} />)}
    <Block position={[1.46, 0.48, face * 1.37]} size={[0.42, 0.32, 0.34]} color={steel} />
    <Block position={[1.46, 0.55, face * 1.55]} size={[0.24, 0.075, 0.025]} color={zone.color} light />
    {zone.id === 'ai' && <group>
      {[0.55, 1.75, 2.72].map(y => <mesh key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.65, 0.045, 8, 48]} /><meshStandardMaterial color="#89a8bc" metalness={0.4} roughness={0.4} /></mesh>)}
      {Array.from({ length: 6 }, (_, i) => <group key={i} rotation={[0, i * Math.PI / 3, 0]}><Block position={[0, 1.05, 1.51]} size={[0.25, 0.32, 0.24]} color="#687b89" /><Block position={[0, 2.68, 1.51]} size={[0.26, 0.26, 0.24]} color="#526b7e" /></group>)}
    </group>}
    {zone.id === 'data' && <group>
      {[-1.2,0,1.2].map(x=><group key={x} position={[x,0,0]}>{[-.65,.65].map(z=><group key={z} position={[0,2.44,z]}>{Array.from({length:5},(_,i)=><Block key={i} position={[0,.04,-.24+i*.12]} size={[.48,.04,.045]} color="#64788a" />)}</group>)}</group>)}
      <Rail from={[-1.8,2.65,-1.25]} to={[1.8,2.65,-1.25]} width={.11} color="#7792a5" />
    </group>}
    <PremiumFacade zone={zone} />
  </group>;
}

// Fine structural joints and frames are instanced in local facility coordinates.
function PremiumFacade({ zone }: { zone: Zone }) {
  const {structures,lights}=useMemo(()=>{
    const structures:DetailBox[]=[],lights:DetailBox[]=[];
    const add=(position:Vec3,size:Vec3,color:string)=>structures.push({position,size,color});
    const glow=(position:Vec3,size:Vec3,color=zone.color)=>lights.push({position,size,color});
    // Recessed foundation tiers, brushed-metal edging and paired service panels.
    for(const side of [-1,1]){
      add([side*2.04,.38,0],[.065,.10,3.28],'#8b9da8');
      glow([side*2.09,.43,0],[.028,.027,2.92]);
      for(let i=0;i<9;i++)add([side*1.98,.38,-1.35+i*.335],[.15,.025,.025],'#111d28');
      for(let i=0;i<5;i++)add([side*1.65,.42,-1.25+i*.23],[.32,.045,.035],'#7d929e');
    }
    for(let i=0;i<12;i++){
      add([-1.68+i*.30,.345,-1.61],[.04,.04,.23],'#637989');
      if(i%3===0)glow([-1.68+i*.30,.39,-1.61],[.12,.028,.06]);
    }
    if(zone.id==='software'){
      for(const x of [-1.08,1.08]){
        for(let floor=0;floor<2;floor++)for(let bay=0;bay<4;bay++){
          const bx=x-.55+bay*.36,y=1.07+floor*.71;
          add([bx,y,1.323],[.25,.32,.028],'#23485b');
          if((bay+floor)%3!==0)glow([bx,y-.13,1.343],[.20,.055,.022],floor===1?'#a9dfe4':'#d5c8a9');
          add([bx,y+.18,1.35],[.29,.035,.045],'#a6b4bc');
        }
        for(let i=0;i<9;i++)add([x-.58+i*.145,2.52,1.20],[.055,.16,.12],'#8c9faa');
      }
    }else if(zone.id==='ai'){
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;
        const x=Math.sin(a)*1.65,z=Math.cos(a)*1.65;
        structures.push({position:[x,1.91,z],size:[.09,2.36,.13],color:'#8da1ac',rotation:[0,a,0]});
        structures.push({position:[x,.59,z],size:[.20,.18,.22],color:'#526e80',rotation:[0,a,0]});
        if(i%2===0)lights.push({position:[x*1.015,2.27,z*1.015],size:[.065,.45,.065],color:zone.color,rotation:[0,a,0]});
      }
    }else if(zone.id==='command'){
      for(let i=0;i<8;i++){
        const x=-.94+i*.27;
        add([x,2.25,.80],[.035,.94,.07],'#748c9c');
        add([x,1.05,.655],[.055,.54,.04],'#536d80');
        if(i%2===0)glow([x,2.54,.85],[.11,.045,.035]);
      }
      for(const y of [1.68,2.68])add([0,y,.81],[2.2,.075,.085],'#8a9ba4');
      for(let i=0;i<7;i++){const x=-.78+i*.26;glow([x,2.16,.855],[.16,.14,.028],i%3===0?'#e7cda1':'#8caec3');add([x,2.4,.87],[.045,.26,.07],'#8299a8');}
      for(const side of [-1,1])for(let i=0;i<5;i++)add([side*1.31,2.24,-.91+i*.32],[.06,.82,.07],'#9bafba');
    }else if(zone.id==='research'){
      for(const side of [-1,1])for(let i=0;i<8;i++){
        add([side*1.33,.82+i*.078,1.24],[.64,.025,.025],'#172a3b');
        if(i%3===0)glow([side*1.73,.84+i*.078,1.27],[.08,.045,.025],i%2?'#a9bfff':'#d4d6f7');
      }
    }else if(zone.id==='data'){
      for(const x of [-1.2,0,1.2])for(let row=0;row<7;row++)for(let i=0;i<4;i++)add([x-.26+i*.17,.56+row*.23,-1.31],[.085,.065,.04],'#637988');
      for(const x of [-1.76,1.76]){add([x,1.34,0],[.07,1.83,2.48],'#324b5c');for(let i=0;i<11;i++)add([x+(x>0?.045:-.045),1.36,-1.05+i*.21],[.035,1.58,.045],'#6e8491');}
    }
    return {structures,lights};
  },[zone]);
  return <group><DetailInstances items={structures}/><DetailInstances items={lights} glowing/></group>;
}

// Keyboard navigation is scoped to the focused canvas; page shortcuts and text inputs stay native.
const navigationKeys = new Set(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright']);
// The canvas element is imperative DOM state, so its listeners and a11y attributes
// are attached by a plain helper that receives the element instead of writing to
// the hook-returned renderer inside the component body.
function attachCampusKeys(canvas: HTMLCanvasElement, keys: Set<string>) {
  const originalTabIndex=canvas.getAttribute('tabindex');
  const originalLabel=canvas.getAttribute('aria-label');
  canvas.tabIndex=0;
  canvas.setAttribute('aria-label','3D scene. Use W A S D or arrow keys to move.');
  const focus=()=>canvas.focus({preventScroll:true});
  const down=(event:KeyboardEvent)=>{
    const key=event.key.toLowerCase();
    if(!navigationKeys.has(key)||event.altKey||event.ctrlKey||event.metaKey)return;
    event.preventDefault(); keys.add(key);
  };
  const up=(event:KeyboardEvent)=>{keys.delete(event.key.toLowerCase());};
  const clear=()=>keys.clear();
  canvas.addEventListener('pointerdown',focus);
  canvas.addEventListener('keydown',down);
  window.addEventListener('keyup',up);
  canvas.addEventListener('blur',clear);
  window.addEventListener('blur',clear);
  return ()=>{
    canvas.removeEventListener('pointerdown',focus); canvas.removeEventListener('keydown',down);
    window.removeEventListener('keyup',up);canvas.removeEventListener('blur',clear);window.removeEventListener('blur',clear);
    clear();
    if(originalTabIndex===null)canvas.removeAttribute('tabindex');else canvas.setAttribute('tabindex',originalTabIndex);
    if(originalLabel===null)canvas.removeAttribute('aria-label');else canvas.setAttribute('aria-label',originalLabel);
  };
}
function useCampusKeys() {
  const { gl } = useThree();
  const keys=useRef(new Set<string>());
  useEffect(()=>attachCampusKeys(gl.domElement, keys.current),[gl]);
  return keys;
}
function useKeyboardPan() {
  const keys=useCampusKeys();
  const {camera}=useThree();
  // Reused scratch vectors live in a ref so the pan loop keeps one allocation per instance.
  const scratch=useRef<{ forward: THREE.Vector3; right: THREE.Vector3; delta: THREE.Vector3 } | null>(null);
  if (scratch.current === null) scratch.current = { forward:new THREE.Vector3(), right:new THREE.Vector3(), delta:new THREE.Vector3() };
  return (target:THREE.Vector3,dt:number,speed:number)=>{
    const pressed=keys.current;
    const x=Number(pressed.has('d')||pressed.has('arrowright'))-Number(pressed.has('a')||pressed.has('arrowleft'));
    const z=Number(pressed.has('w')||pressed.has('arrowup'))-Number(pressed.has('s')||pressed.has('arrowdown'));
    if(!x&&!z)return false;
    if (!scratch.current) return false;
    const {forward,right,delta}=scratch.current;
    camera.getWorldDirection(forward);forward.y=0;forward.normalize();
    right.set(-forward.z,0,forward.x);
    delta.copy(forward).multiplyScalar(z).addScaledVector(right,x).normalize().multiplyScalar(speed*Math.min(dt,.05));
    target.add(delta);camera.position.add(delta);return true;
  };
}
function clampCameraTarget(camera:THREE.Camera,target:THREE.Vector3,xMin:number,xMax:number,zMin:number,zMax:number,yMin:number,yMax:number) {
  const x=THREE.MathUtils.clamp(target.x,xMin,xMax),y=THREE.MathUtils.clamp(target.y,yMin,yMax),z=THREE.MathUtils.clamp(target.z,zMin,zMax);
  if(x===target.x&&y===target.y&&z===target.z)return false;
  camera.position.x+=x-target.x;camera.position.y+=y-target.y;camera.position.z+=z-target.z;
  target.set(x,y,z);return true;
}

function CampusCamera({ selected, motion, reset, intro, onIntroEnd }: { selected: ZoneId | null; motion: boolean; reset: number; intro:boolean; onIntroEnd:()=>void }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size } = useThree();
  const keyboardPan=useKeyboardPan();
  const desiredTarget = useMemo(() => {
    const zone = zones.find(z => z.id === selected);
    if (!zone) return new THREE.Vector3(0, 2.5, -5.6);
    const shift = size.width > 900 ? 2.1 : 0;
    return new THREE.Vector3(zone.position[0]+Math.cos(zone.angle)*shift, 1.85, zone.position[2]+Math.sin(zone.angle)*shift);
  }, [selected, size.width]);
  const desiredPosition = useMemo(() => {
    if (selected) {
      const aspect = size.width / Math.max(size.height, 1);
      const zone = zones.find(z=>z.id===selected);
      const a=zone?.angle ?? 0;
      return desiredTarget.clone().add(new THREE.Vector3(-Math.sin(a)*11.2,5.7,Math.cos(a)*11.2).multiplyScalar(Math.max(1, .9 / aspect)));
    }
    const aspect = size.width / Math.max(size.height, 1);
    const scale = Math.max(1, 1.32 / aspect);
    return desiredTarget.clone().add(new THREE.Vector3(0, 24.5, 31.5).multiplyScalar(scale));
  }, [selected, desiredTarget, size.width, size.height]);
  const moving = useRef(true);
  const introTime=useRef(0);
  useEffect(() => { moving.current = true; introTime.current=0; }, [desiredTarget, desiredPosition, reset, intro]);
  useFrame((_, dt) => {
    if (!controls.current) return;
    if(intro && motion && !selected){
      introTime.current+=Math.min(dt,.1);
      const t=Math.min(1,introTime.current/8);
      const eased=t*t*(3-2*t);
      const angle=-.66*(1-eased);
      const scale=Math.max(1,1.32/(size.width/Math.max(1,size.height)));
      const radius=THREE.MathUtils.lerp(25,31.5,eased)*scale;
      camera.position.set(Math.sin(angle)*radius,2.5+THREE.MathUtils.lerp(7.5,24.5,eased)*scale,-5.6+Math.cos(angle)*radius);
      controls.current.target.copy(desiredTarget);
      controls.current.update();
      if(t>=1)onIntroEnd();
      return;
    }
    const keyMoved=keyboardPan(controls.current.target,dt,selected?3.2:7.5);
    if(keyMoved)moving.current=false;
    if (!moving.current) {
      const clamped=clampCameraTarget(camera,controls.current.target,-19,19,-19,8,0,6);
      if(keyMoved||clamped)controls.current.update();
      return;
    }
    const step = motion ? 1 - Math.exp(-Math.min(dt, 0.1) * 4) : 1;
    camera.position.lerp(desiredPosition, step);
    controls.current.target.lerp(desiredTarget, step);
    controls.current.update();
    if (camera.position.distanceTo(desiredPosition) < 0.04 && controls.current.target.distanceTo(desiredTarget) < 0.04) moving.current = false;
  });
  return <OrbitControls ref={controls} enabled={!intro} enableDamping={motion} dampingFactor={0.09} enablePan enableZoom minDistance={5} maxDistance={Math.max(75, 85 * size.height / Math.max(size.width, 1))} maxPolarAngle={Math.PI / 2 - 0.12} minPolarAngle={0.16} onStart={() => { moving.current = false; }} />;
}

function FacilityHotspots({ zone, topic, onTopic }: { zone:Zone; topic:number; onTopic:(index:number)=>void }) {
  return <group>
    {topics[zone.id].map((item,i)=><group key={item.name}>
      <mesh position={item.anchor}><sphereGeometry args={[.065,12,8]}/><meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={i===topic?3:1.3} toneMapped={false}/></mesh>
      <Rail from={item.anchor} to={item.marker} color={zone.color} width={i===topic?.023:.012} light={i===topic}/>
      <Html position={item.marker} center zIndexRange={[8,3]} style={{pointerEvents:'auto'}}>
        <button type="button" className={`campus-hotspot ${i===topic?'is-active':''}`} style={{'--zone-color':zone.color} as CSSProperties} aria-pressed={i===topic} aria-label={`Explore ${zone.name}: ${item.name}`} onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();onTopic(i);}}><span>{String(i+1).padStart(2,'0')}</span><strong>{item.name}</strong></button>
      </Html>
    </group>)}
  </group>;
}

function CampusScene({ selected, topic, onSelect, onTopic, motion, reset, intro, onIntroEnd }: { selected: ZoneId | null; topic:number; onSelect: (id: ZoneId) => void; onTopic:(index:number)=>void; motion: boolean; reset: number; intro:boolean; onIntroEnd:()=>void }) {
  const { gl } = useThree();
  useEffect(() => () => { gl.domElement.style.cursor = ''; }, [gl]);
  return <>
    <color attach="background" args={['#080f18']} />
    <fog attach="fog" args={['#142634', 34, 96]} />
    <ArchitecturalSky />
    <CityLighting />
    <Base />
    <MetropolitanBackdrop />
    <ElevatedDistrict />
    <CampusEnergy motion={motion} focused={selected!==null}/>
    {zones.map(zone => <FacilityEnergyLink key={zone.id} angle={zone.angle} color={zone.color} motion={motion}/>)}
    {zones.map(zone => <group key={zone.id} position={zone.position} rotation={[0,-zone.angle,0]} onPointerOver={event => { event.stopPropagation(); gl.domElement.style.cursor = 'pointer'; }} onPointerOut={() => { gl.domElement.style.cursor = ''; }} onClick={event => { event.stopPropagation(); if (!intro && event.delta < 5 && selected!==zone.id) onSelect(zone.id); }}>
      {!selected && !intro && <Html position={[0,labelHeights[zone.id],.85]} center zIndexRange={[5,1]} style={{pointerEvents:'auto'}}><button type="button" aria-label={`Explore ${zone.name}`} title={zone.name} className="campus-map-label" onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();onSelect(zone.id);}}><span>{zone.label}</span><strong>{facilityNames[zone.id]}</strong></button></Html>}
      <ContactFootprint position={[0,-.065,0]} size={[5.65,4.75]}/>
      <Pad color={zone.color} active={selected === zone.id} wide={zone.id === 'ai'} />
      {zone.id === 'ai' && <group scale={[1.08,1.12,1.08]}><Core color={zone.color} motion={motion} /></group>}
      {zone.id === 'software' && <Software color={zone.color} />}
      {zone.id === 'data' && <DataCenter color={zone.color} />}
      {zone.id === 'command' && <Command color={zone.color} motion={motion} />}
      {zone.id === 'research' && <Research color={zone.color} motion={motion} />}
      <FacilityDetails zone={zone} />
      {zone.id==='ai'?<group scale={[1.08,1.12,1.08]}><FacilityArchitecture id={zone.id} color={zone.color}/></group>:<FacilityArchitecture id={zone.id} color={zone.color}/>}
      {selected===zone.id && <FacilityHotspots zone={zone} topic={topic} onTopic={onTopic}/>}
    </group>)}
    <CampusCamera selected={selected} motion={motion} reset={reset} intro={intro} onIntroEnd={onIntroEnd}/>
    <DataRain motion={motion} focused={selected!==null} />
    <EffectComposer multisampling={0}><Bloom mipmapBlur intensity={0.65} luminanceThreshold={1.15} luminanceSmoothing={0.32} /></EffectComposer>
  </>;
}

// The pointer cursor is set on the canvas element, so it is routed through a plain
// helper that receives the renderer instead of writing to the hook-returned value.
function setCanvasCursor(renderer: THREE.WebGLRenderer, cursor: string) {
  renderer.domElement.style.cursor=cursor;
}

// Architectural cutaway: the exterior scene is unmounted while a room is open.
// Each exhibit maps to the same three topics used by the exterior callouts.
function InteriorExhibit({ zone, index, active, motion, onSelect }: { zone: Zone; index: number; active: boolean; motion: boolean; onSelect: () => void }) {
  const spinner=useRef<THREE.Group>(null);
  const {gl}=useThree();
  useFrame((_,dt)=>{if(motion&&spinner.current)spinner.current.rotation.y+=Math.min(dt,.05)*.42;});
  const color=zone.color;
  const x=(index-1)*3.0;
  const type=zone.id==='ai'?['rack','core','console'][index]:zone.id==='software'?['console','table','rack'][index]:zone.id==='data'?['rack','rack','table'][index]:zone.id==='command'?['console','table','console'][index]:['core','table','core'][index];
  return <group position={[x,0,-.5]} onPointerOver={e=>{e.stopPropagation();setCanvasCursor(gl,'pointer');}} onPointerOut={()=>{setCanvasCursor(gl,'');}} onClick={e=>{e.stopPropagation();if(e.delta<5)onSelect();}}>
    <ContactFootprint position={[0,.053,0]} size={[2.92,3.04]} opacity={.58}/>
    <Block position={[0,.13,0]} size={[2.42,.24,2.65]} color="#405665" finish="stone"/>
    <Block position={[0,.28,0]} size={[2.30,.07,2.53]} color="#172b39"/>
    {[-1,1].map(side=><Block key={side} position={[side*1.13,.325,0]} size={[.035,.032,2.4]} color={active?color:'#36586b'} light={active}/>)}
    <Block position={[0,.325,1.22]} size={[2.25,.032,.035]} color={active?color:'#36586b'} light={active}/>
    {type==='rack'&&<group>
      {[-.54,.54].map(rx=><group key={rx} position={[rx,.34,-.15]}>
        <Block position={[0,1.0,0]} size={[.87,2,1.28]} color="#253947"/>
        {[-1,1].map(side=><Block key={side} position={[side*.45,1.0,.65]} size={[.07,2,.095]} color="#a0b2bd"/>)}
        {Array.from({length:10},(_,i)=><group key={i}>
          <Block position={[0,.19+i*.17,.655]} size={[.73,.13,.06]} color="#14232f"/>
          {Array.from({length:5},(_,j)=><Block key={j} position={[-.29+j*.12,.19+i*.17,.695]} size={[.065,.042,.027]} color={(i+j)%4===0?'#ddc397':color} light={(i+j)%3!==1}/>)}
        </group>)}
        <Block position={[0,2.035,0]} size={[.82,.07,1.17]} color="#8299a6"/>
      </group>)}
    </group>}
    {type==='core'&&<group position={[0,.32,0]}>
      <Cylinder position={[0,.16,0]} radius={.92} height={.3} sides={12} color="#8194a0"/>
      <Cylinder position={[0,.38,0]} radius={.70} height={.11} sides={32} color={color} light/>
      {Array.from({length:4},(_,i)=>{const a=i*Math.PI/2+Math.PI/4;return <group key={i} rotation={[0,a,0]}><Block position={[0,1.05,.78]} size={[.12,1.45,.13]} color="#8299a8"/><Block position={[0,1.05,.70]} size={[.04,1.32,.03]} color={color} light/></group>;})}
      <Cylinder position={[0,1.82,0]} radius={.86} height={.13} sides={12} color="#8499a5"/>
      <group ref={spinner} position={[0,1.08,0]}>
        <mesh><icosahedronGeometry args={[.40,1]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.9} roughness={.16} metalness={.35}/></mesh>
        {[-.48,.48].map(tilt=><mesh key={tilt} rotation={[Math.PI/2,tilt,0]}><torusGeometry args={[.60,.025,8,48]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>)}
      </group>
    </group>}
    {(type==='console'||type==='table')&&<group>
      {[-.69,.69].map(side=><Block key={side} position={[side,.74,-.1]} size={[.12,.84,.93]} color="#7b929f"/>)}
      <RoundedBox position={[0,1.18,-.1]} args={[1.94,.15,1.18]} radius={.055} smoothness={2}><meshStandardMaterial color="#697e8d" metalness={.75} roughness={.26}/></RoundedBox>
      <Block position={[0,1.28,-.1]} size={[1.84,.035,1.08]} color="#142c3e"/>
      <Block position={[0,1.30,.45]} size={[1.76,.025,.035]} color={color} light/>
      {type==='console'?[-.54,0,.54].map((sx,i)=><group key={sx} position={[sx,1.56,-.45]}>
        <Block position={[0,-.18,0]} size={[.05,.35,.08]} color="#7e939c"/>
        <Block position={[0,.10,0]} size={[.51,.36,.065]} color="#65808f"/>
        <Block position={[0,.10,.039]} size={[.45,.30,.026]} color="#15384d"/>
        {Array.from({length:5},(_,row)=><Block key={row} position={[-.05,.20-row*.045,.058]} size={[.16+((row+i)%3)*.06,.013,.008]} color={row===0?'#dfc49a':color} light/>)}
      </group>):<group>
        <Cylinder position={[0,1.34,-.1]} radius={.60} height={.065} sides={32} color={color} light/>
        <group ref={spinner} position={[0,1.65,-.1]}>
          <mesh><octahedronGeometry args={[.29]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} roughness={.2}/></mesh>
          {[-1,1].map(s=><mesh key={s} position={[s*.42,0,0]}><boxGeometry args={[.18,.18,.18]}/><meshBasicMaterial color={color} wireframe toneMapped={false}/></mesh>)}
        </group>
      </group>}
      {[-.48,.48].map(s=><group key={s} position={[s,0,.87]}><Cylinder position={[0,.49,0]} radius={.055} height={.39} sides={12} color="#7b929e"/><Block position={[0,.72,0]} size={[.42,.10,.42]} color="#253e50"/><Block position={[0,.92,.20]} size={[.42,.37,.08]} color="#375365"/></group>)}
    </group>}
    <Html position={[0,2.85,.2]} center zIndexRange={[8,3]} style={{pointerEvents:'auto'}}>
      <button type="button" className={`campus-hotspot ${active?'is-active':''}`} style={{'--zone-color':color} as CSSProperties} aria-pressed={active} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect();}}><span>{String(index+1).padStart(2,'0')}</span><strong>{topics[zone.id][index].name}</strong></button>
    </Html>
  </group>;
}

function InteriorArchitecture({zone}:{zone:Zone}){
  const c=zone.color;
  return <group raycast={()=>null}>
    {/* Overhead rails and recessed diffusers give the cutaway a real architectural section. */}
    {[-3.5,0,3.5].map(x=><group key={x}>
      <Block position={[x,3.57,-1.25]} size={[.18,.20,2.68]} color="#8b9aa3"/>
      <Block position={[x,3.45,-1.25]} size={[.065,.035,2.24]} color="#d1e7f3" light/>
    </group>)}
    {[-1,1].map(side=><group key={side}>
      <Block position={[side*5.18,.19,-1.5]} size={[.10,.32,3.3]} color="#536977" finish="ceramic"/>
      <Glazing position={[side*5.16,1.9,.62]} size={[.055,1.36,1.24]} color="#304b5e"/>
      <Block position={[side*5.12,2.62,.62]} size={[.12,.07,1.34]} color="#a1b0b9"/>
    </group>)}
    {zone.id==='data'&&[-4.1,-2.05,0,2.05,4.1].map(x=><group key={x}>
      <Block position={[x,3.04,-2.95]} size={[1.55,.31,.24]} color="#72838e"/>
      {Array.from({length:8},(_,i)=><Block key={i} position={[x-.59+i*.17,3.04,-2.81]} size={[.10,.20,.025]} color="#17242e"/>)}
    </group>)}
    {zone.id==='software'&&[-3.5,0,3.5].map(x=><group key={x}>
      <Glazing position={[x,2.14,-2.96]} size={[2.36,1.15,.055]} color="#34586a"/>
      <Block position={[x,1.55,-2.90]} size={[2.43,.065,.11]} color="#98abb5"/>
      {Array.from({length:5},(_,i)=><Block key={i} position={[x-.85,1.76+i*.15,-2.91]} size={[.36+(i%3)*.23,.025,.025]} color={i%2?'#9cc8d4':c} light={i%2===0}/>)}
    </group>)}
    {zone.id==='command'&&[-2.7,0,2.7].map(x=><group key={x}>
      <Glazing position={[x,2.10,-2.95]} size={[2.45,1.38,.055]} color="#203b4d"/>
      {Array.from({length:8},(_,i)=><Block key={i} position={[x-.95+i*.27,1.72+(i%4)*.12,-2.90]} size={[.10,.25+(i%4)*.13,.025]} color={c} light/>)}
      <Block position={[x,2.83,-2.90]} size={[2.45,.045,.055]} color="#a3b1b7"/>
    </group>)}
    {zone.id==='research'&&[-3.5,0,3.5].map(x=><group key={x}>
      <Block position={[x,2.05,-2.97]} size={[1.55,1.38,.14]} color="#2d4256" finish="ceramic"/>
      <mesh position={[x,2.07,-2.86]}><torusGeometry args={[.48,.025,8,48]}/><meshBasicMaterial color={c} toneMapped={false}/></mesh>
      <mesh position={[x,2.07,-2.84]}><octahedronGeometry args={[.26]}/><ArchitecturalFinish color="#aab5de" finish="glass"/></mesh>
    </group>)}
    {zone.id==='ai'&&[-3.5,0,3.5].map(x=><group key={x}>
      <Block position={[x,2.0,-2.96]} size={[1.52,1.62,.14]} color="#283e4b" finish="ceramic"/>
      {[-.49,0,.49].map(offset=><group key={offset}>
        <Block position={[x+offset,2,-2.85]} size={[.27,1.31,.07]} color="#738b9c"/>
        <Block position={[x+offset,2,-2.80]} size={[.065,1.08,.035]} color={c} light/>
      </group>)}
    </group>)}
  </group>;
}

function FacilityInterior({zone,topic,onTopic,motion}:{zone:Zone;topic:number;onTopic:(i:number)=>void;motion:boolean}){
  const controls=useRef<ComponentRef<typeof OrbitControls>>(null);
  const {camera,size,gl}=useThree();
  const keyboardPan=useKeyboardPan();
  useFrame((_,dt)=>{
    if(!controls.current)return;
    if(keyboardPan(controls.current.target,dt,2.6)){
      clampCameraTarget(camera,controls.current.target,-3.5,3.5,-1.8,1.8,1.2,1.2);
      controls.current.update();
    }
  });
  useEffect(()=>()=>{gl.domElement.style.cursor='';},[gl]);
  useLayoutEffect(()=>{
    const aspect=size.width/Math.max(1,size.height);
    const scale=Math.max(1,1.1/aspect);
    const target=new THREE.Vector3(size.width>900?1.9:0,1.2,-.2);
    camera.position.copy(target).add(new THREE.Vector3(3.1,4.2,10.7).multiplyScalar(scale));
    controls.current?.target.copy(target);controls.current?.update();
  },[camera,size.width,size.height]);
  return <>
    <color attach="background" args={['#07111c']}/>
    <hemisphereLight args={['#d2e7ff','#465766',.72]}/>
    <directionalLight position={[3,7,6]} intensity={2.7} color="#dceeff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-far={25} shadow-normalBias={.025} shadow-bias={-.0002}/>
    <pointLight position={[0,3.2,-2]} color={zone.color} intensity={10} distance={13}/>
    {[-3.5,3.5].map(x=><pointLight key={x} position={[x,3.1,1.3]} color="#e1ebf2" intensity={8} distance={7} decay={2}/>)}
    <directionalLight position={[-4,3,-5]} color="#e6c8a3" intensity={.45}/>
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3} position={[0,6,3]} rotation={[Math.PI/2,0,0]} scale={[11,4,1]}/>
      <Lightformer form="rect" intensity={2} color="#8db9d9" position={[-6,2,1]} rotation={[0,Math.PI/2,0]} scale={[5,3,1]}/>
    </Environment>
    <Block position={[0,-.25,0]} size={[11,.5,6.9]} color="#41596b"/>
    <SurfaceFloor position={[0,.04,0]} size={[10.65,6.55]} color={zone.id==='command'?'#34434a':zone.id==='research'?'#364050':'#283b47'} repeat={7}/>
    {Array.from({length:11},(_,i)=><Block key={i} position={[-5+i, .045,0]} size={[.016,.012,6.30]} color="#4c6676"/>)}
    {Array.from({length:7},(_,i)=><Block key={i} position={[0,.045,-3+i]} size={[10.3,.012,.016]} color="#4c6676"/>)}
    <Block position={[0,1.75,-3.24]} size={[10.65,3.45,.20]} color="#253b4c"/>
    {Array.from({length:10},(_,i)=><group key={i} position={[-4.75+i*1.055,0,-3.10]}>
      <Block position={[0,1.72,0]} size={[.92,2.9,.10]} color={i%3===0?'#334e62':'#132a3c'}/>
      <Block position={[0,1.45,.07]} size={[.82,.055,.035]} color="#708c9e"/>
      <Block position={[0,2.95,.10]} size={[.83,.055,.035]} color={zone.color} light/>
      <Block position={[-.47,1.75,.11]} size={[.075,3.22,.10]} color="#78909d"/>
    </group>)}
    <Block position={[0,3.50,-3.14]} size={[10.85,.18,.45]} color="#9baeb8"/>
    <Block position={[0,3.40,-2.9]} size={[10.30,.035,.05]} color={zone.color} light/>
    {[-1,1].map(side=><group key={side}>
      <Block position={[side*5.35,1.3,-1.6]} size={[.20,2.6,3.5]} color="#344b5c"/>
      {[-2.7,-.7].map(z=><group key={z}><Block position={[side*5.22,1.55,z]} size={[.15,3.1,.19]} color="#99acb7"/><Block position={[side*5.12,1.55,z]} size={[.035,2.75,.06]} color={zone.color} light/></group>)}
      <Block position={[side*5.05,.07,0]} size={[.055,.035,6.05]} color={zone.color} light/>
    </group>)}
    <Block position={[0,.07,2.93]} size={[10.25,.035,.055]} color={zone.color} light/>
    <InteriorArchitecture zone={zone}/>
    <FacilityArchitecture id={zone.id} color={zone.color} interior/>
    {[0,1,2].map(i=><InteriorExhibit key={i} zone={zone} index={i} active={topic===i} motion={motion} onSelect={()=>onTopic(i)}/>)}
    <WorkflowSignal station={topic} color={zone.color} motion={motion}/>
    <OrbitControls ref={controls} enableDamping={motion} enablePan={false} minDistance={5} maxDistance={30} maxPolarAngle={Math.PI/2-.12} minPolarAngle={.28}/>
    <EffectComposer multisampling={0}><Bloom mipmapBlur intensity={.58} luminanceThreshold={1.10} luminanceSmoothing={.25}/></EffectComposer>
  </>;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    console.error('[EngineeringCampus] 3D scene failed:', error);
    this.props.onError();
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function SceneReady({onReady}:{onReady:()=>void}) {
  const frames=useRef(0);
  useFrame(()=>{if(frames.current<2&&++frames.current===2)onReady();});
  return null;
}
export default function EngineeringCampus() {
  const [ready,setReady]=useState(false);
  const [show3D,setShow3D]=useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [slowStart,setSlowStart]=useState(false);
  const [sceneFailed,setSceneFailed]=useState(false);
  const onReady=useCallback(()=>setReady(true),[]);
  const [selected, setSelected] = useState<ZoneId | null>(null);
  const [topic,setTopic]=useState(1);
  const [interior, setInterior] = useState(false);
  const [reset, setReset] = useState(0);
  const [intro,setIntro]=useState(false);
  const onUnavailable=useCallback(()=>{setReady(false);setShow3D(false);setIntro(false);},[]);
  const onSceneError=useCallback(()=>{setSceneFailed(true);onUnavailable();},[onUnavailable]);
  const [demoOpen,setDemoOpen]=useState(false);
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = (event: MediaQueryListEvent) => {setMotion(!event.matches);if(event.matches)setIntro(false);};
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  // Keep the frame loop active while diagnosing the V13 startup regression.
  useEffect(()=>{
    if(!show3D||ready)return;
    const timer=window.setTimeout(()=>setSlowStart(true),12000);
    return ()=>window.clearTimeout(timer);
  },[show3D,ready]);
  const active = zones.find(zone => zone.id === selected);
  const dossier = active ? dossiers[active.id] : null;
  const activeTopic=active?topics[active.id][topic]:null;
  const activeIndex=active?zones.indexOf(active):-1;
  const mapRef=useRef<HTMLButtonElement>(null);
  const detailTitle=useRef<HTMLHeadingElement>(null);
  function goTo(id:ZoneId){setIntro(false);setDemoOpen(false);setInterior(false);setSelected(id);setTopic(1);setReset(value=>value+1);}
  function returnToMap(){setIntro(false);setDemoOpen(false);setInterior(false);setSelected(null);setReset(value=>value+1);mapRef.current?.focus({preventScroll:true});}
  useEffect(()=>{if(selected)detailTitle.current?.focus({preventScroll:true});},[selected]);
  function playIntro(){if(!motion||!show3D||!ready)return;returnToMap();setIntro(true);}
  function stopIntro(){setIntro(false);}
  function toggleInterior(){setDemoOpen(false);setInterior(value=>!value);}
  function selectTopic(index:number){setDemoOpen(false);setTopic(index);}
  // Canvas renders fallback DOM children even when WebGL is available.
  // Never disable the scene from a fallback mount effect.
  const fallback = <p>3D rendering is unavailable. You can explore the projects below.</p>;
  return <section className={`campus campus-v6 campus-v7 campus-v13 ${intro&&motion?'campus-cinematic':''} ${active ? 'campus-entered' : ''} ${interior ? 'campus-interior' : ''}`} id="engineering-world" aria-label="Engineering world" onKeyDown={event=>{if(event.key==='Escape'){if(intro){event.preventDefault();stopIntro();}else if(selected){event.preventDefault();if(interior)toggleInterior();else returnToMap();}}}}>
    <div className="campus-stage">
      <div className="campus-world-canvas">{show3D?<SceneBoundary fallback={fallback} onError={onSceneError}><Canvas camera={{ position: [0,27,27.5], fov: 44, near: 0.1, far: 240 }} dpr={[1, 1.25]} shadows gl={{ antialias: true }} fallback={fallback}>
        <CampusMaterialProvider>{interior&&active?<FacilityInterior key={active.id} zone={active} topic={topic} onTopic={selectTopic} motion={motion}/>:<CampusScene selected={selected} topic={topic} onSelect={goTo} onTopic={selectTopic} motion={motion} reset={reset} intro={intro&&motion} onIntroEnd={stopIntro}/>}</CampusMaterialProvider><SceneReady onReady={onReady}/>
      </Canvas></SceneBoundary>:<div className="campus-fallback"><p>{sceneFailed?'The 3D scene could not start. You can explore all projects in the directory below.':'Explore all projects directly in the directory below.'}</p></div>}</div>
      <div className="campus-topfade" aria-hidden="true" />
      {intro&&motion&&<div className="campus-cinematic-overlay"><div><p>TYMUR ABBASOV / SOFTWARE &amp; AI ENGINEERING</p><h3>Enter the system.</h3><span>An interactive engineering portfolio. Five facilities, one connected world.</span></div><button type="button" onClick={()=>{stopIntro();requestAnimationFrame(()=>mapRef.current?.focus({preventScroll:true}));}}>Skip intro →</button></div>}
      <header className="campus-header">
        <div className="campus-heading"><p className="campus-kicker">INTERACTIVE ENGINEERING PORTFOLIO</p>{active?<h2>Engineering <span>avenue.</span></h2>:<h1>Tymur <span>Abbasov.</span></h1>}<p className="campus-role">Full-stack engineer · Local AI &amp; LLM systems</p>{!active&&<p className="campus-intro-copy">Full-stack software, private AI systems and reliable infrastructure. Explore five engineering facilities connected by a luminous energy network.</p>}
          <div className="campus-arrival-links" aria-label="Professional links">
            <a className="campus-classic-link" href={contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a className="campus-classic-link" href={contact.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a className="campus-classic-link" href="#services">Services ↓</a>
            <a className="campus-classic-link" href="./classic/">Classic portfolio ↗</a>
          </div>
          <div className="campus-stage-label"><span aria-hidden="true"/><div>{active?`${interior?'INTERIOR':'FACILITY'} ${active.label} / ${active.name}`:'DISTRICT OVERVIEW / QUANTUM ENERGY NETWORK'}</div></div>
        </div>
        <div className="campus-controls" aria-label="Scene settings">
          <button type="button" ref={mapRef} onClick={returnToMap}>⌖ City overview</button>
          {active&&<button type="button" className="campus-enter-button" onClick={toggleInterior}>{interior?'Return to exterior':'Enter facility ↗'}</button>}
          {show3D&&motion&&ready&&<button type="button" onClick={playIntro}>Play intro</button>}
        </div>
      </header>
      {show3D&&!ready&&<div className={`campus-loading${slowStart?' campus-loading-slow':''}`}><div className="campus-loading-content"><div className="campus-loading-emblem" aria-hidden="true"><i/><i/><i/></div><p>TYMUR ABBASOV / INTERACTIVE PORTFOLIO</p><h3>Initializing the energy network.</h3><div className="campus-loading-track" aria-hidden="true"><span/></div><span role="status">{slowStart?'The renderer is taking longer than expected. You can continue using the project directory.':'Preparing 3D geometry, materials and energy channels…'}</span><button type="button" onClick={onUnavailable}>Explore without 3D →</button></div></div>}
      <div className="campus-hint">{interior?'Select a workstation · Drag to orbit · Scroll to zoom':active?'Choose a light marker · Enter facility to explore inside':'Drag to orbit · Right-drag to move · Scroll to zoom · Click a building'}<span className="campus-key-hint"> · Focus scene: WASD / arrows to move</span></div>
    </div>
    {active&&dossier&&activeTopic&&<aside className="campus-spatial-info" style={{'--zone-color':active.color} as CSSProperties} aria-label={`${active.name} information`}>
      <div className="campus-spatial-top"><span>FACILITY / {active.label}</span><button type="button" onClick={returnToMap}>← City overview</button></div>
      <p className="campus-spatial-eyebrow">{dossier.subtitle}</p>
      <h3 ref={detailTitle} tabIndex={-1}>{active.name}</h3>
      <p className="campus-spatial-intro">{active.description}</p>
      <button className="campus-interior-link" type="button" onClick={toggleInterior}>{interior?'← Back to the exterior':'Enter facility / explore the interior ↗'}</button>
      <div className="campus-spatial-topics" role="group" aria-label="Explore building systems">{topics[active.id].map((item,i)=><button key={item.name} type="button" aria-pressed={topic===i} onClick={()=>selectTopic(i)}><span>{String(i+1).padStart(2,'0')}</span>{item.name}</button>)}</div>
      <div className="campus-spatial-story" key={`${active.id}-${topic}`} aria-live="polite">
        <p className="campus-spatial-eyebrow">{topic===1?dossier.caseStatus:`SYSTEM / ${String(topic+1).padStart(2,'0')}`}</p>
        <h4>{activeTopic.title}</h4><p>{activeTopic.text}</p>
        <div className="campus-spatial-tags">{activeTopic.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      </div>
      <button className="campus-interior-link" type="button" aria-expanded={demoOpen} onClick={()=>{setDemoOpen(value=>!value);}}>{demoOpen?'Hide example workflow':'See how this project works ↗'}</button>
      <p className="campus-demo-note">Optional step-by-step illustration with sample data. No live project is launched.</p>
      {demoOpen&&<CampusProjectDemo key={active.id} id={active.id} motion={motion} onStep={setTopic}/>}
      <a className="campus-spatial-link" href={`./classic/${active.section}`}>{dossier.route} <span aria-hidden="true">↗</span></a>
      <div className="campus-spatial-nav"><button type="button" disabled={activeIndex<=0} onClick={()=>goTo(zones[activeIndex-1].id)}>← Previous</button><span>{active.label} / 05</span><button type="button" disabled={activeIndex>=zones.length-1} onClick={()=>goTo(zones[activeIndex+1].id)}>Next →</button></div>
    </aside>}
    <nav className="campus-directory" aria-label="Engineering avenue facilities">
      <div className="campus-directory-title">DISTRICT DIRECTORY <span>05 FACILITIES</span></div>
      <div className="campus-stops">{zones.map(zone => <button type="button" key={zone.id} aria-pressed={selected === zone.id} className={`campus-zone ${selected === zone.id ? 'is-selected' : ''}`} onClick={() => goTo(zone.id)} style={{ '--zone-color': zone.color } as CSSProperties}><span className="campus-number">{zone.label}</span><span>{zone.name}</span><span className="campus-arrow" aria-hidden="true">↗</span></button>)}</div>
    </nav>
  </section>;
}
