import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

type Finish = 'titanium' | 'ceramic' | 'asphalt' | 'stone' | 'glass';
type Maps = { map: THREE.DataTexture; normalMap: THREE.DataTexture; roughnessMap: THREE.DataTexture };
type Library = Record<Finish, Maps> & { contact: THREE.DataTexture };
const MaterialContext = createContext<Library | null>(null);
const N = 256;
const subtleNormal = new THREE.Vector2(.32,.32);
const asphaltNormal = new THREE.Vector2(.55,.55);

// Periodic, deterministic microstructure; textures stay seamless at every edge.
function grain(x: number, y: number) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function clampByte(value: number) { return Math.max(0, Math.min(255, Math.round(value))); }
function texture(data: Uint8Array, n: number, srgb = false) {
  const t = new THREE.DataTexture(data, n, n, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
function makeMaps(finish: Finish): Maps {
  const albedo = new Uint8Array(N * N * 4);
  const normal = new Uint8Array(albedo.length);
  const roughness = new Uint8Array(albedo.length);
  const heights = new Float32Array(N*N);
  const wrap = (v: number) => (v + N) % N;
  const at = (x: number, y: number) => heights[wrap(y)*N+wrap(x)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const noise = grain(x, y) - .5;
    const fine = grain(x+71, y+23) - .5;
    const brush = (grain(0, y) - .5) * .64 + Math.sin(y * Math.PI * 2 / 8) * .11;
    const broad = Math.sin(x * Math.PI * 2 / N * 3) * Math.cos(y * Math.PI * 2 / N * 2);
    const seam = x < 2 || y < 2 || x >= N-2 || y >= N-2;
    const edge = Math.min(x,y,N-1-x,N-1-y);
    const mineral = Math.sin(x * Math.PI * 2 / N * 7 + Math.cos(y*Math.PI*2/N*3)*1.8) * .5 + broad*.5;
    let v = 245, r = 220, height = 0;
    switch (finish) {
      case 'titanium': v=239+brush*19+noise*4; r=216+brush*39; height=brush*.065+noise*.007; break;
      case 'ceramic': v=244+noise*8+broad*3; r=232+noise*18; height=noise*.027; break;
      case 'asphalt': v=212+noise*33+fine*13+broad*9; r=225+noise*34; height=noise*.12+fine*.08+broad*.035; break;
      case 'stone': v=(seam?173:edge<5?227:242)+noise*11+mineral*10; r=(seam?255:200)+noise*24+mineral*15; height=(seam?-.10:edge<5?-.025:0)+noise*.025+mineral*.022; break;
      case 'glass': v=250+broad*3; r=223+broad*21+noise*3; height=broad*.008; break;
    }
    heights[y*N+x]=height;
    const i=(y*N+x)*4;
    albedo[i]=albedo[i+1]=albedo[i+2]=clampByte(v); albedo[i+3]=255;
    roughness[i]=roughness[i+1]=roughness[i+2]=clampByte(r); roughness[i+3]=255;
  }
  for (let y=0;y<N;y++) for(let x=0;x<N;x++) {
    const dx=(at(x+1,y)-at(x-1,y))*2;
    const dy=(at(x,y+1)-at(x,y-1))*2;
    const len=Math.hypot(dx,dy,1), i=(y*N+x)*4;
    normal[i]=clampByte(127.5-dx/len*127.5);
    normal[i+1]=clampByte(127.5-dy/len*127.5);
    normal[i+2]=clampByte(127.5+127.5/len); normal[i+3]=255;
  }
  return {map:texture(albedo,N,true),normalMap:texture(normal,N),roughnessMap:texture(roughness,N)};
}
function makeContact() {
  const data=new Uint8Array(N*N*4);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    // Soft rectangular footprint, with fading edges and no sharp border.
    const d=Math.hypot(Math.max(0,Math.abs((x+.5)/N*2-1)-.46),Math.max(0,Math.abs((y+.5)/N*2-1)-.46));
    const i=(y*N+x)*4;
    data[i]=data[i+1]=data[i+2]=255;
    data[i+3]=clampByte(255*Math.pow(Math.max(0,1-d/.51),2));
  }
  const t=texture(data,N);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t;
}
export function CampusMaterialProvider({children}:{children:ReactNode}){
  const library=useMemo<Library>(()=>({titanium:makeMaps('titanium'),ceramic:makeMaps('ceramic'),asphalt:makeMaps('asphalt'),stone:makeMaps('stone'),glass:makeMaps('glass'),contact:makeContact()}),[]);
  useEffect(()=>()=>{for(const finish of ['titanium','ceramic','asphalt','stone','glass'] as const)Object.values(library[finish]).forEach(t=>t.dispose());library.contact.dispose();},[library]);
  return <MaterialContext.Provider value={library}>{children}</MaterialContext.Provider>;
}
function useLibrary(){const value=useContext(MaterialContext);if(!value)throw new Error('Campus material provider missing');return value;}

// Small trim remains untextured to prevent noisy highlights at a distance.
export function ArchitecturalFinish({color,finish='titanium',detail=true}:{color:string;finish?:Finish;detail?:boolean}){
  const library=useLibrary();
  const maps=library[finish];
  const props={color,...(detail?maps:{}),normalScale:finish==='asphalt'?asphaltNormal:subtleNormal};
  if(!detail && finish!=='glass')return <meshStandardMaterial color={color} metalness={finish==='titanium'?.83:0} roughness={finish==='titanium'?.38:.58}/>;
  if(finish==='glass')return <meshPhysicalMaterial {...props} metalness={.20} roughness={.145} clearcoat={1} clearcoatRoughness={.075} ior={1.52} specularIntensity={1} envMapIntensity={1.65}/>;
  if(finish==='titanium')return <meshPhysicalMaterial {...props} metalness={.82} roughness={.30} anisotropy={.38} anisotropyRotation={Math.PI/2} clearcoat={.24} clearcoatRoughness={.23} envMapIntensity={1.24}/>;
  if(finish==='ceramic')return <meshPhysicalMaterial {...props} metalness={.10} roughness={.44} clearcoat={.35} clearcoatRoughness={.26} envMapIntensity={.95}/>;
  if(finish==='stone')return <meshPhysicalMaterial {...props} metalness={.08} roughness={.48} clearcoat={.32} clearcoatRoughness={.24} envMapIntensity={1.0}/>;
  return <meshStandardMaterial {...props} metalness={0} roughness={.82} envMapIntensity={.75}/>;
}
export function ContactFootprint({position,size,opacity=.46}:{position:[number,number,number];size:[number,number];opacity?:number}){
  const {contact}=useLibrary();
  return <mesh position={position} rotation={[-Math.PI/2,0,0]} raycast={()=>null} renderOrder={1}><planeGeometry args={size}/><meshBasicMaterial color="#02060b" map={contact} transparent opacity={opacity} depthWrite={false} polygonOffset polygonOffsetFactor={-1} toneMapped={false}/></mesh>;
}

// One planar reflection surface per view. Mobile keeps the same tile maps
// without rendering a second view of the city.
export function PolishedPlaza(){
  const {stone}=useLibrary();
  const width=useThree(state=>state.size.width);
  const detailed=width>=1000;
  const geometry=useMemo(()=>{
    const g=new THREE.CircleGeometry(7.43,96);
    const uv=g.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*12,uv.getY(i)*12);
    return g;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh position={[0,-.038,4]} rotation={[-Math.PI/2,0,0]} geometry={geometry} receiveShadow raycast={()=>null}>
    {detailed?<MeshReflectorMaterial color="#253b49" map={stone.map} normalMap={stone.normalMap} normalScale={subtleNormal} roughnessMap={stone.roughnessMap} roughness={.57} metalness={.16} resolution={256} blur={[160,70]} mixBlur={.82} mixStrength={.8} mirror={.22} depthScale={.65} minDepthThreshold={.15} maxDepthThreshold={1.2} reflectorOffset={.004}/>:<ArchitecturalFinish color="#253b49" finish="stone"/>}
  </mesh>;
}
