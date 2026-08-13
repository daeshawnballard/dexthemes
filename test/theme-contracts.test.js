import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getThemeVariants,
  themeHasVariant,
  getThemeAccentOptions,
  buildThemeImportString,
} from '../src/theme-contracts.js';
import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';
import { prepareThemeApply } from '../server/theme-tools.js';

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

test('getThemeAccentOptions preserves configured accent choices', () => {
  const accents = ['#FF0000', '#00FF00'];
  assert.deepEqual(getThemeAccentOptions({ accents, dark: { accent: '#0000FF' } }, 'dark'), accents);
});

test('getThemeAccentOptions falls back to the active palette accent', () => {
  const theme = {
    accents: [],
    dark: { accent: '#FF5A5F' },
    light: { accent: '#FF7A1A' },
  };
  assert.deepEqual(getThemeAccentOptions(theme, 'dark'), ['#FF5A5F']);
  assert.deepEqual(getThemeAccentOptions(theme, 'light'), ['#FF7A1A']);
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

test('buildThemeImportString rejects color and contrast injection payloads', () => {
  const base = {
    accents: ['#ff00aa'],
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
  const attacks = [
    '#000000;url(javascript:alert(1))',
    '#000000\" onmouseover=\"alert(1)',
    '#000000\\nbackground:url(https://attacker.invalid)',
    'var(--host-color)',
    'expression(alert(1))',
    '#ＦＦＦＦＦＦ',
    '#00000000',
  ];

  for (const attack of attacks) {
    for (const key of ['surface', 'ink', 'accent', 'diffAdded', 'diffRemoved', 'skill']) {
      const theme = structuredClone(base);
      theme.dark[key] = attack;
      assert.equal(buildThemeImportString(theme, 'dark'), '', `${key} accepted ${attack}`);
    }
    const theme = structuredClone(base);
    theme.accents = [attack];
    assert.equal(buildThemeImportString(theme, 'dark'), '', `accent accepted ${attack}`);
  }

  for (const contrast of [NaN, Infinity, -1, 101]) {
    const theme = structuredClone(base);
    theme.dark.contrast = contrast;
    assert.equal(buildThemeImportString(theme, 'dark'), '', `contrast accepted ${contrast}`);
  }
});

test('known legacy module IDs canonicalize but malformed and unknown IDs fail closed', () => {
  const base = {
    codeThemeId: 'github-dark-default',
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

  const legacyPayload = JSON.parse(
    buildThemeImportString(base, 'dark').slice('codex-theme-v1:'.length),
  );
  assert.equal(legacyPayload.codeThemeId, 'github');

  for (const codeThemeId of ['github_dark', 'unknown', ' github', '', 'a'.repeat(81)]) {
    assert.equal(buildThemeImportString({ ...base, codeThemeId }, 'dark'), '', codeThemeId);
  }
  assert.equal(
    buildThemeImportString({ ...base, codeThemeId: 'github-light-default' }, 'dark'),
    '',
    'variant-specific legacy ID crossed variants',
  );
  assert.equal(
    buildThemeImportString({
      ...base,
      codeThemeId: 'proof',
    }, 'dark'),
    '',
    'light-only code theme imported as dark',
  );
});

test('variant-specific code theme objects and partial font objects serialize safely', () => {
  const theme = {
    codeThemeId: { dark: 'gruvbox', light: 'one' },
    dark: {
      surface: '#1d2021', ink: '#ebdbb2', accent: '#fe8019', contrast: 60,
      diffAdded: '#b8bb26', diffRemoved: '#fb4934', skill: '#d3869b',
      fonts: { code: 'Berkeley Mono' },
    },
    light: {
      surface: '#ffffff', ink: '#1f2328', accent: '#0969da', contrast: 45,
      diffAdded: '#1a7f37', diffRemoved: '#cf222e', skill: '#8250df',
      fonts: { ui: 'Inter' },
    },
  };

  const dark = JSON.parse(buildThemeImportString(theme, 'dark').slice('codex-theme-v1:'.length));
  const light = JSON.parse(buildThemeImportString(theme, 'light').slice('codex-theme-v1:'.length));
  assert.equal(dark.codeThemeId, 'gruvbox');
  assert.deepEqual(dark.theme.fonts, { code: 'Berkeley Mono', ui: null });
  assert.equal(light.codeThemeId, 'one');
  assert.deepEqual(light.theme.fonts, { code: null, ui: 'Inter' });
});

test('website exporter and MCP prepare path emit byte-identical imports', () => {
  const affected = ['github-dark', 'github-light', 'gruvbox', 'one-dark'];
  for (const id of affected) {
    const theme = STATIC_THEME_CATALOG.find((candidate) => candidate.id === id);
    const variant = theme.dark ? 'dark' : 'light';
    assert.equal(
      buildThemeImportString(theme, variant),
      prepareThemeApply({
        ...theme,
        summary: theme.summary || theme._summary || `A ${theme.name} workspace theme for Codex.`,
      }, variant).importString,
      id,
    );
  }

  const custom = {
    id: 'custom-signal',
    name: 'Custom Signal',
    summary: 'An original custom workspace palette.',
    category: 'community',
    codeThemeId: 'codex',
    dark: {
      surface: '#101218', ink: '#f4f5f7', accent: '#6f8cff', contrast: 64,
      diffAdded: '#4fd18a', diffRemoved: '#f06a6a', skill: '#b39ddb',
      fonts: { code: 'Berkeley Mono', ui: 'Inter' },
    },
    accents: ['#6f8cff'],
  };
  assert.equal(
    buildThemeImportString(custom, 'dark'),
    prepareThemeApply(custom, 'dark').importString,
  );
});
