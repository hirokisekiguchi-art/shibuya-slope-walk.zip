import { useEffect, useRef } from 'react';

export interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}

export function useKeyboardControls() {
  const keys = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  useEffect(() => {
    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'KeyW':
          keys.current.forward = pressed;
          break;
        case 'KeyS':
          keys.current.backward = pressed;
          break;
        case 'KeyA':
          keys.current.left = pressed;
          break;
        case 'KeyD':
          keys.current.right = pressed;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = pressed;
          break;
        default:
          break;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => setKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => setKey(event, false);

    globalThis.addEventListener('keydown', handleKeyDown);
    globalThis.addEventListener('keyup', handleKeyUp);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      globalThis.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
