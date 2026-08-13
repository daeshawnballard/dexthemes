import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';

test('Vercel Hobby deployment stays within the twelve-function budget', async () => {
  const apiDir = new URL('../api/', import.meta.url);
  const apiFunctions = (await readdir(apiDir))
    .filter((name) => name.endsWith('.js'))
    .sort();

  assert.ok(
    apiFunctions.length <= 12,
    `expected at most 12 Vercel functions, found ${apiFunctions.length}: ${apiFunctions.join(', ')}`,
  );

  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const subgroupRewrite = config.rewrites.find((entry) => entry.source === '/themes/dexthemes/:subgroup');
  assert.equal(subgroupRewrite?.destination, '/api/themes?subgroup=:subgroup&response=subgroup');
});
