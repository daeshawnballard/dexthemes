import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod/v4';
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
  assert.equal(tools.length, 13);
  assert.equal(tools.some((tool) => tool.name === 'prepare_deepseek_apply'), false);

  const rawToolsResult = await client.request(
    { method: 'tools/list', params: {} },
    z.object({
      tools: z.array(z.object({
        name: z.string(),
        securitySchemes: z.array(z.record(z.string(), z.unknown())),
      }).passthrough()),
    }).passthrough(),
  );
  const rawTools = rawToolsResult.tools;
  assert.equal(rawTools.length, 13);
  for (const tool of rawTools) {
    assert.deepEqual(tool.securitySchemes, tool._meta.securitySchemes, `${tool.name} top-level auth policy`);
  }

  const rawStats = rawTools.find((tool) => tool.name === 'get_my_stats');
  assert.deepEqual(rawStats.securitySchemes, [{ type: 'oauth2', scopes: ['themes:read'] }]);
  assert.equal(rawStats._meta.ui, undefined);
  assert.equal(rawStats._meta['ui/resourceUri'], undefined);
  assert.equal(rawStats._meta['openai/outputTemplate'], undefined);

  const rawUnlocks = rawTools.find((tool) => tool.name === 'get_my_unlocks');
  assert.equal(rawUnlocks._meta.ui, undefined);
  assert.equal(rawUnlocks._meta['ui/resourceUri'], undefined);
  assert.equal(rawUnlocks._meta['openai/outputTemplate'], undefined);

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
  assert.equal(submit._meta.ui.resourceUri, undefined);
  assert.equal(submit._meta['ui/resourceUri'], undefined);
  assert.equal(submit._meta['openai/outputTemplate'], undefined);
  assert.equal(submit._meta['openai/widgetAccessible'], undefined);

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

  const lucky = await client.callTool({
    name: 'color_me_lucky',
    arguments: { seed: 'harness-contract' },
  });
  assert.equal(lucky.structuredContent.kind, 'theme-draft');
  assert.equal(lucky.structuredContent.lucky, true);
  assert.ok(lucky.structuredContent.theme.dark && lucky.structuredContent.theme.light);

  const argentinaPublication = await client.callTool({
    name: 'validate_theme',
    arguments: { theme: draft.structuredContent.theme, forPublication: true },
  });
  assert.equal(argentinaPublication.structuredContent.valid, true);

  const fandomDraft = await client.callTool({
    name: 'draft_theme',
    arguments: { inspiration: 'Halo Reach at midnight', name: 'Halo Reach Night' },
  });
  assert.equal(fandomDraft.structuredContent.valid, true);
  const fandomPublication = await client.callTool({
    name: 'validate_theme',
    arguments: { theme: fandomDraft.structuredContent.theme, forPublication: true },
  });
  assert.equal(fandomPublication.structuredContent.valid, false);
  assert.equal(fandomPublication.structuredContent.suggestedNames.length, 3);
  assert.match(fandomPublication.structuredContent.suggestedSummary, /^An original /);

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
  const unknownCodeTheme = await client.callTool({
    name: 'prepare_theme_apply',
    arguments: {
      theme: { ...draft.structuredContent.theme, codeThemeId: 'unknown-theme' },
      variant: 'dark',
    },
  });
  assert.equal(unknownCodeTheme.isError, true);

  const { resources } = await client.listResources();
  const view = resources.find((resource) => resource.uri === 'ui://dexthemes/theme-studio-v3.html');
  assert.equal(view.mimeType, 'text/html;profile=mcp-app');
  assert.equal(view._meta.ui.domain, 'https://www.dexthemes.com');
  assert.deepEqual(view._meta.ui.csp.connectDomains, []);
  assert.deepEqual(view._meta.ui.csp.resourceDomains, []);
  assert.deepEqual(view._meta.ui.permissions, { clipboardWrite: {} });
  assert.deepEqual(view._meta['openai/widgetCSP'].redirect_domains, [
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

test('DeepSeek Harness MCP profile exposes only safe anonymous tools with model-visible JSON', async (t) => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createDexThemesMcpServer({ profile: 'deepseek_harness' });
  const client = new Client({ name: 'deepseek-harness-test', version: '1.0.0' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), [
    'color_me_lucky',
    'draft_theme',
    'fetch',
    'get_leaderboard',
    'prepare_deepseek_apply',
    'render_theme_preview',
    'search',
    'validate_theme',
  ]);
  assert.ok(tools.every((tool) => tool.annotations.readOnlyHint && !tool.annotations.openWorldHint && !tool.annotations.destructiveHint));
  assert.ok(tools.every((tool) => JSON.stringify(tool._meta.securitySchemes) === JSON.stringify([{ type: 'noauth' }])));
  for (const forbidden of ['prepare_theme_apply', 'get_my_stats', 'get_my_unlocks', 'prepare_theme_submission', 'submit_theme', 'prepare_github_issue']) {
    assert.equal(tools.some((tool) => tool.name === forbidden), false, forbidden);
  }

  const draft = await client.callTool({
    name: 'color_me_lucky',
    arguments: { seed: 'deepseek-text-contract' },
  });
  const draftText = JSON.parse(draft.content[0].text);
  assert.deepEqual(draftText.theme, draft.structuredContent.theme);
  assert.ok(draftText.theme.dark && draftText.theme.light);

  const prepared = await client.callTool({
    name: 'prepare_deepseek_apply',
    arguments: { theme: draftText.theme },
  });
  const preparedText = JSON.parse(prepared.content[0].text);
  assert.equal(preparedText.payload.target, 'deepseek-harness');
  assert.match(preparedText.payload.cordisDefine.code.client, /theme\.overrideTokens/);
});
