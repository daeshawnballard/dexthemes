// ================================================
// DexThemes — Unlocks, Leaderboard, and Supporters
// ================================================

import * as state from './state.js';
import { CONVEX_SITE_URL } from './config.js';
import {
  appendSecretUnlockDelighter,
  appendUnlockDelighter,
  maybeShowPendingUnlockDelighter,
} from './preview-chat.js';
import { showToast } from './toasts.js';
import { trackEvent } from './analytics-client.js';
import { authFetch } from './session-auth.js';

export async function grantUnlockAction(action) {
  if (!state.currentUser) return;
  const unlock = state.UNLOCK_THEMES[action];
  if (!unlock || state.userUnlocks.has(unlock.themeId)) return;

  try {
    const res = await authFetch(CONVEX_SITE_URL + '/unlocks/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.unlocked) {
        state.userUnlocks.add(unlock.themeId);
        void trackEvent('unlock_granted', null, {
          action,
          theme_id: data.themeId || unlock.themeId,
          theme_name: data.themeName || unlock.name,
          source: 'action',
        });
        const { renderAuthUI } = await import('./auth.js');
        renderAuthUI();
        if (window.innerWidth <= 1024) {
          const { renderMobileBrowse } = await import('./mobile-browse.js');
          renderMobileBrowse();
        }
        await appendUnlockDelighter(action, unlock, fetchLeaderboard);
      }
    }
  } catch (error) {
    console.warn('Unlock grant failed:', error);
  }
}

export async function fetchMyUnlocks(isRetry = false) {
  try {
    const res = await authFetch(CONVEX_SITE_URL + '/me/unlocks');
    if (res.ok) {
      const data = await res.json();
      const previousUnlocks = new Set(state.userUnlocks);
      const ids = new Set((data.unlocks || []).map((unlock) => unlock.themeId));
      state.setUserUnlocks(ids);
      await maybeShowPendingUnlockDelighter(previousUnlocks, ids, fetchLeaderboard);
    } else if (!isRetry) {
      setTimeout(() => fetchMyUnlocks(true), 3000);
    }
  } catch (error) {
    console.warn('Failed to fetch unlocks:', error);
    if (!isRetry) {
      setTimeout(() => fetchMyUnlocks(true), 3000);
    }
  }
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(CONVEX_SITE_URL + '/leaderboard');
    if (res.ok) {
      return await res.json();
    }
    console.warn('Leaderboard fetch returned status:', res.status);
    showToast("Couldn't load leaderboard", 'error');
  } catch (error) {
    console.warn('Failed to fetch leaderboard:', error);
    showToast("Couldn't load leaderboard", 'error');
  }
  return { daily: [], weekly: [], monthly: [], allTime: [], periods: {} };
}

export async function fetchSupporters() {
  try {
    const res = await fetch(CONVEX_SITE_URL + '/supporters');
    if (res.ok) {
      const data = await res.json();
      return data.supporters || [];
    }
    console.warn('Supporters fetch returned status:', res.status);
  } catch (error) {
    console.warn('Failed to fetch supporters:', error);
  }
  return [];
}

export async function createSupporterClaim({ publicListing = false } = {}) {
  const res = await authFetch(CONVEX_SITE_URL + '/supporters/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicListing }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create supporter claim');
  }
  return data;
}

export async function recordSecretInteraction(activity) {
  if (!state.currentUser || state.userUnlocks.has('triple-dot')) return;

  try {
    const res = await authFetch(CONVEX_SITE_URL + '/me/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activity }),
    });
    if (!res.ok) return;

    const data = await res.json();
    if (!data.unlocked || !data.themeId) return;

    state.userUnlocks.add(data.themeId);
    void trackEvent('unlock_granted', null, {
      action: 'secret_interaction',
      theme_id: data.themeId,
      theme_name: data.themeName || 'Easter Egg',
      source: 'secret_interaction',
      secret: true,
    });
    const { renderAuthUI } = await import('./auth.js');
    renderAuthUI();
    if (window.innerWidth <= 1024) {
      const { renderMobileBrowse } = await import('./mobile-browse.js');
      renderMobileBrowse();
    } else {
      const { renderSidebar } = await import('./sidebar.js');
      renderSidebar();
    }
    await appendSecretUnlockDelighter(data.themeName || 'Easter Egg');
  } catch (error) {
    console.warn('Failed to record secret interaction:', error);
  }
}
