import assert from 'node:assert/strict';
import test from 'node:test';

import { DEEPSEEK_HARNESS_THEMES } from '../packages/deepseek-harness-plugin/src/deepseek-themes.js';
import { PLATFORM_IDS, PLATFORM_REGISTRY } from '../shared/platform-registry.js';
import { getPlatformThemeCategoryId } from '../src/platform-catalog.js';

globalThis.window = {};
await import('../theme-data/dexthemes/helpers.js');
globalThis.createDexTheme = window.createDexTheme;
globalThis.registerDexThemesPack = window.registerDexThemesPack;
await import('../theme-data/dexthemes/bundle.js');
const { THEMES } = await import('../src/theme-catalog.js');

test('every registered platform resolves to a non-empty, isolated website collection', () => {
  const allThemeIds = new Set(THEMES.map((theme) => theme.id));
  assert.equal(allThemeIds.size, THEMES.length, 'theme ids must stay globally unique');

  for (const platformId of PLATFORM_IDS) {
    const categoryId = getPlatformThemeCategoryId(platformId);
    const themes = THEMES.filter((theme) => theme.category === categoryId);
    assert.ok(themes.length > 0, `${platformId} collection should not be empty`);
    assert.ok(
      themes.some((theme) => theme.id === PLATFORM_REGISTRY[platformId].defaultThemeId),
      `${platformId} should select a theme from its own collection`,
    );
    assert.ok(themes.every((theme) => theme.category === categoryId));
  }
});

test('Codex, DeepSeek, and shared DexThemes source counts remain intact', () => {
  const rawDexThemesCount = Object.values(window.DEXTHEMES_PACKS.dexthemes).flat().length;
  assert.equal(THEMES.filter((theme) => theme.category === 'official').length, 30);
  assert.equal(THEMES.filter((theme) => theme.category === 'deepseek').length, DEEPSEEK_HARNESS_THEMES.length);
  assert.equal(THEMES.filter((theme) => theme.category === 'dexthemes').length, rawDexThemesCount);
  assert.equal(THEMES.filter((theme) => theme.category === 'community').length, 0);
});
