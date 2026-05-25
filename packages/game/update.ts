import { GRAVITY } from "./constants";
import { Entity, type Game } from "./entities";

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
// core idea, no intersection if any are true
// if non are true, there is an intersection
function checkForIntersection(args: CheckForIntersectionArgs) {
  const entityAIsLeftOfEntityB = args.entityA.right < args.entityB.left
  const entiryAIsTopOfEntityB = args.entityA.bottom > args.entityB.top
  const entiryAIsRightOfEntityB = args.entityA.left > args.entityB.right
  const entiryAIsButtomOfEntityB = args.entityA.top < args.entityB.bottom
  return {
    entityAIsLeftOfEntityB, entiryAIsTopOfEntityB, entiryAIsRightOfEntityB, entiryAIsButtomOfEntityB
  }
}

function checkPlayerPlatformCollision(state: Game) {
  for (const player of state.players) {// n players
    const playerBounds = getBounds({ entity: player });
    for (const platform of state.platforms) { // m platforms
      const platformBounds = getBounds({ entity: platform });
      const intersection = checkForIntersection({ entityA: playerBounds, entityB: platformBounds })
      console.log(intersection)
      // check intersection
      if (!(intersection.entityAIsLeftOfEntityB || intersection.entiryAIsTopOfEntityB || intersection.entiryAIsRightOfEntityB || intersection.entiryAIsButtomOfEntityB)) {
        // there is an intersection

        // checking if the player is falling, if they are falling, set y velocity to 0
        if (player.velocity.y < 0) {
          player.velocity.y = 0;
          player.isGrounded = true;
        }

      } else {
        // console.log('no collision')
      }
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
  updateGravity(dt / 1000, state)
  checkPlayerPlatformCollision(state)
  updatePosition(dt / 1000, state)
}
