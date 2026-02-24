import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, TubeGeometry } from 'three';
import useBoardStore from '../store/useBoardStore';

// ── Compute world-space pin position for any item type ───────────────────────
function getPinPosition(item) {
  const [x, y, z] = item.position;
  const height = item.height ?? 1.5;
  // Pin is always at local [0, height/2 - 0.05, 0.06] in item space
  // Items have small rotations but for rope attachment we use unrotated world pos
  // (the visual difference is negligible at card scale)
  return new Vector3(x, y + height / 2 - 0.05, z + 0.06);
}

// ── Rope color palette (one per connector, cycling) ──────────────────────────
const ROPE_COLORS = [
  '#e8c97a', // warm twine
  '#f4a261', // orange thread
  '#90e0ef', // blue string
  '#f48fb1', // pink yarn
  '#a8dadc', // teal cord
  '#b5ead7', // mint rope
  '#ff9aa2', // coral thread
  '#c3b1e1', // lavender
];

// Build a catenary-sag curve between two 3D points
function buildRopeCurve(from, to, sagFactor = 1) {
  const mid = new Vector3(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2 - sagFactor,   // sag downward
    Math.max(from.z, to.z) + 0.25,     // slightly above cards
  );
  // Extra control points for natural S-curve drape
  const q1 = new Vector3(
    from.x * 0.65 + mid.x * 0.35,
    from.y * 0.65 + mid.y * 0.35 - sagFactor * 0.3,
    mid.z,
  );
  const q2 = new Vector3(
    to.x * 0.65 + mid.x * 0.35,
    to.y * 0.65 + mid.y * 0.35 - sagFactor * 0.3,
    mid.z,
  );
  return new CatmullRomCurve3([from, q1, mid, q2, to], false, 'catmullrom', 0.5);
}

// ── Single rope component ────────────────────────────────────────────────────
function RopeConnector({ connector, items, colorIndex }) {
  const fromItem = items.find((i) => i.id === connector.fromId);
  const toItem   = items.find((i) => i.id === connector.toId);
  if (!fromItem || !toItem) return null;

  const selectConnector = useBoardStore((s) => s.selectConnector);
  const deselect        = useBoardStore((s) => s.deselect);
  const selectedConnectorId = useBoardStore((s) => s.selectedConnectorId);
  const isSelected = selectedConnectorId === connector.id;

  const from = getPinPosition(fromItem);
  const to   = getPinPosition(toItem);

  // Sag = proportional to horizontal distance, capped
  const dist = from.distanceTo(to);
  const sag  = Math.min(0.6 + dist * 0.06, 1.6);

  const { tubeGeo, hitPoints, midPoint } = useMemo(() => {
    const curve    = buildRopeCurve(from, to, sag);
    const tubeGeo  = new TubeGeometry(curve, 32, isSelected ? 0.028 : 0.018, 6, false);
    const hitPoints = curve.getPoints(20);
    const midPoint  = curve.getPoint(0.5);
    return { tubeGeo, hitPoints, midPoint };
  }, [fromItem.position, toItem.position, isSelected]);

  const ropeColor = connector.color || ROPE_COLORS[colorIndex % ROPE_COLORS.length];

  // Invisible wide hit tube for easy clicking
  const hitCurve   = useMemo(() => buildRopeCurve(from, to, sag), [fromItem.position, toItem.position]);
  const hitGeo     = useMemo(() => new TubeGeometry(hitCurve, 20, 0.12, 4, false), [hitCurve]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      deselect();
    } else {
      selectConnector(connector.id);
    }
  };

  return (
    <group>
      {/* Visible rope tube */}
      <mesh geometry={tubeGeo} onClick={handleClick}>
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : ropeColor}
          roughness={0.85}
          metalness={0.0}
          emissive={isSelected ? ropeColor : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : 0}
        />
      </mesh>

      {/* Invisible fat hit area — much easier to click */}
      <mesh geometry={hitGeo} onClick={handleClick} visible={false}>
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Knot sphere sitting on top of each pin head */}
      <mesh position={[from.x, from.y, from.z + 0.04]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color={ropeColor} roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh position={[to.x, to.y, to.z + 0.04]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshStandardMaterial color={ropeColor} roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Selection glow ring at midpoint */}
      {isSelected && (
        <mesh position={midPoint.toArray()}>
          <torusGeometry args={[0.12, 0.025, 8, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.2}
            transparent opacity={0.85}
          />
        </mesh>
      )}

      {/* Label */}
      {connector.label ? (
        <Text
          position={[midPoint.x, midPoint.y + 0.2, midPoint.z + 0.05]}
          fontSize={0.11}
          color={ropeColor}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
        >
          {connector.label}
        </Text>
      ) : null}

      {/* Selected: show "×" delete hint above rope */}
      {isSelected && (
        <Text
          position={[midPoint.x, midPoint.y + 0.32, midPoint.z + 0.05]}
          fontSize={0.13}
          color="#ff5555"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          Press Delete to remove
        </Text>
      )}
    </group>
  );
}

// ── Container ────────────────────────────────────────────────────────────────
export default function ConnectorLines() {
  const connectors    = useBoardStore((s) => s.connectors);
  const items         = useBoardStore((s) => s.items);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);

  const boardItems = items.filter((i) => i.boardId === activeBoardId);
  const boardConnectors = connectors.filter((c) => {
    const from = boardItems.find((i) => i.id === c.fromId);
    const to   = boardItems.find((i) => i.id === c.toId);
    return from && to;
  });

  return (
    <group>
      {boardConnectors.map((c, idx) => (
        <RopeConnector key={c.id} connector={c} items={boardItems} colorIndex={idx} />
      ))}
    </group>
  );
}
