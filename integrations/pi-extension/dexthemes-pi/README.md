# DexThemes Pi MCP Connector

This is a local-review Pi extension package. It connects Pi to the deployed,
anonymous DexThemes discovery MCP profile through Pi's documented extension
seam. It is separate from the code-free DexThemes theme package.

## Fail-closed inventory

The extension registers nothing unless the server identifies itself as
DexThemes and returns exactly these six tools with read-only, non-destructive,
no-auth metadata:

- `search`
- `fetch`
- `draft_theme`
- `color_me_lucky`
- `validate_theme`
- `get_leaderboard`

`search`, `fetch`, and `get_leaderboard` must be marked open-world because
they read remote community catalog data. `draft_theme`, `color_me_lucky`, and
`validate_theme` must be marked closed-world. Any missing, added, renamed, or
differently annotated tool rejects the whole inventory before Pi registers it.

The deployed restricted profile currently uses
`https://www.dexthemes.com/api/cursor-mcp`. The route name reflects the first
host that consumed this same server-enforced discovery profile; the profile is
not allowed to expose account, feedback, preview, apply, or publication tools.

## Review and local load

Review the package before loading it. It contains one extension module and no
dependencies, credentials, install scripts, theme files, or profile-writing
code.

```sh
pi install /absolute/path/to/integrations/pi-extension/dexthemes-pi
pi
```

Inside Pi, `/dexthemes-tools` shows the verified inventory and
`/dexthemes-proof muted indigo` performs a real MCP `search` call without using
a model credential.

## Remote data boundary

Community-authored fields are untrusted. The connector never forwards remote
MCP text content, theme names, summaries, author fields, titles, or arbitrary
metadata into Pi's model-visible tool result, proof widget, or session entry.
It projects only bounded theme identifiers and validated six-digit palette
fields under fixed connector labels.

Every projected result states that it is untrusted inert remote data and that
no tool may be invoked automatically from it. The connector itself never uses a
remote result to invoke another tool; a user or model must make each request
explicitly through Pi's normal tool surface.

Pi extensions execute with the user's normal process permissions. This package
only performs HTTPS POST requests to the pinned DexThemes endpoint, registers
the verified tools and two commands, displays status in Pi, and records a proof
entry in the active Pi session after the proof command succeeds.

## Boundaries

- Installation or source validation alone does not prove that Pi loaded the
  extension or completed an MCP call.
- This connector does not select or mutate a theme. Pi's native theme package
  and settings controls own that separate action.
- This is not an npm publication or Pi gallery submission.
- The connector is anonymous and must not be given credentials or secrets.

## Remove only this Pi package

First select the prior Pi theme in `/settings`; do not remove a package while
its theme is still selected. Then remove each local package by the same exact
absolute path used at installation:

```sh
pi remove /absolute/path/to/integrations/pi-extension/dexthemes-pi
pi remove /absolute/path/to/dist/host-exports/pi
pi list
```

`pi remove` updates only the matching package entry in the chosen Pi scope.
If the package was installed with `pi install -l`, repeat the same removal with
`-l` from that project. Verify that neither exact path appears in `pi list`,
restart Pi, and confirm `/dexthemes-tools` is unavailable and the prior theme
is still selected. Do not remove unrelated packages, extensions, themes, or
settings entries.
