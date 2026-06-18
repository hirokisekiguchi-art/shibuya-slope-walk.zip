import * as THREE from 'three';

export const ROAD_MIN_Z = -55;
export const ROAD_MAX_Z = 4;
export const ROAD_HALF_WIDTH = 2.35;
export const WALKABLE_HALF_WIDTH = 4.4;

export function slopeHeight(z: number): number {
  const clampedZ = THREE.MathUtils.clamp(z, ROAD_MIN_Z, ROAD_MAX_Z);
  return clampedZ * 0.052;
}

export function roadCenterX(z: number): number {
  const t = (z + 7) * 0.125;
  return Math.sin(t) * 1.55 + Math.sin(t * 0.47) * 0.75;
}

export function roadYaw(z: number): number {
  const ahead = roadCenterX(z - 0.5);
  const behind = roadCenterX(z + 0.5);
  return Math.atan2(ahead - behind, -1);
}

export function clampToWalkableStreet(position: THREE.Vector3): THREE.Vector3 {
  position.z = THREE.MathUtils.clamp(position.z, ROAD_MIN_Z + 1.5, ROAD_MAX_Z - 0.5);
  const center = roadCenterX(position.z);
  position.x = THREE.MathUtils.clamp(position.x, center - WALKABLE_HALF_WIDTH, center + WALKABLE_HALF_WIDTH);
  position.y = slopeHeight(position.z);
  return position;
}
