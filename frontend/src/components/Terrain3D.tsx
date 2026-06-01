import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export default function Terrain3D({ matrix, heightScale }: { matrix: number[][]; heightScale: number }) {
  const size = matrix.length;
  const vertexData = useMemo(() => {
    const arr = new Float32Array(size * size * 3);
    let idx = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        arr[idx++] = x - size / 2;
        arr[idx++] = matrix[y][x] * heightScale;
        arr[idx++] = y - size / 2;
      }
    }
    return arr;
  }, [matrix, heightScale, size]);

  const indexData = useMemo(() => {
    const indices = [];
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const i1 = y * size + x;
        const i2 = y * size + (x + 1);
        const i3 = (y + 1) * size + x;
        indices.push(i1, i3, i2, i2, i3, (y + 1) * size + (x + 1));
      }
    }
    return new Uint32Array(indices);
  }, [size]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [size, size, size], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 50, 10]} intensity={1.2} />
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[vertexData, 3]} />
            <bufferAttribute attach="index" args={[indexData, 1]} />
          </bufferGeometry>
          <meshStandardMaterial color="#4ade80" roughness={0.8} flatShading={true} side={THREE.DoubleSide} />
        </mesh>
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}
