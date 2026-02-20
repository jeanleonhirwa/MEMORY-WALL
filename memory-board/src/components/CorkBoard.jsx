import { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import useBoardStore from '../store/useBoardStore';
import StickyNote    from './items/StickyNote';
import CodeCard      from './items/CodeCard';
import TaskCard      from './items/TaskCard';
import DecisionCard  from './items/DecisionCard';
import MilestoneCard from './items/MilestoneCard';
import LinkCard      from './items/LinkCard';
import SectionLabel  from './items/SectionLabel';
import DiagramCard   from './items/DiagramCard';

const THEME_BOARD = {
  cork:       { surface: '#8B6914', frame: '#5c3d1e', dots: '#7a5c2a' },
  dark:       { surface: '#1e1e2e', frame: '#13131f', dots: '#2d2d44' },
  blueprint:  { surface: '#0d2137', frame: '#061525', dots: '#1a3a5c' },
  whiteboard: { surface: '#f5f5f0', frame: '#d4c9b0', dots: '#e0dad0' },
};

function ItemRenderer({ item }) {
  switch (item.type) {
    case 'note':      return <StickyNote    key={item.id} item={item} />;
    case 'code':      return <CodeCard      key={item.id} item={item} />;
    case 'task':      return <TaskCard      key={item.id} item={item} />;
    case 'decision':  return <DecisionCard  key={item.id} item={item} />;
    case 'milestone': return <MilestoneCard key={item.id} item={item} />;
    case 'link':      return <LinkCard      key={item.id} item={item} />;
    case 'section':   return <SectionLabel  key={item.id} item={item} />;
    case 'photo':
    case 'diagram':   return <DiagramCard   key={item.id} item={item} />;
    default: return null;
  }
}

export default function CorkBoard({ theme = 'cork' }) {
  const items         = useBoardStore((s) => s.items);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const deselect      = useBoardStore((s) => s.deselect);

  const colors = THEME_BOARD[theme] || THEME_BOARD.cork;
  const boardItems = items.filter((i) => i.boardId === activeBoardId);

  // Board dimensions — wide enough to feel infinite at normal zoom
  const W = 28, H = 16;

  return (
    <group>
      {/* ── Wood/metal Frame ── */}
      {[
        { pos: [0,  H / 2 + 0.3, -0.15], size: [W + 1.2, 0.6, 0.35] },
        { pos: [0, -H / 2 - 0.3, -0.15], size: [W + 1.2, 0.6, 0.35] },
        { pos: [-(W / 2 + 0.3), 0, -0.15], size: [0.6, H + 1.2, 0.35] },
        { pos: [ W / 2 + 0.3,  0, -0.15], size: [0.6, H + 1.2, 0.35] },
      ].map((bar, i) => (
        <mesh key={i} position={bar.pos} castShadow receiveShadow>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial color={colors.frame} roughness={0.88} metalness={0.06} />
        </mesh>
      ))}

      {/* ── Board Surface ── */}
      <mesh
        name="board-surface"
        position={[0, 0, -0.12]}
        receiveShadow
        onPointerDown={(e) => { if (e.object.name === 'board-surface') deselect(); }}
      >
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={colors.surface} roughness={0.95} metalness={0.0} />
      </mesh>

      {/* ── Cork texture dots (procedural) ── */}
      {theme === 'cork' && Array.from({ length: 180 }).map((_, i) => {
        const seed = i * 137.508;
        const px = ((seed % W) - W / 2) * 0.95;
        const py = (((seed * 0.618) % H) - H / 2) * 0.9;
        const r  = 0.03 + (i % 5) * 0.012;
        return (
          <mesh key={i} position={[px, py, -0.11]}>
            <circleGeometry args={[r, 8]} />
            <meshStandardMaterial color={colors.dots} roughness={1} />
          </mesh>
        );
      })}

      {/* Blueprint grid lines */}
      {theme === 'blueprint' && Array.from({ length: 30 }).map((_, i) => {
        const x = -W / 2 + i * (W / 29);
        return (
          <mesh key={`vg${i}`} position={[x, 0, -0.11]}>
            <planeGeometry args={[0.008, H]} />
            <meshStandardMaterial color="#1a4a7a" transparent opacity={0.5} roughness={1} />
          </mesh>
        );
      }).concat(Array.from({ length: 18 }).map((_, i) => {
        const y = -H / 2 + i * (H / 17);
        return (
          <mesh key={`hg${i}`} position={[0, y, -0.11]}>
            <planeGeometry args={[W, 0.008]} />
            <meshStandardMaterial color="#1a4a7a" transparent opacity={0.5} roughness={1} />
          </mesh>
        );
      }))}

      {/* ── Pinned Items ── */}
      {boardItems.map((item) => (
        <ItemRenderer key={item.id} item={item} />
      ))}
    </group>
  );
}
