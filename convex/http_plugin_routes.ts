import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { verifyPluginBearer } from "./pluginAuth";
import {
  isPluginUnlockVisible,
  sanitizeThemeForPlugin,
  sanitizeCreatorStatsForPlugin,
} from "../shared/plugin-public-policy.js";
import { STATIC_THEME_CATALOG } from "../shared/theme-api-catalog.js";
import {
  RATE_LIMITS,
  getClientIP,
  pluginJsonResponse,
  registerPluginOptionsRoutes,
  sha256Hex,
  type DexHttpRouter,
} from "./http_helpers";

const DEVICE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";

function normalizeIssuer(value: string | undefined) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const parsed = new URL(trimmed);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("DeepSeek OAuth issuer must be an HTTPS origin");
  }
  parsed.pathname = parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
  return parsed.href;
}

function deviceOauthConfig() {
  const issuer = normalizeIssuer(process.env.DEXTHEMES_AUTH_ISSUER);
  const clientId = String(process.env.DEXTHEMES_DEEPSEEK_OAUTH_CLIENT_ID || "").trim();
  const audience = String(
    process.env.DEXTHEMES_AUTH_AUDIENCE || "https://www.dexthemes.com/api/mcp",
  ).trim();
  if (!issuer || !clientId || !audience) throw new Error("DeepSeek Harness OAuth is not configured");
  return { issuer, clientId, audience };
}

async function rateLimitDeviceAuth(ctx: any, request: Request, action: string) {
  const ip = await getClientIP(ctx, request);
  const result = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
    key: `plugin:deepseek-oauth:${action}:network:${ip}`,
    ...(action === "start" ? RATE_LIMITS.oauthStartNetwork : RATE_LIMITS.pluginAuthNetwork),
  });
  if (!result.allowed) {
    return pluginJsonResponse(
      { error: "rate_limited", retryAfter: result.retryAfter },
      429,
      { "Retry-After": String(Math.max(1, Math.ceil((result.retryAfter || 1000) / 1000))) },
    );
  }
  return null;
}

function boundedDeviceResponse(payload: any) {
  const deviceCode = typeof payload?.device_code === "string" ? payload.device_code.trim() : "";
  const userCode = typeof payload?.user_code === "string" ? payload.user_code.trim() : "";
  const verificationUri = typeof payload?.verification_uri === "string" ? payload.verification_uri.trim() : "";
  const verificationUriComplete = typeof payload?.verification_uri_complete === "string"
    ? payload.verification_uri_complete.trim()
    : verificationUri;
  const expiresIn = Math.min(1800, Math.max(60, Number(payload?.expires_in) || 900));
  const interval = Math.min(30, Math.max(5, Number(payload?.interval) || 5));
  if (
    !deviceCode || deviceCode.length > 2048 ||
    !userCode || userCode.length > 32 ||
    !verificationUri.startsWith("https://") || verificationUri.length > 1000 ||
    !verificationUriComplete.startsWith("https://") || verificationUriComplete.length > 1200
  ) {
    throw new Error("OAuth provider returned an invalid device authorization response");
  }
  return { deviceCode, userCode, verificationUri, verificationUriComplete, expiresIn, interval };
}

function enrichUnlocks(unlocks: any[]) {
  return unlocks.filter(isPluginUnlockVisible).map((unlock) => {
    const source = STATIC_THEME_CATALOG.find((theme: any) =>
      theme.subgroup === "unlockables" && theme.id === unlock.themeId,
    );
    return {
      ...unlock,
      theme: source ? sanitizeThemeForPlugin(source) : null,
    };
  });
}

async function authorizePlugin(ctx: any, request: Request, scope: string) {
  const ip = await getClientIP(ctx, request);
  const authNetworkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
    key: `plugin:auth:network:${ip}`,
    ...RATE_LIMITS.pluginAuthNetwork,
  });
  if (!authNetworkRate.allowed) {
    const error: any = new Error("Too many plugin authentication attempts. Try again later.");
    error.status = 429;
    error.retryAfter = authNetworkRate.retryAfter;
    throw error;
  }
  const identity = await verifyPluginBearer(request, scope);
  const identityHash = await sha256Hex(`github:${identity.githubId}`);
  const isWrite = scope === "themes:write";
  const identityRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
    key: `plugin:${scope}:identity:${identityHash}`,
    ...(isWrite ? RATE_LIMITS.pluginWriteIdentity : RATE_LIMITS.pluginReadIdentity),
  });
  const networkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
    key: `plugin:${scope}:network:${ip}`,
    ...(isWrite ? RATE_LIMITS.pluginWriteNetwork : RATE_LIMITS.pluginReadNetwork),
  });
  if (!identityRate.allowed || !networkRate.allowed) {
    const error: any = new Error("Too many plugin requests. Try again later.");
    error.status = 429;
    error.retryAfter = Math.max(identityRate.retryAfter || 0, networkRate.retryAfter || 0);
    throw error;
  }
  return ctx.runMutation(internal.pluginUsers.upsertPluginUser, identity);
}

function errorResponse(error: any) {
  const status = error?.status || (
    error?.message === "Insufficient scope" ? 403 :
    error?.message === "Plugin OAuth is not configured" ? 503 : 401
  );
  return pluginJsonResponse({ error: error?.message || "Unauthorized", retryAfter: error?.retryAfter }, status);
}

export function registerPluginRoutes(http: DexHttpRouter) {
  registerPluginOptionsRoutes(http, [
    "/plugin/me/stats",
    "/plugin/me/unlocks",
    "/plugin/themes",
    "/plugin/deepseek-harness/use",
    "/plugin/deepseek-harness/auth/start",
    "/plugin/deepseek-harness/auth/poll",
  ]);

  http.route({
    path: "/plugin/deepseek-harness/auth/start",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const limited = await rateLimitDeviceAuth(ctx, request, "start");
      if (limited) return limited;
      try {
        const { issuer, clientId, audience } = deviceOauthConfig();
        const upstream = await fetch(`${issuer}oauth/device/code`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ client_id: clientId, audience, scope: "themes:read" }),
        });
        if (!upstream.ok) return pluginJsonResponse({ error: "device_authorization_unavailable" }, 502);
        return pluginJsonResponse(boundedDeviceResponse(await upstream.json()));
      } catch (error: any) {
        const status = error?.message === "DeepSeek Harness OAuth is not configured" ? 503 : 502;
        return pluginJsonResponse({ error: error?.message || "device_authorization_unavailable" }, status);
      }
    }),
  });

  http.route({
    path: "/plugin/deepseek-harness/auth/poll",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const limited = await rateLimitDeviceAuth(ctx, request, "poll");
      if (limited) return limited;
      try {
        const body = await request.json();
        const deviceCode = typeof body?.deviceCode === "string" ? body.deviceCode.trim() : "";
        if (!deviceCode || deviceCode.length > 2048) {
          return pluginJsonResponse({ error: "invalid_device_code" }, 400);
        }
        const { issuer, clientId } = deviceOauthConfig();
        const upstream = await fetch(`${issuer}oauth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: DEVICE_GRANT_TYPE,
            device_code: deviceCode,
            client_id: clientId,
          }),
        });
        const payload: any = await upstream.json().catch(() => ({}));
        if (upstream.ok) {
          const accessToken = typeof payload?.access_token === "string" ? payload.access_token.trim() : "";
          const expiresIn = Math.min(86400, Math.max(60, Number(payload?.expires_in) || 3600));
          if (!accessToken || accessToken.length > 12000 || payload?.token_type !== "Bearer") {
            return pluginJsonResponse({ error: "invalid_token_response" }, 502);
          }
          return pluginJsonResponse({
            accessToken,
            tokenType: "Bearer",
            expiresIn,
            scope: String(payload?.scope || "themes:read").slice(0, 240),
          });
        }
        const knownErrors: Record<string, number> = {
          authorization_pending: 202,
          slow_down: 429,
          expired_token: 410,
          access_denied: 403,
        };
        const error = typeof payload?.error === "string" && knownErrors[payload.error]
          ? payload.error
          : "device_authorization_failed";
        return pluginJsonResponse({ error }, knownErrors[error] || 502);
      } catch {
        return pluginJsonResponse({ error: "device_authorization_failed" }, 502);
      }
    }),
  });

  http.route({
    path: "/plugin/deepseek-harness/use",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      try {
        const session = await authorizePlugin(ctx, request, "themes:read");
        const achievement = await ctx.runMutation(internal.unlocks.recordDeepSeekHarnessUse, {
          authToken: session.pluginAuthToken,
        });
        return pluginJsonResponse({ achievement });
      } catch (error) {
        return errorResponse(error);
      }
    }),
  });

  http.route({
    path: "/plugin/me/stats",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      try {
        const session = await authorizePlugin(ctx, request, "themes:read");
        const stats = sanitizeCreatorStatsForPlugin(await ctx.runQuery(internal.themes.getMySubmissionStats, {
          authToken: session.pluginAuthToken,
        }));
        const achievements = await ctx.runQuery(internal.unlocks.getMyUnlocks, {
          authToken: session.pluginAuthToken,
        });
        return pluginJsonResponse({
          ...stats,
          achievements: enrichUnlocks(achievements),
        });
      } catch (error) {
        return errorResponse(error);
      }
    }),
  });

  http.route({
    path: "/plugin/me/unlocks",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      try {
        const session = await authorizePlugin(ctx, request, "themes:read");
        const unlocks = await ctx.runQuery(internal.unlocks.getMyUnlocks, {
          authToken: session.pluginAuthToken,
        });
        return pluginJsonResponse({ unlocks: enrichUnlocks(unlocks) });
      } catch (error) {
        return errorResponse(error);
      }
    }),
  });

  http.route({
    path: "/plugin/themes",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      try {
        const session = await authorizePlugin(ctx, request, "themes:write");
        const body = await request.json();
        const theme = body?.theme || {};
        const result = await ctx.runMutation(internal.themes.submit, {
          authToken: session.pluginAuthToken,
          themeId: theme.themeId || theme.id,
          name: theme.name,
          summary: theme.summary || theme.name,
          dark: theme.dark || undefined,
          light: theme.light || undefined,
          accents: theme.accents || [theme.dark?.accent, theme.light?.accent].filter(Boolean),
          codeThemeId: theme.codeThemeId || { dark: "codex", light: "codex" },
          source: "plugin",
        });
        const unlocks = await ctx.runQuery(internal.unlocks.getMyUnlocks, {
          authToken: session.pluginAuthToken,
        });
        return pluginJsonResponse({
          theme: { ...result, name: theme.name },
          achievements: unlocks.filter((unlock: any) =>
            ["use_plugin", "create_theme_with_plugin", "use_deepseek_harness", "openai_employee"].includes(unlock.action),
          ),
        }, 201);
      } catch (error: any) {
        if (error?.message && !["Unauthorized", "Insufficient scope", "DexThemes sign-in required"].includes(error.message)) {
          error.status ||= 400;
        }
        return errorResponse(error);
      }
    }),
  });
}
