---
title: DexThemes Creator Dashboard
description: Review private theme totals, current ranks, finalized popularity history, activity, and achievements after signing in.
slug: creator-dashboard
kind: feature
section: Features
answer: The signed-in creator dashboard combines your published theme totals, copies, likes, qualified adoptions, best ranks, finalized results, and achievement progress.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 account stats and dashboard source as of 2026-07-30
related: /features/leaderboard, /features/achievements-and-unlocks, /features/community-themes
---

The DexThemes creator dashboard is the private, signed-in view of your work and participation. It combines the themes attributed to the current account with copies, likes, qualified adoptions, current best ranks, finalized popularity history, and achievement progress.

## What the dashboard includes

The account stats service derives creator totals from currently published themes attributed to the signed-in user. Its model includes:

- number of published themes;
- total recorded copies;
- total likes received;
- total qualified adoptions;
- average copies across published themes;
- the creator's strongest theme by copy count; and
- a per-theme breakdown with variants and activity.

The website presents the most useful subset as Submitted Themes, Total Copies, and Total Likes. It also separates personal activity, such as how many distinct themes the user copied and how many themes they liked, from the engagement received by their own creations.

The implemented MCP dashboard can show published themes, copies, likes, qualified adoptions, and the same account-bound ranking and achievement context inside the conversation.

## Rank and result history

Current best ranks cover daily, weekly, monthly, and all-time views. The daily and weekly values use qualified adoption ranking for the active UTC periods. The current dashboard calculation orders its monthly rank by qualified adoptions and then theme creation time; the public live monthly board additionally uses raw monthly copies before creation time, so tied results can differ between those two current-source views. All-time rank uses accumulated copies.

Finalized history is separate from current rank. The dashboard records:

- closed UTC days won;
- closed Monday-through-Sunday UTC weeks won;
- finalized monthly Top 10 placements;
- repeat wins by theme; and
- recent stored results with period, theme, rank, and activity.

That separation prevents a live monthly Top 10 from being presented as a completed Summit result. Read [leaderboard](/features/leaderboard) for the thresholds and exact tie-break order.

## Achievement collection

The website profile displays visible achievement cards, unlock progress, and reward names. The plugin can additionally render supported unlocked reward-theme previews when the caller has the account read permission. Repeat daily and weekly wins remain visible as stats even though the related reward themes are granted only once.

Supporter rewards follow their own visibility policy. Public supporter status requires separate opt-in, and the plugin account surface does not return the Patron reward.

## Private dashboard versus public catalog

The dashboard requires the current account session on the website or the `themes:read` OAuth scope in the plugin. The service derives identity from the authenticated session or verified bearer token; it does not accept an arbitrary `userId` or `ownerId` argument for personal stats.

The public catalog and leaderboard expose catalog-facing theme and attribution information, including:

- a published theme's name, ID, summary, variants, and palette;
- public creator attribution and avatar;
- public copy and like signals where the surface includes them; and
- rows in the public leaderboard.

It does not expose another creator's private activity totals, liked-theme list, achievement collection, or account session. A public creator name beside a theme is not the same thing as dashboard access.

## Limits and interpretation

Dashboard totals are product analytics, not proof of a successful Codex import. A copy records the supported handoff action, while a qualified adoption adds signed-in, non-author, monthly-deduplicated context. Neither metric proves continued use or satisfaction.

Removed themes are excluded from published-theme totals and public rankings. Current positions can move until a period closes, service interruptions can delay the UI, and an expired session can temporarily return a signed-out view. The dashboard is not a payments, earnings, follower, or traffic-attribution product.

Use it to understand which published themes are receiving activity and which achievements the current account has actually stored. Do not treat it as a guarantee of future rank, reward, reach, or distribution.

DexThemes is community-built, open source, and not affiliated with OpenAI.
