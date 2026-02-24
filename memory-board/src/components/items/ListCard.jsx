import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import useItemDrag from '../../hooks/useItemDrag';
import useBoardStore from '../../store/useBoardStore';
import Pin from '../Pin';

// Bullet styles per list variant
const VARIANT_META = {
  bullet:    { icon: '📋', label: 'List',       bullet: '•',  headerColor: '#4a90d9', bulletColor: '#4a90d9' },
  numbered:  { icon: '🔢', label: 'Numbered',   bullet: null, headerColor: '#7c3aed', bulletColor: '#7c3aed' },
  checklist: { icon: '✅', label: 'Checklist',  bullet: '◻',  headerColor: '#10b981', bulletColor: '#10b981' },
  starred:   { icon: '⭐', label: 'Starred',    bullet: '★',  headerColor: '#f59e0b', bulletColor: '#f59e0b' },
};

const LIGHT_THEMES = new Set(['whiteboard', 'paper']);

export default function ListCard({ item }) {
  const {
    title = 'List',
    items: listItems = [],
    variant = 'bullet',
    position,
    rotation,
    pinColor,
    width = 2.0,
  } = item;

  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const themeKey      = boards.find((b) => b.id === activeBoardId)?.theme || 'cork';
  const isNeonTheme   = themeKey === 'neon';
  const isLightTheme  = LIGHT_THEMES.has(themeKey);

  const meta = VARIANT_META[variant] || VARIANT_META.bullet;

  // Dynamic card height — grows with items, min 1.6, max 3.8
  const visibleItems = listItems.slice(0, 9);
  const rowHeight    = 0.28;
  const headerH      = 0.38;
  const footerH      = 0.22;
  const height       = Math.max(1.6, Math.min(3.8, headerH + visibleItems.length * rowHeight + footerH));

  const { pos, rot, scale } = useSpring({
    pos: position,
    rot: rotation,
    scale: isSelected ? 1.06 : hovered ? 1.02 : 1,
    config: { tension: 200, friction: 22 },
  });

  const cardColor = '#f9f8ff';
  const textColor = '#1e293b';
  const doneColor = '#94a3b8';

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
        <meshStandardMaterial color="#000000" transparent opacity={isLightTheme ? 0.14 : 0.32} roughness={1} />
      </mesh>

      {/* Neon glow */}
      {isNeonTheme && (
        <RoundedBox args={[width + 0.05, height + 0.05, 0.04]} radius={0.05} smoothness={4} position={[0, 0, -0.003]}>
          <meshStandardMaterial color={meta.headerColor} transparent opacity={0.4} roughness={0.3} />
        </RoundedBox>
      )}

      {/* Light-theme border */}
      {isLightTheme && (
        <RoundedBox args={[width + 0.02, height + 0.02, 0.04]} radius={0.038} smoothness={4} position={[0, 0, -0.003]}>
          <meshStandardMaterial color="#00000022" transparent opacity={0.15} roughness={1} />
        </RoundedBox>
      )}

      {/* Card body */}
      <RoundedBox args={[width, height, 0.05]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={cardColor} roughness={0.85} metalness={0} />
      </RoundedBox>

      {/* Header stripe */}
      <mesh position={[0, height / 2 - headerH / 2, 0.028]}>
        <planeGeometry args={[width - 0.01, headerH]} />
        <meshStandardMaterial color={meta.headerColor} roughness={0.8} />
      </mesh>

      {/* Header icon */}
      <Text
        position={[-(width / 2 - 0.22), height / 2 - headerH / 2, 0.035]}
        fontSize={0.15}
        anchorX="center"
        anchorY="middle"
      >
        {meta.icon}
      </Text>

      {/* Header title */}
      <Text
        position={[0.08, height / 2 - headerH / 2, 0.035]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        maxWidth={width - 0.55}
      >
        {title}
      </Text>

      {/* Item count badge */}
      <Text
        position={[width / 2 - 0.22, height / 2 - headerH / 2, 0.036]}
        fontSize={0.09}
        color="rgba(255,255,255,0.75)"
        anchorX="center"
        anchorY="middle"
      >
        {listItems.length}
      </Text>

      {/* List rows */}
      {visibleItems.map((li, i) => {
        const ty = height / 2 - headerH - 0.16 - i * rowHeight;
        const isDone = li.done === true;
        const bulletLabel = variant === 'numbered'
          ? `${i + 1}.`
          : variant === 'checklist'
            ? (isDone ? '✓' : '◻')
            : meta.bullet;
        const bulletCol = variant === 'checklist' && isDone ? '#2dc653' : meta.bulletColor;

        return (
          <group key={li.id || i} position={[0, ty, 0.03]}>
            {/* Bullet / number / checkbox */}
            <Text
              position={[-(width / 2 - 0.22), 0, 0.005]}
              fontSize={variant === 'numbered' ? 0.09 : 0.13}
              color={bulletCol}
              anchorX="center"
              anchorY="middle"
            >
              {bulletLabel}
            </Text>

            {/* Row text */}
            <Text
              position={[-(width / 2 - 0.43), 0, 0.005]}
              fontSize={0.1}
              maxWidth={width - 0.62}
              color={isDone && variant === 'checklist' ? doneColor : textColor}
              anchorX="left"
              anchorY="middle"
              overflowWrap="break-word"
              lineHeight={1.3}
            >
              {li.text}
            </Text>

            {/* Row separator */}
            {i < visibleItems.length - 1 && (
              <mesh position={[0.04, -rowHeight / 2 + 0.02, 0.001]}>
                <planeGeometry args={[width - 0.3, 0.003]} />
                <meshStandardMaterial color="#e2e8f0" transparent opacity={0.6} roughness={1} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Overflow indicator */}
      {listItems.length > 9 && (
        <Text
          position={[0, height / 2 - headerH - 9 * rowHeight - 0.16, 0.03]}
          fontSize={0.09}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          +{listItems.length - 9} more…
        </Text>
      )}

      {/* Empty state */}
      {listItems.length === 0 && (
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.1}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
        >
          No items yet
        </Text>
      )}

      {/* Pin */}
      <group position={[0, height / 2 - 0.05, 0.06]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {/* Selection ring */}
      {isSelected && (
        <RoundedBox args={[width + 0.1, height + 0.1, 0.045]} radius={0.05} smoothness={4} position={[0, 0, -0.006]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.28} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
