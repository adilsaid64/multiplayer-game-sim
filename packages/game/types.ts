export type Vec2 = {
  x: number;
  y: number;
};

export type PlayerInput = {
  moveX: -1 | 0 | 1;
  jump: boolean;
};

export type Player = {
  id: string;
  position: Vec2;
  size: Vec2;
  velocity: Vec2;
  grounded: boolean;
};

export type Platform = {
  position: Vec2;
  size: Vec2;
};

export type World = {
  players: Player[];
  platforms: Platform[];
};
