import type { TransformFileFunction } from './transform-file.function.js';
import type { GetTsConfigFunction } from './get-ts-config.function.js';
import type { WriteFileFunction } from './write-file.function.js';
import type { FastGlobFunction } from './fast-glob.function.js';
import type { ProcessInstance } from './process.instance.js';
import type { MkdirFunction } from './mkdir.function.js';

export interface SwcTranspilerInjection {
    transformFile: TransformFileFunction;
    getTsConfig: GetTsConfigFunction;
    writeFile: WriteFileFunction;
    fastGlob: FastGlobFunction;
    process: ProcessInstance;
    mkdir: MkdirFunction;
}