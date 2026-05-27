import { randomUUID } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';
import {
  DELTA_T,
  PlayerActor,
  World,
  createGameFromLevel,
  removePlayer,
  serializeWorldSnapshot,
  spawnPlayer,
  type ClientMessage,
  type PlayerActorMessage,
  type WelcomeMessage,
} from '@multiplayer-game-sim/game';

const PORT = 8080;

type ClientConnection = {
  id: string;
  socket: WebSocket;
  actor: PlayerActor;
  pendingInputs: PlayerActorMessage[];
};

class GameServer {
  private readonly world: World;
  private readonly clients = new Map<string, ClientConnection>();

  constructor() {
    this.world = new World(createGameFromLevel());
  }

  addClient(socket: WebSocket): string {
    const id = randomUUID();
    const player = spawnPlayer(this.world.game, id, this.clients.size);
    const actor = new PlayerActor(player);
    this.world.addActor(actor);

    const connection: ClientConnection = {
      id,
      socket,
      actor,
      pendingInputs: [],
    };
    this.clients.set(id, connection);

    const welcome: WelcomeMessage = { type: 'welcome', playerId: id };
    socket.send(JSON.stringify(welcome));
    this.broadcastSnapshot();

    return id;
  }

  removeClient(id: string) {
    const connection = this.clients.get(id);
    if (!connection) {
      return;
    }

    this.world.removeActor(connection.actor);
    removePlayer(this.world.game, id);
    this.clients.delete(id);
    this.broadcastSnapshot();
  }

  queueInput(id: string, input: PlayerActorMessage) {
    const connection = this.clients.get(id);
    if (!connection) {
      return;
    }

    connection.pendingInputs.push(input);
  }

  tick() {
    for (const connection of this.clients.values()) {
      for (const input of connection.pendingInputs) {
        connection.actor.send(input);
      }
      connection.pendingInputs.length = 0;
    }

    this.world.step(DELTA_T);
    this.broadcastSnapshot();
  }

  private broadcastSnapshot() {
    const snapshot = serializeWorldSnapshot(this.world.game);
    const payload = JSON.stringify(snapshot);

    for (const connection of this.clients.values()) {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(payload);
      }
    }
  }
}

const gameServer = new GameServer();
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (socket) => {
  const clientId = gameServer.addClient(socket);

  socket.on('message', (data) => {
    try {
      const message = JSON.parse(String(data)) as ClientMessage;
      if (message.type === 'input') {
        gameServer.queueInput(clientId, message.input);
      }
    } catch {
      // ignore malformed messages
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
