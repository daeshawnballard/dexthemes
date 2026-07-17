import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  ALLOWED_ORIGINS,
  OAUTH_STATE_TTL_MS,
  RATE_LIMITS,
  OAUTH_BINDING_COOKIE_NAME,
  buildOauthBindingCookie,
  buildSessionCookie,
  buildSessionHintCookie,
  buildOauthStateNonce,
  clearSessionCookie,
  clearSessionHintCookie,
  clearOauthBindingCookie,
  getCookieValue,
  getClientIP,
  getSessionToken,
  generateRandomString,
  isApiKey,
  jsonResponse,
  registerOptionsRoutes,
  resolveUser,
  sha256Base64Url,
  shouldUseSessionCookie,
  type DexHttpRouter,
} from "./http_helpers";

export function registerAuthRoutes(http: DexHttpRouter) {
  registerOptionsRoutes(http, [
    "/auth/me",
    "/auth/logout",
    "/auth/session",
    "/auth/api-key",
    "/auth/agent",
    "/me/stats",
  ]);

  http.route({
    path: "/auth/github",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const clientId = process.env.GITHUB_CLIENT_ID;
      if (!clientId) {
        return new Response("GitHub OAuth not configured", { status: 500 });
      }
      const reqUrl = new URL(request.url);
      const ip = await getClientIP(ctx, request);
      const networkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `oauth-start:network:${ip}`,
        ...RATE_LIMITS.oauthStartNetwork,
      });
      if (!networkRate.allowed) {
        return new Response("Too many sign-in attempts. Try again later.", {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((networkRate.retryAfter || 1000) / 1000)) },
        });
      }
      const globalRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: "oauth-start:global",
        ...RATE_LIMITS.oauthStartGlobal,
      });
      if (!globalRate.allowed) {
        return new Response("Too many sign-in attempts. Try again later.", {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((globalRate.retryAfter || 1000) / 1000)) },
        });
      }
      const frontendOrigin = reqUrl.searchParams.get("origin") || "https://dexthemes.com";
      const nonce = buildOauthStateNonce();
      const browserBinding = generateRandomString(64);
      const codeVerifier = generateRandomString(64);
      const codeChallenge = await sha256Base64Url(codeVerifier);
      await ctx.runMutation(internal.oauthStates.createOauthState, {
        nonce,
        provider: "github",
        origin: ALLOWED_ORIGINS.includes(frontendOrigin) ? frontendOrigin : "https://www.dexthemes.com",
        codeVerifier,
        bindingHash: await sha256Base64Url(browserBinding),
        expiresAt: Date.now() + OAUTH_STATE_TTL_MS,
      });
      const redirectUri = "https://www.dexthemes.com/auth/github/callback";
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "read:user user:email",
        state: nonce,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });
      const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
      const headers = new Headers({ Location: url });
      headers.append("Set-Cookie", buildOauthBindingCookie(browserBinding));
      return new Response(null, { status: 302, headers });
    }),
  });

  http.route({
    path: "/auth/github/callback",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const binding = getCookieValue(request, OAUTH_BINDING_COOKIE_NAME);
      const oauthError = (message: string, status = 400) => {
        const headers = new Headers({ "Content-Type": "text/plain; charset=utf-8" });
        headers.append("Set-Cookie", clearOauthBindingCookie());
        return new Response(message, { status, headers });
      };
      if (!code) return oauthError("Missing code parameter");
      if (!state) return oauthError("Missing state parameter");
      if (!binding) return oauthError("Sign-in must be completed in the browser that started it");

      const oauthState = await ctx.runMutation(internal.oauthStates.consumeOauthState, {
        nonce: state,
        provider: "github",
        bindingHash: await sha256Base64Url(binding),
      });
      if (!oauthState) {
        return oauthError("Invalid or expired state parameter");
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      if (!clientId || !clientSecret || !oauthState.codeVerifier) {
        return oauthError("GitHub OAuth is not fully configured", 500);
      }
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: "https://www.dexthemes.com/auth/github/callback",
          code_verifier: oauthState.codeVerifier,
        }),
      });
      const tokenData: any = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
        return oauthError("GitHub OAuth token exchange failed");
      }

      const githubHeaders = {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "DexThemes",
      };
      const [profileRes, emailsRes] = await Promise.all([
        fetch("https://api.github.com/user", { headers: githubHeaders }),
        fetch("https://api.github.com/user/emails", { headers: githubHeaders }),
      ]);
      if (!profileRes.ok) {
        return oauthError("Unable to load GitHub profile");
      }
      const profile: any = await profileRes.json();

      let isOpenAIEmployee: boolean | undefined;
      if (emailsRes.ok) {
        const emails: any[] = await emailsRes.json();
        isOpenAIEmployee = emails.some((entry) => {
          if (!entry || entry.verified !== true || typeof entry.email !== "string") return false;
          const separator = entry.email.lastIndexOf("@");
          return separator > 0 && entry.email.slice(separator + 1).toLowerCase() === "openai.com";
        });
      }

      const user = await ctx.runMutation(internal.users.getOrCreateUser, {
        provider: "github",
        providerId: String(profile.id),
        username: profile.login || "",
        displayName: profile.name || profile.login || "",
        avatarUrl: profile.avatar_url || "",
        isOpenAIEmployee,
      });

      if (!user) {
        return oauthError("Unable to create DexThemes session", 500);
      }

      if (shouldUseSessionCookie(oauthState.origin)) {
        const headers = new Headers();
        headers.set("Location", oauthState.origin);
        headers.append(
          "Set-Cookie",
          buildSessionCookie(
            user.sessionToken,
            Math.max(0, Math.floor((user.sessionExpiresAt - Date.now()) / 1000)),
          ),
        );
        headers.append(
          "Set-Cookie",
          buildSessionHintCookie(
            Math.max(0, Math.floor((user.sessionExpiresAt - Date.now()) / 1000)),
          ),
        );
        headers.append("Set-Cookie", clearOauthBindingCookie());
        return new Response(null, {
          status: 302,
          headers,
        });
      }

      const frontendUrl = `${oauthState.origin}/#auth=${user.sessionToken}`;
      const headers = new Headers({ Location: frontendUrl });
      headers.append("Set-Cookie", clearOauthBindingCookie());
      return new Response(null, { status: 302, headers });
    }),
  });

  http.route({
    path: "/auth/x",
    method: "GET",
    handler: httpAction(async () => {
      return new Response("X sign-in is no longer supported", { status: 410 });
    }),
  });

  http.route({
    path: "/auth/x/callback",
    method: "GET",
    handler: httpAction(async () => {
      return new Response("X sign-in is no longer supported", { status: 410 });
    }),
  });

  http.route({
    path: "/auth/session",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const auth = request.headers.get("Authorization");
      const token = auth && auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token || isApiKey(token)) {
        return jsonResponse({ error: "Session token required" }, origin, 401);
      }

      const user = await resolveUser(ctx, token);
      if (!user) return jsonResponse({ error: "Invalid or expired session" }, origin, 401);

      const headers = new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400",
      });
      headers.append("Set-Cookie", buildSessionCookie(token));
      headers.append("Set-Cookie", buildSessionHintCookie());
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }),
  });

  http.route({
    path: "/auth/me",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "No token" }, origin, 401);

      const user = await resolveUser(ctx, token);
      if (!user) return jsonResponse({ error: "Invalid or expired session" }, origin, 401);

      return jsonResponse({ user }, origin);
    }),
  });

  http.route({
    path: "/auth/logout",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (token) {
        await ctx.runMutation(internal.users.deleteSession, { sessionToken: token });
      }
      const headers = new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Max-Age": "86400",
      });
      headers.append("Set-Cookie", clearSessionCookie());
      headers.append("Set-Cookie", clearSessionHintCookie());
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }),
  });

  http.route({
    path: "/auth/api-key",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token || isApiKey(token)) {
        return jsonResponse({ error: "Session token required (not API key)" }, origin, 401);
      }

      try {
        const result = await ctx.runMutation(internal.users.generateApiKey, {
          sessionToken: token,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        return jsonResponse({ error: e.message }, origin, 401);
      }
    }),
  });

  http.route({
    path: "/auth/api-key",
    method: "DELETE",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token || isApiKey(token)) {
        return jsonResponse({ error: "Session token required (not API key)" }, origin, 401);
      }

      try {
        const result = await ctx.runMutation(internal.users.revokeApiKey, {
          sessionToken: token,
        });
        return jsonResponse(result, origin);
      } catch (e: any) {
        return jsonResponse({ error: e.message }, origin, 401);
      }
    }),
  });

  http.route({
    path: "/auth/agent",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token || isApiKey(token)) {
        return jsonResponse({ error: "GitHub sign-in required" }, origin, 401);
      }
      const user = await resolveUser(ctx, token);
      if (!user || user.provider !== "github") {
        return jsonResponse({ error: "GitHub sign-in required" }, origin, 401);
      }
      const ip = await getClientIP(ctx, request);

      const identityRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `agent-key:identity:${user._id}`,
        ...RATE_LIMITS.agentRegister,
      });
      const networkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `agent-key:network:${ip}`,
        ...RATE_LIMITS.agentRegisterNetwork,
      });
      if (!identityRate.allowed || !networkRate.allowed) {
        return jsonResponse(
          {
            error: "Too many agent key requests. Try again later.",
            retryAfter: Math.max(identityRate.retryAfter || 0, networkRate.retryAfter || 0),
          },
          origin, 429,
        );
      }

      try {
        const result = await ctx.runMutation(internal.users.generateAgentApiKey, {
          sessionToken: token,
        });

        return jsonResponse({
          apiKey: result.apiKey,
          agentId: result.agentId,
          message: "API key created. It is shown once; store it securely.",
          docs: "https://dexthemes.com/llms.txt",
        }, origin, 201);
      } catch (e: any) {
        return jsonResponse({ error: e.message }, origin, 400);
      }
    }),
  });

  http.route({
    path: "/me/stats",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
      const origin = request.headers.get("Origin");
      const token = getSessionToken(request);
      if (!token) return jsonResponse({ error: "No token" }, origin, 401);

      const ip = await getClientIP(ctx, request);
      const networkRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `stats:network:${ip}`,
        ...RATE_LIMITS.statsReadNetwork,
      });
      if (!networkRate.allowed) {
        return jsonResponse({
          error: "Too many stats requests. Try again later.",
          retryAfter: networkRate.retryAfter,
        }, origin, 429);
      }
      const user = await resolveUser(ctx, token);
      if (!user) return jsonResponse({ error: "Unauthorized" }, origin, 401);
      const identityRate = await ctx.runMutation(internal.rateLimit.checkRateLimit, {
        key: `stats:user:${String(user._id)}`,
        ...RATE_LIMITS.statsReadIdentity,
      });
      if (!identityRate.allowed) {
        return jsonResponse({
          error: "Too many stats requests. Try again later.",
          retryAfter: identityRate.retryAfter,
        }, origin, 429);
      }

      try {
        const stats = await ctx.runQuery(internal.themes.getMySubmissionStats, {
          authToken: token,
        });
        return jsonResponse(stats, origin);
      } catch (e: any) {
        const status = e.message === "Unauthorized" ? 401 : 400;
        return jsonResponse({ error: e.message }, origin, status);
      }
    }),
  });
}
