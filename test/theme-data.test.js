import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildThemeImageVersion,
  fetchCommunityThemes,
  resolveTheme,
} from '../api/theme-data.js';

const COMMUNITY_THEME = {
  id: 'mancity',
  themeId: 'mancity',
  name: 'ManCity',
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

test('resolveTheme returns a static theme without fetching community data', async () => {
  const staticTheme = { name: 'Codex', dark: {} };
  const theme = await resolveTheme({ codex: staticTheme }, 'codex', {
    fetchImpl: () => {
      throw new Error('community fetch should not run');
    },
  });

  assert.equal(theme, staticTheme);
});

test('resolveTheme falls back to the published community catalog', async () => {
  const theme = await resolveTheme({}, 'mancity', {
    fetchImpl: async () => Response.json([COMMUNITY_THEME]),
  });

  assert.deepEqual(theme, COMMUNITY_THEME);
});

test('fetchCommunityThemes rejects malformed upstream data', async () => {
  await assert.rejects(
    fetchCommunityThemes({ fetchImpl: async () => Response.json({ themes: [] }) }),
    /must be an array/,
  );
});

test('buildThemeImageVersion changes when rendered theme data changes', () => {
  const original = buildThemeImageVersion(COMMUNITY_THEME, 'deploy');
  const changed = buildThemeImageVersion({
    ...COMMUNITY_THEME,
    dark: { ...COMMUNITY_THEME.dark, accent: '#ffffff' },
  }, 'deploy');

  assert.match(original, /^deploy-[a-z0-9]+$/);
  assert.notEqual(changed, original);
});
