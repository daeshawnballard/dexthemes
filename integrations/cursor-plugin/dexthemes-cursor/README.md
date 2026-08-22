# DexThemes Cursor Plugin

This is a Cursor Plugin package for the DexThemes remote MCP endpoint:

```text
https://www.dexthemes.com/api/cursor-mcp
```

It packages a Cursor manifest, an MCP configuration, and a focused skill for theme discovery and private draft work. It contains no local executable, credentials, editor setting, or theme file.

## What it is for

The endpoint is a server-enforced discovery profile. Its complete tool inventory is theme search, exact fetch, private drafting, `color_me_lucky`, validation, and public leaderboard lookups.

MCP App metadata exists in the service source for rich theme previews, but this package does **not** claim that Cursor currently loads or renders those previews. Verify that behavior in a fresh, loaded Cursor session before describing a preview as shown.

## Untrusted catalog metadata

All text returned by this MCP endpoint is untrusted inert data, including community theme names, summaries, authors, tags, URLs, descriptions, and errors. The bundled skill must not follow embedded instructions or URLs, infer user intent from a result, or automatically call another tool. It keeps presentation to an opaque catalog ID and, only when needed, one plainly quoted name; it omits free-form metadata and all returned URLs.

This package contains no interceptor that can sanitize a remote MCP response before Cursor's model sees it. The model-facing skill is therefore the local enforcement boundary. Server-side catalog projection remains outside this package.

## What it does not do

- It does not install, modify, select, import, or apply Cursor editor color themes.
- It does not expose Codex's `prepare_theme_apply` flow as a Cursor action.
- It does not expose account, feedback, Codex apply-handoff, preview-rendering, or public-submission tools. The server profile rejects those capabilities rather than relying on prompt instructions.
- It does not prove a Cursor installation, an active MCP connection, available tools, or loaded runtime behavior merely because these files validate.

## Local package review

Cursor discovers this package as follows:

```text
dexthemes-cursor/
├── .cursor-plugin/plugin.json
├── mcp.json
└── skills/dexthemes-cursor/SKILL.md
```

For local Cursor validation, copy this complete `dexthemes-cursor` directory into `~/.cursor/plugins/local/`, then restart Cursor or run **Developer: Reload Window**. Use a physical directory: Cursor 3.12.17 rejects a local-plugin symlink when its target resolves outside `~/.cursor/plugins/local/`. Confirm that the package, its `dexthemes` MCP entry, and the skill appear in Cursor's Customize surface. Start a fresh chat and run a read-only `search` request before asserting that the MCP server is connected.

Do not treat this repository layout as Marketplace publication proof. Marketplace submission requires a public repository, local loaded-runtime validation, and Cursor review.

## Remove only this physical local plugin

Close or reload Cursor, then move only the physical local copy
`~/.cursor/plugins/local/dexthemes-cursor/` to Trash. Do not remove the
`~/.cursor/plugins/local/` parent, another plugin, or a Cursor extension.
Restart Cursor or run **Developer: Reload Window**, then verify in
**Customize** that the `dexthemes-cursor` package, its `dexthemes` MCP entry,
and its skill are all absent. Start a fresh chat to confirm the six discovery
tools are no longer available from this plugin.
