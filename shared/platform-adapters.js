import { buildCodexThemeImport, validateCodexThemeImport } from './codex-theme-contract.js';
import {
  buildDeepSeekCordisPayload,
  buildDeepSeekThemeTokens,
  isDeepSeekThemeEligible,
} from './deepseek-theme-contract.js';
import { getPlatform } from './platform-registry.js';

export const PLATFORM_ADAPTER_RESULT_KINDS = Object.freeze({
  COPY_IMPORT: 'copy_import',
  DIRECT_PAYLOAD: 'direct_payload',
  SETUP_REQUIRED: 'setup_required',
  UNAVAILABLE: 'unavailable',
});

export class PlatformAdapterUnavailableError extends Error {
  constructor(platformId, message) {
    super(message);
    this.name = 'PlatformAdapterUnavailableError';
    this.code = 'platform_adapter_unavailable';
    this.platformId = platformId;
  }
}

function freezeResult(value) {
  return Object.freeze(value);
}

function prepareCodex(theme, { variant = 'dark', accentIndex = 0 } = {}) {
  const validation = validateCodexThemeImport(theme, variant, accentIndex);
  if (!validation.valid) {
    throw new TypeError(validation.errors[0] || 'The selected Codex theme is invalid.');
  }
  const prepared = buildCodexThemeImport(theme, variant, accentIndex);
  return freezeResult({
    kind: PLATFORM_ADAPTER_RESULT_KINDS.COPY_IMPORT,
    platformId: 'codex',
    adapterVersion: getPlatform('codex').adapterVersion,
    variant,
    payload: prepared.importString,
    settingsUrl: 'codex://settings',
    reversible: false,
    unsupportedFields: Object.freeze(['effects']),
  });
}

function prepareDeepSeek(theme, { accent } = {}) {
  if (!isDeepSeekThemeEligible(theme)) {
    throw new TypeError('DeepSeek Harness requires complete valid light and dark palettes.');
  }
  const payload = buildDeepSeekCordisPayload(theme, { accent });
  return freezeResult({
    kind: PLATFORM_ADAPTER_RESULT_KINDS.DIRECT_PAYLOAD,
    platformId: 'deepseek',
    adapterVersion: getPlatform('deepseek').adapterVersion,
    variant: 'paired',
    payload,
    previewTokens: buildDeepSeekThemeTokens(theme, { accent }),
    reversible: true,
    unsupportedFields: Object.freeze(['fonts', 'effects']),
  });
}

const IMPLEMENTED_ADAPTERS = Object.freeze({
  codex: Object.freeze({
    platformId: 'codex',
    validate(theme, options) {
      const result = validateCodexThemeImport(theme, options?.variant || 'dark', options?.accentIndex || 0);
      return freezeResult({ valid: result.valid, errors: Object.freeze(result.errors || []) });
    },
    prepare: prepareCodex,
  }),
  deepseek: Object.freeze({
    platformId: 'deepseek',
    validate(theme) {
      try {
        buildDeepSeekThemeTokens(theme);
        return freezeResult({ valid: true, errors: Object.freeze([]) });
      } catch (error) {
        return freezeResult({ valid: false, errors: Object.freeze([error.message]) });
      }
    },
    prepare: prepareDeepSeek,
  }),
});

export function getPlatformAdapter(platformId) {
  const platform = getPlatform(platformId);
  return IMPLEMENTED_ADAPTERS[platform.id] || null;
}

export function preparePlatformTheme(theme, platformId, options = {}) {
  const platform = getPlatform(platformId);
  const adapter = getPlatformAdapter(platform.id);
  if (adapter) return adapter.prepare(theme, options);

  const action = platform.actions?.website;
  if (action?.mode === 'setup' && action.delivered) {
    return freezeResult({
      kind: PLATFORM_ADAPTER_RESULT_KINDS.SETUP_REQUIRED,
      platformId: platform.id,
      adapterVersion: platform.adapterVersion,
      payload: null,
      destination: action.destination || null,
      reversible: false,
      unsupportedFields: Object.freeze(['directApply', 'effects']),
    });
  }

  throw new PlatformAdapterUnavailableError(
    platform.id,
    `${platform.displayName} does not have a delivered DexThemes adapter on this surface.`,
  );
}
