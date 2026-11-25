import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralNetwork3DProps {
  mouseX: number;
  mouseY: number;
  onReady?: () => void;
}

interface NodeData {
  position: THREE.Vector3;
  connections: number[];
}

function generateNodeData(): NodeData[] {
  const nodes: NodeData[] = [];
  const count = 120;
  const spread = 8;

  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
    );
    nodes.push({ position, connections: [] });
  }

  // Connect each node to 2-4 nearest neighbors
  for (let i = 0; i < nodes.length; i++) {
    const distances: { index: number; distance: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dist = nodes[i].position.distanceTo(nodes[j].position);
      distances.push({ index: j, distance: dist });
    }
    distances.sort((a, b) => a.distance - b.distance);
    const connectionCount = 2 + Math.floor(Math.random() * 3);
    nodes[i].connections = distances
      .slice(0, connectionCount)
      .filter((d) => d.distance < 3)
      .map((d) => d.index);
  }

  return nodes;
}

const nodeData = generateNodeData();

function NeuralNetwork({ mouseX, mouseY, onReady }: NeuralNetwork3DProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const frames = useRef(0);

  const positions = useMemo(() => {
    const arr = new Float32Array(nodeData.length * 3);
    nodeData.forEach((node, i) => {
      arr[i * 3] = node.position.x;
      arr[i * 3 + 1] = node.position.y;
      arr[i * 3 + 2] = node.position.z;
    });
    return arr;
  }, []);

  const edges = useMemo(() => {
    const edgeSet = new Set<string>();
    const edgePositions: number[] = [];

    nodeData.forEach((node, i) => {
      node.connections.forEach((target) => {
        const key = `${Math.min(i, target)}-${Math.max(i, target)}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edgePositions.push(
            node.position.x,
            node.position.y,
            node.position.z,
            nodeData[target].position.x,
            nodeData[target].position.y,
            nodeData[target].position.z,
          );
        }
      });
    });

    return new Float32Array(edgePositions);
  }, []);

  useFrame((_, delta) => {
    if (frames.current < 2 && ++frames.current === 2) onReady?.();
    if (groupRef.current) {
      const dt = Math.min(delta, 0.05);
      groupRef.current.rotation.y += dt * 0.07;
      groupRef.current.rotation.x += dt * 0.035;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouseX * 0.24, 1 - Math.exp(-dt * 3));
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -mouseY * 0.18, 1 - Math.exp(-dt * 3));
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      <Points
        ref={pointsRef}
        positions={positions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          color="#79DFFF"
          size={0.075}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </Points>

      {/* Edges */}
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edges, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function NeuralNetwork3D({ mouseX, mouseY, onReady }: NeuralNetwork3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
      }}
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false }}
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <NeuralNetwork mouseX={mouseX} mouseY={mouseY} onReady={onReady} />
      </Float>
    </Canvas>
  );
}
