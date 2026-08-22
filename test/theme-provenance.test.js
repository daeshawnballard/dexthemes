import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildUnofficialInspirationProvenance,
  getThemeProvenancePresentation,
  normalizeThemeProvenance,
  THEME_PROVENANCE_KINDS,
  UNOFFICIAL_INSPIRATION_DISCLOSURE,
} from '../shared/theme-provenance.js';
import {
  presentThemeForWebsite,
  sanitizeThemeForPlugin,
} from '../shared/plugin-public-policy.js';

test('provenance accepts only a bounded explicit unofficial-inspiration record', () => {
  assert.deepEqual(buildUnofficialInspirationProvenance('  Liger   Zero  '), {
    kind: THEME_PROVENANCE_KINDS.UNOFFICIAL_INSPIRATION,
    inspiredBy: 'Liger Zero',
  });
  assert.equal(normalizeThemeProvenance({ kind: 'licensed_by', inspiredBy: 'Example' }), null);
  assert.equal(normalizeThemeProvenance({ kind: 'unofficial_inspiration', inspiredBy: '' }), null);
  assert.equal(normalizeThemeProvenance({
    kind: 'unofficial_inspiration',
    inspiredBy: 'x'.repeat(121),
  }), null);
});

test('presentation uses neutral fixed copy and never claims legal clearance', () => {
  assert.deepEqual(getThemeProvenancePresentation({
    provenance: buildUnofficialInspirationProvenance('Terminator'),
  }), {
    kind: 'unofficial_inspiration',
    inspiredBy: 'Terminator',
    label: 'Inspired by Terminator',
    disclosure: UNOFFICIAL_INSPIRATION_DISCLOSURE,
  });
  assert.equal(getThemeProvenancePresentation({}), null);
  assert.doesNotMatch(UNOFFICIAL_INSPIRATION_DISCLOSURE, /licensed|cleared|approved/i);
});

test('curated name migrations keep legacy inspiration only in the secondary field', () => {
  const liger = presentThemeForWebsite({
    id: 'liger-zero-base',
    name: 'Liger Zero / Base',
    category: 'dexthemes',
    codeThemeId: 'codex',
  });
  assert.equal(liger.name, 'Zero Mechcat');
  assert.deepEqual(liger.provenance, {
    kind: 'unofficial_inspiration',
    inspiredBy: 'Liger Zero',
  });

  const terminator = presentThemeForWebsite({
    id: 'terminator-future-war',
    name: 'Terminator / Future War',
    category: 'dexthemes',
    codeThemeId: 'codex',
  });
  assert.equal(terminator.name, 'Chrome Future Hunter');
  assert.equal(terminator.provenance.inspiredBy, 'Terminator');

  const original = presentThemeForWebsite({
    id: 'quiet-orbit',
    name: 'Quiet Orbit',
    category: 'dexthemes',
    codeThemeId: 'codex',
  });
  assert.equal(original.provenance, undefined);
});

test('plugin discovery retains the original-name-only contract', () => {
  const sanitized = sanitizeThemeForPlugin({
    id: 'liger-zero-base',
    name: 'Liger Zero / Base',
    category: 'dexthemes',
    codeThemeId: 'codex',
  });
  assert.equal(sanitized.name, 'Zero Mechcat');
  assert.equal(sanitized.id, 'zero-mechcat');
  assert.equal('provenance' in sanitized, false);
});
