import assert from "node:assert/strict";
import test from "node:test";

import {
  LUNA_MODEL,
  LunaThemeGenerationError,
  generateLunaThemeDraft,
  normalizeLunaThemeDraft,
} from "../server/luna-theme-generation.js";
import {
  DurableRateLimitError,
  createInstanceRateLimiter,
  enforceDurableLunaRateLimit,
  handleGenerateTheme,
} from "../api/generate-theme.js";
import {
  LunaThemeApiError,
  generateThemeDraft,
} from "../src/luna-theme-api.js";

const MODEL_DRAFT = Object.freeze({
  name: "Lunar Harbor",
  summary: "A calm indigo atmosphere with crisp semantic contrast.",
  dark: {
    surface: "#10131a",
    ink: "#f5f7fa",
    accent: "#7c6cf2",
    sidebar: "#151a24",
    codeBg: "#0b0e14",
    diffAdded: "#47c58a",
    diffRemoved: "#f06a6a",
    skill: "#c48af3",
    contrast: 64,
  },
  light: {
    surface: "#f7f8fc",
    ink: "#181b22",
    accent: "#5b4bd8",
    sidebar: "#eef0f7",
    codeBg: "#e7e9f2",
    diffAdded: "#16844a",
    diffRemoved: "#b82e38",
    skill: "#7240aa",
    contrast: 48,
  },
});
const DURABLE_SECRET = "test-only-durable-secret-32-characters-long";
const NETWORK_KEY = "a".repeat(64);

function providerResponse(draft = MODEL_DRAFT) {
  return new Response(JSON.stringify({
    status: "completed",
    output: [{
      type: "message",
      content: [{ type: "output_text", text: JSON.stringify(draft) }],
    }],
  }), { status: 200, headers: { "content-type": "application/json" } });
}

function createResponseRecorder() {
  const headers = new Map();
  return {
    statusCode: 0,
    writableEnded: false,
    body: "",
    headers,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    once() {},
    end(value = "") {
      this.body = String(value);
      this.writableEnded = true;
      return this;
    },
  };
}

test("Luna generation uses Responses structured output and returns a normalized, unapproved paired draft", async () => {
  let request;
  const fetchImpl = async (url, init) => {
    request = { url, init, body: JSON.parse(init.body) };
    return providerResponse();
  };

  const result = await generateLunaThemeDraft({
    prompt: "A calm lunar harbor for long coding sessions",
    platformId: "deepseek",
    apiKey: "test-key-not-a-real-secret",
    fetchImpl,
  });

  assert.equal(request.url, "https://api.openai.com/v1/responses");
  assert.equal(request.body.model, LUNA_MODEL);
  assert.equal(request.body.store, false);
  assert.equal(request.body.text.format.type, "json_schema");
  assert.equal(request.body.text.format.strict, true);
  assert.equal(request.body.text.format.schema.additionalProperties, false);
  assert.equal(request.body.text.format.schema.properties.dark.additionalProperties, false);
  assert.equal(request.init.headers.Authorization, "Bearer test-key-not-a-real-secret");
  assert.equal(result.theme.id, "lunar-harbor");
  assert.equal(result.theme.dark.surface, "#10131A");
  assert.equal(result.theme.light.accent, "#5B4BD8");
  assert.equal(result.validation.valid, true);
  assert.equal(result.validation.platformId, "deepseek");
  assert.equal(result.requiresApproval, true);
  assert.equal(result.persisted, false);
  assert.equal(result.applied, false);
  assert.equal(result.published, false);
});

test("Luna canonical normalization rejects extra fields, CSS-like colors, and incomplete pairs", () => {
  assert.throws(
    () => normalizeLunaThemeDraft({ ...MODEL_DRAFT, apply: true }),
    (error) => error instanceof LunaThemeGenerationError && error.code === "generation_invalid",
  );
  assert.throws(
    () => normalizeLunaThemeDraft({
      ...MODEL_DRAFT,
      dark: { ...MODEL_DRAFT.dark, accent: "var(--brand)" },
    }),
    (error) => error instanceof LunaThemeGenerationError && error.code === "generation_invalid",
  );
  assert.throws(
    () => normalizeLunaThemeDraft({ ...MODEL_DRAFT, light: null }),
    (error) => error instanceof LunaThemeGenerationError && error.code === "generation_invalid",
  );
});

test("Luna generation fails closed when schema-valid output violates the canonical theme contract", async () => {
  const contractInvalid = {
    ...MODEL_DRAFT,
    dark: {
      ...MODEL_DRAFT.dark,
      diffRemoved: MODEL_DRAFT.dark.diffAdded,
    },
  };
  await assert.rejects(
    generateLunaThemeDraft({
      prompt: "A theme request",
      platformId: "codex",
      apiKey: "test-key",
      fetchImpl: async () => providerResponse(contractInvalid),
    }),
    (error) => error instanceof LunaThemeGenerationError
      && error.code === "generation_invalid"
      && error.status === 422,
  );
});

test("Luna generation performs at most one bounded retry for a transient provider response", async () => {
  let calls = 0;
  const result = await generateLunaThemeDraft({
    prompt: "Quiet indigo focus",
    platformId: "codex",
    apiKey: "test-key",
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) return new Response("", { status: 503, headers: { "retry-after": "0" } });
      return providerResponse();
    },
  });
  assert.equal(calls, 2);
  assert.equal(result.theme.themeId, "lunar-harbor");
});

test("Luna generation handles refusal and caller cancellation without exposing provider content", async () => {
  await assert.rejects(
    generateLunaThemeDraft({
      prompt: "A theme request",
      platformId: "codex",
      apiKey: "test-key",
      fetchImpl: async () => new Response(JSON.stringify({
        status: "completed",
        output: [{ content: [{ type: "refusal", refusal: "private provider detail" }] }],
      }), { status: 200 }),
    }),
    (error) => error instanceof LunaThemeGenerationError
      && error.code === "generation_refused"
      && !error.message.includes("private provider detail"),
  );

  const controller = new AbortController();
  const pending = generateLunaThemeDraft({
    prompt: "A theme request",
    platformId: "codex",
    apiKey: "test-key",
    signal: controller.signal,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    }),
  });
  controller.abort();
  await assert.rejects(
    pending,
    (error) => error instanceof LunaThemeGenerationError && error.code === "generation_cancelled",
  );

  await assert.rejects(
    generateLunaThemeDraft({
      prompt: "A theme request",
      platformId: "codex",
      apiKey: "test-key",
      timeoutMs: 5,
      fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
      }),
    }),
    (error) => error instanceof LunaThemeGenerationError && error.code === "generation_timeout",
  );
});

test("generation endpoint bounds input, rate limits before provider use, and returns only sanitized errors", async () => {
  let generatedWith;
  const req = {
    method: "POST",
    headers: { "content-type": "application/json", host: "www.dexthemes.com" },
    socket: { remoteAddress: "127.0.0.1" },
    body: { prompt: "Midnight focus", platformId: "codex" },
    once() {},
  };
  const res = createResponseRecorder();
  await handleGenerateTheme(req, res, {
    limiter: { consume: () => ({ allowed: true }) },
    durableRateLimit: async () => ({ allowed: true, enforced: true }),
    generate: async (input) => {
      generatedWith = input;
      return { theme: { id: "draft" }, validation: { valid: true, errors: [], warnings: [] }, model: LUNA_MODEL };
    },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(generatedWith.prompt, "Midnight focus");
  assert.equal(generatedWith.platformId, "codex");
  assert.ok(generatedWith.signal instanceof AbortSignal);
  assert.equal(res.headers.get("cache-control"), "no-store");

  const blocked = createResponseRecorder();
  await handleGenerateTheme(req, blocked, {
    limiter: { consume: () => ({ allowed: false, retryAfterMs: 4_000 }) },
    durableRateLimit: async () => ({ allowed: true, enforced: true }),
    generate: async () => { throw new Error("must not be called"); },
  });
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers.get("retry-after"), "4");
  assert.deepEqual(JSON.parse(blocked.body).error.code, "rate_limited");

  const oversized = createResponseRecorder();
  await handleGenerateTheme({
    ...req,
    headers: { ...req.headers, "content-length": String(9 * 1024) },
  }, oversized, {
    limiter: { consume: () => ({ allowed: true }) },
    durableRateLimit: async () => ({ allowed: true, enforced: true }),
    generate: async () => { throw new Error("must not be called"); },
  });
  assert.equal(oversized.statusCode, 413);
  assert.equal(JSON.parse(oversized.body).error.code, "request_too_large");

  const failed = createResponseRecorder();
  await handleGenerateTheme(req, failed, {
    limiter: { consume: () => ({ allowed: true }) },
    durableRateLimit: async () => ({ allowed: true, enforced: true }),
    generate: async () => { throw new Error("raw provider output and credentials"); },
  });
  assert.equal(failed.statusCode, 503);
  assert.doesNotMatch(failed.body, /raw provider|credentials/i);
});

test("durable production limiter sends only fixed action metadata and a hashed network key", async () => {
  let request;
  const result = await enforceDurableLunaRateLimit({
    networkKey: NETWORK_KEY,
    production: true,
    convexSiteUrl: "https://example.convex.site",
    secret: DURABLE_SECRET,
    fetchImpl: async (url, init) => {
      request = { url, init, body: JSON.parse(init.body) };
      return new Response(JSON.stringify({ allowed: true }), { status: 200 });
    },
  });
  assert.deepEqual(result, { allowed: true, enforced: true });
  assert.equal(request.url, "https://example.convex.site/internal/luna/rate-limit");
  assert.equal(request.init.headers.Authorization, `Bearer ${DURABLE_SECRET}`);
  assert.equal(request.init.headers.Origin, "https://www.dexthemes.com");
  assert.deepEqual(request.body, { action: "luna_theme_generation", networkKey: NETWORK_KEY });
  assert.equal("prompt" in request.body, false);
  assert.equal("modelOutput" in request.body, false);
  assert.equal("workspace" in request.body, false);
});

test("durable production limiter returns a bounded denial and fails closed without configuration or backend", async () => {
  const denied = await enforceDurableLunaRateLimit({
    networkKey: NETWORK_KEY,
    production: true,
    convexSiteUrl: "https://example.convex.site",
    secret: DURABLE_SECRET,
    fetchImpl: async () => new Response(JSON.stringify({ allowed: false, retryAfterMs: 60_000 }), { status: 429 }),
  });
  assert.deepEqual(denied, { allowed: false, enforced: true, retryAfterMs: 60_000 });

  await assert.rejects(
    enforceDurableLunaRateLimit({ networkKey: NETWORK_KEY, production: true }),
    (error) => error instanceof DurableRateLimitError && error.code === "rate_limit_not_configured",
  );
  await assert.rejects(
    enforceDurableLunaRateLimit({
      networkKey: NETWORK_KEY,
      production: true,
      convexSiteUrl: "https://example.convex.site",
      secret: DURABLE_SECRET,
      fetchImpl: async () => { throw new Error("backend offline with secret data"); },
    }),
    (error) => error instanceof DurableRateLimitError
      && error.code === "rate_limit_unavailable"
      && !error.message.includes("secret data"),
  );
});

test("generation endpoint never calls the provider after durable denial or durable backend failure", async () => {
  const req = {
    method: "POST",
    headers: { "content-type": "application/json", host: "www.dexthemes.com" },
    socket: { remoteAddress: "127.0.0.1" },
    body: { prompt: "Midnight focus", platformId: "codex" },
    once() {},
  };
  let providerCalls = 0;
  const denied = createResponseRecorder();
  await handleGenerateTheme(req, denied, {
    limiter: { consume: () => ({ allowed: true }) },
    durableRateLimit: async () => ({ allowed: false, enforced: true, retryAfterMs: 4_000 }),
    generate: async () => { providerCalls += 1; },
  });
  assert.equal(denied.statusCode, 429);
  assert.equal(providerCalls, 0);

  const unavailable = createResponseRecorder();
  await handleGenerateTheme(req, unavailable, {
    limiter: { consume: () => ({ allowed: true }) },
    durableRateLimit: async () => { throw new DurableRateLimitError(); },
    generate: async () => { providerCalls += 1; },
  });
  assert.equal(unavailable.statusCode, 503);
  assert.equal(JSON.parse(unavailable.body).error.code, "rate_limit_unavailable");
  assert.equal(providerCalls, 0);
});

test("instance limiter is an explicit bounded backstop", () => {
  let timestamp = 1_000;
  const limiter = createInstanceRateLimiter({
    networkMax: 2,
    networkWindowMs: 1_000,
    globalMax: 10,
    globalWindowMs: 1_000,
    maxKeys: 2,
    now: () => timestamp,
  });
  assert.equal(limiter.consume("a").allowed, true);
  assert.equal(limiter.consume("a").allowed, true);
  assert.equal(limiter.consume("a").allowed, false);
  timestamp += 1_000;
  assert.equal(limiter.consume("a").allowed, true);
});

test("browser Luna client returns the narrow contract and sanitizes server failures", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, init) => {
      assert.deepEqual(JSON.parse(init.body), { prompt: "Violet dusk", platformId: "codex" });
      return new Response(JSON.stringify({
        theme: { id: "violet-dusk", dark: {}, light: {} },
        validation: { valid: true, errors: [], warnings: [] },
        model: LUNA_MODEL,
        requiresApproval: true,
        persisted: false,
      }), { status: 200, headers: { "content-type": "application/json" } });
    };
    const result = await generateThemeDraft({ prompt: "Violet dusk", platformId: "codex" });
    assert.deepEqual(Object.keys(result).sort(), ["model", "theme", "validation"]);

    globalThis.fetch = async () => new Response(JSON.stringify({
      error: { code: "generation_unavailable", message: "secret provider body" },
    }), { status: 503, headers: { "retry-after": "12" } });
    await assert.rejects(
      generateThemeDraft({ prompt: "Violet dusk", platformId: "codex" }),
      (error) => error instanceof LunaThemeApiError
        && error.code === "generation_unavailable"
        && error.retryAfter === 12
        && !error.message.includes("secret provider body"),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
