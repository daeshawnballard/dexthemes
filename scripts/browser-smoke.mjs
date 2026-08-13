import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, webkit } from 'playwright';
import shareHandler from '../api/share.js';
import contentPageHandler from '../api/content-page.js';

const root = process.cwd();
const host = '127.0.0.1';
const COMMUNITY_THEME_FIXTURE = {
  id: 'mancity',
  themeId: 'mancity',
  name: 'ManCity',
  category: 'community',
  subgroup: 'community',
  codeThemeId: { dark: 'codex', light: 'codex' },
  copies: 8,
  createdAt: 1783447865082,
  dark: {
    surface: '#0d1b3e', ink: '#f0f4ff', accent: '#6cb4ee', contrast: 60,
    diffAdded: '#6cb4ee', diffRemoved: '#e84c5e', skill: '#f5c84a',
    sidebar: '#08122a', codeBg: '#0f1f42',
  },
  light: {
    surface: '#f2f7ff', ink: '#0d1b3e', accent: '#6cb4ee', contrast: 45,
    diffAdded: '#16834b', diffRemoved: '#d9364f', skill: '#8a6500',
    sidebar: '#e5efff', codeBg: '#ffffff',
  },
  accents: ['#6cb4ee'],
};

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

async function selectPreviewPlatform(page, platformId) {
  const picker = page.locator('#preview-platform-picker');
  if ((await picker.getAttribute('open')) === null) {
    await page.locator('#preview-platform-trigger').click();
  }
  await picker.locator(`[data-platform-id="${platformId}"]`).click();
}

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
}

async function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  if (cleanPath === '/' || cleanPath === '') return path.join(root, 'index.html');
  const absolute = path.join(root, cleanPath.replace(/^\/+/, ''));
  const fileInfo = await stat(absolute).catch(() => null);
  if (fileInfo?.isFile()) return absolute;
  return null;
}

async function startStaticServer() {
  const server = http.createServer(async (req, res) => {
    const requestPath = (req.url || '/').split('?')[0];
    if (requestPath === '/themes/community') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify([COMMUNITY_THEME_FIXTURE]));
      return;
    }

    attachVercelResponseHelpers(res);
    const editorialMatch = /^\/(guides|features|articles|reference)(?:\/([a-z0-9]+(?:-[a-z0-9]+)*)(\.md)?)?$/.exec(requestPath);
    if (editorialMatch) {
      req.url = `/api/content-page?section=${editorialMatch[1]}${editorialMatch[2] ? `&slug=${encodeURIComponent(editorialMatch[2])}` : ''}${editorialMatch[3] ? '&format=markdown' : ''}`;
      await contentPageHandler(req, res);
      return;
    }
    if (requestPath === '/collections' || requestPath.startsWith('/collections/')) {
      const slug = requestPath.split('/')[2] || '';
      req.url = `/api/content-page?section=collections${slug ? `&slug=${encodeURIComponent(slug)}` : ''}`;
      await contentPageHandler(req, res);
      return;
    }
    const themeMatch = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(dark|light)$/.exec(requestPath);
    if (themeMatch) {
      req.url = `/api/share?theme=${encodeURIComponent(themeMatch[1])}&variant=${themeMatch[2]}`;
      await shareHandler(req, res);
      return;
    }

    const filePath = await resolveRequestPath(req.url || '/');
    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 4173;
  return {
    baseUrl: `http://${host}:${port}`,
    communityBaseUrl: `http://dexthemes.localhost:${port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

function attachVercelResponseHelpers(res) {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.send = (body) => {
    res.end(body);
    return res;
  };
}

async function runTest(name, fn) {
  await fn();
  process.stdout.write(`ok - ${name}\n`);
}

async function dismissWelcomeIfPresent(page) {
  const dismiss = page.locator('.welcome-dismiss-btn').first();
  if (await dismiss.count()) {
    await dismiss.click().catch(() => {});
  }
}

async function waitForOnboarding(page) {
  await page.waitForFunction(() => window.localStorage.getItem('dexthemes-onboarded') === '1');
}

async function bootDesktopPage(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('#preview-window');
  await waitForOnboarding(page);
  await dismissWelcomeIfPresent(page);
  return page;
}

async function bootDesktopPageAt(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#preview-window');
  await waitForOnboarding(page);
  await dismissWelcomeIfPresent(page);
  return page;
}

async function bootMobilePage(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('#mobile-nav');
  await page.waitForSelector('.mobile-cat-pills');
  await dismissWelcomeIfPresent(page);
  return page;
}

async function bootTabletPage(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 820, height: 1180 } });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('.mobile-cat-pills');
  await page.waitForSelector('.tablet-explore-nav');
  await dismissWelcomeIfPresent(page);
  return page;
}

const server = await startStaticServer();
const browserType = process.env.PLAYWRIGHT_BROWSER === 'webkit' ? webkit : chromium;
let browser;
try {
  browser = await browserType.launch({ headless: true });
} catch (error) {
  if (browserType !== chromium) throw error;
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  browser = await chromium.launch({ headless: true, executablePath }).catch(() => {
    throw error;
  });
}

try {
  await runTest('desktop browse renders the Codex shell', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    const title = await page.locator('#preview-theme-name').textContent();
    assert.ok(title?.trim().length, 'expected a preview title');
    assert.equal(await page.locator('#preview-platform-trigger').getAttribute('data-platform-id'), 'codex');
    assert.equal(await page.locator('#platform-setup-message').isHidden(), true);
    assert.match(await page.locator('#platform-affiliation').textContent() || '', /OpenAI/);
    assert.match(await page.locator('#apply-btn-text').textContent() || '', /Copy for Codex/);
    assert.equal(await page.locator('#sidebar-create-label').textContent(), 'Create a Theme');
    const sidebarLabelTypography = await page.locator('#sidebar-create-label, .search-bar-wrapper > .field-label').evaluateAll((elements) => (
      elements.map((element) => {
        const style = getComputedStyle(element);
        return [style.fontSize, style.fontWeight, style.color, style.letterSpacing];
      })
    ));
    assert.deepEqual(sidebarLabelTypography[0], sidebarLabelTypography[1]);
    assert.equal(await page.locator('#submit-btn-text').textContent(), 'Create Theme');
    assert.equal(await page.locator('.sidebar-explore').getAttribute('open'), null);
    assert.equal(await page.locator('.sidebar > .sidebar-divider').count(), 2);
    await page.close();
  });

  await runTest('desktop harness context changes preview copy without changing theme sources', async () => {
    const page = await bootDesktopPageAt(browser, `${server.baseUrl}/?platform=deepseek`);
    assert.equal(await page.locator('#preview-platform-trigger').getAttribute('data-platform-id'), 'deepseek');
    assert.equal(await page.locator('#preview-platform-current').textContent(), 'DeepSeek');
    await page.locator('#preview-platform-trigger').click();
    assert.equal(await page.locator('#preview-platform-menu [role="menuitemradio"]').count(), 11);
    assert.equal(await page.locator('#preview-platform-menu [aria-checked="true"]').textContent(), 'DeepSeek✓');
    assert.equal(
      await page.locator('#preview-platform-menu').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
      3,
    );
    const menuBox = await page.locator('#preview-platform-menu').boundingBox();
    assert.ok(menuBox && menuBox.height < 260, `expected a compact product menu, got ${menuBox?.height}px`);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#preview-platform-picker').getAttribute('open'), null);
    assert.equal(await page.locator('#preview-platform-trigger').evaluate((element) => element === document.activeElement), true);
    assert.equal(await page.locator('#preview-theme-name').textContent(), 'DeepSeek');
    assert.equal(await page.locator('#platform-descriptor').textContent(), 'Create & Discover\nThemes for DeepSeek');
    assert.match(await page.locator('#platform-setup-message-text').textContent() || '', /Apply and Revert inside Harness/);
    assert.match(await page.locator('#platform-setup-message-link').getAttribute('href') || '', /npmjs\.com\/package\/@dexthemes\/deepseek-harness-plugin/);
    assert.match(await page.locator('#platform-affiliation').textContent() || '', /DeepSeek/);
    assert.equal(await page.locator('#preview-input-text').getAttribute('aria-label'), 'Preview a DeepSeek prompt');
    assert.equal(await page.locator('[data-action="apply-deepseek"]').count(), 0);

    const setup = page.locator('.panel-actions .platform-setup-btn');
    assert.match(await setup.textContent() || '', /Install for DeepSeek/);
    assert.match(await setup.getAttribute('href') || '', /npmjs\.com\/package\/@dexthemes\/deepseek-harness-plugin/);
    assert.equal(await setup.locator('.apply-icon-platform').count(), 1);
    const themeCount = await page.locator('.thread-item').count();
    const sourceHeadings = await page.locator('.category-header').allTextContents();

    await selectPreviewPlatform(page, 'codex');
    await page.waitForFunction(() => document.getElementById('preview-theme-name')?.textContent === 'Codex');
    await selectPreviewPlatform(page, 'deepseek');
    await page.waitForFunction(() => document.getElementById('preview-theme-name')?.textContent === 'DeepSeek');

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (value) => { window.__dexthemesSharedUrl = value; } },
      });
    });
    await page.click('[data-action="show-theme-details"]');
    await page.click('.theme-details-actions [data-action="share-theme"]');
    await page.waitForFunction(() => Boolean(window.__dexthemesSharedUrl));
    const sharedUrl = await page.evaluate(() => window.__dexthemesSharedUrl);
    assert.equal(new URL(sharedUrl).searchParams.get('platform'), 'deepseek');
    await page.click('[data-action="show-theme-preview"]');

    await selectPreviewPlatform(page, 't3code');
    await page.waitForFunction(() => new URL(window.location.href).searchParams.get('platform') === 't3code');
    assert.equal(await page.locator('.panel-actions .platform-unavailable-btn').isDisabled(), true);
    assert.match(await page.locator('#import-hint').textContent() || '', /No custom theme action/);
    assert.equal(await page.locator('.thread-item').count(), themeCount);
    assert.deepEqual(await page.locator('.category-header').allTextContents(), sourceHeadings);

    const actionOverflow = await page.locator('.panel-actions').evaluate((element) => element.scrollWidth - element.clientWidth);
    assert.ok(actionOverflow <= 0, `expected no right-panel helper overflow, got ${actionOverflow}px`);
    await page.close();
  });

  await runTest('desktop fandom intent resolves to an original identity with visual descriptors', async () => {
    const page = await bootDesktopPageAt(
      browser,
      `${server.baseUrl}/?theme=naruto-hidden-leaf&variant=dark`,
    );
    const expectedSummary = 'Leaf-green, ember-orange, and midnight blue for a determined village guardian carrying a legacy forward.';
    assert.equal(await page.locator('#preview-theme-name').textContent(), 'Seventh Fire Shadow');
    assert.equal(await page.locator('#preview-theme-summary').textContent(), expectedSummary);
    assert.equal(await page.locator('.preview-theme-summary').textContent(), `Palette direction${expectedSummary}`);
    assert.equal(await page.locator('.mini-theme-summary').count(), 2);
    assert.equal(new URL(page.url()).pathname, '/seventh-fire-shadow/dark');

    await page.fill('#sidebar-search', 'Naruto');
    const searchResult = page.locator('[data-theme-id="naruto-hidden-leaf"] .thread-title');
    await searchResult.waitFor();
    assert.equal(await searchResult.textContent(), 'Seventh Fire Shadow');
    await page.close();
  });

  await runTest('desktop variant switching updates the selected card', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    const activeThemeId = await page.locator('.thread-item.active').first().getAttribute('data-theme-id');
    assert.ok(activeThemeId, 'expected an active theme id');
    await page.click('#card-light');
    await page.waitForFunction(() => document.getElementById('card-light')?.getAttribute('aria-pressed') === 'true');
    assert.equal(new URL(page.url()).pathname, `/${activeThemeId}/light`);
    const applyText = await page.locator('.apply-codex-btn').first().textContent();
    assert.match(applyText || '', /Copy for Codex/);
    await page.click('#apply-codex-btn');
    await page.waitForFunction(() => document.getElementById('apply-btn-text')?.textContent === 'Theme copied to clipboard');
    assert.equal(await page.locator('.apply-handoff-status').textContent(), 'Copied to clipboard');
    await page.close();
  });

  await runTest('desktop builder flow opens and edits a theme name', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    await page.click('#submit-btn');
    await page.waitForSelector('.builder-panel');
    assert.equal(await page.locator('#preview-theme-name').textContent(), 'Your Theme Name');
    assert.equal(await page.locator('.builder-panel-header .panel-title').textContent(), 'Theme Builder');
    const headerBottoms = await Promise.all([
      page.locator('.sidebar-header').evaluate((element) => element.getBoundingClientRect().bottom),
      page.locator('.main-header').evaluate((element) => element.getBoundingClientRect().bottom),
      page.locator('.panel-header').evaluate((element) => element.getBoundingClientRect().bottom),
    ]);
    assert.ok(
      Math.max(...headerBottoms) - Math.min(...headerBottoms) <= 1,
      `expected desktop header dividers to align, got ${headerBottoms.join(', ')}`,
    );
    await page.fill('#builder-name', 'Smoke Theme');
    const value = await page.locator('#builder-name').inputValue();
    assert.equal(value, 'Smoke Theme');
    assert.equal(await page.locator('#preview-theme-name').textContent(), 'Smoke Theme');
    await page.click('.builder-apply-btn');
    await page.waitForFunction(() => document.querySelector('.builder-apply-btn-text')?.textContent === 'Theme copied to clipboard');
    await page.close();
  });

  await runTest('DexThemes AI fills the editable pair without applying or submitting', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    const lunaTheme = {
      id: 'harbor-lantern',
      themeId: 'harbor-lantern',
      name: 'Harbor Lantern',
      summary: 'Deep harbor blues with a warm guiding accent.',
      category: 'community',
      codeThemeId: { dark: 'codex', light: 'codex' },
      dark: {
        surface: '#0B1622', ink: '#F4F7FA', accent: '#FFB347', sidebar: '#08111B', codeBg: '#101E2B',
        diffAdded: '#57C785', diffRemoved: '#FF6B6B', skill: '#8CB4FF', contrast: 64,
      },
      light: {
        surface: '#F5F8FB', ink: '#17212B', accent: '#B45F06', sidebar: '#E8EEF4', codeBg: '#FFFFFF',
        diffAdded: '#16794B', diffRemoved: '#C73535', skill: '#365FA0', contrast: 48,
      },
      accents: ['#FFB347', '#B45F06'],
    };
    await page.route('**/api/generate-theme', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        theme: lunaTheme,
        validation: { valid: true, errors: [], warnings: [] },
        model: 'gpt-5.6-luna',
        requestId: 'smoke-luna-1',
      }),
    }));

    await page.click('#submit-btn');
    await page.fill('#builder-name', 'Manual Base');
    await page.fill('#builder-luna-prompt', 'A quiet harbor at night with one warm guiding lantern');
    const manualSurface = await page.locator('#builder-color-surface').inputValue();
    const storedBeforeGenerate = await page.evaluate(() => localStorage.getItem('dexthemes-builder'));

    await page.click('[data-action="builder-generate-luna"]');
    await page.waitForFunction(() => document.getElementById('builder-name')?.value === 'Harbor Lantern');
    assert.equal(await page.locator('#builder-color-surface').inputValue(), '#0B1622');
    assert.notEqual(await page.evaluate(() => localStorage.getItem('dexthemes-builder')), storedBeforeGenerate);
    assert.match(await page.locator('#builder-luna-status').textContent() || '', /Nothing has been applied or submitted/i);
    assert.equal(await page.locator('.builder-apply-btn').evaluate((element) => element.classList.contains('copied')), false);

    await page.click('[data-action="builder-undo-ai"]');
    assert.equal(await page.locator('#builder-name').inputValue(), 'Manual Base');
    assert.equal(await page.locator('#builder-color-surface').inputValue(), manualSurface);
    assert.equal(await page.evaluate(() => localStorage.getItem('dexthemes-builder')), storedBeforeGenerate);
    assert.match(await page.locator('#builder-luna-status').textContent() || '', /Previous manual draft restored/i);
    await page.close();
  });

  await runTest('desktop locked theme selection shows the locked shell', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    await page.fill('#sidebar-search', 'Patron');
    await page.waitForSelector('[data-theme-id="patron"]');
    await page.click('[data-theme-id="patron"]');
    await page.waitForSelector('.locked-theme-shell-card');
    const lockedTitle = await page.locator('.locked-theme-shell-title').textContent();
    assert.match(lockedTitle || '', /Patron/i);
    assert.equal(await page.locator('[data-action="show-theme-details"]').isDisabled(), true);
    assert.equal(await page.locator('#theme-details-view').isHidden(), true);
    await page.close();
  });

  await runTest('desktop signed-out like action shows a sign-in prompt', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    await page.click('#like-btn');
    await page.waitForSelector('.like-signin-prompt');
    const promptBody = await page.locator('.like-signin-prompt .assistant-inline-body').textContent();
    assert.match(promptBody || '', /like this theme/i);
    await page.close();
  });

  await runTest('desktop query boot honors the requested variant without breaking shell startup', async () => {
    const page = await bootDesktopPageAt(browser, `${server.baseUrl}/?theme=solarized&variant=light`);
    await page.waitForFunction(() => document.getElementById('card-light')?.getAttribute('aria-pressed') === 'true');
    const url = page.url();
    assert.equal(new URL(url).search, '');
    assert.equal(new URL(url).pathname, '/solarized/light');
    await page.close();
  });

  await runTest('desktop canonical path renders a complete public theme page', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const response = await page.goto(`${server.baseUrl}/github-dark/dark`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200);
    assert.equal(await page.locator('h1').textContent(), 'GitHub Dark');
    assert.equal(await page.locator('.palette-sample').count(), 6);
    assert.match(await page.locator('.action-note').textContent() || '', /Nothing is applied/);
    assert.equal(await page.locator('meta[http-equiv="refresh"]').count(), 0);
    await page.close();
  });

  await runTest('desktop workspace switches between chat preview and theme details', async () => {
    const page = await bootDesktopPage(browser, server.baseUrl);
    await page.click('[data-action="show-theme-details"]');
    await page.waitForSelector('#theme-details-view:not([hidden])');
    assert.equal(await page.locator('.theme-details-hero h2').textContent(), await page.locator('#preview-theme-name').textContent());
    assert.equal(await page.locator('.theme-details-swatch').count(), 8);
    assert.equal(await page.locator('.theme-details-actions [data-action="share-theme"]').count(), 1);
    await page.click('[data-action="show-theme-preview"]');
    await page.waitForFunction(() => document.getElementById('theme-details-view')?.hidden === true);
    assert.equal(await page.locator('#preview-window').isVisible(), true);
    await page.close();
  });

  await runTest('guides render as answer-first public pages', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const response = await page.goto(
      `${server.baseUrl}/guides/how-to-install-a-codex-theme`,
      { waitUntil: 'networkidle' },
    );
    assert.equal(response?.status(), 200);
    assert.equal(await page.locator('h1').textContent(), 'How to Install a Codex Theme');
    assert.match(await page.locator('.answer-first').textContent() || '', /Appearance/);
    await page.close();
  });

  await runTest('feature articles render with a truthful author byline and Markdown alternate', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const response = await page.goto(
      `${server.baseUrl}/features/leaderboard`,
      { waitUntil: 'networkidle' },
    );
    assert.equal(response?.status(), 200);
    assert.match(await page.locator('h1').textContent() || '', /leaderboard/i);
    assert.match(await page.locator('.content-byline').textContent() || '', /Daeshawn Ballard/);
    assert.equal(
      await page.locator('link[rel="alternate"][type="text/markdown"]').count(),
      1,
    );
    assert.ok(await page.locator('.prose h2').count() >= 2);
    await page.close();
  });

  await runTest('collection routes take precedence over generic theme routes', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const response = await page.goto(`${server.baseUrl}/collections/dark`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200);
    assert.equal(await page.locator('h1').textContent(), 'Dark Codex themes');
    assert.ok(await page.locator('.theme-card').count() > 0);
    await page.close();
  });

  await runTest('unavailable theme variants render a real 404', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const response = await page.goto(`${server.baseUrl}/github-dark/light`, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 404);
    assert.match(await page.locator('h1').textContent() || '', /Variant not found/);
    await page.close();
  });

  await runTest('desktop community deep link resolves after the community catalog loads', async () => {
    const page = await bootDesktopPageAt(browser, `${server.communityBaseUrl}/?theme=mancity&variant=light`);
    await page.waitForFunction(() => document.getElementById('preview-theme-name')?.textContent === 'ManCity');
    await page.waitForFunction(() => document.getElementById('card-light')?.getAttribute('aria-pressed') === 'true');
    assert.equal(new URL(page.url()).pathname, '/mancity/light');
    await page.close();
  });

  await runTest('compact viewport boots into mobile browse mode', async () => {
    const page = await bootMobilePage(browser, server.baseUrl);
    await page.waitForSelector('.mobile-cat-pills');
    const activeNav = await page.locator('.mobile-nav-btn.active').textContent();
    assert.match(activeNav || '', /Browse/i);
    await page.locator('.mobile-nav-explore > summary').click();
    assert.equal(await page.locator('.mobile-nav-explore-menu').isVisible(), true);
    for (const href of ['/features', '/guides', '/articles', '/collections', '/collections/community']) {
      assert.equal(
        await page.locator(`.mobile-nav-explore-menu a[href="${href}"]`).count(),
        1,
        `expected mobile navigation Explore to link ${href}`,
      );
    }
    assert.match(await page.locator('#mobile-platform-affiliation').textContent() || '', /OpenAI/);
    await page.close();
  });

  await runTest('tablet resources live in header navigation instead of catalog', async () => {
    const page = await bootTabletPage(browser, server.baseUrl);
    const header = page.locator('.sidebar-header');
    const brand = page.locator('.sidebar-brand');
    const nav = page.locator('.tablet-explore-nav');
    const headerBox = await header.boundingBox();
    const brandBox = await brand.boundingBox();
    const navBox = await nav.boundingBox();
    assert.ok(headerBox && brandBox && navBox, 'expected tablet header navigation bounds');
    assert.ok(navBox.x > brandBox.x + brandBox.width, 'expected navigation after the DexThemes brand');
    assert.ok(headerBox.height <= 72, `expected a compact tablet header, got ${headerBox.height}px`);
    assert.equal(await page.locator('.mobile-nav-explore').isVisible(), false);

    for (const width of [769, 820, 1024]) {
      await page.setViewportSize({ width, height: 1180 });
      assert.equal(await nav.isVisible(), true, `expected tablet navigation at ${width}px`);
      const overflow = await header.evaluate((element) => element.scrollWidth - element.clientWidth);
      assert.ok(overflow <= 0, `expected no tablet header overflow at ${width}px, got ${overflow}px`);
    }

    for (const href of ['/collections', '/guides', '/features', '/articles', '/collections/community']) {
      assert.equal(
        await nav.locator(`:scope > a[href="${href}"]`).count(),
        1,
        `expected tablet header to link ${href}`,
      );
    }
    assert.equal(await page.locator('.tablet-explore-more').count(), 0);
    await page.close();
  });

  await runTest('compact viewport can open preview from a theme selection', async () => {
    const page = await bootMobilePage(browser, server.baseUrl);
    await page.locator('.theme-card').first().click();
    await page.waitForSelector('.panel.mobile-active');
    await page.locator('#preview-platform-trigger').click();
    assert.equal(
      await page.locator('#preview-platform-menu').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
      1,
    );
    await page.keyboard.press('Escape');
    await page.click('[data-action="show-theme-details"]');
    await page.waitForSelector('#theme-details-view:not([hidden])');
    assert.equal(await page.locator('.theme-details-swatches').isVisible(), true);
    await page.click('.theme-details-button[data-action="apply-codex"]');
    await page.waitForFunction(() => document.querySelector('.theme-details-button .theme-copy-label')?.textContent === 'Theme copied to clipboard');
    await page.close();
  });

  await runTest('compact viewport can open the create flow from mobile nav', async () => {
    const page = await bootMobilePage(browser, server.baseUrl);
    await page.click('.mobile-nav-btn[data-view="create"]');
    await page.waitForSelector('.builder-panel');
    const applyText = await page.locator('.builder-apply-btn .builder-apply-btn-text').textContent();
    assert.match(applyText || '', /Copy theme/);
    await page.close();
  });

  await runTest('compact create flow shows the one-time builder sign-in prompt after editing', async () => {
    const page = await bootMobilePage(browser, server.baseUrl);
    await page.click('.mobile-nav-btn[data-view="create"]');
    await page.waitForSelector('.builder-panel');
    await page.fill('#builder-name', 'Pocket Theme');
    await page.waitForSelector('.builder-signin-prompt');
    const promptBody = await page.locator('.builder-signin-prompt .assistant-inline-body').textContent();
    assert.match(promptBody || '', /copy this theme without an account/i);
    await page.close();
  });
} finally {
  await browser.close();
  await server.close();
}
