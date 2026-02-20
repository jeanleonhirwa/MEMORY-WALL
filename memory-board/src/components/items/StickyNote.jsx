import { useRef } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import Pin from '../Pin';

const VARIANT_ICONS = { idea: '💡', todo: '📋', warning: '⚠️', blocker: '🔴', done: '✅', note: '📝' };

export default function StickyNote({ item }) {
  const { id, text, color, position, rotation, pinColor, width = 1.5, height = 1.5, variant = 'note' } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const { pos, rot, scale } = useSpring({
    pos: position,
    rot: rotation,
    scale: isSelected ? 1.07 : hovered ? 1.03 : 1,
    config: { tension: 200, friction: 22 },
  });

  const icon = VARIANT_ICONS[variant] || '';

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Paper body */}
      <RoundedBox args={[width, height, 0.045]} radius={0.035} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.88} metalness={0} />
      </RoundedBox>

      {/* Subtle fold shadow at bottom-right */}
      <mesh position={[width * 0.3, -height * 0.38, -0.005]}>
        <planeGeometry args={[width * 0.35, height * 0.25]} />
        <meshStandardMaterial color="#00000015" transparent opacity={0.12} />
      </mesh>

      {/* Variant icon top-left */}
      {icon && (
        <Text position={[-(width / 2 - 0.18), height / 2 - 0.2, 0.03]} fontSize={0.18} anchorX="center" anchorY="middle">
          {icon}
        </Text>
      )}

      {/* Note text */}
      <Text
        position={[0, -0.05, 0.03]}
        fontSize={0.13}
        maxWidth={width - 0.3}
        lineHeight={1.45}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        overflowWrap="break-word"
      >
        {text}
      </Text>

      {/* Pin */}
      <group position={[0, height / 2 - 0.05, 0.05]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {/* Selection glow */}
      {isSelected && (
        <RoundedBox args={[width + 0.1, height + 0.1, 0.04]} radius={0.05} smoothness={4} position={[0, 0, -0.006]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.3} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
