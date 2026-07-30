import test from 'node:test';
import assert from 'node:assert/strict';

import sitemapHandler from '../api/sitemap.js';
import {
  CANONICAL_ORIGIN,
  INDEXNOW_KEY,
  INDEXNOW_KEY_PATH,
  buildSitemapEntries,
  getIndexNowUrlsForTheme,
} from '../shared/seo.js';

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

test('dynamic sitemap includes community variants and the fixed canonical host', async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([{
    id: 'night-operator',
    category: 'community',
    createdAt: Date.UTC(2026, 6, 29),
    dark: { surface: '#10131a' },
    light: { surface: '#f4f1e8' },
  }]);
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const res = createResponse();
  await sitemapHandler({ url: '/sitemap.xml' }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['x-dexthemes-community-theme-count'], '1');
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/night-operator\/dark/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/night-operator\/light/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/guides/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/features\/leaderboard/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/articles\/how-we-test-codex-themes/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/reference\/codex-theme-format/);
  assert.match(res.body, /https:\/\/www\.dexthemes\.com\/collections\/community/);
  assert.doesNotMatch(res.body, /https:\/\/dexthemes\.com/);
});

test('sitemap fails closed when a complete live catalog cannot be built', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  globalThis.fetch = async () => new Response('unavailable', { status: 503 });
  console.warn = () => {};
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  });

  const res = createResponse();
  await sitemapHandler({ url: '/sitemap.xml' }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('IndexNow URLs and verification key use one canonical origin', () => {
  const urls = getIndexNowUrlsForTheme({
    id: 'night-operator',
    dark: {},
    light: {},
  });
  assert.deepEqual(urls, [
    `${CANONICAL_ORIGIN}/night-operator/dark`,
    `${CANONICAL_ORIGIN}/night-operator/light`,
    `${CANONICAL_ORIGIN}/collections/community`,
    `${CANONICAL_ORIGIN}/sitemap.xml`,
  ]);
  assert.equal(INDEXNOW_KEY_PATH, `/${INDEXNOW_KEY}.txt`);

  const entries = buildSitemapEntries([{ id: 'dark-only', dark: {} }], []);
  assert.ok(entries.some((entry) => entry.url === `${CANONICAL_ORIGIN}/dark-only/dark`));
  assert.ok(!entries.some((entry) => entry.url === `${CANONICAL_ORIGIN}/dark-only/light`));
});
