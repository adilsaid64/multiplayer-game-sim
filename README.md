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

```
Client: keyboard → WebSocket input → render server snapshot
Server: collect inputs → PlayerActor → world.step() → broadcast snapshot
```

Shared game logic lives in `packages/game`.
