import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { t as listTar } from 'tar';
import {
  desktopIdentity,
  exists,
  upgradeWails,
} from '../lib/upgrade-wails.mjs';
import { prepareRuntime } from '../lib/desktop-runtime.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const templates = path.join(repository, 'templates', 'wails');

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mynextjs-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({
      name: 'test-app',
      dependencies: { next: '16.2.1' },
      scripts: { dev: 'next dev --port 3900', custom: 'echo keep' },
    })
  );
  await writeFile(
    path.join(root, 'next.config.ts'),
    "export default { ...(process.env.MYNEXTJS_DESKTOP === '1' ? { output: 'standalone' } : {}) };\n"
  );
  await writeFile(path.join(root, '.gitignore'), 'node_modules\n.env*\n');
  return root;
}

test('upgrade generates a complete Wails project and preserves existing web settings', async (t) => {
  const root = await fixture(t);
  const result = await upgradeWails(root, templates, {
    name: '测试工作台',
    id: 'com.example.workbench',
  });
  assert.equal(result.created, true);
  const pkg = JSON.parse(
    await readFile(path.join(root, 'package.json'), 'utf8')
  );
  assert.equal(pkg.scripts.dev, 'next dev --port 3900');
  assert.equal(pkg.scripts.custom, 'echo keep');
  assert.equal(pkg.scripts['desktop:dev'], 'node scripts/desktop.mjs dev');
  const desktop = path.join(root, 'desktop');
  const config = JSON.parse(
    await readFile(path.join(desktop, 'wails.json'), 'utf8')
  );
  assert.equal(config.name, '测试工作台');
  assert.equal(config['frontend:build'], 'node ../scripts/verify-runtime.mjs');
  for (const file of [
    'main.go',
    'server.go',
    'middleware.go',
    'runtime.go',
    'process_windows.go',
    'process_unix.go',
    'go.mod',
    'runtime.tar.gz',
  ]) {
    assert.equal(await exists(path.join(desktop, file)), true, file);
  }
  const plist = await readFile(
    path.join(desktop, 'build', 'darwin', 'Info.plist'),
    'utf8'
  );
  assert.ok(plist.includes('<string>com.example.workbench</string>'));
  assert.ok(!plist.includes('@@'));
});

test('upgrade is idempotent and preserves edited desktop files', async (t) => {
  const root = await fixture(t);
  await upgradeWails(root, templates, {
    name: 'My App',
    id: 'com.example.myapp',
  });
  const main = path.join(root, 'desktop', 'main.go');
  await writeFile(main, '// user changes\n');
  const packageBefore = await readFile(path.join(root, 'package.json'), 'utf8');
  const result = await upgradeWails(root, templates);
  assert.equal(result.created, false);
  assert.equal(result.name, 'My App');
  assert.equal(await readFile(main, 'utf8'), '// user changes\n');
  assert.equal(
    await readFile(path.join(root, 'package.json'), 'utf8'),
    packageBefore
  );
  await assert.rejects(
    upgradeWails(root, templates, { name: 'Other' }),
    /已配置/
  );
});

test('conflicting desktop directories and scripts fail before mutations', async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, 'desktop'));
  await writeFile(path.join(root, 'desktop', 'mine.txt'), 'keep');
  const before = await readFile(path.join(root, 'package.json'), 'utf8');
  await assert.rejects(upgradeWails(root, templates), /拒绝覆盖/);
  assert.equal(
    await readFile(path.join(root, 'desktop', 'mine.txt'), 'utf8'),
    'keep'
  );
  assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), before);
  const second = await fixture(t);
  await writeFile(
    path.join(second, 'package.json'),
    JSON.stringify({
      name: 'app',
      dependencies: { next: '16' },
      scripts: { 'desktop:build': 'custom-build' },
    })
  );
  await assert.rejects(upgradeWails(second, templates), /拒绝覆盖/);
  assert.equal(await exists(path.join(second, 'desktop')), false);
});

test('invalid app identities and missing Next config are rejected', async (t) => {
  for (const name of ['../oops', '', ' a ', 'bad/name', 'bad\\name'])
    assert.throws(() => desktopIdentity('app', { name }));
  for (const id of [
    'app',
    'com.example',
    'com.example.1app',
    'com.example.<app>',
  ])
    assert.throws(() => desktopIdentity('app', { id }));
  assert.deepEqual(desktopIdentity('@team/app'), {
    name: 'app',
    id: 'com.example.app',
  });
  assert.deepEqual(desktopIdentity('01-app'), {
    name: '01-app',
    id: 'com.example.app-01-app',
  });
  const root = await fixture(t);
  await writeFile(path.join(root, 'next.config.ts'), 'export default {};');
  await assert.rejects(upgradeWails(root, templates), /MYNEXTJS_DESKTOP/);
  assert.equal(await exists(path.join(root, 'desktop')), false);
});

test('runtime archive includes static/public, dereferences packages and excludes private files', async (t) => {
  const root = await fixture(t);
  await upgradeWails(root, templates);
  const standalone = path.join(root, '.next', 'standalone');
  async function file(relative, content) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  await file('.next/standalone/server.js', 'console.log("server");');
  await file(
    '.next/standalone/.next/server/app/[id]/page.js',
    'export default {};'
  );
  await file('.next/standalone/.env.local', 'SECRET=private');
  await file('.next/standalone/data/config.json', '{"theme":"dark"}');
  await file('.next/static/[turbopack]-chunk.js', 'console.log("chunk");');
  await file('public/logo.png', 'image');
  await file('public/data/demo.json', '{}');
  await file('public/.env', 'SECRET=private');
  await file('package-source/package.json', '{"name":"test-module"}');
  await mkdir(path.join(standalone, 'node_modules'), { recursive: true });
  await symlink(
    path.join(root, 'package-source'),
    path.join(standalone, 'node_modules', 'test-module'),
    process.platform === 'win32' ? 'junction' : 'dir'
  );
  const version = await prepareRuntime(root);
  assert.match(version, /^[a-f0-9]{20}$/);
  const entries = [];
  await listTar({
    file: path.join(root, 'desktop', 'runtime.tar.gz'),
    onReadEntry: (entry) =>
      entries.push({ path: entry.path, type: entry.type }),
  });
  assert.ok(entries.some((entry) => entry.path === './server.js'));
  assert.ok(
    entries.some(
      (entry) => entry.path === './.next/static/[turbopack]-chunk.js'
    )
  );
  assert.ok(entries.some((entry) => entry.path === './public/logo.png'));
  assert.ok(entries.some((entry) => entry.path === './public/data/demo.json'));
  assert.ok(
    entries.some(
      (entry) => entry.path === './node_modules/test-module/package.json'
    )
  );
  assert.ok(
    !entries.some(
      (entry) => entry.path.includes('.env') || entry.path.startsWith('./data/')
    )
  );
  assert.ok(!entries.some((entry) => entry.type === 'SymbolicLink'));
});

test('missing build output preserves the existing runtime archive', async (t) => {
  const root = await fixture(t);
  await upgradeWails(root, templates);
  const runtime = path.join(root, 'desktop', 'runtime.tar.gz');
  const before = await readFile(runtime);
  await assert.rejects(prepareRuntime(root), /standalone/);
  assert.deepEqual(await readFile(runtime), before);
});

test('the installed CLI upgrades from a project path containing spaces', async (t) => {
  const root = await fixture(t);
  const project = path.join(root, 'my project');
  await mkdir(project);
  await cp(path.join(root, 'package.json'), path.join(project, 'package.json'));
  await cp(
    path.join(root, 'next.config.ts'),
    path.join(project, 'next.config.ts')
  );
  await cp(path.join(repository, 'scripts'), path.join(project, 'scripts'), {
    recursive: true,
  });
  await cp(
    path.join(repository, 'templates'),
    path.join(project, 'templates'),
    { recursive: true }
  );
  await symlink(
    path.join(repository, 'node_modules'),
    path.join(project, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir'
  );
  const result = spawnSync(
    process.execPath,
    [
      path.join(project, 'scripts', 'desktop.mjs'),
      'upgrade',
      '--name',
      'My App',
      '--id',
      'com.example.app',
    ],
    { cwd: project, encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /已升级/);
  assert.equal(
    JSON.parse(
      await readFile(path.join(project, 'desktop', 'wails.json'), 'utf8')
    ).name,
    'My App'
  );
});
