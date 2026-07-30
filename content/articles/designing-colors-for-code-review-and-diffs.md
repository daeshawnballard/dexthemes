---
title: Designing Colors for Code Review and Diffs
description: A practical method for choosing addition and removal colors that work with surfaces, code backgrounds, accents, and non-color signals.
slug: designing-colors-for-code-review-and-diffs
kind: article
section: Articles
answer: Design diff colors as semantic roles within the whole theme by testing additions and removals against every rendered background, separating them from accents and syntax, and preserving non-color cues in the host interface.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes catalog and preview/import implementation reviewed 2026-07-30
related: /articles/how-we-test-codex-themes, /articles/github-dark-vs-one-dark-vs-dracula-for-codex, /guides/create-a-custom-codex-theme
---

Good diff colors are semantic infrastructure. Choose additions and removals only after the main surface, ink, and code background are stable. Then make both colors visibly distinct from their backgrounds, from each other, and from the accent and skill colors. Finally, inspect them with the host’s `+` and `-` markers, gutters, selection, and focus states so meaning never depends on hue alone.

In the Codex theme payload, these roles are represented by `diffAdded` and `diffRemoved`. Those two hex values look simple, but they participate in a larger system. A green that works on the main conversation surface may fade inside a darker code block. A red that reads clearly as removal may be confused with a coral action accent. A vivid pair can also overpower the code it is supposed to clarify.

## Establish the backgrounds first

Start with the surfaces where diffs will appear:

- Main workspace surface.
- Code-block background.
- Sidebar or review navigation.
- Selected or hovered row.
- Any tinted inline-diff background supplied by the host.

The theme author directly controls the main `surface` and may provide a separate `codeBg`. The loaded application can add borders, opacity, selection fills, and other states. That means the raw hex pair is only the beginning; the rendered combination is the real test target.

Primary ink also matters. Diff colors should not be so close to body ink that additions and removals lose identity, or so bright that ordinary code becomes secondary. Build a readable neutral base, then introduce semantic emphasis.

## Give addition and removal equal attention

Green and red are conventional starting points, but convention is not a substitute for design. Each role needs enough apparent separation from its background, and the pair needs enough difference from one another.

Additions often fill larger regions during implementation work. An extremely luminous green may be easy to find on one line and exhausting as a full block. Removals can appear beside error messages or destructive controls, so the red family should be checked for role collisions.

I ask four questions:

1. Can I locate an added line quickly without losing the surrounding code?
2. Can I distinguish a removed line from an error, alert, or accent-colored control?
3. Do additions and removals remain different at small text sizes?
4. Does either color overpower primary ink when a diff occupies most of the view?

These are qualitative review questions unless contrast and perception are explicitly measured. They do not establish accessibility conformance.

## Separate diffs from accent and skill colors

The accent usually identifies action or selection. The skill color often appears on functions or tool-related syntax. If one of those matches a diff color, the palette gives two meanings to the same signal.

Repetition is not always wrong. It can make a theme coherent. But it should be a conscious tradeoff. Matrix, for example, uses the same bright green for accent, addition, and skill. That creates a focused monochrome identity, yet it reduces semantic separation. Monokai uses the same pink-red family for accent and removal, which can make action and deletion feel related.

For review-heavy themes, I prefer four recognizable lanes:

- Accent for action and selection.
- Addition for introduced content.
- Removal for deleted content.
- Skill for functions, tools, or specialized syntax.

The hues do not need to be maximally different. They need to remain distinguishable in the actual combinations the interface renders.

## Do not rely on green versus red alone

Color vision varies, displays shift hues, and tinted backgrounds can compress differences. The host interface should reinforce meaning with line prefixes, labels, icons, position, or shape. Theme design should preserve those signals rather than assuming the palette can replace them.

As a theme author, inspect `+` and `-` markers, line numbers, gutters, and block boundaries in Codex after import. If the host supplies only color for a particular state, that is an interface limitation the theme cannot fully solve. Choose colors with different apparent lightness or temperature where possible, but do not claim that choice alone makes the experience accessible.

## Three useful catalog examples

[GitHub Dark](/github-dark/dark) uses green `#3fb950` for additions and red `#f85149` for removals on blue-black workspace layers. Its blue accent and purple skill color keep the four semantic lanes visibly separate. This is the most structurally direct example of the three.

[One Dark](/one-dark/dark) uses a softer green, `#98c379`, and dusty rose, `#e06c75`, against charcoal. Blue accent and purple skill colors remain separate, but the overall intensity is lower. It is a useful model when diffs should be clear without becoming fluorescent.

[Dracula](/dracula/dark) uses bright green, `#50FA7B`, and red, `#FF5555`, against violet-charcoal. The pair is conspicuous, while hot pink carries both accent and skill. It demonstrates how strong diff colors can coexist with a vivid syntax palette, and why a dense screen must be reviewed as a whole.

These comparisons describe visible catalog tokens. They are not popularity rankings, performance results, or WCAG certifications.

## Test more than the happy path

A reliable diff review includes:

1. One added line inside otherwise unchanged code.
2. One removed line beside an error or warning.
3. A large block containing only additions.
4. Alternating additions and removals.
5. A selected diff row.
6. Muted or collapsed surrounding context.
7. Small text, punctuation, and whitespace-only changes.
8. Both the main surface and code background.

If the theme has dark and light variants, test them independently. A green that works on charcoal will not automatically work on cream. Do not generate the light pair by merely inverting the dark pair; rebuild the semantic relationships for the new surface and ink.

Use contrast calculations where requirements call for them, but calculate the rendered foreground against the rendered background. Include opacity and state changes. Measurement is necessary for a compliance claim, yet it is not sufficient: focus visibility, color dependence, typography, and interaction states still require inspection.

## A practical design sequence

My preferred sequence is:

1. Choose surface, code background, and ink.
2. Set an accent with one clear interface job.
3. Choose an addition color and test it at one-line and full-block scale.
4. Choose a removal color that remains separate from both addition and accent.
5. Add the skill color and check all four semantic lanes together.
6. Preview conversation, code, and semantic examples at realistic zoom.
7. Generate the import payload and load it into Codex for final inspection.

DexThemes validates and copies the complete theme payload, then can open general Codex Settings on desktop. The user still chooses Appearance, selects the matching import control, pastes, and approves. A palette preview can reveal obvious collisions; only the loaded application shows the final diff treatment.

If you are building a complete palette, continue with [What Makes a Good Codex Theme](/articles/what-makes-a-good-codex-theme). DexThemes is community-built and not affiliated with OpenAI.
