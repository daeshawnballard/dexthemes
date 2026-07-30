import test from 'node:test';
import assert from 'node:assert/strict';

import ogHandler from '../api/og.js';
import shareHandler from '../api/share.js';

const COMMUNITY_THEME = {
  id: 'mancity',
  themeId: 'mancity',
  name: 'ManCity',
  category: 'community',
  summary: 'Sky blue, deep navy, and match-day energy for a focused Codex workspace.',
  authorName: 'Dex Creator',
  dark: {
    surface: '#0d1b3e',
    ink: '#f0f4ff',
    accent: '#6cb4ee',
    contrast: 60,
    diffAdded: '#6cb4ee',
    diffRemoved: '#e84c5e',
    skill: '#f5c84a',
    sidebar: '#08122a',
    codeBg: '#0f1f42',
  },
};

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
    const url = String(input);
    if (url.endsWith('/themes/community')) {
      return Response.json([COMMUNITY_THEME]);
    }
    if (url.endsWith('/themes/likes/counts')) {
      return Response.json({ mancity: 8 });
    }
    return originalFetch(input);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
}

test('community theme pages emit indexable content and a versioned image', async (t) => {
  installCommunityFetch(t);
  const res = createResponse();

  await shareHandler({
    url: '/api/share?theme=mancity&variant=dark',
    headers: { host: 'www.dexthemes.com', 'x-forwarded-proto': 'https' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<title>ManCity Codex Theme — Preview &amp; Import \| DexThemes<\/title>/);
  assert.match(res.body, /<h1>ManCity<\/h1>/);
  assert.match(res.body, /Sky blue, deep navy/);
  assert.match(res.body, /Copy, open Appearance, import/);
  assert.match(res.body, /Open interactive preview/);
  assert.match(res.body, /<link rel="canonical" href="https:\/\/www\.dexthemes\.com\/mancity\/dark">/);
  assert.match(res.body, /<meta property="og:url" content="https:\/\/www\.dexthemes\.com\/mancity\/dark">/);
  assert.match(
    res.body,
    /<meta property="og:image" content="https:\/\/www\.dexthemes\.com\/api\/og\?theme=mancity&amp;variant=dark&amp;v=1-[a-z0-9]+">/,
  );
  assert.doesNotMatch(res.body, /http-equiv="refresh"/i);
});

test('legacy source links redirect permanently to the public identity', async () => {
  const res = createResponse();

  await shareHandler({
    url: '/api/share?theme=naruto-hidden-leaf&variant=dark',
    headers: { host: 'www.dexthemes.com', 'x-forwarded-proto': 'https' },
  }, res);

  assert.equal(res.statusCode, 308);
  assert.equal(res.headers.location, 'https://www.dexthemes.com/seventh-fire-shadow/dark');
});

test('unknown themes and unavailable variants return real 404 pages', async (t) => {
  installCommunityFetch(t);

  const unknown = createResponse();
  await shareHandler({
    url: '/api/share?theme=does-not-exist&variant=dark',
    headers: { host: 'www.dexthemes.com' },
  }, unknown);
  assert.equal(unknown.statusCode, 404);
  assert.match(unknown.body, /Theme not found/);
  assert.match(unknown.body, /noindex, nofollow/);

  const unavailable = createResponse();
  await shareHandler({
    url: '/api/share?theme=github-dark&variant=light',
    headers: { host: 'www.dexthemes.com' },
  }, unavailable);
  assert.equal(unavailable.statusCode, 404);
  assert.match(unavailable.body, /Variant not found/);
});

test('community OG requests render a PNG instead of returning 404', async (t) => {
  installCommunityFetch(t);
  const res = createResponse();

  await ogHandler({
    url: '/api/og?theme=mancity&variant=dark',
    headers: { host: 'www.dexthemes.com' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'], 'image/png');
  assert.ok(Buffer.isBuffer(res.body));
  assert.equal(res.body.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('OG requests do not silently substitute an unavailable variant', async () => {
  const res = createResponse();
  await ogHandler({
    url: '/api/og?theme=github-dark&variant=light',
    headers: { host: 'www.dexthemes.com' },
  }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body, 'Variant not found');
});
