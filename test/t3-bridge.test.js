import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildT3CodeThemeFile } from '../shared/t3code-theme-contract.js';
import { startT3Bridge } from '../packages/t3-theme-bridge/src/bridge-server.mjs';

const origin = 'https://www.dexthemes.com';
const canonical = JSON.parse(await readFile(new URL('../fixtures/host-exports/canonical-paired-theme.json', import.meta.url), 'utf8'));
const valid = buildT3CodeThemeFile(canonical);
const request = (theme = valid) => {
  const themeJson = `${JSON.stringify(theme, null, 2)}\n`;
  return { themeJson, sha256: createHash('sha256').update(themeJson).digest('hex'), requestId: randomUUID() };
};

async function post(bridge, route, value, token, requestOrigin = origin) {
  return fetch(`http://127.0.0.1:${bridge.port}${route}`, { method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(value) });
}
async function pair(bridge) {
  const response = await post(bridge, '/pair', { pairingCode: bridge.pairingCode });
  assert.equal(response.status, 200);
  return (await response.json()).connectionToken;
}

test('HTTP boundary rejects unpaired, wrong origin, replay and revoked requests without calling apply', async (t) => {
  let calls = 0;
  const bridge = await startT3Bridge({ port: 0, applyTheme: async ({ expectedSha256 }) => {
    calls += 1;
    return { receiptConsistent: true, inputHash: expectedSha256, publishedHash: expectedSha256, themeId: 'checked' };
  } });
  t.after(() => bridge.close());
  assert.equal((await post(bridge, '/apply-theme', request())).status, 401);
  assert.equal((await post(bridge, '/pair', { pairingCode: bridge.pairingCode }, null, 'https://example.com')).status, 403);
  const token = await pair(bridge);
  assert.equal((await post(bridge, '/pair', { pairingCode: bridge.pairingCode })).status, 401);
  const payload = request();
  assert.equal((await post(bridge, '/apply-theme', payload, token)).status, 200);
  assert.equal((await post(bridge, '/apply-theme', payload, token)).status, 409);
  assert.equal((await post(bridge, '/disconnect', {}, token)).status, 200);
  assert.equal((await post(bridge, '/apply-theme', request(), token)).status, 401);
  assert.equal(calls, 1);
});

test('strict types, continuity and body limits reject before local staging/application', async (t) => {
  let calls = 0;
  const bridge = await startT3Bridge({ port: 0, applyTheme: async () => { calls += 1; throw new Error('must not run'); } });
  t.after(() => bridge.close());
  const token = await pair(bridge);
  for (const malformed of [
    { ...valid, id: [valid.id] },
    { ...valid, colors: Object.fromEntries(Object.keys(valid.colors).map((key) => [key, [valid.colors[key]]])) },
    { ...valid, variants: { dark: Object.fromEntries(Object.entries(valid.variants.dark).map(([key, value]) => [key, [value]])) } },
    { ...valid, command: 'not accepted' },
  ]) assert.equal((await post(bridge, '/apply-theme', request(malformed), token)).status, 400);
  const changed = request();
  changed.sha256 = '0'.repeat(64);
  assert.equal((await post(bridge, '/apply-theme', changed, token)).status, 400);
  const oversized = request();
  oversized.themeJson = ' '.repeat(60 * 1024);
  assert.equal((await post(bridge, '/apply-theme', oversized, token)).status, 413);
  assert.equal(calls, 0);
});

test('CLI or settings readback failure cannot be acknowledged as environment application', async (t) => {
  const bridge = await startT3Bridge({ port: 0, applyTheme: async ({ expectedSha256 }) => ({ receiptConsistent: false, inputHash: expectedSha256, publishedHash: expectedSha256, exitCode: 1 }) });
  t.after(() => bridge.close());
  const token = await pair(bridge);
  const response = await post(bridge, '/apply-theme', request(), token);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'T3_APPLY_FAILED');
});

test('pairing is rate limited and unsupported development origins cannot expand receiver access', async (t) => {
  await assert.rejects(startT3Bridge({ port: 0, developmentOrigin: 'https://example.com' }), /Development origin/);
  const bridge = await startT3Bridge({ port: 0 });
  t.after(() => bridge.close());
  for (let i = 0; i < 5; i += 1) assert.equal((await post(bridge, '/pair', { pairingCode: '0'.repeat(18) })).status, 401);
  assert.equal((await post(bridge, '/pair', { pairingCode: bridge.pairingCode })).status, 401);
});
