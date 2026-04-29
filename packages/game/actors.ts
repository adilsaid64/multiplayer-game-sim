import { Player } from "./entities";
import { JUMP_HEIGHT, PLAYER_MOVE_SPEED } from "./constants";

abstract class Actor<M extends { type: string }> {
    private mailbox: M[] = [];

    send(message: M) {
        this.mailbox.push(message);
    }

    process() {
        while (this.mailbox.length > 0) {
            const message = this.mailbox.shift();
            if (message) {
                this.receive(message);
            }
        }
    }

    protected abstract receive(message: M): void;
}

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
    protected abstract receive(message: M): void;
}

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