export const THEME_PROVENANCE_KINDS = Object.freeze({
  UNOFFICIAL_INSPIRATION: 'unofficial_inspiration',
});

export const UNOFFICIAL_INSPIRATION_DISCLOSURE =
  'Unofficial inspiration · No affiliation or endorsement.';

const MAX_INSPIRATION_LENGTH = 120;

function normalizeInspiredBy(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length > MAX_INSPIRATION_LENGTH) return null;
  if (/[\u0000-\u001F\u007F]/.test(normalized)) return null;
  return normalized;
}

export function buildUnofficialInspirationProvenance(inspiredBy) {
  const normalized = normalizeInspiredBy(inspiredBy);
  if (!normalized) return null;
  return Object.freeze({
    kind: THEME_PROVENANCE_KINDS.UNOFFICIAL_INSPIRATION,
    inspiredBy: normalized,
  });
}

export function normalizeThemeProvenance(provenance) {
  if (!provenance || typeof provenance !== 'object') return null;
  if (provenance.kind !== THEME_PROVENANCE_KINDS.UNOFFICIAL_INSPIRATION) return null;
  return buildUnofficialInspirationProvenance(provenance.inspiredBy);
}

export function getThemeProvenancePresentation(theme) {
  const provenance = normalizeThemeProvenance(theme?.provenance);
  if (!provenance) return null;
  return Object.freeze({
    ...provenance,
    label: `Inspired by ${provenance.inspiredBy}`,
    disclosure: UNOFFICIAL_INSPIRATION_DISCLOSURE,
  });
}
