import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { verifyPluginBearer } from "./pluginAuth";
import {
  RATE_LIMITS,
  getClientIP,
  jsonResponse,
  registerOptionsRoutes,
  sha256Hex,
  type DexHttpRouter,
} from "./http_helpers";

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

function errorResponse(error: any, origin: string | null) {
  const status = error?.status || (
    error?.message === "Insufficient scope" ? 403 :
    error?.message === "Plugin OAuth is not configured" ? 503 : 401
  );
  return jsonResponse({ error: error?.message || "Unauthorized", retryAfter: error?.retryAfter }, origin, status);
}

export function registerPluginRoutes(http: DexHttpRouter) {
  registerOptionsRoutes(http, ["/plugin/me/stats", "/plugin/me/unlocks", "/plugin/themes"]);

  http.route({
    path: "/plugin/me/stats",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      try {
        const session = await authorizePlugin(ctx, request, "themes:read");
        const stats = await ctx.runQuery(internal.themes.getMySubmissionStats, {
          authToken: session.pluginAuthToken,
        });
        const achievements = await ctx.runQuery(internal.unlocks.getMyUnlocks, {
          authToken: session.pluginAuthToken,
        });
        return jsonResponse({ ...stats, achievements }, origin);
      } catch (error) {
        return errorResponse(error, origin);
      }
    }),
  });

  http.route({
    path: "/plugin/me/unlocks",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      try {
        const session = await authorizePlugin(ctx, request, "themes:read");
        const unlocks = await ctx.runQuery(internal.unlocks.getMyUnlocks, {
          authToken: session.pluginAuthToken,
        });
        return jsonResponse({ unlocks }, origin);
      } catch (error) {
        return errorResponse(error, origin);
      }
    }),
  });

  http.route({
    path: "/plugin/themes",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
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
        return jsonResponse({
          theme: { ...result, name: theme.name },
          achievements: unlocks.filter((unlock: any) =>
            ["use_plugin", "create_theme_with_plugin", "openai_employee"].includes(unlock.action),
          ),
        }, origin, 201);
      } catch (error: any) {
        if (error?.message && !["Unauthorized", "Insufficient scope", "GitHub sign-in required"].includes(error.message)) {
          error.status ||= 400;
        }
        return errorResponse(error, origin);
      }
    }),
  });
}
