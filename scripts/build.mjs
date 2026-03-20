import { build, context } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile, watch } from "node:fs/promises";
import path from "node:path";
import { generateThemeApiCatalog } from "./generate-theme-api-catalog.mjs";

const root = process.cwd();
const distAssetsDir = path.join(root, "dist", "assets");
const appEntry = path.join(root, "src", "main.js");
const templatePath = path.join(root, "templates", "index.template.html");
const swTemplatePath = path.join(root, "templates", "sw.template.js");
const stylesPath = path.join(root, "styles", "index.css");
const themeBundlePath = path.join(root, "theme-data", "dexthemes", "bundle.js");
const isWatch = process.argv.includes("--watch");

function contentHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 10);
}

async function bundleCss(sourcePath, seen = new Set()) {
  const resolvedPath = path.resolve(sourcePath);
  if (seen.has(resolvedPath)) {
    throw new Error(`Circular CSS import detected: ${resolvedPath}`);
  }

  seen.add(resolvedPath);
  const source = await readFile(resolvedPath, "utf8");
  const importRegex = /^\s*@import\s+["'](.+?)["'];\s*$/gm;

  let output = "";
  let lastIndex = 0;
  let match;

  while ((match = importRegex.exec(source)) !== null) {
    output += source.slice(lastIndex, match.index);
    const importedPath = path.resolve(path.dirname(resolvedPath), match[1]);
    output += await bundleCss(importedPath, seen);
    if (!output.endsWith("\n")) output += "\n";
    lastIndex = importRegex.lastIndex;
  }

  output += source.slice(lastIndex);
  seen.delete(resolvedPath);
  return output;
}

async function copyHashedAsset(sourcePath, outputPrefix, ext) {
  const buffer = await readFile(sourcePath);
  const hash = contentHash(buffer);
  const fileName = `${outputPrefix}-${hash}.${ext}`;
  const outputPath = path.join(distAssetsDir, fileName);
  await writeFile(outputPath, buffer);
  return `/dist/assets/${fileName}`;
}

async function writeGeneratedIndex({ stylesheetHref, themeBundleHref, bootHref }) {
  const template = await readFile(templatePath, "utf8");
  const html = template
    .replaceAll("__STYLESHEET_HREF__", stylesheetHref)
    .replaceAll("__THEME_BUNDLE_HREF__", themeBundleHref)
    .replaceAll("__BOOT_SCRIPT_HREF__", bootHref);
  await writeFile(path.join(root, "index.html"), html);
}

async function writeGeneratedServiceWorker(precacheAssets) {
  const template = await readFile(swTemplatePath, "utf8");
  const assetList = Array.from(new Set(precacheAssets));
  const version = contentHash(Buffer.from(JSON.stringify(assetList)));
  const sw = template
    .replaceAll("__CACHE_VERSION__", version)
    .replace(
      "__PRECACHE_ASSETS__",
      JSON.stringify(assetList, null, 2),
    );
  await writeFile(path.join(root, "sw.js"), sw);
}

async function writeBootFile(appHref) {
  const source = `import(${JSON.stringify(appHref)}).catch((error) => {\n  console.error("Failed to load DexThemes app bundle:", error);\n});\n`;
  const hash = contentHash(Buffer.from(source));
  const fileName = `boot-${hash}.js`;
  await writeFile(path.join(distAssetsDir, fileName), source);
  return `/dist/assets/${fileName}`;
}

async function generateArtifacts(metafile) {
  const entryOutput = Object.entries(metafile.outputs).find(([, output]) => output.entryPoint === "src/main.js");
  if (!entryOutput) {
    throw new Error("Could not locate built app entry in esbuild metafile");
  }

  const [entryPath] = entryOutput;
  const appHref = `/${path.relative(root, entryPath).replaceAll(path.sep, "/")}`;
  const bundledStyles = await bundleCss(stylesPath);
  const stylesHash = contentHash(Buffer.from(bundledStyles));
  const stylesFileName = `styles-${stylesHash}.css`;
  const stylesheetHref = `/dist/assets/${stylesFileName}`;
  await writeFile(path.join(distAssetsDir, stylesFileName), bundledStyles);
  const themeBundleHref = await copyHashedAsset(themeBundlePath, "dexthemes-bundle", "js");
  const bootHref = await writeBootFile(appHref);

  const precacheAssets = [
    "/",
    appHref,
    bootHref,
    stylesheetHref,
    themeBundleHref,
    "/manifest.json",
    "/favicon.svg",
    "/apple-touch-icon.png",
    "/icon-192.png",
  ];

  for (const outputPath of Object.keys(metafile.outputs)) {
    const rel = `/${path.relative(root, outputPath).replaceAll(path.sep, "/")}`;
    if (rel.startsWith("/dist/assets/")) {
      precacheAssets.push(rel);
    }
  }

  await writeGeneratedIndex({ stylesheetHref, themeBundleHref, bootHref });
  await writeGeneratedServiceWorker(precacheAssets);
}

function createEsbuildOptions() {
  return {
    entryPoints: [appEntry],
    bundle: true,
    format: "esm",
    splitting: true,
    target: "es2020",
    outdir: distAssetsDir,
    entryNames: "app-[hash]",
    chunkNames: "chunk-[hash]",
    metafile: true,
    logLevel: "info",
  };
}

async function cleanDist() {
  await rm(path.join(root, "dist"), { recursive: true, force: true });
  await mkdir(distAssetsDir, { recursive: true });
}

async function runBuildOnce() {
  await generateThemeApiCatalog();
  await cleanDist();
  const result = await build(createEsbuildOptions());
  await generateArtifacts(result.metafile);
}

async function runWatch() {
  await generateThemeApiCatalog();
  await cleanDist();
  const ctx = await context(createEsbuildOptions());
  let rebuilding = Promise.resolve();

  const rebuildAll = () => {
    rebuilding = rebuilding.then(async () => {
      await generateThemeApiCatalog();
      const result = await ctx.rebuild();
      await generateArtifacts(result.metafile);
      console.log("DexThemes build updated");
    }).catch((error) => {
      console.error("DexThemes watch rebuild failed:", error);
    });
  };

  await ctx.watch();
  await generateArtifacts((await ctx.rebuild()).metafile);

  const extraFiles = [templatePath, swTemplatePath, stylesPath, themeBundlePath];
  for (const file of extraFiles) {
    (async () => {
      const watcher = watch(file);
      for await (const _event of watcher) {
        rebuildAll();
      }
    })();
  }

  (async () => {
    const watcher = watch(path.join(root, "styles"), { recursive: true });
    for await (const _event of watcher) {
      rebuildAll();
    }
  })();

  console.log("Watching DexThemes build inputs...");
}

if (isWatch) {
  await runWatch();
} else {
  await runBuildOnce();
}
