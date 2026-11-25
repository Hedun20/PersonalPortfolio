import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Vec3=[number,number,number];
const NO_RAYCAST=()=>null;

const vertexShader=`
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
void main(){
  vUv=uv;
  vN=normalize(normalMatrix*normal);
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  vV=-mv.xyz;
  gl_Position=projectionMatrix*mv;
}
`;
const fragmentShader=`
varying vec2 vUv;
varying vec3 vN;
varying vec3 vV;
uniform float uTime;
uniform float uLength;
uniform vec3 uColor;
uniform float uFade;
uniform float uHalo;
void main(){
  float t=vUv.y;
  float a=vUv.x*6.2831853;
  float distanceAlong=t*uLength;
  float wave=distanceAlong*3.4-uTime*7.0;
  float threadA=pow(max(0.0,0.5+0.5*cos(a*3.0+wave+sin(distanceAlong*1.7-uTime*2.1))),8.0);
  float threadB=pow(max(0.0,0.5+0.5*cos(a*5.0-wave*.71+sin(distanceAlong*2.6+uTime*1.7))),10.0);
  float pulse=0.6+0.4*sin(distanceAlong*1.6-uTime*3.4);
  float face=abs(dot(normalize(vN),normalize(vV)));
  float ends=smoothstep(0.0,0.055,t)*(1.0-smoothstep(mix(.965,.60,uFade),1.0,t));
  float base=0.38+threadA*.75+threadB*.65;
  vec3 rgb=mix(uColor*(1.1+base*pulse),vec3(1.8,2.4,2.8),threadA*.5+threadB*.22);
  float alpha=mix(ends*(.36+.52*face),ends*(.035+.16*face*face),uHalo);
  gl_FragColor=vec4(rgb,alpha);
  #include <colorspace_fragment>
}
`;

// Real 3D luminous volume: a dense animated filament cylinder and a wider
// additive halo. Both are transparent to picking and cast no shadows.
export function EnergyBeam({from,to,radius,color,motion,fadeEnd=false}:{
  from:Vec3;to:Vec3;radius:number;color:string;motion:boolean;fadeEnd?:boolean;
}){
  const [ax,ay,az]=from,[bx,by,bz]=to;
  const transform=useMemo(()=>{
    const a=new THREE.Vector3(ax,ay,az),b=new THREE.Vector3(bx,by,bz);
    const delta=b.clone().sub(a);
    const length=delta.length();
    return {center:a.add(b).multiplyScalar(.5),length,rotation:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize())};
  },[ax,ay,az,bx,by,bz]);
  const inner=useRef<THREE.ShaderMaterial>(null);
  const halo=useRef<THREE.ShaderMaterial>(null);
  const elapsed=useRef(0);
  const uniforms=useMemo(()=>[0,1].map(layer=>({
    uTime:{value:0},uLength:{value:transform.length},uColor:{value:new THREE.Color(color)},uFade:{value:fadeEnd?1:0},uHalo:{value:layer},
  })),[transform.length,color,fadeEnd]);
  useFrame((_,dt)=>{
    if(!motion)return;
    elapsed.current+=Math.min(dt,.05);
    if(inner.current)inner.current.uniforms.uTime.value=elapsed.current;
    if(halo.current)halo.current.uniforms.uTime.value=elapsed.current;
  });
  return <group position={transform.center} quaternion={transform.rotation}>
    <mesh raycast={NO_RAYCAST}>
      <cylinderGeometry args={[radius*.86,radius,transform.length,16,1,true]}/>
      <shaderMaterial ref={inner} uniforms={uniforms[0]} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
    </mesh>
    <mesh raycast={NO_RAYCAST}>
      <cylinderGeometry args={[radius*2.1,radius*2.4,transform.length,16,1,true]}/>
      <shaderMaterial ref={halo} uniforms={uniforms[1]} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
    </mesh>
  </group>;
}
