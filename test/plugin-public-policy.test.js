import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEXTHEMES_THEME_INSPIRATION_REFERENCES,
  PLUGIN_THEME_ALIASES,
  evaluatePublicThemeIdentity,
  getWebsiteThemeId,
  isPluginUnlockVisible,
  presentThemeForPublicApi,
  presentThemeForWebsite,
  sanitizeCreatorStatsForPlugin,
  sanitizeThemeForPlugin,
  websiteThemeMatchesSearch,
} from '../shared/plugin-public-policy.js';
import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';
import {
  draftTheme,
  fetchThemeById,
  searchThemes,
  validatePublicTheme,
  validateTheme,
} from '../server/theme-tools.js';

test('descriptive country, sport, and time-of-day inspiration remains publishable', () => {
  const { theme } = draftTheme({
    inspiration: 'a theme inspired by Argentina football at night',
    name: 'Argentina Football at Night',
  });
  assert.equal(evaluatePublicThemeIdentity(theme).allowed, true);
  assert.equal(validatePublicTheme(theme).valid, true);
  assert.equal(evaluatePublicThemeIdentity({
    name: 'Blue Halo',
    id: 'blue-halo',
    summary: 'A soft ring of blue light.',
  }).allowed, true);
});

test('private fandom drafts remain usable while public wording is gated', () => {
  const { theme } = draftTheme({
    inspiration: 'Halo Reach at midnight',
    name: 'Halo Reach Night',
  });
  assert.equal(validateTheme(theme).valid, true);
  const publication = validatePublicTheme(theme);
  assert.equal(publication.valid, false);
  assert.equal(publication.suggestedNames.length, 3);
  assert.match(publication.suggestedSummary, /^An original /);
  assert.match(publication.errors.join(' '), /original wording/i);
  assert.equal(evaluatePublicThemeIdentity({
    name: 'N-A-R-U-T-O Night',
    id: 'n-a-r-u-t-o-night',
    summary: 'A separated-letter bypass attempt.',
  }).allowed, false);
});

test('curated plugin aliases are original, deterministic, and recognizable by atmosphere', () => {
  assert.deepEqual(PLUGIN_THEME_ALIASES['naruto-hidden-leaf'], {
    id: 'seventh-fire-shadow',
    name: 'Seventh Fire Shadow',
    summary: 'Leaf-green, ember-orange, and midnight blue for a determined village guardian carrying a legacy forward.',
  });
  assert.equal(PLUGIN_THEME_ALIASES['master-chief'].name, 'Emerald Spartan');
  assert.deepEqual(
    Object.keys(DEXTHEMES_THEME_INSPIRATION_REFERENCES).sort(),
    Object.keys(PLUGIN_THEME_ALIASES).sort(),
  );
  assert.equal(DEXTHEMES_THEME_INSPIRATION_REFERENCES['liger-zero-base'], 'Liger Zero');
  assert.equal(DEXTHEMES_THEME_INSPIRATION_REFERENCES['terminator-future-war'], 'Terminator');
  for (const alias of Object.values(PLUGIN_THEME_ALIASES)) {
    assert.equal(evaluatePublicThemeIdentity(alias).allowed, true, alias.name);
    assert.ok(alias.summary?.length > 20, `Missing useful summary for ${alias.name}`);
  }
  const directReferenceGroups = new Set(['anime', 'video-games', 'movies', 'comics', 'companies']);
  const directReferenceThemes = STATIC_THEME_CATALOG.filter((theme) =>
    directReferenceGroups.has(theme.subgroup) && theme.id !== 'shonen-sunset'
  );
  assert.equal(directReferenceThemes.length, Object.keys(PLUGIN_THEME_ALIASES).length);
  for (const theme of directReferenceThemes) {
    const alias = PLUGIN_THEME_ALIASES[theme.id];
    assert.ok(alias, `Missing plugin alias for ${theme.id}`);
    assert.equal(theme.name, alias.name, `Public catalog name drifted for ${theme.id}`);
    assert.equal(theme._summary, alias.summary, `Public catalog summary drifted for ${theme.id}`);
    assert.equal(theme.provenance?.kind, 'unofficial_inspiration', `Missing provenance for ${theme.id}`);
    assert.ok(theme.provenance?.inspiredBy, `Missing inspiration reference for ${theme.id}`);
  }
});

test('website aliases preserve source links while keeping familiar intent searchable', () => {
  const source = {
    id: 'naruto-hidden-leaf',
    name: 'Naruto / Hidden Leaf',
    category: 'dexthemes',
    dark: { accent: '#FF9F1C' },
  };
  const presented = presentThemeForWebsite(source);

  assert.equal(presented.id, source.id);
  assert.equal(getWebsiteThemeId(presented), 'seventh-fire-shadow');
  assert.equal(presented.name, 'Seventh Fire Shadow');
  assert.deepEqual(presented.provenance, {
    kind: 'unofficial_inspiration',
    inspiredBy: 'Naruto / Hidden Leaf',
  });
  assert.equal(
    presented._summary,
    'Leaf-green, ember-orange, and midnight blue for a determined village guardian carrying a legacy forward.',
  );
  assert.equal(websiteThemeMatchesSearch(presented, 'Naruto'), true);
  assert.equal(websiteThemeMatchesSearch(presented, 'Seventh Hokage'), true);
  assert.equal(websiteThemeMatchesSearch(presented, 'purple garden'), false);

  const apiTheme = presentThemeForPublicApi(source);
  assert.equal(apiTheme.id, 'seventh-fire-shadow');
  assert.equal(apiTheme.themeId, 'seventh-fire-shadow');
  assert.equal(apiTheme.name, 'Seventh Fire Shadow');
  assert.equal(apiTheme.provenance.inspiredBy, 'Naruto / Hidden Leaf');
});

test('website presentation omits unsafe unaliased community identities', () => {
  assert.equal(presentThemeForWebsite({
    id: 'naruto-fan-submission',
    name: 'Naruto Fan Theme',
    summary: 'A public fandom submission.',
    category: 'community',
  }), null);
});

test('plugin search and fetch return aliases without exposing source catalog labels', async (t) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [] });
  t.after(() => { globalThis.fetch = originalFetch; });

  const results = await searchThemes('Seventh Hokage', 3);
  assert.equal(results[0].id, 'seventh-fire-shadow');
  assert.equal(results[0].name, 'Seventh Fire Shadow');
  assert.doesNotMatch(JSON.stringify(results), /Naruto|Hidden Leaf/i);

  const fetched = await fetchThemeById('seventh-fire-shadow');
  assert.equal(fetched.name, 'Seventh Fire Shadow');
  assert.equal('url' in fetched, false);

  const github = await fetchThemeById('github-dark');
  assert.equal(github.id, 'github-dark');
  assert.equal(github.codeThemeId, 'github');
  assert.match(github.summary, /workspace theme for Codex/);

  const haloResults = await searchThemes('Halo Reach', 3);
  assert.equal(haloResults[0].id, 'emerald-spartan');
  assert.equal(haloResults[0].name, 'Emerald Spartan');
  assert.doesNotMatch(JSON.stringify(haloResults[0]), /Halo|Master Chief|Mjolnir/i);
  assert.doesNotMatch(JSON.stringify(haloResults), /Master Chief|Mjolnir/i);
});

test('Patron and supporter status are absent from plugin account payloads', () => {
  assert.equal(isPluginUnlockVisible({ action: 'buy_coffee' }), false);
  assert.equal(isPluginUnlockVisible({ action: 'use_plugin' }), true);

  const stats = sanitizeCreatorStatsForPlugin({
    themes: [{
      themeId: 'midnight-plum',
      name: 'Midnight Plum',
      summary: 'An original purple theme.',
      authorIsSupporter: true,
    }],
  });
  assert.equal(stats.themes.length, 1);
  assert.equal('authorIsSupporter' in stats.themes[0], false);

  const aliased = sanitizeThemeForPlugin({
    id: 'master-chief',
    name: 'Master Chief / Mjolnir',
    category: 'dexthemes',
  });
  assert.equal(aliased.id, 'emerald-spartan');
  assert.equal(aliased.name, 'Emerald Spartan');
  assert.equal('provenance' in aliased, false);
});
