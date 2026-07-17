import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { grantUnlockForUser } from "./unlocks";
import { STATIC_THEME_CATALOG } from "../shared/theme-api-catalog.js";

const VISIBLE_STATIC_THEME_IDS = new Set(
  STATIC_THEME_CATALOG
    .filter((theme: any) => !theme._hiddenUntilUnlocked)
    .map((theme: any) => String(theme.id || theme.themeId)),
);

/**
 * Toggle a like on a theme. Returns the new liked state.
 */
export const toggleLike = internalMutation({
  args: {
    sessionToken: v.string(),
    themeId: v.string(), // kebab-case theme id
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!user || user.sessionExpiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.themeId) || args.themeId.length > 80) {
      throw new Error("Invalid theme ID");
    }
    if (!VISIBLE_STATIC_THEME_IDS.has(args.themeId)) {
      const communityTheme = await ctx.db
        .query("themes")
        .withIndex("by_themeId", (q) => q.eq("themeId", args.themeId))
        .first();
      if (!communityTheme || communityTheme.status !== "published") {
        throw new Error("Theme not found");
      }
    }

    // Check if already liked
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_theme", (q) =>
        q.eq("userId", user._id).eq("themeId", args.themeId)
      )
      .first();

    if (existing) {
      // Unlike
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    // Like
    await ctx.db.insert("likes", {
      userId: user._id,
      themeId: args.themeId,
      createdAt: Date.now(),
    });
    await grantUnlockForUser(ctx, user._id, "like_theme");
    return { liked: true };
  },
});

/**
 * Get all liked theme IDs for the signed-in user.
 */
export const getMyLikes = internalQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!user || user.sessionExpiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return likes.map((l) => l.themeId);
  },
});

/**
 * Get the like count for a specific theme.
 */
export const getLikeCount = internalQuery({
  args: { themeId: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_theme", (q) => q.eq("themeId", args.themeId))
      .collect();
    return { count: likes.length };
  },
});

/**
 * Get like counts for all themes in a single scan.
 * Returns { [themeId]: count }.
 */
export const getAllLikeCounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allLikes = await ctx.db.query("likes").collect();
    const counts: Record<string, number> = {};
    for (const like of allLikes) {
      counts[like.themeId] = (counts[like.themeId] || 0) + 1;
    }
    return counts;
  },
});
