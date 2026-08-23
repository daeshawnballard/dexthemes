# Claude Code runtime evidence — 2026-08-23

## Outcome

`BLOCKED_REALITY_GATE`, score **50/100** under the strict runtime rubric.

The Claude Code runtime loaded the configured DexThemes MCP servers and exposed
the exact DexThemes tool inventory. The required real search result and fresh
theme Apply/Restore receipt are **NOT PERFORMED**; neither may be inferred from
connection health, source, generated exports, or a tool-use request without a
response.

## Runtime observed

- Native Claude Code: `2.1.239`.
- The shell `claude` launcher is broken because its wrapper resolves to a
  missing native binary. The installed native executable at
  `/usr/local/Cellar/node/25.2.1/lib/node_modules/@anthropic-ai/claude-code/node_modules/@anthropic-ai/claude-code-darwin-x64/claude`
  ran successfully. This is a local machine observation, not a release claim.
- `claude mcp list` reported both user-scoped DexThemes servers as connected:
  - `dexthemes`: `https://www.dexthemes.com/api/mcp`
  - `dexthemes-discovery`:
    `https://www.dexthemes.com/api/mcp?profile=cursor_discovery`
- The loaded full `dexthemes` tool inventory contained 13 tools:
  `color_me_lucky`, `draft_theme`, `fetch`, `get_leaderboard`,
  `get_my_stats`, `get_my_unlocks`, `prepare_github_issue`,
  `prepare_theme_apply`, `prepare_theme_submission`, `render_theme_preview`,
  `search`, `submit_theme`, and `validate_theme`.

## MCP invocation boundary

A constrained non-persistent Claude session reached a direct
`mcp__dexthemes__search` request with `{"query":"dark blue"}`. Claude ended
the session before a tool response because its selected runtime model exceeded
the explicit `--max-budget-usd 0.05` limit. The terminal receipt reported
`error_max_budget_usd` and `total_cost_usd: 0.143875` after an internal model
selection of `claude-sonnet-5`.

Therefore:

- loaded inventory: **PROVED**;
- configured/connected MCP server: **PROVED**;
- successful real search/fetch result: **NOT PROVED**;
- authenticated DexThemes operation: **NOT PROVED**.

No further model invocation, credit purchase, login, or OAuth refresh was
attempted after the budget result.

## Theme state and artifact

Before-state observation from the real user Claude profile:

- selected theme: `light`;
- existing custom file: `Quiet Anthracite Dark`;
- existing file SHA-256:
  `6c36b5f70d964efa11b25c208f498712ad3f58a17058647ad1af84e126a41e6a`.

The deterministic DexThemes export build produced the following reviewable
Claude Code artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `dist/host-exports/claude/themes/adapter-test-dark.json` | `2d85c71c3927bece53d86a077ec5fe4ffc708cc60e12bfd54ad3bf835da9a4d5` |
| `dist/host-exports/claude/themes/adapter-test-light.json` | `ba327da93c15033e0a80ac6ab1148cb558081d4fa45383b2f3b6b332fe29741b` |

No DexThemes artifact was copied into `~/.claude/themes`; `light` was not
changed; no applied-theme observation exists; and no restore action was needed
or performed. The generated artifacts are source/build proof only.

## Marketplace preparation

Claude Code's current official contract uses a git-hosted marketplace catalog
at `.claude-plugin/marketplace.json` and a plugin manifest at
`.claude-plugin/plugin.json`; local validation uses `claude plugin validate`.
This repository now supplies those manifests for a Claude-specific package at
`integrations/claude-code/dexthemes` and preserves the canonical MCP endpoint
without embedding credentials or creating a second OAuth boundary.

Local validation passed:

```text
claude plugin validate .
claude plugin validate integrations/claude-code/dexthemes
```

This is submission-ready source only. It is **not** proof of marketplace
listing, directory acceptance, package installation, or loaded-plugin runtime.
Any actual submission requires an authorized maintainer to complete Anthropic's
current plugin-directory submission path and receive Anthropic acceptance.

Official references:

- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/plugins-reference
- https://github.com/anthropics/claude-plugins-official
- https://clau.de/plugin-directory-submission

## Required approval to reach 100/100

1. Authorize one Claude Code MCP run with an available model/credit allowance
   that returns a real `dexthemes` `search` or `fetch` result. If Claude asks
   to sign in, refresh OAuth, accept terms, or buy credits, stop for that
   specific action-time approval.
2. Authorize a temporary real-profile theme mutation: copy one reviewed
   DexThemes JSON artifact into `~/.claude/themes`, select it through Claude
   Code's visible `/theme` flow, capture the applied state, and restore the
   exact original `light` selection. No profile file should be removed or
   overwritten without a separately recorded preimage and explicit approval.
