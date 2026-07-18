import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { moderateText } from "./moderation";
import { checkThemeProtection, isProtectedThemeId } from "./protectedThemes";
import { getUserByAuthToken } from "./auth";
import { grantUnlockForUser } from "./unlocks";
import {
  currentPopularityPeriod,
  rankPopularityEntries,
} from "../shared/popularity-periods.js";
import { evaluatePublicThemeIdentity } from "../shared/plugin-public-policy.js";

const isActiveUnlock = (unlock: { revokedAt?: number }) => !unlock.revokedAt;
const HEX_COLOR = /^#[A-Fa-f0-9]{6}$/;
const THEME_COLOR_KEYS = [
  "surface",
  "ink",
  "accent",
  "diffAdded",
  "diffRemoved",
  "skill",
  "sidebar",
  "codeBg",
] as const;

function assertValidVariantColors(variant: any, label: string) {
  if (!variant) return;
  for (const key of THEME_COLOR_KEYS) {
    if (variant[key] == null) continue;
    if (!HEX_COLOR.test(variant[key])) {
      throw new Error(`Invalid hex color for ${label}.${key}: ${variant[key]}`);
    }
  }
  if (!Number.isFinite(variant.contrast) || variant.contrast < 0 || variant.contrast > 100) {
    throw new Error(`Contrast must be 0-100 for ${label}`);
  }
}

function currentMonthStart() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function incrementThemeCopyCounters(ctx: any, themeId: string) {
  const theme = await ctx.db
    .query("themes")
    .withIndex("by_themeId", (q: any) => q.eq("themeId", themeId))
    .first();
  if (!theme) return null;

  const monthStart = currentMonthStart();

  let newPeriodCopies: number;
  let newPeriodStart: number;
  if (theme.periodStart == null || theme.periodStart < monthStart) {
    newPeriodCopies = 1;
    newPeriodStart = monthStart;
  } else {
    newPeriodCopies = (theme.periodCopies ?? 0) + 1;
    newPeriodStart = theme.periodStart;
  }

  await ctx.db.patch(theme._id, {
    copies: theme.copies + 1,
    periodCopies: newPeriodCopies,
    periodStart: newPeriodStart,
  });
  return { copies: theme.copies + 1 };
}

async function registerQualifiedAdoption(ctx: any, theme: any, userId?: any) {
  if (!userId || String(theme.authorId) === String(userId) || theme.status !== "published") return false;
  const periodStart = currentMonthStart();
  const existing = await ctx.db
    .query("qualifiedThemeAdoptions")
    .withIndex("by_theme_period_user", (q: any) =>
      q.eq("themeId", theme.themeId).eq("periodStart", periodStart).eq("userId", userId)
    )
    .first();
  if (existing) return false;

  await ctx.db.insert("qualifiedThemeAdoptions", {
    themeId: theme.themeId,
    userId,
    periodStart,
    createdAt: Date.now(),
  });
  const nextCount = theme.periodQualifiedStart === periodStart
    ? (theme.periodQualifiedCopies ?? 0) + 1
    : 1;
  await ctx.db.patch(theme._id, {
    periodQualifiedCopies: nextCount,
    periodQualifiedStart: periodStart,
  });
  return true;
}

const variantValidator = v.object({
  surface: v.string(),
  ink: v.string(),
  accent: v.string(),
  contrast: v.number(),
  diffAdded: v.string(),
  diffRemoved: v.string(),
  skill: v.string(),
  sidebar: v.optional(v.string()),
  codeBg: v.optional(v.string()),
});

/**
 * List all published community themes, newest first.
 */
export const listPublished = internalQuery({
  args: {},
  handler: async (ctx) => {
    const themes = await ctx.db
      .query("themes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    const supporterUnlocks = await ctx.db
      .query("unlocks")
      .withIndex("by_action", (q) => q.eq("action", "buy_coffee"))
      .collect();
    const supporterUserIds = new Set(
      supporterUnlocks.filter(isActiveUnlock).map((unlock) => String(unlock.userId)),
    );

    const authorIds = [...new Set(themes.map((theme) => String(theme.authorId)))];
    const authorMap = new Map(
      await Promise.all(
        authorIds.map(async (authorId) => {
          const match = themes.find((theme) => String(theme.authorId) === authorId);
          if (!match) return [authorId, null] as const;
          const user = await ctx.db.get(match.authorId);
          return [authorId, user] as const;
        }),
      ),
    );

    return themes.map((theme) => {
      const author = authorMap.get(String(theme.authorId));
      return {
        ...theme,
        authorAvatarUrl: author?.avatarUrl || "",
        authorIsSupporter: supporterUserIds.has(String(theme.authorId)),
        authorIsAgent: author?.provider === "agent",
      };
    });
  },
});

/**
 * Submit a new community theme.
 */
export const submit = internalMutation({
  args: {
    authToken: v.string(),
    themeId: v.string(),
    name: v.string(),
    summary: v.string(),
    dark: v.optional(variantValidator),
    light: v.optional(variantValidator),
    accents: v.array(v.string()),
    codeThemeId: v.union(
      v.string(),
      v.object({ dark: v.string(), light: v.string() }),
    ),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authenticate
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate at least one variant
    if (!args.dark && !args.light) {
      throw new Error("At least one variant (dark or light) is required");
    }

    // Validate themeId format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.themeId)) {
      throw new Error("Theme ID must be kebab-case (lowercase letters, numbers, hyphens)");
    }
    if (args.themeId.length > 64) {
      throw new Error("Theme ID must be 64 characters or fewer");
    }
    if (isProtectedThemeId(args.themeId)) {
      throw new Error("That theme ID is reserved by DexThemes");
    }

    // Content moderation on themeId (appears in URLs and leaderboard)
    const idCheck = moderateText(args.themeId.replace(/-/g, " "));
    if (!idCheck.clean) {
      throw new Error("Theme ID rejected: " + idCheck.reason);
    }

    // Validate name length
    if (args.name.length < 1 || args.name.length > 80) {
      throw new Error("Theme name must be 1-80 characters");
    }

    // Content moderation — block profane, explicit, racist, or hateful names
    const nameCheck = moderateText(args.name);
    if (!nameCheck.clean) {
      throw new Error("Theme name rejected: " + nameCheck.reason);
    }

    // Validate summary length
    if (args.summary.length < 1 || args.summary.length > 240) {
      throw new Error("Summary must be 1-240 characters");
    }

    const codeThemeIds = typeof args.codeThemeId === "string"
      ? [args.codeThemeId]
      : [args.codeThemeId.dark, args.codeThemeId.light];
    if (codeThemeIds.some((value) => value.length < 1 || value.length > 80)) {
      throw new Error("Code theme IDs must be 1-80 characters");
    }

    // Content moderation on summary
    const summaryCheck = moderateText(args.summary);
    if (!summaryCheck.clean) {
      throw new Error("Summary rejected: " + summaryCheck.reason);
    }

    // Keep private creation flexible, but require original wording anywhere a
    // public community theme is named, linked, or described. This final
    // server-side gate prevents a client from bypassing the MCP review step.
    const publicIdentity = evaluatePublicThemeIdentity(args);
    if (!publicIdentity.allowed) {
      throw new Error(
        `Public theme names, IDs, and summaries must use original wording. Try a name such as ${publicIdentity.suggestedNames.join(", ")} and the summary: ${publicIdentity.suggestedSummary}`,
      );
    }

    // Validate accents array length
    if (args.accents.length > 10) {
      throw new Error("Maximum 10 accent colors allowed");
    }

    // Check themeId uniqueness
    const existing = await ctx.db
      .query("themes")
      .withIndex("by_themeId", (q) => q.eq("themeId", args.themeId))
      .first();
    if (existing) {
      throw new Error("A theme with this ID already exists");
    }

    // Validate hex colors
    assertValidVariantColors(args.dark, "dark");
    assertValidVariantColors(args.light, "light");
    for (const [index, accent] of args.accents.entries()) {
      if (!HEX_COLOR.test(accent)) {
        throw new Error(`Invalid hex color for accents[${index}]: ${accent}`);
      }
    }

    // Protect official, DexThemes, and supporter themes from cloning
    const protection = checkThemeProtection(
      args.dark ? { surface: args.dark.surface, ink: args.dark.ink, accent: args.dark.accent } : null,
      args.light ? { surface: args.light.surface, ink: args.light.ink, accent: args.light.accent } : null,
    );
    if (!protection.allowed) {
      throw new Error(protection.reason!);
    }

    // Insert theme
    const themeDocId = await ctx.db.insert("themes", {
      themeId: args.themeId,
      name: args.name,
      authorId: user._id,
      authorName: user.displayName || user.username,
      summary: args.summary,
      status: "published",
      flagCount: 0,
      dark: args.dark,
      light: args.light,
      accents: args.accents,
      codeThemeId: args.codeThemeId,
      copies: 0,
      createdAt: Date.now(),
      protected: false,
    });

    await grantUnlockForUser(ctx, user._id, "create_theme");
    if (args.dark && args.light) {
      await grantUnlockForUser(ctx, user._id, "complete_pair");
    }
    if (args.authToken.startsWith("dxt_")) {
      await grantUnlockForUser(ctx, user._id, "use_api");
    }
    if (args.source === "plugin") {
      await grantUnlockForUser(ctx, user._id, "use_plugin");
      await grantUnlockForUser(ctx, user._id, "create_theme_with_plugin");
    }

    return { _id: themeDocId, themeId: args.themeId };
  },
});

/**
 * Increment the copy counter for a theme.
 */
export const incrementCopies = internalMutation({
  args: { themeId: v.string() },
  handler: async (ctx, args) => {
    return incrementThemeCopyCounters(ctx, args.themeId);
  },
});

/**
 * Count a copy only once per theme per IP hash, regardless of sign-in state.
 */
export const registerCopy = internalMutation({
  args: {
    themeId: v.string(),
    ip: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const theme = await ctx.db
      .query("themes")
      .withIndex("by_themeId", (q) => q.eq("themeId", args.themeId))
      .first();
    if (!theme || theme.status !== "published") return null;

    const ipHash = await sha256Hex(args.ip);
    const copyKey = await sha256Hex(`${args.themeId}:${ipHash}`);

    const existing = await ctx.db
      .query("themeCopyEvents")
      .withIndex("by_copy_key", (q) => q.eq("copyKey", copyKey))
      .first();

    let result = { copies: theme.copies };
    if (!existing) {
      result = (await incrementThemeCopyCounters(ctx, args.themeId)) || result;
      await ctx.db.insert("themeCopyEvents", {
        copyKey,
        themeId: args.themeId,
        ipHash,
        userId: args.userId,
        createdAt: Date.now(),
      });
    }

    const qualifiedAdoption = await registerQualifiedAdoption(ctx, theme, args.userId);

    return {
      counted: !existing,
      copies: result.copies,
      qualifiedAdoption,
    };
  },
});

/**
 * Return stats for the signed-in user's submitted themes.
 */
export const getMySubmissionStats = internalQuery({
  args: { authToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const themes = await ctx.db
      .query("themes")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .collect();

    const publishedThemes = themes
      .filter((theme) => theme.status === "published")
      .sort((a, b) => b.createdAt - a.createdAt);

    const totalCopies = publishedThemes.reduce((sum, theme) => sum + theme.copies, 0);
    const likeCounts = await Promise.all(
      publishedThemes.map(async (theme) => {
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_theme", (q) => q.eq("themeId", theme.themeId))
          .collect();
        return [theme.themeId, likes.length] as const;
      }),
    );
    const likeCountByThemeId = Object.fromEntries(likeCounts);
    const totalLikes = publishedThemes.reduce(
      (sum, theme) => sum + (likeCountByThemeId[theme.themeId] || 0),
      0,
    );
    const likesGiven = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const copyEvents = await ctx.db
      .query("themeCopyEvents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const copiedThemes = new Set(copyEvents.map((event) => event.themeId));
    const qualifiedCounts = await Promise.all(
      publishedThemes.map(async (theme) => {
        const events = await ctx.db
          .query("qualifiedThemeAdoptions")
          .withIndex("by_theme_period", (q) => q.eq("themeId", theme.themeId))
          .collect();
        return [theme.themeId, events.length] as const;
      }),
    );
    const qualifiedCountByThemeId = Object.fromEntries(qualifiedCounts);
    const totalQualifiedAdoptions = publishedThemes.reduce(
      (sum, theme) => sum + (qualifiedCountByThemeId[theme.themeId] || 0),
      0,
    );
    const topTheme = publishedThemes.reduce(
      (best: any, theme: any) => {
        if (!best || theme.copies > best.copies) return theme;
        return best;
      },
      null as any,
    );
    const allPublishedThemes = await ctx.db
      .query("themes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const userThemeIds = new Set(publishedThemes.map((theme) => theme.themeId));
    const now = Date.now();
    const dailyPeriod = currentPopularityPeriod("daily", now);
    const weeklyPeriod = currentPopularityPeriod("weekly", now);
    const [weeklyCopyEvents, weeklyQualifiedAdoptions, weeklyLikes] = await Promise.all([
      ctx.db
        .query("themeCopyEvents")
        .withIndex("by_created_at", (q) =>
          q.gte("createdAt", weeklyPeriod.start).lt("createdAt", weeklyPeriod.end),
        )
        .collect(),
      ctx.db
        .query("qualifiedThemeAdoptions")
        .withIndex("by_created_at", (q) =>
          q.gte("createdAt", weeklyPeriod.start).lt("createdAt", weeklyPeriod.end),
        )
        .collect(),
      ctx.db
        .query("likes")
        .withIndex("by_created_at", (q) =>
          q.gte("createdAt", weeklyPeriod.start).lt("createdAt", weeklyPeriod.end),
        )
        .collect(),
    ]);
    const dailyRanked = rankPopularityEntries({
      themes: allPublishedThemes,
      copyEvents: weeklyCopyEvents,
      qualifiedAdoptions: weeklyQualifiedAdoptions,
      likes: weeklyLikes,
      start: dailyPeriod.start,
      end: dailyPeriod.end,
      limit: allPublishedThemes.length,
    });
    const weeklyRanked = rankPopularityEntries({
      themes: allPublishedThemes,
      copyEvents: weeklyCopyEvents,
      qualifiedAdoptions: weeklyQualifiedAdoptions,
      likes: weeklyLikes,
      start: weeklyPeriod.start,
      end: weeklyPeriod.end,
      limit: allPublishedThemes.length,
    });
    const rankEntries = (entries: typeof allPublishedThemes, metric: "copies" | "periodCopies") =>
      [...entries].sort((a, b) =>
        (metric === "copies" ? b.copies - a.copies : (b.periodCopies ?? 0) - (a.periodCopies ?? 0)) ||
        a.createdAt - b.createdAt
      );
    const allTimeRanked = rankEntries(allPublishedThemes, "copies");
    const monthStart = currentMonthStart();
    const monthlyRanked = [...allPublishedThemes]
      .filter((theme) => theme.periodQualifiedStart != null && theme.periodQualifiedStart >= monthStart)
      .sort((a, b) =>
        (b.periodQualifiedCopies ?? 0) - (a.periodQualifiedCopies ?? 0) || a.createdAt - b.createdAt
      );
    const findBestRank = (entries: typeof allPublishedThemes) => {
      const index = entries.findIndex((theme) => userThemeIds.has(theme.themeId));
      if (index < 0) return null;
      const theme = entries[index];
      return {
        rank: index + 1,
        themeId: theme.themeId,
        name: theme.name,
        copies: theme.copies,
        periodCopies: theme.periodCopies ?? 0,
        qualifiedAdoptions: qualifiedCountByThemeId[theme.themeId] || 0,
        periodQualifiedAdoptions: theme.periodQualifiedCopies ?? 0,
      };
    };
    const themeById = new Map<string, any>(
      allPublishedThemes.map((theme: any) => [theme.themeId, theme]),
    );
    const findBestPeriodRank = (entries: ReturnType<typeof rankPopularityEntries>) => {
      const index = entries.findIndex((entry) => userThemeIds.has(entry.themeId));
      if (index < 0) return null;
      const entry = entries[index];
      const theme = themeById.get(entry.themeId);
      return {
        rank: index + 1,
        themeId: entry.themeId,
        name: theme?.name || entry.themeId,
        copies: entry.copies,
        qualifiedAdoptions: entry.qualifiedAdoptions,
        likes: entry.likes,
      };
    };
    const popularityWinRecords = await ctx.db
      .query("popularityPeriodFinalizations")
      .withIndex("by_winner_user", (q) => q.eq("winnerUserId", user._id))
      .order("desc")
      .collect();
    const awardedWins = popularityWinRecords.filter((record) => record.status === "awarded");
    const monthlyFinalizations = await ctx.db
      .query("popularityPeriodFinalizations")
      .withIndex("by_period", (q) => q.eq("periodType", "monthly"))
      .order("desc")
      .collect();
    const monthlyPlacements = monthlyFinalizations.flatMap((record) =>
      (record.winners || [])
        .filter((winner) => String(winner.userId) === String(user._id))
        .map((winner) => ({
          periodType: "monthly",
          periodStart: record.periodStart,
          periodEnd: record.periodEnd,
          themeId: winner.themeId,
          name: winner.themeName,
          rank: winner.rank,
          copies: winner.copies,
          qualifiedAdoptions: winner.qualifiedAdoptions,
          likes: winner.likes,
        })),
    );
    const winThemes = new Map<string, {
      themeId: string;
      name: string;
      daily: number;
      weekly: number;
      monthlyTop10: number;
      total: number;
    }>();
    for (const win of awardedWins) {
      if (!win.winnerThemeId) continue;
      const current = winThemes.get(win.winnerThemeId) || {
        themeId: win.winnerThemeId,
        name: win.winnerThemeName || win.winnerThemeId,
        daily: 0,
        weekly: 0,
        monthlyTop10: 0,
        total: 0,
      };
      if (win.periodType === "daily") current.daily += 1;
      if (win.periodType === "weekly") current.weekly += 1;
      current.total += 1;
      winThemes.set(win.winnerThemeId, current);
    }
    for (const placement of monthlyPlacements) {
      const current = winThemes.get(placement.themeId) || {
        themeId: placement.themeId,
        name: placement.name,
        daily: 0,
        weekly: 0,
        monthlyTop10: 0,
        total: 0,
      };
      current.monthlyTop10 += 1;
      winThemes.set(placement.themeId, current);
    }
    const recentPopularityResults = [
      ...awardedWins.map((win) => ({
        periodType: win.periodType,
        periodStart: win.periodStart,
        periodEnd: win.periodEnd,
        themeId: win.winnerThemeId,
        name: win.winnerThemeName,
        rank: 1,
        copies: win.copies,
        qualifiedAdoptions: win.qualifiedAdoptions,
        likes: win.likes,
      })),
      ...monthlyPlacements,
    ].sort((a, b) => b.periodStart - a.periodStart).slice(0, 12);

    return {
      user: {
        _id: user._id,
        provider: user.provider,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      totals: {
        submittedThemes: publishedThemes.length,
        totalCopies,
        totalLikes,
        totalQualifiedAdoptions,
        averageCopies: publishedThemes.length > 0 ? Math.round(totalCopies / publishedThemes.length) : 0,
      },
      creatorTotals: {
        submittedThemes: publishedThemes.length,
        totalCopies,
        totalLikes,
        totalQualifiedAdoptions,
        averageCopies: publishedThemes.length > 0 ? Math.round(totalCopies / publishedThemes.length) : 0,
      },
      activityTotals: {
        copiedThemes: copiedThemes.size,
        likedThemes: likesGiven.length,
      },
      leaderboard: {
        daily: findBestPeriodRank(dailyRanked),
        weekly: findBestPeriodRank(weeklyRanked),
        monthly: findBestRank(monthlyRanked),
        allTime: findBestRank(allTimeRanked),
        totalPublishedThemes: allPublishedThemes.length,
      },
      popularityWins: {
        daily: awardedWins.filter((win) => win.periodType === "daily").length,
        weekly: awardedWins.filter((win) => win.periodType === "weekly").length,
        monthlyTop10: monthlyPlacements.length,
        total: awardedWins.length,
        byTheme: [...winThemes.values()].sort((a, b) =>
          b.total - a.total || b.monthlyTop10 - a.monthlyTop10 || a.name.localeCompare(b.name),
        ),
        recent: recentPopularityResults,
      },
      topTheme: topTheme
        ? {
            themeId: topTheme.themeId,
            name: topTheme.name,
            copies: topTheme.copies,
            likes: likeCountByThemeId[topTheme.themeId] || 0,
            qualifiedAdoptions: qualifiedCountByThemeId[topTheme.themeId] || 0,
          }
        : null,
      themes: publishedThemes.map((theme) => ({
        _id: theme._id,
        themeId: theme.themeId,
        name: theme.name,
        summary: theme.summary,
        copies: theme.copies,
        likes: likeCountByThemeId[theme.themeId] || 0,
        qualifiedAdoptions: qualifiedCountByThemeId[theme.themeId] || 0,
        periodQualifiedAdoptions: theme.periodQualifiedCopies ?? 0,
        createdAt: theme.createdAt,
        accents: theme.accents,
        dark: theme.dark,
        light: theme.light,
      })),
    };
  },
});

/**
 * Request the missing variant for a theme (non-author).
 * Increments variantRequests counter. One request per user per theme.
 */
export const requestVariant = internalMutation({
  args: {
    sessionToken: v.string(),
    themeId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_session", (q) => q.eq("sessionToken", args.sessionToken))
      .first();
    if (!user || user.sessionExpiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const theme = await ctx.db
      .query("themes")
      .withIndex("by_themeId", (q) => q.eq("themeId", args.themeId))
      .first();
    if (!theme) throw new Error("Theme not found");
    if (theme.status !== "published") throw new Error("Theme not available");

    // Can't request your own theme's variant
    if (theme.authorId === user._id) {
      throw new Error("You can add the variant yourself from the builder");
    }

    // Check if already has both variants
    if (theme.dark && theme.light) {
      throw new Error("This theme already has both variants");
    }

    await ctx.db.patch(theme._id, {
      variantRequests: (theme.variantRequests ?? 0) + 1,
    });

    return { requests: (theme.variantRequests ?? 0) + 1 };
  },
});

/**
 * Add the missing variant to an existing theme (author-only).
 */
export const addVariant = internalMutation({
  args: {
    authToken: v.string(),
    themeId: v.string(),
    variant: variantValidator,
    variantKey: v.string(), // "dark" | "light"
  },
  handler: async (ctx, args) => {
    const user = await getUserByAuthToken(ctx, args.authToken);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const theme = await ctx.db
      .query("themes")
      .withIndex("by_themeId", (q) => q.eq("themeId", args.themeId))
      .first();
    if (!theme) throw new Error("Theme not found");
    if (theme.status !== "published") throw new Error("Theme not available");

    // Author-only
    if (theme.authorId !== user._id) {
      throw new Error("Only the theme author can add a variant");
    }

    // Validate which variant is being added
    if (args.variantKey !== "dark" && args.variantKey !== "light") {
      throw new Error("variantKey must be 'dark' or 'light'");
    }

    // Check that the variant doesn't already exist
    if (theme[args.variantKey as "dark" | "light"]) {
      throw new Error(`This theme already has a ${args.variantKey} variant`);
    }

    // Validate hex colors
    assertValidVariantColors(args.variant, args.variantKey);

    // Color protection check
    const protection = checkThemeProtection(
      args.variantKey === "dark" ? { surface: args.variant.surface, ink: args.variant.ink, accent: args.variant.accent } : null,
      args.variantKey === "light" ? { surface: args.variant.surface, ink: args.variant.ink, accent: args.variant.accent } : null,
    );
    if (!protection.allowed) {
      throw new Error(protection.reason!);
    }

    await ctx.db.patch(theme._id, {
      [args.variantKey]: args.variant,
    });

    await grantUnlockForUser(ctx, user._id, "complete_pair");
    if (args.authToken.startsWith("dxt_")) {
      await grantUnlockForUser(ctx, user._id, "use_api");
    }

    return { success: true, themeId: args.themeId, variantKey: args.variantKey };
  },
});
