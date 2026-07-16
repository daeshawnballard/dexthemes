import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod/v4";
import { THEME_PREVIEW_HTML } from "./generated/theme-preview-html.js";
import {
  draftTheme,
  fetchThemeById,
  getLeaderboard,
  getUnlockedThemeDetails,
  prepareGitHubIssue,
  prepareThemeApply,
  searchThemes,
  validateTheme,
} from "./theme-tools.js";
import {
  createSubmissionConfirmation,
  verifySubmissionConfirmation,
} from "./submission-confirmation.js";

export const MCP_RESOURCE = "https://www.dexthemes.com/api/mcp";
export const MCP_PROTECTED_RESOURCE_METADATA =
  "https://www.dexthemes.com/.well-known/oauth-protected-resource";
const VIEW_URI = "ui://dexthemes/theme-studio-v2.html";
const CONVEX_SITE_URL =
  process.env.CONVEX_SITE_URL || "https://acrobatic-corgi-867.convex.site";
const HEX = /^#[0-9A-Fa-f]{6}$/;
const hexColor = z.string().regex(HEX, "Must be a six-digit hex color such as #1A2B3C");
const themeId = z.string().min(1).max(64);
const codeThemeId = z.string().min(1).max(80);
const fontName = z.string().max(100).nullable();

const variantSchema = z.object({
  surface: hexColor,
  ink: hexColor,
  accent: hexColor,
  contrast: z.number().min(0).max(100),
  diffAdded: hexColor,
  diffRemoved: hexColor,
  skill: hexColor,
  sidebar: hexColor.optional(),
  codeBg: hexColor.optional(),
  fonts: z.object({
    code: fontName.optional(),
    ui: fontName.optional(),
  }).optional(),
  opaqueWindows: z.boolean().optional(),
});
const themeInputSchema = z.object({
  id: themeId.optional(),
  themeId: themeId.optional(),
  name: z.string().min(1).max(80),
  summary: z.string().min(1).max(240),
  category: z.string().max(40).optional(),
  codeThemeId: z.union([
    codeThemeId,
    z.object({ dark: codeThemeId, light: codeThemeId }),
  ]).optional(),
  dark: variantSchema.nullable().optional(),
  light: variantSchema.nullable().optional(),
  accents: z.array(hexColor).max(10).optional(),
});
const genericRecord = z.record(z.string(), z.unknown());
const annotations = (readOnlyHint, openWorldHint, destructiveHint, idempotentHint = true) => ({
  readOnlyHint,
  openWorldHint,
  destructiveHint,
  idempotentHint,
});
const viewMeta = {
  ui: { resourceUri: VIEW_URI, visibility: ["model", "app"] },
  "openai/outputTemplate": VIEW_URI,
  "openai/widgetAccessible": true,
};
const appOnlyViewMeta = {
  ...viewMeta,
  ui: { resourceUri: VIEW_URI, visibility: ["app"] },
};
const NOAUTH = [{ type: "noauth" }];
const READ_AUTH = [{ type: "oauth2", scopes: ["themes:read"] }];
const WRITE_AUTH = [{ type: "oauth2", scopes: ["themes:write"] }];
const withSecurityMeta = (securitySchemes, meta = {}) => ({
  ...meta,
  securitySchemes,
});
const widgetResourceMeta = {
  ui: {
    csp: {
      connectDomains: [],
      resourceDomains: [],
      frameDomains: [],
      baseUriDomains: [],
    },
    domain: "https://www.dexthemes.com",
    permissions: { clipboardWrite: {} },
    prefersBorder: true,
  },
  "openai/widgetDescription": "Interactive DexThemes cards and light/dark Codex theme previews.",
  "openai/widgetPrefersBorder": true,
  "openai/widgetDomain": "https://www.dexthemes.com",
  "openai/widgetCSP": {
    connect_domains: [],
    resource_domains: [],
    frame_domains: [],
    redirect_domains: ["https://www.dexthemes.com", "https://github.com"],
  },
};

function toolResult(structuredContent, text, meta) {
  return {
    structuredContent,
    content: [{ type: "text", text: text || JSON.stringify(structuredContent) }],
    ...(meta ? { _meta: meta } : {}),
  };
}

function authChallenge(requiredScope) {
  return {
    isError: true,
    content: [{
      type: "text",
      text: "Sign in with GitHub to use this DexThemes account feature.",
    }],
    _meta: {
      "mcp/www_authenticate": [
        `Bearer resource_metadata="${MCP_PROTECTED_RESOURCE_METADATA}", scope="${requiredScope}", error="insufficient_scope", error_description="GitHub sign-in with the requested DexThemes permission is required"`,
      ],
    },
  };
}

function requireAccessToken(extra, scope) {
  const authInfo = extra?.authInfo;
  if (!authInfo?.token || !authInfo.scopes?.includes(scope)) return null;
  return authInfo.token;
}

function enrichAchievements(unlocks) {
  return (Array.isArray(unlocks) ? unlocks : []).map((unlock) => ({
    ...unlock,
    theme: getUnlockedThemeDetails(unlock.themeId),
  }));
}

async function callPluginApi(path, token, options = {}) {
  const response = await fetch(`${CONVEX_SITE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(8000) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `DexThemes account request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function createDexThemesMcpServer() {
  const server = new McpServer({ name: "DexThemes", version: "1.0.0" });

  registerAppResource(
    server,
    "DexThemes Theme Studio",
    VIEW_URI,
    {
      description: "Visual theme discovery, preview, leaderboard, and GitHub feedback view.",
      _meta: widgetResourceMeta,
    },
    async () => ({
      contents: [{
        uri: VIEW_URI,
        mimeType: "text/html;profile=mcp-app",
        text: THEME_PREVIEW_HTML,
        _meta: widgetResourceMeta,
      }],
    }),
  );

  registerAppTool(server, "search", {
    title: "Search DexThemes",
    description: "Search official Codex, DexThemes, and community themes by name, creator, category, mood, or color idea.",
    inputSchema: {
      query: z.string().max(160).describe("Natural-language theme search query."),
      limit: z.number().int().min(1).max(24).optional().describe("Maximum results; defaults to 12."),
    },
    outputSchema: z.object({
      kind: z.literal("theme-list"),
      count: z.number(),
      results: z.array(genericRecord),
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async ({ query, limit }) => {
    const results = await searchThemes(query, limit);
    const payload = { kind: "theme-list", count: results.length, results };
    return toolResult(payload, JSON.stringify(results));
  });

  registerAppTool(server, "fetch", {
    title: "Fetch a DexTheme",
    description: "Fetch one exact theme by the stable ID returned from search.",
    inputSchema: { id: z.string().min(1).max(80).describe("Stable DexThemes theme ID.") },
    outputSchema: z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
      url: z.string(),
      metadata: genericRecord,
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async ({ id }) => {
    const theme = await fetchThemeById(id);
    if (!theme) return { isError: true, content: [{ type: "text", text: `Theme not found: ${id}` }] };
    const payload = {
      id: theme.id,
      title: theme.name,
      text: `${theme.name}\n${theme.summary || "DexThemes theme"}\n${theme.dark ? "Dark" : ""}${theme.dark && theme.light ? " + " : ""}${theme.light ? "Light" : ""}`,
      url: theme.url,
      metadata: theme,
    };
    return toolResult(payload, JSON.stringify(payload));
  });

  registerAppTool(server, "draft_theme", {
    title: "Create a DexTheme draft",
    description: "Create a personalized Codex theme from an idea, voice request, fandom, event, or user personality. Honor a supplied custom name exactly; if no name is supplied, return a suggestion that must be confirmed before publication.",
    inputSchema: {
      inspiration: z.string().min(2).max(500).describe("What should inspire the theme, including any personality context the user explicitly wants considered."),
      name: z.string().min(1).max(80).optional().describe("Optional user-chosen theme name; honor it exactly after trimming."),
      themeId: themeId.optional(),
      summary: z.string().min(1).max(240).optional(),
      variant: z.enum(["dark", "light", "both"]).optional(),
      contrast: z.number().min(0).max(100).optional(),
      dark: variantSchema.optional().describe("Optional model-curated dark palette."),
      light: variantSchema.optional().describe("Optional model-curated light palette."),
      codeThemeId: z.union([codeThemeId, z.object({ dark: codeThemeId, light: codeThemeId })]).optional(),
    },
    outputSchema: z.object({
      kind: z.literal("theme-draft"),
      theme: themeInputSchema,
      valid: z.boolean(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
      usedCustomName: z.boolean(),
      needsNameConfirmation: z.boolean(),
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async (input) => {
    const draft = draftTheme(input);
    const validation = validateTheme(draft.theme);
    return toolResult({ kind: "theme-draft", ...draft, ...validation },
      `${draft.theme.name} is ready to preview.${draft.needsNameConfirmation ? " Confirm or replace the suggested name before publishing." : ""}`);
  });

  server.registerTool("validate_theme", {
    title: "Validate a DexTheme",
    description: "Validate a theme against DexThemes naming, shape, hex color, contrast, and protected-palette rules before submission.",
    inputSchema: { theme: themeInputSchema },
    outputSchema: z.object({
      kind: z.literal("theme-validation"),
      valid: z.boolean(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH),
  }, async ({ theme }) => toolResult({ kind: "theme-validation", ...validateTheme(theme) }));

  registerAppTool(server, "render_theme_preview", {
    title: "Preview a DexTheme",
    description: "Render dark and light theme variants as a visual Codex-style preview.",
    inputSchema: { theme: themeInputSchema },
    outputSchema: z.object({ kind: z.literal("theme"), theme: themeInputSchema }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async ({ theme }) => {
    const validation = validateTheme(theme);
    const unsafe = validation.errors.filter((error) => /hex color|contrast|variant|required|kebab-case/i.test(error));
    if (unsafe.length) {
      return { isError: true, content: [{ type: "text", text: `Theme preview rejected: ${unsafe.join(" ")}` }] };
    }
    return toolResult({ kind: "theme", theme }, `Previewing ${theme.name}.`);
  });

  registerAppTool(server, "prepare_theme_apply", {
    title: "Apply a DexTheme in Codex",
    description: "Prepare the exact Codex theme import string for a chosen dark or light variant. The visual app can copy it and open the supported generic Codex Settings route, where the user selects Appearance and imports it. This does not publish or modify community data.",
    inputSchema: {
      theme: themeInputSchema,
      variant: z.enum(["dark", "light"]),
    },
    outputSchema: z.object({
      kind: z.literal("theme-apply"),
      theme: themeInputSchema,
      variant: z.enum(["dark", "light"]),
      importString: z.string(),
      settingsUrl: z.string(),
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async ({ theme, variant }) => {
    const apply = prepareThemeApply(theme, variant);
    return toolResult({ kind: "theme-apply", theme, ...apply },
      `Copy this import string, open Codex Settings, choose Appearance, then import it for ${theme.name} (${variant}):\n${apply.importString}`);
  });

  registerAppTool(server, "get_leaderboard", {
    title: "Get the DexThemes leaderboard",
    description: "Show current UTC-day, UTC-week, monthly, and all-time community theme rankings with inline palette data for visual previews.",
    inputSchema: {},
    outputSchema: z.object({
      kind: z.literal("leaderboard"),
      daily: z.array(genericRecord),
      weekly: z.array(genericRecord),
      monthly: z.array(genericRecord),
      allTime: z.array(genericRecord),
      periods: genericRecord,
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async () => toolResult({ kind: "leaderboard", ...(await getLeaderboard()) }));

  registerAppTool(server, "get_my_stats", {
    title: "Get my DexThemes stats",
    description: "Show the signed-in creator dashboard: themes, copies, likes, daily/weekly/monthly/all-time ranks, repeat daily/weekly win history, finalized monthly Top 10 placements, and achievements. Requires GitHub sign-in.",
    inputSchema: {},
    outputSchema: z.object({ kind: z.literal("my-stats"), stats: genericRecord }),
    annotations: annotations(true, false, false),
    securitySchemes: READ_AUTH,
    _meta: withSecurityMeta(READ_AUTH, viewMeta),
  }, async (_args, extra) => {
    const token = requireAccessToken(extra, "themes:read");
    if (!token) return authChallenge("themes:read");
    const stats = await callPluginApi("/plugin/me/stats", token);
    stats.achievements = enrichAchievements(stats.achievements);
    return toolResult({ kind: "my-stats", stats });
  });

  registerAppTool(server, "get_my_unlocks", {
    title: "Get my DexThemes achievements",
    description: "Show the signed-in user's unlocked themes and achievements, including plugin and eligible employee bonuses. Requires GitHub sign-in.",
    inputSchema: {},
    outputSchema: z.object({ kind: z.literal("my-unlocks"), unlocks: z.array(genericRecord) }),
    annotations: annotations(true, false, false),
    securitySchemes: READ_AUTH,
    _meta: withSecurityMeta(READ_AUTH, viewMeta),
  }, async (_args, extra) => {
    const token = requireAccessToken(extra, "themes:read");
    if (!token) return authChallenge("themes:read");
    const data = await callPluginApi("/plugin/me/unlocks", token);
    return toolResult({ kind: "my-unlocks", unlocks: enrichAchievements(data.unlocks) });
  });

  registerAppTool(server, "prepare_theme_submission", {
    title: "Review a public DexTheme submission",
    description: "Validate and show the exact theme that would become public. Requires GitHub sign-in. This creates no public data; publication is available only from the review app's explicit Publish button.",
    inputSchema: { theme: themeInputSchema },
    outputSchema: z.object({
      kind: z.literal("theme-submission-review"),
      theme: themeInputSchema,
      warnings: z.array(z.string()),
      publicNotice: z.string(),
    }),
    annotations: annotations(true, false, false),
    securitySchemes: WRITE_AUTH,
    _meta: withSecurityMeta(WRITE_AUTH, viewMeta),
  }, async ({ theme }, extra) => {
    const token = requireAccessToken(extra, "themes:write");
    if (!token) return authChallenge("themes:write");
    const validation = validateTheme(theme);
    if (!validation.valid) {
      return { isError: true, content: [{ type: "text", text: `Theme is not valid: ${validation.errors.join(" ")}` }] };
    }
    try {
      const confirmationToken = createSubmissionConfirmation(theme, token);
      const payload = {
        kind: "theme-submission-review",
        theme,
        warnings: validation.warnings,
        publicNotice: "Publishing creates a public community theme attributed to your verified GitHub identity.",
      };
      return toolResult(
        payload,
        `Review ${theme.name} in the app. Nothing has been published.`,
        { "dexthemes/confirmationToken": confirmationToken },
      );
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  });

  registerAppTool(server, "submit_theme", {
    title: "Publish a community DexTheme",
    description: "App-only public write. Publish the exact reviewed theme only when the user presses Publish in the DexThemes review app. Identity is derived only from the verified OAuth token; never request or accept a user ID.",
    inputSchema: {
      theme: themeInputSchema,
      confirmationToken: z.string().min(40).max(1000).describe("Short-lived payload and sign-in bound token supplied only by the review app."),
    },
    outputSchema: z.object({ kind: z.literal("theme-submitted"), theme: genericRecord, achievements: z.array(genericRecord) }),
    annotations: annotations(false, true, false, false),
    securitySchemes: WRITE_AUTH,
    _meta: withSecurityMeta(WRITE_AUTH, appOnlyViewMeta),
  }, async ({ theme, confirmationToken }, extra) => {
    const token = requireAccessToken(extra, "themes:write");
    if (!token) return authChallenge("themes:write");
    const validation = validateTheme(theme);
    if (!validation.valid) {
      return { isError: true, content: [{ type: "text", text: `Theme is not valid: ${validation.errors.join(" ")}` }] };
    }
    try {
      verifySubmissionConfirmation(confirmationToken, theme, token);
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
    const data = await callPluginApi("/plugin/themes", token, {
      method: "POST",
      body: JSON.stringify({ theme }),
    });
    const payload = {
      kind: "theme-submitted",
      theme: data.theme || theme,
      achievements: data.achievements || [],
    };
    return toolResult(payload, `${theme.name} is now published to the DexThemes community.`);
  });

  registerAppTool(server, "prepare_github_issue", {
    title: "Prepare DexThemes GitHub feedback",
    description: "Prepare—but do not submit—a best-effort redacted, prefilled GitHub Issue for a DexThemes bug or feedback report. Redaction can miss sensitive context, so the user must review every character before opening GitHub.",
    inputSchema: {
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(2000),
      steps: z.string().max(2000).optional(),
      expected: z.string().max(2000).optional(),
      context: z.string().max(1000).optional().describe("Non-sensitive plugin/platform context only; never include workspace files, tokens, or private data."),
    },
    outputSchema: z.object({
      kind: z.literal("github-issue"),
      title: z.string(),
      body: z.string(),
      redactions: z.array(z.string()),
      redactionNotice: z.string(),
      reviewRequired: z.literal(true),
      posted: z.literal(false),
    }),
    annotations: annotations(true, false, false),
    securitySchemes: NOAUTH,
    _meta: withSecurityMeta(NOAUTH, viewMeta),
  }, async (input) => {
    const issue = prepareGitHubIssue(input);
    return toolResult({ kind: "github-issue", ...issue, posted: false }, "A best-effort redacted GitHub issue draft is ready. Review every character before opening GitHub; nothing has been posted.");
  });

  return server;
}
