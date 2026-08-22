import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import ogHandler from '../api/og.js';
import shareHandler from '../api/share.js';
import {
  renderCollectionPage,
  renderCollectionsHub,
  renderContentHub,
  renderContentPage,
} from '../shared/public-pages.js';
import { CONTENT_ITEMS } from '../shared/generated-content.js';
import {
  CONTENT_LAST_MODIFIED,
  EDITOR_CLASSIC_THEME_IDS,
  HOME_SOCIAL_IMAGE_ALT,
  HOME_SOCIAL_IMAGE_URL,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_WIDTH,
  buildCatalogSocialImageVersion,
  buildCollectionSocialImageUrl,
  buildContentSocialImageUrl,
  buildStaticPageSocialImageUrl,
  getCatalogThemeId,
} from '../shared/seo.js';

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

function getMetaContent(html, attribute, key) {
  const match = html.match(new RegExp(`<meta ${attribute}="${key}" content="([^"]+)">`));
  return match?.[1]?.replaceAll('&amp;', '&') || null;
}

function assertLargeCardMetadata(html, { imageUrl, imageAlt }) {
  assert.equal(getMetaContent(html, 'property', 'og:image'), imageUrl);
  assert.equal(getMetaContent(html, 'property', 'og:image:secure_url'), imageUrl);
  assert.equal(getMetaContent(html, 'property', 'og:image:type'), 'image/png');
  assert.equal(getMetaContent(html, 'property', 'og:image:width'), String(SOCIAL_IMAGE_WIDTH));
  assert.equal(getMetaContent(html, 'property', 'og:image:height'), String(SOCIAL_IMAGE_HEIGHT));
  assert.equal(getMetaContent(html, 'property', 'og:image:alt'), imageAlt);
  assert.equal(getMetaContent(html, 'name', 'twitter:card'), 'summary_large_image');
  assert.equal(getMetaContent(html, 'name', 'twitter:image'), imageUrl);
  assert.equal(getMetaContent(html, 'name', 'twitter:image:alt'), imageAlt);
  assert.doesNotMatch(html, /logo-github-transparent\.png/);
}

function assertRenderedPng(res) {
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'], 'image/png');
  assert.ok(Buffer.isBuffer(res.body));
  assert.equal(res.body.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(res.body.readUInt32BE(16), SOCIAL_IMAGE_WIDTH);
  assert.equal(res.body.readUInt32BE(20), SOCIAL_IMAGE_HEIGHT);
}

function assertPngResponse(res) {
  assertRenderedPng(res);
  assert.match(res.headers['cache-control'], /immutable/);
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

function installUnavailableCommunityFetch(t) {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  globalThis.fetch = async () => {
    throw new Error('catalog timeout');
  };
  console.warn = () => {};
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
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
  const imageUrl = getMetaContent(res.body, 'property', 'og:image');
  assertLargeCardMetadata(res.body, {
    imageUrl,
    imageAlt: 'ManCity dark Codex theme preview',
  });
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

test('community social cards stay renderable during a live-catalog outage', async (t) => {
  installUnavailableCommunityFetch(t);

  for (const url of [
    '/api/og?theme=community-theme&variant=dark&v=2-catalog',
    '/api/og?card=collection&slug=community&v=2-catalog',
  ]) {
    const res = createResponse();
    await ogHandler({ url, headers: { host: 'www.dexthemes.com' } }, res);
    assertRenderedPng(res);
    assert.doesNotMatch(res.headers['cache-control'], /immutable/);
    assert.match(res.headers['cache-control'], /s-maxage=300/);
  }
});

test('every editorial route advertises a card generated from its own content record', () => {
  const sections = ['guides', 'features', 'articles', 'reference'];

  for (const section of sections) {
    const items = CONTENT_ITEMS.filter((item) => item.routeSection === section);
    const hub = renderContentHub(section);
    assertLargeCardMetadata(hub, {
      imageUrl: buildContentSocialImageUrl(section, '', CONTENT_LAST_MODIFIED),
      imageAlt: `${items[0].section}: ${getMetaContent(hub, 'property', 'og:description')}`,
    });

    for (const item of items) {
      const html = renderContentPage(section, item.slug);
      assertLargeCardMetadata(html, {
        imageUrl: buildContentSocialImageUrl(section, item.slug, item.dateModified),
        imageAlt: `${item.section}: ${item.title}`,
      });
    }
  }
});

test('collection routes advertise catalog-specific cards with catalog cache versions', () => {
  const themes = [
    COMMUNITY_THEME,
    {
      id: 'dark-only',
      name: 'Dark Only',
      category: 'dexthemes',
      dark: {
        surface: '#10131a', ink: '#f3f5f7', accent: '#7aa2f7', skill: '#bc8cff',
        diffAdded: '#3fb950', diffRemoved: '#f85149', sidebar: '#0b0d12', codeBg: '#090b10',
      },
    },
    {
      id: 'light-only',
      name: 'Light Only',
      category: 'dexthemes',
      light: {
        surface: '#f7f4ed', ink: '#181a20', accent: '#b26a00', skill: '#7047a8',
        diffAdded: '#147d41', diffRemoved: '#c13535', sidebar: '#eee9df', codeBg: '#ffffff',
      },
    },
  ];

  assertLargeCardMetadata(renderCollectionsHub(), {
    imageUrl: buildCollectionSocialImageUrl(),
    imageAlt: 'DexThemes Codex theme collections',
  });

  for (const [slug, title, filtered] of [
    ['dark', 'Dark Themes', themes.filter((theme) => theme.dark)],
    ['light', 'Light Themes', themes.filter((theme) => theme.light)],
    ['editor-classics', 'Editor Classics', themes.filter((theme) => EDITOR_CLASSIC_THEME_IDS.includes(getCatalogThemeId(theme)))],
    ['community', 'Community Themes', themes.filter((theme) => theme.category === 'community')],
  ]) {
    assertLargeCardMetadata(renderCollectionPage(slug, themes), {
      imageUrl: buildCollectionSocialImageUrl(slug, buildCatalogSocialImageVersion(filtered)),
      imageAlt: `${title} on DexThemes`,
    });
  }
});

test('home and static information pages have content-specific cards', async () => {
  const homeFiles = ['../templates/index.template.html', '../index.html'];
  for (const relativePath of homeFiles) {
    const html = await readFile(new URL(relativePath, import.meta.url), 'utf8');
    assertLargeCardMetadata(html, {
      imageUrl: HOME_SOCIAL_IMAGE_URL,
      imageAlt: HOME_SOCIAL_IMAGE_ALT,
    });
  }

  for (const [page, alt] of [
    ['privacy', 'DexThemes Privacy Policy'],
    ['terms', 'DexThemes Terms of Service'],
    ['support', 'DexThemes Integration Status and Support'],
  ]) {
    for (const prefix of ['../public/', '../']) {
      const html = await readFile(new URL(`${prefix}${page}.html`, import.meta.url), 'utf8');
      assertLargeCardMetadata(html, {
        imageUrl: buildStaticPageSocialImageUrl(page),
        imageAlt: alt,
      });
    }
  }
});

test('each dynamic card family renders a real 1200x630 PNG', async (t) => {
  installCommunityFetch(t);
  const requests = [
    '/api/og?card=home&v=2',
    '/api/og?card=content&section=guides&slug=how-to-install-a-codex-theme&v=2',
    '/api/og?card=content&section=features&slug=community-themes&v=2',
    '/api/og?card=content&section=articles&slug=what-makes-a-good-codex-theme&v=2',
    '/api/og?card=content&section=reference&slug=codex-theme-format&v=2',
    '/api/og?card=collection&v=2',
    '/api/og?card=collection&slug=community&v=2',
    '/api/og?card=page&page=support&v=2',
  ];

  for (const url of requests) {
    const res = createResponse();
    await ogHandler({ url, headers: { host: 'www.dexthemes.com' } }, res);
    assertPngResponse(res);
  }
});

test('dynamic cards reject unknown canonical content instead of reflecting arbitrary text', async () => {
  for (const url of [
    '/api/og?card=content&section=articles&slug=not-real',
    '/api/og?card=content&section=page',
    '/api/og?card=collection&slug=not-real',
    '/api/og?card=page&page=not-real',
  ]) {
    const res = createResponse();
    await ogHandler({ url, headers: { host: 'www.dexthemes.com' } }, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.headers['content-type'], undefined);
  }
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
