---
title: GitHub Dark vs One Dark vs Dracula for Codex
description: A direct comparison of three verified dark-only Codex themes by workspace hierarchy, ink, accents, syntax roles, and diff colors.
slug: github-dark-vs-one-dark-vs-dracula-for-codex
kind: article
section: Articles
answer: Choose GitHub Dark for crisp workspace structure and code review, One Dark for a softer neutral daily environment, or Dracula for the most vivid accent and semantic colors.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes catalog and preview/import implementation reviewed 2026-07-30
related: /articles/best-codex-themes-for-long-coding-sessions, /articles/designing-colors-for-code-review-and-diffs, /collections/editor-classics
---

The short answer is simple: use [GitHub Dark](/github-dark/dark) when you want crisp panel hierarchy and direct diff colors, [One Dark](/one-dark/dark) when you want a softer neutral base, and [Dracula](/dracula/dark) when you want syntax and semantic roles to announce themselves. None is universally better. They optimize for different levels of structure and color intensity.

I compared the current implemented catalog entries, not reputation or popularity. All three exact variants exist and are dark-only in DexThemes:

- **GitHub Dark:** catalog ID `github-dark`, available variant `dark`.
- **One Dark:** catalog ID `one-dark`, available variant `dark`.
- **Dracula:** catalog ID `dracula`, available variant `dark`.

Their public catalog IDs are not necessarily the same strings serialized for Codex’s internal code-theme family. DexThemes handles that compatibility mapping when it builds the import payload. Users should select the visible theme and variant rather than editing the payload.

## GitHub Dark

GitHub Dark starts with a deep blue-black surface, `#0d1117`, and pale cool ink, `#e6edf3`. The sidebar, `#090c10`, and code background, `#070a0f`, step darker than the conversation surface. Its accent is a clear blue, `#58a6ff`. Additions use green, `#3fb950`, removals use red, `#f85149`, and skills or functions use purple, `#bc8cff`.

The defining quality is structure. Navigation, conversation, and code form distinct layers while remaining in one blue-black family. The semantic colors are also easy to name by role: blue action, green addition, red removal, purple function.

That makes GitHub Dark my choice for code review, repository-heavy work, and anyone who wants the interface to feel organized before syntax color enters the picture. Its light ink and deep surfaces create a crisp result. If you prefer softer foregrounds, it may feel more assertive than One Dark.

## One Dark

One Dark uses a charcoal surface, `#282c34`, and muted cool-gray ink, `#abb2bf`. The sidebar, `#21252b`, and code background, `#1d2025`, provide layered depth without approaching true black. Blue, `#61afef`, is the accent; additions are soft green, `#98c379`; removals are dusty rose, `#e06c75`; and skills use purple, `#c678dd`.

The palette’s strength is balance. Its semantic colors are distinct, but none is as electric as Dracula’s green or pink. The primary ink is also less bright than GitHub Dark’s, which gives long blocks of text a quieter presence in the preview.

I recommend One Dark for mixed days of coding, planning, and assistant conversation. It retains familiar editor colors without letting the theme become the main event. The tradeoff is less immediate foreground separation. If small text or subtle state changes are difficult to locate, compare it directly with GitHub Dark at the same display brightness.

## Dracula

Dracula places near-white ink, `#F8F8F2`, on a violet-charcoal surface, `#282A36`. Its sidebar and code background shift darker to `#21222C` and `#1d1e28`. Hot pink, `#FF79C6`, is both the accent and skill color. Additions use bright green, `#50FA7B`, and removals use red, `#FF5555`.

Dracula is the most colorful of the three. The addition green is difficult to miss, the pink accent gives active states a strong identity, and the violet undertone keeps the dark workspace from feeling neutral.

Choose it when semantic color is part of how you navigate code. It is especially useful for users who want functions, actions, and additions to remain visually prominent. The same high-chroma palette can become busy in a screen full of syntax, and the shared pink for accent and skill means those roles are related rather than fully independent.

## Which one is best for code review

For a review-focused workflow, I would rank the decision by role separation rather than aesthetics:

1. **GitHub Dark** provides the clearest structural baseline. Blue action, green addition, red removal, and purple skill colors remain visibly separate.
2. **One Dark** keeps the same broad semantic map but reduces intensity. It is a good fit when a large diff should remain readable without dominating the rest of the workspace.
3. **Dracula** makes additions and removals conspicuous, but its vivid syntax palette can compete for attention in a dense file.

That order is an editorial judgment from the visible palette, not a measured user-performance result. Review tools also use line prefixes, gutters, selection states, and typography that a color token alone cannot control.

## Which one is best for long sessions

One Dark is my default for a neutral long session because its ink and semantic colors are restrained. GitHub Dark is better when navigation and code-block boundaries need to remain explicit. Dracula is best when a muted theme causes important syntax categories to disappear from your attention.

Room lighting can reverse that choice. A palette that looks soft on one display can look washed out on another. Compare all three with the same code example, font size, zoom, and screen brightness.

## A fair comparison workflow

Use the DexThemes contextual preview first. Read the assistant text, scan the code block, and compare the sidebar and composer with the code background. Then inspect additions, removals, functions, and active controls instead of focusing only on the headline accent.

Next, import your two finalists. DexThemes copies a validated `codex-theme-v1` string and can open general Codex Settings on desktop. It cannot silently apply a theme or jump directly into Appearance. Choose Appearance, use Import Dark Theme, paste, and approve the import. Only the loaded Codex view can show how the palette interacts with your font, display, and actual work.

My final call is GitHub Dark for structure, One Dark for restraint, and Dracula for expression. To go deeper on the review-specific roles, read [Designing Colors for Code Review and Diffs](/articles/designing-colors-for-code-review-and-diffs). DexThemes is community-built and not affiliated with OpenAI.
