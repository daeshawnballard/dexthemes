import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import handler from '../api/mcp.js';

function mcpMessage(id, method, params = {}) {
  return { jsonrpc: '2.0', id, method, params };
}

async function createMcpHttpHarness(t) {
  const server = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    req.body = body ? JSON.parse(body) : undefined;
    await handler(req, res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

  const { port } = server.address();
  return async ({ accept, message, profile = 'deepseek_harness' }) => {
    const response = await fetch(`http://127.0.0.1:${port}/api/mcp?profile=${encodeURIComponent(profile)}`, {
      method: 'POST',
      headers: {
        Accept: accept,
        'Content-Type': 'application/json',
        'x-forwarded-host': 'dexthemes.com',
      },
      body: JSON.stringify(message),
    });
    return { status: response.status, body: await response.json() };
  };
}

test('MCP HTTP accepts discovery clients that support JSON or wildcard responses', async (t) => {
  const request = await createMcpHttpHarness(t);
  const initialize = mcpMessage(1, 'initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'mcp-http-test', version: '1.0.0' },
  });
  const listTools = mcpMessage(2, 'tools/list');

  const compliantInitialize = await request({
    accept: 'application/json, text/event-stream',
    message: initialize,
  });
  assert.equal(compliantInitialize.status, 200);
  assert.equal(compliantInitialize.body.result.protocolVersion, '2025-03-26');

  const compliantTools = await request({
    accept: 'application/json, text/event-stream',
    message: listTools,
  });
  assert.equal(compliantTools.status, 200);
  assert.ok(compliantTools.body.result.tools.some((tool) => tool.name === 'search'));

  for (const accept of ['application/json', '*/*']) {
    const response = await request({ accept, message: listTools });
    assert.equal(response.status, 200, accept);
    assert.ok(response.body.result.tools.some((tool) => tool.name === 'search'), accept);
  }
});

test('MCP HTTP continues rejecting clients that accept neither JSON nor SSE', async (t) => {
  const request = await createMcpHttpHarness(t);
  const response = await request({
    accept: 'text/html',
    message: mcpMessage(1, 'tools/list'),
  });

  assert.equal(response.status, 406);
  assert.match(response.body.error.message, /Not Acceptable/);
});

test('Cursor HTTP profile omits account, apply, preview, feedback, and publication tools', async (t) => {
  const request = await createMcpHttpHarness(t);
  const response = await request({
    accept: 'application/json',
    profile: 'cursor_discovery',
    message: mcpMessage(1, 'tools/list'),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.result.tools.map((tool) => tool.name).sort(), [
    'color_me_lucky',
    'draft_theme',
    'fetch',
    'get_leaderboard',
    'search',
    'validate_theme',
  ]);
});

test('Antigravity HTTP profile exposes exactly the five preview-safe tools', async (t) => {
  const request = await createMcpHttpHarness(t);
  const response = await request({
    accept: 'application/json',
    profile: 'antigravity_preview',
    message: mcpMessage(1, 'tools/list'),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.result.tools.map((tool) => tool.name).sort(), [
    'color_me_lucky',
    'draft_theme',
    'fetch',
    'search',
    'validate_theme',
  ]);
});

test('MCP HTTP rejects unknown profiles before server construction', async (t) => {
  const request = await createMcpHttpHarness(t);
  const response = await request({
    accept: 'application/json',
    profile: 'future_registry_profile',
    message: mcpMessage(1, 'tools/list'),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'unsupported_mcp_profile' });
});
