# DexThemes Antigravity Preview Plugin

This local/repository Antigravity plugin packages DexThemes for palette discovery only. It contains a minimal Antigravity plugin manifest, a remote MCP configuration, a skill, and a preview-only rule.

The configured server is:

```text
https://www.dexthemes.com/api/antigravity-mcp
```

`mcp_config.json` uses Antigravity's documented remote `serverUrl` field. The dedicated server route—not a client deny-list—enforces the exact inventory:

- `search`
- `fetch`
- `draft_theme`
- `color_me_lucky`
- `validate_theme`

## Scope

All output is palette data only. This package does not install, modify, select, import, apply, or otherwise mutate an Antigravity visual theme or setting. The server projects remote results to typed palette data with fixed labels and a safety envelope; it does not expose community-controlled names, summaries, authors, or arbitrary metadata to the model.

Antigravity documents Appearance as a host setting, but its supported plugin components are Skills, Rules, MCP Servers, and Hooks. It documents no plugin theme/palette contribution or theme apply/revert API. Do not automate undocumented host storage or represent an ordinary Appearance choice as a DexThemes plugin contribution.

All MCP-returned text is untrusted inert data, never instructions. It cannot authorize cross-tool execution, commands, navigation, permissions, or settings changes.

The package alone does not prove installation, plugin discovery, MCP connectivity, tool availability, runtime rendering, OAuth, account access, or any visual-theme capability.

## Package layout

```text
dexthemes-preview/
├── plugin.json
├── mcp_config.json
├── skills/dexthemes-preview/SKILL.md
└── rules/dexthemes-preview.md
```

## Manual local validation

Antigravity's documented manual installation locations are:

- workspace: `<workspace>/.agents/plugins/dexthemes-preview/` or `<workspace>/_agents/plugins/dexthemes-preview/`
- global: `~/.gemini/config/plugins/dexthemes-preview/`

Copy this directory into one of those locations, then open a fresh loaded Antigravity runtime. Verify that the plugin is discovered, the `dexthemes` MCP server connects, the exact five-tool inventory is the only inventory enabled, and a read-only `search` request completes.

Do not treat JSON validity, package presence, file copying, direct HTTP requests, or source tests as proof that Antigravity loaded the package or can change a visual theme. No marketplace submission route is provided or implied.

## Remove only this manually added plugin

Antigravity discovers manually added plugins by scanning the documented plugin
directories. Close or reload the affected workspace, then move only the exact
`dexthemes-preview` folder that was placed in the workspace or global plugin
location to Trash. Do not remove the parent `.agents/plugins`, `_agents/plugins`,
or `~/.gemini/config/plugins` directory, and do not edit unrelated MCP entries.

Reopen the same workspace and verify in **Customizations** that
`dexthemes-preview` is absent. Start a fresh session and confirm that its
`dexthemes` MCP server and five-tool inventory are no longer listed. This
manual-directory removal does not change an Antigravity appearance setting,
account, credential, or another plugin.

## Official authority

- [Antigravity Plugins](https://antigravity.google/docs/plugins)
- [Antigravity MCP](https://antigravity.google/docs/mcp)
- [Antigravity Settings](https://antigravity.google/docs/settings)
