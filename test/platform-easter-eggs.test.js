import test from 'node:test';
import assert from 'node:assert/strict';

import { getPlatformEasterEggs } from '../shared/platform-easter-eggs.js';
import { PLATFORM_IDS } from '../shared/platform-registry.js';

test('universal Easter eggs appear in every platform context', () => {
  for (const platformId of PLATFORM_IDS) {
    assert.deepEqual(getPlatformEasterEggs(platformId).slice(0, 2).map((egg) => egg.id), [
      'color-me-lucky',
      'paired-preview',
    ]);
  }
});

test('harness-specific Easter eggs never leak across platform contexts', () => {
  const codex = getPlatformEasterEggs('codex').map((egg) => egg.id);
  const deepseek = getPlatformEasterEggs('deepseek').map((egg) => egg.id);
  assert.ok(codex.includes('codex-settings'));
  assert.ok(!codex.includes('deep-current'));
  assert.ok(deepseek.includes('deep-current'));
  assert.ok(!deepseek.includes('codex-settings'));
});
