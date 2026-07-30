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
