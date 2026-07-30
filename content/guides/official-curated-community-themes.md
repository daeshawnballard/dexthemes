---
title: Official Curated and Community Themes
description: Distinguish Codex-sourced theme families, DexThemes-maintained palettes, and published community submissions.
slug: official-curated-community-themes
kind: guide
section: Guides
answer: Codex themes reflect registered families mapped from the app, DexThemes themes are project-curated palettes, and community themes come from published user submissions.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current catalog source attribution and community theme model
related: /collections, /collections/editor-classics, /collections/community
---

DexThemes groups its catalog into three provenance layers: Codex-sourced themes, project-curated DexThemes themes, and published community themes. The categories tell you where a palette came from; they do not change the manual Codex import flow.

DexThemes itself is community-built and is not affiliated with or endorsed by OpenAI.

## Codex-sourced themes

The DexThemes catalog uses its Codex or official category for theme families mapped from Codex's registered theme set and attributes those entries to Codex. The project's current import contract was checked against a specific installed Codex desktop build, including which code-theme family IDs support dark, light, or both variants.

This category is useful when you want:

- A palette associated with a registered Codex code-theme family.
- A familiar starting point.
- A dark or light variant known to the current DexThemes contract.
- A reference for building a related custom palette.

The label does not mean OpenAI reviewed the DexThemes website, preview, serialization, documentation, or deployment. It also does not guarantee that every older or future Codex build exposes the same family. Check the [theme format reference](/reference/codex-theme-format) for the exact registry version DexThemes tested.

## DexThemes-curated themes

The DexThemes category contains project-maintained designs, including original palettes and themed collections. These entries are attributed to DexThemes rather than Codex or a community author.

Choose this category when you want:

- A more expressive palette than a conventional built-in starting point.
- A collection organized around a particular mood or subject.
- A theme maintained in the open source DexThemes catalog.
- A design you can preview before deciding whether to import.

“Curated” describes project selection and maintenance. It is not an OpenAI designation, security audit, accessibility certification, or guarantee that an inspired palette is officially licensed by the subject that inspired it.

The current project terms require inspired themes to use original palettes and not include third-party artwork or protected assets without permission. Visual inspiration and product affiliation are separate claims.

## Community themes

Community themes originate from user submissions and can display public author attribution. The current project applies format validation, content checks, protected-palette rules, moderation, and publication state to the community flow.

Choose community themes when you want:

- Designs from individual creators.
- New combinations beyond the maintained catalog.
- A chance to support and learn from other theme authors.
- A public destination for a theme after it has actually been published.

A successful submission, private preview, or local catalog entry is not necessarily a published community page. Treat a theme as public only after it is visible in the public community collection.

Moderation is also not OpenAI review. Inspect the payload and installed result regardless of the author's reputation or the number of likes.

## Compare provenance without ranking it

Provenance answers “who supplied or maintains this palette?” It does not answer every quality question.

For any category, check:

- Whether the theme offers dark, light, or both.
- Whether text and semantic colors are readable.
- Whether a requested font exists on your computer.
- Whether the generated string matches the current format.
- Whether the theme imports and persists in your Codex build.
- Whether the final appearance is comfortable for real work.

A carefully tested community theme may fit you better than a Codex-sourced palette. A Codex-sourced family may be the more conservative choice when you need familiarity. A curated theme may provide the strongest visual identity. The right choice depends on the task and the evidence you verify.

## Read attribution correctly

Current DexThemes attribution distinguishes:

- **Codex** for catalog entries classified as official or Codex-sourced.
- **DexThemes** for project-maintained catalog entries.
- A visible creator name for published community entries when author data is available.

Attribution should travel with a shared public link. A raw `codex-theme-v1` string does not contain a theme name or author field, so include those details separately when sharing it privately.

Do not add a name or author key to the import payload. Those are catalog metadata, not fields in the current Codex theme import contract.

## Import is the same across categories

For any theme:

1. Choose the variant.
2. Copy the complete `codex-theme-v1:` string.
3. Open Codex Settings.
4. Choose Appearance.
5. Choose Import theme.
6. Paste, review, and approve.
7. Inspect the installed result.

There is no separate privileged installer for a Codex-sourced entry. DexThemes does not silently apply themes from any category.

## Browse by intent

Use the category controls in the [main DexThemes gallery](/) to distinguish Codex-sourced and project-maintained entries. You can also browse [editor classics](/collections/editor-classics) for familiar palette families or the [community collection](/collections/community) for published creator work.

Catalog contents and variant availability can change. Prefer the live collection and the theme's visible provenance over a copied theme count or an old screenshot.

## Related guides

- [Install a Codex theme](/guides/how-to-install-a-codex-theme)
- [Check whether DexThemes is safe](/guides/is-dexthemes-safe)
- [Design an accessible theme](/guides/codex-theme-accessibility)
- [Share a custom theme](/guides/share-a-custom-codex-theme)
