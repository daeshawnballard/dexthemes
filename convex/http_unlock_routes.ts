import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  RATE_LIMITS,
  getClientIP,
  getSessionToken,
  hmacSign,
  jsonResponse,
  normalizeHex,
  registerOptionsRoutes,
  resolveUser,
  type DexHttpRouter,
} from "./http_helpers";

const PUBLIC_UNLOCK_ACTIONS = new Set([
  "share_x",
  "color_me_lucky",
  "install_pwa",
]);

export function extractBmcEventName(payload: any): string {
  return String(
    payload?.type ||
    payload?.event ||
    payload?.eventType ||
    payload?.event_type ||
    payload?.name ||
    payload?.kind ||
    "",
  ).trim();
}

export function isRevocationBmcEvent(eventName: string): boolean {
  const normalized = eventName.toLowerCase();
  return normalized.includes("refund") || normalized.includes("cancel");
}

export function isAllowedBmcEvent(eventName: string): boolean {
  const normalized = eventName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return normalized === "support created" ||
    normalized === "monthly support started" ||
    normalized === "membership started";
}

function extractNestedString(payload: any, matcher: (value: string) => boolean): string | null {
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

export function extractBmcClaimToken(payload: any): string | null {
  const match = extractNestedString(payload, (value) => /dxtsup_[a-f0-9]{36}/i.test(value));
  return match?.match(/dxtsup_[a-f0-9]{36}/i)?.[0] || null;
}

function extractBmcSupportId(payload: any): string | null {
  return String(
    payload?.id ||
    payload?.support_id ||
    payload?.supportId ||
    payload?.data?.id ||
    payload?.data?.support_id ||
    "",
  ).trim() || null;
}

function extractBmcSupporterName(payload: any): string | null {
  return String(
    payload?.supporter_name ||
    payload?.supporterName ||
    payload?.name ||
    payload?.from_name ||
    payload?.support?.name ||
    payload?.data?.supporter_name ||
    "",
  ).trim() || null;
}

function extractBmcSupporterEmail(payload: any): string | null {
  return String(
    payload?.supporter_email ||
    payload?.supporterEmail ||
    payload?.email ||
    payload?.support?.email ||
    payload?.data?.supporter_email ||
    "",
  ).trim() || null;
}

function extractBmcAmount(payload: any): number | undefined {
  const raw =
    payload?.amount ||
    payload?.support_amount ||
    payload?.supportAmount ||
    payload?.data?.amount ||
    payload?.data?.support_amount;
  const amount = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(amount) ? amount : undefined;
}

function extractBmcCurrency(payload: any): string | null {
  return String(
    payload?.currency ||
    payload?.data?.currency ||
    payload?.support_currency ||
    "",
  ).trim() || null;
}

export function registerUnlockRoutes(http: DexHttpRouter) {
  registerOptionsRoutes(http, [
    "/unlocks/grant",
    "/me/api-demo",
    "/me/unlocks",
    "/me/activity",
    "/leaderboard",
    "/supporters",
    "/supporters/claim",
  ]);

  http.route({
    path: "/unlocks/grant",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      try {
        const body = await request.json();
        if (!PUBLIC_UNLOCK_ACTIONS.has(body.action)) {
          return jsonResponse({ error: "Invalid action" }, origin, 400);
        }
        const result = await ctx.runMutation(internal.unlocks.grantUnlock, {
          authToken: token,
          action: body.action,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/me/api-demo",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      const ip = await getClientIP(ctx, request);
      const networkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `api-demo:network:${ip}`,
        ...RATE_LIMITS.authenticatedDemoNetwork,
      });
      if (!networkRate.allowed) {
        return jsonResponse(
          { error: "Too many requests. Try again later.", retryAfter: networkRate.retryAfter },
          origin,
          429,
        );
      }
      const user = await resolveUser(ctx, token);
      if (!user) return jsonResponse({ error: "Unauthorized" }, origin, 401);
      const identityRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `api-demo:user:${String(user._id)}`,
        ...RATE_LIMITS.authenticatedDemo,
      });
      if (!identityRate.allowed) {
        return jsonResponse(
          { error: "Too many requests. Try again later.", retryAfter: identityRate.retryAfter },
          origin,
          429,
        );
      }

      try {
        const themes = await ctx.runQuery(internal.themes.listPublished, {});
        const unlock = await ctx.runMutation(internal.unlocks.completeApiDemo, {
          authToken: token,
        });
        return jsonResponse({
          success: true,
          communityThemeCount: themes.length,
          unlock,
        }, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/me/unlocks",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "No token" }, origin, 401);

      try {
        const unlocks = await ctx.runQuery(internal.unlocks.getMyUnlocks, {
          authToken: token,
        });
        return jsonResponse({ unlocks }, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/me/activity",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      try {
        const body = await request.json();
        const result = await ctx.runMutation(internal.unlocks.recordUserActivity, {
          authToken: token,
          activity: body.activity,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/leaderboard",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const ip = await getClientIP(ctx, request);
      const rl = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `read:leaderboard:${ip}`,
        ...RATE_LIMITS.publicLeaderboardRead,
      });
      if (!rl.allowed) {
        return jsonResponse(
          { error: "Too many requests. Try again later.", retryAfter: rl.retryAfter },
          origin,
          429,
        );
      }
      const leaderboard = await ctx.runQuery(internal.unlocks.getLeaderboard, {});
      return jsonResponse(leaderboard, origin, 200, {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
      });
    }),
  });

  http.route({
    path: "/supporters",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const ip = await getClientIP(ctx, request);
      const rl = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `read:supporters:${ip}`,
        ...RATE_LIMITS.publicSupportersRead,
      });
      if (!rl.allowed) {
        return jsonResponse(
          { error: "Too many requests. Try again later.", retryAfter: rl.retryAfter },
          origin,
          429,
        );
      }
      const supporters = await ctx.runQuery(internal.unlocks.getPublicSupporters, {});
      return jsonResponse({ supporters }, origin, 200, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
      });
    }),
  });

  http.route({
    path: "/supporters/claim",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "Unauthorized" }, origin, 401);

      try {
        const body = await request.json().catch(() => ({}));
        const result = await ctx.runMutation(internal.supporters.createSupporterClaim, {
          authToken: token,
          publicListing: body.publicListing === true,
        });
        return jsonResponse({
          ...result,
          donateUrl: "https://buymeacoffee.com/daeshawn",
        }, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });

  http.route({
    path: "/bmc/webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const secret = process.env.BMC_WEBHOOK_SECRET;
      if (!secret) {
        return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const rawBody = await request.text();
      const headerSig = request.headers.get("x-signature-sha256") || request.headers.get("x-bmc-signature");
      if (!headerSig) {
        return new Response(JSON.stringify({ error: "Missing webhook signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const expectedSig = await hmacSign(secret, rawBody);
      if (normalizeHex(headerSig) !== expectedSig) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      let payload: any = {};
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const eventName = extractBmcEventName(payload);
      if (!eventName || (!isAllowedBmcEvent(eventName) && !isRevocationBmcEvent(eventName))) {
        return new Response(JSON.stringify({
          received: true,
          ignored: true,
          reason: "unsupported_event",
          event: eventName || null,
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const supportId = extractBmcSupportId(payload) || undefined;

      if (isRevocationBmcEvent(eventName)) {
        if (!supportId) {
          return new Response(JSON.stringify({ received: true, matched: false, reason: "support_id_missing" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await ctx.runMutation(internal.supporters.revokeSupportFromWebhook, {
          supportId,
          sourceEvent: eventName || undefined,
          reason: "buy_me_a_coffee_revocation",
        });

        return new Response(JSON.stringify({ received: true, ...result }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const claimToken = extractBmcClaimToken(payload);
      if (!claimToken) {
        return new Response(JSON.stringify({ received: true, matched: false, reason: "claim_token_missing" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await ctx.runMutation(internal.supporters.claimSupportFromWebhook, {
        token: claimToken,
        sourceEvent: eventName || undefined,
        supportId,
        supporterName: extractBmcSupporterName(payload) || undefined,
        supporterEmail: extractBmcSupporterEmail(payload) || undefined,
        amount: extractBmcAmount(payload),
        currency: extractBmcCurrency(payload) || undefined,
      });

      return new Response(JSON.stringify({ received: true, ...result }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  });
}
