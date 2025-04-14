import type { NodeProcessInstance } from './interfaces/index.js';

import { Argv } from './argv.js';
import test from 'ava';

test('Parse "hello world"', t => {
    // Weld
    const process: NodeProcessInstance = {
        argv: ['node', 'script.js', 'hello', 'world'],
    };

    // When
    const argv = new Argv(process);

    // Then
    t.deepEqual(argv.main, ['hello', 'world']);
    t.deepEqual(argv.flags, new Map());
});

test('Parse "hello world --alive true"', t => {
    // Weld
    const process: NodeProcessInstance = {
        argv: [
            'node',
            'script.js',
            'hello', 'world', '--alive', 'true'
        ],
    };

    // When
    const argv = new Argv(process);

    // Then
    t.deepEqual(argv.main, ['hello', 'world']);
    t.deepEqual(Array.from(argv.flags.keys()), [ '--alive' ]);
    t.deepEqual(argv.flags.get('--alive'), [ 'true' ]);
});

test('Parse "hello world --alive true --destroy false"', t => {
    // Weld
    const process: NodeProcessInstance = {
        argv: [
            'node',
            'script.js',
            'hello', 'world', '--alive', 'true', '--destroy', 'false'
        ],
    };

    // When
    const argv = new Argv(process);

    // Then
    t.deepEqual(argv.main, ['hello', 'world']);
    t.deepEqual(Array.from(argv.flags.keys()), [ '--alive', '--destroy' ]);
    t.deepEqual(argv.flags.get('--alive'), [ 'true' ]);
    t.deepEqual(argv.flags.get('--destroy'), [ 'false' ]);
});

test('Parse "hello world --alive true --destroy false reeeee"', t => {
    // Weld
    const process: NodeProcessInstance = {
        argv: [
            'node',
            'script.js',
            'hello', 'world', '--alive', 'true', '--destroy', 'false', 'reeeee'
        ],
    };

    // When
    const argv = new Argv(process);

    // Then
    t.deepEqual(argv.main, ['hello', 'world', 'reeeee']);
    t.deepEqual(Array.from(argv.flags.keys()), [ '--alive', '--destroy' ]);
    t.deepEqual(argv.flags.get('--alive'), [ 'true' ]);
    t.deepEqual(argv.flags.get('--destroy'), [ 'false' ]);
});