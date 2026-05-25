export abstract class Actor<M extends { type: string }> {
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
