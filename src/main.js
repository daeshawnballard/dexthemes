// ================================================
// DexThemes — Entry Point
// ================================================
// Boundary note:
// - main.js owns boot order, lazy wiring, and viewport branching
// - feature logic should live in the feature module, not inline here
// - when adding new globals, prefer delegated actions or lazy module calls over growing window.*

import * as state from './state.js';
import { renderSidebar, renderFilterDropdown, renderSortDropdown, initDropdownClose,
         closeDropdowns } from './sidebar.js';
import { applyShellTheme, applyPreview } from './theme-engine.js';
import {
  loadApiModule,
  loadAuthModule,
  loadBuilderModule,
  loadMobileModule,
  loadPreviewShellModule,
} from './lazy-modules.js';
import { initDelegatedActions } from './delegated-actions.js';
import { grantUnlockAction } from './unlock-api.js';
import { initStatsig } from './analytics-client.js';
import { trackEvent } from './analytics-client.js';
import { clearDeferredInstallPrompt, setDeferredInstallPrompt } from './install-prompt.js';
import { syncPlatformContext } from './platform-context.js';

function isCompactViewport() {
  return window.innerWidth <= 1024;
}

function scheduleIdleTask(task, { timeout = 1500, fallbackMs = 250 } = {}) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { void task(); }, { timeout });
  } else {
    setTimeout(() => { void task(); }, fallbackMs);
  }
}

let mobileModuleInitialized = false;
let previewChatInitialized = false;

async function ensureMobileModule() {
  const mobile = await loadMobileModule();
  if (!mobileModuleInitialized) {
    mobile.initMobileResize();
    mobileModuleInitialized = true;
  }
  if (isCompactViewport()) {
    mobile.initMobile();
  }
  return mobile;
}

async function ensurePreviewChatInitialized() {
  if (previewChatInitialized) return;
  const { initPreviewChat } = await import('./preview-chat.js');
  initPreviewChat();
  previewChatInitialized = true;
}

function primePreviewChatOnInteraction() {
  const input = document.getElementById('preview-input-text');
  const sendBtn = document.getElementById('preview-send-btn');
  const prime = () => { void ensurePreviewChatInitialized(); };
  input?.addEventListener('focus', prime, { once: true });
  input?.addEventListener('pointerdown', prime, { once: true });
  input?.addEventListener('keydown', prime, { once: true });
  sendBtn?.addEventListener('pointerdown', prime, { once: true });
}

async function initDesktopPreviewShell() {
  if (isCompactViewport()) return;
  const preview = await loadPreviewShellModule();
  applyPreview(state.selectedTheme, state.selectedVariant);
  preview.renderRightPanel();
  preview.initWindowDots();
  primePreviewChatOnInteraction();
  const attribution = await import('./preview-attribution.js');
  attribution.syncAttributionOverlay();
  const chat = await import('./preview-chat.js');
  await preview.checkOnboarding();
  chat.maybeShowWelcomeMessage();
}

// ================================================
// Expose minimal globals for browser integrations
// ================================================

function syncInstalledState() {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    localStorage.setItem('dexthemes-pwa-installed', '1');
    if (state.currentUser) grantUnlockAction('install_pwa');
  }
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  setDeferredInstallPrompt(event);
  void trackEvent('pwa_install_prompt_shown', null, { source: 'browser_prompt' });
});

window.addEventListener('appinstalled', () => {
  clearDeferredInstallPrompt();
  localStorage.setItem('dexthemes-pwa-installed', '1');
  void trackEvent('pwa_installed', null, { source: 'appinstalled' });
  grantUnlockAction('install_pwa');
});

if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
syncInstalledState();

// ================================================
// Init
// ================================================
state.expandedCategories['dexthemes'] = true;
state.expandedCategories[state.selectedTheme.category] = true;

initDelegatedActions();
renderFilterDropdown();
renderSortDropdown();
applyShellTheme(state.selectedTheme, state.selectedVariant);
syncPlatformContext();
initDropdownClose();
primePreviewChatOnInteraction();

if (!isCompactViewport()) {
  renderSidebar();
  void initDesktopPreviewShell();
}

scheduleIdleTask(async () => {
  await initStatsig();
}, { timeout: 1200, fallbackMs: 150 });

requestAnimationFrame(() => {
  void loadAuthModule().then((auth) => auth.initAuth());
});

function scheduleCommunityThemeLoad() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const deferMs = connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType || '')
    ? 1200
    : 50;

  let scheduled = false;
  const run = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      loadApiModule().then((m) => m.loadCommunityThemes());
    }, deferMs);
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
}

scheduleCommunityThemeLoad();

async function initCompactViewport() {
  if (!isCompactViewport()) return;
  const mobile = await ensureMobileModule();
  await mobile.mobileSetView(state.isDeepLink ? 'preview' : 'browse');
}

void initCompactViewport();

const maybeBootMobileOnResize = () => {
  if (!mobileModuleInitialized && isCompactViewport()) {
    void initCompactViewport();
  }
};

window.addEventListener('resize', maybeBootMobileOnResize, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(maybeBootMobileOnResize, 100);
});
