import test from 'node:test';
import assert from 'node:assert/strict';

import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';

const EXPECTED_VARIANTS = {
  everforest: ['dark', 'light'],
  linear: ['dark', 'light'],
  lobster: ['dark'],
  material: ['dark'],
  matrix: ['dark'],
  'night-owl': ['dark'],
  oscurange: ['dark'],
  proof: ['light'],
  sentry: ['dark'],
  temple: ['dark'],
  xcode: ['dark', 'light'],
};

test('includes every official Codex theme advertised by DexThemes', () => {
  for (const [id, variants] of Object.entries(EXPECTED_VARIANTS)) {
    const theme = STATIC_THEME_CATALOG.find((candidate) => candidate.id === id);

    assert.ok(theme, `missing ${id}`);
    assert.equal(theme.category, 'codex');
    assert.equal(theme.codeThemeId, id);
    assert.deepEqual(theme.variants ?? [theme.dark && 'dark', theme.light && 'light'].filter(Boolean), variants);
  }
});
