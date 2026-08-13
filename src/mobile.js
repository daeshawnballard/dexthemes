// ================================================
// DexThemes — Mobile Experience
// ================================================

import * as state from './state.js';
import { renderSidebar } from './sidebar.js';
import { renderMobileBrowse } from './mobile-browse.js';
import { applyShellTheme, applyPreview, syncThemeHeader } from './theme-engine.js';
import { loadBuilderModule } from './lazy-modules.js';
import { getMobileViewTransition, getViewportMode } from './mobile-view-model.js';

let currentView = 'browse'; // 'browse', 'preview', 'create'

function applyMobileCreatePanelTweaks(panel) {
  if (!panel) return;

  const panelHeader = panel.querySelector('.panel-header');
  if (panelHeader) panelHeader.style.display = 'none';

  const builderPanel = panel.querySelector('.builder-panel');
  if (builderPanel) builderPanel.style.flex = 'none';
}

async function rerenderActivePanel(nextView) {
  try {
    if (nextView === 'create') {
      const builder = await import('./builder.js');
      builder.renderBuilderPanel();
      builder.applyBuilderPreview();
      const panel = document.querySelector('.panel');
      applyMobileCreatePanelTweaks(panel);
    } else {
      const { renderRightPanel } = await import('./preview-shell.js');
      renderRightPanel();
      applyShellTheme(state.selectedTheme, state.selectedVariant);
      applyPreview(state.selectedTheme, state.selectedVariant);
    }
  } catch (error) {
    console.warn('Failed to rerender mobile panel:', error);
  }
}

export function isMobile() {
  return getViewportMode(window.innerWidth) !== 'desktop';
}

export function isTablet() {
  return getViewportMode(window.innerWidth) === 'tablet';
}

export function getCurrentView() {
  return currentView;
}

export async function mobileSetView(view) {
  if (!isMobile()) return;

  currentView = view;
  const transition = getMobileViewTransition(view, {
    panelMode: state.panelMode,
    hasOnboarded: !!localStorage.getItem('dexthemes-onboarded'),
  });
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.main');
  const panel = document.querySelector('.panel');

  // Reset all views
  sidebar.style.display = '';
  main.classList.remove('mobile-active');
  panel.classList.remove('mobile-active');

  // Clean up create mode
  const mainHeaderEl = document.querySelector('.main-header');
  if (mainHeaderEl) mainHeaderEl.classList.remove('mobile-create-mode');

  // Update nav buttons
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // Reset inline display overrides
  sidebar.style.display = '';

  // Hide nav bar on preview/create, show on browse
  const nav = document.getElementById('mobile-nav');
  if (nav) {
    nav.style.display = transition.navVisible ? '' : 'none';
  }

  // Remove shell bottom padding when nav is hidden
  const shell = document.querySelector('.shell');
  if (shell) {
    shell.dataset.mobileView = view;
    shell.style.paddingBottom = transition.shellHasBottomPadding ? '' : '0';
  }

  switch (view) {
    case 'browse':
      main.classList.remove('mobile-active');
      panel.classList.remove('mobile-active');
      renderMobileBrowse();
      break;

    case 'preview':
      // Switch back from builder to preview mode if needed
      if (transition.shouldExitBuilder) {
        const { closeBuilder } = await loadBuilderModule();
        closeBuilder({ source: 'mobile_preview' });
      }
      if (transition.mainActive) main.classList.add('mobile-active');
      if (transition.panelActive) panel.classList.add('mobile-active');
      await rerenderActivePanel('preview');
      // Show first-time hint on mobile preview
      if (transition.shouldShowOnboardingHint) {
        setTimeout(() => {
          const applyBtn = panel.querySelector('.apply-codex-btn');
          if (applyBtn && !panel.querySelector('.mobile-onboarding-hint')) {
            const hint = document.createElement('div');
            hint.className = 'mobile-onboarding-hint';
            hint.textContent = state.selectedPlatformId === 'codex'
              ? 'Tap Copy for Codex to save it to your clipboard'
              : state.selectedPlatform.actions.website.helperText;
            hint.onclick = () => { hint.remove(); localStorage.setItem('dexthemes-onboarded', '1'); };
            applyBtn.parentElement.insertBefore(hint, applyBtn.nextSibling);
          }
        }, 600);
      }
      break;

    case 'create':
      {
        // Add mobile-create-mode BEFORE toggleBuilderMode so renderBuilderPanel picks it up
        const mainHeaderEl2 = document.querySelector('.main-header');
        if (mainHeaderEl2) {
          mainHeaderEl2.classList.add('mobile-create-mode');
        }
      }
      if (transition.shouldEnterBuilder) {
        const { openBuilder } = await loadBuilderModule();
        openBuilder({ source: 'mobile_nav' });
      }
      // Show preview window + panel — same structure as preview page
      if (transition.mainActive) main.classList.add('mobile-active');
      if (transition.panelActive) panel.classList.add('mobile-active');
      await rerenderActivePanel('create');
      break;
  }

  // Update main-header title and social icons AFTER toggleBuilderMode
  const mainTitle = document.getElementById('preview-theme-name');
  const headerSocial = document.querySelector('.header-social-actions');

  if (view === 'create') {
    if (mainTitle && transition.headerTitle) mainTitle.textContent = transition.headerTitle;
    const mainSummary = document.getElementById('preview-theme-summary');
    if (mainSummary) {
      mainSummary.textContent = '';
      mainSummary.hidden = true;
    }
    // Hide all social actions on create — nothing to share/like yet
    if (headerSocial) {
      headerSocial.style.display = transition.hideHeaderSocial ? 'none' : '';
    }
  } else if (view === 'preview') {
    syncThemeHeader(state.selectedTheme);
    if (headerSocial) {
      headerSocial.style.display = '';
      const likeBtn = headerSocial.querySelector('.like-btn');
      if (likeBtn) likeBtn.style.display = '';
    }
  }
}

export function toggleMobileUserMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('mobile-user-menu');
  if (!menu) return;
  const isOpen = menu.style.display !== 'none';
  menu.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    const close = () => { menu.style.display = 'none'; document.removeEventListener('click', close); };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}

// When a theme is selected on mobile, auto-switch to preview
export function mobileOnThemeSelect() {
  if (isMobile()) {
    void mobileSetView('preview');
  }
}

// Back button handler
export function mobileGoBack() {
  void mobileSetView('browse');
}

// Add back button to main header on mobile
export function initMobile() {
  if (!isMobile()) return;

  const mainHeader = document.querySelector('.main-header');
  if (mainHeader && !mainHeader.querySelector('.mobile-back-btn')) {
    const backBtn = document.createElement('button');
    backBtn.className = 'mobile-back-btn';
    backBtn.setAttribute('aria-label', 'Back to browse themes');
    backBtn.onclick = mobileGoBack;
    backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
    mainHeader.insertBefore(backBtn, mainHeader.firstChild);
  }

  initHeaderCollapse();
}

// Scroll-based header collapse
function initHeaderCollapse() {
  const sidebarHeader = document.querySelector('.sidebar-header');
  if (sidebarHeader) {
    sidebarHeader.classList.remove('collapsed');
  }
}

// Re-check on resize and orientation change
export function initMobileResize() {
  let wasMobile = isMobile();

  function handleResize() {
    const nowMobile = isMobile();
    if (wasMobile && !nowMobile) {
      // Switched to desktop — fully restore desktop state
      const sidebar = document.querySelector('.sidebar');
      const main = document.querySelector('.main');
      const panel = document.querySelector('.panel');
      sidebar.style.display = '';
      main.classList.remove('mobile-active');
      panel.classList.remove('mobile-active');

      // Restore desktop submit button text and icon
      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) submitBtn.style.display = '';
      const submitText = document.getElementById('submit-btn-text');
      if (submitText) submitText.textContent = state.panelMode === 'builder' ? 'Back to Browse' : 'Create Theme';
      const submitIcon = submitBtn?.querySelector('svg');
      if (submitIcon) {
        submitIcon.innerHTML = state.panelMode === 'builder'
          ? '<polyline points="15 18 9 12 15 6"/>'
          : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
      }

      // Remove mobile-create-mode class from header
      const mainHeaderEl = document.querySelector('.main-header');
      if (mainHeaderEl) mainHeaderEl.classList.remove('mobile-create-mode');

      // Restore panel header padding
      const panelHeader = panel?.querySelector('.panel-header');
      if (panelHeader) { panelHeader.style.paddingLeft = ''; panelHeader.style.paddingRight = ''; }

      // Restore builder panel flex
      const builderPanel = panel?.querySelector('.builder-panel');
      if (builderPanel) builderPanel.style.flex = '';

      // Show nav again
      const nav = document.getElementById('mobile-nav');
      if (nav) nav.style.display = '';
      const shell = document.querySelector('.shell');
      if (shell) shell.style.paddingBottom = '';

      // Remove injected mobile elements
      const profileEl = sidebar?.querySelector('.mobile-header-profile');
      if (profileEl) profileEl.remove();
      const backBtn = document.querySelector('.mobile-back-btn');
      if (backBtn) backBtn.remove();

      // Restore desktop sidebar tree
      renderSidebar();
      rerenderActivePanel(state.panelMode === 'builder' ? 'create' : 'preview');
    } else if (!wasMobile && nowMobile) {
      // Switched to mobile — activate browse view
      void mobileSetView('browse');
      initMobile();
    }
    wasMobile = nowMobile;
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    // Orientation change fires before resize on mobile — delay to let viewport settle
    setTimeout(handleResize, 100);
  });
}
