import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Shared variant shape for theme colors
const variantObject = v.object({
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

export default defineSchema({
  users: defineTable({
    provider: v.string(), // "github" | "x"
    providerId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    sessionToken: v.string(),
    sessionExpiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionToken"])
    .index("by_provider", ["provider", "providerId"]),

  themes: defineTable({
    themeId: v.string(), // kebab-case unique identifier
    name: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    summary: v.string(),
    status: v.string(), // "published" | "removed"
    flagCount: v.number(),
    dark: v.optional(variantObject),
    light: v.optional(variantObject),
    accents: v.array(v.string()),
    codeThemeId: v.object({
      dark: v.string(),
      light: v.string(),
    }),
    copies: v.number(),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_themeId", ["themeId"])
    .index("by_author", ["authorId"]),

  flags: defineTable({
    themeId: v.id("themes"),
    userId: v.id("users"),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_theme_user", ["themeId", "userId"]),
});
