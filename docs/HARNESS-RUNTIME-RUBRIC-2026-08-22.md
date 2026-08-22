# DexThemes 12-harness current-evidence rubric

Date: 2026-08-22

This rubric scores only current evidence from the exact real harness under
test. The MCP half earns 50 points only when that harness loads the exact
intended tool inventory and completes a real tool call. The mutation half earns
50 points only when the same real harness visibly applies a DexThemes theme and
then restores the prior appearance. Source, documentation, fixtures, package
validation, builds, and tests score zero by themselves.

| Harness | Score | Current decisive evidence | Exact blocker or boundary | Security disposition |
| --- | ---: | --- | --- | --- |
| Codex | 0 | Eleven tools were discovered, but no real call completed and no supported self-UI mutation was proved. Previously proven/original Codex support is stale, not erased. | MCP call stopped at `oauth_refresh_token_missing`; Codex has no supported seam for proving a self-directed visible Apply and restore in its own UI. | OAuth failed closed. Discovery is not treated as invocation or mutation authority. |
| DeepSeek Harness | 100 | Loaded exact eight-tool `deepseek_harness` inventory plus a real call; visible Apply and Revert completed in the same real Harness. | None for this acceptance score. The integrated `0.6.5` source remains unpublished and has no new registry/runtime-release claim. | Server-enforced anonymous profile; bounded catalog fetch; remote prose excluded from mutation data; Apply requires explicit user confirmation and Revert retains the owned disposer. |
| Claude Code | 50 | Visible theme apply and restoration completed in Claude Code; MCP inventory plus real call was not proved. | MCP half lacks a loaded exact inventory and completed real tool call in Claude Code. | File-based mutation remains user-controlled and reversible; no MCP authority is inferred from theme files. |
| Google Antigravity | 50 | Antigravity 2.9.1 loaded the exact five-tool `antigravity_preview` inventory and completed a real `search` call. | The documented plugin seam has no supported visual-theme contribution or Apply/Revert API, so mutation is structurally unavailable. | Server-enforced five-tool anonymous profile; one-time host permission; returned text labeled and projected as inert data; production endpoint use was not performed for the receipt. |
| Qwen Code | 50 | Loaded theme mutation and restoration of the exact prior `ui.theme` state were proved. The DexThemes server was discovered and connected, but no model completed a real `mcp__dexthemes__search` call. | A model/provider-authenticated Qwen session must invoke `mcp__dexthemes__search` and retain the loaded call receipt for the MCP half. | Client allow-list and exact preimage rollback guidance are present; server discovery is not treated as invocation. |
| OpenCode | 100 | Loaded exact six-tool discovery inventory plus a real call; the paired theme was visibly selected and the prior `opencode` theme restored in the same real harness. | None for this acceptance score. | Anonymous `cursor_discovery` profile is server-enforced; theme mutation uses OpenCode's supported selector and preserves host ownership. |
| Pi | 100 | Pi 0.73.1 loaded the exact six-tool inventory and completed a real call; `adapter-test-dark` visibly applied and built-in `dark` was visibly restored in the same isolated profile. | None for this acceptance score. An unrelated optional `fd` helper download returned 404 without blocking the proof. | Model-visible results retain only bounded identifiers and validated palette fields; remote prose, errors, parser text, and transport exceptions map to fixed local output. |
| Zed | 0 | No scoring runtime evidence. | Installation/terms gate was not crossed; no exact loaded inventory plus call and no visible Apply plus restore were performed. | Fail closed at the user-controlled install/terms boundary; source/schema tests do not authorize installation or score. |
| Cursor | 100 | Cursor 3.12.17 loaded the restricted plugin/MCP inventory and completed a real call; the local extension visibly applied and restored the prior theme in the same real Cursor profile. | None for this acceptance score. Marketplace publication remains unproved. | Physical local plugin copy, server-enforced six-tool profile, inert-result skill boundary, exact-version integrity-locked extension packaging, and prior-theme restoration. |
| T3 Code | 100 | T3 Code Nightly loaded the exact six-tool inventory and completed a real `search` call; visible theme Apply and restore completed in the same real harness. | None for this acceptance score. The durable adapter is not a marketplace plugin and does not itself mutate themes. | Server-enforced six-tool profile, no credentials in the adapter, JSON-compatible inert-data classification, and no automatic result-driven follow-up actions. |
| Conductor | 0 | Green discovery status was supporting evidence only; no real call completed and no supported custom-theme mutation seam exists. | Claude Code failed with expired OAuth before the call. The Codex fallback failed on `model_catalog_json` missing `supports_parallel_tool_calls`. Conductor exposes built-in appearance choices only. | Guidance is remediated to `local` scope, `/api/cursor-mcp`, exactly six tools, and exact removal. Prompt text is explicitly not an authorization control; unrestricted `/api/mcp` guidance is forbidden. |
| Grok Build limited | 0 | No scoring runtime evidence. | Host authentication gate was not crossed. Only five `pager.toml` colors are supported, and no loaded Apply plus restore was proved. | Remains explicitly limited and manual; no full-palette, mutator, MCP, credential, or runtime claim is inferred from the export. |

## Security and release boundary

The central anonymous MCP profiles are positive-allowlisted and server-enforced:
`deepseek_harness` exposes eight tools, `cursor_discovery` exposes six, and
`antigravity_preview` exposes five. Remote catalog text is untrusted inert data;
server and remediated clients project bounded fields, prohibit automatic
result-driven actions, and keep account, publication, and unsupported mutation
capabilities outside anonymous profiles.

Release, publication, marketplace submission, push, pull request, merge,
deployment, credential changes, terms acceptance, and installed-host profile
changes for this integration are **NOT PERFORMED**. The scores above are local
current-runtime acceptance results only.
