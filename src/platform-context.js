import * as state from './state.js';
import {
  DEFAULT_PLATFORM_ID,
  PLATFORM_IDS,
  getPlatform,
  getPlatformAction,
} from '../shared/platform-registry.js';
import { buildThemePath } from './theme-url.js';
import { trackPlatformEvent } from './platform-analytics.js';

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setMeta(selector, content) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', content);
}

export function getPlatformPreviewCopy(platformId = DEFAULT_PLATFORM_ID) {
  const platform = getPlatform(platformId);
  return Object.freeze({
    descriptor: platform.descriptorCopy,
    affiliation: platform.footerAffiliationCopy,
    capability: platform.capabilityMessage,
    inputLabel: `${platform.shortName} prompt`,
    inputPlaceholder: `Ask ${platform.shortName} anything...`,
    inputAriaLabel: `Preview a ${platform.shortName} prompt`,
    documentTitle: `DexThemes — Themes for ${platform.displayName}`,
    metaDescription: `${platform.descriptorCopy} Preview light and dark palettes before using the supported ${platform.shortName} handoff.`,
  });
}

export function buildContextualThemePath(themeId, variant, platformId = state.selectedPlatformId) {
  const path = buildThemePath(themeId, variant);
  const platform = getPlatform(platformId);
  return platform.id === DEFAULT_PLATFORM_ID
    ? path
    : `${path}?platform=${encodeURIComponent(platform.id)}`;
}

export function getWebsitePlatformAction(platformId = state.selectedPlatformId) {
  return getPlatformAction(platformId, 'website');
}

function syncPlatformSelect() {
  const select = document.getElementById('preview-platform-select');
  if (!select) return;

  const expectedIds = PLATFORM_IDS.join(',');
  if (select.dataset.platformIds !== expectedIds) {
    select.replaceChildren(...PLATFORM_IDS.map((id) => {
      const platform = getPlatform(id);
      const option = document.createElement('option');
      option.value = platform.id;
      option.textContent = platform.shortName;
      return option;
    }));
    select.dataset.platformIds = expectedIds;
  }
  select.value = state.selectedPlatformId;
}

function syncPlatformSetupMessage() {
  const message = document.getElementById('platform-setup-message');
  if (!message) return;

  const platform = state.selectedPlatform;
  const action = getPlatformAction(platform.id, 'website');
  const destination = action?.mode === 'setup' && action.destination?.kind === 'url'
    ? action.destination.value
    : null;
  message.hidden = !destination;
  if (!destination) return;

  setText('platform-setup-message-title', action.ctaLabel);
  setText('platform-setup-message-text', platform.capabilityMessage);
  const link = document.getElementById('platform-setup-message-link');
  if (link) {
    link.href = destination;
    link.innerHTML = `${platform.id === 'deepseek' ? 'View plugin' : 'Open setup'} <span aria-hidden="true">↗</span>`;
    link.dataset.platformId = platform.id;
    if (!link.dataset.analyticsBound) {
      link.addEventListener('click', () => {
        trackPlatformEvent('api_setup_opened', link.dataset.platformId || state.selectedPlatformId, {
          source_surface: 'preview_message',
        });
      });
      link.dataset.analyticsBound = 'true';
    }
  }
}

export function syncPlatformContext() {
  const platform = state.selectedPlatform;
  const copy = getPlatformPreviewCopy(platform.id);
  const root = document.documentElement;
  root.dataset.platform = platform.id;

  syncPlatformSelect();
  setText('platform-descriptor', copy.descriptor);
  setText('platform-affiliation', copy.affiliation);
  setText('mobile-platform-affiliation', copy.affiliation);
  syncPlatformSetupMessage();

  const inputLabel = document.querySelector('label[for="preview-input-text"]');
  if (inputLabel) inputLabel.textContent = copy.inputLabel;
  const input = document.getElementById('preview-input-text');
  if (input) {
    input.placeholder = copy.inputPlaceholder;
    input.setAttribute('aria-label', copy.inputAriaLabel);
  }

  document.title = copy.documentTitle;
  setMeta('meta[name="description"]', copy.metaDescription);
  setMeta('meta[property="og:title"]', copy.documentTitle);
  setMeta('meta[property="og:description"]', copy.metaDescription);
  setMeta('meta[name="twitter:title"]', copy.documentTitle);
  setMeta('meta[name="twitter:description"]', copy.metaDescription);
}

export async function selectPlatformContext(platformId, { sourceSurface = 'website' } = {}) {
  const previousPlatformId = state.selectedPlatformId;
  if (!state.setSelectedPlatform(platformId)) return false;

  syncPlatformContext();
  const [{ applyPreview, applyShellTheme }, { renderRightPanel }, { syncThemeDetailsView }, { renderSidebar }] = await Promise.all([
    import('./theme-engine.js'),
    import('./preview-shell.js'),
    import('./theme-details.js'),
    import('./sidebar.js'),
  ]);
  applyShellTheme(state.selectedTheme, state.selectedVariant);
  if (state.panelMode === 'builder') {
    const builder = await import('./builder.js');
    builder.renderBuilderPanel();
    builder.applyBuilderPreview();
  } else {
    applyPreview(state.selectedTheme, state.selectedVariant);
    renderRightPanel();
  }
  state.expandedCategories[state.selectedTheme.category] = true;
  renderSidebar();
  syncThemeDetailsView();

  if (state.selectedPlatformId !== previousPlatformId) {
    trackPlatformEvent('harness_selected', state.selectedPlatformId, {
      source_surface: sourceSurface,
    });
  }
  return true;
}
