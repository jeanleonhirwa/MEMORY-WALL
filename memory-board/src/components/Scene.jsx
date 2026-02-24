import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Vector2 } from 'three';
import CorkBoard from './CorkBoard';
import ConnectorLines from './ConnectorLines';
import useBoardStore from '../store/useBoardStore';
import { THEMES } from './CorkBoard';

// ─────────────────────────────────────────────────────────────────────────────
// Pan + Zoom camera — no rotation, just pan & scroll-zoom
//
// Controls (non-conflicting with item drag):
//   • Scroll wheel          → zoom toward mouse cursor
//   • Space + drag          → pan (Figma/Miro style)
//   • Middle-mouse drag     → pan
//   • Right-click drag      → pan
// ─────────────────────────────────────────────────────────────────────────────
// Board half-extents in world units (items are clamped to ±14 x ±8)
const BOARD_HALF_W = 14;
const BOARD_HALF_H = 8;
const Z_MIN = 4;
const Z_MAX = 22;

// How far the camera can pan at a given zoom level.
// At Z_MIN (zoomed in close) → full board range.
// At Z_MAX (zoomed all the way out) → 0 (perfectly centred).
const panLimit = (z) => {
  const t = (z - Z_MIN) / (Z_MAX - Z_MIN); // 0 at close, 1 at far
  return {
    x: BOARD_HALF_W * (1 - t),
    y: BOARD_HALF_H * (1 - t),
  };
};

const clampCamera = (cam) => {
  const lim = panLimit(cam.position.z);
  cam.position.x = Math.max(-lim.x, Math.min(lim.x, cam.position.x));
  cam.position.y = Math.max(-lim.y, Math.min(lim.y, cam.position.y));
};

function PanZoomCamera() {
  const { camera, gl } = useThree();
  const isPanning  = useRef(false);
  const spaceHeld  = useRef(false);
  const lastMouse  = useRef(new Vector2());

  useEffect(() => {
    const canvas = gl.domElement;

    // ── Zoom toward mouse cursor ──────────────────────────────────────────
    const onWheel = (e) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      const ny = -((e.clientY - rect.top)  / rect.height) *  2 + 1;

      const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);
      const aspect = rect.width / rect.height;

      // World position under the mouse BEFORE zoom
      const beforeX = camera.position.x + nx * camera.position.z * tanHalfFov * aspect;
      const beforeY = camera.position.y + ny * camera.position.z * tanHalfFov;

      // Apply zoom
      const zoomFactor = 1 + e.deltaY * 0.001;
      const newZ = Math.max(Z_MIN, Math.min(Z_MAX, camera.position.z * zoomFactor));
      camera.position.z = newZ;

      // World position under the mouse AFTER zoom
      const afterX = camera.position.x + nx * newZ * tanHalfFov * aspect;
      const afterY = camera.position.y + ny * newZ * tanHalfFov;

      // Shift camera so the point under cursor stays fixed, then clamp
      camera.position.x += beforeX - afterX;
      camera.position.y += beforeY - afterY;
      clampCamera(camera);
    };

    // ── Start pan: Space+LMB, middle-mouse, or right-click ───────────────
    const onMouseDown = (e) => {
      const isSpacePan  = spaceHeld.current && e.button === 0;
      const isMiddle    = e.button === 1;
      const isRight     = e.button === 2;

      if (isSpacePan || isMiddle || isRight) {
        isPanning.current = true;
        lastMouse.current.set(e.clientX, e.clientY);
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation(); // prevent item-drag from firing when space is held
      }
    };

    const onMouseMove = (e) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current.set(e.clientX, e.clientY);

      const rect = canvas.getBoundingClientRect();
      const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);
      const aspect = rect.width / rect.height;
      // Scale pan to world units so it feels 1:1 with the cursor
      const scaleX = (2 * camera.position.z * tanHalfFov * aspect) / rect.width;
      const scaleY = (2 * camera.position.z * tanHalfFov) / rect.height;

      camera.position.x -= dx * scaleX;
      camera.position.y += dy * scaleY;
      clampCamera(camera);
    };

    const onMouseUp = () => {
      isPanning.current = false;
      canvas.style.cursor = spaceHeld.current ? 'grab' : 'auto';
    };

    // ── Space key: show grab cursor, block item-drag ──────────────────────
    const onKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return; // let inputs type spaces
        spaceHeld.current = true;
        canvas.style.cursor = 'grab';
        e.preventDefault(); // prevent page scroll
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        spaceHeld.current = false;
        if (!isPanning.current) canvas.style.cursor = 'auto';
      }
    };

    const onContextMenu = (e) => e.preventDefault();

    canvas.addEventListener('wheel',       onWheel,       { passive: false });
    canvas.addEventListener('mousedown',   onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove',   onMouseMove);
    window.addEventListener('mouseup',     onMouseUp);
    window.addEventListener('keydown',     onKeyDown);
    window.addEventListener('keyup',       onKeyUp);

    return () => {
      canvas.removeEventListener('wheel',       onWheel);
      canvas.removeEventListener('mousedown',   onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove',   onMouseMove);
      window.removeEventListener('mouseup',     onMouseUp);
      window.removeEventListener('keydown',     onKeyDown);
      window.removeEventListener('keyup',       onKeyUp);
    };
  }, [camera, gl]);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-theme lighting configuration
// ─────────────────────────────────────────────────────────────────────────────
const THEME_LIGHTING = {
  cork: {
    ambient:   { intensity: 0.70, color: '#fff8f0' },
    primary:   { intensity: 1.45, color: '#fff5e8', position: [6, 9, 7] },
    fill1:     { intensity: 0.50, color: '#ffe0b2', position: [-7, 4, 5] },
    fill2:     { intensity: 0.25, color: '#d4a96a', position: [4, -4, 4] },
    env:       'apartment',
    shadowOpacity: 0.35,
  },
  dark: {
    ambient:   { intensity: 0.22, color: '#9090ff' },
    primary:   { intensity: 0.80, color: '#c8c8ff', position: [4, 8, 6] },
    fill1:     { intensity: 0.35, color: '#4040ff', position: [-6, 3, 5] },
    fill2:     { intensity: 0.20, color: '#8080ff', position: [0, -5, 4] },
    env:       'night',
    shadowOpacity: 0.60,
  },
  blueprint: {
    ambient:   { intensity: 0.40, color: '#b8d8ff' },
    primary:   { intensity: 1.10, color: '#d0e8ff', position: [5, 8, 6] },
    fill1:     { intensity: 0.45, color: '#4488bb', position: [-6, 3, 5] },
    fill2:     { intensity: 0.20, color: '#2255aa', position: [3, -4, 4] },
    env:       'city',
    shadowOpacity: 0.45,
  },
  whiteboard: {
    ambient:   { intensity: 0.90, color: '#ffffff' },
    primary:   { intensity: 1.60, color: '#ffffff', position: [3, 10, 8] },
    fill1:     { intensity: 0.60, color: '#f0f4ff', position: [-8, 4, 6] },
    fill2:     { intensity: 0.30, color: '#e8f0ff', position: [5, -3, 5] },
    env:       'studio',
    shadowOpacity: 0.15,
  },
  midnight: {
    ambient:   { intensity: 0.18, color: '#8888ff' },
    primary:   { intensity: 0.70, color: '#aaaaff', position: [4, 8, 6] },
    fill1:     { intensity: 0.40, color: '#4444cc', position: [-5, 3, 5] },
    fill2:     { intensity: 0.22, color: '#6644ff', position: [2, -5, 4] },
    env:       'night',
    shadowOpacity: 0.70,
  },
  forest: {
    ambient:   { intensity: 0.45, color: '#90c890' },
    primary:   { intensity: 1.10, color: '#c8ffb8', position: [5, 9, 7] },
    fill1:     { intensity: 0.50, color: '#228822', position: [-6, 3, 5] },
    fill2:     { intensity: 0.28, color: '#44aa44', position: [3, -4, 4] },
    env:       'forest',
    shadowOpacity: 0.40,
  },
  slate: {
    ambient:   { intensity: 0.38, color: '#aab8cc' },
    primary:   { intensity: 1.00, color: '#ccd8e8', position: [5, 8, 7] },
    fill1:     { intensity: 0.42, color: '#6688aa', position: [-6, 3, 5] },
    fill2:     { intensity: 0.22, color: '#445566', position: [3, -4, 4] },
    env:       'city',
    shadowOpacity: 0.45,
  },
  paper: {
    ambient:   { intensity: 0.85, color: '#fff8ec' },
    primary:   { intensity: 1.50, color: '#fffaf0', position: [4, 10, 8] },
    fill1:     { intensity: 0.55, color: '#f0e8d8', position: [-7, 4, 6] },
    fill2:     { intensity: 0.25, color: '#e8dcc8', position: [4, -3, 5] },
    env:       'apartment',
    shadowOpacity: 0.18,
  },
  neon: {
    ambient:   { intensity: 0.12, color: '#ff00ff' },
    primary:   { intensity: 0.60, color: '#00ffff', position: [4, 7, 6] },
    fill1:     { intensity: 0.50, color: '#ff00ff', position: [-6, 3, 5] },
    fill2:     { intensity: 0.40, color: '#8800ff', position: [2, -5, 4] },
    env:       'night',
    shadowOpacity: 0.80,
  },
};

// Fallback for unknown themes
const DEFAULT_LIGHTING = THEME_LIGHTING.cork;

export default function Scene() {
  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const activeBoard   = boards.find((b) => b.id === activeBoardId) || boards[0];
  const themeKey      = activeBoard?.theme || 'cork';

  const theme   = THEMES[themeKey]         || THEMES.cork;
  const light   = THEME_LIGHTING[themeKey] || DEFAULT_LIGHTING;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 12], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: theme.bgColor }}
    >
      {/* ── Ambient ── */}
      <ambientLight intensity={light.ambient.intensity} color={light.ambient.color} />

      {/* ── Primary directional (key light + shadows) ── */}
      <directionalLight
        position={light.primary.position}
        intensity={light.primary.intensity}
        color={light.primary.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />

      {/* ── Fill lights ── */}
      <pointLight position={light.fill1.position} intensity={light.fill1.intensity} color={light.fill1.color} />
      <pointLight position={light.fill2.position} intensity={light.fill2.intensity} color={light.fill2.color} />

      {/* ── Contact shadows on board surface ── */}
      <ContactShadows
        position={[0, -7, 0]}
        opacity={light.shadowOpacity}
        scale={35}
        blur={2.8}
        far={10}
      />

      {/* ── Camera controller ── */}
      <PanZoomCamera />

      {/* ── Scene content ── */}
      <Suspense fallback={null}>
        <CorkBoard theme={themeKey} />
        <ConnectorLines />
      </Suspense>
    </Canvas>
  );
}
