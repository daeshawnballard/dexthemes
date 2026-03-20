// ================================================
// DexThemes — Theme Builder
// ================================================

import * as state from './state.js';
import { escapeHtml, isDark, fallbackCopy } from './utils.js';
import { applyShellTheme, applyPreview } from './theme-engine.js';
import { renderRightPanel } from './preview-shell.js';
import { syncAttributionOverlay } from './preview-attribution.js';
import { isMobile } from './mobile.js';
import { trackEvent } from './analytics.js';
import { signInWith } from './auth.js';
import { getApplyButtonCopy, openCodexSettings, showApplyHandoffMessage } from './codex-handoff.js';
import { grantUnlockAction } from './unlock-api.js';

let builderCreationTracked = false;

const LUCKY_ADJECTIVES = ['Cosmic', 'Neon', 'Velvet', 'Ember', 'Frozen', 'Solar', 'Midnight', 'Crystal', 'Thunder', 'Phantom', 'Ruby', 'Jade', 'Amber', 'Silver', 'Golden', 'Copper', 'Cobalt', 'Crimson', 'Indigo', 'Scarlet'];
const LUCKY_NOUNS = ['Horizon', 'Circuit', 'Drift', 'Pulse', 'Aurora', 'Nebula', 'Prism', 'Forge', 'Cascade', 'Vertex', 'Bloom', 'Cipher', 'Wave', 'Storm', 'Spark', 'Flame', 'Shade', 'Frost', 'Tide', 'Glow'];

function generateLuckyName() {
  const adj = LUCKY_ADJECTIVES[Math.floor(Math.random() * LUCKY_ADJECTIVES.length)];
  const noun = LUCKY_NOUNS[Math.floor(Math.random() * LUCKY_NOUNS.length)];
  return `${adj} ${noun}`;
}

function getDefaultBuilderColors() {
  return {
    name: '',
    variant: 'dark',
    surface: '#1a1a2e',
    ink: '#e6e6e6',
    accent: '#e94560',
    sidebar: '#141428',
    codeBg: '#12122a',
    diffAdded: '#40c977',
    diffRemoved: '#fa423e',
    skill: '#ad7bf9',
    contrast: 60
  };
}

function saveBuilderState() {
  if (!state.builderColors) return;
  localStorage.setItem('dexthemes-builder', JSON.stringify(state.builderColors));
}

function loadBuilderState() {
  try {
    const saved = localStorage.getItem('dexthemes-builder');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

function resetBuilderCreationTracking() {
  builderCreationTracked = false;
}

function maybeTrackThemeCreated(method) {
  if (builderCreationTracked || state.builderColors?._addVariantFor) return;
  builderCreationTracked = true;
  trackEvent('theme_created', null, {
    source: 'builder',
    method,
    variant: state.builderColors?.variant || 'dark',
  });
}

async function maybeShowBuilderSubmitPrompt() {
  if (state.currentUser || localStorage.getItem('dexthemes-builder-signin-prompt-seen') === '1') return;
  localStorage.setItem('dexthemes-builder-signin-prompt-seen', '1');
  const { showInlineSignInPrompt } = await import('./preview-chat.js');
  showInlineSignInPrompt('builder', 'You can keep building and copy this theme without an account. Sign in only if you want to submit it to the community.');
}

export async function startBuilderSubmit() {
  if (isMobile()) {
    const mobileSubmit = await import('./mobile-submit.js');
    mobileSubmit.mobileStartSubmit();
    return;
  }

  if (!state.currentUser) {
    const { showInlineSignInPrompt } = await import('./preview-chat.js');
    showInlineSignInPrompt(
      'builder-submit',
      'You can keep building and copy this theme without an account. Sign in only if you want to submit it to the community.',
      { prepend: true },
    );
    return;
  }

  const submission = await import('./theme-submission-api.js');
  await submission.submitFromBuilder();
}

export function resetBuilder() {
  trackEvent('builder_reset');
  state.setBuilderColors(getDefaultBuilderColors());
  resetBuilderCreationTracking();
  localStorage.removeItem('dexthemes-builder');
  renderBuilderPanel();
  applyBuilderPreview();
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function colorMeLucky() {
  void maybeShowBuilderSubmitPrompt();
  const hue = randomHue();
  const b = state.builderColors;
  const isDarkVariant = b.variant === 'dark';

  if (isDarkVariant) {
    b.surface = hslToHex(hue, 15, 8);
    b.ink = hslToHex(hue, 10, 90);
    b.accent = hslToHex(hue, 75, 58);
    b.sidebar = hslToHex(hue, 15, 6);
    b.codeBg = hslToHex(hue, 15, 5);
    b.diffAdded = hslToHex((hue + 120) % 360, 60, 55);
    b.diffRemoved = hslToHex((hue + 240) % 360, 60, 55);
    b.skill = hslToHex((hue + 180) % 360, 55, 65);
  } else {
    b.surface = hslToHex(hue, 15, 96);
    b.ink = hslToHex(hue, 15, 12);
    b.accent = hslToHex(hue, 75, 45);
    b.sidebar = hslToHex(hue, 15, 92);
    b.codeBg = hslToHex(hue, 15, 90);
    b.diffAdded = hslToHex((hue + 120) % 360, 60, 38);
    b.diffRemoved = hslToHex((hue + 240) % 360, 60, 42);
    b.skill = hslToHex((hue + 180) % 360, 55, 45);
  }

  b.name = generateLuckyName();
  saveBuilderState();
  renderBuilderPanel();
  applyBuilderPreview();
  maybeTrackThemeCreated('color_me_lucky');
  trackEvent('color_me_lucky', null, { variant: b.variant });
  // Trigger kaleidoscope unlock
  grantUnlockAction('color_me_lucky');
}

// Combined variant + randomize for mobile "Lucky Dark" / "Lucky Light"
export function colorMeLuckyVariant(variant) {
  state.builderColors.variant = variant;
  colorMeLucky();

  // Re-apply mobile create view customizations (colorMeLucky re-renders panel)
  if (isMobile()) {
    // Use dynamic import to avoid circular dependency
    import('./mobile.js').then(m => m.mobileSetView('create'));
  }

  // Inject submit prompt into preview window as a chat bubble
  setTimeout(() => {
    const previewContent = document.querySelector('.preview-chat');
    if (previewContent) {
      const existing = previewContent.querySelector('.create-submit-prompt');
      if (existing) existing.remove();

      const prompt = document.createElement('div');
      prompt.className = 'create-submit-prompt';
      prompt.innerHTML = `
        <div class="create-submit-bubble" data-action="builder-mobile-submit">
          <span>Share it with the community? <strong>Submit →</strong></span>
        </div>
      `;
      previewContent.prepend(prompt);
      prompt.scrollIntoView({ block: 'nearest' });
    }
  }, 50);
}

export function toggleBuilderMode() {
  const btn = document.getElementById('submit-btn');
  const textEl = document.getElementById('submit-btn-text');
  const iconEl = btn.querySelector('svg');
  if (state.panelMode === 'builder') {
    trackEvent('builder_closed', null, { source: 'toggle' });
    state.setPanelMode('preview');
    textEl.textContent = 'Create a theme';
    iconEl.innerHTML = '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
    applyShellTheme(state.selectedTheme, state.selectedVariant);
    applyPreview(state.selectedTheme, state.selectedVariant);
    syncAttributionOverlay();
    renderRightPanel();
  } else {
    trackEvent('builder_opened', null, { source: 'toggle' });
    state.setPanelMode('builder');
    state.setBuilderColors(loadBuilderState() || getDefaultBuilderColors());
    resetBuilderCreationTracking();
    localStorage.removeItem('dexthemes-builder-signin-prompt-seen');
    textEl.textContent = 'Back to browsing';
    iconEl.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
    renderBuilderPanel();
    applyBuilderPreview();
    showBuilderCoc();
  }
}

export async function openBuilderForVariant(themeId, variant) {
  const theme = state.THEMES.find((candidate) => candidate.id === themeId);
  if (!theme) return;

  state.setPanelMode('builder');
  state.setBuilderColors({
    name: theme.name,
    variant,
    surface: variant === 'dark' ? '#1a1a2e' : '#f5f5f5',
    ink: variant === 'dark' ? '#e6e6e6' : '#1a1a1a',
    accent: theme.accents?.[0] || '#e94560',
    sidebar: variant === 'dark' ? '#141428' : '#eaeaea',
    codeBg: variant === 'dark' ? '#12122a' : '#e5e5e5',
    diffAdded: variant === 'dark' ? '#40c977' : '#00a240',
    diffRemoved: variant === 'dark' ? '#fa423e' : '#e02e2a',
    skill: variant === 'dark' ? '#ad7bf9' : '#924ff7',
    contrast: 60,
    _addVariantFor: themeId,
  });
  resetBuilderCreationTracking();
  localStorage.removeItem('dexthemes-builder-signin-prompt-seen');

  const btn = document.getElementById('submit-btn');
  const textEl = document.getElementById('submit-btn-text');
  const iconEl = btn?.querySelector('svg');
  if (textEl) textEl.textContent = 'Back to browsing';
  if (iconEl) iconEl.innerHTML = '<polyline points="15 18 9 12 15 6"/>';

  renderBuilderPanel();
  applyBuilderPreview();
}

function showBuilderCoc() {
  if (localStorage.getItem('dexthemes-coc-seen')) return;
  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  const msg = document.createElement('div');
  msg.className = 'coc-prompt';
  msg.innerHTML = `
    <div class="coc-card assistant-surface">
      <p>Keep it creative and respectful — no offensive, hateful, or NSFW theme names or content. Themes that violate this will be removed.</p>
      <button class="coc-dismiss" data-action="dismiss-coc">Got it</button>
    </div>
  `;
  chat.appendChild(msg);
}

export function renderBuilderPanel() {
  const panel = document.querySelector('.panel');
  const b = state.builderColors;
  const isCompactBuilder = isMobile();
  const panelTitleText = isCompactBuilder ? '' : 'Theme Builder';
  const applyCopy = getApplyButtonCopy(isMobile());

  panel.innerHTML = `
    ${isCompactBuilder ? '' : `
      <div class="panel-header">
        <div class="panel-title">${panelTitleText}</div>
      </div>
    `}
    <div class="builder-panel">
      ${isCompactBuilder ? '' : `<label class="field-label" for="builder-name">Theme name</label>`}
      <input type="text" class="builder-name-input" id="builder-name" value="${escapeHtml(b.name)}" placeholder="Name your theme..." aria-label="Theme name" data-input-action="builder-name-input">
      <div class="builder-name-warning" id="builder-name-warning">Give your theme a name first</div>

      <div class="builder-controls-row">
        <div class="builder-variant-toggle">
          <button class="builder-variant-btn ${b.variant === 'dark' ? 'active' : ''}" data-action="builder-set-variant" data-variant="dark">Dark</button>
          <button class="builder-variant-btn ${b.variant === 'light' ? 'active' : ''}" data-action="builder-set-variant" data-variant="light">Light</button>
        </div>
        <div class="builder-icon-actions">
          <button class="builder-icon-btn builder-icon-btn--lucky" data-action="builder-color-lucky" title="Color me lucky" aria-label="Color me lucky">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="8" r="3.1"/>
              <circle cx="15" cy="8" r="3.1"/>
              <circle cx="9" cy="14" r="3.1"/>
              <circle cx="15" cy="14" r="3.1"/>
              <path d="M12.1 16.7c-.1 2.1-1.2 3.8-3.3 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="builder-icon-btn" data-action="builder-reset" title="Reset" aria-label="Reset builder colors">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          </button>
        </div>
      </div>

      <div class="builder-section">
        <div class="builder-section-title">Colors</div>
        ${builderColorField('Surface', 'surface', b.surface)}
        ${builderColorField('Text', 'ink', b.ink)}
        ${builderColorField('Accent', 'accent', b.accent)}
        ${builderColorField('Sidebar', 'sidebar', b.sidebar)}
        ${builderColorField('Code background', 'codeBg', b.codeBg)}
      </div>

      <div class="builder-section">
        <div class="builder-section-title">Syntax colors</div>
        ${builderColorField('Strings / Added', 'diffAdded', b.diffAdded)}
        ${builderColorField('Errors / Removed', 'diffRemoved', b.diffRemoved)}
        ${builderColorField('Functions / Skill', 'skill', b.skill)}
      </div>
    </div>

    <div class="builder-actions">
      ${isCompactBuilder ? '' : `
        <div class="builder-submit-slot">
          <button
            class="builder-submit-btn${state.currentUser ? '' : ' builder-submit-btn--signin'}"
            type="button"
            data-action="builder-submit"
          >
            Submit to community &rarr;
          </button>
        </div>
      `}
      ${isCompactBuilder ? `
        <div class="builder-mobile-lucky-row">
          <button class="builder-lucky-btn builder-lucky-dark" data-action="builder-color-lucky-variant" data-variant="dark">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            Color Me Dark
          </button>
          <button class="builder-lucky-btn builder-lucky-light" data-action="builder-color-lucky-variant" data-variant="light">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            Color Me Light
          </button>
        </div>
      ` : ''}
      <button class="apply-codex-btn builder-apply-btn" data-action="builder-apply-codex">
        <svg class="apply-icon-bolt" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <svg class="apply-icon-copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span class="builder-apply-btn-text">${applyCopy.defaultLabel}</span>
      </button>
      ${isCompactBuilder ? '' : `<div class="import-hint builder-import-hint">${applyCopy.hintText}</div>`}
    </div>
  `;

  if (isCompactBuilder) {
    panel.querySelector('.panel-header')?.remove();
  }
}

export function onBuilderNameInput(val) {
  void maybeShowBuilderSubmitPrompt();
  state.builderColors.name = val;
  saveBuilderState();
  if (val.trim()) maybeTrackThemeCreated('name_input');
  const warning = document.getElementById('builder-name-warning');
  const input = document.getElementById('builder-name');
  if (val.trim()) {
    warning.classList.remove('visible');
    input.classList.remove('name-required');
  }
}

function builderColorField(label, key, value) {
  const colorId = `builder-color-${key}`;
  return `
    <div class="builder-field">
      <label class="builder-field-label" for="${colorId}">${label}</label>
        <div class="builder-color-input">
        <div class="builder-color-swatch" style="background:${value}">
          <input type="color" value="${value}" aria-label="${label} color picker" data-color-key="${key}" data-change-action="builder-update-color">
        </div>
        <input type="text" class="builder-color-hex" id="${colorId}" value="${value}" maxlength="7" aria-label="${label} hex value"
          data-color-key="${key}"
          data-change-action="builder-update-color"
          data-enter-action="builder-update-color">
      </div>
    </div>
  `;
}

export function updateBuilderColor(key, value) {
  void maybeShowBuilderSubmitPrompt();
  if (!value.startsWith('#')) value = '#' + value;
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
  state.builderColors[key] = value;
  maybeTrackThemeCreated('color_update');
  saveBuilderState();
  renderBuilderPanel();
  applyBuilderPreview();
}

export function setBuilderVariant(v) {
  void maybeShowBuilderSubmitPrompt();
  state.builderColors.variant = v;
  if (v === 'light' && isDark(state.builderColors.surface)) {
    state.builderColors.surface = '#f5f5f5';
    state.builderColors.ink = '#1a1a1a';
    state.builderColors.sidebar = '#eaeaea';
    state.builderColors.codeBg = '#e5e5e5';
  } else if (v === 'dark' && !isDark(state.builderColors.surface)) {
    state.builderColors.surface = '#1a1a2e';
    state.builderColors.ink = '#e6e6e6';
    state.builderColors.sidebar = '#141428';
    state.builderColors.codeBg = '#12122a';
  }
  maybeTrackThemeCreated('variant_switch');
  saveBuilderState();
  renderBuilderPanel();
  applyBuilderPreview();
}

export function applyBuilderPreview() {
  const b = state.builderColors;
  const tempTheme = {
    id: '_builder', name: b.name, category: 'custom',
    codeThemeId: 'codex',
    [b.variant]: {
      surface: b.surface, ink: b.ink, accent: b.accent,
      contrast: b.contrast, sidebar: b.sidebar, codeBg: b.codeBg,
      diffAdded: b.diffAdded, diffRemoved: b.diffRemoved, skill: b.skill
    },
    accents: [b.accent]
  };
  state.setSelectedAccentIdx(0);
  applyShellTheme(tempTheme, b.variant);
  applyPreview(tempTheme, b.variant);
}

export function applyBuilderToCodex() {
  const b = state.builderColors;
  const displayName = b.name && b.name.trim() ? b.name.trim() : 'Custom Theme';
  const str = `codex-theme-v1:${JSON.stringify({
    codeThemeId: 'codex',
    theme: {
      accent: b.accent, contrast: b.contrast,
      fonts: { code: null, ui: null },
      ink: b.ink, opaqueWindows: true,
      semanticColors: { diffAdded: b.diffAdded, diffRemoved: b.diffRemoved, skill: b.skill },
      surface: b.surface
    },
    variant: b.variant
  })}`;
  const btn = document.querySelector('.builder-apply-btn');
  const textEl = btn?.querySelector('.builder-apply-btn-text');
  const hint = document.querySelector('.builder-import-hint');
  const compact = isMobile();
  const applyCopy = getApplyButtonCopy(compact);
  const afterCopy = () => {
    trackEvent('theme_applied', null, {
      theme_id: '_builder',
      theme_name: displayName,
      variant: b.variant,
      source: 'builder',
      custom: true,
      mobile: compact,
    });
    if (textEl) textEl.textContent = applyCopy.successLabel;
    if (btn) btn.classList.add('copied');
    if (hint) hint.textContent = compact ? 'Paste it into Codex later.' : applyCopy.hintText;
    if (!compact) {
      setTimeout(openCodexSettings, 300);
    }
    showApplyHandoffMessage({
      themeName: displayName,
      variant: b.variant,
    });
    setTimeout(() => {
      if (textEl) textEl.textContent = applyCopy.defaultLabel;
      if (btn) btn.classList.remove('copied');
      if (hint) hint.textContent = applyCopy.hintText;
    }, 3000);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(afterCopy).catch(() => fallbackCopy(str, afterCopy));
  } else {
    fallbackCopy(str, afterCopy);
  }
}

export function shareBuilderOnX() {
  const name = state.builderColors.name || 'my custom';
  const text = `I just created a "${name}" theme for Codex with @DexThemes! 🎨\n\nBuild yours at ${window.location.origin}`;
  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

export function shareBuilderTheme() {
  const b = state.builderColors;

  if (!b.name || !b.name.trim()) {
    const input = document.getElementById('builder-name');
    const warning = document.getElementById('builder-name-warning');
    if (input) input.classList.add('name-required');
    if (warning) warning.classList.add('visible');
    input.focus();
    return;
  }

  const str = `codex-theme-v1:${JSON.stringify({
    codeThemeId: 'codex',
    theme: {
      accent: b.accent, contrast: b.contrast,
      fonts: { code: null, ui: null },
      ink: b.ink, opaqueWindows: true,
      semanticColors: { diffAdded: b.diffAdded, diffRemoved: b.diffRemoved, skill: b.skill },
      surface: b.surface
    },
    variant: b.variant
  })}`;

  const btn = document.querySelector('.builder-share-btn');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(() => {
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--green)';
      setTimeout(() => { renderBuilderPanel(); }, 1500);
    });
  } else {
    fallbackCopy(str, () => {
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--green)';
      setTimeout(() => { renderBuilderPanel(); }, 1500);
    });
  }
}
