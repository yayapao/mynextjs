import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { upgradeHarness } from '../lib/upgrade-harness.mjs';
import { exists } from '../lib/upgrade-wails.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const template = path.join(repository, 'templates', 'harness');

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'nextpier-harness-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'types'));
  await writeFile(path.join(root, 'types', 'index.ts'), '// user types\n');
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({
      name: 'my-app',
      dependencies: { next: '16.2.1', zod: '^4' },
      scripts: { dev: 'next dev --port 3900', 'desktop:build': 'keep-desktop' },
    })
  );
  await writeFile(
    path.join(root, 'nextpier.config.json'),
    JSON.stringify({
      custom: 'keep',
      features: { harness: false, custom: true },
    })
  );
  return root;
}

test('harness upgrade generates UI, SSE, core, plugins and optional dependencies', async (t) => {
  const root = await fixture(t);
  assert.equal((await upgradeHarness(root, template)).created, true);
  for (const file of [
    'app/harness/page.tsx',
    'app/harness/actions.ts',
    'app/api/harness/chat/route.ts',
    'harness/core/gateway.ts',
    'harness/nextpier.json',
    'harness/plugins/workbench.ts',
    'components/harness/panel.tsx',
    'types/harness.ts',
    '.env.harness.example',
  ])
    assert.ok(await exists(path.join(root, file)), file);
  const pkg = JSON.parse(
    await readFile(path.join(root, 'package.json'), 'utf8')
  );
  assert.equal(pkg.scripts.dev, 'next dev --port 3900');
  assert.equal(pkg.scripts['desktop:build'], 'keep-desktop');
  assert.ok(pkg.dependencies.openai);
  assert.ok(pkg.dependencies['eventsource-parser']);
  assert.ok(pkg.devDependencies.tsx);
  const config = JSON.parse(
    await readFile(path.join(root, 'nextpier.config.json'), 'utf8')
  );
  assert.deepEqual(config, {
    custom: 'keep',
    features: { harness: true, custom: true },
  });
  assert.match(
    await readFile(path.join(root, 'types', 'index.ts'), 'utf8'),
    /^\/\/ user types\nexport type/
  );
});

test('harness upgrade is idempotent and preserves edited source', async (t) => {
  const root = await fixture(t);
  await upgradeHarness(root, template);
  const plugin = path.join(root, 'harness', 'plugins', 'workbench.ts');
  await writeFile(plugin, '// user plugin\n');
  const before = await readFile(path.join(root, 'package.json'), 'utf8');
  assert.equal((await upgradeHarness(root, template)).created, false);
  assert.equal(await readFile(plugin, 'utf8'), '// user plugin\n');
  assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), before);
});

test('harness path and script conflicts fail before changing the project', async (t) => {
  for (const relative of [
    'harness',
    'app/harness',
    'components/harness',
    'types/harness.ts',
  ]) {
    const root = await fixture(t);
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), 'user file');
    const before = await readFile(path.join(root, 'package.json'), 'utf8');
    await assert.rejects(upgradeHarness(root, template), /拒绝覆盖/);
    assert.equal(
      await readFile(path.join(root, relative), 'utf8'),
      'user file'
    );
    assert.equal(
      await readFile(path.join(root, 'package.json'), 'utf8'),
      before
    );
  }
  const root = await fixture(t);
  const pkg = JSON.parse(
    await readFile(path.join(root, 'package.json'), 'utf8')
  );
  pkg.scripts['harness:doctor'] = 'custom-doctor';
  await writeFile(path.join(root, 'package.json'), JSON.stringify(pkg));
  await assert.rejects(upgradeHarness(root, template), /拒绝覆盖/);
  assert.equal(await exists(path.join(root, 'harness')), false);
});

test('an incomplete template rolls back generated files and metadata', async (t) => {
  const root = await fixture(t);
  const broken = path.join(root, 'broken-template');
  await cp(template, broken, { recursive: true });
  await rm(path.join(broken, 'components'), { recursive: true });
  const files = ['package.json', 'nextpier.config.json', 'types/index.ts'];
  const before = await Promise.all(
    files.map((file) => readFile(path.join(root, file), 'utf8'))
  );
  await assert.rejects(upgradeHarness(root, broken), /模板缺少/);
  assert.deepEqual(
    await Promise.all(
      files.map((file) => readFile(path.join(root, file), 'utf8'))
    ),
    before
  );
  assert.equal(await exists(path.join(root, 'harness')), false);
  assert.equal(await exists(path.join(root, 'lib/harness')), false);
});

test('harness CLI supports project paths with spaces and skip-install', async (t) => {
  const root = await fixture(t);
  const project = path.join(root, 'project with spaces');
  await mkdir(project);
  for (const file of ['package.json', 'nextpier.config.json', 'types'])
    await cp(path.join(root, file), path.join(project, file), {
      recursive: true,
    });
  for (const directory of ['scripts', 'templates'])
    await cp(path.join(repository, directory), path.join(project, directory), {
      recursive: true,
    });
  const result = spawnSync(
    process.execPath,
    [path.join(project, 'scripts', 'harness.mjs'), 'upgrade', '--skip-install'],
    { encoding: 'utf8', cwd: project }
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /已接入 Browser Harness/);
  assert.ok(await exists(path.join(project, 'harness', 'nextpier.json')));
});
