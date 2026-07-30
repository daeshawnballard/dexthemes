import { STATIC_THEME_CATALOG, normalizeDexThemesSubgroup } from '../shared/theme-api-catalog.js';
import { presentThemeForPublicApi } from '../shared/plugin-public-policy.js';

export const config = { runtime: 'edge' };

export default function handler(req) {
  const url = new URL(req.url);
  const subgroupSegment = url.searchParams.get('subgroup') || '';
  const normalizedGroup = normalizeDexThemesSubgroup(subgroupSegment);

  if (!normalizedGroup) {
    return new Response(JSON.stringify({ error: 'Unknown DexThemes subgroup' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const themes = STATIC_THEME_CATALOG.filter(
      (theme) => theme.category === 'dexthemes' && normalizeDexThemesSubgroup(theme.subgroup) === normalizedGroup,
    )
    .filter((theme) => !theme._hiddenUntilUnlocked)
    .map((theme) => presentThemeForPublicApi(theme))
    .filter(Boolean);

  return new Response(JSON.stringify(themes), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
