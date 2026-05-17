import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const themeMap = JSON.parse(
  readFileSync(join(process.cwd(), 'api', 'theme-map.json'), 'utf-8')
);

/**
 * Social share landing page for DexThemes.
 *
 * Usage: /api/share?theme=codex&variant=dark
 *
 * Serves an HTML page with Open Graph + Twitter Card meta tags
 * pointing to the dynamic OG image. Immediately redirects human
 * visitors to the actual app with deep link params.
 */
export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const themeId = url.searchParams.get('theme') || 'codex';
  const variantKey = url.searchParams.get('variant') || 'dark';
  const imageVersion = url.searchParams.get('v') || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || '1';

  const theme = themeMap[themeId];
  const displayName = theme
    ? theme.name
    : themeId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const title = `${displayName} (${variantKey === 'light' ? 'Light' : 'Dark'}) for Codex | DexThemes`;
  const description = `Preview this Codex theme on DexThemes and apply it instantly.`;

  const origin = getRequestOrigin(req);
  const ogImageUrl = `${origin}/api/og?theme=${enc(themeId)}&variant=${enc(variantKey)}&v=${enc(imageVersion)}`;
  const appUrl = `${origin}/?theme=${enc(themeId)}&variant=${enc(variantKey)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImageUrl)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta property="og:url" content="${esc(appUrl)}">
<meta property="og:site_name" content="DexThemes">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImageUrl)}">
<meta name="twitter:image:alt" content="${esc(title)}">

<!-- Redirect human visitors to the app -->
<meta http-equiv="refresh" content="0;url=${esc(appUrl)}">
</head>
<body>
<p>Redirecting to <a href="${esc(appUrl)}">DexThemes</a>...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.status(200).send(html);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function enc(str) {
  return encodeURIComponent(str);
}

function getRequestOrigin(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'dexthemes.com';
  return `${protocol}://${host}`;
}
