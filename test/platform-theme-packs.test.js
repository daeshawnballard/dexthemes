import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PLATFORM_THEME_PACKS,
  PLATFORM_THEMES,
  getPlatformThemePack,
} from '../shared/platform-theme-packs.js';
import { PLATFORM_IDS, PLATFORM_REGISTRY } from '../shared/platform-registry.js';
import { evaluatePublicThemeIdentity } from '../shared/plugin-public-policy.js';

const PACK_PLATFORM_IDS = PLATFORM_IDS.filter((platformId) => !['codex', 'deepseek'].includes(platformId));
const HEX = /^#[0-9A-Fa-f]{6}$/;

test('every corrected non-core harness has an original starter pair and a valid default', () => {
  assert.equal(PACK_PLATFORM_IDS.length, 10);
  assert.deepEqual(Object.keys(PLATFORM_THEME_PACKS), PACK_PLATFORM_IDS);

  for (const platformId of PACK_PLATFORM_IDS) {
    const themes = getPlatformThemePack(platformId);
    assert.equal(themes.length, 2, `${platformId} should ship a useful starter pair`);
    assert.ok(
      themes.some((theme) => theme.id === PLATFORM_REGISTRY[platformId].defaultThemeId),
      `${platformId} defaultThemeId must resolve inside its own collection`,
    );
  }
  assert.deepEqual(
    getPlatformThemePack('antigravity').map((theme) => theme.id),
    ['orbital-ink', 'sunward-grid'],
  );
  assert.deepEqual(
    getPlatformThemePack('grok').map((theme) => theme.id),
    ['signal-horizon', 'ember-query'],
  );
  assert.equal(PLATFORM_THEMES.some((theme) => ['prism-circuit', 'solar-spectrum'].includes(theme.id)), false);
});

test('platform collection identities are original, non-affiliating, and structurally complete', () => {
  const ids = new Set();
  const names = new Set();

  for (const theme of PLATFORM_THEMES) {
    assert.equal(ids.has(theme.id), false, `duplicate theme id ${theme.id}`);
    assert.equal(names.has(theme.name), false, `duplicate theme name ${theme.name}`);
    ids.add(theme.id);
    names.add(theme.name);

    assert.equal(evaluatePublicThemeIdentity(theme).allowed, true, theme.name);
    assert.equal(theme.codeThemeId, 'codex');
    assert.equal(theme.provenance, undefined);
    assert.ok(PACK_PLATFORM_IDS.includes(theme.category), theme.category);

    const platform = PLATFORM_REGISTRY[theme.category];
    const identityWords = [platform.displayName, platform.shortName, platform.organizationName]
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
      .filter((value) => value.length > 2);
    const nameWords = new Set(theme.name.toLowerCase().split(/[^a-z0-9]+/));
    for (const word of identityWords) {
      assert.equal(nameWords.has(word), false, `${theme.name} should not borrow the ${word} identity`);
    }

    for (const mode of ['dark', 'light']) {
      const variant = theme[mode];
      for (const key of ['surface', 'ink', 'accent', 'sidebar', 'codeBg', 'diffAdded', 'diffRemoved', 'skill']) {
        assert.match(variant[key], HEX, `${theme.id}.${mode}.${key}`);
      }
    }
  }
});

test('unknown platforms do not inherit another platform collection', () => {
  assert.deepEqual(getPlatformThemePack('unknown-platform'), []);
});
