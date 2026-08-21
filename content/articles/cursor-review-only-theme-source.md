---
title: Cursor Review-Only Theme Source
description: DexThemes now exports private Cursor color-theme extension source for authorized review only, without installation or runtime claims.
slug: cursor-review-only-theme-source
kind: article
section: Articles
answer: DexThemes exports private Cursor-oriented VS Code color-theme extension source for review only. It is not an install package, marketplace listing, or proof of loaded Cursor behavior.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-21
testedWith: Cursor source package validation reviewed 2026-08-21; installed Cursor interaction is invalid and no runtime verification is claimed
related: /articles/zed-local-theme-family-export, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now produces Cursor-oriented color-theme extension source with a strict review-only boundary. The exported package is private, uses version `0.0.0`, and retains the publisher placeholder `replace-with-authorized-publisher`. Those details are intentional signals that this is source for authorized review, not a distributable Cursor installation.

## What is included

The source includes a manifest, dark and light color-theme definitions, and a README that describes the boundary. The themes contain a bounded VS Code-style color and token-color set derived from the canonical DexThemes palette. They do not contain an authorized publisher identity, a marketplace listing, or a claim of extension acceptance.

Reviewers can inspect the files as source. Any decision to package, publish, install, or evaluate them in Cursor requires the appropriate authority outside this export.

## What is deliberately absent

There is no Cursor direct apply action, no DexThemes website bridge, no host-profile mutation, and no automatic revert. The source does not prove marketplace acceptance, Agent-surface coverage, update compatibility, or installed rendering. It must not be represented as a Cursor theme users can already install from a marketplace.

An attempted local Cursor interaction in the underlying evidence record is invalid runtime evidence because it visibly launched the real application and its profile/update behavior cannot be safely interpreted as theme verification. This article makes no use of that incident as success proof.

## Evidence boundary

The present evidence is source/build-only: the generated package stays private, the publisher remains an unauthorized placeholder, the manifest validates, and the README rejects runtime-proven language. That demonstrates a bounded review artifact. It does not demonstrate an installed extension or a loaded appearance.

If an authorized publisher later chooses to evaluate this source, that work needs its own controlled installation and runtime evidence. Until then, the correct label is **review-only source**. Keeping this boundary explicit protects users from confusing a deterministic export with an actual Cursor distribution.

For the broader difference between source proof and host proof, read [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with Cursor.
