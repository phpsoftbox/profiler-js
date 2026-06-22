import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const target = resolve('dist/ProfilerDebugPanel.css');

await mkdir(dirname(target), { recursive: true });
await copyFile(resolve('src/ProfilerDebugPanel.css'), target);
