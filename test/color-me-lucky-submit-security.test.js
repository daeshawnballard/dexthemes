import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = await build({
  absWorkingDir: repositoryRoot,
  entryPoints: ['convex/http_color_me_lucky_routes.ts'],
  bundle: true,
  format: 'esm',
  logLevel: 'silent',
  platform: 'node',
  target: 'node22',
  write: false,
});
const routeModule = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`
);
const {
  COLOR_ME_LUCKY_SUBMISSION_MAX_BODY_BYTES,
  handleColorMeLuckySubmission,
} = routeModule;

function requestWith(body, headers = {}) {
  return new Request('https://example.convex.site/api/color-me-lucky/submit', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer dxt_test_key',
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

function createContext({ rates = [], user = { _id: 'user-123' } } = {}) {
  const mutations = [];
  const queries = [];
  let rateIndex = 0;
  return {
    mutations,
    queries,
    ctx: {
      meta: {
        getRequestMetadata: async () => ({ ip: '203.0.113.9' }),
      },
      runQuery: async (_reference, args) => {
        queries.push(args);
        return user;
      },
      runMutation: async (_reference, args) => {
        mutations.push(args);
        if (typeof args.key === 'string') {
          return rates[rateIndex++] || { allowed: true };
        }
        return { themeId: args.themeId, name: args.name };
      },
    },
  };
}

test('Color Me Lucky rejects an oversized body before JSON parsing or theme submission', async () => {
  const { ctx, mutations } = createContext();
  const response = await handleColorMeLuckySubmission(
    ctx,
    requestWith('x'.repeat(COLOR_ME_LUCKY_SUBMISSION_MAX_BODY_BYTES + 1)),
  );

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { error: 'Request body too large' });
  assert.equal(mutations.filter((args) => typeof args.key !== 'string').length, 0);
});

test('Color Me Lucky stops at the standard network submission denial', async () => {
  const { ctx, mutations, queries } = createContext({
    rates: [{ allowed: false, retryAfter: 321 }],
  });
  const response = await handleColorMeLuckySubmission(
    ctx,
    requestWith(JSON.stringify({ name: 'Network Denied' })),
  );

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), {
    error: 'Too many submission attempts. Try again later.',
    retryAfter: 321,
  });
  assert.deepEqual(mutations, [{
    key: 'submit:network:203.0.113.9',
    maxRequests: 60,
    windowMs: 60 * 60 * 1000,
  }]);
  assert.equal(queries.length, 0);
});

test('Color Me Lucky stops at the standard user submission denial', async () => {
  const { ctx, mutations, queries } = createContext({
    rates: [
      { allowed: true },
      { allowed: false, retryAfter: 654 },
    ],
  });
  const response = await handleColorMeLuckySubmission(
    ctx,
    requestWith(JSON.stringify({ name: 'User Denied' })),
  );

  assert.equal(response.status, 429);
  assert.deepEqual(await response.json(), {
    error: 'Too many submissions. Try again later.',
    retryAfter: 654,
  });
  assert.equal(queries.length, 1);
  assert.deepEqual(mutations.map(({ key, maxRequests, windowMs }) => ({ key, maxRequests, windowMs })), [
    { key: 'submit:network:203.0.113.9', maxRequests: 60, windowMs: 60 * 60 * 1000 },
    { key: 'submit:user:user-123', maxRequests: 10, windowMs: 60 * 60 * 1000 },
  ]);
  assert.equal(mutations.filter((args) => typeof args.key !== 'string').length, 0);
});

test('Color Me Lucky still submits for API-key and website-session authentication', async () => {
  const cases = [
    { Authorization: 'Bearer dxt_test_key' },
    { Authorization: '', Cookie: '__Host-dexthemes_session=website_session' },
  ];

  for (const headers of cases) {
    const { ctx, mutations, queries } = createContext();
    const response = await handleColorMeLuckySubmission(
      ctx,
      requestWith(JSON.stringify({ name: 'Legitimate Theme', variant: 'light' }), headers),
    );

    assert.equal(response.status, 201);
    assert.equal(queries.length, 1);
    assert.equal(mutations.length, 3);
    assert.deepEqual(mutations.slice(0, 2).map(({ key }) => key), [
      'submit:network:203.0.113.9',
      'submit:user:user-123',
    ]);
    assert.equal(mutations[2].name, 'Legitimate Theme');
    assert.equal(mutations[2].themeId, 'legitimate-theme');
    assert.ok(mutations[2].light);
    assert.equal(mutations[2].dark, undefined);
    assert.equal(mutations[2].authToken, headers.Authorization ? 'dxt_test_key' : 'website_session');
  }
});
