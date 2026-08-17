const DEVICE_USER_CODE_PATTERN = /^[A-Z0-9-]{4,32}$/;

export function normalizeDeviceUserCode(value) {
  const code = typeof value === 'string' ? value.trim() : '';
  return DEVICE_USER_CODE_PATTERN.test(code) ? code : '';
}

export async function copyDeviceUserCode(value, clipboard = globalThis.navigator?.clipboard) {
  const code = normalizeDeviceUserCode(value);
  if (!code) return Object.freeze({ copied: false, reason: 'invalid_code' });
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return Object.freeze({ copied: false, reason: 'clipboard_unavailable' });
  }

  try {
    await clipboard.writeText(code);
    return Object.freeze({ copied: true, reason: null });
  } catch {
    return Object.freeze({ copied: false, reason: 'copy_failed' });
  }
}
