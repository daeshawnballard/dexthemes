// ================================================
// DexThemes — Community Theme Reads
// ================================================

import * as state from './state.js';
import { THEMES } from './theme-catalog.js';
import { CONVEX_SITE_URL } from './config.js';
import { renderSidebar } from './sidebar.js';
import { renderRightPanel } from './preview-shell.js';
import { showToast } from './toasts.js';

export async function loadCommunityThemes() {
  const isLocalPreview =
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === 'localhost';

  if (isLocalPreview) return;

  try {
    const res = await fetch(CONVEX_SITE_URL + '/themes/community');
    if (!res.ok) {
      console.warn('Community themes fetch returned status:', res.status);
      showToast("Couldn't load community themes", 'error');
      return;
    }
    const themes = await res.json();

    const existingIds = new Set(THEMES.map((theme) => theme.id));

    const communityThemes = themes
      .filter((theme) => !existingIds.has(theme.themeId))
      .map((theme) => ({
        id: theme.themeId,
        name: theme.name,
        category: 'community',
        codeThemeId: theme.codeThemeId || { dark: 'codex', light: 'codex' },
        copies: theme.copies || 0,
        dateAdded: new Date(theme.createdAt).toISOString().split('T')[0],
        dark: theme.dark ? {
          surface: theme.dark.surface, ink: theme.dark.ink, accent: theme.dark.accent,
          contrast: theme.dark.contrast, diffAdded: theme.dark.diffAdded, diffRemoved: theme.dark.diffRemoved,
          skill: theme.dark.skill, sidebar: theme.dark.sidebar, codeBg: theme.dark.codeBg,
        } : undefined,
        light: theme.light ? {
          surface: theme.light.surface, ink: theme.light.ink, accent: theme.light.accent,
          contrast: theme.light.contrast, diffAdded: theme.light.diffAdded, diffRemoved: theme.light.diffRemoved,
          skill: theme.light.skill, sidebar: theme.light.sidebar, codeBg: theme.light.codeBg,
        } : undefined,
        accents: theme.accents || [theme.dark?.accent || theme.light?.accent].filter(Boolean),
        subgroup: 'community',
        _convexId: theme._id,
        _authorId: theme.authorId,
        _authorName: theme.authorName,
        _authorAvatarUrl: theme.authorAvatarUrl,
        _authorIsSupporter: !!theme.authorIsSupporter,
        _authorIsAgent: !!theme.authorIsAgent,
        _summary: theme.summary,
      }));

    if (communityThemes.length > 0) {
      THEMES.push(...communityThemes);
      renderSidebar();

      const savedId = localStorage.getItem('dexthemes-selected');
      if (!state.isDeepLink && savedId && state.selectedTheme.id !== savedId) {
        const restored = THEMES.find((theme) => theme.id === savedId);
        if (restored) {
          state.setSelectedTheme(restored);
          const { applyShellTheme, applyPreview } = await import('./theme-engine.js');
          const { syncAttributionOverlay } = await import('./preview-actions.js');
          applyShellTheme(restored, state.selectedVariant);
          applyPreview(restored, state.selectedVariant);
          syncAttributionOverlay(restored);
          renderRightPanel();
          renderSidebar();
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load community themes:', error);
    showToast("Couldn't load community themes", 'error');
  }
}
