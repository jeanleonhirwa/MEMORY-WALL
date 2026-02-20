import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import useBoardStore from '../../store/useBoardStore';
import Pin from '../Pin';

const VARIANT_ICONS = { idea: '💡', todo: '📋', warning: '⚠️', blocker: '🔴', done: '✅', note: '📝' };

// Determine readable text color from hex background (WCAG luminance)
function getTextColor(hexColor) {
  if (!hexColor) return '#222222';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  // Relative luminance
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? '#1a1a2e' : lum > 0.35 ? '#222222' : '#f0f0f0';
}

// Light themes where cards need stronger border/shadow for visibility
const LIGHT_THEMES = new Set(['whiteboard', 'paper']);

export default function StickyNote({ item }) {
  const { text, color, position, rotation, pinColor, width = 1.5, height = 1.5, variant = 'note' } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const activeBoard   = boards.find((b) => b.id === activeBoardId);
  const themeKey      = activeBoard?.theme || 'cork';
  const isLightTheme  = LIGHT_THEMES.has(themeKey);
  const isNeonTheme   = themeKey === 'neon';

  const { pos, rot, scale } = useSpring({
    pos: position,
    rot: rotation,
    scale: isSelected ? 1.07 : hovered ? 1.03 : 1,
    config: { tension: 200, friction: 22 },
  });

  const icon      = VARIANT_ICONS[variant] || '';
  const textColor = getTextColor(color);

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* Drop shadow plane — stronger on light themes */}
      <mesh position={[0.06, -0.07, -0.008]} rotation={[0, 0, 0]}>
        <planeGeometry args={[width + 0.08, height + 0.08]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={isLightTheme ? 0.18 : 0.32}
          roughness={1}
        />
      </mesh>

      {/* Paper body */}
      <RoundedBox args={[width, height, 0.05]} radius={0.035} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.86}
          metalness={0}
          envMapIntensity={isNeonTheme ? 0.8 : 0.3}
        />
      </RoundedBox>

      {/* Neon glow outline */}
      {isNeonTheme && (
        <RoundedBox args={[width + 0.04, height + 0.04, 0.04]} radius={0.04} smoothness={4} position={[0, 0, -0.003]}>
          <meshStandardMaterial color="#ff00ff" transparent opacity={0.35} roughness={0.3} />
        </RoundedBox>
      )}

      {/* Light-theme border for visibility */}
      {isLightTheme && (
        <RoundedBox args={[width + 0.02, height + 0.02, 0.04]} radius={0.038} smoothness={4} position={[0, 0, -0.003]}>
          <meshStandardMaterial color="#00000022" transparent opacity={0.18} roughness={1} />
        </RoundedBox>
      )}

      {/* Realistic paper fold — bottom-right corner crease */}
      <mesh position={[width * 0.32, -height * 0.36, 0.026]} rotation={[0, 0, -0.4]}>
        <planeGeometry args={[width * 0.22, height * 0.18]} />
        <meshStandardMaterial color="#00000020" transparent opacity={0.13} roughness={1} />
      </mesh>

      {/* Variant icon top-left */}
      {icon && (
        <Text
          position={[-(width / 2 - 0.2), height / 2 - 0.22, 0.03]}
          fontSize={0.19}
          anchorX="center"
          anchorY="middle"
        >
          {icon}
        </Text>
      )}

      {/* Note text — WCAG contrast-aware */}
      <Text
        position={[0.02, icon ? -0.06 : 0, 0.03]}
        fontSize={0.125}
        maxWidth={width - 0.28}
        lineHeight={1.5}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        overflowWrap="break-word"
      >
        {text}
      </Text>

      {/* Pin */}
      <group position={[0, height / 2 - 0.05, 0.06]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {/* Selection ring */}
      {isSelected && (
        <RoundedBox args={[width + 0.12, height + 0.12, 0.04]} radius={0.05} smoothness={4} position={[0, 0, -0.007]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.32} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
