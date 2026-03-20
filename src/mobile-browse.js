// ================================================
// DexThemes — Mobile Browse (Category Pills + Card Grid)
// ================================================

import * as state from './state.js';
import { escapeHtml, safeImageSrc } from './utils.js';
import { isMobile } from './mobile.js';
import { isThemeVisibleInCatalog } from './theme-contracts.js';

let activeMobileCategory = 'official'; // which pill is selected
let activeMobileSubgroup = 'all'; // subgroup filter for dexthemes

// Variant icon helper — uses ink color so it's visible on the theme's background
function variantIcon(t, ink) {
  const hasDark = !!t.dark;
  const hasLight = !!t.light;
  if (hasDark && hasLight) {
    return `<svg class="theme-card-variant" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  } else if (hasLight) {
    return `<svg class="theme-card-variant" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`;
  }
  return `<svg class="theme-card-variant" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${ink}" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
}

export function renderMobileBrowse() {
  if (!isMobile()) return;
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Hide desktop sidebar elements
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) submitBtn.style.display = 'none';

  // Inject profile/auth into header top-right
  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  if (sidebarHeader) {
    let profileEl = sidebarHeader.querySelector('.mobile-header-profile');
    if (!profileEl) {
      profileEl = document.createElement('div');
      profileEl.className = 'mobile-header-profile';
      sidebarHeader.appendChild(profileEl);
    }
    if (state.currentUser) {
      const displayName = state.currentUser.displayName || state.currentUser.username || '';
      const avatarUrl = safeImageSrc(state.currentUser.avatarUrl);
        const isSupporter = state.isCurrentUserSupporter();
        profileEl.innerHTML = `
        <div class="mobile-profile-wrapper">
          <button class="mobile-avatar-btn" data-action="toggle-mobile-user-menu" aria-label="Open account menu">
            ${avatarUrl ? `<img src="${avatarUrl}" alt="${escapeHtml(displayName)} avatar" class="mobile-avatar-img${isSupporter ? ' supporter-avatar' : ''}"
                 onerror="this.style.display='none'">` : ''}
          </button>
          <div class="mobile-user-menu" id="mobile-user-menu" style="display:none;">
            <div class="mobile-user-menu-name">${escapeHtml(displayName)}${isSupporter ? ' <span class="supporter-mark supporter-mark--inline" title="Supporter" aria-label="Supporter">✦</span>' : ''}</div>
            <button class="mobile-user-menu-btn" data-action="open-profile-view" data-stop-propagation="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M7 15h10"/><path d="M7 10h6"/></svg>
              My stats
            </button>
            <button class="mobile-user-menu-btn" data-action="open-leaderboard" data-stop-propagation="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
              Leaderboard
            </button>
            <a class="mobile-user-menu-btn" href="https://github.com/daeshawnballard/dexthemes/issues" target="_blank" rel="noopener" data-stop-propagation="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Report a bug
            </a>
            <button class="mobile-user-menu-btn" data-action="logout" data-stop-propagation="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </div>`;
    } else if (localStorage.getItem('dexthemes-has-signed-in')) {
      // Only show sign-in if user has signed in before (matching desktop behavior)
      profileEl.innerHTML = `
        <button class="mobile-signin-link" data-action="sign-in" data-provider="github">Sign in</button>`;
    } else {
      profileEl.innerHTML = '';
    }
  }

  const categoryList = document.getElementById('category-list');
  if (!categoryList) return;

  // Get search query
  const searchInput = document.getElementById('sidebar-search');
  const query = (searchInput?.value || '').toLowerCase().trim();

  // Filter themes by active category + search + subgroup
  const themes = state.THEMES.filter(t => {
    if (!isThemeVisibleInCatalog(t, state.userUnlocks)) return false;
    if (t.category !== activeMobileCategory) return false;
    if (query && !t.name.toLowerCase().includes(query)) return false;
    // Subgroup filter for dexthemes
    if (activeMobileCategory === 'dexthemes' && activeMobileSubgroup !== 'all') {
      if (t.subgroup !== activeMobileSubgroup) return false;
    }
    return true;
  });

  // Build category pills
  const pills = state.CATEGORIES.map(cat => {
    const count = state.THEMES.filter((t) => t.category === cat.id && isThemeVisibleInCatalog(t, state.userUnlocks)).length;
    const isActive = cat.id === activeMobileCategory;
    return `<button class="mobile-cat-pill ${isActive ? 'active' : ''}"
                    data-action="mobile-switch-category"
                    data-category-id="${cat.id}">
              ${cat.name} <span class="mobile-cat-count">${count}</span>
            </button>`;
  }).join('');

  // Build subgroup pills for DexThemes
  let subgroupPills = '';
  if (activeMobileCategory === 'dexthemes') {
    const labels = state.DEXTHEMES_GROUP_LABELS;
    const groups = Object.keys(labels);
    const allActive = activeMobileSubgroup === 'all';
    subgroupPills = `
      <div class="mobile-sub-pills">
        <button class="mobile-sub-pill ${allActive ? 'active' : ''}"
                data-action="mobile-switch-subgroup"
                data-subgroup="all">All</button>
        ${groups.map(g => {
          const visibleCount = state.THEMES.filter((t) =>
            t.category === 'dexthemes' &&
            t.subgroup === g &&
            isThemeVisibleInCatalog(t, state.userUnlocks)
          ).length;
          if (visibleCount === 0) return '';
          return `<button class="mobile-sub-pill ${activeMobileSubgroup === g ? 'active' : ''}"
                          data-action="mobile-switch-subgroup"
                          data-subgroup="${g}">
                    ${labels[g]}
                  </button>`;
        }).join('')}
      </div>`;
  }

  // Build theme cards
  const cards = themes.map(t => {
    const colors = t.dark || t.light;
    const surface = colors.surface;
    const accent = colors.accent;
    const ink = colors.ink;
    const isSelected = t.id === state.selectedTheme?.id;

    return `
      <div class="theme-card ${isSelected ? 'active' : ''}" role="button" tabindex="0" aria-pressed="${isSelected ? 'true' : 'false'}" data-action="select-theme" data-action-keyboard="true" data-theme-id="${t.id}">
        <div class="theme-card-preview" style="background: ${surface}">
          <div class="theme-card-bar" style="background: ${accent}"></div>
          <div class="theme-card-lines">
            <div class="theme-card-line" style="background: ${ink}; opacity: 0.6; width: 70%"></div>
            <div class="theme-card-line" style="background: ${accent}; opacity: 0.8; width: 45%"></div>
            <div class="theme-card-line" style="background: ${ink}; opacity: 0.4; width: 60%"></div>
            <div class="theme-card-line" style="background: ${ink}; opacity: 0.5; width: 50%"></div>
          </div>
          ${variantIcon(t, ink)}
          ${isSelected ? '<span class="theme-card-badge">Selected</span>' : ''}
        </div>
        <div class="theme-card-info">
          <div class="theme-card-dot" style="background: ${accent}"></div>
          <span class="theme-card-name">${escapeHtml(t.name)}</span>
        </div>
      </div>`;
  }).join('');

  const emptyState = themes.length === 0
    ? `<div class="mobile-browse-empty">No themes found</div>`
    : '';

  categoryList.innerHTML = `
    <div class="mobile-browse">
      <div class="mobile-cat-pills">${pills}</div>
      ${subgroupPills}
      <div class="mobile-card-grid">${cards}${emptyState}</div>
    </div>
  `;
}

export function mobileSwitchCategory(catId) {
  activeMobileCategory = catId;
  activeMobileSubgroup = 'all'; // reset subgroup when switching categories
  renderMobileBrowse();
}

export function mobileSwitchSubgroup(subgroup) {
  activeMobileSubgroup = subgroup;
  renderMobileBrowse();
}

// Re-render browse cards when search input changes
export function mobileSearchUpdate() {
  if (isMobile() && getCurrentView() === 'browse') {
    renderMobileBrowse();
  }
}

// We need access to currentView from mobile.js — use a getter import
import { getCurrentView } from './mobile.js';
