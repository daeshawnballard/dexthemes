import assert from 'node:assert/strict';
import test from 'node:test';

import {
  POPULARITY_THRESHOLDS,
  currentPopularityPeriod,
  meetsPopularityThreshold,
  previousClosedPopularityPeriod,
  rankPopularityEntries,
  utcDayStart,
  utcMonthStart,
  utcWeekStart,
} from '../shared/popularity-periods.js';

test('popularity periods use UTC days and Monday-through-Sunday UTC weeks', () => {
  const timestamp = Date.UTC(2026, 6, 16, 18, 42);
  assert.equal(utcDayStart(timestamp), Date.UTC(2026, 6, 16));
  assert.equal(utcWeekStart(timestamp), Date.UTC(2026, 6, 13));
  assert.equal(utcMonthStart(timestamp), Date.UTC(2026, 6, 1));
  assert.deepEqual(currentPopularityPeriod('daily', timestamp), {
    periodType: 'daily',
    start: Date.UTC(2026, 6, 16),
    end: Date.UTC(2026, 6, 17),
  });
  assert.deepEqual(previousClosedPopularityPeriod('weekly', timestamp), {
    periodType: 'weekly',
    start: Date.UTC(2026, 6, 6),
    end: Date.UTC(2026, 6, 13),
  });
  assert.deepEqual(currentPopularityPeriod('monthly', timestamp), {
    periodType: 'monthly',
    start: Date.UTC(2026, 6, 1),
    end: Date.UTC(2026, 7, 1),
  });
  assert.deepEqual(previousClosedPopularityPeriod('monthly', timestamp), {
    periodType: 'monthly',
    start: Date.UTC(2026, 5, 1),
    end: Date.UTC(2026, 6, 1),
  });
});

test('period rankings de-duplicate activity and prioritize qualified adoptions', () => {
  const start = Date.UTC(2026, 6, 16);
  const end = Date.UTC(2026, 6, 17);
  const themes = [
    { themeId: 'many-copies', status: 'published' },
    { themeId: 'qualified-leader', status: 'published' },
    { themeId: 'removed-theme', status: 'removed' },
  ];
  const copyEvents = [
    { themeId: 'many-copies', copyKey: 'a', createdAt: start + 1 },
    { themeId: 'many-copies', copyKey: 'b', createdAt: start + 2 },
    { themeId: 'many-copies', copyKey: 'c', createdAt: start + 3 },
    { themeId: 'qualified-leader', copyKey: 'd', createdAt: start + 4 },
    { themeId: 'qualified-leader', copyKey: 'd', createdAt: start + 5 },
    { themeId: 'removed-theme', copyKey: 'e', createdAt: start + 6 },
  ];
  const qualifiedAdoptions = [
    { themeId: 'qualified-leader', userId: 'user-1', createdAt: start + 7 },
    { themeId: 'qualified-leader', userId: 'user-1', createdAt: start + 8 },
  ];

  const ranked = rankPopularityEntries({
    themes,
    copyEvents,
    qualifiedAdoptions,
    start,
    end,
  });

  assert.deepEqual(ranked.map((entry) => entry.themeId), ['qualified-leader', 'many-copies']);
  assert.equal(ranked[0].copies, 1);
  assert.equal(ranked[0].qualifiedAdoptions, 1);
  assert.equal(ranked[1].copies, 3);
});

test('period awards require their configured unique-copy and qualified-adopter thresholds', () => {
  assert.deepEqual(POPULARITY_THRESHOLDS.daily, { copies: 3, qualifiedAdoptions: 1 });
  assert.deepEqual(POPULARITY_THRESHOLDS.weekly, { copies: 5, qualifiedAdoptions: 2 });
  assert.deepEqual(POPULARITY_THRESHOLDS.monthly, { copies: 0, qualifiedAdoptions: 3 });
  assert.equal(meetsPopularityThreshold({ copies: 3, qualifiedAdoptions: 1 }, 'daily'), true);
  assert.equal(meetsPopularityThreshold({ copies: 20, qualifiedAdoptions: 0 }, 'daily'), false);
  assert.equal(meetsPopularityThreshold({ copies: 5, qualifiedAdoptions: 2 }, 'weekly'), true);
  assert.equal(meetsPopularityThreshold({ copies: 5, qualifiedAdoptions: 1 }, 'weekly'), false);
  assert.equal(meetsPopularityThreshold({ copies: 0, qualifiedAdoptions: 3 }, 'monthly'), true);
  assert.equal(meetsPopularityThreshold({ copies: 50, qualifiedAdoptions: 2 }, 'monthly'), false);
});
