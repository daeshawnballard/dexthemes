import type { MutationCtx, QueryCtx } from "./_generated/server";

type AuthCtx = MutationCtx | QueryCtx;

function isApiKey(token: string): boolean {
  return token.startsWith("dxt_");
}

function isPluginSession(token: string): boolean {
  return token.startsWith("dxp_");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function getUserByAuthToken(ctx: AuthCtx, token: string) {
  if (isPluginSession(token)) {
    const tokenHash = await sha256Hex(token);
    const session = await ctx.db
      .query("pluginSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    return await ctx.db.get(session.userId);
  }

  if (isApiKey(token)) {
    const apiKeyHash = await sha256Hex(token);
    const hashedUser = await ctx.db
      .query("users")
      .withIndex("by_api_key_hash", (q) => q.eq("apiKeyHash", apiKeyHash))
      .first();
    if (hashedUser) return hashedUser;

    // Temporary compatibility path for keys issued before hash-at-rest.
    return await ctx.db
      .query("users")
      .withIndex("by_api_key", (q) => q.eq("apiKey", token))
      .first();
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_session", (q) => q.eq("sessionToken", token))
    .first();

  if (!user || user.sessionExpiresAt < Date.now()) {
    return null;
  }

  return user;
}
