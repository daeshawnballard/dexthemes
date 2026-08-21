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
dateModified: 2026-08-21
testedWith: Deterministic Pi package and JSON schema checks reviewed 2026-08-21; no installed Pi session was exercised
related: /articles/opencode-paired-theme-export, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now delivers Pi customization as a code-free private theme package. It contains a small `package.json` manifest plus one dark and one light JSON theme file. It deliberately has no scripts, dependencies, executable entrypoint, or hidden setup helper.

## Why the package is code-free

A theme should be easy to inspect before it changes how a tool looks. The Pi export declares only the themes directory in its package metadata and keeps the package private at version `0.0.0`. The theme JSON files use the reviewed Pi schema and provide the color roles needed for interface, Markdown, tool, diff, syntax, and thinking states.

This layout is not a marketplace publication and it is not a claim that Pi has already accepted or loaded the package. It is simply a local package you can read before deciding whether to use it.

## Your setup choice

After reviewing the export directory, you can load it temporarily with `pi -e PATH_TO_EXPORT` or install it locally with `pi install PATH_TO_EXPORT`, then choose the theme through Pi. Those commands and the final selection are yours to run. DexThemes does not run them, does not write a Pi profile, and does not claim it can apply a theme into an existing Pi process.

Keep a known-good Pi setup before changing anything. If the package is not a fit, use Pi’s own package and theme controls to remove or stop selecting it. No DexThemes automatic revert is provided.

## Evidence, without a runtime overclaim

The current proof is deterministic build and contract validation: the package manifest is limited to the code-free shape, both JSON files validate, and unsafe or unsupported package fields are rejected. It does not prove package discovery, installed behavior, or a loaded appearance in Pi.

No Pi runtime was opened for this release candidate. The export should therefore be read as a reviewable artifact, not an installed integration. Verify the package against your own Pi version before relying on it.

The same source-versus-runtime distinction is explained in [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with Pi.
