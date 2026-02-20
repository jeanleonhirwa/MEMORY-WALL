import { useRef, useState, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { Vector3, TextureLoader } from 'three';
import Pin from './Pin';
import useBoardStore from '../store/useBoardStore';

/**
 * The actual photo texture mesh — loads texture imperatively to support data URLs
 */
function PhotoImage({ url, width, height }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    const loader = new TextureLoader();
    loader.load(
      url,
      (tex) => {
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error('Failed to load photo texture:', err);
      }
    );
  }, [url]);

  if (!texture) {
    // Placeholder while loading
    return (
      <mesh position={[0, 0.08, 0.005]}>
        <planeGeometry args={[width - 0.2, height - 0.45]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.9} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0.08, 0.006]}>
      <planeGeometry args={[width - 0.2, height - 0.45]} />
      <meshStandardMaterial map={texture} roughness={0.5} />
    </mesh>
  );
}

/**
 * A 3D photo card pinned to the cork board, draggable and interactive.
 */
export default function PinnedPhoto({ item }) {
  const { id, imageUrl, caption, position, rotation, pinColor, width = 1.4, height = 1.6 } = item;
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const { camera, gl } = useThree();
  const selectedId = useBoardStore((s) => s.selectedId);
  const selectItem = useBoardStore((s) => s.selectItem);
  const updateItemPosition = useBoardStore((s) => s.updateItemPosition);
  const bringToFront = useBoardStore((s) => s.bringToFront);

  const isSelected = selectedId === id;

  const { pos, rot, scale } = useSpring({
    pos: position,
    rot: rotation,
    scale: isSelected ? 1.06 : hovered ? 1.03 : 1,
    config: { tension: 200, friction: 22 },
  });

  const screenToBoard = useCallback(
    (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      const vec3 = new Vector3(x, y, 0.5);
      vec3.unproject(camera);
      const dir = vec3.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    },
    [camera, gl]
  );

  const dragOffset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      selectItem(id);
      bringToFront(id);
      setDragging(true);
      gl.domElement.style.cursor = 'grabbing';

      const worldPos = screenToBoard(e.clientX, e.clientY);
      dragOffset.current = {
        x: position[0] - worldPos.x,
        y: position[1] - worldPos.y,
      };

      const onMove = (ev) => {
        const wp = screenToBoard(ev.clientX, ev.clientY);
        const clampedX = Math.max(-7, Math.min(7, wp.x + dragOffset.current.x));
        const clampedY = Math.max(-4, Math.min(4, wp.y + dragOffset.current.y));
        updateItemPosition(id, [clampedX, clampedY, position[2]]);
      };

      const onUp = () => {
        setDragging(false);
        gl.domElement.style.cursor = 'auto';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [id, position, selectItem, bringToFront, updateItemPosition, screenToBoard, gl]
  );

  return (
    <animated.group
      position={pos}
      rotation={rot}
      scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={() => { setHovered(true); gl.domElement.style.cursor = 'grab'; }}
      onPointerLeave={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = 'auto'; }}
    >
      {/* White photo card background */}
      <RoundedBox args={[width, height, 0.04]} radius={0.03} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0.0} />
      </RoundedBox>

      {/* Drop shadow */}
      <RoundedBox args={[width + 0.02, height + 0.02, 0.03]} radius={0.04} smoothness={4} position={[0.03, -0.03, -0.01]}>
        <meshStandardMaterial color="#00000033" transparent opacity={0.2} />
      </RoundedBox>

      {/* Photo image */}
      <PhotoImage url={imageUrl} width={width} height={height} />

      {/* Caption text at bottom */}
      {caption ? (
        <Text
          position={[0, -(height / 2 - 0.2), 0.03]}
          fontSize={0.1}
          maxWidth={width - 0.2}
          color="#444444"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {caption}
        </Text>
      ) : null}

      {/* Pin at top */}
      <group position={[0, height / 2 - 0.06, 0.04]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {/* Selection outline */}
      {isSelected && (
        <RoundedBox args={[width + 0.08, height + 0.08, 0.035]} radius={0.04} smoothness={4} position={[0, 0, -0.005]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.35} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
