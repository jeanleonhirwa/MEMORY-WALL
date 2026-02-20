import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import Pin from '../Pin';

const STATUS_COLORS = { proposed: '#f59e0b', decided: '#10b981', deprecated: '#6b7280' };
const STATUS_LABELS = { proposed: 'PROPOSED', decided: 'DECIDED', deprecated: 'DEPRECATED' };

export default function DecisionCard({ item }) {
  const { title = 'Decision', problem = '', options = '', decision = '', reason = '', status = 'proposed', position, rotation, pinColor, width = 2.4, height = 2.8 } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.05 : hovered ? 1.02 : 1,
    config: { tension: 200, friction: 22 },
  });

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.proposed;

  const rows = [
    { label: 'PROBLEM', value: problem },
    { label: 'OPTIONS', value: options },
    { label: 'DECISION', value: decision },
    { label: 'REASON', value: reason },
  ];

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Card body */}
      <RoundedBox args={[width, height, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#f8f7ff" roughness={0.85} metalness={0} />
      </RoundedBox>

      {/* Header */}
      <mesh position={[0, height / 2 - 0.22, 0.028]}>
        <planeGeometry args={[width - 0.01, 0.42]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.8} />
      </mesh>
      <Text position={[-0.2, height / 2 - 0.22, 0.036]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={700} maxWidth={width - 0.6}>
        ⚖️ {title}
      </Text>

      {/* Status badge */}
      <RoundedBox args={[0.65, 0.2, 0.01]} radius={0.06} smoothness={4} position={[width / 2 - 0.42, height / 2 - 0.22, 0.033]}>
        <meshStandardMaterial color={statusColor} roughness={0.6} />
      </RoundedBox>
      <Text position={[width / 2 - 0.42, height / 2 - 0.22, 0.04]} fontSize={0.08} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={700}>
        {STATUS_LABELS[status]}
      </Text>

      {/* Section rows */}
      {rows.map((row, i) => {
        const ty = height / 2 - 0.62 - i * 0.52;
        return (
          <group key={i} position={[0, ty, 0.03]}>
            <Text position={[-(width / 2 - 0.18), 0.12, 0.005]} fontSize={0.08} color="#7c3aed" anchorX="left" anchorY="middle" fontWeight={700}>
              {row.label}
            </Text>
            <Text position={[-(width / 2 - 0.18), -0.07, 0.005]} fontSize={0.1} maxWidth={width - 0.3} color="#374151" anchorX="left" anchorY="top" lineHeight={1.3} overflowWrap="break-word">
              {row.value || '—'}
            </Text>
            {i < rows.length - 1 && (
              <mesh position={[0, -0.23, 0.002]}>
                <planeGeometry args={[width - 0.3, 0.005]} />
                <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
              </mesh>
            )}
          </group>
        );
      })}

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
