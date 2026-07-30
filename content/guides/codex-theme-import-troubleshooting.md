---
title: Codex Theme Import Troubleshooting
description: Diagnose incomplete payloads, variant mismatches, unsupported code theme IDs, font fallbacks, and settings handoff confusion.
slug: codex-theme-import-troubleshooting
kind: guide
section: Guides
answer: Recopy the full codex-theme-v1 string, open Codex Settings, choose Appearance manually, import the matching dark or light variant, and verify the result in the installed app.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current import validator and installed Codex desktop 26.721.81911 build 5973 appearance registry
related: /guides/how-to-install-a-codex-theme, /reference/codex-theme-format, /guides/codex-app-themes-vs-cli-themes
---

Most DexThemes import failures come from an incomplete clipboard value, stopping at general Settings instead of opening Appearance, importing the wrong variant, or using a hand-edited code-theme identifier. Start by copying the theme again and repeating the explicit Appearance import.

DexThemes is community-built and is not affiliated with OpenAI. It validates its current output, but Codex owns the importer. A DexThemes validation result is not proof that a newer or older Codex build accepted and persisted the theme.

## Run the clean import sequence

1. Return to the theme in DexThemes.
2. Select the intended dark or light variant.
3. Copy the theme again.
4. Paste it temporarily into a plain-text editor.
5. Confirm that it starts with `codex-theme-v1:` and continues with one complete JSON object.
6. Copy the untouched string from the editor.
7. Open Codex Settings.
8. Choose **Appearance** manually.
9. Choose **Import theme**, paste the string, review it, and choose **Import**.
10. Switch Codex to the matching appearance mode and inspect the result.

DexThemes may open general Codex Settings after copying. That is the expected handoff. It does not currently claim a verified direct Appearance deep link or a public route that applies the theme without your approval.

## Nothing happened after choosing Apply in Codex

On desktop, the DexThemes control means “copy the theme and open Settings.” It does not mean that Codex silently applied the payload.

Check the clipboard in a plain-text editor. If the string is present, return to Codex and continue through Appearance and Import theme. If no string is present, the browser may have denied clipboard access. Use the selectable import text when the interface offers it, or copy again after allowing clipboard access for the action you initiated.

Do not edit Codex configuration files as a shortcut. File mutation does not prove the supported import flow worked, and a malformed setting can create a separate problem.

## Codex says the theme is invalid

Check these structural requirements:

- The prefix is exactly `codex-theme-v1:`.
- The prefix is immediately followed by a JSON object.
- There are no outer quotation marks around the complete string.
- `variant` is exactly `dark` or `light`.
- Required colors are six-digit hex values such as `#A1B2C3`.
- `contrast` is an integer from `0` through `100`.
- `opaqueWindows` is a boolean.
- `fonts.code` and `fonts.ui` are strings or `null`.
- `codeThemeId` is a registered family that supports the selected variant.

Use the [Codex theme format reference](/reference/codex-theme-format) for the exact payload shape. If the string came from DexThemes, recopying is safer than repairing JSON by hand.

## The string uses a filename-like code theme ID

The code theme ID is a registered family name, not necessarily a bundled syntax-theme filename. Current DexThemes source canonicalizes known older values:

- `github-dark-default` becomes `github` for a dark import.
- `github-light-default` becomes `github` for a light import.
- `gruvbox-dark-hard` becomes `gruvbox` for a dark import.
- `one-dark-pro` becomes `one` for a dark import.

New DexThemes strings should already contain the canonical value. Do not replace an ID with a filename found in an application bundle. Recopy the current theme instead.

## Only dark or light changed

This is usually expected. Each import string contains only one `variant`. Select and copy the other variant in DexThemes, then import it into the other Appearance slot.

If the theme offers only one variant, DexThemes cannot manufacture the missing side during installation. Choose another theme with both variants or build the second palette yourself.

## The import worked but looks different from the preview

The DexThemes preview is a Codex-like design surface, not a complete emulator. Differences can come from:

- The installed Codex version.
- The selected base code-theme family.
- Operating-system color rendering.
- Display brightness and color profile.
- Font availability and font rendering.
- Appearance states that are not represented in the preview.
- Preview-only sidebar or code-background colors that are not separate fields in the current import payload.

Judge the result in the real app. If text, diffs, or controls are hard to read, restore a comfortable built-in theme or adjust the palette. The [official Codex settings guide](https://learn.chatgpt.com/docs/reference/settings) documents Appearance controls for base theme, accent, background, foreground, and fonts.

## A requested font did not appear

The import format can carry UI and code font names, but it does not contain font files. A name that is missing, spelled differently, or unavailable on the computer may fall back according to Codex and the operating system.

Open Codex Appearance and choose the font there. Test ordinary text, punctuation, code ligatures, and diff alignment. See [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts) for the safer settings-first workflow.

## A CLI theme did not import

DexThemes app imports and Codex CLI themes are different systems. A desktop import begins with `codex-theme-v1:`. A CLI custom theme is a `.tmTheme` file placed under `$CODEX_HOME/themes` and selected with `/theme`, as described in the [official CLI customization guide](https://learn.chatgpt.com/docs/cli-customization).

Do not paste a `.tmTheme` file into Codex Appearance, and do not place a `codex-theme-v1` string in the CLI themes directory. Read [Codex app themes versus CLI themes](/guides/codex-app-themes-vs-cli-themes).

## Collect a useful, safe bug report

If a clean recopy still fails, record:

- The public theme name and selected variant.
- Your Codex version and operating system version.
- The exact visible error message.
- Whether the prefix and JSON were complete.
- Whether the failure happened before or after you approved Import.
- Whether a built-in theme can still be selected.

Do not include credentials, account identifiers, private repository names, private URLs, or screenshots containing sensitive work. If you share the payload, verify that it contains only appearance fields first. Report DexThemes issues through the project's public issue tracker, and use Codex feedback channels for importer behavior owned by Codex.

## Related guides

- [Install a Codex theme](/guides/how-to-install-a-codex-theme)
- [Inspect the exact import format](/reference/codex-theme-format)
- [Compare app and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Move a theme to another computer](/guides/move-a-codex-theme-to-another-computer)
