---
title: Codex Dark Mode: Does Codex Have a Dark Theme?
description: Does Codex have dark mode? Use Codex app dark mode through the desktop base theme or import a DexThemes dark theme; CLI and IDE themes use separate workflows.
slug: codex-dark-mode
kind: guide
section: Guides
answer: Yes. Codex app dark mode in the ChatGPT desktop app uses Appearance's base-theme control. For a custom dark look, import a DexThemes dark codex-theme-v1 string through Appearance; the CLI and IDE extension use separate theme workflows.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-08
testedWith: Official OpenAI ChatGPT desktop settings, Codex CLI customization, and Codex IDE documentation reviewed 2026-08-08; DexThemes documented import flow.
related: /features/theme-library, /guides/how-to-install-a-codex-theme, /guides/codex-app-themes-vs-cli-themes, /guides/codex-theme-import-troubleshooting
---

Yes. Codex in the ChatGPT desktop app has **Appearance** controls, where OpenAI documents a base-theme choice alongside accent, background, foreground, UI-font, and code-font controls. Choose the dark base-theme option shown by your installed app for the native dark-mode route. If you want a specific dark palette instead, import a DexThemes dark variant through **Settings → Appearance → Import theme**.

Those are two different choices. A base theme is a built-in desktop-app setting; a DexThemes import is an explicit, reviewable `codex-theme-v1:` payload for one Codex desktop appearance variant. DexThemes is community-built and is not affiliated with OpenAI.

## Does Codex have dark mode?

For the ChatGPT desktop app, yes: use **Settings → Appearance** and select the dark base theme available in your installed build. OpenAI’s [desktop settings reference](https://learn.chatgpt.com/docs/reference/settings) describes Appearance as the place to change the base theme, colors, and UI and code fonts.

Codex is a separate view in the ChatGPT desktop app, rather than a web or mobile experience you can configure with the same import string. The [OpenAI desktop-app guide](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex) says Codex is selected from the desktop app and is not selectable on web or mobile. Do not assume that a desktop dark setting or import will automatically configure every device, browser, terminal, or editor.

## Codex app dark mode versus a DexThemes dark theme

### Use the base-theme control for the app’s built-in dark look

The base-theme control is the straightforward choice when you want the built-in dark appearance offered by your installed desktop app. It belongs to Appearance, together with the normal color and font controls. It does not require a DexThemes account, catalog selection, or import string.

Use this route when a standard dark look is enough, or when you want to return to a built-in appearance after trying a custom palette. Exact labels and available choices can change between desktop releases, so follow the controls shown in your app rather than relying on an older screenshot.

### Import a dark theme for a specific custom palette

A DexThemes dark theme starts in the [theme library](/features/theme-library), where you can filter, preview, and select an available dark variant. The copied value begins with `codex-theme-v1:` and represents that one selected variant. It can carry the palette, contrast, semantic colors, optional font names, and a compatible desktop code-theme family.

This is not a replacement for the base-theme setting, a system-wide dark-mode switch, or a silent command to change Codex. DexThemes prepares the text, while Codex owns the review, import, persistence, and rendering. A preview or copied string is not proof that your installed app accepted the theme.

## How to import a DexThemes dark theme

1. Open the [DexThemes library](/features/theme-library) and choose a theme with a **dark** variant.
2. Select that dark variant, then use its copy or apply control to prepare the complete `codex-theme-v1:` string.
3. Open Codex Settings. DexThemes can hand off to general Settings after copying, but it does not claim a direct Appearance deep link.
4. Choose **Appearance**.
5. Choose **Import theme** or the matching dark import control shown by your installed app.
6. Paste the entire string, including `codex-theme-v1:`. Do not add quotation marks or paste only the JSON portion.
7. Review the result in Codex and choose **Import** to approve it.
8. Inspect a real task with prose, code, and a diff before deciding that the dark theme works for you.

If a theme has both dark and light variants, each is a separate import. Importing the dark value does not create, change, or prove the light version. For the full handoff and common import errors, read [How to install a Codex theme](/guides/how-to-install-a-codex-theme) and [Codex theme import troubleshooting](/guides/codex-theme-import-troubleshooting).

## Change or restore a Codex dark theme

To return to a built-in look, go back to **Settings → Appearance** and select the base theme you prefer. To replace one imported dark palette with another, select a different dark variant in DexThemes and repeat the explicit import flow. These are visible changes in Codex, not settings that DexThemes applies in the background.

When changing an imported theme, check more than the main background:

- Read ordinary prose and small interface labels at your usual display brightness.
- Open a file diff and check added and removed lines.
- Confirm that code and UI fonts remain readable and are available on that computer.
- Switch to the other appearance variant only if you separately imported one.

If an import is rejected or looks unlike the preview, recopy the untouched string and retry through Appearance before editing it by hand. A current DexThemes string can still be rejected or rendered differently by a changed Codex release, because the importer is owned by Codex.

## Codex CLI dark themes are separate

The Codex CLI does have its own terminal-theme workflow, but it is not the desktop-app dark-mode setting. OpenAI’s [CLI customization guide](https://learn.chatgpt.com/docs/cli-customization) says to run `/theme` to open the picker, preview a choice, and save it as `tui.theme` in `$CODEX_HOME/config.toml`. For a custom CLI theme, place a `.tmTheme` file in `$CODEX_HOME/themes` and select it in the picker.

That setting controls terminal UI syntax highlighting for fenced Markdown code blocks and file diffs. It does not import a DexThemes `codex-theme-v1:` value, and it does not change the terminal application’s own window or operating-system appearance. Do not paste a desktop import string into the CLI or put it in the CLI themes directory.

## Codex IDE extension dark themes are separate too

The [official Codex IDE guide](https://learn.chatgpt.com/docs/codex/ide) covers the Codex extension and integrations in VS Code-compatible editors, Xcode, and JetBrains IDEs. Those are editor surfaces with their own appearance and theme settings.

Use the host editor’s documented theme controls for an IDE dark theme. OpenAI does not document a DexThemes desktop import string or a CLI `.tmTheme` file as a Codex IDE-extension theme installation path. A similar palette across desktop Codex, the CLI, and an IDE is a deliberate three-surface setup, not evidence that one dark-mode choice propagated everywhere.

## Sources and limits

This guide uses OpenAI’s current [ChatGPT desktop settings reference](https://learn.chatgpt.com/docs/reference/settings), [Codex CLI customization guide](https://learn.chatgpt.com/docs/cli-customization), and [Codex IDE extension guide](https://learn.chatgpt.com/docs/codex/ide), plus the [DexThemes import handoff](/features/codex-theme-import). Appearance labels, supported imports, and rendering can change with a Codex update; verify the result in the installed surface you use.

DexThemes does not claim OpenAI affiliation, automatic theme application, a platform-wide dark-mode switch, or identical results across desktop, terminal, and IDE environments.

## Related guides

- [Browse the Codex theme library](/features/theme-library)
- [Install a Codex desktop theme](/guides/how-to-install-a-codex-theme)
- [Compare Codex app, CLI, and IDE theme paths](/guides/codex-app-themes-vs-cli-themes)
- [Troubleshoot a Codex theme import](/guides/codex-theme-import-troubleshooting)
