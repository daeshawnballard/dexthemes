import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildThemeImageVersion, fetchCommunityThemes } from "./theme-data.js";
import { getWebsiteThemeId, resolvePluginThemeSourceId } from "../shared/plugin-public-policy.js";
import { renderNotFoundPage, renderThemePage, getRelatedThemes } from "../shared/public-pages.js";
import { CANONICAL_ORIGIN } from "../shared/seo.js";

const themeMap = JSON.parse(
  readFileSync(join(process.cwd(), "api", "theme-map.json"), "utf-8"),
);
const THEME_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_VARIANTS = new Set(["dark", "light"]);

/**
 * Indexable public landing page for one exact theme variant.
 *
 * Usage: /api/share?theme=codex&variant=dark
 */
export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const requestedThemeId = String(url.searchParams.get("theme") || "").trim().toLowerCase();
  const variant = String(url.searchParams.get("variant") || "").trim().toLowerCase();

  if (!THEME_ID_PATTERN.test(requestedThemeId) || !VALID_VARIANTS.has(variant)) {
    return sendNotFound(res, "Theme not found", "That theme or variant is not available in the public DexThemes catalog.");
  }

  const sourceThemeId = resolvePluginThemeSourceId(requestedThemeId);
  const publicThemeId = getWebsiteThemeId(sourceThemeId);

  if (requestedThemeId !== publicThemeId) {
    res.setHeader("Location", `${CANONICAL_ORIGIN}/${encodeURIComponent(publicThemeId)}/${variant}`);
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    return res.status(308).send("");
  }

  let catalog = Object.values(themeMap);
  let theme = themeMap[publicThemeId] || null;

  if (!theme) {
    try {
      const communityThemes = await fetchCommunityThemes();
      catalog = [...catalog, ...communityThemes];
      theme = communityThemes.find(
        (candidate) => candidate.id === publicThemeId || candidate.themeId === publicThemeId,
      ) || null;
    } catch (error) {
      console.warn(`Unable to resolve public theme page "${publicThemeId}":`, error);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(503).send(renderNotFoundPage({
        title: "Theme catalog unavailable",
        message: "Community theme data is temporarily unavailable. Please try again shortly.",
        statusLabel: "503",
      }));
    }
  }

  if (!theme || !theme[variant]) {
    return sendNotFound(
      res,
      theme ? "Variant not found" : "Theme not found",
      theme
        ? `The ${variant} variant is not available for this theme.`
        : "That theme is not available in the public DexThemes catalog.",
    );
  }

  const deploymentVersion = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "1";
  const imageVersion = buildThemeImageVersion(theme, deploymentVersion);
  const relatedThemes = getRelatedThemes(theme, catalog, variant);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    theme.category === "community"
      ? "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400"
      : "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );
  return res.status(200).send(renderThemePage({
    theme,
    variant,
    relatedThemes,
    imageVersion,
  }));
}

function sendNotFound(res, title, message) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  return res.status(404).send(renderNotFoundPage({ title, message }));
}
