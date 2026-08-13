import { escapeHtml } from './utils.js';

export function getApplyButtonCopy(compact) {
  return {
    defaultLabel: 'Copy theme',
    successLabel: 'Theme copied to clipboard',
    hintText: compact
      ? 'Copies the theme to your clipboard.'
      : 'Copies the theme to your clipboard and opens Codex Settings.',
    successHintText: compact
      ? 'Theme copied to your clipboard. Paste it into Codex when ready.'
      : 'Theme copied to your clipboard. Codex Settings is opening.',
  };
}

let codexLaunchFrame = null;
let codexLaunchResetTimer = null;

export function openCodexSettings() {
  if (typeof document === 'undefined') return;

  if (!codexLaunchFrame) {
    codexLaunchFrame = document.createElement('iframe');
    codexLaunchFrame.setAttribute('aria-hidden', 'true');
    codexLaunchFrame.tabIndex = -1;
    codexLaunchFrame.style.position = 'absolute';
    codexLaunchFrame.style.width = '1px';
    codexLaunchFrame.style.height = '1px';
    codexLaunchFrame.style.opacity = '0';
    codexLaunchFrame.style.pointerEvents = 'none';
    codexLaunchFrame.style.border = '0';
    codexLaunchFrame.style.left = '-9999px';
    document.body.appendChild(codexLaunchFrame);
  }

  if (codexLaunchResetTimer) {
    clearTimeout(codexLaunchResetTimer);
    codexLaunchResetTimer = null;
  }

  codexLaunchFrame.src = 'codex://settings';
  codexLaunchResetTimer = window.setTimeout(() => {
    if (codexLaunchFrame) codexLaunchFrame.removeAttribute('src');
    codexLaunchResetTimer = null;
  }, 1500);
}

export function showApplyHandoffMessage({ themeName, variant }) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  chat.querySelector('.apply-handoff-msg')?.remove();

  const width = window.innerWidth;
  const isDesktop = width > 1024;
  const isTablet = width > 768 && width <= 1024;
  const variantLabel = variant === 'light' ? 'Light' : 'Dark';
  const importLabel = variant === 'light' ? 'Import Light Theme' : 'Import Dark Theme';

  const message = document.createElement('div');
  message.className = 'assistant-msg apply-handoff-msg';
  if (isDesktop) {
    message.innerHTML = `
      <div class="apply-handoff-card">
        <div class="apply-handoff-titlebar">
          <div class="apply-handoff-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div class="apply-handoff-title">Codex</div>
          <div class="apply-handoff-status">Copied to clipboard</div>
        </div>
        <div class="apply-handoff-body">
          <div class="apply-handoff-heading">"${escapeHtml(themeName)}" ${variantLabel.toLowerCase()} theme copied to your clipboard.</div>
          <div class="apply-handoff-subtitle">Next in Codex:</div>
          <div class="apply-handoff-code">
            <div>Appearance</div>
            <div>&rarr; ${importLabel}</div>
            <div>&rarr; Paste</div>
            <div>&rarr; Import</div>
          </div>
          <div class="apply-handoff-note">DexThemes can open Codex Settings, but it can&apos;t jump straight into Appearance yet.</div>
        </div>
      </div>
    `;
  } else if (isTablet) {
    message.innerHTML = `
      <div class="apply-handoff-card apply-handoff-card--tablet">
        <div class="apply-handoff-mini-badge">Copied to clipboard</div>
        <div class="apply-handoff-heading">"${escapeHtml(themeName)}" ${variantLabel.toLowerCase()} theme copied to your clipboard.</div>
        <div class="apply-handoff-subtitle">Next in Codex:</div>
        <div class="apply-handoff-inline-steps">
          Appearance → ${importLabel} → Paste → Import
        </div>
        <div class="apply-handoff-note">DexThemes copied the theme for you. Open Codex whenever you&apos;re ready to paste it.</div>
      </div>
    `;
  } else {
    message.innerHTML = `
      <div class="apply-handoff-card apply-handoff-card--phone">
        <div class="apply-handoff-mini-badge">Copied to clipboard</div>
        <div class="apply-handoff-heading">"${escapeHtml(themeName)}" ${variantLabel.toLowerCase()} theme copied to your clipboard.</div>
        <div class="apply-handoff-note">Later in Codex: Appearance → ${importLabel} → Paste → Import.</div>
      </div>
    `;
  }

  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}
