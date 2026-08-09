---
title: Codex App Themes vs CLI Themes
description: Compare Codex app themes and Codex CLI themes, including desktop Appearance imports, .tmTheme files, and IDE-extension boundaries.
slug: codex-app-themes-vs-cli-themes
kind: guide
section: Guides
answer: Codex app themes and Codex CLI themes are separate. Use a DexThemes codex-theme-v1 import for the Codex view's desktop Appearance controls and /theme with a .tmTheme file for Codex CLI syntax highlighting. Neither is a documented Codex IDE-extension theme import.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-08-09
testedWith: Official OpenAI desktop, CLI, and IDE documentation, DexThemes theme-contract source, and ChatGPT desktop 26.803.41515 build 6321 reviewed 2026-08-09.
related: /guides/how-to-install-a-codex-theme, /reference/codex-theme-format, /guides/change-codex-ui-and-code-fonts
---

Codex app themes and Codex CLI themes can share a visual idea, but they are different customization systems. Use a DexThemes `codex-theme-v1:` value for **the Codex view in the ChatGPT desktop app** and a `.tmTheme` file for **Codex CLI** syntax highlighting. Do not paste either artifact into the other surface.

The [official CLI customization guide](https://learn.chatgpt.com/docs/cli-customization) and [desktop settings reference](https://learn.chatgpt.com/docs/reference/settings) describe separate controls and persistence paths. OpenAI also describes Codex as a [separate view in the ChatGPT desktop app](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex). DexThemes is community-built and is not affiliated with OpenAI.

## Codex app themes vs Codex CLI themes: what changes?

The surface you want to change determines the theme artifact.

- **Codex view in the ChatGPT desktop app:** Appearance controls the app’s base theme, accent, background, foreground, and UI and code fonts. DexThemes builds its `codex-theme-v1:` payload for this desktop Appearance import flow.
- **Codex CLI:** the terminal UI syntax-highlights fenced Markdown code blocks and file diffs. Its `/theme` picker selects the CLI theme and saves the choice to `tui.theme` in `$CODEX_HOME/config.toml`.
- **Codex IDE extension:** this is a Codex integration inside an editor. It is neither the desktop app’s Appearance importer nor the CLI terminal UI, so treat its visual settings as an editor concern.

The same theme name, a similar palette, or a shared account does not make these settings interchangeable.

## Codex app themes use `codex-theme-v1`

A DexThemes app-theme import is one text payload beginning with the literal `codex-theme-v1:` prefix followed by JSON. It represents one selected dark or light desktop Appearance variant and can carry app colors, font preferences, semantic colors, and a `codeThemeId` selection.

That payload is an explicit handoff, not a command that silently changes a running app. Codex owns the review and approval step. For the exact copy-and-import path, use [How to install a Codex theme](/guides/how-to-install-a-codex-theme); for the payload fields and their current DexThemes validation rules, use the [Codex theme format reference](/reference/codex-theme-format).

`codeThemeId` is especially easy to misread. Inside a `codex-theme-v1` payload, it names a registered desktop code-theme family. It is not a custom CLI theme file, a `.tmTheme` filename, or a path you should place in `$CODEX_HOME/themes`.

## Codex CLI themes use `/theme` and `.tmTheme`

The Codex CLI has its own theme picker. In an interactive CLI session, run `/theme` to preview a choice and save it. OpenAI’s current documentation says that selection is stored as `tui.theme` in `$CODEX_HOME/config.toml`.

For a custom CLI theme, place a `.tmTheme` file in `$CODEX_HOME/themes`, then select it from the `/theme` picker. The CLI guide documents this file-based workflow for terminal syntax highlighting; it does not describe a desktop `codex-theme-v1:` payload as a CLI theme source.

This boundary matters: the CLI guide documents terminal UI syntax highlighting for code blocks and file diffs, not a way to set the ChatGPT desktop app’s Appearance controls.

## Why `codex-theme-v1` is not a `.tmTheme`

The formats solve different problems and have different delivery paths.

- A `codex-theme-v1:` value is an inline desktop Appearance import payload. It carries a compact set of desktop appearance choices for one variant and is reviewed in the app.
- A `.tmTheme` value is a custom theme file placed in the Codex CLI themes directory and selected from the terminal’s `/theme` picker.

They can express related color intent, but OpenAI does not document a one-to-one conversion between them. A desktop import has app-level colors and a desktop `codeThemeId`; a custom CLI theme is used by the terminal highlighting flow. A mechanical conversion could omit values, make different choices, or produce a result that looks different on the two surfaces.

If you create a companion pair, treat the desktop import and the CLI file as two independently testable artifacts. Choosing a CLI theme does not demonstrate that the desktop app changed, and importing a desktop payload does not establish a CLI selection.

## The IDE extension is a third boundary

The [official Codex IDE guide](https://learn.chatgpt.com/docs/codex/ide) describes Codex working beside your code in VS Code-compatible editors, Xcode, and JetBrains IDEs. That is an editor integration, not the desktop Appearance system or the CLI theme picker.

Use the host editor’s own theme and appearance controls for the editor workbench. Some editors may support TextMate-compatible themes through their own mechanisms, but that does not make the CLI’s `$CODEX_HOME/themes` folder an IDE-extension configuration path. The official Codex IDE documentation used here does not define either `codex-theme-v1` or a CLI `.tmTheme` file as a Codex IDE-extension theme import.

## Choose the right workflow

1. **You want to change the ChatGPT desktop app’s Codex workspace.** Choose a DexThemes desktop variant and follow the [app-theme import guide](/guides/how-to-install-a-codex-theme). Keep the complete `codex-theme-v1:` string intact and approve the import in Codex.
2. **You want to change Codex CLI syntax highlighting.** Run `/theme`; use a built-in picker choice or add a custom `.tmTheme` file to `$CODEX_HOME/themes`.
3. **You want to change your IDE’s colors.** Use the editor’s native theme workflow. Do not use the CLI directory or a desktop import string as a shortcut unless the editor itself documents that format and installation method.

For a coordinated look across all three, start with matching palette intent, then inspect a real desktop conversation, CLI diff, and editor file separately. Matching colors by eye is a design choice, not evidence of mechanical visual equivalence.

## Common mistakes

### Pasting a desktop import into the CLI

The CLI expects a picker selection or a `.tmTheme` file in its themes directory. A `codex-theme-v1:` string is not a CLI theme file and should not be pasted into an interactive terminal as a theme command.

### Treating a `.tmTheme` file as a desktop Appearance import

The desktop import flow expects the `codex-theme-v1:` contract, not a CLI file. Keep the file on the CLI path and use the desktop import only through Appearance.

### Assuming a change automatically mirrors elsewhere

The current desktop and CLI documentation describe separate controls: Appearance for the app and `tui.theme` for the CLI. Recheck each surface after a Codex update, a new computer, or a `$CODEX_HOME` change instead of assuming that one preference migrated the other.

## Sources and limits

This guide relies on OpenAI’s current [CLI customization documentation](https://learn.chatgpt.com/docs/cli-customization), [desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings), and [Codex IDE documentation](https://learn.chatgpt.com/docs/codex/ide), plus the current [DexThemes format reference](/reference/codex-theme-format). Product controls and accepted formats can change with a Codex release.

DexThemes can prepare a desktop import, but it does not guarantee an installed app will accept it, make an app and CLI pair visually identical, or apply a theme without your approval. Verify the result in the actual surface you use.

## Related guides

- [Install a Codex app theme](/guides/how-to-install-a-codex-theme)
- [Inspect the Codex theme v1 format](/reference/codex-theme-format)
- [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts)
- [Move a desktop theme to another computer](/guides/move-a-codex-theme-to-another-computer)
