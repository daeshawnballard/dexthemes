import assert from 'node:assert/strict';
import test from 'node:test';
import handler from '../api/openai-apps-challenge.js';

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name] = value; },
    status(value) { this.statusCode = value; return this; },
    send(value) { this.body = String(value); return this; },
  };
}

test('OpenAI domain challenge returns only the configured plain-text token', () => {
  const previous = process.env.OPENAI_APPS_CHALLENGE;
  process.env.OPENAI_APPS_CHALLENGE = 'portal-token-123';
  try {
    const response = responseRecorder();
    handler({ method: 'GET' }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.body, 'portal-token-123');
    assert.equal(response.headers['Content-Type'], 'text/plain; charset=utf-8');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_APPS_CHALLENGE;
    else process.env.OPENAI_APPS_CHALLENGE = previous;
  }
});

test('OpenAI domain challenge stays unavailable without a portal token', () => {
  const previous = process.env.OPENAI_APPS_CHALLENGE;
  delete process.env.OPENAI_APPS_CHALLENGE;
  try {
    const response = responseRecorder();
    handler({ method: 'GET' }, response);
    assert.equal(response.statusCode, 404);
    assert.equal(response.body, 'Not found');
  } finally {
    if (previous !== undefined) process.env.OPENAI_APPS_CHALLENGE = previous;
  }
});
