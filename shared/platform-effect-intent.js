import {
  EFFECT_CAPABILITY_STATES,
  getPlatform,
  normalizePlatformId,
} from './platform-registry.js';

export const PLATFORM_EFFECT_INTENT_VERSION = 'dexthemes-effect-intent-v1';
export const PLATFORM_EFFECT_PREVIEW_VERSION = 'dexthemes-effect-preview-v1';
export const PLATFORM_EFFECT_INTENT_MAX_BYTES = 2048;

export const PLATFORM_EFFECT_INTENT_KINDS = Object.freeze({
  GRADIENT: 'gradient',
  ALPHA: 'alpha',
  BLUR: 'blur',
});

export const PLATFORM_EFFECT_DECISIONS = Object.freeze({
  PREVIEW_INTENT: 'preview_intent',
  SOLID_FALLBACK: 'solid_fallback',
  HIGH_CONTRAST_FALLBACK: 'high_contrast_fallback',
  REDUCED_MOTION_FALLBACK: 'reduced_motion_fallback',
});

export const PLATFORM_EFFECT_OMISSION_REASONS = Object.freeze({
  UNSUPPORTED: 'unsupported',
  UNKNOWN_DISABLED: 'unknown_disabled',
  EXPERIMENTAL_DISABLED: 'experimental_disabled',
  HIGH_CONTRAST: 'high_contrast_requested',
  REDUCED_MOTION: 'reduced_motion_requested',
});

export const THEME_COLOR_SLOTS = Object.freeze([
  'surface',
  'ink',
  'accent',
  'sidebar',
  'codeBg',
  'diffAdded',
  'diffRemoved',
  'skill',
]);

export const GRADIENT_DIRECTIONS = Object.freeze([
  'horizontal',
  'vertical',
  'diagonal_down',
  'diagonal_up',
]);

export const BLUR_APPEARANCES = Object.freeze([
  'transparent',
  'blurred',
]);

const ROOT_KEYS = Object.freeze([
  'version',
  'kind',
  'params',
  'solidFallback',
  'highContrastFallback',
  'reducedMotionFallback',
]);
const SOLID_FALLBACK_KEYS = Object.freeze(['colorSlot']);
const HIGH_CONTRAST_FALLBACK_KEYS = Object.freeze(['foregroundSlot', 'backgroundSlot']);
const GRADIENT_PARAM_KEYS = Object.freeze(['direction', 'stops']);
const GRADIENT_STOP_KEYS = Object.freeze(['offset', 'colorSlot']);
const ALPHA_PARAM_KEYS = Object.freeze(['colorSlot', 'opacity']);
const BLUR_PARAM_KEYS = Object.freeze(['colorSlot', 'appearance']);
const PREFERENCE_KEYS = Object.freeze(['highContrast', 'prefersReducedMotion']);
const MIN_ALPHA = 0.2;
const MAX_ALPHA = 1;
const MIN_GRADIENT_STOPS = 2;
const MAX_GRADIENT_STOPS = 4;

const KIND_TO_CAPABILITY = Object.freeze({
  [PLATFORM_EFFECT_INTENT_KINDS.GRADIENT]: 'gradients',
  [PLATFORM_EFFECT_INTENT_KINDS.ALPHA]: 'alpha',
  [PLATFORM_EFFECT_INTENT_KINDS.BLUR]: 'blur',
});

export class PlatformEffectIntentValidationError extends TypeError {
  constructor(errors) {
    super(errors[0] || 'The platform effect intent is invalid.');
    this.name = 'PlatformEffectIntentValidationError';
    this.code = 'platform_effect_intent_invalid';
    this.errors = Object.freeze([...errors]);
  }
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function byteLength(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string'
      ? new TextEncoder().encode(serialized).byteLength
      : Number.POSITIVE_INFINITY;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function validateExactObject(value, path, allowedKeys, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${path} must be a plain object.`);
    return false;
  }

  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${path}.${key} is not allowed.`);
  }
  for (const key of allowedKeys) {
    if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required.`);
  }
  return true;
}

function validateColorSlot(value, path, errors) {
  if (!THEME_COLOR_SLOTS.includes(value)) errors.push(`${path} must be a known theme color slot.`);
}

function validateFallbacks(value, errors) {
  if (validateExactObject(value.solidFallback, 'solidFallback', SOLID_FALLBACK_KEYS, errors)) {
    validateColorSlot(value.solidFallback.colorSlot, 'solidFallback.colorSlot', errors);
  }
  if (validateExactObject(
    value.highContrastFallback,
    'highContrastFallback',
    HIGH_CONTRAST_FALLBACK_KEYS,
    errors,
  )) {
    validateColorSlot(
      value.highContrastFallback.foregroundSlot,
      'highContrastFallback.foregroundSlot',
      errors,
    );
    validateColorSlot(
      value.highContrastFallback.backgroundSlot,
      'highContrastFallback.backgroundSlot',
      errors,
    );
    if (value.highContrastFallback.foregroundSlot === value.highContrastFallback.backgroundSlot) {
      errors.push('highContrastFallback foreground and background slots must differ.');
    }
  }
  if (validateExactObject(
    value.reducedMotionFallback,
    'reducedMotionFallback',
    SOLID_FALLBACK_KEYS,
    errors,
  )) {
    validateColorSlot(
      value.reducedMotionFallback.colorSlot,
      'reducedMotionFallback.colorSlot',
      errors,
    );
  }
}

function validateGradientParams(params, errors) {
  if (!validateExactObject(params, 'params', GRADIENT_PARAM_KEYS, errors)) return;
  if (!GRADIENT_DIRECTIONS.includes(params.direction)) {
    errors.push('params.direction must be a supported gradient direction.');
  }
  if (!Array.isArray(params.stops)) {
    errors.push('params.stops must be an array.');
    return;
  }
  if (params.stops.length < MIN_GRADIENT_STOPS || params.stops.length > MAX_GRADIENT_STOPS) {
    errors.push(`params.stops must contain ${MIN_GRADIENT_STOPS}-${MAX_GRADIENT_STOPS} stops.`);
  }

  let previousOffset = -1;
  params.stops.forEach((stop, index) => {
    const path = `params.stops[${index}]`;
    if (!validateExactObject(stop, path, GRADIENT_STOP_KEYS, errors)) return;
    if (!Number.isFinite(stop.offset) || stop.offset < 0 || stop.offset > 1) {
      errors.push(`${path}.offset must be a finite number from 0 to 1.`);
    } else if (stop.offset <= previousOffset) {
      errors.push('params.stops offsets must be strictly increasing.');
    }
    previousOffset = stop.offset;
    validateColorSlot(stop.colorSlot, `${path}.colorSlot`, errors);
  });
  if (params.stops.length >= MIN_GRADIENT_STOPS) {
    if (params.stops[0]?.offset !== 0) errors.push('params.stops must begin at offset 0.');
    if (params.stops.at(-1)?.offset !== 1) errors.push('params.stops must end at offset 1.');
  }
}

function validateAlphaParams(params, errors) {
  if (!validateExactObject(params, 'params', ALPHA_PARAM_KEYS, errors)) return;
  validateColorSlot(params.colorSlot, 'params.colorSlot', errors);
  if (!Number.isFinite(params.opacity) || params.opacity < MIN_ALPHA || params.opacity > MAX_ALPHA) {
    errors.push(`params.opacity must be a finite number from ${MIN_ALPHA} to ${MAX_ALPHA}.`);
  }
}

function validateBlurParams(params, errors) {
  if (!validateExactObject(params, 'params', BLUR_PARAM_KEYS, errors)) return;
  validateColorSlot(params.colorSlot, 'params.colorSlot', errors);
  if (!BLUR_APPEARANCES.includes(params.appearance)) {
    errors.push('params.appearance must be a supported blur appearance.');
  }
}

function freezeIntent(value) {
  let params;
  if (value.kind === PLATFORM_EFFECT_INTENT_KINDS.GRADIENT) {
    params = Object.freeze({
      direction: value.params.direction,
      stops: Object.freeze(value.params.stops.map((stop) => Object.freeze({ ...stop }))),
    });
  } else {
    params = Object.freeze({ ...value.params });
  }

  return Object.freeze({
    version: PLATFORM_EFFECT_INTENT_VERSION,
    kind: value.kind,
    params,
    solidFallback: Object.freeze({ ...value.solidFallback }),
    highContrastFallback: Object.freeze({ ...value.highContrastFallback }),
    reducedMotionFallback: Object.freeze({ ...value.reducedMotionFallback }),
  });
}

export function validatePlatformEffectIntent(value) {
  const errors = [];
  const size = byteLength(value);
  if (size > PLATFORM_EFFECT_INTENT_MAX_BYTES) {
    errors.push(`Effect intent exceeds ${PLATFORM_EFFECT_INTENT_MAX_BYTES} bytes.`);
  }

  if (!validateExactObject(value, 'intent', ROOT_KEYS, errors)) {
    return Object.freeze({ valid: false, errors: Object.freeze(errors), value: null });
  }
  if (value.version !== PLATFORM_EFFECT_INTENT_VERSION) {
    errors.push(`intent.version must be ${PLATFORM_EFFECT_INTENT_VERSION}.`);
  }
  if (!Object.values(PLATFORM_EFFECT_INTENT_KINDS).includes(value.kind)) {
    errors.push('intent.kind must be a supported effect intent kind.');
  }

  validateFallbacks(value, errors);
  if (value.kind === PLATFORM_EFFECT_INTENT_KINDS.GRADIENT) validateGradientParams(value.params, errors);
  if (value.kind === PLATFORM_EFFECT_INTENT_KINDS.ALPHA) validateAlphaParams(value.params, errors);
  if (value.kind === PLATFORM_EFFECT_INTENT_KINDS.BLUR) validateBlurParams(value.params, errors);

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    value: errors.length === 0 ? freezeIntent(value) : null,
  });
}

function normalizePreferences(preferences) {
  const errors = [];
  if (!validateExactObject(preferences, 'preferences', PREFERENCE_KEYS, errors)) {
    throw new PlatformEffectIntentValidationError(errors);
  }
  for (const key of PREFERENCE_KEYS) {
    if (typeof preferences[key] !== 'boolean') errors.push(`preferences.${key} must be boolean.`);
  }
  if (errors.length) throw new PlatformEffectIntentValidationError(errors);
  return Object.freeze({ ...preferences });
}

function makeSolidPreview(colorSlot) {
  return Object.freeze({
    version: PLATFORM_EFFECT_PREVIEW_VERSION,
    kind: 'solid',
    colorSlot,
  });
}

function makeHighContrastPreview(fallback) {
  return Object.freeze({
    version: PLATFORM_EFFECT_PREVIEW_VERSION,
    kind: 'high_contrast_pair',
    foregroundSlot: fallback.foregroundSlot,
    backgroundSlot: fallback.backgroundSlot,
  });
}

function makeEffectPreview(intent) {
  if (intent.kind === PLATFORM_EFFECT_INTENT_KINDS.GRADIENT) {
    return Object.freeze({
      version: PLATFORM_EFFECT_PREVIEW_VERSION,
      kind: intent.kind,
      direction: intent.params.direction,
      stops: Object.freeze(intent.params.stops.map((stop) => Object.freeze({ ...stop }))),
    });
  }
  if (intent.kind === PLATFORM_EFFECT_INTENT_KINDS.ALPHA) {
    return Object.freeze({
      version: PLATFORM_EFFECT_PREVIEW_VERSION,
      kind: intent.kind,
      colorSlot: intent.params.colorSlot,
      opacity: intent.params.opacity,
    });
  }
  return Object.freeze({
    version: PLATFORM_EFFECT_PREVIEW_VERSION,
    kind: intent.kind,
    colorSlot: intent.params.colorSlot,
    appearance: intent.params.appearance,
  });
}

function omittedEffect(intent, capability, reason) {
  return Object.freeze({
    kind: intent.kind,
    capability,
    reason,
  });
}

function fallbackDecision(platformId, intent, capability, decision, reason, preview) {
  return Object.freeze({
    platformId,
    decision,
    capability,
    preview,
    omittedEffect: omittedEffect(intent, capability, reason),
  });
}

export function resolvePlatformEffectIntent(
  platformId,
  value,
  preferences = { highContrast: false, prefersReducedMotion: false },
) {
  const normalizedPlatformId = normalizePlatformId(platformId);
  if (!normalizedPlatformId) {
    throw new PlatformEffectIntentValidationError(['platformId must be a known canonical platform id.']);
  }
  const validation = validatePlatformEffectIntent(value);
  if (!validation.valid) throw new PlatformEffectIntentValidationError(validation.errors);
  const intent = validation.value;
  const normalizedPreferences = normalizePreferences(preferences);
  const platform = getPlatform(normalizedPlatformId);
  const capability = platform.effectCapabilities[KIND_TO_CAPABILITY[intent.kind]];

  if (normalizedPreferences.highContrast) {
    return fallbackDecision(
      normalizedPlatformId,
      intent,
      capability,
      PLATFORM_EFFECT_DECISIONS.HIGH_CONTRAST_FALLBACK,
      PLATFORM_EFFECT_OMISSION_REASONS.HIGH_CONTRAST,
      makeHighContrastPreview(intent.highContrastFallback),
    );
  }
  if (normalizedPreferences.prefersReducedMotion) {
    return fallbackDecision(
      normalizedPlatformId,
      intent,
      capability,
      PLATFORM_EFFECT_DECISIONS.REDUCED_MOTION_FALLBACK,
      PLATFORM_EFFECT_OMISSION_REASONS.REDUCED_MOTION,
      makeSolidPreview(intent.reducedMotionFallback.colorSlot),
    );
  }

  if (
    capability === EFFECT_CAPABILITY_STATES.SUPPORTED
    || capability === EFFECT_CAPABILITY_STATES.RESTRICTED
  ) {
    return Object.freeze({
      platformId: normalizedPlatformId,
      decision: PLATFORM_EFFECT_DECISIONS.PREVIEW_INTENT,
      capability,
      preview: makeEffectPreview(intent),
      omittedEffect: null,
    });
  }

  const reason = capability === EFFECT_CAPABILITY_STATES.EXPERIMENTAL
    ? PLATFORM_EFFECT_OMISSION_REASONS.EXPERIMENTAL_DISABLED
    : capability === EFFECT_CAPABILITY_STATES.UNKNOWN
      ? PLATFORM_EFFECT_OMISSION_REASONS.UNKNOWN_DISABLED
      : PLATFORM_EFFECT_OMISSION_REASONS.UNSUPPORTED;
  return fallbackDecision(
    normalizedPlatformId,
    intent,
    capability,
    PLATFORM_EFFECT_DECISIONS.SOLID_FALLBACK,
    reason,
    makeSolidPreview(intent.solidFallback.colorSlot),
  );
}
