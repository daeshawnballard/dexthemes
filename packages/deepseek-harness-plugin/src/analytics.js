import { StatsigClient } from '@statsig/js-client';

export const DEXTHEMES_CONFIG_URL = 'https://www.dexthemes.com/api/config';

const ALLOWED_EVENTS = new Set([
  'deepseek_theme_previewed',
  'deepseek_theme_apply_started',
  'deepseek_theme_apply_succeeded',
  'deepseek_theme_apply_failed',
  'deepseek_theme_reverted',
]);
const ALLOWED_FIELDS = new Set([
  'platform', 'mechanism', 'source_surface', 'theme_id', 'variant',
  'plugin_version', 'failure_code',
]);
const SAFE_VALUE = /^[a-zA-Z0-9._:/-]{1,120}$/;

export function sanitizePluginAnalyticsEvent(event) {
  if (!event || !ALLOWED_EVENTS.has(event.name)) return null;
  const metadata = {};
  for (const [key, value] of Object.entries(event)) {
    if (key === 'name' || !ALLOWED_FIELDS.has(key)) continue;
    const normalized = String(value || '').trim();
    if (SAFE_VALUE.test(normalized)) metadata[key] = normalized;
  }
  return Object.freeze({ name: event.name, metadata: Object.freeze(metadata) });
}

/** Privacy-bounded, account-free analytics for the installed settings surface. */
export function createPluginAnalytics({
  fetchImpl = globalThis.fetch,
  StatsigClientImpl = StatsigClient,
} = {}) {
  let client = null;
  let initialization = null;

  const start = () => {
    if (initialization) return initialization;
    initialization = (async () => {
      if (typeof fetchImpl !== 'function') return null;
      const response = await fetchImpl(DEXTHEMES_CONFIG_URL, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return null;
      const { statsigClientKey } = await response.json();
      if (!statsigClientKey) return null;
      client = new StatsigClientImpl(statsigClientKey, {
        userID: 'dexthemes-deepseek-harness',
        custom: { platform: 'deepseek_harness' },
      }, {
        disableStorage: true,
        includeCurrentPageUrlWithEvents: false,
      });
      await client.initializeAsync();
      return client;
    })().catch(() => null);
    return initialization;
  };

  return Object.freeze({
    start,
    track(event) {
      const safe = sanitizePluginAnalyticsEvent(event);
      if (!safe) return;
      void start().then((ready) => {
        try {
          ready?.logEvent(safe.name, null, safe.metadata);
        } catch {
          // Analytics must never affect theme application.
        }
      }).catch(() => {});
    },
    async destroy() {
      const ready = await start();
      await ready?.shutdown?.();
      client = null;
    },
  });
}
