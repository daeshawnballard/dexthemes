import assert from 'node:assert/strict';
import test from 'node:test';

import deepSeekThemeHandler from '../api/deepseek-theme.js';
import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';
import {
  DEEPSEEK_THEME_TOKENS,
  buildDeepSeekCordisPayload,
  buildDeepSeekIntegrationMetadata,
  buildDeepSeekThemeTokens,
  getColorContrastRatio,
  isDeepSeekThemeEligible,
  validateDeepSeekCordisPayload,
  validateDeepSeekThemeTokens,
} from '../shared/deepseek-theme-contract.js';
import {
  connectDeepSeekHarnessThemeService,
  getDeepSeekApplyState,
  handleDeepSeekApplyClick,
  resetDeepSeekTheme,
} from '../src/deepseek-handoff.js';
import {
  DEEPSEEK_ANALYTICS_EVENTS,
  buildDeepSeekAnalyticsMetadata,
  classifyDeepSeekApplyFailure,
  trackDeepSeekEvent,
} from '../src/deepseek-analytics.js';

const PAIRED_THEME = Object.freeze({
  id: 'test-pair',
  name: 'Test Pair',
  dark: Object.freeze({
    surface: '#111111',
    ink: '#f2f2f2',
    accent: '#3b82f6',
    sidebar: '#090909',
    codeBg: '#080808',
    diffAdded: '#22c55e',
    diffRemoved: '#ef4444',
    skill: '#f59e0b',
    contrast: 60,
    fonts: { ui: 'Unsupported Sans' },
  }),
  light: Object.freeze({
    surface: '#ffffff',
    ink: '#171717',
    accent: '#2563eb',
    sidebar: '#f5f5f5',
    codeBg: '#f0f0f0',
    diffAdded: '#15803d',
    diffRemoved: '#b91c1c',
    skill: '#a16207',
    contrast: 45,
    fonts: { code: 'Unsupported Mono' },
  }),
});

test('DeepSeek adapter maps both palettes to the advertised Harness token pairs', () => {
  const tokens = buildDeepSeekThemeTokens(PAIRED_THEME);

  assert.deepEqual(Object.keys(tokens), [...DEEPSEEK_THEME_TOKENS]);
  assert.deepEqual(tokens['--dsw-alias-bg-base'], { light: '#FFFFFF', dark: '#111111' });
  assert.deepEqual(tokens['--dsw-specific-sidebar-fill'], { light: '#F5F5F5', dark: '#090909' });
  assert.deepEqual(tokens['--dsw-alias-bg-overlay'], { light: '#F0F0F0', dark: '#080808' });
  assert.equal(JSON.stringify(tokens).includes('font'), false);

  for (const mode of ['light', 'dark']) {
    const background = tokens['--dsw-alias-bg-base'][mode];
    assert.ok(getColorContrastRatio(tokens['--dsw-alias-label-primary'][mode], background) >= 4.5);
    assert.ok(getColorContrastRatio(tokens['--dsw-alias-label-secondary'][mode], background) >= 4.5);
    assert.ok(getColorContrastRatio(tokens['--dsw-alias-border-l2'][mode], background) >= 3);
    assert.ok(getColorContrastRatio(tokens['--dsw-alias-brand-primary'][mode], background) >= 3);
  }
});

test('DeepSeek eligibility and token validation fail closed for incomplete or malformed pairs', () => {
  assert.equal(isDeepSeekThemeEligible(PAIRED_THEME), true);
  assert.equal(isDeepSeekThemeEligible({ ...PAIRED_THEME, light: null }), false);
  assert.throws(
    () => buildDeepSeekThemeTokens({ ...PAIRED_THEME, light: null }),
    /require both dark and light/i,
  );

  const tokens = buildDeepSeekThemeTokens(PAIRED_THEME);
  assert.throws(
    () => validateDeepSeekThemeTokens({ ...tokens, '--dsw-alias-bg-base': '#FFFFFF' }),
    /must be an object/i,
  );
  assert.throws(
    () => validateDeepSeekThemeTokens({ ...tokens, '--invented-token': { light: '#FFFFFF', dark: '#000000' } }),
    /exactly the supported Harness semantic tokens/i,
  );
});

test('DeepSeek catalog metadata identifies installed-plugin one-click without changing theme storage', () => {
  assert.deepEqual(buildDeepSeekIntegrationMetadata(PAIRED_THEME, PAIRED_THEME.id), {
    eligible: true,
    mechanism: 'cordis-theme-override',
    packageUrl: '/api/deepseek-theme?theme=test-pair',
    applyPreparationUrl: '/api/deepseek-theme?theme=test-pair',
    requiresInstalledCordisSurface: true,
    installedPluginPackage: '@dexthemes/deepseek-harness-plugin',
    installedPluginSurface: 'settings.plugins.dexthemes',
    oneClickScope: 'installed-plugin',
    fontsSupported: false,
  });
  assert.equal('platform' in PAIRED_THEME, false);
});

test('DeepSeek adapter derives optional secondary surfaces without mutating source palettes', () => {
  const theme = structuredClone(PAIRED_THEME);
  delete theme.dark.sidebar;
  delete theme.dark.codeBg;
  delete theme.light.sidebar;
  delete theme.light.codeBg;
  const original = structuredClone(theme);

  const tokens = buildDeepSeekThemeTokens(theme);

  assert.equal(isDeepSeekThemeEligible(theme), true);
  assert.match(tokens['--dsw-specific-sidebar-fill'].dark, /^#[0-9A-F]{6}$/);
  assert.match(tokens['--dsw-alias-bg-overlay'].light, /^#[0-9A-F]{6}$/);
  assert.deepEqual(theme, original);
});

test('Cordis payload is client-only, lifecycle-bounded, and tamper-evident', () => {
  const payload = buildDeepSeekCordisPayload(PAIRED_THEME);

  assert.deepEqual(payload.cordisDefine.plugin, { kind: 'new', idPrefix: 'dext' });
  assert.deepEqual(Object.keys(payload.cordisDefine.code), ['client']);
  assert.match(payload.cordisDefine.code.client, /inject: \['theme'\]/);
  assert.match(payload.cordisDefine.code.client, /ctx\.theme\.overrideTokens\('dexthemes'/);
  assert.doesNotMatch(payload.cordisDefine.code.client, /\b(?:document|window|fetch|import|require)\b/);
  assert.deepEqual(payload.activation, {
    tool: 'cordis_run',
    mode: 'run',
    requires: ['pluginId', 'packageId'],
  });
  assert.deepEqual(payload.reversal, { tool: 'cordis_stop', requires: ['pluginId'] });
  assert.deepEqual(payload.fonts, { supported: false });

  const tampered = structuredClone(payload);
  tampered.cordisDefine.code.client += '\nwindow.document.body.style.color = "red"';
  assert.throws(() => validateDeepSeekCordisPayload(tampered), /does not match the validated token payload/i);

  const incompleteLifecycle = structuredClone(payload);
  incompleteLifecycle.activation.requires = ['pluginId'];
  assert.throws(
    () => validateDeepSeekCordisPayload(incompleteLifecycle),
    /activation requirements/i,
  );

  const extraField = structuredClone(payload);
  extraField.externalInstallUrl = 'deepseek://invented';
  assert.throws(() => validateDeepSeekCordisPayload(extraField), /must contain exactly/i);
});

test('Cordis metadata rejects Unicode presentation controls but preserves ordinary human Unicode', () => {
  const valid = buildDeepSeekCordisPayload({ ...PAIRED_THEME, name: '晴れ ☀️' });
  assert.equal(valid.theme.name, '晴れ ☀️');
  for (const control of ['\u202e', '\u2066', '\u200f', '\u0008']) {
    assert.throws(
      () => buildDeepSeekCordisPayload({ ...PAIRED_THEME, name: `Trusted ${control}spoof` }),
      /Unicode control or format/i,
    );
    const forged = structuredClone(buildDeepSeekCordisPayload(PAIRED_THEME));
    forged.theme.name = `Trusted ${control}spoof`;
    forged.cordisDefine.name = `DexThemes · ${forged.theme.name}`;
    forged.cordisDefine.purpose = `Apply the user-selected ${forged.theme.name} palette to DeepSeek Harness through the guarded theme service.`;
    assert.throws(() => validateDeepSeekCordisPayload(forged), /Unicode control or format/i);
  }
});

test('one click applies through the connected Harness theme service and retains reversal', async (t) => {
  const calls = [];
  let disposed = 0;
  const disconnect = connectDeepSeekHarnessThemeService({
    overrideTokens(source, tokens) {
      calls.push({ source, tokens });
      return () => { disposed += 1; };
    },
  });
  t.after(() => {
    resetDeepSeekTheme();
    disconnect();
  });

  assert.equal(getDeepSeekApplyState(PAIRED_THEME).enabled, true);
  const button = { disabled: false, textContent: 'Apply to DeepSeek', dataset: {} };
  const result = await handleDeepSeekApplyClick({ theme: PAIRED_THEME, button });

  assert.equal(result.applied, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].source, 'dexthemes');
  assert.deepEqual(calls[0].tokens, buildDeepSeekThemeTokens(PAIRED_THEME));
  assert.equal(button.textContent, 'Applied to DeepSeek');
  assert.equal(button.dataset.applyState, 'applied');
  assert.equal(button.disabled, false);
  assert.equal(getDeepSeekApplyState(PAIRED_THEME).applied, true);

  assert.equal(resetDeepSeekTheme(), true);
  assert.equal(disposed, 1);
  assert.equal(getDeepSeekApplyState(PAIRED_THEME).applied, false);
});

test('DeepSeek payload API returns eligible Cordis definitions and rejects single-mode themes', async () => {
  const eligibleResponse = await deepSeekThemeHandler(new Request(
    'https://www.dexthemes.com/api/deepseek-theme?theme=codex',
  ));
  assert.equal(eligibleResponse.status, 200);
  const payload = await eligibleResponse.json();
  assert.doesNotThrow(() => validateDeepSeekCordisPayload(payload));
  assert.equal(payload.theme.id, 'codex');

  const ineligibleResponse = await deepSeekThemeHandler(new Request(
    'https://www.dexthemes.com/api/deepseek-theme?theme=ayu',
  ));
  assert.equal(ineligibleResponse.status, 422);
  assert.match((await ineligibleResponse.json()).reason, /both dark and light/i);

  const missingResponse = await deepSeekThemeHandler(new Request(
    'https://www.dexthemes.com/api/deepseek-theme',
  ));
  assert.equal(missingResponse.status, 400);
  assert.equal(missingResponse.headers.get('cache-control'), 'no-store');

  const methodResponse = await deepSeekThemeHandler(new Request(
    'https://www.dexthemes.com/api/deepseek-theme?theme=codex',
    { method: 'POST' },
  ));
  assert.equal(methodResponse.status, 405);

  const optionsResponse = await deepSeekThemeHandler(new Request(
    'https://www.dexthemes.com/api/deepseek-theme',
    { method: 'OPTIONS' },
  ));
  assert.equal(optionsResponse.status, 204);
  assert.equal(await optionsResponse.text(), '');
});

test('DeepSeek payload API excludes every account-only reward palette', async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([]);
  t.after(() => { globalThis.fetch = originalFetch; });

  const rewardThemeIds = STATIC_THEME_CATALOG
    .filter((theme) => theme.subgroup === 'unlockables')
    .map((theme) => theme.id);
  assert.ok(rewardThemeIds.length > 0);

  for (const themeId of rewardThemeIds) {
    const response = await deepSeekThemeHandler(new Request(
      `https://www.dexthemes.com/api/deepseek-theme?theme=${encodeURIComponent(themeId)}`,
    ));
    assert.equal(response.status, 404, `${themeId} must require a verified unlock`);
  }
});

test('DeepSeek analytics uses a separate allowlisted taxonomy without sensitive free-form data', () => {
  const metadata = buildDeepSeekAnalyticsMetadata({
    sourceSurface: 'website_theme_details',
    themeId: 'test-pair',
    variant: 'dark',
    harnessVersion: '2.4.0',
    pluginVersion: '1.0.0',
    failureCode: 'service_unavailable',
    prompt: 'must never be collected',
    workspaceContents: '/private/workspace',
    credentials: 'secret',
  });

  assert.deepEqual(metadata, {
    platform: 'deepseek_harness',
    platform_id: 'deepseek',
    mechanism: 'cordis_theme_override',
    source_surface: 'website_theme_details',
    theme_id: 'test-pair',
    variant: 'dark',
    harness_version: '2.4.0',
    plugin_version: '1.0.0',
    failure_code: 'service_unavailable',
  });
  assert.equal(JSON.stringify(metadata).includes('private'), false);
  assert.deepEqual(buildDeepSeekAnalyticsMetadata({ themeId: 'unsafe id with spaces' }), {
    platform: 'deepseek_harness',
    platform_id: 'deepseek',
    mechanism: 'cordis_theme_override',
    source_surface: 'unknown',
    plugin_version: '0.6.4',
  });
  assert.deepEqual(buildDeepSeekAnalyticsMetadata({
    sourceSurface: 'website_preview',
    themeId: 'test-pair',
    variant: 'paired',
    pluginVersion: '0.6.1',
  }, DEEPSEEK_ANALYTICS_EVENTS.APPLY_FAILED), {
    platform: 'deepseek_harness',
    platform_id: 'deepseek',
    mechanism: 'cordis_theme_override',
    source_surface: 'website_preview',
    theme_id: 'test-pair',
    variant: 'paired',
    plugin_version: '0.6.1',
    action: 'apply',
    outcome: 'failed',
  });
  assert.equal(classifyDeepSeekApplyFailure(new Error('Harness is not connected')), 'service_unavailable');
  assert.equal(classifyDeepSeekApplyFailure(new Error('overrideTokens must return a disposer')), 'runtime_contract_rejected');
  assert.throws(
    () => trackDeepSeekEvent('theme_applied', {}),
    /unsupported DeepSeek analytics event/i,
  );
  assert.ok(Object.values(DEEPSEEK_ANALYTICS_EVENTS).includes('deepseek_theme_reverted'));
});
