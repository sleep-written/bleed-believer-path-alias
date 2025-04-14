import type { NodeJsProcessInstance } from './interfaces/node-js-process.instance.js';

export class ProcessFake implements NodeJsProcessInstance {
    cwd(): string {
        return '/path/to/dir';
    }
}