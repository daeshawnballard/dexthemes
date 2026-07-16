import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UNLOCK_THEMES,
  THEME_ID_TO_ACTION,
  getUnlockActionForThemeId,
  getUnlockConfigForThemeId,
  isThemeLockedForUser,
} from '../src/unlocks.js';
import { STATIC_THEME_CATALOG } from '../shared/theme-api-catalog.js';

const OPENAI_ACHIEVEMENT_LINE = 'OpenAI is nothing without its people.';

test('reverse unlock map resolves each theme id back to its action', () => {
  for (const [action, unlock] of Object.entries(UNLOCK_THEMES)) {
    assert.equal(THEME_ID_TO_ACTION[unlock.themeId], action);
    assert.equal(getUnlockActionForThemeId(unlock.themeId), action);
    assert.deepEqual(getUnlockConfigForThemeId(unlock.themeId), unlock);
  }
});

test('non-unlock themes do not resolve to an action or locked state', () => {
  assert.equal(getUnlockActionForThemeId('codex'), null);
  assert.equal(getUnlockConfigForThemeId('codex'), null);
  assert.equal(isThemeLockedForUser('codex', new Set()), false);
});

test('locked theme detection depends on whether the user has unlocked that theme id', () => {
  const lockedThemeId = UNLOCK_THEMES.buy_coffee.themeId;
  assert.equal(isThemeLockedForUser(lockedThemeId, new Set()), true);
  assert.equal(isThemeLockedForUser(lockedThemeId, new Set([lockedThemeId])), false);
});

test('Builder of AGI keeps its people-first achievement line across unlock and catalog surfaces', () => {
  const unlock = UNLOCK_THEMES.openai_employee;
  const theme = STATIC_THEME_CATALOG.find((candidate) => candidate.id === unlock.themeId);

  assert.equal(unlock.name, 'Builder of AGI');
  assert.equal(unlock.description, OPENAI_ACHIEVEMENT_LINE);
  assert.ok(theme);
  assert.match(theme._summary, /^OpenAI is nothing without its people\./);
});

test('daily and weekly winner achievements unlock distinct one-time reward themes', () => {
  const daily = UNLOCK_THEMES.theme_of_day;
  const weekly = UNLOCK_THEMES.theme_of_week;
  const dailyTheme = STATIC_THEME_CATALOG.find((candidate) => candidate.id === daily.themeId);
  const weeklyTheme = STATIC_THEME_CATALOG.find((candidate) => candidate.id === weekly.themeId);

  assert.equal(daily.achievement, 'Theme of the Day');
  assert.equal(weekly.achievement, 'Theme of the Week');
  assert.equal(daily.name, 'Golden Hour');
  assert.equal(weekly.name, 'Headliner');
  assert.ok(dailyTheme?.dark && dailyTheme?.light);
  assert.ok(weeklyTheme?.dark && weeklyTheme?.light);
});
