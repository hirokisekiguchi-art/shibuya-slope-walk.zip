import { useRef } from 'react';

export function useCameraControls(_enabled: boolean) {
  const yaw = useRef(0);
  const pitch = useRef(-0.05);
  return { yaw, pitch };
}
