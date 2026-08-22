import {
  buildHostExport,
  deepFreeze,
  exportFile,
  getCanonicalPalette,
  getThemeSlug,
  getThemeVariants,
  normalizeHexColor,
  validateHostBuilder,
} from './host-theme-utils.js';

export const OPENCODE_THEME_KEYS = Object.freeze([
  'primary', 'secondary', 'accent', 'error', 'warning', 'success', 'info', 'text',
  'textMuted', 'selectedListItemText', 'background', 'backgroundPanel', 'backgroundElement',
  'border', 'borderActive', 'borderSubtle', 'diffAdded', 'diffRemoved', 'diffContext',
  'diffHunkHeader', 'diffHighlightAdded', 'diffHighlightRemoved', 'diffAddedBg',
  'diffRemovedBg', 'diffContextBg', 'diffLineNumber', 'diffAddedLineNumberBg',
  'diffRemovedLineNumberBg', 'markdownText', 'markdownHeading', 'markdownLink',
  'markdownLinkText', 'markdownCode', 'markdownBlockQuote', 'markdownEmph',
  'markdownStrong', 'markdownHorizontalRule', 'markdownListItem', 'markdownListEnumeration',
  'markdownImage', 'markdownImageText', 'markdownCodeBlock', 'syntaxComment', 'syntaxKeyword',
  'syntaxFunction', 'syntaxVariable', 'syntaxString', 'syntaxNumber', 'syntaxType',
  'syntaxOperator', 'syntaxPunctuation',
]);

const REQUIRED_KEYS = Object.freeze(['primary', 'secondary', 'accent', 'text', 'textMuted', 'background']);

function pairedValue(palettes, selector) {
  if (palettes.dark && palettes.light) {
    return deepFreeze({ dark: selector(palettes.dark), light: selector(palettes.light) });
  }
  return selector(palettes.dark || palettes.light);
}

function buildThemeMap(palettes) {
  const value = (selector) => pairedValue(palettes, selector);
  return deepFreeze({
    primary: value((palette) => palette.accent),
    secondary: value((palette) => palette.skill),
    accent: value((palette) => palette.diffAdded),
    error: value((palette) => palette.diffRemoved),
    warning: value((palette) => palette.skill),
    success: value((palette) => palette.diffAdded),
    info: value((palette) => palette.accent),
    text: value((palette) => palette.ink),
    textMuted: value((palette) => palette.muted),
    selectedListItemText: value((palette) => palette.ink),
    background: value((palette) => palette.surface),
    backgroundPanel: value((palette) => palette.sidebar),
    backgroundElement: value((palette) => palette.codeBg),
    border: value((palette) => palette.border),
    borderActive: value((palette) => palette.accent),
    borderSubtle: value((palette) => palette.dim),
    diffAdded: value((palette) => palette.diffAdded),
    diffRemoved: value((palette) => palette.diffRemoved),
    diffContext: value((palette) => palette.muted),
    diffHunkHeader: value((palette) => palette.accent),
    diffHighlightAdded: value((palette) => palette.diffAdded),
    diffHighlightRemoved: value((palette) => palette.diffRemoved),
    diffAddedBg: value((palette) => palette.addedBg),
    diffRemovedBg: value((palette) => palette.removedBg),
    diffContextBg: value((palette) => palette.codeBg),
    diffLineNumber: value((palette) => palette.muted),
    diffAddedLineNumberBg: value((palette) => palette.addedBg),
    diffRemovedLineNumberBg: value((palette) => palette.removedBg),
    markdownText: value((palette) => palette.ink),
    markdownHeading: value((palette) => palette.skill),
    markdownLink: value((palette) => palette.accent),
    markdownLinkText: value((palette) => palette.accent),
    markdownCode: value((palette) => palette.diffAdded),
    markdownBlockQuote: value((palette) => palette.muted),
    markdownEmph: value((palette) => palette.skill),
    markdownStrong: value((palette) => palette.ink),
    markdownHorizontalRule: value((palette) => palette.border),
    markdownListItem: value((palette) => palette.accent),
    markdownListEnumeration: value((palette) => palette.skill),
    markdownImage: value((palette) => palette.accent),
    markdownImageText: value((palette) => palette.muted),
    markdownCodeBlock: value((palette) => palette.ink),
    syntaxComment: value((palette) => palette.muted),
    syntaxKeyword: value((palette) => palette.accent),
    syntaxFunction: value((palette) => palette.skill),
    syntaxVariable: value((palette) => palette.ink),
    syntaxString: value((palette) => palette.diffAdded),
    syntaxNumber: value((palette) => palette.diffRemoved),
    syntaxType: value((palette) => palette.skill),
    syntaxOperator: value((palette) => palette.accent),
    syntaxPunctuation: value((palette) => palette.muted),
  });
}

function validateColorValue(value, label, errors) {
  if (typeof value === 'string') {
    try {
      normalizeHexColor(value, label);
    } catch (error) {
      errors.push(error.message);
    }
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== 'dark,light') {
    errors.push(`${label} must be a hex color or an exact dark/light pair.`);
    return;
  }
  for (const variant of ['dark', 'light']) {
    try {
      normalizeHexColor(value[variant], `${label}.${variant}`);
    } catch (error) {
      errors.push(error.message);
    }
  }
}

export function validateOpenCodeThemeDefinition(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some((key) => !['defs', 'theme'].includes(key))) {
    return deepFreeze({ valid: false, errors: ['OpenCode theme must contain only theme and optional defs.'] });
  }
  if (!value.theme || typeof value.theme !== 'object' || Array.isArray(value.theme)) {
    errors.push('OpenCode theme map must be an object.');
  } else {
    for (const key of REQUIRED_KEYS) {
      if (!Object.hasOwn(value.theme, key)) errors.push(`OpenCode theme is missing ${key}.`);
    }
    for (const [key, color] of Object.entries(value.theme)) {
      if (!OPENCODE_THEME_KEYS.includes(key)) errors.push(`Unsupported OpenCode key ${key}.`);
      validateColorValue(color, `OpenCode ${key}`, errors);
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildOpenCodeThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const palettes = Object.fromEntries(getThemeVariants(theme).map((variant) => [
    variant,
    getCanonicalPalette(theme, variant, options),
  ]));
  const payload = deepFreeze({ theme: buildThemeMap(palettes) });
  const validation = validateOpenCodeThemeDefinition(payload);
  if (!validation.valid) throw new TypeError(validation.errors[0]);

  return buildHostExport({
    platformId: 'opencode',
    adapterVersion: 'opencode-theme-v1',
    format: 'opencode-theme-json',
    theme,
    files: [exportFile(`themes/${slug}.json`, payload)],
    unsupportedFields: ['fonts', 'alpha', 'gradients', 'glow', 'shadows', 'blur', 'patterns', 'images', 'animation'],
    setup: {
      projectTargetDirectory: '.opencode/themes',
      userTargetDirectory: '$XDG_CONFIG_HOME/opencode/themes or ~/.config/opencode/themes',
      selection: '/theme',
      reversal: 'Select another theme with /theme.',
      schemaStatus: 'The documented https://opencode.ai/theme.json endpoint returned 404 on 2026-08-21.',
      contractUrl: 'https://opencode.ai/docs/themes/',
    },
  });
}

export function validateOpenCodeThemeExport(theme, options = {}) {
  return validateHostBuilder(buildOpenCodeThemeExport, theme, options);
}
