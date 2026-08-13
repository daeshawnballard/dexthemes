---
title: How We Test Codex Themes
description: The DexThemes editorial method for checking catalog integrity, palette roles, contextual previews, import payloads, and loaded runtime evidence.
slug: how-we-test-codex-themes
kind: article
section: Articles
answer: We test Codex themes in distinct layers covering catalog truth, palette structure, contextual preview, semantic stress cases, import generation, and manual loaded-runtime verification without treating one layer as proof of another.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes catalog and preview/import implementation reviewed 2026-07-30
related: /articles/what-makes-a-good-codex-theme, /articles/designing-colors-for-code-review-and-diffs, /guides/codex-theme-import-troubleshooting
---

We test Codex themes as a chain of separate evidence layers: catalog integrity, palette structure, contextual preview, semantic stress cases, valid import generation, and finally a manual import into Codex. A passing source check is not a loaded theme. A convincing preview is not accessibility certification. A copied payload is not proof that the user completed the import.

This distinction keeps our recommendations honest. It also makes failures easier to diagnose because we can say exactly where the evidence stops.

## 1. Verify the catalog entry

The first gate is simple but essential. We confirm the theme’s exact public ID, display name, available variants, and core palette in both the source catalog and the generated catalog used by public interfaces. If those surfaces disagree, we do not treat documentation or a route as proof that the theme is implemented correctly.

For each variant, we expect valid six-digit hex colors for:

- Main surface.
- Primary ink.
- Accent.
- Addition.
- Removal.
- Skill or function.

Sidebar and code-background colors may be supplied separately or fall back to the main surface. We also verify that a theme advertised as dark-only or light-only is not compared as if the missing variant exists.

This is how we confirmed that GitHub Dark uses the catalog ID `github-dark`, One Dark uses `one-dark`, and Dracula uses `dracula`, with only dark variants exposed for those entries.

## 2. Validate the Codex-facing structure

DexThemes builds a versioned `codex-theme-v1` payload for the selected variant. Structural validation checks the required colors, variant, accent selection, supported code-theme family, font fields, window-opacity flag, and configured contrast value before an import string is returned.

That validation answers a narrow question: can DexThemes generate a structurally supported payload from this catalog entry? It does not prove that the current Codex desktop application accepted or loaded the theme. Codex owns the import parser and can change independently of DexThemes.

We also avoid a subtle naming trap. A public DexThemes theme ID and Codex’s internal code-theme family can differ. The catalog entry should preserve the public identity while the import builder serializes the supported family. Users should never need to rewrite that field manually.

## 3. Inspect the palette as a system

Next, we evaluate relationships rather than individual colors. The main questions are:

1. Does primary ink remain visibly separate from the surface?
2. Do sidebar and code backgrounds create useful hierarchy?
3. Does the accent identify action without dominating prose and code?
4. Can additions, removals, and skills be distinguished from the accent and from one another?
5. Does the palette maintain one visual direction without collapsing every role into the same hue?

This stage is qualitative unless we explicitly calculate rendered contrast. We do not use the catalog’s `contrast` number as a WCAG ratio, and we do not label a palette accessible from hex values alone. Typography, size, transparency, focus states, and component backgrounds also matter.

## 4. Use the contextual preview

DexThemes applies the selected palette to a simulated Codex workspace. The preview renders a conversation surface, title bar, composer, user and assistant messages, code background, syntax roles, and small semantic examples. Mini previews help compare available dark and light variants.

We use that preview to find collisions that swatches hide. Examples include a code background that merges into the main surface, an accent that competes with functions, an addition color that fades at small sizes, or a sidebar that loses its boundary.

The preview is deliberately treated as a simulation. It is valuable for comparison, but it cannot reproduce every Codex component, operating-system state, display profile, font, or future application update.

## 5. Stress the semantic colors

A theme intended for technical work needs more than a pleasant base. We inspect additions and removals beside one another, then compare both against the surface and code background. We look at function or skill color beside the accent, because those roles often appear close together.

Our review questions include:

- Can an added line be located without scanning for a saturated accent?
- Does a removed line remain distinct from errors and active controls?
- Do strings, functions, comments, and punctuation preserve hierarchy?
- Does the palette still make sense when one semantic color fills a large block?
- Are important states communicated by more than color in the host interface?

Theme authors control semantic color tokens, but not every icon, prefix, gutter, or selection treatment in Codex. That is why runtime inspection remains necessary.

## 6. Verify the copy and Settings handoff

When a user chooses **Copy theme**, DexThemes copies the complete import string and confirms **Theme copied to clipboard**. Desktop layouts then open general Codex Settings; compact layouts leave the string ready for later use. The user chooses Appearance, selects the matching dark or light import control, pastes, and approves the import.

We verify that the selected variant produces a nonempty payload and that the handoff instructions match the implemented behavior. We do not describe this as silent application or a direct Appearance deep link. If clipboard access fails, the product needs a visible manual-copy path.

## 7. Reserve loaded proof for the loaded application

The final gate is manual. Import the exact payload into the current Codex desktop app, confirm acceptance, inspect the theme in the workspace, and recheck the state after navigation or restart when persistence is part of the claim.

We use explicit evidence labels:

- **Catalog verified:** the exact theme and variant exist in current source surfaces.
- **Preview reviewed:** the simulated workspace was visually inspected.
- **Payload generated:** validation returned a complete import string.
- **Handoff completed:** the clipboard confirmation appeared and Settings opened as intended.
- **Loaded in Codex:** a user completed the import and observed the theme in the application.

Only the last label is runtime proof. These editorial articles use the first two layers and source inspection of the import flow; they do not claim that every recommended theme received a fresh long-duration runtime test on every display.

## How recommendations are written

We recommend themes for visible qualities such as strong foreground separation, restrained accents, warm or cool surfaces, layered workspace structure, and distinct semantic colors. We do not convert catalog copy counts into quality, infer popularity, promise performance, cite private user behavior, or claim health benefits.

We also state limitations. A theme can look excellent in the preview and feel wrong with a reader’s font, display, lighting, or visual needs. Accessibility claims require measurement and broader interaction testing. Long-session claims require longitudinal evidence we do not currently have.

That method is less dramatic than naming one universal winner, but it is more useful. It tells you what was checked, what remains personal, and what still needs loaded proof. For the design rubric behind the evaluation, read [What Makes a Good Codex Theme](/articles/what-makes-a-good-codex-theme). DexThemes is community-built and not affiliated with OpenAI.
