# Changelog

## 0.6.1 — 2026-08-14

- Detect the supported Harness theme service at runtime, keep the DexThemes Settings tab visible when it is unavailable, and make the unavailable state reversible.
- Persist only versioned theme-selection and reconnect intent through Harness's snapshot-store engine, then restore a validated theme after a full process restart.
- Require an explicit GitHub Device Flow reconnect after restart; DexThemes session tokens remain memory-only and never enter browser storage, Harness configuration, analytics, prompts, or workspace files.
- Add bounded platform, source-surface, plugin-version, theme, variant, action, and outcome attribution for preview, copy, setup, Apply, restore, Revert, and capability events.
- Add compatibility, upgrade, removal, restart-recovery, release-notes, and support documentation.

Release: https://github.com/daeshawnballard/dexthemes/releases/tag/deepseek-harness-plugin-v0.6.1

## 0.6.0 — 2026-08-14

- Publish the installed Settings → Plugins → DexThemes surface with bundled and public/community discovery, paired previews, one-click Apply/Revert, restricted public MCP tools, privacy-bounded analytics, and an optional DexThemes Connect account flow.
- Add the DeepSeek default palette and twelve evidence-linked unofficial ecosystem color tributes.

Release: https://github.com/daeshawnballard/dexthemes/releases/tag/deepseek-harness-plugin-v0.6.0
