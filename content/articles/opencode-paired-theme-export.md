---
title: OpenCode Paired Theme Export
description: DexThemes now exports one validated OpenCode JSON document with paired dark and light values for manual local setup.
slug: opencode-paired-theme-export
kind: article
section: Articles
answer: DexThemes exports one OpenCode JSON theme document containing paired dark and light values. Place the reviewed file in a supported themes folder and choose it with OpenCode's `/theme` flow.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-22
testedWith: Loaded OpenCode exact six-tool call, visible theme selection, and exact restoration plus deterministic export checks reviewed 2026-08-22
related: /articles/how-we-test-codex-themes, /articles/dexthemes-harness-integration-status, /reference/codex-theme-format
---

OpenCode gets a single DexThemes JSON export rather than two independent files. That document carries paired dark and light values for the supported color roles, keeping the palette relationship inspectable in one place. It is a file export, not a host installation and not a promise that the DexThemes site can change an OpenCode session.

## Export, then choose

Review the JSON document, put it in an OpenCode themes folder supported by your installation, and use OpenCode's `/theme` flow to select it. The host owns discovery, selection, and any later change. Keep the file somewhere you can identify and restore if you decide not to use it.

The document intentionally does not contain a fabricated `$schema` URL. The reviewed schema endpoint did not provide a usable advertised schema, so the exporter avoids adding an assertion it cannot support. Instead, DexThemes validates the local contract that defines the expected theme keys and values.

## What paired means here

Paired means that color roles such as surface, text, accent, syntax, and diff state can include a dark and a light value in the one OpenCode theme map. It does not mean that every OpenCode build will render those values identically, choose between them automatically, or preserve a selection after an update.

The generated JSON contains no executable extension code, no profile-writing helper, and no direct-apply payload. The selection remains an explicit user action inside OpenCode.

## Loaded evidence and boundary

The current acceptance includes OpenCode loading the exact six-tool discovery inventory and completing a real DexThemes call. In that same real harness, the paired theme was visibly selected and the prior `opencode` theme was restored. That satisfies both halves of the strict runtime rubric and is why OpenCode appears in the normal DexThemes selector.

The deterministic export and schema checks remain useful source/build evidence, but they are not substitutes for that loaded proof. The website still does not write OpenCode configuration or perform a cross-process Direct Apply. Use the file and OpenCode's own selector as the user-controlled handoff. If you need to reverse the choice, use the same host-owned theme controls and keep your own file-management practices authoritative.

For the broader test vocabulary behind this distinction, read [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with SST or OpenCode.
