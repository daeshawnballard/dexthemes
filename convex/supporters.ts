import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserByAuthToken } from "./auth";
import {
  findReusablePendingClaim,
  findRevocableSupportClaim,
  getExpiredPendingClaimIds,
  isActiveSupporterUnlock,
} from "./supporter_matching.js";

const SUPPORTER_ACTION = "buy_coffee";
const SUPPORTER_THEME_ID = "patron";
const CLAIM_TTL_MS = 48 * 60 * 60 * 1000;

async function getSupporterUnlocksForUser(ctx: any, userId: any) {
  return await ctx.db
    .query("unlocks")
    .withIndex("by_user_action", (q: any) => q.eq("userId", userId).eq("action", SUPPORTER_ACTION))
    .collect();
}

function generateClaimToken(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return "dxtsup_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const createSupporterClaim = internalMutation({
  args: { authToken: v.string(), publicListing: v.boolean() },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }
    if (user.supporterPublicListing !== args.publicListing) {
      await ctx.db.patch(user._id, { supporterPublicListing: args.publicListing });
    }

    const existingUnlocks = await getSupporterUnlocksForUser(ctx, user._id);
    const activeUnlock = existingUnlocks.find(isActiveSupporterUnlock);

    if (activeUnlock) {
      return { alreadySupporter: true, publicListing: args.publicListing };
    }

    const now = Date.now();
    const existingClaims = await ctx.db
      .query("supporterClaims")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const expiredClaimId of getExpiredPendingClaimIds(existingClaims, now)) {
      await ctx.db.patch(expiredClaimId, { status: "expired" });
    }

    const reusable = findReusablePendingClaim(existingClaims, now);
    if (reusable) {
      if (reusable.publicListing !== args.publicListing) {
        await ctx.db.patch(reusable._id, { publicListing: args.publicListing });
      }
      return {
        token: reusable.token,
        expiresAt: reusable.expiresAt,
        publicListing: args.publicListing,
        alreadySupporter: false,
      };
    }

    const token = generateClaimToken();
    const expiresAt = now + CLAIM_TTL_MS;
    await ctx.db.insert("supporterClaims", {
      userId: user._id,
      token,
      status: "pending",
      createdAt: now,
      expiresAt,
      publicListing: args.publicListing,
    });

    return { token, expiresAt, publicListing: args.publicListing, alreadySupporter: false };
  },
});

export const claimSupportFromWebhook = internalMutation({
  args: {
    token: v.string(),
    sourceEvent: v.optional(v.string()),
    supportId: v.optional(v.string()),
    supporterName: v.optional(v.string()),
    supporterEmail: v.optional(v.string()),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db
      .query("supporterClaims")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!claim) {
      return { matched: false, unlocked: false, reason: "claim_not_found" };
    }

    if (claim.status === "claimed" && !claim.revokedAt) {
      return { matched: true, unlocked: false, reason: "already_claimed" };
    }

    if (claim.expiresAt <= Date.now()) {
      await ctx.db.patch(claim._id, { status: "expired" });
      return { matched: false, unlocked: false, reason: "claim_expired" };
    }

    await ctx.db.patch(claim._id, {
      status: "claimed",
      claimedAt: Date.now(),
      sourceEvent: args.sourceEvent,
      supportId: args.supportId,
      supporterName: args.supporterName,
      supporterEmail: args.supporterEmail,
      amount: args.amount,
      currency: args.currency,
    });

    const existingUnlocks = await getSupporterUnlocksForUser(ctx, claim.userId);
    const activeUnlock = existingUnlocks.find(isActiveSupporterUnlock);

    if (activeUnlock) {
      return { matched: true, unlocked: false, reason: "already_supporter" };
    }

    await ctx.db.insert("unlocks", {
      userId: claim.userId,
      action: SUPPORTER_ACTION,
      themeId: SUPPORTER_THEME_ID,
      unlockedAt: Date.now(),
    });

    return { matched: true, unlocked: true, reason: "supporter_unlocked" };
  },
});

export const revokeSupportFromWebhook = internalMutation({
  args: {
    supportId: v.string(),
    sourceEvent: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const claim = findRevocableSupportClaim(
      await ctx.db.query("supporterClaims").collect(),
      args.supportId,
    );

    if (!claim) {
      return { matched: false, revoked: false, reason: "claim_not_found" };
    }

    const revokedAt = Date.now();
    await ctx.db.patch(claim._id, {
      status: "revoked",
      revokedAt,
      revokedByEvent: args.sourceEvent,
      revokedReason: args.reason,
    });

    const supporterUnlocks = await getSupporterUnlocksForUser(ctx, claim.userId);
    const activeUnlocks = supporterUnlocks.filter(isActiveSupporterUnlock);

    await Promise.all(activeUnlocks.map((unlock) => ctx.db.patch(unlock._id, {
      revokedAt,
      revokedBySupportId: args.supportId,
      revokedReason: args.reason,
    })));

    return {
      matched: true,
      revoked: activeUnlocks.length > 0,
      reason: activeUnlocks.length > 0 ? "supporter_revoked" : "supporter_already_revoked",
    };
  },
});
