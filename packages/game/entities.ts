interface Vector2D {
  x: number;
  y: number;
}

export class Entity {
  position: Vector2D;
  size: Vector2D;
  collRight: boolean
  collLeft: boolean
  collTop: boolean
  collBottom: boolean

  constructor(position: Vector2D, size: Vector2D) {
    this.position = { ...position };
    this.size = { ...size };
    this.collRight = false
    this.collLeft = false
    this.collTop = false
    this.collBottom = false
  }
}

interface PlayerArgs {
  id: string;
  startingPosition: Vector2D;
  size: Vector2D;
}

export class Player extends Entity {
  id: string;
  velocity: Vector2D;
  isGrounded: boolean;

  constructor(args: PlayerArgs) {
    super(args.startingPosition, args.size);
    this.id = args.id;
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;
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
