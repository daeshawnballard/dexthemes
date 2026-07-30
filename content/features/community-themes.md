---
title: Community Codex Themes
description: Publish original palettes, browse creator attribution, request missing variants, and report themes through DexThemes.
slug: community-themes
kind: feature
section: Features
answer: Community themes are original creator-published Codex palettes with public attribution, variant support, moderation checks, sharing pages, and participation signals.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 community and moderation source as of 2026-07-30
related: /features/theme-library, /features/likes-and-sharing, /features/leaderboard, /collections/community
---

Community themes are original palettes published by DexThemes creators. They join the live catalog with a stable theme ID, public name and summary, creator attribution, one or two variants, accent choices, and recorded activity such as copies and likes.

## Browsing community work

Published community themes appear in the Community section of the [theme library](/features/theme-library) and on the [community collection page](/collections/community). An exact dark or light variant also has a canonical public page with a rendered preview, palette context, source attribution, related themes, and the explicit Codex import instructions.

The website can show a creator's public display name and avatar alongside a theme. It may also mark public supporter or agent status. Those catalog fields are separate from the creator's signed-in private dashboard, which contains account-bound totals, activity, ranks, achievements, and history.

Community data is loaded from the publication service, so it can be temporarily unavailable even while the checked-in Codex and DexThemes catalog continues to work.

## Publishing a theme

You can design and copy a private draft without signing in. Publishing is different: it creates a public catalog item attributed to the authenticated DexThemes identity. The website uses GitHub sign-in, while the implemented plugin uses its own OAuth scopes with GitHub-backed identity.

The server verifies each submission again. Current checks include:

- at least one complete dark or light variant;
- a unique kebab-case ID of bounded length;
- bounded public name and summary lengths;
- exact six-digit color values;
- a supported Codex code-theme family for each variant;
- a bounded accent list;
- content moderation for the ID, name, and summary;
- original public-facing wording; and
- distance from protected Codex, DexThemes, and reward palettes.

These checks reduce obvious abuse and cloning, but they are not a guarantee of artistic quality, accessibility, trademark clearance, or universal acceptance. A successful submission means the implementation accepted the theme under its current rules.

## Missing variants and creator follow-up

A community theme may begin with only dark or only light. Signed-in visitors can request the missing side, and the public theme stores a request total that gives its creator a demand signal. The author can reopen the builder with the missing variant prepared and add it to the existing theme. Only that theme's author can perform the add-variant action.

Completing both variants can register the Yin & Yang achievement for the signed-in creator. The new variant still passes exact color and protected-palette checks before it is stored.

## Reporting and removal

Signed-in users can flag a community theme. The moderation implementation limits who can flag, blocks self-reporting, rate-limits reports, and prevents the same account from repeatedly flagging one theme. At the configured threshold, DexThemes reruns text moderation. A confirmed violation can remove the theme; a clean result can clear the accumulated flags.

Removed themes are excluded from the published catalog and leaderboard. Their public availability and activity should not be treated as permanent. Reporting is an abuse-control signal, not a public vote or a promise that every dispute will be resolved automatically.

## Applying and sharing

A community theme follows the same safe handoff as every other DexThemes theme:

1. Select an available variant.
2. Copy the generated import string.
3. Open Codex Settings.
4. Choose Appearance, choose Import theme, paste, and approve.

Sharing opens or copies the canonical variant URL. It does not apply the palette, publish a draft, or modify the original theme. Read [likes and sharing](/features/likes-and-sharing) for the exact account and confirmation boundaries.

DexThemes is community-built, open source, and not affiliated with OpenAI. Community publication does not imply endorsement by DexThemes or OpenAI, and creators remain responsible for the public wording and work they submit.
