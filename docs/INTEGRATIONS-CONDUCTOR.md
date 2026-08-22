# DexThemes with Conductor

Conductor loads MCP servers through the selected agent host. DexThemes does not
need a separate Conductor plugin, but configuration alone is not proof that a
Conductor session discovered or invoked the server.

## Configure the restricted discovery server

This guide intentionally uses Claude Code's narrowest documented scope:
`local`. Run the command from the Conductor workspace checkout that needs
DexThemes; do not use `--scope user` and do not substitute the unrestricted
`/api/mcp` endpoint.

```sh
claude mcp add --transport http --scope local dexthemes https://www.dexthemes.com/api/cursor-mcp
```

`/api/cursor-mcp` is the existing server-enforced discovery profile. Its exact
tool inventory is limited to `search`, `fetch`, `draft_theme`,
`color_me_lucky`, `validate_theme`, and `get_leaderboard`. It excludes Apply,
submission, publication, account statistics, unlocks, GitHub issue preparation,
and every account-bound tool.

Before adding the server, inspect any existing name with `claude mcp get
dexthemes`. Do not overwrite another MCP configuration just because it shares
the name. If the endpoint or scope differs, stop and resolve the ownership
conflict first.

Open that local Conductor workspace, choose Claude Code, and run `/mcp-status`.
Refresh until `DEXTHEMES` reports connected, then start a fresh session and use
a discovery smoke request such as:

```text
Use the DEXTHEMES MCP server to search for a muted indigo theme.
```

The MCP half is proven only when the real Conductor session shows the intended
tool inventory and completes a tool call. CLI health, source tests, endpoint
requests, and a green pre-session status row are supporting evidence only.

Prompt text is not an authorization control: it cannot grant a tool capability
or restrict a server that exposes one. The local scope and the server-enforced
six-tool profile are the least-privilege boundary.

## Roll back

Remove only the local project entry created by this guide, then confirm the
server is absent from that scope:

```sh
claude mcp remove dexthemes --scope local
claude mcp get dexthemes
```

Do not remove a user- or project-scoped server while rolling back a local
Conductor experiment.

## Authentication and failure boundaries

The restricted discovery profile requires no DexThemes authentication and does
not expose account-bound tools. Never paste API keys, bearer tokens, account
IDs, or email addresses into MCP tool arguments.

The agent host itself must also be authenticated. If Conductor reports an
expired Claude Code token, an unauthenticated Codex CLI, or a Codex
configuration error, stop before claiming a loaded invocation. Re-authenticate
through the host-managed flow only with explicit authorization.

## Appearance boundary

Conductor 0.82.6 exposes these supported appearance controls:

- host theme: Light, Dark, or System;
- code theme: Default, Catppuccin Latte, Catppuccin Macchiato, Catppuccin
  Mocha, Dracula, Nord, Tokyo Night, Gruvbox Dark, or Solarized Dark;
- accessible colors, mono font, ligatures, Markdown style, and terminal font
  preferences.

These are built-in choices, not a custom-theme mutation seam. DexThemes does
not write Conductor's database, hidden settings, CSS, or application bundle.
Until Conductor documents a custom import, extension, palette, or theme API,
there is no supported Apply/Revert adapter and the mutation half remains
unavailable.

## Current runtime evidence

See [CONDUCTOR-RUNTIME-EVIDENCE-2026-08-22.md](./CONDUCTOR-RUNTIME-EVIDENCE-2026-08-22.md)
for the latest loaded-host check. That check proves MCP discovery but not tool
invocation, so it does not earn the MCP half of the acceptance score.
