export type PlatformDefinition = {
  position: { x: number; y: number };
  size: { x: number; y: number };
};

export type LevelDefinition = {
  platforms: PlatformDefinition[];
  spawnPoints: { x: number; y: number }[];
  playerSize: { x: number; y: number };
};

export const demoLevel: LevelDefinition = {
  platforms: [
    { position: { x: 250, y: 250 }, size: { x: 300, y: 20 } },
    { position: { x: 100, y: 300 }, size: { x: 100, y: 20 } },
    { position: { x: 400, y: 300 }, size: { x: 100, y: 20 } },
  ],
  spawnPoints: [
    { x: 200, y: 510 },
    { x: 300, y: 510 },
  ],
  playerSize: { x: 20, y: 20 },
};
