import { trackEvent } from './analytics-client.js';
import { getPlatform } from '../shared/platform-registry.js';

export const DEEPSEEK_ANALYTICS_EVENTS = Object.freeze({
  INSTALL_STARTED: 'deepseek_plugin_install_started',
  INSTALL_SUCCEEDED: 'deepseek_plugin_install_succeeded',
  INSTALL_FAILED: 'deepseek_plugin_install_failed',
  PREVIEWED: 'deepseek_theme_previewed',
  APPLY_STARTED: 'deepseek_theme_apply_started',
  APPLY_SUCCEEDED: 'deepseek_theme_apply_succeeded',
  APPLY_FAILED: 'deepseek_theme_apply_failed',
  REVERTED: 'deepseek_theme_reverted',
});

const ALLOWED_EVENTS = new Set(Object.values(DEEPSEEK_ANALYTICS_EVENTS));
const SAFE_VALUE = /^[a-zA-Z0-9._:/-]{1,120}$/;
const EVENT_ATTRIBUTION = Object.freeze({
  deepseek_plugin_install_started: ['install_plugin', 'attempted'],
  deepseek_plugin_install_succeeded: ['install_plugin', 'succeeded'],
  deepseek_plugin_install_failed: ['install_plugin', 'failed'],
  deepseek_theme_previewed: ['preview', 'succeeded'],
  deepseek_theme_apply_started: ['apply', 'attempted'],
  deepseek_theme_apply_succeeded: ['apply', 'succeeded'],
  deepseek_theme_apply_failed: ['apply', 'failed'],
  deepseek_theme_reverted: ['revert', 'succeeded'],
});

function safeField(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = String(value).trim();
  return SAFE_VALUE.test(normalized) ? normalized : undefined;
}

export function buildDeepSeekAnalyticsMetadata({
  sourceSurface,
  themeId,
  variant,
  harnessVersion,
  pluginVersion,
  failureCode,
} = {}, eventName = null) {
  const safeSourceSurface = safeField(sourceSurface);
  const safeThemeId = safeField(themeId);
  const safeVariant = safeField(variant);
  const safeHarnessVersion = safeField(harnessVersion);
  const safePluginVersion = safeField(pluginVersion || getPlatform('deepseek').pluginVersion);
  const safeFailureCode = safeField(failureCode);
  const attribution = EVENT_ATTRIBUTION[eventName];
  return Object.freeze({
    platform: 'deepseek_harness',
    platform_id: 'deepseek',
    mechanism: 'cordis_theme_override',
    source_surface: safeSourceSurface || 'unknown',
    ...(safeThemeId ? { theme_id: safeThemeId } : {}),
    ...(safeVariant ? { variant: safeVariant } : {}),
    ...(safeHarnessVersion ? { harness_version: safeHarnessVersion } : {}),
    ...(safePluginVersion ? { plugin_version: safePluginVersion } : {}),
    ...(safeFailureCode ? { failure_code: safeFailureCode } : {}),
    ...(attribution ? { action: attribution[0], outcome: attribution[1] } : {}),
  });
}

export function classifyDeepSeekApplyFailure(error) {
  const message = error instanceof Error ? error.message : '';
  if (/not connected/i.test(message)) return 'service_unavailable';
  if (/disposer|overrideTokens/i.test(message)) return 'runtime_contract_rejected';
  if (/palette|hex color|light and dark|tokens/i.test(message)) return 'invalid_palette';
  return 'unknown';
}

export function trackDeepSeekEvent(name, metadata) {
  if (!ALLOWED_EVENTS.has(name)) throw new TypeError(`Unsupported DeepSeek analytics event: ${name}`);
  return trackEvent(name, null, buildDeepSeekAnalyticsMetadata(metadata, name));
}
