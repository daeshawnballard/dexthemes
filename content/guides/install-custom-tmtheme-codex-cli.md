---
title: Install a Custom .tmTheme in Codex CLI
description: Install a custom .tmTheme in Codex CLI with the /theme picker, correct $CODEX_HOME path checks, safe inspection, and rollback steps.
slug: install-custom-tmtheme-codex-cli
kind: guide
section: Guides
answer: To install a custom Codex CLI theme, inspect a trusted `.tmTheme` file, place it in `$CODEX_HOME/themes`, then run `/theme` in an interactive CLI session and select it. The picker saves the selected theme to `tui.theme` in `$CODEX_HOME/config.toml`.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-08
testedWith: Official OpenAI Codex CLI customization and configuration documentation reviewed 2026-08-08.
related: /guides/codex-app-themes-vs-cli-themes, /guides/codex-themes-download, /guides/how-to-install-a-codex-theme
---

A custom `.tmTheme` changes **Codex CLI** syntax highlighting for fenced Markdown code blocks and file diffs. It is installed as a file, then chosen in the interactive `/theme` picker. It is not a desktop-app Appearance import, an IDE theme installation, or a DexThemes installer.

DexThemes does not currently distribute Codex CLI `.tmTheme` files. This guide is adjacent education for a file you obtained or authored elsewhere; it does not imply that a DexThemes catalog theme has a CLI download or can install itself.

## Install a custom `.tmTheme` in Codex CLI

1. Get a `.tmTheme` file from a source you trust. Read it as data before copying it; do not run it as a command or add it to a shell profile.
2. Resolve the active Codex home directory. The documented theme folder is `$CODEX_HOME/themes`.
3. Copy the file into that folder without overwriting an existing file unintentionally.
4. Start an interactive Codex CLI session and run `/theme`.
5. Preview and select the custom theme in the picker. OpenAI documents that the picker saves the selection as `tui.theme` in `$CODEX_HOME/config.toml`.
6. Check a real fenced code block and file diff in the terminal UI. Those are the CLI surfaces OpenAI documents for theme syntax highlighting.

If the picker does not offer the file, verify the active `$CODEX_HOME` value and that the file ends in `.tmTheme` before changing anything else. The official guide does not document a required internal display name, filename-to-label rule, collision rule, or conversion process, so do not try to fix discovery by inventing one.

## Resolve `$CODEX_HOME` before placing the file

`$CODEX_HOME` is an environment variable, not a literal directory name. OpenAI documents its default as `~/.codex`; when it is set, it changes the root used for Codex state, including configuration. OpenAI also notes that a directory chosen for `CODEX_HOME` must already exist.

On macOS and Linux, the usual default theme folder is therefore `~/.codex/themes`. If `CODEX_HOME` is set in the shell that starts Codex, use that value instead. This inspection command prints the active folder without changing it:

```sh
themes_dir="${CODEX_HOME:-$HOME/.codex}/themes"
printf '%s\n' "$themes_dir"
```

On Windows PowerShell, resolve the same directory with `$env:CODEX_HOME` when it exists, otherwise with the user-home fallback:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }
$themesDir = Join-Path $codexHome 'themes'
$themesDir
```

Do not set `CODEX_HOME` solely to make one theme easier to find. A shell-scoped value can point Codex at a different configuration root. If you already use a custom value through a launcher, terminal profile, or automation, run the placement and the CLI from that same environment.

## Inspect the theme safely

Treat a `.tmTheme` as a theme-definition file, not as a command. Before copying it, open it as plain text and confirm that it is the file you intended to use. Stop if the download comes with unrelated shell commands, credentials, executables, or instructions to disable security controls.

For a quick read-only preview on macOS or Linux:

```sh
sed -n '1,160p' "/path/to/MyTheme.tmTheme"
```

For the equivalent PowerShell preview:

```powershell
Get-Content -LiteralPath 'C:\path\to\MyTheme.tmTheme' -TotalCount 160
```

These checks inspect text only. They do not establish that a particular Codex version will accept the file or that it will look the same on every terminal, display, and color mode. Keep the original file and source URL or attribution with your own notes so you can retrace it later.

## Place the file in the Codex CLI themes directory

After inspection, create the documented themes folder if it is absent and copy the file into it. The macOS/Linux example below stops rather than replacing an existing file with the same local filename:

```sh
themes_dir="${CODEX_HOME:-$HOME/.codex}/themes"
target_file="$themes_dir/MyTheme.tmTheme"
mkdir -p "$themes_dir"
if [ -e "$target_file" ]; then
  printf 'Refusing to overwrite existing file: %s\n' "$target_file" >&2
  exit 1
fi
cp "/path/to/MyTheme.tmTheme" "$target_file"
```

In PowerShell, use the same no-overwrite check:

```powershell
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME '.codex' }
$themesDir = Join-Path $codexHome 'themes'
$targetFile = Join-Path $themesDir 'MyTheme.tmTheme'
New-Item -ItemType Directory -Path $themesDir -Force | Out-Null
if (Test-Path -LiteralPath $targetFile) { throw "Refusing to overwrite existing file: $targetFile" }
Copy-Item -LiteralPath 'C:\path\to\MyTheme.tmTheme' -Destination $targetFile
```

`MyTheme.tmTheme` is only a safe example filename. The current [CLI customization documentation](https://learn.chatgpt.com/docs/cli-customization) requires a `.tmTheme` file in `$CODEX_HOME/themes`, but it does not document how the picker derives a display name or resolves duplicate-looking files. Preserve the extension and inspect the actual picker rather than relying on an undocumented naming convention.

## Choose the theme through `/theme`

Start an interactive CLI session, then invoke the picker:

```text
codex
/theme
```

The `/theme` flow is the documented control for previewing a theme and saving the selection. Select the custom entry there instead of editing configuration values by hand. The result is persisted as `tui.theme` in `$CODEX_HOME/config.toml`.

To confirm the setting without treating a manual edit as the installation path, inspect the config file after choosing the theme. On macOS or Linux:

```sh
grep -n 'theme' "${CODEX_HOME:-$HOME/.codex}/config.toml"
```

On PowerShell, after resolving `$codexHome` as above:

```powershell
Select-String -LiteralPath (Join-Path $codexHome 'config.toml') -Pattern 'theme'
```

The exact config-file representation is not a substitute for the picker. The useful confirmation is that `/theme` shows your selected option and that fenced code blocks and diffs are readable in the terminal UI.

## Roll back without deleting anything

For an immediate rollback, reopen `/theme` and select the previous built-in or known-good theme. Because the picker saves the selected `tui.theme` value, this is the documented way to replace the active selection.

Keep the custom file in place while you confirm the fallback. There is no need to delete a file just to revert the active theme, and the CLI customization page does not specify how a missing file should interact with an already saved selection. If you later decide not to keep the file, move it to a backup location or your system Trash only after the fallback is working.

Before trying a new file, note the current picker selection and check code blocks and diffs with your normal terminal color settings. A theme can be syntactically selectable yet still be hard to read in your terminal, on a particular display, or with your accessibility preferences.

## Why a desktop `codex-theme-v1` string cannot install a CLI theme

A `codex-theme-v1:` value is a desktop Codex Appearance import payload. It is copied as text, pasted into the desktop app’s **Appearance → Import theme** flow, reviewed there, and approved there. It is not a `.tmTheme` file and the CLI documentation does not describe it as a source for `/theme`.

Conversely, a `.tmTheme` belongs in `$CODEX_HOME/themes` for the CLI picker. Saving a desktop import string with a `.tmTheme` extension does not turn it into a CLI theme. The two systems target different interfaces and have no documented one-to-one conversion.

If you use both surfaces, keep a desktop `codex-theme-v1:` import and a custom CLI `.tmTheme` as separate artifacts. Verify each independently after a Codex update, a terminal change, or a change to `CODEX_HOME`. For the boundary in more detail, see [Codex app themes vs CLI themes](/guides/codex-app-themes-vs-cli-themes).

## Sources and limits

This guide follows OpenAI’s current [CLI customization documentation](https://learn.chatgpt.com/docs/cli-customization), which documents `/theme`, `$CODEX_HOME/themes`, and the saved `tui.theme` selection. It also follows the official [environment variables reference](https://learn.chatgpt.com/docs/config-file/environment-variables) for the `CODEX_HOME` default and scope, and [config basics](https://learn.chatgpt.com/docs/config-file/config-basic) for Codex configuration locations.

OpenAI can change the picker, accepted file behavior, default paths, or config representation in a future release. This article intentionally does not claim that a particular `.tmTheme` is valid, that a filename determines its picker label, or that a CLI theme changes the ChatGPT desktop app, an IDE extension, or any DexThemes theme automatically.

## Related guides

- [Compare Codex app themes and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Understand Codex theme downloads](/guides/codex-themes-download)
- [Install a desktop Codex app theme](/guides/how-to-install-a-codex-theme)
