import { STATIC_THEME_CATALOG, normalizeDexThemesSubgroup } from '../shared/theme-api-catalog.js';
import {
  isThemePubliclyDiscoverable,
  presentThemeForPublicApi,
  resolvePluginThemeSourceId,
  websiteThemeMatchesSearch,
} from '../shared/plugin-public-policy.js';

export const config = { runtime: 'edge' };

const COMMUNITY_THEMES_URL = 'https://acrobatic-corgi-867.convex.site/themes/community';

async function fetchCommunityThemes() {
  const res = await fetch(COMMUNITY_THEMES_URL, {
    headers: { Origin: 'https://www.dexthemes.com' },
  });
  if (!res.ok) return [];
  return res.json();
}

function filterThemes(themes, { id, search, variant, category, subgroup }) {
  let results = themes;

  if (id) {
    const resolvedId = resolvePluginThemeSourceId(id);
    results = results.filter((theme) => theme.id === resolvedId || theme.themeId === resolvedId);
  }

  if (category) {
    results = results.filter((theme) => theme.category === category);
  }

  if (subgroup) {
    const normalized = normalizeDexThemesSubgroup(subgroup);
    if (normalized) {
      results = results.filter(
        (theme) => theme.category === 'dexthemes' && normalizeDexThemesSubgroup(theme.subgroup) === normalized,
      );
    } else {
      results = [];
    }
  }

  if (search) {
    results = results.filter((theme) => websiteThemeMatchesSearch(theme, search));
  }

  if (variant === 'dark') {
    results = results.filter((theme) => theme.dark);
  } else if (variant === 'light') {
    results = results.filter((theme) => theme.light);
  }

  return results;
}

function visibleStaticThemes() {
  return STATIC_THEME_CATALOG.filter(isThemePubliclyDiscoverable);
}

export default async function handler(req) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const search = url.searchParams.get('q');
  const variant = url.searchParams.get('variant');
  const category = url.searchParams.get('category');
  const subgroup = url.searchParams.get('subgroup');
  const subgroupResponse = url.searchParams.get('response') === 'subgroup';

  const communityThemes = await fetchCommunityThemes();
  const allThemes = [...visibleStaticThemes(), ...communityThemes];
  const results = filterThemes(allThemes, { id, search, variant, category, subgroup })
    .map((theme) => presentThemeForPublicApi(theme))
    .filter(Boolean);

  if (subgroupResponse) {
    if (!normalizeDexThemesSubgroup(subgroup || '')) {
      return new Response(JSON.stringify({ error: 'Unknown DexThemes subgroup' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    });
  }

  return new Response(
    JSON.stringify({
      count: results.length,
      themes: results,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    },
  );
}
