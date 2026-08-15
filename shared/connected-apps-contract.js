export const CONNECTED_APP_IDS = Object.freeze({
  DEEPSEEK_HARNESS: 'deepseek_harness',
});

export const DEEPSEEK_HARNESS_USE_SCOPE = 'harness:use';

export const CONNECTED_APP_DEFINITIONS = Object.freeze({
  [CONNECTED_APP_IDS.DEEPSEEK_HARNESS]: Object.freeze({
    integrationId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
    integrationName: 'DexThemes Connect',
    platformId: 'deepseek',
    platformName: 'DeepSeek Harness',
  }),
});

const PLUGIN_VERSION = /^[0-9]+(?:\.[0-9]+){1,3}(?:[-+][0-9A-Za-z.-]+)?$/;
const CLIENT_USE_RECEIPT = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getConnectedAppDefinition(integrationId) {
  return typeof integrationId === 'string'
    ? CONNECTED_APP_DEFINITIONS[integrationId] || null
    : null;
}

export function normalizeConnectedAppPluginVersion(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const normalized = String(value).trim();
  return normalized.length <= 40 && PLUGIN_VERSION.test(normalized)
    ? normalized
    : undefined;
}

export function normalizeClientUseReceiptId(value) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return CLIENT_USE_RECEIPT.test(normalized) ? normalized.toLowerCase() : null;
}

export function advanceClientUseReceiptHashes(priorValues, receiptHash) {
  const normalizedHash = typeof receiptHash === 'string' && /^[0-9a-f]{64}$/i.test(receiptHash)
    ? receiptHash.toLowerCase()
    : null;
  if (!normalizedHash) return Object.freeze({ accepted: false, hashes: Object.freeze([]) });
  const prior = (Array.isArray(priorValues) ? priorValues : [])
    .filter((value) => typeof value === 'string' && /^[0-9a-f]{64}$/i.test(value))
    .map((value) => value.toLowerCase())
    .slice(-32);
  if (prior.includes(normalizedHash)) {
    return Object.freeze({ accepted: false, hashes: Object.freeze(prior) });
  }
  return Object.freeze({
    accepted: true,
    hashes: Object.freeze([...prior.slice(-31), normalizedHash]),
  });
}

function boundedTimestamp(value) {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp >= 0 ? Math.floor(timestamp) : 0;
}

function boundedUsageCount(value) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

/**
 * Project a durable account record into the only shape exposed to clients.
 * Database ids, user ids, session sources, and bearer material are omitted.
 */
export function projectConnectedAppRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  if (record.disconnectedAt !== undefined && record.disconnectedAt !== null) return null;
  const integrationId = record.integrationId || record.id;
  const definition = getConnectedAppDefinition(integrationId);
  if (!definition) return null;

  const connectedAt = boundedTimestamp(record.connectedAt);
  const lastUsedAt = boundedTimestamp(record.lastUsedAt || connectedAt);
  const clientReportedThemeApplies = boundedUsageCount(
    record.usageCount ?? record.usage?.clientReportedThemeApplies,
  );

  return Object.freeze({
    ...definition,
    pluginVersion: normalizeConnectedAppPluginVersion(record.pluginVersion) || null,
    connectedAt,
    lastUsedAt,
    usage: Object.freeze({
      clientReportedThemeApplies,
      evidence: 'client_reported',
    }),
    canDisconnect: record.canDisconnect !== false,
  });
}
