import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';

export default function SectionLabel({ item }) {
  const { label = 'Section', color = '#ffffff', position, rotation, width = 3.5, height = 0.7 } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.05 : hovered ? 1.02 : 1,
    config: { tension: 200, friction: 22 },
  });

  // Parse color for bg with alpha
  const isLight = color === '#ffffff' || color === '#f5f5f0';

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Background pill */}
      <RoundedBox args={[width, height, 0.03]} radius={0.12} smoothness={6} castShadow>
        <meshStandardMaterial color={color} transparent opacity={0.22} roughness={0.9} />
      </RoundedBox>

      {/* Border */}
      <RoundedBox args={[width + 0.02, height + 0.02, 0.025]} radius={0.13} smoothness={6} position={[0, 0, -0.003]}>
        <meshStandardMaterial color={color} transparent opacity={0.5} roughness={0.9} wireframe={false} />
      </RoundedBox>

      {/* Label text */}
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.26}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        letterSpacing={0.04}
        maxWidth={width - 0.3}
      >
        {label}
      </Text>

      {isSelected && (
        <RoundedBox args={[width + 0.12, height + 0.12, 0.028]} radius={0.14} smoothness={6} position={[0, 0, -0.005]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.3} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
