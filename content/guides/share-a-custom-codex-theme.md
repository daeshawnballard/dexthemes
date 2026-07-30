---
title: Share a Custom Codex Theme
description: Share a portable theme import string, a public theme page, or a community submission without implying automatic installation.
slug: share-a-custom-codex-theme
kind: guide
section: Guides
answer: Copy the complete codex-theme-v1 string for each variant and send it as plain text, or share a public DexThemes theme page once the theme is actually published.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current builder sharing and community submission source
related: /guides/create-a-custom-codex-theme, /guides/move-a-codex-theme-to-another-computer, /guides/is-dexthemes-safe
---

The most portable way to share a custom Codex theme is to send its complete `codex-theme-v1:` import string as plain text. The recipient opens Codex Settings, chooses Appearance, chooses Import theme, pastes the string, reviews it, and approves it.

That is a handoff, not an automatic installation. DexThemes is community-built and is not affiliated with OpenAI.

## Share the import string directly

1. Open your theme in the DexThemes builder.
2. Select the dark or light variant you want to share.
3. Give the theme a clear name so your message has context.
4. Choose **Share theme** or the available copy control.
5. Paste the value into a plain-text note and confirm that it starts with `codex-theme-v1:`.
6. Send the untouched string through a channel you trust.
7. Include the theme name, whether it is dark or light, and a link to the [installation guide](/guides/how-to-install-a-codex-theme).

The current builder's share action copies the active variant's import string. It does not create a permanent hosted page for an unpublished private draft.

## Send both variants clearly

Dark and light are separate payloads. If you created both, label them so the recipient cannot confuse the two:

```text
Theme name: Example Theme
Dark variant: codex-theme-v1:{...}
Light variant: codex-theme-v1:{...}
```

Do not combine both JSON objects after one prefix. The recipient should import each into its matching Appearance slot.

Before sending, paste each full value into a plain-text editor. Rich-text apps can introduce smart quotes, visual truncation, or line wrapping that makes copying unreliable. Line wrapping is harmless when it is only visual, but missing characters are not.

## Share a public page

A public DexThemes theme page is easier to revisit than a long payload. For a catalog theme:

1. Open the desired theme and variant.
2. Copy its canonical public page URL.
3. Send the page link with a short note about the variant.
4. Tell the recipient to copy the import string from DexThemes and approve it in Codex Appearance.

A preview link is not an installer. It lets the recipient inspect the palette and decide whether to copy it.

For a custom builder theme, a public page exists only after the theme is accepted and actually visible in the community catalog. A successful submission response, local preview, or moderation step is not the same as public availability.

## Submit a theme to the community

Use community submission when you want the theme discoverable beyond a private exchange.

1. Complete at least one dark or light variant in the builder.
2. Prefer completing both variants so more people can use the theme.
3. Sign in when the submission flow asks.
4. Review the name, summary, colors, and variant data.
5. Submit the theme.
6. Wait until the theme is publicly visible before sharing it as a published community theme.

The current project applies validation, content checks, protected-palette rules, moderation, and publication state to community themes. Those safeguards reduce obvious problems but do not turn a community submission into an OpenAI-reviewed or OpenAI-endorsed theme.

## Use Codex sharing controls when appropriate

OpenAI's [official desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings) says Appearance can share a custom theme with friends. Because the exact sharing control can change with the app, follow the interface in your installed Codex build.

DexThemes sharing remains useful when you created the palette in its builder or want a portable text artifact you can inspect. Whichever route you use, make the recipient's approval step explicit.

## Inspect what you send

A current DexThemes import contains appearance data: colors, contrast, optional font names, an opaque-windows preference, a variant, and a code-theme family ID. It should not contain an account token, repository path, private URL, or executable script.

Before sharing:

- Confirm the exact `codex-theme-v1:` prefix.
- Inspect the JSON fields against the [format reference](/reference/codex-theme-format).
- Remove surrounding chat context that contains sensitive work.
- Do not attach credentials or private screenshots.
- Do not shorten or transform the payload with an untrusted tool.

The import string does not bundle font files. If your design requests a particular font, tell the recipient which properly licensed font they need or offer a fallback.

## Set expectations for recipients

Tell recipients that:

- Codex must expose the Appearance import control in their installed build.
- They must approve the import.
- Dark and light variants install separately.
- A theme can render differently because of Codex version, operating system, display, and fonts.
- The desktop app format does not configure the Codex CLI.
- They can return to a built-in theme from Appearance if the custom palette is uncomfortable.

This framing is more useful than saying “one-click install,” because it describes the actual trust boundary and prevents confusion when general Settings opens.

## Archive a durable copy

Save each import string in a small UTF-8 plain-text file, along with:

- Theme name.
- Variant.
- Date exported.
- Optional font names.
- A public page URL, if one exists.

Do not rely only on the current browser's builder draft. The builder uses local browser storage for draft continuity, which is not a substitute for a portable backup.

## Related guides

- [Create a custom Codex theme](/guides/create-a-custom-codex-theme)
- [Move a theme to another computer](/guides/move-a-codex-theme-to-another-computer)
- [Check DexThemes safety boundaries](/guides/is-dexthemes-safe)
- [Install a shared theme](/guides/how-to-install-a-codex-theme)
