import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PLATFORM_EVENT_NAMES,
  buildPlatformEventMetadata,
  sanitizePlatformEventMetadata,
} from '../src/platform-analytics.js';

test('multi-harness analytics remains additive and includes the requested lifecycle', () => {
  for (const event of [
    'harness_selected', 'theme_previewed', 'prompt_generation_attempted',
    'prompt_generation_succeeded', 'prompt_generation_failed', 'generated_draft_accepted',
    'apply_attempted', 'apply_succeeded', 'apply_failed', 'revert_attempted',
    'revert_succeeded', 'revert_failed',
  ]) assert.ok(PLATFORM_EVENT_NAMES.includes(event));
});

test('analytics cannot retain prompts, workspace data, credentials, or raw errors', () => {
  const safe = sanitizePlatformEventMetadata({
    platform_id: 'deepseek',
    source_surface: 'creator',
    prompt: 'read my workspace',
    workspace_contents: 'secret source',
    credential: 'sk-secret',
    error: 'sensitive exception string',
    error_category: 'timeout',
  });
  assert.deepEqual(safe, {
    platform_id: 'deepseek',
    source_surface: 'creator',
    error_category: 'timeout',
  });
});

test('platform metadata uses only normalized coarse identifiers', () => {
  assert.deepEqual(buildPlatformEventMetadata('DeepSeek Harness', {
    theme_id: 'Forest Signal',
    variant: 'dark',
    creation_mode: 'luna',
  }), {
    platform_id: 'deepseek',
    adapter_version: 'deepseek-semantic-v1',
    plugin_version: '0.6.0',
    variant: 'dark',
    creation_mode: 'luna',
  });
});
