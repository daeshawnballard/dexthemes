import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSelectedPlatformId } from '../src/platform-selection.js';

test('shared URL platform wins over the persisted preference', () => {
  assert.equal(resolveSelectedPlatformId({
    urlPlatformId: 'deepseek',
    hasUrlPlatform: true,
    storedPlatformId: 'claude',
  }), 'deepseek');
});

test('stored platform wins over the backward-compatible Codex default', () => {
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'gemini' }), 'gemini');
  assert.equal(resolveSelectedPlatformId(), 'codex');
});

test('an explicit invalid shared platform fails safely to Codex', () => {
  assert.equal(resolveSelectedPlatformId({
    urlPlatformId: '../deepseek',
    hasUrlPlatform: true,
    storedPlatformId: 'deepseek',
  }), 'codex');
});
