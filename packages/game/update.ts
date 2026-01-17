import { GRAVITY } from "./constants";
import { Entity, Player, type Game } from "./entities";

interface GetBoundsArgs {
  entity: Entity
}

interface AABB {
  left: number
  right: number
  top: number
  bottom: number
}

function getBounds(args: GetBoundsArgs): AABB {
  const bounds: AABB = {
    top: args.entity.position.y + args.entity.size.y / 2,
    bottom: args.entity.position.y - args.entity.size.y / 2,
    left: args.entity.position.x - args.entity.size.x / 2,
    right: args.entity.position.x + args.entity.size.x / 2,
  }
  return bounds
}

interface CheckForIntersectionArgs {
  entityA: AABB
  entityB: AABB
}
function checkForIntersection(args: CheckForIntersectionArgs): boolean {
  const cond1 = args.entityA.right > args.entityB.left
  const cond2 = args.entityA.bottom < args.entityB.top
  const cond3 = args.entityA.left < args.entityB.right
  const cond4 = args.entityA.top > args.entityB.bottom
  // if any are true, there is a intersection
  return (cond1 || cond2 || cond3 || cond4)
}

function checkPlayerPlatformCollision(state: Game) {
  for (const player of state.players) {
    const playerBounds = getBounds({ entity: player });
    for (const platform of state.platforms) {
      const platformBounds = getBounds({ entity: platform });
      console.log(player.position, platform.position)
      console.log(playerBounds, platformBounds)
      // check intersection
      if (checkForIntersection({ entityA: playerBounds, entityB: platformBounds })) {
      } else {
        console.log('collision found!')
        player.velocity = { ...{ x: 0, y: 0 } }
      }
    }
  }
}

function updatePosition(dt: number, state: Game) {
  for (const player of state.players) {
    player.position.y += player.velocity.y * dt;
  }
}

function updateGravity(dt: number, state: Game) {
  for (const player of state.players) {
    player.velocity.y += GRAVITY * dt;
  }
}
export function update(dt: number, state: Game) {
  updateGravity(dt / 1000, state)
  checkPlayerPlatformCollision(state)
  updatePosition(dt / 1000, state)
}
