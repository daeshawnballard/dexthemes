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

export const CLAUDE_THEME_BASES = Object.freeze(['dark', 'light']);

export const CLAUDE_THEME_TOKENS = Object.freeze([
  'claude',
  'text',
  'inactive',
  'subtle',
  'suggestion',
  'permission',
  'remember',
  'success',
  'error',
  'warning',
  'promptBorder',
  'planMode',
  'autoAccept',
  'bashBorder',
  'ide',
  'diffAdded',
  'diffRemoved',
  'diffAddedDimmed',
  'diffRemovedDimmed',
  'userMessageBackground',
  'selectionBg',
]);

function buildThemeFile(theme, variant, options) {
  const palette = getCanonicalPalette(theme, variant, options);
  const label = `${getThemeDisplayName(theme)} ${variant === 'dark' ? 'Dark' : 'Light'}`;
  return deepFreeze({
    name: label,
    base: variant,
    overrides: {
      claude: palette.accent,
      text: palette.ink,
      inactive: palette.muted,
      subtle: palette.dim,
      suggestion: palette.accent,
      permission: palette.accent,
      remember: palette.skill,
      success: palette.diffAdded,
      error: palette.diffRemoved,
      warning: palette.skill,
      promptBorder: palette.accent,
      planMode: palette.skill,
      autoAccept: palette.diffAdded,
      bashBorder: palette.skill,
      ide: palette.accent,
      diffAdded: palette.addedBg,
      diffRemoved: palette.removedBg,
      diffAddedDimmed: palette.sidebar,
      diffRemovedDimmed: palette.sidebar,
      userMessageBackground: palette.sidebar,
      selectionBg: palette.selection,
    },
  });
}

export function validateClaudeThemeFile(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Claude theme must be an object.'] });
  }
  const keys = Object.keys(value).sort();
  if (keys.some((key) => !['base', 'name', 'overrides'].includes(key))) {
    errors.push('Claude theme contains an unsupported root field.');
  }
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 100) {
    errors.push('Claude theme name must be a bounded non-empty string.');
  }
  if (!CLAUDE_THEME_BASES.includes(value.base)) {
    errors.push('Claude theme base must be dark or light.');
  }
  if (!value.overrides || typeof value.overrides !== 'object' || Array.isArray(value.overrides)) {
    errors.push('Claude theme overrides must be an object.');
  } else {
    for (const [token, color] of Object.entries(value.overrides)) {
      if (!CLAUDE_THEME_TOKENS.includes(token)) errors.push(`Unsupported Claude token ${token}.`);
      try {
        normalizeHexColor(color, `Claude token ${token}`);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildClaudeThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const files = getThemeVariants(theme).map((variant) => {
    const payload = buildThemeFile(theme, variant, options);
    const validation = validateClaudeThemeFile(payload);
    if (!validation.valid) throw new TypeError(validation.errors[0]);
    return exportFile(`themes/${slug}-${variant}.json`, payload);
  });

  return buildHostExport({
    platformId: 'claude',
    adapterVersion: 'claude-theme-v1',
    format: 'claude-code-custom-theme-json',
    theme,
    files,
    unsupportedFields: [
      'fonts', 'alpha', 'gradients', 'glow', 'shadows', 'blur', 'patterns', 'images',
      'animation', 'automaticLightDarkPair',
    ],
    setup: {
      targetDirectory: '~/.claude/themes',
      selection: '/theme',
      reversal: 'Select another theme with /theme.',
      firstDirectoryCreationRequiresRestart: true,
      contractUrl: 'https://code.claude.com/docs/en/terminal-config#create-a-custom-theme',
    },
  });
}

export function validateClaudeThemeExport(theme, options = {}) {
  return validateHostBuilder(buildClaudeThemeExport, theme, options);
}
