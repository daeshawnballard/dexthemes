---
title: How to Change the ChatGPT Desktop App Theme
description: Change the ChatGPT desktop app theme with documented Appearance controls, and learn why a Codex theme import is not established ChatGPT-mode compatibility.
slug: change-chatgpt-desktop-app-theme
kind: guide
section: Guides
answer: In the ChatGPT desktop app, use Settings > Appearance to choose a base theme, adjust colors, and select UI and code fonts. The same app lets you choose ChatGPT or Codex, but DexThemes has no loaded-runtime evidence that a `codex-theme-v1:` import affects ChatGPT mode; use that payload only as a Codex handoff.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: Official ChatGPT desktop-app and visual-settings documentation retrieved 2026-08-09; current DexThemes Codex import contract, with ChatGPT-mode compatibility unverified.
related: /guides/codex-appearance-settings, /guides/how-to-install-a-codex-theme, /guides/codex-app-themes-vs-cli-themes, /guides/share-a-custom-codex-theme
---

To change the **ChatGPT desktop app theme**, open **Settings > Appearance**. OpenAI documents a base theme, accent, background, and foreground colors, plus separate UI and code fonts. Use those built-in controls when your goal is to change how ChatGPT looks in the desktop app.

**Important:** DexThemes documents an approval-based **Codex desktop** import handoff. It **does not have loaded-runtime evidence** that a DexThemes `codex-theme-v1:` import affects **ChatGPT mode** in the unified desktop app. Source validation, a copied payload, an import dialog, or a Codex result would not establish ChatGPT-mode compatibility.

## Change the ChatGPT desktop app theme

OpenAI documents the desktop app as one workspace where you can choose **ChatGPT** or **Codex**. The Appearance panel is the documented place to change the app's visual settings. This guide answers the ChatGPT-mode question; use [Codex Appearance Settings](/guides/codex-appearance-settings) for the separate Codex workflow.

1. Open the ChatGPT desktop app and select the workspace you use.
2. Open **Settings** from the app menu. On macOS, the documented shortcut is `Cmd`+`,`; on Windows, it is `Ctrl`+`,`.
3. Choose **Appearance**.
4. Select a base theme, then adjust the accent, background, and foreground colors if you want a more personal palette.
5. Choose UI and code fonts separately, then inspect normal text, code, and focused controls before keeping the change.

The exact labels and available options can change with a desktop-app update. Use the controls shown in your installed app rather than assuming a screenshot or an older guide is identical.

## ChatGPT and Codex are in one desktop app, but have different theme evidence

The [ChatGPT desktop app overview](https://learn.chatgpt.com/docs/app) says the app lets you choose ChatGPT or Codex. The [desktop settings reference](https://learn.chatgpt.com/docs/reference/settings) says Appearance changes the app's base theme, colors, UI font, and code font, and can share a custom theme.

That shared application does not make every appearance artifact interchangeable. Native Appearance controls are documented desktop-app settings. A DexThemes `codex-theme-v1:` payload is a separate, community-built handoff intended for Codex desktop. OpenAI's cited Settings page does not document DexThemes or that payload, and DexThemes has not established through loaded-runtime testing that it changes a ChatGPT-mode view.

Use this rule when the names overlap: choose the native Appearance controls for ChatGPT mode, and treat a DexThemes import as a Codex-desktop-only workflow unless and until compatibility is proven in the loaded app.

## Platform comparison

Compare the controls by surface before testing a new look.

```text
Surface               Path or workflow                              What to rely on
ChatGPT desktop app   Settings > Appearance                         Native base theme, colors, and fonts
Codex desktop         DexThemes handoff to Appearance > Import      Verify acceptance in the installed Codex view
ChatGPT on the web    Profile > Settings > General                  Web Theme and Accent color controls
ChatGPT mobile        Profile > Personalization > Color Scheme      Mobile color scheme for that mobile platform
```

OpenAI's [visual-settings guide](https://help.openai.com/en/articles/11958281) says theme settings apply only to the device and platform where you set them. A web theme does not update mobile, and an Android change does not update iOS. Apply the same careful logic to desktop: verify ChatGPT mode and Codex desktop independently instead of assuming a similar name or shared account synchronizes appearance.

## What to use on desktop, web, and mobile

### ChatGPT desktop app

Use **Settings > Appearance**. This is the documented route for the desktop app's base theme, colors, and fonts. Verify the result in an actual ChatGPT-mode conversation before treating the change as established there.

### ChatGPT on the web

Use the web app's **Profile > Settings > General** controls for Theme and Accent color. Those are web settings, not a transfer of desktop Appearance preferences.

### ChatGPT on iOS or Android

Use **Profile > Personalization > Color Scheme** to choose the mobile accent color. The setting is specific to the mobile platform where you make it.

### Codex in the desktop app

Use the same app's native Appearance controls for ordinary customization. If you specifically want to test a DexThemes palette in **Codex desktop**, its documented handoff is explicit: copy the complete `codex-theme-v1:` string, open Codex **Settings > Appearance > Import theme**, review it, and approve it in Codex. Then verify whether the installed Codex view accepted and persisted it.

That last workflow is deliberately not a ChatGPT-mode instruction. Do not paste a DexThemes payload into ChatGPT mode expecting documented compatibility.

## Test safely and roll back cleanly

Appearance changes are easier to evaluate when you make them one at a time.

1. Before changing anything, note your current base theme, color choices, and fonts.
2. Change one native Appearance setting, then check a normal conversation, code block, diff, and a focused or selected control.
3. Switch between ChatGPT and Codex if you use both. Record what you actually see in each view instead of inferring that a change propagated.
4. If the result is hard to read, return to **Settings > Appearance** and restore the values you noted, or select a comfortable built-in base theme.
5. For a Codex-only DexThemes test, keep the prior native setting or prior approved Codex theme available as your rollback choice. Re-import only through Codex's review-and-approval flow.

Do not use a successful copy action, an import dialog, a preview, or a source/build check as proof that a DexThemes payload changed ChatGPT mode. Only observation in the installed, loaded ChatGPT-mode runtime would establish that behavior.

## Where DexThemes fits

DexThemes is community-built and is not affiliated with OpenAI. It can prepare a portable theme payload for the explicit Codex desktop import handoff, but Codex owns acceptance, review, approval, persistence, and rendering.

For a Codex desktop theme, choose a dark or light variant in DexThemes and use the explicit import handoff. For ChatGPT mode, start with the documented native Appearance controls above. That distinction keeps a useful theme workflow from becoming an unsupported compatibility promise.

## Related Codex theme guides

- [Codex Appearance Settings](/guides/codex-appearance-settings)
- [How to install a Codex theme](/guides/how-to-install-a-codex-theme)
- [Codex app themes vs CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Share a custom Codex theme](/guides/share-a-custom-codex-theme)

## Official sources

- [ChatGPT desktop app overview](https://learn.chatgpt.com/docs/app)
- [ChatGPT desktop app settings](https://learn.chatgpt.com/docs/reference/settings)
- [Updating your visual experience on ChatGPT](https://help.openai.com/en/articles/11958281)
