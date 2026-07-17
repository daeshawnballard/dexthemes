// ================================================
// DexThemes — Preview Actions (lazy interaction flows)
// ================================================

import * as state from './state.js';
import { getUnlockActionForThemeId, isThemeLockedForUser } from './unlocks.js';
import { escapeHtml, fallbackCopy } from './utils.js';
import { getVariants, hasVariant, applyShellTheme, applyPreview } from './theme-engine.js';
import { renderSidebar } from './sidebar.js';
import { showToast, createSupporterClaim } from './api.js';
import {
  copySupporterClaimToken,
  showSupporterClaimModal,
} from './locked-themes.js';
import { syncAttributionOverlay, reportThemeName } from './preview-attribution.js';
import { initPreviewChat, showInlineSignInPrompt } from './preview-chat.js';
import { activateModalFocusTrap, deactivateModalFocusTrap } from './modal-a11y.js';
import { loadAuthModule, loadBuilderModule, loadLeaderboardModule, loadMobileModule, loadPreviewShellModule } from './lazy-modules.js';
import { renderRightPanel } from './preview-shell.js';
import { grantUnlockAction } from './unlock-api.js';
import { trackEvent } from './analytics-client.js';
import { clearDeferredInstallPrompt, getDeferredInstallPrompt } from './install-prompt.js';
import { authFetch } from './session-auth.js';

export { syncAttributionOverlay, reportThemeName, initPreviewChat };

function isCompactViewport() {
  return window.innerWidth <= 1024;
}

function track(name, metadata) {
  void trackEvent(name, null, metadata);
}

async function maybeSetMobileView(view) {
  if (!isCompactViewport()) return;
  const { mobileSetView } = await loadMobileModule();
  await mobileSetView(view);
}

async function signInWithGithub() {
  const auth = await loadAuthModule();
  return auth.signInWith('github');
}

function maybeAdvanceMobilePreview() {
  if (!isCompactViewport()) return;
  void loadMobileModule().then(({ mobileOnThemeSelect }) => mobileOnThemeSelect());
}

async function hideLeaderboardIfVisible() {
  if (!state.leaderboardVisible) return;
  const { hideLeaderboard } = await loadLeaderboardModule();
  hideLeaderboard();
}

export function hideProfileView() {
  const win = document.getElementById('preview-window');
  const pv = document.getElementById('profile-view');
  if (!win || !pv) return;
  state.setProfileVisible(false);
  pv.style.display = 'none';
  win.style.display = '';
}

export async function selectThemeById(id) {
  const theme = state.THEMES.find((candidate) => candidate.id === id);
  if (!theme) return;

  const unlockAction = getUnlockActionForThemeId(id);
  if (unlockAction && isThemeLockedForUser(id, state.userUnlocks)) {
    state.setSelectedTheme(theme);
    state.setSelectedAccentIdx(0);

    if (state.panelMode === 'builder') {
      state.setPanelMode('preview');
      const submitBtn = document.getElementById('submit-btn');
      const textEl = document.getElementById('submit-btn-text');
      const iconEl = submitBtn?.querySelector('svg');
      if (textEl) textEl.textContent = 'Create a theme';
      if (iconEl) iconEl.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
    }

    const variants = getVariants(theme);
    if (!hasVariant(theme, state.selectedVariant)) {
      state.setSelectedVariant(variants[0]);
    }

    await hideLeaderboardIfVisible();
    if (state.profileVisible) hideProfileView();

    const win = document.getElementById('preview-window');
    if (win && win.style.display === 'none') {
      win.style.display = '';
      win.style.transform = '';
      win.style.opacity = '';
      state.setWindowState('normal');
      document.getElementById('closed-overlay')?.remove();
    }

    renderSidebar();
    maybeAdvanceMobilePreview();
    const { showLockedThemeShell } = await import('./preview-chat.js');
    showLockedThemeShell(theme, unlockAction);
    track('locked_theme_selected', {
      theme_id: theme.id,
      theme_name: theme.name,
      unlock_action: unlockAction,
    });
    return;
  }

  state.setSelectedTheme(theme);
  state.setSelectedAccentIdx(0);

  if (state.panelMode === 'builder') {
    state.setPanelMode('preview');
    const submitBtn = document.getElementById('submit-btn');
    const textEl = document.getElementById('submit-btn-text');
    const iconEl = submitBtn?.querySelector('svg');
    if (textEl) textEl.textContent = 'Create a theme';
    if (iconEl) iconEl.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
  }

  state.setCurrentExampleIdx((state.currentExampleIdx + 1) % state.EXAMPLES.length);

  const variants = getVariants(theme);
  if (!hasVariant(theme, state.selectedVariant)) {
    state.setSelectedVariant(variants[0]);
  }

  await hideLeaderboardIfVisible();
  if (state.profileVisible) hideProfileView();

  const win = document.getElementById('preview-window');
  if (win && win.style.display === 'none') {
    win.style.display = '';
    win.style.transform = '';
    win.style.opacity = '';
    state.setWindowState('normal');
    document.getElementById('closed-overlay')?.remove();
  }

  applyShellTheme(state.selectedTheme, state.selectedVariant);
  applyPreview(state.selectedTheme, state.selectedVariant);
  renderRightPanel();
  renderSidebar();
  maybeAdvanceMobilePreview();
  syncAttributionOverlay(theme);
  grantUnlockAction('preview_theme');

  track('theme_selected', {
    theme_id: theme.id,
    theme_name: theme.name,
    category: theme.category,
    variant: state.selectedVariant,
  });
}

export function onSupporterDonate() {
  setTimeout(() => {
    const modal = document.getElementById('supporter-modal');
    if (!modal) return;
    const inner = modal.querySelector('.supporter-modal');
    if (!inner) return;

    inner.innerHTML = `
      <div class="sr-only" id="supporter-thanks-title">Supporter unlocked</div>
      <button class="supporter-modal-close" data-action="dismiss-supporter-prompt" aria-label="Close supporter modal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="supporter-modal-icon supporter-modal-icon--thanks">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      </div>
      <div class="supporter-modal-title">Thank You!</div>
      <div class="supporter-modal-text">Your support means the world. You've unlocked Patron.</div>
      <div class="supporter-modal-unlocked">
        <div class="supporter-unlocked-item"><span class="supporter-unlocked-swatch" style="background:#D4A54A"></span>Patron</div>
      </div>
      <button class="supporter-modal-dismiss" data-action="dismiss-supporter-prompt" style="margin-top:8px;">Close</button>
    `;
    inner.setAttribute('role', 'dialog');
    inner.setAttribute('aria-modal', 'true');
    inner.setAttribute('aria-labelledby', 'supporter-thanks-title');
    inner.setAttribute('tabindex', '-1');
    activateModalFocusTrap(modal, { dialogSelector: '.supporter-modal', onClose: () => modal.remove() });
  }, 500);
}

export async function runSupporterUnlockFlow(actionKey = 'buy_coffee') {
  track('supporter_prompt_opened', { action: actionKey });
  if (!state.currentUser) {
    showInlineSignInPrompt('supporter', 'Connect an account first to generate your supporter claim code.');
    return;
  }

  try {
    const publicListing = window.confirm(
      'Optional: list your public GitHub name, username, avatar, and supporter-unlock date on the DexThemes supporter wall? Choose Cancel to stay private; Patron still unlocks either way.',
    );
    const claim = await createSupporterClaim({ publicListing });
    if (claim.alreadySupporter) {
      localStorage.removeItem('dexthemes-pending-unlock-action');
      track('supporter_claim_started', { action: actionKey, already_supporter: true });
      showSupporterClaimModal({
        alreadySupporter: true,
        publicListing: claim.publicListing === true,
      });
      return;
    }

    localStorage.setItem('dexthemes-pending-unlock-action', actionKey);
    track('supporter_claim_started', { action: actionKey, already_supporter: false });
    const copied = claim.token ? await copySupporterClaimToken(claim.token) : false;
    showSupporterClaimModal({
      token: claim.token,
      donateUrl: claim.donateUrl || state.UNLOCK_THEMES[actionKey]?.link || 'https://buymeacoffee.com/daeshawn',
      expiresAt: claim.expiresAt,
      copied,
      alreadySupporter: false,
      publicListing: claim.publicListing === true,
      onCopy: async (token) => {
        const copiedNow = await copySupporterClaimToken(token);
        showToast(copiedNow ? 'Claim code copied' : "Couldn't copy the claim code automatically", copiedNow ? 'success' : 'error');
      },
    });
  } catch (error) {
    console.warn('Supporter claim flow failed:', error);
    showToast("Couldn't prepare your supporter code right now", 'error');
  }
}

async function openBuilderForUnlock() {
  await maybeSetMobileView('create');
  if (state.panelMode !== 'builder') {
    document.getElementById('submit-btn')?.click();
  }
}

export async function runApiUnlockFlow(actionKey) {
  const unlock = state.UNLOCK_THEMES[actionKey];
  if (!unlock) return;

  if (!state.currentUser) {
    await signInWithGithub();
    return;
  }

  try {
    const res = await authFetch(state.CONVEX_SITE_URL + '/me/api-demo', {
      method: 'POST',
    });
    if (!res.ok) {
      showToast("Couldn't reach the API right now", 'error');
      return;
    }

    const { fetchMyUnlocks } = await import('./unlock-api.js');
    await fetchMyUnlocks();
    showToast(`API call complete. ${unlock.name} unlocked.`, 'success');
  } catch (error) {
    console.warn('API unlock flow failed:', error);
    showToast("Couldn't reach the API right now", 'error');
  }
}

async function copyAgentApiKey(apiKey) {
  if (!apiKey) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(apiKey);
      return true;
    }
  } catch {}

  let copied = false;
  fallbackCopy(apiKey, () => {
    copied = true;
  });
  return copied;
}

function dismissAgentKeyModal() {
  const overlay = document.querySelector('.agent-key-modal-overlay');
  if (!overlay) return;
  deactivateModalFocusTrap(overlay);
  overlay.remove();
}

function showAgentKeyModal({ apiKey, docs, copied }) {
  dismissAgentKeyModal();

  const overlay = document.createElement('div');
  overlay.className = 'supporter-modal-overlay agent-key-modal-overlay';
  overlay.onclick = (event) => {
    if (event.target === overlay) dismissAgentKeyModal();
  };

  overlay.innerHTML = `
    <div class="supporter-modal agent-key-modal">
      <div class="sr-only" id="agent-key-modal-title">Agent key details</div>
      <button class="supporter-modal-close" aria-label="Close agent key modal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="supporter-modal-title">Agent Claw Unlocked</div>
      <div class="supporter-modal-text">Your agent API key is shown once here. Copy it now and use it as a Bearer token with the DexThemes API.</div>
      <code class="agent-key-modal-code">${escapeHtml(apiKey)}</code>
      <div class="agent-key-modal-note">${copied ? 'Copied to clipboard already.' : 'Clipboard copy was unavailable, so copy it manually from this dialog.'}</div>
      <div class="agent-key-modal-actions">
        <button class="supporter-modal-cta agent-key-copy-btn">Copy key</button>
        <a class="supporter-modal-dismiss agent-key-docs-link" href="${escapeHtml(docs)}" target="_blank" rel="noopener noreferrer">Open docs</a>
      </div>
      <button class="supporter-modal-dismiss agent-key-close-btn">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);
  const dialog = overlay.querySelector('.agent-key-modal');
  if (dialog) {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'agent-key-modal-title');
    dialog.setAttribute('tabindex', '-1');
  }

  overlay.querySelector('.supporter-modal-close')?.addEventListener('click', dismissAgentKeyModal);
  overlay.querySelector('.agent-key-close-btn')?.addEventListener('click', dismissAgentKeyModal);
  overlay.querySelector('.agent-key-copy-btn')?.addEventListener('click', async () => {
    const copiedNow = await copyAgentApiKey(apiKey);
    showToast(copiedNow ? 'Agent key copied' : "Couldn't copy the agent key automatically", copiedNow ? 'success' : 'error');
  });
  activateModalFocusTrap(overlay, { dialogSelector: '.agent-key-modal', onClose: dismissAgentKeyModal });
}

export async function runAgentUnlockFlow(actionKey) {
  const unlock = state.UNLOCK_THEMES[actionKey];
  if (!unlock) return;

  if (!state.currentUser) {
    await signInWithGithub();
    return;
  }

  try {
    localStorage.removeItem('dexthemes-agent-api-key');
    localStorage.removeItem('dexthemes-agent-docs');

    const res = await authFetch(state.CONVEX_SITE_URL + '/auth/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.apiKey) {
      showToast(data.error || "Couldn't register an AI agent right now", 'error');
      return;
    }

    const copied = await copyAgentApiKey(data.apiKey);
    const { fetchMyUnlocks } = await import('./unlock-api.js');
    await fetchMyUnlocks();
    track('agent_registered', { agent_id: data.agentId });
    showAgentKeyModal({
      apiKey: data.apiKey,
      docs: data.docs || 'https://dexthemes.com/llms.txt',
      copied,
    });
  } catch (error) {
    console.warn('Agent unlock flow failed:', error);
    showToast("Couldn't register an AI agent right now", 'error');
  }
}

export function runCreateUnlockFlow() {
  void openBuilderForUnlock();
}

export function runLuckyUnlockFlow() {
  void openBuilderForUnlock();
  setTimeout(() => {
    void loadBuilderModule().then((m) => m.colorMeLucky());
  }, 0);
}

export async function runCompletePairUnlockFlow() {
  if (!state.currentUser) {
    await signInWithGithub();
    return;
  }

  const selectedTheme = state.selectedTheme;
  const target = (
    selectedTheme?.category === 'community' &&
    selectedTheme._authorId === state.currentUser._id &&
    (!!selectedTheme.dark !== !!selectedTheme.light)
  )
    ? selectedTheme
    : state.THEMES.find((theme) =>
        theme.category === 'community' &&
        theme._authorId === state.currentUser._id &&
        (!!theme.dark !== !!theme.light)
      );

  if (!target) {
    await openBuilderForUnlock();
    showToast('Publish one variant first, then add the missing dark or light variant to unlock Yin & Yang', 'success');
    return;
  }

  const missingVariant = target.dark ? 'light' : 'dark';
  await maybeSetMobileView('create');
  const builder = await loadBuilderModule();
  builder.openBuilderForVariant(target.id, missingVariant);
}

export function runShareUnlockFlow() {
  void loadPreviewShellModule().then((m) => m.shareOnX());
}

export function runSignInUnlockFlow() {
  void signInWithGithub();
}

export async function runLikeUnlockFlow() {
  const candidate = state.THEMES.find((theme) => !state.THEME_ID_TO_ACTION[theme.id]);
  if (!candidate) {
    showToast("Couldn't find a theme to like right now", 'error');
    return;
  }

  await selectThemeById(candidate.id);
  showToast('Tap the heart on this theme to unlock Heartbeat', 'success');
}

export async function runLeaderboardUnlockFlow() {
  await maybeSetMobileView('preview');
  if (!state.leaderboardVisible) {
    const { toggleLeaderboard } = await loadLeaderboardModule();
    toggleLeaderboard();
  }
}

export async function runInstallUnlockFlow(actionKey) {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    if (!state.currentUser) {
      await signInWithGithub();
      return;
    }
    await grantUnlockAction(actionKey);
    return;
  }

  const deferredPrompt = getDeferredInstallPrompt();
  if (deferredPrompt?.prompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === 'accepted') {
      track('pwa_install_prompt_accepted', { source: 'browser_prompt' });
      clearDeferredInstallPrompt();
      if (state.currentUser) {
        await grantUnlockAction(actionKey);
      } else {
        showToast('Homebase will finish unlocking after you sign in from the installed app', 'success');
      }
      return;
    }
  }

  const isIos = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
  if (isIos && isSafari) {
    showToast('Add DexThemes to Home Screen, open it from the new icon, then tap again to unlock Homebase', 'success');
    return;
  }

  showToast('Use your browser menu and choose Add to Home Screen to unlock Homebase', 'success');
}
