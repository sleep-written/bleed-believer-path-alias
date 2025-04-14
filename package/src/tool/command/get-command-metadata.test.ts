import { getCommandMetadata } from './get-command-metadata.js';
import { Command } from './command.js';
import test from 'ava';

test('Add metadata', t => {
    // Weld
    @Command([ 'start' ], 'Start the application')
    class StartCommand {
        async execute() {
            throw new Error('Not implemented');
        }
    }

    // When
    const { path: name, description } = getCommandMetadata(StartCommand);

    // Then
    t.deepEqual(name, [ 'start' ]);
    t.is(description, 'Start the application');
});

test('Throws error when metadata is missing', t => {
    // Weld
    class NoMetadataCommand {
        async execute() {
            throw new Error('Not implemented');
        }
    }

    // When/Then
    const error = t.throws(() => getCommandMetadata(NoMetadataCommand), {
        instanceOf: Error,
        message: 'Command metadata not found for NoMetadataCommand',
    });

    t.truthy(error);
});

test('Throws error when command description is empty', t => {
    // Weld
    @Command([ 'test' ], '')
    class EmptyDescriptionCommand {
        async execute() {
            throw new Error('Not implemented');
        }
    }

    // When/Then
    const error = t.throws(() => getCommandMetadata(EmptyDescriptionCommand), {
        instanceOf: Error,
        message: 'Command description not found for EmptyDescriptionCommand',
    });

    t.truthy(error);
});
