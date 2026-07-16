// ================================================
// DexThemes — Theme Engine (rendering + preview)
// ================================================

import * as state from './state.js';
import { escapeHtml, isDark, hexToRgb, blendColor, isSixDigitHexColor } from './utils.js';
import { getThemeVariants, themeHasVariant, buildThemeImportString } from './theme-contracts.js';

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
  const winTitle = win.querySelector('.preview-window-title');

  win.style.background = v.surface;
  win.style.borderColor = borderColor;
  titlebar.style.background = v.sidebar;
  titlebar.style.borderBottomColor = borderColor;
  winTitle.style.color = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
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

  document.getElementById('preview-theme-name').textContent = theme.name;
  renderChatContent(v, acc, 'preview-chat');
}

export function renderChatContent(v, acc, containerId) {
  v = getSafePreviewVariant(v, acc);
  if (!v) return;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const c = document.getElementById(containerId);
  const ex = state.EXAMPLES[state.currentExampleIdx];

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

  const el = document.getElementById(containerId);
  el.style.background = v.surface;

  el.innerHTML = `
    <div class="mini-user" style="background:${acc}22;color:${v.ink};">Spawn a subagent to fix lint errors</div>
    <div class="mini-assistant" style="color:${v.ink};">
      Here's a Codex API call to spawn it:
      <div class="mini-code" style="background:${v.codeBg};border:1px solid ${borderColor};">
        <div class="semantic-legend semantic-legend--mini">
          <span class="semantic-chip" style="color:${v.diffAdded};border-color:${borderColor};">+ Added</span>
          <span class="semantic-chip" style="color:${v.skill};border-color:${borderColor};">ƒ Function</span>
        </div>
        <span style="color:${acc}">const</span> <span style="color:${v.ink}">res</span> = <span style="color:${acc}">await</span><br>
        <span style="color:${v.skill}">client.responses.create</span>({<br>
        &nbsp;&nbsp;model: <span style="color:${v.diffAdded}">'codex-mini-latest'</span> })
      </div>
    </div>
  `;
}
