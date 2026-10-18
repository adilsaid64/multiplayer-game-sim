import { GRAVITY } from './constants';
import type { Platform, Player, World } from './types';

type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

function boundsOf(body: Platform | Player): Bounds {
  return {
    top: body.position.y + body.size.y / 2,
    bottom: body.position.y - body.size.y / 2,
    left: body.position.x - body.size.x / 2,
    right: body.position.x + body.size.x / 2,
  };
}

function overlaps(a: Bounds, b: Bounds): boolean {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
}

function resolvePlayerPlatform(player: Player, platform: Platform): void {
  const playerBounds = boundsOf(player);
  const platformBounds = boundsOf(platform);
  if (!overlaps(playerBounds, platformBounds)) {
    return;
  }

  const intoLeftFace = playerBounds.right - platformBounds.left;
  const intoRightFace = platformBounds.right - playerBounds.left;
  const intoBottomFace = playerBounds.top - platformBounds.bottom;
  const intoTopFace = platformBounds.top - playerBounds.bottom;
  const minPenetration = Math.min(
    intoLeftFace,
    intoRightFace,
    intoBottomFace,
    intoTopFace,
  );

  if (minPenetration === intoTopFace && player.velocity.y <= 0) {
    player.position.y = platformBounds.top + player.size.y / 2;
    player.velocity.y = 0;
    player.grounded = true;
    return;
  }

  if (minPenetration === intoBottomFace && player.velocity.y > 0) {
    player.position.y = platformBounds.bottom - player.size.y / 2;
    player.velocity.y = 0;
    return;
  }

  if (minPenetration === intoLeftFace) {
    player.position.x = platformBounds.left - player.size.x / 2;
    player.velocity.x = 0;
    return;
  }

  if (minPenetration === intoRightFace) {
    player.position.x = platformBounds.right + player.size.x / 2;
    player.velocity.x = 0;
  }
}

function resolveCollisions(world: World): void {
  for (const player of world.players) {
    player.grounded = false;
    for (const platform of world.platforms) {
      resolvePlayerPlatform(player, platform);
    }
  }
}

export function stepPhysics(world: World, dtSeconds: number): void {
  for (const player of world.players) {
    player.velocity.y += GRAVITY * dtSeconds;
    player.position.x += player.velocity.x * dtSeconds;
    player.position.y += player.velocity.y * dtSeconds;
  }

  resolveCollisions(world);
}
