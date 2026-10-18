import { isPlayerInput } from './input';
import type { Platform, Player, PlayerInput } from './types';

export type ClientInputMessage = {
  type: 'input';
  input: PlayerInput;
};

export type WorldSnapshotMessage = {
  type: 'snapshot';
  players: Player[];
  platforms: Platform[];
};

export type WelcomeMessage = {
  type: 'welcome';
  playerId: string;
};

export type ServerMessage = WelcomeMessage | WorldSnapshotMessage;

export type ClientMessage = ClientInputMessage;

export function isClientMessage(value: unknown): value is ClientMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const message = value as { type?: unknown; input?: unknown };
  return message.type === 'input' && isPlayerInput(message.input);
}
