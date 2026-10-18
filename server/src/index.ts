import { randomUUID } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';
import {
  DELTA_T,
  applyInput,
  clearJump,
  createWorld,
  demoLevel,
  idleInput,
  isClientMessage,
  mergeInput,
  removePlayer,
  serializeWorld,
  spawnPlayer,
  stepPhysics,
} from '@multiplayer-game-sim/game';
import type { Player, PlayerInput, World } from '@multiplayer-game-sim/game';

const PORT = 8080;

type ClientConnection = {
  id: string;
  socket: WebSocket;
  player: Player;
  input: PlayerInput;
};

class GameServer {
  private readonly world: World;
  private readonly clients = new Map<string, ClientConnection>();

  constructor() {
    this.world = createWorld(demoLevel);
  }

  addClient(socket: WebSocket): string {
    const id = randomUUID();
    const player = spawnPlayer(this.world, id, this.clients.size, demoLevel);
    this.clients.set(id, { id, socket, player, input: idleInput() });

    socket.send(JSON.stringify({ type: 'welcome', playerId: id }));
    this.broadcastSnapshot();
    return id;
  }

  removeClient(id: string): void {
    if (!this.clients.delete(id)) {
      return;
    }

    removePlayer(this.world, id);
    this.broadcastSnapshot();
  }

  receiveInput(id: string, input: PlayerInput): void {
    const connection = this.clients.get(id);
    if (!connection) {
      return;
    }

    connection.input = mergeInput(connection.input, input);
  }

  tick(): void {
    for (const connection of this.clients.values()) {
      applyInput(connection.player, connection.input);
      connection.input = clearJump(connection.input);
    }

    stepPhysics(this.world, DELTA_T / 1000);
    this.broadcastSnapshot();
  }

  private broadcastSnapshot(): void {
    const payload = JSON.stringify(serializeWorld(this.world));
    for (const connection of this.clients.values()) {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(payload);
      }
    }
  }
}

function readClientMessage(data: unknown): PlayerInput | null {
  try {
    const parsed: unknown = JSON.parse(String(data));
    return isClientMessage(parsed) ? parsed.input : null;
  } catch {
    return null;
  }
}

const gameServer = new GameServer();
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (socket) => {
  const clientId = gameServer.addClient(socket);

  socket.on('message', (data) => {
    const input = readClientMessage(data);
    if (input) {
      gameServer.receiveInput(clientId, input);
    }
  });

  socket.on('close', () => {
    gameServer.removeClient(clientId);
  });
});

setInterval(() => {
  gameServer.tick();
}, DELTA_T);

console.log(`Game server listening on ws://localhost:${PORT}`);
