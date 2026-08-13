import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { DEEPSEEK_HARNESS_THEMES } from '../packages/deepseek-harness-plugin/src/deepseek-themes.js';

test('website consumes the installed plugin DeepSeek collection as one canonical source', async () => {
  const source = await readFile(new URL('../src/theme-catalog.js', import.meta.url), 'utf8');
  assert.match(source, /DEEPSEEK_HARNESS_THEMES/);
  assert.equal(DEEPSEEK_HARNESS_THEMES.length, 13);
  assert.equal(new Set(DEEPSEEK_HARNESS_THEMES.map((theme) => theme.id)).size, 13);
  assert.equal(DEEPSEEK_HARNESS_THEMES[0].id, 'deepseek-default');
  assert.equal(DEEPSEEK_HARNESS_THEMES[0].unofficial, false);
  assert.deepEqual(DEEPSEEK_HARNESS_THEMES[0].dark, {
    contrast: 64,
    surface: '#151517',
    ink: '#F9FAFB',
    accent: '#5686FE',
    sidebar: '#1B1B1C',
    codeBg: '#0F0F0F',
    diffAdded: '#22C55E',
    diffRemoved: '#F25A5A',
    skill: '#679EFE',
  });
  assert.deepEqual(DEEPSEEK_HARNESS_THEMES[0].light, {
    contrast: 46,
    surface: '#FFFFFF',
    ink: '#0F1115',
    accent: '#4176E6',
    sidebar: '#F9FAFB',
    codeBg: '#F9FAFB',
    diffAdded: '#22C55E',
    diffRemoved: '#EC1313',
    skill: '#4176E6',
  });
  assert.ok(DEEPSEEK_HARNESS_THEMES.every((theme) => theme.category === 'deepseek' && theme.dark && theme.light));
});
