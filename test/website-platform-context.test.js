import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { getPreviewExamples } from '../src/preview-examples.js';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.document = {
  referrer: '',
  documentElement: { dataset: {} },
  getElementById: () => null,
  querySelector: () => null,
};
globalThis.window = {
  innerWidth: 1440,
  location: new URL('https://www.dexthemes.com/'),
  history: { replaceState() {} },
};

const {
  buildContextualThemePath,
  getPlatformPreviewCopy,
  getWebsitePlatformAction,
} = await import('../src/platform-context.js');

test('platform preview copy is derived from the shared registry', () => {
  const codex = getPlatformPreviewCopy('codex');
  const deepseek = getPlatformPreviewCopy('deepseek');

  assert.equal(codex.inputPlaceholder, 'Ask Codex anything...');
  assert.equal(codex.brandDescriptor, 'Create & Discover\nThemes for Codex');
  assert.match(codex.affiliation, /OpenAI/);
  assert.equal(deepseek.inputAriaLabel, 'Preview a DeepSeek prompt');
  assert.equal(deepseek.brandDescriptor, 'Create & Discover\nThemes for DeepSeek');
  assert.equal(deepseek.descriptor, 'DeepSeek themes.');
  assert.equal(deepseek.affiliation, 'Not affiliated with DeepSeek.');
  assert.match(deepseek.capability, /Apply and Revert inside Harness/);
});

test('preview-only and limited platform copy keep their distinct handoff boundaries', () => {
  const antigravity = getPlatformPreviewCopy('antigravity');
  const grok = getPlatformPreviewCopy('grok');

  assert.match(antigravity.metaDescription, /does not claim a supported Antigravity handoff/i);
  assert.doesNotMatch(antigravity.metaDescription, /before using the supported/i);
  assert.equal(antigravity.inputAriaLabel, 'Preview an Antigravity prompt');
  assert.match(grok.metaDescription, /limited theme support/i);
  assert.doesNotMatch(grok.metaDescription, /before using the supported/i);

  for (const platformId of ['antigravity', 'grok']) {
    const examples = JSON.stringify(getPreviewExamples(platformId));
    assert.doesNotMatch(examples, /supported setup|finish the handoff|preview before setup|supported handoff only/i);
    assert.match(examples, /preview/i);
  }

  assert.match(JSON.stringify(getPreviewExamples('antigravity')), /No supported Google Antigravity theme handoff/i);
  assert.match(
    JSON.stringify(getPreviewExamples('grok')),
    /exports only the five documented pager\.toml color overrides/i,
  );
});

test('contextual theme paths preserve the verified default and carry verified platforms', () => {
  assert.equal(buildContextualThemePath('mancity', 'light', 'deepseek'), '/mancity/light');
  assert.equal(
    buildContextualThemePath('mancity', 'light', 'cursor'),
    '/mancity/light?platform=cursor',
  );
  assert.equal(buildContextualThemePath('mancity', 'light', 'codex'), '/mancity/light');
});

test('website actions expose only the verified selector roster', () => {
  const deepseek = getWebsitePlatformAction('deepseek');
  const codex = getWebsitePlatformAction('codex');
  const qwen = getWebsitePlatformAction('qwen');

  assert.equal(deepseek.mode, 'setup');
  assert.match(deepseek.destination.value, /npmjs\.com/);
  assert.equal(codex, null);
  assert.equal(qwen, null);
});

test('opening platform setup is attributed as setup, never as an Apply attempt', async () => {
  const [delegated, context, analytics] = await Promise.all([
    readFile(new URL('../src/delegated-actions.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/platform-context.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/platform-analytics.js', import.meta.url), 'utf8'),
  ]);
  assert.match(delegated, /case 'open-platform-setup':[\s\S]*'platform_setup_opened'/);
  assert.doesNotMatch(delegated, /case 'open-platform-setup':[\s\S]{0,260}'apply_attempted'/);
  assert.match(context, /source_surface: 'preview_message'/);
  assert.match(context, /theme_id: link\.dataset\.themeId/);
  assert.match(context, /variant: link\.dataset\.variant/);
  assert.match(analytics, /source_surface: new Set\([^\n]*'preview_message'/);
});
