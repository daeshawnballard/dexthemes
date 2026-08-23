import {
  CONTENT_ITEMS,
  CONTENT_LAST_MODIFIED as GENERATED_CONTENT_LAST_MODIFIED,
} from "./generated-content.js";

export const CANONICAL_ORIGIN = "https://www.dexthemes.com";
export const CANONICAL_HOST = "www.dexthemes.com";
export const CONTENT_LAST_MODIFIED = GENERATED_CONTENT_LAST_MODIFIED;
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;
export const SOCIAL_IMAGE_VERSION = "2";
export const HOME_SOCIAL_IMAGE_URL = `${CANONICAL_ORIGIN}/api/og?card=home&v=${SOCIAL_IMAGE_VERSION}`;
export const HOME_SOCIAL_IMAGE_ALT = "DexThemes — make Codex yours with community-built themes";

export function buildContentSocialImageUrl(section, slug = "", contentVersion = "") {
  const url = new URL(`${CANONICAL_ORIGIN}/api/og`);
  url.searchParams.set("card", "content");
  url.searchParams.set("section", section);
  if (slug) url.searchParams.set("slug", slug);
  url.searchParams.set("v", [SOCIAL_IMAGE_VERSION, contentVersion].filter(Boolean).join("-"));
  return url.toString();
}

export function buildCollectionSocialImageUrl(slug = "", catalogVersion = "") {
  const url = new URL(`${CANONICAL_ORIGIN}/api/og`);
  url.searchParams.set("card", "collection");
  if (slug) url.searchParams.set("slug", slug);
  url.searchParams.set("v", [SOCIAL_IMAGE_VERSION, catalogVersion].filter(Boolean).join("-"));
  return url.toString();
}

export function buildStaticPageSocialImageUrl(page) {
  const url = new URL(`${CANONICAL_ORIGIN}/api/og`);
  url.searchParams.set("card", "page");
  url.searchParams.set("page", page);
  url.searchParams.set("v", SOCIAL_IMAGE_VERSION);
  return url.toString();
}

export function buildCatalogSocialImageVersion(themes = []) {
  const source = themes.map((theme) => {
    const id = getCatalogThemeId(theme) || "";
    const variants = getCatalogThemeVariants(theme).map((variant) => {
      const palette = theme[variant] || {};
      return [variant, palette.surface, palette.ink, palette.accent, palette.skill].join(":");
    });
    return [id, theme?.name || "", ...variants].join("|");
  }).sort().join("\n");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

// IndexNow verification keys are intentionally public and must be available as
// a same-origin text file for ownership verification.
export const INDEXNOW_KEY = "3f8d2c5a9e7146b0ac29f45d81e7c663";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;

function discoverableRoutes(section) {
  return Object.freeze([
    `/${section}`,
    ...CONTENT_ITEMS
      .filter((item) => item.routeSection === section && item.visibility !== "status-only")
      .map((item) => item.path),
  ]);
}

export const GUIDE_ROUTES = discoverableRoutes("guides");
export const FEATURE_ROUTES = discoverableRoutes("features");
export const ARTICLE_ROUTES = discoverableRoutes("articles");
export const REFERENCE_ROUTES = discoverableRoutes("reference");
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
    { url: `${CANONICAL_ORIGIN}/support.html`, changefreq: "monthly", priority: "0.4", lastmod: CONTENT_LAST_MODIFIED },
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
