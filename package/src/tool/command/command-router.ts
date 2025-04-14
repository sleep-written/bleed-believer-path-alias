import type { CommandConstructor, CommandRouterInjection } from './interfaces/index.js';

import { getCommandMetadata } from './get-command-metadata.js';
import { Argv } from '@tool/argv/index.js';
import { CommandNotFoundError } from './command-not-found.error.js';

export class CommandRouter {
    #constructors: CommandConstructor[] = [];
    #argv: Argv;

    constructor(constructors: CommandConstructor[], injection?: Partial<CommandRouterInjection>) {
        this.#constructors = constructors;
        this.#argv = injection?.argv ?? new Argv();
    }

    async execute(): Promise<void> {
        for (const constructor of this.#constructors) {
            const metadata = getCommandMetadata(constructor);
            if (
                metadata.path.at(-1) !== '*' &&
                metadata.path.length !== this.#argv.main.length
            ) {
                continue;
            }

            const isMatch = metadata.path.every((part, index) => {
                if (part.startsWith(':') || part === '*') {
                    return true;
                } else {
                    return this.#argv.main[index] === part;
                }
            });

            if (isMatch) {
                const instance = new constructor();
                return instance.execute(this.#argv);
            }
        }

        throw new CommandNotFoundError();
    }
}