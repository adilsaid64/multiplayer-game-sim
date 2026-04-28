import { Player } from "./entities";

type Message  = {
    type: string;
    [key: string]: any;
}

abstract class Actor {
    private mailbox: Message[] = [];

    send(message: Message) {
        this.mailbox.push(message);
    }

    process() {
        while (this.mailbox.length > 0){
            const message = this.mailbox.shift();
            if (message) {
                this.receive(message)
            }
        }
    }

    protected abstract receive(message: Message): void;
}

export class PlayerActor extends Actor {
    constructor(private player: Player) {
        super();
    }

    protected receive(message: Message) {
    }
}