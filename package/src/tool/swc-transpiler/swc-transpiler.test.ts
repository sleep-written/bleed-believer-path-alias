import { swcTranspilerMock } from './swc-transpiler.mock.js';
import { SwcTranspiler } from './swc-transpiler.js';
import test from 'ava';

test('Get files in a simple escenario', async t => {
    // Weld
    const { tsConfigResult, injector, outFiles } = swcTranspilerMock({
        path: '/tralalero/tralala/tsconfig.json',
        config: {
            compilerOptions: {
                outDir: 'dist',
                rootDir: 'src',

                target: 'ES2024',
                module: 'Node16',
                moduleResolution: 'Node16',
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
            },
            exclude: [
                './src/**/*.test.ts'
            ]
        },
        filesystem: {
            'node_modules/express/src/index.ts': `console.log('express.js');`,
            'node_modules/express/src/parse.ts': `console.log('express.js/parse');`,
            'src/index.test.ts': `console.log('main-test');`,
            'src/index.ts': `console.log('main-program');`,
        }
    });

    // When
    const swcTranspiler = new SwcTranspiler(null, injector);
    const srcFiles = await swcTranspiler.getSourceCode(tsConfigResult);
    await swcTranspiler.build();

    // Then
    t.deepEqual(srcFiles, [
        {
            outPath: '/tralalero/tralala/dist/index.js',
            rootPath: '/tralalero/tralala/src/index.ts',
        }
    ]);

    t.deepEqual(outFiles, [
        {
            path: '/tralalero/tralala/dist'
        },
        {
            path: '/tralalero/tralala/dist/index.js',
            code: `console.log('main-program');\n// transpiled file`
        }
    ]);
});