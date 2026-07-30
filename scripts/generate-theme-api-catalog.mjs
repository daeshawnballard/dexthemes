import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildThemeBundle } from "./build-theme-bundle.mjs";
import { normalizeThemeCodeThemeId } from "../shared/codex-theme-contract.js";
import { getWebsiteThemeId } from "../shared/plugin-public-policy.js";
import { CANONICAL_ORIGIN, buildSitemapXml } from "../shared/seo.js";
import { CONTENT_ITEMS } from "../shared/generated-content.js";

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

  const codeThemeId = normalizeThemeCodeThemeId(theme);
  if (!codeThemeId) {
    throw new Error(`Theme "${theme.id}" has an unsupported Codex codeThemeId.`);
  }

  return {
    id: theme.id,
    themeId: theme.id,
    name: theme.name,
    category,
    subgroup,
    codeThemeId,
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

function buildContentIndex() {
  const sectionOrder = ["guides", "features", "articles", "reference"];
  return sectionOrder.map((section) => {
    const items = CONTENT_ITEMS.filter((item) => item.routeSection === section);
    const heading = items[0]?.section || section;
    return [
      `### ${heading}`,
      ...items.map((item) => (
        `- [${item.title}](${CANONICAL_ORIGIN}${item.path}) — ${item.description} ([Markdown](${CANONICAL_ORIGIN}${item.path}.md))`
      )),
    ].join("\n");
  }).join("\n\n");
}

function buildLlmsFullCatalog(themes) {
  const visibleThemes = themes.filter(isPublicCatalogTheme);
  const entries = visibleThemes.map((theme) => {
    const publicThemeId = getWebsiteThemeId(theme);
    const preferredVariant = theme.dark ? "dark" : "light";
    return [
    `### ${theme.name}`,
    `- ID: \`${publicThemeId}\``,
    `- Category: ${theme.category}${theme.subgroup ? ` / ${theme.subgroup}` : ""}`,
    `- Public page: ${CANONICAL_ORIGIN}/${encodeURIComponent(publicThemeId)}/${preferredVariant}`,
    theme._summary ? `- Summary: ${theme._summary}` : null,
    formatVariant("Dark", theme.dark),
    formatVariant("Light", theme.light),
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  return `# DexThemes — Full Theme Catalog

> Generated from the checked-in theme catalog for LLM and agent consumption.
> For product, authentication, and plugin guidance, see /llms.txt.

Total public static themes: ${visibleThemes.length}

## API Endpoints

- Browse all themes: GET ${CANONICAL_ORIGIN}/api/themes
- MCP plugin: ${CANONICAL_ORIGIN}/api/mcp
- Published docs: ${CANONICAL_ORIGIN}/llms.txt and ${CANONICAL_ORIGIN}/.well-known/openapi.json
- Generate random: GET https://acrobatic-corgi-867.convex.site/api/color-me-lucky?variant=dark|light
- Public theme page: ${CANONICAL_ORIGIN}/{id}/dark|light
- Install guide: ${CANONICAL_ORIGIN}/guides/how-to-install-a-codex-theme
- Theme collections: ${CANONICAL_ORIGIN}/collections
- Feature documentation: ${CANONICAL_ORIGIN}/features
- Articles: ${CANONICAL_ORIGIN}/articles
- Theme reference: ${CANONICAL_ORIGIN}/reference

## Guides, Features, Articles, and Reference

${buildContentIndex()}

## Theme Catalog

${entries}
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
      .flatMap((theme) => {
        const publicThemeId = getWebsiteThemeId(theme);
        const publicTheme = {
          id: publicThemeId,
          sourceId: theme.id,
          name: theme.name,
          summary: theme._summary,
          category: theme.category,
          subgroup: theme.subgroup,
          codeThemeId: theme.codeThemeId,
          dateAdded: theme.dateAdded,
          dark: theme.dark,
          light: theme.light,
          accents: theme.accents,
        };
        return [[publicThemeId, publicTheme]];
      }),
  );
  await writeFile(themeMapOutputPath, `${JSON.stringify(themeMap, null, 2)}\n`);
  await writeFile(llmsFullOutputPath, buildLlmsFullCatalog(staticThemes));
  await writeFile(
    sitemapOutputPath,
    buildSitemapXml(staticThemes.filter(isPublicCatalogTheme), []),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateThemeApiCatalog();
}
