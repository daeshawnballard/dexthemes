export const PLATFORM_APPLY_MODES = Object.freeze({
  DIRECT: 'direct',
  COPY_IMPORT: 'copy_import',
  SETUP: 'setup',
  UNAVAILABLE: 'unavailable',
});

export const PLATFORM_ACTION_SURFACES = Object.freeze({
  WEBSITE: 'website',
  INSTALLED: 'installed',
});

export const PLATFORM_STATUSES = Object.freeze({
  SUPPORTED: 'supported',
  LIMITED: 'limited',
  EXPERIMENTAL: 'experimental',
  COMING_SOON: 'coming_soon',
});

export const PLATFORM_THEME_SUPPORT_LEVELS = Object.freeze({
  LIMITED: 'limited',
});

export const EFFECT_CAPABILITY_STATES = Object.freeze({
  SUPPORTED: 'supported',
  RESTRICTED: 'supported_with_restrictions',
  EXPERIMENTAL: 'experimental',
  UNSUPPORTED: 'unsupported',
  UNKNOWN: 'unknown',
});

const EFFECT_KEYS = Object.freeze([
  'solid',
  'alpha',
  'gradients',
  'glow',
  'shadows',
  'blur',
  'patterns',
  'images',
  'animation',
  'lightDarkPairs',
]);

const HOST_CONTRACT_DEFAULTS = Object.freeze({
  preview: true,
  create: true,
  prompt: true,
  mcp: true,
  api: true,
  directApply: false,
  revert: false,
});

const DEFAULT_EFFECT_CAPABILITIES = Object.freeze({
  solid: EFFECT_CAPABILITY_STATES.SUPPORTED,
  alpha: EFFECT_CAPABILITY_STATES.UNKNOWN,
  gradients: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  glow: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  shadows: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  blur: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  patterns: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  images: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  animation: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
  lightDarkPairs: EFFECT_CAPABILITY_STATES.SUPPORTED,
  solidFallback: true,
});

function effectCapabilities(overrides = {}) {
  return Object.freeze({
    ...DEFAULT_EFFECT_CAPABILITIES,
    ...overrides,
    // Every adapter must be able to reduce a richer DexThemes palette to
    // accessible solid colors. Unknown and experimental effects stay off.
    solidFallback: true,
  });
}

function action(surface, definition) {
  const destination = definition.destination
    ? Object.freeze({ ...definition.destination })
    : undefined;

  return Object.freeze({
    surface,
    mode: definition.mode,
    delivered: Boolean(definition.delivered),
    ctaLabel: definition.ctaLabel,
    helperText: definition.helperText,
    supportsRevert: Boolean(definition.supportsRevert),
    ...(destination ? { destination } : {}),
  });
}

function platform(definition) {
  const {
    contract: contractOverrides = {},
    actions: actionDefinitions,
    effectCapabilities: effectOverrides = {},
    effectNotes = {},
    themeSupport: themeSupportDefinition = null,
    ...metadata
  } = definition;
  const contract = Object.freeze({ ...HOST_CONTRACT_DEFAULTS, ...contractOverrides });
  const websiteAction = action(PLATFORM_ACTION_SURFACES.WEBSITE, actionDefinitions.website);
  const installedAction = actionDefinitions.installed
    ? action(PLATFORM_ACTION_SURFACES.INSTALLED, actionDefinitions.installed)
    : null;
  const actions = Object.freeze({
    website: websiteAction,
    ...(installedAction ? { installed: installedAction } : {}),
  });
  const delivered = websiteAction.delivered || Boolean(installedAction?.delivered);
  const setupUrl = websiteAction.destination?.kind === 'url'
    ? websiteAction.destination.value
    : null;

  return Object.freeze({
    ...metadata,
    contract,
    actions,
    delivered,
    effectCapabilities: effectCapabilities(effectOverrides),
    effectNotes: Object.freeze({ ...effectNotes }),
    themeSupport: themeSupportDefinition
      ? Object.freeze({ ...themeSupportDefinition })
      : null,

    // Backward-compatible website projections. New consumers should use
    // contract and getPlatformAction() so host support is never mistaken for
    // a website capability.
    applyMode: websiteAction.mode,
    ctaLabel: websiteAction.ctaLabel,
    ctaHelper: websiteAction.helperText,
    setupUrl,
    supportsPreview: contract.preview,
    supportsCreate: contract.create,
    supportsPromptCreation: contract.prompt,
    supportsMcp: contract.mcp,
    supportsApi: contract.api,
    supportsDirectApply: contract.directApply,
    supportsRevert: contract.revert,
  });
}

export const PLATFORM_REGISTRY = Object.freeze({
  codex: platform({
    id: 'codex',
    displayName: 'Codex',
    shortName: 'Codex',
    organizationName: 'OpenAI',
    defaultThemeId: 'codex',
    descriptorCopy: 'Codex themes.',
    footerAffiliationCopy: 'Not affiliated with OpenAI.',
    capabilityMessage: 'Copy this theme, then paste it in Codex Settings → Appearance.',
    status: PLATFORM_STATUSES.SUPPORTED,
    adapterVersion: 'codex-theme-v1',
    easterEggNamespace: 'codex',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.COPY_IMPORT,
        delivered: true,
        ctaLabel: 'Copy for Codex',
        helperText: 'Paste in Settings → Appearance.',
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
    },
  }),
  deepseek: platform({
    id: 'deepseek',
    displayName: 'DeepSeek Harness',
    shortName: 'DeepSeek',
    organizationName: 'DeepSeek',
    defaultThemeId: 'deepseek-default',
    descriptorCopy: 'DeepSeek themes.',
    footerAffiliationCopy: 'Not affiliated with DeepSeek.',
    capabilityMessage: 'Install the DexThemes plugin once, then Apply and Revert inside Harness.',
    status: PLATFORM_STATUSES.SUPPORTED,
    adapterVersion: 'deepseek-semantic-v1',
    pluginVersion: '0.6.4',
    easterEggNamespace: 'deepseek',
    contract: {
      directApply: true,
      revert: true,
    },
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'Install for DeepSeek',
        helperText: 'One-click Apply is available inside the installed Harness plugin.',
        destination: {
          kind: 'url',
          value: 'https://www.npmjs.com/package/@dexthemes/deepseek-harness-plugin',
        },
      },
      installed: {
        mode: PLATFORM_APPLY_MODES.DIRECT,
        delivered: true,
        ctaLabel: 'Apply to DeepSeek',
        helperText: 'Applies immediately through Harness’s supported theme service.',
        supportsRevert: true,
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.EXPERIMENTAL,
    },
    effectNotes: {
      alpha: 'ThemeRuntime accepts strings, but arbitrary alpha rendering is not a stable advertised token guarantee.',
    },
  }),
  claude: platform({
    id: 'claude',
    displayName: 'Claude Code',
    shortName: 'Claude',
    organizationName: 'Anthropic',
    defaultThemeId: 'quiet-anthracite',
    descriptorCopy: 'Claude themes.',
    footerAffiliationCopy: 'Not affiliated with Anthropic.',
    capabilityMessage: 'DexThemes exports separate Claude Code custom theme files; you copy and select one with /theme.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 'claude-theme-v1',
    easterEggNamespace: 'claude',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View Claude export setup',
        helperText: 'Dark and light are separate files; selection stays user-controlled.',
        destination: {
          kind: 'url',
          value: 'https://code.claude.com/docs/en/terminal-config#create-a-custom-theme',
        },
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
      animation: EFFECT_CAPABILITY_STATES.RESTRICTED,
      lightDarkPairs: EFFECT_CAPABILITY_STATES.RESTRICTED,
    },
    effectNotes: {
      animation: 'Only Claude Code’s fixed built-in shimmer and rainbow token colors are documented; arbitrary animation stays disabled.',
      lightDarkPairs: 'Custom light and dark themes are separate selections; automatic pairing is not documented.',
    },
  }),
  antigravity: platform({
    id: 'antigravity',
    displayName: 'Google Antigravity',
    shortName: 'Antigravity',
    organizationName: 'Google',
    defaultThemeId: 'orbital-ink',
    descriptorCopy: 'Google Antigravity themes.',
    footerAffiliationCopy: 'Not affiliated with Google.',
    capabilityMessage: 'Google Antigravity is preview-only because its stable theme payload, import path, write path, extension contribution point, and reversal contract are Unknown.',
    status: PLATFORM_STATUSES.COMING_SOON,
    adapterVersion: 'unavailable-v1',
    easterEggNamespace: 'antigravity',
    contract: {
      preview: true,
      create: false,
      prompt: false,
      mcp: false,
      api: false,
    },
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.UNAVAILABLE,
        delivered: false,
        ctaLabel: 'Coming soon',
        helperText: 'Preview collection only; no exporter, setup path, or plugin is exposed.',
      },
    },
    effectCapabilities: Object.fromEntries(EFFECT_KEYS.map((key) => [key, EFFECT_CAPABILITY_STATES.UNKNOWN])),
  }),
  qwen: platform({
    id: 'qwen',
    displayName: 'Qwen Code',
    shortName: 'Qwen',
    organizationName: 'Alibaba Cloud',
    defaultThemeId: 'jade-relay',
    descriptorCopy: 'Qwen themes.',
    footerAffiliationCopy: 'Not affiliated with Alibaba Cloud.',
    capabilityMessage: 'DexThemes exports separate Qwen Code custom-theme JSON files; Qwen has no theme-extension manifest seam.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 'qwen-theme-v1',
    easterEggNamespace: 'qwen',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View Qwen export setup',
        helperText: 'Review a file inside your home directory, then set ui.theme to its path.',
        destination: {
          kind: 'url',
          value: 'https://qwenlm.github.io/qwen-code-docs/en/users/configuration/themes/',
        },
      },
    },
    effectCapabilities: {
      gradients: EFFECT_CAPABILITY_STATES.RESTRICTED,
      lightDarkPairs: EFFECT_CAPABILITY_STATES.RESTRICTED,
    },
    effectNotes: {
      gradients: 'GradientColors is documented, but rendering remains bounded to that color array and lacks local runtime proof.',
      lightDarkPairs: 'Custom dark and light files are separate; Qwen auto mode does not bind a custom pair.',
    },
  }),
  opencode: platform({
    id: 'opencode',
    displayName: 'OpenCode',
    shortName: 'OpenCode',
    organizationName: 'SST',
    defaultThemeId: 'carbon-current',
    descriptorCopy: 'OpenCode themes.',
    footerAffiliationCopy: 'Not affiliated with OpenCode.',
    capabilityMessage: 'DexThemes exports one OpenCode JSON theme with paired light and dark color values.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 'opencode-theme-v1',
    easterEggNamespace: 'opencode',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View OpenCode export setup',
        helperText: 'Place the reviewed JSON in a supported themes folder, then choose it with /theme.',
        destination: {
          kind: 'url',
          value: 'https://opencode.ai/docs/themes/',
        },
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.RESTRICTED,
    },
    effectNotes: {
      alpha: 'The documented none value preserves terminal-default transparency; arbitrary alpha stays disabled.',
    },
  }),
  pi: platform({
    id: 'pi',
    displayName: 'Pi',
    shortName: 'Pi',
    organizationName: 'Pi',
    defaultThemeId: 'copper-loop',
    descriptorCopy: 'Pi themes.',
    footerAffiliationCopy: 'Not affiliated with Pi.',
    capabilityMessage: 'DexThemes exports a code-free Pi theme package with separate light and dark themes.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 'pi-theme-package-v1',
    easterEggNamespace: 'pi',
    contract: {
      preview: false,
      create: false,
      prompt: false,
      mcp: false,
      api: false,
      directApply: false,
      revert: false,
    },
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View Pi package setup',
        helperText: 'Review or install the code-free package, then select a theme in Pi.',
        destination: {
          kind: 'url',
          value: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/themes.md',
        },
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
    },
  }),
  zed: platform({
    id: 'zed',
    displayName: 'Zed',
    shortName: 'Zed',
    organizationName: 'Zed',
    defaultThemeId: 'razor-mint',
    descriptorCopy: 'Zed themes.',
    footerAffiliationCopy: 'Not affiliated with Zed.',
    capabilityMessage: 'DexThemes exports a local Zed JSON theme family with light and dark entries.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 'zed-theme-v1',
    easterEggNamespace: 'zed',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View Zed export setup',
        helperText: 'Place the reviewed family JSON in Zed’s local themes folder, then select it.',
        destination: {
          kind: 'url',
          value: 'https://zed.dev/docs/extensions/themes',
        },
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.RESTRICTED,
      blur: EFFECT_CAPABILITY_STATES.RESTRICTED,
    },
    effectNotes: {
      alpha: 'Zed documents transparent background colors.',
      blur: 'Blur is limited to Zed’s transparent or blurred background appearance setting.',
    },
  }),
  cursor: platform({
    id: 'cursor',
    displayName: 'Cursor',
    shortName: 'Cursor',
    organizationName: 'Anysphere',
    defaultThemeId: 'kinetic-violet',
    descriptorCopy: 'Cursor themes.',
    footerAffiliationCopy: 'Not affiliated with Anysphere.',
    capabilityMessage: 'DexThemes can export review-only VS Code color-theme source; Cursor installation and surface coverage remain unproven.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 'cursor-theme-source-v1',
    easterEggNamespace: 'cursor',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View Cursor theme docs',
        helperText: 'Published marketplace installation and Cursor runtime coverage are not yet proven.',
        destination: {
          kind: 'url',
          value: 'https://cursor.com/help/customization/themes',
        },
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.UNKNOWN,
      shadows: EFFECT_CAPABILITY_STATES.UNKNOWN,
      lightDarkPairs: EFFECT_CAPABILITY_STATES.RESTRICTED,
    },
    effectNotes: {
      alpha: 'Upstream VS Code formats accept alpha, but Cursor-specific rendering is not proven.',
      shadows: 'Cursor does not document theme shadow tokens or geometry; both remain disabled.',
      lightDarkPairs: 'Cursor documents independent light/dark selection and OS following, not custom pair binding.',
    },
  }),
  t3code: platform({
    id: 't3code',
    displayName: 'T3 Code',
    shortName: 'T3 Code',
    organizationName: 'T3 Tools',
    defaultThemeId: 'magenta-stack',
    descriptorCopy: 'T3 Code themes.',
    footerAffiliationCopy: 'Not affiliated with T3 Tools.',
    capabilityMessage: 'DexThemes exports stable v1 JSON; you import it in Settings → Appearance → Themes → Add theme.',
    status: PLATFORM_STATUSES.EXPERIMENTAL,
    adapterVersion: 't3-theme-v1',
    easterEggNamespace: 't3code',
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View T3 export setup',
        helperText: 'Download or copy the JSON, then import it with T3 Code’s Add theme control.',
        destination: {
          kind: 'url',
          value: 'https://github.com/pingdotgg/t3code/blob/c3e37094e04de71accf497c6110c5305223e0090/apps/web/src/components/settings/ThemeSettings.tsx#L849-L927',
        },
      },
    },
    effectCapabilities: {
      alpha: EFFECT_CAPABILITY_STATES.UNKNOWN,
      lightDarkPairs: EFFECT_CAPABILITY_STATES.SUPPORTED,
    },
    effectNotes: {
      alpha: 'T3 Code accepts literal CSS colors, but DexThemes emits six-digit solid colors only.',
      lightDarkPairs: 'The stable v1 variants object can carry the opposite appearance in one user-imported file.',
    },
  }),
  conductor: platform({
    id: 'conductor',
    displayName: 'Conductor',
    shortName: 'Conductor',
    organizationName: 'Melty Labs',
    defaultThemeId: 'midnight-switchyard',
    descriptorCopy: 'Conductor themes.',
    footerAffiliationCopy: 'Not affiliated with Melty Labs.',
    capabilityMessage: 'Conductor documents its built-in light/dark toggle, not custom theme application.',
    status: PLATFORM_STATUSES.COMING_SOON,
    adapterVersion: 'unavailable-v1',
    easterEggNamespace: 'conductor',
    contract: {
      preview: false,
      create: false,
      prompt: false,
      mcp: false,
      api: false,
    },
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.UNAVAILABLE,
        delivered: false,
        ctaLabel: 'Coming soon',
        helperText: 'No custom theme action is available.',
      },
    },
    effectCapabilities: Object.fromEntries(EFFECT_KEYS.map((key) => [key, EFFECT_CAPABILITY_STATES.UNKNOWN])),
  }),
  grok: platform({
    id: 'grok',
    displayName: 'Grok Build',
    shortName: 'Grok Build',
    organizationName: 'xAI',
    defaultThemeId: 'signal-horizon',
    descriptorCopy: 'Grok Build themes · Limited theme support.',
    footerAffiliationCopy: 'Not affiliated with xAI.',
    capabilityMessage: 'Limited support: DexThemes previews the complete palette and exports only the five documented pager.toml color overrides.',
    status: PLATFORM_STATUSES.LIMITED,
    adapterVersion: 'grok-pager-colors-v1',
    easterEggNamespace: 'grok',
    themeSupport: {
      level: PLATFORM_THEME_SUPPORT_LEVELS.LIMITED,
      label: 'Limited theme support',
      disclosure: 'The full DexThemes palette is preview-only. The export contains exactly five pager.toml color keys.',
    },
    contract: {
      create: false,
      prompt: false,
      mcp: false,
      api: false,
      directApply: false,
      revert: false,
    },
    actions: {
      website: {
        mode: PLATFORM_APPLY_MODES.SETUP,
        delivered: true,
        ctaLabel: 'View Grok limited color setup',
        helperText: 'Review and merge one exactly five-key pager.toml snippet manually, then restart Grok Build.',
        destination: {
          kind: 'url',
          value: 'https://github.com/xai-org/grok-build/blob/19d42e35c07a9c9244f03f6df0c4c353f970d4f9/crates/codegen/xai-grok-pager/docs/user-guide/05-configuration.md#appearance',
        },
      },
    },
    effectCapabilities: {
      ...Object.fromEntries(EFFECT_KEYS.map((key) => [key, EFFECT_CAPABILITY_STATES.UNKNOWN])),
      solid: EFFECT_CAPABILITY_STATES.RESTRICTED,
      alpha: EFFECT_CAPABILITY_STATES.UNSUPPORTED,
      lightDarkPairs: EFFECT_CAPABILITY_STATES.RESTRICTED,
    },
    effectNotes: {
      solid: 'Only five documented pager colors are emitted; the complete DexThemes preview is not a runtime payload.',
      lightDarkPairs: 'Grok Build accepts one active five-color override set; DexThemes exports separate light and dark alternatives.',
    },
  }),
});

export const DEFAULT_PLATFORM_ID = 'codex';
export const PLATFORM_IDS = Object.freeze(Object.keys(PLATFORM_REGISTRY));

export const PLATFORM_ID_ALIASES = Object.freeze({
  deepseek_harness: 'deepseek',
  claude_code: 'claude',
  google_antigravity: 'antigravity',
  qwen_code: 'qwen',
  open_code: 'opencode',
  t3: 't3code',
  t3_code: 't3code',
  grok_build: 'grok',
});

export function normalizePlatformId(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:[ _-][a-z0-9]+)*$/.test(trimmed)) return null;
  const normalized = trimmed.replace(/[ -]+/g, '_');
  if (Object.hasOwn(PLATFORM_REGISTRY, normalized)) return normalized;
  return PLATFORM_ID_ALIASES[normalized] || null;
}

export function getPlatform(platformId = DEFAULT_PLATFORM_ID) {
  return PLATFORM_REGISTRY[normalizePlatformId(platformId) || DEFAULT_PLATFORM_ID];
}

export function getPlatformAction(platformId = DEFAULT_PLATFORM_ID, surface = PLATFORM_ACTION_SURFACES.WEBSITE) {
  if (!Object.values(PLATFORM_ACTION_SURFACES).includes(surface)) return null;
  const selectedAction = getPlatform(platformId).actions[surface] || null;
  // This guard keeps a malformed future registry entry from turning a website
  // CTA into a fabricated cross-process Apply action.
  if (surface === PLATFORM_ACTION_SURFACES.WEBSITE && selectedAction?.mode === PLATFORM_APPLY_MODES.DIRECT) {
    return null;
  }
  return selectedAction;
}

function hasRealHttpsDestination(destination) {
  if (!destination || destination.kind !== 'url' || typeof destination.value !== 'string') return false;
  try {
    return new URL(destination.value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validatePlatformRegistry(registry = PLATFORM_REGISTRY) {
  const errors = [];
  const ids = new Set();
  const validModes = Object.values(PLATFORM_APPLY_MODES);
  const validStatuses = Object.values(PLATFORM_STATUSES);
  const validEffectStates = Object.values(EFFECT_CAPABILITY_STATES);
  const contractFields = Object.keys(HOST_CONTRACT_DEFAULTS);

  for (const [key, entry] of Object.entries(registry || {})) {
    if (!entry || entry.id !== key) errors.push(`${key}: id must match its registry key.`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) errors.push(`${key}: id must be a safe canonical id.`);
    if (ids.has(entry?.id)) errors.push(`${key}: duplicate platform id.`);
    ids.add(entry?.id);
    if (!validStatuses.includes(entry?.status)) errors.push(`${key}: invalid status.`);

    for (const field of [
      'displayName',
      'shortName',
      'organizationName',
      'descriptorCopy',
      'footerAffiliationCopy',
      'capabilityMessage',
      'adapterVersion',
    ]) {
      if (typeof entry?.[field] !== 'string' || !entry[field].trim()) errors.push(`${key}: missing ${field}.`);
    }
    if (entry?.defaultThemeId !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.defaultThemeId)) {
      errors.push(`${key}: defaultThemeId must be a safe theme id.`);
    }
    if (entry?.themeSupport !== null) {
      if (!Object.values(PLATFORM_THEME_SUPPORT_LEVELS).includes(entry?.themeSupport?.level)) {
        errors.push(`${key}: invalid theme support level.`);
      }
      for (const field of ['label', 'disclosure']) {
        if (typeof entry?.themeSupport?.[field] !== 'string' || !entry.themeSupport[field].trim()) {
          errors.push(`${key}: themeSupport is missing ${field}.`);
        }
      }
    }

    for (const field of contractFields) {
      if (typeof entry?.contract?.[field] !== 'boolean') errors.push(`${key}: contract.${field} must be boolean.`);
    }
    if (entry?.contract?.revert && !entry?.contract?.directApply) {
      errors.push(`${key}: contract Revert requires contract direct Apply.`);
    }

    const websiteAction = entry?.actions?.website;
    if (!websiteAction) errors.push(`${key}: website action is required.`);
    for (const [surface, actionDefinition] of Object.entries(entry?.actions || {})) {
      if (!Object.values(PLATFORM_ACTION_SURFACES).includes(surface)) errors.push(`${key}: invalid action surface ${surface}.`);
      if (actionDefinition?.surface !== surface) errors.push(`${key}: ${surface} action surface mismatch.`);
      if (!validModes.includes(actionDefinition?.mode)) errors.push(`${key}: ${surface} has invalid apply mode.`);
      if (typeof actionDefinition?.delivered !== 'boolean') errors.push(`${key}: ${surface}.delivered must be boolean.`);
      if (typeof actionDefinition?.supportsRevert !== 'boolean') errors.push(`${key}: ${surface}.supportsRevert must be boolean.`);
      for (const field of ['ctaLabel', 'helperText']) {
        if (typeof actionDefinition?.[field] !== 'string' || !actionDefinition[field].trim()) {
          errors.push(`${key}: ${surface} is missing ${field}.`);
        }
      }
      if (surface === PLATFORM_ACTION_SURFACES.WEBSITE && actionDefinition?.mode === PLATFORM_APPLY_MODES.DIRECT) {
        errors.push(`${key}: website actions cannot use direct mode.`);
      }
      if (actionDefinition?.mode === PLATFORM_APPLY_MODES.DIRECT) {
        if (!actionDefinition.delivered) errors.push(`${key}: direct actions must be delivered.`);
        if (!entry?.contract?.directApply) errors.push(`${key}: direct action requires a host direct-apply contract.`);
      }
      if (actionDefinition?.supportsRevert && actionDefinition?.mode !== PLATFORM_APPLY_MODES.DIRECT) {
        errors.push(`${key}: ${surface} Revert requires direct mode.`);
      }
      if (actionDefinition?.supportsRevert && !entry?.contract?.revert) {
        errors.push(`${key}: ${surface} Revert requires a host Revert contract.`);
      }
      if (actionDefinition?.mode === PLATFORM_APPLY_MODES.SETUP) {
        if (!hasRealHttpsDestination(actionDefinition.destination)) errors.push(`${key}: setup mode requires a real HTTPS destination.`);
      } else if (actionDefinition?.destination) {
        errors.push(`${key}: only setup mode may expose a destination.`);
      }
      if (actionDefinition?.mode === PLATFORM_APPLY_MODES.UNAVAILABLE && actionDefinition?.delivered) {
        errors.push(`${key}: unavailable actions cannot be delivered.`);
      }
    }

    const expectedDelivered = Object.values(entry?.actions || {}).some((candidate) => candidate?.delivered);
    if (entry?.delivered !== expectedDelivered) errors.push(`${key}: delivered must reflect its surface actions.`);
    if (entry?.applyMode !== websiteAction?.mode) errors.push(`${key}: legacy applyMode must project the website action.`);
    if (entry?.supportsDirectApply !== entry?.contract?.directApply) errors.push(`${key}: legacy direct Apply projection is stale.`);
    if (entry?.supportsRevert !== entry?.contract?.revert) errors.push(`${key}: legacy Revert projection is stale.`);

    for (const effect of EFFECT_KEYS) {
      if (!validEffectStates.includes(entry?.effectCapabilities?.[effect])) {
        errors.push(`${key}: invalid or missing ${effect} capability.`);
      }
    }
    if (entry?.effectCapabilities?.solidFallback !== true) errors.push(`${key}: solidFallback must be true.`);
    for (const effect of Object.keys(entry?.effectNotes || {})) {
      if (!EFFECT_KEYS.includes(effect)) errors.push(`${key}: effect note references unknown ${effect} capability.`);
    }
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}
