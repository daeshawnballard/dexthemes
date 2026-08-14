import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

import contentPageHandler from '../api/content-page.js';

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

function readCssCustomProperty(source, property) {
  return source.match(new RegExp(`${property}\\s*:\\s*([^;]+);`))?.[1]?.trim();
}

function normalizeFontStack(value) {
  return value?.replaceAll(/["']/g, '').replaceAll(/\s+/g, ' ').trim();
}

function installCommunityFetch(t) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    if (String(input).endsWith('/themes/community')) {
      return Response.json([{
        id: 'night-operator',
        themeId: 'night-operator',
        name: 'Night Operator',
        category: 'community',
        summary: 'A quiet midnight palette.',
        createdAt: Date.UTC(2026, 6, 29),
        dark: {
          surface: '#10131a',
          ink: '#f3f5f7',
          accent: '#7aa2f7',
          diffAdded: '#3fb950',
          diffRemoved: '#f85149',
          skill: '#bc8cff',
          sidebar: '#0b0d12',
          codeBg: '#090b10',
        },
      }]);
    }
    return originalFetch(input);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
}

test('guides render answer-first indexable pages', async () => {
  const res = createResponse();
  await contentPageHandler({
    url: '/api/content-page?section=guides&slug=how-to-install-a-codex-theme',
  }, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<h1>How to Install a Codex Theme<\/h1>/);
  assert.match(res.body, /open Codex Settings/i);
  assert.match(res.body, /Appearance/);
  assert.match(res.body, /Written by <a href="https:\/\/x\.com\/daeshawn"/);
  assert.match(res.body, /"@type":"TechArticle"/);
  assert.match(res.body, /"name":"Daeshawn Ballard"/);
  assert.match(res.body, /"publisher":\{"@id":"https:\/\/www\.dexthemes\.com\/#daeshawn-ballard"\}/);
  assert.match(res.body, /<meta property="og:type" content="article">/);
  assert.match(res.body, /rel="alternate" type="text\/markdown"/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/guides\/how-to-install-a-codex-theme/);
});

test('content hubs expose the full catalog with concise hero copy', async () => {
  const guideRes = createResponse();
  await contentPageHandler({
    url: '/api/content-page?section=guides',
  }, guideRes);
  assert.equal(guideRes.statusCode, 200);
  assert.match(guideRes.body, /Practical guides to choose, create, import, share, and troubleshoot Codex themes\./);

  const featureRes = createResponse();
  await contentPageHandler({
    url: '/api/content-page?section=features',
  }, featureRes);
  assert.equal(featureRes.statusCode, 200);
  assert.match(featureRes.body, /Explore DexThemes from first discovery to a theme ready for Codex, with creation, community, and rewards along the way\./);
  assert.match(featureRes.body, /Everything DexThemes can do/);
  assert.match(featureRes.body, /\/features\/leaderboard/);

  const articleRes = createResponse();
  await contentPageHandler({
    url: '/api/content-page?section=articles',
  }, articleRes);
  assert.equal(articleRes.statusCode, 200);
  assert.match(articleRes.body, /\/articles\/how-we-test-codex-themes/);
});

test('canonical Markdown representations are agent-readable and non-indexable', async () => {
  const res = createResponse();
  await contentPageHandler({
    url: '/api/content-page?section=features&slug=leaderboard&format=markdown',
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'], 'text/markdown; charset=utf-8');
  assert.equal(res.headers['x-robots-tag'], 'noindex');
  assert.equal(
    res.headers.link,
    '<https://www.dexthemes.com/features/leaderboard>; rel="canonical"',
  );
  assert.match(res.body, /^---\n/);
  assert.match(res.body, /author: Daeshawn Ballard/);
  assert.match(res.body, /## /);
});

test('collection pages combine static and live community themes', async (t) => {
  installCommunityFetch(t);
  const res = createResponse();

  await contentPageHandler({
    url: '/api/content-page?section=collections&slug=community',
  }, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /Made by the community/);
  assert.match(res.body, /<h1>Community Themes<\/h1>/);
  assert.match(res.body, /Original Themes from DexThemes users, each with a page worth sharing\./);
  assert.match(res.body, /Night Operator/);
  assert.match(res.body, /\/night-operator\/dark/);
  assert.match(res.body, /"@type":"ItemList"/);

  for (const [slug, heading, description] of [
    ['dark', 'Dark Themes', 'From true black to warm editor classics, built for focused work.'],
    ['light', 'Light Themes', 'Bright palettes with clear contrast, clean hierarchy, and confident accents.'],
    ['editor-classics', 'Editor Classics', 'Familiar coding palettes, adapted across the full Codex workspace.'],
  ]) {
    const collectionRes = createResponse();
    await contentPageHandler({
      url: `/api/content-page?section=collections&slug=${slug}`,
    }, collectionRes);
    assert.equal(collectionRes.statusCode, 200);
    assert.match(collectionRes.body, new RegExp(`<h1>${heading}<\\/h1>`));
    assert.match(collectionRes.body, new RegExp(description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('unknown editorial routes return 404 and noindex', async () => {
  const res = createResponse();
  await contentPageHandler({
    url: '/api/content-page?section=guides&slug=missing',
  }, res);

  assert.equal(res.statusCode, 404);
  assert.match(res.body, /Guide not found/);
  assert.match(res.body, /noindex, nofollow/);
});

test('Vercel gives editorial routes precedence over the generic theme route', async () => {
  const config = JSON.parse(
    await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
  );
  const sources = config.rewrites.map((rewrite) => rewrite.source);
  const themeRouteIndex = sources.indexOf('/:theme/:variant');

  assert.ok(sources.indexOf('/guides/:slug') < themeRouteIndex);
  assert.ok(sources.indexOf('/features/:slug') < themeRouteIndex);
  assert.ok(sources.indexOf('/articles/:slug') < themeRouteIndex);
  assert.ok(sources.indexOf('/reference/:slug') < themeRouteIndex);
  assert.ok(sources.indexOf('/features/:slug.md') < sources.indexOf('/features/:slug'));
  assert.ok(sources.indexOf('/collections/:slug') < themeRouteIndex);
  assert.ok(sources.indexOf('/sitemap.xml') < themeRouteIndex);
});

test('the dynamic sitemap is not shadowed by a generated root asset', async () => {
  const buildSource = await readFile(
    new URL('../scripts/build.mjs', import.meta.url),
    'utf8',
  );
  const publicFiles = buildSource.match(
    /const staticPublicFiles = \[([\s\S]*?)\];/,
  )?.[1];

  assert.ok(publicFiles);
  assert.doesNotMatch(publicFiles, /"sitemap\.xml"/);
  await assert.rejects(
    access(new URL('../sitemap.xml', import.meta.url)),
    (error) => error?.code === 'ENOENT',
  );
});

test('public page headings use the app font stack', async () => {
  const [appTokens, publicStyles] = await Promise.all([
    readFile(new URL('../styles/tokens.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/public-pages.css', import.meta.url), 'utf8'),
  ]);

  const appFont = readCssCustomProperty(appTokens, '--font');
  const publicDisplayFont = readCssCustomProperty(publicStyles, '--display');

  assert.ok(appFont);
  assert.ok(publicDisplayFont);
  assert.equal(
    normalizeFontStack(publicDisplayFont),
    normalizeFontStack(appFont),
  );
  assert.doesNotMatch(publicDisplayFont, /Avenir|Condensed/i);
});
