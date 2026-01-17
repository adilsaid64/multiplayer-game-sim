import { DELTA_T } from '../../packages/game/constants';
import { Platform, Player, Game } from '../../packages/game/entities';
import { update } from '../../packages/game/update';


const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function render(game: Game) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'blue';
  for (const platform of game.platforms) {
    ctx.fillRect(
      platform.position.x,
      canvas.height - platform.position.y,
      platform.size.x,
      platform.size.y
    );
  }

  ctx.fillStyle = 'red';
  for (const player of game.players) {
    ctx.fillRect(
      player.position.x,
      canvas.height - player.position.y,
      player.size.x,
      player.size.y
    );
  }
}



let tPrev = performance.now();
let sumDeltaT = 0;

const player = new Player({
  startingPosition: {
    x: 0, y: 100
  },
  size: { x: 20, y: 20 },
});

const platform = new Platform({
  position: {
    x: 0, y: 50,
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
