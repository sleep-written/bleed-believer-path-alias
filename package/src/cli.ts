#! /usr/bin/env node
import { CommandRouter } from '@tool/command/command-router.js';
import { BuildCommand } from './commands/build.command.js';
import { StartCommand } from './commands/start.command.js';
import { WatchCommand } from './commands/watch.command.js';
import { logger } from '@/logger.js';

try {
    const router = new CommandRouter([
        BuildCommand,
        StartCommand,
        WatchCommand,
    ]);

    await router.execute();

} catch (err: any) {
    logger.error(err?.message ?? 'Error not identified.');

}