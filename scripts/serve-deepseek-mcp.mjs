import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createDexThemesMcpServer } from '../server/dexthemes-mcp.js';

const host = process.env.DEXTHEMES_MCP_HOST || '127.0.0.1';
const port = Number.parseInt(process.env.DEXTHEMES_MCP_PORT || '3099', 10);
const MAX_BODY_BYTES = 1024 * 1024;

async function readJsonBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) throw new Error('request_too_large');
    chunks.push(chunk);
  }
  if (!chunks.length) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const httpServer = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID');
  response.setHeader('Access-Control-Expose-Headers', 'MCP-Protocol-Version, MCP-Session-Id');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }
  if (request.url !== '/api/deepseek-mcp') {
    response.writeHead(404, { 'Content-Type': 'application/json' }).end('{"error":"not_found"}');
    return;
  }

  const mcpServer = createDexThemesMcpServer({ profile: 'deepseek_harness' });
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  try {
    const body = request.method === 'POST' ? await readJsonBody(request) : undefined;
    await mcpServer.connect(transport);
    await transport.handleRequest(request, response, body);
  } catch (error) {
    if (!response.headersSent) {
      response.writeHead(error?.message === 'request_too_large' ? 413 : 500, { 'Content-Type': 'application/json' });
      response.end('{"error":"mcp_request_failed"}');
    }
  } finally {
    await transport.close().catch(() => {});
    await mcpServer.close().catch(() => {});
  }
});

httpServer.listen(port, host, () => {
  console.log(`DexThemes DeepSeek MCP QA server: http://${host}:${port}/api/deepseek-mcp`);
});

const shutdown = () => httpServer.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
