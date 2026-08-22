'use strict';

const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');

const {
  APPLIED_THEME,
  PREVIOUS_THEME_KEY,
  applyTheme,
  revertTheme,
} = require('../src/theme-controller');

function harness(initialTheme = 'Cursor Dark Midnight') {
  let theme = initialTheme;
  const values = new Map();
  return {
    bridge: {
      async getTheme() {
        return theme;
      },
      async setTheme(value) {
        theme = value;
      },
      state: {
        get(key) {
          return values.get(key);
        },
        async update(key, value) {
          if (value === undefined) values.delete(key);
          else values.set(key, value);
        },
      },
    },
    get theme() {
      return theme;
    },
    values,
  };
}

test('manifest contributes a supported theme plus Apply and Revert commands', async () => {
  const manifest = JSON.parse(await readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(manifest.main, './extension.js');
  assert.deepEqual(
    manifest.contributes.commands.map(({ command }) => command),
    ['dexthemes.applyNocturnalVigil', 'dexthemes.revertTheme'],
  );
  assert.deepEqual(manifest.contributes.themes, [{
    label: APPLIED_THEME,
    uiTheme: 'vs-dark',
    path: './themes/nocturnal-vigil-dark-color-theme.json',
  }]);
});

test('theme payload retains the selected Nocturnal Vigil canonical palette', async () => {
  const file = path.join(__dirname, '..', 'themes', 'nocturnal-vigil-dark-color-theme.json');
  const theme = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(theme.name, APPLIED_THEME);
  assert.equal(theme.type, 'dark');
  assert.equal(theme.colors['titleBar.activeBackground'], '#0D1117');
  assert.equal(theme.colors['sideBar.background'], '#060A10');
  assert.equal(theme.colors['editor.background'], '#01050B');
  assert.equal(theme.colors['statusBar.background'], '#FACC15');
  assert.equal(theme.colors['editor.foreground'], '#E5E7EB');
});

test('apply records the previous theme and activates DexThemes', async () => {
  const cursor = harness();
  const result = await applyTheme(cursor.bridge);
  assert.equal(result.previousTheme, 'Cursor Dark Midnight');
  assert.equal(result.appliedTheme, APPLIED_THEME);
  assert.equal(cursor.theme, APPLIED_THEME);
  assert.equal(cursor.values.get(PREVIOUS_THEME_KEY), 'Cursor Dark Midnight');
});

test('repeat apply does not overwrite the stored pre-DexThemes theme', async () => {
  const cursor = harness();
  await applyTheme(cursor.bridge);
  await applyTheme(cursor.bridge);
  assert.equal(cursor.values.get(PREVIOUS_THEME_KEY), 'Cursor Dark Midnight');
});

test('revert restores the previous theme and clears stored state', async () => {
  const cursor = harness();
  await applyTheme(cursor.bridge);
  const result = await revertTheme(cursor.bridge);
  assert.equal(result.restoredTheme, 'Cursor Dark Midnight');
  assert.equal(cursor.theme, 'Cursor Dark Midnight');
  assert.equal(cursor.values.has(PREVIOUS_THEME_KEY), false);
});

test('revert fails closed when no prior theme was recorded', async () => {
  const cursor = harness();
  await assert.rejects(
    revertTheme(cursor.bridge),
    /Stored previous Cursor theme must be a non-empty string/,
  );
  assert.equal(cursor.theme, 'Cursor Dark Midnight');
});
