import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMMUNITY_CATALOG_LIMITS,
  colorMeLucky,
  draftTheme,
  getUnlockedThemeDetails,
  loadThemeCatalog,
  prepareGitHubIssue,
  prepareDeepSeekThemeApply,
  prepareThemeApply,
  resetThemeCatalogCacheForTests,
  validateTheme,
} from '../server/theme-tools.js';

test('Color Me Lucky produces a deterministic valid paired draft when seeded', () => {
  const first = colorMeLucky({ seed: 'deepseek-test' });
  const second = colorMeLucky({ seed: 'deepseek-test' });
  assert.deepEqual(first, second);
  assert.equal(first.lucky, true);
  assert.ok(first.theme.dark && first.theme.light);
  assert.equal(validateTheme(first.theme).valid, true);
  assert.equal(first.needsNameConfirmation, true);

  const named = colorMeLucky({ seed: 'deepseek-test', name: 'My Current' });
  assert.equal(named.theme.name, 'My Current');
  assert.equal(named.usedCustomName, true);
  assert.equal(named.needsNameConfirmation, false);
});

test('draftTheme preserves a user-selected custom name', () => {
  const draft = draftTheme({ inspiration: 'Argentina football at night', name: 'Argentina Afterglow' });
  assert.equal(draft.theme.name, 'Argentina Afterglow');
  assert.equal(draft.usedCustomName, true);
  assert.equal(draft.needsNameConfirmation, false);
  assert.ok(draft.theme.dark);
  assert.ok(draft.theme.light);
});

test('draftTheme marks an automatic name for confirmation', () => {
  const draft = draftTheme({ inspiration: 'quiet ocean focus', variant: 'dark' });
  assert.equal(draft.usedCustomName, false);
  assert.equal(draft.needsNameConfirmation, true);
  assert.ok(draft.theme.dark);
  assert.equal(draft.theme.light, null);
});

test('validateTheme rejects protected DexThemes palettes', () => {
  const result = validateTheme({
    id: 'copied-patron',
    name: 'Copied Patron',
    summary: 'A copied palette.',
    accents: ['#D4A54A'],
    dark: {
      surface: '#0F0D09', ink: '#FFF5DC', accent: '#D4A54A', contrast: 68,
      diffAdded: '#5CB870', diffRemoved: '#E05A4F', skill: '#C9A0DC',
    },
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /protected/i);
});

test('prepareThemeApply returns a valid Codex import payload', () => {
  const { theme } = draftTheme({ inspiration: 'focused indigo', name: 'Focus Signal' });
  const apply = prepareThemeApply(theme, 'dark');
  assert.equal(apply.settingsUrl, 'codex://settings');
  assert.match(apply.importString, /^codex-theme-v1:/);
  const payload = JSON.parse(apply.importString.slice('codex-theme-v1:'.length));
  assert.equal(payload.variant, 'dark');
  assert.equal(payload.theme.accent, theme.dark.accent);
});

test('prepareDeepSeekThemeApply returns a reversible Cordis payload without changing Codex apply', () => {
  const { theme } = draftTheme({ inspiration: 'focused indigo', name: 'Focus Signal' });
  const apply = prepareDeepSeekThemeApply(theme);
  assert.equal(apply.target, 'deepseek-harness');
  assert.equal(apply.activation.tool, 'cordis_run');
  assert.equal(apply.reversal.tool, 'cordis_stop');
  assert.match(apply.cordisDefine.code.client, /theme\.overrideTokens/);
  assert.equal('importString' in apply, false);
});

test('unlocked theme details can be exposed only from authenticated achievement tools', () => {
  const reward = getUnlockedThemeDetails('golden-hour');
  assert.equal(reward.name, 'Golden Hour');
  assert.ok(reward.dark && reward.light);
  assert.equal(getUnlockedThemeDetails('codex'), null);
});

test('prepareGitHubIssue creates a best-effort redacted review draft without a URL', () => {
  const issue = prepareGitHubIssue({
    title: 'Plugin bug',
    description: 'Preview failed for me@example.com with token ghp_1234567890abcdefghijkl.',
    context: '/home/example/private/project',
  });
  assert.equal('url' in issue, false);
  assert.equal(issue.reviewRequired, true);
  assert.match(issue.redactionNotice, /Best-effort redaction/);
  assert.match(issue.body, /Review this content before submitting/);
  assert.doesNotMatch(issue.body, /me@example\.com|ghp_1234567890|\/home\/example/);
  assert.deepEqual(issue.redactions.sort(), ['access token', 'email', 'home path', 'private path']);
});

test('GitHub feedback redacts common credential and private-context families', () => {
  const synthetic = [
    'AKIAIOSFODNN7EXAMPLE',
    'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    ['xoxb', '123456789012', 'abcdefghijklmnop'].join('-'),
    'npm_abcdefghijklmnopqrstuvwxyz123456',
    '__Host-session=synthetic-session-cookie-value',
    '-----BEGIN PRIVATE KEY-----\nsynthetic-key-material\n-----END PRIVATE KEY-----',
    'https://builder:synthetic-password@example.invalid/private',
    '/workspace/customer/private/theme.json',
  ];
  for (const value of synthetic) {
    const issue = prepareGitHubIssue({
      title: 'Plugin feedback',
      description: `Observed ${value}`,
    });
    assert.equal(issue.body.includes(value), false, value);
    assert.ok(issue.redactions.length > 0, value);
  }
});

test('validateTheme rejects malformed accent values', () => {
  const { theme } = draftTheme({ inspiration: 'safe blue', name: 'Safe Blue' });
  theme.accents = ['#123456\" onmouseover=\"alert(1)'];
  const result = validateTheme(theme);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /accents\[0\].*hex color/);
});

test('theme validation and apply reject HTML, CSS, JSON, and Unicode color injection', () => {
  const attacks = [
    '#000000;url(javascript:alert(1))',
    '#000000\" onmouseover=\"alert(1)',
    '#000000\\nbackground:url(https://attacker.invalid)',
    'var(--host-color)',
    'expression(alert(1))',
    '#ＦＦＦＦＦＦ',
    '#00000000',
  ];
  const keys = ['surface', 'ink', 'accent', 'diffAdded', 'diffRemoved', 'skill', 'sidebar', 'codeBg'];

  for (const attack of attacks) {
    for (const key of keys) {
      const { theme } = draftTheme({ inspiration: 'safe blue', name: 'Safe Blue' });
      theme.dark[key] = attack;
      const result = validateTheme(theme);
      assert.equal(result.valid, false, `${key} accepted ${attack}`);
      assert.throws(() => prepareThemeApply(theme, 'dark'), /six-digit hex color/);
    }
  }
});

test('prepareThemeApply rejects non-finite and out-of-range contrast values', () => {
  for (const contrast of [NaN, Infinity, -1, 101]) {
    const { theme } = draftTheme({ inspiration: 'safe blue', name: 'Safe Blue' });
    theme.dark.contrast = contrast;
    assert.throws(() => prepareThemeApply(theme, 'dark'), /contrast must be an integer between 0 and 100/);
  }
});

test('theme validation and apply reject oversized reflected strings', () => {
  const { theme } = draftTheme({ inspiration: 'safe blue', name: 'Safe Blue' });
  assert.equal(validateTheme({ ...theme, name: 'n'.repeat(81) }).valid, false);
  assert.equal(validateTheme({ ...theme, summary: 's'.repeat(241) }).valid, false);
  assert.equal(validateTheme({ ...theme, themeId: 'a'.repeat(65) }).valid, false);
  assert.equal(validateTheme({ ...theme, id: 'a'.repeat(65), themeId: undefined }).valid, false);
  assert.equal(validateTheme({ ...theme, codeThemeId: 'c'.repeat(81) }).valid, false);
  assert.throws(() => prepareThemeApply({ ...theme, name: 'n'.repeat(81) }, 'dark'), /Theme name/);
  assert.throws(() => prepareThemeApply({ ...theme, codeThemeId: 'c'.repeat(81) }, 'dark'), /Unsupported Codex code theme ID/);
  assert.throws(() => prepareThemeApply({
    ...theme,
    dark: { ...theme.dark, fonts: { code: 'f'.repeat(101), ui: null } },
  }, 'dark'), /fonts\.code/);
});

test('theme validation fails closed for unknown and variant-incompatible code theme IDs', () => {
  const { theme } = draftTheme({ inspiration: 'safe blue', name: 'Safe Blue' });
  for (const codeThemeId of ['unknown-theme', 'github_dark', ' github']) {
    const candidate = { ...theme, codeThemeId };
    assert.equal(validateTheme(candidate).valid, false, codeThemeId);
    assert.throws(() => prepareThemeApply(candidate, 'dark'), /Unsupported Codex code theme ID/);
  }

  const incompatible = { ...theme, codeThemeId: { dark: 'proof', light: 'ayu' } };
  assert.equal(validateTheme(incompatible).valid, false);
  assert.throws(() => prepareThemeApply(incompatible, 'dark'), /Unsupported Codex code theme ID/);
});

test('custom and community themes using the Codex family remain valid', () => {
  const { theme } = draftTheme({ inspiration: 'calm original focus', name: 'Calm Signal' });
  theme.codeThemeId = { dark: 'codex', light: 'codex' };
  assert.equal(validateTheme(theme).valid, true);
  for (const variant of ['dark', 'light']) {
    const payload = JSON.parse(
      prepareThemeApply(theme, variant).importString.slice('codex-theme-v1:'.length),
    );
    assert.equal(payload.codeThemeId, 'codex');
    assert.equal(payload.variant, variant);
  }
});

test('validateTheme rejects every reserved static theme ID', () => {
  const { theme } = draftTheme({ inspiration: 'fresh safe palette', name: 'Fresh Safe Palette', themeId: 'codex' });
  const result = validateTheme(theme);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /reserved/i);
});

test('remote community catalog enforces response, entry, pagination, and timeout bounds', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    resetThemeCatalogCacheForTests();
  });

  let observedSignal;
  globalThis.fetch = async (_url, init) => {
    observedSignal = init.signal;
    return Response.json([{
      id: 'oversize-entry',
      name: 'Oversize entry',
      summary: 'x'.repeat(COMMUNITY_CATALOG_LIMITS.maxEntryBytes),
    }]);
  };
  resetThemeCatalogCacheForTests();
  const entryBounded = await loadThemeCatalog();
  assert.ok(observedSignal instanceof AbortSignal);
  assert.equal(entryBounded.some((theme) => theme.id === 'oversize-entry'), false);

  globalThis.fetch = async () => new Response(
    JSON.stringify([{ id: 'oversize-response', blob: 'x'.repeat(COMMUNITY_CATALOG_LIMITS.maxResponseBytes) }]),
    { headers: { 'content-type': 'application/json' } },
  );
  resetThemeCatalogCacheForTests();
  const responseBounded = await loadThemeCatalog();
  assert.equal(responseBounded.some((theme) => theme.id === 'oversize-response'), false);

  globalThis.fetch = async () => Response.json(Array.from(
    { length: COMMUNITY_CATALOG_LIMITS.maxEntries + 25 },
    (_, index) => ({ id: `bounded-entry-${index}`, name: `Bounded entry ${index}` }),
  ));
  resetThemeCatalogCacheForTests();
  const entryCountBounded = await loadThemeCatalog();
  assert.equal(
    entryCountBounded.filter((theme) => String(theme.id || '').startsWith('bounded-entry-')).length,
    COMMUNITY_CATALOG_LIMITS.maxEntries,
  );

  let pageCalls = 0;
  globalThis.fetch = async () => {
    pageCalls += 1;
    return Response.json({
      themes: [{ id: `bounded-page-${pageCalls}`, name: `Bounded page ${pageCalls}` }],
      nextCursor: `cursor-${pageCalls}`,
    });
  };
  resetThemeCatalogCacheForTests();
  const paginated = await loadThemeCatalog();
  assert.equal(pageCalls, COMMUNITY_CATALOG_LIMITS.maxPages);
  assert.equal(
    paginated.filter((theme) => String(theme.id || '').startsWith('bounded-page-')).length,
    COMMUNITY_CATALOG_LIMITS.maxPages,
  );
});
