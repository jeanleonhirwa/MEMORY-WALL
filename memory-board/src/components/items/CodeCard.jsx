import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import useBoardStore from '../../store/useBoardStore';
import Pin from '../Pin';

const LANG_COLORS = {
  javascript: '#f7df1e', typescript: '#3178c6', python: '#3572A5',
  go: '#00ADD8', rust: '#dea584', sql: '#e38c00', bash: '#4EAA25',
  json: '#cbcb41', yaml: '#cb171e', css: '#563d7c', html: '#e34c26',
  default: '#94a3b8',
};

export default function CodeCard({ item }) {
  const { code = '', language = 'javascript', title = 'Snippet', position, rotation, pinColor, width = 2.8, height = 2.2, tags = [] } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const themeKey      = boards.find((b) => b.id === activeBoardId)?.theme || 'cork';
  const isNeonTheme   = themeKey === 'neon';
  const isLightTheme  = themeKey === 'whiteboard' || themeKey === 'paper';

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.05 : hovered ? 1.02 : 1,
    config: { tension: 200, friction: 22 },
  });

  const langColor  = LANG_COLORS[language] || LANG_COLORS.default;
  const displayCode = code.split('\n').slice(0, 10).join('\n');
  // On light themes, use a slightly lighter card body so it reads well
  const cardColor  = isLightTheme ? '#252538' : '#1e1e2e';

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Drop shadow */}
      <mesh position={[0.07, -0.08, -0.008]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshStandardMaterial color="#000000" transparent opacity={isLightTheme ? 0.22 : 0.38} roughness={1} />
      </mesh>

      {/* Neon glow outline */}
      {isNeonTheme && (
        <RoundedBox args={[width + 0.05, height + 0.05, 0.04]} radius={0.05} smoothness={4} position={[0, 0, -0.003]}>
          <meshStandardMaterial color="#00ffff" transparent opacity={0.4} roughness={0.3} />
        </RoundedBox>
      )}

      {/* Dark card body */}
      <RoundedBox args={[width, height, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={cardColor} roughness={0.7} metalness={isNeonTheme ? 0.3 : 0.1} />
      </RoundedBox>

      {/* Header bar */}
      <mesh position={[0, height / 2 - 0.2, 0.028]}>
        <planeGeometry args={[width - 0.01, 0.38]} />
        <meshStandardMaterial color="#13131f" roughness={0.9} />
      </mesh>

      {/* Language badge */}
      <RoundedBox args={[0.55, 0.22, 0.01]} radius={0.06} smoothness={4} position={[-(width / 2 - 0.38), height / 2 - 0.2, 0.032]}>
        <meshStandardMaterial color={langColor} roughness={0.6} />
      </RoundedBox>
      <Text position={[-(width / 2 - 0.38), height / 2 - 0.2, 0.038]} fontSize={0.1} color="#000000" anchorX="center" anchorY="middle" fontWeight={700}>
        {language.toUpperCase().slice(0, 4)}
      </Text>

      {/* Title */}
      <Text
        position={[0.15, height / 2 - 0.2, 0.035]}
        fontSize={0.12}
        maxWidth={width - 0.9}
        color="#e2e8f0"
        anchorX="left"
        anchorY="middle"
        fontWeight={600}
      >
        {title}
      </Text>

      {/* Code text */}
      <Text
        position={[-(width / 2 - 0.18), height / 2 - 0.55, 0.035]}
        fontSize={0.1}
        maxWidth={width - 0.3}
        lineHeight={1.6}
        color="#a9b1d6"
        anchorX="left"
        anchorY="top"
        font={undefined}
        overflowWrap="break-word"
        whiteSpace="pre"
      >
        {displayCode}
      </Text>

      {/* Bottom tag row */}
      {tags.slice(0, 3).map((tag, i) => (
        <group key={i} position={[-(width / 2 - 0.22) + i * 0.7, -(height / 2 - 0.2), 0.03]}>
          <RoundedBox args={[0.6, 0.2, 0.008]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#2d2d44" roughness={0.8} />
          </RoundedBox>
          <Text position={[0, 0, 0.01]} fontSize={0.09} color="#7c85b3" anchorX="center" anchorY="middle">
            #{tag}
          </Text>
        </group>
      ))}

      {/* Pin */}
      <group position={[0, height / 2 - 0.05, 0.06]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {/* Selection glow */}
      {isSelected && (
        <RoundedBox args={[width + 0.1, height + 0.1, 0.045]} radius={0.05} smoothness={4} position={[0, 0, -0.006]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.25} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
