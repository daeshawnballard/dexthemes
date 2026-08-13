import { createHash } from "node:crypto";

import {
  LunaThemeGenerationError,
  generateLunaThemeDraft,
} from "../server/luna-theme-generation.js";

const MAX_REQUEST_BYTES = 8 * 1024;
const DURABLE_RATE_LIMIT_PATH = "/internal/luna/rate-limit";
const DURABLE_RATE_LIMIT_ACTION = "luna_theme_generation";
const CANONICAL_ORIGIN = "https://www.dexthemes.com";
const DURABLE_TIMEOUT_MS = 3_000;
const DURABLE_RESPONSE_BYTES = 1024;
const DURABLE_SECRET_MIN_LENGTH = 32;
const DURABLE_SECRET_MAX_LENGTH = 256;
const INSTANCE_LIMITS = Object.freeze({
  networkMax: 5,
  networkWindowMs: 10 * 60 * 1000,
  globalMax: 100,
  globalWindowMs: 60 * 1000,
  maxKeys: 5_000,
});

function header(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function setCommonHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function sendJson(res, status, value, extraHeaders = {}) {
  res.statusCode = status;
  setCommonHeaders(res);
  for (const [key, headerValue] of Object.entries(extraHeaders)) res.setHeader(key, headerValue);
  res.end(JSON.stringify(value));
}

function safeError(code, message, retryable = false) {
  return { error: { code, message, retryable } };
}

function requestOriginAllowed(req) {
  const rawOrigin = header(req, "origin");
  if (!rawOrigin) return true;
  try {
    const origin = new URL(rawOrigin);
    const forwardedHost = String(header(req, "x-forwarded-host") || header(req, "host") || "").toLowerCase();
    if (origin.host.toLowerCase() === forwardedHost) return true;
    if (["https://dexthemes.com", "https://www.dexthemes.com"].includes(origin.origin)) return true;
    return process.env.VERCEL_ENV !== "production" && origin.protocol === "https:" && origin.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function normalizeNetworkIdentity(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length <= 64 && /^[0-9a-f:.]+$/.test(normalized) ? normalized : null;
}

function networkRateLimitKey(req) {
  let network = normalizeNetworkIdentity(req.socket?.remoteAddress) || "unknown";
  if (process.env.VERCEL) {
    network = normalizeNetworkIdentity(header(req, "x-real-ip"))
      || normalizeNetworkIdentity(String(header(req, "x-vercel-forwarded-for") || "").split(",")[0])
      || network;
  }
  return createHash("sha256").update(network).digest("hex");
}

function combineSignals(first, second) {
  const signals = [first, second].filter(Boolean);
  if (typeof AbortSignal.any === "function") return AbortSignal.any(signals);
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

/**
 * This limiter is a bounded abuse backstop, not a durable quota. Vercel
 * instances do not share memory, so production-wide enforcement requires a
 * persistent backend rate-limit contract before this can be advertised as a
 * hard usage limit.
 */
export function createInstanceRateLimiter({
  networkMax = INSTANCE_LIMITS.networkMax,
  networkWindowMs = INSTANCE_LIMITS.networkWindowMs,
  globalMax = INSTANCE_LIMITS.globalMax,
  globalWindowMs = INSTANCE_LIMITS.globalWindowMs,
  maxKeys = INSTANCE_LIMITS.maxKeys,
  now = () => Date.now(),
} = {}) {
  const networks = new Map();
  let global = { count: 0, windowStart: now() };

  function consumeBucket(bucket, limit, windowMs, timestamp) {
    if (timestamp >= bucket.windowStart + windowMs) {
      bucket.count = 0;
      bucket.windowStart = timestamp;
    }
    if (bucket.count >= limit) {
      return { allowed: false, retryAfterMs: Math.max(1, bucket.windowStart + windowMs - timestamp) };
    }
    bucket.count += 1;
    return { allowed: true };
  }

  return Object.freeze({
    consume(networkKey) {
      const timestamp = now();
      const globalResult = consumeBucket(global, globalMax, globalWindowMs, timestamp);
      if (!globalResult.allowed) return { ...globalResult, scope: "instance" };

      for (const [key, bucket] of networks) {
        if (timestamp >= bucket.windowStart + networkWindowMs) networks.delete(key);
      }
      if (!networks.has(networkKey) && networks.size >= maxKeys) {
        return { allowed: false, retryAfterMs: networkWindowMs, scope: "capacity" };
      }
      const bucket = networks.get(networkKey) || { count: 0, windowStart: timestamp };
      networks.set(networkKey, bucket);
      return { ...consumeBucket(bucket, networkMax, networkWindowMs, timestamp), scope: "network" };
    },
  });
}

const instanceRateLimiter = createInstanceRateLimiter();

export class DurableRateLimitError extends Error {
  constructor(code = "rate_limit_unavailable") {
    super("The shared rate limit is unavailable.");
    this.name = "DurableRateLimitError";
    this.code = code;
  }
}

function validDurableSecret(value) {
  return typeof value === "string"
    && value.length >= DURABLE_SECRET_MIN_LENGTH
    && value.length <= DURABLE_SECRET_MAX_LENGTH
    && /^[\x21-\x7E]+$/.test(value);
}

function resolveConvexSiteUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:"
      || !url.hostname.endsWith(".convex.site")
      || url.username
      || url.password
      || url.port
      || (url.pathname !== "/" && url.pathname !== "")
      || url.search
      || url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function parseDurableResponse(response) {
  const text = await response.text();
  if (byteLength(text) > DURABLE_RESPONSE_BYTES) throw new DurableRateLimitError();
  try {
    return JSON.parse(text);
  } catch {
    throw new DurableRateLimitError();
  }
}

/**
 * Check the shared Convex quota. The request contains only a hashed network
 * key and a fixed action string—never the user's prompt or generated output.
 */
export async function enforceDurableLunaRateLimit({
  networkKey,
  signal,
  production = process.env.VERCEL_ENV === "production",
  convexSiteUrl = process.env.CONVEX_SITE_URL,
  secret = process.env.DEXTHEMES_LUNA_RATE_LIMIT_SECRET,
  fetchImpl = globalThis.fetch,
  timeoutMs = DURABLE_TIMEOUT_MS,
} = {}) {
  if (!production) return Object.freeze({ allowed: true, enforced: false });
  if (!/^[0-9a-f]{64}$/.test(String(networkKey || ""))) throw new DurableRateLimitError();
  const origin = resolveConvexSiteUrl(convexSiteUrl);
  if (!origin || !validDurableSecret(secret) || typeof fetchImpl !== "function") {
    throw new DurableRateLimitError("rate_limit_not_configured");
  }

  const boundedTimeoutMs = Number.isFinite(timeoutMs)
    ? Math.min(Math.max(Math.trunc(timeoutMs), 1), DURABLE_TIMEOUT_MS)
    : DURABLE_TIMEOUT_MS;
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(new Error("rate_limit_timeout")), boundedTimeoutMs);
  try {
    const response = await fetchImpl(`${origin}${DURABLE_RATE_LIMIT_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        Origin: CANONICAL_ORIGIN,
      },
      body: JSON.stringify({
        action: DURABLE_RATE_LIMIT_ACTION,
        networkKey,
      }),
      signal: combineSignals(signal, timeoutController.signal),
    });
    const payload = await parseDurableResponse(response);
    if (response.status === 200 && payload?.allowed === true && Object.keys(payload).length === 1) {
      return Object.freeze({ allowed: true, enforced: true });
    }
    if (
      response.status === 429
      && payload?.allowed === false
      && Number.isFinite(payload.retryAfterMs)
      && payload.retryAfterMs >= 1
      && payload.retryAfterMs <= 10 * 60 * 1000
    ) {
      return Object.freeze({ allowed: false, enforced: true, retryAfterMs: Math.trunc(payload.retryAfterMs) });
    }
    throw new DurableRateLimitError();
  } catch (error) {
    if (error instanceof DurableRateLimitError) throw error;
    throw new DurableRateLimitError();
  } finally {
    clearTimeout(timer);
  }
}

function byteLength(value) {
  return Buffer.byteLength(value, "utf8");
}

async function readJsonBody(req) {
  const declaredLength = Number(header(req, "content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    const error = new Error("request_too_large");
    error.code = "request_too_large";
    throw error;
  }

  if (req.body !== undefined) {
    if (Buffer.isBuffer(req.body)) {
      if (req.body.byteLength > MAX_REQUEST_BYTES) throw Object.assign(new Error(), { code: "request_too_large" });
      return JSON.parse(req.body.toString("utf8"));
    }
    if (typeof req.body === "string") {
      if (byteLength(req.body) > MAX_REQUEST_BYTES) throw Object.assign(new Error(), { code: "request_too_large" });
      return JSON.parse(req.body);
    }
    const serialized = JSON.stringify(req.body);
    if (byteLength(serialized) > MAX_REQUEST_BYTES) throw Object.assign(new Error(), { code: "request_too_large" });
    return req.body;
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk.toString("utf8");
    if (byteLength(body) > MAX_REQUEST_BYTES) throw Object.assign(new Error(), { code: "request_too_large" });
  }
  return JSON.parse(body);
}

function validateRequestBody(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value).sort();
  if (keys.length !== 2 || keys[0] !== "platformId" || keys[1] !== "prompt") return null;
  if (typeof value.prompt !== "string" || typeof value.platformId !== "string") return null;
  return { prompt: value.prompt, platformId: value.platformId };
}

export async function handleGenerateTheme(req, res, {
  generate = generateLunaThemeDraft,
  limiter = instanceRateLimiter,
  durableRateLimit = enforceDurableLunaRateLimit,
} = {}) {
  const method = String(req.method || "GET").toUpperCase();
  const rawOrigin = header(req, "origin");
  if (!requestOriginAllowed(req)) {
    return sendJson(res, 403, safeError("origin_not_allowed", "This origin cannot generate themes."));
  }
  if (rawOrigin) {
    res.setHeader("Access-Control-Allow-Origin", rawOrigin);
    res.setHeader("Vary", "Origin");
  }
  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-store");
    return res.end();
  }
  if (method !== "POST") {
    return sendJson(res, 405, safeError("method_not_allowed", "Use POST to generate a theme."), { Allow: "POST, OPTIONS" });
  }
  const contentType = String(header(req, "content-type") || "").toLowerCase();
  if (!contentType.startsWith("application/json")) {
    return sendJson(res, 415, safeError("unsupported_media_type", "Use application/json."));
  }

  const networkKey = networkRateLimitKey(req);
  const limit = limiter.consume(networkKey);
  if (!limit.allowed) {
    const retryAfter = Math.max(1, Math.ceil(limit.retryAfterMs / 1000));
    return sendJson(
      res,
      429,
      safeError("rate_limited", "Too many theme requests. Continue in the manual builder or try again later.", true),
      { "Retry-After": String(retryAfter) },
    );
  }

  let input;
  try {
    input = validateRequestBody(await readJsonBody(req));
  } catch (error) {
    if (error?.code === "request_too_large") {
      return sendJson(res, 413, safeError("request_too_large", "The theme request is too large."));
    }
    return sendJson(res, 400, safeError("invalid_request", "The theme request is invalid."));
  }
  if (!input) return sendJson(res, 400, safeError("invalid_request", "The theme request is invalid."));

  const requestAbort = new AbortController();
  const abortRequest = () => requestAbort.abort(new Error("request_cancelled"));
  req.once?.("aborted", abortRequest);
  res.once?.("close", () => {
    if (!res.writableEnded) abortRequest();
  });
  const signal = combineSignals(req.signal, requestAbort.signal);

  try {
    const durableLimit = await durableRateLimit({ networkKey, signal });
    if (!durableLimit?.allowed) {
      const retryAfter = Math.max(1, Math.ceil((durableLimit?.retryAfterMs || 1000) / 1000));
      return sendJson(
        res,
        429,
        safeError("rate_limited", "Too many theme requests. Continue in the manual builder or try again later.", true),
        { "Retry-After": String(retryAfter) },
      );
    }
    const result = await generate({
      ...input,
      signal,
      apiKey: process.env.OPENAI_API_KEY,
    });
    return sendJson(res, 200, result);
  } catch (error) {
    if (error instanceof LunaThemeGenerationError) {
      return sendJson(res, error.status, safeError(error.code, error.message, error.retryable));
    }
    if (error instanceof DurableRateLimitError) {
      return sendJson(
        res,
        503,
        safeError("rate_limit_unavailable", "Theme generation is temporarily unavailable. Continue in the manual builder or try again later.", true),
      );
    }
    return sendJson(
      res,
      503,
      safeError("generation_unavailable", "Theme generation is temporarily unavailable. Continue in the manual builder or try again later.", true),
    );
  }
}

export default async function handler(req, res) {
  return handleGenerateTheme(req, res);
}
