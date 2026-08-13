export const DEXTHEMES_ACCOUNT_API_URL = 'https://acrobatic-corgi-867.convex.site';

const EMPTY_STATE = Object.freeze({
  status: 'idle',
  error: null,
  userCode: null,
  verificationUrl: null,
  stats: null,
  unlocks: Object.freeze([]),
});

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
  if (!deviceCode || deviceCode.length > 2048 || !userCode || userCode.length > 32 || !verificationUrl.startsWith('https://')) {
    throw new TypeError('DexThemes account connection returned an invalid response');
  }
  return Object.freeze({ deviceCode, userCode, verificationUrl, expiresIn, interval });
}

export async function pollDeviceAuthorization(device, {
  fetchImpl = globalThis.fetch,
  apiBaseUrl = DEXTHEMES_ACCOUNT_API_URL,
  waitImpl = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
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
      body: JSON.stringify({ deviceCode: device.deviceCode }),
      signal,
    });
    const payload = await parseJson(response);
    if (response.ok) {
      const accessToken = String(payload.accessToken || '');
      if (!accessToken || accessToken.length > 12000 || payload.tokenType !== 'Bearer') {
        throw new TypeError('DexThemes account connection returned an invalid token response');
      }
      return accessToken;
    }
    if (response.status === 202 && payload.error === 'authorization_pending') continue;
    if (response.status === 429 && payload.error === 'slow_down') {
      interval = Math.min(30, interval + 5);
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
} = {}) {
  let accessToken = '';
  let controller = null;
  let state = EMPTY_STATE;
  const listeners = new Set();

  const publish = (next) => {
    state = freezeState(next);
    for (const listener of listeners) listener();
  };

  const authorizedFetch = async (path, options = {}) => {
    if (!accessToken) throw new Error('DexThemes account is not connected');
    const response = await fetchImpl(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = await parseJson(response);
    if (!response.ok) throw new Error(boundedError(payload.error, 'DexThemes account request failed'));
    return payload;
  };

  const refresh = async () => {
    const [statsPayload, unlockPayload] = await Promise.all([
      authorizedFetch('/plugin/me/stats'),
      authorizedFetch('/plugin/me/unlocks'),
    ]);
    publish({
      status: 'connected',
      error: null,
      userCode: null,
      verificationUrl: null,
      stats: statsPayload,
      unlocks: Array.isArray(unlockPayload.unlocks) ? unlockPayload.unlocks : [],
    });
  };

  return Object.freeze({
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async connect() {
      controller?.abort();
      controller = new AbortController();
      publish({ ...EMPTY_STATE, status: 'connecting' });
      try {
        const device = await requestDeviceAuthorization({ fetchImpl, apiBaseUrl, signal: controller.signal });
        publish({
          ...EMPTY_STATE,
          status: 'awaiting_authorization',
          userCode: device.userCode,
          verificationUrl: device.verificationUrl,
        });
        void pollDeviceAuthorization(device, {
          fetchImpl,
          apiBaseUrl,
          waitImpl,
          signal: controller.signal,
        }).then(async (token) => {
          accessToken = token;
          await refresh();
        }).catch((error) => {
          if (error?.name === 'AbortError') return;
          accessToken = '';
          publish({ ...EMPTY_STATE, status: 'error', error: boundedError(error?.message, 'DexThemes account connection failed') });
        });
        return Object.freeze({ userCode: device.userCode, verificationUrl: device.verificationUrl });
      } catch (error) {
        accessToken = '';
        publish({ ...EMPTY_STATE, status: 'error', error: boundedError(error?.message, 'DexThemes account connection failed') });
        return null;
      }
    },
    async recordHarnessUse() {
      if (!accessToken) return null;
      const result = await authorizedFetch('/plugin/deepseek-harness/use', { method: 'POST' });
      await refresh();
      return result.achievement || null;
    },
    disconnect() {
      controller?.abort();
      controller = null;
      accessToken = '';
      publish(EMPTY_STATE);
    },
    destroy() {
      controller?.abort();
      controller = null;
      accessToken = '';
      state = EMPTY_STATE;
      listeners.clear();
    },
  });
}
