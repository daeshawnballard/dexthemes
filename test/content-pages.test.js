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
  assert.match(res.body, /<h1>How to install a Codex theme<\/h1>/);
  assert.match(res.body, /open Codex Settings/i);
  assert.match(res.body, /Appearance/);
  assert.match(res.body, /"@type":"HowTo"/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/guides\/how-to-install-a-codex-theme/);
});

test('collection pages combine static and live community themes', async (t) => {
  installCommunityFetch(t);
  const res = createResponse();

  await contentPageHandler({
    url: '/api/content-page?section=collections&slug=community',
  }, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<h1>Community Codex themes<\/h1>/);
  assert.match(res.body, /Night Operator/);
  assert.match(res.body, /\/night-operator\/dark/);
  assert.match(res.body, /"@type":"ItemList"/);
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
