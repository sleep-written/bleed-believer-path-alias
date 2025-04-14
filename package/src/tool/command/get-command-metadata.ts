import type { CommandConstructor, CommandMetadata } from './interfaces/index.js';

export function getCommandMetadata(constructor: CommandConstructor): CommandMetadata {
    if (!constructor.meta) {
        throw new Error(`Command metadata not found for ${constructor.name}`);
    }

    const { path, description } = constructor.meta;
    const normalizedPath = path.map(x => x?.trim() ?? '');
    if (normalizedPath.some(x => x.length === 0)) {
        throw new Error(`Invalid command path for ${constructor.name}: Path contains empty elements.`);
    }

    if ((description ?? '').trim().length === 0) {
        throw new Error(`Command description not found for ${constructor.name}`);
    }

    return constructor.meta;
}