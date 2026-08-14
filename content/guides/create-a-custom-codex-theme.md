---
title: Codex Theme Generator: Create a Custom Theme
description: Use the DexThemes Codex theme generator to build and preview dark or light palettes, then explicitly import the selected variant in Codex Appearance.
slug: create-a-custom-codex-theme
kind: guide
section: Guides
answer: To create a custom Codex theme, use the DexThemes theme generator to edit a dark or light palette, preview it locally, copy that variant's complete codex-theme-v1 string, and explicitly review and import it in Codex Appearance.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-08-14
testedWith: DexThemes theme builder, clipboard failure path, and import-contract source reviewed 2026-08-14; ChatGPT desktop 26.803.41515 build 6321 and official OpenAI Appearance documentation previously reviewed 2026-08-09
related: /features/theme-builder, /features/codex-theme-import, /guides/create-dark-and-light-codex-themes, /guides/codex-theme-accessibility
---

The [DexThemes](/) Codex theme generator helps you create a custom Codex theme without editing app files or configuration by hand. Build one palette, inspect it in a live DexThemes preview, then copy a single dark or light import string. Copying does not require an account. Codex—not DexThemes—decides whether to accept and render that string.

The final change is always explicit. After DexThemes copies a theme, you choose **Appearance**, select the matching import action in Codex, paste the complete string, review it, and approve the import. DexThemes can open generic Codex Settings on desktop after copying, but it cannot silently apply a theme or jump directly to Appearance.

DexThemes is community-built and is not affiliated with OpenAI.

## What the Codex theme generator can edit

Start the builder with **Create a theme**. Give the draft a recognizable name, then choose **Dark** or **Light**. The builder keeps separate local working drafts for the two variants, so switching does not discard the other palette.

For the active variant, you can enter exact six-digit hex colors for:

- **Surface** and **Text**, the primary background and foreground;
- **Accent**, for emphasized and selected interface elements;
- **Sidebar** and **Code background**, to shape the DexThemes preview;
- **Strings / Added** and **Errors / Removed**, the semantic diff colors; and
- **Functions / Skill**, for the remaining syntax or skill highlight.

The browser preview updates as you enter valid values. **Color Me Lucky** generates a palette and name for the active variant. **Reset** clears the current builder working state and restores both variant drafts to their defaults. Neither action installs anything in Codex.

## Start with the colors people read most

Build from broad, repeated surfaces toward infrequent semantic signals:

1. Choose **Surface** and **Text** first. Read a full response, filename, timestamp, and small label in the preview—not just a large heading.
2. Add an **Accent** that is easy to distinguish from body text and works on both the main surface and nearby panels.
3. Separate the sidebar and code area gently. Large brightness jumps can make a workspace feel fragmented.
4. Set added and removed colors that remain distinct without relying only on green versus red. Check the colors against the surfaces where a diff will appear.
5. Set the function or skill color last, making sure it does not look like an error or destructive state.

Use `#RRGGBB` values such as `#1A1A2E`. The builder accepts six-digit hex colors; it does not accept short hex, CSS color names, gradients, or variables.

## Design dark and light as two separate themes

Dark and light are separate designs, not simple inversions. A dark palette can need softer bright accents to avoid glare; a light palette usually needs darker semantic colors and restrained surface tints to preserve hierarchy.

Switch to the second variant only after the first has a coherent reading relationship. The builder retains the other draft in the current browser profile, but each variant becomes its own `codex-theme-v1` string. Copy, import, and verify the dark and light themes one at a time. For a paired workflow, read [Create paired dark and light themes](/guides/create-dark-and-light-codex-themes).

## Know what reaches Codex and what stays in the preview

The builder preview is deliberately richer than the serialized import. For the selected variant, DexThemes validates and emits the main surface, primary text, accent, semantic colors, a code-theme family, and its current contrast parameter. The current builder defaults that parameter to `60` for dark and `45` for light; it does not expose a contrast slider.

Two builder controls are preview-only at the import boundary: **Sidebar** and **Code background** do not become separate fields in the current `codex-theme-v1` payload. Theme name, catalog data, and authorship also stay out of that payload.

The builder does not provide UI-font or code-font controls. The generated builder payload leaves those font fields unset, so it does not install fonts or guarantee a font choice. OpenAI’s current [desktop Appearance documentation](https://learn.chatgpt.com/docs/reference/settings) describes base-theme, color, UI-font, and code-font settings; make those font choices in the app itself when needed.

## Preview first, then import and verify

DexThemes renders a Codex-like workspace to help you judge hierarchy, code, and diffs before importing. It is a design preview, not proof of installed behavior. Codex version, operating system, display profile, available fonts, and the app’s import parser can all affect the final result.

Use the preview to catch obvious problems, then make the installed app the acceptance test:

- Read a long response and small text in Codex.
- Inspect code, comments, and both diff states.
- Check selected and inactive controls.
- Revisit the palette at normal screen brightness.
- Switch away and back to confirm the variant remains as expected.

A valid preview or a copied string does not establish that every Codex build will accept, retain, or render the theme identically.

## Import the selected variant with approval

1. In the builder, select the exact **Dark** or **Light** variant you want.
2. Choose **Copy theme**. DexThemes confirms **Theme copied to clipboard** and can open generic Codex Settings on desktop; on a compact layout, open Codex later.
3. Confirm that the clipboard begins with `codex-theme-v1:`. Copy the complete string; do not copy only the JSON after the prefix.
4. In Codex, open **Settings** → **Appearance**.
5. In the matching Dark or Light section, choose **Import**, paste the string into the **Import theme** dialog, review the string, and approve the import.
6. Inspect the installed result before treating the theme as complete.

This handoff is intentionally visible and reversible. Copying a theme does not write a Codex configuration file, change a global setting, or prove that Codex accepted it. For more detail, see [Codex theme import handoff](/features/codex-theme-import) and the [Codex theme format reference](/reference/codex-theme-format).

## Keep the current limits in view

Builder drafts are stored in the current browser profile for convenience. They are not a portable backup or guaranteed cross-device sync, so save a finished import string in a plain-text file if the design matters to you.

The generator cannot guarantee universal compatibility, set every Appearance preference, or make an import approval disappear. If Codex rejects a copied theme, regenerate the string, make sure the variant and import action match, preserve the full prefix, and test again in the installed app. See [Codex theme import troubleshooting](/guides/codex-theme-import-troubleshooting) for a focused checklist.

## Share or publish separately

To share a draft, copy the currently selected variant’s import string and send it as plain text. The recipient still imports and approves it in their own Codex settings. To share both variants, copy each one separately.

Community publication is a different action from creating or copying a theme. It requires sign-in and server-side validation, including public-text and palette-protection checks. Treat a submission as published only after DexThemes confirms success and the theme is available in the public community catalog.

## Related guides

- [Explore the Custom Codex Theme Builder](/features/theme-builder)
- [Create paired dark and light Codex themes](/guides/create-dark-and-light-codex-themes)
- [Design an accessible Codex theme](/guides/codex-theme-accessibility)
- [Share a custom Codex theme](/guides/share-a-custom-codex-theme)
