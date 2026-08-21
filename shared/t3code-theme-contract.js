import {
  buildHostExport,
  deepFreeze,
  exportFile,
  getCanonicalPalette,
  getThemeDisplayName,
  getThemeSlug,
  getThemeVariants,
  normalizeHexColor,
  validateHostBuilder,
} from './host-theme-utils.js';

export const T3CODE_THEME_FILE_VERSION = 1;

export const T3CODE_THEME_COLOR_ROLES = Object.freeze([
  'canvas', 'chrome', 'toolbar', 'toolbarForeground', 'toolbarBorder', 'toolbarControl',
  'toolbarControlForeground', 'toolbarControlHover', 'surface', 'surfaceRaised',
  'surfaceOverlay', 'text', 'textMuted', 'border', 'input', 'focus', 'accent',
  'accentForeground', 'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
  'placeholder', 'secondaryLabel', 'iconMuted', 'error', 'errorForeground', 'errorSurface',
  'warning', 'warningForeground', 'warningSurface', 'update', 'updateForeground',
  'updateSurface', 'accentSurface', 'accentSurfaceForeground', 'messageSurface',
  'messageForeground', 'messageAction', 'messageActionForeground', 'messageActionHover',
  'codeBackground', 'codeForeground', 'sidebar', 'sidebarForeground',
  'sidebarMutedForeground', 'sidebarControlSurface', 'sidebarRowHover', 'sidebarRowActive',
  'sidebarRowSelected', 'sidebarBorder', 'terminalBackground', 'terminalForeground',
  'terminalCursor', 'terminalSelection', 'terminalScrollbar', 'terminalScrollbarHover',
]);

const RESERVED_THEME_IDS = new Set([
  'system', 'light', 'dark', 't3-chat', 'grove', 'ocean', 'ember', 'iris',
  't3-chat-dark', 't3-grove', 't3-ocean', 't3-ember', 't3-iris',
]);

const ROOT_KEYS = Object.freeze(['appearance', 'colors', 'id', 'name', 'variants', 'version']);

function buildThemeId(theme) {
  const id = `dexthemes-${getThemeSlug(theme)}`.slice(0, 48).replace(/-+$/g, '');
  return id || 'dexthemes-theme';
}

function mapT3CodeColors(theme, variant, options) {
  const palette = getCanonicalPalette(theme, variant, options);
  return deepFreeze({
    canvas: palette.surface,
    chrome: palette.surface,
    toolbar: palette.sidebar,
    toolbarForeground: palette.ink,
    toolbarBorder: palette.border,
    toolbarControl: palette.selection,
    toolbarControlForeground: palette.ink,
    toolbarControlHover: palette.selection,
    surface: palette.surface,
    surfaceRaised: palette.sidebar,
    surfaceOverlay: palette.codeBg,
    text: palette.ink,
    textMuted: palette.muted,
    border: palette.border,
    input: palette.codeBg,
    focus: palette.accent,
    accent: palette.accent,
    accentForeground: palette.surface,
    secondary: palette.selection,
    secondaryForeground: palette.ink,
    muted: palette.dim,
    mutedForeground: palette.muted,
    placeholder: palette.muted,
    secondaryLabel: palette.muted,
    iconMuted: palette.muted,
    error: palette.diffRemoved,
    errorForeground: palette.surface,
    errorSurface: palette.removedBg,
    warning: palette.skill,
    warningForeground: palette.surface,
    warningSurface: palette.warningBg,
    update: palette.accent,
    updateForeground: palette.surface,
    updateSurface: palette.selection,
    accentSurface: palette.selection,
    accentSurfaceForeground: palette.ink,
    messageSurface: palette.sidebar,
    messageForeground: palette.ink,
    messageAction: palette.accent,
    messageActionForeground: palette.surface,
    messageActionHover: palette.skill,
    codeBackground: palette.codeBg,
    codeForeground: palette.ink,
    sidebar: palette.sidebar,
    sidebarForeground: palette.ink,
    sidebarMutedForeground: palette.muted,
    sidebarControlSurface: palette.surface,
    sidebarRowHover: palette.selection,
    sidebarRowActive: palette.selection,
    sidebarRowSelected: palette.selection,
    sidebarBorder: palette.border,
    terminalBackground: palette.codeBg,
    terminalForeground: palette.ink,
    terminalCursor: palette.accent,
    terminalSelection: palette.selection,
    terminalScrollbar: palette.dim,
    terminalScrollbarHover: palette.muted,
  });
}

function validateColorMap(value, path, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  const keys = Object.keys(value);
  if (keys.length !== T3CODE_THEME_COLOR_ROLES.length
    || keys.some((key) => !T3CODE_THEME_COLOR_ROLES.includes(key))) {
    errors.push(`${path} must contain exactly the stable v1 color roles.`);
    return;
  }
  for (const role of T3CODE_THEME_COLOR_ROLES) {
    try {
      normalizeHexColor(value[role], `${path}.${role}`);
    } catch (error) {
      errors.push(error.message);
    }
  }
}

export function validateT3CodeThemeFile(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['T3 Code theme file must be an object.'] });
  }
  if (Object.keys(value).some((key) => !ROOT_KEYS.includes(key))) {
    errors.push('T3 Code stable v1 export contains an unsupported root field.');
  }
  if (value.version !== T3CODE_THEME_FILE_VERSION) errors.push('T3 Code theme version must be 1.');
  if (!/^[a-z0-9](?:[a-z0-9-]{0,47})$/.test(value.id || '') || RESERVED_THEME_IDS.has(value.id)) {
    errors.push('T3 Code theme id must be non-reserved lowercase letters, numbers, and hyphens (48 characters maximum).');
  }
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > 48) {
    errors.push('T3 Code theme name must contain 1-48 characters.');
  }
  if (!['dark', 'light'].includes(value.appearance)) errors.push('T3 Code appearance must be light or dark.');
  validateColorMap(value.colors, 'colors', errors);

  if (value.variants !== undefined) {
    if (!value.variants || typeof value.variants !== 'object' || Array.isArray(value.variants)) {
      errors.push('T3 Code variants must be an object.');
    } else {
      const variantKeys = Object.keys(value.variants);
      const expected = value.appearance === 'dark' ? 'light' : 'dark';
      if (variantKeys.length !== 1 || variantKeys[0] !== expected) {
        errors.push('T3 Code variants may contain only the opposite appearance.');
      } else {
        validateColorMap(value.variants[expected], `variants.${expected}`, errors);
      }
    }
  }
  for (const forbidden of ['collection', 'managed', 'sidebarArtwork']) {
    if (Object.hasOwn(value, forbidden)) errors.push(`T3 Code stable export must omit ${forbidden}.`);
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildT3CodeThemeFile(theme, options = {}) {
  const variants = getThemeVariants(theme);
  const appearance = variants.includes('light') ? 'light' : variants[0];
  const opposite = appearance === 'light' ? 'dark' : 'light';
  const value = deepFreeze({
    version: T3CODE_THEME_FILE_VERSION,
    id: buildThemeId(theme),
    name: getThemeDisplayName(theme).slice(0, 48).trim(),
    appearance,
    colors: mapT3CodeColors(theme, appearance, options),
    ...(variants.includes(opposite)
      ? { variants: { [opposite]: mapT3CodeColors(theme, opposite, options) } }
      : {}),
  });
  const validation = validateT3CodeThemeFile(value);
  if (!validation.valid) throw new TypeError(validation.errors[0]);
  return value;
}

export function buildT3CodeThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const value = buildT3CodeThemeFile(theme, options);
  return buildHostExport({
    platformId: 't3code',
    adapterVersion: 't3-theme-v1',
    format: 't3-code-stable-theme-v1',
    theme,
    files: [exportFile(`${slug}.t3-theme.json`, value)],
    unsupportedFields: [
      'collection', 'managed', 'sidebarArtwork', 'fonts', 'gradients', 'glow', 'shadows',
      'blur', 'patterns', 'images', 'animation', 'directApply', 'automaticInstall',
    ],
    setup: {
      importPath: 'Settings → Appearance → Themes → Add theme',
      acceptedInputs: ['file', 'paste', 'drop'],
      selection: 'T3 Code selects or activates the imported theme after the user confirms installation.',
      reversal: 'Select another theme or remove the custom theme in T3 Code.',
      contractUrl: 'https://github.com/pingdotgg/t3code/blob/c3e37094e04de71accf497c6110c5305223e0090/apps/web/src/themePalette.ts#L1668-L1763',
    },
  });
}

export function validateT3CodeThemeExport(theme, options = {}) {
  return validateHostBuilder(buildT3CodeThemeExport, theme, options);
}
