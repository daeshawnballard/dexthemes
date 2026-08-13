import * as state from './state.js';
import { escapeHtml, safeHexColor } from './utils.js';
import { isThemeLockedForUser } from './unlocks.js';
import { getWebsiteThemeId } from '../shared/plugin-public-policy.js';
import { buildThemePath } from './theme-url.js';
import { trackEvent } from './analytics-client.js';
import { PLATFORM_APPLY_MODES } from '../shared/platform-registry.js';
import { getWebsitePlatformAction } from './platform-context.js';
import { trackPlatformEvent } from './platform-analytics.js';

const COLOR_ROWS = [
  ['Surface', 'surface'],
  ['Sidebar', 'sidebar'],
  ['Accent', 'accent'],
  ['Code', 'codeBg'],
  ['Added', 'diffAdded'],
  ['Removed', 'diffRemoved'],
  ['Skill', 'skill'],
  ['Ink', 'ink'],
];

function isLockedTheme() {
  return isThemeLockedForUser(state.selectedTheme?.id, state.userUnlocks);
}

function getSourceCopy(theme) {
  if (theme.category === 'community') {
    const author = theme.authorName || theme._authorName || 'a DexThemes creator';
    return {
      label: 'Community',
      detail: `Created by ${author}`,
      answer: `An original community theme by ${author}.`,
    };
  }
  if (theme.category === 'dexthemes') {
    return {
      label: 'Curated',
      detail: 'Curated by DexThemes',
      answer: 'A curated DexThemes palette, separate from the built-in Codex catalog.',
    };
  }
  if (theme.category === 'deepseek') {
    if (theme.unofficial === false) {
      return {
        label: 'DeepSeek default',
        detail: 'Matched to published Harness theme tokens',
        answer: 'A DexThemes palette matched to DeepSeek Harness’s published semantic light and dark defaults.',
      };
    }
    return {
      label: 'DeepSeek collection',
      detail: 'Unofficial DeepSeek-inspired palette',
      answer: 'An unofficial color tribute in the DeepSeek collection. No partnership or endorsement is implied.',
    };
  }
  return {
    label: 'Codex catalog',
    detail: 'Built-in palette',
    answer: 'A built-in Codex catalog palette, presented here with a preview and import handoff.',
  };
}

function getHandoffCopy(action, platform) {
  if (action.mode === PLATFORM_APPLY_MODES.COPY_IMPORT) {
    return {
      fact: 'Copy, then approve in Codex',
      answer: 'Copy the import string, open Codex Settings, choose Appearance → Import theme, then approve the change.',
      boundary: 'DexThemes copies a theme payload. Codex owns the final import.',
    };
  }
  if (action.mode === PLATFORM_APPLY_MODES.SETUP) {
    return {
      fact: action.ctaLabel,
      answer: action.helperText,
      boundary: `The website opens ${platform.shortName} setup guidance. It does not apply a theme to another process.`,
    };
  }
  return {
    fact: 'Not yet available',
    answer: action.helperText,
    boundary: `DexThemes does not claim an unsupported ${platform.shortName} handoff.`,
  };
}

function renderDetailsPlatformAction(action) {
  const label = escapeHtml(action.ctaLabel);
  if (action.mode === PLATFORM_APPLY_MODES.COPY_IMPORT) {
    return `<button class="theme-details-button theme-details-button--primary" type="button" data-action="apply-codex">
      <svg class="apply-icon-bolt" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      <svg class="apply-icon-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span class="theme-copy-label" aria-live="polite">${label}</span>
    </button>`;
  }
  if (action.mode === PLATFORM_APPLY_MODES.SETUP && action.destination?.kind === 'url') {
    return `<a
      class="theme-details-button theme-details-button--primary"
      href="${escapeHtml(action.destination.value)}"
      target="_blank"
      rel="noopener noreferrer"
      data-action="open-platform-setup"
      data-platform-id="${escapeHtml(state.selectedPlatformId)}"
      data-source-surface="theme_details"
    >
      <svg class="apply-icon-platform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      <span>${label}</span>
      <span aria-hidden="true">↗</span>
    </a>`;
  }
  return `<button class="theme-details-button theme-details-button--secondary" type="button" disabled>
    <svg class="apply-icon-platform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    <span>${label}</span>
  </button>`;
}

function renderLockedDetails(container) {
  container.innerHTML = `
    <div class="theme-details-shell theme-details-shell--locked">
      <p class="theme-details-eyebrow">Protected reward theme</p>
      <h2>Unlock this palette to inspect it.</h2>
      <p>Theme details stay private until the related achievement is complete. The preview keeps the same no-reveal boundary.</p>
      <button class="theme-details-button theme-details-button--secondary" type="button" data-action="show-theme-preview">Return to preview</button>
    </div>
  `;
}

export function renderThemeDetails() {
  const container = document.getElementById('theme-details-view');
  const theme = state.selectedTheme;
  if (!container || !theme) return;

  if (isLockedTheme()) {
    renderLockedDetails(container);
    return;
  }

  const variant = theme[state.selectedVariant] || theme.dark || theme.light;
  if (!variant) return;
  const source = getSourceCopy(theme);
  const platform = state.selectedPlatform;
  const platformAction = getWebsitePlatformAction();
  const handoff = getHandoffCopy(platformAction, platform);
  const availableVariants = ['dark', 'light'].filter((key) => Boolean(theme[key]));
  const accent = theme.accents?.[state.selectedAccentIdx] || variant.accent;
  const publicThemeId = getWebsiteThemeId(theme.id);
  const publicPath = buildThemePath(publicThemeId, state.selectedVariant);
  const summary = String(
    theme.summary
    || theme._summary
    || `${theme.name} pairs ${variant.surface} surfaces with ${accent} accents for a focused ${platform.shortName} preview.`,
  ).trim();
  const normalizedPalette = { ...variant, accent };

  container.innerHTML = `
    <article class="theme-details-shell">
      <header class="theme-details-hero">
        <div>
          <p class="theme-details-eyebrow">${escapeHtml(source.label)} · ${escapeHtml(state.selectedVariant)} variant</p>
          <h2>${escapeHtml(theme.name)}</h2>
          <p class="theme-details-summary">${escapeHtml(summary)}</p>
        </div>
        <div class="theme-details-actions">
          <a class="theme-details-button theme-details-button--primary" href="${escapeHtml(publicPath)}" target="_blank" rel="noopener">
            View public page <span aria-hidden="true">↗</span>
          </a>
          <button class="theme-details-button theme-details-button--secondary" type="button" data-action="share-theme">
            Share theme
          </button>
        </div>
      </header>

      <section class="theme-details-palette" aria-labelledby="in-app-palette-title">
        <div class="theme-details-section-heading">
          <span>01</span>
          <div><p>Palette</p><h3 id="in-app-palette-title">The working colors</h3></div>
        </div>
        <div class="theme-details-swatches">
          ${COLOR_ROWS.map(([label, key]) => {
            const fallback = key === 'ink' ? '#f5f5f2' : key === 'accent' ? '#47adff' : '#0d0f12';
            const value = safeHexColor(normalizedPalette[key] || normalizedPalette.surface, fallback);
            return `<div class="theme-details-swatch">
              <i style="--detail-swatch:${value}" aria-hidden="true"></i>
              <span>${label}</span>
              <code>${value}</code>
            </div>`;
          }).join('')}
        </div>
      </section>

      <section class="theme-details-facts" aria-labelledby="in-app-about-title">
        <div class="theme-details-section-heading">
          <span>02</span>
          <div><p>About</p><h3 id="in-app-about-title">What you are looking at</h3></div>
        </div>
        <dl>
          <div><dt>Source</dt><dd>${escapeHtml(source.detail)}</dd></div>
          <div><dt>Available</dt><dd>${escapeHtml(availableVariants.join(' + '))}</dd></div>
          <div><dt>Preview for</dt><dd>${escapeHtml(platform.displayName)}</dd></div>
          <div><dt>Handoff</dt><dd>${escapeHtml(handoff.fact)}</dd></div>
          <div><dt>Affiliation</dt><dd>${escapeHtml(platform.footerAffiliationCopy)}</dd></div>
        </dl>
        <div class="theme-details-answer-grid">
          <article><h4>How is it used?</h4><p>${escapeHtml(handoff.answer)}</p></article>
          <article><h4>Where did it come from?</h4><p>${escapeHtml(source.answer)}</p></article>
          <article><h4>What happens on this website?</h4><p>${escapeHtml(handoff.boundary)}</p></article>
        </div>
      </section>

      <footer class="theme-details-footer">
        <div><strong>Ready to use it?</strong><span>${escapeHtml(platformAction.helperText)}</span></div>
        <div class="theme-details-apply-actions">
          ${renderDetailsPlatformAction(platformAction)}
        </div>
      </footer>
    </article>
  `;
}

function syncViewControls() {
  const switcher = document.getElementById('theme-view-switch');
  const detailButton = switcher?.querySelector('[data-action="show-theme-details"]');
  const locked = isLockedTheme();
  if (detailButton) {
    detailButton.disabled = locked || state.panelMode === 'builder';
    detailButton.title = locked ? 'Unlock this theme to inspect its palette' : '';
  }
  switcher?.querySelectorAll('.theme-view-option').forEach((button) => {
    const active = button.dataset.action === (state.themeView === 'details' ? 'show-theme-details' : 'show-theme-preview');
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

export function showThemePreview({ track = true } = {}) {
  state.setThemeView('preview');
  const area = document.querySelector('.preview-area');
  const preview = document.getElementById('preview-window');
  const details = document.getElementById('theme-details-view');
  if (details) details.hidden = true;
  if (preview && !state.profileVisible && !state.leaderboardVisible) preview.style.display = '';
  area?.classList.remove('preview-area--theme-details');
  syncViewControls();
  if (track) {
    void trackEvent('theme_view_changed', null, {
      theme_id: state.selectedTheme?.id,
      view: 'chat_preview',
      landing_source: state.landingContext.source,
    });
  }
}

export function showThemeDetails({ track = true } = {}) {
  if (state.panelMode === 'builder' || isLockedTheme()) {
    showThemePreview({ track: false });
    return;
  }

  state.setThemeView('details');
  state.setProfileVisible(false);
  state.setLeaderboardVisible(false);
  const area = document.querySelector('.preview-area');
  const preview = document.getElementById('preview-window');
  const details = document.getElementById('theme-details-view');
  const profile = document.getElementById('profile-view');
  const leaderboard = document.getElementById('leaderboard-view');
  if (preview) preview.style.display = 'none';
  if (profile) profile.style.display = 'none';
  if (leaderboard) leaderboard.style.display = 'none';
  if (details) details.hidden = false;
  area?.classList.add('preview-area--theme-details');
  area?.classList.remove('preview-area--detail');
  renderThemeDetails();
  syncViewControls();
  if (track) {
    void trackEvent('theme_details_viewed', null, {
      theme_id: state.selectedTheme?.id,
      theme_name: state.selectedTheme?.name,
      variant: state.selectedVariant,
      landing_source: state.landingContext.source,
      referral_channel: state.landingContext.referralChannel,
    });
    trackPlatformEvent('theme_previewed', state.selectedPlatformId, {
      source_surface: 'theme_details',
      theme_id: state.selectedTheme?.id,
      variant: state.selectedVariant,
      theme_source: state.selectedTheme?.category,
    });
  }
}

export function syncThemeDetailsView() {
  if (isLockedTheme() && state.themeView === 'details') {
    showThemePreview({ track: false });
  } else if (state.themeView === 'details') {
    showThemeDetails({ track: false });
  }
  syncViewControls();
}
