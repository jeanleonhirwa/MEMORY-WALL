import { useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import Pin from './Pin';
import useBoardStore from '../store/useBoardStore';

/**
 * A 3D sticky note that can be dragged around the cork board.
 */
export default function PinnedNote({ item }) {
  const { id, text, color, position, rotation, pinColor, width = 1.2, height = 1.2 } = item;
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const { camera, gl, raycaster, size } = useThree();
  const selectedId = useBoardStore((s) => s.selectedId);
  const selectItem = useBoardStore((s) => s.selectItem);
  const deselect = useBoardStore((s) => s.deselect);
  const updateItemPosition = useBoardStore((s) => s.updateItemPosition);
  const bringToFront = useBoardStore((s) => s.bringToFront);

  const isSelected = selectedId === id;

  const { pos, rot, scale } = useSpring({
    pos: position,
    rot: rotation,
    scale: isSelected ? 1.06 : hovered ? 1.03 : 1,
    config: { tension: 200, friction: 22 },
  });

  // Convert screen coords to board plane (z=0) world coords
  const screenToBoard = useCallback(
    (clientX, clientY) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Unproject onto the z=0 plane
      const vector = { x, y, z: 0.5 };
      const vec3 = new (require('three').Vector3)(x, y, 0.5);
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
      {/* Paper body */}
      <RoundedBox args={[width, height, 0.04]} radius={0.04} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.0} />
      </RoundedBox>

      {/* Slight paper edge shadow */}
      <RoundedBox args={[width + 0.02, height + 0.02, 0.03]} radius={0.04} smoothness={4} position={[0.02, -0.02, -0.01]}>
        <meshStandardMaterial color="#00000022" transparent opacity={0.18} />
      </RoundedBox>

      {/* Note text */}
      <Text
        position={[0, 0, 0.03]}
        fontSize={0.13}
        maxWidth={width - 0.25}
        lineHeight={1.4}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        font={undefined}
        textAlign="center"
        overflowWrap="break-word"
      >
        {text}
      </Text>

      {/* Pin at top */}
      <group position={[0, height / 2 - 0.05, 0.04]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {/* Selection outline */}
      {isSelected && (
        <RoundedBox args={[width + 0.08, height + 0.08, 0.035]} radius={0.05} smoothness={4} position={[0, 0, -0.005]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.35} wireframe={false} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
