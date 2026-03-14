import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a random session token (UUID-like)
function generateSessionToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// 30 days in milliseconds
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Find or create a user by provider + providerId.
 * Returns the user doc with a fresh session token.
 */
export const getOrCreateUser = mutation({
  args: {
    provider: v.string(),
    providerId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
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
      await ctx.db.patch(existing._id, {
        username: args.username,
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
        sessionToken,
        sessionExpiresAt,
      });
      return { ...existing, sessionToken, sessionExpiresAt };
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
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Look up a user by session token. Returns null if expired or not found.
 */
export const getUserBySession = query({
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
    };
  },
});

/**
 * Clear a session (logout).
 */
export const deleteSession = mutation({
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
