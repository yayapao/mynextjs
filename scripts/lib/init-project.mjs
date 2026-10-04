import {
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rm,
  rmdir,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

const templateEntries = [
  '.agents', '.gitignore', '.prettierrc.json', 'AGENTS.md', 'LICENSE',
  'README.md', 'README.en.md', 'app', 'components', 'components.json',
  'docs', 'eslint.config.mjs', 'hooks', 'lib', 'next.config.ts',
  'nextpier.config.json', 'package.json', 'package-lock.json',
  'postcss.config.mjs', 'public', 'scripts', 'skills-lock.json',
  'templates', 'tsconfig.json', 'types',
];
const requiredFiles = [
  'package.json', 'package-lock.json', 'nextpier.config.json', 'app/page.tsx',
  'scripts/harness.mjs', 'scripts/desktop.mjs',
];
const preservedFiles = new Set(['LICENSE', 'README.md', 'README.en.md']);

async function stat(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function targetRoot(directory) {
  const suffix = [];
  let existing = path.resolve(directory);
  let info = await stat(existing);
  while (!info) {
    suffix.unshift(path.basename(existing));
    existing = path.dirname(existing);
    info = await stat(existing);
  }
  if (!info.isDirectory()) throw new Error(`目标路径不是普通目录：${existing}`);
  return path.join(await realpath(existing), ...suffix);
}

function contains(parent, child) {
  const relative = path.relative(parent, child);
  return !relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function listFiles(root, relative) {
  const info = await lstat(path.join(root, relative));
  if (info.isFile()) return [{ relative, mode: info.mode }];
  if (!info.isDirectory()) throw new Error(`模板包含不支持的文件：${relative}`);
  const files = [];
  for (const entry of await readdir(path.join(root, relative)))
    files.push(...await listFiles(root, path.join(relative, entry)));
  return files;
}

async function inspectTarget(root, relative) {
  const parts = relative.split(path.sep);
  let current = root;
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    const info = await stat(current);
    if (!info) return null;
    if (info.isSymbolicLink() || (index < parts.length - 1 && !info.isDirectory()))
      throw new Error(`目标路径冲突：${current}；请先合并已有内容`);
    if (index === parts.length - 1) return info;
  }
}

function renamePackage(relative, content, name) {
  if (!name || !['package.json', 'package-lock.json'].includes(relative)) return content;
  const data = JSON.parse(content.toString());
  data.name = name;
  if (relative === 'package-lock.json' && data.packages?.[''])
    data.packages[''].name = name;
  return Buffer.from(`${JSON.stringify(data, null, 2)}\n`);
}

function mergeIgnores(original, template) {
  const current = original.toString();
  const lines = new Set(current.split(/\r?\n/));
  const missing = template.toString().split(/\r?\n/).filter(line => line && !lines.has(line));
  if (!missing.length) return original;
  return Buffer.from(`${current}${current.endsWith('\n') ? '' : '\n'}\n# NextPier template\n${missing.join('\n')}\n`);
}

export async function initializeProject(directory, templateDirectory, options = {}) {
  const root = await targetRoot(directory);
  const templateRoot = await realpath(templateDirectory);
  if (contains(root, templateRoot) || contains(templateRoot, root))
    throw new Error('模板和目标目录必须相互独立，请把模板放到目标目录之外');
  if (options.name && !/^[a-z][a-z0-9-]{0,213}$/.test(options.name))
    throw new Error('--name 必须是小写英文 npm 包名，可含数字和连字符');
  for (const relative of requiredFiles) {
    if (!(await stat(path.join(templateRoot, relative)))?.isFile())
      throw new Error(`NextPier 模板不完整：缺少 ${relative}`);
  }
  const packageInfo = await inspectTarget(root, 'package.json');
  if (packageInfo) {
    if (!packageInfo.isFile()) throw new Error('package.json 已存在且不是普通文件');
    const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
    if (pkg.dependencies?.next && pkg.scripts?.['upgrade:harness'] && pkg.scripts?.['upgrade:wails']) {
      for (const relative of requiredFiles) {
        if (!(await inspectTarget(root, relative))?.isFile())
          throw new Error(`已有 NextPier 工程缺少 ${relative}，请恢复文件后继续`);
      }
      return { root, created: false, preserved: ['已有工程'] };
    }
    throw new Error('目标已有 package.json，请基于现有工程合并 NextPier，初始化命令不会覆盖它');
  }

  const files = [];
  for (const entry of templateEntries) {
    if (await stat(path.join(templateRoot, entry)))
      files.push(...await listFiles(templateRoot, entry));
  }
  const plans = [];
  const conflicts = [];
  const preserved = (await stat(path.join(root, '.git'))) ? ['.git'] : [];
  for (const file of files) {
    const existing = await inspectTarget(root, file.relative);
    let content = renamePackage(file.relative, await readFile(path.join(templateRoot, file.relative)), options.name);
    if (!existing) {
      plans.push({ ...file, content });
      continue;
    }
    if (!existing.isFile()) {
      conflicts.push(file.relative);
      continue;
    }
    if (preservedFiles.has(file.relative)) {
      preserved.push(file.relative);
      continue;
    }
    const original = await readFile(path.join(root, file.relative));
    if (file.relative === '.gitignore') content = mergeIgnores(original, content);
    if (content.equals(original)) continue;
    if (file.relative === '.gitignore') plans.push({ ...file, content, original });
    else conflicts.push(file.relative);
  }
  if (conflicts.length)
    throw new Error(`目标文件需要合并，未写入任何模板文件：${conflicts.join('、')}`);

  const createdFiles = [];
  const createdDirectories = [];
  const modifiedFiles = [];
  async function ensureDirectory(directory) {
    if (await stat(directory)) return;
    await ensureDirectory(path.dirname(directory));
    await mkdir(directory);
    createdDirectories.push(directory);
  }
  try {
    await ensureDirectory(root);
    for (const plan of plans.filter(file => !file.original)) {
      const target = path.join(root, plan.relative);
      await ensureDirectory(path.dirname(target));
      const handle = await open(target, 'wx', plan.mode);
      createdFiles.push(target);
      try {
        await handle.writeFile(plan.content);
      } finally {
        await handle.close();
      }
    }
    for (const plan of plans.filter(file => file.original)) {
      const target = path.join(root, plan.relative);
      modifiedFiles.push({ target, original: plan.original });
      await writeFile(target, plan.content);
    }
  } catch (error) {
    for (const file of modifiedFiles) await writeFile(file.target, file.original);
    for (const file of createdFiles.reverse()) await rm(file, { force: true });
    for (const directory of createdDirectories.reverse()) {
      try {
        await rmdir(directory);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOTEMPTY' && cleanupError.code !== 'ENOENT') throw cleanupError;
      }
    }
    throw error;
  }
  return { root, created: true, preserved };
}
