import { demoLevel, type LevelDefinition } from './levels/demo';
import { Game, Platform, Player } from './entities';

export function createGameFromLevel(level: LevelDefinition = demoLevel): Game {
  const platforms = level.platforms.map(
    (platform) => new Platform(platform)
  );

  return new Game({
    players: [],
    platforms,
  });
}

export function spawnPlayer(
  game: Game,
  id: string,
  spawnIndex: number,
  level: LevelDefinition = demoLevel
): Player {
  const spawnPoint =
    level.spawnPoints[spawnIndex % level.spawnPoints.length];
  const player = new Player({
    id,
    startingPosition: spawnPoint,
    size: level.playerSize,
  });
  game.players.push(player);
  return player;
}

export function removePlayer(game: Game, playerId: string) {
  game.players = game.players.filter((player) => player.id !== playerId);
}
