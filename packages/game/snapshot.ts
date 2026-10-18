import type { WorldSnapshotMessage } from './messages';
import type { Platform, Player, Vec2, World } from './types';

function copyVec(value: Vec2): Vec2 {
  return { x: value.x, y: value.y };
}

function copyPlayer(player: Player): Player {
  return {
    id: player.id,
    position: copyVec(player.position),
    size: copyVec(player.size),
    velocity: copyVec(player.velocity),
    grounded: player.grounded,
  };
}

function copyPlatform(platform: Platform): Platform {
  return {
    position: copyVec(platform.position),
    size: copyVec(platform.size),
  };
}

export function serializeWorld(world: World): WorldSnapshotMessage {
  return {
    type: 'snapshot',
    players: world.players.map(copyPlayer),
    platforms: world.platforms.map(copyPlatform),
  };
}

export function worldFromSnapshot(snapshot: WorldSnapshotMessage): World {
  return {
    players: snapshot.players.map(copyPlayer),
    platforms: snapshot.platforms.map(copyPlatform),
  };
}
