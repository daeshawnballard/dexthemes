import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export type DexHttpRouter = ReturnType<typeof httpRouter>;

// Production origins — localhost is only allowed when ENVIRONMENT=development
const PRODUCTION_ORIGINS = [
  "https://dexthemes.com",
  "https://www.dexthemes.com",
];
const DEV_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
];

export const SESSION_COOKIE_NAME = "__Host-dexthemes_session";
export const SESSION_HINT_COOKIE_NAME = "__Host-dexthemes_session_present";
export const OAUTH_BINDING_COOKIE_NAME = "__Host-dexthemes_oauth_binding";
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

export const ALLOWED_ORIGINS =
  process.env.ENVIRONMENT === "development"
    ? [...PRODUCTION_ORIGINS, ...DEV_ORIGINS]
    : PRODUCTION_ORIGINS;

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export function corsHeaders(origin?: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function corsResponse(origin?: string | null, status = 204) {
  return new Response(null, { status, headers: corsHeaders(origin) });
}

export function jsonResponse(data: any, origin?: string | null, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export function getCookieValue(request: Request, name: string): string | null {
  return parseCookies(request.headers.get("Cookie"))[name] || null;
}

export function getSessionToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  const cookies = parseCookies(request.headers.get("Cookie"));
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function shouldUseSessionCookie(frontendOrigin: string): boolean {
  return PRODUCTION_ORIGINS.includes(frontendOrigin);
}

export function buildSessionCookie(token: string, maxAgeSeconds = SESSION_DURATION_SECONDS): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; Secure; SameSite=Lax`;
}

export function buildSessionHintCookie(maxAgeSeconds = SESSION_DURATION_SECONDS): string {
  return `${SESSION_HINT_COOKIE_NAME}=1; Path=/; Max-Age=${maxAgeSeconds}; Secure; SameSite=Lax`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionHintCookie(): string {
  return `${SESSION_HINT_COOKIE_NAME}=; Path=/; Max-Age=0; Secure; SameSite=Lax`;
}

export function buildOauthBindingCookie(binding: string): string {
  return `${OAUTH_BINDING_COOKIE_NAME}=${encodeURIComponent(binding)}; Path=/; Max-Age=${Math.floor(OAUTH_STATE_TTL_MS / 1000)}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearOauthBindingCookie(): string {
  return `${OAUTH_BINDING_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function normalizeNetworkIdentity(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length <= 64 && /^[0-9a-f:.]+$/.test(normalized) ? normalized : null;
}

export async function getClientIP(ctx: any, request: Request): Promise<string> {
  try {
    const metadata = await ctx.meta?.getRequestMetadata?.();
    const authoritative = normalizeNetworkIdentity(metadata?.ip);
    if (authoritative) return authoritative;
  } catch {
    // Local harnesses and older runtimes may not expose request metadata.
  }
  const realIp = normalizeNetworkIdentity(request.headers.get("x-real-ip"));
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").at(-1);
  return normalizeNetworkIdentity(forwarded) || "unknown";
}

export const RATE_LIMITS = {
  agentRegister: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  agentRegisterNetwork: { maxRequests: 30, windowMs: 60 * 60 * 1000 },
  oauthStartNetwork: { maxRequests: 20, windowMs: 60 * 1000 },
  oauthStartGlobal: { maxRequests: 600, windowMs: 60 * 1000 },
  themeSubmit: { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  themeSubmitNetwork: { maxRequests: 60, windowMs: 60 * 60 * 1000 },
  themeFlag: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  themeFlagNetwork: { maxRequests: 120, windowMs: 60 * 60 * 1000 },
  themeCopy: { maxRequests: 60, windowMs: 60 * 1000 },
  publicThemesRead: { maxRequests: 240, windowMs: 60 * 1000 },
  publicLeaderboardRead: { maxRequests: 120, windowMs: 60 * 1000 },
  publicSupportersRead: { maxRequests: 60, windowMs: 60 * 1000 },
  publicLikesRead: { maxRequests: 120, windowMs: 60 * 1000 },
  authenticatedDemo: { maxRequests: 10, windowMs: 60 * 1000 },
  authenticatedDemoNetwork: { maxRequests: 120, windowMs: 60 * 1000 },
  statsReadIdentity: { maxRequests: 30, windowMs: 60 * 1000 },
  statsReadNetwork: { maxRequests: 120, windowMs: 60 * 1000 },
  themeLikeIdentity: { maxRequests: 60, windowMs: 60 * 1000 },
  themeLikeNetwork: { maxRequests: 240, windowMs: 60 * 1000 },
  pluginReadIdentity: { maxRequests: 120, windowMs: 60 * 1000 },
  pluginReadNetwork: { maxRequests: 480, windowMs: 60 * 1000 },
  pluginWriteIdentity: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  pluginWriteNetwork: { maxRequests: 40, windowMs: 60 * 60 * 1000 },
  pluginAuthNetwork: { maxRequests: 240, windowMs: 60 * 1000 },
} as const;

export function isApiKey(token: string): boolean {
  return token.startsWith("dxt_");
}

export async function resolveUser(ctx: any, token: string) {
  if (isApiKey(token)) {
    return await ctx.runQuery(internal.users.getUserByApiKey, { apiKey: token });
  }
  return await ctx.runQuery(internal.users.getUserBySession, { sessionToken: token });
}

export const optionsHandler = httpAction(async (_, request) => {
  return corsResponse(request.headers.get("Origin"));
});

export function registerOptionsRoutes(http: DexHttpRouter, paths: string[]) {
  for (const path of paths) {
    http.route({ path, method: "OPTIONS", handler: optionsHandler });
  }
}

export function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function buildOauthStateNonce(): string {
  return generateRandomString(48);
}

export async function sha256Base64Url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function hmacSign(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function normalizeHex(value: string): string {
  return value.trim().toLowerCase().replace(/^sha256=/, "");
}

export function extractNestedString(payload: any, matcher: (value: string) => boolean): string | null {
  if (payload == null) return null;
  if (typeof payload === "string") {
    return matcher(payload) ? payload : null;
  }
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const match = extractNestedString(item, matcher);
      if (match) return match;
    }
    return null;
  }
  if (typeof payload === "object") {
    for (const value of Object.values(payload)) {
      const match = extractNestedString(value, matcher);
      if (match) return match;
    }
  }
  return null;
}
