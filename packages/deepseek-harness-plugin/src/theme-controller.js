import { tokensForHarnessTheme } from './catalog.js';
import { createMemoryThemeState, normalizeThemeState, safeThemeId } from './theme-state.js';

export const INSTALLED_THEME_SOURCE = 'dexthemes-installed-plugin';
export const PLUGIN_VERSION = '0.6.4';
export const THEME_CAPABILITY_ERROR = 'Theme controls are unavailable because this Harness build did not provide the supported theme service.';

function freezeState(state) {
  return Object.freeze({ ...state });
}

function hasThemeCapability(value) {
  return Boolean(value && typeof value.overrideTokens === 'function');
}

/** Own the exact override layer, durable selection intent, and reversible lifecycle. */
export function createHarnessThemeController(themeRuntime = null, {
  source = INSTALLED_THEME_SOURCE,
  onEvent = () => {},
  onApplied = () => {},
  preferences = createMemoryThemeState(),
} = {}) {
  let runtime = null;
  let disposer = null;
  let activeTheme = null;
  let catalog = new Map();
  const saved = normalizeThemeState(preferences.getSnapshot?.());
  let state = freezeState({
    desiredThemeId: saved.desiredThemeId,
    activeThemeId: null,
    capability: 'unavailable',
    status: saved.desiredThemeId ? 'pending_restore' : 'unavailable',
    notice: saved.desiredThemeId ? 'A saved theme will restore when the supported theme service and catalog are available.' : null,
    error: THEME_CAPABILITY_ERROR,
  });
  const listeners = new Set();

  const publish = (next) => {
    state = freezeState(next);
    for (const listener of listeners) listener();
  };

  const report = (name, themeId, failureCode, sourceSurface = 'settings_plugin_card') => {
    onEvent(Object.freeze({
      name,
      platform: 'deepseek_harness',
      platform_id: 'deepseek',
      mechanism: 'cordis_theme_override',
      source_surface: sourceSurface,
      ...(themeId ? { theme_id: themeId } : {}),
      variant: 'paired',
      plugin_version: PLUGIN_VERSION,
      ...(failureCode ? { failure_code: failureCode } : {}),
    }));
  };

  const preferenceSnapshot = () => normalizeThemeState(preferences.getSnapshot?.());

  const publishUnavailable = (notice = null, error = THEME_CAPABILITY_ERROR) => {
    const preference = preferenceSnapshot();
    publish({
      desiredThemeId: preference.desiredThemeId,
      activeThemeId: null,
      capability: 'unavailable',
      status: preference.desiredThemeId ? 'pending_restore' : 'unavailable',
      notice,
      error,
    });
  };

  const safeDispose = () => {
    if (!disposer) return true;
    try {
      disposer();
      disposer = null;
      activeTheme = null;
      return true;
    } catch {
      return false;
    }
  };

  const applyTheme = (theme, {
    restore = false,
    sourceSurface = restore ? 'startup_restore' : 'settings_plugin_card',
  } = {}) => {
    const themeId = safeThemeId(theme?.id) || '';
    const prefix = restore ? 'deepseek_theme_restore' : 'deepseek_theme_apply';
    report(`${prefix}_started`, themeId, null, sourceSurface);
    if (!themeId) {
      publish({
        ...state,
        status: 'error',
        notice: null,
        error: 'Theme application failed because the theme identifier is invalid.',
      });
      report(`${prefix}_failed`, null, 'invalid_theme', sourceSurface);
      return false;
    }
    if (!hasThemeCapability(runtime)) {
      publishUnavailable(state.notice);
      report(`${prefix}_failed`, themeId, 'capability_unavailable', sourceSurface);
      return false;
    }

    let nextDisposer = null;
    try {
      const tokens = tokensForHarnessTheme(theme);
      nextDisposer = runtime.overrideTokens(source, tokens);
      if (typeof nextDisposer !== 'function') {
        throw new TypeError('Harness theme override did not return a disposer');
      }
      const previousDisposer = disposer;
      previousDisposer?.();
      disposer = nextDisposer;
      activeTheme = theme;
      if (!restore) preferences.actions.rememberTheme(themeId, theme?.subgroup === 'unlockables');
      const preference = preferenceSnapshot();
      publish({
        desiredThemeId: preference.desiredThemeId || themeId,
        activeThemeId: themeId,
        capability: 'available',
        status: 'active',
        notice: null,
        error: null,
      });
      report(`${prefix}_succeeded`, themeId, null, sourceSurface);
      if (!restore) {
        try {
          Promise.resolve(onApplied(Object.freeze({ themeId }))).catch(() => {});
        } catch {
          // Account/achievement reporting must never affect theme application.
        }
      }
      return true;
    } catch {
      if (nextDisposer && nextDisposer !== disposer) {
        try {
          nextDisposer();
        } catch {
          // The runtime owns the disposer implementation. Keep the previous
          // known selection and expose only a bounded error to the user.
        }
      }
      const preference = preferenceSnapshot();
      publish({
        desiredThemeId: preference.desiredThemeId,
        activeThemeId: state.activeThemeId,
        capability: 'available',
        status: 'error',
        notice: null,
        error: restore
          ? 'Saved theme restoration failed. Choose Apply to retry.'
          : 'Theme application failed. The previous theme remains selected.',
      });
      report(`${prefix}_failed`, themeId, 'runtime_contract_rejected', sourceSurface);
      return false;
    }
  };

  const restoreSavedTheme = () => {
    const preference = preferenceSnapshot();
    if (!preference.desiredThemeId || !hasThemeCapability(runtime)) return false;
    if (state.activeThemeId === preference.desiredThemeId) return true;
    const theme = catalog.get(preference.desiredThemeId);
    if (!theme) {
      publish({
        desiredThemeId: preference.desiredThemeId,
        activeThemeId: null,
        capability: 'available',
        status: 'pending_restore',
        notice: preference.accountProtected
          ? 'Reconnect DexThemes to restore this account-only theme.'
          : 'Saved theme will restore when its catalog entry is available.',
        error: null,
      });
      return false;
    }
    return applyTheme(theme, { restore: true });
  };

  const api = Object.freeze({
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    preview(theme, sourceSurface = 'settings_plugin_preview') {
      report('deepseek_theme_previewed', safeThemeId(theme?.id), null, sourceSurface);
    },
    apply(theme, options) {
      return applyTheme(theme, options);
    },
    setCatalog(themes) {
      catalog = new Map((Array.isArray(themes) ? themes : [])
        .map((theme) => [safeThemeId(theme?.id), theme])
        .filter(([id]) => Boolean(id)));
      restoreSavedTheme();
    },
    attach(nextRuntime) {
      if (!hasThemeCapability(nextRuntime)) {
        report('deepseek_theme_capability_unavailable', state.desiredThemeId, 'capability_unavailable', 'theme_capability');
        publishUnavailable(state.notice);
        return () => {};
      }
      if (runtime && runtime !== nextRuntime) safeDispose();
      runtime = nextRuntime;
      const preference = preferenceSnapshot();
      publish({
        desiredThemeId: preference.desiredThemeId,
        activeThemeId: null,
        capability: 'available',
        status: preference.desiredThemeId ? 'pending_restore' : 'idle',
        notice: preference.desiredThemeId ? 'Restoring the saved theme…' : null,
        error: null,
      });
      report('deepseek_theme_capability_available', preference.desiredThemeId, null, 'theme_capability');
      restoreSavedTheme();
      let attached = true;
      return () => {
        if (!attached || runtime !== nextRuntime) return;
        attached = false;
        const removed = safeDispose();
        runtime = null;
        publishUnavailable(
          preferenceSnapshot().desiredThemeId ? 'The saved theme will restore when the theme service returns.' : null,
          removed ? THEME_CAPABILITY_ERROR : 'The theme service stopped before its override could be cleanly removed.',
        );
        report('deepseek_theme_capability_unavailable', preferenceSnapshot().desiredThemeId, 'capability_unavailable', 'theme_capability');
      };
    },
    revert() {
      const previousThemeId = state.activeThemeId || preferenceSnapshot().desiredThemeId;
      if (!previousThemeId) return true;
      report('deepseek_theme_revert_started', previousThemeId, null, 'settings_plugin_revert');
      try {
        disposer?.();
        disposer = null;
        activeTheme = null;
        preferences.actions.forgetTheme();
        publish({
          desiredThemeId: null,
          activeThemeId: null,
          capability: hasThemeCapability(runtime) ? 'available' : 'unavailable',
          status: hasThemeCapability(runtime) ? 'idle' : 'unavailable',
          notice: null,
          error: hasThemeCapability(runtime) ? null : THEME_CAPABILITY_ERROR,
        });
        report('deepseek_theme_revert_succeeded', previousThemeId, null, 'settings_plugin_revert');
        // Preserve the original success event for existing dashboards.
        report('deepseek_theme_reverted', previousThemeId, null, 'settings_plugin_revert');
        return true;
      } catch {
        publish({
          desiredThemeId: preferenceSnapshot().desiredThemeId,
          activeThemeId: previousThemeId,
          capability: hasThemeCapability(runtime) ? 'available' : 'unavailable',
          status: 'error',
          notice: null,
          error: 'Theme removal failed. Try Revert again.',
        });
        report('deepseek_theme_revert_failed', previousThemeId, 'runtime_contract_rejected', 'settings_plugin_revert');
        return false;
      }
    },
    destroy() {
      safeDispose();
      runtime = null;
      listeners.clear();
    },
  });

  if (themeRuntime) api.attach(themeRuntime);
  return api;
}
