import {
  cp,
  lstat,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { readDesktopConfig } from './desktop-config.mjs';

export async function exists(file) {
  try {
    await lstat(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false;
    throw error;
  }
}

export function desktopIdentity(packageName = 'nextpier', options = {}) {
  const slug = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase();
  const name = options.name ?? slug;
  const id =
    options.id ?? `com.example.${/^[a-z]/.test(slug) ? slug : `app-${slug}`}`;
  if (
    !name.trim() ||
    name !== name.trim() ||
    name.length > 80 ||
    /[\x00-\x1f/\\:*?"<>|]/.test(name) ||
    /^[.]+$/.test(name)
  ) {
    throw new Error('--name 必须是可用于文件名的应用名称（1 至 80 字符）');
  }
  if (!/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*){2,}$/.test(id)) {
    throw new Error('--id 必须是至少三段的反向域名，例如 com.example.myapp');
  }
  return { name, id };
}

export async function upgradeWails(root, templateRoot, options = {}) {
  const packagePath = path.join(root, 'package.json');
  const packageSource = await readFile(packagePath, 'utf8');
  const pkg = JSON.parse(packageSource);
  if (!pkg.dependencies?.next) throw new Error('当前目录不是 Next.js 项目');
  const identity = desktopIdentity(pkg.name, options);
  const target = path.join(root, 'desktop');
  if (await exists(target)) {
    const existing = await readDesktopConfig(root);
    if (!existing) throw new Error('desktop/ 已存在，拒绝覆盖');
    const { config: marker, file } = existing;
    if (
      (options.name && options.name !== marker.name) ||
      (options.id && options.id !== marker.id)
    ) {
      throw new Error(
        `应用名称或 ID 已配置；请编辑 desktop/${file}、main.go 和 wails.json`
      );
    }
    return { ...marker, created: false };
  }
  const configPath = path.join(root, 'next.config.ts');
  if (
    !(await exists(configPath)) ||
    !/(?:NEXTPIER|MYNEXTJS)_DESKTOP/.test(await readFile(configPath, 'utf8'))
  ) {
    throw new Error(
      'next.config.ts 缺少 NEXTPIER_DESKTOP 配置，请按 docs/desktop.md 配置后重试'
    );
  }
  const scripts = Object.fromEntries(
    ['dev', 'build', 'doctor'].map((command) => [
      `desktop:${command}`,
      `node scripts/desktop.mjs ${command}`,
    ])
  );
  for (const [key, value] of Object.entries(scripts)) {
    if (pkg.scripts?.[key] && pkg.scripts[key] !== value)
      throw new Error(`${key} 已存在，拒绝覆盖`);
  }
  const ignorePath = path.join(root, '.gitignore');
  const originalIgnore = (await exists(ignorePath))
    ? await readFile(ignorePath, 'utf8')
    : null;
  const ignores = [
    '/desktop/runtime.tar.gz',
    '/desktop/build/bin/',
    '/desktop/frontend/wailsjs/',
  ];
  const missingIgnores = ignores.filter(
    (line) => !originalIgnore?.split(/\r?\n/).includes(line)
  );
  const temporary = await mkdtemp(path.join(root, '.nextpier-wails-'));
  let installed = false;
  try {
    await cp(templateRoot, temporary, { recursive: true });
    async function render(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await render(file);
          continue;
        }
        if (!entry.name.endsWith('.tmpl')) continue;
        const source = await readFile(file, 'utf8');
        const content = source
          .replaceAll('@@APP_NAME@@', JSON.stringify(identity.name))
          .replaceAll('@@APP_ID@@', JSON.stringify(identity.id))
          .replaceAll('@@PLIST_ID@@', identity.id)
          .replaceAll('@@PLIST_NAME@@', identity.name.replaceAll('&', '&amp;'));
        await writeFile(file.slice(0, -5), content);
        await rm(file);
      }
    }
    await render(temporary);
    const icon = path.join(root, 'public', 'logo.png');
    if (await exists(icon))
      await cp(icon, path.join(temporary, 'build', 'appicon.png'));
    const marker = {
      generator: 'nextpier-wails',
      schemaVersion: 1,
      ...identity,
    };
    await writeFile(
      path.join(temporary, 'nextpier.json'),
      `${JSON.stringify(marker, null, 2)}\n`
    );
    await rename(temporary, target);
    installed = true;
    await writeFile(
      packagePath,
      `${JSON.stringify({ ...pkg, scripts: { ...pkg.scripts, ...scripts } }, null, 2)}\n`
    );
    if (missingIgnores.length)
      await writeFile(
        ignorePath,
        `${originalIgnore ?? ''}\n# Wails generated output\n${missingIgnores.join('\n')}\n`
      );
    return { ...marker, created: true };
  } catch (error) {
    if (installed) {
      await writeFile(packagePath, packageSource);
      if (originalIgnore !== null) await writeFile(ignorePath, originalIgnore);
      else await rm(ignorePath, { force: true });
      await rm(target, { recursive: true, force: true });
    }
    throw error;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
