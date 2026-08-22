import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveSelectedPlatformId } from '../src/platform-selection.js';

test('shared URL platform wins over the persisted preference', () => {
  assert.equal(resolveSelectedPlatformId({
    urlPlatformId: 'cursor',
    hasUrlPlatform: true,
    storedPlatformId: 'opencode',
  }), 'cursor');
});

test('stored verified platform wins and incomplete values fail safely to the verified default', () => {
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'opencode' }), 'opencode');
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'antigravity' }), 'deepseek');
  assert.equal(resolveSelectedPlatformId(), 'deepseek');
});

test('only aliases for verified platforms resolve in the website selector', () => {
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 't3-code' }), 't3code');
  assert.equal(resolveSelectedPlatformId({ storedPlatformId: 'grok-build' }), 'deepseek');
});

test('an explicit invalid or incomplete shared platform fails safely to DeepSeek', () => {
  assert.equal(resolveSelectedPlatformId({
    urlPlatformId: '../deepseek',
    hasUrlPlatform: true,
    storedPlatformId: 'cursor',
  }), 'deepseek');
  assert.equal(resolveSelectedPlatformId({
    urlPlatformId: 'qwen',
    hasUrlPlatform: true,
    storedPlatformId: 'cursor',
  }), 'deepseek');
});
