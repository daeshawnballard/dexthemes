export const COMMUNITY_THEMES_URL = 'https://acrobatic-corgi-867.convex.site/themes/community';

const COMMUNITY_FETCH_TIMEOUT_MS = 4000;

export async function fetchCommunityThemes({ fetchImpl = globalThis.fetch, signal } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('A fetch implementation is required to load community themes');
  }

  const requestSignal = signal || (
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(COMMUNITY_FETCH_TIMEOUT_MS)
      : undefined
  );

  const res = await fetchImpl(COMMUNITY_THEMES_URL, {
    headers: { Origin: 'https://www.dexthemes.com' },
    ...(requestSignal ? { signal: requestSignal } : {}),
  });

  if (!res.ok) {
    throw new Error(`Community themes request failed with status ${res.status}`);
  }

  const themes = await res.json();
  if (!Array.isArray(themes)) {
    throw new TypeError('Community themes response must be an array');
  }

  return themes;
}

export async function resolveTheme(themeMap, themeId, options) {
  if (Object.hasOwn(themeMap, themeId)) {
    return themeMap[themeId];
  }

  const communityThemes = await fetchCommunityThemes(options);
  return communityThemes.find((theme) => theme.id === themeId || theme.themeId === themeId) || null;
}

export function buildThemeImageVersion(theme, fallbackVersion = '1') {
  if (!theme) return fallbackVersion;

  const serializedTheme = JSON.stringify([
    theme.id || theme.themeId || '',
    theme.name || '',
    theme.dark || null,
    theme.light || null,
  ]);

  let hash = 2166136261;
  for (let i = 0; i < serializedTheme.length; i += 1) {
    hash ^= serializedTheme.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return `${fallbackVersion}-${(hash >>> 0).toString(36)}`;
}
