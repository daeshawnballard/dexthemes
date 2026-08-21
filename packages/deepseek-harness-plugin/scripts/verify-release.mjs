import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowlistedPackFiles = Object.freeze([
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
  'cordis.patch.yml',
  'lib/client.js',
  'lib/index.js',
  'package.json',
]);
const lifecycleScriptNames = new Set([
  'prepublish',
  'prepare',
  'prepublishOnly',
  'prepack',
  'postpack',
  'postpublish',
]);
const opaqueCredentialPatterns = Object.freeze([
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/,
  /(?:^|[\s"'=])gh[pousr]_[A-Za-z0-9_]{20,}/,
  /(?:^|[\s"'=])github_pat_[A-Za-z0-9_]{20,}/,
  /(?:^|[\s"'=])npm_[A-Za-z0-9]{20,}/,
  /(?:^|[\s"'=])AKIA[0-9A-Z]{16}/,
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function run(command, args) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: packageRoot,
      env: { ...process.env, npm_config_ignore_scripts: 'true' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) return resolve({ stdout, stderr });
      reject(new Error(`${command} ${args.join(' ')} failed with ${code}: ${stderr || stdout}`));
    });
  });
}

const manifestPath = path.join(packageRoot, 'package.json');
const catalogPath = path.join(packageRoot, 'src', 'catalog.generated.js');
const clientPath = path.join(packageRoot, 'lib', 'client.js');
const indexPath = path.join(packageRoot, 'lib', 'index.js');
const manifestSource = await readFile(manifestPath);
const manifest = JSON.parse(manifestSource);
const sourceController = await readFile(path.join(packageRoot, 'src', 'theme-controller.js'), 'utf8');
const embeddedVersion = sourceController.match(/PLUGIN_VERSION = '([^']+)'/)?.[1];

if (!embeddedVersion || embeddedVersion !== manifest.version) {
  throw new Error(`package version ${manifest.version} does not match src/theme-controller.js (${embeddedVersion || 'missing'})`);
}

const lifecycleScripts = Object.keys(manifest.scripts || {}).filter((name) => lifecycleScriptNames.has(name));
if (lifecycleScripts.length > 0) {
  throw new Error(`package must not declare lifecycle scripts: ${lifecycleScripts.join(', ')}`);
}

await run(process.execPath, ['scripts/build.mjs']);
const firstBuild = {
  clientSha256: sha256(await readFile(clientPath)),
  indexSha256: sha256(await readFile(indexPath)),
};
await run(process.execPath, ['scripts/build.mjs']);
const secondBuild = {
  clientSha256: sha256(await readFile(clientPath)),
  indexSha256: sha256(await readFile(indexPath)),
};

if (firstBuild.clientSha256 !== secondBuild.clientSha256 || firstBuild.indexSha256 !== secondBuild.indexSha256) {
  throw new Error('two builds from the same source produced different lib hashes');
}

const packResult = await run('npm', ['pack', '--dry-run', '--json', '--ignore-scripts']);
const pack = JSON.parse(packResult.stdout);
if (!Array.isArray(pack) || pack.length !== 1 || !Array.isArray(pack[0]?.files)) {
  throw new Error('npm pack did not return one inspectable pack manifest');
}

const files = pack[0].files
  .map(({ path: file, size, mode }) => ({ path: file, size, mode }))
  .sort((left, right) => left.path.localeCompare(right.path));
const packedPaths = files.map(({ path: file }) => file);
const expectedPackedPaths = [...allowlistedPackFiles].sort((left, right) => left.localeCompare(right));
if (JSON.stringify(packedPaths) !== JSON.stringify(expectedPackedPaths)) {
  throw new Error(`npm pack files differ from the allowlist: ${packedPaths.join(', ')}`);
}

for (const file of packedPaths) {
  const content = await readFile(path.join(packageRoot, file), 'utf8');
  if (opaqueCredentialPatterns.some((pattern) => pattern.test(content))) {
    throw new Error(`npm pack file contains a high-signal opaque credential pattern: ${file}`);
  }
}

const receipt = {
  status: 'LOCAL_UNPUBLISHED_RELEASE_PREPARATION_PASS',
  package: manifest.name,
  version: manifest.version,
  manifestSha256: sha256(manifestSource),
  generatedCatalogSha256: sha256(await readFile(catalogPath)),
  firstBuild,
  secondBuild,
  pack: {
    command: 'npm pack --dry-run --json --ignore-scripts',
    lifecycleScripts: [],
    opaqueCredentialPatterns: 'none detected',
    files,
    manifestSha256: sha256(JSON.stringify({ name: pack[0].name, version: pack[0].version, files })),
  },
};

console.log(JSON.stringify(receipt, null, 2));
