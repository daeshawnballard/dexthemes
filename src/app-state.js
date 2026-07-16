// ================================================
// DexThemes — Mutable App State
// ================================================

import { THEMES } from './theme-catalog.js';
import { SUPPORTER_THEME_ID } from './unlocks.js';
import { normalizeThemeVariant, readThemeRoute, syncThemeUrl } from './theme-url.js';

// URL state takes priority over localStorage. Query deep links are canonicalized
// to copyable paths such as /mancity/dark after their values are read.
const _themeRoute = readThemeRoute(window.location);
const _urlThemeId = _themeRoute.themeId;
const _urlVariant = _themeRoute.variant;
const _savedThemeId = _urlThemeId || localStorage.getItem('dexthemes-selected');

export let selectedTheme = (_savedThemeId && THEMES.find((theme) => theme.id === _savedThemeId)) || THEMES[0];
export let selectedVariant = _urlVariant || normalizeThemeVariant(localStorage.getItem('dexthemes-variant')) || 'dark';

// Track if we arrived via a share deep link (for mobile auto-preview)
export const isDeepLink = !!_urlThemeId;
export const deepLinkThemeId = _urlThemeId;

// Keep the address bar aligned with what the preview is actually showing.
if (_urlThemeId) {
  syncThemeUrl(_urlThemeId, selectedVariant);
} else if (_savedThemeId && selectedTheme.id === _savedThemeId) {
  syncThemeUrl(selectedTheme.id, selectedVariant);
}

export let selectedAccentIdx = 0;
export let expandedCategories = { official: false, dexthemes: false, community: false };
export let expandedSubgroups = {
  official: {},
  dexthemes: {
    anime: false, games: false, movies: false,
    comics: false, zodiacs: false, lunar: false, companies: false, originals: false, supporter: false,
  },
  community: {},
};
export let pinnedSubgroups = {
  official: {},
  dexthemes: {},
  community: {},
};
export let currentExampleIdx = Math.floor(Math.random() * 4);
export let windowState = 'normal';
export let activeFilter = 'all';
export let activeSort = 'default';
export let panelMode = 'preview';
export let builderColors = null;
export let openDropdown = null;
export let leaderboardVisible = false;
export let profileVisible = false;
export let userUnlocks = new Set();
export let supporterPromptShown = false;
export let currentUser = null;
export let flaggedThemes = new Set();

export function setUserUnlocks(unlocks) { userUnlocks = unlocks; }
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
  syncThemeUrl(selectedTheme?.id, selectedVariant);
}

export function setSelectedAccentIdx(index) { selectedAccentIdx = index; }
export function setCurrentExampleIdx(index) { currentExampleIdx = index; }
export function setWindowState(nextState) { windowState = nextState; }
export function setActiveFilter(filter) { activeFilter = filter; }
export function setActiveSort(sort) { activeSort = sort; }
export function setPanelMode(mode) { panelMode = mode; }
export function setBuilderColors(colors) { builderColors = colors; }
export function setOpenDropdown(dropdown) { openDropdown = dropdown; }
export function setLeaderboardVisible(value) { leaderboardVisible = value; }
export function setProfileVisible(value) { profileVisible = value; }
export function setCurrentUser(user) { currentUser = user; }
