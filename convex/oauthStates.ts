import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createOauthState = internalMutation({
  args: {
    nonce: v.string(),
    provider: v.string(),
    origin: v.string(),
    codeVerifier: v.optional(v.string()),
    bindingHash: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("oauthStates", {
      nonce: args.nonce,
      provider: args.provider,
      origin: args.origin,
      codeVerifier: args.codeVerifier,
      bindingHash: args.bindingHash,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });

    return { nonce: args.nonce };
  },
});

export const consumeOauthState = internalMutation({
  args: {
    nonce: v.string(),
    provider: v.string(),
    bindingHash: v.string(),
  },
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("oauthStates")
      .withIndex("by_nonce", (q) => q.eq("nonce", args.nonce))
      .first();

    if (!state) return null;

    if (state.provider !== args.provider) return null;
    if (state.expiresAt < Date.now()) {
      await ctx.db.delete(state._id);
      return null;
    }
    if (state.bindingHash !== args.bindingHash) return null;

    await ctx.db.delete(state._id);

    return {
      origin: state.origin,
      codeVerifier: state.codeVerifier,
      expiresAt: state.expiresAt,
    };
  },
});

export const cleanupExpiredOauthStates = internalMutation({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const expired = await ctx.db
      .query("oauthStates")
      .withIndex("by_expires", (q) => q.lt("expiresAt", Date.now()))
      .take(Math.max(1, Math.min(args.limit, 500)));
    await Promise.all(expired.map((state) => ctx.db.delete(state._id)));
    return { deleted: expired.length };
  },
});
