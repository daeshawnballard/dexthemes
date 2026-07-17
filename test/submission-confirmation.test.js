import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSubmissionConfirmation,
  verifySubmissionConfirmation,
} from '../server/submission-confirmation.js';
import { draftTheme } from '../server/theme-tools.js';

const secret = 'submission-test-secret-32-characters-minimum';
const now = 1_800_000_000_000;

test('publication confirmation is bound to the exact theme and sign-in token', () => {
  const { theme } = draftTheme({ inspiration: 'midnight plum', name: 'Midnight Plum' });
  const token = createSubmissionConfirmation(theme, 'oauth-token-a', { secret, now });
  assert.equal(verifySubmissionConfirmation(token, theme, 'oauth-token-a', { secret, now: now + 1 }), true);

  assert.throws(
    () => verifySubmissionConfirmation(token, { ...theme, name: 'Changed Name' }, 'oauth-token-a', { secret, now: now + 1 }),
    /Theme changed after review/,
  );
  assert.throws(
    () => verifySubmissionConfirmation(token, theme, 'oauth-token-b', { secret, now: now + 1 }),
    /different sign-in session/,
  );
});

test('publication confirmation expires and rejects tampering', () => {
  const { theme } = draftTheme({ inspiration: 'safe ocean', name: 'Safe Ocean' });
  const token = createSubmissionConfirmation(theme, 'oauth-token-a', { secret, now, ttlMs: 1000 });
  assert.throws(
    () => verifySubmissionConfirmation(token, theme, 'oauth-token-a', { secret, now: now + 1001 }),
    /expired/,
  );
  assert.throws(
    () => verifySubmissionConfirmation(`${token.slice(0, -1)}x`, theme, 'oauth-token-a', { secret, now }),
    /Invalid publication confirmation/,
  );
});
