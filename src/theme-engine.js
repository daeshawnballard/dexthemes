// ================================================
// DexThemes — Theme Engine (rendering + preview)
// ================================================

import * as state from './state.js';
import { escapeHtml, isDark, hexToRgb, blendColor, isSixDigitHexColor } from './utils.js';
import { getThemeVariants, themeHasVariant, buildThemeImportString } from './theme-contracts.js';
import { getPreviewExamples } from './preview-examples.js';

const PREVIEW_REQUIRED_COLOR_KEYS = ['surface', 'ink', 'accent', 'diffAdded', 'diffRemoved', 'skill'];

function getSafePreviewVariant(variant, accent) {
  if (!variant || !PREVIEW_REQUIRED_COLOR_KEYS.every((key) => isSixDigitHexColor(variant[key]))) return null;
  if (!isSixDigitHexColor(accent)) return null;
  if (variant.sidebar != null && !isSixDigitHexColor(variant.sidebar)) return null;
  if (variant.codeBg != null && !isSixDigitHexColor(variant.codeBg)) return null;
  return {
    ...variant,
    sidebar: variant.sidebar || variant.surface,
    codeBg: variant.codeBg || variant.surface,
  };
}

export function getVariants(theme) {
  return getThemeVariants(theme);
}

export function hasVariant(theme, variant) {
  return themeHasVariant(theme, variant);
}

export function buildImportString(theme, variant, accentIdx) {
  return buildThemeImportString(theme, variant, accentIdx);
}

export function getThemeSummary(theme) {
  return String(theme?.summary || theme?._summary || '').trim();
}

export function syncThemeHeader(theme) {
  const name = document.getElementById('preview-theme-name');
  const summary = document.getElementById('preview-theme-summary');
  if (name) name.textContent = theme?.name || 'Codex';
  if (!summary) return;

  const copy = getThemeSummary(theme);
  summary.textContent = copy;
  summary.hidden = !copy;
}

export function applyShellTheme(theme, variant) {
  const source = theme[variant];
  const acc = theme.accents?.[state.selectedAccentIdx] || source?.accent;
  const v = getSafePreviewVariant(source, acc);
  if (!v) return;
  const dark = isDark(v.surface);
  const root = document.documentElement.style;

  root.setProperty('--bg', v.surface);
  root.setProperty('--sidebar-bg', v.sidebar);
  root.setProperty('--surface', blendColor(v.surface, dark ? 15 : -8));
  root.setProperty('--surface-raised', blendColor(v.surface, dark ? 25 : -15));
  root.setProperty('--border', dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
  root.setProperty('--border-strong', dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)');
  root.setProperty('--text-primary', v.ink);
  root.setProperty('--text-secondary', dark ? blendColor(v.ink, -60) : blendColor(v.ink, 60));
  root.setProperty('--text-muted', dark ? blendColor(v.surface, 70) : blendColor(v.surface, -70));
  root.setProperty('--accent', acc);
  root.setProperty('--accent-hover', blendColor(acc, 20));
  root.setProperty('--accent-dim', `rgba(${hexToRgb(acc)}, 0.12)`);
  root.setProperty('--accent-border', `rgba(${hexToRgb(acc)}, 0.25)`);
}

export function applyPreview(theme, variant) {
  const source = theme[variant];
  const acc = theme.accents?.[state.selectedAccentIdx] || source?.accent;
  const v = getSafePreviewVariant(source, acc);
  if (!v) return;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const win = document.getElementById('preview-window');
  const titlebar = document.getElementById('preview-titlebar');
  const chat = document.getElementById('preview-chat');
  const inputBar = document.getElementById('preview-input-bar');
  const inputInner = document.getElementById('preview-input-inner');
  const inputText = document.getElementById('preview-input-text');
  const sendBtn = document.getElementById('preview-send-btn');
  const setupMessage = document.getElementById('platform-setup-message');
  const platformContext = win.querySelector('.preview-platform-context');

  win.style.background = v.surface;
  win.style.borderColor = borderColor;
  titlebar.style.background = v.sidebar;
  titlebar.style.borderBottomColor = borderColor;
  if (platformContext) platformContext.style.color = dark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.62)';
  win.querySelectorAll('.preview-dot').forEach(d => {
    d.style.background = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  });
  chat.style.background = v.surface;
  inputBar.style.background = v.sidebar;
  inputBar.style.borderTopColor = borderColor;
  inputInner.style.background = v.codeBg;
  inputInner.style.border = `1px solid ${borderColor}`;
  inputText.style.color = v.ink;
  inputText.style.setProperty('--placeholder-color', dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)');
  sendBtn.style.background = acc;
  sendBtn.querySelector('svg').style.color = '#fff';
  if (setupMessage) setupMessage.style.color = v.ink;

  syncThemeHeader(theme);
  renderChatContent(v, acc, 'preview-chat', theme);
}

export function renderChatContent(v, acc, containerId, theme = null) {
  v = getSafePreviewVariant(v, acc);
  if (!v) return;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const c = document.getElementById(containerId);
  const examples = getPreviewExamples(state.selectedPlatformId);
  const ex = examples[state.currentExampleIdx % examples.length];
  const summary = getThemeSummary(theme);
  const summaryHtml = summary
    ? `<p class="preview-theme-summary"><span class="preview-theme-summary-label">Palette direction</span>${escapeHtml(summary)}</p>`
    : '';

  const codeHtml = ex.code.map(part => {
    if (typeof part === 'string') return escapeHtml(part).replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;');
    const color = part.type === 'kw' ? acc : part.type === 'str' ? v.diffAdded : part.type === 'fn' ? v.skill : v.ink;
    return `<span style="color:${color}">${escapeHtml(part.text)}</span>`;
  }).join('');

  c.innerHTML = `
    <div class="user-msg" style="background:${acc}22;color:${v.ink};">
      ${escapeHtml(ex.user)}
    </div>
    <div class="assistant-msg" style="color:${v.ink};">
      ${summaryHtml}
      <p>${escapeHtml(ex.intro)}</p>
      <div class="code-block" style="background:${v.codeBg};border:1px solid ${borderColor};color:${v.ink};">
        <div class="semantic-legend">
          <span class="semantic-chip" style="color:${v.diffAdded};border-color:${borderColor};">+ Added</span>
          <span class="semantic-chip" style="color:${v.skill};border-color:${borderColor};">ƒ Function</span>
        </div>
        <span style="color:${mutedColor}">${escapeHtml(ex.comment)}</span><br>
        ${codeHtml}
      </div>
    </div>
    <div class="user-msg" style="background:${acc}22;color:${v.ink};">
      ${escapeHtml(ex.followUp)}
    </div>
  `;
}

export function renderMiniPreview(containerId, theme, variant) {
  const source = theme[variant];
  const acc = theme.accents?.[state.selectedAccentIdx] || source?.accent;
  const v = getSafePreviewVariant(source, acc);
  if (!v) return;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const summary = getThemeSummary(theme);
  const summaryHtml = summary ? `<div class="mini-theme-summary">${escapeHtml(summary)}</div>` : '';
  const platformName = state.selectedPlatform.shortName;
  const examples = getPreviewExamples(state.selectedPlatformId);
  const example = examples[state.currentExampleIdx % examples.length];

  const el = document.getElementById(containerId);
  el.style.background = v.surface;

  el.innerHTML = `
    <div class="mini-user" style="background:${acc}22;color:${v.ink};">${escapeHtml(example.user)}</div>
    <div class="mini-assistant" style="color:${v.ink};">
      ${summaryHtml}
      ${escapeHtml(`A ${platformName} conversation in this palette:`)}
      <div class="mini-code" style="background:${v.codeBg};border:1px solid ${borderColor};">
        <div class="semantic-legend semantic-legend--mini">
          <span class="semantic-chip" style="color:${v.diffAdded};border-color:${borderColor};">+ Added</span>
          <span class="semantic-chip" style="color:${v.skill};border-color:${borderColor};">ƒ Function</span>
        </div>
        <span style="color:${acc}">const</span> <span style="color:${v.ink}">preview</span> = {<br>
        &nbsp;&nbsp;platform: <span style="color:${v.diffAdded}">'${escapeHtml(state.selectedPlatformId)}'</span>,<br>
        &nbsp;&nbsp;variant: <span style="color:${v.diffAdded}">'${escapeHtml(variant)}'</span> }
      </div>
    </div>
  `;
}
