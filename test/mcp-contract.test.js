import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createDexThemesMcpServer } from '../server/dexthemes-mcp.js';

test('MCP tools expose complete safety annotations and output schemas', async (t) => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createDexThemesMcpServer();
  const client = new Client({ name: 'dexthemes-test', version: '1.0.0' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const { tools } = await client.listTools();
  assert.equal(tools.length, 12);
  for (const tool of tools) {
    assert.equal(typeof tool.annotations?.readOnlyHint, 'boolean', tool.name);
    assert.equal(typeof tool.annotations?.openWorldHint, 'boolean', tool.name);
    assert.equal(typeof tool.annotations?.destructiveHint, 'boolean', tool.name);
    assert.equal(tool.outputSchema?.type, 'object', tool.name);
    assert.ok(Array.isArray(tool._meta?.securitySchemes), `${tool.name} auth policy`);

    const inputContract = JSON.stringify(tool.inputSchema || {});
    for (const forbidden of ['userId', 'ownerId', 'authorId', 'accessToken', 'apiKey', 'email']) {
      assert.equal(inputContract.includes(`\"${forbidden}\"`), false, `${tool.name} accepts ${forbidden}`);
    }
  }

  for (const tool of tools.filter((candidate) => !['get_my_stats', 'get_my_unlocks', 'prepare_theme_submission', 'submit_theme'].includes(candidate.name))) {
    assert.deepEqual(tool._meta.securitySchemes, [{ type: 'noauth' }], tool.name);
  }
  for (const name of ['get_my_stats', 'get_my_unlocks']) {
    const tool = tools.find((candidate) => candidate.name === name);
    assert.deepEqual(tool._meta.securitySchemes, [{ type: 'oauth2', scopes: ['themes:read'] }], name);
  }

  const prepareSubmission = tools.find((tool) => tool.name === 'prepare_theme_submission');
  assert.deepEqual(prepareSubmission._meta.securitySchemes, [{ type: 'oauth2', scopes: ['themes:write'] }]);
  assert.equal(prepareSubmission.annotations.readOnlyHint, true);
  assert.equal(prepareSubmission.annotations.openWorldHint, false);

  const submit = tools.find((tool) => tool.name === 'submit_theme');
  assert.equal(submit.annotations.readOnlyHint, false);
  assert.equal(submit.annotations.openWorldHint, true);
  assert.equal(submit.annotations.destructiveHint, false);
  assert.ok(submit.inputSchema.properties.confirmationToken);
  assert.equal(submit.inputSchema.properties.confirmation, undefined);
  assert.deepEqual(submit._meta.securitySchemes, [{ type: 'oauth2', scopes: ['themes:write'] }]);
  assert.deepEqual(submit._meta.ui.visibility, ['app']);

  for (const tool of tools.filter((candidate) => candidate.name !== 'submit_theme')) {
    assert.equal(tool.annotations.readOnlyHint, true, tool.name);
    assert.equal(tool.annotations.openWorldHint, false, tool.name);
    assert.equal(tool.annotations.destructiveHint, false, tool.name);
  }

  const draft = await client.callTool({
    name: 'draft_theme',
    arguments: { inspiration: 'Argentina football at night', name: 'Argentina Afterglow' },
  });
  assert.equal(draft.structuredContent.theme.name, 'Argentina Afterglow');
  assert.equal(draft.structuredContent.needsNameConfirmation, false);

  const oversizedName = await client.callTool({
    name: 'render_theme_preview',
    arguments: { theme: { ...draft.structuredContent.theme, name: 'n'.repeat(81) } },
  });
  assert.equal(oversizedName.isError, true);
  const oversizedCodeTheme = await client.callTool({
    name: 'prepare_theme_apply',
    arguments: {
      theme: { ...draft.structuredContent.theme, codeThemeId: 'c'.repeat(81) },
      variant: 'dark',
    },
  });
  assert.equal(oversizedCodeTheme.isError, true);

  const { resources } = await client.listResources();
  const view = resources.find((resource) => resource.uri === 'ui://dexthemes/theme-studio-v2.html');
  assert.equal(view.mimeType, 'text/html;profile=mcp-app');
  assert.equal(view._meta.ui.domain, 'https://www.dexthemes.com');
  assert.deepEqual(view._meta.ui.csp.connectDomains, []);
  assert.deepEqual(view._meta.ui.csp.resourceDomains, []);
  assert.deepEqual(view._meta.ui.permissions, { clipboardWrite: {} });
  assert.deepEqual(view._meta['openai/widgetCSP'].redirect_domains, [
    'https://www.dexthemes.com',
    'https://github.com',
  ]);

  const authRequired = await client.callTool({ name: 'get_my_stats', arguments: {} });
  assert.equal(authRequired.isError, true);
  const challenge = authRequired._meta['mcp/www_authenticate'][0];
  assert.match(challenge, /resource_metadata=/);
  assert.match(challenge, /error="insufficient_scope"/);
  assert.match(challenge, /error_description=/);

  const publicationAuth = await client.callTool({
    name: 'prepare_theme_submission',
    arguments: {
      theme: draft.structuredContent.theme,
    },
  });
  assert.equal(publicationAuth.isError, true);
  assert.match(publicationAuth._meta['mcp/www_authenticate'][0], /scope="themes:write"/);
});
