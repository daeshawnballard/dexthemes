import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const guideUrl = new URL('../docs/INTEGRATIONS-CONDUCTOR.md', import.meta.url);
const evidenceUrl = new URL('../docs/CONDUCTOR-RUNTIME-EVIDENCE-2026-08-22.md', import.meta.url);

test('Conductor guide keeps DexThemes discovery least privileged', async () => {
  const guide = await readFile(guideUrl, 'utf8');

  assert.match(
    guide,
    /claude mcp add --transport http --scope local dexthemes https:\/\/www\.dexthemes\.com\/api\/cursor-mcp/,
  );
  assert.doesNotMatch(guide, /claude mcp add[^\n]*--scope user/);
  assert.match(guide, /do not substitute the unrestricted\n`\/api\/mcp` endpoint/);
  assert.match(
    guide,
    /`search`, `fetch`, `draft_theme`,\n`color_me_lucky`, `validate_theme`, and `get_leaderboard`/,
  );
  assert.match(guide, /Prompt text is not an authorization control/);
  assert.match(guide, /claude mcp remove dexthemes --scope local/);
  assert.match(guide, /Do not remove a user- or project-scoped server/);
});

test('Conductor runtime evidence records the server-enforced boundary', async () => {
  const evidence = await readFile(evidenceUrl, 'utf8');

  assert.match(evidence, /server-enforced `https:\/\/www\.dexthemes\.com\/api\/cursor-mcp` profile/);
  assert.match(evidence, /Prompt text\n+does not enforce that boundary/);
  assert.match(evidence, /claude mcp remove\n+dexthemes --scope local/);
});
