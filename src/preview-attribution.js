import * as state from './state.js';
import { escapeHtml } from './utils.js';
import { supporterMarkHtml, agentBadgeHtml } from './supporter-ui.js';
import { flagTheme } from './moderation-api.js';
import { showToast } from './toasts.js';
import { getThemeAttribution, getThemeProvenance } from './theme-attribution-model.js';
import { trackEvent } from './analytics-client.js';

export function syncAttributionOverlay(theme = state.selectedTheme) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  chat.querySelector('.attribution-msg')?.remove();
  chat.querySelector('.provenance-msg')?.remove();
  const attribution = getThemeAttribution(theme);
  if (attribution?.label) {
    const msg = document.createElement('div');
    msg.className = 'assistant-msg attribution-msg';
    msg.dataset.author = attribution.label;
    const creatorTags = [
      attribution.isSupporter ? supporterMarkHtml() : '',
      attribution.isAgent ? agentBadgeHtml() : '',
    ].filter(Boolean).join(' ');

    msg.innerHTML = attribution.reportable
      ? `
        <div class="assistant-inline-card assistant-inline-card--muted attribution-card">
          <div class="assistant-inline-body">Theme by ${escapeHtml(attribution.label)}${creatorTags ? ` ${creatorTags}` : ''}.</div>
          <div class="assistant-inline-actions"><button type="button" class="attribution-report-link assistant-inline-link attribution-report-btn" data-action="report-theme-name">Report theme name?</button></div>
        </div>
      `
      : `
        <div class="assistant-inline-card assistant-inline-card--muted attribution-card">
          <div class="assistant-inline-body">Theme by ${escapeHtml(attribution.label)}.</div>
        </div>
      `;

    chat.appendChild(msg);
  }

  const provenance = getThemeProvenance(theme);
  if (provenance) {
    const msg = document.createElement('div');
    msg.className = 'assistant-msg provenance-msg';
    msg.dataset.inspiredBy = provenance.inspiredBy;
    msg.innerHTML = `
      <aside class="assistant-inline-card assistant-inline-card--provenance provenance-card" aria-label="Creative provenance">
        <div class="provenance-card-kicker">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l1.8 4.9L19 10l-5.2 2.1L12 17l-1.8-4.9L5 10l5.2-2.1L12 3z"/></svg>
          <span>Creative provenance</span>
        </div>
        <strong>${escapeHtml(provenance.label)}</strong>
        <span class="provenance-disclosure">${escapeHtml(provenance.disclosure)}</span>
      </aside>
    `;
    chat.appendChild(msg);
  }

  chat.scrollTop = chat.scrollHeight;
}

export function reportThemeName() {
  if (!state.selectedTheme || state.selectedTheme.category !== 'community') return;

  if (state.selectedTheme._convexId && state.flaggedThemes.has(state.selectedTheme._convexId)) {
    showToast('Already reported', 'error');
    return;
  }

  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  chat.querySelector('.report-theme-confirm-msg')?.remove();

  const prompt = document.createElement('div');
  prompt.className = 'assistant-msg report-theme-confirm-msg';
  void trackEvent('report_started', null, {
    theme_id: state.selectedTheme.id,
    theme_name: state.selectedTheme.name,
  });
  prompt.innerHTML = `
    <div class="assistant-inline-card assistant-inline-card--warning attribution-card attribution-card--confirm">
      <div class="assistant-inline-body">Report "<span class="locked-theme-name">${escapeHtml(state.selectedTheme.name)}</span>" for an offensive name?</div>
      <div class="assistant-inline-actions">
        <button type="button" class="assistant-inline-confirm" data-action="confirm-report-theme-name">Report it</button>
        <button type="button" class="assistant-inline-dismiss" data-action="cancel-report-theme-name">Cancel</button>
      </div>
    </div>
  `;

  chat.appendChild(prompt);
  chat.scrollTop = chat.scrollHeight;
}

export function cancelThemeNameReport() {
  document.querySelector('.report-theme-confirm-msg')?.remove();
}

export function confirmThemeNameReport() {
  if (!state.selectedTheme || state.selectedTheme.category !== 'community') return;
  cancelThemeNameReport();

  if (state.selectedTheme._convexId) {
    void trackEvent('report_submitted', null, {
      theme_id: state.selectedTheme.id,
      theme_name: state.selectedTheme.name,
    });
    flagTheme(state.selectedTheme._convexId, 'Offensive theme name');
  } else {
    showToast('Reporting is only available for published community themes', 'error');
  }
}
