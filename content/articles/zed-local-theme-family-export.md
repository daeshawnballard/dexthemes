---
title: Zed Local Theme Family Export
description: DexThemes now exports an opaque local Zed Theme Family JSON file using the reviewed zed.dev v0.2.0 shape.
slug: zed-local-theme-family-export
kind: article
section: Articles
answer: DexThemes exports one local Zed Theme Family JSON file with dark and light entries in the reviewed zed.dev v0.2.0 shape. Copy it to Zed's local themes folder and select it in Zed.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-21
testedWith: Deterministic Zed Theme Family export and schema checks reviewed 2026-08-21; no installed Zed session was exercised
related: /articles/pi-code-free-theme-package, /articles/how-we-test-codex-themes, /reference/codex-theme-format
visibility: status-only
---

DexThemes now exports a local Zed Theme Family JSON file. The one file contains both dark and light theme entries, following the reviewed Theme Family shape published on `zed.dev` at v0.2.0. It is intended for local inspection and host-controlled selection.

## The local Zed handoff

Review the exported JSON, copy it into `~/.config/zed/themes`, and choose the theme through Zed’s Theme Selector. Zed owns discovery and selection. DexThemes does not write the file into your configuration directory, open Zed, or alter a selected profile.

The exporter names Zed and uses the `zed.dev` schema authority deliberately. It does not substitute a similarly named endpoint or claim broad compatibility beyond the reviewed v0.2.0 family shape.

## Opaque by design

The file forces `background.appearance` to `opaque` and emits solid, six-digit color values for its supported interface, terminal, syntax, diff, and status roles. This is a constrained rendering choice, not a promise of every visual effect Zed might support. Alpha, window appearance, and other richer behavior are outside this export claim.

The dark and light entries remain a family in the JSON, but loading and the appearance result remain facts for your installed Zed version to decide.

## What is proven

The release candidate has deterministic source/build proof: the family structure is generated consistently, its entries validate against the reviewed local contract, and opaque background output is enforced. That proof supports the artifact’s shape. It is not proof that an installed Zed build discovers it, shows it in the selector, or renders every field.

No Zed installation, local profile, or loaded theme was exercised for this release candidate. There is no direct-apply claim, no plugin, and no automatic rollback. If you stop using the theme, select another theme in Zed and manage the local file under your own control.

For the distinction between a valid file and loaded runtime behavior, see [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with Zed Industries.
