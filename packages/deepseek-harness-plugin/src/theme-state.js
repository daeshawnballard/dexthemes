export const THEME_STATE_VERSION = 1;
export const THEME_STATE_PERSIST_KEY = 'dexthemes.deepseek.theme.v1';

const SAFE_THEME_ID = /^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/;

export function safeThemeId(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized.length <= 80 && SAFE_THEME_ID.test(normalized) ? normalized : null;
}

export function normalizeThemeState(value = {}) {
  const desiredThemeId = safeThemeId(value?.desiredThemeId);
  return Object.freeze({
    version: THEME_STATE_VERSION,
    desiredThemeId,
    accountProtected: desiredThemeId ? value?.accountProtected === true : false,
    reconnectRequired: value?.reconnectRequired === true,
  });
}

/** Build the plugin's Harness-owned, non-secret persistent preference store. */
export function createThemeStateHandle(defineStore) {
  if (typeof defineStore !== 'function') throw new TypeError('Harness defineStore is required');
  return defineStore({
    persist: THEME_STATE_PERSIST_KEY,
    init: () => normalizeThemeState(),
    actions: {
      normalize(draft) {
        const safe = normalizeThemeState(draft);
        draft.version = safe.version;
        draft.desiredThemeId = safe.desiredThemeId;
        draft.accountProtected = safe.accountProtected;
        draft.reconnectRequired = safe.reconnectRequired;
      },
      rememberTheme(draft, themeId, accountProtected = false) {
        draft.version = THEME_STATE_VERSION;
        draft.desiredThemeId = safeThemeId(themeId);
        draft.accountProtected = Boolean(draft.desiredThemeId && accountProtected);
      },
      forgetTheme(draft) {
        draft.version = THEME_STATE_VERSION;
        draft.desiredThemeId = null;
        draft.accountProtected = false;
      },
      rememberAccount(draft) {
        draft.version = THEME_STATE_VERSION;
        draft.reconnectRequired = true;
      },
      forgetAccount(draft) {
        draft.version = THEME_STATE_VERSION;
        draft.reconnectRequired = false;
      },
    },
  });
}

/** Rehydrate defensively; a malformed persisted root is discarded and recreated. */
export function createThemeStateStore(defineStore) {
  const handle = createThemeStateHandle(defineStore);
  let store = handle.create();
  try {
    store.actions.normalize();
  } catch {
    store.clearPersisted?.();
    store = handle.create();
    store.actions.normalize();
  }
  return store;
}

/** Test/default store with the same controller-facing contract and no persistence. */
export function createMemoryThemeState(initial = {}) {
  let state = normalizeThemeState(initial);
  const listeners = new Set();
  const publish = (next) => {
    state = normalizeThemeState(next);
    for (const listener of listeners) listener();
  };
  return Object.freeze({
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    actions: Object.freeze({
      normalize: () => publish(state),
      rememberTheme: (themeId, accountProtected = false) => publish({
        ...state,
        desiredThemeId: themeId,
        accountProtected,
      }),
      forgetTheme: () => publish({ ...state, desiredThemeId: null, accountProtected: false }),
      rememberAccount: () => publish({ ...state, reconnectRequired: true }),
      forgetAccount: () => publish({ ...state, reconnectRequired: false }),
    }),
  });
}
