const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const DEEPSEEK_THEME_SCHEMA_VERSION = 'dexthemes-deepseek-theme-v1';
export const DEEPSEEK_CORDIS_ID_PREFIX = 'dext';
export const DEEPSEEK_THEME_SOURCE = 'dexthemes';

export const DEEPSEEK_THEME_TOKENS = Object.freeze([
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-overlay',
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l2',
  '--dsw-alias-brand-primary',
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-state-error-primary',
  '--dsw-alias-state-success-primary',
  '--dsw-alias-state-warn-primary',
  '--dsw-specific-sidebar-fill',
]);

const REQUIRED_PALETTE_COLORS = Object.freeze([
  'surface',
  'ink',
  'accent',
  'diffAdded',
  'diffRemoved',
  'skill',
]);

function assertRecord(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function assertExactKeys(value, expectedKeys, label) {
  const keys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} must contain exactly ${expected.join(', ')}`);
  }
}

function assertExactStringArray(value, expected, label) {
  if (!Array.isArray(value)
    || value.length !== expected.length
    || value.some((item, index) => item !== expected[index])) {
    throw new TypeError(`${label} must be [${expected.join(', ')}]`);
  }
}

function normalizeHex(value, label) {
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) {
    throw new TypeError(`${label} must be a six-digit hex color`);
  }
  return value.toUpperCase();
}

function hexChannels(value) {
  const hex = normalizeHex(value, 'Color');
  return [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function channelsToHex(channels) {
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function mixHex(from, to, amount) {
  const start = hexChannels(from);
  const end = hexChannels(to);
  const ratio = Math.max(0, Math.min(1, amount));
  return channelsToHex(start.map((channel, index) => channel + ((end[index] - channel) * ratio)));
}

function relativeLuminance(value) {
  const channels = hexChannels(value).map((channel) => channel / 255);
  const linear = channels.map((channel) => (
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
}

export function getColorContrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05)
    / (Math.min(firstLuminance, secondLuminance) + 0.05);
}

function ensureContrast(candidate, background, minimumRatio) {
  if (getColorContrastRatio(candidate, background) >= minimumRatio) return candidate;

  const blackRatio = getColorContrastRatio('#000000', background);
  const whiteRatio = getColorContrastRatio('#FFFFFF', background);
  const endpoint = blackRatio >= whiteRatio ? '#000000' : '#FFFFFF';
  for (let step = 1; step <= 100; step += 1) {
    const adjusted = mixHex(candidate, endpoint, step / 100);
    if (getColorContrastRatio(adjusted, background) >= minimumRatio) return adjusted;
  }
  return endpoint;
}

function derivePaletteTokens(palette, mode, accentOverride) {
  const input = assertRecord(palette, `Theme ${mode} palette`);
  const colors = Object.fromEntries(REQUIRED_PALETTE_COLORS.map((key) => (
    [key, normalizeHex(input[key], `Theme ${mode}.${key}`)]
  )));
  const accent = accentOverride === undefined
    ? colors.accent
    : normalizeHex(accentOverride, 'Selected accent');
  const primary = ensureContrast(colors.ink, colors.surface, 4.5);
  const secondary = ensureContrast(mixHex(colors.surface, primary, 0.72), colors.surface, 4.5);
  const borderBase = mixHex(colors.surface, primary, mode === 'dark' ? 0.2 : 0.16);
  const sidebar = input.sidebar === undefined
    ? mixHex(colors.surface, primary, mode === 'dark' ? 0.035 : 0.025)
    : normalizeHex(input.sidebar, `Theme ${mode}.sidebar`);
  const codeBg = input.codeBg === undefined
    ? mixHex(colors.surface, primary, mode === 'dark' ? 0.075 : 0.045)
    : normalizeHex(input.codeBg, `Theme ${mode}.codeBg`);

  return Object.freeze({
    '--dsw-alias-bg-base': colors.surface,
    '--dsw-alias-bg-layer-1': mixHex(colors.surface, primary, mode === 'dark' ? 0.05 : 0.03),
    '--dsw-alias-bg-layer-2': mixHex(colors.surface, primary, mode === 'dark' ? 0.09 : 0.06),
    '--dsw-alias-bg-overlay': codeBg,
    '--dsw-alias-border-l1': ensureContrast(borderBase, colors.surface, 1.5),
    '--dsw-alias-border-l2': ensureContrast(mixHex(colors.surface, primary, 0.3), colors.surface, 3),
    '--dsw-alias-brand-primary': ensureContrast(accent, colors.surface, 3),
    '--dsw-alias-label-primary': primary,
    '--dsw-alias-label-secondary': secondary,
    '--dsw-alias-state-error-primary': ensureContrast(colors.diffRemoved, colors.surface, 3),
    '--dsw-alias-state-success-primary': ensureContrast(colors.diffAdded, colors.surface, 3),
    '--dsw-alias-state-warn-primary': ensureContrast(colors.skill, colors.surface, 3),
    '--dsw-specific-sidebar-fill': sidebar,
  });
}

export function isDeepSeekThemeEligible(theme) {
  try {
    buildDeepSeekThemeTokens(theme);
    return true;
  } catch {
    return false;
  }
}

export function buildDeepSeekThemeTokens(theme, { accent } = {}) {
  const input = assertRecord(theme, 'Theme');
  if (!input.dark || !input.light) {
    throw new TypeError('DeepSeek Harness themes require both dark and light DexThemes palettes');
  }

  const dark = derivePaletteTokens(input.dark, 'dark', accent);
  const light = derivePaletteTokens(input.light, 'light', accent);
  const pairs = Object.fromEntries(DEEPSEEK_THEME_TOKENS.map((token) => [
    token,
    Object.freeze({ light: light[token], dark: dark[token] }),
  ]));
  return Object.freeze(pairs);
}

export function validateDeepSeekThemeTokens(tokens) {
  const input = assertRecord(tokens, 'DeepSeek theme tokens');
  const names = Object.keys(input).sort();
  const expected = [...DEEPSEEK_THEME_TOKENS].sort();
  if (names.length !== expected.length || names.some((name, index) => name !== expected[index])) {
    throw new TypeError('DeepSeek theme tokens must contain exactly the supported Harness semantic tokens');
  }

  const validated = {};
  for (const name of DEEPSEEK_THEME_TOKENS) {
    const pair = assertRecord(input[name], `DeepSeek theme token ${name}`);
    if (Object.keys(pair).length !== 2 || !Object.hasOwn(pair, 'light') || !Object.hasOwn(pair, 'dark')) {
      throw new TypeError(`DeepSeek theme token ${name} must contain exactly light and dark values`);
    }
    validated[name] = Object.freeze({
      light: normalizeHex(pair.light, `DeepSeek theme token ${name}.light`),
      dark: normalizeHex(pair.dark, `DeepSeek theme token ${name}.dark`),
    });
  }
  return Object.freeze(validated);
}

function buildCordisClientCode(tokens) {
  return `return {\n  inject: ['theme'],\n  apply(ctx) {\n    ctx.theme.overrideTokens('dexthemes', ${JSON.stringify(tokens, null, 2)})\n  },\n}`;
}

function safeMetadata(value, fallback, maxLength) {
  const normalized = String(value || fallback).replace(/[\r\n\t]+/g, ' ').trim();
  return (normalized || fallback).slice(0, maxLength);
}

export function buildDeepSeekCordisPayload(theme, options = {}) {
  const tokens = validateDeepSeekThemeTokens(buildDeepSeekThemeTokens(theme, options));
  const themeId = safeMetadata(theme?.id || theme?.themeId, 'theme', 80);
  const themeName = safeMetadata(theme?.name, 'DexThemes theme', 80);
  const cordisDefine = Object.freeze({
    plugin: Object.freeze({ kind: 'new', idPrefix: DEEPSEEK_CORDIS_ID_PREFIX }),
    name: `DexThemes · ${themeName}`.slice(0, 100),
    purpose: `Apply the user-selected ${themeName} palette to DeepSeek Harness through the guarded theme service.`.slice(0, 240),
    code: Object.freeze({ client: buildCordisClientCode(tokens) }),
  });
  return validateDeepSeekCordisPayload(Object.freeze({
    schemaVersion: DEEPSEEK_THEME_SCHEMA_VERSION,
    target: 'deepseek-harness',
    theme: Object.freeze({ id: themeId, name: themeName }),
    tokens,
    cordisDefine,
    activation: Object.freeze({ tool: 'cordis_run', mode: 'run', requires: Object.freeze(['pluginId', 'packageId']) }),
    reversal: Object.freeze({ tool: 'cordis_stop', requires: Object.freeze(['pluginId']) }),
    fonts: Object.freeze({ supported: false }),
  }));
}

export function validateDeepSeekCordisPayload(payload) {
  const input = assertRecord(payload, 'DeepSeek Cordis payload');
  assertExactKeys(
    input,
    ['schemaVersion', 'target', 'theme', 'tokens', 'cordisDefine', 'activation', 'reversal', 'fonts'],
    'DeepSeek Cordis payload',
  );
  if (input.schemaVersion !== DEEPSEEK_THEME_SCHEMA_VERSION || input.target !== 'deepseek-harness') {
    throw new TypeError('Unsupported DeepSeek Cordis payload version or target');
  }
  const theme = assertRecord(input.theme, 'DeepSeek Cordis theme metadata');
  assertExactKeys(theme, ['id', 'name'], 'DeepSeek Cordis theme metadata');
  if (typeof theme.id !== 'string' || !theme.id.trim() || theme.id.length > 80
    || typeof theme.name !== 'string' || !theme.name.trim() || theme.name.length > 80) {
    throw new TypeError('DeepSeek Cordis theme metadata must contain bounded id and name strings');
  }
  const tokens = validateDeepSeekThemeTokens(input.tokens);
  const define = assertRecord(input.cordisDefine, 'DeepSeek Cordis define request');
  assertExactKeys(define, ['plugin', 'name', 'purpose', 'code'], 'DeepSeek Cordis define request');
  const plugin = assertRecord(define.plugin, 'DeepSeek Cordis plugin selection');
  const code = assertRecord(define.code, 'DeepSeek Cordis code');
  assertExactKeys(plugin, ['kind', 'idPrefix'], 'DeepSeek Cordis plugin selection');
  if (plugin.kind !== 'new' || plugin.idPrefix !== DEEPSEEK_CORDIS_ID_PREFIX) {
    throw new TypeError('DeepSeek Cordis payload must define a new DexThemes plugin');
  }
  if (typeof define.name !== 'string' || !define.name.trim() || define.name.length > 100) {
    throw new TypeError('DeepSeek Cordis payload requires a bounded package name');
  }
  if (typeof define.purpose !== 'string' || !define.purpose.trim() || define.purpose.length > 240) {
    throw new TypeError('DeepSeek Cordis payload requires a bounded package purpose');
  }
  if (Object.keys(code).length !== 1 || code.client !== buildCordisClientCode(tokens)) {
    throw new TypeError('DeepSeek Cordis client code does not match the validated token payload');
  }
  if (input.activation?.tool !== 'cordis_run' || input.activation?.mode !== 'run') {
    throw new TypeError('DeepSeek Cordis payload must use the supported cordis_run activation');
  }
  const activation = assertRecord(input.activation, 'DeepSeek Cordis activation');
  assertExactKeys(activation, ['tool', 'mode', 'requires'], 'DeepSeek Cordis activation');
  assertExactStringArray(activation.requires, ['pluginId', 'packageId'], 'DeepSeek Cordis activation requirements');
  if (input.reversal?.tool !== 'cordis_stop') {
    throw new TypeError('DeepSeek Cordis payload must use cordis_stop for reversal');
  }
  const reversal = assertRecord(input.reversal, 'DeepSeek Cordis reversal');
  assertExactKeys(reversal, ['tool', 'requires'], 'DeepSeek Cordis reversal');
  assertExactStringArray(reversal.requires, ['pluginId'], 'DeepSeek Cordis reversal requirements');
  const fonts = assertRecord(input.fonts, 'DeepSeek Cordis fonts declaration');
  assertExactKeys(fonts, ['supported'], 'DeepSeek Cordis fonts declaration');
  if (input.fonts?.supported !== false) {
    throw new TypeError('DeepSeek Cordis payload must not claim font support');
  }
  return input;
}

export function buildDeepSeekIntegrationMetadata(theme, publicThemeId) {
  const eligible = isDeepSeekThemeEligible(theme);
  const id = encodeURIComponent(String(publicThemeId || theme?.id || theme?.themeId || ''));
  const packageUrl = eligible && id ? `/api/deepseek-theme?theme=${id}` : null;
  return Object.freeze({
    eligible,
    mechanism: 'cordis-theme-override',
    packageUrl,
    applyPreparationUrl: packageUrl,
    requiresInstalledCordisSurface: true,
    installedPluginPackage: '@dexthemes/deepseek-harness-plugin',
    installedPluginSurface: 'settings.plugins.dexthemes',
    oneClickScope: 'installed-plugin',
    fontsSupported: false,
  });
}
