import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import useBoardStore from '../../store/useBoardStore';
import Pin from '../Pin';

export default function TaskCard({ item }) {
  const { title = 'Tasks', tasks = [], position, rotation, pinColor, width = 2.0, height = 2.2 } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const themeKey      = boards.find((b) => b.id === activeBoardId)?.theme || 'cork';
  const isNeonTheme   = themeKey === 'neon';
  const isLightTheme  = themeKey === 'whiteboard' || themeKey === 'paper';
  const isDarkTheme   = !isLightTheme;

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.06 : hovered ? 1.02 : 1,
    config: { tension: 200, friction: 22 },
  });

  const done  = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? done / total : 0;
  const progressColor = pct === 1 ? '#2dc653' : pct > 0.5 ? '#ff9f1c' : '#e63946';
  // Card body — white on dark themes, very light grey on light themes
  const cardColor  = '#fafaf8';
  const taskTextColor  = '#374151';
  const doneTextColor  = '#9ca3af';

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Drop shadow */}
      <mesh position={[0.06, -0.07, -0.008]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshStandardMaterial color="#000000" transparent opacity={isLightTheme ? 0.16 : 0.35} roughness={1} />
      </mesh>

      {/* Neon glow */}
      {isNeonTheme && (
        <RoundedBox args={[width + 0.05, height + 0.05, 0.04]} radius={0.05} smoothness={4} position={[0, 0, -0.003]}>
          <meshStandardMaterial color="#ff9f1c" transparent opacity={0.4} roughness={0.3} />
        </RoundedBox>
      )}

      {/* Card body */}
      <RoundedBox args={[width, height, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={cardColor} roughness={0.85} metalness={0} />
      </RoundedBox>

      {/* Header stripe */}
      <mesh position={[0, height / 2 - 0.19, 0.028]}>
        <planeGeometry args={[width - 0.01, 0.36]} />
        <meshStandardMaterial color="#ff9f1c" roughness={0.8} />
      </mesh>

      {/* Title */}
      <Text position={[0, height / 2 - 0.19, 0.035]} fontSize={0.13} color="#1a1a2e" anchorX="center" anchorY="middle" fontWeight={700} maxWidth={width - 0.2}>
        {title}
      </Text>

      {/* Task rows */}
      {tasks.slice(0, 6).map((task, i) => {
        const ty = height / 2 - 0.52 - i * 0.28;
        return (
          <group key={task.id || i} position={[0, ty, 0.03]}>
            {/* Checkbox */}
            <RoundedBox args={[0.18, 0.18, 0.01]} radius={0.03} smoothness={4} position={[-(width / 2 - 0.22), 0, 0]}>
              <meshStandardMaterial color={task.done ? '#2dc653' : '#d1d5db'} roughness={0.7} />
            </RoundedBox>
            {task.done && (
              <Text position={[-(width / 2 - 0.22), 0, 0.01]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle">✓</Text>
            )}
            {/* Task text */}
            <Text
              position={[-(width / 2 - 0.45), 0, 0.01]}
              fontSize={0.1}
              maxWidth={width - 0.65}
              color={task.done ? '#9ca3af' : '#374151'}
              anchorX="left"
              anchorY="middle"
              overflowWrap="break-word"
            >
              {task.text}
            </Text>
          </group>
        );
      })}

      {/* Progress bar bg */}
      <mesh position={[0, -(height / 2 - 0.22), 0.03]}>
        <planeGeometry args={[width - 0.3, 0.1]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.9} />
      </mesh>
      {/* Progress bar fill */}
      {pct > 0 && (
        <mesh position={[-(width - 0.3) / 2 * (1 - pct), -(height / 2 - 0.22), 0.035]}>
          <planeGeometry args={[(width - 0.3) * pct, 0.1]} />
          <meshStandardMaterial color={progressColor} roughness={0.7} />
        </mesh>
      )}

      {/* Progress label */}
      <Text position={[0, -(height / 2 - 0.36), 0.035]} fontSize={0.09} color="#6b7280" anchorX="center" anchorY="middle">
        {done}/{total} done
      </Text>

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
