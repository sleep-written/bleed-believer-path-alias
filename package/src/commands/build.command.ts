import type { CommandInstance } from '@tool/command/index.js';

import { logger, separator } from '@/logger.js';
import { SWCTranspiler } from '@tool/swc-transpiler/index.js';
import { Command } from '@tool/command/index.js';
import { Argv } from '@tool/argv/index.js';

@Command([ 'build', '*' ])
export class BuildCommand implements CommandInstance {
    async execute(argv: Argv): Promise<void> {
        logger.info('Building...⤵');
        separator();

        const [ _, path ] = argv.main;
        const transpiler = new SWCTranspiler(path);
        await transpiler.build(source => {
            logger.info(`Transpiled → "${source}".-`);
        });

        separator();
        logger.info('Completed! ⤴');
    }
}