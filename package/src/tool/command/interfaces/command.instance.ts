import type { Argv } from '@tool/argv/index.js';

export interface CommandInstance {
    execute(argv: Argv): Promise<void>;
}