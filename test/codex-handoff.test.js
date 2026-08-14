import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { getApplyButtonCopy } from '../src/codex-handoff.js';
import { fallbackCopy } from '../src/utils.js';

test('desktop copy button promises clipboard behavior and discloses the Settings handoff', () => {
  assert.deepEqual(getApplyButtonCopy(false), {
    defaultLabel: 'Copy theme',
    successLabel: 'Theme copied to clipboard',
    failureLabel: 'Copy manually',
    hintText: 'Copies the theme to your clipboard and opens Codex Settings.',
    successHintText: 'Theme copied to your clipboard. Codex Settings is opening.',
    failureHintText: 'Clipboard access was blocked. Select the theme text shown and copy it manually.',
  });
});

test('compact copy button confirms the clipboard result', () => {
  assert.deepEqual(getApplyButtonCopy(true), {
    defaultLabel: 'Copy theme',
    successLabel: 'Theme copied to clipboard',
    failureLabel: 'Copy manually',
    hintText: 'Copies the theme to your clipboard.',
    successHintText: 'Theme copied to your clipboard. Paste it into Codex when ready.',
    failureHintText: 'Clipboard access was blocked. Select the theme text shown and copy it manually.',
  });
});

function installCopyDocument(t, execCommand) {
  const originalDocument = globalThis.document;
  const textarea = {
    value: '',
    style: {},
    selectCalled: false,
    select() { this.selectCalled = true; },
  };
  let removed = false;
  globalThis.document = {
    createElement: () => textarea,
    execCommand,
    body: {
      appendChild() {},
      removeChild(node) {
        assert.equal(node, textarea);
        removed = true;
      },
    },
  };
  t.after(() => {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  });
  return { textarea, wasRemoved: () => removed };
}

test('fallback copy reports false without invoking the success path', (t) => {
  const fixture = installCopyDocument(t, () => false);
  let succeeded = false;
  let failed = false;

  const copied = fallbackCopy(
    'codex-theme-v1:{"theme":"dark"}',
    () => { succeeded = true; },
    () => { failed = true; },
  );

  assert.equal(copied, false);
  assert.equal(succeeded, false);
  assert.equal(failed, true);
  assert.equal(fixture.textarea.selectCalled, true);
  assert.equal(fixture.wasRemoved(), true);
});

test('fallback copy preserves the successful legacy browser path', (t) => {
  const fixture = installCopyDocument(t, () => true);
  let succeeded = false;

  const copied = fallbackCopy('theme', () => { succeeded = true; });

  assert.equal(copied, true);
  assert.equal(succeeded, true);
  assert.equal(fixture.wasRemoved(), true);
});

test('fallback copy reports a thrown browser copy error and still cleans up', (t) => {
  const fixture = installCopyDocument(t, () => { throw new Error('copy blocked'); });
  let failed = false;

  const copied = fallbackCopy('theme', undefined, () => { failed = true; });

  assert.equal(copied, false);
  assert.equal(failed, true);
  assert.equal(fixture.wasRemoved(), true);
});

test('Codex copy surfaces emit truthful telemetry and expose a manual failure path', async () => {
  const [previewSource, builderSource, handoffSource, multiHarnessDocs] = await Promise.all([
    readFile(new URL('../src/preview-shell.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/builder.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/codex-handoff.js', import.meta.url), 'utf8'),
    readFile(new URL('../docs/MULTI-HARNESS.md', import.meta.url), 'utf8'),
  ]);

  for (const source of [previewSource, builderSource]) {
    assert.match(source, /['"]theme_copied['"]/);
    assert.doesNotMatch(source, /track(?:Event)?\(['"]theme_applied['"]/);
    assert.match(source, /showManualCopyDialog/);
  }
  assert.match(handoffSource, /export function showManualCopyDialog/);
  assert.match(multiHarnessDocs, /Codex copy-only handoffs emit `theme_copied`/);
});
