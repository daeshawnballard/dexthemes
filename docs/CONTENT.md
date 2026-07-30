# DexThemes content system

Guides, feature documentation, editorial articles, and reference pages are authored in Markdown under `content/`. The public HTML pages and their agent-readable Markdown representations come from the same source.

## Content directories

- `content/guides/` teaches a concrete task or resolves a problem.
- `content/features/` explains a shipped DexThemes capability and its limits.
- `content/articles/` contains comparisons, recommendations, and design methodology.
- `content/reference/` documents stable technical contracts.

Every filename must match its kebab-case `slug`.

## Frontmatter contract

Keep every value on one line. `related` is a comma-separated list of root-relative routes.

```md
---
title: How to install a Codex theme
description: A concise search description between 70 and 190 characters.
slug: how-to-install-a-codex-theme
kind: guide
section: Guides
answer: A direct answer between 80 and 420 characters that is also shown near the top of the page.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes and the documented Codex Appearance import flow as of July 30, 2026.
related: /features/codex-theme-import, /guides/codex-theme-import-troubleshooting
---
```

The author fields are intentionally fixed. The visible byline and structured data must both identify Daeshawn Ballard and link to `https://x.com/daeshawn`.

## Supported Markdown

Use:

- H2 and H3 headings
- paragraphs
- ordered and unordered lists
- bold text
- inline code
- fenced code
- root-relative or HTTP(S) links

Do not add H1 headings or raw HTML. The renderer supplies the page H1 and escapes authored content before producing HTML.

## Product-truth rules

- DexThemes is community-built and not affiliated with OpenAI.
- Applying a theme is an explicit handoff: copy the complete `codex-theme-v1` import string, open Codex Settings, choose Appearance, choose Import theme, paste, review, and approve.
- Do not claim silent auto-apply or a verified Appearance-specific deep link.
- Do not claim plugin approval, marketplace availability, accessibility certification, popularity, user outcomes, or benchmark results without current evidence.
- Never include credentials, account identifiers, private repository information, internal deployment names, or private URLs.

## Generation and routes

Run:

```sh
npm run content:generate
```

This validates every source file and regenerates `shared/generated-content.js`. The generated catalog drives:

- server-rendered HTML pages
- `/guides`, `/features`, `/articles`, and `/reference` hubs
- sitemap entries
- structured data
- related links
- `llms-full.txt` links

An individual HTML page is canonical. Append `.md` to its URL for the Markdown representation, for example:

```text
https://www.dexthemes.com/features/leaderboard.md
```

Markdown responses use `X-Robots-Tag: noindex` and link back to the canonical HTML page, preventing a second indexable version while giving agents a clean source.

## Review checklist

Before merging content:

1. Verify product claims against current source or authoritative documentation.
2. Confirm the direct answer is independently useful.
3. Check that headings describe real questions or decisions.
4. Confirm every internal link resolves.
5. Check that recommendations explain their methodology and limitations.
6. Run `npm run validate` and the browser smoke suite.
