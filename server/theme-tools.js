import { STATIC_THEME_CATALOG } from "../shared/theme-api-catalog.js";
import {
  evaluatePublicThemeIdentity,
  getPluginThemeAlias,
  getPluginThemeSearchTerms,
  resolvePluginThemeSourceId,
  sanitizeThemeForPlugin,
} from "../shared/plugin-public-policy.js";

const COMMUNITY_THEMES_URL =
  process.env.DEXTHEMES_COMMUNITY_THEMES_URL ||
  "https://acrobatic-corgi-867.convex.site/themes/community";
const LEADERBOARD_URL =
  process.env.DEXTHEMES_LEADERBOARD_URL ||
  "https://acrobatic-corgi-867.convex.site/leaderboard";
const CATALOG_CACHE_TTL_MS = 30 * 1000;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const THEME_ID_MAX_LENGTH = 64;
const CODE_THEME_ID_MAX_LENGTH = 80;
const FONT_NAME_MAX_LENGTH = 100;
const VARIANT_KEYS = [
  "surface",
  "ink",
  "accent",
  "diffAdded",
  "diffRemoved",
  "skill",
];
let catalogCache = null;
let catalogCacheExpiresAt = 0;
let catalogRequest = null;

function timeoutSignal(milliseconds) {
  return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(milliseconds)
    : undefined;
}

async function fetchJson(url, fallback) {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", Origin: "https://www.dexthemes.com" },
      signal: timeoutSignal(4500),
    });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

export async function loadThemeCatalog() {
  const now = Date.now();
  if (catalogCache && now < catalogCacheExpiresAt) return catalogCache;
  if (catalogRequest) return catalogRequest;
  catalogRequest = (async () => {
    const community = await fetchJson(COMMUNITY_THEMES_URL, []);
    const publicStatic = STATIC_THEME_CATALOG.filter((theme) =>
      !theme._hiddenUntilUnlocked && theme.subgroup !== "unlockables"
    );
    catalogCache = [...publicStatic, ...(Array.isArray(community) ? community : [])];
    catalogCacheExpiresAt = Date.now() + CATALOG_CACHE_TTL_MS;
    return catalogCache;
  })();
  try {
    return await catalogRequest;
  } finally {
    catalogRequest = null;
  }
}

function searchableText(theme) {
  const alias = getPluginThemeAlias(theme.id || theme.themeId);
  return [
    theme.name,
    theme.id,
    theme.themeId,
    theme.category,
    theme.subgroup,
    theme._summary,
    theme.summary,
    theme.authorName,
    alias?.name,
    alias?.id,
    ...getPluginThemeSearchTerms(theme.id || theme.themeId),
  ].filter(Boolean).join(" ").toLowerCase();
}

export function compactTheme(theme) {
  const id = theme.id || theme.themeId;
  return {
    id,
    name: theme.name,
    category: theme.category || "community",
    subgroup: theme.subgroup || null,
    summary: theme.summary || theme._summary || null,
    authorName: theme.authorName || theme._authorName || null,
    copies: theme.copies || 0,
    dark: theme.dark || null,
    light: theme.light || null,
    accents: theme.accents || [],
  };
}

export function compactPluginTheme(theme) {
  const safeTheme = sanitizeThemeForPlugin(theme);
  if (!safeTheme) return null;
  return compactTheme(safeTheme);
}

export function getUnlockedThemeDetails(themeId) {
  const target = String(themeId || "").trim().toLowerCase();
  const theme = STATIC_THEME_CATALOG.find((entry) =>
    entry.subgroup === "unlockables" &&
    String(entry.id || entry.themeId || "").toLowerCase() === target
  );
  if (!theme) return null;
  return compactTheme(theme);
}

export async function searchThemes(query, limit = 12) {
  const catalog = await loadThemeCatalog();
  const terms = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  const scored = catalog.map((theme) => {
    const haystack = searchableText(theme);
    const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
    return { theme, score };
  });
  const matches = terms.length
    ? scored.filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score)
    : scored;
  return matches
    .map(({ theme }) => compactPluginTheme(theme))
    .filter(Boolean)
    .slice(0, Math.max(1, Math.min(limit, 24)));
}

export async function fetchThemeById(id) {
  const target = resolvePluginThemeSourceId(id);
  const catalog = await loadThemeCatalog();
  const theme = catalog.find((entry) =>
    String(entry.id || entry.themeId || "").toLowerCase() === target
  );
  return theme ? compactPluginTheme(theme) : null;
}

function hash32(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hslToHex(hue, saturation, lightness) {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const segment = ((hue % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const [r1, g1, b1] =
    segment < 1 ? [chroma, x, 0] :
    segment < 2 ? [x, chroma, 0] :
    segment < 3 ? [0, chroma, x] :
    segment < 4 ? [0, x, chroma] :
    segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = l - chroma / 2;
  return `#${[r1, g1, b1].map((channel) =>
    Math.round((channel + m) * 255).toString(16).padStart(2, "0")
  ).join("")}`.toUpperCase();
}

function generatedVariant(seed, mode, requestedContrast) {
  const hue = seed % 360;
  const accent = hslToHex(hue, 72, mode === "dark" ? 62 : 43);
  const skill = hslToHex(hue + 72, 64, mode === "dark" ? 70 : 44);
  const surface = hslToHex(hue + 12, 22, mode === "dark" ? 7 : 97);
  const sidebar = hslToHex(hue + 12, 24, mode === "dark" ? 4 : 93);
  const codeBg = hslToHex(hue + 12, 26, mode === "dark" ? 3 : 90);
  return {
    surface,
    ink: mode === "dark" ? "#F4F5F7" : "#181A1F",
    accent,
    contrast: requestedContrast ?? (mode === "dark" ? 64 : 49),
    diffAdded: mode === "dark" ? "#4FD18A" : "#16844A",
    diffRemoved: mode === "dark" ? "#F06A6A" : "#B82E38",
    skill,
    sidebar,
    codeBg,
  };
}

export function slugifyThemeName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "untitled-theme";
}

function generatedName(inspiration) {
  const words = String(inspiration)
    .replace(/[^A-Za-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2);
  const base = words.length ? words.map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") : "Custom";
  return `${base} Signal`.slice(0, 80);
}

export function draftTheme(input) {
  const inspiration = String(input.inspiration || "personal focus").trim();
  const customName = typeof input.name === "string" && input.name.trim().length > 0;
  const name = customName ? input.name.trim() : generatedName(inspiration);
  const id = input.themeId ? slugifyThemeName(input.themeId) : slugifyThemeName(name);
  const seed = hash32(`${inspiration}:${name}`);
  const variant = input.variant || "both";
  const theme = {
    id,
    themeId: id,
    name,
    summary: String(input.summary || `A DexThemes palette inspired by ${inspiration}.`).slice(0, 240),
    category: "community",
    codeThemeId: input.codeThemeId || { dark: "codex", light: "codex" },
    dark: variant === "light" ? null : (input.dark || generatedVariant(seed, "dark", input.contrast)),
    light: variant === "dark" ? null : (input.light || generatedVariant(seed, "light", input.contrast)),
  };
  theme.accents = [...new Set([theme.dark?.accent, theme.light?.accent].filter(Boolean))];
  return { theme, usedCustomName: customName, needsNameConfirmation: !customName };
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function protectedPaletteSignatures() {
  return new Set(STATIC_THEME_CATALOG.flatMap((theme) => [theme.dark, theme.light])
    .filter(Boolean)
    .map((variant) => `${variant.surface.toLowerCase()}:${variant.ink.toLowerCase()}:${variant.accent.toLowerCase()}`));
}

const PROTECTED_THEME_IDS = new Set(
  STATIC_THEME_CATALOG.map((theme) => String(theme.id || theme.themeId)),
);

export function validateTheme(theme) {
  const errors = [];
  const warnings = [];
  const name = String(theme?.name || "").trim();
  const summary = String(theme?.summary || "").trim();
  const id = String(theme?.themeId || theme?.id || "");
  if (name.length < 1 || name.length > 80) errors.push("Theme name must be 1-80 characters.");
  if (summary.length < 1 || summary.length > 240) errors.push("Summary must be 1-240 characters.");
  if (id.length > THEME_ID_MAX_LENGTH) errors.push(`Theme ID must be at most ${THEME_ID_MAX_LENGTH} characters.`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) errors.push("Theme ID must be kebab-case.");
  if (PROTECTED_THEME_IDS.has(id)) errors.push("Theme ID is reserved by DexThemes.");
  if (!theme?.dark && !theme?.light) errors.push("At least one dark or light variant is required.");
  if (Array.isArray(theme?.accents) && theme.accents.length > 10) errors.push("A maximum of 10 accents is allowed.");
  for (const [index, accent] of (theme?.accents || []).entries()) {
    if (!HEX.test(String(accent || ""))) errors.push(`accents[${index}] must be a six-digit hex color.`);
  }

  const codeThemeIds = typeof theme?.codeThemeId === "string"
    ? [theme.codeThemeId]
    : [theme?.codeThemeId?.dark, theme?.codeThemeId?.light].filter((value) => value != null);
  for (const value of codeThemeIds) {
    if (typeof value !== "string" || value.length < 1 || value.length > CODE_THEME_ID_MAX_LENGTH) {
      errors.push(`Code theme IDs must be 1-${CODE_THEME_ID_MAX_LENGTH} characters.`);
      break;
    }
  }

  const protectedSignatures = protectedPaletteSignatures();
  for (const mode of ["dark", "light"]) {
    const variant = theme?.[mode];
    if (!variant) continue;
    for (const key of [...VARIANT_KEYS, "sidebar", "codeBg"]) {
      if (variant[key] == null) continue;
      if (!HEX.test(String(variant[key] || ""))) errors.push(`${mode}.${key} must be a six-digit hex color.`);
    }
    if (!Number.isFinite(variant.contrast) || variant.contrast < 0 || variant.contrast > 100) {
      errors.push(`${mode}.contrast must be between 0 and 100.`);
    }
    if (HEX.test(variant.surface) && HEX.test(variant.ink)) {
      const ratio = contrastRatio(variant.surface, variant.ink);
      if (ratio < 4.5) warnings.push(`${mode} surface/ink contrast is ${ratio.toFixed(2)}:1; aim for at least 4.5:1.`);
    }
    if (VARIANT_KEYS.slice(0, 3).every((key) => HEX.test(variant[key]))) {
      const signature = `${variant.surface.toLowerCase()}:${variant.ink.toLowerCase()}:${variant.accent.toLowerCase()}`;
      if (protectedSignatures.has(signature)) errors.push(`${mode} duplicates a protected official or DexThemes palette.`);
    }
  }

  if (!errors.length) warnings.push("Final publication also runs server-side name, summary, and protected-palette moderation.");
  return { valid: errors.length === 0, errors, warnings };
}

export function validatePublicTheme(theme) {
  const validation = validateTheme(theme);
  const identity = evaluatePublicThemeIdentity(theme);
  const errors = [...validation.errors];
  if (!identity.allowed) {
    errors.push(
      `Public theme names, IDs, and summaries must use original wording. Try a name such as ${identity.suggestedNames.join(", ")} and the summary: ${identity.suggestedSummary}`,
    );
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings: validation.warnings,
    suggestedNames: identity.suggestedNames,
    suggestedSummary: identity.suggestedSummary,
  };
}

export function prepareThemeApply(theme, variant) {
  const name = String(theme?.name || "");
  const summary = String(theme?.summary || "");
  const id = String(theme?.themeId || theme?.id || "");
  if (name.length < 1 || name.length > 80) throw new Error("Theme name must be 1-80 characters.");
  if (summary.length < 1 || summary.length > 240) throw new Error("Summary must be 1-240 characters.");
  if (id.length < 1 || id.length > THEME_ID_MAX_LENGTH) {
    throw new Error(`Theme ID must be 1-${THEME_ID_MAX_LENGTH} characters.`);
  }
  const selected = theme?.[variant];
  if (!selected) throw new Error(`${variant} variant is not available for this theme.`);
  for (const key of [...VARIANT_KEYS, "sidebar", "codeBg"]) {
    if (selected[key] == null) continue;
    if (!HEX.test(String(selected[key] || ""))) {
      throw new Error(`${variant}.${key} must be a six-digit hex color.`);
    }
  }
  for (const [index, color] of (theme.accents || []).entries()) {
    if (!HEX.test(String(color || ""))) throw new Error(`accents[${index}] must be a six-digit hex color.`);
  }
  if ((theme.accents || []).length > 10) throw new Error("A maximum of 10 accents is allowed.");
  if (!Number.isFinite(selected.contrast) || selected.contrast < 0 || selected.contrast > 100) {
    throw new Error(`${variant}.contrast must be between 0 and 100.`);
  }
  const accent = theme.accents?.[0] || selected.accent;
  const codeThemeId = typeof theme.codeThemeId === "string"
    ? theme.codeThemeId
    : theme.codeThemeId?.[variant] || "codex";
  if (codeThemeId.length < 1 || codeThemeId.length > CODE_THEME_ID_MAX_LENGTH) {
    throw new Error(`Code theme IDs must be 1-${CODE_THEME_ID_MAX_LENGTH} characters.`);
  }
  const rawFonts = selected.fonts;
  if (rawFonts != null && (typeof rawFonts !== "object" || Array.isArray(rawFonts))) {
    throw new Error("Theme fonts must be an object.");
  }
  const fonts = { code: rawFonts?.code ?? null, ui: rawFonts?.ui ?? null };
  for (const [key, value] of Object.entries(fonts)) {
    if (value != null && (typeof value !== "string" || value.length > FONT_NAME_MAX_LENGTH)) {
      throw new Error(`${variant}.fonts.${key} must be at most ${FONT_NAME_MAX_LENGTH} characters.`);
    }
  }
  const importString = `codex-theme-v1:${JSON.stringify({
    codeThemeId,
    theme: {
      accent,
      contrast: selected.contrast,
      fonts,
      ink: selected.ink,
      opaqueWindows: selected.opaqueWindows ?? true,
      semanticColors: {
        diffAdded: selected.diffAdded,
        diffRemoved: selected.diffRemoved,
        skill: selected.skill,
      },
      surface: selected.surface,
    },
    variant,
  })}`;
  return { importString, settingsUrl: "codex://settings", variant };
}

export async function getLeaderboard() {
  const data = await fetchJson(LEADERBOARD_URL, {
    daily: [],
    weekly: [],
    monthly: [],
    allTime: [],
    periods: {},
  });
  return {
    daily: sanitizeLeaderboardRows(data?.daily),
    weekly: sanitizeLeaderboardRows(data?.weekly),
    monthly: sanitizeLeaderboardRows(data?.monthly),
    allTime: sanitizeLeaderboardRows(data?.allTime),
    periods: data?.periods && typeof data.periods === "object" ? data.periods : {},
  };
}

function sanitizeLeaderboardRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((theme) => sanitizeThemeForPlugin(theme))
    .filter(Boolean);
}

function redactSensitiveText(value) {
  let text = String(value || "");
  const redactions = [];
  const replace = (label, pattern, replacement = `[redacted ${label}]`) => {
    const before = text;
    text = text.replace(pattern, replacement);
    if (text !== before) redactions.push(label);
  };
  replace("private key", /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g);
  replace("credential URL", /\bhttps?:\/\/[^\/\s:@]+:[^\/\s@]+@[^\s<>'"]+/gi);
  replace("authorization header", /\b(?:authorization\s*:\s*)?bearer\s+[A-Za-z0-9._~+\/-]+=*/gi);
  replace("access token", /\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{12,}|glpat-[A-Za-z0-9_-]{12,}|xox[baprs]-[A-Za-z0-9-]{10,}|npm_[A-Za-z0-9]{10,}|sk_live_[A-Za-z0-9]{12,}|AIza[A-Za-z0-9_-]{20,}|dx[tp]_[A-Za-z0-9_]{12,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g);
  replace("cloud access key", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g);
  replace("cookie header", /\b(?:set-cookie|cookie)\s*:\s*[^\r\n]+/gi);
  replace("session cookie", /\b(?:__Host-|__Secure-)?(?:session|sid|auth|token)[A-Za-z0-9_.-]*\s*=\s*[^;\s]+/gi);
  replace("secret value", /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret|aws[_-]?secret[_-]?access[_-]?key|session(?:[_-]?(?:id|token))?)\s*[:=]\s*[^\s,;]+/gi);
  replace("email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi);
  replace("home path", /(?:\/Users\/|\/home\/)[^/\s]+/g, "/[redacted home]");
  replace("home path", /[A-Za-z]:\\Users\\[^\\\s]+/g, "[redacted home]");
  replace("private path", /\/(?:private|workspace|workspaces|secrets?|credentials?)(?:\/[^\s,;]+)+/gi);
  replace("private path", /[A-Za-z]:\\(?:private|workspace|workspaces|secrets?|credentials?)(?:\\[^\s,;]+)+/gi);
  return { text, redactions };
}

export function prepareGitHubIssue({ title, description, steps, expected, context }) {
  const titleResult = redactSensitiveText(String(title || "DexThemes plugin feedback").trim());
  const safeTitle = titleResult.text.slice(0, 120);
  const redactions = [...titleResult.redactions];
  const sections = [
    ["Description", description],
    ["Steps to reproduce", steps],
    ["Expected behavior", expected],
    ["Plugin context", context],
  ].filter(([, value]) => typeof value === "string" && value.trim())
    .map(([heading, value]) => {
      const result = redactSensitiveText(String(value).trim().slice(0, 2000));
      redactions.push(...result.redactions);
      return [heading, result.text];
    });
  const body = [
    "<!-- Review this content before submitting. Do not include secrets or private workspace data. -->",
    ...sections.flatMap(([heading, value]) => [`## ${heading}`, value, ""]),
    "_Prepared by the DexThemes plugin; submitted only after you review GitHub's issue form._",
  ].join("\n").slice(0, 7000);
  return {
    title: safeTitle,
    body,
    redactions: [...new Set(redactions)],
    redactionNotice: "Best-effort redaction can miss sensitive context. Review every character before opening GitHub.",
    reviewRequired: true,
  };
}
