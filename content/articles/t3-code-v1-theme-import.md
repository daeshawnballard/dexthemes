---
title: T3 Code v1 Theme Import
description: DexThemes now exports a stable v1 paired T3 Code JSON theme with all 57 supported color roles for manual import.
slug: t3-code-v1-theme-import
kind: article
section: Articles
answer: DexThemes exports one stable v1 T3 Code JSON theme with all 57 supported color roles and an opposite-appearance variant. Import the reviewed file manually through Settings → Appearance → Themes → Add theme.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-21
testedWith: Deterministic T3 Code stable-v1 export and 57-role schema checks reviewed 2026-08-21; no installed T3 Code session was exercised
related: /articles/cursor-review-only-theme-source, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now exports a stable v1 T3 Code theme file with the complete set of 57 supported color roles. When the source palette has both appearances, the file contains the selected appearance plus an opposite-appearance entry in `variants`. The result is a single, reviewable JSON artifact for a manual T3 Code import.

## Manual import is the delivery model

Copy or download the JSON, inspect it, then use **Settings → Appearance → Themes → Add theme** in T3 Code. The host can accept the artifact through file selection, paste, or drop; you choose whether and when to complete that interaction. DexThemes does not select the file for you, alter your settings, or apply a theme into a running T3 Code instance.

This is an import path, not Direct Apply. The distinction is deliberate: the release has no observed installed T3 Code interaction, so the website and export should never be described as a direct runtime control.

## Stable v1 scope

The generated artifact stays inside the stable v1 subset. It includes all 57 supported color roles and the paired opposite variant when available. It intentionally omits `collection`, `managed`, and `sidebarArtwork`, which are not part of this stable export boundary. The generator checks that those omitted fields do not leak into the JSON.

The file is therefore a clear candidate for review, but not a guarantee about a nightly parser, a future release channel, or loaded host rendering.

## Evidence and remaining Unknowns

Current proof is deterministic source/build proof: the JSON validates against the local stable-v1 contract, all 57 roles are present, and the paired variant structure is checked. It is not runtime proof. No installed T3 Code release was opened, no import was performed, and no visual result or reversal path was observed.

Use a known-good theme as your fallback before importing, then verify the appearance with your actual T3 Code version. If you decide to change back, use T3 Code’s own selection controls. DexThemes provides no Direct Apply or automatic revert claim for this surface.

For more on that evidence boundary, read [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with T3 Code.
