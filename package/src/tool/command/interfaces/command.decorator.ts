import type { CommandConstructor } from './command.constructor.js';

export type CommandDecorator = (target: CommandConstructor) => void;