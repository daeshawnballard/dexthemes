import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getCatalogCategoriesForPlatform,
  getEmptyCategoryCopy,
  getPlatformThemeCategoryId,
  isThemeCategoryVisibleForPlatform,
} from '../src/platform-catalog.js';
import { PLATFORM_IDS } from '../shared/platform-registry.js';

function categoryIds(platformId) {
  return getCatalogCategoriesForPlatform(platformId).map((category) => category.id);
}

test('catalog shows only the selected harness collection plus shared collections', () => {
  assert.deepEqual(categoryIds('codex'), ['official', 'dexthemes', 'community']);
  assert.deepEqual(categoryIds('deepseek'), ['deepseek', 'dexthemes', 'community']);
  assert.deepEqual(categoryIds('claude'), ['claude', 'dexthemes', 'community']);
  assert.deepEqual(categoryIds('antigravity'), ['antigravity', 'dexthemes', 'community']);
  assert.deepEqual(categoryIds('cursor'), ['cursor', 'dexthemes', 'community']);
  assert.deepEqual(categoryIds('opencode'), ['opencode', 'dexthemes', 'community']);
  assert.deepEqual(categoryIds('grok'), ['grok', 'dexthemes', 'community']);
});

test('every preview target has a stable dedicated collection slot', () => {
  for (const platformId of PLATFORM_IDS) {
    const categories = getCatalogCategoriesForPlatform(platformId);
    assert.equal(categories.length, 3, `${platformId} should expose exactly three catalog categories`);
    assert.equal(categories[0].platformId, platformId);
    assert.equal(getPlatformThemeCategoryId(platformId), categories[0].id);
    assert.equal(new Set(categories.map((category) => category.id)).size, 3);
  }
});

test('platform-specific colors never cross harness catalog boundaries', () => {
  assert.equal(isThemeCategoryVisibleForPlatform('deepseek', 'codex'), false);
  assert.equal(isThemeCategoryVisibleForPlatform('official', 'deepseek'), false);
  assert.equal(isThemeCategoryVisibleForPlatform('deepseek', 'deepseek'), true);
  assert.equal(isThemeCategoryVisibleForPlatform('official', 'codex'), true);
  assert.equal(isThemeCategoryVisibleForPlatform('dexthemes', 'claude'), true);
  assert.equal(isThemeCategoryVisibleForPlatform('community', 'cursor'), true);
});

test('empty filtered platform collections do not imply missing catalog data', () => {
  assert.equal(getEmptyCategoryCopy('claude', 'claude'), 'No Claude themes match');
  assert.equal(getEmptyCategoryCopy('community', 'claude'), 'No community themes yet');
});
