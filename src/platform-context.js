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
    brandDescriptor: `Create & Discover\nThemes for ${platform.shortName}`,
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

function bindPlatformPickerEvents(picker) {
  if (picker.dataset.eventsBound === 'true') return;
  picker.dataset.eventsBound = 'true';

  const trigger = document.getElementById('preview-platform-trigger');
  const menu = document.getElementById('preview-platform-menu');

  picker.addEventListener('toggle', () => {
    trigger?.setAttribute('aria-expanded', String(picker.open));
    if (picker.open) {
      requestAnimationFrame(() => {
        menu?.querySelector('[role="menuitemradio"][aria-checked="true"]')?.focus({ preventScroll: true });
      });
    }
  });

  menu?.addEventListener('keydown', (event) => {
    const items = [...menu.querySelectorAll('[role="menuitemradio"]')];
    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1 + items.length) % items.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    } else if (event.key === 'Escape') {
      event.preventDefault();
      picker.open = false;
      trigger?.focus({ preventScroll: true });
      return;
    }

    if (nextIndex !== null && items[nextIndex]) {
      event.preventDefault();
      items[nextIndex].focus({ preventScroll: true });
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (picker.open && !picker.contains(event.target)) picker.open = false;
  });
}

function syncPlatformPicker() {
  const picker = document.getElementById('preview-platform-picker');
  const trigger = document.getElementById('preview-platform-trigger');
  const current = document.getElementById('preview-platform-current');
  const menu = document.getElementById('preview-platform-menu');
  if (!picker || !trigger || !current || !menu) return;

  const expectedIds = PLATFORM_IDS.join(',');
  if (menu.dataset.platformIds !== expectedIds) {
    menu.replaceChildren(...PLATFORM_IDS.map((id) => {
      const platform = getPlatform(id);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = 'set-platform';
      button.dataset.platformId = platform.id;
      button.setAttribute('role', 'menuitemradio');

      const label = document.createElement('span');
      label.textContent = platform.shortName;
      const check = document.createElement('span');
      check.className = 'preview-platform-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '✓';
      button.append(label, check);
      return button;
    }));
    menu.dataset.platformIds = expectedIds;
  }

  const platform = state.selectedPlatform;
  current.textContent = platform.shortName;
  trigger.dataset.platformId = platform.id;
  trigger.setAttribute('aria-label', `Preview product: ${platform.shortName}`);
  menu.querySelectorAll('[role="menuitemradio"]').forEach((button) => {
    button.setAttribute('aria-checked', String(button.dataset.platformId === platform.id));
  });
  bindPlatformPickerEvents(picker);
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
    link.dataset.themeId = state.selectedTheme?.id || '';
    link.dataset.variant = state.selectedVariant || 'unknown';
    if (!link.dataset.analyticsBound) {
      link.addEventListener('click', () => {
        trackPlatformEvent('platform_setup_opened', link.dataset.platformId || state.selectedPlatformId, {
          source_surface: 'preview_message',
          theme_id: link.dataset.themeId,
          variant: link.dataset.variant,
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

  syncPlatformPicker();
  setText('platform-descriptor', copy.brandDescriptor);
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
      theme_id: state.selectedTheme?.id,
      variant: state.selectedVariant,
    });
  }
  return true;
}
