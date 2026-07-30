import {
  CONTENT_ITEMS,
  CONTENT_LAST_MODIFIED as GENERATED_CONTENT_LAST_MODIFIED,
  CONTENT_ROUTES_BY_SECTION,
} from "./generated-content.js";

export const CANONICAL_ORIGIN = "https://www.dexthemes.com";
export const CANONICAL_HOST = "www.dexthemes.com";
export const CONTENT_LAST_MODIFIED = GENERATED_CONTENT_LAST_MODIFIED;

// IndexNow verification keys are intentionally public and must be available as
// a same-origin text file for ownership verification.
export const INDEXNOW_KEY = "3f8d2c5a9e7146b0ac29f45d81e7c663";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

export const GUIDE_ROUTES = CONTENT_ROUTES_BY_SECTION.guides;
export const FEATURE_ROUTES = CONTENT_ROUTES_BY_SECTION.features;
export const ARTICLE_ROUTES = CONTENT_ROUTES_BY_SECTION.articles;
export const REFERENCE_ROUTES = CONTENT_ROUTES_BY_SECTION.reference;
export const EDITORIAL_ROUTES = Object.freeze([
  ...GUIDE_ROUTES,
  ...FEATURE_ROUTES,
  ...ARTICLE_ROUTES,
  ...REFERENCE_ROUTES,
]);

export const COLLECTION_ROUTES = Object.freeze([
  "/collections",
  "/collections/dark",
  "/collections/light",
  "/collections/editor-classics",
  "/collections/community",
]);

export const EDITOR_CLASSIC_THEME_IDS = Object.freeze([
  "catppuccin",
  "dracula",
  "gruvbox",
  "monokai",
  "nord",
  "one-dark",
  "solarized",
  "tokyo-night",
]);

const THEME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getCatalogThemeId(theme) {
  const value = String(theme?.id || theme?.themeId || "").trim();
  return THEME_ID_PATTERN.test(value) ? value : null;
}

export function getCatalogThemeDate(theme, fallback = CONTENT_LAST_MODIFIED) {
  const explicit = String(theme?.dateAdded || "").trim();
  if (ISO_DATE_PATTERN.test(explicit)) return explicit;

  const createdAt = Number(theme?.createdAt);
  if (Number.isFinite(createdAt) && createdAt > 0) {
    return new Date(createdAt).toISOString().slice(0, 10);
  }

  return fallback;
}

export function getCatalogThemeVariants(theme) {
  return ["dark", "light"].filter((variant) => Boolean(theme?.[variant]));
}

export function getIndexNowUrlsForTheme(theme) {
  const themeId = getCatalogThemeId(theme);
  if (!themeId) return [];

  return [
    ...getCatalogThemeVariants(theme).map(
      (variant) => `${CANONICAL_ORIGIN}/${encodeURIComponent(themeId)}/${variant}`,
    ),
    `${CANONICAL_ORIGIN}/collections/community`,
    `${CANONICAL_ORIGIN}/sitemap.xml`,
  ];
}

export function buildSitemapEntries(staticThemes = [], communityThemes = []) {
  const modifiedByPath = new Map(
    CONTENT_ITEMS.map((item) => [item.path, item.dateModified]),
  );
  const fixedEntries = [
    { url: `${CANONICAL_ORIGIN}/`, changefreq: "daily", priority: "1.0", lastmod: CONTENT_LAST_MODIFIED },
    { url: `${CANONICAL_ORIGIN}/privacy.html`, changefreq: "monthly", priority: "0.3", lastmod: "2026-07-16" },
    { url: `${CANONICAL_ORIGIN}/terms.html`, changefreq: "monthly", priority: "0.3", lastmod: "2026-07-16" },
    { url: `${CANONICAL_ORIGIN}/support.html`, changefreq: "monthly", priority: "0.4", lastmod: "2026-07-16" },
    ...EDITORIAL_ROUTES.map((path) => ({
      url: `${CANONICAL_ORIGIN}${path}`,
      changefreq: "monthly",
      priority: path.split("/").filter(Boolean).length === 1 ? "0.8" : "0.7",
      lastmod: modifiedByPath.get(path) || CONTENT_LAST_MODIFIED,
    })),
    ...COLLECTION_ROUTES.map((path) => ({
      url: `${CANONICAL_ORIGIN}${path}`,
      changefreq: path === "/collections/community" ? "daily" : "weekly",
      priority: path === "/collections" ? "0.8" : "0.7",
      lastmod: CONTENT_LAST_MODIFIED,
    })),
  ];

  const themeEntries = [...staticThemes, ...communityThemes].flatMap((theme) => {
    const themeId = getCatalogThemeId(theme);
    if (!themeId) return [];
    const lastmod = getCatalogThemeDate(theme);
    return getCatalogThemeVariants(theme).map((variant) => ({
      url: `${CANONICAL_ORIGIN}/${encodeURIComponent(themeId)}/${variant}`,
      changefreq: theme?.category === "community" ? "daily" : "weekly",
      priority: "0.7",
      lastmod,
    }));
  });

  const deduped = new Map();
  for (const entry of [...fixedEntries, ...themeEntries]) {
    deduped.set(entry.url, entry);
  }
  return [...deduped.values()];
}

export function buildSitemapXml(staticThemes = [], communityThemes = []) {
  const entries = buildSitemapEntries(staticThemes, communityThemes)
    .map((entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
