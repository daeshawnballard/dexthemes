import { getThemeProvenancePresentation } from '../shared/theme-provenance.js';

export function getThemeAttribution(theme) {
  if (!theme) return null;

  if (theme.category === 'community' && theme._authorName) {
    return {
      label: theme._authorName,
      reportable: Boolean(theme._convexId),
      isSupporter: Boolean(theme._authorIsSupporter),
      isAgent: Boolean(theme._authorIsAgent),
    };
  }

  if (theme.category === 'dexthemes') {
    return {
      label: 'DexThemes',
      reportable: false,
      isSupporter: false,
      isAgent: false,
    };
  }

  if (theme.category === 'official') {
    return {
      label: 'Codex',
      reportable: false,
      isSupporter: false,
      isAgent: false,
    };
  }

  return null;
}

export function getThemeProvenance(theme) {
  return getThemeProvenancePresentation(theme);
}
