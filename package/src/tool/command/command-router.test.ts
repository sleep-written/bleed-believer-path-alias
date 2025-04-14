import type { CommandInstance } from './interfaces/index.js';

import { CommandNotFoundError } from './command-not-found.error.js';
import { CommandRouter } from './command-router.js';
import { Command } from './command.js';
import { Argv } from '@tool/argv/index.js';
import test from 'ava';

test('Execute "hello world"', async t => {
    // Weld
    let message = '';
    const argv = new Argv({
        argv: [
            ...process.argv.slice(0, 2),
            'hello',
            'world'
        ]
    });

    @Command([ 'foo', 'bar' ])
    class FooBarCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'foo bar';
        }
    }

    @Command([ 'hello', 'world' ])
    class HelloWorldCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'hello world';
        }
    }

    @Command([ 'foo', 'baz' ])
    class FooBazCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'foo baz';            
        }
    }

    // When
    const router = new CommandRouter(
        [ FooBarCommand, HelloWorldCommand, FooBazCommand ],
        { argv }
    );

    await router.execute();

    // Then
    t.is(message, 'hello world');
});

test('Execute "kill :name"; :name = "ñeee"', async t => {
    // Weld
    let message = '';
    const argv = new Argv({
        argv: [
            ...process.argv.slice(0, 2),
            'kill',
            'ñeee'
        ]
    });

    @Command([ 'foo', 'bar' ])
    class FooBarCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'foo bar';
        }
    }

    @Command([ 'hello', 'world' ])
    class HelloWorldCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'hello world';
        }
    }

    @Command([ 'kill', ':name' ])
    class FooBazCommand implements CommandInstance {
        async execute(argv: Argv): Promise<void> {
            const [ _, name ] = argv.main;
            message = name;
        }
    }

    // When
    const router = new CommandRouter(
        [ FooBarCommand, HelloWorldCommand, FooBazCommand ],
        { argv }
    );

    await router.execute();

    // Then
    t.is(message, 'ñeee');
});

test('Execute "kill :name *"; :name = "ñeee"; * = [ "hello", "world", "--foo", "bar" ]', async t => {
    // Weld
    let message = '';
    let args: string[] = [];
    const argv = new Argv({
        argv: [
            ...process.argv.slice(0, 2),
            'kill',
            'ñeee',
            'hello',
            'world',
            '--foo',
            'bar'
        ]
    });

    @Command([ 'foo', 'bar' ])
    class FooBarCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'foo bar';
        }
    }

    @Command([ 'kill', ':name', '*' ])
    class FooBazCommand implements CommandInstance {
        async execute(argv: Argv): Promise<void> {
            const [ _, name ] = argv.main;
            message = name;
            args = argv.raw.slice(2);
        }
    }

    @Command([ 'hello', 'world' ])
    class HelloWorldCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'hello world';
        }
    }

    // When
    const router = new CommandRouter(
        [ FooBarCommand, FooBazCommand, HelloWorldCommand ],
        { argv }
    );

    await router.execute();

    // Then
    t.is(message, 'ñeee');
    t.deepEqual(args, [ 'hello', 'world', '--foo', 'bar' ]);
});

test('Execute "kill :name"; :name = "ñeee"; --flag = [ "777", "sects" ]', async t => {
    // Weld
    let message = '';
    let flag: string[] = [];

    const argv = new Argv({
        argv: [
            ...process.argv.slice(0, 2),
            'kill',
            'ñeee',
            '--flag',
            '777',
            '--flag',
            'sects'
        ]
    });

    @Command([ 'kill', ':name' ])
    class FooBazCommand implements CommandInstance {
        async execute(argv: Argv): Promise<void> {
            const [ _, name ] = argv.main;
            message = name;
            flag = argv.flags.get('--flag')!;
        }
    }

    @Command([ 'foo', 'bar' ])
    class FooBarCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'foo bar';
        }
    }

    @Command([ 'hello', 'world' ])
    class HelloWorldCommand implements CommandInstance {
        async execute(): Promise<void> {
            message = 'hello world';
        }
    }

    // When
    const router = new CommandRouter(
        [ FooBarCommand, HelloWorldCommand, FooBazCommand ],
        { argv }
    );

    await router.execute();

    // Then
    t.is(message, 'ñeee');
    t.deepEqual(flag, [ '777', 'sects' ]);
});

test('Throws a "Command not found" error', async t => {
    // Weld
    const argv = new Argv({
        argv: [
            ...process.argv.slice(0, 2),
            'kill',
            'ñeee',
            '--flag',
            '777',
            '--flag',
            'sects'
        ]
    });

    @Command([ '777', 'desantification' ])
    class FooBazCommand implements CommandInstance {
        async execute(): Promise<void> { }
    }

    @Command([ 'foo', 'bar' ])
    class FooBarCommand implements CommandInstance {
        async execute(): Promise<void> { }
    }

    @Command([ 'hello', 'world' ])
    class HelloWorldCommand implements CommandInstance {
        async execute(): Promise<void> { }
    }

    // When
    const router = new CommandRouter(
        [ FooBarCommand, HelloWorldCommand, FooBazCommand ],
        { argv }
    );

    await t.throwsAsync(
        () => router.execute(),
        {
            instanceOf: CommandNotFoundError
        }
    );
});
