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
} = {}) {
  let accessToken = '';
  let expiresAt = 0;
  let generation = 0;
  let controller = null;
  let state = EMPTY_STATE;
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
      publish({ ...EMPTY_STATE, status: 'error', error: 'DexThemes account session expired. Connect again.' });
    }
    if (!response.ok) throw new Error(boundedError(payload.error, 'DexThemes account request failed'));
    return payload;
  };

  const revoke = async (token) => {
    if (!token) return;
    try {
      await fetchImpl(`${apiBaseUrl}/plugin/deepseek-harness/session`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
    } catch {
      // The local credential is cleared first; server expiry remains the fallback.
    }
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
      publish({ ...EMPTY_STATE, status: 'connecting' });
      try {
        const device = await requestDeviceAuthorization({ fetchImpl, apiBaseUrl, signal: attemptController.signal });
        if (attempt !== generation || attemptController.signal.aborted) return null;
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
          signal: attemptController.signal,
        }).then(async (session) => {
          if (attempt !== generation || attemptController.signal.aborted) return;
          accessToken = session.accessToken;
          expiresAt = Date.now() + (session.expiresIn * 1000);
          await refresh(attempt);
        }).catch((error) => {
          if (error?.name === 'AbortError' || attempt !== generation) return;
          accessToken = '';
          expiresAt = 0;
          publish({ ...EMPTY_STATE, status: 'error', error: boundedError(error?.message, 'DexThemes account connection failed') });
        });
        return Object.freeze({ userCode: device.userCode, verificationUrl: device.verificationUrl });
      } catch (error) {
        if (error?.name === 'AbortError' || attempt !== generation) return null;
        accessToken = '';
        expiresAt = 0;
        publish({ ...EMPTY_STATE, status: 'error', error: boundedError(error?.message, 'DexThemes account connection failed') });
        return null;
      }
    },
    async recordHarnessUse() {
      if (!accessToken) return null;
      const expectedGeneration = generation;
      const result = await authorizedFetch('/plugin/deepseek-harness/use', { method: 'POST' });
      await refresh(expectedGeneration);
      return result.achievement || null;
    },
    async disconnect() {
      generation += 1;
      controller?.abort();
      controller = null;
      const token = accessToken;
      accessToken = '';
      expiresAt = 0;
      publish(EMPTY_STATE);
      await revoke(token);
    },
    destroy() {
      generation += 1;
      controller?.abort();
      controller = null;
      const token = accessToken;
      accessToken = '';
      expiresAt = 0;
      state = EMPTY_STATE;
      listeners.clear();
      void revoke(token);
    },
  });
}
