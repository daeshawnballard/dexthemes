import { DEFAULT_PLATFORM_ID, getPlatform, normalizePlatformId } from '../shared/platform-registry.js';

const SHARED_CATEGORIES = Object.freeze([
  Object.freeze({
    id: 'dexthemes',
    name: 'DexThemes',
    icon: 'palette',
    groups: Object.freeze(['anime', 'games', 'movies', 'comics', 'zodiacs', 'lunar', 'companies', 'originals', 'supporter']),
  }),
  Object.freeze({ id: 'community', name: 'Community', icon: 'users' }),
]);

const PLATFORM_CATEGORY_IDS = Object.freeze({
  codex: 'official',
  deepseek: 'deepseek',
  claude: 'claude',
  gemini: 'gemini',
  qwen: 'qwen',
  opencode: 'opencode',
  pi: 'pi',
  zed: 'zed',
  cursor: 'cursor',
  t3code: 't3code',
  conductor: 'conductor',
});

const PLATFORM_CATEGORY_ICONS = Object.freeze({
  codex: 'shield',
  deepseek: 'waves',
});

export const PLATFORM_THEME_CATEGORY_IDS = Object.freeze(
  [...new Set(Object.values(PLATFORM_CATEGORY_IDS))],
);

export function getPlatformThemeCategoryId(platformId = DEFAULT_PLATFORM_ID) {
  const normalized = normalizePlatformId(platformId) || DEFAULT_PLATFORM_ID;
  return PLATFORM_CATEGORY_IDS[normalized] || normalized;
}

export function getCatalogCategoriesForPlatform(platformId = DEFAULT_PLATFORM_ID) {
  const platform = getPlatform(platformId);
  const platformCategory = Object.freeze({
    id: getPlatformThemeCategoryId(platform.id),
    name: platform.shortName,
    icon: PLATFORM_CATEGORY_ICONS[platform.id] || 'terminal',
    platformId: platform.id,
  });
  return Object.freeze([platformCategory, ...SHARED_CATEGORIES]);
}

export function isThemeCategoryVisibleForPlatform(categoryId, platformId = DEFAULT_PLATFORM_ID) {
  return getCatalogCategoriesForPlatform(platformId).some((category) => category.id === categoryId);
}

export function getEmptyCategoryCopy(categoryId, platformId = DEFAULT_PLATFORM_ID) {
  if (categoryId === 'community') return 'No community themes yet';
  if (categoryId === 'dexthemes') return 'No DexThemes palettes match';
  const platform = getPlatform(platformId);
  return `${platform.shortName} collection coming soon`;
}
