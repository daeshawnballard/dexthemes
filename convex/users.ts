import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { grantUnlockForUser, syncOpenAIEmployeeUnlock } from "./unlocks";

// Generate a cryptographically secure session token
function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// 30 days in milliseconds
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function generateApiKeyValue(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "dxt_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Find or create a user by provider + providerId.
 * Returns the user doc with a fresh session token.
 */
export const getOrCreateUser = internalMutation({
  args: {
    provider: v.string(),
    providerId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    isOpenAIEmployee: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Look for existing user
    const existing = await ctx.db
      .query("users")
      .withIndex("by_provider", (q) =>
        q.eq("provider", args.provider).eq("providerId", args.providerId)
      )
      .first();

    const sessionToken = generateSessionToken();
    const sessionExpiresAt = Date.now() + SESSION_DURATION;

    if (existing) {
      // Update profile info + refresh session
      const patch: Record<string, unknown> = {
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        sessionToken,
        sessionExpiresAt,
      };
      if (args.isOpenAIEmployee !== undefined) {
        patch.isOpenAIEmployee = args.isOpenAIEmployee;
      }
      await ctx.db.patch(existing._id, patch);
      await grantUnlockForUser(ctx, existing._id, "sign_in");
      if (args.isOpenAIEmployee !== undefined) {
        await syncOpenAIEmployeeUnlock(ctx, existing._id, args.isOpenAIEmployee);
      }
      return await ctx.db.get(existing._id);
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      provider: args.provider,
      providerId: args.providerId,
      username: args.username,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      sessionToken,
      sessionExpiresAt,
      isOpenAIEmployee: args.isOpenAIEmployee ?? false,
      createdAt: Date.now(),
    });

    await grantUnlockForUser(ctx, userId, "sign_in");
    if (args.isOpenAIEmployee) {
      await syncOpenAIEmployeeUnlock(ctx, userId, true);
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Look up a user by session token. Returns null if expired or not found.
 */
export const getUserBySession = internalQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!user) return null;
    if (user.sessionExpiresAt < Date.now()) return null;

    return {
      _id: user._id,
      provider: user.provider,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isOpenAIEmployee: user.isOpenAIEmployee ?? false,
    };
  },
});

/**
 * Generate an API key for the current user (for agent/CLI use).
 * Replaces any existing key.
 */
export const generateApiKey = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!user || user.sessionExpiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const apiKey = generateApiKeyValue();
    const apiKeyHash = await sha256Hex(apiKey);

    await ctx.db.patch(user._id, {
      apiKey: undefined,
      apiKeyHash,
      apiKeyPrefix: apiKey.slice(0, 12),
    });
    return { apiKey };
  },
});

/**
 * Revoke the current API key.
 */
export const revokeApiKey = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!user || user.sessionExpiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(user._id, {
      apiKey: undefined,
      apiKeyHash: undefined,
      apiKeyPrefix: undefined,
    });
    return { success: true };
  },
});

/**
 * Look up a user by API key. Returns null if not found.
 */
export const getUserByApiKey = internalQuery({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const apiKeyHash = await sha256Hex(args.apiKey);
    let user = await ctx.db
      .query("users")
      .withIndex("by_api_key_hash", (q) => q.eq("apiKeyHash", apiKeyHash))
      .first();

    if (!user) user = await ctx.db
      .query("users")
      .withIndex("by_api_key", (q) => q.eq("apiKey", args.apiKey))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      provider: user.provider,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isOpenAIEmployee: user.isOpenAIEmployee ?? false,
    };
  },
});

/** Issue an agent/CLI key only to an existing GitHub-authenticated user. */
export const generateAgentApiKey = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!user || user.sessionExpiresAt < Date.now() || user.provider !== "github") {
      throw new Error("GitHub sign-in required");
    }

    const apiKey = generateApiKeyValue();
    await ctx.db.patch(user._id, {
      apiKey: undefined,
      apiKeyHash: await sha256Hex(apiKey),
      apiKeyPrefix: apiKey.slice(0, 12),
    });
    await grantUnlockForUser(ctx, user._id, "agent_use");

    return { apiKey, agentId: `github:${user.providerId}` };
  },
});

/**
 * Clear a session (logout).
 */
export const deleteSession = internalMutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        sessionToken: "",
        sessionExpiresAt: 0,
      });
    }
  },
});
