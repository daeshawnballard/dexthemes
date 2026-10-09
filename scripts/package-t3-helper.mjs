import { execFileSync } from 'node:child_process';
import { lstat, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const output = path.resolve(process.argv[2] || '.artifacts/t3-helper/dexthemes-t3-helper-0.1.0.zip');
try {
  await lstat(output);
  throw new Error('Helper archive already exists; use a fresh output path.');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const stage = await mkdtemp(path.join(os.tmpdir(), 'dexthemes-t3-helper-package-'));
const bundle = path.join(stage, 'dexthemes-t3-helper');
const files = [
  'packages/t3-theme-bridge/src/bridge-server.mjs',
  'packages/t3-theme-bridge/src/t3-theme-apply.mjs',
  'packages/t3-theme-bridge/src/apply-theme.mjs',
  'packages/t3-theme-bridge/src/validate-theme.mjs',
  'shared/t3code-theme-contract.js',
  'shared/host-theme-utils.js',
  'LICENSE',
];
for (const name of files) {
  const target = path.join(bundle, name);
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  await writeFile(target, await readFile(path.join(root, name)), { flag: 'wx', mode: 0o600 });
}
await writeFile(path.join(bundle, 'README.md'), await readFile(path.join(root, 'packages/t3-theme-bridge/README.md')), { flag: 'wx', mode: 0o600 });
await writeFile(path.join(bundle, 'package.json'), `${JSON.stringify({ name: 'dexthemes-t3-helper', version: '0.1.0', private: true, type: 'module', engines: { node: '>=22' }, scripts: { start: 'node packages/t3-theme-bridge/src/bridge-server.mjs start' } }, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
await mkdir(path.dirname(output), { recursive: true });
// zip creates a fresh immutable artifact; an existing archive is never updated in-place.
execFileSync('/usr/bin/zip', ['-q', '-r', '-X', output, 'dexthemes-t3-helper'], { cwd: stage, stdio: 'inherit' });
console.log(JSON.stringify({ output, retainedStage: stage, packageFiles: files.length + 2 }));
