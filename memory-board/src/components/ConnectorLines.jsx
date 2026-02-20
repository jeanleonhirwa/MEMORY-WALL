import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, TubeGeometry, BufferGeometry, LineBasicMaterial, Line } from 'three';
import useBoardStore from '../store/useBoardStore';

/**
 * Renders all connector arrows/lines between board items.
 * Uses CatmullRom curves for smooth arcing lines in 3D space.
 */
function ConnectorLine({ connector, items }) {
  const fromItem = items.find((i) => i.id === connector.fromId);
  const toItem   = items.find((i) => i.id === connector.toId);
  if (!fromItem || !toItem) return null;

  const from = new Vector3(...fromItem.position);
  const to   = new Vector3(...toItem.position);

  // Arc midpoint slightly raised in Z for 3D depth
  const mid = new Vector3(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2,
    Math.max(from.z, to.z) + 0.3
  );

  const points = useMemo(() => {
    const curve = new CatmullRomCurve3([from, mid, to]);
    return curve.getPoints(40);
  }, [fromItem.position, toItem.position]);

  const color = connector.color || '#94a3b8';

  // Arrow head at the end
  const dir = new Vector3().subVectors(to, mid).normalize();
  const arrowPos = to.clone().sub(dir.clone().multiplyScalar(0.15));

  return (
    <group>
      {/* Line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>

      {/* Arrow head (small cone) */}
      <mesh position={arrowPos} rotation={[Math.PI / 2, 0, Math.atan2(dir.x, dir.y)]}>
        <coneGeometry args={[0.06, 0.18, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Label */}
      {connector.label ? (
        <Text
          position={[mid.x, mid.y + 0.15, mid.z + 0.05]}
          fontSize={0.1}
          color={color}
          anchorX="center"
          anchorY="bottom"
          background="#00000044"
        >
          {connector.label}
        </Text>
      ) : null}
    </group>
  );
}

export default function ConnectorLines() {
  const connectors    = useBoardStore((s) => s.connectors);
  const items         = useBoardStore((s) => s.items);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);

  // Only show connectors for items on the active board
  const boardItems = items.filter((i) => i.boardId === activeBoardId);
  const boardConnectors = connectors.filter((c) => {
    const from = boardItems.find((i) => i.id === c.fromId);
    const to   = boardItems.find((i) => i.id === c.toId);
    return from && to;
  });

  return (
    <group>
      {boardConnectors.map((c) => (
        <ConnectorLine key={c.id} connector={c} items={boardItems} />
      ))}
    </group>
  );
}
