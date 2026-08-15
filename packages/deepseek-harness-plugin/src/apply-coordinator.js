/**
 * Keep local theme application authoritative while explicitly coordinating the
 * optional, separately scoped Connected Apps activity receipt.
 */
export function applyHarnessThemeWithConnectedActivity(controller, account, theme, options) {
  if (!controller || typeof controller.apply !== 'function') {
    throw new TypeError('A Harness theme controller is required');
  }
  if (!controller.apply(theme, options)) return false;
  try {
    Promise.resolve(account?.recordHarnessUse?.()).catch(() => {});
  } catch {
    // The account client exposes a bounded retry state. Reporting must never
    // roll back a theme that Harness already applied successfully.
  }
  return true;
}
