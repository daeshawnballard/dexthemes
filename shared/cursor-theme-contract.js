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

function buildColorTheme(theme, variant, options) {
  const palette = getCanonicalPalette(theme, variant, options);
  return deepFreeze({
    name: `${getThemeDisplayName(theme)} ${variant === 'dark' ? 'Dark' : 'Light'}`,
    type: variant,
    colors: {
      'activityBar.background': palette.sidebar,
      'activityBar.foreground': palette.ink,
      'diffEditor.insertedTextBackground': palette.addedBg,
      'diffEditor.removedTextBackground': palette.removedBg,
      'editor.background': palette.codeBg,
      'editor.foreground': palette.ink,
      'editor.selectionBackground': palette.selection,
      'editorGroupHeader.tabsBackground': palette.sidebar,
      'editorLineNumber.activeForeground': palette.ink,
      'editorLineNumber.foreground': palette.muted,
      focusBorder: palette.accent,
      'input.background': palette.surface,
      'input.foreground': palette.ink,
      'list.activeSelectionBackground': palette.selection,
      'list.activeSelectionForeground': palette.ink,
      'panel.background': palette.surface,
      'panel.border': palette.border,
      'sideBar.background': palette.sidebar,
      'sideBar.foreground': palette.ink,
      'statusBar.background': palette.accent,
      'statusBar.foreground': palette.surface,
      'titleBar.activeBackground': palette.surface,
      'titleBar.activeForeground': palette.ink,
    },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: palette.muted } },
      { scope: ['keyword', 'storage.type'], settings: { foreground: palette.accent } },
      { scope: ['entity.name.function', 'support.function'], settings: { foreground: palette.skill } },
      { scope: ['string'], settings: { foreground: palette.diffAdded } },
      { scope: ['constant.numeric'], settings: { foreground: palette.diffRemoved } },
      { scope: ['variable', 'identifier'], settings: { foreground: palette.ink } },
    ],
  });
}

export function validateCursorThemeSource(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Cursor review theme must be an object.'] });
  }
  if (Object.keys(value).sort().join(',') !== 'colors,name,tokenColors,type') {
    errors.push('Cursor review theme must contain exactly colors, name, tokenColors, and type.');
  }
  if (!['dark', 'light'].includes(value.type)) errors.push('Cursor review theme type must be dark or light.');
  if (typeof value.name !== 'string' || !value.name.trim()) errors.push('Cursor review theme name is required.');
  if (!value.colors || typeof value.colors !== 'object' || Array.isArray(value.colors)) {
    errors.push('Cursor review theme colors must be an object.');
  } else {
    for (const [key, color] of Object.entries(value.colors)) {
      try {
        normalizeHexColor(color, `Cursor source ${key}`);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }
  if (!Array.isArray(value.tokenColors) || !value.tokenColors.length) {
    errors.push('Cursor review theme tokenColors must be a non-empty array.');
  } else {
    for (const [index, rule] of value.tokenColors.entries()) {
      if (!rule || typeof rule !== 'object' || Array.isArray(rule)
        || Object.keys(rule).sort().join(',') !== 'scope,settings') {
        errors.push(`Cursor token rule ${index} must contain scope and settings.`);
        continue;
      }
      if (!Array.isArray(rule.scope) || !rule.scope.length
        || rule.scope.some((scope) => typeof scope !== 'string' || !scope.trim())) {
        errors.push(`Cursor token rule ${index} scope must be a non-empty string array.`);
      }
      if (!rule.settings || typeof rule.settings !== 'object' || Array.isArray(rule.settings)
        || Object.keys(rule.settings).sort().join(',') !== 'foreground') {
        errors.push(`Cursor token rule ${index} settings must contain only foreground.`);
      } else {
        try {
          normalizeHexColor(rule.settings.foreground, `Cursor token rule ${index}`);
        } catch (error) {
          errors.push(error.message);
        }
      }
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function validateCursorExtensionManifest(value, expectedThemeCount) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return deepFreeze({ valid: false, errors: ['Cursor review manifest must be an object.'] });
  }
  const allowed = new Set([
    'name', 'displayName', 'description', 'version', 'publisher', 'private', 'license',
    'engines', 'categories', 'extensionKind', 'contributes',
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key))) errors.push('Cursor review manifest contains an unsupported field.');
  if (!/^dexthemes-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.name || '')) errors.push('Cursor review manifest name is invalid.');
  if (value.version !== '0.0.0' || value.private !== true) errors.push('Cursor review source must remain private version 0.0.0.');
  if (value.publisher !== 'replace-with-authorized-publisher') errors.push('Cursor review source must retain the publisher placeholder.');
  if (value.license !== 'MIT') errors.push('Cursor review source license must be MIT.');
  if (value.engines?.vscode !== '^1.85.0') errors.push('Cursor review source must pin its reviewed VS Code engine baseline.');
  if (!Array.isArray(value.categories) || value.categories.join(',') !== 'Themes') errors.push('Cursor review source must use the Themes category only.');
  if (!Array.isArray(value.extensionKind) || value.extensionKind.join(',') !== 'ui') errors.push('Cursor review source must remain a UI-only extension.');
  const themes = value.contributes?.themes;
  if (!Array.isArray(themes) || themes.length !== expectedThemeCount) {
    errors.push('Cursor review source has an invalid theme contribution count.');
  } else {
    for (const [index, contribution] of themes.entries()) {
      if (!contribution || typeof contribution !== 'object'
        || Object.keys(contribution).sort().join(',') !== 'label,path,uiTheme') {
        errors.push(`Cursor contribution ${index} is malformed.`);
        continue;
      }
      if (!['vs', 'vs-dark'].includes(contribution.uiTheme)) errors.push(`Cursor contribution ${index} has an invalid uiTheme.`);
      if (!/^\.\/themes\/[a-z0-9-]+-(?:dark|light)-color-theme\.json$/.test(contribution.path || '')) {
        errors.push(`Cursor contribution ${index} has an unsafe theme path.`);
      }
    }
  }
  return deepFreeze({ valid: errors.length === 0, errors: [...new Set(errors)] });
}

export function buildCursorThemeSource(theme, options = {}) {
  const slug = getThemeSlug(theme);
  const definitions = getThemeVariants(theme).map((variant) => {
    const value = buildColorTheme(theme, variant, options);
    const validation = validateCursorThemeSource(value);
    if (!validation.valid) throw new TypeError(validation.errors[0]);
    return { variant, value };
  });
  const extensionName = `dexthemes-${slug}`.slice(0, 80);
  const manifest = deepFreeze({
    name: extensionName,
    displayName: `${getThemeDisplayName(theme)} · DexThemes`,
    description: 'Review-only VS Code color-theme extension source. Cursor compatibility is not runtime-proven.',
    version: '0.0.0',
    publisher: 'replace-with-authorized-publisher',
    private: true,
    license: 'MIT',
    engines: { vscode: '^1.85.0' },
    categories: ['Themes'],
    extensionKind: ['ui'],
    contributes: {
      themes: definitions.map(({ variant }) => ({
        label: `${getThemeDisplayName(theme)} ${variant === 'dark' ? 'Dark' : 'Light'}`,
        uiTheme: variant === 'dark' ? 'vs-dark' : 'vs',
        path: `./themes/${slug}-${variant}-color-theme.json`,
      })),
    },
  });
  const manifestValidation = validateCursorExtensionManifest(manifest, definitions.length);
  if (!manifestValidation.valid) throw new TypeError(manifestValidation.errors[0]);
  const readme = '# DexThemes Cursor review source\n\n'
    + 'This directory is VS Code color-theme extension source for publisher and compatibility review. '
    + 'The publisher field is an intentional placeholder. This source is not proof of Cursor marketplace acceptance, '
    + 'installation, Agent-window coverage, or loaded runtime behavior.\n';
  return buildHostExport({
    platformId: 'cursor',
    adapterVersion: 'cursor-theme-source-v1',
    format: 'vscode-color-theme-extension-source',
    deliveryState: 'review_only_source',
    theme,
    files: [
      exportFile('package.json', manifest),
      exportFile('README.md', readme, { mediaType: 'text/markdown', serialized: true }),
      ...definitions.map(({ variant, value }) => exportFile(`themes/${slug}-${variant}-color-theme.json`, value)),
    ],
    unsupportedFields: [
      'fonts', 'alpha', 'gradients', 'glow', 'shadows', 'blur', 'patterns', 'images',
      'animation', 'automaticInstall', 'cursorAgentSurfaceCoverage',
    ],
    setup: {
      distributionGate: 'Requires publisher review and Cursor marketplace availability before user installation can be claimed.',
      documentedInstall: 'Users install published theme extensions from Cursor Extensions.',
      selection: 'Preferences: Color Theme',
      reversal: 'Select another theme or disable the extension.',
      cursorContractUrl: 'https://cursor.com/help/customization/themes',
      packageFormatAuthority: 'https://code.visualstudio.com/api/extension-guides/color-theme',
    },
  });
}

export function validateCursorThemeExport(theme, options = {}) {
  return validateHostBuilder(buildCursorThemeSource, theme, options);
}
