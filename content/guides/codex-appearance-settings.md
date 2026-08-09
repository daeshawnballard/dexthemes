---
title: Codex Appearance Settings
description: Review Codex desktop Appearance settings for themes, colors, fonts, and the limits of DexThemes imports across app, CLI, IDE, web, and mobile.
slug: codex-appearance-settings
kind: guide
section: Guides
answer: In the ChatGPT desktop app, open Settings > Appearance to choose a base theme, adjust colors, and change UI or code fonts. DexThemes supports a separate approval-based import for the Codex view; whether it changes Chat or Work is unverified, and it does not configure the CLI, IDE, web, or mobile.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: Official ChatGPT desktop settings and platform documentation, DexThemes import source, and ChatGPT desktop 26.803.41515 build 6321 reviewed 2026-08-09.
related: /guides/change-codex-ui-and-code-fonts, /guides/codex-app-themes-vs-cli-themes, /guides/how-to-install-a-codex-theme, /guides/share-a-custom-codex-theme
---

To customize Codex UI in the unified desktop app, use **Settings > Appearance** first. OpenAI's current [ChatGPT desktop app settings documentation](https://learn.chatgpt.com/docs/reference/settings) says Appearance can change the base theme, accent, background, and foreground colors, plus the UI and code fonts. It also says you can share a custom theme.

In this guide, **Codex desktop** means the separate Codex view inside the ChatGPT desktop app. OpenAI documents that boundary in [ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex), alongside separate web, CLI, and IDE surfaces. Similar names do not make their appearance settings interchangeable.

## What Appearance currently controls

Open Settings from the app menu, or use `Cmd`+`,` on macOS or `Ctrl`+`,` on Windows. Then choose **Appearance** and work through the controls your installed version shows.

The current desktop documentation describes these choices:

- A base theme for the app.
- Accent, background, and foreground colors.
- A UI font for application text.
- A code font for code-oriented content.
- A way to share a custom theme.

That makes Appearance the right starting point when you want to customize Codex UI with a visible, reversible app setting. It is also the best place to confirm the exact labels available in your build: menus, controls, and sharing options can change as the desktop app evolves.

## How to use the built-in Appearance controls

1. Open **Settings > Appearance**.
2. Choose a base theme that is comfortable in your usual lighting.
3. Adjust accent, background, and foreground colors in small steps. Test text against the background before optimizing an accent color.
4. Set the UI and code fonts independently. The interface font should remain readable in compact labels; the code font should make characters such as `0`, `O`, `1`, `l`, brackets, and punctuation easy to distinguish.
5. Check a real task with prose, a code block, a diff, and a selected or focused control.
6. If the result is tiring to read, return to Appearance and make one change at a time.

Use built-in controls before editing a compact import string. They are easier to inspect, undo, and compare. For deeper typography guidance, read [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts).

## Appearance is different on each surface

OpenAI presents desktop, web, CLI, and IDE as distinct ways to use ChatGPT and Codex. Treat the customization mechanism as surface-specific.

### ChatGPT desktop app and its Codex view

OpenAI documents Appearance for the ChatGPT desktop app, which includes the separate Codex view. It includes a base theme, colors, UI and code fonts, and custom-theme sharing. Do not assume a desktop choice automatically changes the CLI, IDE extension, web, mobile, or another device.

### Codex CLI

Run `/theme` to choose terminal syntax highlighting; custom `.tmTheme` files live in `$CODEX_HOME/themes`. A desktop `codex-theme-v1:` import does not configure the terminal UI.

### Codex IDE extension

The extension works beside your code in an editor, with integrations for VS Code-compatible editors, Xcode, and JetBrains IDEs. Do not assume the editor's look follows a desktop Appearance import; use the editor's own appearance controls unless its documentation says otherwise.

### ChatGPT on the web

ChatGPT web has its own Theme and Accent color settings. A web change does not automatically update desktop or mobile.

### ChatGPT mobile

iOS and Android expose **Personalization > Color Scheme** for an accent color. A mobile choice does not automatically apply to web, another mobile platform, or Codex desktop.

The CLI distinction is explicit in OpenAI's [CLI customization guide](https://learn.chatgpt.com/docs/cli-customization): its `/theme` picker controls terminal syntax highlighting and saves `tui.theme` in `$CODEX_HOME/config.toml`. The [IDE extension documentation](https://learn.chatgpt.com/docs/codex/ide) describes an editor-integrated workflow, not a desktop Appearance importer.

For web and mobile, OpenAI's [visual-settings guide](https://help.openai.com/en/articles/11958281) says theme settings apply only to the device and platform where you set them. That is a useful rule for every appearance decision: configure and verify each surface independently.

## Where DexThemes fits

DexThemes is community-built and is not affiliated with OpenAI. It does not replace the desktop app's normal Appearance controls.

Its supported contribution is a separate, explicit handoff built for **the Codex view's Appearance import**:

1. Choose a dark or light variant in DexThemes.
2. Copy the complete `codex-theme-v1:` string.
3. Open Codex Settings and choose **Appearance**.
4. In the matching Dark or Light section, choose **Import**.
5. Paste the complete string into the **Import theme** dialog, review the string, and approve the import in Codex.
6. Inspect the loaded result in the Codex view before relying on it.

DexThemes can prepare and copy the payload, but Codex owns the final import, persistence, and rendering. DexThemes does not silently apply a theme, and opening Settings is not proof that Codex accepted it. See [How to install a Codex theme](/guides/how-to-install-a-codex-theme) for the complete handoff.

OpenAI's desktop settings page documents Appearance controls, but it does not document DexThemes or a public API that lets a website silently apply a theme. The DexThemes import flow above is therefore DexThemes-specific behavior, not a broader OpenAI integration claim.

## The ChatGPT-mode boundary

The unified desktop app can host more than one kind of work, but this guide does **not** claim that a DexThemes import changes ChatGPT-mode views. There is no loaded-runtime proof here that a DexThemes theme affects ChatGPT mode, so treat any apparent overlap as unverified until you test it in your own installed app.

The same boundary applies to web and mobile: a DexThemes `codex-theme-v1:` string is not documented as a setting for either surface. If you want a coordinated look, choose equivalent native controls independently and consider that visual coordination, not a shared theme installation.

## Check before you share or rely on a theme

Before sharing a custom appearance, verify the result where it will actually be used:

- Confirm the intended dark or light variant loaded in Codex desktop.
- Read prose, code, diffs, and focused controls at your normal display brightness.
- Check that any requested UI or code font is installed and readable on that computer. An import can name a font; it does not bundle a font file or license.
- Keep CLI themes, editor themes, web settings, and mobile color schemes as separate artifacts and choices.
- Tell recipients that importing requires their review and approval in their own desktop app.

OpenAI documents a built-in custom-theme sharing option for the desktop app. A DexThemes string is still useful when you want a portable, inspectable payload, but it should be shared as an explicit import request rather than presented as a cross-device or cross-surface installer. Read [Share a custom Codex theme](/guides/share-a-custom-codex-theme) for the safe sharing workflow.

## When to use another guide

- Use [Codex app themes vs CLI themes](/guides/codex-app-themes-vs-cli-themes) when your goal is terminal syntax highlighting rather than desktop UI customization.
- Use [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts) when typography is the main issue.
- Use [How to install a Codex theme](/guides/how-to-install-a-codex-theme) when you already have a `codex-theme-v1:` string.
- Use [Share a custom Codex theme](/guides/share-a-custom-codex-theme) when you need to send a theme without implying automatic installation.

## Official documentation

- [ChatGPT desktop app settings](https://learn.chatgpt.com/docs/reference/settings)
- [ChatGPT Work and Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)
- [Codex CLI customization](https://learn.chatgpt.com/docs/cli-customization)
- [Codex IDE extension](https://learn.chatgpt.com/docs/codex/ide)
- [Update your visual experience in ChatGPT](https://help.openai.com/en/articles/11958281)
