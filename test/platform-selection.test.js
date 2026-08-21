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
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'antigravity' }), 'antigravity');
  assert.equal(resolveSelectedPlatformId(), 'codex');
});

test('corrected multiword platform aliases resolve', () => {
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'google-antigravity' }), 'antigravity');
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'grok-build' }), 'grok');
});

test('an explicit invalid shared platform fails safely to Codex', () => {
  assert.equal(resolveSelectedPlatformId({
    urlPlatformId: '../deepseek',
    hasUrlPlatform: true,
    storedPlatformId: 'deepseek',
  }), 'codex');
});
