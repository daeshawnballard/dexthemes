import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';
import { buildDeepSeekCordisPayload } from '../shared/deepseek-theme-contract.js';
import {
  getWebsiteThemeId,
  presentThemeForPublicApi,
  resolvePluginThemeSourceId,
} from '../shared/plugin-public-policy.js';
import { fetchCommunityThemes } from './theme-data.js';

export const config = { runtime: 'edge' };

function json(payload, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': status === 200 ? 'public, max-age=300, s-maxage=3600' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

async function findTheme(requestedId) {
  const sourceId = resolvePluginThemeSourceId(requestedId);
  const staticTheme = STATIC_THEME_CATALOG.find((theme) => (
    !theme._hiddenUntilUnlocked
    && (theme.id === sourceId || getWebsiteThemeId(theme) === requestedId)
  ));
  if (staticTheme) return presentThemeForPublicApi(staticTheme);

  try {
    const communityThemes = await fetchCommunityThemes();
    const communityTheme = communityThemes.find((theme) => (
      theme.id === sourceId || theme.themeId === sourceId
    ));
    return presentThemeForPublicApi(communityTheme);
  } catch {
    return null;
  }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return json({}, 204);
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const requestedId = new URL(req.url).searchParams.get('theme')?.trim().toLowerCase();
  if (!requestedId) return json({ error: 'A theme query parameter is required' }, 400);
  const theme = await findTheme(requestedId);
  if (!theme) return json({ error: 'Theme not found' }, 404);

  try {
    return json(buildDeepSeekCordisPayload(theme));
  } catch (error) {
    return json({
      error: 'Theme is not eligible for DeepSeek Harness',
      reason: error instanceof Error ? error.message : 'Invalid theme palette',
    }, 422);
  }
}
