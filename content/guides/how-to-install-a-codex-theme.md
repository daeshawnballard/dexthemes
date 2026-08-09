---
title: How to Install a Codex Theme
description: Install a Codex desktop theme through an explicit review: choose a DexThemes variant, copy its complete codex-theme-v1 string, then import it in Appearance.
slug: how-to-install-a-codex-theme
kind: guide
section: Guides
answer: To install a Codex theme in the ChatGPT desktop app, choose a DexThemes dark or light variant, copy the complete codex-theme-v1 string, then open Settings > Appearance. Use Import for the matching variant, paste the string, review it, and approve the import.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-08-09
testedWith: DexThemes import handoff source, ChatGPT desktop 26.803.41515 build 6321, and official OpenAI documentation reviewed 2026-08-09.
related: /features/codex-theme-import, /guides/codex-theme-import-troubleshooting, /guides/codex-app-themes-vs-cli-themes
---

To install a Codex theme in the desktop app, choose a dark or light variant in [DexThemes](/), copy its complete `codex-theme-v1:` string, then open **Settings → Appearance**. In the matching Dark or Light section, choose **Import**, paste the string into the **Import theme** dialog, review it, and approve the import. DexThemes prepares the payload; Codex owns the final change. It does not silently apply a theme.

This is the DexThemes workflow for the Codex desktop experience, not a universal theme file for every OpenAI or editor surface. OpenAI currently describes Codex as a separate view in the [ChatGPT desktop app](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex), and its [desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings) says Appearance can change the base theme, colors, and UI and code fonts. DexThemes is community-built and is not affiliated with OpenAI.

## Install a Codex theme step by step

1. Open the [DexThemes catalog](/) and choose a theme.
2. Select the **dark** or **light** variant you want to install. If a theme offers both, import each one separately.
3. Use the theme's copy or apply control. It should give you one complete string that begins with `codex-theme-v1:`.
4. Open Codex Settings. DexThemes may open the general Settings screen after copying; choose **Appearance** yourself.
5. In the matching Dark or Light section, choose **Import**.
6. Paste the entire string into the **Import theme** dialog, including the `codex-theme-v1:` prefix. Do not add quotation marks or paste only the JSON portion.
7. Review the string and choose **Import theme** to approve the change.
8. Return to a task with prose, code, and a diff, then check the result in the app you actually use.

The exact control names and layout can change with a desktop-app update. Follow the labels in your installed app if they differ from this guide.

Import only a string from a source you trust. The expected DexThemes artifact is the prefix followed by appearance JSON. If the copied material includes commands, credentials, unrelated URLs, or instructions to change app files, stop and recopy it from the canonical DexThemes page.

## Start with a DexThemes variant, not a hand-edited payload

The quickest path is to use a catalog theme's selected variant and copy control. DexThemes serializes one dark or light appearance payload at a time, so the copied value represents the exact variant you chose. A theme with both variants needs two copy-and-import passes: one for dark and one for light.

Keep the string intact. A valid DexThemes import begins with `codex-theme-v1:` followed by compact JSON. Hand-editing the string can introduce a malformed color, font, code-theme ID, or variant. If you need to inspect the payload, see the [Codex theme format reference](/reference/codex-theme-format); if you just want to change the look, recopy the selected variant from the catalog.

Copying is not acceptance. Even when DexThemes prepares a string successfully, your installed Codex version decides whether it accepts and persists the import. That is why the final review and **Import** action remain in Codex.

## Do not mix desktop, CLI, and IDE theme workflows

The word “Codex” covers several surfaces with different customization paths. Use the one that matches where you work.

### Codex in the ChatGPT desktop app

This is the workflow covered by this guide: copy a DexThemes `codex-theme-v1:` string, then use **Settings → Appearance** and the Import control for the matching variant.

### Codex CLI

For the CLI, OpenAI's current [CLI customization guide](https://learn.chatgpt.com/docs/cli-customization) documents `/theme`, the `tui.theme` setting, and custom `.tmTheme` files. A desktop `codex-theme-v1:` string is not a CLI `.tmTheme` file, so do not paste it into the terminal or save it in the CLI themes directory.

### Codex IDE extension

For the IDE extension, OpenAI's [IDE guide](https://learn.chatgpt.com/docs/codex/ide) covers Codex integrations for VS Code-compatible editors, Xcode, and JetBrains. That integration is separate from this desktop Appearance import flow. Change the editor's colors with the editor's own theme controls rather than treating a DexThemes import string as an IDE theme.

## Verify the theme after importing

The DexThemes preview helps you select a palette, but it is not a promise that every element will render identically in every Codex version or on every computer. After importing, check:

- Body text, code, and small interface labels against their backgrounds.
- Added and removed lines in a real diff.
- Focus, selection, disabled, and hover states you use often.
- UI and code fonts, especially if the payload names a font that is unavailable locally.
- The other appearance mode if you imported a dark-and-light pair.

If the result is difficult to read, return to Appearance and choose a comfortable built-in look or import a different DexThemes variant. An appearance import is a preference change; it should stay easy to review and reverse in the app.

## If Codex does not import the theme

Start with a clean copy-and-import pass before changing anything by hand:

1. Reopen the theme in DexThemes and select the intended variant.
2. Copy it again and confirm the text begins with `codex-theme-v1:`.
3. Open **Settings → Appearance** manually.
4. Choose **Import** for the matching variant, paste the untouched string into the dialog, and approve it.

If it is still rejected, only one mode changes, or the result differs sharply from the preview, use [Codex theme import troubleshooting](/guides/codex-theme-import-troubleshooting). The guide separates clipboard and variant problems from Codex-owned compatibility or rendering behavior.

## Related guides

- [Understand the DexThemes import handoff](/features/codex-theme-import)
- [Troubleshoot a Codex theme import](/guides/codex-theme-import-troubleshooting)
- [Compare Codex desktop and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Inspect the Codex theme format](/reference/codex-theme-format)
