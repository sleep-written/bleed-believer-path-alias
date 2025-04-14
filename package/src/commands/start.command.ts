import type { CommandInstance } from '@tool/command/index.js';

import { logger, separator } from '@/logger.js';
import { NodeLauncher } from '@tool/node-launcher/index.js';
import { Command } from '@tool/command/index.js';
import { Argv } from '@tool/argv/index.js';

@Command([ 'start', ':path', '*' ])
export class StartCommand implements CommandInstance {
    async execute(argv: Argv): Promise<void> {
        logger.info('Starting...⤵');
        separator();

        const [ _, path, ...args ] = argv.raw;
        const launcher = new NodeLauncher(path, args);
        await launcher.initialize();

        separator();
        logger.info('Completed! ⤴');
    }
}