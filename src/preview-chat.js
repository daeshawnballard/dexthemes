import * as state from './state.js';
import { escapeHtml, isDark, safeHexColor } from './utils.js';
import { buildSupporterAvatar, supporterMarkHtml } from './supporter-ui.js';

const LIMIT_MESSAGES = [
  "You've exceeded your rate limit. Please wait before sending another message.",
  "Usage cap reached. Your limit resets in ∞ minutes.",
  "You're out of tokens for this session. Try again... eventually.",
  "Rate limit hit. Codex needs a coffee break too. ☕",
  "Whoa, slow down! You've hit your message limit. (Just kidding, this is a theme preview.)",
  "Usage limit reached. Upgrade to DexThemes Pro™ for unlimited messages. (Not a real thing.)",
  "Message limit exceeded. But hey, your theme looks amazing.",
  "You've sent too many requests. Please wait 42 years before trying again.",
  "Rate limit hit. While you wait, did you know Codex stores themes in ~/.codex/?",
  "Limit exceeded. Friendly reminder: the 'Apply in Codex' button works way better than this chat.",
];

let lastLimitIdx = -1;
let welcomeShownThisLoad = false;

function buildInlineCardHtml({ badge, body, tone = 'default', actions = '' }) {
  return `
    <div class="assistant-inline-card assistant-inline-card--${tone}">
      ${badge ? `<div class="assistant-inline-badge">${badge}</div>` : ''}
      <div class="assistant-inline-body">${body}</div>
      ${actions ? `<div class="assistant-inline-actions">${actions}</div>` : ''}
    </div>
  `;
}

export function appendAssistantMessage(className, html) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return null;
  const msg = document.createElement('div');
  msg.className = `assistant-msg ${className}`.trim();
  msg.innerHTML = html;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

export function showInlineSignInPrompt(type, message, options = {}) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  const existing = chat.querySelector(`.${type}-signin-prompt`);
  if (existing) {
    if (options.prepend && existing !== chat.firstElementChild) {
      chat.prepend(existing);
    }
    existing.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return existing;
  }

  const msg = document.createElement('div');
  msg.className = `assistant-msg ${type}-signin-prompt`;
  msg.innerHTML = buildInlineCardHtml({
    badge: 'Account',
    body: escapeHtml(message),
    tone: 'accent',
    actions: `<a class="assistant-inline-link" href="#" data-action="sign-in" data-provider="github" data-prevent-default="true">Continue with GitHub →</a>`,
  });
  if (options.prepend) {
    chat.prepend(msg);
  } else {
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }
  msg.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return msg;
}

export function showSystemMessage(message, className = 'system-msg') {
  appendAssistantMessage(className, buildInlineCardHtml({
    badge: 'DexThemes',
    body: escapeHtml(message),
  }));
}

export function maybeShowWelcomeMessage() {
  if (welcomeShownThisLoad) return;
  const chat = document.getElementById('preview-chat');
  if (!chat || chat.querySelector('.welcome-msg')) return;

  const msg = document.createElement('div');
  msg.className = 'assistant-msg welcome-msg';
  msg.innerHTML = buildInlineCardHtml({
    body: 'Thanks for stopping by DexThemes. Browse, build your own, or copy and share themes you like. &lt;3',
    tone: 'muted',
    actions: '<button class="assistant-inline-dismiss" type="button">Dismiss</button>',
  });

  msg.querySelector('.assistant-inline-dismiss')?.addEventListener('click', () => {
    msg.remove();
  });

  chat.appendChild(msg);
  welcomeShownThisLoad = true;
}

async function fetchSupportersForChat() {
  try {
    const res = await fetch(state.CONVEX_SITE_URL + '/supporters');
    if (!res.ok) return [];
    const data = await res.json();
    return data.supporters || [];
  } catch (e) {
    console.warn('Failed to fetch supporters for chat:', e);
    return [];
  }
}

export async function renderSupportersDelighter(chat, ink) {
  const supporters = await fetchSupportersForChat();
  const card = document.createElement('div');
  card.className = 'assistant-msg supporters-delighter';
  const isFirstWallReveal = supporters.length > 0 && localStorage.getItem('dexthemes-supporters-wall-seen') !== '1';
  if (isFirstWallReveal) localStorage.setItem('dexthemes-supporters-wall-seen', '1');

  const supporterRows = supporters.length
    ? supporters.map((supporter) => {
        const name = supporter.displayName || supporter.username;
        const avatar = buildSupporterAvatar(name, supporter.avatarUrl, true);
        return `
          <div class="supporter-list-item">
            ${avatar}
            <div class="supporter-list-copy">
              <div class="supporter-list-name">${escapeHtml(name)} ${supporterMarkHtml()}</div>
              <div class="supporter-list-handle">@${escapeHtml(supporter.username || 'supporter')}</div>
            </div>
          </div>
        `;
      }).join('')
    : `<div class="supporter-list-empty">Supporters will appear here as they unlock Patron.</div>`;

  card.style.color = ink;
  card.innerHTML = `
    <div class="supporters-card assistant-surface${isFirstWallReveal ? ' supporters-card--welcome' : ''}">
      ${isFirstWallReveal ? `
        <div class="supporters-wall-welcome">
          <div class="supporters-wall-welcome-badge">Welcome to the wall</div>
          <div class="supporters-wall-welcome-title">The first supporter names are live.</div>
          <div class="supporters-wall-welcome-copy">DexThemes finally has its founding wall of supporters. This is the beginning of the room.</div>
        </div>
      ` : ''}
      <div class="supporters-card-header">
        <div class="supporters-card-title">Supporters</div>
        <div class="supporters-card-badge">${supporters.length}</div>
      </div>
      <p class="supporters-card-note">Heartfelt thanks to everyone who backed DexThemes through Buy Me a Coffee. Your support keeps the gallery alive, weird, and shipping.</p>
      <div class="supporter-list">
        ${supporterRows}
      </div>
    </div>
  `;
  chat.appendChild(card);
  chat.scrollTop = chat.scrollHeight;
}

export function showUnlockPrompt(themeName, actionKey) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  chat.querySelector('.locked-prompt')?.remove();

  const name = themeName ? escapeHtml(themeName) : 'This theme';
  const unlock = state.UNLOCK_THEMES[actionKey];
  if (!unlock) return;

  const prompt = document.createElement('div');
  prompt.className = 'assistant-msg locked-prompt';
  prompt.innerHTML = buildInlineCardHtml({
    badge: 'Locked',
    body: `The "<span class="locked-theme-name">${name}</span>" theme is locked.`,
    tone: 'locked',
    actions: buildUnlockActionHtml(actionKey, unlock),
  });

  chat.appendChild(prompt);
  prompt.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function buildUnlockActionHtml(actionKey, unlock) {
  const prompt = escapeHtml(unlock.prompt);

  if (actionKey === 'buy_coffee') {
    return `<a class="locked-prompt-link" href="#" data-action="run-supporter-unlock" data-unlock-action="${actionKey}" data-prevent-default="true">${prompt} →</a>`;
  }

  if (unlock.link) {
    return `<a class="locked-prompt-link" href="${unlock.link}" target="_blank" rel="noopener noreferrer" data-action="run-unlock-action" data-unlock-action="${actionKey}">${prompt} →</a>`;
  }

  const deeplinkAction = {
    create: 'run-create-unlock',
    lucky: 'run-lucky-unlock',
    pair: 'run-complete-pair-unlock',
    api: 'run-api-unlock',
    agent: 'run-agent-unlock',
    share: 'run-share-unlock',
    signin: 'run-signin-unlock',
    like: 'run-like-unlock',
    leaderboard: 'run-leaderboard-unlock',
    install: 'run-install-unlock',
  }[unlock.deeplink];

  if (deeplinkAction) {
    return `<a class="locked-prompt-link" href="#" data-action="${deeplinkAction}" data-unlock-action="${actionKey}" data-prevent-default="true">${prompt} →</a>`;
  }

  return `<span class="locked-prompt-link">${prompt} →</span>`;
}

export function showLockedThemeShell(theme, actionKey) {
  const nameEl = document.getElementById('preview-theme-name');
  if (nameEl) nameEl.textContent = theme.name;

  const chat = document.getElementById('preview-chat');
  if (chat) {
    chat.innerHTML = `
      <div class="assistant-msg locked-theme-shell-msg">
        <div class="locked-theme-shell-card assistant-surface" aria-label="Locked theme preview">
          <div class="locked-theme-shell-eyebrow">Unlockable theme</div>
          <div class="locked-theme-shell-hero">
            <div class="locked-theme-shell-icon" aria-hidden="true">✦</div>
            <div>
              <div class="locked-theme-shell-title">${escapeHtml(theme.name)}</div>
              <div class="locked-theme-shell-subtitle">Reserved until you earn it</div>
            </div>
          </div>
          <p class="locked-theme-shell-copy">DexThemes keeps exclusive themes fully opaque. The preview, palette, and import string stay hidden until the unlock is actually yours.</p>
          <div class="locked-theme-shell-hint">Unlock it to reveal the real preview, variant cards, and import flow.</div>
          <div class="locked-theme-shell-chrome" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
  }

  const panel = document.querySelector('.panel');
  if (panel) {
    panel.innerHTML = `
      <div class="locked-theme-panel assistant-surface">
        <div class="locked-theme-panel-title">Exclusive theme</div>
        <p>The right rail stays sealed until this unlock is earned.</p>
        <div class="locked-theme-panel-hint">No preview, no import string, no variant cards until it belongs to you.</div>
      </div>
    `;
  }

  showUnlockPrompt(theme.name, actionKey);
}

export function showSubmitDelighter(themeName, variant, colors) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;

  const accent = safeHexColor(colors.accent, '#0169CC');
  const authorName = state.currentUser?.displayName || state.currentUser?.username || 'You';
  const userMsg = document.createElement('div');
  userMsg.className = 'user-msg';
  userMsg.style.background = accent + '22';
  userMsg.style.color = 'var(--text-primary)';
  userMsg.textContent = `Submit "${themeName}"`;
  chat.appendChild(userMsg);

  const card = document.createElement('div');
  card.className = 'assistant-msg submit-delighter';
  const paletteColors = [colors.surface, colors.accent, colors.skill, colors.diffAdded, colors.diffRemoved, colors.ink]
    .map((color) => safeHexColor(color, ''))
    .filter(Boolean);
  card.innerHTML = `
    <div class="delighter-card assistant-surface">
      <div class="delighter-file">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span class="delighter-filename">${escapeHtml(themeName.toLowerCase().replace(/\s+/g, '-'))}.json</span>
      </div>
      <div class="delighter-stats">+9 colors · ${variant} variant</div>
      <div class="delighter-palette-bar">
        ${paletteColors.map((c) => `<div class="delighter-palette-swatch" style="background:${c}"></div>`).join('')}
      </div>
      <div class="delighter-author">by ${escapeHtml(authorName)} · just now</div>
    </div>
  `;
  chat.appendChild(card);
  chat.scrollTop = chat.scrollHeight;
}

async function buildUnlockDelighterHtml(action, unlock, fetchLeaderboard) {
  if (action === 'buy_coffee') {
    return `
      <div class="unlock-delighter unlock-delighter--supporter assistant-surface">
        <div class="unlock-delighter-badge">Supporter unlocked</div>
        <div class="unlock-delighter-title">Patron is yours.</div>
        <p>Thank you for backing DexThemes. Your supporter frame and badge are now live across the app.</p>
        <div class="unlock-delighter-tags">
          <span>Avatar frame</span>
          <span>Leaderboard badge</span>
          <span>/supporters honor roll</span>
        </div>
      </div>
    `;
  }

  if (action === 'top10_monthly') {
    const monthlyEntry = await findCurrentUserMonthlyLeaderboardEntry(fetchLeaderboard);
    const themeLine = monthlyEntry
      ? `<p><strong>${escapeHtml(monthlyEntry.name)}</strong> broke into the monthly board at <strong>#${monthlyEntry.rank}</strong>.</p>`
      : `<p>Your theme made the climb. This unlock is reserved for creators who break into the monthly leaderboard.</p>`;
    return `
      <div class="unlock-delighter unlock-delighter--summit assistant-surface">
        <div class="unlock-delighter-badge">Monthly Top 10</div>
        <div class="unlock-delighter-title">Summit unlocked.</div>
        ${themeLine}
        <div class="unlock-delighter-tags">
          <span>Leaderboard placement</span>
          <span>Seasonal flex</span>
          <span>Peak creator energy</span>
        </div>
      </div>
    `;
  }

  return `<p>You've unlocked the "${escapeHtml(unlock.name)}" theme!</p>`;
}

async function findCurrentUserMonthlyLeaderboardEntry(fetchLeaderboard) {
  if (!state.currentUser?._id) return null;
  try {
    const leaderboard = await fetchLeaderboard();
    const idx = (leaderboard.monthly || []).findIndex((entry) => entry.authorId === state.currentUser._id);
    if (idx === -1) return null;
    return {
      rank: idx + 1,
      ...(leaderboard.monthly[idx] || {}),
    };
  } catch {
    return null;
  }
}

export async function appendUnlockDelighter(action, unlock, fetchLeaderboard) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;
  const msg = document.createElement('div');
  msg.className = 'assistant-msg locked-prompt';
  msg.innerHTML = await buildUnlockDelighterHtml(action, unlock, fetchLeaderboard);
  chat.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

export async function appendSecretUnlockDelighter(themeName) {
  const chat = document.getElementById('preview-chat');
  if (!chat) return;
  const msg = document.createElement('div');
  msg.className = 'assistant-msg locked-prompt';
  msg.innerHTML = `
    <div class="unlock-delighter unlock-delighter--secret assistant-surface">
      <div class="unlock-delighter-badge">Hidden unlock</div>
      <div class="unlock-delighter-title">${escapeHtml(themeName)} unlocked.</div>
      <p>You found the window controls, poked the chat, and DexThemes noticed. This one only appears after you actually use the shell.</p>
      <div class="unlock-delighter-tags">
        <span>close</span>
        <span>minimize</span>
        <span>maximize</span>
        <span>chat</span>
      </div>
    </div>
  `;
  chat.appendChild(msg);
  msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

export async function maybeShowPendingUnlockDelighter(previousUnlocks, currentUnlocks, fetchLeaderboard) {
  const pendingAction = localStorage.getItem('dexthemes-pending-unlock-action');
  if (!pendingAction) return;

  const unlock = state.UNLOCK_THEMES[pendingAction];
  if (!unlock) {
    localStorage.removeItem('dexthemes-pending-unlock-action');
    return;
  }

  if (!currentUnlocks.has(unlock.themeId) || previousUnlocks.has(unlock.themeId)) {
    return;
  }

  await appendUnlockDelighter(pendingAction, unlock, fetchLeaderboard);
  localStorage.removeItem('dexthemes-pending-unlock-action');
}

export function initPreviewChat() {
  const input = document.getElementById('preview-input-text');
  const sendBtn = document.getElementById('preview-send-btn');
  if (!input || !sendBtn) return;

  const isSupportersPrompt = (value) => {
    const normalized = value.trim().toLowerCase().replace(/^[!/]+/, '');
    return normalized === 'supporter' || normalized === 'supporters';
  };

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    const chat = document.getElementById('preview-chat');
    const v = state.selectedTheme[state.selectedVariant];
    if (!chat || !v) return;
    const acc = safeHexColor(state.selectedTheme.accents?.[state.selectedAccentIdx] || v.accent, '#0169CC');
    const ink = safeHexColor(v.ink, '#F9FAFB');
    const surface = safeHexColor(v.surface, '#111827');
    const dark = isDark(surface);

    const userMsg = document.createElement('div');
    userMsg.className = 'user-msg';
    userMsg.style.background = acc + '22';
    userMsg.style.color = ink;
    userMsg.textContent = text;
    chat.appendChild(userMsg);
    void import('./unlock-api.js').then((m) => m.recordSecretInteraction('dtx.shell.4'));

    if (isSupportersPrompt(text)) {
      await renderSupportersDelighter(chat, ink);
      return;
    }

    let idx;
    do {
      idx = Math.floor(Math.random() * LIMIT_MESSAGES.length);
    } while (idx === lastLimitIdx && LIMIT_MESSAGES.length > 1);
    lastLimitIdx = idx;

    const limitMsg = document.createElement('div');
    limitMsg.className = 'assistant-msg limit-msg';
    limitMsg.innerHTML = buildInlineCardHtml({
      badge: 'Heads up',
      body: '<span class="typing-dots">•••</span>',
      tone: 'warning',
    });
    chat.appendChild(limitMsg);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
      limitMsg.innerHTML = buildInlineCardHtml({
        badge: 'Heads up',
        body: escapeHtml(LIMIT_MESSAGES[idx]),
        tone: 'warning',
      });
      chat.scrollTop = chat.scrollHeight;
    }, 800);
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}
