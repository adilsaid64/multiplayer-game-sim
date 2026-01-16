import { GRAVITY } from "./constants";
import { Entity, Player, type Game } from "./entities";

interface GetBoundsArgs {
  entity: Entity
}

interface AABB {
  left: number
  right: number
  up: number
  down: number
}

function getBounds(args: GetBoundsArgs): AABB {
  const bounds: AABB = {
    down: args.entity.position.y + args.entity.size.y / 2,
    up: args.entity.position.y - args.entity.size.y / 2,
    left: args.entity.position.x - args.entity.size.x / 2,
    right: args.entity.position.x + args.entity.size.x / 2,
  }
  return bounds
}

function checkCollision(state: Game) {
  for (const player of state.players) {
    getBounds({ entity: player });
  }
}

function updateGravity(dt: number, state: Game) {
  for (const player of state.players) {
    player.velocity.y += GRAVITY * dt;
    player.position.y += player.velocity.y * dt;
  }
}
export function update(dt: number, state: Game) {
  updateGravity(dt / 1000, state)
}
