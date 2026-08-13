import { getPlatform, normalizePlatformId } from "../shared/platform-registry.js";
import {
  prepareDeepSeekThemeApply,
  slugifyThemeName,
  validateTheme,
} from "./theme-tools.js";

export const LUNA_MODEL = "gpt-5.6-luna";
export const LUNA_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const LUNA_TIMEOUT_MS = 20_000;
export const LUNA_MAX_PROMPT_LENGTH = 800;

const HEX_PATTERN = "^#[0-9A-Fa-f]{6}$";
const VARIANT_PROPERTIES = Object.freeze({
  surface: { type: "string", pattern: HEX_PATTERN },
  ink: { type: "string", pattern: HEX_PATTERN },
  accent: { type: "string", pattern: HEX_PATTERN },
  sidebar: { type: "string", pattern: HEX_PATTERN },
  codeBg: { type: "string", pattern: HEX_PATTERN },
  diffAdded: { type: "string", pattern: HEX_PATTERN },
  diffRemoved: { type: "string", pattern: HEX_PATTERN },
  skill: { type: "string", pattern: HEX_PATTERN },
  contrast: { type: "integer", minimum: 0, maximum: 100 },
});
const VARIANT_KEYS = Object.freeze(Object.keys(VARIANT_PROPERTIES));
const MODEL_DRAFT_KEYS = Object.freeze(["name", "summary", "dark", "light"]);

export const LUNA_THEME_DRAFT_JSON_SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: MODEL_DRAFT_KEYS,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 80 },
    summary: { type: "string", minLength: 1, maxLength: 240 },
    dark: {
      type: "object",
      additionalProperties: false,
      required: VARIANT_KEYS,
      properties: VARIANT_PROPERTIES,
    },
    light: {
      type: "object",
      additionalProperties: false,
      required: VARIANT_KEYS,
      properties: VARIANT_PROPERTIES,
    },
  },
});

const SYSTEM_PROMPT = [
  "Create an original, accessible paired color theme for DexThemes.",
  "Return only the requested structured object with complete dark and light palettes.",
  "Use exact six-digit hex colors. Keep surface and ink highly legible, distinguish success from error, and make secondary surfaces visibly distinct.",
  "Do not emit fonts, CSS, HTML, URLs, code, instructions, claims of affiliation, or fields outside the schema.",
].join(" ");

const SAFE_MESSAGES = Object.freeze({
  invalid_request: "The theme request is invalid.",
  generation_cancelled: "Theme generation was cancelled.",
  generation_timeout: "Theme generation took too long. Try again or continue in the manual builder.",
  generation_refused: "The model could not create that theme. Try a different description or continue in the manual builder.",
  generation_incomplete: "The model did not finish the theme. Try again or continue in the manual builder.",
  generation_invalid: "The generated theme was not valid. Try again or continue in the manual builder.",
  generation_unavailable: "Theme generation is temporarily unavailable. Continue in the manual builder or try again later.",
});

export class LunaThemeGenerationError extends Error {
  constructor(code, { status = 502, retryable = false } = {}) {
    super(SAFE_MESSAGES[code] || SAFE_MESSAGES.generation_unavailable);
    this.name = "LunaThemeGenerationError";
    this.code = Object.hasOwn(SAFE_MESSAGES, code) ? code : "generation_unavailable";
    this.status = status;
    this.retryable = retryable;
  }
}

function fail(code, options) {
  throw new LunaThemeGenerationError(code, options);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactKeys(value, expected, label) {
  if (!isRecord(value)) fail("generation_invalid");
  const keys = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (keys.length !== allowed.length || keys.some((key, index) => key !== allowed[index])) {
    fail("generation_invalid");
  }
  return value;
}

function normalizeText(value, maxLength) {
  if (typeof value !== "string" || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) {
    fail("generation_invalid");
  }
  const normalized = value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  if (!normalized || normalized.length > maxLength) fail("generation_invalid");
  return normalized;
}

function normalizeVariant(value) {
  const input = assertExactKeys(value, VARIANT_KEYS, "theme variant");
  const normalized = {};
  for (const key of VARIANT_KEYS) {
    if (key === "contrast") {
      if (!Number.isInteger(input[key]) || input[key] < 0 || input[key] > 100) {
        fail("generation_invalid");
      }
      normalized[key] = input[key];
      continue;
    }
    if (typeof input[key] !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(input[key])) {
      fail("generation_invalid");
    }
    normalized[key] = input[key].toUpperCase();
  }
  return Object.freeze(normalized);
}

export function normalizeLunaThemeDraft(value) {
  const input = assertExactKeys(value, MODEL_DRAFT_KEYS, "theme draft");
  const name = normalizeText(input.name, 80);
  const summary = normalizeText(input.summary, 240);
  const dark = normalizeVariant(input.dark);
  const light = normalizeVariant(input.light);
  const themeId = slugifyThemeName(name);
  return Object.freeze({
    id: themeId,
    themeId,
    name,
    summary,
    category: "community",
    codeThemeId: Object.freeze({ dark: "codex", light: "codex" }),
    dark,
    light,
    accents: Object.freeze([...new Set([dark.accent, light.accent])]),
  });
}

function validateGeneratedTheme(theme, platformId) {
  const base = validateTheme(theme);
  const errors = [...base.errors];
  const warnings = [...base.warnings];

  if (!theme.dark || !theme.light) errors.push("Generated themes require both dark and light variants.");
  for (const mode of ["dark", "light"]) {
    const variant = theme[mode];
    if (variant?.diffAdded === variant?.diffRemoved) {
      errors.push(`${mode}.diffAdded and ${mode}.diffRemoved must be distinct.`);
    }
  }

  if (platformId === "deepseek") {
    try {
      prepareDeepSeekThemeApply(theme);
    } catch {
      errors.push("The generated palette is not compatible with the DeepSeek Harness theme adapter.");
    }
  }

  const uniqueErrors = [...new Set(errors)];
  return Object.freeze({
    valid: uniqueErrors.length === 0,
    errors: Object.freeze(uniqueErrors),
    warnings: Object.freeze([...new Set(warnings)]),
    platformId,
    adapterVersion: getPlatform(platformId).adapterVersion,
  });
}

function validateGenerationInput(prompt, platformId) {
  if (typeof prompt !== "string" || prompt.length > LUNA_MAX_PROMPT_LENGTH) {
    fail("invalid_request", { status: 400 });
  }
  const normalizedPrompt = prompt.normalize("NFKC").trim();
  if (
    normalizedPrompt.length < 2 ||
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(normalizedPrompt)
  ) {
    fail("invalid_request", { status: 400 });
  }
  const normalizedPlatformId = normalizePlatformId(platformId);
  const platform = normalizedPlatformId ? getPlatform(normalizedPlatformId) : null;
  if (!platform || !platform.supportsPromptCreation) {
    fail("invalid_request", { status: 400 });
  }
  return { prompt: normalizedPrompt, platformId: normalizedPlatformId, platform };
}

function combinedSignal(signals) {
  const active = signals.filter(Boolean);
  if (typeof AbortSignal.any === "function") return AbortSignal.any(active);
  const controller = new AbortController();
  for (const signal of active) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

function retryDelay(response) {
  const value = response.headers.get("retry-after");
  if (!value) return 150;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1000, 0), 1000);
  const dateDelay = Date.parse(value) - Date.now();
  return Number.isFinite(dateDelay) ? Math.min(Math.max(dateDelay, 0), 1000) : 150;
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason || new Error("aborted"));
    }, { once: true });
  });
}

function isRetryableStatus(status) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function fetchResponse({ apiKey, fetchImpl, body, signal, deadline }) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(LUNA_RESPONSES_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      if (signal.aborted) throw error;
      if (attempt === 0 && Date.now() + 250 < deadline) {
        await wait(150, signal);
        continue;
      }
      fail("generation_unavailable", { status: 503, retryable: true });
    }

    if (response.ok) return response;
    if (attempt === 0 && isRetryableStatus(response.status)) {
      const delay = retryDelay(response);
      await response.body?.cancel().catch(() => {});
      if (Date.now() + delay < deadline) {
        await wait(delay, signal);
        continue;
      }
    }
    await response.body?.cancel().catch(() => {});
    if (response.status === 429) {
      fail("generation_unavailable", { status: 503, retryable: true });
    }
    fail("generation_unavailable", {
      status: response.status >= 500 ? 503 : 502,
      retryable: response.status >= 500,
    });
  }
  fail("generation_unavailable", { status: 503, retryable: true });
}

async function parseResponse(response) {
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > 64 * 1024) fail("generation_invalid");
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    fail("generation_invalid");
  }
  if (!isRecord(payload)) fail("generation_invalid");

  let outputText = typeof payload.output_text === "string" ? payload.output_text : "";
  for (const output of Array.isArray(payload.output) ? payload.output : []) {
    for (const content of Array.isArray(output?.content) ? output.content : []) {
      if (content?.type === "refusal") fail("generation_refused", { status: 422 });
      if (!outputText && content?.type === "output_text" && typeof content.text === "string") {
        outputText = content.text;
      }
    }
  }
  if (payload.status !== "completed") {
    fail("generation_incomplete", { status: 502, retryable: true });
  }
  if (!outputText || new TextEncoder().encode(outputText).byteLength > 8 * 1024) {
    fail("generation_invalid");
  }
  try {
    return JSON.parse(outputText);
  } catch {
    fail("generation_invalid");
  }
}

/**
 * Generate a private canonical draft. This function never persists, publishes,
 * applies, or logs the prompt or provider response.
 */
export async function generateLunaThemeDraft({
  prompt,
  platformId,
  signal,
  fetchImpl = globalThis.fetch,
  apiKey = process.env.OPENAI_API_KEY,
  timeoutMs = LUNA_TIMEOUT_MS,
} = {}) {
  const input = validateGenerationInput(prompt, platformId);
  if (typeof apiKey !== "string" || !apiKey.trim() || typeof fetchImpl !== "function") {
    fail("generation_unavailable", { status: 503 });
  }

  const boundedTimeoutMs = Number.isFinite(timeoutMs)
    ? Math.min(Math.max(Math.trunc(timeoutMs), 1), 30_000)
    : LUNA_TIMEOUT_MS;
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(new Error("generation_timeout")), boundedTimeoutMs);
  const requestSignal = combinedSignal([signal, timeoutController.signal]);
  const deadline = Date.now() + boundedTimeoutMs;
  const body = {
    model: LUNA_MODEL,
    store: false,
    reasoning: { effort: "low" },
    max_output_tokens: 1800,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          themeRequest: input.prompt,
          targetPlatform: input.platformId,
          targetName: input.platform.displayName,
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "dexthemes_theme_draft",
        strict: true,
        schema: LUNA_THEME_DRAFT_JSON_SCHEMA,
      },
    },
  };

  try {
    const response = await fetchResponse({ apiKey: apiKey.trim(), fetchImpl, body, signal: requestSignal, deadline });
    const modelDraft = await parseResponse(response);
    const theme = normalizeLunaThemeDraft(modelDraft);
    const validation = validateGeneratedTheme(theme, input.platformId);
    if (!validation.valid) fail("generation_invalid", { status: 422 });
    return Object.freeze({
      theme,
      validation,
      model: LUNA_MODEL,
      requiresApproval: true,
      persisted: false,
      applied: false,
      published: false,
    });
  } catch (error) {
    if (error instanceof LunaThemeGenerationError) throw error;
    if (signal?.aborted) fail("generation_cancelled", { status: 408 });
    if (timeoutController.signal.aborted) fail("generation_timeout", { status: 504, retryable: true });
    fail("generation_unavailable", { status: 503, retryable: true });
  } finally {
    clearTimeout(timeout);
  }
}
