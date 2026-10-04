#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { upgradeWails } from './lib/upgrade-wails.mjs';
import { prepareRuntime } from './lib/desktop-runtime.mjs';
import {
  desktopEnvironment,
  readDesktopConfig,
} from './lib/desktop-config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    name: { type: 'string' },
    id: { type: 'string' },
    platform: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});
const command = positionals[0];

function run(executable, args, cwd = root, env = process.env, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd,
      env,
      stdio: 'inherit',
      signal,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) =>
      code === 0
        ? resolve()
        : reject(new Error(`${executable} 退出：${signal ?? code}`))
    );
  });
}

function requireTool(tool) {
  const result = spawnSync(tool, ['version'], { encoding: 'utf8' });
  if (result.error || result.status !== 0)
    throw new Error(`缺少 ${tool}，请按 docs/desktop.md 安装桌面依赖`);
  console.log((result.stdout || result.stderr).trim());
}

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function develop() {
  const controller = new AbortController();
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  const next = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'dev',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      cwd: root,
      stdio: 'inherit',
      env: desktopEnvironment(),
      detached: process.platform !== 'win32',
    }
  );
  let exited = false;
  let startError;
  next.once('error', (error) => {
    startError = error;
    exited = true;
    controller.abort();
  });
  next.once('exit', () => {
    exited = true;
    controller.abort();
  });
  function cleanup() {
    if (exited || !next.pid) return;
    if (process.platform === 'win32')
      spawnSync('taskkill', ['/pid', String(next.pid), '/T', '/F']);
    else {
      try {
        process.kill(-next.pid, 'SIGTERM');
      } catch {}
    }
  }
  const cancel = () => {
    controller.abort();
    cleanup();
    process.exitCode = 130;
  };
  process.once('SIGINT', cancel);
  process.once('SIGTERM', cancel);
  try {
    const deadline = Date.now() + 60000;
    while (true) {
      if (exited) throw startError ?? new Error('Next.js 开发服务已退出');
      if (Date.now() > deadline) throw new Error('Next.js 开发服务启动超时');
      try {
        const response = await fetch(`${url}/api/health`, {
          signal: AbortSignal.timeout(1000),
        });
        if (response.ok) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    await run(
      'wails',
      ['dev', '-s', '-skipbindings', '-frontenddevserverurl', url],
      path.join(root, 'desktop'),
      {
        ...process.env,
        NEXTPIER_DEV_URL: url,
        MYNEXTJS_DEV_URL: url,
      },
      controller.signal
    );
  } finally {
    cleanup();
    process.removeListener('SIGINT', cancel);
    process.removeListener('SIGTERM', cancel);
  }
}

async function main() {
  if (values.help || !command) {
    console.log(
      '用法：node scripts/desktop.mjs upgrade [--name MyApp] [--id com.example.myapp]\n      node scripts/desktop.mjs doctor|dev|build [--platform darwin/universal]'
    );
    return;
  }
  if (
    !['upgrade', 'doctor', 'dev', 'build'].includes(command) ||
    positionals.length !== 1
  )
    throw new Error('未知命令');
  if (command !== 'upgrade' && (values.name || values.id))
    throw new Error('--name 和 --id 仅用于 upgrade');
  if (command !== 'build' && values.platform)
    throw new Error('--platform 仅用于 build');
  if (command === 'upgrade') {
    const result = await upgradeWails(
      root,
      path.join(root, 'templates', 'wails'),
      values
    );
    console.log(
      `${result.created ? '已升级' : '已配置'} Wails 应用：${result.name} (${result.id})\n下一步：npm run desktop:doctor，然后 npm run desktop:dev 或 npm run desktop:build`
    );
    return;
  }
  if (!(await readDesktopConfig(root)))
    throw new Error('请先运行 npm run upgrade:wails');
  requireTool('go');
  requireTool('wails');
  if (command === 'doctor') {
    await run('wails', ['doctor'], path.join(root, 'desktop'));
    return;
  }
  if (command === 'dev') {
    await develop();
    return;
  }
  const platform =
    values.platform ??
    `${process.platform}/${process.arch === 'x64' ? 'amd64' : process.arch}`;
  const host = process.platform === 'win32' ? 'windows' : process.platform;
  const buildPlatform = platform.replace(/^win32\//, 'windows/');
  if (
    !new RegExp(
      `^${host}/(amd64|arm64${host === 'darwin' ? '|universal' : ''})$`
    ).test(buildPlatform)
  ) {
    throw new Error(
      '请在目标操作系统构建；支持本机 amd64/arm64，macOS 另支持 darwin/universal'
    );
  }
  await run(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'build'],
    root,
    desktopEnvironment()
  );
  const version = await prepareRuntime(root);
  console.log(`桌面运行时已准备：${version}`);
  await run(
    'wails',
    ['build', '-clean', '-skipbindings', '-platform', buildPlatform],
    path.join(root, 'desktop')
  );
  console.log(`桌面应用输出：${path.join(root, 'desktop', 'build', 'bin')}`);
}

main().catch((error) => {
  console.error(`[NextPier] ${error.message}`);
  if (process.exitCode !== 130) process.exitCode = 1;
});
