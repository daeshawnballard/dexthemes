---
title: DexThemes Theme API
description: Read the public Codex theme catalog, filter exact variants, and discover the documented MCP and account surfaces.
slug: theme-api
kind: feature
section: Features
answer: The public DexThemes API returns a merged theme catalog from a stable website endpoint, with filters for IDs, search, variants, categories, and DexThemes subgroups.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes public catalog API source version 1.0.0 as of 2026-07-30
related: /features/theme-library, /features/color-me-lucky, /features/codex-plugin
---

The DexThemes Theme API gives websites, scripts, and agents a public JSON view of the theme catalog. Start with the stable website endpoint:

```text
https://www.dexthemes.com/api/themes
```

It merges the visible checked-in Codex and DexThemes catalog with published community themes, then returns a `count` and `themes` array. The route is a public read with cross-origin access enabled and short-lived caching.

## Filtering the catalog

The endpoint supports query parameters for a narrow response:

- `id` selects one stable theme ID.
- `q` searches supported public names and search terms.
- `variant=dark` returns themes with a dark variant.
- `variant=light` returns themes with a light variant.
- `category` filters a source category such as `dexthemes` or `community`.
- `subgroup` filters a recognized DexThemes subgroup.

For example:

```sh
curl "https://www.dexthemes.com/api/themes?q=blue&variant=dark"
curl "https://www.dexthemes.com/api/themes?id=dracula"
curl "https://www.dexthemes.com/api/themes?category=dexthemes&subgroup=originals"
```

Each returned theme can include its public ID and name, category and subgroup, summary, available dark and light variant objects, accent choices, copy data, and normalized Codex code-theme family. Community rows can also include public creator attribution.

The response uses the same public presentation policy as the website and MCP search. Hidden reward palettes stay out of anonymous catalog results, unsafe public community identity is excluded, and supported descriptive aliases are used where the public ID differs from an older source label.

## Documentation and agent discovery

The canonical published documentation lives at:

- [DexThemes LLM documentation](https://www.dexthemes.com/llms.txt)
- [DexThemes OpenAPI document](https://www.dexthemes.com/.well-known/openapi.json)

Use those documents to discover current account, generator, and write schemas. Do not infer a private backend hostname from frontend source or copy an undocumented origin into an integration.

The implemented [DexThemes plugin](/features/codex-plugin) uses a different protocol surface:

```text
https://www.dexthemes.com/api/mcp
```

That MCP endpoint exposes typed tools for search, fetch, drafting, validation, previews, apply preparation, leaderboards, personal stats, unlocks, reviewed publication, and GitHub feedback preparation. It is not interchangeable with the REST catalog response.

## Authentication boundaries

Reading the website catalog does not require authentication. Account-specific reads and writes use documented authenticated flows. Browser actions rely on the signed-in session; supported scripts use an issued bearer credential; the plugin uses scoped OAuth.

Identity is derived at the server. Integrations should not send arbitrary author or owner IDs as a substitute for authentication, and credentials should never be placed in URLs, logs, example payloads, or public issue reports.

Publishing a theme is a public state change authorized by the caller's write credential. It must pass current identity, rate-limit, moderation, color, code-theme, protected-palette, and uniqueness checks. In the MCP review flow, a short-lived confirmation preserves the exact reviewed payload and sign-in context, but app visibility and that token are not independent proof of a human click.

## What the API does not do

A catalog response does not apply a theme to Codex. The API can provide variant data or an import string on documented generator surfaces, but the supported use path remains:

1. Copy the exact import string.
2. Open Codex Settings.
3. Choose Appearance.
4. Choose Import theme, paste, and approve.

The public API also does not promise that community data, counts, or supported Codex identifiers will never change. A removed community theme can disappear, cached data can lag briefly, and Codex can change its upstream import contract independently.

Use stable theme IDs, handle missing variants and non-success responses, read the published schema at integration time, and verify the final imported appearance in Codex.

DexThemes is community-built, open source, and not affiliated with OpenAI.
