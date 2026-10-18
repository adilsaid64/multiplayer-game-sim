import {
  DELTA_T,
  createWorld,
  demoLevel,
  worldFromSnapshot,
} from '@multiplayer-game-sim/game';
import type {
  ClientInputMessage,
  Player,
  PlayerInput,
  ServerMessage,
  Vec2,
  World,
} from '@multiplayer-game-sim/game';

const SERVER_URL = 'ws://localhost:8080';
const PLAYER_COLORS = ['#ef4444', '#22c55e', '#eab308', '#a855f7', '#06b6d4'];

function requireCanvas(): HTMLCanvasElement {
  const canvasElement = document.getElementById('game');
  if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error('Missing #game canvas');
  }
  return canvasElement;
}

function require2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable');
  }
  return context;
}

const canvas = requireCanvas();
const ctx = require2d(canvas);
canvas.height = 500;
canvas.width = 500;

let world: World = createWorld(demoLevel);
let localPlayerId: string | null = null;
let connected = false;

const keysHeld = new Set<string>();
let jumpQueued = false;

const socket = new WebSocket(SERVER_URL);

function colorForPlayer(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length] ?? '#ef4444';
}

function worldToCanvasY(centerY: number, height: number): number {
  return canvas.height - (centerY + height / 2);
}

function drawSprite(position: Vec2, size: Vec2, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(
    position.x - size.x / 2,
    worldToCanvasY(position.y, size.y),
    size.x,
    size.y,
  );
}

function drawPlayerId(player: Player, isLocal: boolean): void {
  ctx.fillStyle = isLocal ? '#ffffff' : '#e5e7eb';
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    player.id.slice(0, 8),
    player.position.x,
    worldToCanvasY(player.position.y, player.size.y) - 6,
  );
  ctx.textAlign = 'left';
}

function render(state: World, localId: string | null): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const platform of state.platforms) {
    drawSprite(platform.position, platform.size, '#3b82f6');
  }

  state.players.forEach((player, index) => {
    const isLocal = player.id === localId;
    drawSprite(player.position, player.size, isLocal ? '#ffffff' : colorForPlayer(index));
    drawPlayerId(player, isLocal);
  });
}

function renderHud(state: World, localPlayer: Player | undefined): void {
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText(connected ? 'Connected to server' : 'Connecting...', 10, 20);

  if (!localPlayer) {
    return;
  }

  ctx.fillText(
    `You: x=${localPlayer.position.x.toFixed(1)} y=${localPlayer.position.y.toFixed(1)}`,
    10,
    40,
  );
  ctx.fillText(
    `Vel: x=${localPlayer.velocity.x.toFixed(1)} y=${localPlayer.velocity.y.toFixed(1)}`,
    10,
    60,
  );
  ctx.fillText(`Grounded: ${localPlayer.grounded}`, 10, 80);
  ctx.fillText(`Players online: ${state.players.length}`, 10, 100);
}

function movementX(): PlayerInput['moveX'] {
  const left = keysHeld.has('a');
  const right = keysHeld.has('d');
  if (left === right) {
    return 0;
  }
  return right ? 1 : -1;
}

function sendInput(): void {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  const input: PlayerInput = { moveX: movementX(), jump: jumpQueued };
  jumpQueued = false;
  const message: ClientInputMessage = { type: 'input', input };
  socket.send(JSON.stringify(message));
}

function isServerMessage(value: unknown): value is ServerMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const message = value as { type?: unknown };
  return message.type === 'welcome' || message.type === 'snapshot';
}

socket.addEventListener('open', () => {
  connected = true;
});

socket.addEventListener('close', () => {
  connected = false;
});

socket.addEventListener('message', (event) => {
  try {
    const parsed: unknown = JSON.parse(String(event.data));
    if (!isServerMessage(parsed)) {
      return;
    }

    if (parsed.type === 'welcome') {
      localPlayerId = parsed.playerId;
      return;
    }

    world = worldFromSnapshot(parsed);
  } catch {
    // Ignore malformed payloads. The next snapshot replaces the world.
  }
});

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

let previousTime = performance.now();
let accumulator = 0;

function gameLoop(now: number): void {
  accumulator += now - previousTime;
  previousTime = now;

  while (accumulator >= DELTA_T) {
    sendInput();
    accumulator -= DELTA_T;
  }

  const localPlayer = world.players.find((player) => player.id === localPlayerId);
  render(world, localPlayerId);
  renderHud(world, localPlayer);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
