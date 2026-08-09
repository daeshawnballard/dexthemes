---
title: Create a Custom Codex Pet
description: Create and customize a floating Codex pet in the ChatGPT desktop app with the documented Pets flow, visual QA, reduced-motion checks, and rollback.
slug: create-custom-codex-pet
kind: guide
section: Guides
answer: To create a custom desktop Codex pet, open Settings > Pets > Create your own pet in the ChatGPT desktop app, describe it in the chat that opens, then return to Pets, select Refresh, and choose it. Use `/pet`, Wake Pet, or Tuck Away Pet to show or hide that floating desktop companion.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: Official OpenAI Pets and desktop Settings documentation plus the published OpenAI Hatch Pet workflow, reviewed 2026-08-09.
related: /features/theme-builder, /guides/codex-theme-accessibility, /guides/codex-app-themes-vs-cli-themes
---

Codex pet customization spans more than one interface. This guide covers the **floating desktop-app pet** and the app's **Create your own pet** flow, not the separate terminal-pet picker in Codex CLI. Pets are also not a DexThemes theme feature.

OpenAI describes pets as optional animated companions: choosing one changes its appearance, not how ChatGPT completes tasks. In the ChatGPT desktop app, open the profile menu and choose **Pets**, or open **Settings > Pets**. The current [OpenAI Pets documentation](https://learn.chatgpt.com/docs/pets?surface=app) is the source of truth for that flow; the [desktop Settings reference](https://learn.chatgpt.com/docs/reference/settings) confirms the same controls.

## Pets are separate from DexThemes themes

DexThemes creates and shares Codex theme artifacts. It does not create, install, or host custom pets; the reviewed DexThemes source and bundled skill expose no pet creator, package installer, gallery, or hosting integration.

That boundary matters:

- A DexThemes `codex-theme-v1:` import changes theme settings; it is not a pet package.
- Selecting, waking, tucking away, or creating the floating pet covered here happens in the ChatGPT desktop app's **Pets** controls.
- A custom pet created through the desktop app is stored locally on that computer and does not automatically sync to ChatGPT web.

Use DexThemes to coordinate the app's colors and fonts if you want; use the documented Pets workflow to choose or make the companion. Neither system installs or configures the other.

## Start with a built-in pet

Before generating anything custom, confirm that Pets work in the desktop app you actually use:

1. Open **Settings > Pets**.
2. Choose one of the built-in pets.
3. Enter `/pet` in a chat, or open the command menu and choose **Wake Pet**.
4. Hide it with **Tuck Away Pet** in Settings or the command menu, or enter `/pet` again.

This separates a general Pets availability or overlay problem from a custom-pet problem. The documented controls affect the floating overlay; your chosen pet and its position persist when you reopen the app.

## Create a custom Codex pet

The documented desktop route is intentionally simple:

1. Open **Settings > Pets** and select **Create your own pet**.
2. The app installs its bundled `hatch-pet` skill, reloads skills, and opens a new chat.
3. Describe the companion you want in that chat.
4. When the task finishes, return to **Settings > Pets**, select **Refresh**, then choose the new pet.

The creation chat is where you describe the character; the Pets setting is where you select it and control its visibility. Do not replace this flow with an unverified community installer or a hand-edited app bundle.

## Use only the documented custom-pet asset contract

For a generated desktop pet, the OpenAI-published [Hatch Pet workflow](https://github.com/openai/skills/blob/main/skills/.curated/hatch-pet/SKILL.md) documents a current package and validation contract. Its packaged local output pairs:

- `pet.json`
- `spritesheet.webp`

The published workflow's acceptance criteria specify a transparent-capable PNG or WebP atlas at exactly `1536 × 1872` pixels, based on `192 × 208` cells. Used cells must contain artwork, unused cells must be fully transparent, and the atlas must follow the referenced animation-row contract. Its packaging instructions stage the manifest and `spritesheet.webp` together under the local Codex pets directory.

Those are the published workflow requirements to preserve. The skill bundled with an installed app can be newer or older than the default branch on GitHub, so let the app-created flow own packaging and recheck its installed instructions before diagnosing a mismatch. Do not invent a different file format, image size, animation state, import endpoint, or manual installation path because a third-party example happens to work on one version.

### Do not mix desktop creation with web upload

OpenAI separately documents a **web** upload flow under **Settings > Personalization > Pet > Upload pet**. That web upload accepts a transparent PNG or WebP that is exactly `1536 × 1872` pixels and no larger than `20 MiB`; its web settings also offer edit, download, refresh, and delete controls.

Those upload limits and web-only management controls are not instructions to bypass the desktop **Create your own pet** flow. For desktop creation, use the app-created pet and **Refresh** path above. For a web upload, use the web flow and its own controls.

### Keep desktop, CLI, and IDE pet behavior separate

OpenAI also documents `/pets` or `/pet` as the Codex CLI terminal-pet picker. A compatible custom pet installed on the computer may appear there, but the terminal pet follows the current CLI session and requires a supported terminal. It is not the desktop app's floating overlay or multi-chat activity tray.

The Codex IDE extension does not currently provide a pet picker or floating pet overlay. A successful desktop creation therefore does not establish an IDE feature, and a CLI picker result does not prove that the desktop overlay is awake.

## Test the pet before relying on it

After selecting the new pet, use a short, ordinary chat to check the whole loop:

1. Confirm that the selected custom pet appears after **Refresh**.
2. Wake it with `/pet` or **Wake Pet**.
3. Watch it while a chat is **Running**, then when it **Needs input**, is **Ready**, or is **Blocked**. Those are the status meanings OpenAI currently documents for the desktop activity companion.
4. Tuck it away, wake it again, and reopen the app to confirm that the expected selection and position persist.

If the custom entry does not appear, use **Refresh** first. The current desktop documentation does not prescribe a manual-file repair or a desktop package-import workaround, so do not alter local application files based on a forum post or an issue report.

## Check motion and readability

Pets respect the operating system's reduced-motion setting. With reduced motion enabled, the desktop app uses a still frame instead of sprite animation. Test that mode before you settle on a design:

1. Enable your operating system's reduced-motion preference.
2. Wake the pet and confirm that its still frame remains recognizable at its normal on-screen size.
3. Turn the system preference back to your usual setting and verify that normal animation remains visually stable.

The Hatch Pet workflow also requires a compact, readable silhouette and details that remain legible inside a `192 × 208` cell. Treat that as a practical quality bar: the companion should still be identifiable without motion, without tiny text, and without relying on a subtle color difference alone. This is a design and QA check, not an accessibility certification.

## Hide, switch, or roll back safely

For an immediate rollback from a distracting companion, choose **Tuck Away Pet** in **Settings > Pets** or the command menu, or enter `/pet` again. To change the active companion, select a built-in pet in the same settings screen and then wake or hide the overlay as needed.

The desktop documentation says app-created custom pets are stored locally and documents **Refresh** and selection, but it does not document a permanent desktop custom-pet delete or uninstall workflow. Do not delete local files on the strength of a third-party guide. Recheck the current OpenAI documentation or use supported in-app or support guidance if permanent removal is important. The web upload page's delete control applies to uploaded web pets, not automatically to a locally created desktop pet.

## Sources and limits

This guide relies on the current [OpenAI Pets documentation](https://learn.chatgpt.com/docs/pets?surface=app), the [ChatGPT desktop Settings reference](https://learn.chatgpt.com/docs/reference/settings), and the published [Hatch Pet workflow](https://github.com/openai/skills/blob/main/skills/.curated/hatch-pet/SKILL.md). Pets, their creation flow, and the package contract can change with app or skill updates, so recheck the installed controls and current sources before troubleshooting or sharing a package.

Community galleries and user-reported GitHub issues can be useful as reports of an experience, but they are not product documentation and do not establish a supported capability, asset contract, or recovery procedure.

## Related guides

- [Use the DexThemes theme builder](/features/theme-builder)
- [Test Codex theme accessibility](/guides/codex-theme-accessibility)
- [Understand Codex app themes versus CLI themes](/guides/codex-app-themes-vs-cli-themes)
