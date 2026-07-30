---
title: Codex App Themes vs CLI Themes
description: Understand why Codex desktop Appearance imports and Codex CLI syntax themes use different formats and settings.
slug: codex-app-themes-vs-cli-themes
kind: guide
section: Guides
answer: DexThemes codex-theme-v1 strings target Codex desktop Appearance, while the Codex CLI uses the /theme picker and optional .tmTheme files for terminal syntax highlighting.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: Official Codex documentation retrieved 2026-07-30 and DexThemes current source
related: /guides/how-to-install-a-codex-theme, /reference/codex-theme-format, /guides/change-codex-ui-and-code-fonts
---

Codex desktop themes and Codex CLI themes are separate customization systems. A DexThemes `codex-theme-v1:` string changes the desktop app's Appearance after you import it. The CLI `/theme` command changes syntax highlighting in the terminal UI and can load a TextMate `.tmTheme` file.

Do not paste one format into the other. DexThemes is community-built and is not affiliated with OpenAI.

## Codex desktop Appearance themes

A DexThemes app import carries a small appearance payload:

- A `dark` or `light` variant.
- Main surface and foreground colors.
- An accent color.
- Added, removed, and skill semantic colors.
- A contrast parameter.
- UI and code font names or `null`.
- A registered code-theme family ID.
- An opaque-windows preference.

The copied value begins with `codex-theme-v1:`. To use it, open Codex Settings, choose Appearance, choose Import theme, paste, review, and approve. The [official desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings) says Appearance can change the base theme, accent, background, foreground, and UI and code fonts, and can share a custom theme.

This theme affects the graphical Codex workspace. DexThemes can prepare and copy the payload, but it does not claim a verified public route that silently applies it.

## Codex CLI syntax themes

The CLI theme controls syntax highlighting for fenced Markdown code blocks and file diffs in the terminal UI. According to OpenAI's [official CLI customization guide](https://learn.chatgpt.com/docs/cli-customization):

1. Run `/theme` in an interactive Codex CLI session.
2. Preview a theme in the picker.
3. Confirm it to save the selection to `tui.theme` in `$CODEX_HOME/config.toml`.

For a custom CLI theme, place a `.tmTheme` file in `$CODEX_HOME/themes`, then choose it from `/theme`.

A `.tmTheme` file is a TextMate-style syntax-highlighting definition. It can describe many token scopes and editor colors. It is not a `codex-theme-v1` string, and the CLI customization documentation does not describe the desktop Appearance import as a CLI theme source.

## Why direct conversion is incomplete

The two formats express different things.

The desktop import has broad application colors plus a `codeThemeId` that chooses an existing syntax-theme family. It carries only three named semantic colors beyond the main surface, foreground, and accent.

A `.tmTheme` can assign colors to many token scopes, such as comments, strings, keywords, types, and functions. It does not inherently describe every piece of graphical app chrome represented by a desktop custom theme.

As a result:

- Converting a desktop import to `.tmTheme` requires designing or mapping token scopes that are absent from the source payload.
- Converting a `.tmTheme` to a desktop import requires selecting a small set of representative app colors and a code-theme family.
- A mechanical conversion may preserve a general mood but cannot guarantee visual equivalence.

If you build a companion theme, treat it as a coordinated design pair and test each surface independently.

## Choose the right workflow

Use a DexThemes app import when you want to change the graphical Codex workspace, including its main surface, foreground, accent, semantic colors, and optional fonts.

Use `/theme` when you want to change syntax highlighting in the Codex CLI without redesigning the desktop app.

Use a custom `.tmTheme` when the CLI picker does not provide the token palette you need and you are comfortable authoring TextMate scopes.

Use both systems when you work in both the app and CLI. Choose visually related palettes, but save and move their artifacts separately.

## Common mistakes

### Putting the import string in the CLI themes folder

The CLI looks for `.tmTheme` files there. A plain `codex-theme-v1:` string is not that format. Keep the string in a text note or import it through desktop Appearance.

### Pasting a .tmTheme file into Appearance

The Appearance importer expects the Codex theme import contract, not an XML or property-list TextMate document. Select the `.tmTheme` through the CLI `/theme` picker instead.

### Assuming settings automatically mirror

The official CLI guide says its choice persists to `tui.theme`. The desktop guide describes Appearance controls. These are different settings surfaces. Verify each after moving computers, changing `$CODEX_HOME`, or updating Codex.

### Treating a codeThemeId as a .tmTheme filename

The app import's `codeThemeId` is a registered family ID. It is not necessarily the filename of a bundled syntax definition. Use a DexThemes-generated string or a canonical ID from the [format reference](/reference/codex-theme-format).

## Keep a portable pair

For a theme you use in both surfaces, archive:

- One desktop import string for each app variant.
- The custom CLI `.tmTheme` file, if you created one.
- A short note naming the CLI picker selection when you use a built-in theme.
- Screenshots or color notes only as supporting references, not as installable artifacts.

Never include account tokens, private paths, repository details, or other secrets in the theme files or sharing notes.

## Related guides

- [Install a Codex app theme](/guides/how-to-install-a-codex-theme)
- [Read the desktop import format](/reference/codex-theme-format)
- [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts)
- [Move a desktop theme to another computer](/guides/move-a-codex-theme-to-another-computer)
