import { useState, useEffect } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { TextureLoader } from 'three';
import useItemDrag from '../../hooks/useItemDrag';
import Pin from '../Pin';

function PhotoImage({ url, width, height }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) return;
    const loader = new TextureLoader();
    loader.load(url, (tex) => setTexture(tex), undefined, (err) => {
      console.error('Failed to load image texture:', err);
    });
  }, [url]);

  const imgW = width - 0.2;
  const imgH = height - 0.52;

  if (!texture) {
    return (
      <mesh position={[0, 0.1, 0.006]}>
        <planeGeometry args={[imgW, imgH]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.9} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0.1, 0.006]}>
      <planeGeometry args={[imgW, imgH]} />
      <meshStandardMaterial map={texture} roughness={0.4} />
    </mesh>
  );
}

export default function DiagramCard({ item }) {
  const { imageUrl, caption = '', position, rotation, pinColor, width = 1.8, height = 2.0 } = item;
  const { hovered, isSelected, onPointerDown, onPointerEnter, onPointerLeave } = useItemDrag(item);

  const { pos, rot, scale } = useSpring({
    pos: position, rot: rotation,
    scale: isSelected ? 1.06 : hovered ? 1.03 : 1,
    config: { tension: 200, friction: 22 },
  });

  return (
    <animated.group
      position={pos} rotation={rot} scale={scale}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {/* White photo card */}
      <RoundedBox args={[width, height, 0.045]} radius={0.03} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.7} metalness={0} />
      </RoundedBox>

      {/* Drop shadow */}
      <RoundedBox args={[width + 0.03, height + 0.03, 0.03]} radius={0.04} smoothness={4} position={[0.04, -0.04, -0.012]}>
        <meshStandardMaterial color="#00000022" transparent opacity={0.18} />
      </RoundedBox>

      <PhotoImage url={imageUrl} width={width} height={height} />

      {/* Caption */}
      {caption ? (
        <Text
          position={[0, -(height / 2 - 0.2), 0.03]}
          fontSize={0.1}
          maxWidth={width - 0.2}
          color="#555555"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
        >
          {caption}
        </Text>
      ) : null}

      {/* Pin */}
      <group position={[0, height / 2 - 0.06, 0.05]}>
        <Pin color={pinColor} hovered={hovered} />
      </group>

      {isSelected && (
        <RoundedBox args={[width + 0.1, height + 0.1, 0.04]} radius={0.04} smoothness={4} position={[0, 0, -0.006]}>
          <meshStandardMaterial color="#2196f3" transparent opacity={0.28} />
        </RoundedBox>
      )}
    </animated.group>
  );
}
