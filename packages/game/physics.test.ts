import assert from 'node:assert/strict';
import test from 'node:test';
import { GRAVITY, JUMP_VELOCITY, PLAYER_MOVE_SPEED } from './constants';
import { applyInput, clearJump, mergeInput } from './input';
import { createWorld, removePlayer, spawnPlayer } from './level';
import type { Level } from './level';
import { stepPhysics } from './physics';
import { serializeWorld, worldFromSnapshot } from './snapshot';

const openAir: Level = {
  platforms: [],
  spawnPoints: [{ x: 0, y: 100 }],
  playerSize: { x: 20, y: 20 },
};

const floor: Level = {
  platforms: [{ position: { x: 0, y: 0 }, size: { x: 100, y: 20 } }],
  spawnPoints: [{ x: 0, y: 20.1 }],
  playerSize: { x: 20, y: 20 },
};

test('gravity pulls a player downward', () => {
  const world = createWorld(openAir);
  const player = spawnPlayer(world, 'p', 0, openAir);
  const startY = player.position.y;

  stepPhysics(world, 0.1);

  assert.ok(player.position.y < startY);
  assert.equal(player.velocity.y, GRAVITY * 0.1);
});

test('a falling player lands on a platform', () => {
  const world = createWorld(floor);
  const player = spawnPlayer(world, 'p', 0, floor);

  stepPhysics(world, 1 / 30);

  assert.equal(player.grounded, true);
  assert.equal(player.velocity.y, 0);
  assert.equal(player.position.y, 20);
});

test('jump changes vertical velocity only while grounded', () => {
  const world = createWorld(openAir);
  const player = spawnPlayer(world, 'p', 0, openAir);

  player.grounded = true;
  applyInput(player, { moveX: 1, jump: true });
  assert.equal(player.velocity.x, PLAYER_MOVE_SPEED);
  assert.equal(player.velocity.y, JUMP_VELOCITY);
  assert.equal(player.grounded, false);

  player.velocity.y = 10;
  applyInput(player, { moveX: 0, jump: true });
  assert.equal(player.velocity.y, 10);
  assert.equal(player.velocity.x, 0);
});

test('mergeInput keeps a jump that arrived before the latest move', () => {
  const merged = mergeInput({ moveX: 1, jump: true }, { moveX: -1, jump: false });

  assert.deepEqual(merged, { moveX: -1, jump: true });
  assert.deepEqual(clearJump(merged), { moveX: -1, jump: false });
});

test('removePlayer drops that id and leaves the others', () => {
  const world = createWorld(openAir);
  spawnPlayer(world, 'a', 0, openAir);
  spawnPlayer(world, 'b', 1, openAir);

  removePlayer(world, 'a');

  assert.deepEqual(
    world.players.map((player) => player.id),
    ['b'],
  );
});

test('a snapshot is a copy the simulation can keep mutating', () => {
  const world = createWorld(floor);
  spawnPlayer(world, 'p', 0, floor);

  const copy = worldFromSnapshot(serializeWorld(world));
  const copiedPlayer = copy.players[0];
  assert.ok(copiedPlayer);
  copiedPlayer.position.x = 999;

  assert.notEqual(world.players[0]?.position.x, 999);
});
