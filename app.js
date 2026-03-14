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
    id: 'codex', name: 'Codex', category: 'official', codeThemeId: { dark: 'codex-dark', light: 'codex-light' }, copies: 482, dateAdded: '2025-05-01',
    dark: { surface: '#111111', ink: '#fcfcfc', accent: '#0169cc', contrast: 60, diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#B06DFF', sidebar: '#0a0a0a', codeBg: '#080808' },
    light: { surface: '#ffffff', ink: '#0d0d0d', accent: '#0169cc', contrast: 45, diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#751ED9', sidebar: '#f5f5f5', codeBg: '#f0f0f0' },
    accents: ['#0169cc']
  },
  {
    id: 'absolutely', name: 'Absolutely', category: 'official', codeThemeId: { dark: 'absolutely-dark', light: 'absolutely-light' }, copies: 127, dateAdded: '2025-05-01',
    dark: { surface: '#2d2d2b', ink: '#f9f9f7', accent: '#cc7d5e', contrast: 60, ...DARK_DEFAULTS, sidebar: '#242422', codeBg: '#222220' },
    light: { surface: '#f9f9f7', ink: '#2d2d2b', accent: '#cc7d5e', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f0f0ee', codeBg: '#ededed' },
    accents: ['#cc7d5e']
  },
  {
    id: 'ayu', name: 'Ayu', category: 'official', codeThemeId: { dark: 'ayu-dark' }, variants: ['dark'], copies: 203, dateAdded: '2025-05-01',
    dark: { surface: '#0b0e14', ink: '#bfbdb6', accent: '#e6b450', contrast: 60, diffAdded: '#7fd962', diffRemoved: '#ea6c73', skill: '#cda1fa', sidebar: '#070a0f', codeBg: '#060810' },
    accents: ['#e6b450']
  },
  {
    id: 'catppuccin', name: 'Catppuccin', category: 'official', codeThemeId: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' }, copies: 389, dateAdded: '2025-05-01',
    dark: { surface: '#1e1e2e', ink: '#cdd6f4', accent: '#cba6f7', contrast: 60, diffAdded: '#a6e3a1', diffRemoved: '#f38ba8', skill: '#cba6f7', sidebar: '#181825', codeBg: '#14141f' },
    light: { surface: '#eff1f5', ink: '#4c4f69', accent: '#8839ef', contrast: 45, diffAdded: '#40a02b', diffRemoved: '#d20f39', skill: '#8839ef', sidebar: '#e6e9ef', codeBg: '#dce0e8' },
    accents: ['#cba6f7', '#8839ef']
  },
  {
    id: 'dracula', name: 'Dracula', category: 'official', codeThemeId: { dark: 'dracula' }, variants: ['dark'], copies: 341, dateAdded: '2025-05-01',
    dark: { surface: '#282A36', ink: '#F8F8F2', accent: '#FF79C6', contrast: 60, diffAdded: '#50FA7B', diffRemoved: '#FF5555', skill: '#FF79C6', sidebar: '#21222C', codeBg: '#1d1e28' },
    accents: ['#FF79C6']
  },
  {
    id: 'everforest', name: 'Everforest', category: 'official', codeThemeId: { dark: 'everforest-dark', light: 'everforest-light' }, copies: 156, dateAdded: '2025-05-01',
    dark: { surface: '#2d353b', ink: '#d3c6aa', accent: '#a7c080', contrast: 60, diffAdded: '#a7c080', diffRemoved: '#e67e80', skill: '#d699b6', sidebar: '#262e33', codeBg: '#222a2f' },
    light: { surface: '#fdf6e3', ink: '#5c6a72', accent: '#93b259', contrast: 45, diffAdded: '#8da101', diffRemoved: '#f85552', skill: '#df69ba', sidebar: '#f4eddb', codeBg: '#efe8d6' },
    accents: ['#a7c080', '#93b259']
  },
  {
    id: 'github', name: 'GitHub', category: 'official', codeThemeId: { dark: 'github-dark-default', light: 'github-light-default' }, copies: 278, dateAdded: '2025-05-01',
    dark: { surface: '#0d1117', ink: '#e6edf3', accent: '#1f6feb', contrast: 60, diffAdded: '#3fb950', diffRemoved: '#f85149', skill: '#bc8cff', sidebar: '#080c12', codeBg: '#060a0f' },
    light: { surface: '#ffffff', ink: '#1f2328', accent: '#0969da', contrast: 45, diffAdded: '#1a7f37', diffRemoved: '#cf222e', skill: '#8250df', sidebar: '#f6f8fa', codeBg: '#f0f2f5' },
    accents: ['#1f6feb', '#0969da']
  },
  {
    id: 'gruvbox', name: 'Gruvbox', category: 'official', codeThemeId: { dark: 'gruvbox-dark-medium', light: 'gruvbox-light-medium' }, copies: 189, dateAdded: '2025-05-01',
    dark: { surface: '#282828', ink: '#ebdbb2', accent: '#458588', contrast: 60, diffAdded: '#ebdbb2', diffRemoved: '#cc241d', skill: '#b16286', sidebar: '#1d2021', codeBg: '#1a1c1a' },
    light: { surface: '#fbf1c7', ink: '#3c3836', accent: '#458588', contrast: 45, diffAdded: '#3c3836', diffRemoved: '#cc241d', skill: '#b16286', sidebar: '#f2e8b8', codeBg: '#ebdfb0' },
    accents: ['#458588']
  },
  {
    id: 'linear', name: 'Linear', category: 'official', codeThemeId: { dark: 'linear-dark', light: 'linear-light' }, copies: 95, dateAdded: '2025-06-15',
    dark: { surface: '#17181d', ink: '#e6e9ef', accent: '#5e6ad2', contrast: 60, ...DARK_DEFAULTS, sidebar: '#111218', codeBg: '#0e0f14' },
    light: { surface: '#f7f8fa', ink: '#2a3140', accent: '#5e6ad2', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#eef0f3', codeBg: '#e8eaed' },
    accents: ['#5e6ad2']
  },
  {
    id: 'lobster', name: 'Lobster', category: 'official', codeThemeId: { dark: 'lobster-dark' }, variants: ['dark'], copies: 67, dateAdded: '2025-06-15',
    dark: { surface: '#111827', ink: '#e4e4e7', accent: '#ff5c5c', contrast: 60, ...DARK_DEFAULTS, sidebar: '#0b1120', codeBg: '#090e1a' },
    accents: ['#ff5c5c']
  },
  {
    id: 'material', name: 'Material', category: 'official', codeThemeId: { dark: 'material-theme-darker' }, variants: ['dark'], copies: 214, dateAdded: '2025-05-01',
    dark: { surface: '#212121', ink: '#EEFFFF', accent: '#80CBC4', contrast: 60, diffAdded: '#C3E88D', diffRemoved: '#f07178', skill: '#C792EA', sidebar: '#1a1a1a', codeBg: '#171717' },
    accents: ['#80CBC4']
  },
  {
    id: 'matrix', name: 'Matrix', category: 'official', codeThemeId: { dark: 'matrix-dark' }, variants: ['dark'], copies: 142, dateAdded: '2025-05-01',
    dark: { surface: '#040805', ink: '#b8ffca', accent: '#1eff5a', contrast: 60, ...DARK_DEFAULTS, sidebar: '#020603', codeBg: '#010401' },
    accents: ['#1eff5a']
  },
  {
    id: 'monokai', name: 'Monokai', category: 'official', codeThemeId: { dark: 'monokai' }, variants: ['dark'], copies: 256, dateAdded: '2025-05-01',
    dark: { surface: '#272822', ink: '#f8f8f2', accent: '#f8f8f0', contrast: 60, diffAdded: '#86B42B', diffRemoved: '#C4265E', skill: '#8C6BC8', sidebar: '#201f1b', codeBg: '#1c1c17' },
    accents: ['#f8f8f0']
  },
  {
    id: 'night-owl', name: 'Night Owl', category: 'official', codeThemeId: { dark: 'night-owl' }, variants: ['dark'], copies: 178, dateAdded: '2025-05-01',
    dark: { surface: '#011627', ink: '#d6deeb', accent: '#44596b', contrast: 60, diffAdded: '#22da6e', diffRemoved: '#EF5350', skill: '#C792EA', sidebar: '#010f1c', codeBg: '#000c17' },
    accents: ['#44596b']
  },
  {
    id: 'nord', name: 'Nord', category: 'official', codeThemeId: { dark: 'nord' }, variants: ['dark'], copies: 312, dateAdded: '2025-05-01',
    dark: { surface: '#2e3440', ink: '#d8dee9', accent: '#88c0d0', contrast: 60, diffAdded: '#a3be8c', diffRemoved: '#bf616a', skill: '#b48ead', sidebar: '#272d38', codeBg: '#232830' },
    accents: ['#88c0d0']
  },
  {
    id: 'notion', name: 'Notion', category: 'official', codeThemeId: { dark: 'notion-dark', light: 'notion-light' }, copies: 165, dateAdded: '2025-06-15',
    dark: { surface: '#191919', ink: '#d9d9d8', accent: '#3183d8', contrast: 60, ...DARK_DEFAULTS, sidebar: '#121212', codeBg: '#0f0f0f' },
    light: { surface: '#ffffff', ink: '#37352f', accent: '#3183d8', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f7f6f3', codeBg: '#f0eeeb' },
    accents: ['#3183d8']
  },
  {
    id: 'one', name: 'One', category: 'official', codeThemeId: { dark: 'one-dark-pro', light: 'one-light' }, copies: 234, dateAdded: '2025-05-01',
    dark: { surface: '#282c34', ink: '#abb2bf', accent: '#4d78cc', contrast: 60, diffAdded: '#8cc265', diffRemoved: '#e05561', skill: '#c162de', sidebar: '#21252b', codeBg: '#1d2026' },
    light: { surface: '#FAFAFA', ink: '#383A42', accent: '#526FFF', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f0f0f0', codeBg: '#eaeaeb' },
    accents: ['#4d78cc', '#526FFF']
  },
  {
    id: 'proof', name: 'Proof', category: 'official', codeThemeId: { light: 'proof-light' }, variants: ['light'], copies: 88, dateAdded: '2025-06-15',
    light: { surface: '#f5f3ed', ink: '#2f312d', accent: '#3d755d', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#ebe9e3', codeBg: '#e4e2dc' },
    accents: ['#3d755d']
  },
  {
    id: 'rose-pine', name: 'Rose Pine', category: 'official', codeThemeId: { dark: 'rose-pine-moon', light: 'rose-pine-dawn' }, copies: 267, dateAdded: '2025-05-01',
    dark: { surface: '#232136', ink: '#e0def4', accent: '#ea9a97', contrast: 60, diffAdded: '#9ccfd8', diffRemoved: '#908caa', skill: '#c4a7e7', sidebar: '#1c1a2e', codeBg: '#191726' },
    light: { surface: '#faf4ed', ink: '#575279', accent: '#d7827e', contrast: 45, diffAdded: '#56949f', diffRemoved: '#797593', skill: '#907aa9', sidebar: '#f2ece5', codeBg: '#ece6df' },
    accents: ['#ea9a97', '#d7827e']
  },
  {
    id: 'sentry', name: 'Sentry', category: 'official', codeThemeId: { dark: 'sentry-dark' }, variants: ['dark'], copies: 73, dateAdded: '2025-08-01',
    dark: { surface: '#2d2935', ink: '#e6dff9', accent: '#7055f6', contrast: 60, ...DARK_DEFAULTS, sidebar: '#26222d', codeBg: '#211d28' },
    accents: ['#7055f6']
  },
  {
    id: 'solarized', name: 'Solarized', category: 'official', codeThemeId: { dark: 'solarized-dark', light: 'solarized-light' }, copies: 198, dateAdded: '2025-05-01',
    dark: { surface: '#002B36', ink: '#839496', accent: '#D30102', contrast: 60, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#d33682', sidebar: '#00222c', codeBg: '#001d26' },
    light: { surface: '#FDF6E3', ink: '#657B83', accent: '#B58900', contrast: 45, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#d33682', sidebar: '#f4edda', codeBg: '#efe8d5' },
    accents: ['#D30102', '#B58900']
  },
  {
    id: 'temple', name: 'Temple', category: 'official', codeThemeId: { dark: 'temple-dark' }, variants: ['dark'], copies: 54, dateAdded: '2025-08-01',
    dark: { surface: '#02120c', ink: '#c7e6da', accent: '#e4f222', contrast: 60, ...DARK_DEFAULTS, sidebar: '#010d08', codeBg: '#000a06' },
    accents: ['#e4f222']
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', category: 'official', codeThemeId: { dark: 'tokyo-night' }, variants: ['dark'], copies: 295, dateAdded: '2025-05-01',
    dark: { surface: '#1a1b26', ink: '#a9b1d6', accent: '#3d59a1', contrast: 60, diffAdded: '#449dab', diffRemoved: '#914c54', skill: '#9d7cd8', sidebar: '#14151f', codeBg: '#10111a' },
    accents: ['#3d59a1']
  },
  {
    id: 'vscode-plus', name: 'VS Code+', category: 'official', codeThemeId: { dark: 'dark-plus', light: 'light-plus' }, copies: 223, dateAdded: '2025-05-01',
    dark: { surface: '#1E1E1E', ink: '#D4D4D4', accent: '#007ACC', contrast: 60, ...DARK_DEFAULTS, sidebar: '#171717', codeBg: '#131313' },
    light: { surface: '#FFFFFF', ink: '#000000', accent: '#007ACC', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f3f3f3', codeBg: '#ececec' },
    accents: ['#007ACC']
  },

  // ==============================
  // DEXTHEMES (Anime / Originals)
  // ==============================
  {
    id: 'ichigo-bankai', name: 'Ichigo / Bankai', category: 'dexthemes', copies: 87, dateAdded: '2025-12-01',
    dark: { surface: '#121111', ink: '#FFF4EC', accent: '#FF7A1A', contrast: 64, diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#F59E0B', sidebar: '#0d0c0c', codeBg: '#0a0909' },
    light: { surface: '#FFF7F2', ink: '#121212', accent: '#F97316', contrast: 46, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#F59E0B', sidebar: '#f7efe9', codeBg: '#f0e8e2' },
    accents: ['#FF7A1A', '#F97316']
  },
  {
    id: 'naruto-hidden-leaf', name: 'Naruto / Hidden Leaf', category: 'dexthemes', copies: 112, dateAdded: '2025-12-01',
    dark: { surface: '#101418', ink: '#F7F3EA', accent: '#FF9F1C', contrast: 66, diffAdded: '#22C55E', diffRemoved: '#F97316', skill: '#F59E0B', sidebar: '#0b0f12', codeBg: '#080c0f' },
    light: { surface: '#FFF8ED', ink: '#1A1A1A', accent: '#F59E0B', contrast: 48, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#EA580C', sidebar: '#f7f0e4', codeBg: '#f0e9dd' },
    accents: ['#FF9F1C', '#F59E0B']
  },
  {
    id: 'luffy-grand-line', name: 'Luffy / Grand Line', category: 'dexthemes', copies: 98, dateAdded: '2025-12-15',
    dark: { surface: '#0F172A', ink: '#F8F1DC', accent: '#F87171', contrast: 62, diffAdded: '#22C55E', diffRemoved: '#EF4444', skill: '#60A5FA', sidebar: '#0a1122', codeBg: '#070d1c' },
    light: { surface: '#FFF8E7', ink: '#152033', accent: '#DC2626', contrast: 44, diffAdded: '#16A34A', diffRemoved: '#DC2626', skill: '#2563EB', sidebar: '#f7f0de', codeBg: '#f0e9d7' },
    accents: ['#F87171', '#DC2626']
  },
  {
    id: 'shonen-sunset', name: 'Shonen Sunset', category: 'dexthemes', copies: 76, dateAdded: '2026-01-10',
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
let currentExampleIdx = Math.floor(Math.random() * 3);
let windowState = 'normal'; // 'normal', 'fullscreen', 'closed'
let activeFilter = 'all'; // 'all', 'dark-only', 'light-only', 'both'
let activeSort = 'default'; // 'default', 'trending', 'recent', 'az', 'za'
let panelMode = 'preview'; // 'preview' or 'builder'
let builderColors = null; // custom theme being built
let openDropdown = null; // 'filter', 'sort', or null

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
  inputText.style.color = v.ink;
  inputText.style.setProperty('--placeholder-color', dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)');
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
    <div class="assistant-msg" style="color:${v.ink};">
      <p>${escapeHtml(ex.intro)}</p>
      <div class="code-block" style="background:${v.codeBg};border:1px solid ${borderColor};color:${v.ink};">
        <span style="color:${mutedColor}">${escapeHtml(ex.comment)}</span><br>
        ${codeHtml}
      </div>
    </div>
    <div class="user-msg" style="background:${acc}22;color:${v.ink};">
      ${escapeHtml(ex.followUp)}
    </div>
  `;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
  if (panelMode === 'builder') {
    renderBuilderPanel();
    return;
  }

  // Rebuild preview panel HTML (in case builder replaced it)
  const panel = document.querySelector('.panel');
  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">Variants</div>
    </div>
    <div class="variant-cards">
      <div class="variant-card selected" id="card-dark" onclick="selectVariant('dark')">
        <div class="variant-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          Dark
        </div>
        <div class="mini-preview" id="mini-dark"></div>
      </div>
      <div class="variant-card" id="card-light" onclick="selectVariant('light')">
        <div class="variant-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          Light
        </div>
        <div class="mini-preview" id="mini-light"></div>
      </div>
    </div>
    <div class="panel-actions">
      <div class="detail-row">
        <span class="detail-label">Accent color</span>
      </div>
      <div class="accent-dots" id="accent-dots"></div>
      <div class="detail-row">
        <span class="detail-label">Import string</span>
        <span class="detail-hint" id="variant-hint">dark variant</span>
      </div>
      <button class="copy-btn" id="copy-btn" onclick="copyTheme()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy import string
      </button>
      <button class="apply-codex-btn" id="apply-codex-btn" onclick="applyToCodex()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Apply to Codex
        <span class="experimental-badge">Beta</span>
      </button>
      <div class="import-hint">Or copy and paste manually in Codex → Settings → Appearance → Import theme</div>
    </div>
  `;

  const variants = getVariants(selectedTheme);
  const darkCard = document.getElementById('card-dark');
  const lightCard = document.getElementById('card-light');

  darkCard.style.display = hasVariant(selectedTheme, 'dark') ? '' : 'none';
  lightCard.style.display = hasVariant(selectedTheme, 'light') ? '' : 'none';

  if (!hasVariant(selectedTheme, selectedVariant)) {
    selectedVariant = variants[0];
    applyShellTheme(selectedTheme, selectedVariant);
    applyPreview(selectedTheme, selectedVariant);
  }

  if (hasVariant(selectedTheme, 'dark')) renderMiniPreview('mini-dark', selectedTheme, 'dark');
  if (hasVariant(selectedTheme, 'light')) renderMiniPreview('mini-light', selectedTheme, 'light');

  darkCard.classList.toggle('selected', selectedVariant === 'dark');
  lightCard.classList.toggle('selected', selectedVariant === 'light');
  document.getElementById('variant-hint').textContent = `${selectedVariant} variant`;
  renderAccentDots();
}

// ================================================
// Sidebar — project/thread structure
// ================================================

// ================================================
// Search dropdown filter & sort
// ================================================

function renderFilterDropdown() {
  const el = document.getElementById('filter-dropdown');
  const filters = [
    { id: 'all', label: 'All themes' },
    { id: 'dark-only', label: 'Dark only' },
    { id: 'light-only', label: 'Light only' },
    { id: 'both', label: 'Both variants' }
  ];
  el.innerHTML = `
    <div class="dropdown-label">Variant</div>
    ${filters.map(f => `
      <button class="dropdown-item${activeFilter === f.id ? ' active' : ''}" onclick="setFilter('${f.id}')">
        <span class="check">${activeFilter === f.id ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
        ${f.label}
      </button>
    `).join('')}
  `;
  // Highlight filter icon if active filter
  const btn = document.getElementById('filter-btn');
  if (btn) btn.classList.toggle('has-filter', activeFilter !== 'all');
}

function renderSortDropdown() {
  const el = document.getElementById('sort-dropdown');
  const sorts = [
    { id: 'default', label: 'Default' },
    { id: 'trending', label: 'Trending' },
    { id: 'recent', label: 'Recently added' },
    { id: 'az', label: 'A → Z' },
    { id: 'za', label: 'Z → A' }
  ];
  el.innerHTML = `
    <div class="dropdown-label">Sort</div>
    ${sorts.map(s => `
      <button class="dropdown-item${activeSort === s.id ? ' active' : ''}" onclick="setSort('${s.id}')">
        <span class="check">${activeSort === s.id ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</span>
        ${s.label}
      </button>
    `).join('')}
  `;
  // Highlight sort icon if active sort
  const btn = document.getElementById('sort-btn');
  if (btn) btn.classList.toggle('has-sort', activeSort !== 'default');
}

function toggleFilterDropdown(e) {
  e.stopPropagation();
  const fd = document.getElementById('filter-dropdown');
  const sd = document.getElementById('sort-dropdown');
  sd.classList.remove('open');
  if (openDropdown === 'filter') {
    fd.classList.remove('open');
    openDropdown = null;
  } else {
    renderFilterDropdown();
    fd.classList.add('open');
    openDropdown = 'filter';
  }
}

function toggleSortDropdown(e) {
  e.stopPropagation();
  const fd = document.getElementById('filter-dropdown');
  const sd = document.getElementById('sort-dropdown');
  fd.classList.remove('open');
  if (openDropdown === 'sort') {
    sd.classList.remove('open');
    openDropdown = null;
  } else {
    renderSortDropdown();
    sd.classList.add('open');
    openDropdown = 'sort';
  }
}

function setFilter(f) {
  activeFilter = f;
  renderFilterDropdown();
  renderSidebar();
  // Close dropdown after a beat
  setTimeout(() => closeDropdowns(), 150);
}

function setSort(s) {
  activeSort = s;
  renderSortDropdown();
  renderSidebar();
  setTimeout(() => closeDropdowns(), 150);
}

function closeDropdowns() {
  document.getElementById('filter-dropdown').classList.remove('open');
  document.getElementById('sort-dropdown').classList.remove('open');
  openDropdown = null;
}

// Close dropdowns on click outside
document.addEventListener('click', (e) => {
  if (openDropdown && !e.target.closest('.search-bar-wrapper')) {
    closeDropdowns();
  }
});

function renderSidebar() {
  const el = document.getElementById('category-list');
  const searchInput = document.getElementById('sidebar-search');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  el.innerHTML = CATEGORIES.map(cat => {
    let themes = THEMES.filter(t => t.category === cat.id);
    if (q) themes = themes.filter(t => t.name.toLowerCase().includes(q));
    // Apply variant filter
    if (activeFilter === 'dark-only') themes = themes.filter(t => hasVariant(t, 'dark') && !hasVariant(t, 'light'));
    else if (activeFilter === 'light-only') themes = themes.filter(t => hasVariant(t, 'light') && !hasVariant(t, 'dark'));
    else if (activeFilter === 'both') themes = themes.filter(t => hasVariant(t, 'dark') && hasVariant(t, 'light'));
    // Apply sort
    if (activeSort === 'trending') themes = [...themes].sort((a, b) => (b.copies || 0) - (a.copies || 0));
    else if (activeSort === 'recent') themes = [...themes].sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''));
    else if (activeSort === 'az') themes = [...themes].sort((a, b) => a.name.localeCompare(b.name));
    else if (activeSort === 'za') themes = [...themes].sort((a, b) => b.name.localeCompare(a.name));
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

  // Exit builder mode if active
  if (panelMode === 'builder') {
    panelMode = 'preview';
    document.getElementById('submit-btn-text').textContent = 'Create a theme';
  }

  // Cycle to next example on theme change
  currentExampleIdx = (currentExampleIdx + 1) % EXAMPLES.length;

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
// Apply to Codex — deep link + clipboard
// ================================================

function applyToCodex() {
  const str = buildImportString(selectedTheme, selectedVariant, selectedAccentIdx);
  if (!str) return;
  showApplyConfirm(str, document.getElementById('apply-codex-btn'));
}

function applyBuilderToCodex() {
  const b = builderColors;
  if (!b.name || !b.name.trim()) {
    const input = document.getElementById('builder-name');
    const warning = document.getElementById('builder-name-warning');
    if (input) input.classList.add('name-required');
    if (warning) warning.classList.add('visible');
    input.focus();
    return;
  }
  const str = `codex-theme-v1:${JSON.stringify({
    codeThemeId: b.variant === 'dark' ? 'codex-dark' : 'codex-light',
    theme: {
      accent: b.accent, contrast: b.contrast,
      fonts: { code: null, ui: null },
      ink: b.ink, opaqueWindows: true,
      semanticColors: { diffAdded: b.diffAdded, diffRemoved: b.diffRemoved, skill: b.skill },
      surface: b.surface
    },
    variant: b.variant
  })}`;
  showApplyConfirm(str, document.querySelector('.builder-apply-btn'));
}

function showApplyConfirm(themeStr, triggerBtn) {
  // Remove any existing overlay
  const existing = document.getElementById('apply-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'apply-overlay';
  overlay.className = 'apply-overlay';
  overlay.innerHTML = `
    <div class="apply-modal">
      <div class="apply-modal-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        Apply theme to Codex
        <span class="experimental-badge">Beta</span>
      </div>
      <div class="apply-modal-body">
        <p>This will copy your theme to the clipboard and open Codex settings. Just paste it in the Import field.</p>
        <div class="apply-modal-steps">
          <div class="apply-step"><span class="apply-step-num">1</span> Theme string copied to clipboard</div>
          <div class="apply-step"><span class="apply-step-num">2</span> Codex settings opens automatically</div>
          <div class="apply-step"><span class="apply-step-num">3</span> Paste in Appearance → Import theme</div>
        </div>
        <div class="apply-modal-terminal">
          <div class="apply-terminal-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            Or run in terminal for direct apply
          </div>
          <div class="apply-terminal-cmd" id="apply-terminal-cmd">echo '${themeStr.replace(/'/g, "\\'")}' | pbcopy && open "codex://settings"</div>
          <button class="apply-terminal-copy" onclick="copyTerminalCmd()">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        </div>
      </div>
      <div class="apply-modal-actions">
        <button class="apply-cancel-btn" onclick="closeApplyOverlay()">Cancel</button>
        <button class="apply-confirm-btn" onclick="executeApply()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Copy & open Codex
        </button>
      </div>
    </div>
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeApplyOverlay();
  });
  document.body.appendChild(overlay);

  // Store the theme string for the confirm action
  overlay._themeStr = themeStr;
}

function executeApply() {
  const overlay = document.getElementById('apply-overlay');
  const str = overlay._themeStr;

  const doCopy = (cb) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(str).then(cb).catch(() => fallbackCopy(str, cb));
    } else {
      fallbackCopy(str, cb);
    }
  };

  doCopy(() => {
    // Update button to show success
    const btn = overlay.querySelector('.apply-confirm-btn');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied! Opening Codex...';
    btn.style.background = 'var(--green, #22c55e)';

    // Try to open Codex settings via deep link
    setTimeout(() => {
      window.open('codex://settings', '_blank');
    }, 300);

    // Close overlay after a moment
    setTimeout(() => {
      closeApplyOverlay();
    }, 2000);
  });
}

function copyTerminalCmd() {
  const cmd = document.getElementById('apply-terminal-cmd').textContent;
  const btn = document.querySelector('.apply-terminal-copy');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cmd).then(() => {
      btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => {
        btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
      }, 1500);
    });
  } else {
    fallbackCopy(cmd, () => {});
  }
}

function closeApplyOverlay() {
  const overlay = document.getElementById('apply-overlay');
  if (overlay) {
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 150);
  }
}

// ================================================
// Window control dots (close / minimize / fullscreen)
// ================================================

const EASTER_EGGS = [
  { emoji: '🧪', text: 'OpenAI started as a non-profit research lab in 2015, co-founded by Sam Altman and Elon Musk.' },
  { emoji: '🤖', text: 'GPT-1 had 117 million parameters. GPT-4 is rumored to be a mixture-of-experts model with over a trillion.' },
  { emoji: '🎨', text: 'DALL-E was named as a portmanteau of Salvador Dalí and Pixar\'s WALL-E.' },
  { emoji: '🏠', text: 'OpenAI\'s first office was in San Francisco\'s Mission District.' },
  { emoji: '🎮', text: 'OpenAI Five defeated the world champion Dota 2 team OG in 2019.' },
  { emoji: '📝', text: 'ChatGPT reached 100 million users in just two months after launch — the fastest-growing app in history.' },
  { emoji: '🔬', text: 'Codex, OpenAI\'s code model, powered GitHub Copilot before evolving into the desktop agent you\'re theming right now.' },
  { emoji: '🌍', text: 'OpenAI\'s mission statement: "Ensure artificial general intelligence benefits all of humanity."' },
];

function getRandomEasterEgg() {
  return EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)];
}

function initWindowDots() {
  const dots = document.querySelectorAll('.preview-dot');
  if (dots.length < 3) return;

  // Close
  dots[0].addEventListener('click', (e) => {
    e.stopPropagation();
    closePreviewWindow();
  });

  // Minimize
  dots[1].addEventListener('click', (e) => {
    e.stopPropagation();
    minimizePreviewWindow();
  });

  // Fullscreen
  dots[2].addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });
}

function closePreviewWindow() {
  const win = document.getElementById('preview-window');
  const area = document.querySelector('.preview-area');
  win.style.display = 'none';
  windowState = 'closed';

  const egg = getRandomEasterEgg();
  const overlay = document.createElement('div');
  overlay.className = 'preview-closed-overlay';
  overlay.id = 'closed-overlay';
  overlay.innerHTML = `
    <div class="easter-egg-emoji">${egg.emoji}</div>
    <div class="easter-egg-text">${egg.text}</div>
    <button class="reopen-btn" onclick="reopenPreviewWindow()">Re-open window</button>
  `;
  area.appendChild(overlay);
}

function reopenPreviewWindow() {
  const overlay = document.getElementById('closed-overlay');
  if (overlay) overlay.remove();
  const win = document.getElementById('preview-window');
  win.style.display = '';
  windowState = 'normal';
}

function toggleFullscreen() {
  const win = document.getElementById('preview-window');
  const area = document.querySelector('.preview-area');

  if (windowState === 'fullscreen') {
    // Back to normal
    win.classList.remove('fullscreen');
    area.classList.remove('fullscreen-area');
    windowState = 'normal';
  } else {
    // Go fullscreen
    win.classList.add('fullscreen');
    area.classList.add('fullscreen-area');
    windowState = 'fullscreen';
  }
}

function minimizePreviewWindow() {
  if (windowState === 'fullscreen') {
    // From fullscreen → back to normal
    toggleFullscreen();
  }
  // If already normal, it's a no-op (already minimized/default state)
}

// ================================================
// Theme Builder
// ================================================

function getDefaultBuilderColors() {
  return {
    name: '',
    variant: 'dark',
    surface: '#1a1a2e',
    ink: '#e6e6e6',
    accent: '#e94560',
    sidebar: '#141428',
    codeBg: '#12122a',
    diffAdded: '#40c977',
    diffRemoved: '#fa423e',
    skill: '#ad7bf9',
    contrast: 60
  };
}

function saveBuilderState() {
  if (!builderColors) return;
  localStorage.setItem('dexthemes-builder', JSON.stringify(builderColors));
}

function loadBuilderState() {
  try {
    const saved = localStorage.getItem('dexthemes-builder');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

function resetBuilder() {
  builderColors = getDefaultBuilderColors();
  localStorage.removeItem('dexthemes-builder');
  renderBuilderPanel();
  applyBuilderPreview();
}

function randomHue() {
  return Math.floor(Math.random() * 360);
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function colorMeLucky() {
  const hue = randomHue();
  const isDarkVariant = builderColors.variant === 'dark';

  if (isDarkVariant) {
    builderColors.surface = hslToHex(hue, 15, 8);
    builderColors.ink = hslToHex(hue, 10, 90);
    builderColors.accent = hslToHex(hue, 75, 58);
    builderColors.sidebar = hslToHex(hue, 15, 6);
    builderColors.codeBg = hslToHex(hue, 15, 5);
    builderColors.diffAdded = hslToHex((hue + 120) % 360, 60, 55);
    builderColors.diffRemoved = hslToHex((hue + 240) % 360, 60, 55);
    builderColors.skill = hslToHex((hue + 180) % 360, 55, 65);
  } else {
    builderColors.surface = hslToHex(hue, 15, 96);
    builderColors.ink = hslToHex(hue, 15, 12);
    builderColors.accent = hslToHex(hue, 75, 45);
    builderColors.sidebar = hslToHex(hue, 15, 92);
    builderColors.codeBg = hslToHex(hue, 15, 90);
    builderColors.diffAdded = hslToHex((hue + 120) % 360, 60, 38);
    builderColors.diffRemoved = hslToHex((hue + 240) % 360, 60, 42);
    builderColors.skill = hslToHex((hue + 180) % 360, 55, 45);
  }

  saveBuilderState();
  renderBuilderPanel();
  applyBuilderPreview();
}

function toggleBuilderMode() {
  if (panelMode === 'builder') {
    panelMode = 'preview';
    document.getElementById('submit-btn-text').textContent = 'Create a theme';
    // Restore selected theme preview
    applyShellTheme(selectedTheme, selectedVariant);
    applyPreview(selectedTheme, selectedVariant);
    renderRightPanel();
  } else {
    panelMode = 'builder';
    // Load saved state or start fresh
    builderColors = loadBuilderState() || getDefaultBuilderColors();
    document.getElementById('submit-btn-text').textContent = 'Back to browsing';
    renderBuilderPanel();
    applyBuilderPreview();
  }
}

function renderBuilderPanel() {
  const panel = document.querySelector('.panel');
  const b = builderColors;

  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-title">Theme Builder</div>
    </div>
    <div class="builder-panel">
      <input type="text" class="builder-name-input" id="builder-name" value="${escapeHtml(b.name)}" placeholder="Name your theme..." oninput="onBuilderNameInput(this.value)">
      <div class="builder-name-warning" id="builder-name-warning">Give your theme a name first</div>

      <div class="builder-variant-toggle">
        <button class="builder-variant-btn ${b.variant === 'dark' ? 'active' : ''}" onclick="setBuilderVariant('dark')">Dark</button>
        <button class="builder-variant-btn ${b.variant === 'light' ? 'active' : ''}" onclick="setBuilderVariant('light')">Light</button>
      </div>

      <div class="builder-fun-row">
        <button class="builder-lucky-btn" onclick="colorMeLucky()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
          Color me lucky
        </button>
        <button class="builder-reset-btn" onclick="resetBuilder()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          Reset
        </button>
      </div>

      <div class="builder-section">
        <div class="builder-section-title">Colors</div>
        ${builderColorField('Surface', 'surface', b.surface)}
        ${builderColorField('Text', 'ink', b.ink)}
        ${builderColorField('Accent', 'accent', b.accent)}
        ${builderColorField('Sidebar', 'sidebar', b.sidebar)}
        ${builderColorField('Code background', 'codeBg', b.codeBg)}
      </div>

      <div class="builder-section">
        <div class="builder-section-title">Syntax colors</div>
        ${builderColorField('Strings / Added', 'diffAdded', b.diffAdded)}
        ${builderColorField('Errors / Removed', 'diffRemoved', b.diffRemoved)}
        ${builderColorField('Functions / Skill', 'skill', b.skill)}
      </div>
    </div>

    <div class="builder-actions">
      <button class="builder-share-btn" onclick="shareBuilderTheme()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy import string
      </button>
      <button class="apply-codex-btn builder-apply-btn" onclick="applyBuilderToCodex()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Apply to Codex
        <span class="experimental-badge">Beta</span>
      </button>
      <div class="builder-submit-hint">Create freely — no account needed.<br>To submit to the community gallery, connect GitHub or X (coming soon).</div>
    </div>
  `;
}

function onBuilderNameInput(val) {
  builderColors.name = val;
  saveBuilderState();
  // Clear warning if they start typing
  const warning = document.getElementById('builder-name-warning');
  const input = document.getElementById('builder-name');
  if (val.trim()) {
    warning.classList.remove('visible');
    input.classList.remove('name-required');
  }
}

function builderColorField(label, key, value) {
  return `
    <div class="builder-field">
      <span class="builder-field-label">${label}</span>
      <div class="builder-color-input">
        <div class="builder-color-swatch" style="background:${value}">
          <input type="color" value="${value}" onchange="updateBuilderColor('${key}', this.value)">
        </div>
        <input type="text" class="builder-color-hex" value="${value}" maxlength="7"
          onchange="updateBuilderColor('${key}', this.value)"
          onkeydown="if(event.key==='Enter') updateBuilderColor('${key}', this.value)">
      </div>
    </div>
  `;
}

function updateBuilderColor(key, value) {
  if (!value.startsWith('#')) value = '#' + value;
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
  builderColors[key] = value;
  saveBuilderState();
  renderBuilderPanel();
  applyBuilderPreview();
}

function setBuilderVariant(v) {
  builderColors.variant = v;
  // Switch to sensible defaults if changing variant
  if (v === 'light' && isDark(builderColors.surface)) {
    builderColors.surface = '#f5f5f5';
    builderColors.ink = '#1a1a1a';
    builderColors.sidebar = '#eaeaea';
    builderColors.codeBg = '#e5e5e5';
  } else if (v === 'dark' && !isDark(builderColors.surface)) {
    builderColors.surface = '#1a1a2e';
    builderColors.ink = '#e6e6e6';
    builderColors.sidebar = '#141428';
    builderColors.codeBg = '#12122a';
  }
  saveBuilderState();
  renderBuilderPanel();
  applyBuilderPreview();
}

function applyBuilderPreview() {
  const b = builderColors;
  // Create a temporary theme object for the preview
  const tempTheme = {
    id: '_builder', name: b.name, category: 'custom',
    codeThemeId: { dark: 'codex-dark', light: 'codex-light' },
    [b.variant]: {
      surface: b.surface, ink: b.ink, accent: b.accent,
      contrast: b.contrast, sidebar: b.sidebar, codeBg: b.codeBg,
      diffAdded: b.diffAdded, diffRemoved: b.diffRemoved, skill: b.skill
    },
    accents: [b.accent]
  };
  // Apply to preview window and shell
  selectedAccentIdx = 0;
  applyShellTheme(tempTheme, b.variant);
  applyPreview(tempTheme, b.variant);
}

function shareBuilderTheme() {
  const b = builderColors;

  // Validate name
  if (!b.name || !b.name.trim()) {
    const input = document.getElementById('builder-name');
    const warning = document.getElementById('builder-name-warning');
    if (input) input.classList.add('name-required');
    if (warning) warning.classList.add('visible');
    input.focus();
    return;
  }

  const str = `codex-theme-v1:${JSON.stringify({
    codeThemeId: b.variant === 'dark' ? 'codex-dark' : 'codex-light',
    theme: {
      accent: b.accent, contrast: b.contrast,
      fonts: { code: null, ui: null },
      ink: b.ink, opaqueWindows: true,
      semanticColors: { diffAdded: b.diffAdded, diffRemoved: b.diffRemoved, skill: b.skill },
      surface: b.surface
    },
    variant: b.variant
  })}`;

  const btn = document.querySelector('.builder-share-btn');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(() => {
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--green)';
      setTimeout(() => { renderBuilderPanel(); }, 1500);
    });
  } else {
    fallbackCopy(str, () => {
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--green)';
      setTimeout(() => { renderBuilderPanel(); }, 1500);
    });
  }
}

// ================================================
// Onboarding (first visit)
// ================================================

function checkOnboarding() {
  if (localStorage.getItem('dexthemes-onboarded')) return;
  const overlay = document.getElementById('onboarding-overlay');
  if (!overlay) return;
  const win = document.getElementById('preview-window');
  win.style.display = 'none';

  overlay.style.display = '';
  overlay.innerHTML = `
    <div class="onboarding-title">Welcome to DexThemes</div>
    <div class="onboarding-subtitle">
      Browse, preview, and apply beautiful themes for the Codex desktop app — or create your own.
    </div>
    <div class="onboarding-steps">
      <div class="onboarding-step">
        <div class="onboarding-step-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="7" height="18" rx="1.5" fill="currentColor" opacity="0.2"/>
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="4.5" y1="8" x2="7" y2="8" opacity="0.5"/>
            <line x1="4.5" y1="11" x2="6.5" y2="11" opacity="0.5"/>
            <line x1="4.5" y1="14" x2="7" y2="14" opacity="0.5"/>
          </svg>
        </div>
        <div class="onboarding-step-num">1</div>
        <div class="onboarding-step-text">Browse themes in the sidebar</div>
      </div>
      <div class="onboarding-step">
        <div class="onboarding-step-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="16" y1="3" x2="16" y2="21"/>
            <rect x="9" y="3" width="7" height="18" fill="currentColor" opacity="0.2"/>
            <circle cx="12.5" cy="9" r="0.5" fill="currentColor"/>
            <line x1="11" y1="12" x2="14" y2="12" opacity="0.5"/>
            <line x1="11" y1="14.5" x2="13" y2="14.5" opacity="0.5"/>
          </svg>
        </div>
        <div class="onboarding-step-num">2</div>
        <div class="onboarding-step-text">Preview how it looks with real code</div>
      </div>
      <div class="onboarding-step">
        <div class="onboarding-step-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="16" y1="3" x2="16" y2="21"/>
            <rect x="16" y="3" width="6" height="18" rx="0" fill="currentColor" opacity="0.2"/>
            <rect x="17.5" y="8" width="3" height="4" rx="0.5" stroke="currentColor" opacity="0.5" fill="none"/>
            <rect x="17.5" y="14" width="3" height="2.5" rx="0.5" stroke="currentColor" opacity="0.5" fill="none"/>
          </svg>
        </div>
        <div class="onboarding-step-num">3</div>
        <div class="onboarding-step-text">Copy the import string and paste in Codex</div>
      </div>
    </div>
    <button class="onboarding-cta" onclick="dismissOnboarding()">Start exploring</button>
  `;
}

function dismissOnboarding() {
  localStorage.setItem('dexthemes-onboarded', '1');
  const overlay = document.getElementById('onboarding-overlay');
  overlay.style.display = 'none';
  const win = document.getElementById('preview-window');
  win.style.display = '';
}

// ================================================
// Init
// ================================================

renderSidebar();
renderFilterDropdown();
renderSortDropdown();
renderRightPanel();
applyShellTheme(selectedTheme, selectedVariant);
applyPreview(selectedTheme, selectedVariant);
initWindowDots();
checkOnboarding();
