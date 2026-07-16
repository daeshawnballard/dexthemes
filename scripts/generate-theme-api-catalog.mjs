import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildThemeBundle } from "./build-theme-bundle.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "shared", "theme-api-catalog.js");
const themeMapOutputPath = path.join(root, "api", "theme-map.json");
const llmsFullOutputPath = path.join(root, "public", "llms-full.txt");
const sitemapOutputPath = path.join(root, "public", "sitemap.xml");

const subgroupSlugByKey = {
  anime: "anime",
  games: "video-games",
  movies: "movies",
  comics: "comics",
  zodiacs: "zodiacs",
  lunar: "lunar-animals",
  companies: "companies",
  originals: "originals",
  supporter: "unlockables",
};

const subgroupAliases = Object.freeze({
  anime: "anime",
  "video-games": "games",
  games: "games",
  movies: "movies",
  comics: "comics",
  zodiacs: "zodiacs",
  "lunar-animals": "lunar",
  lunar: "lunar",
  companies: "companies",
  originals: "originals",
  unlockables: "supporter",
  supporter: "supporter",
});

function normalizeStaticTheme(theme) {
  const category = theme.category === "official" ? "codex" : theme.category;
  const subgroup =
    category === "dexthemes" && theme.subgroup
      ? subgroupSlugByKey[theme.subgroup] || theme.subgroup
      : null;

  return {
    id: theme.id,
    themeId: theme.id,
    name: theme.name,
    category,
    subgroup,
    codeThemeId: theme.codeThemeId ?? "codex",
    copies: theme.copies ?? 0,
    dateAdded: theme.dateAdded ?? null,
    dark: theme.dark ?? null,
    light: theme.light ?? null,
    accents: theme.accents ?? [],
    variants: theme.variants ?? null,
    _company: theme._company ?? null,
    _hiddenUntilUnlocked: theme._hiddenUntilUnlocked ?? null,
    _locked: theme._locked ?? null,
    _summary: theme._summary ?? null,
  };
}

function isPublicCatalogTheme(theme) {
  return !theme._hiddenUntilUnlocked && theme.subgroup !== "unlockables";
}

function formatVariant(label, variant) {
  if (!variant) return null;
  return `- ${label}: surface=${variant.surface} ink=${variant.ink} accent=${variant.accent}`;
}

function buildLlmsFullCatalog(themes) {
  const visibleThemes = themes.filter(isPublicCatalogTheme);
  const entries = visibleThemes.map((theme) => [
    `### ${theme.name}`,
    `- ID: \`${theme.id}\``,
    `- Category: ${theme.category}${theme.subgroup ? ` / ${theme.subgroup}` : ""}`,
    `- Deep link: https://dexthemes.com/?theme=${encodeURIComponent(theme.id)}`,
    theme._summary ? `- Summary: ${theme._summary}` : null,
    formatVariant("Dark", theme.dark),
    formatVariant("Light", theme.light),
  ].filter(Boolean).join("\n")).join("\n\n");

  return `# DexThemes — Full Theme Catalog

> Generated from the checked-in theme catalog for LLM and agent consumption.
> For product, authentication, and plugin guidance, see /llms.txt.

Total public static themes: ${visibleThemes.length}

## API Endpoints

- Browse all themes: GET https://dexthemes.com/api/themes
- MCP plugin: https://www.dexthemes.com/api/mcp
- Published docs: https://dexthemes.com/llms.txt and https://dexthemes.com/.well-known/openapi.json
- Generate random: GET https://acrobatic-corgi-867.convex.site/api/color-me-lucky?variant=dark|light
- Deep link: https://dexthemes.com/?theme={id}&variant=dark|light

## Theme Catalog

${entries}
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

function buildSitemap(themes) {
  const policyEntries = [
    { url: "https://dexthemes.com/", changefreq: "daily", priority: "1.0", lastmod: "2026-07-16" },
    { url: "https://dexthemes.com/privacy.html", changefreq: "monthly", priority: "0.3", lastmod: "2026-07-16" },
    { url: "https://dexthemes.com/terms.html", changefreq: "monthly", priority: "0.3", lastmod: "2026-07-16" },
    { url: "https://dexthemes.com/support.html", changefreq: "monthly", priority: "0.4", lastmod: "2026-07-16" },
  ];
  const themeEntries = themes
    .filter(isPublicCatalogTheme)
    .flatMap((theme) => ["dark", "light"]
      .filter((variant) => Boolean(theme[variant]))
      .map((variant) => ({
        url: `https://dexthemes.com/?theme=${encodeURIComponent(theme.id)}&variant=${variant}`,
        changefreq: "weekly",
        priority: "0.7",
        lastmod: theme.dateAdded || "2026-03-15",
      })));
  const entries = [...policyEntries, ...themeEntries].map((entry) => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

export async function generateThemeApiCatalog() {
  await buildThemeBundle();
  global.window = {};
  global.globalThis = global;

  await import(pathToFileURL(path.join(root, "theme-data", "dexthemes", "helpers.js")).href);
  global.createDexTheme = window.createDexTheme;
  global.registerDexThemesPack = window.registerDexThemesPack;
  await import(pathToFileURL(path.join(root, "theme-data", "dexthemes", "bundle.js")).href);

  const catalogModule = await import(pathToFileURL(path.join(root, "src", "theme-catalog.js")).href);
  const staticThemes = catalogModule.THEMES
    .filter((theme) => theme.category !== "community")
    .map(normalizeStaticTheme);

  const source = `// Generated by scripts/generate-theme-api-catalog.mjs
export const DEXTHEMES_SUBGROUP_SLUGS = ${JSON.stringify(subgroupSlugByKey, null, 2)};

export const DEXTHEMES_SUBGROUP_ALIASES = ${JSON.stringify(subgroupAliases, null, 2)};

export const STATIC_THEME_CATALOG = ${JSON.stringify(staticThemes, null, 2)};

export function normalizeDexThemesSubgroup(segment) {
  if (!segment) return null;
  return DEXTHEMES_SUBGROUP_ALIASES[String(segment).toLowerCase()] || null;
}
`;

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, source);
  const themeMap = Object.fromEntries(
    staticThemes
      .filter(isPublicCatalogTheme)
      .map((theme) => [theme.id, {
        name: theme.name,
        dark: theme.dark,
        light: theme.light,
      }]),
  );
  await writeFile(themeMapOutputPath, `${JSON.stringify(themeMap, null, 2)}\n`);
  await writeFile(llmsFullOutputPath, buildLlmsFullCatalog(staticThemes));
  await writeFile(sitemapOutputPath, buildSitemap(staticThemes));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateThemeApiCatalog();
}
