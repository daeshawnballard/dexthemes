---
title: Best Codex CLI Themes
description: Choose the best Codex CLI theme with a picker-based method for syntax highlighting, readable diffs, terminal backgrounds, and custom .tmTheme files.
slug: best-codex-cli-themes
kind: article
section: Articles
answer: The best Codex CLI theme is the `/theme` picker choice—built-in or custom—that keeps fenced code blocks and file diffs readable in your actual terminal. OpenAI does not enumerate every bundled choice, so treat the installed picker as authoritative and decide by background fit, contrast, diff separation, and syntax clarity.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: Official OpenAI Codex CLI customization and configuration documentation reviewed 2026-08-09; DexThemes source reviewed for the CLI distribution boundary.
related: /guides/codex-app-themes-vs-cli-themes, /guides/install-custom-tmtheme-codex-cli, /guides/codex-themes-download
---

The best Codex CLI theme is the one that makes a real response and a real diff easy to read in the terminal profile you actually use. Start with `/theme`, preview the available choices, and judge code fences, comments, additions, and removals together rather than choosing from a name or a single swatch.

OpenAI documents the picker, its saved `tui.theme` selection, and the custom `.tmTheme` path, but its current [CLI customization guide](https://learn.chatgpt.com/docs/cli-customization) does not enumerate every bundled theme. That means the picker in the installed CLI is authoritative for the names available to you and for their rendered result. This article intentionally does not publish a stale “top themes” list or invent rankings from desktop-theme labels.

## What a Codex CLI theme changes

Codex CLI themes are terminal UI themes. OpenAI documents them as syntax highlighting for fenced Markdown code blocks and file diffs. In an interactive session, `/theme` opens the picker, previews a choice, and saves the selection to `tui.theme` in `$CODEX_HOME/config.toml`.

That scope is important when comparing Codex CLI themes:

- A CLI theme is not a documented way to set your terminal emulator’s font size, window opacity, tabs, background image, or global profile.
- A CLI theme is not a ChatGPT desktop Appearance import. The desktop app uses a separate `codex-theme-v1:` workflow.
- A CLI theme is not automatically an IDE theme.

The terminal around the CLI still matters. A dark, light, translucent, or tinted terminal profile changes the visual context in which you see the same syntax colors. Treat the terminal palette, background, font rendering, and display brightness as part of the test environment—not as settings that `/theme` necessarily changes.

For the format boundary and why a desktop import cannot configure the CLI, read [Codex app themes vs CLI themes](/guides/codex-app-themes-vs-cli-themes).

## The method behind this recommendation

There is no universal best Codex CLI theme, and this is not a popularity ranking. I do not rank built-in choices by a theme name, download count, a screenshot, or whether a similarly named desktop theme looks good. The official CLI documentation does not provide a complete, stable built-in list to support that kind of ranking.

Instead, evaluate every candidate visible in your installed picker against five practical criteria:

1. **Primary reading:** Can you read a full assistant response, muted text, punctuation, and small labels without hunting for the line you were on?
2. **Code hierarchy:** Are comments, strings, keywords, types, and punctuation distinct enough in a fenced code block without making every token compete for attention?
3. **Diff clarity:** Can you identify added and removed lines, hunk context, and unchanged surrounding code at a glance? Do not rely on red versus green alone; the text, prefixes, and layout should still carry meaning.
4. **Background fit:** Does the palette remain coherent against the dark or light terminal profile you use most often? A comfortable dark palette can become muddy over a translucent or tinted canvas, while a low-contrast light palette can disappear in a bright room.
5. **Sustained use:** After several minutes of reading, editing, and reviewing, do any accents, bright tokens, or dim comments keep pulling attention away from the work?

This is a visual selection method, not a claim about eye health, productivity, accessibility certification, or universal comfort. If accessibility conformance matters, test the actual rendered terminal states with the user’s requirements rather than inferring a result from a theme label or a few color values.

## Choose a family, then use the installed picker

Because the bundled names can change, use the picker to find an available option in the family that suits the job. These are selection families, not claims that every Codex CLI version ships a theme with exactly these labels.

### Neutral dark for everyday code and prose

Start with a restrained dark candidate when your terminal profile is dark and you spend long periods reading explanations, plans, or command output beside code. The useful relationship is clear light text against a dark base, with syntax colors that remain secondary to ordinary prose.

Reject a candidate if comments, punctuation, or muted output sink into the background. Also reject one whose accent is so bright that buttons, file paths, or syntax categories look more important than the text you are trying to read.

### High-separation dark for immediate boundaries

Choose a higher-separation dark candidate when you need code blocks and diffs to announce themselves quickly. Look for a strong foreground-to-background relationship and obvious added-versus-removed treatment, then make sure the distinction survives a real multiline diff.

The tradeoff is visual intensity. Near-white text on a very dark canvas and highly saturated token colors can be easy to locate while still feeling busy over a long session. Test ordinary assistant prose as carefully as the vivid parts of the preview.

### Light or pale for a light terminal profile

If your terminal uses a light background, look for a candidate whose primary ink remains strong against that canvas and whose muted syntax does not collapse into faint gray. Check selection and diff states as well as the main code colors; a theme that works in a dark screenshot can be the wrong fit for a pale profile.

Do not assume that “light” means maximum black-on-white contrast. Warm whites, cool grays, and softer dark ink can each work if the complete hierarchy remains distinct. The right test is whether you can read a code block and compare a diff without increasing zoom or guessing at a token.

### Restrained color for review-heavy work

When file diffs and dense code are the priority, a less saturated palette can be a better starting point than the most dramatic theme in the picker. Keep the accents strong enough to signal a state, but require additions, removals, and syntax categories to retain their own roles.

This is particularly useful when multiple colored states appear on one screen. A palette that gives every category a vivid hue can look impressive in isolation yet make a complex diff harder to scan.

## Test the terminal palette, code, and diffs together

Do not decide from the picker preview alone. Preview each finalist in the terminal profile you use for real work, then run the same short inspection:

1. Read a response with prose, inline code, and muted text.
2. Inspect a fenced code block with comments, strings, keywords, types, operators, and punctuation.
3. Inspect a file diff with added and removed lines beside each other, including unchanged context.
4. Switch to the other terminal profile you use, if you switch between dark and light backgrounds.
5. Notice whether the theme still works after several minutes rather than only in the first colorful screen.

The terminal palette interaction is why a theme cannot be judged as a self-contained file. If you change terminal background, opacity, color profile, font, display, or operating environment, repeat the test. The same Codex CLI choice may still be valid, but its practical readability is a fresh question.

## When a custom `.tmTheme` is the better answer

Use a custom `.tmTheme` when the installed choices are close but none give you the code and diff hierarchy you need. OpenAI’s documented workflow is to place the file in `$CODEX_HOME/themes`, then choose it in the `/theme` picker. Let the picker save the active selection instead of guessing at a `tui.theme` value by hand.

Choose a custom file deliberately:

- Keep one known-good built-in choice as a fallback before trying a new file.
- Obtain or author the `.tmTheme` from a source you can identify and inspect as data before placing it in the themes directory.
- Test the custom candidate with the same prose, code, diff, and terminal-background checklist used for a bundled choice.
- Treat a custom theme as a CLI-specific artifact. It does not become a desktop Appearance import or an IDE theme merely because the colors are similar.

For a safe, file-level walkthrough, see [Install a custom `.tmTheme` in Codex CLI](/guides/install-custom-tmtheme-codex-cli).

## A practical five-minute decision

1. Start an interactive Codex CLI session and open `/theme`.
2. Preview two or three available candidates that fit your terminal background and desired level of contrast.
3. Compare a fenced code block and a real file diff, not just ordinary text.
4. Select the clearest option in the picker and confirm it feels readable in the terminal profile you normally use.
5. If every built-in option has the same specific weakness, use a custom `.tmTheme` rather than forcing a mismatched palette.

Record the picker choice or keep the custom file with your own setup notes, then retest after a Codex update, a move to a new computer, or a terminal-profile change. The picker persists the selection, but persistence is not proof that every visual condition remains a good fit.

## Sources and limits

This article is based on OpenAI’s current [Codex CLI customization documentation](https://learn.chatgpt.com/docs/cli-customization), which documents `/theme`, `tui.theme`, `$CODEX_HOME/themes`, custom `.tmTheme` files, and the CLI surfaces that receive syntax highlighting. The documentation does not enumerate all bundled theme names, so the installed picker remains the authoritative source for what is available on a given version.

DexThemes is community-built and not affiliated with OpenAI. It does not currently install Codex CLI themes or distribute CLI `.tmTheme` files. A DexThemes desktop `codex-theme-v1:` import and a CLI `.tmTheme` are separate artifacts, even when they share a visual idea. For that distinction and a portable-file overview, see [Codex app themes vs CLI themes](/guides/codex-app-themes-vs-cli-themes) and [Codex themes download](/guides/codex-themes-download).

## Related guides

- [Compare Codex app themes and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Install a custom `.tmTheme` in Codex CLI](/guides/install-custom-tmtheme-codex-cli)
- [Understand Codex theme downloads](/guides/codex-themes-download)
