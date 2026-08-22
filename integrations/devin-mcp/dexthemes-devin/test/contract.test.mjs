import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageRoot = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, packageRoot), 'utf8');
const expectedTools = [
  'search',
  'fetch',
  'draft_theme',
  'color_me_lucky',
  'validate_theme',
  'get_leaderboard',
];
const forbiddenTools = [
  'prepare_theme_apply',
  'render_theme_preview',
  'prepare_deepseek_apply',
  'get_my_stats',
  'get_my_unlocks',
  'prepare_theme_submission',
  'submit_theme',
  'prepare_github_issue',
];
const expectedOpenWorldTools = [
  'search',
  'fetch',
  'get_leaderboard',
];

test('package uses Devin project MCP configuration with the restricted endpoint', async () => {
  const [connectorSource, mcpSource] = await Promise.all([
    read('connector.json'),
    read('.devin/mcp_config.json'),
  ]);
  const connector = JSON.parse(connectorSource);
  const mcp = JSON.parse(mcpSource);

  assert.equal(connector.officialSurface, 'project-mcp-config');
  assert.equal(connector.endpoint, 'https://www.dexthemes.com/api/cursor-mcp');
  assert.deepEqual(connector.tools, expectedTools);
  assert.deepEqual(connector.openWorldTools, expectedOpenWorldTools);
  assert.deepEqual(mcp, {
    mcpServers: {
      dexthemes: {
        url: connector.endpoint,
        transport: 'http',
      },
    },
  });
  assert.equal(JSON.stringify(mcp).includes('secret'), false);
  assert.equal(JSON.stringify(mcp).includes('token'), false);
});

test('permissions pre-approve only the six restricted tools and deny known wider capabilities', async () => {
  const config = JSON.parse(await read('.devin/config.json'));
  assert.deepEqual(config.permissions.allow, expectedTools.map((name) => `mcp__dexthemes__${name}`));
  assert.deepEqual(config.permissions.deny, forbiddenTools.map((name) => `mcp__dexthemes__${name}`));
  assert.equal(config.permissions.allow.some((entry) => entry.endsWith('__*')), false);
});

test('rubric ceiling stays at 50 without mutation and restore', async () => {
  const connector = JSON.parse(await read('connector.json'));
  assert.deepEqual(connector.rubric, {
    mcp: { points: 50, status: 'implemented' },
    mutationRestore: { points: 50, status: 'unavailable' },
    ceiling: 50,
  });
  assert.equal(connector.evidence.loadedDevinRuntime, 'unproven');
  assert.equal(connector.evidence.hostAppearanceMutation, 'unavailable');
});

test('Devin skill is least-privilege and makes runtime and appearance boundaries explicit', async () => {
  const skill = await read('.devin/skills/dexthemes-connector/SKILL.md');
  for (const name of expectedTools) assert.match(skill, new RegExp(`mcp__dexthemes__${name}`));
  for (const name of forbiddenTools) assert.match(skill, new RegExp(`mcp__dexthemes__${name}`));
  assert.match(skill, /Do not request secrets, tokens, API keys, account IDs, or email addresses\./);
  assert.match(skill, /Do not claim that Devin can change its own appearance/);
  assert.match(skill, /do not prove Devin loaded the connector/i);
});

test('package stays out of shared harness and website surfaces', async () => {
  const [readme, packageSource] = await Promise.all([
    read('README.md'),
    read('package.json'),
  ]);
  assert.match(readme, /does not add Devin to any shared DexThemes website catalog/);
  assert.match(readme, /ceiling is therefore \*\*50\/100\*\*/);
  assert.doesNotMatch(`${readme}\n${packageSource}`, /apply (?:in|to) devin/i);
  assert.doesNotMatch(`${readme}\n${packageSource}`, /devin theme integration/i);
});
