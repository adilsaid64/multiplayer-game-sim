import { DELTA_T } from '../../packages/game/constants';
import { Platform, Player, Game, Entity } from '../../packages/game/entities';
import { update } from '../../packages/game/update';

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

const platform1 = new Platform({
  position: {
    x: 250,
    y: 250,
  },
  size: { x: 300, y: 20 },
});

const platform2 = new Platform({
  position: {
    x: 400,
    y: 300,
  },
  size: { x: 100, y: 20 },
});

const platform3 = new Platform({
  position: {
    x: 100,
    y: 340,
  },
  size: { x: 20, y: 100 },
});

const game = new Game({
  players: [player],
  platforms: [platform1, platform2, platform3],
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'd') {
    player.moveRight(DELTA_T);
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'd') {
    player.velocity.x = 0;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'a') {
    player.moveLeft(DELTA_T);
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'a') {
    player.velocity.x = 0;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'w') {
    player.jump(DELTA_T);
  }
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
  renderPlayerPosition(game.players[0])
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
