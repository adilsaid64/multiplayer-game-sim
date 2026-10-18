import { JUMP_VELOCITY, PLAYER_MOVE_SPEED } from './constants';
import type { Player, PlayerInput } from './types';

export function idleInput(): PlayerInput {
  return { moveX: 0, jump: false };
}

/** Latest move wins. A jump stays latched until the tick consumes it. */
export function mergeInput(current: PlayerInput, next: PlayerInput): PlayerInput {
  return {
    moveX: next.moveX,
    jump: current.jump || next.jump,
  };
}

export function clearJump(input: PlayerInput): PlayerInput {
  return { moveX: input.moveX, jump: false };
}

export function applyInput(player: Player, input: PlayerInput): void {
  player.velocity.x = input.moveX * PLAYER_MOVE_SPEED;

  if (input.jump && player.grounded) {
    player.velocity.y = JUMP_VELOCITY;
    player.grounded = false;
  }
}

export function isPlayerInput(value: unknown): value is PlayerInput {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const input = value as { moveX?: unknown; jump?: unknown };
  return (
    (input.moveX === -1 || input.moveX === 0 || input.moveX === 1) &&
    typeof input.jump === 'boolean'
  );
}
