import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Vector2 } from 'three';
import CorkBoard from './CorkBoard';
import ConnectorLines from './ConnectorLines';
import useBoardStore from '../store/useBoardStore';
import { THEMES } from './CorkBoard';

// ─────────────────────────────────────────────────────────────────────────────
// Pan + Zoom camera — no rotation, just pan & scroll-zoom
// ─────────────────────────────────────────────────────────────────────────────
function PanZoomCamera() {
  const { camera, gl } = useThree();
  const isPanning = useRef(false);
  const lastMouse = useRef(new Vector2());

  useEffect(() => {
    const canvas = gl.domElement;

    const onWheel = (e) => {
      e.preventDefault();
      const zoomSpeed = 0.001;
      camera.position.z = Math.max(4, Math.min(22, camera.position.z + e.deltaY * zoomSpeed * camera.position.z));
    };

    const onMouseDown = (e) => {
      if (e.button === 1 || e.button === 2 || e.altKey) {
        isPanning.current = true;
        lastMouse.current.set(e.clientX, e.clientY);
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const onMouseMove = (e) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current.set(e.clientX, e.clientY);
      const panSpeed = camera.position.z * 0.0012;
      camera.position.x -= dx * panSpeed;
      camera.position.y += dy * panSpeed;
    };

    const onMouseUp = () => {
      isPanning.current = false;
      canvas.style.cursor = 'auto';
    };

    const onContextMenu = (e) => e.preventDefault();

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', onContextMenu);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
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

      {/* ── Environment map for reflections ── */}
      <Suspense fallback={null}>
        <Environment preset={light.env} />
      </Suspense>

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
