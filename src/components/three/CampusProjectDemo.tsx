import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type FacilityId = 'ai' | 'software' | 'data' | 'command' | 'research';
type Step = { name: string; station: number; input: string; output: string; detail: string };
type Demo = { title: string; steps: Step[] };
const demos: Record<FacilityId, Demo> = {
  ai: { title: 'THAI / document intelligence', steps: [
    { name:'Ingest', station:1, input:'Sample document: Invoice A-104, total €240', output:'Document accepted', detail:'The document enters a local processing workflow. This is illustrative text, not an uploaded file.' },
    { name:'Extract', station:1, input:'Sample invoice text', output:'invoice_id: A-104 · total: €240', detail:'OCR and extraction turn document content into structured fields.' },
    { name:'Retrieve', station:0, input:'What is the invoice total?', output:'Retrieved excerpt: total €240', detail:'Retrieval selects relevant content for the local model.' },
    { name:'Respond', station:2, input:'Question + retrieved excerpt', output:'The invoice total is €240. Source: A-104.', detail:'A local-model workflow can compose a grounded answer. The value here is scripted; no LLM is running.' },
  ] },
  software: { title:'Internal CRM / application flow', steps:[
    {name:'Interface',station:0,input:'Sample customer: Example Co.',output:'Validated form',detail:'React collects input and validates the client-side form.'},
    {name:'API',station:1,input:'Create customer request',output:'Validated request',detail:'A Node.js API validates the request independently of the client.'},
    {name:'Persist',station:2,input:'Authorized sample request',output:'Customer C-001 (simulated)',detail:'Authorization and data validation precede persistence.'},
    {name:'Refresh',station:0,input:'Sample customer record',output:'Customer list updated',detail:'The interface reconciles its state with the returned record.'},
  ] },
  data: {title:'Data operations / pipeline flow',steps:[
    {name:'Source',station:0,input:'Sample records: A=12, B=8',output:'2 records staged',detail:'Identify the source and stage its input for processing.'},
    {name:'Transform',station:1,input:'2 staged records',output:'Aggregate = 20',detail:'A transformation applies defined rules to the input.'},
    {name:'Validate',station:2,input:'2 input records, sum 20',output:'Count and total match',detail:'Reconciliation verifies completeness and consistency.'},
    {name:'Deliver',station:1,input:'Validated aggregate',output:'Sample result published',detail:'An observable handover makes the output available to the next system.'},
  ]},
  command:{title:'Application delivery / release flow',steps:[
    {name:'Commit',station:0,input:'Sample application change',output:'Revision recorded',detail:'Source control establishes a traceable change boundary.'},
    {name:'Verify',station:0,input:'Sample revision',output:'Illustrative build check passed',detail:'Checks gate deployment. This is not a report of an actual CI execution.'},
    {name:'Deploy',station:1,input:'Verified sample artifact',output:'Staging service updated (simulated)',detail:'A reproducible deployment publishes a known artifact.'},
    {name:'Observe',station:2,input:'Sample health probe',output:'Example status: healthy',detail:'Operational feedback informs a release or rollback decision.'},
  ]},
  research:{title:'Local model research / evaluation flow',steps:[
    {name:'Select',station:0,input:'Candidate models A and B',output:'Two candidate configurations',detail:'Choose models and comparable inference settings.'},
    {name:'Control',station:2,input:'Identical prompt and context budget',output:'Controlled test case',detail:'Hold task and context settings constant for a useful comparison.'},
    {name:'Evaluate',station:1,input:'Sample generated responses',output:'Review correctness and resource use',detail:'Assess actual task success and measure memory and throughput separately.'},
    {name:'Review',station:1,input:'Evaluation criteria',output:'Decision requires measured results',detail:'No benchmark results are claimed by this demonstration.'},
  ]},
};

export function CampusProjectDemo({ id, motion, onStep }: { id:FacilityId; motion:boolean; onStep:(station:number)=>void }) {
  const demo=demos[id];
  const [index,setIndex]=useState(0);
  const [playing,setPlaying]=useState(false);
  const step=demo.steps[index];
  const callback=useRef(onStep);
  useEffect(()=>{callback.current=onStep;},[onStep]);
  useEffect(()=>{callback.current(demo.steps[index].station);},[demo,index]);
  useEffect(()=>{
    if(!playing||!motion)return;
    const timer=window.setTimeout(()=>{
      if(index<demo.steps.length-1)setIndex(index+1);else setPlaying(false);
    },2400);
    return ()=>window.clearTimeout(timer);
  },[playing,motion,index,demo]);
  function select(i:number){setPlaying(false);setIndex(i);callback.current(demo.steps[i].station);}
  return <div className="campus-demo">
    <p className="campus-spatial-eyebrow">PROJECT WALKTHROUGH / EXAMPLE</p>
    <h4>{demo.title}</h4>
    <p className="campus-demo-note">Choose a stage or use Next to follow the example. All inputs and outputs are illustrative, not live system results.</p>
    <div className="campus-demo-stages" role="group" aria-label="Workflow stages">{demo.steps.map((item,i)=><button key={item.name} type="button" aria-pressed={i===index} onClick={()=>select(i)}><span>{String(i+1).padStart(2,'0')}</span>{item.name}</button>)}</div>
    <div className="campus-demo-io" aria-live="polite"><span>EXAMPLE INPUT</span><strong>{step.input}</strong><span>EXAMPLE OUTPUT</span><strong>{step.output}</strong><p>{step.detail}</p></div>
    <div className="campus-demo-actions"><button type="button" onClick={()=>select(Math.max(0,index-1))} disabled={index===0}>Previous</button>{motion&&<button type="button" onClick={()=>{if(playing)setPlaying(false);else{if(index===demo.steps.length-1)setIndex(0);setPlaying(true);}}}>{playing?'Pause':'Play walkthrough'}</button>}<button type="button" onClick={()=>select(Math.min(demo.steps.length-1,index+1))} disabled={index===demo.steps.length-1}>Next</button></div>
  </div>;
}

// A physical indicator on the interior floor connects the active workstation
// with the selected step. It shares the same topic state as the exhibit labels.
export function WorkflowSignal({ station,color,motion }: { station:number;color:string;motion:boolean }) {
  const pulse=useRef<THREE.Mesh>(null);
  const elapsed=useRef(0);
  useFrame((_,dt)=>{
    if(!pulse.current)return;
    if(motion)elapsed.current=(elapsed.current+Math.min(dt,.06)*.65)%1;
    pulse.current.position.z=motion?2.55-elapsed.current*1.75:1.65;
  });
  const x=(station-1)*3;
  return <group>
    <mesh raycast={()=>null} position={[0,.078,2.57]}><boxGeometry args={[6,.025,.035]}/><meshBasicMaterial color="#41667d"/></mesh>
    {[-3,0,3].map((p,i)=><mesh key={p} raycast={()=>null} position={[p,.08,1.65]}><boxGeometry args={[.04,.025,1.82]}/><meshBasicMaterial color={station===i?color:'#294452'}/></mesh>)}
    <mesh ref={pulse} raycast={()=>null} position={[x,.11,1.65]}><boxGeometry args={[.14,.09,.25]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>
  </group>;
}
