import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildClaudeThemeExport, validateClaudeThemeFile } from '../shared/claude-theme-contract.js';
import { buildCursorThemeSource, validateCursorExtensionManifest } from '../shared/cursor-theme-contract.js';
import {
  GROK_PAGER_COLOR_PATHS,
  buildGrokPagerOverride,
  buildGrokPagerThemeExport,
  validateGrokPagerOverride,
} from '../shared/grok-pager-theme-contract.js';
import { isSafeExportPath } from '../shared/host-theme-utils.js';
import { buildOpenCodeThemeExport, validateOpenCodeThemeDefinition } from '../shared/opencode-theme-contract.js';
import { buildPiThemeExport, validatePiPackageManifest, validatePiThemeDefinition } from '../shared/pi-theme-contract.js';
import { buildQwenThemeExport, validateQwenThemeDefinition } from '../shared/qwen-theme-contract.js';
import {
  T3CODE_THEME_COLOR_ROLES,
  buildT3CodeThemeExport,
  validateT3CodeThemeFile,
} from '../shared/t3code-theme-contract.js';
import { buildZedThemeExport, validateZedThemeFamily } from '../shared/zed-theme-contract.js';

const theme = Object.freeze(JSON.parse(await readFile(
  new URL('../fixtures/host-exports/canonical-paired-theme.json', import.meta.url),
  'utf8',
)));

function jsonFile(exportResult, path) {
  const file = exportResult.files.find((candidate) => candidate.path === path);
  assert.ok(file, `missing ${path}`);
  assert.equal(file.mediaType, 'application/json');
  return JSON.parse(file.content);
}

test('all proven host builders produce deterministic, reviewable, non-installing exports', () => {
  const builders = [
    buildClaudeThemeExport,
    buildQwenThemeExport,
    buildOpenCodeThemeExport,
    buildPiThemeExport,
    buildZedThemeExport,
    buildCursorThemeSource,
    buildT3CodeThemeExport,
    buildGrokPagerThemeExport,
  ];
  for (const builder of builders) {
    const first = builder(theme);
    const second = builder(theme);
    assert.deepEqual(first, second, first.platformId);
    assert.equal(first.userControlled, true, first.platformId);
    assert.equal(first.reversible, false, first.platformId);
    assert.equal(first.setup.automaticInstall, false, first.platformId);
    assert.equal(first.setup.writesHostConfig, false, first.platformId);
    assert.ok(first.files.every((file) => isSafeExportPath(file.path)), first.platformId);
    assert.ok(first.unsupportedFields.length > 0, first.platformId);
  }
});

test('Claude and Qwen exports keep dark and light as separate user selections', () => {
  const claude = buildClaudeThemeExport(theme);
  assert.equal(claude.files.length, 2);
  for (const variant of ['dark', 'light']) {
    const value = jsonFile(claude, `themes/adapter-test-${variant}.json`);
    assert.deepEqual(validateClaudeThemeFile(value), { valid: true, errors: [] });
    assert.equal(value.base, variant);
  }
  assert.match(claude.setup.selection, /^\/theme$/);
  assert.ok(claude.unsupportedFields.includes('automaticLightDarkPair'));

  const qwen = buildQwenThemeExport(theme);
  assert.equal(qwen.files.length, 2);
  for (const variant of ['dark', 'light']) {
    const value = jsonFile(qwen, `themes/adapter-test-${variant}.json`);
    assert.deepEqual(validateQwenThemeDefinition(value), { valid: true, errors: [] });
    assert.equal(value.type, 'custom');
    assert.equal(value.GradientColors.length, 3);
  }
  assert.ok(qwen.unsupportedFields.includes('themeExtension'));
  assert.match(qwen.setup.selection, /Set ui\.theme to the reviewed file path/);
  assert.doesNotMatch(qwen.setup.selection, /\/theme/);
});

test('OpenCode emits one paired JSON document without a fabricated schema URL', () => {
  const prepared = buildOpenCodeThemeExport(theme);
  const value = jsonFile(prepared, 'themes/adapter-test.json');
  assert.deepEqual(validateOpenCodeThemeDefinition(value), { valid: true, errors: [] });
  assert.deepEqual(Object.keys(value.theme.primary).sort(), ['dark', 'light']);
  assert.equal('$schema' in value, false);
  assert.match(prepared.setup.schemaStatus, /returned 404/);
});

test('Pi package is code-free and contains only its manifest and JSON themes', () => {
  const prepared = buildPiThemeExport(theme);
  const manifest = jsonFile(prepared, 'package.json');
  assert.deepEqual(validatePiPackageManifest(manifest), { valid: true, errors: [] });
  assert.equal('scripts' in manifest, false);
  assert.equal('dependencies' in manifest, false);
  assert.equal('main' in manifest, false);
  assert.deepEqual(prepared.files.map((file) => file.path), [
    'package.json',
    'themes/adapter-test-dark.json',
    'themes/adapter-test-light.json',
  ]);
  for (const variant of ['dark', 'light']) {
    assert.deepEqual(
      validatePiThemeDefinition(jsonFile(prepared, `themes/adapter-test-${variant}.json`)),
      { valid: true, errors: [] },
    );
  }
});

test('Zed emits an opaque local theme family for zed.dev schema v0.2.0', () => {
  const prepared = buildZedThemeExport(theme);
  const family = jsonFile(prepared, 'themes/adapter-test.json');
  assert.deepEqual(validateZedThemeFamily(family), { valid: true, errors: [] });
  assert.deepEqual(family.themes.map((entry) => entry.appearance), ['dark', 'light']);
  assert.ok(family.themes.every((entry) => entry.style['background.appearance'] === 'opaque'));
  assert.match(prepared.setup.schemaUrl, /^https:\/\/zed\.dev\//);
});

test('Cursor output stays review-only source with an unauthorized publisher placeholder', () => {
  const prepared = buildCursorThemeSource(theme);
  const manifest = jsonFile(prepared, 'package.json');
  assert.equal(prepared.deliveryState, 'review_only_source');
  assert.equal(prepared.setup.automaticInstall, false);
  assert.equal(manifest.private, true);
  assert.equal(manifest.publisher, 'replace-with-authorized-publisher');
  assert.deepEqual(validateCursorExtensionManifest(manifest, 2), { valid: true, errors: [] });
  const readme = prepared.files.find((file) => file.path === 'README.md').content;
  assert.match(readme, /not proof of Cursor marketplace acceptance/);
  assert.doesNotMatch(readme, /successfully installed|runtime[- ]proven/i);
});

test('T3 Code emits only the stable v1 subset and a paired opposite variant', () => {
  const prepared = buildT3CodeThemeExport(theme);
  const value = jsonFile(prepared, 'adapter-test.t3-theme.json');
  assert.deepEqual(validateT3CodeThemeFile(value), { valid: true, errors: [] });
  assert.equal(value.version, 1);
  assert.equal(value.appearance, 'light');
  assert.deepEqual(Object.keys(value.variants), ['dark']);
  assert.deepEqual(Object.keys(value.colors), T3CODE_THEME_COLOR_ROLES);
  for (const field of ['collection', 'managed', 'sidebarArtwork']) assert.equal(field in value, false);
  assert.match(prepared.setup.importPath, /Settings → Appearance → Themes → Add theme/);

  const invalid = { ...value, managed: true };
  assert.equal(validateT3CodeThemeFile(invalid).valid, false);
  assert.match(validateT3CodeThemeFile(invalid).errors.join('\n'), /managed/);
});

test('Grok Build export is limited to five pager colors and ships no profile mutator', () => {
  const prepared = buildGrokPagerThemeExport(theme);
  assert.equal(prepared.deliveryState, 'limited_export');
  assert.equal(prepared.files.length, 2);
  assert.equal(prepared.setup.helperShipped, false);
  assert.equal(prepared.setup.writesHostConfig, false);
  assert.match(prepared.setup.securityBoundary, /does not read auth\.json/);
  for (const variant of ['dark', 'light']) {
    const override = buildGrokPagerOverride(theme, variant);
    assert.deepEqual(validateGrokPagerOverride(override.value), { valid: true, errors: [] });
    assert.deepEqual(Object.keys(override.value), GROK_PAGER_COLOR_PATHS);
    assert.equal((override.toml.match(/ = /g) || []).length, 5);
    assert.doesNotMatch(override.toml, /auth\.json|\[theme\]|plugin|mcp/i);
    const exported = prepared.files.find((file) => file.path.endsWith(`${variant}.pager.toml`));
    assert.equal(exported.mediaType, 'application/toml');
    assert.equal(exported.content, override.toml);
  }
  assert.equal(validateGrokPagerOverride({ ...buildGrokPagerOverride(theme, 'dark').value, extra: '#000000' }).valid, false);
});

test('host palette readers require own properties and sanitize export paths', () => {
  const inheritedDark = Object.create({ surface: '#11131A' });
  Object.assign(inheritedDark, theme.dark);
  delete inheritedDark.surface;
  assert.throws(() => buildClaudeThemeExport({ ...theme, dark: inheritedDark }), /dark\.surface is required/);

  const malicious = { ...theme, id: '../../auth.json', name: '../ auth.json' };
  for (const prepared of [buildT3CodeThemeExport(malicious), buildGrokPagerThemeExport(malicious)]) {
    assert.ok(prepared.files.every((file) => !file.path.includes('..') && !file.path.includes('auth.json/')));
  }
});
