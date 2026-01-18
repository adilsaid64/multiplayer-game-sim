import { DELTA_T } from '../../packages/game/constants';
import { Platform, Player, Game, Entity } from '../../packages/game/entities';
import { update } from '../../packages/game/update';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.height = 500
canvas.width = 500

function renderEntity(entity: Entity, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(
    entity.position.x - entity.size.x / 2,
    canvas.height - (entity.position.y + entity.size.y / 2),
    entity.size.x,
    entity.size.y
  );
}

function render(game: Game) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const platform of game.platforms) {
    renderEntity(platform, 'blue')
  }

  for (const player of game.players) {
    renderEntity(player, 'red')
  }
}

let tPrev = performance.now();
let sumDeltaT = 0;

const player = new Player({
  startingPosition: {
    x: 250, y: 510
  },
  size: { x: 20, y: 20 },
});

const platform = new Platform({
  position: {
    x: 250, y: 250,
  },
  size: { x: 300, y: 20 },
});

const game = new Game({
  players: [player],
  platforms: [platform],
});

function gameLoop(tNow: number) {
  const tDiff = tNow - tPrev;
  tPrev = tNow;
  sumDeltaT += tDiff;
  while (sumDeltaT >= DELTA_T) {
    update(DELTA_T, game);
    sumDeltaT -= DELTA_T;
  }
  render(game);
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
