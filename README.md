# multiplayer-game-sim

Experimenting with authoritative servers, client-side prediction, and reconciliation in real-time multiplayer systems.

## Run locally

```bash
pnpm install
pnpm dev
```

This starts:

- **Server** — authoritative simulation at `ws://localhost:8080`
- **Client** — Vite dev server (open the URL it prints, usually `http://localhost:5173`)

Open two browser tabs to see multiple players. The server runs `World.step()`; clients send input and render server snapshots.

## Architecture (Phase 1)

Phase 1 is server-authoritative: the server owns simulation, clients send input and render snapshots. Client-side prediction and reconciliation are planned but not implemented yet.

Shared game logic lives in `packages/game`.

### Monorepo layout

```mermaid
flowchart TB
    subgraph Monorepo["pnpm workspace"]
        subgraph ClientPkg["client (Vite)"]
            Canvas["HTML Canvas renderer"]
            Input["Keyboard input handler"]
            WSClient["WebSocket client"]
        end

        subgraph ServerPkg["server (Node.js + ws)"]
            WSServer["WebSocketServer :8080"]
            GameServer["GameServer"]
            TickLoop["setInterval tick loop"]
        end

        subgraph GamePkg["@multiplayer-game-sim/game (shared)"]
            Entities["Entities: Game, Player, Platform"]
            Level["Level loading (demoLevel)"]
            World["World + Actor system"]
            Physics["update() — gravity, movement, collisions"]
            Snapshot["serialize / applyWorldSnapshot"]
            Messages["Network message types"]
        end
    end

    ClientPkg -->|"imports"| GamePkg
    ServerPkg -->|"imports"| GamePkg

    Input --> WSClient
    WSClient --> Canvas
    WSServer --> GameServer
    GameServer --> TickLoop
    GameServer --> World
    World --> Physics
    GameServer --> Snapshot
```

### Authoritative server game loop

```mermaid
sequenceDiagram
    participant Browser as Client (browser)
    participant WS as WebSocket
    participant GS as GameServer
    participant PA as PlayerActor
    participant W as World
    participant U as update()

    Browser->>WS: connect
    WS->>GS: addClient()
    GS->>GS: spawnPlayer() + new PlayerActor
    GS-->>Browser: welcome { playerId }
    GS-->>Browser: snapshot { players, platforms }

    loop Every DELTA_T (~60fps)
        Browser->>WS: input { move | jump | stop }
        WS->>GS: queueInput()
        GS->>GS: tick()
        GS->>PA: actor.send(input)
        PA->>PA: process() → receive()
        Note over PA: sets velocity / jump
        GS->>W: world.step(DELTA_T)
        W->>PA: actor.process() (all actors)
        W->>U: update(dt, game)
        Note over U: gravity → position → AABB collisions
        GS->>GS: serializeWorldSnapshot()
        GS-->>Browser: snapshot (broadcast to all clients)
        Browser->>Browser: applyWorldSnapshot() + render canvas
    end

    Browser->>WS: disconnect
    WS->>GS: removeClient()
    GS->>GS: remove actor + player, broadcast snapshot
```

### Shared game package internals

```mermaid
flowchart LR
    subgraph GamePackage["packages/game"]
        DemoLevel["levels/demo.ts"]
        LevelAPI["level.ts<br/>createGameFromLevel<br/>spawnPlayer"]
        Entities["entities.ts<br/>Game, Player, Platform"]

        subgraph ActorSystem["Actor system"]
            ActorBase["Actor&lt;M&gt;<br/>mailbox + process()"]
            PlayerActor["PlayerActor<br/>move / jump / stop"]
        end

        World["world.ts<br/>step(): actors → update()"]
        Update["update.ts<br/>gravity, movement, AABB"]
        Snapshot["snapshot.ts<br/>serialize / apply"]
        NetMsgs["messages/network.ts<br/>welcome, snapshot, input"]
        PlayerMsgs["messages/player.ts<br/>move, jump, stop"]
    end

    DemoLevel --> LevelAPI
    LevelAPI --> Entities
    PlayerActor --> ActorBase
    PlayerActor --> PlayerMsgs
    World --> Update
    World --> ActorBase
    Snapshot --> Entities
    Snapshot --> NetMsgs
```

### Design summary

| Concern | How it's handled |
|---|---|
| **Source of truth** | Server runs `World.step()` on a fixed tick (`DELTA_T`) |
| **Input** | Client sends `PlayerActorMessage` over WebSocket; server queues per client |
| **Simulation** | `PlayerActor` applies input to velocity; `update()` handles physics and platform collisions |
| **State sync** | Server broadcasts full world snapshots; client calls `applyWorldSnapshot()` |
| **Shared logic** | Both client and server import `@multiplayer-game-sim/game` so types and simulation rules stay aligned |
