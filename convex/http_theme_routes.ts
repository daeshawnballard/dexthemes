import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { STATIC_THEME_CATALOG, normalizeDexThemesSubgroup } from "../shared/theme-api-catalog.js";
import {
  RATE_LIMITS,
  getClientIP,
  getSessionToken,
  isApiKey,
  jsonResponse,
  registerOptionsRoutes,
  resolveUser,
  type DexHttpRouter,
} from "./http_helpers";

export function registerThemeRoutes(http: DexHttpRouter) {
  registerOptionsRoutes(http, [
    "/themes",
    "/themes/community",
    "/themes/codex",
    "/themes/dexthemes",
    "/themes/flag",
    "/themes/copy",
    "/themes/like",
    "/themes/likes/counts",
    "/me/likes",
    "/themes/request-variant",
    "/themes/add-variant",
  ]);

  const visibleStaticThemes = () =>
    STATIC_THEME_CATALOG.filter((theme) => !theme._hiddenUntilUnlocked);

  const listCommunityThemes = async (ctx: any) => {
    const themes = await ctx.runQuery(internal.themes.listPublished, {});
    return themes.map((theme: any) => ({
      id: theme.themeId,
      themeId: theme.themeId,
      _id: theme._id,
      name: theme.name,
      category: "community",
      subgroup: "community",
      codeThemeId: theme.codeThemeId || { dark: "codex", light: "codex" },
      copies: theme.copies || 0,
      createdAt: theme.createdAt ?? null,
      dateAdded: theme.createdAt ? new Date(theme.createdAt).toISOString().split("T")[0] : null,
      dark: theme.dark ?? null,
      light: theme.light ?? null,
      accents: theme.accents || [theme.dark?.accent || theme.light?.accent].filter(Boolean),
      authorId: theme.authorId,
      authorName: theme.authorName,
      authorAvatarUrl: theme.authorAvatarUrl || "",
      authorIsSupporter: !!theme.authorIsSupporter,
      authorIsAgent: !!theme.authorIsAgent,
      summary: theme.summary || null,
      _convexId: theme._id,
      _authorId: theme.authorId,
      _authorName: theme.authorName,
      _authorAvatarUrl: theme.authorAvatarUrl || "",
      _authorIsSupporter: !!theme.authorIsSupporter,
      _authorIsAgent: !!theme.authorIsAgent,
      _summary: theme.summary || null,
    }));
  };

  const withThemeReadRateLimit = async (ctx: any, request: Request) => {
    const ip = getClientIP(request);
    return ctx.runMutation(internal.rateLimit.checkRateLimit, {
      key: `read:themes:${ip}`,
      ...RATE_LIMITS.publicThemesRead,
    });
  };

  const themeCatalogResponse = async (
    ctx: any,
    request: Request,
    buildThemes: () => Promise<any[]>,
  ) => {
    const origin = request.headers.get("Origin");
    const rl = await withThemeReadRateLimit(ctx, request);
    if (!rl.allowed) {
      return jsonResponse(
        { error: "Too many requests. Try again later.", retryAfter: rl.retryAfter },
        origin,
        429,
      );
    }
    const themes = await buildThemes();
    return jsonResponse(themes, origin, 200, {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
    });
  };

  http.route({
    path: "/themes",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      return themeCatalogResponse(ctx, request, async () => [
        ...visibleStaticThemes(),
        ...(await listCommunityThemes(ctx)),
      ]);
    }),
  });

  http.route({
    path: "/themes/community",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      return themeCatalogResponse(ctx, request, () => listCommunityThemes(ctx));
    }),
  });

  http.route({
    path: "/themes/codex",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      return themeCatalogResponse(ctx, request, async () =>
        visibleStaticThemes().filter((theme) => theme.category === "codex"),
      );
    }),
  });

  http.route({
    path: "/themes/dexthemes",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      return themeCatalogResponse(ctx, request, async () =>
        visibleStaticThemes().filter((theme) => theme.category === "dexthemes"),
      );
    }),
  });

  http.route({
    path: "/themes/dexthemes/:subgroup",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const url = new URL(request.url);
      const subgroupSegment = url.pathname.split("/").pop() || "";
      const normalizedGroup = normalizeDexThemesSubgroup(subgroupSegment);
      if (!normalizedGroup) {
        const origin = request.headers.get("Origin");
        return jsonResponse({ error: "Unknown DexThemes subgroup" }, origin, 404);
      }
      return themeCatalogResponse(ctx, request, async () =>
        visibleStaticThemes().filter(
          (theme) => theme.category === "dexthemes" && normalizeDexThemesSubgroup(theme.subgroup) === normalizedGroup,
        ),
      );
    }),
  });

  http.route({
    path: "/themes",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      const rl = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `submit:${token}`,
        ...RATE_LIMITS.themeSubmit,
      });
      if (!rl.allowed) {
        return jsonResponse(
          { error: "Too many submissions. Try again later.", retryAfter: rl.retryAfter },
          origin, 429
        );
      }

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.themes.submit, {
          authToken: token,
          themeId: body.themeId || body.id,
          name: body.name,
          summary: body.summary || body.name,
          dark: body.dark || undefined,
          light: body.light || undefined,
          accents: body.accents || [body.dark?.accent || body.light?.accent].filter(Boolean),
          codeThemeId: body.codeThemeId || {
            dark: "codex",
            light: "codex",
          },
        });
        return jsonResponse({ success: true, theme: result }, origin, 201);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/themes/flag",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      const rl = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `flag:${token}`,
        ...RATE_LIMITS.themeFlag,
      });
      if (!rl.allowed) {
        return jsonResponse(
          { error: "Too many flag requests. Try again later.", retryAfter: rl.retryAfter },
          origin, 429
        );
      }

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.flags.flagTheme, {
          sessionToken: token,
          themeId: body.themeId,
          reason: body.reason,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        if (e.message === "Already flagged") {
          return jsonResponse({ error: e.message }, origin, 409);
        }
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/themes/copy",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      let userId = undefined;
      if (token && !isApiKey(token)) {
        const user = await resolveUser(ctx, token);
        if (user) userId = user._id;
      }

      const ip = getClientIP(request);
      const rl = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `copy:${ip}`,
        ...RATE_LIMITS.themeCopy,
      });
      if (!rl.allowed) {
        return jsonResponse(
          { error: "Too many requests. Try again later.", retryAfter: rl.retryAfter },
          origin, 429
        );
      }

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.themes.registerCopy, {
          themeId: body.themeId,
          ip,
          userId,
        });
        return jsonResponse(result || { error: "Theme not found" }, origin, result ? 200 : 404);
      } catch (e: any) {
        return jsonResponse({ error: e.message }, origin, 400);
      }
    }),
  });

  http.route({
    path: "/themes/like",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.likes.toggleLike, {
          sessionToken: token,
          themeId: body.themeId,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/themes/likes/counts",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const ip = getClientIP(request);
      const rl = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `read:likes:${ip}`,
        ...RATE_LIMITS.publicLikesRead,
      });
      if (!rl.allowed) {
        return jsonResponse(
          { error: "Too many requests. Try again later.", retryAfter: rl.retryAfter },
          origin,
          429,
        );
      }
      const counts = await ctx.runQuery(internal.likes.getAllLikeCounts, {});
      return jsonResponse(counts, origin, 200, {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      });
    }),
  });

  http.route({
    path: "/me/likes",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "No token" }, origin, 401);

      try {
        const likes = await ctx.runQuery(internal.likes.getMyLikes, {
          sessionToken: token,
        });
        return jsonResponse({ likes }, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/themes/request-variant",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.themes.requestVariant, {
          sessionToken: token,
          themeId: body.themeId,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/themes/add-variant",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.themes.addVariant, {
          authToken: token,
          themeId: body.themeId,
          variant: body.variant,
          variantKey: body.variantKey,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });
}
