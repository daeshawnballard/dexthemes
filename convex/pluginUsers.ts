import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { grantUnlockForUser, syncOpenAIEmployeeUnlock } from "./unlocks";
import {
  DEEPSEEK_SESSION_SOURCE,
  markConnectedApp,
  markConnectedAppDisconnected,
} from "./connectedApps";
import {
  CONNECTED_APP_IDS,
  DEEPSEEK_HARNESS_USE_SCOPE,
} from "../shared/connected-apps-contract.js";

const INTERNAL_PLUGIN_SESSION_TTL_MS = 2 * 60 * 1000;
const DEEPSEEK_SESSION_TTL_MS = 60 * 60 * 1000;

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

const pluginIdentityArgs = {
  githubId: v.string(),
  username: v.string(),
  displayName: v.string(),
  avatarUrl: v.string(),
  isOpenAIEmployee: v.optional(v.boolean()),
};

async function upsertUser(ctx: any, args: any) {
  let user = await ctx.db
    .query("users")
    .withIndex("by_provider", (query: any) =>
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

  return user;
}

async function issuePluginSession(ctx: any, userId: any, options: {
  prefix: "dxp_" | "dxd_";
  scopes: string[];
  source: string;
  clientUsable: boolean;
  ttlMs: number;
}) {
  const pluginAuthToken = randomToken(options.prefix);
  const now = Date.now();
  const priorSessions = await ctx.db
    .query("pluginSessions")
    .withIndex("by_user", (query: any) => query.eq("userId", userId))
    .collect();
  for (const session of priorSessions) {
    if (
      session.expiresAt < now ||
      (options.clientUsable && session.clientUsable === true && session.source === options.source)
    ) {
      await ctx.db.delete(session._id);
    }
  }
  await ctx.db.insert("pluginSessions", {
    tokenHash: await sha256Hex(pluginAuthToken),
    userId,
    scopes: options.scopes,
    source: options.source,
    clientUsable: options.clientUsable,
    createdAt: now,
    expiresAt: now + options.ttlMs,
  });

  return {
    pluginAuthToken,
    expiresIn: Math.floor(options.ttlMs / 1000),
  };
}

export const upsertPluginUser = internalMutation({
  args: {
    ...pluginIdentityArgs,
    scope: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await upsertUser(ctx, args);
    const session = await issuePluginSession(ctx, user._id, {
      prefix: "dxp_",
      scopes: [args.scope || "themes:read"],
      source: "oauth_bridge",
      clientUsable: false,
      ttlMs: INTERNAL_PLUGIN_SESSION_TTL_MS,
    });
    return { ...session, userId: user._id };
  },
});

export const upsertDeepSeekDeviceUser = internalMutation({
  args: {
    ...pluginIdentityArgs,
    pluginVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await upsertUser(ctx, args);
    const session = await issuePluginSession(ctx, user._id, {
      prefix: "dxd_",
      scopes: ["themes:read", DEEPSEEK_HARNESS_USE_SCOPE],
      source: DEEPSEEK_SESSION_SOURCE,
      clientUsable: true,
      ttlMs: DEEPSEEK_SESSION_TTL_MS,
    });
    await markConnectedApp(
      ctx,
      user._id,
      CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
      args.pluginVersion,
    );
    await grantUnlockForUser(ctx, user._id, "use_deepseek_harness");
    return { ...session, userId: user._id };
  },
});

export const resolveClientPluginSession = internalQuery({
  args: {
    authToken: v.string(),
    requiredScope: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.authToken.startsWith("dxd_") || args.authToken.length > 256) return null;
    const tokenHash = await sha256Hex(args.authToken);
    const session = await ctx.db
      .query("pluginSessions")
      .withIndex("by_token_hash", (query) => query.eq("tokenHash", tokenHash))
      .first();
    if (
      !session ||
      session.clientUsable !== true ||
      session.expiresAt < Date.now() ||
      !session.scopes?.includes(args.requiredScope)
    ) {
      return null;
    }
    return {
      userId: session.userId,
      source: session.source || "unknown",
    };
  },
});

export const revokeClientPluginSession = internalMutation({
  args: { authToken: v.string() },
  handler: async (ctx, args) => {
    if (!args.authToken.startsWith("dxd_") || args.authToken.length > 256) return false;
    const tokenHash = await sha256Hex(args.authToken);
    const session = await ctx.db
      .query("pluginSessions")
      .withIndex("by_token_hash", (query) => query.eq("tokenHash", tokenHash))
      .first();
    if (!session || session.clientUsable !== true) return false;
    await ctx.db.delete(session._id);
    if (session.source === DEEPSEEK_SESSION_SOURCE) {
      const remainingSessions = await ctx.db
        .query("pluginSessions")
        .withIndex("by_user", (query) => query.eq("userId", session.userId))
        .collect();
      if (!remainingSessions.some((candidate) =>
        candidate.clientUsable === true && candidate.source === DEEPSEEK_SESSION_SOURCE
      )) {
        await markConnectedAppDisconnected(
          ctx,
          session.userId,
          CONNECTED_APP_IDS.DEEPSEEK_HARNESS,
        );
      }
    }
    return true;
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
