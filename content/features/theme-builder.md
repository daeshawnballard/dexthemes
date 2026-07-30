---
title: Custom Codex Theme Builder
description: Design a dark or light Codex palette with live previews, semantic colors, local drafts, and an explicit import handoff.
slug: theme-builder
kind: feature
section: Features
answer: The DexThemes builder lets you name and edit a dark or light palette, preview it live, copy it for Codex, or sign in to publish an original community theme.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 browser builder source as of 2026-07-30
related: /features/color-me-lucky, /features/community-themes, /guides/create-a-custom-codex-theme
---

The DexThemes theme builder turns a set of color decisions into a previewable Codex theme draft. You can build and copy a theme without an account. GitHub sign-in is requested only when you choose to submit the result to the public community catalog.

## What you can edit

The browser builder keeps separate working drafts for dark and light. Each variant includes controls for:

- surface and primary text;
- accent;
- sidebar and code background;
- strings or added lines;
- errors or removed lines; and
- functions or skill highlights.

Color inputs accept exact six-digit hex values. As you change a valid value, DexThemes updates the surrounding shell and central Codex-style preview. Switching variants preserves the other variant's working colors, and the draft is stored locally so an accidental refresh does not immediately discard it.

The builder also includes a reset action and [Color Me Lucky](/features/color-me-lucky). Reset returns the working state to the builder defaults. Color Me Lucky gives the active variant a generated palette and name that you can continue editing.

## From draft to Codex

The builder prepares the same validated import format used by catalog themes. It does not install or silently apply anything. The supported path is:

1. Give the draft a useful name.
2. Choose and review the intended dark or light variant.
3. Use the builder's Codex action to copy the import string.
4. Open Codex Settings.
5. Choose Appearance, choose Import theme, paste, and approve.

On desktop, DexThemes can open generic Codex Settings after the copy succeeds. On compact layouts it copies the theme for later. Read [Codex theme import](/features/codex-theme-import) for the exact handoff and its limits.

## Publishing to the community

Publication is a separate action from building or copying. A signed-in creator can submit at least one dark or light variant. The server derives the author from the authenticated account and rechecks the submission rather than trusting the browser.

Current publication checks include:

- a kebab-case, unique, non-reserved theme ID;
- a name from 1 through 80 characters;
- a summary from 1 through 240 characters;
- at least one complete variant;
- valid supported code-theme families and six-digit colors;
- a bounded accent list;
- text moderation for the public ID, name, and summary;
- original public-facing wording; and
- protection against palettes that are too close to reserved Codex, DexThemes, or reward themes.

A theme may be published with one variant. Signed-in visitors can then request the missing variant, and the creator can reopen the builder with that missing side prepared. Only the theme author can add it. Completing the pair can register the corresponding account achievement.

## Who the builder is for

It works well for people who already have brand or mood colors, creators who want semantic code colors rather than a simple background swap, and community authors responding to requests for a missing dark or light version. The [custom theme guide](/guides/create-a-custom-codex-theme) provides a practical sequence for choosing contrast and semantic roles.

## Limits and design boundaries

The builder does not expose every possible Codex appearance setting. Its preview is a DexThemes simulation, so it cannot guarantee typography, material effects, or every interface role in a specific Codex build. The import contract includes a narrower set of fields than the preview model, and Codex remains the final authority for what is accepted and rendered.

Local draft storage belongs to the current browser profile; it is not a synced private cloud workspace. Publication, moderation, variant additions, and account achievements require a working signed-in service. Passing client checks is not a promise that a server-side submission will be accepted.

DexThemes is community-built, open source, and not affiliated with OpenAI.
