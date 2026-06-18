import { Canvas, useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const colors = {
  sky: '#9FE3DD',
  skyDeep: '#7EC7C4',
  cloud: '#D7F3EC',
  road: '#6F8F8B',
  roadPatch: '#789D98',
  sidewalk: '#B8B5A3',
  curb: '#D4D0BC',
  buildingBeige: '#BDB79F',
  buildingGrey: '#A8ADA2',
  buildingGreen: '#7BA06F',
  buildingCream: '#C9C0A4',
  buildingBlueGrey: '#9BB2AC',
  signOrange: '#D99A3A',
  coneOrange: '#D98235',
  vendingMint: '#75B9A7',
  vendingPanel: '#E7EFE8',
  whiteLine: '#F3F2E8',
  outline: '#2F3435',
  shirt: '#202629',
  pants: '#60694D',
  shoes: '#D98235',
  bag: '#475452',
  bodyTone: '#B88984',
  hair: '#252A32',
};

const ROAD_MIN_Z = -55;
const ROAD_MAX_Z = 4;
const WALKABLE_HALF_WIDTH = 4.25;

type Vec3 = [number, number, number];
type Building = { id: string; side: 'left' | 'right'; z: number; width: number; height: number; depth: number; color: string; yaw: number; sign: string };

function slopeHeight(z: number) {
  return THREE.MathUtils.clamp(z, ROAD_MIN_Z, ROAD_MAX_Z) * 0.052;
}

function roadCenterX(z: number) {
  const t = (z + 7) * 0.125;
  return Math.sin(t) * 1.55 + Math.sin(t * 0.47) * 0.75;
}

function roadYaw(z: number) {
  return Math.atan2(roadCenterX(z - 0.5) - roadCenterX(z + 0.5), -1);
}

function keepOnStreet(position: THREE.Vector3) {
  position.z = THREE.MathUtils.clamp(position.z, ROAD_MIN_Z + 1.5, ROAD_MAX_Z - 0.5);
  const center = roadCenterX(position.z);
  position.x = THREE.MathUtils.clamp(position.x, center - WALKABLE_HALF_WIDTH, center + WALKABLE_HALF_WIDTH);
  position.y = slopeHeight(position.z);
}

function ToonBox({ size, color, position, rotation = [0, 0, 0], outline = true }: { size: Vec3; color: string; position?: Vec3; rotation?: Vec3; outline?: boolean }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshToonMaterial color={color} />
      {outline ? <Edges color={colors.outline} threshold={15} /> : null}
    </mesh>
  );
}

function ToonSphere({ radius, color, position }: { radius: number; color: string; position: Vec3 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 16, 12]} />
      <meshToonMaterial color={color} />
      <Edges color={colors.outline} threshold={15} />
    </mesh>
  );
}

const buildings: Building[] = [
  { id: 'l1', side: 'left', z: -2, width: 3.5, height: 4.1, depth: 4.6, color: colors.buildingBeige, yaw: -0.1, sign: colors.signOrange },
  { id: 'r1', side: 'right', z: -5, width: 3.8, height: 5.2, depth: 4.2, color: colors.buildingGrey, yaw: 0.14, sign: colors.buildingGreen },
  { id: 'l2', side: 'left', z: -9, width: 4.4, height: 6.0, depth: 4.0, color: colors.buildingCream, yaw: 0.08, sign: '#79A7A1' },
  { id: 'r2', side: 'right', z: -12, width: 3.5, height: 4.4, depth: 3.8, color: colors.buildingGreen, yaw: -0.08, sign: colors.signOrange },
  { id: 'l3', side: 'left', z: -17, width: 3.7, height: 7.0, depth: 4.7, color: colors.buildingBlueGrey, yaw: -0.2, sign: '#AEBE77' },
  { id: 'r3', side: 'right', z: -20, width: 4.3, height: 5.0, depth: 4.1, color: colors.buildingBeige, yaw: 0.12, sign: '#76A0B4' },
  { id: 'l4', side: 'left', z: -25, width: 4.2, height: 4.8, depth: 4.2, color: '#B5BBA9', yaw: 0.12, sign: colors.signOrange },
  { id: 'r4', side: 'right', z: -28, width: 4.4, height: 7.2, depth: 4.5, color: '#A7B09B', yaw: -0.18, sign: '#D1B26A' },
  { id: 'l5', side: 'left', z: -34, width: 3.8, height: 5.4, depth: 4.2, color: '#B9B2A1', yaw: -0.04, sign: '#6A9E9A' },
  { id: 'r5', side: 'right', z: -37, width: 4.6, height: 6.8, depth: 4.2, color: '#9FA9A4', yaw: 0.1, sign: colors.signOrange },
  { id: 'l6', side: 'left', z: -43, width: 4.6, height: 6.4, depth: 4.0, color: '#B4B99D', yaw: 0.18, sign: '#7AA79E' },
  { id: 'r6', side: 'right', z: -46, width: 3.9, height: 4.9, depth: 4.0, color: '#C4BDA4', yaw: -0.12, sign: '#D1943D' },
];

function BuildingBlock({ config }: { config: Building }) {
  const sideSign = config.side === 'left' ? -1 : 1;
  const x = roadCenterX(config.z) + sideSign * 5.8;
  const y = slopeHeight(config.z) + config.height / 2;
  const signRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (signRef.current) signRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.4 + config.z) * 0.025;
  });

  const windowRows = Math.max(2, Math.floor(config.height / 1.4));
  const windows = Array.from({ length: windowRows }, (_, row) => row);

  return (
    <group position={[x, y, config.z]} rotation={[0, config.yaw, 0]}>
      <ToonBox size={[config.width, config.height, config.depth]} color={config.color} position={[0, 0, 0]} />
      {windows.map((row) => (
        <group key={row} position={[sideSign * -0.03, -config.height / 2 + 1.1 + row * 1.05, sideSign * -config.depth / 2 - 0.03]}>
          <ToonBox size={[0.7, 0.45, 0.05]} color="#DDE9E2" position={[-0.65, 0, 0]} outline={false} />
          <ToonBox size={[0.7, 0.45, 0.05]} color="#DDE9E2" position={[0.65, 0, 0]} outline={false} />
        </group>
      ))}
      <ToonBox size={[1.15, 0.9, 0.08]} color="#5B6865" position={[0, -config.height / 2 + 0.45, sideSign * -config.depth / 2 - 0.07]} />
      <group ref={signRef} position={[sideSign * -1.05, 0.35, sideSign * -config.depth / 2 - 0.16]}>
        <ToonBox size={[1.35, 0.55, 0.08]} color={config.sign} position={[0, 0, 0]} />
        <ToonBox size={[0.55, 0.07, 0.09]} color={colors.outline} position={[0.02, 0.02, sideSign * 0.06]} outline={false} />
        <ToonBox size={[0.25, 0.07, 0.09]} color={colors.outline} position={[-0.35, -0.14, sideSign * 0.06]} outline={false} />
      </group>
      <ToonBox size={[1.55, 0.15, 0.46]} color="#6B746D" position={[0, -config.height / 2 + 1.02, sideSign * -config.depth / 2 - 0.21]} />
      <ToonBox size={[0.12, config.height * 0.65, 0.12]} color="#6D7671" position={[sideSign * 1.7, -0.35, sideSign * -config.depth / 2 - 0.2]} />
      <ToonBox size={[0.9, 0.5, 0.32]} color="#D4D8CF" position={[sideSign * 1.1, -config.height / 2 + 1.25, sideSign * -config.depth / 2 - 0.32]} />
    </group>
  );
}

function Road() {
  const segments = useMemo(() => Array.from({ length: 14 }, (_, index) => 2 - index * 4.6), []);
  return (
    <group>
      {segments.map((z, index) => (
        <group key={z} position={[roadCenterX(z), slopeHeight(z) - 0.08, z]} rotation={[0, roadYaw(z), 0]}>
          <ToonBox size={[5.15, 0.08, 5.0]} color={index % 3 === 0 ? colors.roadPatch : colors.road} outline={false} />
          <ToonBox size={[0.12, 0.025, 3.8]} color={colors.whiteLine} position={[-2.05, 0.065, 0]} outline={false} />
          {index % 2 === 0 ? <ToonBox size={[0.12, 0.026, 2.0]} color={colors.whiteLine} position={[1.65, 0.07, -0.6]} outline={false} /> : null}
        </group>
      ))}
      {segments.map((z) => (
        <group key={`side-${z}`} position={[roadCenterX(z), slopeHeight(z) + 0.04, z]} rotation={[0, roadYaw(z), 0]}>
          <ToonBox size={[1.25, 0.22, 4.9]} color={colors.sidewalk} position={[-3.25, 0, 0]} />
          <ToonBox size={[1.25, 0.22, 4.9]} color={colors.sidewalk} position={[3.25, 0, 0]} />
          <ToonBox size={[0.16, 0.22, 4.9]} color={colors.curb} position={[-2.55, 0.08, 0]} />
          <ToonBox size={[0.16, 0.22, 4.9]} color={colors.curb} position={[2.55, 0.08, 0]} />
        </group>
      ))}
    </group>
  );
}

function StreetProps() {
  const cones = [-3, -4.7, -11.6, -19.2, -27.8, -35.5];
  return (
    <group>
      <Vending position={[roadCenterX(-7) - 3.95, slopeHeight(-7) + 0.85, -7]} />
      <Vending position={[roadCenterX(-31) + 4.15, slopeHeight(-31) + 0.85, -31]} />
      {cones.map((z, index) => <Cone key={z} position={[roadCenterX(z) + (index % 2 ? 2.7 : -2.8), slopeHeight(z) + 0.25, z]} />)}
      {[-8, -23, -39].map((z) => <Sign key={z} position={[roadCenterX(z) + 3.55, slopeHeight(z) + 1.05, z]} />)}
      {[-14, -30].map((z) => <Pole key={z} position={[roadCenterX(z) - 4.15, slopeHeight(z) + 1.9, z]} />)}
      {[-18, -42].map((z) => <GuardRail key={z} position={[roadCenterX(z) + 2.85, slopeHeight(z) + 0.45, z]} />)}
    </group>
  );
}

function Vending({ position }: { position: Vec3 }) {
  const light = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.scale.y = 0.86 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
  });
  return (
    <group position={position}>
      <ToonBox size={[0.82, 1.7, 0.48]} color={colors.vendingMint} position={[0, 0, 0]} />
      <ToonBox size={[0.62, 0.9, 0.04]} color={colors.vendingPanel} position={[0, 0.28, -0.27]} />
      <mesh ref={light} position={[0.23, -0.52, -0.31]}>
        <boxGeometry args={[0.16, 0.32, 0.04]} />
        <meshToonMaterial color="#E8F3EF" />
      </mesh>
    </group>
  );
}

function Cone({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh>
        <coneGeometry args={[0.25, 0.58, 12]} />
        <meshToonMaterial color={colors.coneOrange} />
        <Edges color={colors.outline} threshold={15} />
      </mesh>
      <ToonBox size={[0.52, 0.05, 0.52]} color={colors.outline} position={[0, -0.31, 0]} outline={false} />
    </group>
  );
}

function Sign({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <ToonBox size={[0.09, 1.75, 0.09]} color={colors.outline} position={[0, -0.45, 0]} outline={false} />
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.08, 24]} />
        <meshToonMaterial color="#DDE9E2" />
        <Edges color={colors.outline} threshold={15} />
      </mesh>
    </group>
  );
}

function Pole({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <ToonBox size={[0.18, 3.8, 0.18]} color="#59635D" position={[0, 0, 0]} />
      <ToonBox size={[1.5, 0.12, 0.12]} color="#59635D" position={[0.48, 1.5, 0]} />
    </group>
  );
}

function GuardRail({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <ToonBox size={[2.2, 0.12, 0.12]} color="#D9DED4" position={[0, 0.3, 0]} />
      <ToonBox size={[0.12, 0.55, 0.12]} color="#D9DED4" position={[-0.9, 0, 0]} />
      <ToonBox size={[0.12, 0.55, 0.12]} color="#D9DED4" position={[0.9, 0, 0]} />
    </group>
  );
}

function Player({ started }: { started: boolean }) {
  const group = useRef<THREE.Group>(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const yaw = useRef(0);
  const pitch = useRef(-0.08);
  const position = useRef(new THREE.Vector3(roadCenterX(1.5), slopeHeight(1.5), 1.5));

  useEffect(() => {
    const key = (event: any, down: boolean) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(event.code)) event.preventDefault();
      if (event.code === 'KeyW') keys.current.w = down;
      if (event.code === 'KeyA') keys.current.a = down;
      if (event.code === 'KeyS') keys.current.s = down;
      if (event.code === 'KeyD') keys.current.d = down;
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') keys.current.shift = down;
    };
    const down = (event: any) => key(event, true);
    const up = (event: any) => key(event, false);
    globalThis.addEventListener('keydown', down);
    globalThis.addEventListener('keyup', up);
    return () => {
      globalThis.removeEventListener('keydown', down);
      globalThis.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const moveView = (event: any) => {
      if (!globalThis.document.pointerLockElement) return;
      yaw.current -= event.movementX * 0.002;
      pitch.current = THREE.MathUtils.clamp(pitch.current - event.movementY * 0.0012, -0.32, 0.18);
    };
    globalThis.addEventListener('mousemove', moveView);
    return () => globalThis.removeEventListener('mousemove', moveView);
  }, []);

  useFrame(({ camera, clock }, delta) => {
    const dir = new THREE.Vector3(Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, Math.sin(yaw.current));
    const move = new THREE.Vector3();
    if (started) {
      if (keys.current.w) move.add(dir);
      if (keys.current.s) move.sub(dir);
      if (keys.current.d) move.add(right);
      if (keys.current.a) move.sub(right);
    }
    const moving = move.lengthSq() > 0;
    if (moving) {
      move.normalize().multiplyScalar((keys.current.shift ? 4.0 : 2.25) * delta);
      position.current.add(move);
      keepOnStreet(position.current);
    }
    if (group.current) {
      group.current.position.lerp(position.current, 0.35);
      group.current.rotation.y = yaw.current;
      group.current.position.y += moving ? Math.sin(clock.elapsedTime * 8) * 0.025 : 0;
    }
    const camOffset = new THREE.Vector3(Math.sin(yaw.current) * -5.0, 2.65 + pitch.current * 2.4, Math.cos(yaw.current) * 5.0);
    const targetCamera = position.current.clone().add(camOffset);
    camera.position.lerp(targetCamera, 0.11);
    camera.lookAt(position.current.x, position.current.y + 1.15, position.current.z - 1.15);
  });

  return (
    <group ref={group}>
      <ToonSphere radius={0.34} color={colors.bodyTone} position={[0, 1.62, 0]} />
      <ToonSphere radius={0.38} color={colors.hair} position={[0, 1.78, 0.03]} />
      <ToonBox size={[0.7, 0.75, 0.38]} color={colors.shirt} position={[0, 0.95, 0]} />
      <ToonBox size={[0.34, 0.74, 0.26]} color={colors.pants} position={[-0.19, 0.28, 0]} />
      <ToonBox size={[0.34, 0.74, 0.26]} color={colors.pants} position={[0.19, 0.28, 0]} />
      <ToonBox size={[0.36, 0.18, 0.5]} color={colors.shoes} position={[-0.2, -0.17, -0.08]} />
      <ToonBox size={[0.36, 0.18, 0.5]} color={colors.shoes} position={[0.2, -0.17, -0.08]} />
      <ToonBox size={[0.18, 0.58, 0.18]} color={colors.bodyTone} position={[-0.48, 0.9, 0]} rotation={[0.08, 0, -0.1]} />
      <ToonBox size={[0.18, 0.58, 0.18]} color={colors.bodyTone} position={[0.48, 0.9, 0]} rotation={[0.08, 0, 0.1]} />
      <ToonBox size={[0.52, 0.62, 0.22]} color={colors.bag} position={[0.45, 0.8, 0.23]} rotation={[0, 0, -0.12]} />
      <mesh position={[0, -0.28, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#2F3435" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

function Clouds() {
  const clouds = [
    [-11, 9, -34, 1.1, 0.012],
    [-2, 12, -46, 1.45, 0.009],
    [8, 8.5, -56, 1.25, 0.01],
    [-13, 6.8, -63, 0.9, 0.015],
  ] as const;
  return (
    <group>
      {clouds.map(([x, y, z, scale, speed], i) => <Cloud key={i} position={[x, y, z]} scale={scale} speed={speed} />)}
      <SkyStroke position={[-5, 7.2, -38]} width={3.2} rotation={0.08} />
      <SkyStroke position={[6.4, 10.4, -50]} width={4.4} rotation={-0.04} />
      <SkyStroke position={[0.5, 5.7, -58]} width={2.4} rotation={0.14} />
    </group>
  );
}

function Cloud({ position, scale, speed }: { position: Vec3; scale: number; speed: number }) {
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
      <mesh><planeGeometry args={[3.8, 0.42]} /><meshBasicMaterial color={colors.cloud} side={THREE.DoubleSide} transparent opacity={0.88} /></mesh>
      <mesh position={[-1.15, 0.13, 0.01]}><planeGeometry args={[1.5, 0.26]} /><meshBasicMaterial color={colors.cloud} side={THREE.DoubleSide} transparent opacity={0.75} /></mesh>
      <mesh position={[1.18, -0.07, 0.01]} rotation={[0, 0, -0.08]}><planeGeometry args={[1.7, 0.22]} /><meshBasicMaterial color={colors.skyDeep} side={THREE.DoubleSide} transparent opacity={0.22} /></mesh>
    </group>
  );
}

function SkyStroke({ position, width, rotation }: { position: Vec3; width: number; rotation: number }) {
  return <mesh position={position} rotation={[0, 0, rotation]}><planeGeometry args={[width, 0.055]} /><meshBasicMaterial color={colors.skyDeep} side={THREE.DoubleSide} transparent opacity={0.28} /></mesh>;
}

function FarVehicle() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.08) % 1;
    const z = -49 + t * 13;
    if (ref.current) ref.current.position.set(roadCenterX(z) + 1.6, slopeHeight(z) + 0.28, z);
  });
  return (
    <group ref={ref} scale={0.58}>
      <ToonBox size={[1.2, 0.42, 0.74]} color="#D9A34B" position={[0, 0, 0]} />
      <ToonBox size={[0.66, 0.28, 0.5]} color="#C6DED7" position={[0.05, 0.32, 0]} />
    </group>
  );
}

function Scene({ started }: { started: boolean }) {
  return (
    <>
      <color attach="background" args={[colors.sky]} />
      <fog attach="fog" args={[colors.sky, 38, 84]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight args={['#D7F3EC', '#9E9B84', 1.25]} />
      <directionalLight position={[8, 10, 6]} intensity={1.15} />
      <Clouds />
      <Road />
      {buildings.map((building) => <BuildingBlock key={building.id} config={building} />)}
      <StreetProps />
      <FarVehicle />
      <Player started={started} />
    </>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={styles.startScreen}>
      <div style={styles.panel}>
        <p style={styles.eyebrow}>A tiny toon city exploration</p>
        <h1 style={styles.title}>SHIBUYA SLOPE WALK</h1>
        <p style={styles.lead}>渋谷区の坂道や裏路地をモチーフにした、手描き風の3D探索空間です。</p>
        <p style={styles.note}>実在の街を完全再現したものではなく、渋谷の路地や坂道を参考にした架空都市です。</p>
        <div style={styles.controls}>WASD：移動　/　Mouse：視点移動　/　Shift：少し速く歩く　/　Esc：操作解除</div>
        <button type="button" onClick={onStart} style={styles.button}>探索をはじめる</button>
      </div>
    </div>
  );
}

function requestLock() {
  const root = globalThis.document.querySelector<HTMLElement>('#game-root');
  if (root && globalThis.document.pointerLockElement !== root) root.requestPointerLock().catch(() => undefined);
}

export default function App() {
  const [started, setStarted] = useState(false);
  const start = () => {
    setStarted(true);
    globalThis.setTimeout(requestLock, 0);
  };
  return (
    <main id="game-root" onClick={() => started && requestLock()} style={styles.app}>
      <Canvas camera={{ position: [0, 2.9, 6.8], fov: 58, near: 0.1, far: 120 }} dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <Scene started={started} />
      </Canvas>
      {started ? <div style={styles.guide}><strong>SHIBUYA SLOPE WALK</strong><span>WASD 移動 / Mouse 視点 / Shift 速歩き / Esc 解除</span><small>画面クリックで再ロック</small></div> : <StartScreen onStart={start} />}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: { width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, background: colors.sky, fontFamily: 'system-ui, sans-serif' },
  startScreen: { position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(245, 247, 236, 0.48)', backdropFilter: 'blur(3px)' },
  panel: { width: 'min(560px, calc(100vw - 40px))', padding: '34px', borderRadius: '26px', background: 'rgba(255, 252, 238, 0.88)', border: `3px solid ${colors.outline}`, boxShadow: '0 16px 40px rgba(47,52,53,.2)', textAlign: 'center' },
  eyebrow: { margin: 0, color: colors.signOrange, fontWeight: 800, letterSpacing: '.08em' },
  title: { margin: '10px 0', fontSize: 'clamp(34px, 6vw, 64px)', color: colors.outline, lineHeight: 1 },
  lead: { color: colors.outline, fontSize: '16px', lineHeight: 1.7 },
  note: { color: '#59635D', fontSize: '13px', lineHeight: 1.6 },
  controls: { margin: '20px 0', padding: '14px', borderRadius: '16px', background: 'rgba(159,227,221,.5)', color: colors.outline, fontSize: '14px', fontWeight: 700 },
  button: { border: `3px solid ${colors.outline}`, background: colors.signOrange, color: colors.outline, borderRadius: '999px', padding: '14px 26px', fontSize: '16px', fontWeight: 900, cursor: 'pointer' },
  guide: { position: 'fixed', left: 16, top: 16, display: 'grid', gap: 4, padding: '12px 14px', borderRadius: 16, border: `2px solid ${colors.outline}`, background: 'rgba(255,252,238,.78)', color: colors.outline, fontSize: 12 },
};
