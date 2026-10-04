import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

const directory = new URL('../', import.meta.url);
const archive = await readFile(new URL('runtime.tar.gz', directory));
if (archive[0] !== 0x1f || archive[1] !== 0x8b) {
  throw new Error(
    '桌面运行时尚未准备，请从项目根目录运行 npm run desktop:build'
  );
}
gunzipSync(archive);
