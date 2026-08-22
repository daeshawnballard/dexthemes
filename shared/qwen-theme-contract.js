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

export const QWEN_THEME_COLOR_KEYS = Object.freeze([
  'Background', 'Foreground', 'LightBlue', 'AccentBlue', 'AccentPurple', 'AccentCyan',
  'AccentGreen', 'AccentYellow', 'AccentRed', 'AccentYellowDim', 'AccentRedDim',
  'DiffAdded', 'DiffRemoved', 'Comment', 'Gray',
]);

export function buildQwenThemeDefinition(theme, variant, options = {}) {
  const palette = getCanonicalPalette(theme, variant, options);
  return deepFreeze({
    name: `${getThemeDisplayName(theme)} ${variant === 'dark' ? 'Dark' : 'Light'}`.slice(0, 50),
    type: 'custom',
    Background: palette.surface,
    Foreground: palette.ink,
    LightBlue: palette.accent,
    AccentBlue: palette.accent,
    AccentPurple: palette.skill,
    AccentCyan: palette.accent,
    AccentGreen: palette.diffAdded,
    AccentYellow: palette.skill,
    AccentRed: palette.diffRemoved,
    AccentYellowDim: palette.warningBg,
    AccentRedDim: palette.removedBg,
    DiffAdded: palette.addedBg,
    DiffRemoved: palette.removedBg,
    Comment: palette.muted,
    Gray: palette.muted,
    GradientColors: [palette.accent, palette.skill, palette.diffAdded],
  });
}

export function validateQwenThemeDefinition(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Qwen theme must be an object.'] });
  }
  const allowed = new Set(['name', 'type', 'GradientColors', ...QWEN_THEME_COLOR_KEYS]);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    errors.push('Qwen theme contains an unsupported field.');
  }
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 50) {
    errors.push('Qwen theme name must contain 1 to 50 characters.');
  }
  if (value.type !== 'custom') errors.push('Qwen theme type must be custom.');
  for (const key of QWEN_THEME_COLOR_KEYS) {
    try {
      normalizeHexColor(value[key], `Qwen ${key}`);
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (!Array.isArray(value.GradientColors) || value.GradientColors.length < 2) {
    errors.push('Qwen GradientColors must contain at least two colors.');
  } else {
    value.GradientColors.forEach((color, index) => {
      try {
        normalizeHexColor(color, `Qwen GradientColors[${index}]`);
      } catch (error) {
        errors.push(error.message);
      }
    });
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildQwenThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const files = getThemeVariants(theme).map((variant) => {
    const payload = buildQwenThemeDefinition(theme, variant, options);
    const validation = validateQwenThemeDefinition(payload);
    if (!validation.valid) throw new TypeError(validation.errors[0]);
    return exportFile(`themes/${slug}-${variant}.json`, payload);
  });
  return buildHostExport({
    platformId: 'qwen',
    adapterVersion: 'qwen-theme-v1',
    format: 'qwen-code-custom-theme-json',
    theme,
    files,
    unsupportedFields: [
      'fonts', 'alpha', 'glow', 'shadows', 'blur', 'patterns', 'images', 'animation',
      'themeExtension', 'automaticLightDarkPair',
    ],
    setup: {
      locationRequirement: 'Theme file must stay inside the user home directory.',
      selection: 'Set ui.theme to the reviewed file path; that setting selects the file directly.',
      reversal: 'Remove or change ui.theme; /theme selection is available after the pinned setting is removed.',
      contractUrl: 'https://qwenlm.github.io/qwen-code-docs/en/users/configuration/themes/',
    },
  });
}

export function validateQwenThemeExport(theme, options = {}) {
  return validateHostBuilder(buildQwenThemeExport, theme, options);
}
