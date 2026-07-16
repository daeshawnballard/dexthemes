import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { grantUnlockForUser, syncOpenAIEmployeeUnlock } from "./unlocks";

const PLUGIN_SESSION_TTL_MS = 2 * 60 * 1000;

function randomToken(prefix: string, byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const upsertPluginUser = internalMutation({
  args: {
    githubId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    isOpenAIEmployee: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_provider", (query) =>
        query.eq("provider", "github").eq("providerId", args.githubId),
      )
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        username: args.username || user.username,
        displayName: args.displayName || user.displayName,
        avatarUrl: args.avatarUrl || user.avatarUrl,
        ...(args.isOpenAIEmployee !== undefined
          ? { isOpenAIEmployee: args.isOpenAIEmployee }
          : {}),
      });
    } else {
      const userId = await ctx.db.insert("users", {
        provider: "github",
        providerId: args.githubId,
        username: args.username || `github-${args.githubId.slice(0, 12)}`,
        displayName: args.displayName || args.username || "DexThemes creator",
        avatarUrl: args.avatarUrl,
        sessionToken: randomToken("inactive_"),
        sessionExpiresAt: 0,
        isOpenAIEmployee: args.isOpenAIEmployee ?? false,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error("Unable to create plugin user");
    await grantUnlockForUser(ctx, user._id, "use_plugin");
    if (args.isOpenAIEmployee !== undefined) {
      await syncOpenAIEmployeeUnlock(ctx, user._id, args.isOpenAIEmployee);
    }

    const pluginAuthToken = randomToken("dxp_");
    const now = Date.now();
    const priorSessions = await ctx.db
      .query("pluginSessions")
      .withIndex("by_user", (query) => query.eq("userId", user._id))
      .collect();
    for (const session of priorSessions) {
      if (session.expiresAt < now) await ctx.db.delete(session._id);
    }
    await ctx.db.insert("pluginSessions", {
      tokenHash: await sha256Hex(pluginAuthToken),
      userId: user._id,
      createdAt: now,
      expiresAt: now + PLUGIN_SESSION_TTL_MS,
    });

    return { pluginAuthToken };
  },
});

export const cleanupExpiredPluginSessions = internalMutation({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const expired = await ctx.db
      .query("pluginSessions")
      .withIndex("by_expires", (query) => query.lt("expiresAt", Date.now()))
      .take(Math.max(1, Math.min(args.limit, 1000)));
    for (const session of expired) await ctx.db.delete(session._id);
    return { deleted: expired.length };
  },
});
