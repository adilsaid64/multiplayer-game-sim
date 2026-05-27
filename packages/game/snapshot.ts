import { Game, Platform, Player } from './entities';
import type {
  PlatformSnapshot,
  PlayerSnapshot,
  WorldSnapshotMessage,
} from './messages/network';

export function serializeWorldSnapshot(game: Game): WorldSnapshotMessage {
  return {
    type: 'snapshot',
    players: game.players.map(serializePlayer),
    platforms: game.platforms.map(serializePlatform),
  };
}

function serializePlayer(player: Player): PlayerSnapshot {
  return {
    id: player.id,
    position: { ...player.position },
    size: { ...player.size },
    velocity: { ...player.velocity },
    isGrounded: player.isGrounded,
  };
}

function serializePlatform(platform: Platform): PlatformSnapshot {
  return {
    position: { ...platform.position },
    size: { ...platform.size },
  };
}

export function applyWorldSnapshot(game: Game, snapshot: WorldSnapshotMessage) {
  game.platforms = snapshot.platforms.map(
    (platform) => new Platform(platform)
  );

  const playersById = new Map(game.players.map((player) => [player.id, player]));

  game.players = snapshot.players.map((playerSnapshot) => {
    const existing = playersById.get(playerSnapshot.id);
    if (existing) {
      existing.position = { ...playerSnapshot.position };
      existing.velocity = { ...playerSnapshot.velocity };
      existing.isGrounded = playerSnapshot.isGrounded;
      return existing;
    }

    const player = new Player({
      id: playerSnapshot.id,
      startingPosition: playerSnapshot.position,
      size: playerSnapshot.size,
    });
    player.position = { ...playerSnapshot.position };
    player.velocity = { ...playerSnapshot.velocity };
    player.isGrounded = playerSnapshot.isGrounded;
    return player;
  });
}
