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
    id: 'monokai', name: 'Monokai', category: 'official', codeThemeId: 'monokai', variants: ['dark'], copies: 287, dateAdded: '2025-05-01',
    dark: { surface: '#272822', ink: '#F8F8F2', accent: '#F92672', contrast: 60, diffAdded: '#A6E22E', diffRemoved: '#F92672', skill: '#AE81FF', sidebar: '#1f201b', codeBg: '#1b1c17' },
    accents: ['#F92672', '#A6E22E', '#66D9EF']
  },
  {
    id: 'nord', name: 'Nord', category: 'official', codeThemeId: 'nord', variants: ['dark'], copies: 231, dateAdded: '2025-05-01',
    dark: { surface: '#2E3440', ink: '#ECEFF4', accent: '#88C0D0', contrast: 60, diffAdded: '#A3BE8C', diffRemoved: '#BF616A', skill: '#B48EAD', sidebar: '#272c36', codeBg: '#242830' },
    accents: ['#88C0D0']
  },
  {
    id: 'one-dark', name: 'One Dark', category: 'official', codeThemeId: 'one-dark-pro', variants: ['dark'], copies: 312, dateAdded: '2025-05-01',
    dark: { surface: '#282c34', ink: '#abb2bf', accent: '#61afef', contrast: 60, diffAdded: '#98c379', diffRemoved: '#e06c75', skill: '#c678dd', sidebar: '#21252b', codeBg: '#1d2025' },
    accents: ['#61afef']
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
    id: 'solarized', name: 'Solarized', category: 'official', codeThemeId: 'solarized', copies: 267, dateAdded: '2025-05-01',
    dark: { surface: '#002b36', ink: '#839496', accent: '#268bd2', contrast: 60, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#6c71c4', sidebar: '#00222b', codeBg: '#001e26' },
    light: { surface: '#fdf6e3', ink: '#657b83', accent: '#268bd2', contrast: 45, diffAdded: '#859900', diffRemoved: '#dc322f', skill: '#6c71c4', sidebar: '#f5eedb', codeBg: '#eee8d5' },
    accents: ['#268bd2']
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', category: 'official', codeThemeId: 'tokyo-night', variants: ['dark'], copies: 298, dateAdded: '2025-05-01',
    dark: { surface: '#1a1b26', ink: '#c0caf5', accent: '#7aa2f7', contrast: 60, diffAdded: '#9ece6a', diffRemoved: '#f7768e', skill: '#bb9af7', sidebar: '#13141d', codeBg: '#101018' },
    accents: ['#7aa2f7']
  },
  {
    id: 'vscode-plus', name: 'VS Code+', category: 'official', codeThemeId: 'codex', copies: 223, dateAdded: '2025-05-01',
    dark: { surface: '#1E1E1E', ink: '#D4D4D4', accent: '#007ACC', contrast: 60, ...DARK_DEFAULTS, sidebar: '#171717', codeBg: '#131313' },
    light: { surface: '#FFFFFF', ink: '#000000', accent: '#007ACC', contrast: 45, ...LIGHT_DEFAULTS, sidebar: '#f3f3f3', codeBg: '#ececec' },
    accents: ['#007ACC']
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
