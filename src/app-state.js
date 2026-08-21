// ================================================
// DexThemes — Mutable App State
// ================================================

import { THEMES } from './theme-catalog.js';
import { SUPPORTER_THEME_ID, getUnlockActionForThemeId } from './unlocks.js';
import { normalizeThemeVariant, readPlatformParam, readThemeRoute, syncThemeUrl } from './theme-url.js';
import { getWebsiteThemeId, resolvePluginThemeSourceId } from '../shared/plugin-public-policy.js';
import { DEFAULT_PLATFORM_ID, getPlatform, normalizePlatformId } from '../shared/platform-registry.js';
import { resolveSelectedPlatformId } from './platform-selection.js';
import {
  getCatalogCategoriesForPlatform,
  isThemeCategoryVisibleForPlatform,
  PLATFORM_THEME_CATEGORY_IDS,
} from './platform-catalog.js';

// URL state takes priority over localStorage. Query deep links are canonicalized
// to copyable paths such as /mancity/dark after their values are read.
const _themeRoute = readThemeRoute(window.location);
const _landingParams = new URLSearchParams(window.location.search);
const _landingSourceValue = String(_landingParams.get('source') || '').toLowerCase();
const _knownLandingSources = new Set(['theme_page', 'collection_page', 'guide_page']);
const _referrerHost = (() => {
  try {
    return document.referrer ? new URL(document.referrer).hostname.toLowerCase() : '';
  } catch {
    return '';
  }
})();
const _referralChannel = (() => {
  if (!_referrerHost) return 'direct';
  if (_referrerHost === window.location.hostname.toLowerCase()) return 'internal';
  if (/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/.test(_referrerHost)) return 'chatgpt';
  if (/(^|\.)google\.|(^|\.)bing\.com$|(^|\.)duckduckgo\.com$/.test(_referrerHost)) return 'search';
  if (/(^|\.)x\.com$|(^|\.)twitter\.com$|(^|\.)reddit\.com$/.test(_referrerHost)) return 'social';
  return 'referral';
})();
export const landingContext = Object.freeze({
  source: _knownLandingSources.has(_landingSourceValue) ? _landingSourceValue : 'app',
  referralChannel: _referralChannel,
});
const _routeThemeId = _themeRoute.themeId;
const _urlThemeId = _routeThemeId ? resolvePluginThemeSourceId(_routeThemeId) : null;
const _urlVariant = _themeRoute.variant;
const _urlPlatformId = normalizePlatformId(readPlatformParam(window.location));
const _savedPlatformId = normalizePlatformId(localStorage.getItem('dexthemes-platform'));
export let selectedPlatformId = resolveSelectedPlatformId({
  urlPlatformId: _urlPlatformId,
  hasUrlPlatform: _landingParams.has('platform'),
  storedPlatformId: _savedPlatformId,
});
export let selectedPlatform = getPlatform(selectedPlatformId);
const _storedThemeId = localStorage.getItem('dexthemes-selected');
const _platformDefaultThemeId = selectedPlatform.defaultThemeId || null;
const _savedThemeId = _urlThemeId || (
  _landingParams.has('platform')
    ? _platformDefaultThemeId
    : (_storedThemeId || _platformDefaultThemeId)
);
const _requestedTheme = _savedThemeId && THEMES.find((theme) => theme.id === _savedThemeId);
const _requestedThemeIsProtected = Boolean(_requestedTheme && getUnlockActionForThemeId(_requestedTheme.id));

function findPlatformThemeFallback(platformId, defaultThemeId = null) {
  const visibleCategoryIds = new Set(
    getCatalogCategoriesForPlatform(platformId).map((category) => category.id),
  );
  const candidates = [
    defaultThemeId ? THEMES.find((theme) => theme.id === defaultThemeId) : null,
    THEMES.find((theme) => theme.category === [...visibleCategoryIds][0] && !getUnlockActionForThemeId(theme.id)),
    THEMES.find((theme) => theme.category === 'dexthemes' && !getUnlockActionForThemeId(theme.id)),
    THEMES.find((theme) => visibleCategoryIds.has(theme.category) && !getUnlockActionForThemeId(theme.id)),
  ];
  return candidates.find(Boolean) || THEMES[0];
}

// Protected reward palettes are never rendered from a URL or localStorage
// before the current account's unlocks have been verified.
const _requestedThemeIsVisible = Boolean(
  _requestedTheme
  && isThemeCategoryVisibleForPlatform(_requestedTheme.category, selectedPlatformId),
);
export let selectedTheme = (
  _requestedTheme && !_requestedThemeIsProtected && _requestedThemeIsVisible
    ? _requestedTheme
    : null
) || findPlatformThemeFallback(selectedPlatformId, _platformDefaultThemeId);
export let selectedVariant = _urlVariant || normalizeThemeVariant(localStorage.getItem('dexthemes-variant')) || 'dark';
export let deferredProtectedThemeId = _requestedThemeIsProtected && _requestedThemeIsVisible
  ? _requestedTheme.id
  : null;

// Track if we arrived via a share deep link (for mobile auto-preview)
export const isDeepLink = !!_routeThemeId;
export const deepLinkThemeId = _urlThemeId;

// Keep the address bar aligned with what the preview is actually showing.
if (_routeThemeId) {
  syncThemeUrl(getWebsiteThemeId(selectedTheme), selectedVariant, { platformId: selectedPlatformId });
} else if (_storedThemeId && selectedTheme.id === _storedThemeId) {
  syncThemeUrl(getWebsiteThemeId(selectedTheme), selectedVariant, { platformId: selectedPlatformId });
}

export let selectedAccentIdx = 0;
export let expandedCategories = Object.fromEntries(
  [...PLATFORM_THEME_CATEGORY_IDS, 'dexthemes', 'community'].map((categoryId) => [categoryId, false]),
);
export let expandedSubgroups = {
  ...Object.fromEntries(PLATFORM_THEME_CATEGORY_IDS.map((categoryId) => [categoryId, {}])),
  dexthemes: {
    anime: false, games: false, movies: false,
    comics: false, zodiacs: false, lunar: false, companies: false, originals: false, supporter: false,
  },
  community: {},
};
export let pinnedSubgroups = {
  ...Object.fromEntries(PLATFORM_THEME_CATEGORY_IDS.map((categoryId) => [categoryId, {}])),
  dexthemes: {},
  community: {},
};
export let currentExampleIdx = Math.floor(Math.random() * 4);
export let windowState = 'normal';
export let activeFilter = 'all';
export let activeSort = 'default';
export let panelMode = 'preview';
export let themeView = 'preview';
export let builderColors = null;
export let openDropdown = null;
export let leaderboardVisible = false;
export let profileVisible = false;
export let userUnlocks = new Set();
export let supporterPromptShown = false;
export let currentUser = null;
export let flaggedThemes = new Set();

export function setUserUnlocks(unlocks) { userUnlocks = unlocks; }
export function clearDeferredProtectedThemeId() { deferredProtectedThemeId = null; }
export function isCurrentUserSupporter() { return userUnlocks.has(SUPPORTER_THEME_ID); }
export function setSupporterPromptShown(value) { supporterPromptShown = value; }

// State setters (needed because ES module exports are read-only bindings)
export function setSelectedTheme(theme) {
  selectedTheme = theme;
  try {
    localStorage.setItem('dexthemes-selected', theme.id);
    // Cache theme colors for flash-free reload
    localStorage.setItem('dexthemes-theme-cache', JSON.stringify({
      dark: theme.dark || null,
      light: theme.light || null,
      accents: theme.accents || []
    }));
  } catch {}
  syncSelectedThemeUrl();
}

export function setSelectedVariant(variant) {
  selectedVariant = variant;
  try { localStorage.setItem('dexthemes-variant', variant); } catch {}
  syncSelectedThemeUrl();
}

export function syncSelectedThemeUrl() {
  syncThemeUrl(getWebsiteThemeId(selectedTheme), selectedVariant, { platformId: selectedPlatformId });
}

export function setSelectedPlatform(platformId) {
  const normalized = normalizePlatformId(platformId);
  if (!normalized) return false;
  const changed = normalized !== selectedPlatformId;
  selectedPlatformId = normalized;
  selectedPlatform = getPlatform(normalized);
  try { localStorage.setItem('dexthemes-platform', normalized); } catch {}
  const currentThemeRemainsVisible = isThemeCategoryVisibleForPlatform(
    selectedTheme.category,
    normalized,
  );
  const nextTheme = changed && (!currentThemeRemainsVisible || selectedPlatform.defaultThemeId)
    ? findPlatformThemeFallback(normalized, selectedPlatform.defaultThemeId)
    : null;
  if (nextTheme && selectedTheme.id !== nextTheme.id) {
    selectedAccentIdx = 0;
    setSelectedTheme(nextTheme);
    return true;
  }
  syncSelectedThemeUrl();
  return true;
}

export function setSelectedAccentIdx(index) { selectedAccentIdx = index; }
export function setCurrentExampleIdx(index) { currentExampleIdx = index; }
export function setWindowState(nextState) { windowState = nextState; }
export function setActiveFilter(filter) { activeFilter = filter; }
export function setActiveSort(sort) { activeSort = sort; }
export function setPanelMode(mode) { panelMode = mode; }
export function setThemeView(view) { themeView = view === 'details' ? 'details' : 'preview'; }
export function setBuilderColors(colors) { builderColors = colors; }
export function setOpenDropdown(dropdown) { openDropdown = dropdown; }
export function setLeaderboardVisible(value) { leaderboardVisible = value; }
export function setProfileVisible(value) { profileVisible = value; }
export function setCurrentUser(user) { currentUser = user; }
