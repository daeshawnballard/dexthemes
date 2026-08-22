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
dateModified: 2026-08-22
testedWith: T3 Code Nightly exact six-tool search, visible theme import and exact restoration plus stable-v1 57-role checks reviewed 2026-08-22
related: /articles/cursor-review-only-theme-source, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now exports a stable v1 T3 Code theme file with the complete set of 57 supported color roles. When the source palette has both appearances, the file contains the selected appearance plus an opposite-appearance entry in `variants`. The result is a single, reviewable JSON artifact for a manual T3 Code import.

## Manual import is the delivery model

Copy or download the JSON, inspect it, then use **Settings → Appearance → Themes → Add theme** in T3 Code. The host can accept the artifact through file selection, paste, or drop; you choose whether and when to complete that interaction. DexThemes does not select the file for you, alter your settings, or apply a theme into a running T3 Code instance.

This is an import path, not Direct Apply. The distinction remains deliberate even though a loaded T3 Code Nightly acceptance now proves the host can import, visibly select, and restore the reviewed artifact. The website and export are not cross-process runtime controls.

## Stable v1 scope

The generated artifact stays inside the stable v1 subset. It includes all 57 supported color roles and the paired opposite variant when available. It intentionally omits `collection`, `managed`, and `sidebarArtwork`, which are not part of this stable export boundary. The generator checks that those omitted fields do not leak into the JSON.

The file is therefore a clear candidate for review, but not a guarantee about a nightly parser, a future release channel, or loaded host rendering.

## Loaded evidence and remaining limits

T3 Code Nightly loaded the exact six-tool inventory and completed a real DexThemes `search` call. In that same real harness, the theme was visibly imported and applied, then the previous appearance was restored. That satisfies both halves of the current runtime rubric and supports T3 Code's presence in the normal selector.

The JSON also validates against the local stable-v1 contract, includes all 57 roles, and retains the checked paired-variant structure. Those deterministic checks are source evidence rather than a replacement for the loaded receipt. The proof is specific to the observed Nightly build; it does not guarantee a future parser, marketplace delivery, or cross-process Direct Apply.

Use a known-good theme as your fallback before importing. If you decide to change back, use T3 Code’s own selection controls. DexThemes provides no automatic revert action for the website surface.

For more on that evidence boundary, read [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with T3 Code.
