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

export const GROK_PAGER_COLOR_PATHS = Object.freeze([
  'scrollback.scrollbar.scrollbar_bg',
  'scrollback.scrollbar.scrollbar_fg',
  'scrollback.blocks.edit.accent',
  'scrollback.blocks.thinking.accent',
  'scrollback.blocks.execute.running_accent',
]);

function buildOverrideValues(theme, variant, options) {
  const palette = getCanonicalPalette(theme, variant, options);
  return deepFreeze({
    'scrollback.scrollbar.scrollbar_bg': palette.sidebar,
    'scrollback.scrollbar.scrollbar_fg': palette.muted,
    'scrollback.blocks.edit.accent': palette.accent,
    'scrollback.blocks.thinking.accent': palette.skill,
    'scrollback.blocks.execute.running_accent': palette.diffAdded,
  });
}

function serializeGrokPagerOverrides(values) {
  return '[scrollback.scrollbar]\n'
    + `scrollbar_bg = "${values['scrollback.scrollbar.scrollbar_bg']}"\n`
    + `scrollbar_fg = "${values['scrollback.scrollbar.scrollbar_fg']}"\n\n`
    + '[scrollback.blocks.edit]\n'
    + `accent = "${values['scrollback.blocks.edit.accent']}"\n\n`
    + '[scrollback.blocks.thinking]\n'
    + `accent = "${values['scrollback.blocks.thinking.accent']}"\n\n`
    + '[scrollback.blocks.execute]\n'
    + `running_accent = "${values['scrollback.blocks.execute.running_accent']}"\n`;
}

export function validateGrokPagerOverride(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Grok pager override must be an object.'] });
  }
  const keys = Object.keys(value);
  if (keys.length !== GROK_PAGER_COLOR_PATHS.length
    || keys.some((key) => !GROK_PAGER_COLOR_PATHS.includes(key))) {
    errors.push('Grok pager override must contain exactly the five documented color paths.');
  }
  for (const path of GROK_PAGER_COLOR_PATHS) {
    try {
      normalizeHexColor(value[path], path);
    } catch (error) {
      errors.push(error.message);
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildGrokPagerOverride(theme, variant, options = {}) {
  if (!['dark', 'light'].includes(variant)) throw new TypeError('Grok pager export variant must be dark or light.');
  const value = buildOverrideValues(theme, variant, options);
  const validation = validateGrokPagerOverride(value);
  if (!validation.valid) throw new TypeError(validation.errors[0]);
  return deepFreeze({ value, toml: serializeGrokPagerOverrides(value) });
}

export function buildGrokPagerThemeExport(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const variants = getThemeVariants(theme);
  const files = variants.map((variant) => {
    const { toml } = buildGrokPagerOverride(theme, variant, options);
    return exportFile(`${slug}-${variant}.pager.toml`, toml, {
      mediaType: 'application/toml',
      serialized: true,
    });
  });
  return buildHostExport({
    platformId: 'grok',
    adapterVersion: 'grok-pager-colors-v1',
    format: 'grok-pager-five-color-overrides',
    deliveryState: 'limited_export',
    theme,
    files,
    unsupportedFields: [
      'fullTheme', 'fonts', 'surface', 'ink', 'codeBackground', 'gradients', 'alpha',
      'glow', 'shadows', 'blur', 'patterns', 'images', 'animation', 'plugin', 'mcp',
      'directApply', 'automaticInstall', 'automaticRevert',
    ],
    setup: {
      userTargetFile: '~/.grok/pager.toml',
      selection: 'Choose one exported variant and manually merge only its five keys after reviewing the diff.',
      restartRequired: true,
      reversal: 'Before editing, save the exact pager.toml preimage and hash; restore it only if the file is otherwise unchanged.',
      helperShipped: false,
      securityBoundary: 'DexThemes does not read auth.json or mutate any Grok profile file.',
      contractUrl: 'https://github.com/xai-org/grok-build/blob/19d42e35c07a9c9244f03f6df0c4c353f970d4f9/crates/codegen/xai-grok-pager/docs/user-guide/05-configuration.md#appearance',
    },
  });
}

export function validateGrokPagerThemeExport(theme, options = {}) {
  return validateHostBuilder(buildGrokPagerThemeExport, theme, options);
}
