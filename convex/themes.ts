import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const themes = await ctx.db
      .query("themes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
    return themes;
  },
});

/**
 * Submit a new community theme.
 */
export const submit = mutation({
  args: {
    sessionToken: v.string(),
    themeId: v.string(),
    name: v.string(),
    summary: v.string(),
    dark: v.optional(variantValidator),
    light: v.optional(variantValidator),
    accents: v.array(v.string()),
    codeThemeId: v.object({
      dark: v.string(),
      light: v.string(),
    }),
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

    // Validate at least one variant
    if (!args.dark && !args.light) {
      throw new Error("At least one variant (dark or light) is required");
    }

    // Validate themeId format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.themeId)) {
      throw new Error("Theme ID must be kebab-case (lowercase letters, numbers, hyphens)");
    }

    // Validate name length
    if (args.name.length < 1 || args.name.length > 80) {
      throw new Error("Theme name must be 1-80 characters");
    }

    // Validate summary length
    if (args.summary.length < 1 || args.summary.length > 240) {
      throw new Error("Summary must be 1-240 characters");
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
    const hexRegex = /^#[A-Fa-f0-9]{6}$/;
    const validateVariant = (variant: any, label: string) => {
      if (!variant) return;
      for (const key of ["surface", "ink", "accent", "diffAdded", "diffRemoved", "skill"]) {
        if (!hexRegex.test(variant[key])) {
          throw new Error(`Invalid hex color for ${label}.${key}: ${variant[key]}`);
        }
      }
      if (variant.contrast < 0 || variant.contrast > 100) {
        throw new Error(`Contrast must be 0-100 for ${label}`);
      }
    };
    validateVariant(args.dark, "dark");
    validateVariant(args.light, "light");

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
    });

    return { _id: themeDocId, themeId: args.themeId };
  },
});

/**
 * Increment the copy counter for a theme.
 */
export const incrementCopies = mutation({
  args: { themeId: v.string() },
  handler: async (ctx, args) => {
    const theme = await ctx.db
      .query("themes")
      .withIndex("by_themeId", (q) => q.eq("themeId", args.themeId))
      .first();
    if (theme) {
      await ctx.db.patch(theme._id, { copies: theme.copies + 1 });
      return { copies: theme.copies + 1 };
    }
    return null;
  },
});
