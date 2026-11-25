import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedRing({
  radius,
  tube,
  speed,
  tilt,
  color,
  y,
}: {
  radius: number
  tube: number
  speed: number
  tilt: number
  color: string
  y: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.z = state.clock.elapsedTime * speed
    ref.current.rotation.x = tilt + Math.sin(state.clock.elapsedTime * 0.4) * 0.15
  })

  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <torusGeometry args={[radius, tube, 16, 96]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.6}
        metalness={0.9}
        roughness={0.2}
      />
    </mesh>
  )
}

function GlowingCore() {
  const ref = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      const scale = 1 + Math.sin(t * 2.2) * 0.12
      ref.current.scale.setScalar(scale)
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3.2 + Math.sin(t * 2.2) * 1.4
    }
  })

  return (
    <group position={[0, 2.6, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.85, 48, 48]} />
        <meshStandardMaterial
          color="#ff7a1a"
          emissive="#ff5a00"
          emissiveIntensity={3.4}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={lightRef} color="#ff8a2a" distance={14} decay={2} />
    </group>
  )
}

function Platform() {
  const pillars = useMemo(() => {
    const items: { position: [number, number, number]; height: number }[] = []
    const count = 8
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = 3.4
      items.push({
        position: [Math.cos(angle) * r, 0.55, Math.sin(angle) * r],
        height: 1.1,
      })
    }
    return items
  }, [])

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[4.6, 5.2, 0.7, 64]} />
        <meshStandardMaterial color="#1b2430" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[3.9, 4.3, 0.35, 64]} />
        <meshStandardMaterial color="#232f3d" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Glowing rim */}
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[4.05, 0.06, 12, 96]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      {/* Pillars */}
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.position[0], p.position[1], p.position[2]]}>
          <cylinderGeometry args={[0.28, 0.34, p.height, 16]} />
          <meshStandardMaterial color="#2a3646" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {/* Pillar caps */}
      {pillars.map((p, i) => (
        <mesh key={`cap-${i}`} position={[p.position[0], p.position[1] + p.height / 2 + 0.08, p.position[2]]}>
          <boxGeometry args={[0.5, 0.16, 0.5]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Central pedestal */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[1.5, 1.9, 1.1, 32]} />
        <meshStandardMaterial color="#1f2a38" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[1.15, 1.35, 0.18, 32]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function Reactor() {
  return (
    <group>
      <Platform />
      <GlowingCore />
      <AnimatedRing radius={2.6} tube={0.09} speed={0.55} tilt={0.35} color="#22d3ee" y={2.6} />
      <AnimatedRing radius={3.1} tube={0.07} speed={-0.4} tilt={-0.5} color="#f59e0b" y={2.6} />
      <AnimatedRing radius={3.6} tube={0.05} speed={0.3} tilt={0.9} color="#a78bfa" y={2.6} />
      <Sparkles count={90} scale={[9, 6, 9]} position={[0, 2.6, 0]} size={3} speed={0.6} color="#7dd3fc" />
    </group>
  )
}

export default function EngineeringWorld() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '480px' }}>
      <Canvas
        camera={{ position: [7, 5, 7], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: '#05070d' }}
      >
        <color attach="background" args={['#05070d']} />
        <fog attach="fog" args={['#05070d', 12, 30]} />

        {/* Lighting */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 8, 4]} intensity={1.1} color="#cfe8ff" />
        <spotLight position={[0, 9, 0]} angle={0.5} penumbra={0.6} intensity={2.2} color="#7dd3fc" />
        <pointLight position={[-5, 3, -5]} intensity={1.4} color="#f59e0b" />

        <Stars radius={80} depth={40} count={2200} factor={3} saturation={0} fade speed={0.6} />

        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
          <Reactor />
        </Float>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={4}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2 + 0.15}
          target={[0, 2.2, 0]}
        />
      </Canvas>
    </div>
  )
}

