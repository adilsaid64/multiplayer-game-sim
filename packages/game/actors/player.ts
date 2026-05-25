import { JUMP_HEIGHT, PLAYER_MOVE_SPEED } from "../constants";
import { Player } from "../entities";
import { Actor } from "./actors";

type MoveMessage = {
  type: "move";
  direction: "left" | "right";
  dt: number;
};

type JumpMessage = {
  type: "jump";
  dt: number;
};

export type PlayerActorMessage = MoveMessage | JumpMessage;

export class PlayerActor extends Actor<PlayerActorMessage> {
    private player: Player;

    constructor(player: Player) {
        super();
        this.player = player;
    }

    protected receive(message: PlayerActorMessage) {
        switch (message.type) {
            case "move":
                if (message.direction === "right") {
                    this.player.velocity.x = PLAYER_MOVE_SPEED * message.dt;
                } else {
                this.player.velocity.x = -PLAYER_MOVE_SPEED * message.dt;
                }
            break;

            case "jump":
                if (this.player.isGrounded) {
                    this.player.velocity.y = JUMP_HEIGHT * message.dt;
                    this.player.isGrounded = false;
                }
            break;
        }
    }
}