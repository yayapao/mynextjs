import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import { c as createTar } from 'tar';
import path from 'node:path';
import { exists } from './upgrade-wails.mjs';

export function includeRuntimeFile(relative, excludeData = true) {
  const parts = relative.split(path.sep);
  return (
    !(excludeData && parts[0] === 'data') &&
    !parts.some((part) => part === '.git' || part.startsWith('.env'))
  );
}

export async function prepareRuntime(root) {
  const source = path.join(root, '.next', 'standalone');
  const staticRoot = path.join(root, '.next', 'static');
  if (
    !(await exists(path.join(source, 'server.js'))) ||
    !(await exists(staticRoot))
  ) {
    throw new Error(
      '缺少 Next.js standalone 产物，请通过 npm run desktop:build 构建'
    );
  }
  const config = JSON.parse(
    await readFile(path.join(root, 'desktop', 'mynextjs.json'), 'utf8')
  );
  if (config.generator !== 'mynextjs') throw new Error('无效的桌面工程');
  const target = path.join(root, 'desktop', 'runtime.tar.gz');
  const temporary = await mkdtemp(path.join(root, 'desktop', '.runtime-'));
  try {
    const copyOptions = { recursive: true, dereference: true };
    await cp(source, temporary, {
      ...copyOptions,
      filter: (file) => includeRuntimeFile(path.relative(source, file)),
    });
    await mkdir(path.join(temporary, '.next'), { recursive: true });
    await cp(staticRoot, path.join(temporary, '.next', 'static'), {
      ...copyOptions,
      filter: (file) =>
        includeRuntimeFile(path.relative(staticRoot, file), false),
    });
    const publicRoot = path.join(root, 'public');
    if (await exists(publicRoot))
      await cp(publicRoot, path.join(temporary, 'public'), {
        ...copyOptions,
        filter: (file) =>
          includeRuntimeFile(path.relative(publicRoot, file), false),
      });
    // A single archive also supports Turbopack and dynamic route filenames.
    const archive = `${temporary}.tar.gz`;
    await createTar(
      {
        cwd: temporary,
        file: archive,
        gzip: true,
        portable: true,
        noMtime: true,
      },
      ['.']
    );
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(archive)) hash.update(chunk);
    const version = hash.digest('hex').slice(0, 20);
    await rename(archive, target);
    return version;
  } finally {
    await rm(temporary, { recursive: true, force: true });
    await rm(`${temporary}.tar.gz`, { force: true });
  }
}
