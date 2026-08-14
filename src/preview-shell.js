// ================================================
// DexThemes — Preview Shell (startup-visible preview UI)
// ================================================

import * as state from './state.js';
import { escapeHtml, fallbackCopy } from './utils.js';
import { getVariants, hasVariant, applyShellTheme, applyPreview, renderMiniPreview, buildImportString } from './theme-engine.js';
import { renderSidebar } from './sidebar.js';
import {
  getApplyButtonCopy,
  openCodexSettings,
  showApplyHandoffMessage,
  showManualCopyDialog,
} from './codex-handoff.js';
import { syncAttributionOverlay } from './preview-attribution.js';
import { loadBuilderModule } from './lazy-modules.js';
import { fetchMyUnlocks, grantUnlockAction, recordSecretInteraction } from './unlock-api.js';
import { trackEvent } from './analytics-client.js';
import { authFetch } from './session-auth.js';
import { getWebsiteThemeId } from '../shared/plugin-public-policy.js';
import { PLATFORM_APPLY_MODES } from '../shared/platform-registry.js';
import {
  buildContextualThemePath,
  getWebsitePlatformAction,
} from './platform-context.js';
import {
  getDeepSeekApplyState,
  handleDeepSeekApplyClick,
  resetDeepSeekTheme,
} from './deepseek-handoff.js';
import {
  DEEPSEEK_ANALYTICS_EVENTS,
  classifyDeepSeekApplyFailure,
  trackDeepSeekEvent,
} from './deepseek-analytics.js';
import { getThemeAccentOptions } from './theme-contracts.js';

function isCompactViewport() {
  return window.innerWidth <= 1024;
}

function track(name, metadata) {
  void trackEvent(name, null, metadata);
}

function recordThemeCopy(themeId) {
  if (!themeId) return;
  void authFetch(state.CONVEX_SITE_URL + '/themes/copy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId }),
  }).catch(() => {});
}

function renderWebsitePlatformAction(compact) {
  const action = getWebsitePlatformAction();
  if (!action) return '';
  const label = escapeHtml(action.ctaLabel);
  const helper = escapeHtml(action.helperText);

  if (action.mode === PLATFORM_APPLY_MODES.COPY_IMPORT) {
    return `
      <button class="apply-codex-btn" id="apply-codex-btn" data-action="apply-codex" aria-describedby="import-hint">
        <svg class="apply-icon-bolt" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <svg class="apply-icon-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span class="theme-copy-label" id="apply-btn-text" aria-live="polite">${label}</span>
      </button>
      <div class="import-hint" id="import-hint">${helper}</div>
    `;
  }

  if (action.mode === PLATFORM_APPLY_MODES.SETUP && action.destination?.kind === 'url') {
    return `
      <a
        class="apply-codex-btn platform-setup-btn"
        href="${escapeHtml(action.destination.value)}"
        target="_blank"
        rel="noopener noreferrer"
        data-action="open-platform-setup"
        data-platform-id="${escapeHtml(state.selectedPlatformId)}"
        data-source-surface="website"
        aria-describedby="import-hint"
      >
        <svg class="apply-icon-platform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span>${label}</span>
        <span aria-hidden="true">↗</span>
      </a>
      <div class="import-hint" id="import-hint">${helper}</div>
    `;
  }

  return `
    <button class="apply-codex-btn platform-unavailable-btn" type="button" disabled aria-describedby="import-hint">
      <svg class="apply-icon-platform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      <span>${label}</span>
    </button>
    <div class="import-hint" id="import-hint">${helper}</div>
  `;
}

async function showInlineSignInPrompt(type, message) {
  const chat = await import('./preview-chat.js');
  chat.showInlineSignInPrompt(type, message);
}

async function showSystemMessage(message, className) {
  const chat = await import('./preview-chat.js');
  chat.showSystemMessage(message, className);
}

export function renderAccentDots() {
  const theme = state.selectedTheme;
  if (!theme) return;
  const accents = getThemeAccentOptions(theme, state.selectedVariant);
  const populate = (container) => {
    if (!container) return;
    const dots = accents.flatMap((accent, idx) => {
      if (!/^#[0-9A-Fa-f]{6}$/.test(accent)) return [];
      const dot = document.createElement('div');
      dot.className = `accent-dot${idx === state.selectedAccentIdx ? ' selected' : ''}`;
      dot.style.backgroundColor = accent;
      dot.title = accent;
      dot.dataset.action = 'select-accent';
      dot.dataset.accentIdx = String(idx);
      return [dot];
    });
    container.replaceChildren(...dots);
  };
  const el = document.getElementById('accent-dots');
  populate(el);
  const mobileEl = document.getElementById('accent-dots-mobile');
  populate(mobileEl);
}

function updateVariantCards() {
  const darkCard = document.getElementById('card-dark');
  const lightCard = document.getElementById('card-light');
  if (darkCard) {
    darkCard.classList.toggle('selected', state.selectedVariant === 'dark');
    darkCard.setAttribute('aria-pressed', state.selectedVariant === 'dark' ? 'true' : 'false');
  }
  if (lightCard) {
    lightCard.classList.toggle('selected', state.selectedVariant === 'light');
    lightCard.setAttribute('aria-pressed', state.selectedVariant === 'light' ? 'true' : 'false');
  }
  if (hasVariant(state.selectedTheme, 'dark')) renderMiniPreview('mini-dark', state.selectedTheme, 'dark');
  if (hasVariant(state.selectedTheme, 'light')) renderMiniPreview('mini-light', state.selectedTheme, 'light');
  renderAccentDots();
}

export function selectAccent(idx) {
  state.setSelectedAccentIdx(idx);
  applyShellTheme(state.selectedTheme, state.selectedVariant);
  applyPreview(state.selectedTheme, state.selectedVariant);
  syncAttributionOverlay();
  renderRightPanel();
  void import('./theme-details.js').then((m) => m.syncThemeDetailsView());
}

export function selectVariant(variant) {
  if (!hasVariant(state.selectedTheme, variant)) return;
  state.setSelectedVariant(variant);
  applyShellTheme(state.selectedTheme, state.selectedVariant);
  applyPreview(state.selectedTheme, state.selectedVariant);
  syncAttributionOverlay();
  updateVariantCards();
  void import('./theme-details.js').then((m) => m.syncThemeDetailsView());
  track('variant_selected', {
    theme_id: state.selectedTheme.id,
    variant,
  });
}

async function requestVariantForTheme(themeId, card, missingLabel, currentRequests) {
  if (!state.currentUser) {
    await showInlineSignInPrompt('like', 'Request this variant with your account.');
    return;
  }

  try {
    const res = await authFetch(state.CONVEX_SITE_URL + '/themes/request-variant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ themeId }),
    }, {
      preferApiKey: true,
    });
    if (!res.ok) return;

    const data = await res.json();
    const newCount = data.requests || (currentRequests + 1);
    const requested = JSON.parse(localStorage.getItem('dex-variant-requests') || '[]');
    requested.push(themeId);
    localStorage.setItem('dex-variant-requests', JSON.stringify(requested));

    const body = card.querySelector('.variant-missing-body');
    if (body) {
      body.innerHTML = `<span class="variant-missing-text">Requested ✓</span>${newCount > 1 ? `<span class="variant-missing-requests">${newCount} others want this too</span>` : ''}`;
    }
    card.onclick = null;

    const othersText = newCount > 1 ? ` ${newCount - 1} ${newCount - 1 === 1 ? 'other person wants' : 'others want'} this too.` : '';
    track('missing_variant_requested', {
      theme_id: themeId,
      theme_name: state.selectedTheme?.name,
      variant: missingLabel.toLowerCase(),
      request_count: newCount,
    });
    await showSystemMessage(`${missingLabel} variant requested.${othersText} We'll let the creator know!`, 'variant-request-msg');
  } catch (error) {
    console.warn('Failed to request variant:', error);
  }
}

export async function requestMissingVariant(themeId, missingLabel, currentRequests, card) {
  if (!card) return;
  await requestVariantForTheme(themeId, card, missingLabel, currentRequests);
}

export function openMissingVariantBuilder(themeId, missingVariant) {
  void loadBuilderModule().then((m) => m.openBuilderForVariant(themeId, missingVariant));
}

function renderMissingVariantCard() {
  const theme = state.selectedTheme;
  if (!theme || theme.category !== 'community') return;
  const hasDark = hasVariant(theme, 'dark');
  const hasLight = hasVariant(theme, 'light');
  if (hasDark && hasLight) return;

  const missingVariant = hasDark ? 'light' : 'dark';
  const missingLabel = missingVariant === 'dark' ? 'Dark' : 'Light';
  const missingIcon = missingVariant === 'dark'
    ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  const isAuthor = state.currentUser && theme._authorId === state.currentUser._id;
  const requests = theme._variantRequests || 0;
  const container = document.querySelector('.variant-cards');
  if (!container) return;

  const card = document.createElement('div');
  card.className = 'variant-card variant-card-missing';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Missing ${missingLabel} variant for ${theme.name}`);

  if (isAuthor) {
    const ctaText = requests > 0
      ? `${requests} ${requests === 1 ? 'person wants' : 'people want'} this`
      : 'Complete the set';
    const subText = requests > 0
      ? `Add ${missingLabel} Variant →`
      : `Add ${missingLabel} · Unlock Yin & Yang ☯️`;
    card.innerHTML = `
      <div class="variant-card-label">${missingIcon} + ${missingLabel}</div>
      <div class="variant-missing-body">
        <span class="variant-missing-text">${ctaText}</span>
        <span class="variant-missing-hint">${subText}</span>
      </div>
    `;
    card.dataset.action = 'add-missing-variant';
    card.dataset.actionKeyboard = 'true';
    card.dataset.themeId = theme.id;
    card.dataset.variant = missingVariant;
  } else {
    const requested = JSON.parse(localStorage.getItem('dex-variant-requests') || '[]');
    const alreadyRequested = requested.includes(theme.id);
    card.innerHTML = `
      <div class="variant-card-label">${missingIcon} ${missingLabel}</div>
      <div class="variant-missing-body">
        ${alreadyRequested
          ? `<span class="variant-missing-text">Requested ✓</span>${requests > 1 ? `<span class="variant-missing-requests">${requests} others want this too</span>` : ''}`
          : `<span class="variant-missing-text">Request ${missingLabel} Variant</span>${requests > 0 ? `<span class="variant-missing-requests">${requests} ${requests === 1 ? 'request' : 'requests'}</span>` : ''}`}
      </div>
    `;
    if (!alreadyRequested) {
      card.dataset.action = 'request-missing-variant';
      card.dataset.actionKeyboard = 'true';
      card.dataset.themeId = theme.id;
      card.dataset.missingLabel = missingLabel;
      card.dataset.requestCount = String(requests);
    } else {
      card.setAttribute('tabindex', '-1');
      card.removeAttribute('role');
    }
  }

  container.appendChild(card);
}

export function renderRightPanel() {
  if (state.panelMode === 'builder') {
    void loadBuilderModule().then(({ renderBuilderPanel }) => renderBuilderPanel());
    return;
  }

  const panel = document.querySelector('.panel');
  if (!panel) return;

  const compact = isCompactViewport();
  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">Variants</div>
      <div class="panel-header-actions">
        <div class="accent-dots mobile-accent-dots" id="accent-dots-mobile"></div>
      </div>
    </div>
    <div class="variant-cards">
      <div class="variant-card selected" id="card-dark" role="button" tabindex="0" aria-pressed="true" data-action="select-variant" data-action-keyboard="true" data-variant="dark">
        <div class="variant-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          Dark
          <span class="selection-indicator">Selected</span>
        </div>
        <div class="mini-preview" id="mini-dark"></div>
      </div>
      <div class="variant-card" id="card-light" role="button" tabindex="0" aria-pressed="false" data-action="select-variant" data-action-keyboard="true" data-variant="light">
        <div class="variant-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          Light
          <span class="selection-indicator">Selected</span>
        </div>
        <div class="mini-preview" id="mini-light"></div>
      </div>
    </div>
    <div class="panel-actions">
      <div class="detail-row">
        <span class="detail-label">Accent color</span>
      </div>
      <div class="accent-dots" id="accent-dots"></div>
      ${renderWebsitePlatformAction(compact)}
    </div>
  `;

  const variants = getVariants(state.selectedTheme);
  const darkCard = document.getElementById('card-dark');
  const lightCard = document.getElementById('card-light');
  if (darkCard) darkCard.style.display = hasVariant(state.selectedTheme, 'dark') ? '' : 'none';
  if (lightCard) lightCard.style.display = hasVariant(state.selectedTheme, 'light') ? '' : 'none';

  if (!hasVariant(state.selectedTheme, state.selectedVariant)) {
    state.setSelectedVariant(variants[0]);
    applyShellTheme(state.selectedTheme, state.selectedVariant);
    applyPreview(state.selectedTheme, state.selectedVariant);
  }

  if (hasVariant(state.selectedTheme, 'dark')) renderMiniPreview('mini-dark', state.selectedTheme, 'dark');
  if (hasVariant(state.selectedTheme, 'light')) renderMiniPreview('mini-light', state.selectedTheme, 'light');
  renderMissingVariantCard();
  updateVariantCards();

  const variantHint = document.getElementById('variant-hint');
  if (variantHint) variantHint.textContent = `${state.selectedVariant} variant`;

  if (compact) {
    const mainHeader = document.querySelector('.main-header');
    let headerActions = mainHeader?.querySelector('.header-social-actions');
    if (mainHeader && !headerActions) {
      headerActions = document.createElement('div');
      headerActions.className = 'header-social-actions';
      headerActions.innerHTML = `
        <button class="panel-icon-btn like-btn" id="like-btn" data-action="like-theme" aria-label="Like theme" title="Like theme">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      `;
      mainHeader.appendChild(headerActions);
    }
  }

  const liked = JSON.parse(localStorage.getItem('dex-liked') || '[]');
  const likeBtn = document.getElementById('like-btn');
  if (likeBtn) likeBtn.classList.toggle('liked', liked.includes(state.selectedTheme.id));
}

export function applyToCodex() {
  const importString = buildImportString(state.selectedTheme, state.selectedVariant, state.selectedAccentIdx);
  if (!importString) return;

  const buttons = [...document.querySelectorAll('[data-action="apply-codex"]')];
  const hint = document.getElementById('import-hint');
  const compact = isCompactViewport();
  const applyCopy = getApplyButtonCopy(compact);
  const defaultLabel = getWebsitePlatformAction('codex')?.ctaLabel || applyCopy.defaultLabel;
  const setButtonState = (label, copied) => {
    buttons.forEach((button) => {
      const textEl = button.querySelector('.theme-copy-label');
      if (textEl) textEl.textContent = label;
      button.classList.toggle('copied', copied);
    });
  };

  const afterCopy = () => {
    recordThemeCopy(state.selectedTheme.id);
    track('theme_copied', {
      theme_id: state.selectedTheme.id,
      theme_name: state.selectedTheme.name,
      variant: state.selectedVariant,
      source: 'preview',
      mobile: compact,
      landing_source: state.landingContext.source,
      referral_channel: state.landingContext.referralChannel,
    });
    setButtonState(applyCopy.successLabel, true);
    if (hint) hint.textContent = applyCopy.successHintText;
    if (!compact) {
      setTimeout(openCodexSettings, 300);
    }
    showApplyHandoffMessage({ themeName: state.selectedTheme.name, variant: state.selectedVariant });
    setTimeout(() => {
      setButtonState(defaultLabel, false);
      if (hint) hint.textContent = applyCopy.hintText;
    }, 2000);
  };

  const onCopyFailure = () => {
    setButtonState(applyCopy.failureLabel, false);
    if (hint) hint.textContent = applyCopy.failureHintText;
    buttons[0]?.focus();
    showManualCopyDialog(importString);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(importString)
      .then(afterCopy)
      .catch(() => fallbackCopy(importString, afterCopy, onCopyFailure));
  } else {
    fallbackCopy(importString, afterCopy, onCopyFailure);
  }
}

export async function applyToDeepSeek(button = document.getElementById('apply-deepseek-btn')) {
  const accent = state.selectedTheme?.accents?.[state.selectedAccentIdx];
  const analytics = {
    sourceSurface: state.themeView === 'details' ? 'website_theme_details' : 'website_preview',
    themeId: state.selectedTheme?.id,
    variant: state.selectedVariant,
  };
  void trackDeepSeekEvent(DEEPSEEK_ANALYTICS_EVENTS.APPLY_STARTED, analytics);
  try {
    const result = await handleDeepSeekApplyClick({
      theme: state.selectedTheme,
      accent,
      button,
      onApplied: async () => {
        void trackDeepSeekEvent(DEEPSEEK_ANALYTICS_EVENTS.APPLY_SUCCEEDED, analytics);
        await showSystemMessage(
          `${state.selectedTheme.name} is active in DeepSeek Harness. Stop the DexThemes Cordis plugin to restore the previous palette.`,
          'success',
        );
      },
      onError: async (error) => {
        void trackDeepSeekEvent(DEEPSEEK_ANALYTICS_EVENTS.APPLY_FAILED, {
          ...analytics,
          failureCode: classifyDeepSeekApplyFailure(error),
        });
        await showSystemMessage(
          error instanceof Error ? error.message : 'DeepSeek Harness could not apply this theme.',
          'error',
        );
      },
    });
    if (button) {
      button.dataset.action = 'revert-deepseek';
      button.textContent = 'Remove from DeepSeek';
      button.dataset.applyState = 'applied';
    }
    return result;
  } catch {
    return null;
  }
}

export async function revertFromDeepSeek(button = document.getElementById('apply-deepseek-btn')) {
  const removed = resetDeepSeekTheme();
  if (!removed) return false;
  void trackDeepSeekEvent(DEEPSEEK_ANALYTICS_EVENTS.REVERTED, {
    sourceSurface: state.themeView === 'details' ? 'website_theme_details' : 'website_preview',
    themeId: state.selectedTheme?.id,
    variant: state.selectedVariant,
  });
  if (button) {
    button.dataset.action = 'apply-deepseek';
    button.textContent = 'Apply to DeepSeek';
    delete button.dataset.applyState;
  }
  await showSystemMessage(
    'The DexThemes override was removed. DeepSeek Harness restored the previous composed palette.',
    'success',
  );
  return true;
}

export function shareOnX() {
  const themeName = state.selectedTheme.name || 'a theme';
  const variant = state.selectedVariant === 'dark' ? 'dark' : 'light';
  const themeId = getWebsiteThemeId(state.selectedTheme.id || 'codex');
  const shareUrl = `${window.location.origin}${buildContextualThemePath(themeId, variant)}`;
  const text = `"${themeName}" — previewed for ${state.selectedPlatform.displayName} on DexThemes\n\n${shareUrl}`;
  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
  grantUnlockAction('share_x');
  track('theme_shared', {
    theme_id: themeId,
    theme_name: themeName,
    variant,
      surface: 'x',
      landing_source: state.landingContext.source,
      referral_channel: state.landingContext.referralChannel,
      platform_id: state.selectedPlatformId,
  });
}

export async function shareTheme(button) {
  const themeName = state.selectedTheme.name || 'DexThemes palette';
  const variant = state.selectedVariant === 'light' ? 'light' : 'dark';
  const themeId = getWebsiteThemeId(state.selectedTheme.id || 'codex');
  const shareUrl = `${window.location.origin}${buildContextualThemePath(themeId, variant)}`;
  const originalLabel = button?.textContent;

  const markCopied = () => {
    if (button) button.textContent = 'Link copied';
    void showSystemMessage(`Link copied for ${themeName}.`, 'success');
    track('theme_shared', {
      theme_id: themeId,
      theme_name: themeName,
      variant,
      surface: 'clipboard',
      landing_source: state.landingContext.source,
      referral_channel: state.landingContext.referralChannel,
      platform_id: state.selectedPlatformId,
    });
    if (button && originalLabel) {
      setTimeout(() => { button.textContent = originalLabel; }, 1800);
    }
  };

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${themeName} for ${state.selectedPlatform.displayName}`,
        text: `Preview the ${variant} ${themeName} palette for ${state.selectedPlatform.displayName} on DexThemes.`,
        url: shareUrl,
      });
      track('theme_shared', {
        theme_id: themeId,
        theme_name: themeName,
        variant,
        surface: 'native',
        landing_source: state.landingContext.source,
        referral_channel: state.landingContext.referralChannel,
        platform_id: state.selectedPlatformId,
      });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      markCopied();
      return;
    } catch {}
  }

  fallbackCopy(shareUrl, markCopied);
}

export async function likeTheme() {
  if (!state.currentUser) {
    await showInlineSignInPrompt('like', 'Like this theme with your account.');
    return;
  }

  const themeId = state.selectedTheme.id;
  const liked = JSON.parse(localStorage.getItem('dex-liked') || '[]');
  const likeBtn = document.getElementById('like-btn');
  if (!likeBtn) return;

  const res = await authFetch(state.CONVEX_SITE_URL + '/themes/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themeId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    await showSystemMessage(data.error || 'Unable to update this like right now.', 'error');
    return;
  }

  const idx = liked.indexOf(themeId);
  if (data.liked) {
    if (idx === -1) liked.push(themeId);
    likeBtn.classList.add('liked');
    await fetchMyUnlocks();
    track('theme_liked', { theme_id: themeId, theme_name: state.selectedTheme.name });
  } else {
    if (idx !== -1) liked.splice(idx, 1);
    likeBtn.classList.remove('liked');
  }
  localStorage.setItem('dex-liked', JSON.stringify(liked));
}

const EASTER_EGGS = [
  { emoji: '⚡', text: 'Codex is OpenAI\'s first desktop coding agent — it reads your repo, writes code, and runs commands autonomously.' },
  { emoji: '🖥️', text: 'Codex runs in a sandboxed cloud environment so it can safely execute code without touching your local machine.' },
  { emoji: '🎨', text: 'Codex supports fully customizable themes via import strings — which is exactly what DexThemes generates for you.' },
  { emoji: '🔗', text: 'Codex uses codex:// deep links. DexThemes uses that to open Codex Settings before you import manually.' },
  { emoji: '📂', text: 'Codex can read your entire codebase context to understand your project before writing a single line of code.' },
  { emoji: '🛡️', text: 'Codex runs each task in an isolated sandbox with no network access by default — security by design.' },
  { emoji: '🧵', text: 'Codex supports multiple concurrent tasks. You can have it refactor one file while writing tests for another.' },
  { emoji: '💻', text: 'Codex is available on macOS and Windows, with the same theme system on both platforms.' },
  { emoji: '🔄', text: 'Codex stores your theme in ~/.codex/.codex-global-state.json — DexThemes knows exactly where to look.' },
  { emoji: '🌗', text: 'Codex supports independent light and dark themes. You can mix Dracula dark with Catppuccin light.' },
  { emoji: '🤖', text: 'GPT-1 had 117 million parameters. GPT-4 is estimated to have over a trillion.' },
  { emoji: '📝', text: 'ChatGPT reached 100 million users in just two months — the fastest-growing app in history at launch.' },
  { emoji: '🔬', text: 'Codex, OpenAI\'s code model, powered GitHub Copilot before evolving into the desktop agent you\'re theming.' },
  { emoji: '🌍', text: 'OpenAI\'s mission: "Ensure artificial general intelligence benefits all of humanity."' },
  { emoji: '💬', text: 'The "T" in GPT stands for "Transformer" — the architecture that changed the entire field of AI.' },
  { emoji: '📊', text: 'GPT-2 was initially considered "too dangerous to release" — OpenAI staged its rollout over months.' },
  { emoji: '🎯', text: 'RLHF (Reinforcement Learning from Human Feedback) is the technique that made ChatGPT conversational.' },
  { emoji: '🔢', text: 'A "token" in AI roughly equals ¾ of a word. The average Codex task uses thousands of them.' },
  { emoji: '🎮', text: 'OpenAI Five defeated the world champion Dota 2 team OG in 2019 — a landmark moment for AI agents.' },
  { emoji: '🎨', text: 'DALL-E was named as a portmanteau of Salvador Dali and Pixar\'s WALL-E.' },
  { emoji: '🦊', text: 'Codex can spawn subagents — autonomous workers that handle subtasks like linting, testing, or refactoring in parallel.' },
  { emoji: '🌐', text: 'Remote Codex lets you run Codex tasks on remote machines — perfect for teams with shared infrastructure.' },
  { emoji: '📊', text: 'Codex Monitor is a community tool that tracks your Codex usage, task history, and token consumption.' },
  { emoji: '🧩', text: 'The Codex ecosystem is growing fast — community tools, themes, and extensions are popping up every week.' },
  { emoji: '🔌', text: 'Codex supports MCP (Model Context Protocol) servers — letting it connect to external tools and services.' },
  { emoji: '✨', text: 'DexThemes is community-built and open source. Your theme could be the next one featured here.' },
  { emoji: '🎲', text: 'There are over 16 million possible hex colors. The theme builder lets you pick from all of them.' },
  { emoji: '🚀', text: 'You\'re customizing your AI coding agent\'s appearance. We live in the future.' },
  { emoji: '🏆', text: 'Submit your theme to the DexThemes gallery and get credit every time someone shares it.' },
  { emoji: '📤', text: 'Every DexThemes share on X automatically credits you as the theme author. Build your rep.' },
  { emoji: '🎭', text: 'DexThemes has over 100 themes across Official, DexThemes, and Community categories.' },
  { emoji: '👁️', text: 'The preview window you just closed? It renders your theme with real code — not a static mockup.' },
  { emoji: '⚙️', text: 'DexThemes generates codex-theme-v1 import strings — the same format Codex uses natively.' },
  { emoji: '🌈', text: 'Every theme in DexThemes supports custom accent colors. One theme, infinite vibes.' },
  { emoji: '🔥', text: 'The most popular Codex themes? Dracula, Catppuccin, and Tokyo Night — in that order.' },
];

const GENERIC_EASTER_EGGS = [
  { emoji: '🎨', text: 'DexThemes keeps one portable palette model, then adapts the handoff to the selected coding harness.' },
  { emoji: '🌗', text: 'Light and dark stay paired so you can preview both modes before choosing a supported handoff.' },
  { emoji: '✨', text: 'DexThemes is community-built and open source. Your palette can become part of the shared catalog.' },
  { emoji: '🎲', text: 'Color me lucky can start a paired draft; you still review and approve every change.' },
];

const PLATFORM_EASTER_EGGS = Object.freeze({
  deepseek: [
    { emoji: '🌊', text: 'Inside the installed DexThemes plugin, Apply and Revert use DeepSeek Harness’s supported theme service.' },
    { emoji: '🔌', text: 'The website can open the plugin setup page, while one-click Apply stays inside the running Harness UI.' },
    { emoji: '🛡️', text: 'DexThemes theme tools do not need prompts, workspace contents, or credentials to preview a palette.' },
  ],
});

let lastEasterEggIndex = -1;

function getRandomEasterEgg() {
  const namespace = state.selectedPlatform?.easterEggNamespace || 'codex';
  const pool = namespace === 'codex'
    ? EASTER_EGGS
    : [...GENERIC_EASTER_EGGS, ...(PLATFORM_EASTER_EGGS[namespace] || [])];
  let idx;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (idx === lastEasterEggIndex && pool.length > 1);
  lastEasterEggIndex = idx;
  return pool[idx];
}

export function initWindowDots() {
  const dots = document.querySelectorAll('.preview-dot');
  if (dots.length < 3) return;
  dots[0].addEventListener('click', (event) => { event.stopPropagation(); closePreviewWindow(); });
  dots[1].addEventListener('click', (event) => { event.stopPropagation(); minimizePreviewWindow(); });
  dots[2].addEventListener('click', (event) => { event.stopPropagation(); toggleFullscreen(); });
}

export function closePreviewWindow() {
  const win = document.getElementById('preview-window');
  const area = document.querySelector('.preview-area');
  if (!win || !area) return;
  state.setWindowState('closed');
  void recordSecretInteraction('dtx.shell.1');

  win.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
  win.style.transform = 'scale(0.95)';
  win.style.opacity = '0';

  setTimeout(() => {
    win.style.display = 'none';
    win.style.transform = '';
    win.style.opacity = '';
    win.style.transition = '';

    const egg = getRandomEasterEgg();
    const overlay = document.createElement('div');
    overlay.className = 'preview-closed-overlay';
    overlay.id = 'closed-overlay';
    overlay.innerHTML = `
      <div class="easter-egg-emoji">${egg.emoji}</div>
      <div class="easter-egg-text">${egg.text}</div>
      <button class="reopen-btn" data-action="reopen-preview-window">Re-open window</button>
    `;
    area.appendChild(overlay);
  }, 250);
}

export function reopenPreviewWindow() {
  const overlay = document.getElementById('closed-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(0.95)';
    overlay.style.transition = 'all 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
  }
  setTimeout(() => {
    overlay?.remove();
    const win = document.getElementById('preview-window');
    if (!win) return;
    win.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)';
    win.style.transform = 'scale(0.95)';
    win.style.opacity = '0';
    win.style.display = '';
    void win.offsetWidth;
    win.style.transform = 'scale(1)';
    win.style.opacity = '1';
    state.setWindowState('normal');
    setTimeout(() => { win.style.transition = ''; }, 300);
  }, 250);
}

export function toggleFullscreen() {
  const win = document.getElementById('preview-window');
  const area = document.querySelector('.preview-area');
  if (!win || !area) return;

  if (state.windowState === 'fullscreen') {
    win.classList.remove('fullscreen');
    area.classList.remove('fullscreen-area');
    state.setWindowState('normal');
    return;
  }

  void recordSecretInteraction('dtx.shell.3');
  win.classList.add('fullscreen');
  area.classList.add('fullscreen-area');
  state.setWindowState('fullscreen');
}

export function minimizePreviewWindow() {
  void recordSecretInteraction('dtx.shell.2');
  if (state.windowState === 'fullscreen') {
    toggleFullscreen();
  }
}

export async function checkOnboarding() {
  if (localStorage.getItem('dexthemes-onboarded')) return;

  if (state.isDeepLink) {
    localStorage.setItem('dexthemes-onboarded', '1');
    return;
  }

  if (window.innerWidth > 1024 && state.selectedPlatformId === 'codex') {
    const showcase = state.THEMES.find((theme) => theme.id === 'current-valentine') || state.THEMES.find((theme) => theme.category === 'dexthemes');
    if (showcase) {
      const actions = await import('./preview-actions.js');
      await actions.selectThemeById(showcase.id);
    }
  }

  localStorage.setItem('dexthemes-onboarded', '1');
}
