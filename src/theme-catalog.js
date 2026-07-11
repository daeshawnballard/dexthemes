// ================================================
// DexThemes — Theme Catalog & Static Taxonomy
// ================================================

// Default semantic colors used when a Codex theme doesn't define them
export const DARK_DEFAULTS = { diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#ad7bf9' };
export const LIGHT_DEFAULTS = { diffAdded: '#00a240', diffRemoved: '#ba2623', skill: '#924ff7' };

export const DEXTHEMES_GROUP_LABELS = window.DEXTHEMES_GROUP_LABELS || {
  anime: 'Anime',
  games: 'Video Games',
  movies: 'Movies',
  comics: 'Comics',
  zodiacs: 'Zodiacs',
  lunar: 'Lunar Animals',
  companies: 'Companies',
  originals: 'Originals'
};

export const THEMES = [
  // ==============================
  // OFFICIAL CODEX THEMES
  // ==============================
  {
    id: 'codex', name: 'Codex', category: 'official', codeThemeId: 'codex', copies: 482, dateAdded: '2025-05-01',
    dark: { surface: '#111111', ink: '#fcfcfc', accent: '#0169cc', contrast: 60, diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#B06DFF', sidebar: '#0a0a0a', codeBg: '#080808' },
    light: { surface: '#ffffff', ink: '#0d0d0d', accent: '#0169cc', contrast: 45, diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#751ED9', sidebar: '#f5f5f5', codeBg: '#f0f0f0' },
    accents: ['#0169cc']
  },
  {
    id: 'codex-disco-cloud', name: 'Codex / Disco Cloud', category: 'official', codeThemeId: 'codex', copies: 0, dateAdded: '2026-05-17',
    dark: { surface: '#080922', ink: '#F1EDFF', accent: '#6D5DFF', contrast: 64, diffAdded: '#55E6B5', diffRemoved: '#FF5F8A', skill: '#B8A6FF', sidebar: '#111330', codeBg: '#040613' },
    light: { surface: '#F4F1FF', ink: '#171330', accent: '#5B4DDB', contrast: 46, diffAdded: '#008A68', diffRemoved: '#C43B66', skill: '#7C3AED', sidebar: '#E7E2FF', codeBg: '#ECE7FF' },
    accents: ['#6D5DFF', '#8F4FE7', '#7487F2']
  },
  {
    id: 'absolutely', name: 'Absolutely', category: 'official', codeThemeId: 'absolutely', copies: 127, dateAdded: '2025-05-01',
    dark: { surface: '#2d2d2b', ink: '#f9f9f7', accent: '#cc7d5e', contrast: 60, ...DARK_DEFAULTS, sidebar: '#242422', codeBg: '#222220' },
    light: { surface: '#f9f9f7', ink: '#2d2d2b', accent: '#cc7d5e', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f0f0ee', codeBg: '#ededed' },
    accents: ['#cc7d5e']
  },
  {
    id: 'ayu', name: 'Ayu', category: 'official', codeThemeId: 'ayu', variants: ['dark'], copies: 203, dateAdded: '2025-05-01',
    dark: { surface: '#0b0e14', ink: '#bfbdb6', accent: '#e6b450', contrast: 60, diffAdded: '#7fd962', diffRemoved: '#ea6c73', skill: '#cda1fa', sidebar: '#070a0f', codeBg: '#060810' },
    accents: ['#e6b450']
  },
  {
    id: 'catppuccin', name: 'Catppuccin', category: 'official', codeThemeId: 'catppuccin', copies: 389, dateAdded: '2025-05-01',
    dark: { surface: '#1e1e2e', ink: '#cdd6f4', accent: '#cba6f7', contrast: 60, diffAdded: '#a6e3a1', diffRemoved: '#f38ba8', skill: '#cba6f7', sidebar: '#181825', codeBg: '#14141f' },
    light: { surface: '#eff1f5', ink: '#4c4f69', accent: '#8839ef', contrast: 45, diffAdded: '#40a02b', diffRemoved: '#d20f39', skill: '#8839ef', sidebar: '#e6e9ef', codeBg: '#dce0e8' },
    accents: ['#cba6f7', '#8839ef']
  },
  {
    id: 'dracula', name: 'Dracula', category: 'official', codeThemeId: 'dracula', variants: ['dark'], copies: 341, dateAdded: '2025-05-01',
    dark: { surface: '#282A36', ink: '#F8F8F2', accent: '#FF79C6', contrast: 60, diffAdded: '#50FA7B', diffRemoved: '#FF5555', skill: '#FF79C6', sidebar: '#21222C', codeBg: '#1d1e28' },
    accents: ['#FF79C6']
  },
  {
    id: 'everforest', name: 'Everforest', category: 'official', codeThemeId: 'everforest', copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#2d353b', ink: '#d3c6aa', accent: '#a7c080', contrast: 60, diffAdded: '#a7c080', diffRemoved: '#e67e80', skill: '#d699b6', sidebar: '#2d353b', codeBg: '#2d353b' },
    light: { surface: '#fdf6e3', ink: '#5c6a72', accent: '#93b259', contrast: 45, diffAdded: '#8da101', diffRemoved: '#f85552', skill: '#df69ba', sidebar: '#fdf6e3', codeBg: '#fdf6e3' }
  },
  {
    id: 'github-dark', name: 'GitHub Dark', category: 'official', codeThemeId: 'github-dark-default', variants: ['dark'], copies: 256, dateAdded: '2025-05-01',
    dark: { surface: '#0d1117', ink: '#e6edf3', accent: '#58a6ff', contrast: 60, diffAdded: '#3fb950', diffRemoved: '#f85149', skill: '#bc8cff', sidebar: '#090c10', codeBg: '#070a0f' },
    accents: ['#58a6ff']
  },
  {
    id: 'github-light', name: 'GitHub Light', category: 'official', codeThemeId: 'github-light-default', variants: ['light'], copies: 178, dateAdded: '2025-05-01',
    light: { surface: '#ffffff', ink: '#1f2328', accent: '#0969da', contrast: 45, diffAdded: '#1a7f37', diffRemoved: '#cf222e', skill: '#8250df', sidebar: '#f6f8fa', codeBg: '#f0f2f4' },
    accents: ['#0969da']
  },
  {
    id: 'gruvbox', name: 'Gruvbox', category: 'official', codeThemeId: 'gruvbox-dark-hard', variants: ['dark'], copies: 194, dateAdded: '2025-05-01',
    dark: { surface: '#1d2021', ink: '#ebdbb2', accent: '#fe8019', contrast: 60, diffAdded: '#b8bb26', diffRemoved: '#fb4934', skill: '#d3869b', sidebar: '#171819', codeBg: '#131415' },
    accents: ['#fe8019']
  },
  {
    id: 'linear', name: 'Linear', category: 'official', codeThemeId: 'linear', copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#0f0f11', ink: '#e3e4e6', accent: '#606acc', contrast: 60, diffAdded: '#69c967', diffRemoved: '#ff7e78', skill: '#c2a1ff', sidebar: '#080a0f', codeBg: '#17181d', fonts: { ui: 'Inter' }, opaqueWindows: true },
    light: { surface: '#fcfcfd', ink: '#1b1b1b', accent: '#5e6ad2', contrast: 45, diffAdded: '#52a450', diffRemoved: '#c94446', skill: '#8160d8', sidebar: '#f2f4f8', codeBg: '#f7f8fa', fonts: { ui: 'Inter' }, opaqueWindows: true }
  },
  {
    id: 'lobster', name: 'Lobster', category: 'official', codeThemeId: 'lobster', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#111827', ink: '#e4e4e7', accent: '#ff5c5c', contrast: 60, diffAdded: '#22c55e', diffRemoved: '#ff5c5c', skill: '#3b82f6', sidebar: '#111827', codeBg: '#111827', fonts: { ui: 'Satoshi' } }
  },
  {
    id: 'material', name: 'Material', category: 'official', codeThemeId: 'material', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#212121', ink: '#eeffff', accent: '#80cbc4', contrast: 60, diffAdded: '#c3e88d', diffRemoved: '#f07178', skill: '#c792ea', sidebar: '#212121', codeBg: '#212121' }
  },
  {
    id: 'matrix', name: 'Matrix', category: 'official', codeThemeId: 'matrix', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#040805', ink: '#b8ffca', accent: '#1eff5a', contrast: 60, diffAdded: '#1eff5a', diffRemoved: '#fa423e', skill: '#1eff5a', sidebar: '#020402', codeBg: '#040805', fonts: { code: null, ui: 'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' }, opaqueWindows: true }
  },
  {
    id: 'monokai', name: 'Monokai', category: 'official', codeThemeId: 'monokai', variants: ['dark'], copies: 287, dateAdded: '2025-05-01',
    dark: { surface: '#272822', ink: '#F8F8F2', accent: '#F92672', contrast: 60, diffAdded: '#A6E22E', diffRemoved: '#F92672', skill: '#AE81FF', sidebar: '#1f201b', codeBg: '#1b1c17' },
    accents: ['#F92672', '#A6E22E', '#66D9EF']
  },
  {
    id: 'night-owl', name: 'Night Owl', category: 'official', codeThemeId: 'night-owl', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#011627', ink: '#d6deeb', accent: '#44596b', contrast: 60, diffAdded: '#c5e478', diffRemoved: '#ef5350', skill: '#c792ea', sidebar: '#011627', codeBg: '#011627' }
  },
  {
    id: 'nord', name: 'Nord', category: 'official', codeThemeId: 'nord', variants: ['dark'], copies: 231, dateAdded: '2025-05-01',
    dark: { surface: '#2E3440', ink: '#ECEFF4', accent: '#88C0D0', contrast: 60, diffAdded: '#A3BE8C', diffRemoved: '#BF616A', skill: '#B48EAD', sidebar: '#272c36', codeBg: '#242830' },
    accents: ['#88C0D0']
  },
  {
    id: 'notion', name: 'Notion', category: 'official', codeThemeId: 'notion', copies: 0, dateAdded: '2026-07-03',
    dark: { surface: '#191919', ink: '#d9d9d8', accent: '#3183d8', contrast: 60, diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#ad7bf9', sidebar: '#151515', codeBg: '#191919' },
    light: { surface: '#ffffff', ink: '#37352f', accent: '#3183d8', contrast: 45, diffAdded: '#00a240', diffRemoved: '#ba2623', skill: '#924ff7', sidebar: '#f7f6f3', codeBg: '#ffffff' },
    accents: ['#3183d8']
  },
  {
    id: 'oscurange', name: 'Oscurange', category: 'official', codeThemeId: 'oscurange', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#0b0b0f', ink: '#e6e6e6', accent: '#f9b98c', contrast: 60, diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#479ffa', sidebar: '#0b0b0f', codeBg: '#0b0b0f' }
  },
  {
    id: 'one-dark', name: 'One Dark', category: 'official', codeThemeId: 'one-dark-pro', variants: ['dark'], copies: 312, dateAdded: '2025-05-01',
    dark: { surface: '#282c34', ink: '#abb2bf', accent: '#61afef', contrast: 60, diffAdded: '#98c379', diffRemoved: '#e06c75', skill: '#c678dd', sidebar: '#21252b', codeBg: '#1d2025' },
    accents: ['#61afef']
  },
  {
    id: 'proof', name: 'Proof', category: 'official', codeThemeId: 'proof', variants: ['light'], copies: 0, dateAdded: '2026-07-11',
    light: { surface: '#f5f3ed', ink: '#2f312d', accent: '#3d755d', contrast: 45, diffAdded: '#3d755d', diffRemoved: '#ba2623', skill: '#5f6ac2', sidebar: '#efede6', codeBg: '#f5f3ed', fonts: { code: null, ui: null }, opaqueWindows: false }
  },
  {
    id: 'raycast', name: 'Raycast', category: 'official', codeThemeId: 'raycast', copies: 0, dateAdded: '2026-03-27',
    dark: { surface: '#101010', ink: '#fefefe', accent: '#FF6363', contrast: 60, diffAdded: '#59D499', diffRemoved: '#FF6363', skill: '#FF9217', sidebar: '#101010', codeBg: '#141414', opaqueWindows: false },
    light: { surface: '#ffffff', ink: '#030303', accent: '#FF6363', contrast: 45, diffAdded: '#006B4F', diffRemoved: '#B12424', skill: '#C75D07', sidebar: '#fcfcfc', codeBg: '#ffffff', opaqueWindows: false },
    accents: ['#FF6363']
  },
  {
    id: 'rose-pine', name: 'Rosé Pine', category: 'official', codeThemeId: 'rose-pine', variants: ['dark'], copies: 168, dateAdded: '2025-05-01',
    dark: { surface: '#191724', ink: '#e0def4', accent: '#c4a7e7', contrast: 60, diffAdded: '#9ccfd8', diffRemoved: '#eb6f92', skill: '#c4a7e7', sidebar: '#13111e', codeBg: '#100e19' },
    accents: ['#c4a7e7', '#ebbcba']
  },
  {
    id: 'sentry', name: 'Sentry', category: 'official', codeThemeId: 'sentry', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#2d2935', ink: '#e6dff9', accent: '#7055f6', contrast: 60, diffAdded: '#8ee6d7', diffRemoved: '#fa423e', skill: '#7055f6', sidebar: '#26222d', codeBg: '#2d2935', fonts: { code: null, ui: null } }
  },
  {
    id: 'solarized', name: 'Solarized', category: 'official', codeThemeId: 'solarized', copies: 267, dateAdded: '2025-05-01',
    dark: { surface: '#002b36', ink: '#839496', accent: '#268bd2', contrast: 60, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#6c71c4', sidebar: '#00222b', codeBg: '#001e26' },
    light: { surface: '#fdf6e3', ink: '#657b83', accent: '#268bd2', contrast: 45, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#6c71c4', sidebar: '#f5eedb', codeBg: '#eee8d5' },
    accents: ['#268bd2']
  },
  {
    id: 'temple', name: 'Temple', category: 'official', codeThemeId: 'temple', variants: ['dark'], copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#02120c', ink: '#c7e6da', accent: '#e4f222', contrast: 60, diffAdded: '#40c977', diffRemoved: '#fa423e', skill: '#e4f222', sidebar: '#1d2d0f', codeBg: '#02120c' }
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', category: 'official', codeThemeId: 'tokyo-night', variants: ['dark'], copies: 298, dateAdded: '2025-05-01',
    dark: { surface: '#1a1b26', ink: '#c0caf5', accent: '#7aa2f7', contrast: 60, diffAdded: '#9ece6a', diffRemoved: '#f7768e', skill: '#bb9af7', sidebar: '#13141d', codeBg: '#101018' },
    accents: ['#7aa2f7']
  },
  {
    id: 'vercel', name: 'Vercel', category: 'official', codeThemeId: 'vercel', copies: 0, dateAdded: '2026-07-03',
    dark: { surface: '#000000', ink: '#ededed', accent: '#006efe', contrast: 50, diffAdded: '#00AD3A', diffRemoved: '#F13342', skill: '#9540D5', sidebar: '#000000', codeBg: '#000000', fonts: { code: '"Geist Mono", ui-monospace, "SFMono-Regular"', ui: 'Geist, Inter' } },
    light: { surface: '#ffffff', ink: '#171717', accent: '#006aff', contrast: 40, diffAdded: '#28A948', diffRemoved: '#EB001D', skill: '#A100F8', sidebar: '#ffffff', codeBg: '#ffffff', fonts: { code: '"Geist Mono", ui-monospace, "SFMono-Regular"', ui: 'Geist, Inter' } }
  },
  {
    id: 'vscode-plus', name: 'VS Code+', category: 'official', codeThemeId: 'codex', copies: 223, dateAdded: '2025-05-01',
    dark: { surface: '#1E1E1E', ink: '#D4D4D4', accent: '#007ACC', contrast: 60, ...DARK_DEFAULTS, sidebar: '#171717', codeBg: '#131313' },
    light: { surface: '#FFFFFF', ink: '#000000', accent: '#007ACC', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f3f3f3', codeBg: '#ececec' },
    accents: ['#007ACC']
  },
  {
    id: 'xcode', name: 'Xcode', category: 'official', codeThemeId: 'xcode', copies: 0, dateAdded: '2026-07-11',
    dark: { surface: '#1f1f24', ink: '#ffffff', accent: '#5482ff', contrast: 60, diffAdded: '#67b7a4', diffRemoved: '#fc6a5d', skill: '#5482ff', sidebar: '#1f1f24', codeBg: '#1f1f24', fonts: { code: '"SFMono-Medium"' } },
    light: { surface: '#ffffff', ink: '#000000', accent: '#0e0eff', contrast: 45, diffAdded: '#00a240', diffRemoved: '#c41a16', skill: '#0e0eff', sidebar: '#ffffff', codeBg: '#ffffff', fonts: { code: '"SFMono-Regular"' } }
  },

  // ==============================
  // DEXTHEMES (loaded from theme-data/dexthemes/*)
  // ==============================
  ...Object.values((window.DEXTHEMES_PACKS && window.DEXTHEMES_PACKS.dexthemes) || {}).flat(),

  // ==============================
  // COMMUNITY THEMES
  // ==============================
];

export const CATEGORIES = [
  { id: 'official', name: 'Codex', icon: 'shield' },
  {
    id: 'dexthemes',
    name: 'DexThemes',
    icon: 'palette',
    groups: ['anime', 'games', 'movies', 'comics', 'zodiacs', 'lunar', 'companies', 'originals', 'supporter']
  },
  { id: 'community', name: 'Community', icon: 'users' }
];
