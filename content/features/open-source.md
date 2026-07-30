---
title: DexThemes Open Source Project
description: Explore, run, validate, and contribute to the MIT-licensed DexThemes website, theme catalog, API, and MCP app.
slug: open-source
kind: feature
section: Features
answer: DexThemes is an MIT-licensed community project with public source for the website, catalog, builder, API, backend contracts, and MCP-backed theme app.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes repository version 1.0.0 as of 2026-07-30
related: /features/theme-api, /features/community-themes, /guides
---

DexThemes is an MIT-licensed open source project. Its public repository contains the static website, checked-in theme catalog, live preview and builder modules, public-page rendering, API contracts, community backend logic, MCP server, interactive app resource, tests, and contribution documentation.

[View DexThemes on GitHub](https://github.com/daeshawnballard/dexthemes).

## What contributors can inspect

The codebase keeps its major responsibilities visible:

- `theme-data` contains curated DexThemes packs.
- `src` contains browser state, catalog, rendering, builder, account, and handoff modules.
- `shared` contains contracts used across the website, API, and plugin.
- `api` contains public catalog, theme-page, image, sitemap, and MCP endpoints.
- `convex` contains account, community-theme, like, moderation, leaderboard, unlock, and rate-limit logic.
- `server` contains MCP tools and theme validation.
- `mcp-app` contains the interactive conversational UI.
- `templates`, `styles`, and `public` contain the generated shell's source assets.
- `test` contains focused contract and behavior tests.

The frontend is written in vanilla JavaScript, HTML, and CSS. The generated production shell uses hashed assets, while account and community features are implemented through Convex routes. The MCP endpoint is stateless at its transport boundary and delegates account-bound operations through separately verified scopes.

## Run the public frontend locally

The repository documents this basic path:

```sh
git clone https://github.com/daeshawnballard/dexthemes.git
cd dexthemes
npm install
npm run build
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`. Static catalog browsing and frontend work do not require production credentials. Features that depend on live accounts, community data, or writes require a developer-controlled backend configuration; contributors should use their own local environment values and never commit secrets.

## Good contribution paths

The contribution guide recommends focused changes. Theme packs, documentation, pure helpers, and contained UI improvements are the intended low-risk starting points. Auth, deployment, and broad layout changes require deeper understanding because they cross security or runtime boundaries.

For a theme contribution:

1. Choose the appropriate theme-data category.
2. Add a unique kebab-case ID and at least one complete variant.
3. Prefer both dark and light when the design supports them.
4. Preview the actual result.
5. Run validation.
6. Include a screenshot with the pull request.

Public community wording should be original and descriptive. A palette inspired by a mood or genre should not copy logos, protected artwork, character likenesses, or imply affiliation.

## Validation

The contributor-safe check is:

```sh
npm run validate
```

That command runs focused tests, documentation checks, and the production build. Changes to Convex behavior also need generated backend types refreshed, and visible-flow work can use the repository's browser smoke command.

Tests are evidence for the checked contract, not proof of every external runtime. A passing build cannot establish that a particular Codex version accepted and persisted a theme; that still requires importing it in Codex through Settings, Appearance, and Import theme.

## License and boundaries

The MIT license permits use, modification, distribution, and sublicensing of the software subject to its notice and warranty terms. It provides the software without warranty. The license does not transform third-party names, artwork, trademarks, or user submissions into project-owned material.

Open source also does not mean the hosted service, OAuth providers, community data, or external APIs are guaranteed to remain available forever. DexThemes intentionally depends on a Codex import and Settings contract it does not control. Upstream changes can require catalog or serializer updates even when the repository itself did not regress.

The clearest way to contribute is to preserve those boundaries: keep public claims testable, keep secrets out of source and reports, validate shared import behavior, and distinguish a preview or passing test from loaded Codex runtime proof.

DexThemes is community-built and not affiliated with OpenAI.
