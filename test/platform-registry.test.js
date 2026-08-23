import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PLATFORM_ID,
  PLATFORM_ADAPTER_CAPABILITIES,
  PLATFORM_ADAPTER_DISPOSITIONS,
  PLATFORM_ADAPTER_EVIDENCE,
  PLATFORM_ADAPTER_VERIFICATION,
  EFFECT_CAPABILITY_STATES,
  PLATFORM_ACTION_SURFACES,
  PLATFORM_APPLY_MODES,
  PLATFORM_IDS,
  PLATFORM_REGISTRY,
  WEBSITE_PLATFORM_IDS,
  getPlatform,
  getPlatformAction,
  getPlatformIdsForAdapterDerivation,
  normalizePlatformId,
  validatePlatformRegistry,
} from '../shared/platform-registry.js';

test('platform registry is internally valid and defaults to a decisively verified harness', () => {
  assert.deepEqual(validatePlatformRegistry(), { valid: true, errors: [] });
  assert.equal(DEFAULT_PLATFORM_ID, 'deepseek');
  assert.equal(PLATFORM_REGISTRY.codex.defaultThemeId, 'codex');
  assert.equal(PLATFORM_REGISTRY.deepseek.defaultThemeId, 'deepseek-default');
  assert.deepEqual(
    Object.fromEntries(Object.entries(PLATFORM_REGISTRY).map(([id, platform]) => [id, platform.defaultThemeId])),
    {
      codex: 'codex',
      deepseek: 'deepseek-default',
      claude: 'quiet-anthracite',
      antigravity: 'orbital-ink',
      qwen: 'jade-relay',
      opencode: 'carbon-current',
      pi: 'copper-loop',
      zed: 'razor-mint',
      cursor: 'kinetic-violet',
      t3code: 'magenta-stack',
      conductor: 'midnight-switchyard',
      grok: 'signal-horizon',
    },
  );
  assert.deepEqual(PLATFORM_IDS, [
    'codex',
    'deepseek',
    'claude',
    'antigravity',
    'qwen',
    'opencode',
    'pi',
    'zed',
    'cursor',
    't3code',
    'conductor',
    'grok',
  ]);
  assert.equal(getPlatform().applyMode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(PLATFORM_REGISTRY.antigravity.displayName, 'Google Antigravity');
  assert.equal(PLATFORM_REGISTRY.antigravity.shortName, 'Antigravity');
  assert.equal(PLATFORM_REGISTRY.antigravity.status, 'coming_soon');
  assert.equal(PLATFORM_REGISTRY.antigravity.adapterVersion, 'unavailable-v1');
  assert.equal(PLATFORM_REGISTRY.antigravity.contract.directApply, false);
  assert.equal(normalizePlatformId('DeepSeek'), 'deepseek');
  assert.equal(normalizePlatformId('DeepSeek Harness'), 'deepseek');
  assert.equal(normalizePlatformId('Google Antigravity'), 'antigravity');
  assert.equal(normalizePlatformId('t3-code'), 't3code');
  assert.equal(normalizePlatformId('Grok Build'), 'grok');
  assert.equal(normalizePlatformId('../deepseek'), null);
  assert.equal(normalizePlatformId('deepseek?surface=installed'), null);
});

test('normal website selection contains only integrations with all three loaded proofs', () => {
  assert.deepEqual(WEBSITE_PLATFORM_IDS, ['codex', 'deepseek', 'opencode', 'pi', 'cursor', 't3code']);
  for (const platformId of WEBSITE_PLATFORM_IDS) {
    assert.deepEqual(PLATFORM_REGISTRY[platformId].integrationProof, {
      state: 'verified', mcp: true, mutation: true, restore: true,
      statusCopy: PLATFORM_REGISTRY[platformId].integrationProof.statusCopy,
      userAction: PLATFORM_REGISTRY[platformId].integrationProof.userAction,
    });
  }
  assert.deepEqual(
    Object.fromEntries(PLATFORM_IDS.map((id) => [id, {
      state: PLATFORM_REGISTRY[id].integrationProof.state,
      mcp: PLATFORM_REGISTRY[id].integrationProof.mcp,
      mutation: PLATFORM_REGISTRY[id].integrationProof.mutation,
      restore: PLATFORM_REGISTRY[id].integrationProof.restore,
    }])),
    {
      codex: { state: 'verified', mcp: true, mutation: true, restore: true },
      deepseek: { state: 'verified', mcp: true, mutation: true, restore: true },
      claude: { state: 'limited', mcp: false, mutation: true, restore: true },
      antigravity: { state: 'limited', mcp: true, mutation: false, restore: false },
      qwen: { state: 'limited', mcp: false, mutation: true, restore: true },
      opencode: { state: 'verified', mcp: true, mutation: true, restore: true },
      pi: { state: 'verified', mcp: true, mutation: true, restore: true },
      zed: { state: 'incomplete', mcp: false, mutation: false, restore: false },
      cursor: { state: 'verified', mcp: true, mutation: true, restore: true },
      t3code: { state: 'verified', mcp: true, mutation: true, restore: true },
      conductor: { state: 'incomplete', mcp: false, mutation: false, restore: false },
      grok: { state: 'limited', mcp: false, mutation: false, restore: false },
    },
  );
  assert.match(PLATFORM_REGISTRY.codex.integrationProof.statusCopy, /canonical DexThemes plugin/);
  assert.match(PLATFORM_REGISTRY.qwen.integrationProof.statusCopy, /no current model made a real DexThemes search invocation/);
  assert.match(PLATFORM_REGISTRY.conductor.integrationProof.statusCopy, /green discovery status, but no real DexThemes call completed/i);
});

test('platform registry exposes the authoritative 12-harness roster in order', () => {
  assert.deepEqual(PLATFORM_IDS, [
    'codex', 'deepseek', 'claude', 'antigravity', 'qwen', 'opencode', 'pi', 'zed',
    'cursor', 't3code', 'conductor', 'grok',
  ]);
  assert.equal(PLATFORM_REGISTRY.antigravity.displayName, 'Google Antigravity');
  assert.equal(PLATFORM_REGISTRY.zed.displayName, 'Zed');
  assert.equal(PLATFORM_REGISTRY.grok.displayName, 'Grok Build');
});

test('every harness declares a normalized adapter contract and registry-owned derivations', () => {
  const expectedCapabilities = {
    codex: PLATFORM_ADAPTER_CAPABILITIES.COPY_IMPORT,
    deepseek: PLATFORM_ADAPTER_CAPABILITIES.NATIVE_DIRECT_APPLY,
    claude: PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT,
    antigravity: PLATFORM_ADAPTER_CAPABILITIES.UNAVAILABLE,
    qwen: PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT,
    opencode: PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT,
    pi: PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT,
    zed: PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT,
    cursor: PLATFORM_ADAPTER_CAPABILITIES.REVIEW_ONLY_SOURCE,
    t3code: PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT,
    conductor: PLATFORM_ADAPTER_CAPABILITIES.UNAVAILABLE,
    grok: PLATFORM_ADAPTER_CAPABILITIES.LIMITED_EXPORT,
  };
  for (const platformId of PLATFORM_IDS) {
    const adapter = PLATFORM_REGISTRY[platformId].adapter;
    assert.equal(adapter.capability, expectedCapabilities[platformId], platformId);
    assert.ok(Object.values(PLATFORM_ADAPTER_DISPOSITIONS).includes(adapter.disposition), platformId);
    assert.ok(Object.values(PLATFORM_ADAPTER_EVIDENCE).includes(adapter.evidence.level), platformId);
    assert.ok(Object.values(PLATFORM_ADAPTER_VERIFICATION).includes(adapter.verification.mode), platformId);
    assert.equal(adapter.verification.writesHostConfig, false, platformId);
    assert.equal(typeof adapter.derivation.catalog, 'boolean', platformId);
    assert.equal(typeof adapter.derivation.themePack, 'boolean', platformId);
    assert.equal(typeof adapter.derivation.hostExport, 'boolean', platformId);
  }
  assert.deepEqual(getPlatformIdsForAdapterDerivation('hostExport'), [
    'claude', 'qwen', 'opencode', 'pi', 'zed', 'cursor', 't3code', 'grok',
  ]);
  assert.deepEqual(getPlatformIdsForAdapterDerivation('missing'), []);
});

test('DeepSeek native Apply/Revert and explicit unavailable adapter boundaries are declared', () => {
  const deepseek = PLATFORM_REGISTRY.deepseek.adapter;
  assert.equal(deepseek.evidence.level, PLATFORM_ADAPTER_EVIDENCE.NATIVE_RUNTIME);
  assert.deepEqual(deepseek.evidence.prerequisites, [
    'installed_harness_plugin', 'supported_theme_service', 'paired_theme_payload',
  ]);
  assert.equal(deepseek.verification.mode, PLATFORM_ADAPTER_VERIFICATION.NATIVE_APPLY_REVERT);
  for (const platformId of ['antigravity', 'conductor']) {
    const adapter = PLATFORM_REGISTRY[platformId].adapter;
    assert.equal(adapter.disposition, PLATFORM_ADAPTER_DISPOSITIONS.UNAVAILABLE, platformId);
    assert.equal(adapter.capability, PLATFORM_ADAPTER_CAPABILITIES.UNAVAILABLE, platformId);
    assert.equal(adapter.derivation.hostExport, false, platformId);
  }
});

test('host contracts are distinct from delivered surface actions', () => {
  assert.equal(PLATFORM_REGISTRY.deepseek.contract.directApply, true);
  assert.equal(PLATFORM_REGISTRY.deepseek.contract.revert, true);
  assert.equal(PLATFORM_REGISTRY.deepseek.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(PLATFORM_REGISTRY.deepseek.actions.installed.mode, PLATFORM_APPLY_MODES.DIRECT);
  assert.equal(PLATFORM_REGISTRY.deepseek.actions.installed.supportsRevert, true);

  assert.equal(PLATFORM_REGISTRY.pi.contract.directApply, false);
  assert.equal(PLATFORM_REGISTRY.pi.contract.revert, false);
  assert.equal(PLATFORM_REGISTRY.pi.delivered, true);
  assert.equal(PLATFORM_REGISTRY.pi.status, 'experimental');
  assert.equal(PLATFORM_REGISTRY.pi.descriptorCopy, 'Pi themes.');
  assert.equal(PLATFORM_REGISTRY.pi.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(PLATFORM_REGISTRY.pi.actions.installed, undefined);

  assert.equal(PLATFORM_REGISTRY.antigravity.actions.website.mode, PLATFORM_APPLY_MODES.UNAVAILABLE);
  assert.equal(PLATFORM_REGISTRY.antigravity.actions.website.delivered, false);
  assert.equal(PLATFORM_REGISTRY.antigravity.contract.preview, true);
  assert.equal(PLATFORM_REGISTRY.antigravity.contract.create, false);
  assert.equal(PLATFORM_REGISTRY.t3code.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(PLATFORM_REGISTRY.conductor.actions.website.mode, PLATFORM_APPLY_MODES.UNAVAILABLE);
  assert.equal(PLATFORM_REGISTRY.grok.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(PLATFORM_REGISTRY.grok.status, 'limited');
  assert.equal(PLATFORM_REGISTRY.grok.contract.mcp, false);
  assert.deepEqual(PLATFORM_REGISTRY.grok.themeSupport, {
    level: 'limited',
    label: 'Limited theme support',
    disclosure: 'The full DexThemes palette is preview-only. The export contains exactly five pager.toml color keys.',
  });
});

test('website action resolver never fabricates direct application', () => {
  for (const platformId of Object.keys(PLATFORM_REGISTRY)) {
    const websiteAction = getPlatformAction(platformId);
    assert.notEqual(websiteAction?.mode, PLATFORM_APPLY_MODES.DIRECT, `${platformId} website action`);
  }

  assert.equal(getPlatformAction('deepseek').mode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(
    getPlatformAction('deepseek', PLATFORM_ACTION_SURFACES.INSTALLED).mode,
    PLATFORM_APPLY_MODES.DIRECT,
  );
  assert.equal(getPlatformAction('pi', PLATFORM_ACTION_SURFACES.INSTALLED), null);
  assert.equal(getPlatformAction('deepseek', 'browser-extension'), null);
});

test('only setup actions expose real destinations', () => {
  for (const platform of Object.values(PLATFORM_REGISTRY)) {
    for (const action of Object.values(platform.actions)) {
      if (action.mode === PLATFORM_APPLY_MODES.SETUP) {
        assert.equal(action.destination.kind, 'url');
        assert.equal(new URL(action.destination.value).protocol, 'https:');
      } else {
        assert.equal(action.destination, undefined);
      }
    }
  }
  assert.match(
    PLATFORM_REGISTRY.deepseek.actions.website.destination.value,
    /@dexthemes\/deepseek-harness-plugin/,
  );
  assert.equal(PLATFORM_REGISTRY.claude.actions.website.delivered, true);
  assert.equal(PLATFORM_REGISTRY.claude.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
  assert.match(PLATFORM_REGISTRY.zed.actions.website.destination.value, /^https:\/\/zed\.dev\//);
  assert.equal(PLATFORM_REGISTRY.antigravity.actions.website.destination, undefined);
});

test('effects are explicit, typed, and always retain a solid fallback', () => {
  for (const platform of Object.values(PLATFORM_REGISTRY)) {
    assert.equal(platform.effectCapabilities.solidFallback, true);
    for (const [effect, state] of Object.entries(platform.effectCapabilities)) {
      if (effect === 'solidFallback') continue;
      assert.ok(Object.values(EFFECT_CAPABILITY_STATES).includes(state), `${platform.id}.${effect}`);
    }
  }

  assert.equal(PLATFORM_REGISTRY.deepseek.effectCapabilities.alpha, EFFECT_CAPABILITY_STATES.EXPERIMENTAL);
  assert.equal(PLATFORM_REGISTRY.antigravity.effectCapabilities.gradients, EFFECT_CAPABILITY_STATES.UNKNOWN);
  assert.equal(PLATFORM_REGISTRY.qwen.effectCapabilities.gradients, EFFECT_CAPABILITY_STATES.RESTRICTED);
  assert.equal(PLATFORM_REGISTRY.cursor.effectCapabilities.alpha, EFFECT_CAPABILITY_STATES.UNKNOWN);
  assert.equal(PLATFORM_REGISTRY.t3code.effectCapabilities.lightDarkPairs, EFFECT_CAPABILITY_STATES.SUPPORTED);
  assert.equal(PLATFORM_REGISTRY.conductor.effectCapabilities.animation, EFFECT_CAPABILITY_STATES.UNKNOWN);
  assert.equal(PLATFORM_REGISTRY.grok.effectCapabilities.solid, EFFECT_CAPABILITY_STATES.RESTRICTED);
  assert.equal(PLATFORM_REGISTRY.grok.effectCapabilities.alpha, EFFECT_CAPABILITY_STATES.UNSUPPORTED);
  assert.equal(PLATFORM_REGISTRY.grok.effectCapabilities.lightDarkPairs, EFFECT_CAPABILITY_STATES.RESTRICTED);
});

test('only the proven DeepSeek surface uses user-visible Apply or Revert wording', () => {
  for (const platform of Object.values(PLATFORM_REGISTRY)) {
    const userVisibleCopy = [
      platform.capabilityMessage,
      ...Object.values(platform.actions).flatMap((candidate) => [candidate.ctaLabel, candidate.helperText]),
    ].join('\n');
    if (platform.id === 'deepseek') {
      assert.match(userVisibleCopy, /\bApply\b/);
    } else {
      assert.doesNotMatch(userVisibleCopy, /\b(?:Apply|Revert)\b/i, platform.id);
    }
  }
});

test('validation rejects direct website actions and speculative setup destinations', () => {
  const malformedDirect = {
    ...PLATFORM_REGISTRY,
    deepseek: {
      ...PLATFORM_REGISTRY.deepseek,
      actions: {
        ...PLATFORM_REGISTRY.deepseek.actions,
        website: {
          ...PLATFORM_REGISTRY.deepseek.actions.website,
          mode: PLATFORM_APPLY_MODES.DIRECT,
        },
      },
      applyMode: PLATFORM_APPLY_MODES.DIRECT,
    },
  };
  assert.match(validatePlatformRegistry(malformedDirect).errors.join('\n'), /website actions cannot use direct mode/);

  const malformedSetup = {
    ...PLATFORM_REGISTRY,
    claude: {
      ...PLATFORM_REGISTRY.claude,
      actions: {
        website: {
          ...PLATFORM_REGISTRY.claude.actions.website,
          destination: { kind: 'url', value: 'javascript:alert(1)' },
        },
      },
    },
  };
  assert.match(validatePlatformRegistry(malformedSetup).errors.join('\n'), /setup mode requires a real HTTPS destination/);
});
