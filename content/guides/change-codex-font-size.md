---
title: Change Codex Font Size
description: Change Codex font size in the ChatGPT desktop app, VS Code extension, or CLI with the correct Appearance, editor, or terminal control.
slug: change-codex-font-size
kind: guide
section: Guides
answer: To change Codex font size in the current ChatGPT desktop app, open Settings → Appearance and adjust UI font size or Code font size. In the VS Code extension, use `chat.fontSize` and `chat.editor.fontSize`; in Codex CLI, use your terminal’s font or zoom control.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: ChatGPT desktop 26.803.41515 build 6321, official OpenAI settings and developer-settings documentation, VS Code documentation, and the current DexThemes theme contract reviewed 2026-08-09.
related: /guides/change-codex-ui-and-code-fonts, /guides/codex-app-themes-vs-cli-themes, /guides/codex-theme-accessibility
---

Font size is not one shared setting across Codex. The Codex view in the current ChatGPT desktop app has its own Appearance controls, the VS Code extension honors editor chat settings, and Codex CLI inherits glyph sizing from the terminal that renders it. Change the control for the surface that is actually too small.

DexThemes does not control font size. Its current builder creates theme colors, and its desktop import format can name UI and code font families, but the payload does not carry numeric font sizes. Importing a theme therefore does not resize Codex text, code, controls, or the application window.

## Change font size in the ChatGPT desktop app

For the installed desktop app’s Codex workspace:

1. Open **Settings** from the app menu.
2. Choose **Appearance**.
3. Adjust **UI font size** for the base application UI.
4. Adjust **Code font size** for code shown across chats and diffs.
5. Return to a normal Codex task and inspect prose, code, and a diff before settling on the values.

In ChatGPT desktop 26.803.41515 build 6321, the UI control offers 11–16 px and the code control offers 8–24 px. Treat those ranges as build-specific observations, not permanent platform limits: the installed app owns the labels and allowed values, and a later release can change them.

OpenAI’s [Settings documentation](https://learn.chatgpt.com/docs/reference/settings) describes Appearance as the place for the base theme, colors, and UI and code font families, but the current public page does not yet enumerate these two size controls. Follow the controls shown in your installed app. If a different or older build does not show them, use the scoped fallback below rather than editing app storage, a theme payload, or an undocumented configuration key.

Font **family** and font **size** solve different problems. A family can make characters such as `0`, `O`, `1`, and `l` easier to distinguish; the size controls make the rendered text larger or smaller. Use [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts) when the family itself is the problem.

### If the desktop controls are unavailable

If the entire desktop app is too small and your installed build has no app-specific size controls, operating-system display settings are the honest fallback. They affect more than Codex:

- On macOS, choose a larger scaled resolution in **System Settings > Displays**. Apple explains that display resolution changes the size of text and objects across the screen in its [display-resolution guide](https://support.apple.com/en-ie/guide/mac-help/-mchl86d72b76/mac).
- On Windows, **Settings > Accessibility > Text size** can enlarge text, while **Settings > System > Display > Scale** enlarges text, apps, and images. Microsoft documents both scopes in [Change the size of text in Windows](https://support.microsoft.com/en-us/windows/change-the-size-of-text-in-windows-1d5830c3-eee3-8eaa-836b-abcc37d99b9a).

This is a system-level accessibility choice, not a DexThemes setting or a Codex preference. It can change available workspace, wrapping, and the size of other applications. Prefer the app’s UI and Code font size controls when they are present; use system scaling only when its wider scope is acceptable.

## Increase font size in the Codex IDE extension

In VS Code, use the editor's Settings rather than `config.toml`:

1. Open the editor's Settings.
2. Search for `chat.fontSize` and raise the value to enlarge Codex chat text and the composer in the sidebar.
3. Search for `chat.editor.fontSize` and raise the value to enlarge code-rendered content in Codex chats, including snippets and diffs.
4. Open a response containing prose, a code block, and a diff. Check all three before deciding on the value.

OpenAI's [current developer-settings reference](https://learn.chatgpt.com/docs/developer-settings) names both settings and says that the extension honors VS Code's built-in chat font settings. It also makes an important boundary explicit: these are editor settings, not shared Codex-agent settings, so they do **not** belong in `config.toml`.

If source files are too small as well, change `editor.fontSize` separately. If you run Codex CLI in VS Code's integrated terminal, use `terminal.integrated.fontSize` for that terminal. VS Code documents both settings, along with `window.zoomLevel` for scaling the broader editor interface, in its [settings tips](https://code.visualstudio.com/docs/editing/tips-and-tricks). Those controls have different scope:

- `chat.fontSize` changes Codex conversation text and the composer.
- `chat.editor.fontSize` changes code blocks and diffs inside Codex chats.
- `editor.fontSize` changes the files you edit.
- `terminal.integrated.fontSize` changes the integrated terminal, including a CLI session.
- `window.zoomLevel` is for the wider VS Code interface, not just Codex.

Use the two `chat.*` settings first when the Codex sidebar alone is hard to read. Use the editor or window settings only when the rest of the IDE needs to be larger too.

OpenAI describes Xcode and JetBrains as separate IDE integrations. Do not assume they accept VS Code's `chat.*` keys. Use the host IDE's accessibility or font controls there unless its own current documentation says otherwise.

## Codex CLI: use the terminal's size controls

The Codex CLI renders inside a terminal emulator. OpenAI's [CLI customization guide](https://learn.chatgpt.com/docs/cli-customization) documents syntax highlighting, the `/theme` picker, custom `.tmTheme` files, the prompt editor, completions, and shortcuts. It does not document a CLI font-size setting or a `/zoom` command.

Use the font-size or zoom control provided by **your terminal emulator** instead. The exact menu and shortcut vary by terminal, and the change may apply to one window, profile, or all sessions. It changes the CLI display in that terminal; it does not change the Codex desktop app or the IDE sidebar.

Do not add a speculative setting such as `tui.fontSize` to `config.toml`. `/theme` changes terminal colors and syntax styling, not glyph size. Keep a CLI `.tmTheme` file separate from a `codex-theme-v1:` desktop import; they are different theme systems. See [Codex app themes versus CLI themes](/guides/codex-app-themes-vs-cli-themes).

## Check readability after increasing size

The largest setting is not automatically the most usable one. Test with a normal task rather than a settings preview:

- Read a long response and a dense diff without leaning closer to the display.
- Verify that code, line numbers, punctuation, and changed-line markers remain easy to distinguish.
- Check that important controls remain visible rather than being pushed off-screen by wrapping.
- Confirm that the chosen scale works on each display you use, especially an external high-resolution monitor.
- Keep enough contrast between text and the selected theme colors; size cannot repair a weak foreground color by itself.

If you use a theme, evaluate its colors after choosing the size and scale you actually need. A contrast decision made at a tiny preview size may not hold at a different display scale. [Design an accessible Codex theme](/guides/codex-theme-accessibility) covers the color side of that decision.

## Related guides

- [Change Codex UI and code fonts](/guides/change-codex-ui-and-code-fonts)
- [Compare Codex app and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Design an accessible Codex theme](/guides/codex-theme-accessibility)
