import { buildCodexThemeImport, validateCodexThemeImport } from './codex-theme-contract.js';
import {
  buildDeepSeekCordisPayload,
  buildDeepSeekThemeTokens,
  isDeepSeekThemeEligible,
} from './deepseek-theme-contract.js';
import {
  buildClaudeThemeExport,
  validateClaudeThemeExport,
} from './claude-theme-contract.js';
import {
  buildQwenThemeExport,
  validateQwenThemeExport,
} from './qwen-theme-contract.js';
import {
  buildOpenCodeThemeExport,
  validateOpenCodeThemeExport,
} from './opencode-theme-contract.js';
import {
  buildPiThemeExport,
  validatePiThemeExport,
} from './pi-theme-contract.js';
import {
  buildZedThemeExport,
  validateZedThemeExport,
} from './zed-theme-contract.js';
import {
  buildCursorThemeSource,
  validateCursorThemeExport,
} from './cursor-theme-contract.js';
import {
  buildT3CodeThemeExport,
  validateT3CodeThemeExport,
} from './t3code-theme-contract.js';
import {
  buildGrokPagerThemeExport,
  validateGrokPagerThemeExport,
} from './grok-pager-theme-contract.js';
import { getPlatform, normalizePlatformId } from './platform-registry.js';

export const PLATFORM_ADAPTER_RESULT_KINDS = Object.freeze({
  COPY_IMPORT: 'copy_import',
  DIRECT_PAYLOAD: 'direct_payload',
  FILE_EXPORT: 'file_export',
  PACKAGE_EXPORT: 'package_export',
  PACKAGE_SOURCE: 'package_source',
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

function prepareExport(builder, kind, theme, options) {
  return freezeResult({
    kind,
    payload: null,
    ...builder(theme, options),
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
  claude: Object.freeze({
    platformId: 'claude',
    validate: validateClaudeThemeExport,
    prepare(theme, options) {
      return prepareExport(buildClaudeThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, theme, options);
    },
  }),
  qwen: Object.freeze({
    platformId: 'qwen',
    validate: validateQwenThemeExport,
    prepare(theme, options) {
      return prepareExport(buildQwenThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, theme, options);
    },
  }),
  opencode: Object.freeze({
    platformId: 'opencode',
    validate: validateOpenCodeThemeExport,
    prepare(theme, options) {
      return prepareExport(buildOpenCodeThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, theme, options);
    },
  }),
  pi: Object.freeze({
    platformId: 'pi',
    validate: validatePiThemeExport,
    prepare(theme, options) {
      return prepareExport(buildPiThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.PACKAGE_EXPORT, theme, options);
    },
  }),
  zed: Object.freeze({
    platformId: 'zed',
    validate: validateZedThemeExport,
    prepare(theme, options) {
      return prepareExport(buildZedThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, theme, options);
    },
  }),
  cursor: Object.freeze({
    platformId: 'cursor',
    validate: validateCursorThemeExport,
    prepare(theme, options) {
      return prepareExport(buildCursorThemeSource, PLATFORM_ADAPTER_RESULT_KINDS.PACKAGE_SOURCE, theme, options);
    },
  }),
  t3code: Object.freeze({
    platformId: 't3code',
    validate: validateT3CodeThemeExport,
    prepare(theme, options) {
      return prepareExport(buildT3CodeThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, theme, options);
    },
  }),
  grok: Object.freeze({
    platformId: 'grok',
    validate: validateGrokPagerThemeExport,
    prepare(theme, options) {
      return prepareExport(buildGrokPagerThemeExport, PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT, theme, options);
    },
  }),
});

export function getPlatformAdapter(platformId) {
  const normalizedPlatformId = normalizePlatformId(platformId);
  return normalizedPlatformId ? IMPLEMENTED_ADAPTERS[normalizedPlatformId] || null : null;
}

export function preparePlatformTheme(theme, platformId = 'codex', options = {}) {
  const normalizedPlatformId = normalizePlatformId(platformId);
  if (!normalizedPlatformId) {
    throw new PlatformAdapterUnavailableError(
      String(platformId ?? ''),
      'The requested platform id is not recognized.',
    );
  }
  const platform = getPlatform(normalizedPlatformId);
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
