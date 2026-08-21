import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  HOST_EXPORT_PLATFORM_IDS,
  buildHostExports,
  createHostExportBundle,
} from '../scripts/build-host-exports.mjs';
import { isSafeExportPath } from '../shared/host-theme-utils.js';

const theme = JSON.parse(await readFile(
  new URL('../fixtures/host-exports/canonical-paired-theme.json', import.meta.url),
  'utf8',
));
const expectedReceipt = JSON.parse(await readFile(
  new URL('../fixtures/host-exports/expected-bundle-receipt.json', import.meta.url),
  'utf8',
));

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function compactReceipt(manifest) {
  return {
    schemaVersion: manifest.schemaVersion,
    fixtureSha256: manifest.fixtureSha256,
    platforms: Object.fromEntries(Object.entries(manifest.platforms).map(([platformId, platform]) => [
      platformId,
      {
        adapterVersion: platform.adapterVersion,
        deliveryState: platform.deliveryState,
        files: Object.fromEntries(platform.files.map((file) => [file.path, file.sha256])),
      },
    ])),
  };
}

test('host export bundle is deterministic, complete, and path-safe', () => {
  assert.deepEqual(HOST_EXPORT_PLATFORM_IDS, [
    'claude', 'qwen', 'opencode', 'pi', 'zed', 'cursor', 't3code', 'grok',
  ]);
  const first = createHostExportBundle(theme);
  const second = createHostExportBundle(theme);
  assert.deepEqual(first, second);
  assert.equal(first.files.length, 16);
  assert.deepEqual(Object.keys(first.manifest.platforms), HOST_EXPORT_PLATFORM_IDS);
  assert.deepEqual(compactReceipt(first.manifest), expectedReceipt);
  assert.deepEqual(
    first.files.map((file) => file.path),
    [...first.files.map((file) => file.path)].sort((left, right) => left.localeCompare(right)),
  );
  assert.equal(new Set(first.files.map((file) => file.path)).size, first.files.length);
  for (const file of first.files) {
    assert.equal(isSafeExportPath(file.path), true, file.path);
    assert.equal(file.content.includes('\0'), false, file.path);
    const [platformId, ...relativeParts] = file.path.split('/');
    const receipt = first.manifest.platforms[platformId].files.find(
      (candidate) => candidate.path === relativeParts.join('/'),
    );
    assert.equal(receipt.bytes, Buffer.byteLength(file.content), file.path);
    assert.equal(receipt.sha256, sha256(file.content), file.path);
  }
});

test('build writes only regular repository export files matching its manifest', async () => {
  const bundle = await buildHostExports();
  const outputRoot = new URL('../dist/host-exports/', import.meta.url);
  for (const file of bundle.files) {
    const target = new URL(file.path, outputRoot);
    const [stats, content] = await Promise.all([lstat(target), readFile(target, 'utf8')]);
    assert.equal(stats.isFile(), true, file.path);
    assert.equal(stats.isSymbolicLink(), false, file.path);
    assert.equal(stats.nlink, 1, file.path);
    assert.equal(content, file.content, file.path);
  }
  const manifest = JSON.parse(await readFile(new URL('MANIFEST.json', outputRoot), 'utf8'));
  assert.deepEqual(manifest, bundle.manifest);
});

test('host export publication rejects a symlinked parent introduced after staging', async () => {
  const targetRoot = new URL(`../dist/host-exports-race-${Date.now()}/`, import.meta.url);
  const redirectDir = new URL(`../dist/host-export-redirect-${Date.now()}/`, import.meta.url);
  await mkdir(redirectDir, { recursive: true });
  await assert.rejects(
    buildHostExports({
      outputRoot: fileURLToPath(targetRoot),
      beforePublish: async ({ outputRoot }) => {
        // The existing directory is deliberately replaced after bundle creation
        // and before any destination rename; a pathname writer would follow it.
        await symlink(fileURLToPath(redirectDir), path.join(outputRoot, 'claude'));
      },
    }),
    /symlinked export directory/i,
  );
});
