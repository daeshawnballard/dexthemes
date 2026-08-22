---
title: Claude Code Custom Theme Export
description: DexThemes now exports separate Claude Code dark and light custom-theme JSON files for documented, user-controlled setup.
slug: claude-code-custom-theme-export
kind: article
section: Articles
answer: DexThemes exports a paired set of Claude Code custom-theme JSON files. Copy the reviewed dark or light file to your Claude themes folder, then select that one file with Claude Code's documented `/theme` flow.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-21
testedWith: Deterministic Claude export and schema checks reviewed 2026-08-21; no installed Claude Code session was exercised
related: /articles/how-we-test-codex-themes, /guides/how-to-install-a-codex-theme, /reference/codex-theme-format
---

DexThemes now produces Claude Code custom-theme exports in a deliberately simple form: one JSON file for dark and one JSON file for light. They are paired as a design family, but they remain two separate host files and two separate user choices. That distinction matters. The export is not a remote control for a Claude Code session and it does not bind the two choices into an automatic system-light/system-dark switch.

## What the export contains

Each file declares its intended base appearance and a bounded set of Claude color overrides. The generated values cover the visible text, status, prompt, plan, diff, selection, and related Claude token roles supported by the reviewed contract. The exporter validates the JSON shape and color values before it emits the file.

The dark and light names are kept separate so a person can inspect either artifact before using it. DexThemes does not add executable code, a plugin, an account action, or a host-profile write to this export.

## The documented setup boundary

Use the exported file as a local customization artifact. Review it, copy the chosen variant into `~/.claude/themes`, then use Claude Code's `/theme` selection flow to choose that file. Claude Code owns the final selection and any persistence of that selection.

If you switch appearances later, choose the other exported file through the same host-owned flow. Do not infer that keeping both files in the folder creates automatic pairing; that behavior is not part of the DexThemes export claim.

## What this proves and what it does not

The current evidence is deterministic source/build proof: paired JSON files are generated and checked against the reviewed contract. It is useful proof that the export is shaped as expected. It is not proof that a particular installed Claude Code release discovers the files, renders every token, or preserves the choice after an update.

No installed Claude Code interaction was performed for this release candidate. There is also no claim of automatic installation, automatic light/dark pairing, marketplace delivery, or direct application from the DexThemes website. Treat the export as a reviewable starting point, then verify the result in your own Claude Code environment.

For the general distinction between a copied artifact and a loaded theme, see [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with Anthropic.
