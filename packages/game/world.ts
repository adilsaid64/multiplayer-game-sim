import { update } from './update';
import type { Game } from './entities';
import type { Actor } from './actors/actors';

export class World {
  readonly game: Game;
  private readonly actors: Actor<{ type: string }>[] = [];

  constructor(game: Game) {
    this.game = game;
  }

  addActor(actor: Actor<{ type: string }>) {
    this.actors.push(actor);
  }

  step(dt: number) {
    for (const actor of this.actors) {
      actor.process();
    }
    update(dt, this.game);
  }
}
