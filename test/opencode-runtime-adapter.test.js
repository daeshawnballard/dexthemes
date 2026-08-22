import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  buildOpenCodeThemeExport,
  validateOpenCodeThemeDefinition,
} from '../shared/opencode-theme-contract.js';

const selectedTheme = Object.freeze({
  id: 'deepseek-baidu',
  name: 'Baidu',
  dark: {
    contrast: 64,
    surface: '#0E0E21',
    ink: '#F2F1FF',
    accent: '#6262FF',
    sidebar: '#090918',
    codeBg: '#060611',
    diffAdded: '#39CE8A',
    diffRemoved: '#FF5B74',
    skill: '#8E8CFF',
  },
  light: {
    contrast: 46,
    surface: '#F7F7FF',
    ink: '#1E1E3A',
    accent: '#2932E1',
    sidebar: '#ECECFA',
    codeBg: '#F0F0FC',
    diffAdded: '#157D51',
    diffRemoved: '#C72B45',
    skill: '#3C43B8',
  },
});

test('the proven OpenCode payload is a deterministic paired DexThemes export', async () => {
  const payload = JSON.parse(await readFile(
    new URL('../.opencode/themes/deepseek-baidu.json', import.meta.url),
    'utf8',
  ));

  const prepared = buildOpenCodeThemeExport(selectedTheme);
  assert.deepEqual(payload, JSON.parse(prepared.files[0].content));
  assert.deepEqual(validateOpenCodeThemeDefinition(payload), { valid: true, errors: [] });
  assert.deepEqual(payload.theme.background, { dark: '#0E0E21', light: '#F7F7FF' });
  assert.deepEqual(payload.theme.primary, { dark: '#6262FF', light: '#2932E1' });
});

test('the checked-in OpenCode connector uses the restricted remote profile', async () => {
  const config = JSON.parse(await readFile(
    new URL('../integrations/opencode/dexthemes/opencode.jsonc', import.meta.url),
    'utf8',
  ));

  assert.deepEqual(config, {
    $schema: 'https://opencode.ai/config.json',
    mcp: {
      dexthemes: {
        type: 'remote',
        url: 'https://www.dexthemes.com/api/mcp?profile=cursor_discovery',
      },
    },
  });
});
