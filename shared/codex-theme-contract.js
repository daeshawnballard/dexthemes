export const CODEX_THEME_IMPORT_PREFIX = "codex-theme-v1:";
export const DEFAULT_CODE_THEME_ID = "codex";

// Verified against Codex desktop 26.721.41059 (build 5848). These are the
// registered code-theme family IDs, not the bundled Shiki module filenames.
export const CODEX_CODE_THEME_VARIANTS = Object.freeze({
  absolutely: Object.freeze(["dark", "light"]),
  ayu: Object.freeze(["dark"]),
  catppuccin: Object.freeze(["dark", "light"]),
  codex: Object.freeze(["dark", "light"]),
  dracula: Object.freeze(["dark"]),
  everforest: Object.freeze(["dark", "light"]),
  github: Object.freeze(["dark", "light"]),
  gruvbox: Object.freeze(["dark", "light"]),
  linear: Object.freeze(["dark", "light"]),
  lobster: Object.freeze(["dark"]),
  material: Object.freeze(["dark"]),
  matrix: Object.freeze(["dark"]),
  monokai: Object.freeze(["dark"]),
  "night-owl": Object.freeze(["dark"]),
  nord: Object.freeze(["dark"]),
  notion: Object.freeze(["dark", "light"]),
  one: Object.freeze(["dark", "light"]),
  oscurange: Object.freeze(["dark"]),
  proof: Object.freeze(["light"]),
  raycast: Object.freeze(["dark", "light"]),
  "rose-pine": Object.freeze(["dark", "light"]),
  sentry: Object.freeze(["dark"]),
  solarized: Object.freeze(["dark", "light"]),
  temple: Object.freeze(["dark"]),
  "tokyo-night": Object.freeze(["dark"]),
  vercel: Object.freeze(["dark", "light"]),
  "vscode-plus": Object.freeze(["dark", "light"]),
  xcode: Object.freeze(["dark", "light"]),
});

export const CODEX_CODE_THEME_IDS = Object.freeze(
  Object.keys(CODEX_CODE_THEME_VARIANTS),
);

// Older DexThemes entries used internal Shiki module filenames. Codex imports
// accept the registered family IDs above, so normalize only these known legacy
// values and reject every other unknown value.
export const LEGACY_CODE_THEME_ID_ALIASES = Object.freeze({
  "github-dark-default": Object.freeze({ id: "github", variant: "dark" }),
  "github-light-default": Object.freeze({ id: "github", variant: "light" }),
  "gruvbox-dark-hard": Object.freeze({ id: "gruvbox", variant: "dark" }),
  "one-dark-pro": Object.freeze({ id: "one", variant: "dark" }),
});

export const CODEX_CODE_THEME_INPUT_IDS = Object.freeze([
  ...CODEX_CODE_THEME_IDS,
  ...Object.keys(LEGACY_CODE_THEME_ID_ALIASES),
]);

const IMPORT_COLOR_KEYS = Object.freeze([
  "surface",
  "ink",
  "accent",
  "diffAdded",
  "diffRemoved",
  "skill",
]);
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const FONT_NAME_MAX_LENGTH = 100;
const CODEX_VARIANTS = Object.freeze(["dark", "light"]);

export function canonicalizeCodexCodeThemeId(value, variant) {
  if (typeof value !== "string") return null;
  const legacy = LEGACY_CODE_THEME_ID_ALIASES[value];
  if (legacy && variant && legacy.variant !== variant) return null;
  const canonical = legacy?.id || value;
  const variants = CODEX_CODE_THEME_VARIANTS[canonical];
  if (!variants || (variant && !variants.includes(variant))) return null;
  return canonical;
}

export function normalizeThemeCodeThemeId(theme) {
  const configured = theme?.codeThemeId ?? DEFAULT_CODE_THEME_ID;
  const availableVariants = CODEX_VARIANTS.filter((variant) => theme?.[variant]);

  if (typeof configured === "string") {
    const variants = availableVariants.length ? availableVariants : [undefined];
    const normalized = variants.map((variant) =>
      canonicalizeCodexCodeThemeId(configured, variant)
    );
    if (normalized.some((value) => value == null)) return null;
    if (new Set(normalized).size !== 1) return null;
    return normalized[0];
  }

  if (!configured || typeof configured !== "object" || Array.isArray(configured)) {
    return null;
  }

  const variants = CODEX_VARIANTS.filter((variant) =>
    theme?.[variant] || Object.hasOwn(configured, variant)
  );
  if (!variants.length) return null;

  const normalized = {};
  for (const variant of variants) {
    const rawValue = configured[variant] ?? DEFAULT_CODE_THEME_ID;
    const codeThemeId = canonicalizeCodexCodeThemeId(rawValue, variant);
    if (!codeThemeId) return null;
    normalized[variant] = codeThemeId;
  }
  return normalized;
}

export function resolveThemeCodeThemeId(theme, variant) {
  if (!CODEX_VARIANTS.includes(variant)) return null;
  const configured = theme?.codeThemeId;
  const value = typeof configured === "string"
    ? configured
    : configured?.[variant] ?? DEFAULT_CODE_THEME_ID;
  return canonicalizeCodexCodeThemeId(value, variant);
}

export function validateCodexThemeImport(theme, variant, accentIndex = 0) {
  const errors = [];
  if (!CODEX_VARIANTS.includes(variant)) {
    return {
      valid: false,
      errors: ["Theme variant must be dark or light."],
      payload: null,
    };
  }

  const selected = theme?.[variant];
  if (!selected || typeof selected !== "object" || Array.isArray(selected)) {
    return {
      valid: false,
      errors: [`${variant} variant is not available for this theme.`],
      payload: null,
    };
  }

  const accents = theme?.accents;
  if (accents != null && !Array.isArray(accents)) {
    errors.push("Theme accents must be an array.");
  } else if (accents?.length > 10) {
    errors.push("A maximum of 10 accents is allowed.");
  } else {
    for (const [index, color] of (accents || []).entries()) {
      if (!HEX_COLOR.test(String(color || ""))) {
        errors.push(`accents[${index}] must be a six-digit hex color.`);
      }
    }
  }

  for (const key of IMPORT_COLOR_KEYS) {
    if (!HEX_COLOR.test(String(selected[key] || ""))) {
      errors.push(`${variant}.${key} must be a six-digit hex color.`);
    }
  }

  const accent = Array.isArray(accents) && accents[accentIndex]
    ? accents[accentIndex]
    : selected.accent;
  if (!HEX_COLOR.test(String(accent || ""))) {
    errors.push(`${variant} import accent must be a six-digit hex color.`);
  }

  if (
    !Number.isInteger(selected.contrast) ||
    selected.contrast < 0 ||
    selected.contrast > 100
  ) {
    errors.push(`${variant}.contrast must be an integer between 0 and 100.`);
  }

  const rawFonts = selected.fonts;
  if (rawFonts != null && (typeof rawFonts !== "object" || Array.isArray(rawFonts))) {
    errors.push("Theme fonts must be an object.");
  }
  const fonts = {
    code: rawFonts && typeof rawFonts === "object" ? rawFonts.code ?? null : null,
    ui: rawFonts && typeof rawFonts === "object" ? rawFonts.ui ?? null : null,
  };
  for (const [key, value] of Object.entries(fonts)) {
    if (value != null && (typeof value !== "string" || value.length > FONT_NAME_MAX_LENGTH)) {
      errors.push(`${variant}.fonts.${key} must be at most ${FONT_NAME_MAX_LENGTH} characters.`);
    }
  }

  if (selected.opaqueWindows != null && typeof selected.opaqueWindows !== "boolean") {
    errors.push(`${variant}.opaqueWindows must be a boolean.`);
  }

  const codeThemeId = resolveThemeCodeThemeId(theme, variant);
  if (!codeThemeId) {
    const configured = typeof theme?.codeThemeId === "string"
      ? theme.codeThemeId
      : theme?.codeThemeId?.[variant] ?? DEFAULT_CODE_THEME_ID;
    errors.push(`Unsupported Codex code theme ID "${String(configured)}" for ${variant}.`);
  }

  if (errors.length) {
    return { valid: false, errors: [...new Set(errors)], payload: null };
  }

  return {
    valid: true,
    errors: [],
    payload: {
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
    },
  };
}

export function buildCodexThemeImport(theme, variant, accentIndex = 0) {
  const validation = validateCodexThemeImport(theme, variant, accentIndex);
  if (!validation.valid) {
    return { ...validation, importString: "" };
  }
  return {
    ...validation,
    importString: `${CODEX_THEME_IMPORT_PREFIX}${JSON.stringify(validation.payload)}`,
  };
}
