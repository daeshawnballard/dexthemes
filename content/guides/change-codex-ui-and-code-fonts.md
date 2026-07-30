---
title: Change Codex UI and Code Fonts
description: Change interface and code fonts from Codex Appearance and understand how font names behave in theme imports.
slug: change-codex-ui-and-code-fonts
kind: guide
section: Guides
answer: Open Codex Settings, choose Appearance, then set the UI font and code font independently and verify that each is installed and readable.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: Official Codex settings documentation retrieved 2026-07-30 and DexThemes current theme contract
related: /guides/codex-theme-accessibility, /reference/codex-theme-format, /guides/how-to-install-a-codex-theme
---

Change fonts from Codex Appearance whenever possible: open Settings, choose Appearance, then choose the UI and code fonts independently. This keeps the choice visible and reversible in the app instead of relying on a hand-edited theme payload.

OpenAI's [official Codex desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings) confirms that Appearance supports changing UI and code fonts. The documentation does not promise that every font is bundled or available on every computer.

## Change the fonts in Appearance

1. Open Codex Settings from the app menu.
2. Choose **Appearance**.
3. Locate the UI font control and choose the font used for navigation, labels, messages, and app chrome.
4. Locate the code font control and choose the font used for code-oriented content.
5. Return to a task that contains prose, inline code, a fenced code block, and a diff.
6. Inspect the result at your normal text size and display scaling.
7. If characters are missing, spacing is uneven, or the interface becomes tiring to scan, return to Appearance and choose another font.

The exact control layout and font list can change between Codex releases. Use the labels presented by your installed app rather than following screenshots from an older build.

## Pick a UI font for sustained reading

The UI font appears across more than headings. Test:

- Long assistant responses.
- Small secondary labels and timestamps.
- File and project names.
- Buttons, menus, and settings.
- Similar characters such as uppercase `I`, lowercase `l`, and the number `1`.
- Punctuation, emoji, and any writing systems you use.

A display font can look appealing in a title but perform poorly in dense interface text. Prefer clear shapes, adequate x-height, and a range of weights that keeps hierarchy visible.

## Pick a code font for precise scanning

The code font should make structurally similar characters easy to distinguish. Check:

- `0`, `O`, and `o`.
- `1`, `l`, and `I`.
- Braces, brackets, parentheses, pipes, and backticks.
- Underscores at the current line height.
- Alignment in diffs and multi-line snippets.
- Italics and bold if syntax highlighting uses them.

Ligatures are a preference, not a requirement. If a programming font combines sequences such as arrows or comparison operators, confirm that the result helps rather than hides the original characters.

## Understand fonts in a DexThemes import

The current DexThemes import contract includes:

```json
"fonts":{"code":null,"ui":null}
```

Each value can be a string of at most 100 characters or `null`. A string names a font; the theme does not embed or download the font file. `null` means the payload does not name that font. The effective result remains Codex-owned, so do not assume that `null` will preserve a particular previous choice across every version.

Some catalog themes can carry explicit font names. The current DexThemes builder, however, focuses on colors and does not expose UI or code font controls. Builder-created imports therefore use `null` font values. Set fonts in Codex Appearance after importing a builder theme.

## Troubleshoot missing or unexpected fonts

### The selected font is not visible

Confirm that the font is installed for the current operating-system user and that its family name matches what the app shows. Restarting Codex may help it discover a newly installed system font, but availability and refresh behavior belong to the operating system and Codex.

### The other computer looks different

An import string carries font names, not font binaries or licenses. Install a properly licensed copy of the font on the other computer, or choose an available fallback in Appearance. Read [Move a Codex theme to another computer](/guides/move-a-codex-theme-to-another-computer).

### A new theme changed the typography

Inspect the import string's `theme.fonts` object. If it contains explicit names, the theme is requesting those fonts. Prefer adjusting the controls in Appearance rather than editing compact JSON unless you understand the [Codex theme format](/reference/codex-theme-format).

### Code alignment looks wrong

Choose a monospaced code font and test spaces, tabs, wide glyphs, and diff markers. A font advertised as monospaced can still contain glyph or fallback behavior that changes the perceived alignment for particular scripts.

## Check accessibility, not only style

Font choice and color contrast interact. Thin strokes can appear fainter than the nominal color values suggest, especially with antialiasing. W3C's [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) recommends choosing stronger or thicker lines, or exceeding minimum contrast, when a thin or unusual font renders too faintly.

Test at different brightness levels and with the text scaling you actually use. If your work involves long reviews, readability is more valuable than matching a brand typeface exactly.

DexThemes is community-built and is not affiliated with OpenAI. It can carry a font name in the import format, but it cannot guarantee font installation, licensing, glyph coverage, or rendering on a recipient's computer.

## Related guides

- [Design an accessible Codex theme](/guides/codex-theme-accessibility)
- [Inspect font fields in the theme format](/reference/codex-theme-format)
- [Install a Codex theme](/guides/how-to-install-a-codex-theme)
- [Compare Codex app and CLI themes](/guides/codex-app-themes-vs-cli-themes)
