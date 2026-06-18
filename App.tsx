import { Canvas } from '@react-three/fiber';
import { useCallback, useState } from 'react';
import { Scene } from './components/scene/Scene';
import { StartScreen } from './components/ui/StartScreen';
import { ControlGuide } from './components/ui/ControlGuide';

function requestGamePointerLock() {
  const gameRoot = document.getElementById('game-root');
  if (gameRoot && document.pointerLockElement !== gameRoot) {
    gameRoot.requestPointerLock().catch(() => {
      // Browsers can reject pointer lock outside a user gesture. Clicking the canvas again will retry.
    });
  }
}

export default function App() {
  const [started, setStarted] = useState(false);

  const handleStart = useCallback(() => {
    setStarted(true);
    window.setTimeout(requestGamePointerLock, 0);
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (started) requestGamePointerLock();
  }, [started]);

  return (
    <main id="game-root" className="app" onClick={handleCanvasClick}>
      <Canvas
        className="game-canvas"
        camera={{ position: [0, 2.9, 6.8], fov: 58, near: 0.1, far: 120 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene started={started} />
      </Canvas>
      <ControlGuide started={started} />
      {!started ? <StartScreen onStart={handleStart} /> : null}
    </main>
  );
}
