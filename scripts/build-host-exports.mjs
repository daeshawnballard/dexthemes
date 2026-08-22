import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  PLATFORM_ADAPTER_RESULT_KINDS,
  preparePlatformTheme,
} from '../shared/platform-adapters.js';
import { getPlatformIdsForAdapterDerivation } from '../shared/platform-registry.js';
import { isSafeExportPath } from '../shared/host-theme-utils.js';

// The export roster is a registry projection, never a second hand-maintained
// list. The registry also records why non-exporting hosts remain excluded.
export const HOST_EXPORT_PLATFORM_IDS = getPlatformIdsForAdapterDerivation('hostExport');

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleDirectory, '..');
const fixturePath = path.join(repositoryRoot, 'fixtures', 'host-exports', 'canonical-paired-theme.json');
const outputRoot = path.join(repositoryRoot, 'dist', 'host-exports');
// Staging is deliberately outside the served dist tree. It stays repository-
// local, private, and on the same filesystem for atomic directory renames.
const stageParent = path.join(repositoryRoot, '.artifacts', 'host-export-staging');
const securePublisherPath = path.join(moduleDirectory, 'secure-host-export-publish.py');
const stageRoots = [
  path.join(stageParent, '.host-exports-stage-a'),
  path.join(stageParent, '.host-exports-stage-b'),
];

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function createHostExportBundle(theme) {
  const files = [];
  const platforms = {};

  for (const platformId of HOST_EXPORT_PLATFORM_IDS) {
    const prepared = preparePlatformTheme(theme, platformId);
    if (![PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, PLATFORM_ADAPTER_RESULT_KINDS.PACKAGE_EXPORT,
      PLATFORM_ADAPTER_RESULT_KINDS.PACKAGE_SOURCE].includes(prepared.kind)) {
      throw new TypeError(`${platformId} did not produce a host export.`);
    }
    if (prepared.payload !== null || !Array.isArray(prepared.files) || !prepared.files.length) {
      throw new TypeError(`${platformId} produced an invalid export boundary.`);
    }

    const platformFiles = prepared.files.map((file) => {
      const bundlePath = `${platformId}/${file.path}`;
      if (!isSafeExportPath(bundlePath)) throw new TypeError(`${platformId} produced an unsafe bundle path.`);
      const record = Object.freeze({
        path: bundlePath,
        mediaType: file.mediaType,
        content: file.content,
      });
      files.push(record);
      return Object.freeze({
        path: file.path,
        mediaType: file.mediaType,
        bytes: Buffer.byteLength(file.content),
        sha256: sha256(file.content),
      });
    });

    platforms[platformId] = Object.freeze({
      kind: prepared.kind,
      adapterVersion: prepared.adapterVersion,
      deliveryState: prepared.deliveryState,
      format: prepared.format,
      variants: prepared.variants,
      files: platformFiles,
    });
  }

  const sortedFiles = Object.freeze([...files].sort((left, right) => left.path.localeCompare(right.path)));
  const manifest = Object.freeze({
    schemaVersion: 1,
    fixtureId: String(theme?.id || ''),
    fixtureSha256: sha256(`${JSON.stringify(theme, null, 2)}\n`),
    platforms,
  });
  return Object.freeze({ files: sortedFiles, manifest });
}

async function inspectPath(target) {
  try {
    return await lstat(target);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function ensureSafeDirectory(target) {
  const relative = path.relative(repositoryRoot, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new TypeError('Host export output must stay inside the repository.');
  }
  let current = repositoryRoot;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    const existing = await inspectPath(current);
    if (existing?.isSymbolicLink()) throw new TypeError(`Refusing symlinked export directory: ${current}`);
    if (existing && !existing.isDirectory()) throw new TypeError(`Export path is not a directory: ${current}`);
    if (!existing) await mkdir(current);
  }
}

async function writeStagedFile(target, content) {
  await ensureSafeDirectory(path.dirname(target));
  const existing = await inspectPath(target);
  if (existing && (!existing.isFile() || existing.isSymbolicLink() || existing.nlink !== 1)) {
    throw new TypeError(`Refusing non-regular staged export target: ${target}`);
  }
  const handle = await open(
    target,
    constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.writeFile(content, { encoding: 'utf8' });
    await handle.sync();
  } finally {
    await handle.close();
  }
  const stagedInfo = await inspectPath(target);
  if (!stagedInfo?.isFile() || stagedInfo.isSymbolicLink() || stagedInfo.nlink !== 1) {
    throw new TypeError(`Refusing non-regular staged export target: ${target}`);
  }
}

function stageContents(bundle) {
  const files = new Map(bundle.files.map((file) => [file.path, file.content]));
  files.set('MANIFEST.json', `${JSON.stringify(bundle.manifest, null, 2)}\n`);
  const directories = new Set();
  for (const filePath of files.keys()) {
    const segments = filePath.split('/');
    segments.pop();
    while (segments.length) {
      directories.add(segments.join('/'));
      segments.pop();
    }
  }
  return { files, directories };
}

async function assertSafeStageTree(stageRoot, contents) {
  async function visit(directory, relative = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name;
      const childPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new TypeError(`Refusing symlinked staged export path: ${childPath}`);
      if (entry.isDirectory()) {
        if (!contents.directories.has(childRelative)) {
          throw new TypeError(`Refusing unexpected staged export directory: ${childPath}`);
        }
        await visit(childPath, childRelative);
        continue;
      }
      if (!entry.isFile() || !contents.files.has(childRelative)) {
        throw new TypeError(`Refusing unexpected staged export path: ${childPath}`);
      }
      const info = await inspectPath(childPath);
      if (!info?.isFile() || info.isSymbolicLink() || info.nlink !== 1) {
        throw new TypeError(`Refusing non-regular staged export path: ${childPath}`);
      }
    }
  }
  await visit(stageRoot);
}

async function assertCompleteStage(stageRoot, contents) {
  await assertSafeStageTree(stageRoot, contents);
  for (const [relativePath, content] of contents.files) {
    const target = path.join(stageRoot, ...relativePath.split('/'));
    const [info, actual] = await Promise.all([inspectPath(target), readFile(target, 'utf8')]);
    if (!info?.isFile() || info.isSymbolicLink() || info.nlink !== 1 || actual !== content) {
      throw new TypeError(`Staged host export did not match its deterministic source: ${target}`);
    }
  }
}

async function preparePrivateStage(stageRoot, contents) {
  await ensureSafeDirectory(stageParent);
  let info = await inspectPath(stageRoot);
  if (!info) {
    await mkdir(stageRoot, { mode: 0o700 });
    info = await inspectPath(stageRoot);
  }
  if (!info?.isDirectory() || info.isSymbolicLink()) {
    throw new TypeError(`Refusing unsafe host export staging directory: ${stageRoot}`);
  }
  await assertSafeStageTree(stageRoot, contents);
}

async function assertSafeOutputRoot(target) {
  await ensureSafeDirectory(path.dirname(target));
  const info = await inspectPath(target);
  if (info?.isSymbolicLink()) throw new TypeError(`Refusing symlinked host export output: ${target}`);
  if (info && !info.isDirectory()) throw new TypeError(`Host export output is not a directory: ${target}`);
  return info;
}

async function selectPublicationRoots(target) {
  const output = await assertSafeOutputRoot(target);
  const stageInfo = await Promise.all(stageRoots.map(inspectPath));
  for (let index = 0; index < stageRoots.length; index += 1) {
    const info = stageInfo[index];
    if (info && (!info.isDirectory() || info.isSymbolicLink())) {
      throw new TypeError(`Refusing unsafe host export staging directory: ${stageRoots[index]}`);
    }
  }
  if (!output) {
    if (stageInfo[0] && stageInfo[1]) throw new TypeError('Host export staging recovery is ambiguous.');
    return { stageRoot: stageInfo[0] ? stageRoots[0] : stageRoots[1], backupRoot: null };
  }
  if (stageInfo[0] && stageInfo[1]) throw new TypeError('Host export staging recovery is ambiguous.');
  if (stageInfo[0]) return { stageRoot: stageRoots[0], backupRoot: stageRoots[1] };
  return { stageRoot: stageRoots[1], backupRoot: stageRoots[0] };
}

async function publishStagedDirectory(stageRoot, target, backupRoot, testHooks = {}, bundle) {
  const stageParentRelative = path.relative(repositoryRoot, path.dirname(stageRoot));
  const targetParentRelative = path.relative(repositoryRoot, path.dirname(target));
  if (!stageParentRelative || !targetParentRelative
    || stageParentRelative.startsWith('..') || targetParentRelative.startsWith('..')
    || path.isAbsolute(stageParentRelative) || path.isAbsolute(targetParentRelative)) {
    throw new TypeError('Host export publication directories must stay inside the repository.');
  }
  const python = process.env.DEXTHEMES_PYTHON || 'python3';
  const testFault = Boolean(testHooks.failAfterBackup);
  const child = spawn(python, [securePublisherPath], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DEXTHEMES_HOST_EXPORT_TEST_HOOKS: testFault ? '1' : '',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const messages = [];
  const waiters = [];
  let terminalError = null;
  function settle(error) {
    if (terminalError) return;
    terminalError = error;
    while (waiters.length) waiters.shift().reject(error);
  }
  function deliver(message) {
    if (waiters.length) waiters.shift().resolve(message);
    else messages.push(message);
  }
  lines.on('line', (line) => {
    try {
      deliver(JSON.parse(line));
    } catch {
      settle(new Error('Secure host export publisher emitted invalid JSON.'));
    }
  });
  child.on('error', (error) => settle(new Error(`Secure host export publisher could not start: ${error.message}`)));
  const closed = new Promise((resolve) => {
    child.on('close', (code) => {
      if (!terminalError && code !== 0) {
        settle(new Error(`Secure host export publisher exited ${code}: ${stderr.trim()}`));
      }
      resolve();
    });
  });
  function nextMessage() {
    if (messages.length) return Promise.resolve(messages.shift());
    if (terminalError) return Promise.reject(terminalError);
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  }
  function send(message) {
    if (!child.stdin.writable) throw new Error('Secure host export publisher input is unavailable.');
    child.stdin.write(`${JSON.stringify(message)}\n`);
  }
  try {
    send({
      repositoryRoot,
      stageParent: stageParentRelative,
      stageName: path.basename(stageRoot),
      targetParent: targetParentRelative,
      targetName: path.basename(target),
      backupName: backupRoot ? path.basename(backupRoot) : null,
    });
    const bound = await nextMessage();
    if (bound?.state !== 'bound') {
      throw new Error(`Secure host export publisher failed before binding: ${bound?.message || 'unknown error'}`);
    }
    await testHooks.afterDirectoryBound?.({ stageRoot, outputRoot: target, backupRoot, bundle });
    send({ command: 'activate', testFailAfterBackup: testFault });
    child.stdin.end();
    const result = await nextMessage();
    if (result?.state !== 'published') {
      throw new Error(`Secure host export publication failed: ${result?.message || 'unknown error'}`);
    }
  } finally {
    if (child.stdin.writable) child.stdin.end();
    await closed;
  }
}

export async function buildHostExports({ outputRoot: requestedOutputRoot = outputRoot, testHooks = {} } = {}) {
  const fixtureSource = await readFile(fixturePath, 'utf8');
  const theme = JSON.parse(fixtureSource);
  const bundle = createHostExportBundle(theme);
  const contents = stageContents(bundle);
  const { stageRoot, backupRoot } = await selectPublicationRoots(requestedOutputRoot);
  await preparePrivateStage(stageRoot, contents);
  for (const [relativePath, content] of contents.files) {
    await writeStagedFile(path.join(stageRoot, ...relativePath.split('/')), content);
  }
  await assertCompleteStage(stageRoot, contents);
  await testHooks.afterStage?.({ stageRoot, outputRoot: requestedOutputRoot, bundle });
  // Failed stages remain private and reusable. This avoids pathname deletion
  // after detecting an attack while preserving an atomic rollback workspace.
  await publishStagedDirectory(stageRoot, requestedOutputRoot, backupRoot, testHooks, bundle);
  return bundle;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = await buildHostExports();
  console.log(`built ${bundle.files.length} host export files for ${HOST_EXPORT_PLATFORM_IDS.length} platforms`);
}
