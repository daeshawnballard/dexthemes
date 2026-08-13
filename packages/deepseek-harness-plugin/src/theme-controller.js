import { tokensForHarnessTheme } from './catalog.js';

export const INSTALLED_THEME_SOURCE = 'dexthemes-installed-plugin';
export const PLUGIN_VERSION = '0.6.0';

function freezeState(state) {
  return Object.freeze({ ...state });
}

/** Own the exact override layer and its reversible lifecycle. */
export function createHarnessThemeController(themeRuntime, {
  source = INSTALLED_THEME_SOURCE,
  onEvent = () => {},
  onApplied = () => {},
} = {}) {
  if (!themeRuntime || typeof themeRuntime.overrideTokens !== 'function') {
    throw new TypeError('The DeepSeek Harness theme service is required');
  }

  let disposer = null;
  let state = freezeState({ activeThemeId: null, status: 'idle', error: null });
  const listeners = new Set();

  const publish = (next) => {
    state = freezeState(next);
    for (const listener of listeners) listener();
  };

  const report = (name, themeId, failureCode) => {
    onEvent(Object.freeze({
      name,
      platform: 'deepseek_harness',
      mechanism: 'cordis_theme_override',
      source_surface: 'settings_plugins_dexthemes',
      ...(themeId ? { theme_id: themeId } : {}),
      variant: 'paired',
      plugin_version: PLUGIN_VERSION,
      ...(failureCode ? { failure_code: failureCode } : {}),
    }));
  };

  return Object.freeze({
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    preview(theme) {
      report('deepseek_theme_previewed', theme?.id);
    },
    apply(theme) {
      const themeId = String(theme?.id || '');
      report('deepseek_theme_apply_started', themeId);
      let nextDisposer = null;
      try {
        const tokens = tokensForHarnessTheme(theme);
        nextDisposer = themeRuntime.overrideTokens(source, tokens);
        if (typeof nextDisposer !== 'function') {
          throw new TypeError('Harness theme override did not return a disposer');
        }
        const previousDisposer = disposer;
        previousDisposer?.();
        disposer = nextDisposer;
        publish({ activeThemeId: themeId, status: 'active', error: null });
        report('deepseek_theme_apply_succeeded', themeId);
        try {
          Promise.resolve(onApplied(Object.freeze({ themeId }))).catch(() => {});
        } catch {
          // Account/achievement reporting must never affect theme application.
        }
        return true;
      } catch (error) {
        if (nextDisposer && nextDisposer !== disposer) {
          try {
            nextDisposer();
          } catch {
            // The runtime owns the disposer implementation. Keep the previous
            // known layer/state and expose a bounded failure to the user.
          }
        }
        publish({
          activeThemeId: state.activeThemeId,
          status: 'error',
          error: 'Theme application failed. The previous theme remains selected.',
        });
        report('deepseek_theme_apply_failed', themeId, 'runtime_contract_rejected');
        return false;
      }
    },
    revert() {
      const previousThemeId = state.activeThemeId;
      if (!disposer) return true;
      report('deepseek_theme_revert_started', previousThemeId);
      try {
        disposer();
        disposer = null;
        publish({ activeThemeId: null, status: 'idle', error: null });
        report('deepseek_theme_revert_succeeded', previousThemeId);
        // Preserve the original success event for existing dashboards.
        report('deepseek_theme_reverted', previousThemeId);
        return true;
      } catch {
        publish({
          activeThemeId: previousThemeId,
          status: 'error',
          error: 'Theme removal failed. Try Revert again.',
        });
        report('deepseek_theme_revert_failed', previousThemeId, 'runtime_contract_rejected');
        return false;
      }
    },
    destroy() {
      disposer?.();
      disposer = null;
      state = freezeState({ activeThemeId: null, status: 'idle', error: null });
      listeners.clear();
    },
  });
}
