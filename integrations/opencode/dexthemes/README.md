# DexThemes for OpenCode

This directory contains a reproducible OpenCode MCP connection and a paired
OpenCode theme payload. It uses the anonymous, server-enforced
`cursor_discovery` profile; the profile name is a service profile, not a claim
about the host.

## Install the connector

Use OpenCode's supported command to add the remote server to the current user
profile:

```sh
opencode mcp add dexthemes --url 'https://www.dexthemes.com/api/mcp?profile=cursor_discovery'
opencode mcp list
```

Alternatively, copy the `mcp` section in `opencode.jsonc` into a project's
root `opencode.jsonc`. Do not put credentials, headers, or local paths in this
configuration.

The profile exposes exactly these read-only tools: `search`, `fetch`,
`draft_theme`, `color_me_lucky`, `validate_theme`, and `get_leaderboard`.
It excludes host mutation, account, publication, feedback, and Codex apply
handoff tools at the server boundary.

## Verify the connection

After `opencode mcp list` reports `dexthemes` as connected, start a normal
OpenCode session and ask it to use `dexthemes_search`. A successful tool call
is the required host proof; package presence and configuration syntax are not
enough.

## Install and restore the paired theme

The project-local payload at `.opencode/themes/deepseek-baidu.json` contains
paired dark and light colors for the DexThemes `deepseek-baidu` palette. In a
session opened from this repository:

1. Run `/theme`.
2. Search for and select `deepseek-baidu`.
3. To restore the prior appearance, run `/theme` again and select the prior
   built-in or custom theme (for the runtime proof, that was `opencode`).

OpenCode owns theme discovery, selection, and persistence. DexThemes does not
write a host profile, create credentials, or provide an automatic revert.

## Remove only this OpenCode setup

First use `/theme` to select the exact prior built-in or custom theme. For the
project-local setup shown above, remove only the `dexthemes` member of the
`mcp` object in that project's `opencode.jsonc`; leave every other MCP entry
unchanged. The current `opencode mcp` CLI exposes add/list/auth/logout/debug,
not a remove command, so do not substitute `logout` for removing an anonymous
server.

Then move only the copied project-local
`.opencode/themes/deepseek-baidu.json` to Trash if you placed it there. Restart
OpenCode and run `opencode mcp list` from the same scope: `dexthemes` must be
absent. In `/theme`, confirm `deepseek-baidu` is absent and the prior theme is
still selected. Do not remove user-wide theme files, unrelated MCP entries, or
OpenCode configuration.
