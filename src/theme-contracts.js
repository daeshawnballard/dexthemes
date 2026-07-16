import { isSixDigitHexColor } from './utils.js';

const IMPORT_COLOR_KEYS = ['surface', 'ink', 'accent', 'diffAdded', 'diffRemoved', 'skill'];

export function getThemeVariants(theme) {
  if (theme.variants) return theme.variants;
  const variants = [];
  if (theme.dark) variants.push('dark');
  if (theme.light) variants.push('light');
  return variants;
}

export function themeHasVariant(theme, variant) {
  return getThemeVariants(theme).includes(variant);
}

export function isThemeVisibleInCatalog(theme, unlockedThemeIds = new Set()) {
  if (!theme?._hiddenUntilUnlocked) return true;
  return unlockedThemeIds.has(theme.id);
}

export function buildThemeImportString(theme, variant, accentIdx = 0) {
  const selected = theme?.[variant];
  if (!selected) return '';

  const accent = theme.accents?.[accentIdx] || selected.accent;
  if (
    !IMPORT_COLOR_KEYS.every((key) => isSixDigitHexColor(selected[key])) ||
    !isSixDigitHexColor(accent) ||
    !Number.isFinite(selected.contrast) ||
    selected.contrast < 0 ||
    selected.contrast > 100
  ) {
    return '';
  }
  const codeThemeId = typeof theme.codeThemeId === 'string'
    ? theme.codeThemeId
    : (theme.codeThemeId && theme.codeThemeId[variant]) || 'codex';

  return `codex-theme-v1:${JSON.stringify({
    codeThemeId,
    theme: {
      accent,
      contrast: selected.contrast,
      fonts: selected.fonts ?? { code: null, ui: null },
      ink: selected.ink,
      opaqueWindows: selected.opaqueWindows ?? true,
      semanticColors: {
        diffAdded: selected.diffAdded,
        diffRemoved: selected.diffRemoved,
        skill: selected.skill,
      },
      surface: selected.surface,
    },
    variant,
  })}`;
}
