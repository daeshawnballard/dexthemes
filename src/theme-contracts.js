import { buildCodexThemeImport } from '../shared/codex-theme-contract.js';

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
  return buildCodexThemeImport(theme, variant, accentIdx).importString;
}
