import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import Pin from '../Pin';

export default function LinkCard({ item }) {
  const { title = 'Link', url = '', description = '', position, rotation, pinColor, width = 2.0, height = 1.4, tags = [] } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.06 : hovered ? 1.03 : 1,
    config: { tension: 200, friction: 22 },
  });

  // Extract domain for display
  let domain = '';
  try { domain = new URL(url).hostname.replace('www.', ''); } catch {}

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Card body */}
      <RoundedBox args={[width, height, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#0f172a" roughness={0.75} metalness={0.08} />
      </RoundedBox>

      {/* Accent left bar */}
      <mesh position={[-(width / 2 - 0.025), 0, 0.028]}>
        <planeGeometry args={[0.04, height - 0.02]} />
        <meshStandardMaterial color="#f72585" roughness={0.6} />
      </mesh>

      {/* Link icon + domain */}
      <Text position={[-(width / 2 - 0.18), height / 2 - 0.3, 0.03]} fontSize={0.14} color="#f72585" anchorX="left" anchorY="middle">
        🔗
      </Text>
      <Text position={[-(width / 2 - 0.38), height / 2 - 0.3, 0.03]} fontSize={0.1} color="#94a3b8" anchorX="left" anchorY="middle" maxWidth={width - 0.5}>
        {domain || 'link'}
      </Text>

      {/* Title */}
      <Text
        position={[-(width / 2 - 0.14), height / 2 - 0.56, 0.03]}
        fontSize={0.12}
        maxWidth={width - 0.22}
        color="#e2e8f0"
        anchorX="left"
        anchorY="top"
        lineHeight={1.35}
        overflowWrap="break-word"
        fontWeight={600}
      >
        {title}
      </Text>

      {/* Description */}
      {description ? (
        <Text
          position={[-(width / 2 - 0.14), height / 2 - 0.88, 0.03]}
          fontSize={0.09}
          maxWidth={width - 0.22}
          color="#64748b"
          anchorX="left"
          anchorY="top"
          lineHeight={1.3}
          overflowWrap="break-word"
        >
          {description}
        </Text>
      ) : null}

      {/* Tags */}
      {tags.slice(0, 3).map((tag, i) => (
        <group key={i} position={[-(width / 2 - 0.22) + i * 0.65, -(height / 2 - 0.22), 0.03]}>
          <RoundedBox args={[0.55, 0.18, 0.008]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </RoundedBox>
          <Text position={[0, 0, 0.006]} fontSize={0.08} color="#f72585" anchorX="center" anchorY="middle">
            #{tag}
          </Text>
        </group>
      ))}

      {/* Pin */}
      <group position={[0, height / 2 - 0.05, 0.06]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {isSelected && (
        <RoundedBox args={[width + 0.1, height + 0.1, 0.045]} radius={0.05} smoothness={4} position={[0, 0, -0.006]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.28} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
