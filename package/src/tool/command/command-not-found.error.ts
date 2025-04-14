export class CommandNotFoundError extends Error {
    constructor() {
        super('Command not found.');
        this.name = 'CommandNotFoundError';
    }
}