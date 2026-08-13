import test from 'node:test';
import assert from 'node:assert/strict';

import { getApplyButtonCopy } from '../src/codex-handoff.js';

test('desktop copy button promises clipboard behavior and discloses the Settings handoff', () => {
  assert.deepEqual(getApplyButtonCopy(false), {
    defaultLabel: 'Copy theme',
    successLabel: 'Theme copied to clipboard',
    hintText: 'Copies the theme to your clipboard and opens Codex Settings.',
    successHintText: 'Theme copied to your clipboard. Codex Settings is opening.',
  });
});

test('compact copy button confirms the clipboard result', () => {
  assert.deepEqual(getApplyButtonCopy(true), {
    defaultLabel: 'Copy theme',
    successLabel: 'Theme copied to clipboard',
    hintText: 'Copies the theme to your clipboard.',
    successHintText: 'Theme copied to your clipboard. Paste it into Codex when ready.',
  });
});
