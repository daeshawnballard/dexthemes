import assert from 'node:assert/strict';
import test from 'node:test';

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

test('contextual theme paths preserve Codex defaults and carry non-default platforms', () => {
  assert.equal(buildContextualThemePath('mancity', 'light', 'codex'), '/mancity/light');
  assert.equal(
    buildContextualThemePath('mancity', 'light', 'deepseek'),
    '/mancity/light?platform=deepseek',
  );
});

test('website actions keep DeepSeek on setup and unsupported platforms disabled', () => {
  const deepseek = getWebsitePlatformAction('deepseek');
  const t3code = getWebsitePlatformAction('t3code');

  assert.equal(deepseek.mode, 'setup');
  assert.match(deepseek.destination.value, /npmjs\.com/);
  assert.equal(t3code.mode, 'unavailable');
  assert.equal(t3code.delivered, false);
});
