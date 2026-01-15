import { GRAVITY } from "./constants";
import type { Game } from "./entities";

function updateGravity(dt: number, state: Game) {
  for (const player of state.players) {
    player.velocity.y += GRAVITY * dt;
    player.position.y += player.velocity.y * dt;
  }
}

export function update(dt: number, state: Game) {
  updateGravity(dt / 1000, state)
}
