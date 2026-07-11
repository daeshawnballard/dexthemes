import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getThemeVariants,
  themeHasVariant,
  buildThemeImportString,
} from '../src/theme-contracts.js';

test('getThemeVariants derives variants from dark/light properties', () => {
  const theme = { dark: {}, light: {} };
  assert.deepEqual(getThemeVariants(theme), ['dark', 'light']);
});

test('getThemeVariants prefers explicit variants list', () => {
  const theme = { variants: ['light'] };
  assert.deepEqual(getThemeVariants(theme), ['light']);
});

test('themeHasVariant checks membership correctly', () => {
  const theme = { dark: {} };
  assert.equal(themeHasVariant(theme, 'dark'), true);
  assert.equal(themeHasVariant(theme, 'light'), false);
});

test('buildThemeImportString produces Codex import payload with variant-specific code theme', () => {
  const theme = {
    accents: ['#ff00aa'],
    codeThemeId: { dark: 'codex', light: 'light-theme' },
    dark: {
      surface: '#111111',
      ink: '#fefefe',
      accent: '#333333',
      contrast: 60,
      diffAdded: '#00aa00',
      diffRemoved: '#aa0000',
      skill: '#5500ff',
    },
  };

  const importString = buildThemeImportString(theme, 'dark', 0);
  assert.match(importString, /^codex-theme-v1:/);

  const payload = JSON.parse(importString.slice('codex-theme-v1:'.length));
  assert.equal(payload.codeThemeId, 'codex');
  assert.equal(payload.variant, 'dark');
  assert.equal(payload.theme.accent, '#ff00aa');
  assert.equal(payload.theme.semanticColors.skill, '#5500ff');
});

test('buildThemeImportString returns empty string when variant is missing', () => {
  assert.equal(buildThemeImportString({ accents: [] }, 'dark', 0), '');
});

test('buildThemeImportString preserves variant font payloads', () => {
  const fonts = {
    code: '"Geist Mono", ui-monospace, "SFMono-Regular"',
    ui: 'Geist, Inter',
  };
  const theme = {
    codeThemeId: 'vercel',
    dark: {
      surface: '#000000',
      ink: '#ededed',
      accent: '#006efe',
      contrast: 50,
      diffAdded: '#00AD3A',
      diffRemoved: '#F13342',
      skill: '#9540D5',
      fonts,
    },
  };

  const importString = buildThemeImportString(theme, 'dark', 0);
  const payload = JSON.parse(importString.slice('codex-theme-v1:'.length));
  assert.equal(payload.codeThemeId, 'vercel');
  assert.equal(payload.theme.accent, '#006efe');
  assert.deepEqual(payload.theme.fonts, fonts);
});
