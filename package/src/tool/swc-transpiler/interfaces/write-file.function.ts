import type { EncodingOption } from 'fs';

export type WriteFileFunction = (
    path: string,
    data: string,
    options?: EncodingOption
) => Promise<void>;