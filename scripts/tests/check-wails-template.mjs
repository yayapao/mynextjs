import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { upgradeWails } from '../lib/upgrade-wails.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'mynextjs-go-check-'));
try {
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'template-check', dependencies: { next: '16.2.1' } })
  );
  await writeFile(path.join(root, 'next.config.ts'), '// MYNEXTJS_DESKTOP\n');
  await upgradeWails(
    root,
    fileURLToPath(new URL('../../templates/wails/', import.meta.url))
  );
  await new Promise((resolve, reject) => {
    const command = spawn('go', ['test', '-mod=mod', './...'], {
      cwd: path.join(root, 'desktop'),
      stdio: 'inherit',
    });
    command.once('error', reject);
    command.once('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Go template tests failed: ${code}`))
    );
  });
} finally {
  await rm(root, { recursive: true, force: true });
}
