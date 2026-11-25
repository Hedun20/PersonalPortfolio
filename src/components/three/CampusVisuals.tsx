import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

// Directional dusk atmosphere. The sky is independent of the reflection capture,
// and its low horizon luminance blends into the existing distance fog.
export function ArchitecturalSky() {
  const uniforms = useMemo(() => ({
    zenith: { value: new THREE.Color('#050912') },
    horizon: { value: new THREE.Color('#1c3444') },
    haze: { value: new THREE.Color('#36596b') },
  }), []);
  return <mesh renderOrder={-100} raycast={() => null} frustumCulled={false}>
    <sphereGeometry args={[125, 32, 16]}/>
    <shaderMaterial uniforms={uniforms} side={THREE.BackSide} depthWrite={false} toneMapped={false}
      vertexShader={`varying vec3 vDirection;
        void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
      fragmentShader={`varying vec3 vDirection;
        uniform vec3 zenith;uniform vec3 horizon;uniform vec3 haze;
        void main(){vec3 d=normalize(vDirection);float elevation=max(d.y,0.0);
          vec3 col=mix(horizon,zenith,smoothstep(0.0,0.58,elevation));
          float bank=exp(-pow((d.y-0.045)*9.0,2.0));
          float city=0.35+0.65*pow(max(0.0,dot(normalize(vec3(d.x,0.001,d.z)),normalize(vec3(-0.35,0.0,-1.0)))),3.0);
          col+=haze*bank*city*0.32;
          gl_FragColor=vec4(col,1.0);
          #include <colorspace_fragment>
        }`}/>
  </mesh>;
}

// Static outdoor shadows are captured once per mount / quality change, rather
// than rebuilding the shadow map on every animation frame. Interiors restore
// the renderer's previous shadow policy on unmount.
function ExteriorShadowPolicy({ enabled }: { enabled: boolean }) {
  const gl=useThree(state=>state.gl);
  useLayoutEffect(()=>{
    if(!enabled)return;
    const previous=gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate=false;
    gl.shadowMap.needsUpdate=true;
    return ()=>{gl.shadowMap.autoUpdate=previous;gl.shadowMap.needsUpdate=true;};
  },[gl,enabled]);
  return null;
}

export function CityLighting() {
  const width=useThree(state=>state.size.width);
  const detailed=width>=900;
  return <>
    <ExteriorShadowPolicy enabled={detailed}/>
    <hemisphereLight args={['#c1d9f0','#3b4c58',.66]}/>
    <directionalLight position={[14,24,12]} color="#e7efff" intensity={2.25}
      castShadow={detailed} shadow-mapSize-width={2048} shadow-mapSize-height={2048}
      shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={24} shadow-camera-bottom={-24}
      shadow-camera-near={.5} shadow-camera-far={85} shadow-normalBias={.045} shadow-bias={-.00015}/>
    <directionalLight position={[-15,9,-18]} color="#7bb9fa" intensity={.95}/>
    <directionalLight position={[20,5,-12]} color="#e3c9a3" intensity={.55}/>
    <Environment resolution={detailed?512:128} frames={1}>
      <Lightformer form="rect" intensity={2.4} color="#e6f0ff" position={[0,9,3]} rotation={[Math.PI/2,0,0]} scale={[14,7,1]}/>
      <Lightformer form="rect" intensity={1.55} color="#6aa1d6" position={[-10,4,1]} rotation={[0,Math.PI/2,0]} scale={[9,5,1]}/>
      <Lightformer form="rect" intensity={1.15} color="#d4b792" position={[10,4,-3]} rotation={[0,-Math.PI/2,0]} scale={[5,6,1]}/>
      <Lightformer form="rect" intensity={2.5} color="#e8f5ff" position={[0,5,13]} rotation={[0,Math.PI,0]} scale={[12,1.1,1]}/>
      <Lightformer form="rect" intensity={1.35} color="#8ecfe3" position={[0,2,-12]} scale={[16,.50,1]}/>
      {[-1,1].map(side=><group key={side} position={[side*9,1,-5]} rotation={[0,-side*Math.PI/2,0]}>
        {[0,1,2].map(i=><Lightformer key={i} form="rect" intensity={.65} color={i===1?'#dfba8c':'#9ccfe3'} position={[i*1.9,0,0]} scale={[.18,4,1]}/>)}
      </group>)}
    </Environment>
  </>;
}

// Soft pools of illumination under the existing streetlights. The radial
// texture is additive, not a new point light for every fixture; one batch.
export function PavementLightPools() {
  const { texture, matrices, colors }=useMemo(()=>{
    const n=64,data=new Uint8Array(n*n*4);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const r=Math.hypot((x+.5)/n*2-1,(y+.5)/n*2-1);
      const f=Math.max(0,1-r*r);
      const i=(y*n+x)*4;
      data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(255*f*f*f);
    }
    const texture=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);
    texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
    const matrices:THREE.Matrix4[]=[],colors:THREE.Color[]=[];
    const object=new THREE.Object3D();
    for(let i=0;i<17;i++){
      const a=-1.48+i*2.96/16;
      for(const radius of [9.38,12.17]){
        object.position.set(Math.sin(a)*radius,.031,4-Math.cos(a)*radius);
        object.rotation.set(-Math.PI/2,0,a);
        object.scale.set(1.95,1.6,1);object.updateMatrix();
        matrices.push(object.matrix.clone());colors.push(new THREE.Color(i%5===0?'#dfb879':'#79c9ee'));
      }
    }
    return {texture,matrices,colors};
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  const mesh=useMemo(()=>{
    const geometry=new THREE.PlaneGeometry(1,1);
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.20,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
    const result=new THREE.InstancedMesh(geometry,material,matrices.length);
    matrices.forEach((matrix,i)=>{result.setMatrixAt(i,matrix);result.setColorAt(i,colors[i]);});
    result.instanceMatrix.needsUpdate=true;if(result.instanceColor)result.instanceColor.needsUpdate=true;
    result.computeBoundingSphere();result.raycast=()=>{};return result;
  },[texture,matrices,colors]);
  useEffect(()=>()=>{mesh.geometry.dispose();(mesh.material as THREE.Material).dispose();mesh.dispose();},[mesh]);
  return <primitive object={mesh}/>;
}
