---
title: Create a Custom Codex Theme
description: Build and preview a focused dark or light Codex palette with the DexThemes theme builder.
slug: create-a-custom-codex-theme
kind: guide
section: Guides
answer: Open the DexThemes builder, choose a dark or light variant, tune the surface, text, accent, code, diff, and skill colors, then copy the generated import string and approve it in Codex Appearance.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current theme builder and installed Codex desktop 26.721.81911 build 5973 appearance registry
related: /guides/share-a-custom-codex-theme, /guides/create-dark-and-light-codex-themes, /guides/codex-theme-accessibility
---

The fastest way to make a custom Codex theme is to start with one variant, establish readable surface and text colors, then tune accents and semantic colors in the DexThemes preview. Copying a custom theme does not require an account. Sign-in is only needed when you choose to submit a theme to the community.

DexThemes is a community-built project and is not affiliated with OpenAI. Its builder prepares the current `codex-theme-v1` import format; Codex controls whether the payload is accepted and how it is rendered.

## Build the first variant

1. Open DexThemes and choose **Create a theme**.
2. Give the theme a useful name. A name helps you identify and share the design, although the generated Codex import itself does not contain a display-name field.
3. Choose **Dark** or **Light** as the active variant.
4. Set **Surface** and **Text** first. These establish the main reading relationship.
5. Choose an **Accent** that remains distinct on the surface without competing with body text.
6. Adjust **Sidebar** and **Code Background** to separate regions subtly.
7. Set **Diff Added**, **Diff Removed**, and **Functions / Skill** colors.
8. Tune the contrast control and inspect the live workspace preview.
9. Copy the generated theme string.
10. In Codex, open Settings, choose Appearance, choose Import theme, paste the full string, and approve it.

The builder accepts exact six-digit hex colors such as `#1A1A2E`. It keeps the active contrast value between `0` and `100`. That contrast control is a DexThemes theme parameter, not a WCAG contrast ratio. Measure actual foreground and background pairs separately when accessibility matters.

## Design in a useful order

Color decisions become easier when you work from broad surfaces toward rare signals.

### Start with surface and ink

`surface` is the main background and `ink` is the primary foreground. Test paragraphs, filenames, timestamps, and long assistant responses. A palette that looks dramatic in a swatch can become tiring across a full task.

### Separate regions without over-layering

The builder previews sidebar and code-background colors so you can judge hierarchy. Those fields help the DexThemes preview, but they are not emitted as separate fields in the current Codex import payload. The final import carries the main `surface`, `ink`, and other supported appearance values. Treat the installed result as authoritative.

### Reserve accent for interaction

Use the accent for selected and emphasized elements, not as a substitute for readable text. Test it on both the main surface and nearby panels. Highly saturated colors can appear to vibrate against near-black backgrounds.

### Make semantic colors distinguishable

Added and removed diffs communicate opposite meanings. Give each enough contrast against the surfaces where diffs appear, and do not rely only on a red-versus-green distinction. The skill color should be recognizable without being confused with errors, destructive actions, or the primary accent.

## Use the preview as a design tool

DexThemes renders a Codex-like workspace so you can compare text, code, diffs, and controls while editing. It is not a promise that every Codex version, operating system, display profile, or font will render identically.

Before keeping the theme:

- Read a full paragraph, not only a title.
- Inspect punctuation and comments in code.
- Compare added and removed diff content.
- Check selected, inactive, and focus states.
- Reduce screen brightness and check the palette again.
- Import it into Codex and repeat the review there.

The actual Codex import is the acceptance test. A valid preview and a valid string do not prove that a particular installed build will persist the theme.

## Create the second variant intentionally

Switching the builder between dark and light preserves separate variant drafts in the current browser. Design the second palette rather than mechanically inverting the first. Light themes usually need restrained tinted surfaces and darker semantic colors; dark themes often need less-saturated bright accents to avoid glare.

Once both are ready, copy and import them one at a time. Read [Create dark and light Codex themes](/guides/create-dark-and-light-codex-themes) for a paired workflow.

## Understand current builder limits

The current builder focuses on color and contrast. It does not expose UI-font or code-font fields, even though Codex Appearance supports changing those fonts according to the [official settings documentation](https://learn.chatgpt.com/docs/reference/settings). Use Codex Appearance for font changes and read [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts).

Builder drafts are saved in browser storage for convenience. Do not treat that as a portable backup or guaranteed cross-device sync. Copy each finished import string into a plain-text file if the theme matters to you.

## Share or submit

Use **Share theme** in the builder to copy the current variant's import string. You can send that text directly to someone you trust. A recipient still approves the import in their own Codex Appearance settings.

If you want the theme considered for the community catalog, sign in and choose the community submission flow. A submission is subject to the current validation, name checks, protected-palette rules, moderation, and publication state. Do not describe a submitted theme as published until it is actually visible in the public community catalog.

## Related guides

- [Share a custom Codex theme](/guides/share-a-custom-codex-theme)
- [Create paired dark and light themes](/guides/create-dark-and-light-codex-themes)
- [Design an accessible Codex theme](/guides/codex-theme-accessibility)
- [Read the theme format reference](/reference/codex-theme-format)
