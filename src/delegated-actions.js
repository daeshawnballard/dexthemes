import {
  debouncedRenderSidebar,
  pinSubgroup,
  setFilter,
  setSort,
  toggleCategory,
  toggleFilterDropdown,
  toggleSortDropdown,
  toggleSubgroup,
} from './sidebar.js';
import {
  loadAuthModule,
  loadBuilderModule,
  loadLeaderboardModule,
  loadMobileBrowseModule,
  loadMobileModule,
  loadPreviewActionsModule,
  loadPreviewShellModule,
} from './lazy-modules.js';

function isCompactViewport() {
  return window.innerWidth <= 1024;
}

function isKeyboardActivation(event) {
  return event.key === 'Enter' || event.key === ' ';
}

async function dispatchAction(action, element, event) {
  switch (action) {
    case 'toggle-builder':
      return loadBuilderModule().then((m) => m.toggleBuilderMode());
    case 'toggle-filter-dropdown':
      return toggleFilterDropdown(event);
    case 'toggle-sort-dropdown':
      return toggleSortDropdown(event);
    case 'set-filter':
      return setFilter(element.dataset.filter || 'all');
    case 'set-sort':
      return setSort(element.dataset.sort || 'default');
    case 'toggle-category':
      return toggleCategory(element.dataset.categoryId || '');
    case 'toggle-subgroup':
      return toggleSubgroup(element.dataset.categoryId || '', element.dataset.groupId || '');
    case 'pin-subgroup':
      return pinSubgroup(element.dataset.categoryId || '', element.dataset.groupId || '');
    case 'select-theme':
      return loadPreviewActionsModule().then((m) => m.selectThemeById(element.dataset.themeId || ''));
    case 'select-accent':
      return loadPreviewShellModule().then((m) => m.selectAccent(Number(element.dataset.accentIdx || '0')));
    case 'select-variant':
      return loadPreviewShellModule().then((m) => m.selectVariant(element.dataset.variant || 'dark'));
    case 'apply-codex':
      return loadPreviewShellModule().then((m) => m.applyToCodex());
    case 'like-theme':
      return loadPreviewShellModule().then((m) => m.likeTheme());
    case 'share-theme':
      return loadPreviewShellModule().then((m) => m.shareOnX());
    case 'reopen-preview-window':
      return loadPreviewShellModule().then((m) => m.reopenPreviewWindow());
    case 'request-missing-variant':
      return loadPreviewShellModule().then((m) =>
        m.requestMissingVariant(
          element.dataset.themeId || '',
          element.dataset.missingLabel || '',
          Number(element.dataset.requestCount || '0'),
          element,
        ));
    case 'add-missing-variant':
      return loadPreviewShellModule().then((m) =>
        m.openMissingVariantBuilder(element.dataset.themeId || '', element.dataset.variant || 'dark'));
    case 'set-mobile-view':
      if (!isCompactViewport()) return undefined;
      return loadMobileModule().then((m) => m.mobileSetView(element.dataset.view || 'browse'));
    case 'sign-in':
      return loadAuthModule().then((m) => m.signInWith(element.dataset.provider || 'github'));
    case 'toggle-user-menu':
      return loadAuthModule().then((m) => m.toggleUserMenu(event));
    case 'logout':
      return loadAuthModule().then((m) => m.logout());
    case 'open-profile-view':
      return (async () => {
        if (isCompactViewport()) {
          const mobile = await loadMobileModule();
          await mobile.mobileSetView('preview');
        }
        const auth = await loadAuthModule();
        return auth.showAchievements();
      })();
    case 'close-profile-view':
      return loadAuthModule().then((m) => m.closeAchievements());
    case 'open-leaderboard':
      return (async () => {
        if (isCompactViewport()) {
          const mobile = await loadMobileModule();
          await mobile.mobileSetView('preview');
        }
        const leaderboard = await loadLeaderboardModule();
        return leaderboard.toggleLeaderboard();
      })();
    case 'close-leaderboard':
      return loadLeaderboardModule().then((m) => m.toggleLeaderboard());
    case 'switch-leaderboard-tab':
      return loadLeaderboardModule().then((m) => m.switchLeaderboardTab(element.dataset.tab || 'monthly'));
    case 'open-leaderboard-theme':
      return loadLeaderboardModule().then(async (m) => {
        m.toggleLeaderboard();
        const preview = await loadPreviewActionsModule();
        return preview.selectThemeById(element.dataset.themeId || '');
      });
    case 'toggle-mobile-user-menu':
      if (!isCompactViewport()) return undefined;
      return loadMobileModule().then((m) => m.toggleMobileUserMenu(event));
    case 'mobile-switch-category':
      return loadMobileBrowseModule().then((m) => m.mobileSwitchCategory(element.dataset.categoryId || 'official'));
    case 'mobile-switch-subgroup':
      return loadMobileBrowseModule().then((m) => m.mobileSwitchSubgroup(element.dataset.subgroup || 'all'));
    case 'builder-mobile-submit':
      return import('./mobile-submit.js').then((m) => m.mobileStartSubmit());
    case 'dismiss-coc':
      localStorage.setItem('dexthemes-coc-seen', '1');
      element.closest('.coc-prompt')?.remove();
      return undefined;
    case 'builder-name-input':
      return loadBuilderModule().then((m) => m.onBuilderNameInput(element.value || ''));
    case 'builder-set-variant':
      return loadBuilderModule().then((m) => m.setBuilderVariant(element.dataset.variant || 'dark'));
    case 'builder-color-lucky':
      return loadBuilderModule().then((m) => m.colorMeLucky());
    case 'builder-color-lucky-variant':
      return loadBuilderModule().then((m) => m.colorMeLuckyVariant(element.dataset.variant || 'dark'));
    case 'builder-reset':
      return loadBuilderModule().then((m) => m.resetBuilder());
    case 'builder-apply-codex':
      return loadBuilderModule().then((m) => m.applyBuilderToCodex());
    case 'builder-submit':
      return loadBuilderModule().then((m) => m.startBuilderSubmit());
    case 'builder-update-color':
      return loadBuilderModule().then((m) => m.updateBuilderColor(element.dataset.colorKey || '', element.value || ''));
    case 'submit-json-close':
      return import('./theme-submission-api.js').then((m) => m.dismissSubmitJsonModal());
    case 'submit-json-confirm':
      return import('./theme-submission-api.js').then((m) => m.submitJsonFromModal());
    case 'dismiss-mobile-submit':
      return import('./mobile-submit.js').then((m) => m.dismissMobileSubmitModal());
    case 'do-mobile-submit':
      return import('./mobile-submit.js').then((m) => m.mobileDoSubmit());
    case 'report-theme-name':
      return import('./preview-attribution.js').then((m) => m.reportThemeName());
    case 'confirm-report-theme-name':
      return import('./preview-attribution.js').then((m) => m.confirmThemeNameReport());
    case 'cancel-report-theme-name':
      return import('./preview-attribution.js').then((m) => m.cancelThemeNameReport());
    case 'run-supporter-unlock':
      return loadPreviewActionsModule().then((m) => m.runSupporterUnlockFlow(element.dataset.unlockAction || 'buy_coffee'));
    case 'run-unlock-action':
      return import('./locked-themes.js').then((m) => m.onUnlockAction(element.dataset.unlockAction || ''));
    case 'run-api-unlock':
      return loadPreviewActionsModule().then((m) => m.runApiUnlockFlow(element.dataset.unlockAction || 'api'));
    case 'run-agent-unlock':
      return loadPreviewActionsModule().then((m) => m.runAgentUnlockFlow(element.dataset.unlockAction || 'agent'));
    case 'run-create-unlock':
      return loadPreviewActionsModule().then((m) => m.runCreateUnlockFlow());
    case 'run-lucky-unlock':
      return loadPreviewActionsModule().then((m) => m.runLuckyUnlockFlow());
    case 'run-complete-pair-unlock':
      return loadPreviewActionsModule().then((m) => m.runCompletePairUnlockFlow());
    case 'run-share-unlock':
      return loadPreviewActionsModule().then((m) => m.runShareUnlockFlow());
    case 'run-signin-unlock':
      return loadPreviewActionsModule().then((m) => m.runSignInUnlockFlow());
    case 'run-like-unlock':
      return loadPreviewActionsModule().then((m) => m.runLikeUnlockFlow());
    case 'run-leaderboard-unlock':
      return loadPreviewActionsModule().then((m) => m.runLeaderboardUnlockFlow());
    case 'run-install-unlock':
      return loadPreviewActionsModule().then((m) => m.runInstallUnlockFlow(element.dataset.unlockAction || 'install'));
    case 'dismiss-supporter-prompt':
      return import('./locked-themes.js').then((m) => m.dismissSupporterPrompt());
    default:
      return undefined;
  }
}

function handleSearchInput() {
  debouncedRenderSidebar();
  if (isCompactViewport()) {
    void loadMobileBrowseModule().then((m) => m.mobileSearchUpdate());
  }
}

export function initDelegatedActions() {
  document.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    if (actionEl.dataset.preventDefault === 'true') {
      event.preventDefault();
    }
    if (actionEl.dataset.stopPropagation === 'true') {
      event.stopPropagation();
    }
    void dispatchAction(actionEl.dataset.action, actionEl, event);
  });

  document.addEventListener('dblclick', (event) => {
    const actionEl = event.target.closest('[data-double-action]');
    if (!actionEl) return;
    event.preventDefault();
    void dispatchAction(actionEl.dataset.doubleAction, actionEl, event);
  });

  document.addEventListener('keydown', (event) => {
    const enterEl = event.target.closest('[data-enter-action]');
    if (enterEl && event.key === 'Enter') {
      event.preventDefault();
      void dispatchAction(enterEl.dataset.enterAction, enterEl, event);
      return;
    }
    const actionEl = event.target.closest('[data-action-keyboard="true"]');
    if (!actionEl || !isKeyboardActivation(event)) return;
    event.preventDefault();
    void dispatchAction(actionEl.dataset.action, actionEl, event);
  });

  document.addEventListener('input', (event) => {
    const colorEl = event.target.closest('input[type="color"][data-change-action]');
    if (colorEl) {
      void dispatchAction(colorEl.dataset.changeAction, colorEl, event);
      return;
    }

    const actionEl = event.target.closest('[data-input-action]');
    if (!actionEl) return;
    if (actionEl.dataset.inputAction === 'sidebar-search') {
      handleSearchInput();
      return;
    }
    void dispatchAction(actionEl.dataset.inputAction, actionEl, event);
  });

  document.addEventListener('change', (event) => {
    const actionEl = event.target.closest('[data-change-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.changeAction || actionEl.dataset.action;
    if (!action) return;
    void dispatchAction(action, actionEl, event);
  });
}
