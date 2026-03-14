import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  "https://dexthemes.com",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
];

function corsHeaders(origin?: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function corsResponse(origin?: string | null, status = 204) {
  return new Response(null, { status, headers: corsHeaders(origin) });
}

function jsonResponse(data: any, origin?: string | null, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

// Extract session token from Authorization header
function getSessionToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// ---------------------------------------------------------------------------
// OPTIONS handlers (CORS preflight)
// ---------------------------------------------------------------------------
const optionsHandler = httpAction(async (_, request) => {
  return corsResponse(request.headers.get("Origin"));
});

http.route({ path: "/auth/me", method: "OPTIONS", handler: optionsHandler });
http.route({ path: "/auth/logout", method: "OPTIONS", handler: optionsHandler });
http.route({ path: "/themes", method: "OPTIONS", handler: optionsHandler });
http.route({ path: "/themes/flag", method: "OPTIONS", handler: optionsHandler });
http.route({ path: "/themes/copy", method: "OPTIONS", handler: optionsHandler });

// ---------------------------------------------------------------------------
// GitHub OAuth
// ---------------------------------------------------------------------------
http.route({
  path: "/auth/github",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return new Response("GitHub OAuth not configured", { status: 500 });
    }
    // Pass the frontend origin via state so callback knows where to redirect
    const reqUrl = new URL(request.url);
    const frontendOrigin = reqUrl.searchParams.get("origin") || "https://dexthemes.com";
    const state = btoa(JSON.stringify({ origin: frontendOrigin }));
    const redirectUri = "https://dexthemes.com/auth/github/callback";
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user&state=${encodeURIComponent(state)}`;
    return Response.redirect(url, 302);
  }),
});

http.route({
  path: "/auth/github/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response("Missing code parameter", { status: 400 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for access token
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
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return new Response(`GitHub OAuth error: ${tokenData.error_description}`, { status: 400 });
    }

    // Fetch user profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
        "User-Agent": "DexThemes",
      },
    });
    const profile = await profileRes.json();

    // Create or update user
    const user = await ctx.runMutation(api.users.getOrCreateUser, {
      provider: "github",
      providerId: String(profile.id),
      username: profile.login || "",
      displayName: profile.name || profile.login || "",
      avatarUrl: profile.avatar_url || "",
    });

    // Redirect back to frontend with session token
    // Read frontend origin from OAuth state parameter
    const state = url.searchParams.get("state");
    let frontendBase = "https://dexthemes.com";
    if (state) {
      try {
        const decoded = JSON.parse(atob(state));
        if (decoded.origin && ALLOWED_ORIGINS.includes(decoded.origin)) {
          frontendBase = decoded.origin;
        }
      } catch {}
    }
    const frontendUrl = `${frontendBase}/#auth=${user!.sessionToken}`;
    return Response.redirect(frontendUrl, 302);
  }),
});

// ---------------------------------------------------------------------------
// X (Twitter) OAuth 2.0 with PKCE
// ---------------------------------------------------------------------------
http.route({
  path: "/auth/x",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const clientId = process.env.X_CLIENT_ID;
    if (!clientId) {
      return new Response("X OAuth not configured", { status: 500 });
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await sha256Base64Url(codeVerifier);

    // Encrypt code_verifier into state parameter using SESSION_SECRET
    const sessionSecret = process.env.SESSION_SECRET || "dexthemes-secret";
    const state = btoa(JSON.stringify({ cv: codeVerifier, ts: Date.now() }));

    const redirectUri = process.env.CONVEX_SITE_URL + "/auth/x/callback";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "users.read tweet.read",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return Response.redirect(`https://x.com/i/oauth2/authorize?${params}`, 302);
  }),
});

http.route({
  path: "/auth/x/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return new Response("Missing code or state parameter", { status: 400 });
    }

    // Decode state to get code_verifier
    let codeVerifier: string;
    try {
      const decoded = JSON.parse(atob(state));
      codeVerifier = decoded.cv;
    } catch {
      return new Response("Invalid state parameter", { status: 400 });
    }

    const clientId = process.env.X_CLIENT_ID;
    const clientSecret = process.env.X_CLIENT_SECRET;
    const redirectUri = process.env.CONVEX_SITE_URL + "/auth/x/callback";

    // Exchange code for access token
    const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return new Response(`X OAuth error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
    }

    // Fetch user profile
    const profileRes = await fetch("https://api.x.com/2/users/me?user.fields=profile_image_url,name,username", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const profileData = await profileRes.json();
    const profile = profileData.data;

    // Create or update user
    const user = await ctx.runMutation(api.users.getOrCreateUser, {
      provider: "x",
      providerId: String(profile.id),
      username: profile.username || "",
      displayName: profile.name || profile.username || "",
      avatarUrl: profile.profile_image_url || "",
    });

    // Redirect back to frontend with session token
    const frontendUrl = `https://dexthemes.com/#auth=${user!.sessionToken}`;
    return Response.redirect(frontendUrl, 302);
  }),
});

// ---------------------------------------------------------------------------
// Auth: Get current user
// ---------------------------------------------------------------------------
http.route({
  path: "/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    const token = getSessionToken(request);
    if (!token) {
      return jsonResponse({ error: "No token" }, origin, 401);
    }

    const user = await ctx.runQuery(api.users.getUserBySession, {
      sessionToken: token,
    });
    if (!user) {
      return jsonResponse({ error: "Invalid or expired session" }, origin, 401);
    }

    return jsonResponse({ user }, origin);
  }),
});

// ---------------------------------------------------------------------------
// Auth: Logout
// ---------------------------------------------------------------------------
http.route({
  path: "/auth/logout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    const token = getSessionToken(request);
    if (token) {
      await ctx.runMutation(api.users.deleteSession, { sessionToken: token });
    }
    return jsonResponse({ success: true }, origin);
  }),
});

// ---------------------------------------------------------------------------
// Themes: List published community themes
// ---------------------------------------------------------------------------
http.route({
  path: "/themes",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    const themes = await ctx.runQuery(api.themes.listPublished, {});
    return jsonResponse(themes, origin);
  }),
});

// ---------------------------------------------------------------------------
// Themes: Submit a new theme
// ---------------------------------------------------------------------------
http.route({
  path: "/themes",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    const token = getSessionToken(request);
    if (!token) {
      return jsonResponse({ error: "Unauthorized" }, origin, 401);
    }

    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.themes.submit, {
        sessionToken: token,
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

// ---------------------------------------------------------------------------
// Themes: Flag a theme
// ---------------------------------------------------------------------------
http.route({
  path: "/themes/flag",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    const token = getSessionToken(request);
    if (!token) {
      return jsonResponse({ error: "Unauthorized" }, origin, 401);
    }

    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.flags.flagTheme, {
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

// ---------------------------------------------------------------------------
// Themes: Increment copy counter
// ---------------------------------------------------------------------------
http.route({
  path: "/themes/copy",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get("Origin");
    try {
      const body = await request.json();
      const result = await ctx.runMutation(api.themes.incrementCopies, {
        themeId: body.themeId,
      });
      return jsonResponse(result || { error: "Theme not found" }, origin, result ? 200 : 404);
    } catch (e: any) {
      return jsonResponse({ error: e.message }, origin, 400);
    }
  }),
});

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function sha256Base64Url(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default http;
