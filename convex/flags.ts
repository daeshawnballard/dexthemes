import { mutation } from "./_generated/server";
import { v } from "convex/values";

const FLAG_THRESHOLD = 5; // Auto-remove after this many flags

/**
 * Flag a community theme. One flag per user per theme.
 * If flagCount reaches threshold, status is set to "removed".
 */
export const flagTheme = mutation({
  args: {
    sessionToken: v.string(),
    themeId: v.id("themes"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authenticate
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!user || user.sessionExpiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    // Check theme exists
    const theme = await ctx.db.get(args.themeId);
    if (!theme) {
      throw new Error("Theme not found");
    }

    // Check if already flagged by this user
    const existingFlag = await ctx.db
      .query("flags")
      .withIndex("by_theme_user", (q) =>
        q.eq("themeId", args.themeId).eq("userId", user._id)
      )
      .first();
    if (existingFlag) {
      throw new Error("Already flagged");
    }

    // Insert flag
    await ctx.db.insert("flags", {
      themeId: args.themeId,
      userId: user._id,
      reason: args.reason,
      createdAt: Date.now(),
    });

    // Increment flag count
    const newFlagCount = theme.flagCount + 1;
    const updates: any = { flagCount: newFlagCount };

    // Auto-remove if threshold reached
    if (newFlagCount >= FLAG_THRESHOLD) {
      updates.status = "removed";
    }

    await ctx.db.patch(args.themeId, updates);

    return { flagCount: newFlagCount, removed: newFlagCount >= FLAG_THRESHOLD };
  },
});
