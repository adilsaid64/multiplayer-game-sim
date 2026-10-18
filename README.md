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

Open two browser tabs to see multiple players. The server runs `stepPhysics()`; clients send input and render server snapshots.

## Architecture (Phase 1)

Phase 1 is server-authoritative: the server owns simulation, clients send input and render snapshots. Client-side prediction and reconciliation are planned but not implemented yet.

Shared game logic lives in `packages/game`.

### Monorepo layout

```mermaid
flowchart TB
    subgraph Monorepo["pnpm workspace"]
        subgraph ClientPkg["client (Vite)"]
            Canvas["HTML Canvas renderer"]
            Input["Keyboard sample"]
            WSClient["WebSocket client"]
        end

        subgraph ServerPkg["server (Node.js + ws)"]
            WSServer["WebSocketServer :8080"]
            GameServer["GameServer"]
            TickLoop["setInterval tick loop"]
        end

        subgraph GamePkg["@multiplayer-game-sim/game (shared)"]
            Types["Player, Platform, World, PlayerInput"]
            Level["createWorld / spawnPlayer"]
            Physics["applyInput + stepPhysics"]
            Snapshot["serializeWorld / worldFromSnapshot"]
            Messages["welcome, input, snapshot"]
        end
    end

    ClientPkg -->|"imports"| GamePkg
    ServerPkg -->|"imports"| GamePkg

    Input --> WSClient
    WSClient --> Canvas
    WSServer --> GameServer
    GameServer --> TickLoop
    GameServer --> Physics
    GameServer --> Snapshot
```

### Authoritative server game loop

```mermaid
sequenceDiagram
    participant Browser as Client (browser)
    participant WS as WebSocket
    participant GS as GameServer
    participant Sim as stepPhysics()

    Browser->>WS: connect
    WS->>GS: addClient()
    GS->>GS: spawnPlayer()
    GS-->>Browser: welcome { playerId }
    GS-->>Browser: snapshot

    loop Every DELTA_T (30fps)
        Browser->>WS: input { moveX, jump }
        WS->>GS: receiveInput()
        GS->>GS: tick()
        Note over GS: applyInput, then clear jump
        GS->>Sim: stepPhysics(world, dt)
        Note over Sim: gravity, movement, AABB
        GS-->>Browser: snapshot
        Browser->>Browser: worldFromSnapshot() + render
    end

    Browser->>WS: disconnect
    WS->>GS: removeClient()
    GS->>GS: removePlayer, broadcast snapshot
```

### Design summary

| Concern | How it's handled |
|---|---|
| **Source of truth** | Server runs `stepPhysics()` on a fixed tick (`DELTA_T`, 30fps) |
| **Input** | Client sends one `PlayerInput` sample per tick: `moveX` of -1, 0, or 1, plus a one-shot `jump` |
| **Simulation** | `applyInput()` writes velocity; `stepPhysics()` handles gravity, movement, and platform collisions |
| **State sync** | Server broadcasts a full snapshot; the client replaces its world from that snapshot |
| **Shared logic** | Both client and server import `@multiplayer-game-sim/game`, which is plain data and functions |
