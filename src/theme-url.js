const THEME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const THEME_VARIANTS = new Set(['dark', 'light']);

export function normalizeThemeId(value) {
  if (typeof value !== 'string') return null;
  const themeId = value.trim();
  return THEME_ID_PATTERN.test(themeId) ? themeId : null;
}

export function normalizeThemeVariant(value) {
  return THEME_VARIANTS.has(value) ? value : null;
}

export function readThemeRoute(locationLike) {
  const searchParams = new URLSearchParams(locationLike?.search || '');
  const queryThemeId = normalizeThemeId(searchParams.get('theme'));
  const queryVariant = normalizeThemeVariant(searchParams.get('variant'));

  if (queryThemeId) {
    return { themeId: queryThemeId, variant: queryVariant, source: 'query' };
  }

  const segments = String(locationLike?.pathname || '/')
    .split('/')
    .filter(Boolean);

  if (segments.length === 2) {
    try {
      const pathThemeId = normalizeThemeId(decodeURIComponent(segments[0]));
      const pathVariant = normalizeThemeVariant(segments[1]);
      if (pathThemeId && pathVariant) {
        return { themeId: pathThemeId, variant: pathVariant, source: 'path' };
      }
    } catch {
      // Ignore malformed URL encoding and fall back to non-route state.
    }
  }

  return { themeId: null, variant: queryVariant, source: null };
}

export function buildThemePath(themeId, variant) {
  const normalizedThemeId = normalizeThemeId(themeId);
  const normalizedVariant = normalizeThemeVariant(variant);
  if (!normalizedThemeId || !normalizedVariant) return null;
  return `/${encodeURIComponent(normalizedThemeId)}/${normalizedVariant}`;
}

export function syncThemeUrl(
  themeId,
  variant,
  {
    historyImpl = globalThis.history,
    locationImpl = globalThis.location,
  } = {},
) {
  const themePath = buildThemePath(themeId, variant);
  if (!themePath || !historyImpl?.replaceState || !locationImpl) return false;

  const hash = locationImpl.hash || '';
  const nextUrl = `${themePath}${hash}`;
  const currentUrl = `${locationImpl.pathname || ''}${locationImpl.search || ''}${hash}`;
  if (currentUrl === nextUrl) return false;

  try {
    historyImpl.replaceState(null, '', nextUrl);
    return true;
  } catch {
    return false;
  }
}
