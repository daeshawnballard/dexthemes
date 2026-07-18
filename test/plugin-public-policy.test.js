import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PLUGIN_THEME_ALIASES,
  evaluatePublicThemeIdentity,
  isPluginUnlockVisible,
  sanitizeCreatorStatsForPlugin,
  sanitizeThemeForPlugin,
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
    summary: 'A leaf-green and ember-orange palette for a steadfast village guardian.',
  });
  assert.equal(PLUGIN_THEME_ALIASES['master-chief'].name, 'Emerald Spartan');
  for (const alias of Object.values(PLUGIN_THEME_ALIASES)) {
    assert.equal(evaluatePublicThemeIdentity(alias).allowed, true, alias.name);
  }
  const directReferenceGroups = new Set(['anime', 'video-games', 'movies', 'comics', 'companies']);
  const directReferenceThemes = STATIC_THEME_CATALOG.filter((theme) =>
    directReferenceGroups.has(theme.subgroup) && theme.id !== 'shonen-sunset'
  );
  assert.equal(directReferenceThemes.length, Object.keys(PLUGIN_THEME_ALIASES).length);
  for (const theme of directReferenceThemes) {
    assert.ok(PLUGIN_THEME_ALIASES[theme.id], `Missing plugin alias for ${theme.id}`);
  }
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

  const haloResults = await searchThemes('Halo Reach', 3);
  assert.equal(haloResults[0].id, 'emerald-spartan');
  assert.equal(haloResults[0].name, 'Emerald Spartan');
  assert.doesNotMatch(JSON.stringify(haloResults), /Halo|Master Chief|Mjolnir/i);
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
});
