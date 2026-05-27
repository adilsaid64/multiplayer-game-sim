import { GRAVITY } from './constants';
import { Entity, type Game } from './entities';

interface AABB {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function getBounds(entity: Entity): AABB {
  return {
    top: entity.position.y + entity.size.y / 2,
    bottom: entity.position.y - entity.size.y / 2,
    left: entity.position.x - entity.size.x / 2,
    right: entity.position.x + entity.size.x / 2,
  };
}

function aabbOverlap(a: AABB, b: AABB): boolean {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
}

function resetCollisionFlags(state: Game) {
  for (const player of state.players) {
    player.collLeft = false;
    player.collRight = false;
    player.collTop = false;
    player.collBottom = false;
    player.isGrounded = false;
  }
}

function resolvePlayerPlatformCollisions(state: Game) {
  for (const player of state.players) {
    let playerBounds = getBounds(player);

    for (const platform of state.platforms) {
      const platformBounds = getBounds(platform);
      if (!aabbOverlap(playerBounds, platformBounds)) {
        continue;
      }

      const overlapLeft = playerBounds.right - platformBounds.left;
      const overlapRight = platformBounds.right - playerBounds.left;
      const overlapBottom = playerBounds.top - platformBounds.bottom;
      const overlapTop = platformBounds.top - playerBounds.bottom;
      const minOverlap = Math.min(
        overlapLeft,
        overlapRight,
        overlapBottom,
        overlapTop
      );

      if (minOverlap === overlapTop && player.velocity.y <= 0) {
        player.position.y = platformBounds.top + player.size.y / 2;
        player.velocity.y = 0;
        player.isGrounded = true;
        player.collBottom = true;
      } else if (minOverlap === overlapBottom && player.velocity.y > 0) {
        player.position.y = platformBounds.bottom - player.size.y / 2;
        player.velocity.y = 0;
        player.collTop = true;
      } else if (minOverlap === overlapLeft) {
        player.position.x = platformBounds.left - player.size.x / 2;
        player.velocity.x = 0;
        player.collLeft = true;
      } else if (minOverlap === overlapRight) {
        player.position.x = platformBounds.right + player.size.x / 2;
        player.velocity.x = 0;
        player.collRight = true;
      }

      playerBounds = getBounds(player);
    }
  }
}

function updatePosition(dt: number, state: Game) {
  for (const player of state.players) {
    player.position.y += player.velocity.y * dt;
    player.position.x += player.velocity.x * dt;
  }
}

function updateGravity(dt: number, state: Game) {
  for (const player of state.players) {
    player.velocity.y += GRAVITY * dt;
  }
}

export function update(dt: number, state: Game) {
  updateGravity(dt, state);
  updatePosition(dt, state);
  resetCollisionFlags(state);
  resolvePlayerPlatformCollisions(state);
}
