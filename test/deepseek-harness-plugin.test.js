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
  THEME_CAPABILITY_ERROR,
} from '../packages/deepseek-harness-plugin/src/theme-controller.js';
import {
  THEME_STATE_PERSIST_KEY,
  createMemoryThemeState,
  createThemeStateHandle,
  createThemeStateStore,
  normalizeThemeState,
} from '../packages/deepseek-harness-plugin/src/theme-state.js';
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
import { applyHarnessThemeWithConnectedActivity } from '../packages/deepseek-harness-plugin/src/apply-coordinator.js';
import {
  copyDeviceUserCode,
  normalizeDeviceUserCode,
} from '../packages/deepseek-harness-plugin/src/device-code-handoff.js';

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
    ['DeepSeek', 'Huawei', 'Tencent', 'Alibaba', 'Ant Group', 'ByteDance', 'Baidu', 'SiliconFlow', 'JD Cloud', 'China Telecom', 'China Mobile', 'HONOR', 'Lenovo'],
  );
  assert.ok(BUNDLED_HARNESS_THEMES.every((theme) => theme.dark && theme.light));
  assert.equal(BUNDLED_HARNESS_THEMES.some((theme) => theme.subgroup === 'unlockables'), false);
  assert.equal(BUNDLED_HARNESS_THEMES.find((theme) => theme.id === 'deepseek-default')?.unofficial, false);
  assert.ok(BUNDLED_HARNESS_THEMES
    .filter((theme) => theme.category === 'deepseek' && theme.unofficial)
    .every((theme) => theme.unofficial && theme.summary.startsWith('Unofficial') && theme.evidenceUrl.startsWith('https://')));
  assert.ok(DEEPSEEK_HARNESS_THEMES.every((theme) => theme.summary.length <= 70));
  assert.equal(DEEPSEEK_HARNESS_THEMES.find((theme) => theme.id === 'deepseek-jd-cloud')?.name, 'JD Cloud');
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
  assert.deepEqual(controller.getSnapshot(), {
    desiredThemeId: null,
    activeThemeId: null,
    capability: 'available',
    status: 'idle',
    notice: null,
    error: null,
  });
  assert.deepEqual(events.map((event) => event.name), [
    'deepseek_theme_capability_available',
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

test('theme selection survives teardown and restores only after the supported capability is attached', () => {
  const preferences = createMemoryThemeState();
  const firstDisposed = [];
  const theme = BUNDLED_HARNESS_THEMES[0];
  const first = createHarnessThemeController({
    overrideTokens: () => () => firstDisposed.push('disposed'),
  }, { preferences });
  first.setCatalog(BUNDLED_HARNESS_THEMES);
  assert.equal(first.apply(theme), true);
  assert.equal(preferences.getSnapshot().desiredThemeId, theme.id);
  first.destroy();
  assert.deepEqual(firstDisposed, ['disposed']);

  const restored = [];
  const events = [];
  const second = createHarnessThemeController(null, {
    preferences,
    onEvent: (event) => events.push(event),
  });
  second.setCatalog(BUNDLED_HARNESS_THEMES);
  assert.equal(second.getSnapshot().status, 'pending_restore');
  const detach = second.attach({
    overrideTokens(source, tokens) {
      restored.push({ source, tokens });
      return () => restored.push({ disposed: true });
    },
  });
  assert.equal(second.getSnapshot().activeThemeId, theme.id);
  assert.equal(second.getSnapshot().status, 'active');
  assert.equal(restored.length, 1);
  assert.ok(events.some((event) => event.name === 'deepseek_theme_restore_succeeded'));
  assert.ok(events.some((event) => event.source_surface === 'startup_restore'));

  detach();
  assert.equal(second.getSnapshot().capability, 'unavailable');
  assert.equal(second.getSnapshot().desiredThemeId, theme.id);
  assert.equal(second.revert(), true);
  assert.equal(preferences.getSnapshot().desiredThemeId, null);
});

test('missing or malformed theme capability is visible, nonfatal, and reversible', () => {
  const theme = BUNDLED_HARNESS_THEMES[0];
  const preferences = createMemoryThemeState({ desiredThemeId: theme.id });
  const events = [];
  const controller = createHarnessThemeController(null, {
    preferences,
    onEvent: (event) => events.push(event),
  });
  controller.setCatalog(BUNDLED_HARNESS_THEMES);
  assert.equal(controller.getSnapshot().capability, 'unavailable');
  assert.equal(controller.getSnapshot().error, THEME_CAPABILITY_ERROR);
  assert.equal(controller.apply(theme), false);
  assert.equal(controller.apply({ ...theme, id: 'unsafe id' }), false);
  controller.attach({ overrideTokens: 'not-a-function' });
  assert.ok(events.some((event) => event.name === 'deepseek_theme_capability_unavailable'));
  assert.ok(events.some((event) => event.name === 'deepseek_theme_apply_failed'
    && event.failure_code === 'capability_unavailable'));
  assert.ok(events.some((event) => event.name === 'deepseek_theme_apply_failed'
    && event.failure_code === 'invalid_theme'));
  assert.equal(controller.revert(), true);
  assert.equal(controller.getSnapshot().desiredThemeId, null);
});

test('account-only saved themes wait for explicit reconnect catalog recovery', () => {
  const reward = {
    ...BUNDLED_HARNESS_THEMES[0],
    id: 'deep-current',
    subgroup: 'unlockables',
  };
  const preferences = createMemoryThemeState({
    desiredThemeId: reward.id,
    accountProtected: true,
    reconnectRequired: true,
  });
  const calls = [];
  const controller = createHarnessThemeController({
    overrideTokens: () => {
      calls.push('applied');
      return () => {};
    },
  }, { preferences });
  controller.setCatalog(BUNDLED_HARNESS_THEMES);
  assert.equal(controller.getSnapshot().status, 'pending_restore');
  assert.match(controller.getSnapshot().notice, /Reconnect DexThemes/);
  assert.deepEqual(calls, []);
  controller.setCatalog([...BUNDLED_HARNESS_THEMES, reward]);
  assert.deepEqual(calls, ['applied']);
  assert.equal(controller.getSnapshot().activeThemeId, reward.id);
});

test('persisted theme state is versioned, bounded, and excludes secrets and account identity', () => {
  const declaration = createThemeStateHandle((value) => value);
  assert.equal(declaration.persist, THEME_STATE_PERSIST_KEY);
  const normalized = normalizeThemeState({
    desiredThemeId: 'DeepSeek-Huawei',
    accountProtected: true,
    reconnectRequired: true,
    token: 'dxd_secret',
    workspace: '/private/project',
    accountId: '1234',
    palette: { ink: '#fff' },
  });
  assert.deepEqual(normalized, {
    version: 1,
    desiredThemeId: 'deepseek-huawei',
    accountProtected: true,
    reconnectRequired: true,
  });
  assert.equal(JSON.stringify(normalized).includes('secret'), false);
  assert.equal(normalizeThemeState({ desiredThemeId: 'unsafe id' }).desiredThemeId, null);
});

test('malformed persisted root state is discarded before controller actions can use it', () => {
  let persisted = 'corrupt-root';
  let cleared = 0;
  const fakeDefineStore = (declaration) => ({
    create() {
      let state = persisted ?? declaration.init();
      const actions = Object.fromEntries(Object.entries(declaration.actions).map(([name, mutate]) => [
        name,
        (...args) => {
          if (!state || typeof state !== 'object' || Array.isArray(state)) throw new TypeError('invalid root');
          const draft = { ...state };
          mutate(draft, ...args);
          state = draft;
          persisted = draft;
        },
      ]));
      return {
        getSnapshot: () => state,
        actions,
        clearPersisted() {
          cleared += 1;
          persisted = null;
        },
      };
    },
  });
  const store = createThemeStateStore(fakeDefineStore);
  assert.equal(cleared, 1);
  assert.deepEqual(store.getSnapshot(), {
    version: 1,
    desiredThemeId: null,
    accountProtected: false,
    reconnectRequired: false,
  });
  store.actions.rememberTheme('deepseek-huawei', false);
  assert.equal(store.getSnapshot().desiredThemeId, 'deepseek-huawei');
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

test('explicit Apply coordinator keeps anonymous and failed-runtime theme behavior account-free', async () => {
  const anonymousRequests = [];
  const runtime = { overrideTokens: () => () => {} };
  const controller = createHarnessThemeController(runtime);
  const anonymousAccount = createHarnessAccountClient({
    fetchImpl: async (...args) => {
      anonymousRequests.push(args);
      throw new Error('Anonymous Apply must not request account activity');
    },
    apiBaseUrl: 'https://api.example',
  });
  assert.equal(applyHarnessThemeWithConnectedActivity(
    controller,
    anonymousAccount,
    BUNDLED_HARNESS_THEMES[0],
    { sourceSurface: 'settings_plugin_card' },
  ), true);
  await Promise.resolve();
  assert.deepEqual(anonymousRequests, []);

  const accountCalls = [];
  const reportingAccount = { recordHarnessUse: () => { accountCalls.push('called'); } };
  const failed = createHarnessThemeController({ overrideTokens: () => { throw new Error('no'); } });
  assert.equal(applyHarnessThemeWithConnectedActivity(
    failed,
    reportingAccount,
    BUNDLED_HARNESS_THEMES[1],
  ), false);
  assert.deepEqual(accountCalls, []);
});

test('device authorization uses bounded public codes and respects provider polling responses', async () => {
  const requests = [];
  const jsonResponse = (payload, status = 200) => Response.json(payload, { status });
  const responses = [
    jsonResponse({
      deviceCode: 'device-secret', userCode: 'ABCD-EFGH',
      verificationUri: 'https://github.com/login/device',
      verificationUriComplete: 'https://github.com/login/device?user_code=ABCD-EFGH',
      expiresIn: 900, interval: 5,
    }),
    jsonResponse({ error: 'authorization_pending' }, 202),
    jsonResponse({ error: 'slow_down' }, 429),
    jsonResponse({ accessToken: 'dxd_access-secret', tokenType: 'Bearer' }),
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
    pluginVersion: PLUGIN_VERSION,
  });
  assert.deepEqual(session, { accessToken: 'dxd_access-secret', expiresIn: 3600 });
  assert.equal(requests.filter((request) => request.url.endsWith('/auth/poll')).length, 3);
  assert.ok(requests.slice(1).every((request) => {
    const body = JSON.parse(request.options.body);
    return body.deviceCode === 'device-secret' && body.pluginVersion === PLUGIN_VERSION;
  }));
});

test('device code handoff copies the complete bounded code without unsafe fallbacks', async () => {
  const copied = [];
  const clipboard = { writeText: async (value) => { copied.push(value); } };

  assert.equal(normalizeDeviceUserCode(' 7AE9-0FF4 '), '7AE9-0FF4');
  assert.equal(normalizeDeviceUserCode('missing space'), '');
  assert.deepEqual(await copyDeviceUserCode(' 7AE9-0FF4 ', clipboard), { copied: true, reason: null });
  assert.deepEqual(copied, ['7AE9-0FF4']);
  assert.deepEqual(await copyDeviceUserCode('', clipboard), { copied: false, reason: 'invalid_code' });
  assert.deepEqual(await copyDeviceUserCode('7AE9-0FF4', null), { copied: false, reason: 'clipboard_unavailable' });
  assert.deepEqual(
    await copyDeviceUserCode('7AE9-0FF4', { writeText: async () => { throw new Error('denied'); } }),
    { copied: false, reason: 'copy_failed' },
  );
});

test('install docs identify the 0.6.4 registry candidate and local-development path', async () => {
  const [packageReadme, integrationDocs] = await Promise.all([
    readFile(new URL('README.md', PACKAGE_ROOT), 'utf8'),
    readFile(new URL('../../docs/DEEPSEEK-HARNESS.md', PACKAGE_ROOT), 'utf8'),
  ]);

  for (const source of [packageReadme, integrationDocs]) {
    assert.match(source, /plugin --profile web add @dexthemes\/deepseek-harness-plugin@0\.6\.4/);
    assert.doesNotMatch(source, /0\.6\.4[^\n]*(?:not published|unreleased)/i);
    assert.doesNotMatch(source, /@dexthemes\/deepseek-harness-plugin@0\.4\.1/);
    assert.match(source, /local development/i);
  }
});

test('package discovery metadata distinguishes local 0.6.5 preparation from published 0.6.4 evidence', async () => {
  const [manifestSource, packageReadme, changelog, rootReadme, support, issueTemplate] = await Promise.all([
    readFile(new URL('package.json', PACKAGE_ROOT), 'utf8'),
    readFile(new URL('README.md', PACKAGE_ROOT), 'utf8'),
    readFile(new URL('CHANGELOG.md', PACKAGE_ROOT), 'utf8'),
    readFile(new URL('../../README.md', PACKAGE_ROOT), 'utf8'),
    readFile(new URL('../../support.html', PACKAGE_ROOT), 'utf8'),
    readFile(new URL('../../.github/ISSUE_TEMPLATE/bug_report.md', PACKAGE_ROOT), 'utf8'),
  ]);
  const manifest = JSON.parse(manifestSource);
  assert.equal(manifest.version, '0.6.5');
  assert.equal(manifest.scripts['verify:release'], 'node scripts/verify-release.mjs');
  assert.equal(['prepublish', 'prepare', 'prepublishOnly', 'prepack', 'postpack', 'postpublish'].some((name) => name in manifest.scripts), false);
  assert.ok(manifest.files.includes('CHANGELOG.md'));
  assert.ok(manifest.keywords.includes('deepseek-harness-plugin'));
  assert.match(manifest.homepage, /deepseek-harness-plugin#readme/);
  for (const token of [
    '0.1.0-rc.5',
    'No broader Harness semver range is claimed',
    'plugin --profile web why',
    'plugin --profile web remove',
    'Restart recovery',
    'GitHub releases',
    'support or bug issue',
  ]) assert.match(packageReadme, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  assert.match(packageReadme, /0\.6\.5[\s\S]{0,80}unpublished/i);
  assert.match(changelog, /0\.6\.5 — 2026-08-20 \(local-only, unpublished\)/);
  assert.match(changelog, /0\.6\.3 — 2026-08-15/);
  assert.match(changelog, /0\.6\.2 — 2026-08-14/);
  assert.match(changelog, /0\.6\.1 — 2026-08-14/);
  assert.match(changelog, /0\.6\.0 — 2026-08-14/);
  assert.match(rootReadme, /DeepSeek Harness plugin/);
  assert.match(rootReadme, /support\.html/);
  for (const source of [support, issueTemplate]) {
    assert.match(source, /Harness.*version/i);
    assert.match(source, /plugin version/i);
    assert.match(source, /install source/i);
    assert.match(source, /credentials|tokens/i);
  }
});

test('installed one-click Apply sends the connected scoped activity receipt through the explicit coordinator', async () => {
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
    if (url.endsWith('/plugin/deepseek-harness/use')) return { ok: true, status: 200, json: async () => ({ recorded: true, evidence: 'client_reported' }) };
    throw new Error(`Unexpected request: ${url}`);
  };
  const account = createHarnessAccountClient({
    fetchImpl,
    apiBaseUrl: 'https://api.example',
    waitImpl: async () => {},
    pluginVersion: PLUGIN_VERSION,
  });
  const handoff = await account.connect();
  assert.deepEqual(handoff, { userCode: 'JOIN-NOW', verificationUrl: 'https://github.com/login/device?user_code=JOIN-NOW' });
  for (let attempt = 0; attempt < 10 && account.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(account.getSnapshot().status, 'connected');
  assert.equal(JSON.stringify(account.getSnapshot()).includes('dxd_memory-only-token'), false);
  const controller = createHarnessThemeController({ overrideTokens: () => () => {} });
  assert.equal(applyHarnessThemeWithConnectedActivity(
    controller,
    account,
    BUNDLED_HARNESS_THEMES[0],
    { sourceSurface: 'settings_plugin_card' },
  ), true);
  for (let attempt = 0; attempt < 10 && account.getSnapshot().activityStatus !== 'recorded'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(account.getSnapshot().activityStatus, 'recorded');
  assert.equal(account.getSnapshot().activityError, null);
  const protectedRequests = requests.filter((request) => /plugin\/(me|deepseek-harness\/use)/.test(request.url));
  assert.ok(protectedRequests.every((request) => request.options.headers.Authorization === 'Bearer dxd_memory-only-token'));
  assert.equal(requests.some((request) => String(request.options.body || '').includes('dxd_memory-only-token')), false);
  const poll = requests.find((request) => request.url.endsWith('/auth/poll'));
  assert.deepEqual(JSON.parse(poll.options.body), {
    deviceCode: 'device-code',
    pluginVersion: PLUGIN_VERSION,
  });
  const recordedUse = requests.find((request) => request.url.endsWith('/plugin/deepseek-harness/use'));
  const recordedBody = JSON.parse(recordedUse.options.body);
  assert.equal(recordedBody.pluginVersion, PLUGIN_VERSION);
  assert.match(recordedBody.receiptId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  await account.disconnect();
  assert.equal(account.getSnapshot().status, 'idle');
  const revoke = requests.find((request) => request.url.endsWith('/deepseek-harness/session'));
  assert.equal(revoke.options.method, 'DELETE');
  assert.equal(revoke.options.headers.Authorization, 'Bearer dxd_memory-only-token');
});

test('failed connected activity remains visible and retries the same receipt without double counting', async () => {
  const useBodies = [];
  let useAttempts = 0;
  const receiptId = '0194f5e2-0b8e-4c53-9a20-87e7ac48a889';
  const fetchImpl = async (url, options = {}) => {
    if (url.endsWith('/auth/start')) return { ok: true, status: 200, json: async () => ({
      deviceCode: 'device-code', userCode: 'JOIN-NOW',
      verificationUri: 'https://github.com/login/device', expiresIn: 900, interval: 5,
    }) };
    if (url.endsWith('/auth/poll')) return { ok: true, status: 200, json: async () => ({
      accessToken: 'dxd_retry-token', tokenType: 'Bearer', expiresIn: 3600,
    }) };
    if (url.endsWith('/plugin/me/stats')) return { ok: true, status: 200, json: async () => ({ themes: [] }) };
    if (url.endsWith('/plugin/me/unlocks')) return { ok: true, status: 200, json: async () => ({ unlocks: [] }) };
    if (url.endsWith('/plugin/deepseek-harness/use')) {
      useAttempts += 1;
      useBodies.push(JSON.parse(options.body));
      if (useAttempts === 1) throw new Error('response lost after dispatch');
      return { ok: true, status: 200, json: async () => ({ recorded: false, evidence: 'client_reported' }) };
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  const account = createHarnessAccountClient({
    fetchImpl,
    apiBaseUrl: 'https://api.example',
    waitImpl: async () => {},
    pluginVersion: PLUGIN_VERSION,
    createUseReceipt: () => receiptId,
  });
  await account.connect();
  for (let attempt = 0; attempt < 10 && account.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  const controller = createHarnessThemeController({ overrideTokens: () => () => {} });
  assert.equal(applyHarnessThemeWithConnectedActivity(
    controller,
    account,
    BUNDLED_HARNESS_THEMES[0],
  ), true);
  for (let attempt = 0; attempt < 10 && account.getSnapshot().activityStatus !== 'error'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(account.getSnapshot().activityStatus, 'error');
  assert.equal(account.getSnapshot().canRetryActivity, true);
  assert.match(account.getSnapshot().activityError, /was not recorded/);

  assert.equal(await account.retryHarnessUse(), false);
  assert.equal(account.getSnapshot().activityStatus, 'recorded');
  assert.equal(account.getSnapshot().canRetryActivity, false);
  assert.deepEqual(useBodies, [
    { receiptId, pluginVersion: PLUGIN_VERSION },
    { receiptId, pluginVersion: PLUGIN_VERSION },
  ]);
});

test('Disconnect persists success only after acknowledged server revocation and remains retryable on failure', async () => {
  let revokeMode = '503';
  let disconnectedCallbacks = 0;
  const fetchImpl = async (url) => {
    if (url.endsWith('/auth/start')) return { ok: true, status: 200, json: async () => ({
      deviceCode: 'device-code', userCode: 'JOIN-NOW',
      verificationUri: 'https://github.com/login/device', expiresIn: 900, interval: 5,
    }) };
    if (url.endsWith('/auth/poll')) return { ok: true, status: 200, json: async () => ({
      accessToken: 'dxd_retryable-token', tokenType: 'Bearer', expiresIn: 3600,
    }) };
    if (url.endsWith('/plugin/me/stats')) return { ok: true, status: 200, json: async () => ({ themes: [] }) };
    if (url.endsWith('/plugin/me/unlocks')) return { ok: true, status: 200, json: async () => ({ unlocks: [] }) };
    if (url.endsWith('/deepseek-harness/session')) {
      if (revokeMode === '503') return { ok: false, status: 503, json: async () => ({ error: 'temporarily_unavailable' }) };
      if (revokeMode === 'false') return { ok: true, status: 200, json: async () => ({ revoked: false }) };
      return { ok: true, status: 200, json: async () => ({ revoked: true }) };
    }
    throw new Error(`Unexpected request: ${url}`);
  };
  const account = createHarnessAccountClient({
    fetchImpl,
    apiBaseUrl: 'https://api.example',
    waitImpl: async () => {},
    onDisconnected: () => { disconnectedCallbacks += 1; },
  });
  await account.connect();
  for (let attempt = 0; attempt < 10 && account.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }

  assert.equal(await account.disconnect(), false);
  assert.equal(account.getSnapshot().status, 'connected');
  assert.match(account.getSnapshot().error, /temporarily_unavailable/);
  assert.equal(disconnectedCallbacks, 0);

  revokeMode = 'false';
  assert.equal(await account.disconnect(), false);
  assert.equal(account.getSnapshot().status, 'connected');
  assert.equal(disconnectedCallbacks, 0);

  revokeMode = 'true';
  assert.equal(await account.disconnect(), true);
  assert.equal(account.getSnapshot().status, 'idle');
  assert.equal(disconnectedCallbacks, 1);
});

test('restart authentication recovery is an explicit Device Flow reconnect and Disconnect clears intent', async () => {
  const preferences = createMemoryThemeState({ reconnectRequired: true });
  const requests = [];
  let tokenSequence = 0;
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.endsWith('/auth/start')) return { ok: true, status: 200, json: async () => ({
      deviceCode: `device-${tokenSequence + 1}`,
      userCode: 'JOIN-NOW',
      verificationUri: 'https://github.com/login/device',
      expiresIn: 900,
      interval: 5,
    }) };
    if (url.endsWith('/auth/poll')) {
      tokenSequence += 1;
      return { ok: true, status: 200, json: async () => ({
        accessToken: `dxd_restart-token-${tokenSequence}`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      }) };
    }
    if (url.endsWith('/plugin/me/stats')) return { ok: true, status: 200, json: async () => ({ themes: [] }) };
    if (url.endsWith('/plugin/me/unlocks')) return { ok: true, status: 200, json: async () => ({ unlocks: [] }) };
    if (url.endsWith('/deepseek-harness/session')) return { ok: true, status: 200, json: async () => ({ revoked: true }) };
    throw new Error(`Unexpected request: ${url}`);
  };
  const createAccount = () => createHarnessAccountClient({
    fetchImpl,
    apiBaseUrl: 'https://api.example',
    waitImpl: async () => {},
    reconnectRequired: preferences.getSnapshot().reconnectRequired,
    onConnected: () => preferences.actions.rememberAccount(),
    onDisconnected: () => preferences.actions.forgetAccount(),
  });

  const first = createAccount();
  assert.equal(first.getSnapshot().reconnectRequired, true);
  assert.equal(await first.recordHarnessUse(), null);
  await first.connect();
  for (let attempt = 0; attempt < 10 && first.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(first.getSnapshot().status, 'connected');
  assert.equal(first.getSnapshot().reconnectRequired, false);
  assert.equal(preferences.getSnapshot().reconnectRequired, true);
  first.destroy();

  const second = createAccount();
  assert.equal(second.getSnapshot().reconnectRequired, true);
  assert.equal(await second.recordHarnessUse(), null);
  await second.connect();
  for (let attempt = 0; attempt < 10 && second.getSnapshot().status !== 'connected'; attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(second.getSnapshot().status, 'connected');
  await second.disconnect();
  assert.equal(preferences.getSnapshot().reconnectRequired, false);
  assert.equal(second.getSnapshot().reconnectRequired, false);
  assert.ok(requests.filter((request) => request.url.endsWith('/auth/start')).length >= 2);
  assert.ok(requests.some((request) => request.url.endsWith('/deepseek-harness/session')));
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
  assert.match(built, /Explore DeepSeek, DexThemes, and community themes\. Preview light and dark, then apply\./);
  assert.match(built, /Side by side/);
  assert.match(built, /Preview mode/);
  assert.match(built, /Create with your words/);
  assert.match(built, /Color me lucky/);
  assert.match(built, /Sign in to DexThemes/);
  assert.match(built, /Sign in with GitHub/);
  assert.match(built, /Sign out/);
  assert.match(built, /Copy code/);
  assert.match(built, /Code copied\. Paste it into GitHub\./);
  assert.match(built, /Continue with GitHub/);
  assert.match(built, /Connected Apps activity recorded/);
  assert.match(built, /Retry activity/);
  assert.match(source, /export const inject = \['slots'\]/);
  assert.match(source, /ctx\.inject\(\['theme'\]/);
  assert.match(source, /defineStore/);
  assert.match(source, /Theme service unavailable/);
  assert.match(source, /Forget saved theme/);
  assert.match(source, /WebkitLineClamp: 2/);
  assert.match(source, /@container dexthemes-settings/);
  assert.match(source, /dexthemes-account-trigger/);
  assert.match(source, /gridTemplateColumns: 'minmax\(0,1fr\) 196px'/);
  assert.match(source, /width: 196, maxWidth: '100%', marginTop: 17/);
  assert.match(source, /minHeight: 38/);
  assert.match(source, /dexthemes-feature-strip/);
  assert.match(source, /theme\.id === 'deepseek-default'/);
  assert.match(source, /stopImmediatePropagation/);
  assert.match(source, /addEventListener\?\.\('keydown', closeOnEscape, true\)/);
  assert.match(source, /applyHarnessThemeWithConnectedActivity\([\s\S]*?settings_plugin_preview/);
  assert.match(source, /applyHarnessThemeWithConnectedActivity\([\s\S]*?settings_plugin_card/);
  assert.doesNotMatch(source, /onApplied:[\s\S]*?recordHarnessUse/);
  assert.doesNotMatch(source, /execCommand|localStorage|querySelector\([^)]*Harness/i);
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
    action: 'caller_must_not_override',
    outcome: 'failed',
    prompt: 'never send this',
    workspace: '/private/project',
    credential: 'secret',
    account_id: 'never send this',
    token: 'dxd_never_send_this',
  });
  await analytics.destroy();

  const constructed = calls.find((call) => call.type === 'construct');
  assert.equal(constructed.user.userID, 'dexthemes-deepseek-harness');
  assert.equal(constructed.options.disableStorage, true);
  assert.equal(constructed.options.includeCurrentPageUrlWithEvents, false);
  const event = calls.find((call) => call.type === 'event');
  assert.deepEqual(event.metadata, {
    platform: 'deepseek_harness',
    platform_id: 'deepseek',
    mechanism: 'cordis_theme_override',
    source_surface: 'settings_plugins_dexthemes',
    theme_id: 'deepseek-huawei',
    variant: 'paired',
    plugin_version: PLUGIN_VERSION,
    action: 'apply',
    outcome: 'succeeded',
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
