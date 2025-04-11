import type { SwcTranspilerInjection } from './interfaces/index.js';
import type { TsConfigResult } from 'get-tsconfig';
import type { Entry } from 'fast-glob';

import { dirname, join, normalize } from 'path';
import micromatch from 'micromatch';

export function swcTranspilerMock(
    options: TsConfigResult & { filesystem: Record<string, string>; }
): {
    outFiles: { path: string; code?: string; }[];
    injector: Partial<SwcTranspilerInjection>;
    tsConfigResult: TsConfigResult;
} {
    const tsConfigResult: TsConfigResult = {
        path: options.path,
        config: options.config
    };

    const cwd = dirname(options.path);
    const outFiles: { path: string; code?: string; }[] = [];
    const injector: Partial<SwcTranspilerInjection> = {
        process: { cwd: () => cwd },
        fastGlob: async (include, { ignore }) => {
            const includeArr = typeof include === 'string' ? [ include ] : include;
            const excludeArr = ignore ?? [];

            const includeReg = includeArr
                .map(x => join(cwd, x))
                .map(x => micromatch.makeRe(normalize(x)));

            const excludeReg = excludeArr
                .map(x => join(cwd, x))
                .map(x => micromatch.makeRe(normalize(x)));

            return Object
                .entries(options.filesystem)
                .map(([ k ]) => join(cwd, k))
                .map(path => ({ path } as Entry))
                .filter(({ path }) => 
                     includeReg.some(x => x.test(path)) &&
                    !excludeReg.some(x => x.test(path))
                );
        },
        transformFile: async (path, o) => {
            const [ _, code ] = Object
                .entries(options.filesystem)
                .find(([ k ]) => join(cwd, k) === path) ?? [];

            return {
                code: code + `\n// transpiled file`,
                map: o?.sourceMaps
                    ?   `// map file`
                    :   undefined
            };
        },
        getTsConfig: () => tsConfigResult,
        writeFile: async (path, code) => {
            outFiles.push({ path, code });
        },
        mkdir: async (path) => {
            outFiles.push({ path });
            return path;
        }
    };

    return { tsConfigResult, injector, outFiles };
}