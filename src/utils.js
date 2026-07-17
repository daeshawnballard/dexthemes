// ================================================
// DexThemes — Utility Functions
// ================================================

export const SIX_DIGIT_HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function isSixDigitHexColor(value) {
  return typeof value === 'string' && SIX_DIGIT_HEX_COLOR.test(value);
}

export function safeHexColor(value, fallback = '#000000') {
  return isSixDigitHexColor(value) ? value : fallback;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeImageSrc(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url, window.location.origin);
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) {
      return escapeHtml(parsed.toString());
    }
  } catch {}

  if (url.startsWith('/')) {
    return escapeHtml(url);
  }

  return '';
}

export function isDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export function hexToRgb(hex) {
  return `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`;
}

export function blendColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function fallbackCopy(str, cb) {
  const ta = document.createElement('textarea');
  ta.value = str;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (e) {}
  document.body.removeChild(ta);
}
