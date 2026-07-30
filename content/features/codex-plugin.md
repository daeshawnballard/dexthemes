---
title: DexThemes Codex Plugin and MCP App
description: Discover, create, preview, import, collect, and publish Codex themes through an implemented MCP-backed app.
slug: codex-plugin
kind: feature
section: Features
answer: DexThemes implements an MCP-backed interactive theme app with anonymous discovery and creation tools plus OAuth-protected personal stats, unlocks, and confirmed publication.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes MCP and plugin source version 1.0.0 as of 2026-07-30
related: /features/theme-builder, /features/creator-dashboard, /features/codex-theme-import
---

DexThemes implements an MCP-backed interactive app and bundled skill for finding, creating, previewing, importing, collecting, and publishing Codex themes inside a supported conversation host. The capability exists in the repository and MCP endpoint; this page does not claim that DexThemes is approved, publicly listed, or available through every plugin distribution channel.

## Anonymous and read-only capabilities

The public tool set works without DexThemes sign-in for:

- natural-language search across built-in Codex, curated DexThemes, and published community themes;
- fetching one exact theme by the stable ID returned from search;
- drafting a private dark, light, or paired theme from an idea;
- validating structure, exact colors, contrast, protected palettes, and optional public wording;
- rendering full Codex-style dark and light workspace previews;
- preparing the selected variant's import string and Settings handoff;
- viewing daily, weekly, monthly, and all-time public leaderboards; and
- preparing a best-effort redacted GitHub Issue draft.

These tools read public data or compute a private draft. Preparing an import can let the interactive card copy a string and open Codex Settings after user action, but it does not modify community data or silently apply the theme. Preparing an issue shows the exact draft and warning; it does not submit anything to GitHub.

## OAuth-protected personal tools

Account tools use OAuth with GitHub as the upstream identity. The implemented scopes divide access by purpose:

- `themes:read` allows personal creator stats and supported account unlocks.
- `themes:write` allows public-submission review and confirmed publication.

The stats view can show published theme totals, copies, likes, qualified adoptions, current ranks, repeat daily and weekly wins, finalized monthly Top 10 placements, and achievements. The unlock view can render supported reward themes for the signed-in account.

The resource server verifies the signed token and derives account identity from it. Personal and publication tool arguments do not accept a user ID, owner ID, email address, API key, or access token. If OAuth is unavailable or incomplete in a particular deployment or host, the public tools can still work while account-bound tools remain gated.

## Publication is the only public write

Theme publication is intentionally split into review and commit:

1. Validate the draft for public use.
2. Call the submission-preparation tool with `themes:write`.
3. Inspect the exact public name, summary, variants, and mockups in the app.
4. Press the app's Publish button.
5. Let the app call the app-only `submit_theme` tool with a short-lived confirmation bound to the reviewed payload and current sign-in.

The confirmation is not a value the model should invent or request. The server rechecks public wording, colors, protected palettes, identity, rate limits, and the exact payload before creating the community theme. The write creates a new theme under the verified identity; it cannot edit or delete another creator's theme.

## Safe Codex apply handoff

The plugin uses the same explicit path as the website. It prepares a validated `codex-theme-v1` string, then the app can copy it and open generic Codex Settings. The user chooses Appearance, chooses Import theme, pastes, and approves. Clipboard failure leaves the exact string selectable and keeps opening Settings as a separate action.

No plugin tool claims that opening Settings or copying a string proves the theme loaded.

## Discovery and distribution limits

The MCP endpoint and installable repository bundle are implementation and testing surfaces. Whether a user can connect them depends on the host, account permissions, organization policy, and active distribution path. Capability in source is not evidence of marketplace approval or public directory listing.

The visual app adapts to compact host layouts, but preview rendering remains a DexThemes simulation. OAuth-protected features additionally depend on correctly configured authorization infrastructure. Public theme search may omit protected reward palettes and uses policy-clean public names for catalog items that need descriptive aliases.

DexThemes is community-built, open source, and not affiliated with OpenAI. It is an independent theme tool, not an official Codex or OpenAI plugin.
