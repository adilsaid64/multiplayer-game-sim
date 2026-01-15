interface Vector2D {
  x: number;
  y: number;
}

interface PlayerArgs {
  startingPosition: Vector2D;
  size: Vector2D;
}

export class Player {
  position: Vector2D;
  velocity: Vector2D;
  size: Vector2D;

  constructor(args: PlayerArgs) {
    this.position = { ...args.startingPosition };
    this.velocity = { x: 0, y: 0 };
    this.size = { ...args.size };
  }
}

interface PlatformArgs {
  position: Vector2D;
  size: Vector2D;
}

export class Platform {
  position: Vector2D;
  size: Vector2D;
  constructor(args: PlatformArgs) {
    this.position = { ...args.position };
    this.size = { ...args.size };
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
