import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function readDesktopConfig(root) {
  const markers = [
    ['nextpier.json', 'nextpier-wails'],
    ['mynextjs.json', 'mynextjs'],
  ];
  for (const [file, generator] of markers) {
    let source;
    try {
      source = await readFile(path.join(root, 'desktop', file), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') continue;
      throw error;
    }
    const config = JSON.parse(source);
    if (config.generator !== generator || config.schemaVersion !== 1)
      throw new Error('desktop/ 不是兼容的 NextPier 工程');
    return { config, file };
  }
  return null;
}

export function desktopEnvironment(env = process.env) {
  // Older generated projects still read the original desktop flag.
  return { ...env, NEXTPIER_DESKTOP: '1', MYNEXTJS_DESKTOP: '1' };
}
