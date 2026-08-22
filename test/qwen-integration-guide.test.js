import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const guide = await readFile(
  new URL('../integrations/qwen-code/README.md', import.meta.url),
  'utf8',
);

function snapshotUiTheme(settings) {
  const ui = settings.ui;
  if (!ui || typeof ui !== 'object' || Array.isArray(ui) || !Object.hasOwn(ui, 'theme')) {
    return { present: false };
  }
  return { present: true, value: ui.theme };
}

function restoreUiTheme(settings, snapshot) {
  const restored = structuredClone(settings);
  restored.ui ??= {};
  if (snapshot.present) restored.ui.theme = snapshot.value;
  else delete restored.ui.theme;
  return restored;
}

test('Qwen guide requires lossless ui.theme snapshots and restores', () => {
  assert.match(guide, /snapshot both its \*\*presence\*\* and its exact JSON\s+string value/i);
  assert.match(guide, /\| `ui\.theme` absent \|/);
  assert.match(guide, /\| Auto \| the exact string `"auto"` \|/);
  assert.match(guide, /\| Named built-in\/custom theme \|/);
  assert.match(guide, /\| Custom theme file path \|/);
  assert.match(guide, /Never use a generic “remove\s*`ui\.theme`” rollback/i);
});

test('Qwen ui.theme rollback keeps the exact prior state in all four cases', () => {
  const cases = [
    { name: 'absent', before: { ui: { statusLine: { enabled: true } } } },
    { name: 'auto', before: { ui: { theme: 'auto' } } },
    { name: 'named theme', before: { ui: { theme: 'Dracula' } } },
    { name: 'file path', before: { ui: { theme: '/Users/example/.qwen/themes/previous.json' } } },
  ];

  for (const { name, before } of cases) {
    const snapshot = snapshotUiTheme(before);
    const applied = structuredClone(before);
    applied.ui.theme = '/Users/example/.qwen/themes/dexthemes-jade-relay-dark.json';
    assert.notDeepEqual(applied, before, `${name} setup applies a distinct theme`);
    assert.deepEqual(restoreUiTheme(applied, snapshot), before, `${name} rollback is lossless`);
  }
});
