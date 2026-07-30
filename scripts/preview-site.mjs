import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import configHandler from "../api/config.js";
import contentPageHandler from "../api/content-page.js";
import ogHandler from "../api/og.js";
import shareHandler from "../api/share.js";
import sitemapHandler from "../api/sitemap.js";

const root = process.cwd();
const host = process.env.DEXTHEMES_PREVIEW_HOST || "127.0.0.1";
const port = Number(process.env.DEXTHEMES_PREVIEW_PORT || 4174);
const ROOT_FILES = new Set([
  "3f8d2c5a9e7146b0ac29f45d81e7c663.txt",
  "apple-touch-icon.png",
  "favicon.svg",
  "icon-192.png",
  "index.html",
  "llms-full.txt",
  "llms.txt",
  "manifest.json",
  "privacy.html",
  "public-pages.css",
  "robots.txt",
  "sitemap.xml",
  "support.html",
  "sw.js",
  "terms.html",
]);
const ROOT_DIRECTORIES = new Set(["dist", "logos"]);
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function attachResponseHelpers(res) {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.send = (body) => {
    res.end(body);
    return res;
  };
  res.json = (body) => {
    res.end(JSON.stringify(body));
    return res;
  };
}

async function serveStatic(pathname, res) {
  const segments = pathname.split("/").filter(Boolean);
  const rootEntry = segments[0] || "index.html";
  if (!ROOT_FILES.has(rootEntry) && !ROOT_DIRECTORIES.has(rootEntry)) return false;
  if (ROOT_FILES.has(rootEntry) && segments.length !== 1) return false;

  const filePath = path.resolve(root, ...segments);
  if (!filePath.startsWith(`${root}${path.sep}`)) return false;
  const fileInfo = await stat(filePath).catch(() => null);
  if (!fileInfo?.isFile()) return false;

  res.statusCode = 200;
  res.setHeader("Content-Type", MIME_TYPES[path.extname(filePath)] || "application/octet-stream");
  createReadStream(filePath).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  attachResponseHelpers(res);
  const requestUrl = new URL(req.url || "/", `http://${host}:${port}`);
  const { pathname } = requestUrl;

  try {
    if (pathname === "/") {
      await serveStatic("/index.html", res);
      return;
    }
    if (pathname === "/api/config") {
      await configHandler(req, res);
      return;
    }
    if (pathname === "/api/og") {
      await ogHandler(req, res);
      return;
    }
    if (pathname === "/api/share") {
      await shareHandler(req, res);
      return;
    }
    if (pathname === "/api/sitemap" || pathname === "/sitemap.xml") {
      await sitemapHandler(req, res);
      return;
    }

    const contentMatch = /^\/(guides|collections)(?:\/([a-z0-9]+(?:-[a-z0-9]+)*))?$/.exec(pathname);
    if (contentMatch) {
      req.url = `/api/content-page?section=${contentMatch[1]}${contentMatch[2] ? `&slug=${encodeURIComponent(contentMatch[2])}` : ""}`;
      await contentPageHandler(req, res);
      return;
    }

    const themeMatch = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(dark|light)$/.exec(pathname);
    if (themeMatch) {
      req.url = `/api/share?theme=${encodeURIComponent(themeMatch[1])}&variant=${themeMatch[2]}`;
      await shareHandler(req, res);
      return;
    }

    if (await serveStatic(pathname, res)) return;
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  } catch (error) {
    console.error("Preview server request failed:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }
    res.end("Preview server error");
  }
});

server.listen(port, host, () => {
  console.log(`DexThemes preview: http://${host}:${port}`);
});
