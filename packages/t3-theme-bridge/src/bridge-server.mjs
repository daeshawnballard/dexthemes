import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { chmod, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isStrictT3ThemeFile } from './validate-theme.mjs';
import { applyT3Theme } from './t3-theme-apply.mjs';

export const T3_BRIDGE_PORT = 47536;
export const T3_BRIDGE_VERSION = '0.1.0';
const PRODUCTION_ORIGINS = ['https://www.dexthemes.com', 'https://dexthemes.com'];
const BODY_LIMIT = 48 * 1024;
const PAIR_LIFETIME = 10 * 60 * 1000;
const SESSION_LIFETIME = 12 * 60 * 60 * 1000;
const HASH = /^[a-f0-9]{64}$/;
const REQUEST_ID = /^[a-zA-Z0-9-]{16,64}$/;

function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function sameSecret(left, right) {
  const a = Buffer.from(hash(left));
  const b = Buffer.from(hash(right));
  return timingSafeEqual(a, b);
}
function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function reply(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}
async function readBody(request) {
  if (request.headers['content-type'] !== 'application/json') throw new Error('CONTENT_TYPE');
  const length = Number(request.headers['content-length']);
  if (Number.isFinite(length) && length > BODY_LIMIT) throw new Error('BODY_LIMIT');
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > BODY_LIMIT) throw new Error('BODY_LIMIT');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('INVALID_JSON'); }
}

/** A theme-only capability. No URLs, paths, commands, account data or credentials are accepted. */
export async function startT3Bridge({ port = T3_BRIDGE_PORT, developmentOrigin, onEvent = () => {}, applyTheme = applyT3Theme } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid bridge port.');
  if (developmentOrigin && !/^http:\/\/127\.0\.0\.1:[1-9][0-9]{1,4}$/.test(developmentOrigin)) {
    throw new Error('Development origin must be an explicit 127.0.0.1 HTTP port.');
  }
  const origins = new Set([...PRODUCTION_ORIGINS, ...(developmentOrigin ? [developmentOrigin] : [])]);
  const pairingCode = randomBytes(9).toString('hex').toUpperCase();
  const pairingExpiresAt = Date.now() + PAIR_LIFETIME;
  let pairingUsed = false;
  let failedPairAttempts = 0;
  const sessions = new Map();
  let applying = false;
  let actualPort;

  const server = createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (request.headers.host !== `127.0.0.1:${actualPort}` || !origins.has(origin)) {
      reply(response, 403, { error: 'ORIGIN_DENIED' }); return;
    }
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (request.method === 'OPTIONS') {
      const requested = String(request.headers['access-control-request-headers'] || '').toLowerCase().split(',').map((v) => v.trim()).filter(Boolean);
      if (requested.some((v) => !['content-type', 'authorization'].includes(v))) {
        reply(response, 403, { error: 'HEADER_DENIED' }); return;
      }
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.setHeader('Access-Control-Allow-Private-Network', 'true');
      response.writeHead(204, { 'Cache-Control': 'no-store' }); response.end(); return;
    }
    if (request.url === '/health' && request.method === 'GET') {
      reply(response, 200, { kind: 'dexthemes-t3-bridge', version: T3_BRIDGE_VERSION, environment: 'local', pairingAvailable: !pairingUsed && Date.now() < pairingExpiresAt }); return;
    }
    if (request.method !== 'POST' || !['/pair', '/apply-theme', '/disconnect'].includes(request.url)) {
      reply(response, 404, { error: 'NOT_FOUND' }); return;
    }
    try {
      const body = await readBody(request);
      if (request.url === '/pair') {
        if (!exactKeys(body, ['pairingCode']) || typeof body.pairingCode !== 'string' || body.pairingCode.length !== 18) {
          reply(response, 400, { error: 'INVALID_PAIR_REQUEST' }); return;
        }
        if (pairingUsed || Date.now() >= pairingExpiresAt || failedPairAttempts >= 5 || !sameSecret(body.pairingCode.toUpperCase(), pairingCode)) {
          failedPairAttempts += 1;
          reply(response, 401, { error: 'PAIRING_DENIED' }); return;
        }
        pairingUsed = true;
        const connectionToken = randomBytes(32).toString('base64url');
        const expiresAt = Date.now() + SESSION_LIFETIME;
        sessions.set(hash(connectionToken), { origin, expiresAt, requests: new Set() });
        onEvent({ event: 'paired', origin, expiresAt });
        reply(response, 200, { connectionToken, expiresAt, environment: 'local' }); return;
      }
      const bearer = String(request.headers.authorization || '');
      const session = /^Bearer [A-Za-z0-9_-]{43}$/.test(bearer) ? sessions.get(hash(bearer.slice(7))) : null;
      if (!session || session.origin !== origin || session.expiresAt <= Date.now()) {
        reply(response, 401, { error: 'CONNECTION_REQUIRED' }); return;
      }
      if (request.url === '/disconnect') {
        if (!exactKeys(body, [])) { reply(response, 400, { error: 'INVALID_DISCONNECT' }); return; }
        sessions.delete(hash(bearer.slice(7)));
        onEvent({ event: 'disconnected', origin });
        reply(response, 200, { disconnected: true, themeUnchanged: true }); return;
      }
      if (!exactKeys(body, ['themeJson', 'sha256', 'requestId']) || typeof body.themeJson !== 'string'
        || Buffer.byteLength(body.themeJson) > 32 * 1024 || typeof body.sha256 !== 'string' || typeof body.requestId !== 'string'
        || !HASH.test(body.sha256) || !REQUEST_ID.test(body.requestId)) {
        reply(response, 400, { error: 'INVALID_THEME_REQUEST' }); return;
      }
      if (hash(body.themeJson) !== body.sha256) { reply(response, 400, { error: 'THEME_CHANGED' }); return; }
      let theme;
      try { theme = JSON.parse(body.themeJson); } catch { reply(response, 400, { error: 'INVALID_THEME_JSON' }); return; }
      if (!isStrictT3ThemeFile(theme)) { reply(response, 400, { error: 'INVALID_THEME' }); return; }
      if (session.requests.has(body.requestId)) { reply(response, 409, { error: 'REQUEST_REPLAYED' }); return; }
      if (session.requests.size >= 100 || applying) { reply(response, 429, { error: 'BRIDGE_BUSY' }); return; }
      session.requests.add(body.requestId);
      applying = true;
      try {
        const directory = await mkdtemp(path.join(os.tmpdir(), 'dexthemes-t3-request-'));
        await chmod(directory, 0o700);
        const inputPath = path.join(directory, 'theme.json');
        await writeFile(inputPath, body.themeJson, { flag: 'wx', mode: 0o600 });
        const receipt = await applyTheme({ inputPath, expectedSha256: body.sha256 });
        if (receipt.receiptConsistent !== true || receipt.inputHash !== body.sha256 || receipt.publishedHash !== body.sha256) {
          throw new Error('T3_READBACK_FAILED');
        }
        onEvent({ event: 'theme_set', requestId: body.requestId, sha256: body.sha256, themeId: receipt.themeId || receipt.publishedId, appVersion: receipt.appVersion || receipt.application?.version });
        // Filesystem paths and CLI output remain local; no native-render acknowledgement is invented.
        reply(response, 200, { requestId: body.requestId, sha256: body.sha256, environmentThemeSet: true, themeName: theme.name, variants: [theme.appearance, ...Object.keys(theme.variants || {})] });
      } catch {
        onEvent({ event: 'apply_failed', requestId: body.requestId, sha256: body.sha256 });
        reply(response, 503, { error: 'T3_APPLY_FAILED', requestId: body.requestId });
      } finally { applying = false; }
    } catch (error) {
      reply(response, error.message === 'BODY_LIMIT' ? 413 : 400, { error: ['CONTENT_TYPE', 'BODY_LIMIT', 'INVALID_JSON'].includes(error.message) ? error.message : 'INVALID_REQUEST' });
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  actualPort = server.address().port;
  return { server, port: actualPort, pairingCode, pairingExpiresAt, close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] !== 'start') throw new Error('Usage: node bridge-server.mjs start [--pairing-file FILE] [--development-origin http://127.0.0.1:PORT]');
  const allowed = new Set(['--pairing-file', '--development-origin']);
  const options = {};
  for (let i = 1; i < args.length; i += 2) {
    if (!allowed.has(args[i]) || !args[i + 1] || options[args[i]]) throw new Error('Invalid bridge arguments.');
    options[args[i]] = args[i + 1];
  }
  const bridge = await startT3Bridge({ developmentOrigin: options['--development-origin'], onEvent: (event) => console.log(JSON.stringify(event)) });
  if (options['--pairing-file']) {
    await writeFile(options['--pairing-file'], JSON.stringify({ pairingCode: bridge.pairingCode, expiresAt: bridge.pairingExpiresAt }), { flag: 'wx', mode: 0o600 });
    console.log('Connection code saved privately to the requested file.');
  } else {
    console.log(`DexThemes T3 connection code: ${bridge.pairingCode}`);
  }
  console.log('In DexThemes, choose T3 Code → Connect T3. The code expires in 10 minutes.');
  console.log('Only theme changes in the local T3 environment are allowed. Keep this helper running; Ctrl+C stops it.');
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void bridge.close().finally(() => process.exit(0)); });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
