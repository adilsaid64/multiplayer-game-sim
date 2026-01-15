import { DELTA_T } from '../../packages/game/constants';
import { Platform, Player, Game } from '../../packages/game/entities';
import { update } from '../../packages/game/update';

let tPrev = performance.now();
let sumDeltaT = 0;

const player = new Player({
  startingPosition: { x: 0, y: 0 },
  size: { x: 5, y: 5 },
});

const platform = new Platform({
  position: { x: 0, y: 0 },
  size: { x: 10, y: 1 },
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
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
