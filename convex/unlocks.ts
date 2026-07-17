import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getUserByAuthToken } from "./auth";
import {
  hasCompletedInteractionActivities,
  REQUIRED_INTERACTION_ACTIVITIES,
  SECRET_INTERACTION_UNLOCK_ACTION,
} from "./interaction_unlocking";
import type { Id } from "./_generated/dataModel";
import {
  currentPopularityPeriod,
  meetsPopularityThreshold,
  previousClosedPopularityPeriod,
  rankPopularityEntries,
} from "../shared/popularity-periods.js";

const SUPPORTER_ACTION = "buy_coffee";
const isActiveUnlock = (unlock: { revokedAt?: number }) => !unlock.revokedAt;

// Maps action strings to the unlockable theme they grant
export const UNLOCK_MAP: Record<string, { themeId: string; themeName: string }> = {
  buy_coffee: { themeId: "patron", themeName: "Patron" },
  create_theme: { themeId: "seraphim", themeName: "Seraphim" },
  share_x: { themeId: "mint-condition", themeName: "Mint Condition" },
  sign_in: { themeId: "cupids-code", themeName: "Cupid's Code" },
  like_theme: { themeId: "heartbeat", themeName: "Heartbeat" },
  top10_monthly: { themeId: "summit", themeName: "Summit" },
  use_api: { themeId: "the-builder", themeName: "The Builder" },
  color_me_lucky: { themeId: "kaleidoscope", themeName: "Kaleidoscope" },
  agent_use: { themeId: "agent-claw", themeName: "Agent Claw" },
  install_pwa: { themeId: "homebase", themeName: "Homebase" },
  complete_pair: { themeId: "yin-yang", themeName: "Yin & Yang" },
  use_plugin: { themeId: "plugged-in", themeName: "Plugged In" },
  create_theme_with_plugin: { themeId: "voiceprint", themeName: "Voiceprint" },
  openai_employee: { themeId: "builder-of-agi", themeName: "Human Spark" },
  theme_of_day: { themeId: "golden-hour", themeName: "Golden Hour" },
  theme_of_week: { themeId: "headliner", themeName: "Headliner" },
  [SECRET_INTERACTION_UNLOCK_ACTION]: { themeId: "triple-dot", themeName: "Easter Egg" },
};

const VALID_ACTIONS = Object.keys(UNLOCK_MAP);

export async function grantUnlockForUser(
  ctx: any,
  userId: Id<"users">,
  action: string,
) {
  if (!VALID_ACTIONS.includes(action)) {
    throw new Error(`Invalid action: ${action}`);
  }

  const mapping = UNLOCK_MAP[action];
  const existing = await ctx.db
    .query("unlocks")
    .withIndex("by_user_action", (q: any) =>
      q.eq("userId", userId).eq("action", action),
    )
    .collect();

  if (existing.some(isActiveUnlock)) {
    return { unlocked: false, alreadyUnlocked: true };
  }

  await ctx.db.insert("unlocks", {
    userId,
    action,
    themeId: mapping.themeId,
    unlockedAt: Date.now(),
  });

  return { unlocked: true, themeId: mapping.themeId, themeName: mapping.themeName };
}

export async function syncOpenAIEmployeeUnlock(
  ctx: any,
  userId: Id<"users">,
  isOpenAIEmployee: boolean,
) {
  if (isOpenAIEmployee) {
    return grantUnlockForUser(ctx, userId, "openai_employee");
  }

  const existing = await ctx.db
    .query("unlocks")
    .withIndex("by_user_action", (q: any) =>
      q.eq("userId", userId).eq("action", "openai_employee"),
    )
    .collect();

  const now = Date.now();
  for (const unlock of existing.filter(isActiveUnlock)) {
    await ctx.db.patch(unlock._id, {
      revokedAt: now,
      revokedReason: "Verified OpenAI email is no longer present",
    });
  }

  return { unlocked: false, revoked: true };
}

/**
 * Grant an unlock for a specific action.
 * Returns { unlocked: true, themeId, themeName } on success,
 * or { unlocked: false, alreadyUnlocked: true } if already granted.
 */
export const grantUnlock = internalMutation({
  args: {
    authToken: v.string(),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate action
    if (!VALID_ACTIONS.includes(args.action)) {
      throw new Error(`Invalid action: ${args.action}`);
    }

    return grantUnlockForUser(ctx, user._id, args.action);
  },
});

/**
 * Grant the API achievement only after the authenticated API demo endpoint is
 * called. Keeping this separate from the generic grant route prevents clients
 * from claiming server-verifiable achievements by naming an action.
 */
export const completeApiDemo = internalMutation({
  args: { authToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    return grantUnlockForUser(ctx, user._id, "use_api");
  },
});

/**
 * Return all unlock records for the authenticated user.
 */
export const getMyUnlocks = internalQuery({
  args: { authToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const unlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return unlocks.filter(isActiveUnlock);
  },
});

async function loadPopularityActivity(ctx: any, start: number, end: number) {
  return Promise.all([
    ctx.db
      .query("themeCopyEvents")
      .withIndex("by_created_at", (q: any) => q.gte("createdAt", start).lt("createdAt", end))
      .collect(),
    ctx.db
      .query("qualifiedThemeAdoptions")
      .withIndex("by_created_at", (q: any) => q.gte("createdAt", start).lt("createdAt", end))
      .collect(),
    ctx.db
      .query("likes")
      .withIndex("by_created_at", (q: any) => q.gte("createdAt", start).lt("createdAt", end))
      .collect(),
  ]);
}

async function finalizePopularityPeriod(ctx: any, periodType: "daily" | "weekly", now: number) {
  const period = previousClosedPopularityPeriod(periodType, now);
  const existing = await ctx.db
    .query("popularityPeriodFinalizations")
    .withIndex("by_period", (q: any) =>
      q.eq("periodType", periodType).eq("periodStart", period.start),
    )
    .first();
  if (existing) return { finalized: false, alreadyFinalized: true, status: existing.status };

  const themes = await ctx.db
    .query("themes")
    .withIndex("by_status", (q: any) => q.eq("status", "published"))
    .collect();
  const [copyEvents, qualifiedAdoptions, likes] = await loadPopularityActivity(
    ctx,
    period.start,
    period.end,
  );
  const [candidate] = rankPopularityEntries({
    themes,
    copyEvents,
    qualifiedAdoptions,
    likes,
    start: period.start,
    end: period.end,
    limit: 1,
  });
  const winner = candidate
    ? themes.find((theme: any) => theme.themeId === candidate.themeId)
    : null;
  const awarded = Boolean(winner && meetsPopularityThreshold(candidate, periodType));

  await ctx.db.insert("popularityPeriodFinalizations", {
    periodType,
    periodStart: period.start,
    periodEnd: period.end,
    status: awarded ? "awarded" : "no_winner",
    ...(awarded ? {
      winnerThemeId: winner.themeId,
      winnerThemeName: winner.name,
      winnerUserId: winner.authorId,
    } : {}),
    copies: candidate?.copies ?? 0,
    qualifiedAdoptions: candidate?.qualifiedAdoptions ?? 0,
    likes: candidate?.likes ?? 0,
    createdAt: now,
  });

  if (!awarded) {
    return { finalized: true, status: "no_winner" };
  }

  const action = periodType === "daily" ? "theme_of_day" : "theme_of_week";
  const unlock = await grantUnlockForUser(ctx, winner.authorId, action);
  return {
    finalized: true,
    status: "awarded",
    periodType,
    themeId: winner.themeId,
    unlock,
  };
}

async function finalizeMonthlyTop10(ctx: any, now: number) {
  const periodType = "monthly" as const;
  const period = previousClosedPopularityPeriod(periodType, now);
  const existing = await ctx.db
    .query("popularityPeriodFinalizations")
    .withIndex("by_period", (q: any) =>
      q.eq("periodType", periodType).eq("periodStart", period.start),
    )
    .first();
  if (existing) return { finalized: false, alreadyFinalized: true, status: existing.status };

  const themes = await ctx.db
    .query("themes")
    .withIndex("by_status", (q: any) => q.eq("status", "published"))
    .collect();
  const [copyEvents, qualifiedAdoptions, likes] = await loadPopularityActivity(
    ctx,
    period.start,
    period.end,
  );
  const ranked = rankPopularityEntries({
    themes,
    copyEvents,
    qualifiedAdoptions,
    likes,
    start: period.start,
    end: period.end,
    limit: 10,
  }).filter((entry) => meetsPopularityThreshold(entry, periodType));
  const themeById = new Map(themes.map((theme: any) => [theme.themeId, theme]));
  const winners = ranked.flatMap((entry, index) => {
    const theme = themeById.get(entry.themeId) as any;
    return theme ? [{
      rank: index + 1,
      themeId: theme.themeId,
      themeName: theme.name,
      userId: theme.authorId,
      copies: entry.copies,
      qualifiedAdoptions: entry.qualifiedAdoptions,
      likes: entry.likes,
    }] : [];
  });
  const leader = winners[0];

  await ctx.db.insert("popularityPeriodFinalizations", {
    periodType,
    periodStart: period.start,
    periodEnd: period.end,
    status: winners.length ? "awarded" : "no_winner",
    ...(leader ? {
      winnerThemeId: leader.themeId,
      winnerThemeName: leader.themeName,
      winnerUserId: leader.userId,
    } : {}),
    copies: leader?.copies ?? 0,
    qualifiedAdoptions: leader?.qualifiedAdoptions ?? 0,
    likes: leader?.likes ?? 0,
    winners,
    createdAt: now,
  });

  const unlocks = [];
  for (const winner of winners) {
    unlocks.push({
      themeId: winner.themeId,
      userId: winner.userId,
      unlock: await grantUnlockForUser(ctx, winner.userId, "top10_monthly"),
    });
  }
  return {
    finalized: true,
    status: winners.length ? "awarded" : "no_winner",
    periodType,
    winners,
    unlocks,
  };
}

/**
 * Close the previous UTC day, Monday-through-Sunday UTC week, and UTC month.
 * Each period is persisted exactly once. Repeat daily and weekly winners keep
 * every win in their stats, while grantUnlockForUser keeps every achievement
 * and reward theme one-time. Monthly Summit grants come only from the final
 * closed Top 10, never from a mutable live-month rank.
 */
export const finalizePopularityWinners = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return {
      daily: await finalizePopularityPeriod(ctx, "daily", now),
      weekly: await finalizePopularityPeriod(ctx, "weekly", now),
      monthly: await finalizeMonthlyTop10(ctx, now),
    };
  },
});

/**
 * Public leaderboard: current UTC day, week, month, and all-time rankings.
 */
export const getLeaderboard = internalQuery({
  args: {},
  handler: async (ctx) => {
    const allThemes = await ctx.db
      .query("themes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const allLikes = await ctx.db.query("likes").collect();
    const likeCounts: Record<string, number> = {};
    for (const like of allLikes) {
      likeCounts[like.themeId] = (likeCounts[like.themeId] || 0) + 1;
    }

    const now = Date.now();
    const dailyPeriod = currentPopularityPeriod("daily", now);
    const weeklyPeriod = currentPopularityPeriod("weekly", now);
    const [copyEvents, qualifiedAdoptions, periodLikes] = await loadPopularityActivity(
      ctx,
      weeklyPeriod.start,
      weeklyPeriod.end,
    );
    const dailyRanked = rankPopularityEntries({
      themes: allThemes,
      copyEvents,
      qualifiedAdoptions,
      likes: periodLikes,
      start: dailyPeriod.start,
      end: dailyPeriod.end,
      limit: 10,
    });
    const weeklyRanked = rankPopularityEntries({
      themes: allThemes,
      copyEvents,
      qualifiedAdoptions,
      likes: periodLikes,
      start: weeklyPeriod.start,
      end: weeklyPeriod.end,
      limit: 10,
    });

    const supporterUnlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_action", (q) => q.eq("action", SUPPORTER_ACTION))
      .collect();
    const supporterUserIds = new Set(
      supporterUnlocks.filter(isActiveUnlock).map((unlock) => String(unlock.userId)),
    );
    const leaderboardAuthorIds = [...new Set(allThemes.map((theme) => String(theme.authorId)))];
    const leaderboardAuthors = new Map(
      await Promise.all(
        leaderboardAuthorIds.map(async (authorId) => {
          const match = allThemes.find((theme) => String(theme.authorId) === authorId);
          if (!match) return [authorId, null] as const;
          const user = await ctx.db.get(match.authorId);
          return [authorId, user] as const;
        }),
      ),
    );
    const themeById = new Map(allThemes.map((theme) => [theme.themeId, theme]));
    const baseEntry = (theme: any) => {
      const author = leaderboardAuthors.get(String(theme.authorId));
      return {
        themeId: theme.themeId,
        name: theme.name,
        summary: theme.summary,
        authorId: theme.authorId,
        authorName: theme.authorName,
        authorAvatarUrl: author?.avatarUrl || "",
        authorIsSupporter: supporterUserIds.has(String(theme.authorId)),
        authorIsAgent: author?.provider === "agent",
        dark: theme.dark ?? null,
        light: theme.light ?? null,
        accents: theme.accents || [],
      };
    };
    const periodEntries = (ranked: any[], period: any) => ranked.flatMap((entry) => {
      const theme = themeById.get(entry.themeId);
      return theme ? [{
        ...baseEntry(theme),
        copies: entry.copies,
        rawCopies: entry.copies,
        qualifiedAdoptions: entry.qualifiedAdoptions,
        likes: entry.likes,
        rankingMetric: "qualifiedAdoptions",
        periodStart: period.start,
        periodEnd: period.end,
      }] : [];
    });

    const allTime = [...allThemes]
      .sort((a, b) => b.copies - a.copies || a.createdAt - b.createdAt)
      .slice(0, 10)
      .map((theme) => ({
        ...baseEntry(theme),
        copies: theme.copies,
        likes: likeCounts[theme.themeId] || 0,
        rankingMetric: "copies",
      }));
    const date = new Date(now);
    const monthStart = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    const monthly = [...allThemes]
      .filter((theme) => theme.periodQualifiedStart != null && theme.periodQualifiedStart >= monthStart)
      .sort((a, b) =>
        (b.periodQualifiedCopies ?? 0) - (a.periodQualifiedCopies ?? 0) ||
        (b.periodCopies ?? 0) - (a.periodCopies ?? 0) ||
        a.createdAt - b.createdAt,
      )
      .slice(0, 10)
      .map((theme) => ({
        ...baseEntry(theme),
        copies: theme.periodQualifiedCopies ?? 0,
        rawCopies: theme.periodCopies ?? 0,
        qualifiedAdoptions: theme.periodQualifiedCopies ?? 0,
        likes: likeCounts[theme.themeId] || 0,
        rankingMetric: "qualifiedAdoptions",
        periodStart: monthStart,
      }));

    return {
      daily: periodEntries(dailyRanked, dailyPeriod),
      weekly: periodEntries(weeklyRanked, weeklyPeriod),
      monthly,
      allTime,
      periods: {
        daily: dailyPeriod,
        weekly: weeklyPeriod,
        monthly: { start: monthStart },
      },
    };
  },
});

export const getPublicSupporters = internalQuery({
  args: {},
  handler: async (ctx) => {
    const supporterUnlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_action", (q) => q.eq("action", SUPPORTER_ACTION))
      .collect();

    const byUserId = new Map<string, { userId: string; unlockedAt: number }>();
    for (const unlock of supporterUnlocks.filter(isActiveUnlock)) {
      const key = String(unlock.userId);
      const existing = byUserId.get(key);
      if (!existing || unlock.unlockedAt < existing.unlockedAt) {
        byUserId.set(key, { userId: key, unlockedAt: unlock.unlockedAt });
      }
    }

    const supporters = await Promise.all(
      [...byUserId.values()]
        .sort((a, b) => a.unlockedAt - b.unlockedAt)
        .map(async ({ userId, unlockedAt }) => {
          const unlock = supporterUnlocks.find((entry) => String(entry.userId) === userId && isActiveUnlock(entry));
          if (!unlock) return null;
          const user = await ctx.db.get(unlock.userId);
          if (!user || user.provider === "agent" || user.supporterPublicListing !== true) return null;
          return {
            userId,
            displayName: user.displayName,
            username: user.username,
            avatarUrl: user.avatarUrl,
            unlockedAt,
          };
        }),
    );

    return supporters.filter((supporter): supporter is NonNullable<typeof supporter> => Boolean(supporter));
  },
});

export const recordUserActivity = internalMutation({
  args: {
    authToken: v.string(),
    activity: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!REQUIRED_INTERACTION_ACTIVITIES.includes(args.activity)) {
      throw new Error(`Invalid activity: ${args.activity}`);
    }

    const existingActivity = await ctx.db
      .query("userActivities")
      .withIndex("by_user_activity", (q) =>
        q.eq("userId", user._id).eq("activity", args.activity),
      )
      .unique();

    if (!existingActivity) {
      await ctx.db.insert("userActivities", {
        userId: user._id,
        activity: args.activity,
        firstSeenAt: Date.now(),
      });
    }

    const activityRecords = await ctx.db
      .query("userActivities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const completedActivities = activityRecords.map((record) => record.activity);
    const completed = hasCompletedInteractionActivities(completedActivities);
    if (!completed) {
      return {
        recorded: true,
        unlocked: false,
        completedActivities,
      };
    }

    const existingUnlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_user_action", (q) =>
        q.eq("userId", user._id).eq("action", SECRET_INTERACTION_UNLOCK_ACTION),
      )
      .collect();

    if (existingUnlocks.some(isActiveUnlock)) {
      return {
        recorded: true,
        unlocked: false,
        alreadyUnlocked: true,
        completedActivities,
      };
    }

    const mapping = UNLOCK_MAP[SECRET_INTERACTION_UNLOCK_ACTION];
    await ctx.db.insert("unlocks", {
      userId: user._id,
      action: SECRET_INTERACTION_UNLOCK_ACTION,
      themeId: mapping.themeId,
      unlockedAt: Date.now(),
    });

    return {
      recorded: true,
      unlocked: true,
      action: SECRET_INTERACTION_UNLOCK_ACTION,
      themeId: mapping.themeId,
      themeName: mapping.themeName,
      completedActivities,
    };
  },
});
