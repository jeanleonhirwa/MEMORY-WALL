import { useMemo } from 'react';
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
import ListCard      from './items/ListCard';

// ─────────────────────────────────────────────────────────────────────────────
// THEME DEFINITIONS — each theme has:
//   surface     : main board color
//   frame       : border/frame color
//   frameMetal  : metalness of frame
//   frameRough  : roughness of frame
//   dots        : dot/grain color for procedural texture
//   gridColor   : line color for grid themes
//   bgColor     : canvas background (matched in Scene.jsx)
//   accent      : subtle highlight color for board
//   textureType : 'cork'|'grid'|'dots'|'lines'|'noise'|'hexgrid'|'plain'|'ruled'|'wood'
// ─────────────────────────────────────────────────────────────────────────────
export const THEMES = {
  cork: {
    label: 'Cork',
    emoji: '🪵',
    surface:    '#a07840',
    surfaceAlt: '#8d6830',
    frame:      '#5c3d1e',
    frameMetal: 0.04,
    frameRough: 0.88,
    dots:       '#7a5020',
    dotsAlt:    '#c8a060',
    bgColor:    '#1a1008',
    accent:     '#c09050',
    textureType: 'cork',
  },
  dark: {
    label: 'Dark',
    emoji: '🌑',
    surface:    '#16161e',
    surfaceAlt: '#1e1e2e',
    frame:      '#0d0d18',
    frameMetal: 0.18,
    frameRough: 0.55,
    dots:       '#2a2a40',
    dotsAlt:    '#3a3a55',
    bgColor:    '#07070f',
    accent:     '#2d2d45',
    textureType: 'noise',
  },
  blueprint: {
    label: 'Blueprint',
    emoji: '📐',
    surface:    '#0a1f35',
    surfaceAlt: '#0d2540',
    frame:      '#051525',
    frameMetal: 0.22,
    frameRough: 0.6,
    dots:       '#1a4060',
    dotsAlt:    '#235080',
    bgColor:    '#040e18',
    accent:     '#1a6090',
    gridColor:  '#1a4a7a',
    textureType: 'grid',
  },
  whiteboard: {
    label: 'Whiteboard',
    emoji: '🗒️',
    surface:    '#f8f7f4',
    surfaceAlt: '#eeecea',
    frame:      '#c8c0b0',
    frameMetal: 0.0,
    frameRough: 0.75,
    dots:       '#d8d4cc',
    dotsAlt:    '#e0dcd6',
    bgColor:    '#e0ddd8',
    accent:     '#dedad4',
    gridColor:  '#d0ccc4',
    textureType: 'ruled',
  },
  midnight: {
    label: 'Midnight',
    emoji: '🌌',
    surface:    '#0b0d1a',
    surfaceAlt: '#0f1225',
    frame:      '#080a14',
    frameMetal: 0.35,
    frameRough: 0.4,
    dots:       '#1a1f40',
    dotsAlt:    '#232860',
    bgColor:    '#04050d',
    accent:     '#1e2455',
    gridColor:  '#151a38',
    textureType: 'dots',
  },
  forest: {
    label: 'Forest',
    emoji: '🌲',
    surface:    '#1a2a1a',
    surfaceAlt: '#1e321e',
    frame:      '#0f1a0f',
    frameMetal: 0.06,
    frameRough: 0.85,
    dots:       '#2a3e2a',
    dotsAlt:    '#3a5a3a',
    bgColor:    '#080f08',
    accent:     '#2d4a2d',
    textureType: 'noise',
  },
  slate: {
    label: 'Slate',
    emoji: '🪨',
    surface:    '#2a3040',
    surfaceAlt: '#303848',
    frame:      '#1c2230',
    frameMetal: 0.28,
    frameRough: 0.62,
    dots:       '#384050',
    dotsAlt:    '#454e62',
    bgColor:    '#141820',
    accent:     '#3c4560',
    textureType: 'noise',
  },
  paper: {
    label: 'Paper',
    emoji: '📄',
    surface:    '#f5f0e8',
    surfaceAlt: '#ece7de',
    frame:      '#b8a888',
    frameMetal: 0.0,
    frameRough: 0.9,
    dots:       '#d8d0c0',
    dotsAlt:    '#c8c0b0',
    bgColor:    '#d8d0c0',
    accent:     '#e0d8c8',
    gridColor:  '#c8c4bc',
    textureType: 'ruled',
  },
  neon: {
    label: 'Neon',
    emoji: '⚡',
    surface:    '#0a0014',
    surfaceAlt: '#0d0018',
    frame:      '#1a0028',
    frameMetal: 0.5,
    frameRough: 0.3,
    dots:       '#200030',
    dotsAlt:    '#300048',
    bgColor:    '#050008',
    accent:     '#ff00ff',
    gridColor:  '#2d0050',
    textureType: 'hexgrid',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Procedural Texture Layers per theme
// ─────────────────────────────────────────────────────────────────────────────

function CorkTexture({ W, H, theme }) {
  const dots = useMemo(() => {
    return Array.from({ length: 280 }).map((_, i) => {
      const seed = i * 137.508 + 7;
      const px = ((seed % (W * 10)) / (W * 10) - 0.5) * W * 0.96;
      const py = ((((seed * 0.618) % (H * 10)) / (H * 10)) - 0.5) * H * 0.94;
      const r  = 0.025 + (i % 7) * 0.011;
      const dark = i % 3 === 0;
      return { px, py, r, dark };
    });
  }, [W, H]);

  return (
    <>
      {dots.map((d, i) => (
        <mesh key={i} position={[d.px, d.py, -0.108]}>
          <circleGeometry args={[d.r, 6]} />
          <meshStandardMaterial
            color={d.dark ? theme.dots : theme.dotsAlt}
            roughness={1} metalness={0}
            transparent opacity={0.7}
          />
        </mesh>
      ))}
      {/* Larger grain patches */}
      {Array.from({ length: 40 }).map((_, i) => {
        const seed = i * 293.17;
        const px = ((seed % (W * 8)) / (W * 8) - 0.5) * W * 0.9;
        const py = ((((seed * 0.732) % (H * 8)) / (H * 8)) - 0.5) * H * 0.88;
        return (
          <mesh key={`grain-${i}`} position={[px, py, -0.109]} rotation={[0, 0, seed % Math.PI]}>
            <planeGeometry args={[0.18 + (i % 4) * 0.06, 0.04 + (i % 3) * 0.02]} />
            <meshStandardMaterial color={theme.dots} roughness={1} transparent opacity={0.35} />
          </mesh>
        );
      })}
    </>
  );
}

function GridTexture({ W, H, theme, major = false }) {
  const vLines = 38;
  const hLines = 22;
  return (
    <>
      {Array.from({ length: vLines }).map((_, i) => {
        const x = -W / 2 + i * (W / (vLines - 1));
        const isMajor = i % 4 === 0;
        return (
          <mesh key={`v${i}`} position={[x, 0, -0.108]}>
            <planeGeometry args={[isMajor ? 0.012 : 0.005, H]} />
            <meshStandardMaterial
              color={theme.gridColor}
              transparent opacity={isMajor ? 0.65 : 0.32}
              roughness={1}
            />
          </mesh>
        );
      })}
      {Array.from({ length: hLines }).map((_, i) => {
        const y = -H / 2 + i * (H / (hLines - 1));
        const isMajor = i % 4 === 0;
        return (
          <mesh key={`h${i}`} position={[0, y, -0.108]}>
            <planeGeometry args={[W, isMajor ? 0.012 : 0.005]} />
            <meshStandardMaterial
              color={theme.gridColor}
              transparent opacity={isMajor ? 0.65 : 0.32}
              roughness={1}
            />
          </mesh>
        );
      })}
    </>
  );
}

function RuledTexture({ W, H, theme }) {
  const lines = 30;
  return (
    <>
      {/* Red margin line */}
      <mesh position={[-W / 2 + 1.4, 0, -0.108]}>
        <planeGeometry args={[0.008, H]} />
        <meshStandardMaterial color="#e07070" transparent opacity={0.5} roughness={1} />
      </mesh>
      {/* Horizontal ruled lines */}
      {Array.from({ length: lines }).map((_, i) => {
        const y = H / 2 - 0.8 - i * (H - 1.2) / (lines - 1);
        return (
          <mesh key={i} position={[0, y, -0.108]}>
            <planeGeometry args={[W, 0.006]} />
            <meshStandardMaterial color={theme.gridColor} transparent opacity={0.45} roughness={1} />
          </mesh>
        );
      })}
    </>
  );
}

function DotsTexture({ W, H, theme }) {
  const dots = useMemo(() => {
    const cols = 36, rows = 20;
    const out = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          x: -W / 2 + (c + 0.5) * (W / cols),
          y: -H / 2 + (r + 0.5) * (H / rows),
        });
      }
    }
    return out;
  }, [W, H]);

  return (
    <>
      {dots.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, -0.109]}>
          <circleGeometry args={[0.018, 6]} />
          <meshStandardMaterial color={theme.dots} transparent opacity={0.55} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function NoiseTexture({ W, H, theme }) {
  const patches = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => {
      const seed = i * 173.41 + 11;
      const px = ((seed % (W * 9)) / (W * 9) - 0.5) * W * 0.95;
      const py = ((((seed * 0.517) % (H * 9)) / (H * 9)) - 0.5) * H * 0.92;
      const w  = 0.06 + (i % 5) * 0.04;
      const h2 = 0.06 + (i % 4) * 0.04;
      return { px, py, w, h: h2 };
    });
  }, [W, H]);

  return (
    <>
      {patches.map((p, i) => (
        <mesh key={i} position={[p.px, p.py, -0.109]}>
          <planeGeometry args={[p.w, p.h]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? theme.dots : theme.dotsAlt}
            transparent opacity={0.18}
            roughness={1}
          />
        </mesh>
      ))}
    </>
  );
}

function HexGridTexture({ W, H, theme }) {
  // Render neon grid lines for synthwave/neon theme
  const vLines = 24;
  const hLines = 14;
  return (
    <>
      {Array.from({ length: vLines }).map((_, i) => {
        const x = -W / 2 + i * (W / (vLines - 1));
        return (
          <mesh key={`nv${i}`} position={[x, 0, -0.108]}>
            <planeGeometry args={[0.006, H]} />
            <meshStandardMaterial color="#8800ff" transparent opacity={0.3} roughness={0.5} />
          </mesh>
        );
      })}
      {Array.from({ length: hLines }).map((_, i) => {
        const y = -H / 2 + i * (H / (hLines - 1));
        return (
          <mesh key={`nh${i}`} position={[0, y, -0.108]}>
            <planeGeometry args={[W, 0.006]} />
            <meshStandardMaterial color="#00ffff" transparent opacity={0.2} roughness={0.5} />
          </mesh>
        );
      })}
      {/* Neon accent dots at intersections */}
      {Array.from({ length: vLines }).map((_, vi) =>
        Array.from({ length: hLines }).map((_, hi) => {
          const x = -W / 2 + vi * (W / (vLines - 1));
          const y = -H / 2 + hi * (H / (hLines - 1));
          const isPrimary = vi % 4 === 0 && hi % 4 === 0;
          if (!isPrimary) return null;
          return (
            <mesh key={`nd${vi}-${hi}`} position={[x, y, -0.107]}>
              <circleGeometry args={[0.04, 8]} />
              <meshStandardMaterial color="#ff00ff" transparent opacity={0.8} roughness={0.2} />
            </mesh>
          );
        })
      )}
    </>
  );
}

function BoardTexture({ W, H, theme }) {
  switch (theme.textureType) {
    case 'cork':    return <CorkTexture    W={W} H={H} theme={theme} />;
    case 'grid':    return <GridTexture    W={W} H={H} theme={theme} />;
    case 'ruled':   return <RuledTexture   W={W} H={H} theme={theme} />;
    case 'dots':    return <DotsTexture    W={W} H={H} theme={theme} />;
    case 'noise':   return <NoiseTexture   W={W} H={H} theme={theme} />;
    case 'hexgrid': return <HexGridTexture W={W} H={H} theme={theme} />;
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame — wood / metal / minimal
// ─────────────────────────────────────────────────────────────────────────────
function BoardFrame({ W, H, theme }) {
  const bars = [
    { pos: [0,  H / 2 + 0.32, -0.15], size: [W + 1.28, 0.64, 0.38] },
    { pos: [0, -H / 2 - 0.32, -0.15], size: [W + 1.28, 0.64, 0.38] },
    { pos: [-(W / 2 + 0.32), 0, -0.15], size: [0.64, H + 1.28, 0.38] },
    { pos: [ W / 2 + 0.32, 0, -0.15],  size: [0.64, H + 1.28, 0.38] },
  ];

  // Corner caps (small cubes at frame corners)
  const corners = [
    [-(W / 2 + 0.32),  H / 2 + 0.32, -0.14],
    [ W / 2 + 0.32,   H / 2 + 0.32, -0.14],
    [-(W / 2 + 0.32), -H / 2 - 0.32, -0.14],
    [ W / 2 + 0.32,  -H / 2 - 0.32, -0.14],
  ];

  return (
    <>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.pos} castShadow receiveShadow>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial
            color={theme.frame}
            roughness={theme.frameRough}
            metalness={theme.frameMetal}
          />
        </mesh>
      ))}
      {corners.map((pos, i) => (
        <mesh key={`c${i}`} position={pos} castShadow>
          <boxGeometry args={[0.68, 0.68, 0.42]} />
          <meshStandardMaterial
            color={theme.frame}
            roughness={Math.max(theme.frameRough - 0.1, 0.2)}
            metalness={Math.min(theme.frameMetal + 0.1, 0.6)}
          />
        </mesh>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subtle inner shadow / vignette for depth
// ─────────────────────────────────────────────────────────────────────────────
function BoardVignette({ W, H, theme }) {
  // Four thin dark edges inside the board
  const edges = [
    { pos: [0,  H / 2 - 0.15, -0.107], size: [W, 0.3] },
    { pos: [0, -H / 2 + 0.15, -0.107], size: [W, 0.3] },
    { pos: [-(W / 2 - 0.15), 0, -0.107], size: [0.3, H] },
    { pos: [ W / 2 - 0.15, 0, -0.107],  size: [0.3, H] },
  ];
  return (
    <>
      {edges.map((e, i) => (
        <mesh key={i} position={e.pos}>
          <planeGeometry args={e.size} />
          <meshStandardMaterial color="#000000" transparent opacity={0.18} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Item Renderer
// ─────────────────────────────────────────────────────────────────────────────
function ItemRenderer({ item }) {
  switch (item.type) {
    case 'note':      return <StickyNote    item={item} />;
    case 'code':      return <CodeCard      item={item} />;
    case 'task':      return <TaskCard      item={item} />;
    case 'decision':  return <DecisionCard  item={item} />;
    case 'milestone': return <MilestoneCard item={item} />;
    case 'link':      return <LinkCard      item={item} />;
    case 'section':   return <SectionLabel  item={item} />;
    case 'list':      return <ListCard       item={item} />;
    case 'photo':
    case 'diagram':   return <DiagramCard   item={item} />;
    default: return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CorkBoard
// ─────────────────────────────────────────────────────────────────────────────
export default function CorkBoard({ theme: themeKey = 'cork' }) {
  const items         = useBoardStore((s) => s.items);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const deselect      = useBoardStore((s) => s.deselect);

  const theme = THEMES[themeKey] || THEMES.cork;
  const boardItems = items.filter((i) => i.boardId === activeBoardId);

  const W = 30, H = 17;

  return (
    <group>
      {/* ── Frame ── */}
      <BoardFrame W={W} H={H} theme={theme} />

      {/* ── Board surface ── */}
      <mesh
        name="board-surface"
        position={[0, 0, -0.12]}
        receiveShadow
        onPointerDown={(e) => {
          if (e.object.name === 'board-surface') deselect();
        }}
      >
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          color={theme.surface}
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      {/* Subtle secondary surface layer for depth */}
      <mesh position={[0, 0, -0.118]}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
        <meshStandardMaterial
          color={theme.surfaceAlt}
          roughness={0.96}
          metalness={0.0}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* ── Procedural texture ── */}
      <BoardTexture W={W} H={H} theme={theme} />

      {/* ── Inner vignette for depth ── */}
      <BoardVignette W={W} H={H} theme={theme} />

      {/* ── Pinned Items ── */}
      {boardItems.map((item) => (
        <ItemRenderer key={item.id} item={item} />
      ))}
    </group>
  );
}
