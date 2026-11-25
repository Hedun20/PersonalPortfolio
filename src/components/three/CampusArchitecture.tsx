import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ArchitecturalFinish } from './CampusMaterials';

type Vec3 = [number, number, number];
type FacilityId = 'ai' | 'software' | 'data' | 'command' | 'research';
type Surface = 'alloy' | 'dark' | 'edge' | 'glass' | 'light';
type Batch = { surface: Surface; geometry: THREE.BufferGeometry };
const surfaces: Surface[] = ['alloy', 'dark', 'edge', 'glass', 'light'];

// Chamfered plan geometry with real bevels; x/z footprints are in local building units.
function slabGeometry(w: number, h: number, d: number, cut: number) {
  const x=w/2, z=d/2, c=Math.min(cut,x*.8,z*.8);
  const points = [[-x+c,-z],[x-c,-z],[x,-z+c],[x,z-c],[x-c,z],[-x+c,z],[-x,z-c],[-x,-z+c]];
  const shape=new THREE.Shape(points.map(([px,pz])=>new THREE.Vector2(px,pz)));
  const bevel=Math.min(.035,h*.16,c*.32);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:h-2*bevel,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,steps:1,curveSegments:1});
  geometry.rotateX(-Math.PI/2);
  geometry.translate(0,-(h-2*bevel)/2,0);
  return geometry;
}

export function ArchitecturalSlab({ position, size, color, cut=.20 }: { position:Vec3; size:Vec3; color:string; cut?:number }) {
  const [w,h,d]=size;
  const geometry=useMemo(()=>slabGeometry(w,h,d,cut),[w,h,d,cut]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh position={position} geometry={geometry} castShadow receiveShadow><ArchitecturalFinish color={color} finish="titanium"/></mesh>;
}

// Merge static components by surface instead of creating a draw call per rivet.
// Every batch retains normals and UVs, and is disposed when its owner unmounts.
function createAssembly() {
  const parts:Record<Surface,THREE.BufferGeometry[]>={alloy:[],dark:[],edge:[],glass:[],light:[]};
  function add(surface:Surface,g:THREE.BufferGeometry,p:Vec3=[0,0,0],r:Vec3=[0,0,0]) {
    const mesh=new THREE.Object3D(); mesh.position.set(...p); mesh.rotation.set(...r); mesh.updateMatrix();
    g.applyMatrix4(mesh.matrix);
    const result=g.index?g.toNonIndexed():g;
    if(result!==g)g.dispose();
    result.clearGroups(); parts[surface].push(result);
  }
  function box(surface:Surface,p:Vec3,s:Vec3,r:Vec3=[0,0,0]) { add(surface,new THREE.BoxGeometry(...s),p,r); }
  function slab(surface:Surface,p:Vec3,s:Vec3,cut=.18) { add(surface,slabGeometry(...s,cut),p); }
  function tube(surface:Surface,from:Vec3,to:Vec3,radius:number,sides=8) {
    const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to), delta=b.clone().sub(a);
    const geometry=new THREE.CylinderGeometry(radius,radius,delta.length(),sides);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
    const center=a.add(b).multiplyScalar(.5); add(surface,geometry,[center.x,center.y,center.z]);
  }
  function torus(surface:Surface,p:Vec3,radius:number,thickness:number,r:Vec3=[Math.PI/2,0,0]) { add(surface,new THREE.TorusGeometry(radius,thickness,6,48),p,r); }
  function lathe(surface:Surface,p:Vec3,profile:[number,number][],segments=24) { add(surface,new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),segments),p); }
  function finish():Batch[] {
    return surfaces.flatMap(surface=>{
      const source=parts[surface]; if(!source.length)return [];
      const geometry=mergeGeometries(source); source.forEach(g=>g.dispose());
      if(!geometry)throw new Error(`Invalid architecture batch: ${surface}`);
      geometry.computeBoundingSphere(); return [{surface,geometry}];
    });
  }
  return {add,box,slab,tube,torus,lathe,finish};
}

function makeExterior(id:FacilityId) {
  const {add,box,slab,tube,torus,lathe,finish}=createAssembly();
  switch(id) {
    case 'ai': {
      // Reactor exoskeleton with machined collars and six tapering structural blades.
      lathe('alloy',[0,.36,0],[[1.57,0],[1.83,.06],[1.86,.13],[1.76,.18],[1.58,.18],[1.57,0]]);
      lathe('alloy',[0,3.52,0],[[.60,0],[1.17,0],[1.26,.12],[1.04,.35],[.60,.42],[.55,.36],[.60,0]]);
      torus('light',[0,3.73,0],1.04,.022);
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        const p=(r:number,y:number):Vec3=>[Math.sin(a)*r,y,Math.cos(a)*r];
        tube('edge',p(1.84,.60),p(1.64,2.95),.075);
        // End beneath the roof lip; do not pierce the upper collar.
        tube('alloy',p(1.64,2.95),p(1.15,3.245),.055);
        box('edge',p(1.15,3.255),[.17,.075,.17],[0,a,0]);
        tube('light',p(1.70,1.58),p(1.61,2.86),.018,6);
        tube('dark',p(1.85,.60),p(1.43,1.30),.095);
        const bracket=p(1.70,2.92); box('edge',bracket,[.20,.18,.18],[0,a,0]);
        for(const y of [.92,2.44])box('alloy',p(1.66,y),[.20,.13,.22],[0,a,0]);
      }
      lathe('edge',[0,3.91,0],[[.29,0],[.43,.04],[.43,.11],[.24,.22],[.24,0],[.29,0]]);
      break;
    }
    case 'software': {
      // Each wing has an entrance canopy, a deep roof edge and sunshade fins.
      for(const side of [-1,1]) {
        const x=side*1.08;
        slab('alloy',[x,.99,1.54],[.91,.10,.52],.13);
        slab('dark',[x,1.04,1.57],[.81,.04,.43],.11);
        box('light',[x,.94,1.78],[.69,.022,.028]);
        for(const s of [-1,1]){
          tube('edge',[x+s*.36,.45,1.73],[x+s*.36,.96,1.73],.035);
          tube('alloy',[x+s*.70,2.35,-1.17],[x+s*.74,2.66,-1.10],.045);
          for(let k=0;k<7;k++){
            const z=-1.16+k*.36;
            box('edge',[x+s*.83,1.88,z],[.13,.69,.047]);
            box('dark',[x+s*.89,1.88,z],[.025,.62,.044]);
          }
        }
        slab('dark',[x,2.70,-.35],[1.23,.13,1.43],.19);
        for(let i=0;i<6;i++)box('alloy',[x-.47+i*.185,2.79,-.35],[.045,.065,1.19]);
        box('glass',[x,2.72,.69],[1.19,.11,.48]);
        box('light',[x,2.78,.92],[1.07,.023,.03]);
      }
      // Structural frame on the existing bridge, without blocking its glazed face.
      for(const z of [-.80,.51])for(const x of [-.39,.39])tube('edge',[x,1.89,z],[x,2.43,z],.041);
      for(const z of [-.81,.52])tube('alloy',[-.37,2.42,z],[.37,1.91,z],.026);
      break;
    }
    case 'data': {
      // Repeated cooling cartridges and curved return pipes on a broad industrial roof.
      for(const x of [-1.2,0,1.2]){
        slab('alloy',[x,3.23,-.55],[.87,.17,.97],.12);
        lathe('edge',[x,3.35,-.55],[[.30,0],[.38,0],[.38,.065],[.30,.09],[.30,0]],24);
        add('dark',new THREE.CylinderGeometry(.29,.29,.055,24),[x,3.36,-.55]);
        for(let i=0;i<7;i++){
          const a=i*Math.PI*2/7;
          box('alloy',[x+Math.sin(a)*.14,3.4,-.55+Math.cos(a)*.14],[.25,.035,.075],[0,a+.38,0]);
        }
        torus('light',[x,3.42,-.55],.33,.013);
        const points=[new THREE.Vector3(x,3.17,.16),new THREE.Vector3(x,3.46,.32),new THREE.Vector3(x,3.46,.90),new THREE.Vector3(x,3.14,1.16)];
        add('alloy',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,.055,8,false));
      }
      for(const side of [-1,1])for(let i=0;i<8;i++){
        const z=-1.32+i*.36;
        box('edge',[side*1.94,2.52,z],[.17,.11,.06]);
        box('dark',[side*1.96,1.21,z],[.06,1.10,.055]);
      }
      slab('alloy',[0,2.72,1.60],[3.78,.13,.45],.17);
      box('light',[0,2.66,1.80],[3.40,.028,.028]);
      break;
    }
    case 'command': {
      // An angular panoramic crown and independent, tapered buttresses.
      slab('alloy',[0,3.47,-.23],[3.74,.18,2.86],.46);
      slab('dark',[0,3.61,-.23],[3.19,.15,2.28],.38);
      slab('edge',[0,3.72,-.23],[2.84,.055,2.06],.29);
      for(const side of [-1,1]){
        for(const z of [-1.22,.76]){
          tube('alloy',[side*1.66,.55,z],[side*1.24,2.83,z],.095);
          tube('edge',[side*1.36,1.75,z],[side*1.65,2.72,z],.053);
        }
        for(let i=0;i<7;i++){
          const z=-1.26+i*.32;
          box('edge',[side*1.75,3.18,z],[.07,.33,.045]);
        }
        tube('alloy',[side*1.20,3.75,-.78],[side*.79,4.22,-.78],.045);
        tube('light',[side*1.20,3.77,-.77],[side*.79,4.22,-.77],.013);
      }
      slab('dark',[0,2.83,1.27],[2.93,.12,.42],.20);
      box('light',[0,2.77,1.45],[2.59,.025,.03]);
      break;
    }
    case 'research': {
      // Symmetric, two-tier observatory canopy. One frame replaces the old crossing braces.
      const centerZ=-.13;
      const lower:Vec3[]=[], upper:Vec3[]=[];
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4+Math.PI/8;
        lower.push([Math.sin(a)*1.13,1.95,centerZ+Math.cos(a)*1.13]);
        upper.push([Math.sin(a)*.49,3.12,centerZ+Math.cos(a)*.49]);
      }
      for(let i=0;i<8;i++){
        const next=(i+1)%8, a=lower[i], b=lower[next], c=upper[next], d=upper[i];
        tube('alloy',a,d,.048); tube('edge',a,b,.043); tube('alloy',d,c,.043);
        // Leave the front open so the rotating instrument is unobstructed.
        if(i>=1&&i<=5){
          const g=new THREE.BufferGeometry();
          g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
          g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));
          g.computeVertexNormals(); add('glass',g);
        }
        const foot:Vec3=[a[0],.57,a[2]];
        tube('alloy',foot,a,.055);
        box('edge',[a[0],.57,a[2]],[.18,.13,.18]);
      }
      torus('edge',[0,3.14,centerZ],.47,.035);
      torus('light',[0,3.19,centerZ],.41,.015);
      lathe('dark',[0,3.14,centerZ],[[.46,0],[.39,.11],[.22,.17],[0,.17]],32);
      for(const side of [-1,1]){
        const x=side*1.33;
        slab('alloy',[x,1.98,-.28],[.86,.15,1.36],.19);
        for(let i=0;i<5;i++)box('dark',[x-.28+i*.14,2.08,-.28],[.045,.06,1.09]);
        tube('edge',[side*1.76,.55,1.18],[side*1.76,1.59,1.18],.05);
        tube('edge',[side*1.76,1.59,1.18],[side*.86,1.76,1.18],.05);
        box('light',[x,1.78,1.20],[.83,.025,.035]);
      }
      break;
    }
  }
  return finish();
}

function makeInterior(id:FacilityId) {
  const {box,slab,tube,torus,finish}=createAssembly();
  // Common construction joints, cable trunk and recessed architectural lighting.
  for(let i=0;i<10;i++){
    const x=-4.72+i*1.05;
    box('alloy',[x,.24,-2.92],[.91,.24,.10]);
    box('dark',[x,.23,-2.85],[.70,.055,.055]);
    box('edge',[x,3.16,-2.82],[.82,.07,.17]);
    if(i%2===0)box('light',[x,3.12,-2.72],[.55,.024,.028]);
  }
  for(const side of [-1,1]){
    tube('edge',[side*5.02,.13,-2.88],[side*5.02,.13,2.68],.028);
    tube('light',[side*4.99,.17,-2.82],[side*4.99,.17,2.55],.013);
  }
  switch(id){
    case 'ai':
      for(const x of [-3.4,0,3.4]){
        tube('alloy',[x,2.95,-2.77],[x,3.32,-1.8],.06);
        torus('edge',[x,2.45,-2.80],.55,.025,[0,0,0]);
        torus('light',[x,2.45,-2.78],.43,.016,[0,0,0]);
      }break;
    case 'software':
      for(const x of [-3.5,0,3.5]){
        slab('alloy',[x,1.48,-2.83],[2.32,.07,.22],.08);
        for(let j=0;j<5;j++)box('edge',[x-.88+j*.44,2.12,-2.88],[.025,1.08,.05]);
      }break;
    case 'data':
      for(const x of [-4.2,-2.1,0,2.1,4.2]){
        tube('alloy',[x,2.65,-2.77],[x,3.18,-2.30],.055);
        tube('edge',[x,3.18,-2.30],[x,3.18,-1.50],.055);
        for(let j=0;j<3;j++)box('dark',[x-.20+j*.20,2.48,-2.82],[.15,.23,.07]);
      }break;
    case 'command':
      for(const x of [-2.7,0,2.7]){
        slab('alloy',[x,1.36,-2.88],[2.52,.09,.30],.12);
        for(const side of [-1,1])tube('edge',[x+side*1.20,1.38,-2.76],[x+side*1.20,2.81,-2.76],.023);
      }break;
    case 'research':
      for(const x of [-3.5,0,3.5]){
        torus('alloy',[x,2.07,-2.80],.65,.038,[0,0,0]);
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3;
          tube('edge',[x+Math.cos(a)*.52,2.07+Math.sin(a)*.52,-2.79],[x+Math.cos(a)*.65,2.07+Math.sin(a)*.65,-2.79],.017);
        }
      }break;
  }
  return finish();
}

export function FacilityArchitecture({ id, color, interior=false }: { id:FacilityId; color:string; interior?:boolean }) {
  const batches=useMemo(()=>interior?makeInterior(id):makeExterior(id),[id,interior]);
  useEffect(()=>()=>batches.forEach(({geometry})=>geometry.dispose()),[batches]);
  return <group>{batches.map(({surface,geometry})=><mesh key={surface} geometry={geometry} castShadow={surface!=='light'&&surface!=='glass'} receiveShadow={surface!=='light'&&surface!=='glass'}>
    {surface==='light'?<meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.75} toneMapped={false}/>:surface==='glass'?<meshPhysicalMaterial color="#9cbad0" metalness={.05} roughness={.18} clearcoat={1} transparent opacity={.21} depthWrite={false} side={THREE.DoubleSide}/>:<ArchitecturalFinish color={surface==='alloy'?'#5e7481':surface==='edge'?'#a2b2bb':'#1a2936'} finish={surface==='dark'?'ceramic':'titanium'}/>}
  </mesh>)}</group>;
}
