import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PLATFORM_ID,
  EFFECT_CAPABILITY_STATES,
  PLATFORM_ACTION_SURFACES,
  PLATFORM_APPLY_MODES,
  PLATFORM_REGISTRY,
  getPlatform,
  getPlatformAction,
  normalizePlatformId,
  validatePlatformRegistry,
} from '../shared/platform-registry.js';

test('platform registry is internally valid and defaults to Codex', () => {
  assert.deepEqual(validatePlatformRegistry(), { valid: true, errors: [] });
  assert.equal(DEFAULT_PLATFORM_ID, 'codex');
  assert.equal(PLATFORM_REGISTRY.codex.defaultThemeId, 'codex');
  assert.equal(PLATFORM_REGISTRY.deepseek.defaultThemeId, 'deepseek-default');
  assert.equal(getPlatform().applyMode, PLATFORM_APPLY_MODES.COPY_IMPORT);
  assert.equal(normalizePlatformId('DeepSeek'), 'deepseek');
  assert.equal(normalizePlatformId('DeepSeek Harness'), 'deepseek');
  assert.equal(normalizePlatformId('t3-code'), 't3code');
  assert.equal(normalizePlatformId('../deepseek'), null);
  assert.equal(normalizePlatformId('deepseek?surface=installed'), null);
});

test('host contracts are distinct from delivered surface actions', () => {
  assert.equal(PLATFORM_REGISTRY.deepseek.contract.directApply, true);
  assert.equal(PLATFORM_REGISTRY.deepseek.contract.revert, true);
  assert.equal(PLATFORM_REGISTRY.deepseek.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
  assert.equal(PLATFORM_REGISTRY.deepseek.actions.installed.mode, PLATFORM_APPLY_MODES.DIRECT);
  assert.equal(PLATFORM_REGISTRY.deepseek.actions.installed.supportsRevert, true);

  assert.equal(PLATFORM_REGISTRY.pi.contract.directApply, true);
  assert.equal(PLATFORM_REGISTRY.pi.contract.revert, true);
  assert.equal(PLATFORM_REGISTRY.pi.delivered, false);
  assert.equal(PLATFORM_REGISTRY.pi.status, 'coming_soon');
  assert.equal(PLATFORM_REGISTRY.pi.descriptorCopy, 'Pi themes.');
  assert.equal(PLATFORM_REGISTRY.pi.actions.website.mode, PLATFORM_APPLY_MODES.UNAVAILABLE);
  assert.equal(PLATFORM_REGISTRY.pi.actions.website.ctaLabel, 'Coming soon');
  assert.equal(PLATFORM_REGISTRY.pi.actions.installed, undefined);

  assert.equal(PLATFORM_REGISTRY.t3code.actions.website.mode, PLATFORM_APPLY_MODES.UNAVAILABLE);
  assert.equal(PLATFORM_REGISTRY.conductor.actions.website.mode, PLATFORM_APPLY_MODES.UNAVAILABLE);
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
  assert.equal(PLATFORM_REGISTRY.gemini.actions.website.delivered, true);
  assert.equal(PLATFORM_REGISTRY.gemini.actions.website.mode, PLATFORM_APPLY_MODES.SETUP);
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
  assert.equal(PLATFORM_REGISTRY.gemini.effectCapabilities.gradients, EFFECT_CAPABILITY_STATES.RESTRICTED);
  assert.equal(PLATFORM_REGISTRY.qwen.effectCapabilities.gradients, EFFECT_CAPABILITY_STATES.EXPERIMENTAL);
  assert.equal(PLATFORM_REGISTRY.cursor.effectCapabilities.alpha, EFFECT_CAPABILITY_STATES.SUPPORTED);
  assert.equal(PLATFORM_REGISTRY.t3code.effectCapabilities.solid, EFFECT_CAPABILITY_STATES.UNKNOWN);
  assert.equal(PLATFORM_REGISTRY.conductor.effectCapabilities.animation, EFFECT_CAPABILITY_STATES.UNKNOWN);
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
