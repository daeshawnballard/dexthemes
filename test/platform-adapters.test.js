import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PlatformAdapterUnavailableError,
  getPlatformAdapter,
  preparePlatformTheme,
} from '../shared/platform-adapters.js';

const theme = Object.freeze({
  id: 'adapter-test',
  name: 'Adapter Test',
  summary: 'A paired theme used to verify the shared adapter boundary.',
  codeThemeId: 'codex',
  accents: ['#7C5CFC'],
  dark: Object.freeze({
    surface: '#11131A', ink: '#F3F5FA', accent: '#7C5CFC', contrast: 60,
    sidebar: '#0D0F15', codeBg: '#090B10', diffAdded: '#49C97A', diffRemoved: '#FF5B65', skill: '#F3B65A',
  }),
  light: Object.freeze({
    surface: '#F8F9FC', ink: '#171922', accent: '#6545E8', contrast: 45,
    sidebar: '#EEF0F6', codeBg: '#E8EAF1', diffAdded: '#177A43', diffRemoved: '#C4293A', skill: '#8A5800',
  }),
});

test('Codex preparation preserves the existing import contract', () => {
  const prepared = preparePlatformTheme(theme, 'codex', { variant: 'dark' });
  assert.equal(prepared.kind, 'copy_import');
  assert.match(prepared.payload, /^codex-theme-v1:/);
  assert.equal(prepared.settingsUrl, 'codex://settings');
});

test('DeepSeek preparation produces paired semantic tokens and a reversible payload', () => {
  const prepared = preparePlatformTheme(theme, 'deepseek');
  assert.equal(prepared.kind, 'direct_payload');
  assert.equal(prepared.reversible, true);
  assert.deepEqual(Object.keys(prepared.previewTokens['--dsw-alias-bg-base']).sort(), ['dark', 'light']);
  assert.deepEqual(prepared.unsupportedFields, ['fonts', 'effects']);
});

test('proven export seams produce reviewable files without an Apply payload', () => {
  const expectedKinds = {
    claude: 'file_export',
    qwen: 'file_export',
    opencode: 'file_export',
    pi: 'package_export',
    zed: 'file_export',
    cursor: 'package_source',
    t3code: 'file_export',
    grok: 'file_export',
  };
  for (const [platformId, kind] of Object.entries(expectedKinds)) {
    assert.equal(getPlatformAdapter(platformId)?.platformId, platformId);
    const prepared = preparePlatformTheme(theme, platformId);
    assert.equal(prepared.kind, kind, platformId);
    assert.equal(prepared.payload, null, platformId);
    assert.ok(prepared.files.length > 0, platformId);
    assert.equal(prepared.setup.writesHostConfig, false, platformId);
  }
});

test('Unknown or unsupported platforms fail with a typed unavailable result', () => {
  for (const platformId of ['antigravity', 'conductor']) {
    assert.equal(getPlatformAdapter(platformId), null);
    assert.throws(
      () => preparePlatformTheme(theme, platformId),
      (error) => error instanceof PlatformAdapterUnavailableError && error.code === 'platform_adapter_unavailable',
      platformId,
    );
  }
});
