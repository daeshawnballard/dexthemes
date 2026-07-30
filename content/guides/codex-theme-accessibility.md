---
title: Codex Theme Accessibility
description: Test text, controls, semantic colors, fonts, and dark and light variants before sharing a Codex theme.
slug: codex-theme-accessibility
kind: guide
section: Guides
answer: Measure every important foreground and background pair, avoid color-only meaning, test real code and diffs in Codex, and keep a comfortable fallback theme available.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current builder and WCAG 2.2 contrast guidance
related: /guides/create-dark-and-light-codex-themes, /guides/change-codex-ui-and-code-fonts, /guides/create-a-custom-codex-theme
---

An accessible Codex theme needs more than an attractive main swatch. Measure text against every surface it actually touches, keep semantic states distinguishable without hue alone, test fonts and focus states, and verify the imported theme in Codex.

DexThemes can help you preview and serialize a palette, but it does not certify WCAG conformance. Its contrast control is a theme parameter from `0` to `100`; it is not a calculated WCAG contrast ratio.

## Start with measurable contrast

W3C's [WCAG 2.2 text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) sets a Level AA minimum of `4.5:1` for normal text and `3:1` for large text. These are threshold values and should not be rounded up. The same guidance notes that thin or unusual fonts can render fainter than their nominal colors suggest.

Use a contrast calculator for each pair that appears in practice:

- Primary ink on the main surface.
- Secondary text on the main surface.
- Text on sidebar and panel surfaces.
- Code text on the code background.
- Accent text or icons on their background.
- Added and removed diff text on diff backgrounds.
- Focus indicators against adjacent colors.

Aim above the minimum when possible. Displays, antialiasing, glare, font weight, and color profiles can reduce practical readability.

## Check non-text controls

W3C's [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) covers visual information needed to identify user-interface components and states. A palette should keep boundaries, selected states, and focus indicators visible against adjacent colors.

The current DexThemes import does not expose every component-state color. Some states come from Codex itself. That makes real-app testing essential: a strong main foreground does not guarantee that every divider, disabled control, or focus ring will remain clear.

## Do not rely on red versus green

DexThemes themes include `diffAdded` and `diffRemoved`. Hue can reinforce their meaning, but it should not be the only signal.

When inspecting the real Codex diff:

- Confirm that addition and removal markers remain visible.
- Compare the colors in grayscale or with a color-vision simulation.
- Make their luminance sufficiently different from the surrounding surface.
- Check that text remains legible inside tinted diff regions.
- Avoid assigning the same visual weight to diff states and the primary accent.

Codex controls the labels, symbols, and layout around these colors. The theme author controls whether the chosen colors preserve or undermine those cues.

## Test the skill and accent colors

The `skill` semantic color should not look like an error, deletion, or destructive action. The main accent should remain recognizable across the surfaces where Codex uses it.

Test both colors on:

- The main surface.
- Panels or sidebars.
- Selected and unselected states.
- Nearby code or diff content.
- Bright and dim displays.

Avoid using a highly saturated color for large areas of text. Saturation can create visual vibration, especially on near-black backgrounds.

## Choose readable fonts

OpenAI's [official Codex settings documentation](https://learn.chatgpt.com/docs/reference/settings) says Appearance supports separate UI and code fonts. Font choice affects accessibility even when the hex-color math is unchanged.

For the UI font, test long paragraphs, small labels, and similar characters. For the code font, test punctuation, brackets, backticks, alignment, and confusable glyphs such as `0` and `O`.

The DexThemes import can name fonts but cannot embed them. Missing fonts can trigger fallback behavior that changes weight, width, and glyph coverage. Test on the recipient platform if the theme depends on a particular typeface.

## Design dark and light independently

An accessible dark theme is not an inverted light theme. Dark mode can produce halation or glare when text is too bright; light mode can hide secondary information in pale grays.

For each variant:

1. Measure primary ink against surface.
2. Measure semantic colors in their actual contexts.
3. Review long-form reading comfort.
4. Test code and diffs.
5. Check focus, selection, and disabled states.
6. Test at multiple brightness levels.
7. Import and inspect in Codex.

Keep each variant's results separately. One passing palette says nothing about the other.

## Test beyond the preview

The DexThemes preview is a design aid, not an accessibility conformance test and not a complete Codex emulator. It cannot guarantee:

- Exact rendering across Codex versions.
- Operating-system font smoothing.
- Every hover, focus, error, or disabled state.
- Screen-reader behavior.
- Keyboard navigation behavior.
- User display settings or assistive-technology transformations.

Import the theme into Codex and use a representative task. Navigate with the keyboard, inspect focus visibility, read a long response, scan a complex diff, and return to Appearance without relying on memory of where the controls are.

## Run a practical acceptance checklist

Before sharing a theme, verify:

- Primary body text meets your chosen contrast target.
- Small and secondary text remains readable.
- Code punctuation and comments are distinct.
- Added and removed diffs are distinguishable without hue alone.
- Accent, skill, and destructive states do not look interchangeable.
- Focus indicators are visible.
- Dark and light imports both work when provided.
- The chosen fonts exist and remain legible.
- A built-in fallback theme is easy to restore.

Record the Codex version and test date. Theme rendering and accepted code-theme families can change after an app update.

## Describe the result honestly

Use language such as “tested against WCAG text-contrast targets in these sampled pairs” rather than “fully accessible.” Full accessibility includes behavior, structure, assistive technology, user preferences, and states beyond the palette.

DexThemes is community-built and is not affiliated with OpenAI. Community moderation and format validation do not constitute accessibility review or OpenAI endorsement.

## Related guides

- [Create dark and light variants](/guides/create-dark-and-light-codex-themes)
- [Change UI and code fonts](/guides/change-codex-ui-and-code-fonts)
- [Create a custom Codex theme](/guides/create-a-custom-codex-theme)
- [Inspect the theme format](/reference/codex-theme-format)
