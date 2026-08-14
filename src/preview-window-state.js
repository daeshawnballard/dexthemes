export const PREVIEW_WINDOW_STATE = Object.freeze({
  NORMAL: 'normal',
  MINIMIZED: 'minimized',
  FULLSCREEN: 'fullscreen',
  CLOSED: 'closed',
});

export function getPreviewWindowState(currentState, action) {
  const current = Object.values(PREVIEW_WINDOW_STATE).includes(currentState)
    ? currentState
    : PREVIEW_WINDOW_STATE.NORMAL;

  switch (action) {
    case 'close':
      return PREVIEW_WINDOW_STATE.CLOSED;
    case 'reopen':
      return PREVIEW_WINDOW_STATE.NORMAL;
    case 'minimize':
      return current === PREVIEW_WINDOW_STATE.MINIMIZED
        ? PREVIEW_WINDOW_STATE.NORMAL
        : PREVIEW_WINDOW_STATE.MINIMIZED;
    case 'maximize':
      return current === PREVIEW_WINDOW_STATE.FULLSCREEN
        ? PREVIEW_WINDOW_STATE.NORMAL
        : PREVIEW_WINDOW_STATE.FULLSCREEN;
    default:
      return current;
  }
}
