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
  CONNECTED_APP_IDS,
  normalizeConnectedAppPluginVersion,
} from "../shared/connected-apps-contract.js";
import { DEEPSEEK_SESSION_SOURCE } from "./connectedApps";
import {
  RATE_LIMITS,
  getClientIP,
  pluginJsonResponse,
  registerPluginOptionsRoutes,
  sha256Hex,
  type DexHttpRouter,
} from "./http_helpers";

const DEVICE_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";
const GITHUB_DEVICE_CODE_URL = "https://github.com/login/device/code";
const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_PROFILE_URL = "https://api.github.com/user";
const GITHUB_TOKEN_API_BASE = "https://api.github.com/applications";
const GITHUB_USER_AGENT = "DexThemes-DeepSeek-Harness";
const GITHUB_DEVICE_ERROR_STATUS: Record<string, number> = {
  authorization_pending: 202,
  slow_down: 429,
  expired_token: 410,
  access_denied: 403,
  incorrect_device_code: 400,
  incorrect_client_credentials: 503,
  unsupported_grant_type: 502,
  device_flow_disabled: 503,
};

function githubDeviceConfig() {
  const clientId = String(process.env.DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_SECRET || "").trim();
  if (!clientId || clientId.length > 200 || !clientSecret || clientSecret.length > 500) {
    throw new Error("GitHub Device Flow is not configured");
  }
  return { clientId, clientSecret };
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
  if (action === "start" || action === "poll") {
    const globalLimit = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
      key: `plugin:deepseek-oauth:${action}:global`,
      ...(action === "start" ? RATE_LIMITS.oauthStartGlobal : RATE_LIMITS.pluginDevicePollGlobal),
    });
    if (!globalLimit.allowed) {
      return pluginJsonResponse(
        { error: "rate_limited", retryAfter: globalLimit.retryAfter },
        429,
        { "Retry-After": String(Math.max(1, Math.ceil((globalLimit.retryAfter || 1000) / 1000))) },
      );
    }
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
  let parsedVerificationUri: URL;
  try {
    parsedVerificationUri = new URL(verificationUri);
  } catch {
    throw new Error("GitHub returned an invalid device authorization response");
  }
  if (
    !deviceCode || deviceCode.length > 2048 ||
    !userCode || userCode.length > 32 ||
    parsedVerificationUri.protocol !== "https:" ||
    parsedVerificationUri.hostname !== "github.com" ||
    parsedVerificationUri.pathname !== "/login/device" ||
    parsedVerificationUri.username || parsedVerificationUri.password ||
    verificationUri.length > 1000 ||
    !verificationUriComplete.startsWith(verificationUri) || verificationUriComplete.length > 1200
  ) {
    throw new Error("GitHub returned an invalid device authorization response");
  }
  return { deviceCode, userCode, verificationUri, verificationUriComplete, expiresIn, interval };
}

function boundedGitHubIdentity(payload: any) {
  const githubId = String(payload?.id || "").trim();
  const username = String(payload?.login || "").trim();
  const displayName = String(payload?.name || username).replace(/[\r\n\t]+/g, " ").trim().slice(0, 160);
  const avatarUrl = String(payload?.avatar_url || "").trim().slice(0, 500);
  if (!/^\d{1,30}$/.test(githubId) || !/^[A-Za-z0-9-]{1,39}$/.test(username)) {
    throw new Error("GitHub returned an invalid account identity");
  }
  if (avatarUrl && !avatarUrl.startsWith("https://")) {
    throw new Error("GitHub returned an invalid account identity");
  }
  return { githubId, username, displayName: displayName || username, avatarUrl };
}

function githubDeviceErrorResponse(payload: any, fallbackStatus = 502) {
  const providerError = typeof payload?.error === "string" ? payload.error : "";
  const error = GITHUB_DEVICE_ERROR_STATUS[providerError]
    ? providerError
    : "device_authorization_failed";
  const status = GITHUB_DEVICE_ERROR_STATUS[error] || fallbackStatus;
  const headers: Record<string, string> = error === "slow_down" ? { "Retry-After": "5" } : {};
  return pluginJsonResponse({ error }, status, headers);
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
  const authorization = request.headers.get("Authorization") || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  let session: any;
  let identityHash: string;
  if (bearer.startsWith("dxd_")) {
    session = await ctx.runQuery(internal.pluginUsers.resolveClientPluginSession, {
      authToken: bearer,
      requiredScope: scope,
    });
    if (!session) throw new Error("Unauthorized");
    identityHash = await sha256Hex(`user:${session.userId}`);
  } else {
    const identity = await verifyPluginBearer(request, scope);
    identityHash = await sha256Hex(`github:${identity.githubId}`);
    session = await ctx.runMutation(internal.pluginUsers.upsertPluginUser, {
      ...identity,
      scope,
    });
  }
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
  return session;
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
    "/plugin/deepseek-harness/session",
  ]);

  http.route({
    path: "/plugin/deepseek-harness/auth/start",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const limited = await rateLimitDeviceAuth(ctx, request, "start");
      if (limited) return limited;
      try {
        const { clientId } = githubDeviceConfig();
        const upstream = await fetch(GITHUB_DEVICE_CODE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": GITHUB_USER_AGENT,
          },
          body: new URLSearchParams({ client_id: clientId }),
        });
        const payload: any = await upstream.json().catch(() => ({}));
        if (!upstream.ok || payload?.error) return githubDeviceErrorResponse(payload);
        return pluginJsonResponse(boundedDeviceResponse(payload));
      } catch (error: any) {
        const status = error?.message === "GitHub Device Flow is not configured" ? 503 : 502;
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
        const deviceHash = await sha256Hex(deviceCode);
        const deviceRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
          key: `plugin:deepseek-oauth:poll:device:${deviceHash}`,
          ...RATE_LIMITS.pluginDevicePollCode,
        });
        if (!deviceRate.allowed) {
          return pluginJsonResponse(
            { error: "slow_down", retryAfter: deviceRate.retryAfter },
            429,
            { "Retry-After": String(Math.max(5, Math.ceil((deviceRate.retryAfter || 5000) / 1000))) },
          );
        }
        const { clientId, clientSecret } = githubDeviceConfig();
        const upstream = await fetch(GITHUB_ACCESS_TOKEN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            "User-Agent": GITHUB_USER_AGENT,
          },
          body: new URLSearchParams({
            grant_type: DEVICE_GRANT_TYPE,
            device_code: deviceCode,
            client_id: clientId,
          }),
        });
        const payload: any = await upstream.json().catch(() => ({}));
        if (upstream.ok && !payload?.error) {
          const githubAccessToken = typeof payload?.access_token === "string" ? payload.access_token.trim() : "";
          if (!githubAccessToken || githubAccessToken.length > 12000 || String(payload?.token_type).toLowerCase() !== "bearer") {
            return pluginJsonResponse({ error: "invalid_token_response" }, 502);
          }
          let profileResponse: Response | null = null;
          let profilePayload: any = null;
          try {
            profileResponse = await fetch(GITHUB_PROFILE_URL, {
              headers: {
                Authorization: `Bearer ${githubAccessToken}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": GITHUB_USER_AGENT,
              },
            });
            profilePayload = await profileResponse.json().catch(() => null);
          } finally {
            const revokeResponse = await fetch(`${GITHUB_TOKEN_API_BASE}/${encodeURIComponent(clientId)}/token`, {
              method: "DELETE",
              headers: {
                Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": GITHUB_USER_AGENT,
              },
              body: JSON.stringify({ access_token: githubAccessToken }),
            });
            if (!revokeResponse.ok) throw new Error("github_token_cleanup_failed");
          }
          if (!profileResponse) {
            return pluginJsonResponse({ error: "github_identity_unavailable" }, 502);
          }
          if (!profileResponse.ok) {
            return pluginJsonResponse({ error: "github_identity_unavailable" }, 502);
          }
          if (!profilePayload) {
            return pluginJsonResponse({ error: "github_identity_unavailable" }, 502);
          }
          const identity = boundedGitHubIdentity(profilePayload);
          const session = await ctx.runMutation(internal.pluginUsers.upsertDeepSeekDeviceUser, {
            ...identity,
            pluginVersion: normalizeConnectedAppPluginVersion(body?.pluginVersion),
          });
          return pluginJsonResponse({
            accessToken: session.pluginAuthToken,
            tokenType: "Bearer",
            expiresIn: session.expiresIn,
            scope: "themes:read",
          });
        }
        return githubDeviceErrorResponse(payload, upstream.ok ? 502 : upstream.status >= 500 ? 502 : 400);
      } catch (error: any) {
        const name = error?.message === "github_token_cleanup_failed"
          ? "github_token_cleanup_failed"
          : "device_authorization_failed";
        return pluginJsonResponse({ error: name }, 502);
      }
    }),
  });

  http.route({
    path: "/plugin/deepseek-harness/session",
    method: "DELETE",
    handler: httpAction(async (ctx, request) => {
      const limited = await rateLimitDeviceAuth(ctx, request, "disconnect");
      if (limited) return limited;
      const authorization = request.headers.get("Authorization") || "";
      const authToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
      if (!authToken.startsWith("dxd_") || authToken.length > 256) {
        return pluginJsonResponse({ error: "Unauthorized" }, 401);
      }
      const revoked = await ctx.runMutation(internal.pluginUsers.revokeClientPluginSession, { authToken });
      return pluginJsonResponse({ revoked });
    }),
  });

  http.route({
    path: "/plugin/deepseek-harness/use",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      try {
        const session = await authorizePlugin(ctx, request, "themes:read");
        const body: any = await request.json().catch(() => ({}));
        const isConnectedDeepSeekApp = session.source === DEEPSEEK_SESSION_SOURCE;
        const achievement = await ctx.runMutation(internal.unlocks.recordDeepSeekHarnessUseForUser, {
          userId: session.userId,
          ...(isConnectedDeepSeekApp ? {
            connectedAppId: CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
            pluginVersion: normalizeConnectedAppPluginVersion(body?.pluginVersion),
          } : {}),
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
        const stats = sanitizeCreatorStatsForPlugin(await ctx.runQuery(internal.themes.getSubmissionStatsForPluginUser, {
          userId: session.userId,
        }));
        const achievements = await ctx.runQuery(internal.unlocks.getUnlocksForUser, {
          userId: session.userId,
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
        const unlocks = await ctx.runQuery(internal.unlocks.getUnlocksForUser, {
          userId: session.userId,
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
        const unlocks = await ctx.runQuery(internal.unlocks.getUnlocksForUser, {
          userId: session.userId,
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
