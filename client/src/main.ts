const TARGET_FPS = 30
const DELTA_T = 1000 / TARGET_FPS

let tPrev = performance.now()
let sumDeltaT = 0

function update(deltaT: number) {
  console.log(deltaT)
}

function gameLoop(tNow: number) {
  const tDiff = tNow - tPrev
  tPrev = tNow
  sumDeltaT += tDiff
  while (sumDeltaT >= DELTA_T) {
    update(DELTA_T)
    sumDeltaT -= DELTA_T
  }
  requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)
