import { tsConfigToSwcOptions } from './ts-config-to-swc-options.js';
import type { TsConfigResult } from 'get-tsconfig';

import micromatch from 'micromatch';
import test from 'ava';

// Mock para micromatch.makeRe
const originalMakeRe = micromatch.makeRe;
test.before(() => {
    micromatch.makeRe = (pattern) => ({ 
        source: `mocked_${pattern}` 
    } as RegExp);
});

test.after(() => {
    micromatch.makeRe = originalMakeRe;
});

// Test básico con configuración mínima
test('Converts an empty tsconfig to basic swc options', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {}
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.is(options.cwd, '/tralalero/tralala');
    t.is(options.jsc?.target, 'es2022');
    t.is(options.isModule, true);
    t.deepEqual(options.module, {
        strict: true,
        strictMode: true,
        type: 'es6',
        resolveFully: true
    });
});

// Test de cache
test('Returns cloned options from cache for the same tsconfig', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                target: 'ES2020'
            }
        }
    };

    // When
    const options1 = tsConfigToSwcOptions(tsConfigResult);
    // Modificamos la primera salida para verificar que la segunda sea un clon
    options1.jsc!.target = 'es2019';
    const options2 = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.not(options1, options2);
    t.is(options2.jsc?.target, 'es2020');
});

// Test de decoradores
test('Correctly configure decorator options', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                experimentalDecorators: true,
                emitDecoratorMetadata: true
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.true(options.jsc?.parser?.decorators);
    t.true(options.jsc?.transform?.decoratorMetadata);
});

// Test de opciones de módulo
test('Correctly configure commonjs', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                module: 'commonjs'
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.false(options.isModule);
});

test('Correctly configure nodenext modules', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                module: 'nodenext'
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.true(options.isModule);
    t.is(options.module?.type, 'nodenext');
});

// Test de source maps
test('Correctly configure sourceMaps inline', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                inlineSourceMap: true,
                sourceRoot: '/src'
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.is(options.sourceMaps, 'inline');
    t.is(options.sourceRoot, '/src');
});

test('Correctly configure external sourceMaps', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                sourceMap: true
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.true(options.sourceMaps);
});

// Test de JSX
test('Correctly configure support for JSX/TSX', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                jsx: 'react'
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.true((options.jsc?.parser as any)?.tsx);
});

// Test de paths
test('Correctly configure baseUrl and paths', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                baseUrl: './src',
                paths: {
                    '@/*': ['*']
                }
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.is(options.jsc?.baseUrl, '/tralalero/tralala/src');
    t.deepEqual(options.jsc?.paths, {
        '@/*': ['*']
    });
});

// Test de exclude
test.skip('Correctly transform exclude patterns', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            exclude: [
                '**/*.test.ts',
                'node_modules'
            ]
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.deepEqual(options.exclude, [
        'mocked_/tralalero/tralala/**/*.test.ts',
        'mocked_/tralalero/tralala/node_modules'
    ]);
});

// Test de comentarios
test('Correctly configure comment preservation', t => {
    // Given
    const tsConfigResult: TsConfigResult = {
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                removeComments: true
            }
        }
    };

    // When
    const options = tsConfigToSwcOptions(tsConfigResult);

    // Then
    t.false(options.jsc?.preserveAllComments);
});