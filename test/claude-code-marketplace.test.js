import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const marketplace = JSON.parse(await readFile(
  new URL('../.claude-plugin/marketplace.json', import.meta.url),
  'utf8',
));
const plugin = JSON.parse(await readFile(
  new URL('../integrations/claude-code/dexthemes/.claude-plugin/plugin.json', import.meta.url),
  'utf8',
));
const mcp = JSON.parse(await readFile(
  new URL('../integrations/claude-code/dexthemes/.mcp.json', import.meta.url),
  'utf8',
));

test('Claude marketplace package preserves the canonical DexThemes MCP boundary', () => {
  assert.equal(marketplace.$schema, 'https://anthropic.com/claude-code/marketplace.schema.json');
  assert.equal(marketplace.name, 'dexthemes');
  assert.equal(marketplace.owner.name, 'Daeshawn Ballard');
  assert.deepEqual(marketplace.plugins.map(({ name, source, version }) => ({ name, source, version })), [
    {
      name: 'dexthemes',
      source: './integrations/claude-code/dexthemes',
      version: '1.0.0',
    },
  ]);
  assert.equal(plugin.name, 'dexthemes');
  assert.equal(plugin.version, '1.0.0');
  assert.deepEqual(mcp, {
    mcpServers: {
      dexthemes: {
        type: 'http',
        url: 'https://www.dexthemes.com/api/mcp',
      },
    },
  });
});
