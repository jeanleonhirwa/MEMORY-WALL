import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import Pin from '../Pin';

const STATUS_META = {
  'on-track': { color: '#10b981', label: '✅ On Track' },
  'at-risk':  { color: '#f59e0b', label: '⚠️ At Risk' },
  'delayed':  { color: '#ef4444', label: '🔴 Delayed' },
  'done':     { color: '#6366f1', label: '🚀 Done' },
};

export default function MilestoneCard({ item }) {
  const { title = 'Milestone', targetDate = '', status = 'on-track', tasks = [], position, rotation, pinColor, width = 2.2, height = 1.8 } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.05 : hovered ? 1.02 : 1,
    config: { tension: 200, friction: 22 },
  });

  const meta = STATUS_META[status] || STATUS_META['on-track'];
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Card */}
      <RoundedBox args={[width, height, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#f0f9ff" roughness={0.85} metalness={0} />
      </RoundedBox>

      {/* Header */}
      <mesh position={[0, height / 2 - 0.2, 0.028]}>
        <planeGeometry args={[width - 0.01, 0.38]} />
        <meshStandardMaterial color={meta.color} roughness={0.8} />
      </mesh>

      {/* Title */}
      <Text position={[0, height / 2 - 0.2, 0.035]} fontSize={0.13} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={700} maxWidth={width - 0.2}>
        🚀 {title}
      </Text>

      {/* Status */}
      <Text position={[0, height / 2 - 0.5, 0.03]} fontSize={0.12} color={meta.color} anchorX="center" anchorY="middle" fontWeight={700}>
        {meta.label}
      </Text>

      {/* Date */}
      {targetDate && (
        <Text position={[0, height / 2 - 0.72, 0.03]} fontSize={0.1} color="#64748b" anchorX="center" anchorY="middle">
          📅 {targetDate}
        </Text>
      )}

      {/* Divider */}
      <mesh position={[0, height / 2 - 0.9, 0.03]}>
        <planeGeometry args={[width - 0.3, 0.004]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>

      {/* Sub-tasks */}
      {tasks.slice(0, 3).map((task, i) => (
        <group key={task.id || i} position={[0, height / 2 - 1.05 - i * 0.25, 0.03]}>
          <Text position={[-(width / 2 - 0.22), 0, 0]} fontSize={0.1} color={task.done ? '#10b981' : '#94a3b8'} anchorX="left" anchorY="middle">
            {task.done ? '✅' : '🔲'} {task.text}
          </Text>
        </group>
      ))}

      {/* Progress */}
      {total > 0 && (
        <Text position={[0, -(height / 2 - 0.22), 0.03]} fontSize={0.09} color="#64748b" anchorX="center" anchorY="middle">
          {done}/{total} complete
        </Text>
      )}

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
