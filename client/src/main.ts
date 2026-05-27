import {
  DELTA_T,
  Entity,
  Game,
  Platform,
  Player,
  PlayerActor,
  World,
} from '@multiplayer-game-sim/game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.height = 500;
canvas.width = 500;

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
    renderEntity(platform, 'blue');
  }

  for (const player of game.players) {
    renderEntity(player, 'red');
  }
}

function renderPlayerPosition(player: Player) {
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';

  const posTxt = `Player Pos: x=${player.position.x.toFixed(1)} y=${player.position.y.toFixed(1)}`;
  ctx.fillText(posTxt, 10, 20);

  const groundedTxt = `Player: isGrounded=${player.isGrounded}`;
  ctx.fillText(groundedTxt, 10, 40);

  const collisionTxt = `Player: collBottom=${player.collBottom} collTop=${player.collTop}  collLeft=${player.collLeft} collRight=${player.collRight} `;
  ctx.fillText(collisionTxt, 10, 60);

  const velTxt = `Player Vel: x=${player.velocity.x.toFixed(1)} y=${player.velocity.y.toFixed(1)}`;
  ctx.fillText(velTxt, 10, 80);
}

let tPrev = performance.now();
let sumDeltaT = 0;

const player = new Player({
  startingPosition: {
    x: 250,
    y: 510,
  },
  size: { x: 20, y: 20 },
});

const playerActor = new PlayerActor(player);
const platform1 = new Platform({
  position: {
    x: 250,
    y: 250,
  },
  size: { x: 300, y: 20 },
});
const platform2 = new Platform({
  position: {
    x: 100,
    y: 300,
  },
  size: { x: 100, y: 20 },
});
const game = new Game({
  players: [player],
  platforms: [platform1, platform2],
});

const world = new World(game);
world.addActor(playerActor);

const keysHeld = new Set<string>();

function syncMovementInput() {
  const left = keysHeld.has('a');
  const right = keysHeld.has('d');

  if (left && !right) {
    playerActor.send({ type: 'move', direction: 'left' });
  } else if (right && !left) {
    playerActor.send({ type: 'move', direction: 'right' });
  } else {
    playerActor.send({ type: 'stop' });
  }
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  keysHeld.add(event.key);

  if (event.key === 'w') {
    playerActor.send({ type: 'jump' });
  }
});

document.addEventListener('keyup', (event) => {
  keysHeld.delete(event.key);
});

function gameLoop(tNow: number) {
  const tDiff = tNow - tPrev;
  tPrev = tNow;
  sumDeltaT += tDiff;
  while (sumDeltaT >= DELTA_T) {
    syncMovementInput();
    world.step(DELTA_T);
    sumDeltaT -= DELTA_T;
  }
  render(game);
  renderPlayerPosition(game.players[0]);
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
