import {
  DEEPSEEK_THEME_SOURCE,
  buildDeepSeekThemeTokens,
  isDeepSeekThemeEligible,
} from '../shared/deepseek-theme-contract.js';

let connectedThemeService = null;
let activeThemeDisposer = null;
let activeThemeId = null;

function getThemeId(theme) {
  return String(theme?.id || theme?.themeId || '');
}

function assertThemeService(service) {
  if (!service || typeof service.overrideTokens !== 'function') {
    throw new TypeError('DeepSeek Harness theme service must expose overrideTokens(source, tokens)');
  }
  return service;
}

export function connectDeepSeekHarnessThemeService(service) {
  const connected = assertThemeService(service);
  connectedThemeService = connected;
  let disconnected = false;
  return () => {
    if (disconnected) return;
    disconnected = true;
    if (connectedThemeService !== connected) return;
    activeThemeDisposer?.();
    activeThemeDisposer = null;
    activeThemeId = null;
    connectedThemeService = null;
  };
}

export function getDeepSeekApplyState(theme) {
  const eligible = isDeepSeekThemeEligible(theme);
  if (!eligible) {
    return Object.freeze({
      eligible: false,
      connected: connectedThemeService !== null,
      enabled: false,
      hint: 'DeepSeek requires both dark and light palettes.',
    });
  }
  const connected = connectedThemeService !== null;
  const applied = activeThemeDisposer !== null && activeThemeId === getThemeId(theme);
  return Object.freeze({
    eligible: true,
    connected,
    enabled: connected,
    applied,
    hint: applied
      ? 'Remove the active DexThemes override and restore the previous Harness palette.'
      : connected
      ? 'Applies immediately in the connected DeepSeek Harness UI.'
      : 'Requires the DexThemes Cordis integration in the running Harness UI.',
  });
}

export function applyThemeToDeepSeek(theme, { accent } = {}) {
  if (!connectedThemeService) {
    throw new Error('DeepSeek Harness is not connected through the DexThemes Cordis integration');
  }
  const tokens = buildDeepSeekThemeTokens(theme, { accent });
  const nextDisposer = connectedThemeService.overrideTokens(DEEPSEEK_THEME_SOURCE, tokens);
  if (typeof nextDisposer !== 'function') {
    throw new TypeError('DeepSeek Harness theme.overrideTokens must return a disposer');
  }
  activeThemeDisposer?.();
  activeThemeDisposer = nextDisposer;
  activeThemeId = getThemeId(theme);
  return Object.freeze({ applied: true, themeId: theme.id || theme.themeId, tokens });
}

export function resetDeepSeekTheme() {
  const removed = activeThemeDisposer !== null;
  activeThemeDisposer?.();
  activeThemeDisposer = null;
  activeThemeId = null;
  return removed;
}

export async function handleDeepSeekApplyClick({
  theme,
  accent,
  button,
  onApplied = () => {},
  onError = () => {},
} = {}) {
  const originalLabel = button?.textContent;
  if (button) button.disabled = true;
  try {
    const result = applyThemeToDeepSeek(theme, { accent });
    if (button) {
      button.textContent = 'Applied to DeepSeek';
      button.dataset.applyState = 'applied';
    }
    await onApplied(result);
    return result;
  } catch (error) {
    if (button) button.dataset.applyState = 'error';
    await onError(error);
    throw error;
  } finally {
    if (button) {
      button.disabled = !getDeepSeekApplyState(theme).enabled;
      if (button.dataset.applyState !== 'applied' && originalLabel !== undefined) {
        button.textContent = originalLabel;
      }
    }
  }
}
