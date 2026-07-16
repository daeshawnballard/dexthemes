import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildThemePath,
  readThemeRoute,
  syncThemeUrl,
} from '../src/theme-url.js';

test('readThemeRoute reads legacy query deep links', () => {
  assert.deepEqual(
    readThemeRoute({ pathname: '/', search: '?theme=mancity&variant=light' }),
    { themeId: 'mancity', variant: 'light', source: 'query' },
  );
});

test('readThemeRoute reads canonical theme paths', () => {
  assert.deepEqual(
    readThemeRoute({ pathname: '/mancity/dark', search: '' }),
    { themeId: 'mancity', variant: 'dark', source: 'path' },
  );
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
