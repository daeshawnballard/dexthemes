import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fetchCommunityThemes } from "./theme-data.js";
import { buildSitemapXml } from "../shared/seo.js";

const themeMap = JSON.parse(
  readFileSync(join(process.cwd(), "api", "theme-map.json"), "utf-8"),
);

export default async function handler(_req, res) {
  try {
    const communityThemes = await fetchCommunityThemes();
    const xml = buildSitemapXml(Object.values(themeMap), communityThemes);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400");
    res.setHeader("X-DexThemes-Community-Theme-Count", String(communityThemes.length));
    return res.status(200).send(xml);
  } catch (error) {
    console.warn("Unable to build the complete DexThemes sitemap:", error);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Retry-After", "60");
    return res.status(503).send("The complete theme catalog is temporarily unavailable.");
  }
}
