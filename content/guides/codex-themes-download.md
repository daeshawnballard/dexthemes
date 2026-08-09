---
title: Codex Themes Download: Desktop Imports and CLI .tmTheme Files
description: Download Codex themes safely: use a DexThemes import string for desktop Appearance, or a .tmTheme file only for Codex CLI syntax highlighting.
slug: codex-themes-download
kind: guide
section: Guides
answer: For Codex desktop, copy a DexThemes `codex-theme-v1:` string and approve it in Appearance. Codex CLI uses custom `.tmTheme` files instead, but DexThemes does not currently distribute those CLI files.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: DexThemes import handoff and distribution source plus official OpenAI Settings and CLI customization documentation reviewed 2026-08-09.
related: /guides/how-to-install-a-codex-theme, /guides/codex-app-themes-vs-cli-themes, /guides/move-a-codex-theme-to-another-computer
---

To download Codex themes without using the wrong artifact, first choose the surface you want to change. For the graphical Codex workspace in the desktop app, DexThemes gives you plain text to copy and import; it is not an executable download or an automatic installer. For terminal syntax highlighting in Codex CLI, the relevant artifact is a `.tmTheme` file selected through the CLI’s `/theme` picker. DexThemes does not currently distribute those CLI files.

The two options are separate. A desktop `codex-theme-v1:` string cannot become a CLI theme just by saving it with a `.tmTheme` extension, and a `.tmTheme` file does not belong in the desktop Appearance importer.

## Choose the right Codex theme artifact

### You want to change the desktop Codex workspace

Choose a DexThemes dark or light variant and copy its complete `codex-theme-v1:` string. Then use **Settings → Appearance → Import theme** in the installed desktop app, review the result, and approve it.

The current DexThemes desktop handoff creates a text import string, copies it to the clipboard, and can open general Codex Settings. It does not silently change your Appearance settings. OpenAI’s [Settings documentation](https://learn.chatgpt.com/docs/reference/settings) describes Appearance controls for the base theme, accent, background, foreground, and UI and code fonts; follow the controls shown by your installed app if their names or layout differ.

Use this path when you want the app workspace to reflect a palette: its main surfaces, foreground, accent, semantic colors, optional font names, and code-theme family. See [How to install a Codex theme](/guides/how-to-install-a-codex-theme) for the full import sequence.

### You want to change Codex CLI syntax highlighting

Use the CLI’s `/theme` picker. OpenAI’s [CLI customization documentation](https://learn.chatgpt.com/docs/cli-customization) says the picker previews a selection and saves it to `tui.theme` in `$CODEX_HOME/config.toml`. If the built-in choices do not give you the syntax palette you need, place a custom `.tmTheme` file in `$CODEX_HOME/themes` and select it in that picker.

A `.tmTheme` file is appropriate when you need a custom terminal syntax-highlighting palette. It is a separate CLI artifact—not a DexThemes desktop import string. DexThemes does not currently provide these files, so obtain or author one elsewhere, inspect it, and store it as a CLI theme file.

### You use both the desktop app and CLI

Keep two artifacts: one `codex-theme-v1:` string for each desktop variant, and one `.tmTheme` file only if you use a custom CLI theme. They can share a visual direction, but neither artifact installs or updates the other. [Codex app themes vs CLI themes](/guides/codex-app-themes-vs-cli-themes) explains why a direct conversion is incomplete.

## A DexThemes desktop theme is copied text, not a program download

Calling a desktop theme a “download” can make the handoff sound more automatic than it is. The actual artifact is a visible text value that begins with `codex-theme-v1:` and continues with one JSON object. It carries appearance data, including a code-theme family ID, one dark or light variant, colors, contrast, an opaque-windows preference, and optional font names.

It is not an app, browser extension, shell command, font installer, or configuration-directory archive. Copying it does not prove that Codex accepted it, and opening Settings does not prove that the theme was applied. Codex owns the final import, review, and persistence step.

For a desktop theme, the safe, portable sequence is short:

1. Open the canonical DexThemes theme page and select the dark or light variant you want.
2. Copy the entire string, including the `codex-theme-v1:` prefix.
3. Open Codex Settings yourself, or use the general Settings handoff if you want it.
4. Choose **Appearance → Import theme**, paste the unchanged string, review it, and approve it.
5. Check ordinary prose, code, diffs, selections, and fonts in the installed app.

If you only need a theme on another computer, save the copied value as UTF-8 plain text and import it there. Keep dark and light strings separate. The [move-a-theme guide](/guides/move-a-codex-theme-to-another-computer) covers the destination checks and font caveats.

## When to download or create a `.tmTheme` file

Choose a `.tmTheme` file only when the goal is the Codex CLI terminal interface. It is useful when the `/theme` picker’s supplied choices are close but do not provide the token-level syntax colors you need.

Do not use a `.tmTheme` file merely because you prefer the name or preview of a desktop DexThemes palette. A desktop import carries broad workspace appearance data and a registered code-theme family, while the CLI loads its own `.tmTheme` artifact. Matching their mood requires separate design work and separate testing.

For the CLI workflow:

1. Start an interactive Codex CLI session and run `/theme`.
2. Try the picker’s available themes first.
3. If you need a custom definition, obtain or author a `.tmTheme` file from a source you trust.
4. Place that file in `$CODEX_HOME/themes`.
5. Reopen `/theme`, select it, and verify code blocks and diffs in the terminal UI.

Do not paste a `.tmTheme` document into desktop Appearance, paste a `codex-theme-v1:` string into the terminal, or put the desktop string in `$CODEX_HOME/themes`.

## Check safety before you copy, import, or save a file

Both paths are configuration artifacts, so provenance and boundaries still matter. For a desktop import, expect the exact `codex-theme-v1:` prefix followed by appearance JSON. Treat a value that includes shell commands, credentials, unrelated URLs, repository data, or instructions to run it as a reason to stop and recopy from a canonical source.

For a CLI `.tmTheme`, prefer a source you can identify and inspect before placing the file in your themes directory. Keep the file limited to the theme you chose; do not copy an entire `$CODEX_HOME` directory just to move one color scheme. That directory can contain settings unrelated to appearance.

Never paste either kind of theme artifact into a shell command, shell profile, repository file, or credential prompt. The desktop import string does not include font files or grant a font license. If it names a font, install a properly licensed copy separately or choose a local fallback, then verify legibility.

For a deeper review of the desktop payload and its limits, read [Is DexThemes safe?](/guides/is-dexthemes-safe) and the [Codex theme format reference](/reference/codex-theme-format). DexThemes is community-built and is not affiliated with OpenAI.

## Keep downloads portable without mixing formats

Save desktop imports as plain-text backups labeled with the theme name, variant, and export date. Save a custom CLI `.tmTheme` file separately, plus a short note naming any built-in `/theme` selection you rely on. Share each artifact with instructions for its own surface rather than presenting either one as a universal installer.

Portability is not a compatibility guarantee. A different Codex version, operating system, display, or font installation can affect the result. After moving a theme, verify the desktop Appearance import and the CLI `/theme` selection independently, and keep a comfortable built-in fallback available.

## Find the next correct guide

- Already have a desktop import string? [Install it in Codex Appearance](/guides/how-to-install-a-codex-theme).
- Deciding between a desktop import and a CLI file? [Compare the two systems](/guides/codex-app-themes-vs-cli-themes).
- Need to inspect the desktop JSON fields? [Read the format reference](/reference/codex-theme-format).
- Sending a desktop theme to someone else? [Share a custom Codex theme](/guides/share-a-custom-codex-theme).
- Moving your setup to another computer? [Move a Codex theme safely](/guides/move-a-codex-theme-to-another-computer).
