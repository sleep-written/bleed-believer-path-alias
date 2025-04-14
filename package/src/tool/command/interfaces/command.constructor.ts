import type { CommandInstance } from './command.instance.js';
import type { CommandMetadata } from './command.metadata.js';

export interface CommandConstructor {
    new (): CommandInstance;
    meta?: CommandMetadata; 
}