import { colors } from '../../data/colors';
import { Lights } from './Lights';
import { Sky } from './Sky';
import { SlopeRoad } from '../world/SlopeRoad';
import { Sidewalks } from '../world/Sidewalk';
import { TownBlocks } from '../world/TownBlocks';
import { StreetProps } from '../world/StreetProps';
import { FarVehicle } from '../world/FarVehicle';
import { Player } from '../player/Player';

interface SceneProps {
  started: boolean;
}

export function Scene({ started }: SceneProps) {
  return (
    <>
      <color attach="background" args={[colors.sky]} />
      <fog attach="fog" args={[colors.sky, 38, 84]} />
      <Lights />
      <Sky />
      <group>
        <SlopeRoad />
        <Sidewalks />
        <TownBlocks />
        <StreetProps />
        <FarVehicle />
      </group>
      <Player started={started} />
    </>
  );
}
