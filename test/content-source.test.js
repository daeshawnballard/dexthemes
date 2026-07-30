import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import {
  CONTENT_ITEMS,
  CONTENT_ROUTE_PATHS,
  CONTENT_ROUTES_BY_SECTION,
} from "../shared/generated-content.js";

const EXPECTED_COUNTS = Object.freeze({
  guides: 11,
  features: 13,
  articles: 7,
  reference: 1,
});

test("Markdown is the single authoring source for the complete content cluster", async () => {
  assert.equal(CONTENT_ITEMS.length, 32);
  assert.equal(new Set(CONTENT_ITEMS.map((item) => item.path)).size, CONTENT_ITEMS.length);

  for (const [section, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
    assert.equal(
      CONTENT_ITEMS.filter((item) => item.routeSection === section).length,
      expectedCount,
      `${section} content count drifted`,
    );
    assert.equal(CONTENT_ROUTES_BY_SECTION[section].length, expectedCount + 1);
  }

  for (const item of CONTENT_ITEMS) {
    assert.equal(item.author, "Daeshawn Ballard");
    assert.equal(item.authorUrl, "https://x.com/daeshawn");
    assert.ok(item.wordCount >= 300, `${item.path} is unexpectedly thin`);
    assert.match(item.markdown, /^---\n/);
    assert.match(item.bodyHtml, /<h2 id="/);
    assert.doesNotMatch(item.markdown, /acrobatic-corgi-867|recovery_/);
    await access(new URL(`../${item.sourcePath}`, import.meta.url));
  }
});

test("generated content routes include every hub and page exactly once", () => {
  assert.equal(new Set(CONTENT_ROUTE_PATHS).size, CONTENT_ROUTE_PATHS.length);
  for (const hub of ["/guides", "/features", "/articles", "/reference"]) {
    assert.ok(CONTENT_ROUTE_PATHS.includes(hub));
  }
  for (const item of CONTENT_ITEMS) {
    assert.ok(CONTENT_ROUTE_PATHS.includes(item.path));
  }
});

test("every root-relative content link resolves to a content, collection, or theme route", async () => {
  const themeMap = JSON.parse(
    await readFile(new URL("../api/theme-map.json", import.meta.url), "utf8"),
  );
  const knownRoutes = new Set([
    "/",
    "/collections",
    "/collections/dark",
    "/collections/light",
    "/collections/editor-classics",
    "/collections/community",
    ...CONTENT_ROUTE_PATHS,
  ]);

  for (const item of CONTENT_ITEMS) {
    const bodyLinks = [...item.markdown.matchAll(/\]\((\/[^)\s]+)\)/g)]
      .map((match) => match[1]);
    for (const route of [...item.related, ...bodyLinks]) {
      if (knownRoutes.has(route)) continue;
      const themeMatch = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(dark|light)$/.exec(route);
      assert.ok(themeMatch, `${item.path} links to unknown internal route ${route}`);
      const [, themeId, variant] = themeMatch;
      assert.ok(themeMap[themeId]?.[variant], `${item.path} links to unavailable theme route ${route}`);
    }
  }
});

test("agent documentation links all content hubs and Markdown representations", async () => {
  const [llms, llmsFull] = await Promise.all([
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../public/llms-full.txt", import.meta.url), "utf8"),
  ]);

  for (const hub of ["/guides", "/features", "/articles", "/reference"]) {
    assert.match(llms, new RegExp(`https://www\\.dexthemes\\.com${hub}`));
    assert.match(llmsFull, new RegExp(`https://www\\.dexthemes\\.com${hub}`));
  }
  for (const item of CONTENT_ITEMS) {
    assert.match(llmsFull, new RegExp(
      `https://www\\.dexthemes\\.com${item.path.replaceAll("/", "\\/")}\\.md`,
    ));
  }
});
