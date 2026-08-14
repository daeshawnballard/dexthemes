---
title: Codex Theme Import Handoff
description: Copy a validated DexThemes import string and complete the theme change explicitly in Codex Appearance settings.
slug: codex-theme-import
kind: feature
section: Features
answer: DexThemes prepares and copies a validated codex-theme-v1 payload, then you open Codex Settings, choose Appearance, select Import theme, paste, and approve.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-08-14
testedWith: DexThemes import and clipboard source tests reviewed 2026-08-14; installed Codex desktop 26.721.81911 build 5973 appearance registry previously observed 2026-07-30
related: /features/interactive-previews, /features/theme-builder, /guides/codex-theme-import-troubleshooting
---

DexThemes uses an explicit handoff for Codex theme import. It generates a complete `codex-theme-v1:` string, copies that string when clipboard access is available, and can open the generic Codex Settings route on desktop. You still choose Appearance, choose Import theme, paste, and approve the change inside Codex.

## The safe import path

For a catalog theme or builder draft:

1. Select the exact dark or light variant you want.
2. Choose **Copy theme**.
3. Open Codex Settings if it did not open automatically.
4. Choose **Appearance**.
5. Choose **Import theme** for the intended variant.
6. Paste the full string beginning with `codex-theme-v1:`.
7. Review and import it in Codex.

On compact layouts, DexThemes prioritizes copying so you can paste later on a device running Codex. In the MCP app, the handoff card exposes the exact string and a **Copy theme** control, then confirms **Theme copied to clipboard** before opening Settings. If clipboard permission is blocked, the string remains selectable and the Settings action is kept separate.

## What DexThemes validates

The shared import contract checks the selected variant before returning a string. It requires:

- an available `dark` or `light` variant;
- six-digit hex values for surface, ink, accent, added, removed, and skill colors;
- an integer contrast value from 0 through 100;
- valid optional font values and window-opacity settings;
- a supported Codex code-theme family for the selected variant; and
- no more than the supported number of accent choices.

The serialized payload contains the canonical code-theme family, selected variant, surface and ink colors, accent, contrast, fonts, window opacity, and semantic colors. Known legacy module-style identifiers are normalized to the registered Codex family where the mapping and variant are valid. Unknown or incompatible identifiers are rejected instead of being copied as if they were safe.

That distinction prevents a common failure: a bundle filename can look like a code-theme ID without being the identifier Codex registers for import.

## What the handoff does not do

DexThemes does not silently apply the theme. It does not write a Codex configuration file, change a global appearance setting, or claim that opening Settings proves the theme loaded. The generic `codex://settings` handoff does not reliably jump straight into Appearance, so the Appearance and Import theme selections remain user steps.

Copying a community theme also does not publish, like, or edit it. It only prepares a payload for the selected variant. A copy event may be recorded as product activity, but that event is not evidence that Codex accepted or kept the theme.

## Why an import can still fail

Codex owns the import parser and appearance runtime. That dependency can change independently of DexThemes. A structurally valid payload may still fail if:

- the clipboard contains only the JSON and not the `codex-theme-v1:` prefix;
- extra quotation marks or other text were copied;
- the chosen theme does not include the intended variant;
- Codex changed a supported code-theme family or payload rule;
- the final import was not approved; or
- a referenced font is unavailable in the local environment.

Copy the string again before editing it by hand. Confirm the prefix, select the matching dark or light import action, and use the [Codex theme import troubleshooting guide](/guides/codex-theme-import-troubleshooting) if Codex rejects it.

## Who this is for

The handoff is for anyone who wants a reproducible bridge from a [theme preview](/features/interactive-previews) or [custom theme builder](/features/theme-builder) into Codex without granting a website permission to mutate local app files. It keeps the final appearance change visible and reversible inside the application that owns it.

DexThemes is community-built, open source, and not affiliated with OpenAI. Generation and validation are DexThemes capabilities; acceptance in a particular Codex build must be verified in that build.
