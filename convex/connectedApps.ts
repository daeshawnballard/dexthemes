import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  CONNECTED_APP_IDS,
  getConnectedAppDefinition,
  normalizeConnectedAppPluginVersion,
  projectConnectedAppRecord,
} from "../shared/connected-apps-contract.js";

export const DEEPSEEK_SESSION_SOURCE = "deepseek_github_device";

const SESSION_SOURCES_BY_INTEGRATION: Record<string, readonly string[]> = {
  [CONNECTED_APP_IDS.DEEPSEEK_HARNESS]: [DEEPSEEK_SESSION_SOURCE],
};

async function findConnectedApp(ctx: any, userId: Id<"users">, integrationId: string) {
  return await ctx.db
    .query("connectedApps")
    .withIndex("by_user_integration", (query: any) =>
      query.eq("userId", userId).eq("integrationId", integrationId),
    )
    .first();
}

function assertKnownIntegration(integrationId: string) {
  if (!getConnectedAppDefinition(integrationId)) {
    throw new Error("Unsupported connected app");
  }
}

export async function markConnectedApp(
  ctx: any,
  userId: Id<"users">,
  integrationId: string,
  pluginVersion?: string,
) {
  assertKnownIntegration(integrationId);
  const now = Date.now();
  const normalizedVersion = normalizeConnectedAppPluginVersion(pluginVersion);
  const existing = await findConnectedApp(ctx, userId, integrationId);
  if (existing) {
    await ctx.db.patch(existing._id, {
      pluginVersion: normalizedVersion,
      connectedAt: now,
      lastUsedAt: now,
      disconnectedAt: undefined,
      updatedAt: now,
    });
    return existing._id;
  }

  return await ctx.db.insert("connectedApps", {
    userId,
    integrationId,
    pluginVersion: normalizedVersion,
    connectedAt: now,
    lastUsedAt: now,
    usageCount: 0,
    updatedAt: now,
  });
}

export async function recordConnectedAppUse(
  ctx: any,
  userId: Id<"users">,
  integrationId: string,
  pluginVersion?: string,
) {
  assertKnownIntegration(integrationId);
  const now = Date.now();
  const normalizedVersion = normalizeConnectedAppPluginVersion(pluginVersion);
  const existing = await findConnectedApp(ctx, userId, integrationId);
  if (existing) {
    await ctx.db.patch(existing._id, {
      ...(normalizedVersion ? { pluginVersion: normalizedVersion } : {}),
      lastUsedAt: now,
      usageCount: Math.max(0, existing.usageCount || 0) + 1,
      disconnectedAt: undefined,
      updatedAt: now,
    });
    return existing._id;
  }

  return await ctx.db.insert("connectedApps", {
    userId,
    integrationId,
    pluginVersion: normalizedVersion,
    connectedAt: now,
    lastUsedAt: now,
    usageCount: 1,
    updatedAt: now,
  });
}

export async function markConnectedAppDisconnected(
  ctx: any,
  userId: Id<"users">,
  integrationId: string,
) {
  const existing = await findConnectedApp(ctx, userId, integrationId);
  if (!existing || existing.disconnectedAt) return false;
  const now = Date.now();
  await ctx.db.patch(existing._id, { disconnectedAt: now, updatedAt: now });
  return true;
}

export const getForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("connectedApps")
      .withIndex("by_user", (query) => query.eq("userId", args.userId))
      .collect();
    return records
      .map(projectConnectedAppRecord)
      .filter(Boolean)
      .sort((first: any, second: any) => second.lastUsedAt - first.lastUsedAt);
  },
});

export const disconnectForUser = internalMutation({
  args: {
    userId: v.id("users"),
    integrationId: v.string(),
  },
  handler: async (ctx, args) => {
    assertKnownIntegration(args.integrationId);
    const sources = new Set(SESSION_SOURCES_BY_INTEGRATION[args.integrationId] || []);
    const sessions = await ctx.db
      .query("pluginSessions")
      .withIndex("by_user", (query) => query.eq("userId", args.userId))
      .collect();
    let revokedSessions = 0;
    for (const session of sessions) {
      if (session.clientUsable === true && sources.has(session.source || "")) {
        await ctx.db.delete(session._id);
        revokedSessions += 1;
      }
    }
    const recordDisconnected = await markConnectedAppDisconnected(
      ctx,
      args.userId,
      args.integrationId,
    );
    return { disconnected: recordDisconnected || revokedSessions > 0 };
  },
});
