const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9._-]+$/;
const SAFE_MEDIA_TYPES = new Set(['application/json', 'application/toml', 'text/markdown', 'text/plain']);

export const HOST_THEME_VARIANTS = Object.freeze(['dark', 'light']);

const REQUIRED_PALETTE_KEYS = Object.freeze([
  'surface',
  'ink',
  'accent',
  'sidebar',
  'codeBg',
  'diffAdded',
  'diffRemoved',
  'skill',
]);

export function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function boundedText(value, fallback, maxLength) {
  const normalized = String(value || fallback)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (normalized || fallback).slice(0, maxLength);
}

export function getThemeDisplayName(theme) {
  return boundedText(theme?.name, 'DexThemes Theme', 80);
}

export function getThemeSlug(theme) {
  const source = boundedText(theme?.id || theme?.themeId || theme?.name, 'theme', 120)
    .normalize('NFKD')
    .replace(/[^\x00-\x7f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/g, '');
  return source || 'theme';
}

export function normalizeHexColor(value, label = 'color') {
  const input = String(value || '');
  if (!HEX_COLOR.test(input)) {
    throw new TypeError(`${label} must be a six-digit hex color.`);
  }
  return input.toUpperCase();
}

export function mixHexColors(background, foreground, foregroundWeight) {
  const base = normalizeHexColor(background, 'background');
  const overlay = normalizeHexColor(foreground, 'foreground');
  if (typeof foregroundWeight !== 'number' || foregroundWeight < 0 || foregroundWeight > 1) {
    throw new TypeError('Color mix weight must be between 0 and 1.');
  }

  const channels = [1, 3, 5].map((index) => {
    const backgroundChannel = Number.parseInt(base.slice(index, index + 2), 16);
    const foregroundChannel = Number.parseInt(overlay.slice(index, index + 2), 16);
    return Math.round(backgroundChannel * (1 - foregroundWeight) + foregroundChannel * foregroundWeight)
      .toString(16)
      .padStart(2, '0');
  });
  return `#${channels.join('')}`.toUpperCase();
}

export function getThemeVariants(theme) {
  const variants = HOST_THEME_VARIANTS.filter((variant) => theme?.[variant]);
  if (!variants.length) throw new TypeError('A host export requires at least one dark or light palette.');
  return Object.freeze(variants);
}

export function getCanonicalPalette(theme, variant, { accentIndex = 0 } = {}) {
  if (!HOST_THEME_VARIANTS.includes(variant)) {
    throw new TypeError('Theme variant must be dark or light.');
  }
  const source = theme?.[variant];
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new TypeError(`${variant} variant is not available for this theme.`);
  }

  const colors = {};
  for (const key of REQUIRED_PALETTE_KEYS) {
    if (!Object.hasOwn(source, key)) {
      throw new TypeError(`${variant}.${key} is required.`);
    }
    colors[key] = normalizeHexColor(source[key], `${variant}.${key}`);
  }

  const configuredAccents = theme?.accents;
  if (configuredAccents != null && !Array.isArray(configuredAccents)) {
    throw new TypeError('Theme accents must be an array when provided.');
  }
  if (!Number.isInteger(accentIndex) || accentIndex < 0 || accentIndex > 9) {
    throw new TypeError('Theme accent index must be an integer between 0 and 9.');
  }
  if (configuredAccents?.length > 10) {
    throw new TypeError('A maximum of 10 accents is allowed.');
  }
  if (configuredAccents?.length) {
    for (const [index, color] of configuredAccents.entries()) {
      normalizeHexColor(color, `accents[${index}]`);
    }
    colors.accent = normalizeHexColor(
      configuredAccents[accentIndex] || configuredAccents[0],
      `${variant} export accent`,
    );
  }

  colors.muted = mixHexColors(colors.surface, colors.ink, variant === 'dark' ? 0.62 : 0.58);
  colors.dim = mixHexColors(colors.surface, colors.ink, variant === 'dark' ? 0.42 : 0.38);
  colors.border = mixHexColors(colors.surface, colors.ink, variant === 'dark' ? 0.28 : 0.22);
  colors.selection = mixHexColors(colors.surface, colors.accent, variant === 'dark' ? 0.34 : 0.22);
  colors.addedBg = mixHexColors(colors.surface, colors.diffAdded, variant === 'dark' ? 0.2 : 0.15);
  colors.removedBg = mixHexColors(colors.surface, colors.diffRemoved, variant === 'dark' ? 0.2 : 0.13);
  colors.warningBg = mixHexColors(colors.surface, colors.skill, variant === 'dark' ? 0.18 : 0.12);
  return deepFreeze(colors);
}

export function pairThemeValues(theme, mapper, options = {}) {
  const variants = getThemeVariants(theme);
  if (variants.length !== 2) {
    throw new TypeError('This host format requires both dark and light palettes.');
  }
  const dark = mapper(getCanonicalPalette(theme, 'dark', options), 'dark');
  const light = mapper(getCanonicalPalette(theme, 'light', options), 'light');
  return deepFreeze({ dark, light });
}

export function jsonContent(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function isSafeExportPath(value) {
  if (typeof value !== 'string' || !value || value.length > 240 || value.includes('\\')) return false;
  const segments = value.split('/');
  return segments.every((segment) => (
    segment.length > 0
    && segment.length <= 100
    && segment !== '.'
    && segment !== '..'
    && SAFE_PATH_SEGMENT.test(segment)
  ));
}

export function exportFile(path, value, { mediaType = 'application/json', serialized = false } = {}) {
  if (!isSafeExportPath(path)) {
    throw new TypeError('Host export paths must be safe relative paths.');
  }
  if (!SAFE_MEDIA_TYPES.has(mediaType)) {
    throw new TypeError('Host export media types must be explicitly allowlisted.');
  }
  const content = serialized ? String(value) : jsonContent(value);
  if (content.includes('\u0000')) throw new TypeError('Host export content must not contain NUL bytes.');
  return deepFreeze({ path, mediaType, content });
}

export function buildHostExport({
  platformId,
  adapterVersion,
  format,
  theme,
  files,
  unsupportedFields,
  setup,
  deliveryState = 'export',
}) {
  const variants = getThemeVariants(theme);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(platformId)) {
    throw new TypeError('Host export platformId must be a safe canonical id.');
  }
  if (typeof adapterVersion !== 'string' || !adapterVersion.trim()) {
    throw new TypeError('Host export adapterVersion is required.');
  }
  if (typeof format !== 'string' || !format.trim()) {
    throw new TypeError('Host export format is required.');
  }
  if (!Array.isArray(files) || !files.length) {
    throw new TypeError('Host export requires at least one file.');
  }
  const filePaths = files.map((file) => file?.path);
  if (filePaths.some((filePath) => !isSafeExportPath(filePath)) || new Set(filePaths).size !== filePaths.length) {
    throw new TypeError('Host export files require unique safe relative paths.');
  }
  if (!Array.isArray(unsupportedFields) || unsupportedFields.some((field) => typeof field !== 'string')) {
    throw new TypeError('Host export unsupportedFields must be a string array.');
  }
  const missingVariants = HOST_THEME_VARIANTS.filter((variant) => !variants.includes(variant));
  return deepFreeze({
    platformId,
    adapterVersion,
    format,
    deliveryState,
    variant: variants.length === 2 ? 'paired' : variants[0],
    variants,
    missingVariants,
    files,
    userControlled: true,
    reversible: false,
    setup: {
      automaticInstall: false,
      writesHostConfig: false,
      ...setup,
    },
    unsupportedFields,
  });
}

export function validateHostBuilder(builder, theme, options = {}) {
  try {
    builder(theme, options);
    return deepFreeze({ valid: true, errors: [] });
  } catch (error) {
    return deepFreeze({ valid: false, errors: [String(error?.message || error)] });
  }
}
