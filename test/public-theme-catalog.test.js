import assert from 'node:assert/strict';
import test from 'node:test';

import themesHandler from '../api/themes.js';
import subgroupHandler from '../api/themes-subgroup.js';

function installEmptyCommunityCatalog(t) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([]);
  t.after(() => { globalThis.fetch = originalFetch; });
}

test('public theme API returns original IDs and names for legacy and canonical lookups', async (t) => {
  installEmptyCommunityCatalog(t);

  for (const id of ['naruto-hidden-leaf', 'seventh-fire-shadow']) {
    const response = await themesHandler(new Request(`https://www.dexthemes.com/api/themes?id=${id}`));
    const payload = await response.json();
    assert.equal(payload.count, 1);
    assert.equal(payload.themes[0].id, 'seventh-fire-shadow');
    assert.equal(payload.themes[0].themeId, 'seventh-fire-shadow');
    assert.equal(payload.themes[0].name, 'Seventh Fire Shadow');
    assert.match(payload.themes[0].summary, /village guardian carrying a legacy forward/i);
    assert.doesNotMatch(JSON.stringify(payload), /Naruto|Hidden Leaf/i);
  }
});

test('familiar search intent remains discoverable without leaking it into API results', async (t) => {
  installEmptyCommunityCatalog(t);

  const response = await themesHandler(new Request('https://www.dexthemes.com/api/themes?q=Naruto'));
  const payload = await response.json();
  const match = payload.themes.find((theme) => theme.id === 'seventh-fire-shadow');
  assert.ok(match);
  assert.equal(match.name, 'Seventh Fire Shadow');
  assert.doesNotMatch(JSON.stringify(payload), /Naruto|Hidden Leaf/i);
});

test('public subgroup API uses the same original presentation', async () => {
  const response = subgroupHandler(new Request('https://www.dexthemes.com/api/themes-subgroup?subgroup=anime'));
  const themes = await response.json();
  const match = themes.find((theme) => theme.id === 'seventh-fire-shadow');
  assert.ok(match);
  assert.equal(match.name, 'Seventh Fire Shadow');
  assert.doesNotMatch(JSON.stringify(match), /Naruto|Hidden Leaf/i);
});
test('public API keeps website IDs while exposing canonical Codex code theme IDs', async (t) => {
  installEmptyCommunityCatalog(t);

  const expected = {
    'github-dark': 'github',
    'github-light': 'github',
    gruvbox: 'gruvbox',
    'one-dark': 'one',
  };
  for (const [id, codeThemeId] of Object.entries(expected)) {
    const response = await themesHandler(
      new Request(`https://www.dexthemes.com/api/themes?id=${id}`),
    );
    const payload = await response.json();
    assert.equal(payload.count, 1);
    assert.equal(payload.themes[0].id, id);
    assert.equal(payload.themes[0].themeId, id);
    assert.equal(payload.themes[0].codeThemeId, codeThemeId);
  }
});

test('public API adds derived DeepSeek compatibility without changing stored theme identity', async (t) => {
  installEmptyCommunityCatalog(t);

  const pairedResponse = await themesHandler(
    new Request('https://www.dexthemes.com/api/themes?id=codex'),
  );
  const paired = (await pairedResponse.json()).themes[0];
  assert.equal(paired.id, 'codex');
  assert.deepEqual(paired.integrations.deepseek, {
    eligible: true,
    mechanism: 'cordis-theme-override',
    packageUrl: '/api/deepseek-theme?theme=codex',
    applyPreparationUrl: '/api/deepseek-theme?theme=codex',
    requiresInstalledCordisSurface: true,
    installedPluginPackage: '@dexthemes/deepseek-harness-plugin',
    installedPluginSurface: 'settings.plugins.dexthemes',
    oneClickScope: 'installed-plugin',
    fontsSupported: false,
  });

  const singleResponse = await themesHandler(
    new Request('https://www.dexthemes.com/api/themes?id=ayu'),
  );
  const single = (await singleResponse.json()).themes[0];
  assert.equal(single.integrations.deepseek.eligible, false);
  assert.equal(single.integrations.deepseek.packageUrl, null);
  assert.equal(single.integrations.deepseek.oneClickScope, 'installed-plugin');
});
