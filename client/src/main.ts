const TARGET_FPS = 15
const FIXED_DT = 1000 / TARGET_FPS

let lastTime = performance.now()
let accumulator = 0

function update(dt: number) {
  console.log('hello world', dt)
}

// param time is passed in from requestAnimationFrame, it represents the time the function was called
function loop(time: number) {
  // how much time has elappsed from the start (lastTime) to now (time, when this function is called)
  let frameTime = (time - lastTime)
  lastTime = time

  // sum the elappsed time
  accumulator += frameTime

  // once the elappsed time has passed our threshold, execute the update method
  while (accumulator >= FIXED_DT) {
    update(FIXED_DT)
    accumulator -= FIXED_DT
  }
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

