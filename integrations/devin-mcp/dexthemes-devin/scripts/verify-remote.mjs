import { readFile } from 'node:fs/promises';

const packageRoot = new URL('../', import.meta.url);
const connector = JSON.parse(await readFile(new URL('connector.json', packageRoot), 'utf8'));
const mcpConfig = JSON.parse(await readFile(new URL('.devin/mcp_config.json', packageRoot), 'utf8'));
const endpoint = mcpConfig.mcpServers?.dexthemes?.url;

if (endpoint !== connector.endpoint) {
  throw new Error('Connector metadata and Devin MCP configuration disagree about the endpoint.');
}

let nextId = 1;
async function rpc(method, params = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-03-26',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`MCP ${method} failed with HTTP ${response.status}.`);
  const payload = await response.json();
  if (payload.error) throw new Error(`MCP ${method} failed: ${payload.error.code}`);
  return payload.result;
}

const initialized = await rpc('initialize', {
  protocolVersion: '2025-03-26',
  capabilities: {},
  clientInfo: { name: 'dexthemes-devin-source-verifier', version: '0.0.0-experimental' },
});
const listed = await rpc('tools/list');
const actualTools = listed.tools.map((tool) => tool.name).sort();
const expectedTools = [...connector.tools].sort();
const openWorldTools = new Set(connector.openWorldTools);

if (JSON.stringify(actualTools) !== JSON.stringify(expectedTools)) {
  throw new Error(`Restricted MCP inventory mismatch: ${actualTools.join(', ')}`);
}
for (const tool of listed.tools) {
  const annotations = tool.annotations || {};
  const expectedOpenWorld = openWorldTools.has(tool.name);
  if (annotations.readOnlyHint !== true || annotations.openWorldHint !== expectedOpenWorld || annotations.destructiveHint !== false) {
    throw new Error(`Unsafe annotations on ${tool.name}.`);
  }
  if (JSON.stringify(tool.securitySchemes) !== JSON.stringify([{ type: 'noauth' }])) {
    throw new Error(`Unexpected authentication policy on ${tool.name}.`);
  }
}

const search = await rpc('tools/call', {
  name: 'search',
  arguments: { query: 'muted indigo developer tools', limit: 3 },
});
if (search.isError === true || search.structuredContent?.kind !== 'theme-list') {
  throw new Error('The read-only search call did not return a theme-list result.');
}

console.log(JSON.stringify({
  evidenceClass: 'remote-mcp-service-not-loaded-devin',
  endpoint,
  protocolVersion: initialized.protocolVersion,
  server: initialized.serverInfo,
  tools: actualTools,
  readOnlyCall: {
    name: 'search',
    kind: search.structuredContent.kind,
    count: search.structuredContent.count,
    returned: Array.isArray(search.structuredContent.results)
      ? search.structuredContent.results.length
      : null,
  },
}, null, 2));
