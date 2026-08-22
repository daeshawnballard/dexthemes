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

export const PI_REQUIRED_COLOR_KEYS = Object.freeze([
  'accent', 'border', 'borderAccent', 'borderMuted', 'success', 'error', 'warning',
  'muted', 'dim', 'text', 'thinkingText', 'selectedBg', 'userMessageBg', 'userMessageText',
  'customMessageBg', 'customMessageText', 'customMessageLabel', 'toolPendingBg',
  'toolSuccessBg', 'toolErrorBg', 'toolTitle', 'toolOutput', 'mdHeading', 'mdLink',
  'mdLinkUrl', 'mdCode', 'mdCodeBlock', 'mdCodeBlockBorder', 'mdQuote', 'mdQuoteBorder',
  'mdHr', 'mdListBullet', 'toolDiffAdded', 'toolDiffRemoved', 'toolDiffContext',
  'syntaxComment', 'syntaxKeyword', 'syntaxFunction', 'syntaxVariable', 'syntaxString',
  'syntaxNumber', 'syntaxType', 'syntaxOperator', 'syntaxPunctuation', 'thinkingOff',
  'thinkingMinimal', 'thinkingLow', 'thinkingMedium', 'thinkingHigh', 'thinkingXhigh',
  'bashMode',
]);

export const PI_OPTIONAL_COLOR_KEYS = Object.freeze([
  'thinkingMax', 'scrollbarThumb', 'searchMatchBg', 'searchMatchText',
]);

const PI_SCHEMA_URL = 'https://raw.githubusercontent.com/earendil-works/pi/f4585b8bec581d005cbb1edfc07edfcce723d0ae/packages/coding-agent/src/modes/interactive/theme/theme-schema.json';
const PI_THEME_ROOT_KEYS = Object.freeze(['$schema', 'colors', 'export', 'name']);

function buildPiTheme(theme, variant, options) {
  const palette = getCanonicalPalette(theme, variant, options);
  const slug = getThemeSlug(theme);
  return deepFreeze({
    $schema: PI_SCHEMA_URL,
    name: `${slug}-${variant}`,
    colors: {
      accent: palette.accent,
      border: palette.border,
      borderAccent: palette.accent,
      borderMuted: palette.dim,
      success: palette.diffAdded,
      error: palette.diffRemoved,
      warning: palette.skill,
      muted: palette.muted,
      dim: palette.dim,
      text: palette.ink,
      thinkingText: palette.muted,
      selectedBg: palette.selection,
      scrollbarThumb: palette.border,
      searchMatchBg: palette.selection,
      searchMatchText: palette.ink,
      userMessageBg: palette.sidebar,
      userMessageText: palette.ink,
      customMessageBg: palette.codeBg,
      customMessageText: palette.ink,
      customMessageLabel: palette.accent,
      toolPendingBg: palette.warningBg,
      toolSuccessBg: palette.addedBg,
      toolErrorBg: palette.removedBg,
      toolTitle: palette.accent,
      toolOutput: palette.ink,
      mdHeading: palette.skill,
      mdLink: palette.accent,
      mdLinkUrl: palette.muted,
      mdCode: palette.diffAdded,
      mdCodeBlock: palette.ink,
      mdCodeBlockBorder: palette.border,
      mdQuote: palette.muted,
      mdQuoteBorder: palette.border,
      mdHr: palette.border,
      mdListBullet: palette.accent,
      toolDiffAdded: palette.diffAdded,
      toolDiffRemoved: palette.diffRemoved,
      toolDiffContext: palette.muted,
      syntaxComment: palette.muted,
      syntaxKeyword: palette.accent,
      syntaxFunction: palette.skill,
      syntaxVariable: palette.ink,
      syntaxString: palette.diffAdded,
      syntaxNumber: palette.diffRemoved,
      syntaxType: palette.skill,
      syntaxOperator: palette.accent,
      syntaxPunctuation: palette.muted,
      thinkingOff: palette.dim,
      thinkingMinimal: palette.muted,
      thinkingLow: palette.accent,
      thinkingMedium: palette.skill,
      thinkingHigh: palette.diffAdded,
      thinkingXhigh: palette.diffRemoved,
      thinkingMax: palette.diffRemoved,
      bashMode: palette.skill,
    },
    export: {
      pageBg: palette.surface,
      cardBg: palette.sidebar,
      infoBg: palette.codeBg,
    },
  });
}

export function validatePiThemeDefinition(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Pi theme must be an object.'] });
  }
  if (Object.keys(value).some((key) => !PI_THEME_ROOT_KEYS.includes(key))) {
    errors.push('Pi theme contains an unsupported root field.');
  }
  if (value.$schema !== PI_SCHEMA_URL) errors.push('Pi theme must pin the reviewed schema URL.');
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.includes('/')) {
    errors.push('Pi theme name must be non-empty and must not contain /.');
  }
  if (!value.colors || typeof value.colors !== 'object' || Array.isArray(value.colors)) {
    errors.push('Pi colors must be an object.');
  } else {
    const allowed = new Set([...PI_REQUIRED_COLOR_KEYS, ...PI_OPTIONAL_COLOR_KEYS]);
    for (const key of PI_REQUIRED_COLOR_KEYS) {
      if (!Object.hasOwn(value.colors, key)) errors.push(`Pi theme is missing ${key}.`);
    }
    for (const [key, color] of Object.entries(value.colors)) {
      if (!allowed.has(key)) errors.push(`Unsupported Pi color ${key}.`);
      try {
        normalizeHexColor(color, `Pi ${key}`);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }
  if (!value.export || typeof value.export !== 'object' || Array.isArray(value.export)) {
    errors.push('Pi export colors must be an object.');
  } else {
    const exportKeys = Object.keys(value.export);
    if (exportKeys.some((key) => !['pageBg', 'cardBg', 'infoBg'].includes(key))) {
      errors.push('Pi export colors contain an unsupported field.');
    }
    for (const key of ['pageBg', 'cardBg', 'infoBg']) {
      try {
        normalizeHexColor(value.export[key], `Pi export ${key}`);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function validatePiPackageManifest(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Pi package manifest must be an object.'] });
  }
  const allowed = new Set(['name', 'version', 'private', 'description', 'license', 'keywords', 'pi']);
  if (Object.keys(value).some((key) => !allowed.has(key))) errors.push('Pi package manifest contains an unsupported field.');
  if (!/^dexthemes-pi-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.name || '')) errors.push('Pi package name is invalid.');
  if (value.version !== '0.0.0') errors.push('Pi review package version must remain 0.0.0.');
  if (value.private !== true) errors.push('Pi review package must remain private.');
  if (value.license !== 'MIT') errors.push('Pi package license must be MIT.');
  if (!Array.isArray(value.keywords) || !value.keywords.includes('pi-package')) errors.push('Pi package keyword is required.');
  if (!value.pi || typeof value.pi !== 'object' || Array.isArray(value.pi)
    || Object.keys(value.pi).sort().join(',') !== 'themes'
    || !Array.isArray(value.pi.themes)
    || value.pi.themes.length !== 1
    || value.pi.themes[0] !== './themes') {
    errors.push('Pi package must expose only the code-free themes directory.');
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildPiThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const definitions = getThemeVariants(theme).map((variant) => {
    const value = buildPiTheme(theme, variant, options);
    const validation = validatePiThemeDefinition(value);
    if (!validation.valid) throw new TypeError(validation.errors[0]);
    return { variant, value };
  });
  const manifest = deepFreeze({
    name: `dexthemes-pi-${slug}`.slice(0, 120),
    version: '0.0.0',
    private: true,
    description: `Theme-only Pi package for ${getThemeDisplayName(theme)}.`.slice(0, 160),
    license: 'MIT',
    keywords: ['pi-package'],
    pi: { themes: ['./themes'] },
  });
  const manifestValidation = validatePiPackageManifest(manifest);
  if (!manifestValidation.valid) throw new TypeError(manifestValidation.errors[0]);
  return buildHostExport({
    platformId: 'pi',
    adapterVersion: 'pi-theme-package-v1',
    format: 'pi-theme-only-package',
    deliveryState: 'package_export',
    theme,
    files: [
      exportFile('package.json', manifest),
      ...definitions.map(({ variant, value }) => exportFile(`themes/${slug}-${variant}.json`, value)),
    ],
    unsupportedFields: [
      'fonts', 'alpha', 'gradients', 'glow', 'shadows', 'blur', 'patterns', 'images',
      'animation', 'directApply', 'automaticRevert',
    ],
    setup: {
      temporaryReview: 'pi -e <export-directory>',
      install: 'pi install <export-directory>',
      selection: definitions.length === 2
        ? `pi --use-theme ${slug}-light/${slug}-dark`
        : `pi --use-theme ${slug}-${definitions[0].variant}`,
      reversal: 'Select another theme in /settings; remove the package only by explicit user action.',
      securityBoundary: 'The package contains JSON themes only; review all package contents before install.',
      contractUrl: 'https://github.com/earendil-works/pi/blob/f4585b8bec581d005cbb1edfc07edfcce723d0ae/packages/coding-agent/docs/themes.md',
    },
  });
}

export function validatePiThemeExport(theme, options = {}) {
  return validateHostBuilder(buildPiThemeExport, theme, options);
}
