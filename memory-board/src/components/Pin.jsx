import { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';

/**
 * A 3D thumbtack/pin component rendered using Three.js geometry.
 * Sits at the top-center of each board item.
 */
export default function Pin({ color = '#e63946', hovered = false }) {
  const { scale } = useSpring({
    scale: hovered ? 1.25 : 1,
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.group scale={scale}>
      {/* Pin head (sphere) */}
      <mesh position={[0, 0, 0.12]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.6}
          envMapIntensity={1}
        />
      </mesh>
      {/* Pin needle (cylinder) */}
      <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.003, 0.14, 8]} />
        <meshStandardMaterial color="#adb5bd" roughness={0.1} metalness={0.9} />
      </mesh>
    </animated.group>
  );
}
