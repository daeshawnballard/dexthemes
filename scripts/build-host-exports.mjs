import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  PLATFORM_ADAPTER_RESULT_KINDS,
  preparePlatformTheme,
} from '../shared/platform-adapters.js';
import { isSafeExportPath } from '../shared/host-theme-utils.js';

export const HOST_EXPORT_PLATFORM_IDS = Object.freeze([
  'claude', 'qwen', 'opencode', 'pi', 'zed', 'cursor', 't3code', 'grok',
]);

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(moduleDirectory, '..');
const fixturePath = path.join(repositoryRoot, 'fixtures', 'host-exports', 'canonical-paired-theme.json');
const outputRoot = path.join(repositoryRoot, 'dist', 'host-exports');

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

async function writeRegularFile(target, content) {
  await ensureSafeDirectory(path.dirname(target));
  const existing = await inspectPath(target);
  if (existing?.isSymbolicLink() || (existing && (!existing.isFile() || existing.nlink > 1))) {
    throw new TypeError(`Refusing non-regular export target: ${target}`);
  }
  await writeFile(target, content, { encoding: 'utf8', mode: 0o644 });
}

export async function buildHostExports() {
  const fixtureSource = await readFile(fixturePath, 'utf8');
  const theme = JSON.parse(fixtureSource);
  const bundle = createHostExportBundle(theme);
  await ensureSafeDirectory(outputRoot);
  for (const file of bundle.files) {
    await writeRegularFile(path.join(outputRoot, ...file.path.split('/')), file.content);
  }
  await writeRegularFile(
    path.join(outputRoot, 'MANIFEST.json'),
    `${JSON.stringify(bundle.manifest, null, 2)}\n`,
  );
  return bundle;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const bundle = await buildHostExports();
  console.log(`built ${bundle.files.length} host export files for ${HOST_EXPORT_PLATFORM_IDS.length} platforms`);
}
