// Starts the Vite dev server and opens the Electron shell against it (hot reload in the desktop window).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const electronBinary = require('electron');

const server = await createServer({ server: { port: 5173, strictPort: true, host: '127.0.0.1' } });
await server.listen();
const url = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5173/';

const child = spawn(electronBinary, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_RENDERER_URL: url, ELECTRON_RUN_AS_NODE: undefined },
});
child.on('exit', async (code) => {
  await server.close();
  process.exit(code ?? 0);
});
