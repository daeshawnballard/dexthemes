import { escapeHtml } from './utils.js';
import { activateModalFocusTrap, deactivateModalFocusTrap } from './modal-a11y.js';

export function getApplyButtonCopy(compact) {
  return {
    defaultLabel: 'Copy theme',
    successLabel: 'Theme copied to clipboard',
    failureLabel: 'Copy manually',
    hintText: compact
      ? 'Copies the theme to your clipboard.'
      : 'Copies the theme to your clipboard and opens Codex Settings.',
    successHintText: compact
      ? 'Theme copied to your clipboard. Paste it into Codex when ready.'
      : 'Theme copied to your clipboard. Codex Settings is opening.',
    failureHintText: 'Clipboard access was blocked. Select the theme text shown and copy it manually.',
  };
}

export function dismissManualCopyDialog() {
  const overlay = document.querySelector('.codex-manual-copy-overlay');
  if (!overlay) return;
  deactivateModalFocusTrap(overlay);
  overlay.remove();
}

export function showManualCopyDialog(importString) {
  dismissManualCopyDialog();

  const overlay = document.createElement('div');
  overlay.className = 'supporter-modal-overlay codex-manual-copy-overlay';
  overlay.innerHTML = `
    <div class="supporter-modal agent-key-modal codex-manual-copy-modal" tabindex="-1" aria-labelledby="codex-manual-copy-title">
      <button class="supporter-modal-close codex-manual-copy-close" type="button" aria-label="Close manual copy dialog">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="supporter-modal-title" id="codex-manual-copy-title">Copy theme manually</div>
      <div class="supporter-modal-text">Automatic clipboard access was blocked. Copy the selected import string, then paste it into Codex Settings → Appearance → Import theme.</div>
      <textarea class="codex-manual-copy-value" readonly spellcheck="false" autocapitalize="off" aria-label="Codex theme import string"></textarea>
      <div class="agent-key-modal-note">The theme has not been copied or applied yet.</div>
      <button class="supporter-modal-dismiss codex-manual-copy-dismiss" type="button">Close</button>
    </div>
  `;
  const textarea = overlay.querySelector('.codex-manual-copy-value');
  if (textarea) textarea.value = String(importString || '');

  const dismiss = () => dismissManualCopyDialog();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) dismiss();
  });
  overlay.querySelector('.codex-manual-copy-close')?.addEventListener('click', dismiss);
  overlay.querySelector('.codex-manual-copy-dismiss')?.addEventListener('click', dismiss);
  document.body.appendChild(overlay);
  activateModalFocusTrap(overlay, { dialogSelector: '.codex-manual-copy-modal', onClose: dismiss });
  requestAnimationFrame(() => {
    textarea?.focus();
    textarea?.select();
  });
  return overlay;
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
