import type { CommandDecorator } from './interfaces/index.js';

export const Command = (path: string[], description?: string): CommandDecorator => target => {
    if (typeof description !== 'string') {
        description = 'Description not provided';
    }

    target.meta = { path, description };
}
