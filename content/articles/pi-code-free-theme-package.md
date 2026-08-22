---
title: Pi Code-Free Theme Package
description: DexThemes now exports a private, code-free Pi theme package with JSON themes only and user-controlled loading or installation.
slug: pi-code-free-theme-package
kind: article
section: Articles
answer: DexThemes exports a private Pi package containing only its manifest and dark/light JSON themes. Review the package, then load or install it through Pi and select a theme yourself.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-22
testedWith: Pi 0.73.1 exact six-tool call, sanitized error path, visible adapter-test-dark selection, and built-in dark restoration reviewed 2026-08-22
related: /articles/opencode-paired-theme-export, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now delivers Pi customization as a code-free private theme package. It contains a small `package.json` manifest plus one dark and one light JSON theme file. It deliberately has no scripts, dependencies, executable entrypoint, or hidden setup helper.

## Why the package is code-free

A theme should be easy to inspect before it changes how a tool looks. The Pi export declares only the themes directory in its package metadata and keeps the package private at version `0.0.0`. The theme JSON files use the reviewed Pi schema and provide the color roles needed for interface, Markdown, tool, diff, syntax, and thinking states.

This layout is not a marketplace publication and it is not a claim that Pi has already accepted or loaded the package. It is simply a local package you can read before deciding whether to use it.

## Your setup choice

After reviewing the export directory, you can load it temporarily with `pi -e PATH_TO_EXPORT` or install it locally with `pi install PATH_TO_EXPORT`, then choose the theme through Pi. Those commands and the final selection are yours to run. DexThemes does not run them, does not write a Pi profile, and does not claim it can apply a theme into an existing Pi process.

Keep a known-good Pi setup before changing anything. If the package is not a fit, use Pi’s own package and theme controls to remove or stop selecting it. No DexThemes automatic revert is provided.

## Loaded evidence, without a delivery overclaim

Pi 0.73.1 loaded the code-free theme package and the separate remediated MCP extension in an isolated profile. It registered the exact six-tool inventory, sanitized a real server error, and then completed a real search whose model-visible result retained only bounded identifiers. In that same profile, `adapter-test-dark` visibly applied and Pi's built-in `dark` theme was visibly restored.

The connector requires `openWorldHint: true` exactly for `search`, `fetch`, and `get_leaderboard`, and `false` exactly for `draft_theme`, `color_me_lucky`, and `validate_theme`. Missing, wrong, added, or drifting metadata fails closed. The package manifest and theme schemas also remain deterministically checked.

This loaded evidence supports Pi's 100/100 selector status. It is not npm publication, gallery submission, deployment, or permission to change a user's normal Pi profile. Setup and removal remain explicit user actions through Pi's supported package and theme controls.

The same source-versus-runtime distinction is explained in [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with Pi.
