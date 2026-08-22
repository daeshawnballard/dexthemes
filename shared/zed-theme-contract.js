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

export const ZED_EMITTED_STYLE_KEYS = Object.freeze([
  'accents', 'background', 'background.appearance', 'border', 'border.focused',
  'border.selected', 'border.variant', 'created', 'created.background', 'deleted',
  'deleted.background', 'editor.active_line.background', 'editor.background',
  'editor.foreground', 'editor.gutter.background', 'editor.line_number',
  'elevated_surface.background', 'error', 'error.background', 'info', 'panel.background',
  'panel.focused_border', 'status_bar.background', 'success', 'success.background',
  'surface.background', 'syntax', 'tab.active_background', 'tab.inactive_background',
  'tab_bar.background', 'terminal.background', 'terminal.foreground', 'text',
  'text.accent', 'text.muted', 'title_bar.background', 'toolbar.background', 'warning',
  'warning.background',
]);

const ZED_SYNTAX_KEYS = Object.freeze([
  'comment', 'keyword', 'function', 'string', 'number', 'type', 'operator', 'punctuation',
]);

function buildZedTheme(theme, variant, options) {
  const palette = getCanonicalPalette(theme, variant, options);
  return deepFreeze({
    name: `${getThemeDisplayName(theme)} ${variant === 'dark' ? 'Dark' : 'Light'}`,
    appearance: variant,
    style: {
      accents: [palette.accent, palette.skill, palette.diffAdded, palette.diffRemoved],
      background: palette.surface,
      'background.appearance': 'opaque',
      border: palette.border,
      'border.focused': palette.accent,
      'border.selected': palette.accent,
      'border.variant': palette.dim,
      created: palette.diffAdded,
      'created.background': palette.addedBg,
      deleted: palette.diffRemoved,
      'deleted.background': palette.removedBg,
      'editor.active_line.background': palette.selection,
      'editor.background': palette.codeBg,
      'editor.foreground': palette.ink,
      'editor.gutter.background': palette.sidebar,
      'editor.line_number': palette.muted,
      'elevated_surface.background': palette.sidebar,
      error: palette.diffRemoved,
      'error.background': palette.removedBg,
      info: palette.accent,
      'panel.background': palette.sidebar,
      'panel.focused_border': palette.accent,
      'status_bar.background': palette.sidebar,
      success: palette.diffAdded,
      'success.background': palette.addedBg,
      'surface.background': palette.surface,
      syntax: {
        comment: { color: palette.muted },
        keyword: { color: palette.accent },
        function: { color: palette.skill },
        string: { color: palette.diffAdded },
        number: { color: palette.diffRemoved },
        type: { color: palette.skill },
        operator: { color: palette.accent },
        punctuation: { color: palette.muted },
      },
      'tab.active_background': palette.codeBg,
      'tab.inactive_background': palette.sidebar,
      'tab_bar.background': palette.sidebar,
      'terminal.background': palette.codeBg,
      'terminal.foreground': palette.ink,
      text: palette.ink,
      'text.accent': palette.accent,
      'text.muted': palette.muted,
      'title_bar.background': palette.surface,
      'toolbar.background': palette.surface,
      warning: palette.skill,
      'warning.background': palette.warningBg,
    },
  });
}

function validateZedStyle(style, themeIndex, errors) {
  const prefix = `Zed theme ${themeIndex}.style`;
  if (Object.keys(style).some((key) => !ZED_EMITTED_STYLE_KEYS.includes(key))) {
    errors.push(`${prefix} contains an unsupported emitted field.`);
  }
  if (!Array.isArray(style.accents) || !style.accents.length) {
    errors.push(`${prefix}.accents must be a non-empty array.`);
  } else {
    style.accents.forEach((color, index) => {
      try {
        normalizeHexColor(color, `${prefix}.accents[${index}]`);
      } catch (error) {
        errors.push(error.message);
      }
    });
  }
  if (style['background.appearance'] !== 'opaque') {
    errors.push(`${prefix}.background.appearance must remain opaque in DexThemes exports.`);
  }
  for (const [key, color] of Object.entries(style)) {
    if (key === 'accents' || key === 'background.appearance' || key === 'syntax') continue;
    try {
      normalizeHexColor(color, `${prefix}.${key}`);
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (!style.syntax || typeof style.syntax !== 'object' || Array.isArray(style.syntax)) {
    errors.push(`${prefix}.syntax must be an object.`);
  } else {
    if (Object.keys(style.syntax).some((key) => !ZED_SYNTAX_KEYS.includes(key))) {
      errors.push(`${prefix}.syntax contains an unsupported emitted field.`);
    }
    for (const [key, highlight] of Object.entries(style.syntax)) {
      if (!highlight || typeof highlight !== 'object' || Array.isArray(highlight)
        || Object.keys(highlight).sort().join(',') !== 'color') {
        errors.push(`${prefix}.syntax.${key} must contain only color.`);
        continue;
      }
      try {
        normalizeHexColor(highlight.color, `${prefix}.syntax.${key}.color`);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }
}

export function validateZedThemeFamily(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).sort().join(',') !== 'author,name,themes') {
    return deepFreeze({ valid: false, errors: ['Zed family must contain exactly author, name, and themes.'] });
  }
  if (typeof value.author !== 'string' || !value.author.trim()) errors.push('Zed family author is required.');
  if (typeof value.name !== 'string' || !value.name.trim()) errors.push('Zed family name is required.');
  if (!Array.isArray(value.themes) || !value.themes.length) {
    errors.push('Zed family requires at least one theme.');
  } else {
    for (const [index, theme] of value.themes.entries()) {
      if (!theme || typeof theme !== 'object'
        || Object.keys(theme).sort().join(',') !== 'appearance,name,style') {
        errors.push(`Zed theme ${index} must contain name, appearance, and style.`);
        continue;
      }
      if (!['dark', 'light'].includes(theme.appearance)) errors.push(`Zed theme ${index} appearance is invalid.`);
      if (typeof theme.name !== 'string' || !theme.name.trim()) errors.push(`Zed theme ${index} name is required.`);
      if (!theme.style || typeof theme.style !== 'object' || Array.isArray(theme.style)) {
        errors.push(`Zed theme ${index} style must be an object.`);
      } else {
        validateZedStyle(theme.style, index, errors);
      }
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildZedThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const family = deepFreeze({
    name: `${getThemeDisplayName(theme)} · DexThemes`,
    author: 'DexThemes',
    themes: getThemeVariants(theme).map((variant) => buildZedTheme(theme, variant, options)),
  });
  const validation = validateZedThemeFamily(family);
  if (!validation.valid) throw new TypeError(validation.errors[0]);
  return buildHostExport({
    platformId: 'zed',
    adapterVersion: 'zed-theme-v1',
    format: 'zed-theme-family-v0.2.0',
    theme,
    files: [exportFile(`themes/${slug}.json`, family)],
    unsupportedFields: ['fonts', 'gradients', 'glow', 'shadows', 'patterns', 'images', 'animation', 'arbitraryBlur'],
    setup: {
      userTargetDirectory: '~/.config/zed/themes',
      selection: 'Theme Selector',
      reversal: 'Select another theme in Theme Selector.',
      backgroundAppearance: 'opaque',
      schemaUrl: 'https://zed.dev/schema/themes/v0.2.0.json',
      contractUrl: 'https://zed.dev/docs/themes#local-themes',
    },
  });
}

export function validateZedThemeExport(theme, options = {}) {
  return validateHostBuilder(buildZedThemeExport, theme, options);
}
