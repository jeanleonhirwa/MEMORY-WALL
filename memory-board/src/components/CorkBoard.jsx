import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import useBoardStore from '../store/useBoardStore';
import PinnedNote from './PinnedNote';
import PinnedPhoto from './PinnedPhoto';

/**
 * Cork board surface with wood frame and all pinned items rendered on it.
 */
export default function CorkBoard() {
  const items = useBoardStore((s) => s.items);
  const deselect = useBoardStore((s) => s.deselect);
  const boardColor = useBoardStore((s) => s.boardColor);

  return (
    <group>
      {/* ── Wood Frame ── */}
      {/* Top bar */}
      <mesh position={[0, 4.55, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[16.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[0, -4.55, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[16.4, 0.5, 0.3]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Left bar */}
      <mesh position={[-8.2, 0, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 9.6, 0.3]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Right bar */}
      <mesh position={[8.2, 0, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 9.6, 0.3]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* ── Cork Surface ── */}
      <mesh
        position={[0, 0, -0.1]}
        receiveShadow
        onPointerDown={(e) => {
          // Deselect when clicking empty board
          if (e.object.name === 'cork') deselect();
        }}
        name="cork"
      >
        <planeGeometry args={[16, 9]} />
        <meshStandardMaterial
          color={boardColor}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* Cork texture dots for realism */}
      {Array.from({ length: 80 }).map((_, i) => {
        const seed = i * 137.508;
        const px = ((seed % 16) - 8) * 0.95;
        const py = (((seed * 0.618) % 9) - 4.5) * 0.9;
        const r = 0.03 + (i % 5) * 0.01;
        return (
          <mesh key={i} position={[px, py, -0.09]}>
            <circleGeometry args={[r, 8]} />
            <meshStandardMaterial color="#7a5c2a" roughness={1} />
          </mesh>
        );
      })}

      {/* ── Pinned Items ── */}
      {items.map((item) =>
        item.type === 'note' ? (
          <PinnedNote key={item.id} item={item} />
        ) : item.type === 'photo' ? (
          <PinnedPhoto key={item.id} item={item} />
        ) : null
      )}
    </group>
  );
}
