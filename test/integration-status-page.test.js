import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { PLATFORM_IDS, PLATFORM_REGISTRY, WEBSITE_PLATFORM_IDS } from '../shared/platform-registry.js';
import { CONTENT_ITEMS } from '../shared/generated-content.js';

test('integration status page separates verified selection from the complete tracked roster', async () => {
  const page = await readFile(new URL('../public/support.html', import.meta.url), 'utf8');

  assert.match(page, /Shown in the DexThemes selector/);
  assert.match(page, /Tracked here, but not in the selector/);
  assert.match(page, /exact intended DexThemes MCP inventory plus a real call.*visible theme change.*exact restore/i);

  for (const platformId of WEBSITE_PLATFORM_IDS) {
    assert.match(page, new RegExp(`<h3>${PLATFORM_REGISTRY[platformId].displayName}</h3>`));
    assert.match(page, /MCP · yes.*Theme · yes.*Restore · yes/s);
  }

  for (const platformId of PLATFORM_IDS.filter((id) => !WEBSITE_PLATFORM_IDS.includes(id))) {
    assert.match(page, new RegExp(`<h3>${PLATFORM_REGISTRY[platformId].displayName}</h3>`));
  }

  assert.match(page, /oauth_refresh_token_missing/);
  assert.match(page, /Claude Code’s supported MCP authentication/);
  assert.match(page, /Antigravity 2\.9\.1 loaded the exact five-tool preview inventory/);
  assert.match(page, /<strong>50<\/strong><span>mutation only<\/span>[\s\S]*?<h3>Qwen Code<\/h3>/);
  assert.match(page, /no model completed a real <code>mcp__dexthemes__search<\/code> call/);
  assert.match(page, /installation and terms gate was not crossed/);
  assert.match(page, /Green discovery status did not complete a call/);
  assert.match(page, /only five <code>pager\.toml<\/code> colors/);
  assert.match(page, /<strong>≤50<\/strong><span>experimental<\/span>[\s\S]*?<h3>Devin<\/h3>/);
  assert.match(page, /no Devin CLI\/account loaded proof was performed/);
  assert.doesNotMatch(page, /revalidation in progress/i);

  const incompleteSection = page.match(/aria-label="Incomplete and limited integrations">([\s\S]*?)<\/section>/)?.[1] || '';
  assert.ok(incompleteSection);
  assert.doesNotMatch(incompleteSection, /class="button"/);
  assert.equal((incompleteSection.match(/<h3>/g) || []).length, 8);
});

test('status article mirrors the verified-only roster and status-only boundaries', () => {
  const article = CONTENT_ITEMS.find((item) => item.slug === 'dexthemes-harness-integration-status');
  assert.ok(article);
  assert.match(article.markdown, /DeepSeek Harness, OpenCode, Pi, Cursor, and T3 Code/);
  for (const platformId of PLATFORM_IDS) {
    assert.match(article.markdown, new RegExp(`\\*\\*${PLATFORM_REGISTRY[platformId].displayName} (?:—|\\*\\*)`));
  }
  assert.match(article.markdown, /Devin is experimental and status-only/);
  assert.match(article.markdown, /50-point ceiling/);
  assert.match(article.markdown, /Authentication gates are not structural support/);
  assert.match(article.markdown, /were not performed/);
});
