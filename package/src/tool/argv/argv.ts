import type { NodeProcessInstance } from './interfaces/index.js';

export class Argv {
    #raw: string[];
    get raw(): string[] {
        return this.#raw.slice();
    }

    #main: string[];
    get main(): string[] {
        return this.#main.slice();
    }

    #flags: Map<string, string[]>;
    get flags(): Map<string, string[]> {
        const flagsCopy = new Map<string, string[]>();
        for (const [key, value] of this.#flags.entries()) {
            flagsCopy.set(key, value.slice());
        }
        return flagsCopy;
    }

    constructor(processInstance?: NodeProcessInstance) {
        const argv = processInstance?.argv || process.argv;
        const args = argv.slice(2);

        this.#raw = [];
        this.#main = [];
        this.#flags = new Map();
        let currentFlag: string | null = null;
        for (const arg of args) {
            this.#raw.push(arg);
            if (arg.startsWith('--')) {
                if (currentFlag) {
                    this.#flags.set(currentFlag, []);
                }
                currentFlag = arg;
            } else if (currentFlag) {
                const values = this.#flags.get(currentFlag) || [];
                values.push(arg);
                this.#flags.set(currentFlag, values);
                currentFlag = null;
            } else {
                this.#main.push(arg);
            }
        }
        if (currentFlag && !this.#flags.has(currentFlag)) {
            this.#flags.set(currentFlag, []);
        }
    }
}