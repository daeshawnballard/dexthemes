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
    'revert_succeeded', 'revert_failed', 'copy_attempted', 'copy_succeeded',
    'copy_failed', 'platform_setup_opened',
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

test('every platform lifecycle receives authoritative action and outcome attribution', () => {
  for (const eventName of PLATFORM_EVENT_NAMES) {
    const metadata = buildPlatformEventMetadata('deepseek', {
      source_surface: 'preview_message',
      theme_id: 'deepseek-huawei',
      variant: 'paired',
      action: 'caller_cannot_override',
      outcome: 'failed',
      prompt: 'never collect this',
    }, eventName);
    assert.equal(metadata.platform_id, 'deepseek', eventName);
    assert.equal(metadata.plugin_version, '0.6.0', eventName);
    assert.equal(metadata.source_surface, 'preview_message', eventName);
    assert.equal(metadata.theme_id, 'deepseek-huawei', eventName);
    assert.equal(metadata.variant, 'paired', eventName);
    assert.ok(metadata.action, eventName);
    assert.ok(['attempted', 'succeeded', 'failed'].includes(metadata.outcome), eventName);
    assert.equal('prompt' in metadata, false, eventName);
  }
});

test('failure attribution cannot be contradicted by caller metadata', () => {
  assert.deepEqual(buildPlatformEventMetadata('codex', {
    source_surface: 'website',
    theme_id: 'dracula',
    variant: 'dark',
    action: 'apply_theme',
    outcome: 'succeeded',
  }, 'copy_failed'), {
    platform_id: 'codex',
    theme_id: 'dracula',
    variant: 'dark',
    source_surface: 'website',
    adapter_version: 'codex-theme-v1',
    action: 'copy_theme',
    outcome: 'failed',
  });
});
