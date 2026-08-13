import { getPlatform } from '../shared/platform-registry.js';
import { trackEvent } from './analytics-client.js';

export const PLATFORM_EVENT_NAMES = Object.freeze([
  'harness_selected',
  'theme_source_opened',
  'theme_previewed',
  'variant_previewed',
  'creator_opened',
  'manual_creation_started',
  'prompt_generation_attempted',
  'prompt_generation_succeeded',
  'prompt_generation_failed',
  'generated_draft_revised',
  'generated_draft_accepted',
  'validation_completed',
  'apply_attempted',
  'apply_succeeded',
  'apply_failed',
  'revert_attempted',
  'revert_succeeded',
  'revert_failed',
  'mcp_setup_opened',
  'mcp_connection_confirmed',
  'api_setup_opened',
  'effect_previewed',
  'effect_fallback_shown',
]);

const EVENT_SET = new Set(PLATFORM_EVENT_NAMES);
const SAFE_METADATA_KEYS = new Set([
  'platform_id',
  'theme_id',
  'theme_source',
  'variant',
  'source_surface',
  'apply_mode',
  'adapter_version',
  'plugin_version',
  'harness_version',
  'creation_mode',
  'effect_kind',
  'validation_result',
  'error_category',
]);

const ENUM_KEYS = Object.freeze({
  variant: new Set(['dark', 'light', 'both', 'paired', 'unknown']),
  source_surface: new Set(['website', 'installed_plugin', 'creator', 'mcp', 'api', 'theme_details', 'unknown']),
  creation_mode: new Set(['manual', 'luna', 'mcp', 'api', 'unknown']),
  validation_result: new Set(['valid', 'invalid', 'warning', 'unknown']),
});

function boundedIdentifier(value, maxLength = 80) {
  const normalized = String(value || '').trim().toLowerCase();
  return /^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(normalized)
    ? normalized.slice(0, maxLength)
    : undefined;
}

export function sanitizePlatformEventMetadata(metadata = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(metadata || {})) {
    if (!SAFE_METADATA_KEYS.has(key)) continue;
    const normalized = boundedIdentifier(value);
    if (!normalized) continue;
    if (ENUM_KEYS[key] && !ENUM_KEYS[key].has(normalized)) continue;
    safe[key] = normalized;
  }
  return Object.freeze(safe);
}

export function buildPlatformEventMetadata(platformId, metadata = {}) {
  const platform = getPlatform(platformId);
  return sanitizePlatformEventMetadata({
    ...metadata,
    platform_id: platform.id,
    adapter_version: platform.adapterVersion,
    plugin_version: platform.pluginVersion,
  });
}

export function trackPlatformEvent(name, platformId, metadata = {}) {
  if (!EVENT_SET.has(name)) return false;
  void trackEvent(name, null, buildPlatformEventMetadata(platformId, metadata));
  return true;
}
