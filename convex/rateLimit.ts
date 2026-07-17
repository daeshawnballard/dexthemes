import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sliding-window rate limiter backed by the rateLimits table.
 * Each unique key (e.g. "agent-reg:127.0.0.1") gets one row.
 *
 * Returns { allowed: true } or { allowed: false, retryAfter: ms }.
 */
export const checkRateLimit = internalMutation({
  args: {
    key: v.string(),
    maxRequests: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!existing) {
      // First request — create entry
      await ctx.db.insert("rateLimits", {
        key: args.key,
        count: 1,
        windowStart: now,
        expiresAt: now + args.windowMs,
      });
      return { allowed: true };
    }

    const windowEnd = existing.windowStart + args.windowMs;

    if (now > windowEnd) {
      // Window expired — reset
      await ctx.db.patch(existing._id, {
        count: 1,
        windowStart: now,
        expiresAt: now + args.windowMs,
      });
      return { allowed: true };
    }

    if (existing.count >= args.maxRequests) {
      // Over limit
      return {
        allowed: false,
        retryAfter: windowEnd - now,
      };
    }

    // Increment count within window
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
    });
    return { allowed: true };
  },
});

export const cleanupExpiredRateLimits = internalMutation({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = Math.max(1, Math.min(args.limit, 1000));
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_expires", (q) => q.gt("expiresAt", 0).lt("expiresAt", now))
      .take(limit);
    for (const entry of expired) await ctx.db.delete(entry._id);
    const legacy = expired.length < limit
      ? await ctx.db
          .query("rateLimits")
          .withIndex("by_window_start", (q) => q.lt("windowStart", now - 25 * 60 * 60 * 1000))
          .take(limit - expired.length)
      : [];
    let legacyDeleted = 0;
    for (const entry of legacy) {
      if (entry.expiresAt != null) continue;
      await ctx.db.delete(entry._id);
      legacyDeleted += 1;
    }
    return { deleted: expired.length + legacyDeleted };
  },
});
