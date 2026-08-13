import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outdir = path.join(packageRoot, 'lib');

await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [path.join(packageRoot, 'src', 'index.js')],
  outfile: path.join(outdir, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  minify: true,
  sourcemap: false,
  logLevel: 'info',
});

await build({
  entryPoints: [path.join(packageRoot, 'src', 'client.jsx')],
  outfile: path.join(outdir, 'client.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  sourcemap: false,
  external: ['react', 'react/jsx-runtime'],
  banner: { js: 'window.__ModuleLoader__.load({ id: "@dexthemes/deepseek-harness-plugin", factory: (require) => { var module = { exports: {} }; var exports = module.exports;' },
  footer: { js: 'return module.exports; } });' },
  logLevel: 'info',
});

const clientPath = path.join(outdir, 'client.js');
const clientSource = await readFile(clientPath, 'utf8');
await writeFile(clientPath, clientSource.replaceAll('require_react()', 'require("react")'));
