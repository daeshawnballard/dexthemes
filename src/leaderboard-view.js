import * as state from './state.js';
import { escapeHtml } from './utils.js';
import { fetchLeaderboard } from './api.js';
import { supporterMarkHtml, buildSupporterAvatar, agentBadgeHtml } from './supporter-ui.js';
import { trackEvent } from './analytics-client.js';

let leaderboardData = null;
let leaderboardTab = 'daily';
let countdownInterval = null;

export function toggleLeaderboard() {
  if (state.leaderboardVisible) {
    hideLeaderboard();
  } else {
    showLeaderboard();
  }
}

export function switchLeaderboardTab(tab) {
  leaderboardTab = tab;
  void trackEvent('leaderboard_tab_selected', null, { tab });
  const lb = document.getElementById('leaderboard-view');
  if (lb && leaderboardData) renderLeaderboardContent(lb, leaderboardData);
}

async function showLeaderboard() {
  if (state.profileVisible) hideProfileView();
  const win = document.getElementById('preview-window');
  const lb = document.getElementById('leaderboard-view');
  const previewArea = document.querySelector('.preview-area');
  if (!win || !lb) return;

  state.setLeaderboardVisible(true);
  win.style.display = 'none';
  lb.style.display = '';
  previewArea?.classList.add('preview-area--detail');
  void trackEvent('leaderboard_viewed', null, { source: 'toggle' });

  leaderboardData = await fetchLeaderboard();
  renderLeaderboardContent(lb, leaderboardData);
}

function renderLeaderboardContent(lb, data) {
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  const renderRow = (entry, rank, primaryKey, secondaryKey, secondaryLabel) => {
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    const rankClass = rank <= 3 ? ' top-three' : '';
    const primary = entry[primaryKey] ?? 0;
    const secondary = entry[secondaryKey] ?? 0;
    const primaryLabel = primaryKey === 'likes'
      ? '♥'
      : primaryKey === 'qualifiedAdoptions'
        ? 'qualified'
        : 'copies';
    const authorName = entry.authorName || 'Unknown';
    const authorAvatar = buildSupporterAvatar(authorName, entry.authorAvatarUrl, !!entry.authorIsSupporter);
    const creatorTags = [
      entry.authorIsSupporter ? supporterMarkHtml() : '',
      entry.authorIsAgent ? agentBadgeHtml() : '',
    ].filter(Boolean).join(' ');
    const themeId = escapeHtml(entry.themeId);
    return `
      <div class="leaderboard-row${rankClass}" role="button" tabindex="0" aria-label="Open ${escapeHtml(entry.name)} by ${escapeHtml(authorName)}" data-action="open-leaderboard-theme" data-action-keyboard="true" data-theme-id="${themeId}">
        <span class="leaderboard-rank">${medal || rank}</span>
        <div class="leaderboard-main">
          <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
          <span class="leaderboard-author">
            ${authorAvatar}
            <span class="leaderboard-author-name">by ${escapeHtml(authorName)}${creatorTags ? ` ${creatorTags}` : ''}</span>
          </span>
        </div>
        <span class="leaderboard-stats">
          <span class="leaderboard-stat-primary">${primary} ${primaryLabel}</span>
          <span class="leaderboard-stat-secondary">${secondary} ${secondaryLabel}</span>
        </span>
      </div>
    `;
  };

  let rows = '';
  let emptyMsg = '';
  const tab = leaderboardTab;

  const entries = data[tab] || [];
  if (tab === 'daily' || tab === 'weekly') {
    rows = entries.map((entry, index) => renderRow(entry, index + 1, 'qualifiedAdoptions', 'copies', 'copies')).join('');
    emptyMsg = tab === 'daily'
      ? 'No qualified theme activity today yet.'
      : 'No qualified theme activity this week yet.';
  } else if (tab === 'monthly') {
    rows = entries.map((entry, index) => renderRow(entry, index + 1, 'copies', 'rawCopies', 'copies')).join('');
    emptyMsg = 'The month is young. Be the first to top the board.';
  } else {
    rows = entries.map((entry, index) => renderRow(entry, index + 1, 'copies', 'likes', '♥')).join('');
    emptyMsg = 'No data yet';
  }

  let unlockCallout = '';
  let personalRank = '';
  if (tab === 'daily') {
    unlockCallout = `<div class="leaderboard-unlock-callout">
      <span>☀️ The qualified #1 theme today unlocks <strong>Golden Hour</strong> when the UTC day closes</span>
      <span class="leaderboard-countdown" id="leaderboard-countdown"></span>
    </div>`;
  } else if (tab === 'weekly') {
    unlockCallout = `<div class="leaderboard-unlock-callout">
      <span>⭐ The qualified #1 theme this week unlocks <strong>Headliner</strong> after Sunday UTC</span>
      <span class="leaderboard-countdown" id="leaderboard-countdown"></span>
    </div>`;
  } else if (tab === 'monthly') {
    unlockCallout = `<div class="leaderboard-unlock-callout">
      <span>🏆 Top 10 this month unlocks <strong>Summit</strong></span>
      <span class="leaderboard-countdown" id="leaderboard-countdown"></span>
    </div>`;
  }
  if (state.currentUser && entries.length) {
    const idx = entries.findIndex((entry) => entry.authorId === state.currentUser._id);
    if (idx >= 0) {
      personalRank = `<div class="leaderboard-personal-rank">Your rank: <strong>#${idx + 1}</strong> of ${entries.length}</div>`;
    }
  }

  lb.innerHTML = `
    <div class="leaderboard-container">
      <div class="leaderboard-header">
        <div class="leaderboard-title">Leaderboard</div>
        <button class="leaderboard-close" data-action="close-leaderboard" aria-label="Close leaderboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="leaderboard-tabs">
        <button class="leaderboard-tab${tab === 'daily' ? ' active' : ''}" data-action="switch-leaderboard-tab" data-tab="daily">Today</button>
        <button class="leaderboard-tab${tab === 'weekly' ? ' active' : ''}" data-action="switch-leaderboard-tab" data-tab="weekly">This Week</button>
        <button class="leaderboard-tab${tab === 'monthly' ? ' active' : ''}" data-action="switch-leaderboard-tab" data-tab="monthly">${monthName}</button>
        <button class="leaderboard-tab${tab === 'allTime' ? ' active' : ''}" data-action="switch-leaderboard-tab" data-tab="allTime">All Time</button>
      </div>
      ${unlockCallout}
      ${personalRank}
      <div class="leaderboard-body">
        ${rows || `<div class="leaderboard-empty-state"><p>${emptyMsg}</p></div>`}
      </div>
    </div>
  `;

  if (tab !== 'allTime') startCountdownTimer(tab);
}

function startCountdownTimer(period) {
  if (countdownInterval) clearInterval(countdownInterval);
  const updateCountdown = () => {
    const el = document.getElementById('leaderboard-countdown');
    if (!el) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      return;
    }
    const now = new Date();
    let nextBoundary;
    if (period === 'daily') {
      nextBoundary = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    } else if (period === 'weekly') {
      const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
      nextBoundary = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday);
    } else {
      nextBoundary = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
    }
    const diff = nextBoundary - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    el.textContent = days > 0 ? `${days}d ${hours}h ${mins}m left` : `${hours}h ${mins}m left`;
  };
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 60000);
}

function hideProfileView() {
  const win = document.getElementById('preview-window');
  const pv = document.getElementById('profile-view');
  const previewArea = document.querySelector('.preview-area');
  if (!win || !pv) return;
  state.setProfileVisible(false);
  pv.style.display = 'none';
  win.style.display = '';
  if (!state.leaderboardVisible) previewArea?.classList.remove('preview-area--detail');
}

export function hideLeaderboard() {
  const win = document.getElementById('preview-window');
  const lb = document.getElementById('leaderboard-view');
  const previewArea = document.querySelector('.preview-area');
  if (!win || !lb) return;

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  state.setLeaderboardVisible(false);
  lb.style.display = 'none';
  win.style.display = '';
  if (!state.profileVisible) previewArea?.classList.remove('preview-area--detail');
}
