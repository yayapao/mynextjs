#!/usr/bin/env node
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { initializeProject } from './lib/init-project.mjs';

const templateRoot = fileURLToPath(new URL('../', import.meta.url));

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: 'string' },
      name: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      '用法：node /path/to/nextpier/scripts/init.mjs --project /path/to/project [--name my-app]'
    );
    return;
  }
  if (!values.project) throw new Error('请通过 --project 指定目标目录');
  const result = await initializeProject(
    path.resolve(values.project),
    templateRoot,
    values
  );
  console.log(
    `${result.created ? '已初始化' : '已有'} NextPier 工程：${result.root}\n` +
      `保留文件：${result.preserved.join('、') || '无'}\n` +
      '下一步：在目标目录执行 npm install，然后按 docs/ai-agent.md 继续。'
  );
}

main().catch((error) => {
  console.error(`[NextPier Init] ${error.message}`);
  process.exitCode = 1;
});
