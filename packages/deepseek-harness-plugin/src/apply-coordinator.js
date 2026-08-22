/**
 * Keep local theme application authoritative while explicitly coordinating the
 * optional, separately scoped Connected Apps activity receipt.
 */
export const EXPLICIT_USER_THEME_CONFIRMATION = 'dexthemes-explicit-user-confirmation';

export function applyHarnessThemeWithConnectedActivity(controller, account, theme, options) {
  if (!controller || typeof controller.apply !== 'function') {
    throw new TypeError('A Harness theme controller is required');
  }
  if (options?.confirmation !== EXPLICIT_USER_THEME_CONFIRMATION) return false;
  const { confirmation: _confirmation, ...controllerOptions } = options;
  if (!controller.apply(theme, controllerOptions)) return false;
  try {
    Promise.resolve(account?.recordHarnessUse?.()).catch(() => {});
  } catch {
    // The account client exposes a bounded retry state. Reporting must never
    // roll back a theme that Harness already applied successfully.
  }
  return true;
}
