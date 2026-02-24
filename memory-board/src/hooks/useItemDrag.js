import { useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import useBoardStore from '../store/useBoardStore';

/**
 * Shared drag logic for all board items.
 * Returns { hovered, dragging, isSelected, springs-ready props, onPointerDown, onPointerEnter, onPointerLeave }
 */
export default function useItemDrag(item) {
  const { id, position } = item;
  const { camera, gl } = useThree();
  const selectedId  = useBoardStore((s) => s.selectedId);
  const selectItem  = useBoardStore((s) => s.selectItem);
  const bringToFront = useBoardStore((s) => s.bringToFront);
  const updateItemPosition = useBoardStore((s) => s.updateItemPosition);
  const connectorMode = useBoardStore((s) => s.connectorMode);
  const finishConnector = useBoardStore((s) => s.finishConnector);
  const connectorSourceId = useBoardStore((s) => s.connectorSourceId);

  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isSelected = selectedId === id;
  const isConnectorSource = connectorSourceId === id;

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

  const startConnector  = useBoardStore((s) => s.startConnector);

  const onPointerDown = useCallback(
    (e) => {
      e.stopPropagation();

      // Ctrl+click → start or finish a rope connection
      if (e.ctrlKey || e.metaKey) {
        if (connectorMode) {
          finishConnector(id);
        } else {
          startConnector(id);
        }
        return;
      }

      // Connector mode active but no ctrl — clicking an item finishes the connection
      if (connectorMode) {
        finishConnector(id);
        return;
      }

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
        const clampedX = Math.max(-14, Math.min(14, wp.x + dragOffset.current.x));
        const clampedY = Math.max(-8, Math.min(8, wp.y + dragOffset.current.y));
        updateItemPosition(id, [clampedX, clampedY, position[2]]);
      };

      const onUp = () => {
        setDragging(false);
        gl.domElement.style.cursor = hovered ? 'grab' : 'auto';
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [id, position, selectItem, bringToFront, updateItemPosition, screenToBoard, gl, connectorMode, finishConnector, startConnector, hovered]
  );

  const onPointerEnter = useCallback(() => {
    setHovered(true);
    gl.domElement.style.cursor = connectorMode ? 'cell' : 'grab';
  }, [gl, connectorMode]);

  const onPointerLeave = useCallback(() => {
    setHovered(false);
    if (!dragging) gl.domElement.style.cursor = 'auto';
  }, [dragging, gl]);

  return { hovered, dragging, isSelected, isConnectorSource, onPointerDown, onPointerEnter, onPointerLeave };
}
