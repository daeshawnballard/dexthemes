# DexThemes for DeepSeek Harness

Installed DeepSeek Harness plugin for browsing, previewing, applying, and reverting paired palettes through Harness's public client-side theme service.

Version 0.6 includes a palette matched to DeepSeek Harness's published semantic defaults, twelve unofficial DeepSeek ecosystem color tributes, a privacy-bounded Statsig event sink, a supported Harness MCP connection for public DexThemes agent tools, and an optional GitHub-backed DexThemes account connection through the existing Convex backend. Tribute inclusion is based on linked public documentation for a DeepSeek integration, deployment, or inference path. The package does not bundle logos, fonts, or other company assets and does not claim partnership, authorization, or endorsement.

## Install

From the DeepSeek Harness checkout:

Repository source version `0.6.0` is not published to npm. As of 2026-08-14, the verified registry release is `0.4.1`; install it with:

```sh
pnpm dsh plugin --profile web add @dexthemes/deepseek-harness-plugin@0.4.1
pnpm dsh web
```

To exercise the current 0.6.0 source before publication, use the source directory instead:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/dexthemes/packages/deepseek-harness-plugin
pnpm dsh web
```

The package contributes a real Loader entry and a **DexThemes** tab under **Settings → Plugins**. It keeps Harness source read-only. Applying a theme calls `theme.overrideTokens(...)`; applying another theme replaces the same owned layer, and **Revert** disposes it.

After Harness starts, refresh its browser tab once so the new client package is included in the boot graph. Then:

1. Open **Settings → Plugins → DexThemes**.
2. Search or filter **DeepSeek**, **DexThemes**, and **Community** palettes. Codex-origin themes remain in the Codex channel and are not duplicated here.
3. Choose **Preview**, then **Apply to DeepSeek**, or apply directly from a card.
4. Apply another card to switch themes. Choose **Revert** to restore the Harness default.

Browsing, chat creation, preview, apply, and revert never require an account. To add creator stats, achievements, and unlocked reward palettes, choose **Connect DexThemes**. Convex requests a short-lived code from GitHub's official Device Flow, and the plugin sends the user only to `https://github.com/login/device`. The opaque device code remains in memory while Convex polls GitHub. GitHub's token is used only inside that Convex request to verify `/user`; it is never returned to Harness or stored by DexThemes. Convex instead returns a one-hour, `themes:read` DexThemes session whose hash is stored server-side and whose credential stays only in the running plugin closure. It is never placed in a prompt, URL, browser storage, analytics event, workspace, or Harness configuration. Disconnecting clears it locally and asks Convex to revoke it; unload clears it locally, with server expiry as the fallback.

After a connected user successfully applies a theme, the plugin calls the bearer-only `/plugin/deepseek-harness/use` route. The server derives the account from the hashed DexThemes session and idempotently awards **Harnessed** with the paired **Deep Current** reward. Anonymous applies never claim it. The device flow uses a separate DexThemes-owned GitHub OAuth application with **Enable Device Flow** turned on. It requests no OAuth scope, which GitHub defines as read-only public profile access. Convex verifies `/user`, revokes that exact GitHub token through the app's server-held secret, and only then issues the distinct `dxd_…` session. Normal website and publication routes do not recognize that credential family. Auth0, refresh tokens, and offline access are not part of the DeepSeek flow. The separate Codex/ChatGPT MCP OAuth 2.1 contract remains unchanged.

The package also loads Harness's shipped `@deepseek-ai/dsh-mcp-client` against the restricted `https://www.dexthemes.com/api/deepseek-mcp` surface. In any chat mode, ask for a theme by idea, ask **Color me lucky**, search the catalog, validate a draft, preview its paired palette data, or prepare a reversible DeepSeek apply Package. Choose Harness's shipped **Creator mode** when the chat should also call `cordis_define`, `cordis_run`, and `cordis_stop` to apply and revert that Package. Standard mode deliberately omits those self-modification tools. Only the selected tool name and arguments are sent; the connector does not attach the conversation, workspace, paths, or credentials. Disable or remove the DexThemes plugin to dispose both the theme UI and its tool connection.

For local protocol testing before that endpoint is deployed, run `npm run qa:deepseek-mcp` in the DexThemes checkout and start Harness with `DEXTHEMES_MCP_URL=http://127.0.0.1:3099/api/deepseek-mcp`. The production URL remains the default.

The bundled catalog works offline. It contains the DeepSeek default palette, twelve unofficial tribute palettes, and compatible shared DexThemes palettes. When available, the plugin merges the public DexThemes API response to include current community themes. Anonymous catalog input cannot introduce account-only reward palettes; only the verified bearer unlock response can add rewards to a connected user's session. Search runs locally. Analytics is limited to event name, source surface, theme ID, paired variant, plugin version, and bounded failure code; it disables local persistence and page-URL collection. No prompts, workspace contents, paths, palette payloads, credentials, account identity, or sensitive data are sent as analytics. Publishing and likes remain on the existing DexThemes surfaces; the installed package exposes read-only account stats, achievements, and rewards plus the server-verified Harnessed completion call.

**Harness default** is native rather than a copied palette. Revert disposes the DexThemes override so Harness continues to own its light, dark, and system appearance as that product evolves.

Fonts are intentionally unsupported by this integration.

The npm package is the supported distribution path for published releases; the current 0.6.0 source features require the local-package command until that version is actually published. The bundled catalog, preview, apply, and revert work without a DexThemes account. The hosted MCP endpoint, Statsig delivery, device-authorization routes, and achievement call require their production services and OAuth environment configuration. npm publication does not imply a separate Harness marketplace approval, and the standalone DexThemes website cannot apply into an unrelated Harness browser tab.

## Distribution boundary

Harness's supported CLI accepts a package or Git spec through `dsh plugin --profile <profile> add <package-or-git-spec>`. DexThemes uses npm for published releases and a local source path for unreleased development. No dedicated Harness marketplace submission surface was found in the inspected checkout, so npm distribution is the published-release boundary rather than a claim of Harness marketplace approval.
