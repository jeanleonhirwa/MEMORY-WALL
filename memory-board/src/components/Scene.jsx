import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import CorkBoard from './CorkBoard';
import ConnectorLines from './ConnectorLines';
import useBoardStore from '../store/useBoardStore';
import { Vector2, Vector3 } from 'three';

/**
 * Pan-only camera controller — no rotation, just pan + zoom via wheel.
 * Middle-mouse or right-click drag pans. Scroll wheel zooms.
 */
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
      // Middle mouse (button 1) or right click (button 2) or space+left = pan
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

      // Scale pan by zoom level
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

/**
 * Resolves board theme color from board settings.
 */
const THEME_BG = {
  cork:       '#1a1a2e',
  dark:       '#0a0a12',
  blueprint:  '#061525',
  whiteboard: '#e8e8e8',
};

export default function Scene() {
  const boards       = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const activeBoard  = boards.find((b) => b.id === activeBoardId) || boards[0];
  const theme        = activeBoard?.theme || 'cork';
  const bg           = THEME_BG[theme] || THEME_BG.cork;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 12], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: bg }}
    >
      {/* Lights */}
      <ambientLight intensity={theme === 'dark' ? 0.35 : 0.65} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={theme === 'dark' ? 0.9 : 1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <pointLight position={[-6, 4, 5]} intensity={0.4} color="#ffe0b2" />
      <pointLight position={[0, -5, 3]} intensity={0.2} color="#b3d9ff" />

      <Suspense fallback={null}>
        <Environment preset="apartment" />
      </Suspense>

      <ContactShadows position={[0, -6, 0]} opacity={0.3} scale={30} blur={2.5} far={8} />

      {/* Pan + zoom camera controller */}
      <PanZoomCamera />

      {/* Board + items */}
      <Suspense fallback={null}>
        <CorkBoard theme={theme} />
        <ConnectorLines />
      </Suspense>
    </Canvas>
  );
}
