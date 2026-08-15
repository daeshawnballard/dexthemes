import { normalizeConnectedAppPluginVersion } from '../../../shared/connected-apps-contract.js';

export const DEXTHEMES_ACCOUNT_API_URL = 'https://acrobatic-corgi-867.convex.site';

function emptyState(reconnectRequired = false) {
  return Object.freeze({
    status: 'idle',
    error: null,
    userCode: null,
    verificationUrl: null,
    stats: null,
    unlocks: Object.freeze([]),
    reconnectRequired: reconnectRequired === true,
  });
}

function freezeState(state) {
  return Object.freeze({
    ...state,
    unlocks: Object.freeze([...(state.unlocks || [])]),
  });
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function boundedError(value, fallback) {
  const normalized = String(value || fallback).replace(/[\r\n\t]+/g, ' ').trim();
  return normalized.slice(0, 160) || fallback;
}

function isGitHubDeviceUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname === 'github.com' && parsed.pathname === '/login/device';
  } catch {
    return false;
  }
}

function retryAfterSeconds(response) {
  const value = Number(response?.headers?.get?.('Retry-After'));
  return Number.isFinite(value) ? Math.min(30, Math.max(1, value)) : 0;
}

function createClientUseReceipt() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error('Secure client activity receipts are unavailable');
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function requestDeviceAuthorization({
  fetchImpl = globalThis.fetch,
  apiBaseUrl = DEXTHEMES_ACCOUNT_API_URL,
  signal,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required');
  const response = await fetchImpl(`${apiBaseUrl}/plugin/deepseek-harness/auth/start`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await parseJson(response);
  if (!response.ok) throw new Error(boundedError(payload.error, 'DexThemes account connection is unavailable'));
  const deviceCode = String(payload.deviceCode || '');
  const userCode = String(payload.userCode || '');
  const verificationUrl = String(payload.verificationUriComplete || payload.verificationUri || '');
  const expiresIn = Math.min(1800, Math.max(60, Number(payload.expiresIn) || 900));
  const interval = Math.min(30, Math.max(5, Number(payload.interval) || 5));
  if (!deviceCode || deviceCode.length > 2048 || !userCode || userCode.length > 32 || !isGitHubDeviceUrl(verificationUrl)) {
    throw new TypeError('DexThemes account connection returned an invalid response');
  }
  return Object.freeze({ deviceCode, userCode, verificationUrl, expiresIn, interval });
}

export async function pollDeviceAuthorization(device, {
  fetchImpl = globalThis.fetch,
  apiBaseUrl = DEXTHEMES_ACCOUNT_API_URL,
  waitImpl = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  pluginVersion,
  signal,
} = {}) {
  const deadline = Date.now() + (device.expiresIn * 1000);
  let interval = device.interval;
  while (Date.now() < deadline) {
    await waitImpl(interval * 1000, signal);
    if (signal?.aborted) throw new DOMException('Account connection cancelled', 'AbortError');
    const response = await fetchImpl(`${apiBaseUrl}/plugin/deepseek-harness/auth/poll`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceCode: device.deviceCode,
        ...(normalizeConnectedAppPluginVersion(pluginVersion) ? {
          pluginVersion: normalizeConnectedAppPluginVersion(pluginVersion),
        } : {}),
      }),
      signal,
    });
    const payload = await parseJson(response);
    if (response.status === 202 && payload.error === 'authorization_pending') continue;
    if (response.ok) {
      const accessToken = String(payload.accessToken || '');
      if (!accessToken.startsWith('dxd_') || accessToken.length > 256 || payload.tokenType !== 'Bearer') {
        throw new TypeError('DexThemes account connection returned an invalid token response');
      }
      const expiresIn = Math.min(3600, Math.max(60, Number(payload.expiresIn) || 3600));
      return Object.freeze({ accessToken, expiresIn });
    }
    if (response.status === 429 && ['slow_down', 'rate_limited'].includes(payload.error)) {
      interval = Math.min(30, Math.max(interval + 5, retryAfterSeconds(response)));
      continue;
    }
    throw new Error(boundedError(payload.error, 'DexThemes account connection failed'));
  }
  throw new Error('DexThemes account connection expired');
}

export function createHarnessAccountClient({
  fetchImpl = globalThis.fetch,
  apiBaseUrl = DEXTHEMES_ACCOUNT_API_URL,
  waitImpl,
  reconnectRequired = false,
  onConnected = () => {},
  onDisconnected = () => {},
  pluginVersion,
} = {}) {
  const reportedPluginVersion = normalizeConnectedAppPluginVersion(pluginVersion);
  let accessToken = '';
  let expiresAt = 0;
  let generation = 0;
  let controller = null;
  let state = emptyState(reconnectRequired);
  const listeners = new Set();

  const publish = (next) => {
    state = freezeState(next);
    for (const listener of listeners) listener();
  };

  const authorizedFetch = async (path, options = {}) => {
    if (!accessToken || expiresAt <= Date.now()) {
      accessToken = '';
      expiresAt = 0;
      throw new Error('DexThemes account session expired. Connect again.');
    }
    const token = accessToken;
    const response = await fetchImpl(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = await parseJson(response);
    if (response.status === 401 && accessToken === token) {
      generation += 1;
      controller?.abort();
      controller = null;
      accessToken = '';
      expiresAt = 0;
      publish({
        ...emptyState(true),
        status: 'error',
        error: 'DexThemes account session expired. Connect again.',
      });
    }
    if (!response.ok) throw new Error(boundedError(payload.error, 'DexThemes account request failed'));
    return payload;
  };

  const revoke = async (token) => {
    if (!token) return true;
    const response = await fetchImpl(`${apiBaseUrl}/plugin/deepseek-harness/session`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    const payload = await parseJson(response);
    if (!response.ok || payload.revoked !== true) {
      throw new Error(boundedError(payload.error, 'DexThemes account disconnect failed. Try again.'));
    }
    return true;
  };

  const refresh = async (expectedGeneration = generation) => {
    const [statsPayload, unlockPayload] = await Promise.all([
      authorizedFetch('/plugin/me/stats'),
      authorizedFetch('/plugin/me/unlocks'),
    ]);
    if (generation !== expectedGeneration || !accessToken) return false;
    publish({
      status: 'connected',
      error: null,
      userCode: null,
      verificationUrl: null,
      stats: statsPayload,
      unlocks: Array.isArray(unlockPayload.unlocks) ? unlockPayload.unlocks : [],
      reconnectRequired: false,
    });
    return true;
  };

  return Object.freeze({
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async connect() {
      controller?.abort();
      const attempt = ++generation;
      const attemptController = new AbortController();
      controller = attemptController;
      accessToken = '';
      expiresAt = 0;
      publish({ ...emptyState(state.reconnectRequired), status: 'connecting' });
      try {
        const device = await requestDeviceAuthorization({ fetchImpl, apiBaseUrl, signal: attemptController.signal });
        if (attempt !== generation || attemptController.signal.aborted) return null;
        publish({
          ...emptyState(state.reconnectRequired),
          status: 'awaiting_authorization',
          userCode: device.userCode,
          verificationUrl: device.verificationUrl,
        });
        void pollDeviceAuthorization(device, {
          fetchImpl,
          apiBaseUrl,
          waitImpl,
          pluginVersion: reportedPluginVersion,
          signal: attemptController.signal,
        }).then(async (session) => {
          if (attempt !== generation || attemptController.signal.aborted) return;
          accessToken = session.accessToken;
          expiresAt = Date.now() + (session.expiresIn * 1000);
          if (await refresh(attempt)) {
            try { onConnected(); } catch { /* Persistence must not affect connection. */ }
          }
        }).catch((error) => {
          if (error?.name === 'AbortError' || attempt !== generation) return;
          accessToken = '';
          expiresAt = 0;
          publish({
            ...emptyState(state.reconnectRequired),
            status: 'error',
            error: boundedError(error?.message, 'DexThemes account connection failed'),
          });
        });
        return Object.freeze({ userCode: device.userCode, verificationUrl: device.verificationUrl });
      } catch (error) {
        if (error?.name === 'AbortError' || attempt !== generation) return null;
        accessToken = '';
        expiresAt = 0;
        publish({
          ...emptyState(state.reconnectRequired),
          status: 'error',
          error: boundedError(error?.message, 'DexThemes account connection failed'),
        });
        return null;
      }
    },
    async recordHarnessUse() {
      if (!accessToken) return null;
      const expectedGeneration = generation;
      const result = await authorizedFetch('/plugin/deepseek-harness/use', {
        method: 'POST',
        body: JSON.stringify({
          receiptId: createClientUseReceipt(),
          ...(reportedPluginVersion ? { pluginVersion: reportedPluginVersion } : {}),
        }),
      });
      await refresh(expectedGeneration);
      return result.recorded === true;
    },
    async disconnect() {
      generation += 1;
      controller?.abort();
      controller = null;
      const token = accessToken;
      if (!token) {
        accessToken = '';
        expiresAt = 0;
        publish(emptyState(false));
        try { onDisconnected(); } catch { /* Persistence must not affect disconnect. */ }
        return true;
      }
      const connectedState = state;
      publish({ ...connectedState, status: 'disconnecting', error: null });
      try {
        await revoke(token);
      } catch (error) {
        publish({
          ...connectedState,
          status: 'connected',
          error: boundedError(error?.message, 'DexThemes account disconnect failed. Try again.'),
        });
        return false;
      }
      accessToken = '';
      expiresAt = 0;
      publish(emptyState(false));
      try { onDisconnected(); } catch { /* Persistence must not affect disconnect. */ }
      return true;
    },
    destroy() {
      generation += 1;
      controller?.abort();
      controller = null;
      const token = accessToken;
      accessToken = '';
      expiresAt = 0;
      state = emptyState(state.reconnectRequired);
      listeners.clear();
      void revoke(token).catch(() => {});
    },
  });
}
