let builderModulePromise;
let leaderboardModulePromise;
let authModulePromise;
let apiModulePromise;
let analyticsModulePromise;
let mobileModulePromise;
let mobileBrowseModulePromise;
let mobileSubmitModulePromise;
let previewShellModulePromise;
let previewActionsModulePromise;
let themeDetailsModulePromise;

export function loadBuilderModule() {
  builderModulePromise ||= import('./builder.js');
  return builderModulePromise;
}

export function loadLeaderboardModule() {
  leaderboardModulePromise ||= import('./leaderboard-view.js');
  return leaderboardModulePromise;
}

export function loadAuthModule() {
  authModulePromise ||= import('./auth.js');
  return authModulePromise;
}

export function loadApiModule() {
  apiModulePromise ||= import('./api.js');
  return apiModulePromise;
}

export function loadAnalyticsModule() {
  analyticsModulePromise ||= import('./analytics.js');
  return analyticsModulePromise;
}

export function loadMobileModule() {
  mobileModulePromise ||= import('./mobile.js');
  return mobileModulePromise;
}

export function loadMobileBrowseModule() {
  mobileBrowseModulePromise ||= import('./mobile-browse.js');
  return mobileBrowseModulePromise;
}

export function loadMobileSubmitModule() {
  mobileSubmitModulePromise ||= import('./mobile-submit.js');
  return mobileSubmitModulePromise;
}

export function loadPreviewShellModule() {
  previewShellModulePromise ||= import('./preview-shell.js');
  return previewShellModulePromise;
}

export function loadPreviewActionsModule() {
  previewActionsModulePromise ||= import('./preview-actions.js');
  return previewActionsModulePromise;
}

export function loadThemeDetailsModule() {
  themeDetailsModulePromise ||= import('./theme-details.js');
  return themeDetailsModulePromise;
}
