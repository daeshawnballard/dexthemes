import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';
import {
  CODEX_CODE_THEME_IDS,
  CODEX_CODE_THEME_VARIANTS,
  resolveThemeCodeThemeId,
} from '../shared/codex-theme-contract.js';

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

test('every static official theme uses a supported Codex code theme for each variant', () => {
  const officialThemes = STATIC_THEME_CATALOG.filter((theme) => theme.category === 'codex');
  assert.ok(officialThemes.length > 20);

  for (const theme of officialThemes) {
    const variants = theme.variants
      ?? ['dark', 'light'].filter((variant) => Boolean(theme[variant]));
    for (const variant of variants) {
      const codeThemeId = resolveThemeCodeThemeId(theme, variant);
      assert.ok(codeThemeId, `${theme.id} has unsupported ${variant} codeThemeId`);
      assert.ok(CODEX_CODE_THEME_IDS.includes(codeThemeId), `${theme.id} emitted ${codeThemeId}`);
      assert.ok(
        CODEX_CODE_THEME_VARIANTS[codeThemeId].includes(variant),
        `${theme.id} maps ${variant} to incompatible ${codeThemeId}`,
      );
    }
  }
});

test('affected official themes keep their DexThemes IDs and use canonical Codex family IDs', () => {
  const expected = {
    'github-dark': 'github',
    'github-light': 'github',
    gruvbox: 'gruvbox',
    'one-dark': 'one',
    'vscode-plus': 'vscode-plus',
  };

  for (const [id, codeThemeId] of Object.entries(expected)) {
    const theme = STATIC_THEME_CATALOG.find((candidate) => candidate.id === id);
    assert.ok(theme, id);
    assert.equal(theme.themeId, id);
    assert.equal(theme.codeThemeId, codeThemeId);
  }
});

test('generated route, docs, and protection surfaces retain website catalog identity', async () => {
  const themeMap = JSON.parse(
    await readFile(new URL('../api/theme-map.json', import.meta.url), 'utf8'),
  );
  const llmsFull = await readFile(new URL('../public/llms-full.txt', import.meta.url), 'utf8');
  const protectedThemes = await readFile(
    new URL('../convex/protectedThemes.ts', import.meta.url),
    'utf8',
  );

  for (const id of ['github-dark', 'github-light', 'gruvbox', 'one-dark']) {
    assert.equal(Object.hasOwn(themeMap, id), true);
    assert.match(llmsFull, new RegExp(`- ID: \\\`${id}\\\``));
    assert.match(protectedThemes, new RegExp(`id: '${id}'`));
  }
});
