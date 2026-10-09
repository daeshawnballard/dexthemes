import { T3CODE_THEME_COLOR_ROLES, validateT3CodeThemeFile } from '../../../shared/t3code-theme-contract.js';

/** This local-write boundary rejects coercible values, while preserving the submitted exporter. */
export function isStrictT3ThemeFile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.id !== 'string') return false;
  const maps = [value.colors, ...Object.values(value.variants || {})];
  if (maps.some((map) => !map || typeof map !== 'object' || Array.isArray(map)
    || T3CODE_THEME_COLOR_ROLES.some((role) => typeof map[role] !== 'string'))) return false;
  return validateT3CodeThemeFile(value).valid;
}
