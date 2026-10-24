import { cp, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// Local production startup mirrors the Docker standalone layout.
const root = process.cwd();
for (const file of ['.env.local', '.env']) {
  if (existsSync(path.join(root, file))) process.loadEnvFile(path.join(root, file));
}
const standalone = path.join(root, '.next/standalone');
try { await access(path.join(standalone, 'server.js')); }
catch { console.error('Exécute npm run build avant npm start.'); process.exit(1); }
await cp(path.join(root, '.next/static'), path.join(standalone, '.next/static'), { recursive: true });
await cp(path.join(root, 'db'), path.join(standalone, 'db'), { recursive: true });
process.env.HOSTNAME = '0.0.0.0';
await import(pathToFileURL(path.join(standalone, 'server.js')).href);
