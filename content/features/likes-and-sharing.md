---
title: Theme Likes and Sharing
description: Like a theme with a signed-in account or share its exact dark or light public page without applying it.
slug: likes-and-sharing
kind: feature
section: Features
answer: DexThemes likes are account-bound engagement signals, while sharing uses canonical variant links with previews and never posts or applies a theme without your action.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 like, share, and public-page source as of 2026-07-30
related: /features/community-themes, /features/leaderboard, /features/interactive-previews
---

DexThemes separates appreciation from distribution. A like is an account-bound signal attached to a theme. A share points people to the exact public dark or light variant you selected. Neither action silently applies a theme in Codex.

## How likes work

Liking requires a signed-in DexThemes account. If you press the heart while signed out, the website explains that the account step is needed instead of inventing a local public like.

For a signed-in account, the server resolves the theme, verifies that it is a visible checked-in theme or a published community theme, and toggles one active like for that account and theme. Pressing the control again removes the like. The database maintains the account-and-theme identity of that relationship so duplicate active likes are not created.

Public like counts can be aggregated without exposing a private list of who liked what. A creator's private dashboard includes the total likes received across their published themes and the number of themes the signed-in user has liked. Public theme cards, share images, and leaderboard views may use counts as context.

A first supported like can also record the Heartbeat reward for the signed-in account. Removing the like later does not mean every historical achievement is automatically reversed.

## How sharing works

Every valid public variant has a canonical route shaped like:

```text
https://www.dexthemes.com/{theme-id}/{dark-or-light}
```

The route is specific to the selected variant. A dark link does not pretend a light variant exists, and unknown themes or unavailable variants return a real not-found response.

From Theme details, DexThemes first uses the operating system's native share sheet when the browser provides one. If it is unavailable, the site copies the canonical link to the clipboard. A separate X action opens a prefilled X composer with the selected theme name and URL. Opening that composer is not the same as posting; the user still controls the external submission.

The server-rendered public page includes a Codex-style image, theme summary, palette, source, import steps, and related themes. Open Graph and X card metadata point to a generated 1200 by 630 image for the exact theme and variant. The image can include a public like signal when the current presentation rules call for it.

## What sharing does not expose

A shared page uses public catalog data. It does not include the creator's private stats dashboard, private liked-theme list, account session, credentials, or unpublished builder draft. The URL contains a public theme ID and variant, not an access token.

The share action also does not:

- apply the theme in Codex;
- grant the recipient access to a locked reward palette;
- publish an unfinished draft;
- guarantee that a social platform renders its card immediately; or
- prove that a recipient imported the theme.

To use the palette, the recipient still copies the import string and completes the explicit Codex Settings, Appearance, and Import theme steps.

## How likes affect discovery

Likes are one input, not the only definition of popularity. For current daily and weekly community rankings, qualified signed-in non-author adoptions are primary, unique copies break the first tie, and likes break the next tie. All-time ranking is based on recorded copies rather than likes. Read the [leaderboard feature](/features/leaderboard) for the complete ordering and UTC period rules.

Counts can also change when a like is removed or a community theme is removed through moderation. They are activity measurements, not ratings, approval badges, or guarantees of technical compatibility.

## Who this is for

Likes help users remember and reward palettes they appreciate, while canonical shares help creators circulate one exact visual result. Both are useful after checking the [interactive preview](/features/interactive-previews), but neither replaces testing the imported theme in your own Codex build.

DexThemes is community-built, open source, and not affiliated with OpenAI.
