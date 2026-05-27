import {
  DELTA_T,
  Entity,
  Game,
  Player,
  applyWorldSnapshot,
  createGameFromLevel,
  type ClientInputMessage,
  type PlayerActorMessage,
  type ServerMessage,
} from '@multiplayer-game-sim/game';

const SERVER_URL = 'ws://localhost:8080';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.height = 500;
canvas.width = 500;

const PLAYER_COLORS = ['#ef4444', '#22c55e', '#eab308', '#a855f7', '#06b6d4'];

function colorForPlayer(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

function renderEntity(entity: Entity, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(
    entity.position.x - entity.size.x / 2,
    canvas.height - (entity.position.y + entity.size.y / 2),
    entity.size.x,
    entity.size.y
  );
}

function renderPlayerId(player: Player, isLocal: boolean) {
  ctx.fillStyle = isLocal ? '#ffffff' : '#e5e7eb';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    player.id.slice(0, 8),
    player.position.x,
    canvas.height - (player.position.y + player.size.y / 2) - 6
  );
  ctx.textAlign = 'left';
}

function render(game: Game, localPlayerId: string | null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const platform of game.platforms) {
    renderEntity(platform, '#3b82f6');
  }

  game.players.forEach((player, index) => {
    const color =
      player.id === localPlayerId ? '#ffffff' : colorForPlayer(index);
    renderEntity(player, color);
    renderPlayerId(player, player.id === localPlayerId);
  });
}

function renderHud(localPlayer: Player | undefined, connected: boolean) {
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';

  const statusTxt = connected ? 'Connected to server' : 'Connecting...';
  ctx.fillText(statusTxt, 10, 20);

  if (!localPlayer) {
    return;
  }

  const posTxt = `You: x=${localPlayer.position.x.toFixed(1)} y=${localPlayer.position.y.toFixed(1)}`;
  ctx.fillText(posTxt, 10, 40);

  const velTxt = `Vel: x=${localPlayer.velocity.x.toFixed(1)} y=${localPlayer.velocity.y.toFixed(1)}`;
  ctx.fillText(velTxt, 10, 60);

  const groundedTxt = `Grounded: ${localPlayer.isGrounded}`;
  ctx.fillText(groundedTxt, 10, 80);

  const playersTxt = `Players online: ${game.players.length}`;
  ctx.fillText(playersTxt, 10, 100);
}

let tPrev = performance.now();
let sumDeltaT = 0;

const game = createGameFromLevel();
let localPlayerId: string | null = null;
let connected = false;

const keysHeld = new Set<string>();
let jumpQueued = false;

const socket = new WebSocket(SERVER_URL);

socket.addEventListener('open', () => {
  connected = true;
});

socket.addEventListener('close', () => {
  connected = false;
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(String(event.data)) as ServerMessage;

  if (message.type === 'welcome') {
    localPlayerId = message.playerId;
    return;
  }

  if (message.type === 'snapshot') {
    applyWorldSnapshot(game, message);
  }
});

function sendInput(input: PlayerActorMessage) {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const message: ClientInputMessage = { type: 'input', input };
  socket.send(JSON.stringify(message));
}

function getMovementInput(): PlayerActorMessage {
  const left = keysHeld.has('a');
  const right = keysHeld.has('d');

  if (left && !right) {
    return { type: 'move', direction: 'left' };
  }
  if (right && !left) {
    return { type: 'move', direction: 'right' };
  }
  return { type: 'stop' };
}

document.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  keysHeld.add(event.key);

  if (event.key === 'w') {
    jumpQueued = true;
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
    sendInput(getMovementInput());

    if (jumpQueued) {
      sendInput({ type: 'jump' });
      jumpQueued = false;
    }

    sumDeltaT -= DELTA_T;
  }

  const localPlayer = localPlayerId
    ? game.players.find((player) => player.id === localPlayerId)
    : undefined;

  render(game, localPlayerId);
  renderHud(localPlayer, connected);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
