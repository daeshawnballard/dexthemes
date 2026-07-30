---
title: Move a Codex Theme to Another Computer
description: Save each app theme variant as a portable import string and reinstall fonts separately on the destination computer.
slug: move-a-codex-theme-to-another-computer
kind: guide
section: Guides
answer: Save the complete codex-theme-v1 string for each variant, transfer it as plain text, install any required fonts, then import each string from Codex Appearance on the new computer.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current portable import format and official Codex Appearance documentation
related: /guides/share-a-custom-codex-theme, /guides/how-to-install-a-codex-theme, /guides/codex-theme-import-troubleshooting
---

Move a Codex app theme by carrying its import string, not by copying an entire Codex configuration directory. Save one complete `codex-theme-v1:` value for dark and another for light, transfer them as plain text, and approve each import on the destination computer.

This approach avoids moving unrelated application settings and gives you an artifact you can inspect before importing.

## Export a portable copy

If the theme is in DexThemes:

1. Open the theme or your builder draft.
2. Select the dark variant.
3. Copy the complete import string and paste it into a UTF-8 plain-text file.
4. Repeat for the light variant if one exists.
5. Label each value with the theme name, variant, and export date.
6. Confirm that every value begins with `codex-theme-v1:` and contains one complete JSON object.

If the theme is public, also save its canonical DexThemes page URL. Keep the import string anyway: a durable local copy protects you from a later catalog rename, removal, or network outage.

OpenAI's [official Codex settings documentation](https://learn.chatgpt.com/docs/reference/settings) says Appearance can share custom themes with friends. You can use the sharing control in your installed app when it gives you a portable theme artifact, but verify the result before depending on it.

## Do not rely on a builder draft

The current DexThemes builder saves draft state in the browser's local storage. That is helpful when returning in the same browser, but it is not a portable backup and should not be assumed to sync to another computer.

Export the actual import string before wiping a browser profile, changing computers, or resetting site data. A screenshot preserves the look but cannot be imported.

## Transfer the file safely

The theme string is appearance data, but good transfer hygiene still prevents corruption:

- Use a trusted encrypted sync service, local network transfer, removable drive, or direct message.
- Keep the file as plain text.
- Avoid rich-text editors that substitute smart quotes.
- Do not put the payload inside a shell command.
- Do not append credentials, private repository details, or account data.
- Compare the beginning and end of the value after transfer.

The string may wrap visually across lines in an editor. What matters is that no characters were removed or replaced.

## Install required fonts separately

A theme payload can name a UI font and a code font, but it does not contain font binaries or a license. Before importing:

1. Inspect `theme.fonts.code` and `theme.fonts.ui`.
2. Install properly licensed copies of any required fonts for the destination user.
3. If a font is unavailable, choose an acceptable fallback in Codex Appearance.
4. Test glyph coverage, code alignment, and interface readability.

Operating systems can use different family names or render the same font differently. See [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts).

## Import on the destination computer

1. Open Codex Settings.
2. Choose **Appearance**.
3. Choose **Import theme** or the variant-specific import control.
4. Paste the complete dark string.
5. Review and approve the import.
6. Repeat with the light string.
7. Switch between light and dark appearance modes.
8. Inspect prose, code, diffs, skills, selections, and focus states.

DexThemes can open general Settings on supported desktop flows, but the portable process does not depend on that link. Opening Codex yourself is equally valid.

## Expect version differences

The destination computer may run a different Codex build. A string that worked on the source computer can fail or render differently if:

- The registered code-theme families changed.
- The destination does not support that import behavior.
- A requested font is missing.
- Operating-system rendering differs.
- Codex changed how it interprets an appearance field.

Record the Codex versions on both machines if consistent rendering matters. Passing DexThemes validation proves the string matches the project's current contract, not that every Codex release accepts it.

## Keep app and CLI artifacts separate

A `codex-theme-v1:` string moves a desktop Appearance theme. It does not move the Codex CLI syntax theme.

For the CLI, record the `/theme` picker choice or transfer the custom `.tmTheme` file from `$CODEX_HOME/themes`. The [official CLI customization guide](https://learn.chatgpt.com/docs/cli-customization) documents that separate workflow.

Do not copy an entire `$CODEX_HOME` just to move a theme. It can contain configuration unrelated to appearance. Move only the specific CLI `.tmTheme` file you authored and inspect.

## Verify and keep a fallback

After migration:

- Confirm both variants are present.
- Check actual working content rather than only the settings preview.
- Verify fonts and semantic colors.
- Keep the transferred text file until both imports are stable.
- Know how to restore a built-in theme from Appearance.

If the destination rejects the string, recopy it from the source, check the [format reference](/reference/codex-theme-format), and follow [import troubleshooting](/guides/codex-theme-import-troubleshooting).

DexThemes is community-built and is not affiliated with OpenAI. The import artifact is portable by design, but Codex compatibility remains controlled by the installed app.

## Related guides

- [Share a custom Codex theme](/guides/share-a-custom-codex-theme)
- [Install a theme on the destination](/guides/how-to-install-a-codex-theme)
- [Troubleshoot a failed move](/guides/codex-theme-import-troubleshooting)
- [Compare app and CLI theme files](/guides/codex-app-themes-vs-cli-themes)
