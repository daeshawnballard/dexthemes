// ================================================
// DexThemes — app.js
// Complete theme data, preview rendering, and UI logic
// ================================================

// Default semantic colors used when a Codex theme doesn't define them
const DARK_DEFAULTS = { diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#ad7bf9' };
const LIGHT_DEFAULTS = { diffAdded: '#00a240', diffRemoved: '#ba2623', skill: '#924ff7' };

const THEMES = [
  // ==============================
  // OFFICIAL CODEX THEMES
  // ==============================
  {
    id: 'codex', name: 'Codex', category: 'official', codeThemeId: { dark: 'codex-dark', light: 'codex-light' },
    dark: { surface: '#111111', ink: '#fcfcfc', accent: '#0169cc', contrast: 60, diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#B06DFF', sidebar: '#0a0a0a', codeBg: '#080808' },
    light: { surface: '#ffffff', ink: '#0d0d0d', accent: '#0169cc', contrast: 45, diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#751ED9', sidebar: '#f5f5f5', codeBg: '#f0f0f0' },
    accents: ['#0169cc']
  },
  {
    id: 'absolutely', name: 'Absolutely', category: 'official', codeThemeId: { dark: 'absolutely-dark', light: 'absolutely-light' },
    dark: { surface: '#2d2d2b', ink: '#f9f9f7', accent: '#cc7d5e', contrast: 60, ...DARK_DEFAULTS, sidebar: '#242422', codeBg: '#222220' },
    light: { surface: '#f9f9f7', ink: '#2d2d2b', accent: '#cc7d5e', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f0f0ee', codeBg: '#ededed' },
    accents: ['#cc7d5e']
  },
  {
    id: 'ayu', name: 'Ayu', category: 'official', codeThemeId: { dark: 'ayu-dark' }, variants: ['dark'],
    dark: { surface: '#0b0e14', ink: '#bfbdb6', accent: '#e6b450', contrast: 60, diffAdded: '#7fd962', diffRemoved: '#ea6c73', skill: '#cda1fa', sidebar: '#070a0f', codeBg: '#060810' },
    accents: ['#e6b450']
  },
  {
    id: 'catppuccin', name: 'Catppuccin', category: 'official', codeThemeId: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' },
    dark: { surface: '#1e1e2e', ink: '#cdd6f4', accent: '#cba6f7', contrast: 60, diffAdded: '#a6e3a1', diffRemoved: '#f38ba8', skill: '#cba6f7', sidebar: '#181825', codeBg: '#14141f' },
    light: { surface: '#eff1f5', ink: '#4c4f69', accent: '#8839ef', contrast: 45, diffAdded: '#40a02b', diffRemoved: '#d20f39', skill: '#8839ef', sidebar: '#e6e9ef', codeBg: '#dce0e8' },
    accents: ['#cba6f7', '#8839ef']
  },
  {
    id: 'dracula', name: 'Dracula', category: 'official', codeThemeId: { dark: 'dracula' }, variants: ['dark'],
    dark: { surface: '#282A36', ink: '#F8F8F2', accent: '#FF79C6', contrast: 60, diffAdded: '#50FA7B', diffRemoved: '#FF5555', skill: '#FF79C6', sidebar: '#21222C', codeBg: '#1d1e28' },
    accents: ['#FF79C6']
  },
  {
    id: 'everforest', name: 'Everforest', category: 'official', codeThemeId: { dark: 'everforest-dark', light: 'everforest-light' },
    dark: { surface: '#2d353b', ink: '#d3c6aa', accent: '#a7c080', contrast: 60, diffAdded: '#a7c080', diffRemoved: '#e67e80', skill: '#d699b6', sidebar: '#262e33', codeBg: '#222a2f' },
    light: { surface: '#fdf6e3', ink: '#5c6a72', accent: '#93b259', contrast: 45, diffAdded: '#8da101', diffRemoved: '#f85552', skill: '#df69ba', sidebar: '#f4eddb', codeBg: '#efe8d6' },
    accents: ['#a7c080', '#93b259']
  },
  {
    id: 'github', name: 'GitHub', category: 'official', codeThemeId: { dark: 'github-dark-default', light: 'github-light-default' },
    dark: { surface: '#0d1117', ink: '#e6edf3', accent: '#1f6feb', contrast: 60, diffAdded: '#3fb950', diffRemoved: '#f85149', skill: '#bc8cff', sidebar: '#080c12', codeBg: '#060a0f' },
    light: { surface: '#ffffff', ink: '#1f2328', accent: '#0969da', contrast: 45, diffAdded: '#1a7f37', diffRemoved: '#cf222e', skill: '#8250df', sidebar: '#f6f8fa', codeBg: '#f0f2f5' },
    accents: ['#1f6feb', '#0969da']
  },
  {
    id: 'gruvbox', name: 'Gruvbox', category: 'official', codeThemeId: { dark: 'gruvbox-dark-medium', light: 'gruvbox-light-medium' },
    dark: { surface: '#282828', ink: '#ebdbb2', accent: '#458588', contrast: 60, diffAdded: '#ebdbb2', diffRemoved: '#cc241d', skill: '#b16286', sidebar: '#1d2021', codeBg: '#1a1c1a' },
    light: { surface: '#fbf1c7', ink: '#3c3836', accent: '#458588', contrast: 45, diffAdded: '#3c3836', diffRemoved: '#cc241d', skill: '#b16286', sidebar: '#f2e8b8', codeBg: '#ebdfb0' },
    accents: ['#458588']
  },
  {
    id: 'linear', name: 'Linear', category: 'official', codeThemeId: { dark: 'linear-dark', light: 'linear-light' },
    dark: { surface: '#17181d', ink: '#e6e9ef', accent: '#5e6ad2', contrast: 60, ...DARK_DEFAULTS, sidebar: '#111218', codeBg: '#0e0f14' },
    light: { surface: '#f7f8fa', ink: '#2a3140', accent: '#5e6ad2', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#eef0f3', codeBg: '#e8eaed' },
    accents: ['#5e6ad2']
  },
  {
    id: 'lobster', name: 'Lobster', category: 'official', codeThemeId: { dark: 'lobster-dark' }, variants: ['dark'],
    dark: { surface: '#111827', ink: '#e4e4e7', accent: '#ff5c5c', contrast: 60, ...DARK_DEFAULTS, sidebar: '#0b1120', codeBg: '#090e1a' },
    accents: ['#ff5c5c']
  },
  {
    id: 'material', name: 'Material', category: 'official', codeThemeId: { dark: 'material-theme-darker' }, variants: ['dark'],
    dark: { surface: '#212121', ink: '#EEFFFF', accent: '#80CBC4', contrast: 60, diffAdded: '#C3E88D', diffRemoved: '#f07178', skill: '#C792EA', sidebar: '#1a1a1a', codeBg: '#171717' },
    accents: ['#80CBC4']
  },
  {
    id: 'matrix', name: 'Matrix', category: 'official', codeThemeId: { dark: 'matrix-dark' }, variants: ['dark'],
    dark: { surface: '#040805', ink: '#b8ffca', accent: '#1eff5a', contrast: 60, ...DARK_DEFAULTS, sidebar: '#020603', codeBg: '#010401' },
    accents: ['#1eff5a']
  },
  {
    id: 'monokai', name: 'Monokai', category: 'official', codeThemeId: { dark: 'monokai' }, variants: ['dark'],
    dark: { surface: '#272822', ink: '#f8f8f2', accent: '#f8f8f0', contrast: 60, diffAdded: '#86B42B', diffRemoved: '#C4265E', skill: '#8C6BC8', sidebar: '#201f1b', codeBg: '#1c1c17' },
    accents: ['#f8f8f0']
  },
  {
    id: 'night-owl', name: 'Night Owl', category: 'official', codeThemeId: { dark: 'night-owl' }, variants: ['dark'],
    dark: { surface: '#011627', ink: '#d6deeb', accent: '#44596b', contrast: 60, diffAdded: '#22da6e', diffRemoved: '#EF5350', skill: '#C792EA', sidebar: '#010f1c', codeBg: '#000c17' },
    accents: ['#44596b']
  },
  {
    id: 'nord', name: 'Nord', category: 'official', codeThemeId: { dark: 'nord' }, variants: ['dark'],
    dark: { surface: '#2e3440', ink: '#d8dee9', accent: '#88c0d0', contrast: 60, diffAdded: '#a3be8c', diffRemoved: '#bf616a', skill: '#b48ead', sidebar: '#272d38', codeBg: '#232830' },
    accents: ['#88c0d0']
  },
  {
    id: 'notion', name: 'Notion', category: 'official', codeThemeId: { dark: 'notion-dark', light: 'notion-light' },
    dark: { surface: '#191919', ink: '#d9d9d8', accent: '#3183d8', contrast: 60, ...DARK_DEFAULTS, sidebar: '#121212', codeBg: '#0f0f0f' },
    light: { surface: '#ffffff', ink: '#37352f', accent: '#3183d8', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f7f6f3', codeBg: '#f0eeeb' },
    accents: ['#3183d8']
  },
  {
    id: 'one', name: 'One', category: 'official', codeThemeId: { dark: 'one-dark-pro', light: 'one-light' },
    dark: { surface: '#282c34', ink: '#abb2bf', accent: '#4d78cc', contrast: 60, diffAdded: '#8cc265', diffRemoved: '#e05561', skill: '#c162de', sidebar: '#21252b', codeBg: '#1d2026' },
    light: { surface: '#FAFAFA', ink: '#383A42', accent: '#526FFF', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f0f0f0', codeBg: '#eaeaeb' },
    accents: ['#4d78cc', '#526FFF']
  },
  {
    id: 'proof', name: 'Proof', category: 'official', codeThemeId: { light: 'proof-light' }, variants: ['light'],
    light: { surface: '#f5f3ed', ink: '#2f312d', accent: '#3d755d', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#ebe9e3', codeBg: '#e4e2dc' },
    accents: ['#3d755d']
  },
  {
    id: 'rose-pine', name: 'Rose Pine', category: 'official', codeThemeId: { dark: 'rose-pine-moon', light: 'rose-pine-dawn' },
    dark: { surface: '#232136', ink: '#e0def4', accent: '#ea9a97', contrast: 60, diffAdded: '#9ccfd8', diffRemoved: '#908caa', skill: '#c4a7e7', sidebar: '#1c1a2e', codeBg: '#191726' },
    light: { surface: '#faf4ed', ink: '#575279', accent: '#d7827e', contrast: 45, diffAdded: '#56949f', diffRemoved: '#797593', skill: '#907aa9', sidebar: '#f2ece5', codeBg: '#ece6df' },
    accents: ['#ea9a97', '#d7827e']
  },
  {
    id: 'sentry', name: 'Sentry', category: 'official', codeThemeId: { dark: 'sentry-dark' }, variants: ['dark'],
    dark: { surface: '#2d2935', ink: '#e6dff9', accent: '#7055f6', contrast: 60, ...DARK_DEFAULTS, sidebar: '#26222d', codeBg: '#211d28' },
    accents: ['#7055f6']
  },
  {
    id: 'solarized', name: 'Solarized', category: 'official', codeThemeId: { dark: 'solarized-dark', light: 'solarized-light' },
    dark: { surface: '#002B36', ink: '#839496', accent: '#D30102', contrast: 60, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#d33682', sidebar: '#00222c', codeBg: '#001d26' },
    light: { surface: '#FDF6E3', ink: '#657B83', accent: '#B58900', contrast: 45, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#d33682', sidebar: '#f4edda', codeBg: '#efe8d5' },
    accents: ['#D30102', '#B58900']
  },
  {
    id: 'temple', name: 'Temple', category: 'official', codeThemeId: { dark: 'temple-dark' }, variants: ['dark'],
    dark: { surface: '#02120c', ink: '#c7e6da', accent: '#e4f222', contrast: 60, ...DARK_DEFAULTS, sidebar: '#010d08', codeBg: '#000a06' },
    accents: ['#e4f222']
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', category: 'official', codeThemeId: { dark: 'tokyo-night' }, variants: ['dark'],
    dark: { surface: '#1a1b26', ink: '#a9b1d6', accent: '#3d59a1', contrast: 60, diffAdded: '#449dab', diffRemoved: '#914c54', skill: '#9d7cd8', sidebar: '#14151f', codeBg: '#10111a' },
    accents: ['#3d59a1']
  },
  {
    id: 'vscode-plus', name: 'VS Code+', category: 'official', codeThemeId: { dark: 'dark-plus', light: 'light-plus' },
    dark: { surface: '#1E1E1E', ink: '#D4D4D4', accent: '#007ACC', contrast: 60, ...DARK_DEFAULTS, sidebar: '#171717', codeBg: '#131313' },
    light: { surface: '#FFFFFF', ink: '#000000', accent: '#007ACC', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f3f3f3', codeBg: '#ececec' },
    accents: ['#007ACC']
  },

  // ==============================
  // DEXTHEMES (Anime / Originals)
  // ==============================
  {
    id: 'ichigo-bankai', name: 'Ichigo / Bankai', category: 'dexthemes',
    dark: { surface: '#121111', ink: '#FFF4EC', accent: '#FF7A1A', contrast: 64, diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#F59E0B', sidebar: '#0d0c0c', codeBg: '#0a0909' },
    light: { surface: '#FFF7F2', ink: '#121212', accent: '#F97316', contrast: 46, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#F59E0B', sidebar: '#f7efe9', codeBg: '#f0e8e2' },
    accents: ['#FF7A1A', '#F97316']
  },
  {
    id: 'naruto-hidden-leaf', name: 'Naruto / Hidden Leaf', category: 'dexthemes',
    dark: { surface: '#101418', ink: '#F7F3EA', accent: '#FF9F1C', contrast: 66, diffAdded: '#22C55E', diffRemoved: '#F97316', skill: '#F59E0B', sidebar: '#0b0f12', codeBg: '#080c0f' },
    light: { surface: '#FFF8ED', ink: '#1A1A1A', accent: '#F59E0B', contrast: 48, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#EA580C', sidebar: '#f7f0e4', codeBg: '#f0e9dd' },
    accents: ['#FF9F1C', '#F59E0B']
  },
  {
    id: 'luffy-grand-line', name: 'Luffy / Grand Line', category: 'dexthemes',
    dark: { surface: '#0F172A', ink: '#F8F1DC', accent: '#F87171', contrast: 62, diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#60A5FA', sidebar: '#0a1122', codeBg: '#070d1c' },
    light: { surface: '#FFF8E7', ink: '#152033', accent: '#DC2626', contrast: 44, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#2563EB', sidebar: '#f7f0de', codeBg: '#f0e9d7' },
    accents: ['#F87171', '#DC2626']
  },
  {
    id: 'shonen-sunset', name: 'Shonen Sunset', category: 'dexthemes',
    dark: { surface: '#111827', ink: '#FFF7ED', accent: '#FB923C', contrast: 67, diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#A855F7', sidebar: '#0c1220', codeBg: '#090e1a' },
    light: { surface: '#FFF7E8', ink: '#161616', accent: '#EA580C', contrast: 47, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#7C3AED', sidebar: '#f7efdf', codeBg: '#f0e8d8' },
    accents: ['#FB923C', '#EA580C']
  },

  // ==============================
  // COMMUNITY (placeholder)
  // ==============================
];

const CATEGORIES = [
  { id: 'official', name: 'Codex', icon: 'shield' },
  { id: 'dexthemes', name: 'DexThemes', icon: 'palette' },
  { id: 'community', name: 'Community', icon: 'users' }
];

// ================================================
// State
// ================================================

let selectedTheme = THEMES[0];
let selectedVariant = 'dark';
let selectedAccentIdx = 0;
let expandedCategories = { official: true, dexthemes: true, community: true };
let typingTimer = null;
let cycleTimer = null;
let currentExampleIdx = 0;

// ================================================
// Conversation examples that cycle through
// ================================================

const EXAMPLES = [
  {
    user: 'Add authentication middleware to the Express router',
    intro: 'Sure \u2014 here\u2019s a JWT middleware you can mount before your routes:',
    comment: '// middleware/auth.ts',
    code: [
      { type: 'kw', text: 'import' }, ' jwt ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'jsonwebtoken'" }, ';\n',
      '\n',
      { type: 'kw', text: 'export const' }, ' ', { type: 'fn', text: 'requireAuth' }, ' = (\n',
      '  req: Request, res: Response, next: NextFunction\n',
      ') ', { type: 'kw', text: '=>' }, ' {\n',
      '  ', { type: 'kw', text: 'const' }, ' token = req.headers.', { type: 'fn', text: 'authorization' }, '\n',
      '    ?.', { type: 'fn', text: 'split' }, '(', { type: 'str', text: "' '" }, ')[1];\n',
      '  ', { type: 'kw', text: 'if' }, ' (!token) ', { type: 'kw', text: 'return' }, ' res.', { type: 'fn', text: 'sendStatus' }, '(401);\n',
      '  ', { type: 'kw', text: 'try' }, ' {\n',
      '    req.user = jwt.', { type: 'fn', text: 'verify' }, '(token, process.env.JWT_SECRET!);\n',
      '    ', { type: 'fn', text: 'next' }, '();\n',
      '  } ', { type: 'kw', text: 'catch' }, ' { res.', { type: 'fn', text: 'sendStatus' }, '(403); }\n',
      '};'
    ],
    followUp: 'Now write a test for it using Vitest'
  },
  {
    user: 'Create a React hook for dark mode toggle',
    intro: 'Here\u2019s a clean custom hook with localStorage persistence:',
    comment: '// hooks/useDarkMode.ts',
    code: [
      { type: 'kw', text: 'import' }, ' { useState, useEffect } ', { type: 'kw', text: 'from' }, ' ', { type: 'str', text: "'react'" }, ';\n',
      '\n',
      { type: 'kw', text: 'export function' }, ' ', { type: 'fn', text: 'useDarkMode' }, '() {\n',
      '  ', { type: 'kw', text: 'const' }, ' [dark, setDark] = ', { type: 'fn', text: 'useState' }, '(() =>\n',
      '    localStorage.', { type: 'fn', text: 'getItem' }, '(', { type: 'str', text: "'theme'" }, ') === ', { type: 'str', text: "'dark'" }, '\n',
      '  );\n',
      '\n',
      '  ', { type: 'fn', text: 'useEffect' }, '(() => {\n',
      '    document.documentElement.classList.', { type: 'fn', text: 'toggle' }, '(', { type: 'str', text: "'dark'" }, ', dark);\n',
      '    localStorage.', { type: 'fn', text: 'setItem' }, '(', { type: 'str', text: "'theme'" }, ', dark ? ', { type: 'str', text: "'dark'" }, ' : ', { type: 'str', text: "'light'" }, ');\n',
      '  }, [dark]);\n',
      '\n',
      '  ', { type: 'kw', text: 'return' }, ' { dark, toggle: () => ', { type: 'fn', text: 'setDark' }, '(d => !d) };\n',
      '}'
    ],
    followUp: 'Can you add system preference detection?'
  },
  {
    user: 'Write a rate limiter for my API endpoints',
    intro: 'Here\u2019s a simple sliding-window rate limiter:',
    comment: '// middleware/rateLimit.ts',
    code: [
      { type: 'kw', text: 'const' }, ' hits = ', { type: 'kw', text: 'new' }, ' ', { type: 'fn', text: 'Map' }, '<string, number[]>();\n',
      '\n',
      { type: 'kw', text: 'export function' }, ' ', { type: 'fn', text: 'rateLimit' }, '(max = 100, windowMs = 60000) {\n',
      '  ', { type: 'kw', text: 'return' }, ' (req, res, next) => {\n',
      '    ', { type: 'kw', text: 'const' }, ' key = req.ip;\n',
      '    ', { type: 'kw', text: 'const' }, ' now = Date.', { type: 'fn', text: 'now' }, '();\n',
      '    ', { type: 'kw', text: 'const' }, ' timestamps = hits.', { type: 'fn', text: 'get' }, '(key) || [];\n',
      '    ', { type: 'kw', text: 'const' }, ' valid = timestamps.', { type: 'fn', text: 'filter' }, '(t => now - t < windowMs);\n',
      '\n',
      '    ', { type: 'kw', text: 'if' }, ' (valid.length >= max)\n',
      '      ', { type: 'kw', text: 'return' }, ' res.', { type: 'fn', text: 'status' }, '(429).', { type: 'fn', text: 'json' }, '({ error: ', { type: 'str', text: "'Too many requests'" }, ' });\n',
      '\n',
      '    valid.', { type: 'fn', text: 'push' }, '(now);\n',
      '    hits.', { type: 'fn', text: 'set' }, '(key, valid);\n',
      '    ', { type: 'fn', text: 'next' }, '();\n',
      '  };\n',
      '}'
    ],
    followUp: 'Add Redis support for distributed rate limiting'
  }
];

// ================================================
// Get available variants for a theme
// ================================================

function getVariants(theme) {
  if (theme.variants) return theme.variants;
  const v = [];
  if (theme.dark) v.push('dark');
  if (theme.light) v.push('light');
  return v;
}

function hasVariant(theme, variant) {
  return getVariants(theme).includes(variant);
}

// ================================================
// Import string builder
// ================================================

function buildImportString(theme, variant, accentIdx) {
  const v = theme[variant];
  if (!v) return '';
  const acc = theme.accents[accentIdx] || v.accent;
  const codeId = theme.codeThemeId
    ? (typeof theme.codeThemeId === 'string' ? theme.codeThemeId : theme.codeThemeId[variant] || 'codex')
    : 'codex';
  return `codex-theme-v1:${JSON.stringify({
    codeThemeId: codeId,
    theme: {
      accent: acc, contrast: v.contrast,
      fonts: { code: null, ui: null },
      ink: v.ink, opaqueWindows: true,
      semanticColors: { diffAdded: v.diffAdded, diffRemoved: v.diffRemoved, skill: v.skill },
      surface: v.surface
    },
    variant: variant
  })}`;
}

// ================================================
// Helpers
// ================================================

function isDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`;
}

function blendColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ================================================
// Shell theming — update CSS vars on :root
// ================================================

function applyShellTheme(theme, variant) {
  const v = theme[variant];
  if (!v) return;
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const dark = isDark(v.surface);
  const root = document.documentElement.style;

  root.setProperty('--bg', v.surface);
  root.setProperty('--sidebar-bg', v.sidebar);
  root.setProperty('--surface', blendColor(v.surface, dark ? 15 : -8));
  root.setProperty('--surface-raised', blendColor(v.surface, dark ? 25 : -15));
  root.setProperty('--border', dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
  root.setProperty('--border-strong', dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)');
  root.setProperty('--text-primary', v.ink);
  root.setProperty('--text-secondary', dark ? blendColor(v.ink, -60) : blendColor(v.ink, 60));
  root.setProperty('--text-muted', dark ? blendColor(v.surface, 70) : blendColor(v.surface, -70));
  root.setProperty('--accent', acc);
  root.setProperty('--accent-hover', blendColor(acc, 20));
  root.setProperty('--accent-dim', `rgba(${hexToRgb(acc)}, 0.12)`);
  root.setProperty('--accent-border', `rgba(${hexToRgb(acc)}, 0.25)`);
}

// ================================================
// Preview rendering — main chat window
// ================================================

function applyPreview(theme, variant) {
  const v = theme[variant];
  if (!v) return;
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const win = document.getElementById('preview-window');
  const titlebar = document.getElementById('preview-titlebar');
  const chat = document.getElementById('preview-chat');
  const inputBar = document.getElementById('preview-input-bar');
  const inputInner = document.getElementById('preview-input-inner');
  const inputText = document.getElementById('preview-input-text');
  const sendBtn = document.getElementById('preview-send-btn');
  const winTitle = win.querySelector('.preview-window-title');

  win.style.background = v.surface;
  win.style.borderColor = borderColor;
  titlebar.style.background = v.sidebar;
  titlebar.style.borderBottomColor = borderColor;
  winTitle.style.color = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  win.querySelectorAll('.preview-dot').forEach(d => {
    d.style.background = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  });
  chat.style.background = v.surface;
  inputBar.style.background = v.sidebar;
  inputBar.style.borderTopColor = borderColor;
  inputInner.style.background = v.codeBg;
  inputInner.style.border = `1px solid ${borderColor}`;
  inputText.style.color = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  sendBtn.style.background = acc;
  sendBtn.querySelector('svg').style.color = '#fff';

  document.getElementById('preview-theme-name').textContent = theme.name;
  renderChatContent(v, acc, 'preview-chat');
}

function renderChatContent(v, acc, containerId) {
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const c = document.getElementById(containerId);
  const ex = EXAMPLES[currentExampleIdx];

  // Build colored code HTML
  const codeHtml = ex.code.map(part => {
    if (typeof part === 'string') return escapeHtml(part).replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;');
    const color = part.type === 'kw' ? acc : part.type === 'str' ? v.diffAdded : part.type === 'fn' ? v.skill : v.ink;
    return `<span style="color:${color}">${escapeHtml(part.text)}</span>`;
  }).join('');

  c.innerHTML = `
    <div class="user-msg" style="background:${acc}22;color:${v.ink};">
      ${escapeHtml(ex.user)}
    </div>
    <div class="assistant-msg" id="assistant-typing" style="color:${v.ink};">
      <p><span id="intro-text"></span><span class="typing-cursor" id="intro-cursor"></span></p>
      <div class="code-block" style="background:${v.codeBg};border:1px solid ${borderColor};color:${v.ink};display:none;" id="code-block-anim">
        <span style="color:${mutedColor}">${escapeHtml(ex.comment)}</span><br>
        <span id="code-text"></span><span class="typing-cursor" id="code-cursor" style="display:none"></span>
      </div>
    </div>
    <div class="user-msg" style="background:${acc}22;color:${v.ink};opacity:0;" id="followup-msg">
      ${escapeHtml(ex.followUp)}
    </div>
  `;

  startTypingAnimation(ex, v, acc);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ================================================
// Typing animation
// ================================================

function startTypingAnimation(ex, v, acc) {
  if (typingTimer) clearTimeout(typingTimer);
  if (cycleTimer) clearTimeout(cycleTimer);

  const introEl = document.getElementById('intro-text');
  const introCursor = document.getElementById('intro-cursor');
  const codeBlock = document.getElementById('code-block-anim');
  const codeEl = document.getElementById('code-text');
  const codeCursor = document.getElementById('code-cursor');
  const followUp = document.getElementById('followup-msg');

  if (!introEl) return;

  let i = 0;
  const introText = ex.intro;

  // Phase 1: Type intro text
  function typeIntro() {
    if (i < introText.length) {
      introEl.textContent = introText.slice(0, i + 1);
      i++;
      typingTimer = setTimeout(typeIntro, 18 + Math.random() * 12);
    } else {
      // Done with intro, show code block
      if (introCursor) introCursor.style.display = 'none';
      if (codeBlock) codeBlock.style.display = '';
      if (codeCursor) codeCursor.style.display = '';
      typeCode();
    }
  }

  // Phase 2: Reveal code (faster, chunk by chunk)
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  const codeHtml = ex.code.map(part => {
    if (typeof part === 'string') return escapeHtml(part).replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;');
    const color = part.type === 'kw' ? acc : part.type === 'str' ? v.diffAdded : part.type === 'fn' ? v.skill : v.ink;
    return `<span style="color:${color}">${escapeHtml(part.text)}</span>`;
  }).join('');

  // Split into chunks (each token is a chunk)
  const codeChunks = ex.code;
  let ci = 0;
  let builtCode = '';

  function typeCode() {
    if (ci < codeChunks.length) {
      const part = codeChunks[ci];
      if (typeof part === 'string') {
        builtCode += escapeHtml(part).replace(/\n/g, '<br>').replace(/ {2}/g, '&nbsp;&nbsp;');
      } else {
        const color = part.type === 'kw' ? acc : part.type === 'str' ? v.diffAdded : part.type === 'fn' ? v.skill : v.ink;
        builtCode += `<span style="color:${color}">${escapeHtml(part.text)}</span>`;
      }
      if (codeEl) codeEl.innerHTML = builtCode;
      ci++;
      typingTimer = setTimeout(typeCode, 30 + Math.random() * 20);
    } else {
      // Done with code
      if (codeCursor) codeCursor.style.display = 'none';
      // Phase 3: Fade in follow-up
      setTimeout(() => {
        if (followUp) {
          followUp.style.transition = 'opacity 0.4s';
          followUp.style.opacity = '1';
        }
        // Schedule next example
        cycleTimer = setTimeout(cycleExample, 6000);
      }, 400);
    }
  }

  typeIntro();
}

function cycleExample() {
  currentExampleIdx = (currentExampleIdx + 1) % EXAMPLES.length;
  const v = selectedTheme[selectedVariant];
  if (!v) return;
  const acc = selectedTheme.accents[selectedAccentIdx] || v.accent;
  renderChatContent(v, acc, 'preview-chat');
}

// ================================================
// Mini preview cards (right panel)
// ================================================

function renderMiniPreview(containerId, theme, variant) {
  const v = theme[variant];
  if (!v) return;
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const el = document.getElementById(containerId);
  el.style.background = v.surface;

  el.innerHTML = `
    <div class="mini-user" style="background:${acc}22;color:${v.ink};">Add auth middleware</div>
    <div class="mini-assistant" style="color:${v.ink};">
      Sure — here's a JWT middleware:
      <div class="mini-code" style="background:${v.codeBg};border:1px solid ${borderColor};">
        <span style="color:${acc}">import</span> <span style="color:${v.ink}">jwt</span> <span style="color:${acc}">from</span> <span style="color:${v.diffAdded}">'jsonwebtoken'</span>;<br>
        <span style="color:${acc}">export const</span> <span style="color:${v.skill}">requireAuth</span> = ...
      </div>
    </div>
  `;
}

function renderRightPanel() {
  const variants = getVariants(selectedTheme);
  const darkCard = document.getElementById('card-dark');
  const lightCard = document.getElementById('card-light');

  // Show/hide cards based on available variants
  darkCard.style.display = hasVariant(selectedTheme, 'dark') ? '' : 'none';
  lightCard.style.display = hasVariant(selectedTheme, 'light') ? '' : 'none';

  // If current variant isn't available, switch
  if (!hasVariant(selectedTheme, selectedVariant)) {
    selectedVariant = variants[0];
    applyShellTheme(selectedTheme, selectedVariant);
    applyPreview(selectedTheme, selectedVariant);
  }

  if (hasVariant(selectedTheme, 'dark')) renderMiniPreview('mini-dark', selectedTheme, 'dark');
  if (hasVariant(selectedTheme, 'light')) renderMiniPreview('mini-light', selectedTheme, 'light');

  updateVariantCards();
  renderAccentDots();
}

function updateVariantCards() {
  const darkCard = document.getElementById('card-dark');
  const lightCard = document.getElementById('card-light');
  darkCard.classList.toggle('selected', selectedVariant === 'dark');
  lightCard.classList.toggle('selected', selectedVariant === 'light');
  document.getElementById('variant-hint').textContent = `${selectedVariant} variant`;
}

// ================================================
// Sidebar — project/thread structure
// ================================================

function renderSidebar() {
  const el = document.getElementById('category-list');
  const searchInput = document.getElementById('sidebar-search');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  el.innerHTML = CATEGORIES.map(cat => {
    let themes = THEMES.filter(t => t.category === cat.id);
    if (q) themes = themes.filter(t => t.name.toLowerCase().includes(q));
    if (themes.length === 0 && !q) {
      // Show empty state (no themes in this category)
      const expanded = expandedCategories[cat.id];
      return `
        <div class="category">
          <div class="category-header" onclick="toggleCategory('${cat.id}')">
            <svg class="category-chevron ${expanded ? 'expanded' : ''}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            ${getCategoryIcon(cat.icon)}
            <span class="category-name">${cat.name}</span>
            <span class="category-count">0</span>
          </div>
          <div class="category-threads ${expanded ? 'expanded' : ''}">
            <div class="thread-empty">No community themes yet</div>
          </div>
        </div>
      `;
    }

    // Hide category if searching and no matches
    if (themes.length === 0 && q) return '';

    const expanded = expandedCategories[cat.id] || !!q; // auto-expand when searching
    return `
      <div class="category">
        <div class="category-header" onclick="toggleCategory('${cat.id}')">
          <svg class="category-chevron ${expanded ? 'expanded' : ''}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          ${getCategoryIcon(cat.icon)}
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${themes.length}</span>
        </div>
        <div class="category-threads ${expanded ? 'expanded' : ''}">
          ${themes.map(t => `
            <div class="thread-item ${t.id === selectedTheme.id ? 'active' : ''}"
                 data-theme-id="${t.id}"
                 onclick="selectThemeById('${t.id}')">
              <div class="thread-swatch" style="background:${(t.dark || t.light).accent}"></div>
              <span class="thread-title">${t.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryIcon(icon) {
  switch (icon) {
    case 'shield':
      return '<svg class="category-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    case 'palette':
      return '<svg class="category-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';
    case 'users':
      return '<svg class="category-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
    default:
      return '';
  }
}

function toggleCategory(catId) {
  expandedCategories[catId] = !expandedCategories[catId];
  renderSidebar();
}

// ================================================
// Accent dots
// ================================================

function renderAccentDots() {
  const el = document.getElementById('accent-dots');
  el.innerHTML = selectedTheme.accents.map((a, i) => `
    <div
      class="accent-dot${i === selectedAccentIdx ? ' selected' : ''}"
      style="background:${a}"
      title="${a}"
      onclick="selectAccent(${i})"
    ></div>
  `).join('');
}

// ================================================
// Selection handlers
// ================================================

function selectThemeById(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t) return;
  selectedTheme = t;
  selectedAccentIdx = 0;

  // Auto-select first available variant
  const variants = getVariants(t);
  if (!hasVariant(t, selectedVariant)) {
    selectedVariant = variants[0];
  }

  applyShellTheme(selectedTheme, selectedVariant);
  applyPreview(selectedTheme, selectedVariant);
  renderRightPanel();
  renderSidebar();
}

function selectAccent(idx) {
  selectedAccentIdx = idx;
  applyShellTheme(selectedTheme, selectedVariant);
  applyPreview(selectedTheme, selectedVariant);
  renderRightPanel();
}

function selectVariant(v) {
  if (!hasVariant(selectedTheme, v)) return;
  selectedVariant = v;
  applyShellTheme(selectedTheme, selectedVariant);
  applyPreview(selectedTheme, selectedVariant);
  updateVariantCards();
}

// ================================================
// Copy to clipboard
// ================================================

function copyTheme() {
  const str = buildImportString(selectedTheme, selectedVariant, selectedAccentIdx);
  if (!str) return;
  const btn = document.getElementById('copy-btn');

  const reset = () => {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
      Copy import string
    `;
    btn.classList.remove('copied');
  };

  const confirm = () => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(reset, 1600);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(confirm).catch(() => fallbackCopy(str, confirm));
  } else {
    fallbackCopy(str, confirm);
  }
}

function fallbackCopy(str, cb) {
  const ta = document.createElement('textarea');
  ta.value = str;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (e) {}
  document.body.removeChild(ta);
}

// ================================================
// Init
// ================================================

renderSidebar();
renderRightPanel();
applyShellTheme(selectedTheme, selectedVariant);
applyPreview(selectedTheme, selectedVariant);
