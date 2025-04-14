import { Argv } from '@tool/argv/index.js';
import { isSourceCode } from '@bleed-believer/path-alias/utils';

const argv = new Argv();
console.log('argv raw:', argv.raw);
console.log('argv main:', argv.main);
console.log('argv flags:', argv.flags);
console.log('is source code:', isSourceCode(import.meta.url));