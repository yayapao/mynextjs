import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  desktopEnvironment,
  readDesktopConfig,
} from '../lib/desktop-config.mjs';
import { exists, upgradeWails } from '../lib/upgrade-wails.mjs';
import { prepareRuntime } from '../lib/desktop-runtime.mjs';

const templates = fileURLToPath(
  new URL('../../templates/wails/', import.meta.url)
);
const legacy = {
  generator: 'mynextjs',
  schemaVersion: 1,
  name: 'Existing App',
  id: 'com.example.existing',
};

async function fixture(t) {
  const root = await mkdtemp(
    path.join(os.tmpdir(), 'nextpier-desktop-config-')
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'desktop'));
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'existing-app', dependencies: { next: '16.2.1' } })
  );
  await writeFile(
    path.join(root, 'desktop', 'mynextjs.json'),
    JSON.stringify(legacy)
  );
  return root;
}

test('existing desktop projects keep their legacy identity and edited sources', async (t) => {
  const root = await fixture(t);
  const main = path.join(root, 'desktop', 'main.go');
  await writeFile(main, '// user changes\n');
  const before = await readFile(path.join(root, 'package.json'), 'utf8');
  assert.deepEqual(await upgradeWails(root, templates), {
    ...legacy,
    created: false,
  });
  assert.equal(await readFile(main, 'utf8'), '// user changes\n');
  assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), before);
  assert.equal(
    await exists(path.join(root, 'desktop', 'nextpier.json')),
    false
  );
  await assert.rejects(
    upgradeWails(root, templates, { id: 'com.example.other' }),
    /desktop\/mynextjs\.json/
  );
});

test('the primary marker takes precedence and invalid markers cannot fall back', async (t) => {
  const root = await fixture(t);
  const primary = { ...legacy, generator: 'nextpier-wails', name: 'Next App' };
  const marker = path.join(root, 'desktop', 'nextpier.json');
  await writeFile(marker, JSON.stringify(primary));
  assert.deepEqual(await readDesktopConfig(root), {
    config: primary,
    file: 'nextpier.json',
  });
  for (const invalid of [
    { ...primary, generator: 'other' },
    { ...primary, schemaVersion: 2 },
  ]) {
    await writeFile(marker, JSON.stringify(invalid));
    await assert.rejects(upgradeWails(root, templates), /不是兼容/);
  }
  await writeFile(marker, '{invalid');
  await assert.rejects(readDesktopConfig(root), SyntaxError);
});

test('runtime collection still accepts a legacy project marker', async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, '.next', 'standalone'), { recursive: true });
  await mkdir(path.join(root, '.next', 'static'), { recursive: true });
  await writeFile(
    path.join(root, '.next', 'standalone', 'server.js'),
    '// fixture\n'
  );
  assert.match(await prepareRuntime(root), /^[a-f0-9]{20}$/);
  assert.equal(
    await exists(path.join(root, 'desktop', 'runtime.tar.gz')),
    true
  );
});

test('new projects still accept the legacy Next.js config flag', async (t) => {
  const root = await fixture(t);
  await rm(path.join(root, 'desktop'), { recursive: true });
  await writeFile(path.join(root, 'next.config.ts'), '// MYNEXTJS_DESKTOP\n');
  assert.equal(
    (await upgradeWails(root, templates)).generator,
    'nextpier-wails'
  );
  assert.equal(await exists(path.join(root, 'desktop', 'nextpier.json')), true);
});

test('desktop commands pass both flags and preserve unrelated environment values', () => {
  const original = {
    EXAMPLE_SECRET: 'keep',
    NEXTPIER_DESKTOP: '0',
    MYNEXTJS_DESKTOP: '0',
  };
  assert.deepEqual(desktopEnvironment(original), {
    EXAMPLE_SECRET: 'keep',
    NEXTPIER_DESKTOP: '1',
    MYNEXTJS_DESKTOP: '1',
  });
  assert.equal(original.NEXTPIER_DESKTOP, '0');
});
