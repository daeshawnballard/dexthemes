import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildThemePath,
  readPlatformParam,
  readThemeRoute,
  syncThemeUrl,
} from '../src/theme-url.js';

test('readThemeRoute reads legacy query deep links', () => {
  assert.deepEqual(
    readThemeRoute({ pathname: '/', search: '?theme=mancity&variant=light' }),
    { themeId: 'mancity', variant: 'light', source: 'query' },
  );
});

test('readPlatformParam reads safe platform state independently from theme source', () => {
  assert.equal(readPlatformParam({ search: '?platform=deepseek' }), 'deepseek');
  assert.equal(readPlatformParam({ search: '?platform=../deepseek' }), null);
});

test('readThemeRoute reads canonical theme paths', () => {
  assert.deepEqual(
    readThemeRoute({ pathname: '/mancity/dark', search: '' }),
    { themeId: 'mancity', variant: 'dark', source: 'path' },
  );
});

test('syncThemeUrl keeps Codex URLs unchanged and shares non-default platform context', () => {
  const calls = [];
  syncThemeUrl('mancity', 'dark', {
    platformId: 'deepseek',
    historyImpl: { replaceState(...args) { calls.push(args); } },
    locationImpl: { pathname: '/mancity/dark', search: '', hash: '#auth=token' },
  });
  assert.deepEqual(calls, [[null, '', '/mancity/dark?platform=deepseek#auth=token']]);
});

test('buildThemePath rejects values outside the public theme route contract', () => {
  assert.equal(buildThemePath('mancity', 'light'), '/mancity/light');
  assert.equal(buildThemePath('../admin', 'dark'), null);
  assert.equal(buildThemePath('mancity', 'sepia'), null);
});

test('syncThemeUrl replaces query state with a copyable path and preserves auth hashes', () => {
  const calls = [];
  const changed = syncThemeUrl('mancity', 'dark', {
    historyImpl: {
      replaceState(...args) {
        calls.push(args);
      },
    },
    locationImpl: {
      pathname: '/',
      search: '?theme=mancity&variant=dark',
      hash: '#auth=token',
    },
  });

  assert.equal(changed, true);
  assert.deepEqual(calls, [[null, '', '/mancity/dark#auth=token']]);
});
