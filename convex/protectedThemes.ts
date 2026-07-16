/**
 * Protected theme fingerprints — official Codex themes, DexThemes originals, and supporter exclusives.
 * Community submissions are rejected if their color values match any protected theme too closely.
 *
 * Each entry stores the core color triplet (surface, ink, accent) per variant.
 * We compare using Euclidean distance in RGB space with a strict threshold.
 */
import { STATIC_THEME_CATALOG } from "../shared/theme-api-catalog.js";

interface ProtectedVariant {
  surface: string;
  ink: string;
  accent: string;
}

interface ProtectedTheme {
  id: string;
  dark?: ProtectedVariant;
  light?: ProtectedVariant;
}

// ── Official Codex Themes ──────────────────────────────────────────────
const OFFICIAL: ProtectedTheme[] = [
  { id: 'codex', dark: { surface: '#111111', ink: '#fcfcfc', accent: '#0169cc' }, light: { surface: '#ffffff', ink: '#0d0d0d', accent: '#0169cc' } },
  { id: 'absolutely', dark: { surface: '#2d2d2b', ink: '#f9f9f7', accent: '#cc7d5e' }, light: { surface: '#f9f9f7', ink: '#2d2d2b', accent: '#cc7d5e' } },
  { id: 'ayu', dark: { surface: '#0b0e14', ink: '#bfbdb6', accent: '#e6b450' } },
  { id: 'catppuccin', dark: { surface: '#1e1e2e', ink: '#cdd6f4', accent: '#cba6f7' }, light: { surface: '#eff1f5', ink: '#4c4f69', accent: '#8839ef' } },
  { id: 'dracula', dark: { surface: '#282A36', ink: '#F8F8F2', accent: '#FF79C6' } },
  { id: 'everforest', dark: { surface: '#2d353b', ink: '#d3c6aa', accent: '#a7c080' }, light: { surface: '#fdf6e3', ink: '#5c6a72', accent: '#93b259' } },
  { id: 'github-dark', dark: { surface: '#0d1117', ink: '#e6edf3', accent: '#58a6ff' } },
  { id: 'github-light', light: { surface: '#ffffff', ink: '#1f2328', accent: '#0969da' } },
  { id: 'gruvbox', dark: { surface: '#1d2021', ink: '#ebdbb2', accent: '#fe8019' } },
  { id: 'linear', dark: { surface: '#0f0f11', ink: '#e3e4e6', accent: '#606acc' }, light: { surface: '#fcfcfd', ink: '#1b1b1b', accent: '#5e6ad2' } },
  { id: 'lobster', dark: { surface: '#111827', ink: '#e4e4e7', accent: '#ff5c5c' } },
  { id: 'material', dark: { surface: '#212121', ink: '#eeffff', accent: '#80cbc4' } },
  { id: 'matrix', dark: { surface: '#040805', ink: '#b8ffca', accent: '#1eff5a' } },
  { id: 'monokai', dark: { surface: '#272822', ink: '#F8F8F2', accent: '#F92672' } },
  { id: 'night-owl', dark: { surface: '#011627', ink: '#d6deeb', accent: '#44596b' } },
  { id: 'nord', dark: { surface: '#2E3440', ink: '#ECEFF4', accent: '#88C0D0' } },
  { id: 'notion', dark: { surface: '#191919', ink: '#d9d9d8', accent: '#3183d8' }, light: { surface: '#ffffff', ink: '#37352f', accent: '#3183d8' } },
  { id: 'oscurange', dark: { surface: '#0b0b0f', ink: '#e6e6e6', accent: '#f9b98c' } },
  { id: 'one-dark', dark: { surface: '#282c34', ink: '#abb2bf', accent: '#61afef' } },
  { id: 'proof', light: { surface: '#f5f3ed', ink: '#2f312d', accent: '#3d755d' } },
  { id: 'rose-pine', dark: { surface: '#191724', ink: '#e0def4', accent: '#c4a7e7' } },
  { id: 'sentry', dark: { surface: '#2d2935', ink: '#e6dff9', accent: '#7055f6' } },
  { id: 'solarized', dark: { surface: '#002b36', ink: '#839496', accent: '#268bd2' }, light: { surface: '#fdf6e3', ink: '#657b83', accent: '#268bd2' } },
  { id: 'temple', dark: { surface: '#02120c', ink: '#c7e6da', accent: '#e4f222' } },
  { id: 'tokyo-night', dark: { surface: '#1a1b26', ink: '#c0caf5', accent: '#7aa2f7' } },
  { id: 'vercel', dark: { surface: '#000000', ink: '#ededed', accent: '#006efe' }, light: { surface: '#ffffff', ink: '#171717', accent: '#006aff' } },
  { id: 'vscode-plus', dark: { surface: '#1E1E1E', ink: '#D4D4D4', accent: '#007ACC' }, light: { surface: '#FFFFFF', ink: '#000000', accent: '#007ACC' } },
  { id: 'xcode', dark: { surface: '#1f1f24', ink: '#ffffff', accent: '#5482ff' }, light: { surface: '#ffffff', ink: '#000000', accent: '#0e0eff' } },
];

// ── DexThemes Originals (anime, games, movies, comics, zodiacs, lunar, originals) ──
const DEXTHEMES: ProtectedTheme[] = [
  // Anime
  { id: 'ichigo-bankai', dark: { surface: '#0a0a0f', ink: '#f0eee8', accent: '#e63946' } },
  { id: 'ichigo-hollow', dark: { surface: '#0b0b10', ink: '#f5f5f0', accent: '#c8102e' } },
  { id: 'naruto-hidden-leaf', dark: { surface: '#0c0e08', ink: '#f2f0e0', accent: '#ff8c00' } },
  { id: 'gachiakuta-rudo', dark: { surface: '#0d0a08', ink: '#f0ece4', accent: '#d97706' } },
  { id: 'eren-titan-fall', dark: { surface: '#0e0c0a', ink: '#f2ede6', accent: '#b91c1c' } },
  { id: 'goku-ultra-instinct', dark: { surface: '#08080e', ink: '#f0f0fa', accent: '#a78bfa' } },
  { id: 'goku-ssj4', dark: { surface: '#100808', ink: '#f8f0e8', accent: '#dc2626' } },
  { id: 'yuji-sukuna', dark: { surface: '#0f0808', ink: '#f5ece8', accent: '#e11d48' } },
  { id: 'gojo-limitless', dark: { surface: '#080a12', ink: '#eef0fa', accent: '#60a5fa' } },
  { id: 'jojo-dio', dark: { surface: '#0a0810', ink: '#f0ecf5', accent: '#eab308' } },
  { id: 'solo-leveling', dark: { surface: '#08080e', ink: '#e8e8f5', accent: '#7c3aed' } },
  { id: 'trigun-gunsmoke', dark: { surface: '#100e08', ink: '#f5f0e4', accent: '#ef4444' } },
  { id: 'cowboy-bebop', dark: { surface: '#0a0a10', ink: '#e8e8f0', accent: '#3b82f6' } },
  { id: 'ghost-in-the-shell', dark: { surface: '#080a0a', ink: '#e0f0f0', accent: '#06b6d4' } },
  { id: 'luffy-gear-five', dark: { surface: '#0e0e0e', ink: '#fafafa', accent: '#f5f5f5' } },
  { id: 'shonen-sunset', dark: { surface: '#100a08', ink: '#f5ede4', accent: '#f97316' } },
  // Games
  { id: 'zelda-totk', dark: { surface: '#0a0e0a', ink: '#e8f2e8', accent: '#22c55e' } },
  { id: 'mario-fireball', dark: { surface: '#100808', ink: '#f5ece8', accent: '#ef4444' } },
  { id: 'master-chief', dark: { surface: '#080a08', ink: '#e0f0e0', accent: '#4ade80' } },
  { id: 'kratos-spartan', dark: { surface: '#0e0808', ink: '#f2e8e8', accent: '#dc2626' } },
  { id: 'cyberpunk-edgerunners', dark: { surface: '#0a080e', ink: '#f0ecf5', accent: '#f0db4f' } },
  { id: 'elden-ring', dark: { surface: '#0e0c08', ink: '#f5f0e4', accent: '#d4a53a' } },
  { id: 'god-of-war-ragnarok', dark: { surface: '#0c0808', ink: '#f0e8e8', accent: '#2563eb' } },
  { id: 'persona-5', dark: { surface: '#0e0808', ink: '#f5e8e8', accent: '#ef4444' } },
  { id: 'hollow-knight', dark: { surface: '#08080a', ink: '#e8e8f0', accent: '#e2e8f0' } },
  { id: 'ghost-of-tsushima', dark: { surface: '#0a0808', ink: '#f0ece8', accent: '#dc2626' } },
  // Movies
  { id: 'matrix-neo', dark: { surface: '#060806', ink: '#c0f0c0', accent: '#22c55e' } },
  { id: 'blade-runner-2049', dark: { surface: '#0e0a08', ink: '#f5ece0', accent: '#f97316' } },
  { id: 'tron-legacy', dark: { surface: '#050508', ink: '#e0e0f0', accent: '#06b6d4' } },
  { id: 'interstellar-endurance', dark: { surface: '#08080a', ink: '#e8e8f5', accent: '#60a5fa' } },
  { id: 'star-wars-empire', dark: { surface: '#080808', ink: '#e8e8e8', accent: '#ef4444' } },
  // Comics
  { id: 'batman-gotham', dark: { surface: '#0a0a0e', ink: '#e0e0f0', accent: '#eab308' } },
  { id: 'spider-verse', dark: { surface: '#0e0808', ink: '#f5e8e8', accent: '#ef4444' } },
  { id: 'invincible-mark', dark: { surface: '#0e0c08', ink: '#f5f0e0', accent: '#eab308' } },
  // Zodiacs
  { id: 'aries', dark: { surface: '#100808', ink: '#f5e8e8', accent: '#ef4444' } },
  { id: 'taurus', dark: { surface: '#0a0e0a', ink: '#e8f2e8', accent: '#22c55e' } },
  { id: 'gemini', dark: { surface: '#0a0a0e', ink: '#ececf5', accent: '#eab308' } },
  { id: 'cancer', dark: { surface: '#08080e', ink: '#e8e8f5', accent: '#e2e8f0' } },
  { id: 'leo', dark: { surface: '#100c08', ink: '#f5f0e4', accent: '#f97316' } },
  { id: 'virgo', dark: { surface: '#0a0e0a', ink: '#e8f2e8', accent: '#4ade80' } },
  { id: 'libra', dark: { surface: '#0a080e', ink: '#f0ecf5', accent: '#a78bfa' } },
  { id: 'scorpio', dark: { surface: '#0e0808', ink: '#f5e8e8', accent: '#dc2626' } },
  { id: 'sagittarius', dark: { surface: '#0e0a08', ink: '#f5ece4', accent: '#8b5cf6' } },
  { id: 'capricorn', dark: { surface: '#0a0a0a', ink: '#e8e8e8', accent: '#6b7280' } },
  { id: 'aquarius', dark: { surface: '#080a0e', ink: '#e8ecf5', accent: '#06b6d4' } },
  { id: 'pisces', dark: { surface: '#080a0e', ink: '#e8ecf5', accent: '#818cf8' } },
  // Lunar
  { id: 'lunar-rat', dark: { surface: '#0a0a0a', ink: '#e8e8e8', accent: '#6b7280' } },
  { id: 'lunar-ox', dark: { surface: '#0e0c08', ink: '#f5f0e4', accent: '#92400e' } },
  { id: 'lunar-tiger', dark: { surface: '#100a08', ink: '#f5ece0', accent: '#f97316' } },
  { id: 'lunar-rabbit', dark: { surface: '#0e0c0e', ink: '#f5f0f5', accent: '#e8b4b8' } },
  { id: 'lunar-dragon', dark: { surface: '#0a0808', ink: '#f0e8e8', accent: '#dc2626' } },
  { id: 'lunar-snake', dark: { surface: '#080a08', ink: '#e0f0e0', accent: '#16a34a' } },
  { id: 'lunar-horse', dark: { surface: '#0e0a08', ink: '#f5ece0', accent: '#b45309' } },
  { id: 'lunar-goat', dark: { surface: '#0e0e0c', ink: '#f5f5f0', accent: '#d4d4aa' } },
  { id: 'lunar-monkey', dark: { surface: '#100c08', ink: '#f5f0e4', accent: '#d97706' } },
  { id: 'lunar-rooster', dark: { surface: '#100808', ink: '#f5e8e8', accent: '#ef4444' } },
  { id: 'lunar-dog', dark: { surface: '#0c0a08', ink: '#f2ece4', accent: '#92400e' } },
  { id: 'lunar-pig', dark: { surface: '#100a0a', ink: '#f5ecec', accent: '#f472b6' } },
];

// ── Unlocks ──────────────────────────────────────────────────────────
const SUPPORTER: ProtectedTheme[] = [
  {
    id: 'patron',
    dark: { surface: '#0F0D09', ink: '#FFF5DC', accent: '#D4A54A' },
    light: { surface: '#FAF5EC', ink: '#2C2416', accent: '#A87B1E' },
  },
  {
    id: 'seraphim',
    dark: { surface: '#0B0E18', ink: '#EAF0FF', accent: '#7EB4F0' },
    light: { surface: '#F5F8FF', ink: '#1C2235', accent: '#4A7FCC' },
  },
  {
    id: 'mint-condition',
    dark: { surface: '#090E0B', ink: '#E8F5EC', accent: '#4FBF7A' },
    light: { surface: '#F4FAF5', ink: '#1A2B20', accent: '#2D8C54' },
  },
  {
    id: 'cupids-code',
    dark: { surface: '#140B0E', ink: '#FFE8EE', accent: '#E0708A' },
    light: { surface: '#FFF4F6', ink: '#2D1820', accent: '#C44466' },
  },
  {
    id: 'heartbeat',
    dark: { surface: '#180A0A', ink: '#FFE0E0', accent: '#E84057' },
    light: { surface: '#FFF5F5', ink: '#2D1018', accent: '#C62840' },
  },
  {
    id: 'summit',
    dark: { surface: '#0E1018', ink: '#E8ECF4', accent: '#F0C050' },
    light: { surface: '#F8F6F0', ink: '#1C1E28', accent: '#C89820' },
  },
  {
    id: 'the-builder',
    dark: { surface: '#121416', ink: '#E8E4E0', accent: '#E8802A' },
    light: { surface: '#F8F6F2', ink: '#1C1A18', accent: '#C06018' },
  },
  {
    id: 'kaleidoscope',
    dark: { surface: '#0E0A14', ink: '#F0E8FF', accent: '#E850E8' },
    light: { surface: '#FFF8FC', ink: '#1A1028', accent: '#C030C0' },
  },
  {
    id: 'agent-claw',
    dark: { surface: '#0A100A', ink: '#D8F0D8', accent: '#00E870' },
    light: { surface: '#F2FAF2', ink: '#0C1C0C', accent: '#00A848' },
  },
  {
    id: 'homebase',
    dark: { surface: '#14100A', ink: '#F0E8D8', accent: '#E0A040' },
    light: { surface: '#FAF6F0', ink: '#2C2418', accent: '#B87818' },
  },
  {
    id: 'yin-yang',
    dark: { surface: '#0A0A0A', ink: '#F0F0F0', accent: '#FFFFFF' },
    light: { surface: '#FAFAFA', ink: '#0A0A0A', accent: '#000000' },
  },
  {
    id: 'plugged-in',
    dark: { surface: '#0A0B18', ink: '#EFF4FF', accent: '#6F7CFF' },
    light: { surface: '#F6F7FF', ink: '#171A31', accent: '#4D5AD8' },
  },
  {
    id: 'voiceprint',
    dark: { surface: '#130A18', ink: '#FFF0FF', accent: '#EF62D6' },
    light: { surface: '#FFF6FD', ink: '#2C152D', accent: '#B834A0' },
  },
  {
    id: 'builder-of-agi',
    dark: { surface: '#101414', ink: '#F2F7F5', accent: '#35C995' },
    light: { surface: '#F7FAF9', ink: '#17201D', accent: '#14845F' },
  },
  {
    id: 'triple-dot',
    dark: { surface: '#0C0E12', ink: '#EEF2F9', accent: '#FF6B6B' },
    light: { surface: '#F7F7FB', ink: '#1F2230', accent: '#E05252' },
  },
];

const CATALOG_PROTECTED: ProtectedTheme[] = STATIC_THEME_CATALOG.map((theme: any) => ({
  id: String(theme.id || theme.themeId),
  dark: theme.dark
    ? { surface: theme.dark.surface, ink: theme.dark.ink, accent: theme.dark.accent }
    : undefined,
  light: theme.light
    ? { surface: theme.light.surface, ink: theme.light.ink, accent: theme.light.accent }
    : undefined,
}));

// The generated catalog is the canonical static-ID and palette boundary. The
// checked-in arrays remain as readable documentation and a fallback, while
// catalog entries win if a theme is updated or added.
const ALL_PROTECTED: ProtectedTheme[] = [...new Map(
  [...OFFICIAL, ...DEXTHEMES, ...SUPPORTER, ...CATALOG_PROTECTED]
    .map((theme) => [theme.id, theme]),
).values()];
const PROTECTED_THEME_IDS = new Set(ALL_PROTECTED.map((theme) => theme.id));

// ── Color distance ────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').toLowerCase();
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Maximum Euclidean distance in RGB space for a "too similar" match.
// ~15 = barely perceptible difference (~6 per channel).
// This catches exact copies and trivial shifts but allows genuinely different themes.
const SIMILARITY_THRESHOLD = 15;

function variantTooSimilar(
  submitted: { surface: string; ink: string; accent: string },
  protected_: ProtectedVariant
): boolean {
  const dSurface = colorDistance(submitted.surface, protected_.surface);
  const dInk = colorDistance(submitted.ink, protected_.ink);
  const dAccent = colorDistance(submitted.accent, protected_.accent);
  // All three core colors must be within threshold to be considered a clone
  return dSurface <= SIMILARITY_THRESHOLD && dInk <= SIMILARITY_THRESHOLD && dAccent <= SIMILARITY_THRESHOLD;
}

// ── Public API ────────────────────────────────────────────────────────

export interface ProtectionCheckResult {
  allowed: boolean;
  matchedThemeId?: string;
  reason?: string;
}

export function isProtectedThemeId(themeId: string): boolean {
  return PROTECTED_THEME_IDS.has(themeId);
}

export function checkThemeProtection(
  dark?: { surface: string; ink: string; accent: string } | null,
  light?: { surface: string; ink: string; accent: string } | null,
): ProtectionCheckResult {
  for (const pt of ALL_PROTECTED) {
    if (dark && pt.dark && variantTooSimilar(dark, pt.dark)) {
      return {
        allowed: false,
        matchedThemeId: pt.id,
        reason: `Theme colors are too similar to the protected "${pt.id}" theme (dark variant)`,
      };
    }
    if (light && pt.light && variantTooSimilar(light, pt.light)) {
      return {
        allowed: false,
        matchedThemeId: pt.id,
        reason: `Theme colors are too similar to the protected "${pt.id}" theme (light variant)`,
      };
    }
  }
  return { allowed: true };
}
