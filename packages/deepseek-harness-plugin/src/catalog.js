import { buildDeepSeekThemeTokens, isDeepSeekThemeEligible } from '../../../shared/deepseek-theme-contract.js';
import { BUNDLED_THEME_CATALOG } from './catalog.generated.js';

export const DEXTHEMES_PUBLIC_CATALOG_URL = 'https://www.dexthemes.com/api/themes';

const MAX_TEXT_LENGTH = 180;
const VISIBLE_CATEGORIES = new Set(['deepseek', 'dexthemes', 'community']);

function boundedText(value, fallback = '') {
  return String(value || fallback).replace(/[\r\n\t]+/g, ' ').trim().slice(0, MAX_TEXT_LENGTH);
}

function boundedHttpsUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.href.slice(0, 600) : '';
  } catch {
    return '';
  }
}

/** Normalize one public or bundled theme into the installed plugin's owned shape. */
export function normalizeHarnessTheme(theme, { allowUnlockable = false } = {}) {
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return null;
  if (theme._hiddenUntilUnlocked) return null;
  const unlockable = boundedText(theme.subgroup, '').toLowerCase() === 'unlockables';
  if (unlockable && !allowUnlockable) return null;
  if (!isDeepSeekThemeEligible(theme)) return null;
  const id = boundedText(theme.id || theme.themeId, '');
  const name = boundedText(theme.name, '');
  const category = boundedText(theme.category, 'community').toLowerCase();
  if (!id || !name || !VISIBLE_CATEGORIES.has(category)) return null;
  return Object.freeze({
    id,
    name,
    summary: boundedText(theme.summary || theme._summary, ''),
    category,
    subgroup: boundedText(theme.subgroup, ''),
    sourceLabel: boundedText(theme.sourceLabel, ''),
    evidenceUrl: boundedHttpsUrl(theme.evidenceUrl),
    unofficial: theme.unofficial === true,
    dark: Object.freeze({ ...theme.dark }),
    light: Object.freeze({ ...theme.light }),
  });
}

/** Add only server-verified reward themes returned by the bearer account API. */
export function mergeUnlockedHarnessThemes(themes, unlocks) {
  const verified = (Array.isArray(unlocks) ? unlocks : [])
    .map((unlock) => normalizeHarnessTheme(unlock?.theme, { allowUnlockable: true }))
    .filter(Boolean);
  return mergeHarnessThemes(themes, verified, { allowUnlockable: true });
}

/** Bundled fallback catalog available before any network request. */
export const BUNDLED_HARNESS_THEMES = Object.freeze(
  BUNDLED_THEME_CATALOG.map(normalizeHarnessTheme).filter(Boolean),
);

/** Merge remote public/community entries over the bundled snapshot by stable id. */
export function mergeHarnessThemes(bundled, remote, { allowUnlockable = false } = {}) {
  const byId = new Map();
  for (const candidate of [...bundled, ...remote]) {
    const theme = normalizeHarnessTheme(candidate, { allowUnlockable });
    if (theme) byId.set(theme.id, theme);
  }
  return Object.freeze([...byId.values()].sort((left, right) => left.name.localeCompare(right.name)));
}

/** Search locally so user text is never transmitted as analytics or API query data. */
export function searchHarnessThemes(themes, query, category = 'all') {
  const normalized = boundedText(query, '').toLocaleLowerCase();
  return themes.filter((theme) => {
    if (category !== 'all' && theme.category !== category) return false;
    if (!normalized) return true;
    return [theme.id, theme.name, theme.summary, theme.category, theme.subgroup]
      .some((value) => value.toLocaleLowerCase().includes(normalized));
  });
}

/** Resolve validated Harness semantic token pairs for a selected theme. */
export function tokensForHarnessTheme(theme) {
  return buildDeepSeekThemeTokens(theme);
}

/** Load the public catalog without credentials, prompts, or workspace data. */
export async function loadPublicHarnessThemes({ fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required');
  const response = await fetchImpl(DEXTHEMES_PUBLIC_CATALOG_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`DexThemes catalog request failed with status ${response.status}`);
  const payload = await response.json();
  if (!payload || !Array.isArray(payload.themes)) {
    throw new TypeError('DexThemes catalog response must contain a themes array');
  }
  return mergeHarnessThemes([], payload.themes);
}
