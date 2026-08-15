import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  CONNECTED_APP_IDS,
  DEEPSEEK_HARNESS_USE_SCOPE,
  advanceClientUseReceiptHashes,
  normalizeClientUseReceiptId,
  normalizeConnectedAppPluginVersion,
  projectConnectedAppRecord,
} from '../shared/connected-apps-contract.js';

const previousWindow = globalThis.window;
globalThis.window = {
  __CONVEX_SITE_URL: '',
  location: { hostname: 'www.dexthemes.com' },
};

const {
  disconnectConnectedApp,
  fetchConnectedApps,
  renderConnectedAppsSection,
} = await import('../src/connected-apps.js');

test.after(() => {
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
});

test('Connected Apps projection exposes only bounded account evidence', () => {
  const projected = projectConnectedAppRecord({
    _id: 'database-id',
    userId: 'user-id',
    tokenHash: 'secret-hash',
    prompt: 'private prompt',
    workspace: '/private/workspace',
    providerToken: 'provider-secret',
    integrationId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
    pluginVersion: '0.6.0',
    connectedAt: 100.9,
    lastUsedAt: 200.7,
    usageCount: 3,
  });

  assert.deepEqual(projected, {
    integrationId: 'deepseek_harness',
    integrationName: 'DexThemes Connect',
    platformId: 'deepseek',
    platformName: 'DeepSeek Harness',
    pluginVersion: '0.6.0',
    connectedAt: 100,
    lastUsedAt: 200,
    usage: { clientReportedThemeApplies: 3, evidence: 'client_reported' },
    canDisconnect: true,
  });
  assert.equal(JSON.stringify(projected).includes('secret'), false);
  assert.equal(JSON.stringify(projected).includes('private'), false);
  assert.equal(projectConnectedAppRecord({ integrationId: 'unknown' }), null);
  assert.equal(projectConnectedAppRecord({
    integrationId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
    disconnectedAt: 1,
  }), null);
  assert.equal(normalizeConnectedAppPluginVersion('version 1'), undefined);
  assert.equal(DEEPSEEK_HARNESS_USE_SCOPE, 'harness:use');
  assert.equal(normalizeClientUseReceiptId('0194f5e2-0b8e-4c53-9a20-87e7ac48a889'), '0194f5e2-0b8e-4c53-9a20-87e7ac48a889');
  assert.equal(normalizeClientUseReceiptId('forged'), null);
});

test('client-reported activity receipts reject replay and stay bounded', () => {
  const firstHash = 'a'.repeat(64);
  const first = advanceClientUseReceiptHashes([], firstHash);
  assert.equal(first.accepted, true);
  assert.deepEqual(first.hashes, [firstHash]);
  const replay = advanceClientUseReceiptHashes(first.hashes, firstHash);
  assert.equal(replay.accepted, false);
  assert.deepEqual(replay.hashes, [firstHash]);
  let hashes = first.hashes;
  for (let index = 1; index <= 40; index += 1) {
    hashes = advanceClientUseReceiptHashes(hashes, index.toString(16).padStart(64, '0')).hashes;
  }
  assert.equal(hashes.length, 32);
  assert.equal(hashes.includes(firstHash), false);
  assert.equal(advanceClientUseReceiptHashes([], 'invalid').accepted, false);
});

test('Connected Apps browser client uses one website-session route and an exact disconnect body', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options });
    if (!options.method) {
      return Response.json({ apps: [{
        integrationId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
        pluginVersion: '0.6.0',
        connectedAt: 100,
        lastUsedAt: 200,
        usage: { clientReportedThemeApplies: 2 },
      }] });
    }
    return Response.json({ disconnected: true });
  };

  const apps = await fetchConnectedApps({ fetchImpl, apiBaseUrl: 'https://api.example' });
  assert.equal(apps.length, 1);
  assert.equal(apps[0].platformName, 'DeepSeek Harness');
  assert.equal(await disconnectConnectedApp(CONNECTED_APP_IDS.DEEPSEEK_HARNESS, {
    fetchImpl,
    apiBaseUrl: 'https://api.example',
  }), true);

  assert.deepEqual(requests, [
    { url: 'https://api.example/me/connected-apps', options: { cache: 'no-store' } },
    {
      url: 'https://api.example/me/connected-apps',
      options: {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS }),
      },
    },
  ]);
  await assert.rejects(
    disconnectConnectedApp('unknown', { fetchImpl, apiBaseUrl: 'https://api.example' }),
    /Unsupported connected app/,
  );
  assert.equal(requests.length, 2);
});

test('Connected Apps account UI renders loading, empty, error, evidence, and disconnect states safely', () => {
  const loading = renderConnectedAppsSection({ status: 'loading' });
  assert.match(loading, /Loading connected apps/);
  assert.doesNotMatch(loading, /No installed apps/);

  const empty = renderConnectedAppsSection({ status: 'ready', apps: [] });
  assert.match(empty, /No installed apps are connected yet/);

  const failed = renderConnectedAppsSection({
    status: 'error',
    error: '<img src=x onerror=alert(1)>',
  });
  assert.match(failed, /role="alert"/);
  assert.match(failed, /data-action="retry-connected-apps"/);
  assert.doesNotMatch(failed, /<img/);

  const populated = renderConnectedAppsSection({
    apps: [{
      integrationId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
      pluginVersion: '0.6.0',
      connectedAt: 100,
      lastUsedAt: 200,
      usageCount: 1,
    }],
  });
  assert.match(populated, /DexThemes Connect/);
  assert.match(populated, /DeepSeek Harness/);
  assert.match(populated, /Plugin 0\.6\.0/);
  assert.match(populated, /1 client-reported theme activity/);
  assert.match(populated, /data-action="disconnect-connected-app"/);
});

test('Connected Apps remains durable, additive, session-separated, and evidence-gated', async () => {
  const [schema, records, users, routes, authRoutes, browserClient, profile, actions] = await Promise.all([
    readFile(new URL('../convex/schema.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/connectedApps.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/pluginUsers.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_plugin_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_auth_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/connected-apps.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/auth.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/delegated-actions.js', import.meta.url), 'utf8'),
  ]);
  const connectedAppsTable = schema.match(/connectedApps: defineTable\(\{[\s\S]*?\n  \}\)[\s\S]*?by_user_integration[^\n]*/)?.[0] || '';
  const useRoute = routes.match(/path: "\/plugin\/deepseek-harness\/use"[\s\S]*?\n  \}\);/)?.[0] || '';
  const accountRoute = authRoutes.slice(authRoutes.indexOf('path: "/me/connected-apps"'));

  assert.match(connectedAppsTable, /integrationId: v\.string\(\)/);
  assert.match(connectedAppsTable, /pluginVersion: v\.optional\(v\.string\(\)\)/);
  assert.match(connectedAppsTable, /usageCount: v\.number\(\)/);
  assert.match(connectedAppsTable, /clientReceiptHashes: v\.optional\(v\.array\(v\.string\(\)\)\)/);
  assert.doesNotMatch(connectedAppsTable, /token|credential|prompt|workspace|provider/i);
  assert.match(records, /projectConnectedAppRecord/);
  assert.match(records, /disconnectedAt/);
  assert.doesNotMatch(records, /Statsig|trackEvent|analytics/i);
  assert.match(users, /source: DEEPSEEK_SESSION_SOURCE/);
  assert.match(users, /markConnectedApp/);
  assert.match(useRoute, /session\.source !== DEEPSEEK_SESSION_SOURCE/);
  assert.match(useRoute, /DEEPSEEK_HARNESS_USE_SCOPE/);
  assert.match(useRoute, /normalizeClientUseReceiptId\(body\?\.receiptId\)/);
  assert.match(useRoute, /evidence: "client_reported"/);
  assert.match(records, /recordClientReportedUseForUser/);
  assert.match(useRoute, /normalizeConnectedAppPluginVersion\(body\?\.pluginVersion\)/);
  assert.doesNotMatch(useRoute, /body\?\.(?:user|identity|token|prompt|workspace|theme)/);
  assert.match(accountRoute, /Website session required/);
  assert.match(accountRoute, /isApiKey\(token\)/);
  assert.match(authRoutes, /CONNECTED_APPS_RESPONSE_HEADERS[\s\S]*?"Cache-Control": "no-store"/);
  assert.match(profile, /Promise\.allSettled\([\s\S]*?fetchConnectedApps\(\)/);
  assert.match(profile, /renderConnectedAppsSection\(connectedAppsState\)/);
  assert.match(actions, /case 'disconnect-connected-app'/);
  assert.doesNotMatch(browserClient, /Statsig|trackEvent|analytics/i);
});
