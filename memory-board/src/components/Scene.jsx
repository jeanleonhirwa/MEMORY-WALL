import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import CorkBoard from './CorkBoard';

/**
 * The main 3D scene setup: Canvas, lighting, camera, controls, and the board.
 */
export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#1a1a2e' }}
    >
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.6} />

      {/* Main directional light casting shadows */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* Fill light from the left */}
      <pointLight position={[-6, 4, 5]} intensity={0.4} color="#ffe0b2" />

      {/* Subtle rim light */}
      <pointLight position={[0, -5, 3]} intensity={0.2} color="#b3d9ff" />

      {/* Environment for realistic reflections */}
      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>

      {/* Ground contact shadows for depth */}
      <ContactShadows
        position={[0, -5, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={6}
      />

      {/* The cork board with all items */}
      <Suspense fallback={null}>
        <CorkBoard />
      </Suspense>

      {/* Orbit controls — limited to prevent disorienting rotation */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 0.7}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 5}
        minDistance={4}
        maxDistance={18}
        target={[0, 0, 0]}
        dampingFactor={0.08}
        enableDamping
      />
    </Canvas>
  );
}
