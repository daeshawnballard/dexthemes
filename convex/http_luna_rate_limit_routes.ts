import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { RATE_LIMITS, type DexHttpRouter } from "./http_helpers";

const ROUTE_PATH = "/internal/luna/rate-limit";
const EXPECTED_ORIGIN = "https://www.dexthemes.com";
const ACTION = "luna_theme_generation";
const MAX_BODY_BYTES = 1024;
const NETWORK_KEY = /^[0-9a-f]{64}$/;
const SECRET_MIN_LENGTH = 32;
const SECRET_MAX_LENGTH = 256;

function response(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function validSecretShape(value: unknown): value is string {
  return typeof value === "string"
    && value.length >= SECRET_MIN_LENGTH
    && value.length <= SECRET_MAX_LENGTH
    && /^[\x21-\x7E]+$/.test(value);
}

async function secureEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < Math.max(leftBytes.length, rightBytes.length); index += 1) {
    difference |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }
  return difference === 0;
}

function parseBearer(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const value = authorization.slice(7);
  return validSecretShape(value) ? value : null;
}

function parseRequestBody(text: string): { action: typeof ACTION; networkKey: string } | null {
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (keys.length !== 2 || keys[0] !== "action" || keys[1] !== "networkKey") return null;
  if (record.action !== ACTION || typeof record.networkKey !== "string" || !NETWORK_KEY.test(record.networkKey)) {
    return null;
  }
  return { action: ACTION, networkKey: record.networkKey };
}

export function registerLunaRateLimitRoutes(http: DexHttpRouter) {
  http.route({
    path: ROUTE_PATH,
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      if (request.headers.get("Origin") !== EXPECTED_ORIGIN) {
        return response(403, { error: "forbidden" });
      }

      const configuredSecret = process.env.DEXTHEMES_LUNA_RATE_LIMIT_SECRET;
      const suppliedSecret = parseBearer(request);
      if (!validSecretShape(configuredSecret)) {
        return response(503, { error: "rate_limit_unavailable" });
      }
      if (!suppliedSecret || !(await secureEqual(configuredSecret, suppliedSecret))) {
        return response(401, { error: "unauthorized" });
      }

      const contentType = request.headers.get("Content-Type")?.toLowerCase() || "";
      if (!contentType.startsWith("application/json")) {
        return response(415, { error: "unsupported_media_type" });
      }
      const declaredLength = Number(request.headers.get("Content-Length"));
      if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
        return response(413, { error: "request_too_large" });
      }
      const body = parseRequestBody(await request.text());
      if (!body) return response(400, { error: "invalid_request" });

      const networkLimit = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `luna:network:${body.networkKey}`,
        ...RATE_LIMITS.lunaGenerateNetwork,
      });
      if (!networkLimit.allowed) {
        const retryAfterMs = Math.max(1, Math.min(networkLimit.retryAfter || 1, RATE_LIMITS.lunaGenerateNetwork.windowMs));
        return response(429, { allowed: false, retryAfterMs }, {
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        });
      }

      const globalLimit = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: "luna:global",
        ...RATE_LIMITS.lunaGenerateGlobal,
      });
      if (!globalLimit.allowed) {
        const retryAfterMs = Math.max(1, Math.min(globalLimit.retryAfter || 1, RATE_LIMITS.lunaGenerateGlobal.windowMs));
        return response(429, { allowed: false, retryAfterMs }, {
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        });
      }

      return response(200, { allowed: true });
    }),
  });
}
