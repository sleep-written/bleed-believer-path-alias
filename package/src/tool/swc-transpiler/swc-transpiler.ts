import type {
    SwcTranspilerInjection,
    TransformFileFunction,
    GetTsConfigFunction,
    SourceCode,
    WriteFileFunction,
    FastGlobFunction,
    ProcessInstance,
    MkdirFunction,
} from './interfaces/index.js';
import type { TsConfigResult } from 'get-tsconfig';

import { basename, dirname, join, normalize, relative } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { transformFile } from '@swc/core';
import fastGlob from 'fast-glob';

import { tsConfigToSwcOptions } from './ts-config-to-swc-options.js';
import { getTsConfig } from '@tool/get-ts-config/index.js';
import { getOutPath } from './get-out-path.js';

export class SwcTranspiler {
    #transformFile: TransformFileFunction;
    #getTsConfig: GetTsConfigFunction;
    #writeFile: WriteFileFunction;
    #fastGlob: FastGlobFunction;
    #process: ProcessInstance;
    #mkdir: MkdirFunction;
    #path?: string | null;

    constructor(path?: string | null, injection?: Partial<SwcTranspilerInjection>) {
        this.#transformFile = injection?.transformFile ?? transformFile;
        this.#getTsConfig = injection?.getTsConfig ?? getTsConfig;
        this.#writeFile = injection?.writeFile ?? writeFile;
        this.#fastGlob = injection?.fastGlob ?? fastGlob;
        this.#process = injection?.process ?? process;
        this.#mkdir = injection?.mkdir ?? mkdir;
        this.#path = path;
    }

    async getSourceCode(tsConfigResult: TsConfigResult): Promise<SourceCode[]> {
        const tsConfig = tsConfigResult.config;
        const include: string[] = [];
        if (tsConfig.compilerOptions?.rootDir) {
            include.push(normalize(join(
                tsConfig.compilerOptions.rootDir,
                './**/*.{ts,mts,cjs}'
            )));
        }

        if (tsConfig.compilerOptions?.rootDirs) {
            const rootDirs = tsConfig.compilerOptions.rootDirs
                .map(x => join(x, './**/*.{ts,mts,cjs}'))
                .map(x => normalize(x));
    
            include.push(...rootDirs);
        }

        if (include.length === 0) {
            include.push(normalize('./**/*.{ts,mts,cjs}'));
        }

        const exclude = tsConfigResult.config.exclude ?? [];
        exclude.unshift(normalize('./**/node_modules/*'));

        include.forEach((_, i) => {
            include[i] = normalize(include[i]);
        });

        exclude.forEach((_, i) => {
            exclude[i] = normalize(exclude[i]);
        });

        const sources = await this.#fastGlob(include, {
            dot: true,
            cwd: dirname(tsConfigResult.path),
            ignore: exclude,
            absolute: true,
            globstar: true,
            onlyFiles: true,
            objectMode: true
        });

        return sources.map(({ path }) => ({
            rootPath: path,
            outPath: getOutPath(path, tsConfigResult)
        }));
    }

    async build(callback?: (source?: string, output?: string) => void) {
        const tsConfigResult = this.#getTsConfig(this.#path, { process: this.#process });
        if (!tsConfigResult || !tsConfigResult.config) {
            throw new Error('Invalid tsConfigResult provided.');
        }

        const cwd = dirname(tsConfigResult.path);
        const sources = await this.getSourceCode(tsConfigResult);
        for (const source of sources) {
            const swcOptions = tsConfigToSwcOptions(tsConfigResult);

            // delete swcOptions.exclude;
            await this.#mkdir(
                dirname(source.outPath),
                { recursive: true }
            );

            if (swcOptions.sourceMaps) {
                swcOptions.sourceFileName = source.rootPath;
            }

            let { code, map } = await this.#transformFile(source.rootPath, swcOptions);
            if (map && swcOptions.sourceMaps) {
                code = `${code}\n\n//# sourceMappingURL=${basename(source.outPath)}.map`;
                await this.#writeFile(`${source.outPath}.map`, map, 'utf-8');
            }

            await this.#writeFile(source.outPath, code, 'utf-8');
            callback?.(
                relative(cwd, source.rootPath),
                relative(cwd, source.outPath)
            );
        }
    }
}