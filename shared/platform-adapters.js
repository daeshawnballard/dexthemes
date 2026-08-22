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
import {
  PLATFORM_ADAPTER_CAPABILITIES,
  PLATFORM_ADAPTER_DISPOSITIONS,
  PLATFORM_REGISTRY,
  getPlatform,
  normalizePlatformId,
} from './platform-registry.js';

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
  constructor(platformId, message, { reason = 'unrecognized_platform' } = {}) {
    super(message);
    this.name = 'PlatformAdapterUnavailableError';
    this.code = 'platform_adapter_unavailable';
    this.platformId = platformId;
    this.reason = reason;
  }
}

export class PlatformAdapterImplementationMissingError extends Error {
  constructor(platformId) {
    super(`The ${platformId} adapter is declared implemented but has no callable implementation.`);
    this.name = 'PlatformAdapterImplementationMissingError';
    this.code = 'platform_adapter_implementation_missing';
    this.platformId = platformId;
  }
}

export class PlatformAdapterContractViolationError extends Error {
  constructor(platformId, message) {
    super(message);
    this.name = 'PlatformAdapterContractViolationError';
    this.code = 'platform_adapter_contract_violation';
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

function getDeclaredPlatform(platformId, registry) {
  const normalizedPlatformId = normalizePlatformId(platformId);
  return normalizedPlatformId ? registry[normalizedPlatformId] || null : null;
}

function implementationState(contract, implementation) {
  if (contract.disposition === PLATFORM_ADAPTER_DISPOSITIONS.UNAVAILABLE) return 'not_required';
  return implementation ? 'present' : 'missing';
}

export function getPlatformAdapter(platformId, {
  registry = PLATFORM_REGISTRY,
  implementations = IMPLEMENTED_ADAPTERS,
} = {}) {
  const platform = getDeclaredPlatform(platformId, registry);
  if (!platform) return null;
  const implementation = implementations[platform.id] || null;
  return Object.freeze({
    platformId: platform.id,
    adapterVersion: platform.adapterVersion,
    ...platform.adapter,
    implementationState: implementationState(platform.adapter, implementation),
    ...(implementation || {}),
  });
}

const RESULT_KINDS_BY_CAPABILITY = Object.freeze({
  [PLATFORM_ADAPTER_CAPABILITIES.COPY_IMPORT]: Object.freeze([PLATFORM_ADAPTER_RESULT_KINDS.COPY_IMPORT]),
  [PLATFORM_ADAPTER_CAPABILITIES.NATIVE_DIRECT_APPLY]: Object.freeze([PLATFORM_ADAPTER_RESULT_KINDS.DIRECT_PAYLOAD]),
  [PLATFORM_ADAPTER_CAPABILITIES.MANUAL_EXPORT]: Object.freeze([
    PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT,
    PLATFORM_ADAPTER_RESULT_KINDS.PACKAGE_EXPORT,
  ]),
  [PLATFORM_ADAPTER_CAPABILITIES.REVIEW_ONLY_SOURCE]: Object.freeze([PLATFORM_ADAPTER_RESULT_KINDS.PACKAGE_SOURCE]),
  [PLATFORM_ADAPTER_CAPABILITIES.LIMITED_EXPORT]: Object.freeze([PLATFORM_ADAPTER_RESULT_KINDS.FILE_EXPORT]),
});

function assertPreparedResultMatchesContract(platform, adapter, prepared) {
  const expectedKinds = RESULT_KINDS_BY_CAPABILITY[adapter.capability] || [];
  if (!expectedKinds.includes(prepared?.kind)) {
    throw new PlatformAdapterContractViolationError(
      platform.id,
      `${platform.displayName} produced ${prepared?.kind || 'no result'}, which contradicts its ${adapter.capability} adapter contract.`,
    );
  }
  if (adapter.verification.writesHostConfig === false && prepared?.setup?.writesHostConfig === true) {
    throw new PlatformAdapterContractViolationError(
      platform.id,
      `${platform.displayName} adapter contract forbids host config writes.`,
    );
  }
  if (adapter.capability === PLATFORM_ADAPTER_CAPABILITIES.NATIVE_DIRECT_APPLY) {
    if (!platform.contract.directApply || !platform.contract.revert || prepared.reversible !== true) {
      throw new PlatformAdapterContractViolationError(
        platform.id,
        `${platform.displayName} direct adapter requires the declared native Apply/Revert contract.`,
      );
    }
  }
  if (adapter.capability === PLATFORM_ADAPTER_CAPABILITIES.REVIEW_ONLY_SOURCE
    && prepared.deliveryState !== 'review_only_source') {
    throw new PlatformAdapterContractViolationError(platform.id, 'Cursor must remain review-only source.');
  }
  if (adapter.capability === PLATFORM_ADAPTER_CAPABILITIES.LIMITED_EXPORT
    && prepared.deliveryState !== 'limited_export') {
    throw new PlatformAdapterContractViolationError(platform.id, 'Grok Build must remain a limited export.');
  }
  return prepared;
}

export function validatePlatformAdapterImplementations(
  registry = PLATFORM_REGISTRY,
  implementations = IMPLEMENTED_ADAPTERS,
) {
  const errors = [];
  for (const [platformId, platform] of Object.entries(registry)) {
    const implementation = implementations[platformId];
    if (platform.adapter?.disposition === PLATFORM_ADAPTER_DISPOSITIONS.IMPLEMENTED && !implementation) {
      errors.push(`${platformId}: declared implemented adapter is missing its callable implementation.`);
    }
    if (platform.adapter?.disposition === PLATFORM_ADAPTER_DISPOSITIONS.UNAVAILABLE && implementation) {
      errors.push(`${platformId}: declared unavailable adapter must not expose a callable implementation.`);
    }
    if (implementation && implementation.platformId !== platformId) {
      errors.push(`${platformId}: callable adapter platform id mismatch.`);
    }
  }
  return freezeResult({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function preparePlatformTheme(theme, platformId = 'codex', options = {}, dependencies = {}) {
  const normalizedPlatformId = normalizePlatformId(platformId);
  if (!normalizedPlatformId) {
    throw new PlatformAdapterUnavailableError(
      String(platformId ?? ''),
      'The requested platform id is not recognized.',
      { reason: 'unrecognized_platform' },
    );
  }
  const registry = dependencies.registry || PLATFORM_REGISTRY;
  const implementations = dependencies.implementations || IMPLEMENTED_ADAPTERS;
  const platform = getDeclaredPlatform(normalizedPlatformId, registry);
  if (!platform) {
    throw new PlatformAdapterUnavailableError(
      normalizedPlatformId,
      'The requested platform is not declared in this adapter registry.',
      { reason: 'undeclared_platform' },
    );
  }
  const adapter = getPlatformAdapter(platform.id, { registry, implementations });
  if (adapter.disposition === PLATFORM_ADAPTER_DISPOSITIONS.UNAVAILABLE) {
    throw new PlatformAdapterUnavailableError(
      platform.id,
      `${platform.displayName} is intentionally unavailable; no DexThemes adapter is declared for this host.`,
      { reason: 'declared_unavailable' },
    );
  }
  if (adapter.implementationState !== 'present' || typeof adapter.prepare !== 'function') {
    throw new PlatformAdapterImplementationMissingError(platform.id);
  }
  return assertPreparedResultMatchesContract(platform, adapter, adapter.prepare(theme, options));
}
