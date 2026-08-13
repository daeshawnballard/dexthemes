import { trackEvent } from './analytics-client.js';

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
} = {}) {
  const safeSourceSurface = safeField(sourceSurface);
  const safeThemeId = safeField(themeId);
  const safeVariant = safeField(variant);
  const safeHarnessVersion = safeField(harnessVersion);
  const safePluginVersion = safeField(pluginVersion);
  const safeFailureCode = safeField(failureCode);
  return Object.freeze({
    platform: 'deepseek_harness',
    mechanism: 'cordis_theme_override',
    ...(safeSourceSurface ? { source_surface: safeSourceSurface } : {}),
    ...(safeThemeId ? { theme_id: safeThemeId } : {}),
    ...(safeVariant ? { variant: safeVariant } : {}),
    ...(safeHarnessVersion ? { harness_version: safeHarnessVersion } : {}),
    ...(safePluginVersion ? { plugin_version: safePluginVersion } : {}),
    ...(safeFailureCode ? { failure_code: safeFailureCode } : {}),
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
  return trackEvent(name, null, buildDeepSeekAnalyticsMetadata(metadata));
}
