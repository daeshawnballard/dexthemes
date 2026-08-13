# DexThemes for DeepSeek Harness

Installed DeepSeek Harness plugin for browsing, previewing, applying, and reverting paired palettes through Harness's public client-side theme service.

Version 0.4 includes twelve unofficial DeepSeek ecosystem color tributes, a privacy-bounded Statsig event sink, a supported Harness MCP connection for public DexThemes agent tools, and an optional DexThemes account connection. Inclusion is based on linked public documentation for a DeepSeek integration, deployment, or inference path. The package does not bundle logos, fonts, or other company assets and does not claim partnership, authorization, or endorsement.

## Install

From the DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add @dexthemes/deepseek-harness-plugin@0.4.1
pnpm dsh web
```

For local package development, use the source directory instead:

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

Browsing, chat creation, preview, apply, and revert never require an account. To add creator stats, achievements, and unlocked reward palettes, choose **Connect DexThemes**. The plugin requests a short-lived OAuth device code, sends the user to the provider's HTTPS verification page, and polls through the rate-limited DexThemes API. The access token stays only in the running plugin's memory: it is never placed in a prompt, URL, browser storage, analytics event, workspace, or Harness configuration. Disconnecting or unloading the plugin clears it.

After a connected user successfully applies a theme, the plugin calls the bearer-only `/plugin/deepseek-harness/use` route. The server derives the account from the verified token and idempotently awards **Harnessed** with the paired **Deep Current** reward. Anonymous applies never claim it. The device flow requires a configured OAuth Native Application with Device Code enabled, token endpoint authentication set to `None`, the DexThemes API audience, and the `themes:read` scope.

The package also loads Harness's shipped `@deepseek-ai/dsh-mcp-client` against the restricted `https://www.dexthemes.com/api/deepseek-mcp` surface. In any chat mode, ask for a theme by idea, ask **Color me lucky**, search the catalog, validate a draft, preview its paired palette data, or prepare a reversible DeepSeek apply Package. Choose Harness's shipped **Creator mode** when the chat should also call `cordis_define`, `cordis_run`, and `cordis_stop` to apply and revert that Package. Standard mode deliberately omits those self-modification tools. Only the selected tool name and arguments are sent; the connector does not attach the conversation, workspace, paths, or credentials. Disable or remove the DexThemes plugin to dispose both the theme UI and its tool connection.

For local protocol testing before that endpoint is deployed, run `npm run qa:deepseek-mcp` in the DexThemes checkout and start Harness with `DEXTHEMES_MCP_URL=http://127.0.0.1:3099/api/deepseek-mcp`. The production URL remains the default.

The bundled catalog works offline. It contains the twelve DeepSeek collection themes plus compatible shared DexThemes palettes. When available, the plugin merges the public DexThemes API response to include current community themes. Anonymous catalog input cannot introduce account-only reward palettes; only the verified bearer unlock response can add rewards to a connected user's session. Search runs locally. Analytics is limited to event name, source surface, theme ID, paired variant, plugin version, and bounded failure code; it disables local persistence and page-URL collection. No prompts, workspace contents, paths, palette payloads, credentials, account identity, or sensitive data are sent as analytics. Publishing and likes remain on the existing DexThemes surfaces; the installed package exposes read-only account stats, achievements, and rewards plus the server-verified Harnessed completion call.

**Harness default** is native rather than a copied palette. Revert disposes the DexThemes override so Harness continues to own its light, dark, and system appearance as that product evolves.

Fonts are intentionally unsupported by this integration.

The npm package is the supported distribution path for this release. The bundled catalog, preview, apply, and revert work without a DexThemes account. The hosted MCP endpoint, Statsig delivery, device-authorization routes, and achievement call require their production services and OAuth environment configuration. npm publication does not imply a separate Harness marketplace approval, and the standalone DexThemes website cannot apply into an unrelated Harness browser tab.

## Distribution boundary

Harness's supported CLI accepts a package or Git spec through `dsh plugin --profile <profile> add <package-or-git-spec>`. DexThemes uses the public npm package above. No dedicated Harness marketplace submission surface was found in the inspected checkout, so npm distribution is the current release boundary rather than a claim of Harness marketplace approval.
