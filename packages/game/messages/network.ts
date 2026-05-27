import type { PlayerActorMessage } from './player';

export type ClientInputMessage = {
  type: 'input';
  input: PlayerActorMessage;
};

export type PlayerSnapshot = {
  id: string;
  position: { x: number; y: number };
  size: { x: number; y: number };
  velocity: { x: number; y: number };
  isGrounded: boolean;
};

export type PlatformSnapshot = {
  position: { x: number; y: number };
  size: { x: number; y: number };
};

export type WorldSnapshotMessage = {
  type: 'snapshot';
  players: PlayerSnapshot[];
  platforms: PlatformSnapshot[];
};

export type WelcomeMessage = {
  type: 'welcome';
  playerId: string;
};

export type ServerMessage = WelcomeMessage | WorldSnapshotMessage;

export type ClientMessage = ClientInputMessage;
