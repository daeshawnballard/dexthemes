---
title: Codex Theme Library
description: Browse built-in Codex palettes, DexThemes collections, and creator-published community themes in one catalog.
slug: theme-library
kind: feature
section: Features
answer: DexThemes brings built-in, curated, and community Codex themes into one searchable library with variant filters, sorting, collections, and previews.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 source as of 2026-07-30
related: /features/interactive-previews, /features/community-themes, /collections
---

DexThemes is a searchable library for finding a Codex theme before committing it to your workspace. The checked-in catalog contains more than 100 palettes, and the website can add published community themes when that catalog is available. Everything is organized around the same next step: inspect a real variant, copy its import string, and finish the import in Codex.

## What is in the library?

The browser separates themes into three sources:

- **Codex** contains palettes represented as built-in Codex catalog themes.
- **DexThemes** contains palettes curated by this open source project.
- **Community** contains original themes published by signed-in creators.

The DexThemes section is divided into navigable groups such as anime, video games, movies, comics, zodiacs, lunar animals, companies, originals, and unlockables. Those group labels are browsing aids, not claims of sponsorship or ownership. Public-facing identity rules and aliases keep the published catalog descriptive.

Some reward themes appear locked until the related achievement is recorded for the signed-in account. DexThemes withholds their detailed palette and preview while locked. Ordinary catalog themes remain available without signing in.

## How discovery works

Search matches theme names and supported descriptive search terms. Variant filters narrow the results to dark themes, light themes, or themes that include both. Sorting can keep the catalog order, rank by recorded copies, show newer additions first, or arrange names from A to Z or Z to A.

On desktop, categories and subgroups live in the sidebar. A subgroup can be opened for a quick look or pinned open while comparing several collections. On compact layouts, DexThemes switches to a card-based browser with Browse, Preview, and Create navigation.

The [theme collections](/collections) offer another entry point. Dark, light, editor-classic, and [community](/collections/community) collection pages link to canonical pages for exact theme variants. Those pages include a rendered preview, source context, palette details, available variants, and related themes.

## What happens after you select a theme?

Selection updates the website shell and the central Codex-style preview. If both variants exist, you can switch between dark and light. Themes with multiple accents expose accent controls, while the Theme details view presents the selected palette and source in a more reference-like layout.

This separation matters: finding a theme does not apply it. The preview is an approximation rendered by DexThemes, and the library does not edit Codex configuration files. To use a selection, follow the [Codex theme import](/features/codex-theme-import) handoff:

1. Copy the generated import string.
2. Open Codex Settings.
3. Choose Appearance.
4. Choose Import theme, paste, and approve the import.

## Who is it for?

The library is useful for people who know the atmosphere they want but not the exact palette, people comparing dark and light options, and creators checking how their community theme sits beside the rest of the catalog. The public catalog API and implemented DexThemes MCP tools also support programmatic and conversational discovery.

## Limits to keep in mind

Catalog counts can change as checked-in themes evolve and community themes are published or removed. A theme may provide only one variant, and community data can be temporarily unavailable even when the static catalog still works. Recorded copies and likes are activity signals, not quality guarantees or endorsements.

Most importantly, a DexThemes preview is not proof of how every Codex build, font environment, or operating system will render the final theme. Codex owns the import behavior, and that upstream contract can change independently. Use the [interactive preview](/features/interactive-previews) to narrow the field, then verify the imported result in your own Codex installation.

DexThemes is community-built, open source, and not affiliated with OpenAI.
