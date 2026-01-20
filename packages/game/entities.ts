import { PLAYER_MOVE_SPEED } from "./constants";

interface Vector2D {
  x: number;
  y: number;
}

export class Entity {
  position: Vector2D;
  size: Vector2D;

  constructor(position: Vector2D, size: Vector2D) {
    this.position = { ...position };
    this.size = { ...size };
  }
}

interface PlayerArgs {
  startingPosition: Vector2D;
  size: Vector2D;
}

export class Player extends Entity {
  velocity: Vector2D;

  constructor(args: PlayerArgs) {
    super(args.startingPosition, args.size);
    this.velocity = { x: 0, y: 0 };
  }
  moveRight(dt: number) {
    this.velocity.x += PLAYER_MOVE_SPEED * dt;
  }
  moveLeft(dt: number) {
    this.velocity.x -= PLAYER_MOVE_SPEED * dt;
  }
}

interface PlatformArgs {
  position: Vector2D;
  size: Vector2D;
}

export class Platform extends Entity {
  constructor(args: PlatformArgs) {
    super(args.position, args.size);
  }
}

interface GameArgs {
  players: Player[];
  platforms: Platform[];
}

export class Game {
  players: Player[];
  platforms: Platform[];

  constructor(args: GameArgs) {
    this.players = args.players;
    this.platforms = args.platforms;
  }
}
