// ================================================
// DexThemes — Theme Submission Writes
// ================================================

import * as state from './state.js';
import { THEMES } from './theme-catalog.js';
import { CONVEX_SITE_URL } from './config.js';
import { slugify } from './utils.js';
import { renderSidebar } from './sidebar.js';
import { checkThemeProtection } from '../convex/protectedThemes.ts';
import { showSubmitDelighter } from './preview-chat.js';
import { activateModalFocusTrap, deactivateModalFocusTrap } from './modal-a11y.js';
import { showToast } from './toasts.js';
import { grantUnlockAction } from './unlock-api.js';
import { trackEvent } from './analytics-client.js';
import { authFetch } from './session-auth.js';

function getVariantDataFromDraft(draft, variant) {
  if (!draft) return null;
  return {
    surface: draft.surface,
    ink: draft.ink,
    accent: draft.accent,
    contrast: draft.contrast || (variant === 'dark' ? 60 : 45),
    diffAdded: draft.diffAdded,
    diffRemoved: draft.diffRemoved,
    skill: draft.skill,
    sidebar: draft.sidebar,
    codeBg: draft.codeBg,
  };
}

function hasReadySecondaryVariant(builder, variant) {
  return !!builder?._variantTouched?.[variant] && !!builder?._variantDrafts?.[variant];
}

function checkColorCopying(newDark, newLight) {
  const protection = checkThemeProtection(newDark, newLight);
  return protection.reason || null;
}

function persistBuilderState() {
  if (!state.builderColors) return;
  localStorage.setItem('dexthemes-builder', JSON.stringify(state.builderColors));
}

function markBuilderForVariantAdd(themeId) {
  state.builderColors._addVariantFor = themeId;
  persistBuilderState();
}

function findOwnedCommunityTheme(themeId) {
  return THEMES.find((theme) =>
    theme.id === themeId &&
    theme.category === 'community' &&
    (
      theme._authorId === state.currentUser?._id ||
      theme._authorName === (state.currentUser?.displayName || state.currentUser?.username)
    ));
}

async function addVariantToExistingTheme(themeId, themeName, variant, variantData) {
  const res = await authFetch(CONVEX_SITE_URL + '/themes/add-variant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      themeId,
      variant: variantData,
      variantKey: variant,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    showToast(data.error || 'Failed to add variant', 'error');
    return false;
  }

  const existing = THEMES.find((theme) => theme.id === themeId);
  if (existing) existing[variant] = variantData;

  grantUnlockAction('complete_pair');
  void trackEvent('theme_variant_added', null, {
    theme_id: themeId,
    theme_name: themeName,
    variant,
    source: 'builder',
  });
  showToast(`${variant === 'dark' ? 'Dark' : 'Light'} variant added! You unlocked Yin & Yang 🎉`);
  showSubmitDelighter(themeName, variant, variantData);

  state.setPanelMode('preview');
  if (existing) {
    state.setSelectedTheme(existing);
    state.setSelectedVariant(variant);
  }
  const { renderRightPanel } = await import('./preview-shell.js');
  const { syncAttributionOverlay } = await import('./preview-attribution.js');
  const { applyShellTheme, applyPreview } = await import('./theme-engine.js');
  applyShellTheme(state.selectedTheme, state.selectedVariant);
  applyPreview(state.selectedTheme, state.selectedVariant);
  syncAttributionOverlay();
  renderRightPanel();
  renderSidebar();
  return true;
}

export async function submitFromBuilder() {
  if (!state.currentUser) {
    showToast('Sign in to submit themes', 'error');
    return;
  }

  const b = state.builderColors;
  if (!b.name || !b.name.trim()) {
    const input = document.getElementById('builder-name');
    const warning = document.getElementById('builder-name-warning');
    if (input) input.classList.add('name-required');
    if (warning) warning.classList.add('visible');
    if (input) input.focus();
    return;
  }

  const variant = b.variant || 'dark';
  const variantData = getVariantDataFromDraft(b, variant);
  const oppositeVariant = variant === 'dark' ? 'light' : 'dark';
  const oppositeVariantData = hasReadySecondaryVariant(b, oppositeVariant)
    ? getVariantDataFromDraft(b._variantDrafts[oppositeVariant], oppositeVariant)
    : null;
  const darkVariantData = variant === 'dark' ? variantData : oppositeVariantData;
  const lightVariantData = variant === 'light' ? variantData : oppositeVariantData;

  const copySource = checkColorCopying(
    darkVariantData,
    lightVariantData,
  );
  if (copySource) {
    showToast(copySource, 'error');
    return;
  }

  if (b._addVariantFor) {
    try {
      const added = await addVariantToExistingTheme(
        b._addVariantFor,
        b.name.trim(),
        variant,
        variantData,
      );
      if (!added) return;
    } catch (error) {
      showToast('Network error — try again', 'error');
    }
    return;
  }

  const themeId = slugify(b.name);
  const summary = (b.name.trim() + ' theme for Codex').slice(0, 240);
  const payload = {
    themeId,
    name: b.name.trim(),
    summary,
    dark: darkVariantData || undefined,
    light: lightVariantData || undefined,
    accents: [b.accent],
    codeThemeId: 'codex',
  };

  try {
    const res = await authFetch(CONVEX_SITE_URL + '/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.error === 'A theme with this ID already exists') {
        const existing = findOwnedCommunityTheme(themeId);
        if (existing && !existing[variant]) {
          markBuilderForVariantAdd(themeId);
          const added = await addVariantToExistingTheme(
            themeId,
            b.name.trim(),
            variant,
            variantData,
          );
          if (added) return;
        }
      }
      showToast(data.error || 'Submission failed', 'error');
      return;
    }

    grantUnlockAction('create_theme');
    void trackEvent('theme_submitted', null, {
      theme_id: themeId,
      theme_name: b.name.trim(),
      variant: darkVariantData && lightVariantData ? 'both' : variant,
      has_dark: !!darkVariantData,
      has_light: !!lightVariantData,
      source: 'builder',
    });
    showSubmitDelighter(b.name.trim(), variant, variantData);

    const createdTheme = {
      id: themeId,
      name: b.name.trim(),
      category: 'community',
      subgroup: 'community',
      codeThemeId: 'codex',
      copies: 0,
      dateAdded: new Date().toISOString().split('T')[0],
      dark: darkVariantData || undefined,
      light: lightVariantData || undefined,
      accents: [b.accent],
      _authorName: state.currentUser.displayName || state.currentUser.username,
      _authorAvatarUrl: state.currentUser.avatarUrl || '',
      _authorIsSupporter: state.isCurrentUserSupporter(),
      _authorIsAgent: state.currentUser.provider === 'agent',
      _summary: summary,
      _authorId: state.currentUser._id,
      _convexId: data.theme?._id,
      _variantRequests: 0,
    };
    THEMES.push(createdTheme);
    if (!(darkVariantData && lightVariantData)) {
      markBuilderForVariantAdd(themeId);
    }
    renderSidebar();
  } catch (error) {
    showToast('Network error — try again', 'error');
  }
}

export function showSubmitJsonModal() {
  if (!state.currentUser) {
    showToast('Sign in to submit themes', 'error');
    return;
  }

  dismissSubmitJsonModal();

  const overlay = document.createElement('div');
  overlay.className = 'submit-modal-overlay';
  overlay.onclick = (event) => { if (event.target === overlay) dismissSubmitJsonModal(); };
  overlay.innerHTML = `
    <div class="submit-modal" role="dialog" aria-modal="true" aria-labelledby="submit-json-modal-title" tabindex="-1">
      <div class="submit-modal-header">
        <span id="submit-json-modal-title">Submit Theme JSON</span>
        <button class="submit-modal-close" data-action="submit-json-close" aria-label="Close JSON submit modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <p class="submit-modal-hint">Paste your theme JSON below. Must include <code>id</code>, <code>name</code>, and at least one variant (<code>dark</code> or <code>light</code>).</p>
      <label class="field-label" for="submit-json-input">Theme JSON</label>
      <textarea class="submit-json-textarea" id="submit-json-input" aria-label="Theme JSON" placeholder='{\n  "id": "my-theme",\n  "name": "My Theme",\n  "summary": "A cool custom theme",\n  "dark": { ... }\n}' rows="12"></textarea>
      <div class="submit-modal-error" id="submit-json-error"></div>
      <button class="submit-modal-btn" data-action="submit-json-confirm">Submit theme</button>
    </div>
  `;
  document.body.appendChild(overlay);
  activateModalFocusTrap(overlay, { dialogSelector: '.submit-modal', onClose: dismissSubmitJsonModal });
}

export function dismissSubmitJsonModal() {
  const overlay = document.querySelector('.submit-modal-overlay');
  if (!overlay) return;
  deactivateModalFocusTrap(overlay);
  overlay.remove();
}

export async function submitJsonFromModal() {
  const textarea = document.getElementById('submit-json-input');
  const errorEl = document.getElementById('submit-json-error');
  if (!textarea || !errorEl) return;

  let parsed;
  try {
    parsed = JSON.parse(textarea.value);
  } catch (error) {
    errorEl.textContent = 'Invalid JSON: ' + error.message;
    return;
  }

  if (!parsed.id && !parsed.name) {
    errorEl.textContent = 'Missing required fields: id, name';
    return;
  }
  if (!parsed.dark && !parsed.light) {
    errorEl.textContent = 'At least one variant (dark or light) is required';
    return;
  }

  const copySource = checkColorCopying(parsed.dark || null, parsed.light || null);
  if (copySource) {
    errorEl.textContent = copySource;
    return;
  }

  const payload = {
    themeId: parsed.id || slugify(parsed.name),
    name: parsed.name,
    summary: parsed.summary || parsed.name,
    dark: parsed.dark,
    light: parsed.light,
    accents: parsed.accents || [parsed.dark?.accent || parsed.light?.accent].filter(Boolean),
    codeThemeId: parsed.codeThemeId || { dark: 'codex', light: 'codex' },
  };

  try {
    const res = await authFetch(CONVEX_SITE_URL + '/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || 'Submission failed';
      return;
    }

    dismissSubmitJsonModal();
    showToast('Theme submitted to the community gallery!');
    grantUnlockAction('create_theme');
    void trackEvent('theme_submitted', null, {
      theme_id: payload.themeId,
      theme_name: payload.name,
      variant: parsed.dark ? (parsed.light ? 'both' : 'dark') : 'light',
      has_dark: !!parsed.dark,
      has_light: !!parsed.light,
      source: 'json_modal',
    });

    THEMES.push({
      id: payload.themeId,
      name: payload.name,
      category: 'community',
      subgroup: 'community',
      codeThemeId: payload.codeThemeId,
      copies: 0,
      dateAdded: new Date().toISOString().split('T')[0],
      dark: parsed.dark,
      light: parsed.light,
      accents: payload.accents,
      _authorName: state.currentUser.displayName || state.currentUser.username,
      _authorAvatarUrl: state.currentUser.avatarUrl || '',
      _authorIsSupporter: state.isCurrentUserSupporter(),
      _authorIsAgent: state.currentUser.provider === 'agent',
      _summary: payload.summary,
    });
    renderSidebar();
  } catch (error) {
    errorEl.textContent = 'Network error — try again';
  }
}
