import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PLATFORM_EFFECT_DECISIONS,
  PLATFORM_EFFECT_INTENT_MAX_BYTES,
  PlatformEffectIntentValidationError,
  resolvePlatformEffectIntent,
  validatePlatformEffectIntent,
} from '../shared/platform-effect-intent.js';

function gradientIntent(overrides = {}) {
  return {
    version: 'dexthemes-effect-intent-v1',
    kind: 'gradient',
    params: {
      direction: 'horizontal',
      stops: [
        { offset: 0, colorSlot: 'surface' },
        { offset: 1, colorSlot: 'accent' },
      ],
    },
    solidFallback: { colorSlot: 'accent' },
    highContrastFallback: { foregroundSlot: 'ink', backgroundSlot: 'surface' },
    reducedMotionFallback: { colorSlot: 'accent' },
    ...overrides,
  };
}

function alphaIntent(overrides = {}) {
  return {
    version: 'dexthemes-effect-intent-v1',
    kind: 'alpha',
    params: { colorSlot: 'surface', opacity: 0.72 },
    solidFallback: { colorSlot: 'surface' },
    highContrastFallback: { foregroundSlot: 'ink', backgroundSlot: 'surface' },
    reducedMotionFallback: { colorSlot: 'surface' },
    ...overrides,
  };
}

function blurIntent(overrides = {}) {
  return {
    version: 'dexthemes-effect-intent-v1',
    kind: 'blur',
    params: { colorSlot: 'surface', appearance: 'blurred' },
    solidFallback: { colorSlot: 'surface' },
    highContrastFallback: { foregroundSlot: 'ink', backgroundSlot: 'surface' },
    reducedMotionFallback: { colorSlot: 'surface' },
    ...overrides,
  };
}

test('documented restricted effects resolve to safe preview view models only', () => {
  const zedAlpha = resolvePlatformEffectIntent('zed', alphaIntent());
  assert.equal(zedAlpha.decision, PLATFORM_EFFECT_DECISIONS.PREVIEW_INTENT);
  assert.equal(zedAlpha.capability, 'supported_with_restrictions');
  assert.deepEqual(zedAlpha.preview, {
    version: 'dexthemes-effect-preview-v1',
    kind: 'alpha',
    colorSlot: 'surface',
    opacity: 0.72,
  });
  assert.equal(JSON.stringify(zedAlpha).includes('rgba('), false);

  assert.equal(resolvePlatformEffectIntent('zed', blurIntent()).decision, 'preview_intent');
  assert.equal(resolvePlatformEffectIntent('cursor', alphaIntent()).decision, 'preview_intent');
});

test('unknown, experimental, and unsupported capabilities omit the effect deterministically', () => {
  const unsupported = resolvePlatformEffectIntent('codex', gradientIntent());
  assert.deepEqual(unsupported.preview, {
    version: 'dexthemes-effect-preview-v1',
    kind: 'solid',
    colorSlot: 'accent',
  });
  assert.deepEqual(unsupported.omittedEffect, {
    kind: 'gradient',
    capability: 'unsupported',
    reason: 'unsupported',
  });

  const experimental = resolvePlatformEffectIntent('qwen', gradientIntent());
  assert.equal(experimental.decision, PLATFORM_EFFECT_DECISIONS.SOLID_FALLBACK);
  assert.equal(experimental.omittedEffect.reason, 'experimental_disabled');

  const unknown = resolvePlatformEffectIntent('t3code', gradientIntent());
  assert.equal(unknown.decision, PLATFORM_EFFECT_DECISIONS.SOLID_FALLBACK);
  assert.equal(unknown.omittedEffect.reason, 'unknown_disabled');
});

test('required accessibility fallbacks are enforced and preferences choose them', () => {
  const missing = gradientIntent();
  delete missing.reducedMotionFallback;
  assert.match(
    validatePlatformEffectIntent(missing).errors.join('\n'),
    /reducedMotionFallback is required/,
  );

  const reduced = resolvePlatformEffectIntent('zed', alphaIntent(), {
    highContrast: false,
    prefersReducedMotion: true,
  });
  assert.equal(reduced.decision, PLATFORM_EFFECT_DECISIONS.REDUCED_MOTION_FALLBACK);
  assert.equal(reduced.omittedEffect.reason, 'reduced_motion_requested');
  assert.deepEqual(reduced.preview, {
    version: 'dexthemes-effect-preview-v1',
    kind: 'solid',
    colorSlot: 'surface',
  });

  const contrast = resolvePlatformEffectIntent('zed', blurIntent(), {
    highContrast: true,
    prefersReducedMotion: false,
  });
  assert.equal(contrast.decision, PLATFORM_EFFECT_DECISIONS.HIGH_CONTRAST_FALLBACK);
  assert.deepEqual(contrast.preview, {
    version: 'dexthemes-effect-preview-v1',
    kind: 'high_contrast_pair',
    foregroundSlot: 'ink',
    backgroundSlot: 'surface',
  });
});

test('unknown keys and unbounded style-like values are rejected', () => {
  const unknownRoot = gradientIntent({ selector: 'body *' });
  assert.match(validatePlatformEffectIntent(unknownRoot).errors.join('\n'), /intent.selector is not allowed/);

  const arbitraryColor = alphaIntent({
    params: { colorSlot: 'url(data:text/css,bad)', opacity: 0.5 },
  });
  assert.match(validatePlatformEffectIntent(arbitraryColor).errors.join('\n'), /known theme color slot/);

  const unknownParams = blurIntent({
    params: { colorSlot: 'surface', appearance: 'blurred', backdropFilter: 'blur(99px)' },
  });
  assert.match(validatePlatformEffectIntent(unknownParams).errors.join('\n'), /backdropFilter is not allowed/);
});

test('gradient, alpha, and blur bounds fail closed', () => {
  const badGradient = gradientIntent({
    params: {
      direction: '135deg',
      stops: [
        { offset: 0.2, colorSlot: 'surface' },
        { offset: 1.1, colorSlot: 'accent' },
      ],
    },
  });
  const gradientErrors = validatePlatformEffectIntent(badGradient).errors.join('\n');
  assert.match(gradientErrors, /supported gradient direction/);
  assert.match(gradientErrors, /begin at offset 0/);
  assert.match(gradientErrors, /finite number from 0 to 1/);

  assert.match(
    validatePlatformEffectIntent(alphaIntent({ params: { colorSlot: 'surface', opacity: 0.01 } })).errors.join('\n'),
    /finite number from 0.2 to 1/,
  );
  assert.match(
    validatePlatformEffectIntent(blurIntent({ params: { colorSlot: 'surface', appearance: 'glass(20px)' } })).errors.join('\n'),
    /supported blur appearance/,
  );
});

test('oversized or non-serializable intents are rejected before resolution', () => {
  const oversized = gradientIntent({
    version: `dexthemes-effect-intent-v1${'x'.repeat(PLATFORM_EFFECT_INTENT_MAX_BYTES)}`,
  });
  const validation = validatePlatformEffectIntent(oversized);
  assert.equal(validation.valid, false);
  assert.match(validation.errors[0], /exceeds 2048 bytes/);
  assert.throws(
    () => resolvePlatformEffectIntent('antigravity', oversized),
    (error) => error instanceof PlatformEffectIntentValidationError
      && error.code === 'platform_effect_intent_invalid',
  );

  const cyclic = gradientIntent();
  cyclic.self = cyclic;
  assert.match(validatePlatformEffectIntent(cyclic).errors[0], /exceeds 2048 bytes/);
});
