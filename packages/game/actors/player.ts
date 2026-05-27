import { JUMP_VELOCITY, PLAYER_MOVE_SPEED } from '../constants';
import type { PlayerActorMessage } from '../messages/player';
import { Player } from '../entities';
import { Actor } from './actors';

export type { PlayerActorMessage } from '../messages/player';

export class PlayerActor extends Actor<PlayerActorMessage> {
  private player: Player;

  constructor(player: Player) {
    super();
    this.player = player;
  }

  protected receive(message: PlayerActorMessage) {
    switch (message.type) {
      case 'move':
        this.player.velocity.x =
          message.direction === 'right' ? PLAYER_MOVE_SPEED : -PLAYER_MOVE_SPEED;
        break;

      case 'jump':
        if (this.player.isGrounded) {
          this.player.velocity.y = JUMP_VELOCITY;
          this.player.isGrounded = false;
        }
        break;

      case 'stop':
        this.player.velocity.x = 0;
        break;
    }
  }
}
