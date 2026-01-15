import { DELTA_T } from "../../packages/game/constants";
import { update } from "../../packages/game/update";

let tPrev = performance.now();
let sumDeltaT = 0;

function gameLoop(tNow: number) {
  const tDiff = tNow - tPrev;
  tPrev = tNow;
  sumDeltaT += tDiff;
  while (sumDeltaT >= DELTA_T) {
    update(DELTA_T);
    sumDeltaT -= DELTA_T;
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
