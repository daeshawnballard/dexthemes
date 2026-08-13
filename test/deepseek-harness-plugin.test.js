import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  BUNDLED_HARNESS_THEMES,
  DEXTHEMES_PUBLIC_CATALOG_URL,
  loadPublicHarnessThemes,
  mergeHarnessThemes,
  mergeUnlockedHarnessThemes,
  normalizeHarnessTheme,
  searchHarnessThemes,
  tokensForHarnessTheme,
} from '../packages/deepseek-harness-plugin/src/catalog.js';
import {
  createHarnessThemeController,
  INSTALLED_THEME_SOURCE,
  PLUGIN_VERSION,
} from '../packages/deepseek-harness-plugin/src/theme-controller.js';
import { DEEPSEEK_HARNESS_THEMES } from '../packages/deepseek-harness-plugin/src/deepseek-themes.js';
import { getColorContrastRatio } from '../shared/deepseek-theme-contract.js';
import {
  createPluginAnalytics,
  sanitizePluginAnalyticsEvent,
} from '../packages/deepseek-harness-plugin/src/analytics.js';
import {
  createHarnessAccountClient,
  pollDeviceAuthorization,
  requestDeviceAuthorization,
} from '../packages/deepseek-harness-plugin/src/account.js';

const PACKAGE_ROOT = new URL('../packages/deepseek-harness-plugin/', import.meta.url);

test('installed Harness package declares a real bundle, client export, and supported MCP Loader row', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', PACKAGE_ROOT), 'utf8'));
  const patch = await readFile(new URL('cordis.patch.yml', PACKAGE_ROOT), 'utf8');

  assert.equal(manifest.name, '@dexthemes/deepseek-harness-plugin');
  assert.equal(manifest.version, PLUGIN_VERSION);
  assert.equal(manifest.exports['./client'], './lib/client.js');
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml');
  assert.deepEqual(manifest.dsh.client.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-settings',
    '@deepseek-ai/dsh-client-ui-theme',
  ]);
  assert.match(patch, /id: dexthemes/);
  assert.match(patch, /name: '@dexthemes\/deepseek-harness-plugin'/);
  assert.match(patch, /name: '@deepseek-ai\/dsh-mcp-client'/);
  assert.match(patch, /DEXTHEMES_MCP_URL/);
  assert.match(patch, /https:\/\/www\.dexthemes\.com\/api\/deepseek-mcp/);
  assert.match(patch, /serverName: dexthemes/);
  assert.match(patch, /failOnStartupError: false/);
  assert.doesNotMatch(patch, /Authorization|apiKey|token:/i);
  assert.equal(manifest.dependencies['@statsig/js-client'], '^3.32.2');
});

test('bundled plugin catalog replaces Codex origins with a default and twelve paired DeepSeek tributes', () => {
  assert.ok(BUNDLED_HARNESS_THEMES.length > 90);
  assert.equal(DEEPSEEK_HARNESS_THEMES.length, 13);
  assert.equal(BUNDLED_HARNESS_THEMES.filter((theme) => theme.category === 'deepseek').length, 13);
  assert.equal(BUNDLED_HARNESS_THEMES.some((theme) => theme.category === 'codex'), false);
  assert.deepEqual(
    BUNDLED_HARNESS_THEMES.filter((theme) => theme.category === 'deepseek').map((theme) => theme.name),
    ['DeepSeek', 'Huawei', 'Tencent', 'Alibaba', 'Ant Group', 'ByteDance', 'Baidu', 'SiliconFlow', 'JD.com', 'China Telecom', 'China Mobile', 'HONOR', 'Lenovo'],
  );
  assert.ok(BUNDLED_HARNESS_THEMES.every((theme) => theme.dark && theme.light));
  assert.equal(BUNDLED_HARNESS_THEMES.some((theme) => theme.subgroup === 'unlockables'), false);
  assert.equal(BUNDLED_HARNESS_THEMES.find((theme) => theme.id === 'deepseek-default')?.unofficial, false);
  assert.ok(BUNDLED_HARNESS_THEMES
    .filter((theme) => theme.category === 'deepseek' && theme.unofficial)
    .every((theme) => theme.unofficial && theme.summary.startsWith('Unofficial') && theme.evidenceUrl.startsWith('https://')));
  assert.equal(normalizeHarnessTheme({ id: 'dark-only', name: 'Nope', dark: {} }), null);
  assert.equal(normalizeHarnessTheme({ ...DEEPSEEK_HARNESS_THEMES[0], category: 'codex' }), null);
  assert.equal(normalizeHarnessTheme({ ...DEEPSEEK_HARNESS_THEMES[0], subgroup: 'unlockables' }), null);
  assert.equal(normalizeHarnessTheme({ ...DEEPSEEK_HARNESS_THEMES[0], _hiddenUntilUnlocked: true }), null);
});

test('account rewards enter the catalog only through verified unlock records', () => {
  const reward = {
    ...DEEPSEEK_HARNESS_THEMES[0],
    id: 'deep-current',
    name: 'Deep Current',
    category: 'dexthemes',
    subgroup: 'unlockables',
  };
  assert.equal(mergeHarnessThemes(BUNDLED_HARNESS_THEMES, [reward]).some((theme) => theme.id === reward.id), false);
  const connected = mergeUnlockedHarnessThemes(BUNDLED_HARNESS_THEMES, [
    { action: 'use_deepseek_harness', themeId: reward.id, theme: reward },
  ]);
  assert.equal(connected.find((theme) => theme.id === reward.id)?.name, 'Deep Current');
  assert.equal(mergeUnlockedHarnessThemes(BUNDLED_HARNESS_THEMES, [{ themeId: reward.id }]).some((theme) => theme.id === reward.id), false);
});

test('public and community catalog merges without reintroducing Codex themes and search remains local', async () => {
  const sharedTheme = BUNDLED_HARNESS_THEMES.find((theme) => theme.category === 'dexthemes');
  const remoteShared = {
    ...sharedTheme,
    name: `${sharedTheme.name} refreshed`,
  };
  const community = {
    ...BUNDLED_HARNESS_THEMES[0],
    id: 'community-paired',
    name: 'Community Paired',
    category: 'community',
  };
  let requestedUrl = null;
  const loaded = await loadPublicHarnessThemes({
    fetchImpl: async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        json: async () => ({
          themes: [
            remoteShared,
            community,
            { ...DEEPSEEK_HARNESS_THEMES[0], category: 'codex' },
            { ...DEEPSEEK_HARNESS_THEMES[0], id: 'reward-leak', subgroup: 'unlockables' },
          ],
        }),
      };
    },
  });

  assert.equal(requestedUrl, DEXTHEMES_PUBLIC_CATALOG_URL);
  const merged = mergeHarnessThemes(BUNDLED_HARNESS_THEMES, loaded);
  assert.equal(merged.find((theme) => theme.id === sharedTheme.id).name, `${sharedTheme.name} refreshed`);
  assert.equal(merged.some((theme) => theme.category === 'codex'), false);
  assert.equal(merged.some((theme) => theme.subgroup === 'unlockables'), false);
  assert.deepEqual(searchHarnessThemes(merged, 'community paired', 'community').map((theme) => theme.id), ['community-paired']);
  assert.deepEqual(searchHarnessThemes(merged, 'Huawei', 'deepseek').map((theme) => theme.id), ['deepseek-huawei']);
  assert.deepEqual(searchHarnessThemes(merged, 'workspace secret', 'all'), []);
});

test('one-click controller replaces its owned layer and reversible removal calls the disposer', () => {
  const calls = [];
  const disposed = [];
  const events = [];
  const runtime = {
    overrideTokens(source, tokens) {
      calls.push({ source, tokens });
      const call = calls.length;
      return () => disposed.push(call);
    },
  };
  const controller = createHarnessThemeController(runtime, { onEvent: (event) => events.push(event) });
  const first = BUNDLED_HARNESS_THEMES[0];
  const second = BUNDLED_HARNESS_THEMES[1];

  assert.equal(controller.apply(first), true);
  assert.equal(controller.getSnapshot().activeThemeId, first.id);
  assert.equal(controller.apply(second), true);
  assert.equal(controller.getSnapshot().activeThemeId, second.id);
  assert.deepEqual(calls.map((call) => call.source), [INSTALLED_THEME_SOURCE, INSTALLED_THEME_SOURCE]);
  assert.equal(Object.keys(calls[0].tokens).length, 13);
  assert.deepEqual(disposed, [1]);

  controller.revert();
  assert.deepEqual(disposed, [1, 2]);
  assert.deepEqual(controller.getSnapshot(), { activeThemeId: null, status: 'idle', error: null });
  assert.deepEqual(events.map((event) => event.name), [
    'deepseek_theme_apply_started',
    'deepseek_theme_apply_succeeded',
    'deepseek_theme_apply_started',
    'deepseek_theme_apply_succeeded',
    'deepseek_theme_revert_started',
    'deepseek_theme_revert_succeeded',
    'deepseek_theme_reverted',
  ]);
  assert.ok(events.every((event) => !('prompt' in event) && !('workspace' in event) && !('credential' in event)));
});

test('replacement and revert failures remain bounded, observable, and retryable', () => {
  const events = [];
  let failFirstDisposer = true;
  const runtime = {
    overrideTokens() {
      const isFirst = events.filter((event) => event.name === 'deepseek_theme_apply_started').length === 1;
      return () => {
        if (isFirst && failFirstDisposer) throw new Error('raw disposer failure');
      };
    },
  };
  const controller = createHarnessThemeController(runtime, { onEvent: (event) => events.push(event) });
  const first = BUNDLED_HARNESS_THEMES[0];
  const second = BUNDLED_HARNESS_THEMES[1];

  assert.equal(controller.apply(first), true);
  assert.equal(controller.apply(second), false);
  assert.equal(controller.getSnapshot().activeThemeId, first.id);
  assert.equal(controller.getSnapshot().status, 'error');
  assert.doesNotMatch(controller.getSnapshot().error, /raw disposer failure/);

  assert.equal(controller.revert(), false);
  assert.equal(controller.getSnapshot().activeThemeId, first.id);
  assert.equal(controller.getSnapshot().error, 'Theme removal failed. Try Revert again.');
  assert.ok(events.some((event) => event.name === 'deepseek_theme_revert_failed'));

  failFirstDisposer = false;
  assert.equal(controller.revert(), true);
  assert.equal(controller.getSnapshot().activeThemeId, null);
  assert.ok(events.some((event) => event.name === 'deepseek_theme_revert_succeeded'));
});

test('successful one-click apply reports authenticated Harness use without coupling account failure to the theme', async () => {
  const applied = [];
  const runtime = { overrideTokens: () => () => {} };
  const controller = createHarnessThemeController(runtime, {
    onApplied: ({ themeId }) => {
      applied.push(themeId);
      throw new Error('account reporting is unavailable');
    },
  });
  assert.equal(controller.apply(BUNDLED_HARNESS_THEMES[0]), true);
  await Promise.resolve();
  assert.deepEqual(applied, [BUNDLED_HARNESS_THEMES[0].id]);

  const failed = createHarnessThemeController({ overrideTokens: () => { throw new Error('no'); } }, {
    onApplied: ({ themeId }) => applied.push(themeId),
  });
  assert.equal(failed.apply(BUNDLED_HARNESS_THEMES[1]), false);
  assert.deepEqual(applied, [BUNDLED_HARNESS_THEMES[0].id]);
});

test('device authorization uses bounded public codes and respects provider polling responses', async () => {
  const requests = [];
  const responses = [
    { ok: true, status: 200, json: async () => ({
      deviceCode: 'device-secret', userCode: 'ABCD-EFGH',
      verificationUri: 'https://github.com/login/device',
      verificationUriComplete: 'https://github.com/login/device?user_code=ABCD-EFGH',
      expiresIn: 900, interval: 5,
    }) },
    { ok: false, status: 202, json: async () => ({ error: 'authorization_pending' }) },
    { ok: false, status: 429, json: async () => ({ error: 'slow_down' }) },
    { ok: true, status: 200, json: async () => ({ accessToken: 'dxd_access-secret', tokenType: 'Bearer' }) },
  ];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return responses.shift();
  };
  const device = await requestDeviceAuthorization({ fetchImpl, apiBaseUrl: 'https://api.example' });
  assert.equal(device.userCode, 'ABCD-EFGH');
  assert.equal(device.verificationUrl, 'https://github.com/login/device?user_code=ABCD-EFGH');
  const session = await pollDeviceAuthorization(device, {
    fetchImpl,
    apiBaseUrl: 'https://api.example',
    waitImpl: async () => {},
  });
  assert.deepEqual(session, { accessToken: 'dxd_access-secret', expiresIn: 3600 });
  assert.equal(requests.filter((request) => request.url.endsWith('/auth/poll')).length, 3);
  assert.ok(requests.slice(1).every((request) => JSON.parse(request.options.body).deviceCode === 'device-secret'));
});

test('installed account client keeps bearer credentials in memory and awards Harnessed only after apply', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.endsWith('/auth/start')) return { ok: true, status: 200, json: async () => ({
      deviceCode: 'device-code', userCode: 'JOIN-NOW',
      verificationUri: 'https://github.com/login/device',
      verificationUriComplete: 'https://github.com/login/device?user_code=JOIN-NOW',
      expiresIn: 900, interval: 5,
    }) };
    if (url.endsWith('/auth/poll')) return { ok: true, status: 200, json: async () => ({ accessToken: 'dxd_memory-only-token', tokenType: 'Bearer' }) };
    if (url.endsWith('/deepseek-harness/session')) return { ok: true, status: 200, json: async () => ({ revoked: true }) };
    if (url.endsWith('/plugin/me/stats')) return { ok: true, status: 200, json: async () => ({ themes: [], totalCopies: 0 }) };
    if (url.endsWith('/plugin/me/unlocks')) return { ok: true, status: 200, json: async () => ({ unlocks: [{ action: 'use_deepseek_harness', themeId: 'deep-current', theme: null }] }) };
    if (url.endsWith('/plugin/deepseek-harness/use')) return { ok: true, status: 200, json: async () => ({ achievement: { action: 'use_deepseek_harness', themeId: 'deep-current' } }) };
    throw new Error(`Unexpected request: ${url}`);
  };
  const account = createHarnessAccountClient({
    fetchImpl,
    apiBaseUrl: 'https://api.example',
    waitImpl: async () => {},
  });
  const handoff = await account.connect();
  assert.deepEqual(handoff, { userCode: 'JOIN-NOW', verificationUrl: 'https://github.com/login/device?user_code=JOIN-NOW' });
  for (let attempt = 0; attempt < 10 && account.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(account.getSnapshot().status, 'connected');
  assert.equal(JSON.stringify(account.getSnapshot()).includes('dxd_memory-only-token'), false);
  const achievement = await account.recordHarnessUse();
  assert.equal(achievement.themeId, 'deep-current');
  const protectedRequests = requests.filter((request) => /plugin\/(me|deepseek-harness\/use)/.test(request.url));
  assert.ok(protectedRequests.every((request) => request.options.headers.Authorization === 'Bearer dxd_memory-only-token'));
  assert.equal(requests.some((request) => String(request.options.body || '').includes('dxd_memory-only-token')), false);
  await account.disconnect();
  assert.equal(account.getSnapshot().status, 'idle');
  const revoke = requests.find((request) => request.url.endsWith('/deepseek-harness/session'));
  assert.equal(revoke.options.method, 'DELETE');
  assert.equal(revoke.options.headers.Authorization, 'Bearer dxd_memory-only-token');
});

test('a superseded device connection cannot overwrite the current in-memory account', async () => {
  const polls = new Map();
  const protectedTokens = [];
  let startCount = 0;
  const fetchImpl = async (url, options = {}) => {
    if (url.endsWith('/auth/start')) {
      startCount += 1;
      return { ok: true, status: 200, json: async () => ({
        deviceCode: `device-${startCount}`,
        userCode: `JOIN-${startCount}`,
        verificationUri: 'https://github.com/login/device',
        verificationUriComplete: `https://github.com/login/device?user_code=JOIN-${startCount}`,
        expiresIn: 900,
        interval: 5,
      }) };
    }
    if (url.endsWith('/auth/poll')) {
      const code = JSON.parse(options.body).deviceCode;
      return new Promise((resolve) => polls.set(code, resolve));
    }
    if (url.endsWith('/plugin/me/stats')) {
      protectedTokens.push(options.headers.Authorization);
      return { ok: true, status: 200, json: async () => ({ themes: [] }) };
    }
    if (url.endsWith('/plugin/me/unlocks')) {
      protectedTokens.push(options.headers.Authorization);
      return { ok: true, status: 200, json: async () => ({ unlocks: [] }) };
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  const account = createHarnessAccountClient({ fetchImpl, apiBaseUrl: 'https://api.example', waitImpl: async () => {} });
  await account.connect();
  await account.connect();
  for (let attempt = 0; attempt < 10 && polls.size < 2; attempt += 1) await new Promise((resolve) => setImmediate(resolve));
  polls.get('device-2')({ ok: true, status: 200, json: async () => ({
    accessToken: 'dxd_current-token', tokenType: 'Bearer', expiresIn: 3600,
  }) });
  for (let attempt = 0; attempt < 10 && account.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  polls.get('device-1')({ ok: true, status: 200, json: async () => ({
    accessToken: 'dxd_stale-token', tokenType: 'Bearer', expiresIn: 3600,
  }) });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(account.getSnapshot().status, 'connected');
  assert.deepEqual(protectedTokens, ['Bearer dxd_current-token', 'Bearer dxd_current-token']);
  account.destroy();
});

test('a protected-route 401 clears the in-memory account and requires reconnection', async () => {
  let rejectUse = false;
  const fetchImpl = async (url) => {
    if (url.endsWith('/auth/start')) return { ok: true, status: 200, json: async () => ({
      deviceCode: 'device-code', userCode: 'JOIN-NOW',
      verificationUri: 'https://github.com/login/device',
      expiresIn: 900, interval: 5,
    }) };
    if (url.endsWith('/auth/poll')) return { ok: true, status: 200, json: async () => ({
      accessToken: 'dxd_expiring-token', tokenType: 'Bearer', expiresIn: 3600,
    }) };
    if (url.endsWith('/plugin/me/stats')) return { ok: true, status: 200, json: async () => ({ themes: [] }) };
    if (url.endsWith('/plugin/me/unlocks')) return { ok: true, status: 200, json: async () => ({ unlocks: [] }) };
    if (url.endsWith('/plugin/deepseek-harness/use') && rejectUse) {
      return { ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) };
    }
    if (url.endsWith('/plugin/deepseek-harness/use')) {
      return { ok: true, status: 200, json: async () => ({ achievement: null }) };
    }
    if (url.endsWith('/deepseek-harness/session')) return { ok: true, status: 200, json: async () => ({ revoked: true }) };
    throw new Error(`Unexpected request: ${url}`);
  };
  const account = createHarnessAccountClient({ fetchImpl, apiBaseUrl: 'https://api.example', waitImpl: async () => {} });
  await account.connect();
  for (let attempt = 0; attempt < 10 && account.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  rejectUse = true;
  await assert.rejects(account.recordHarnessUse(), /Unauthorized/);
  assert.equal(account.getSnapshot().status, 'error');
  assert.match(account.getSnapshot().error, /Connect again/);
  assert.equal(await account.recordHarnessUse(), null);
  account.destroy();
});

test('installed account client accepts only GitHub verification and DexThemes session tokens', async () => {
  await assert.rejects(
    requestDeviceAuthorization({
      apiBaseUrl: 'https://api.example',
      fetchImpl: async () => ({ ok: true, json: async () => ({
        deviceCode: 'device-code',
        userCode: 'JOIN-NOW',
        verificationUri: 'https://lookalike.example/login/device',
        expiresIn: 900,
        interval: 5,
      }) }),
    }),
    /invalid response/,
  );
  await assert.rejects(
    pollDeviceAuthorization({ deviceCode: 'device-code', expiresIn: 900, interval: 5 }, {
      apiBaseUrl: 'https://api.example',
      waitImpl: async () => {},
      fetchImpl: async () => ({ ok: true, json: async () => ({
        accessToken: 'gho_must-never-reach-harness',
        tokenType: 'Bearer',
      }) }),
    }),
    /invalid token response/,
  );
});

test('built client is a Harness module factory and exposes the DexThemes settings tab', async () => {
  const built = await readFile(new URL('lib/client.js', PACKAGE_ROOT), 'utf8');
  const source = await readFile(new URL('src/client.jsx', PACKAGE_ROOT), 'utf8');
  assert.match(built, /__ModuleLoader__\.load\(\{ id: "@dexthemes\/deepseek-harness-plugin"/);
  assert.match(built, /settings\.plugins\.tab/);
  assert.match(built, /DexThemes/);
  assert.match(built, /Find your vibe\. Stay in flow\./);
  assert.match(built, /No partnerships or endorsements are implied/);
  assert.match(built, /Side by side/);
  assert.match(built, /Preview mode/);
  assert.match(built, /Create with chat/);
  assert.match(built, /Color me lucky/);
  assert.match(built, /Choose Creator mode to apply and revert from chat/);
  assert.match(built, /Connect DexThemes/);
  assert.match(built, /Continue with GitHub/);
  assert.doesNotMatch(source, /clipboard|localStorage|querySelector\([^)]*Harness/i);
});

test('installed plugin analytics sends only allowlisted metadata and owns Statsig lifecycle', async () => {
  const calls = [];
  class FakeStatsigClient {
    constructor(key, user, options) { calls.push({ type: 'construct', key, user, options }); }
    async initializeAsync() { calls.push({ type: 'initialize' }); }
    logEvent(name, value, metadata) { calls.push({ type: 'event', name, value, metadata }); }
    async shutdown() { calls.push({ type: 'shutdown' }); }
  }
  const analytics = createPluginAnalytics({
    fetchImpl: async () => ({ ok: true, json: async () => ({ statsigClientKey: 'client-test' }) }),
    StatsigClientImpl: FakeStatsigClient,
  });
  analytics.track({
    name: 'deepseek_theme_apply_succeeded',
    platform: 'deepseek_harness',
    mechanism: 'cordis_theme_override',
    source_surface: 'settings_plugins_dexthemes',
    theme_id: 'deepseek-huawei',
    variant: 'paired',
    plugin_version: PLUGIN_VERSION,
    prompt: 'never send this',
    workspace: '/private/project',
    credential: 'secret',
  });
  await analytics.destroy();

  const constructed = calls.find((call) => call.type === 'construct');
  assert.equal(constructed.user.userID, 'dexthemes-deepseek-harness');
  assert.equal(constructed.options.disableStorage, true);
  assert.equal(constructed.options.includeCurrentPageUrlWithEvents, false);
  const event = calls.find((call) => call.type === 'event');
  assert.deepEqual(event.metadata, {
    platform: 'deepseek_harness',
    mechanism: 'cordis_theme_override',
    source_surface: 'settings_plugins_dexthemes',
    theme_id: 'deepseek-huawei',
    variant: 'paired',
    plugin_version: PLUGIN_VERSION,
  });
  assert.ok(calls.some((call) => call.type === 'shutdown'));
  assert.equal(sanitizePluginAnalyticsEvent({ name: 'deepseek_plugin_install_succeeded' }), null);
  assert.equal(sanitizePluginAnalyticsEvent({ name: 'deepseek_theme_revert_failed', failure_code: 'runtime_contract_rejected' }).name, 'deepseek_theme_revert_failed');
  assert.equal(sanitizePluginAnalyticsEvent({ name: 'deepseek_theme_previewed', theme_id: 'unsafe id' }).metadata.theme_id, undefined);
});

test('theme cards visually separate paired swatches from their descriptor surface', async () => {
  const source = await readFile(new URL('src/client.jsx', PACKAGE_ROOT), 'utf8');

  assert.match(source, /swatches: \{[^\n]*border: '1px solid var\(--dsw-alias-border-l1\)'/);
  assert.match(source, /cardContent: \{[^\n]*background: 'var\(--dsw-alias-bg-layer-2\)'/);
  assert.match(source, /modeBadge/);
  assert.match(source, /aria-label="Preview mode"/);
});

test('DeepSeek collection palettes preserve readable source ink and semantic actions', () => {
  for (const theme of DEEPSEEK_HARNESS_THEMES) {
    for (const mode of ['light', 'dark']) {
      assert.ok(
        getColorContrastRatio(theme[mode].ink, theme[mode].surface) >= 4.5,
        `${theme.id} ${mode} source palette contrast`,
      );
    }
  }
});

test('primary actions use a semantic inverse pair that stays legible across bundled themes', async () => {
  const source = await readFile(new URL('src/client.jsx', PACKAGE_ROOT), 'utf8');
  assert.match(
    source,
    /primary: \{ background: 'var\(--dsw-alias-label-primary\)'.*color: 'var\(--dsw-alias-bg-base\)' \}/,
  );
  assert.doesNotMatch(source, /primary: \{[^\n]*color: '#FFFFFF'/);

  for (const theme of BUNDLED_HARNESS_THEMES) {
    const tokens = tokensForHarnessTheme(theme);
    for (const mode of ['light', 'dark']) {
      assert.ok(
        getColorContrastRatio(
          tokens['--dsw-alias-label-primary'][mode],
          tokens['--dsw-alias-bg-base'][mode],
        ) >= 4.5,
        `${theme.id} ${mode} primary action contrast`,
      );
    }
  }
});
