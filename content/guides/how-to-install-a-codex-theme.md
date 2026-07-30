---
title: How to Install a Codex Theme
description: Copy a validated Codex theme string from DexThemes and import it through Codex Appearance settings.
slug: how-to-install-a-codex-theme
kind: guide
section: Guides
answer: Choose a theme and variant in DexThemes, copy its complete codex-theme-v1 import string, open Codex Settings, choose Appearance, then use Import theme to paste and approve it.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current source and installed Codex desktop 26.721.81911 build 5973 appearance registry
related: /guides/codex-theme-import-troubleshooting, /reference/codex-theme-format, /guides/is-dexthemes-safe
---

Installing a DexThemes theme is a copy-and-import handoff. DexThemes prepares the appearance data, but Codex owns the final import and asks you to approve it. DexThemes does not silently apply a theme.

DexThemes is community-built and is not affiliated with OpenAI. OpenAI's [Codex desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings) confirms that Appearance controls the base theme, accent, background, foreground, and UI and code fonts. The exact controls can change as Codex evolves.

## Install a theme

1. Open DexThemes and choose the theme you want.
2. Select the dark or light variant. A theme may offer one variant or both.
3. Use the theme's copy or apply control. The complete copied text should begin with `codex-theme-v1:`.
4. Open Codex Settings. On desktop, DexThemes may open the general Settings screen after copying. You can also open Settings from the app menu or use `Cmd+,` on macOS and `Ctrl+,` on Windows.
5. Choose **Appearance** yourself.
6. Choose **Import theme**. Depending on the Codex build and selected mode, the control may be labeled **Import Dark Theme** or **Import Light Theme**.
7. Paste the entire import string, including the `codex-theme-v1:` prefix.
8. Review the result and choose **Import** to approve the change.
9. Return to a task with text, code, and a diff so you can verify the theme under real working conditions.

The safe flow is always copy, open Settings, choose Appearance, and import. DexThemes currently uses the general Codex Settings handoff; it does not claim a verified direct link to Appearance or a public silent-apply API.

## Import dark and light variants separately

A Codex import string contains one top-level `variant` value: either `dark` or `light`. If a theme offers both, repeat the process for each variant:

1. Select dark in DexThemes, copy its string, and import it into the dark slot in Codex.
2. Return to DexThemes, select light, copy that string, and import it into the light slot.
3. Switch Codex between its light and dark appearance modes and inspect both.

Importing a dark payload does not install the light palette at the same time. Keeping the two imports separate also makes it easier to replace only one side later.

## Check the string before pasting

A DexThemes-generated import is plain text with a prefix followed by compact JSON. It should resemble:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#0169cc","contrast":60,"fonts":{"code":null,"ui":null},"ink":"#fcfcfc","opaqueWindows":true,"semanticColors":{"diffAdded":"#00a240","diffRemoved":"#e02e2a","skill":"#b06dff"},"surface":"#111111"},"variant":"dark"}
```

Do not add quotation marks around the full string. Do not remove the prefix, paste only the JSON portion, or combine two variants into one payload. If you want to audit every field, use the [Codex theme format reference](/reference/codex-theme-format).

## Verify the result

The DexThemes preview is a useful design preview, not a byte-for-byte screenshot of every Codex surface. After importing, inspect:

- Body text against the main surface.
- Code and syntax highlighting.
- Added and removed diff lines.
- Skill or function accents.
- Focus, selection, and disabled states.
- Both bright and dim display conditions.

If the import succeeds but the result is uncomfortable, restore a built-in appearance or adjust the theme in Codex Appearance. An import is a preference change, not a reason to keep a palette that reduces readability.

## Know the boundaries

DexThemes validates and serializes its current theme format, but it does not control the Codex parser. A future Codex release can change accepted theme families or import behavior. Passing DexThemes validation proves that the string matches the project's current contract; the successful, persisted import in your installed Codex build is the final check.

The app theme format is also different from a Codex CLI theme. The CLI uses `/theme` and custom `.tmTheme` files, while DexThemes produces a desktop Appearance import. See [Codex app themes versus CLI themes](/guides/codex-app-themes-vs-cli-themes) before trying to move one format into the other.

If nothing changes, the string is rejected, or only one mode updates, follow [Codex theme import troubleshooting](/guides/codex-theme-import-troubleshooting).

## Related guides

- [Fix a Codex theme import](/guides/codex-theme-import-troubleshooting)
- [Understand the Codex theme format](/reference/codex-theme-format)
- [Check whether DexThemes is safe to use](/guides/is-dexthemes-safe)
- [Move a theme to another computer](/guides/move-a-codex-theme-to-another-computer)
