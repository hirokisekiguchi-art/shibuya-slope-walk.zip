import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { colors } from '../../data/colors';

interface CloudProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}

function Cloud({ position, scale = 1, speed = 0.02 }: CloudProps) {
  const ref = useRef<THREE.Group>(null);
  const startX = position[0];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const drift = ((clock.elapsedTime * speed + startX * 0.01) % 1) * 12;
    ref.current.position.x = startX + drift;
    if (ref.current.position.x > 16) ref.current.position.x = -16;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3.8, 0.42]} />
        <meshBasicMaterial color={colors.cloud} side={THREE.DoubleSide} transparent opacity={0.88} />
      </mesh>
      <mesh position={[-1.15, 0.13, 0.01]}>
        <planeGeometry args={[1.5, 0.26]} />
        <meshBasicMaterial color={colors.cloud} side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>
      <mesh position={[1.18, -0.07, 0.01]} rotation={[0, 0, -0.08]}>
        <planeGeometry args={[1.7, 0.22]} />
        <meshBasicMaterial color={colors.cloudShadow} side={THREE.DoubleSide} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function SkyStroke({ position, width, rotation = 0 }: { position: [number, number, number]; width: number; rotation?: number }) {
  return (
    <mesh position={position} rotation={[0, 0, rotation]}>
      <planeGeometry args={[width, 0.055]} />
      <meshBasicMaterial color={colors.skyDeep} side={THREE.DoubleSide} transparent opacity={0.28} />
    </mesh>
  );
}

export function Sky() {
  return (
    <group>
      <Cloud position={[-11, 9, -34]} scale={1.1} speed={0.012} />
      <Cloud position={[-2, 12, -46]} scale={1.45} speed={0.009} />
      <Cloud position={[8, 8.5, -56]} scale={1.25} speed={0.01} />
      <Cloud position={[-13, 6.8, -63]} scale={0.9} speed={0.015} />
      <SkyStroke position={[-5, 7.2, -38]} width={3.2} rotation={0.08} />
      <SkyStroke position={[6.4, 10.4, -50]} width={4.4} rotation={-0.04} />
      <SkyStroke position={[0.5, 5.7, -58]} width={2.4} rotation={0.14} />
    </group>
  );
}
