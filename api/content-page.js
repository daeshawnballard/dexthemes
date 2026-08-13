import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fetchCommunityThemes } from "../server/theme-data.js";
import {
  getContentItem,
  renderCollectionPage,
  renderCollectionsHub,
  renderContentHub,
  renderContentPage,
  renderNotFoundPage,
} from "../shared/public-pages.js";
import { CANONICAL_ORIGIN } from "../shared/seo.js";

const themeMap = JSON.parse(
  readFileSync(join(process.cwd(), "api", "theme-map.json"), "utf-8"),
);
const COLLECTION_SLUGS = new Set(["dark", "light", "editor-classics", "community"]);
const EDITORIAL_SECTIONS = new Set(["guides", "features", "articles", "reference"]);

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const section = String(url.searchParams.get("section") || "").toLowerCase();
  const slug = String(url.searchParams.get("slug") || "").toLowerCase();
  const format = String(url.searchParams.get("format") || "").toLowerCase();

  if (EDITORIAL_SECTIONS.has(section)) {
    if (!slug) return sendHtml(res, 200, renderContentHub(section));
    const item = getContentItem(section, slug);
    if (!item) return sendNotFound(res, `${singularTitle(section)} not found`);
    if (format === "markdown") {
      return sendMarkdown(res, item.markdown, `${CANONICAL_ORIGIN}${item.path}`);
    }
    return sendHtml(res, 200, renderContentPage(section, slug));
  }

  if (section === "collections") {
    if (!slug) return sendHtml(res, 200, renderCollectionsHub());
    if (!COLLECTION_SLUGS.has(slug)) return sendNotFound(res, "Collection not found");

    const staticThemes = Object.values(themeMap);
    try {
      const communityThemes = await fetchCommunityThemes();
      return sendHtml(
        res,
        200,
        renderCollectionPage(slug, [...staticThemes, ...communityThemes]),
        slug === "community"
          ? "public, max-age=300, s-maxage=900, stale-while-revalidate=3600"
          : undefined,
      );
    } catch (error) {
      console.warn(`Unable to load community themes for collection "${slug}":`, error);
      if (slug === "community") {
        res.setHeader("Retry-After", "60");
        return sendHtml(
          res,
          503,
          renderNotFoundPage({
            title: "Community catalog unavailable",
            message: "Community themes are temporarily unavailable. Please try again shortly.",
            statusLabel: "503",
          }),
          "no-store",
        );
      }
      res.setHeader("X-DexThemes-Catalog-Status", "static-only");
      return sendHtml(res, 200, renderCollectionPage(slug, staticThemes), "public, max-age=60, s-maxage=60");
    }
  }

  return sendNotFound(res, "Page not found");
}

function singularTitle(section) {
  const singular = section === "reference" ? "reference" : section.replace(/s$/, "");
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

function sendNotFound(res, title) {
  return sendHtml(
    res,
    404,
    renderNotFoundPage({
      title,
      message: "That page is not part of the public DexThemes catalog.",
    }),
    "public, max-age=60, s-maxage=300",
  );
}

function sendHtml(
  res,
  status,
  html,
  cacheControl = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  return res.status(status).send(html);
}

function sendMarkdown(
  res,
  markdown,
  canonicalUrl,
  cacheControl = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
) {
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("X-Robots-Tag", "noindex");
  res.setHeader("Link", `<${canonicalUrl}>; rel="canonical"`);
  return res.status(200).send(markdown);
}
