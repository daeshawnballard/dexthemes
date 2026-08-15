import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildGithubAuthStartUrl } from '../src/auth-url.js';
import { hasVerifiedOpenAIEmail } from '../shared/auth-eligibility.js';

test('ordinary GitHub sign-in does not request email verification', () => {
  const url = new URL(buildGithubAuthStartUrl({
    origin: 'https://www.dexthemes.com',
  }), 'https://www.dexthemes.com');

  assert.equal(url.pathname, '/auth/github');
  assert.equal(url.searchParams.get('origin'), 'https://www.dexthemes.com');
  assert.equal(url.searchParams.has('verify_email'), false);
});

test('employee verification is an explicit GitHub sign-in option', () => {
  const url = new URL(buildGithubAuthStartUrl({
    base: 'https://example.convex.site',
    origin: 'http://127.0.0.1:4174',
    verifyEmail: true,
  }));

  assert.equal(url.origin, 'https://example.convex.site');
  assert.equal(url.searchParams.get('origin'), 'http://127.0.0.1:4174');
  assert.equal(url.searchParams.get('verify_email'), '1');
});

test('OAuth route limits email scope and collection to explicit verification', async () => {
  const [route, state, schema, actions, users] = await Promise.all([
    readFile(new URL('../convex/http_auth_routes.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/oauthStates.ts', import.meta.url), 'utf8'),
    readFile(new URL('../convex/schema.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/preview-actions.js', import.meta.url), 'utf8'),
    readFile(new URL('../convex/users.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(route, /requestedEmail = reqUrl\.searchParams\.get\("verify_email"\) === "1"/);
  assert.match(route, /scope: requestedEmail \? "read:user user:email" : "read:user"/);
  assert.match(route, /oauthState\.requestedEmail[\s\S]*?fetch\("https:\/\/api\.github\.com\/user\/emails"/);
  assert.match(route, /let isOpenAIEmployee = false/);
  assert.match(route, /isOpenAIEmployee = hasVerifiedOpenAIEmail\(emails\)/);
  assert.match(route, /getOrCreateUser,[\s\S]*?isOpenAIEmployee,/);
  assert.match(state, /requestedEmail: v\.optional\(v\.boolean\(\)\)/);
  assert.match(state, /requestedEmail: state\.requestedEmail \?\? false/);
  assert.match(schema, /requestedEmail: v\.optional\(v\.boolean\(\)\)/);
  assert.match(actions, /verifyEmail: actionKey === 'openai_employee'/);
  assert.match(users, /if \(args\.isOpenAIEmployee !== undefined\)[\s\S]*?syncOpenAIEmployeeUnlock\(ctx, existing\._id, args\.isOpenAIEmployee\)/);
});

test('employee eligibility requires a currently verified exact OpenAI email', () => {
  assert.equal(hasVerifiedOpenAIEmail([
    { email: 'builder@openai.com', verified: true },
  ]), true);
  assert.equal(hasVerifiedOpenAIEmail([
    { email: 'builder@OPENAI.COM', verified: true },
  ]), true);

  for (const entries of [
    [],
    null,
    [{ email: 'builder@openai.com', verified: false }],
    [{ email: 'builder@sub.openai.com', verified: true }],
    [{ email: 'builder@notopenai.com', verified: true }],
    [{ email: '@openai.com', verified: true }],
    [{ verified: true }],
  ]) {
    assert.equal(hasVerifiedOpenAIEmail(entries), false);
  }
});
