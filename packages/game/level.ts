import type { Platform, Player, Vec2, World } from './types';

export type Level = {
  platforms: Platform[];
  spawnPoints: Vec2[];
  playerSize: Vec2;
};

function copyPlatform(platform: Platform): Platform {
  return {
    position: { ...platform.position },
    size: { ...platform.size },
  };
}

export function createWorld(level: Level): World {
  return {
    players: [],
    platforms: level.platforms.map(copyPlatform),
  };
}

export function spawnPlayer(
  world: World,
  id: string,
  spawnIndex: number,
  level: Level,
): Player {
  const spawnPoint = level.spawnPoints[spawnIndex % level.spawnPoints.length];
  if (!spawnPoint) {
    throw new Error('Level has no spawn points');
  }
  const player: Player = {
    id,
    position: { ...spawnPoint },
    size: { ...level.playerSize },
    velocity: { x: 0, y: 0 },
    grounded: false,
  };
  world.players.push(player);
  return player;
}

export function removePlayer(world: World, playerId: string): void {
  world.players = world.players.filter((player) => player.id !== playerId);
}
