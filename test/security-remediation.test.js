import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { resolveLocalStaticPath } from '../scripts/local-static-path.mjs';
import { buildThemeBundle } from '../scripts/build-theme-bundle.mjs';
import { getPlatform } from '../shared/platform-registry.js';

const root = path.resolve(new URL('..', import.meta.url).pathname);

test('browser smoke static resolver rejects decoded traversal and retains local assets', () => {
  for (const value of [
    '/..%2f..%2fetc%2fpasswd',
    '/%2e%2e/%2e%2e/etc/passwd',
    '/%2E%2E%2Fsecret',
    '/%2e%2e%5csecret',
    '/%ZZ',
  ]) {
    assert.equal(resolveLocalStaticPath(root, value), null, value);
  }
  assert.equal(resolveLocalStaticPath(root, '/index.html'), path.join(root, 'index.html'));
  // A double-encoded slash remains a literal filename after the one URL decode.
  assert.equal(resolveLocalStaticPath(root, '/%252e%252e%252fsecret'), path.join(root, '%2e%2e%2fsecret'));
});

test('public theme bundle and browser styling exclude locked palette data while server catalog retains authenticated source data', async () => {
  await buildThemeBundle();
  const [bundle, browserStyles, serverCatalog] = await Promise.all([
    readFile(new URL('../theme-data/dexthemes/bundle.js', import.meta.url), 'utf8'),
    readFile(new URL('../styles/preview.css', import.meta.url), 'utf8'),
    readFile(new URL('../shared/theme-api-catalog.js', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(bundle, /registerDexThemesPack\('supporter'/);
  assert.doesNotMatch(bundle, /#0F0D09|#D4A54A|#FFF5DC|#A87B1E/i);
  assert.doesNotMatch(browserStyles, /#0F0D09|#D4A54A|#FFF5DC|#A87B1E/i);
  assert.match(serverCatalog, /"id": "patron"/);
  assert.match(serverCatalog, /"subgroup": "unlockables"/);
  const [submissionSource, unlockRouteSource] = await Promise.all([
    readFile(new URL('../src/theme-submission-api.js', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_unlock_routes.ts', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(submissionSource, /convex\/protectedThemes/);
  assert.match(unlockRouteSource, /protectedThemes\.get\(unlock\.themeId\)/);
});

test('public DeepSeek discovery aligns only to published runtime-reviewed 0.6.4', async () => {
  const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');
  assert.match(llms, /published, runtime-reviewed `@dexthemes\/deepseek-harness-plugin@0\.6\.4`/);
  assert.match(llms, /do not infer newer reconnect, token, revocation, or activity assurances from an older artifact/i);
  assert.doesNotMatch(llms, /@dexthemes\/deepseek-harness-plugin@0\.6\.0/);
  assert.equal(getPlatform('deepseek').pluginVersion, '0.6.4');
});
