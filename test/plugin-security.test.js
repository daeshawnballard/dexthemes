import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { resolveMcpProfile } from '../api/mcp.js';

test('OpenAI submission artifacts remain Codex-only', async () => {
  const [submission, skill, manifest] = await Promise.all([
    readFile(new URL('../chatgpt-app-submission.json', import.meta.url), 'utf8'),
    readFile(new URL('../plugins/dexthemes/skills/dexthemes/SKILL.md', import.meta.url), 'utf8'),
    readFile(new URL('../plugins/dexthemes/.codex-plugin/plugin.json', import.meta.url), 'utf8'),
  ]);

  for (const artifact of [submission, skill, manifest]) {
    assert.doesNotMatch(artifact, /deepseek|harness/i);
  }
});

test('generic unlock endpoint excludes server-verifiable achievements', async () => {
  const source = await readFile(new URL('../convex/http_unlock_routes.ts', import.meta.url), 'utf8');
  const publicActions = source.match(/const PUBLIC_UNLOCK_ACTIONS = new Set\(\[([\s\S]*?)\]\);/)?.[1] || '';

  for (const action of ['share_x', 'color_me_lucky', 'install_pwa']) {
    assert.match(publicActions, new RegExp(`\"${action}\"`));
  }
  for (const action of [
    'sign_in',
    'like_theme',
    'use_api',
    'agent_use',
    'complete_pair',
    'use_plugin',
    'create_theme_with_plugin',
    'use_deepseek_harness',
    'openai_employee',
    'theme_of_day',
    'theme_of_week',
  ]) {
    assert.doesNotMatch(publicActions, new RegExp(`\"${action}\"`));
  }
});

test('DeepSeek Harness activity is separately scoped, client-reported, and cannot grant protected rewards', async () => {
  const [routes, unlocks, users, records, account, coordinator] = await Promise.all([
    readFile(new URL('../convex/http_plugin_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/unlocks.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/pluginUsers.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/connectedApps.ts', import.meta.url), 'utf8'),
    readFile(new URL('../packages/deepseek-harness-plugin/src/account.js', import.meta.url), 'utf8'),
    readFile(new URL('../packages/deepseek-harness-plugin/src/apply-coordinator.js', import.meta.url), 'utf8'),
  ]);
  const route = routes.match(/path: "\/plugin\/deepseek-harness\/use"[\s\S]*?\n  \}\);/)?.[0] || '';
  assert.match(route, /authorizePlugin\(ctx, request, DEEPSEEK_HARNESS_USE_SCOPE\)/);
  assert.match(route, /recordClientReportedUseForUser/);
  assert.match(route, /userId: session\.userId/);
  assert.match(route, /request\.json\(\)\.catch/);
  assert.match(route, /normalizeClientUseReceiptId\(body\?\.receiptId\)/);
  assert.match(route, /normalizeConnectedAppPluginVersion\(body\?\.pluginVersion\)/);
  assert.match(route, /evidence: "client_reported"/);
  assert.doesNotMatch(route, /body\?\.(?:user|identity|token|action|platform|prompt|workspace|theme)/);
  assert.doesNotMatch(route, /grantUnlock|achievement|internal\.unlocks/);
  assert.doesNotMatch(unlocks, /recordDeepSeekHarnessUse/);
  assert.match(users, /grantUnlockForUser\(ctx, user\._id, "use_deepseek_harness"\)/);
  assert.match(users, /scopes: \["themes:read", DEEPSEEK_HARNESS_USE_SCOPE\]/);
  assert.match(records, /advanceClientUseReceiptHashes\(existing\.clientReceiptHashes, receiptHash\)/);
  assert.match(records, /!receiptWindow\.accepted/);
  assert.match(records, /recorded: false, clientReported: true/);
  assert.match(coordinator, /controller\.apply\(theme, options\)/);
  assert.match(coordinator, /account\?\.recordHarnessUse\?\.\(\)/);
  assert.doesNotMatch(coordinator, /recordHarnessUse\([^)]*(?:theme|palette|prompt|workspace)/);
  const useRequest = account.match(/authorizedFetch\('\/plugin\/deepseek-harness\/use',[\s\S]*?\n        \}\);/)?.[0] || '';
  assert.match(useRequest, /receiptId/);
  assert.match(useRequest, /pluginVersion/);
  assert.doesNotMatch(useRequest, /theme|palette|prompt|workspace|credential|token/i);
  assert.match(account, /pendingUseReceipt === receiptId/);
  assert.match(account, /retryHarnessUse\(\)/);
});

test('DeepSeek device OAuth is GitHub-backed, Convex-issued, bearer-only, and origin-independent', async () => {
  const [routes, helpers, account, sessions, connectedApps, schema] = await Promise.all([
    readFile(new URL('../convex/http_plugin_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_helpers.ts', import.meta.url), 'utf8'),
    readFile(new URL('../packages/deepseek-harness-plugin/src/account.js', import.meta.url), 'utf8'),
    readFile(new URL('../convex/pluginUsers.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/connectedApps.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/schema.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /\/plugin\/deepseek-harness\/auth\/start/);
  assert.match(routes, /\/plugin\/deepseek-harness\/auth\/poll/);
  assert.match(routes, /DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_ID/);
  assert.match(routes, /DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_SECRET/);
  assert.match(routes, /https:\/\/github\.com\/login\/device\/code/);
  assert.match(routes, /https:\/\/github\.com\/login\/oauth\/access_token/);
  assert.match(routes, /https:\/\/api\.github\.com\/user/);
  assert.match(routes, /new URLSearchParams\(\{ client_id: clientId \}\)/);
  assert.match(routes, /urn:ietf:params:oauth:grant-type:device_code/);
  assert.match(routes, /RATE_LIMITS\.oauthStartNetwork/);
  assert.match(routes, /RATE_LIMITS\.pluginAuthNetwork/);
  assert.match(routes, /upsertDeepSeekDeviceUser/);
  assert.match(routes, /accessToken: session\.pluginAuthToken/);
  assert.match(routes, /GITHUB_TOKEN_API_BASE/);
  assert.match(routes, /access_token: githubAccessToken/);
  assert.match(routes, /github_token_cleanup_failed/);
  assert.doesNotMatch(routes, /accessToken: githubAccessToken|offline_access|refresh_token/);
  assert.doesNotMatch(routes, /DEXTHEMES_DEEPSEEK_OAUTH_CLIENT_ID|audience/);
  assert.match(routes, /resolveClientPluginSession/);
  assert.match(routes, /requiredScope: scope/);
  assert.match(routes, /getSubmissionStatsForPluginUser/);
  assert.match(routes, /getUnlocksForUser/);
  assert.match(routes, /recordClientReportedUseForUser/);
  assert.match(routes, /\/plugin\/deepseek-harness\/session/);
  assert.match(routes, /revokeClientPluginSession/);
  assert.match(sessions, /DEEPSEEK_SESSION_TTL_MS = 60 \* 60 \* 1000/);
  assert.match(sessions, /scopes: \["themes:read", DEEPSEEK_HARNESS_USE_SCOPE\]/);
  assert.match(routes, /scope: `themes:read \$\{DEEPSEEK_HARNESS_USE_SCOPE\}`/);
  assert.match(connectedApps, /DEEPSEEK_SESSION_SOURCE = "deepseek_github_device"/);
  assert.match(sessions, /source: DEEPSEEK_SESSION_SOURCE/);
  assert.match(sessions, /clientUsable: true/);
  assert.match(sessions, /session\.clientUsable !== true/);
  assert.match(sessions, /!session\.scopes\?\.includes\(args\.requiredScope\)/);
  assert.match(schema, /pluginSessions:[\s\S]*?scopes: v\.optional\(v\.array\(v\.string\(\)\)\)/);
  assert.match(schema, /pluginSessions:[\s\S]*?clientUsable: v\.optional\(v\.boolean\(\)\)/);
  assert.match(helpers, /"Access-Control-Allow-Origin": "\*"/);
  assert.doesNotMatch(helpers.match(/export function pluginCorsHeaders\(\) \{[\s\S]*?\n\}/)?.[0] || '', /Allow-Credentials/);
  assert.doesNotMatch(account, /localStorage|sessionStorage|document\.cookie/);
  assert.match(account, /Authorization: `Bearer \$\{token\}`/);
  assert.match(account, /accessToken = ''/);
  assert.match(account, /hostname === 'github\.com'/);
  assert.match(account, /accessToken\.startsWith\('dxd_'\)/);
  assert.match(sessions, /prefix: "dxd_"/);
  assert.doesNotMatch(sessions, /deepseek_internal_bridge/);
  assert.doesNotMatch(sessions, /bridgeClientPluginSession/);
  assert.match(helpers, /"Cache-Control": "no-store"/);
  assert.match(helpers, /Pragma: "no-cache"/);
  const globalAuth = await readFile(new URL('../convex/auth.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(globalAuth, /dxd_/);
});

test('Codex MCP OAuth verifier remains separate from the DeepSeek GitHub device bridge', async () => {
  const [routes, verifier] = await Promise.all([
    readFile(new URL('../convex/http_plugin_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/pluginAuth.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /verifyPluginBearer\(request, scope\)/);
  assert.match(verifier, /DEXTHEMES_AUTH_ISSUER/);
  assert.match(verifier, /DEXTHEMES_AUTH_AUDIENCE/);
  assert.match(verifier, /jwtVerify/);
  assert.match(verifier, /algorithms: \["RS256"\]/);
});

test('DeepSeek Harness uses a distinct fail-closed MCP route without adding a Vercel function', async () => {
  const [endpoint, config, vercelSource] = await Promise.all([
    readFile(new URL('../api/mcp.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/config.js', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
  ]);
  const vercel = JSON.parse(vercelSource);
  const rewrite = vercel.rewrites.find((entry) => entry.source === '/api/deepseek-mcp');
  assert.deepEqual(rewrite, {
    source: '/api/deepseek-mcp',
    destination: '/api/mcp?profile=deepseek_harness',
  });
  assert.match(endpoint, /requestedProfile === "deepseek_harness"/);
  assert.match(endpoint, /profile: "deepseek_harness", allowAuthorization: false/);
  assert.match(endpoint, /unsupported_mcp_profile/);
  assert.doesNotMatch(endpoint, /profile = requestedProfile|allowAuthorization = requestedProfile/);
  assert.match(config, /Access-Control-Allow-Origin', '\*'/);
  assert.match(config, /req\.method !== 'GET'/);
  assert.doesNotMatch(config, /secret|serverKey|authorization/i);
});

test('MCP route selection preserves full OAuth behavior and fails closed for unknown profiles', () => {
  assert.deepEqual(resolveMcpProfile({ url: '/api/mcp' }), {
    profile: 'full',
    allowAuthorization: true,
  });
  assert.deepEqual(resolveMcpProfile({ url: '/api/mcp?profile=deepseek_harness' }), {
    profile: 'deepseek_harness',
    allowAuthorization: false,
  });
  assert.deepEqual(resolveMcpProfile({ query: { profile: 'deepseek_harness' } }), {
    profile: 'deepseek_harness',
    allowAuthorization: false,
  });
  assert.equal(resolveMcpProfile({ url: '/api/mcp?profile=full' }), null);
  assert.equal(resolveMcpProfile({ query: { profile: ['deepseek_harness', 'full'] } }), null);
  assert.equal(resolveMcpProfile({ url: 'http://%' }), null);
});

test('API achievement flow uses the authenticated server-observed endpoint', async () => {
  const source = await readFile(new URL('../src/preview-actions.js', import.meta.url), 'utf8');
  const flow = source.match(/export async function runApiUnlockFlow[\s\S]*?\n}\n/)?.[0] || '';
  assert.match(flow, /authFetch\(state\.CONVEX_SITE_URL \+ '\/me\/api-demo'/);
  assert.doesNotMatch(flow, /grantUnlockAction\(/);
});

test('Color Me Lucky submission forwards the verified bearer through the current theme contract', async () => {
  const source = await readFile(new URL('../convex/http_color_me_lucky_routes.ts', import.meta.url), 'utf8');
  const submit = source.slice(source.indexOf('path: "/api/color-me-lucky/submit"'));
  assert.match(submit, /internal\.themes\.submit, \{\s*authToken: token,/);
  assert.doesNotMatch(submit, /internal\.themes\.submit, \{\s*sessionToken:/);
});

test('employee achievement requires a signed verified exact-domain claim', async () => {
  const source = await readFile(new URL('../convex/pluginAuth.ts', import.meta.url), 'utf8');
  assert.match(source, /AUTH0_CLAIM_NAMESPACE = "https:\/\/dexthemes\.com\/"/);
  assert.match(source, /payload\[name\] \?\? payload\[`\$\{AUTH0_CLAIM_NAMESPACE\}\$\{name\}`\]/);
  assert.match(source, /verified !== true/);
  assert.match(source, /email\.slice\(separator \+ 1\)\.toLowerCase\(\) === \"openai\.com\"/);
  assert.match(source, /algorithms: \[\"RS256\"\]/);
  assert.match(source, /issuer,/);
  assert.match(source, /audience,/);
  assert.match(source, /requiredClaims: \["exp"\]/);
});

test('OpenAI reviewer access is exact-subject, environment-gated, and isolated', async () => {
  const [edge, convex] = await Promise.all([
    readFile(new URL('../api/mcp.js', import.meta.url), 'utf8'),
    readFile(new URL('../convex/pluginAuth.ts', import.meta.url), 'utf8'),
  ]);

  for (const source of [edge, convex]) {
    assert.match(source, /DEXTHEMES_OPENAI_REVIEWER_SUBJECT/);
    assert.match(source, /reviewerSubject\.length > 0 && subject === reviewerSubject|reviewerSubject && subject === reviewerSubject/);
    assert.doesNotMatch(source, /subject\.startsWith\("auth0\|"\)/);
  }
  assert.match(edge, /\^github\\\|\[A-Za-z0-9_-\]\{1,100\}\$/);
  assert.match(convex, /OPENAI_REVIEWER_GITHUB_ID = "openai-plugin-reviewer"/);
  assert.match(convex, /isOpenAIEmployee: identity\.isReviewer \? false/);
});

test('plugin quotas are enforced independently for identity and network', async () => {
  const source = await readFile(new URL('../convex/http_plugin_routes.ts', import.meta.url), 'utf8');
  assert.match(source, /plugin:\$\{scope\}:identity:/);
  assert.match(source, /plugin:\$\{scope\}:network:/);
  assert.doesNotMatch(source, /identityHash}:\$\{ip}/);
  assert.ok(source.indexOf('plugin:auth:network:') < source.indexOf('verifyPluginBearer(request, scope)'));
});

test('network quotas prefer provider request metadata and stats are gated before fanout', async () => {
  const [helpers, auth] = await Promise.all([
    readFile(new URL('../convex/http_helpers.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_auth_routes.ts', import.meta.url), 'utf8'),
  ]);
  const clientIp = helpers.slice(
    helpers.indexOf('export async function getClientIP'),
    helpers.indexOf('export const RATE_LIMITS'),
  );
  assert.match(clientIp, /ctx\.meta\?\.getRequestMetadata\?\.\(\)/);
  assert.match(clientIp, /normalizeNetworkIdentity\(metadata\?\.ip\)/);
  assert.ok(clientIp.indexOf('metadata?.ip') < clientIp.indexOf('x-real-ip'));
  assert.ok(clientIp.indexOf('x-real-ip') < clientIp.indexOf('x-forwarded-for'));

  const stats = auth.slice(auth.indexOf('path: "/me/stats"'));
  assert.ok(stats.indexOf('stats:network:') < stats.indexOf('resolveUser(ctx, token)'));
  assert.ok(stats.indexOf('resolveUser(ctx, token)') < stats.indexOf('stats:user:'));
  assert.ok(stats.indexOf('stats:user:') < stats.indexOf('getMySubmissionStats'));
});

test('public catalog requests are cached and concurrent refreshes are deduplicated', async () => {
  const source = await readFile(new URL('../server/theme-tools.js', import.meta.url), 'utf8');
  const loader = source.slice(source.indexOf('export async function loadThemeCatalog'), source.indexOf('function searchableText'));
  assert.match(source, /const CATALOG_CACHE_TTL_MS = 30 \* 1000/);
  assert.match(loader, /if \(catalogCache && now < catalogCacheExpiresAt\) return catalogCache/);
  assert.match(loader, /if \(catalogRequest\) return catalogRequest/);
  assert.match(loader, /catalogRequest = null/);
});

test('OAuth state is browser-bound and cleaned on a schedule', async () => {
  const [route, state, cron] = await Promise.all([
    readFile(new URL('../convex/http_auth_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/oauthStates.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/crons.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(route, /buildOauthBindingCookie/);
  assert.match(route, /bindingHash: await sha256Base64Url\(binding\)/);
  assert.match(state, /state\.bindingHash !== args\.bindingHash/);
  assert.match(cron, /cleanupExpiredOauthStates/);
});

test('Vercel config never rewrites its reserved well-known namespace', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const rewrite of config.rewrites || []) {
    assert.equal(String(rewrite.source).startsWith('/.well-known'), false);
  }
});

test('well-known OAuth metadata is served as JSON for plugin discovery', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const oauthHeaders = config.headers.find(
    (entry) => entry.source === '/.well-known/oauth-protected-resource',
  )?.headers;
  assert.equal(
    oauthHeaders?.find((header) => header.key === 'Content-Type')?.value,
    'application/json; charset=utf-8',
  );
});

test('protected unlock IDs include the hidden Easter egg', async () => {
  const source = await readFile(new URL('../convex/protectedThemes.ts', import.meta.url), 'utf8');
  assert.match(source, /id: 'triple-dot'/);
  assert.match(source, /STATIC_THEME_CATALOG/);
  assert.match(source, /CATALOG_PROTECTED/);
});

test('likes resolve a visible static or published community theme before granting Heartbeat', async () => {
  const source = await readFile(new URL('../convex/likes.ts', import.meta.url), 'utf8');
  assert.match(source, /VISIBLE_STATIC_THEME_IDS/);
  assert.match(source, /communityTheme\.status !== "published"/);
  assert.ok(source.indexOf('throw new Error("Theme not found")') < source.indexOf('await grantUnlockForUser'));
});

test('Summit uses unique authenticated non-author adoptions and only a closed-month finalizer can grant it', async () => {
  const [themes, unlocks, periods] = await Promise.all([
    readFile(new URL('../convex/themes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/unlocks.ts', import.meta.url), 'utf8'),
    readFile(new URL('../shared/popularity-periods.js', import.meta.url), 'utf8'),
  ]);
  assert.match(themes, /String\(theme\.authorId\) === String\(userId\)/);
  assert.match(themes, /by_theme_period_user/);
  assert.doesNotMatch(themes, /maybeGrantMonthlyTop10ForTheme|findIndex\([\s\S]*?< 10/);
  assert.match(unlocks, /async function finalizeMonthlyTop10/);
  assert.match(unlocks, /previousClosedPopularityPeriod\(periodType, now\)/);
  assert.match(unlocks, /grantUnlockForUser\(ctx, winner\.userId, "top10_monthly"\)/);
  assert.match(periods, /monthly: Object\.freeze\(\{ copies: 0, qualifiedAdoptions: 3 \}\)/);
});

test('daily and weekly winners are server-finalized, thresholded, and recorded separately from one-time unlocks', async () => {
  const [schema, unlocks, cron, periods] = await Promise.all([
    readFile(new URL('../convex/schema.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/unlocks.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/crons.ts', import.meta.url), 'utf8'),
    readFile(new URL('../shared/popularity-periods.js', import.meta.url), 'utf8'),
  ]);
  assert.match(schema, /popularityPeriodFinalizations/);
  assert.match(schema, /\.index\("by_period", \["periodType", "periodStart"\]\)/);
  assert.match(unlocks, /theme_of_day: \{ themeId: "golden-hour"/);
  assert.match(unlocks, /theme_of_week: \{ themeId: "headliner"/);
  assert.match(unlocks, /Repeat daily and weekly winners keep/);
  assert.match(unlocks, /grantUnlockForUser\(ctx, winner\.authorId, action\)/);
  assert.match(unlocks, /monthly: await finalizeMonthlyTop10\(ctx, now\)/);
  assert.match(cron, /finalizePopularityWinners/);
  assert.match(periods, /daily: Object\.freeze\(\{ copies: 3, qualifiedAdoptions: 1 \}\)/);
  assert.match(periods, /weekly: Object\.freeze\(\{ copies: 5, qualifiedAdoptions: 2 \}\)/);
});

test('authenticated theme routes rate-limit low-cardinality networks before verified user subjects', async () => {
  const [themes, unlocks, auth] = await Promise.all([
    readFile(new URL('../convex/http_theme_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_unlock_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/http_auth_routes.ts', import.meta.url), 'utf8'),
  ]);
  const submit = themes.slice(themes.indexOf('path: "/themes",\n    method: "POST"'), themes.indexOf('path: "/themes/flag"'));
  const flag = themes.slice(themes.indexOf('path: "/themes/flag"'), themes.indexOf('path: "/themes/copy"'));
  const like = themes.slice(themes.indexOf('path: "/themes/like"'), themes.indexOf('path: "/themes/likes/counts"'));
  assert.ok(submit.indexOf('submit:network:') < submit.indexOf('resolveUser(ctx, token)'));
  assert.ok(submit.indexOf('resolveUser(ctx, token)') < submit.indexOf('submit:user:'));
  assert.doesNotMatch(submit, /like:/);
  assert.ok(flag.indexOf('flag:network:') < flag.indexOf('resolveUser(ctx, token)'));
  assert.ok(flag.indexOf('resolveUser(ctx, token)') < flag.indexOf('flag:user:'));
  assert.ok(like.indexOf('like:network:') < like.indexOf('resolveUser(ctx, token)'));
  assert.ok(like.indexOf('resolveUser(ctx, token)') < like.indexOf('like:user:'));
  assert.doesNotMatch(themes, /submit:\$\{tokenHash\}|flag:\$\{tokenHash\}|like:identity:/);

  const demo = unlocks.slice(unlocks.indexOf('path: "/me/api-demo"'), unlocks.indexOf('path: "/me/unlocks"'));
  assert.ok(demo.indexOf('api-demo:network:') < demo.indexOf('resolveUser(ctx, token)'));
  assert.ok(demo.indexOf('resolveUser(ctx, token)') < demo.indexOf('api-demo:user:'));
  assert.ok(demo.indexOf('resolveUser(ctx, token)') < demo.indexOf('listPublished'));

  assert.ok(auth.indexOf('oauth-start:network:') < auth.indexOf('oauth-start:global'));
});

test('expired limiter and plugin-session state has indexed bounded cleanup', async () => {
  const [schema, limiter, sessions, cron] = await Promise.all([
    readFile(new URL('../convex/schema.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/rateLimit.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/pluginUsers.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/crons.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(schema, /rateLimits:[\s\S]*?expiresAt: v\.optional\(v\.number\(\)\)[\s\S]*?\.index\("by_expires"/);
  assert.match(schema, /pluginSessions:[\s\S]*?\.index\("by_expires"/);
  assert.match(limiter, /cleanupExpiredRateLimits/);
  assert.match(limiter, /Math\.max\(1, Math\.min\(args\.limit, 1000\)\)/);
  assert.match(sessions, /cleanupExpiredPluginSessions/);
  assert.match(cron, /cleanupExpiredRateLimits/);
  assert.match(cron, /cleanupExpiredPluginSessions/);
});

test('protected reward deep links wait for verified unlock state before rendering', async () => {
  const [state, auth] = await Promise.all([
    readFile(new URL('../src/app-state.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/auth.js', import.meta.url), 'utf8'),
  ]);
  assert.match(state, /_requestedThemeIsProtected/);
  assert.match(state, /_requestedTheme && !_requestedThemeIsProtected && _requestedThemeIsVisible/);
  assert.match(state, /isThemeCategoryVisibleForPlatform\(_requestedTheme\.category, selectedPlatformId\)/);
  assert.match(state, /_requestedThemeIsProtected && _requestedThemeIsVisible/);
  assert.match(state, /deferredProtectedThemeId/);
  assert.match(auth, /state\.userUnlocks\.has\(id\)/);
  assert.match(auth, /showLockedThemeShell\(theme, action\)/);
});

test('plugin visual studio uses full Codex mockups and an explicit copy-and-settings handoff', async () => {
  const source = await readFile(new URL('../mcp-app/src/theme-studio.js', import.meta.url), 'utf8');
  assert.match(source, /function codexMock/);
  assert.match(source, /theme\.config\.json/);
  assert.match(source, /callToolAndRender\("fetch"/);
  assert.match(source, /Copy theme/);
  assert.match(source, /Theme copied to clipboard/);
  assert.match(source, /aria-live/);
  assert.match(source, /choose Appearance/);
  assert.doesNotMatch(source, /buy_coffee|Patron|Open on DexThemes/);
  assert.doesNotMatch(source, /innerHTML/);
});

test('plugin visual studio keeps DeepSeek preparation separate from the Codex clipboard handoff', async () => {
  const source = await readFile(new URL('../mcp-app/src/theme-studio.js', import.meta.url), 'utf8');
  const deepSeekView = source.slice(
    source.indexOf('function renderDeepSeekApply'),
    source.indexOf('function renderSubmitted'),
  );
  assert.match(deepSeekView, /READY FOR DEEPSEEK HARNESS/);
  assert.match(deepSeekView, /cordis_define/);
  assert.match(deepSeekView, /cordis_run/);
  assert.match(deepSeekView, /cordis_stop/);
  assert.match(deepSeekView, /apply preparation, not proof/);
  assert.doesNotMatch(deepSeekView, /copyToClipboard|app\.openLink|Codex Settings/);
});

test('plugin account routes hide Patron and public submissions enforce original identity wording server-side', async () => {
  const [routes, themes, mcp] = await Promise.all([
    readFile(new URL('../convex/http_plugin_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/themes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../server/dexthemes-mcp.js', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /function enrichUnlocks\(unlocks: any\[\]\)/);
  assert.match(routes, /unlocks\.filter\(isPluginUnlockVisible\)/);
  assert.match(routes, /achievements: enrichUnlocks\(achievements\)/);
  assert.match(routes, /unlocks: enrichUnlocks\(unlocks\)/);
  assert.match(themes, /evaluatePublicThemeIdentity\(args\)/);
  assert.match(themes, /server-side gate prevents a client from bypassing the MCP review step/);
  assert.match(mcp, /validatePublicTheme\(theme\)/);
});

test('every persisted variant color is validated before browser rendering', async () => {
  const [themes, engine, builder, sidebar, mobile, chat] = await Promise.all([
    readFile(new URL('../convex/themes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/theme-engine.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/builder.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/sidebar.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/mobile-browse.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/preview-chat.js', import.meta.url), 'utf8'),
  ]);
  assert.match(themes, /const THEME_COLOR_KEYS = \[[\s\S]*?"sidebar",[\s\S]*?"codeBg"/);
  assert.match(themes, /assertValidVariantColors\(args\.variant, args\.variantKey\)/);
  assert.match(engine, /getSafePreviewVariant/);
  assert.match(engine, /variant\.codeBg != null && !isSixDigitHexColor\(variant\.codeBg\)/);
  assert.match(builder, /sanitizeVariantDraft/);
  assert.match(builder, /buildThemeImportString\(buildBuilderTheme\(b\), b\.variant, 0\)/);
  assert.match(sidebar, /safeHexColor\(\(t\.dark \|\| t\.light\)\?\.accent/);
  assert.match(mobile, /const surface = safeHexColor\(colors\.surface/);
  assert.match(chat, /paletteColors[\s\S]*?safeHexColor\(color, ''\)/);
});

test('supporter wall is explicit opt-in and independent from Patron access', async () => {
  const [supporters, unlocks, policy] = await Promise.all([
    readFile(new URL('../convex/supporters.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/unlocks.ts', import.meta.url), 'utf8'),
    readFile(new URL('../public/privacy.html', import.meta.url), 'utf8'),
  ]);
  assert.match(supporters, /publicListing: v\.boolean\(\)/);
  assert.match(supporters, /supporterPublicListing: args\.publicListing/);
  assert.match(unlocks, /user\.supporterPublicListing !== true/);
  assert.match(policy, /Supporter status never requires public listing/);
});

test('generated public discovery artifacts exclude every unlockable reward theme', async () => {
  const [source, catalogSource, themeMapSource, sitemap, llmsFull] = await Promise.all([
    readFile(new URL('../scripts/generate-theme-api-catalog.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../shared/theme-api-catalog.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/theme-map.json', import.meta.url), 'utf8'),
    readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8'),
    readFile(new URL('../public/llms-full.txt', import.meta.url), 'utf8'),
  ]);
  const themeMapBlock = source.match(/const themeMap = Object\.fromEntries\(([\s\S]*?)\n  \);/)?.[1] || '';
  assert.match(source, /function isPublicCatalogTheme\(theme\)/);
  assert.match(source, /theme\.subgroup !== "unlockables"/);
  assert.match(themeMapBlock, /filter\(isPublicCatalogTheme\)/);

  const catalogJson = catalogSource.match(/export const STATIC_THEME_CATALOG = ([\s\S]*?);\n\nexport function/)?.[1];
  assert.ok(catalogJson, 'generated static catalog payload');
  const catalog = JSON.parse(catalogJson);
  const themeMap = JSON.parse(themeMapSource);
  const unlockableIds = catalog
    .filter((theme) => theme.subgroup === 'unlockables')
    .map((theme) => theme.id);
  assert.ok(unlockableIds.length > 0);
  for (const id of unlockableIds) {
    assert.equal(Object.hasOwn(themeMap, id), false, `${id} leaked into theme-map.json`);
    assert.equal(sitemap.includes(`?theme=${encodeURIComponent(id)}&amp;`), false, `${id} leaked into sitemap.xml`);
    assert.equal(llmsFull.includes(`- ID: \`${id}\``), false, `${id} leaked into llms-full.txt`);
  }
});

test('widget build uses callback replacement and verifies the exact JavaScript payload', async () => {
  const source = await readFile(new URL('../scripts/build-mcp-app.mjs', import.meta.url), 'utf8');
  assert.match(source, /replace\("__DEXTHEMES_WIDGET_JS__", \(\) => bundle\.text\)/);
  assert.match(source, /html\.includes\(bundle\.text\)/);
});
