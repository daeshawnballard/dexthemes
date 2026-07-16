import * as state from './state.js';
import { escapeHtml, fallbackCopy } from './utils.js';
import { showLockedThemeShell as renderLockedThemeShell } from './preview-chat.js';
import { activateModalFocusTrap, deactivateModalFocusTrap } from './modal-a11y.js';
import { grantUnlockAction } from './unlock-api.js';

export function dismissSupporterPrompt() {
  const prompt = document.querySelector('.locked-prompt');
  if (prompt) {
    prompt.style.opacity = '0';
    prompt.style.transition = 'opacity 0.2s';
    setTimeout(() => prompt.remove(), 200);
  }
}

export function onUnlockAction(actionKey) {
  grantUnlockAction(actionKey);
}

export function showLockedThemeShell(theme, actionKey) {
  renderLockedThemeShell(theme, actionKey);
}

export async function copySupporterClaimToken(token) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(token);
      return true;
    }
  } catch {}

  let copied = false;
  fallbackCopy(token, () => {
    copied = true;
  });
  return copied;
}

export function dismissSupporterClaimModal() {
  const overlay = document.querySelector('.supporter-claim-modal-overlay');
  if (!overlay) return;
  deactivateModalFocusTrap(overlay);
  overlay.remove();
}

export function showSupporterClaimModal({ token, donateUrl, expiresAt, copied, alreadySupporter, publicListing, onCopy }) {
  dismissSupporterClaimModal();

  const overlay = document.createElement('div');
  overlay.className = 'supporter-modal-overlay supporter-claim-modal-overlay';
  overlay.onclick = (event) => {
    if (event.target === overlay) dismissSupporterClaimModal();
  };

  const expiresText = expiresAt
    ? new Date(expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  overlay.innerHTML = alreadySupporter
    ? `
      <div class="supporter-modal supporter-claim-modal">
        <div class="sr-only" id="supporter-claim-modal-title">Supporter claim status</div>
        <button class="supporter-modal-close" aria-label="Close supporter claim modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="supporter-modal-title">Already Unlocked</div>
        <div class="supporter-modal-text">Your account already has supporter status, so Patron should be available now. ${publicListing ? 'Your public GitHub profile is opted in to the supporter wall.' : 'Your supporter-wall profile remains private.'}</div>
        <button class="supporter-modal-dismiss supporter-claim-close-btn">Close</button>
      </div>
    `
    : `
      <div class="supporter-modal supporter-claim-modal">
        <div class="sr-only" id="supporter-claim-modal-title">Support DexThemes</div>
        <button class="supporter-modal-close" aria-label="Close supporter claim modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="supporter-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21c-4.97-4.15-8-7.13-8-10.5A4.5 4.5 0 0 1 8.5 6c1.54 0 2.74.73 3.5 1.88A4.32 4.32 0 0 1 15.5 6 4.5 4.5 0 0 1 20 10.5C20 13.87 16.97 16.85 12 21z"/></svg>
        </div>
        <div class="supporter-modal-title">Support DexThemes</div>
        <div class="supporter-modal-text">
          Paste this claim code into your Buy Me a Coffee message so DexThemes can match the donation to your account.${expiresText ? ` This code expires ${escapeHtml(expiresText)}.` : ''}
        </div>
        <div class="agent-key-modal-note">
          DexThemes retains the support transaction ID, supporter name/email supplied by Buy Me a Coffee, amount, currency, and claim status for verification, fraud handling, and revocation. ${publicListing ? 'You opted in to show your public GitHub profile and unlock date on the supporter wall.' : 'You stayed off the public supporter wall; Patron still unlocks normally.'}
        </div>
        <code class="agent-key-modal-code supporter-claim-code">${escapeHtml(token || '')}</code>
        <div class="agent-key-modal-note">${copied ? 'Claim code copied already.' : 'Copy was unavailable, so use the code shown here manually.'}</div>
        <div class="supporter-claim-steps">
          <div>1. Open Buy Me a Coffee</div>
          <div>2. Donate any amount</div>
          <div>3. Paste this code into the message</div>
        </div>
        <div class="agent-key-modal-actions supporter-claim-actions">
          <button class="supporter-modal-cta supporter-claim-copy-btn">Copy code</button>
          <a class="supporter-modal-cta supporter-claim-open-btn" href="${escapeHtml(donateUrl)}" target="_blank" rel="noopener noreferrer">Open Buy Me a Coffee</a>
        </div>
        <button class="supporter-modal-dismiss supporter-claim-close-btn">Close</button>
      </div>
    `;

  document.body.appendChild(overlay);
  const dialog = overlay.querySelector('.supporter-claim-modal');
  if (dialog) {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'supporter-claim-modal-title');
    dialog.setAttribute('tabindex', '-1');
  }

  overlay.querySelector('.supporter-modal-close')?.addEventListener('click', dismissSupporterClaimModal);
  overlay.querySelector('.supporter-claim-close-btn')?.addEventListener('click', dismissSupporterClaimModal);
  overlay.querySelector('.supporter-claim-copy-btn')?.addEventListener('click', async () => {
    if (onCopy) await onCopy(token);
  });
  activateModalFocusTrap(overlay, { dialogSelector: '.supporter-claim-modal', onClose: dismissSupporterClaimModal });
}
