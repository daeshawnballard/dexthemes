---
title: Qwen Code Custom Theme Export
description: DexThemes exports separate Qwen Code custom-theme JSON files for a reviewed `ui.theme` path setup, without claiming `/theme` setup.
slug: qwen-code-custom-theme-export
kind: article
section: Articles
answer: DexThemes exports distinct dark and light Qwen Code JSON theme files. Keep a reviewed file in your home directory and set `ui.theme` to that exact path; this is not a `/theme` setup claim.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-22
testedWith: Loaded Qwen Code theme mutation and exact ui.theme restoration plus deterministic export checks reviewed 2026-08-22; real DexThemes MCP call remains unproved
related: /articles/claude-code-custom-theme-export, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now exports Qwen Code themes as two separate custom JSON files: one dark and one light. The files are a paired palette delivery, not a theme-extension package and not an automatic appearance pair. Each has its own explicit selection path.

## The exact Qwen setup

Review the desired JSON file and keep it at a stable path inside your home directory. Then configure Qwen Code's `ui.theme` setting with that file path. Qwen Code reads the path you choose; DexThemes does not write the setting or mutate your profile.

This is intentionally not described as a `/theme` installation flow. A pinned `ui.theme` path and an interactive `/theme` choice have different host behavior. If you have pinned a custom path, follow Qwen Code's own configuration guidance when changing or removing it rather than assuming the selector will override the setting.

## What is in each file

The generated JSON uses Qwen Code's custom-theme shape, including foreground, background, accents, diff colors, muted colors, and the bounded `GradientColors` array. It is exported twice because custom dark and light selections remain distinct. The exporter checks the expected object fields, color format, and gradient array before the file becomes part of the host-export bundle.

The pairing is visual provenance only. It does not claim that Qwen's automatic appearance mode associates the two custom files, nor that a file works in every installed release.

## Evidence and limits

The current loaded evidence proves visible Qwen Code theme mutation and restoration of the exact prior `ui.theme` value. That earns the mutation half of the strict harness rubric. Deterministic generation and schema checks continue to validate the reviewed JSON artifacts, but source and tests do not add runtime points.

Qwen remains outside the normal selector at 50/100. The DexThemes server was discovered and connected, but no current model made a real `mcp__dexthemes__search` call. Completing that half requires a model/provider-authenticated Qwen session that actually invokes the tool and retains the loaded call receipt; discovery alone does not score.

There is no DexThemes website Apply action, no plugin, and no theme-extension manifest behind this export. The safe handoff remains a local file, an explicit configuration path chosen by you, and Qwen Code's own restoration path.

DexThemes is independent and not affiliated with Alibaba Cloud or Qwen Code.
