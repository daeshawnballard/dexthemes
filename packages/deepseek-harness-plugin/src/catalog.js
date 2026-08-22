import { buildDeepSeekThemeTokens, isDeepSeekThemeEligible } from '../../../shared/deepseek-theme-contract.js';
import { BUNDLED_THEME_CATALOG } from './catalog.generated.js';

export const DEXTHEMES_PUBLIC_CATALOG_URL = 'https://www.dexthemes.com/api/themes';
export const CATALOG_REQUEST_TIMEOUT_MS = 5_000;
export const MAX_CATALOG_RESPONSE_BYTES = 512 * 1024;
export const MAX_CATALOG_ENTRIES = 256;

const MAX_TEXT_LENGTH = 180;
const VISIBLE_CATEGORIES = new Set(['deepseek', 'dexthemes', 'community']);

function boundedText(value, fallback = '') {
  return String(value || fallback)
    .replace(/[\p{Cc}\p{Cf}\p{Cs}]+/gu, ' ')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

function boundedHttpsUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.href.slice(0, 600) : '';
  } catch {
    return '';
  }
}

function boundedThemeEntries(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);
  if (value.length > MAX_CATALOG_ENTRIES) {
    throw new RangeError(`${label} exceeds the ${MAX_CATALOG_ENTRIES}-entry limit`);
  }
  return value;
}

function hasAdditionalCatalogPage(payload) {
  const pagination = payload?.pagination;
  return payload?.hasMore === true
    || Boolean(payload?.nextCursor || payload?.nextPage || payload?.next)
    || pagination?.hasMore === true
    || Boolean(pagination?.nextCursor || pagination?.nextPage || pagination?.next);
}

function contentLengthExceedsLimit(response) {
  const header = response?.headers?.get?.('content-length');
  if (header === null || header === undefined || header === '') return false;
  const length = Number(header);
  return Number.isFinite(length) && length > MAX_CATALOG_RESPONSE_BYTES;
}

async function readBoundedCatalogText(response) {
  const stream = response?.body;
  if (stream && typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    const chunks = [];
    let byteLength = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!(value instanceof Uint8Array)) {
          throw new TypeError('DexThemes catalog response body must contain bytes');
        }
        byteLength += value.byteLength;
        if (byteLength > MAX_CATALOG_RESPONSE_BYTES) {
          await reader.cancel?.();
          throw new RangeError(`DexThemes catalog response exceeds the ${MAX_CATALOG_RESPONSE_BYTES}-byte limit`);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock?.();
    }
    const bytes = new Uint8Array(byteLength);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(bytes);
  }
  if (typeof response?.text !== 'function') {
    throw new TypeError('DexThemes catalog response must expose a text body');
  }
  return response.text();
}

async function parseBoundedCatalogResponse(response) {
  if (contentLengthExceedsLimit(response)) {
    throw new RangeError(`DexThemes catalog response exceeds the ${MAX_CATALOG_RESPONSE_BYTES}-byte limit`);
  }
  const body = await readBoundedCatalogText(response);
  if (typeof body !== 'string') throw new TypeError('DexThemes catalog response body must be text');
  if (new TextEncoder().encode(body).byteLength > MAX_CATALOG_RESPONSE_BYTES) {
    throw new RangeError(`DexThemes catalog response exceeds the ${MAX_CATALOG_RESPONSE_BYTES}-byte limit`);
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new TypeError('DexThemes catalog response must be valid JSON');
  }
}

async function fetchCatalogWithTimeout(fetchImpl, timeoutMs) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller?.abort();
      reject(new Error(`DexThemes catalog request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      Promise.resolve().then(() => fetchImpl(DEXTHEMES_PUBLIC_CATALOG_URL, {
        headers: { Accept: 'application/json' },
        ...(controller ? { signal: controller.signal } : {}),
      })),
      timeout,
    ]);
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

/** Normalize one public or bundled theme into the installed plugin's owned shape. */
export function normalizeHarnessTheme(theme, { allowUnlockable = false } = {}) {
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return null;
  if (theme._hiddenUntilUnlocked) return null;
  const unlockable = boundedText(theme.subgroup, '').toLowerCase() === 'unlockables';
  if (unlockable && !allowUnlockable) return null;
  if (!isDeepSeekThemeEligible(theme)) return null;
  const id = boundedText(theme.id || theme.themeId, '');
  const name = boundedText(theme.name, '');
  const category = boundedText(theme.category, 'community').toLowerCase();
  if (!id || !name || !VISIBLE_CATEGORIES.has(category)) return null;
  return Object.freeze({
    id,
    name,
    summary: boundedText(theme.summary || theme._summary, ''),
    category,
    subgroup: boundedText(theme.subgroup, ''),
    sourceLabel: boundedText(theme.sourceLabel, ''),
    evidenceUrl: boundedHttpsUrl(theme.evidenceUrl),
    unofficial: theme.unofficial === true,
    dark: Object.freeze({ ...theme.dark }),
    light: Object.freeze({ ...theme.light }),
  });
}

/**
 * Catalog prose is display-only, never mutation or model-context data.
 * This projection contains only the identifier and validated palette fields
 * required by the guarded Harness theme service.
 */
export function projectHarnessThemeForMutation(theme, options) {
  const normalized = normalizeHarnessTheme(theme, options);
  if (!normalized) return null;
  return Object.freeze({
    id: normalized.id,
    category: normalized.category,
    subgroup: normalized.subgroup,
    dark: normalized.dark,
    light: normalized.light,
  });
}

/** Add only server-verified reward themes returned by the bearer account API. */
export function mergeUnlockedHarnessThemes(themes, unlocks) {
  const verified = boundedThemeEntries(Array.isArray(unlocks) ? unlocks : [], 'DexThemes unlock catalog')
    .map((unlock) => normalizeHarnessTheme(unlock?.theme, { allowUnlockable: true }))
    .filter(Boolean);
  return mergeHarnessThemes(themes, verified, { allowUnlockable: true });
}

/** Bundled fallback catalog available before any network request. */
export const BUNDLED_HARNESS_THEMES = Object.freeze(
  BUNDLED_THEME_CATALOG.map(normalizeHarnessTheme).filter(Boolean),
);

/** Merge remote public/community entries over the bundled snapshot by stable id. */
export function mergeHarnessThemes(bundled, remote, { allowUnlockable = false } = {}) {
  const bundledEntries = boundedThemeEntries(bundled, 'Bundled DexThemes catalog');
  const remoteEntries = boundedThemeEntries(remote, 'Remote DexThemes catalog');
  const byId = new Map();
  for (const entries of [bundledEntries, remoteEntries]) {
    for (const candidate of entries) {
      const theme = normalizeHarnessTheme(candidate, { allowUnlockable });
      if (!theme) continue;
      byId.set(theme.id, theme);
      if (byId.size > MAX_CATALOG_ENTRIES) {
        throw new RangeError(`Merged DexThemes catalog exceeds the ${MAX_CATALOG_ENTRIES}-entry limit`);
      }
    }
  }
  return Object.freeze([...byId.values()].sort((left, right) => left.name.localeCompare(right.name)));
}

/** Search locally so user text is never transmitted as analytics or API query data. */
export function searchHarnessThemes(themes, query, category = 'all') {
  const entries = boundedThemeEntries(themes, 'DexThemes catalog');
  const normalized = boundedText(query, '').toLocaleLowerCase();
  return entries.filter((theme) => {
    if (category !== 'all' && theme.category !== category) return false;
    if (!normalized) return true;
    return [theme.id, theme.name, theme.summary, theme.category, theme.subgroup]
      .some((value) => value.toLocaleLowerCase().includes(normalized));
  });
}

/** Resolve validated Harness semantic token pairs for a selected theme. */
export function tokensForHarnessTheme(theme) {
  const mutationTheme = projectHarnessThemeForMutation(theme, {
    // Account-only entries enter the UI only through mergeUnlockedHarnessThemes.
    // Their palette still needs the same prose-free mutation projection.
    allowUnlockable: theme?.subgroup === 'unlockables',
  });
  if (!mutationTheme) throw new TypeError('DexThemes theme cannot be projected for Harness mutation');
  return buildDeepSeekThemeTokens(mutationTheme);
}

/** Load the public catalog without credentials, prompts, or workspace data. */
export async function loadPublicHarnessThemes({
  fetchImpl = globalThis.fetch,
  timeoutMs = CATALOG_REQUEST_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > CATALOG_REQUEST_TIMEOUT_MS) {
    throw new RangeError(`DexThemes catalog timeout must be between 1 and ${CATALOG_REQUEST_TIMEOUT_MS}ms`);
  }
  const response = await fetchCatalogWithTimeout(fetchImpl, timeoutMs);
  if (!response.ok) throw new Error(`DexThemes catalog request failed with status ${response.status}`);
  const payload = await parseBoundedCatalogResponse(response);
  if (!payload || !Array.isArray(payload.themes)) {
    throw new TypeError('DexThemes catalog response must contain a themes array');
  }
  if (hasAdditionalCatalogPage(payload)) {
    throw new RangeError('DexThemes catalog pagination is unsupported; refusing a partial catalog');
  }
  boundedThemeEntries(payload.themes, 'DexThemes catalog response');
  return mergeHarnessThemes([], payload.themes);
}
