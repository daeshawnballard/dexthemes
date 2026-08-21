# Host customization evidence receipt

Evidence captured 2026-08-21. “Source/build/test” is not loaded-host proof. `NOT PERFORMED` means the action was intentionally not attempted; `Unknown` means the available evidence cannot decide the fact.

| Host | Official contract | Source / build / test proof | Installed / local runtime proof | Unknown or blocker |
| --- | --- | --- | --- | --- |
| Codex | Settled existing DexThemes contract: explicit `codex-theme-v1` copy/import through Settings → Appearance | Existing import validator, adapter, and handoff tests | NOT PERFORMED in this run | Direct website control remains unsupported |
| DeepSeek Harness | Supported Cordis theme service through the existing installed plugin | Existing semantic-token, plugin, and guarded state-transition tests | Existing receipts record loaded plugin Apply/Revert; not rerun here | Website-to-Harness control remains unsupported |
| Claude Code | [Custom theme files](https://code.claude.com/docs/en/terminal-config#create-a-custom-theme) in `~/.claude/themes`, selected with `/theme`; plugin themes are [experimental](https://code.claude.com/docs/en/plugins-reference#themes) | Separate dark/light JSON exporter and schema tests | NOT PERFORMED | Automatic custom-pair binding and authenticated loaded appearance |
| Google Antigravity | [Appearance settings](https://antigravity.google/docs/settings.md) exist; [plugins](https://antigravity.google/docs/ide/plugins.md) contribute Skills, Rules, MCP servers, and Hooks, not visual themes | Fail-closed registry tests; no exporter | NOT PERFORMED; no profile, token, or shared configuration access | Stable theme schema, import/write path, visual plugin contribution, and reversal are Unknown |
| Qwen Code | Standalone custom-theme JSON selected by setting its in-home path as `ui.theme`; `/theme` changes require removing that pinned setting; source HEAD `7a4566cb3b03da268b53f112d08a38b47f43ca27` | Separate JSON exports and schema tests | NOT PERFORMED | Loaded release behavior and automatic pair binding |
| OpenCode | [Local/project JSON themes](https://opencode.ai/docs/themes/) with paired values; source HEAD `bcf1103a8c8653acd7afdd5fc2ebd9f6e5486b3c` | Paired JSON export/schema tests; no `$schema` because advertised endpoint returned 404 | NOT PERFORMED | Loaded release behavior |
| Pi | Code-free theme package and JSON theme discovery; source HEAD `f4585b8bec581d005cbb1edfc07edfcce723d0ae` | Package manifest, code-free contents, and JSON theme tests | NOT PERFORMED | Installed package discovery and loaded appearance |
| Zed | [Local themes](https://zed.dev/docs/themes) using [Theme Family schema v0.2.0](https://zed.dev/schema/themes/v0.2.0.json); source HEAD `7316cf77459a1dbc62979beffedeeeaa8e91389a` | Theme Family export/schema tests; opaque background enforced | NOT PERFORMED | Loaded release behavior |
| Cursor | [Cursor theme selection](https://cursor.com/help/customization/themes) and marketplace installation; upstream [VS Code theme format](https://code.visualstudio.com/api/extension-guides/color-theme) only | Private review-source package tests with publisher placeholder | INVALID. `/Applications/Cursor.app/Contents/MacOS/Cursor --version` visibly launched the real app/profile and logged `update#setState checking for updates`, `UpdateService onUpdateAvailable()`, and `update#setState downloading` | Update completion: Unknown. Profile mutation: Unknown. Marketplace acceptance, install, Agent coverage, and loaded appearance: Unknown |
| T3 Code | Stable v1 parser and user import at Settings → Appearance → Themes → Add theme; source HEAD `c3e37094e04de71accf497c6110c5305223e0090` | Full 57-role paired JSON export/schema tests; `collection`, `managed`, and `sidebarArtwork` omitted | NOT PERFORMED | Installed release behavior; source schema version is not a release-channel guarantee |
| Conductor | Current official docs prove built-in appearance controls, not a supported custom-theme seam | Fail-closed registry tests; no exporter | NOT PERFORMED | Supported custom-theme seam |
| Grok Build | Source HEAD `19d42e35c07a9c9244f03f6df0c4c353f970d4f9` proves exactly five `pager.toml` appearance colors and restart loading | Two deterministic five-key snippets plus grammar/path boundary tests; no mutator | NOT PERFORMED | Installed release behavior after restart |

Cursor runtime proof invalid. The visible launch/log evidence above is an incident boundary, not installed-host validation.

## Current artifact boundary

- Eight hosts generate export artifacts: Claude Code, Qwen Code, OpenCode, Pi, Zed, Cursor review source, T3 Code, and Grok Build limited snippets.
- Codex keeps its existing explicit copy/import adapter.
- DeepSeek Harness keeps its existing installed Cordis integration.
- Google Antigravity and Conductor generate nothing.
- The protected inspiration-theme catalog remains outside this host-integration change.
- No publish, deploy, host installation, real-profile mutation, or production change is part of this receipt.
