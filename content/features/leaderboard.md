---
title: DexThemes Community Leaderboard
description: Understand daily, weekly, monthly, and all-time rankings, qualified adoptions, UTC periods, and reward eligibility.
slug: leaderboard
kind: feature
section: Features
answer: The public leaderboard ranks published community themes across the current UTC day, week, month, and all time using qualified adoptions, deduplicated copies, and likes under period-specific rules.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 popularity and finalization source as of 2026-07-30
related: /features/community-themes, /features/achievements-and-unlocks, /features/creator-dashboard
---

The DexThemes leaderboard is a public view of activity around published community themes. It provides four views: the current UTC day, current UTC week, current UTC month, and all time. The views do not all use the same metric, and a live position is not a promise of a finalized reward.

## Ranking inputs

DexThemes records three useful signals:

- A **copy** is a deduplicated copy event for a published community theme.
- A **qualified adoption** is a signed-in, non-author copy, limited to one qualifying record for that user and theme in the current UTC month.
- A **like** is one active account-and-theme relationship.

For daily and weekly ranking, qualified adoptions are the primary metric. Deduplicated copies break a tie, then likes, then the earliest qualifying activity. A stable theme ID is the final deterministic tie-breaker.

The leaderboard only ranks published community themes. Checked-in Codex and DexThemes palettes do not compete, and removed community themes are excluded.

## The four views

### Today

The daily view covers midnight UTC through the next midnight UTC. It ranks up to ten themes using qualified adoptions, then copies, then likes. The website displays qualified adoptions as the primary number and copies as the secondary number.

### This Week

The weekly view covers Monday 00:00 UTC through the following Monday 00:00 UTC. It uses the same ordering as Today and displays the same two leading metrics.

### This Month

The monthly view covers the current calendar month in UTC. It ranks up to ten themes first by the current month's qualified adoptions, then by raw copy activity for the month, then by theme creation time. The primary displayed copy number is therefore the qualified count; the raw count is shown separately.

### All Time

All-time ranking orders published community themes by their accumulated deduplicated copy count. Earlier theme creation breaks a tie. Likes are shown as context but are not the all-time ranking metric.

## UTC finalization and unlock connections

Reward decisions use closed periods, not a screenshot of a live board:

- **Golden Hour** is tied to the qualified number-one theme after a UTC day closes. The candidate must have at least three copies and at least one qualified adoption.
- **Headliner** is tied to the qualified number-one theme after a Monday-through-Sunday UTC week closes. The candidate must have at least five copies and at least two qualified adoptions.
- **Summit** is tied to a finalized monthly Top 10. Each eligible entry must have at least three qualified adoptions in the closed UTC month.

If no candidate meets the relevant threshold, the closed period is stored without a winner. At close, monthly finalization recomputes the completed period with the shared ordering: qualified adoptions, unique copies, likes, earliest period activity, then stable theme ID. It then keeps up to ten entries that meet the threshold. The live monthly view uses theme creation time as its last visible tie-break, so appearing in its Top 10 does not by itself grant Summit.

Daily and weekly wins are preserved in creator history, including repeat wins by the same theme. The achievement and reward theme are one-time per account, so a repeat winner can gain another dashboard statistic without receiving duplicate unlock records.

## What the public view reveals

Rows include the theme, public creator attribution, preview palette data, and the metrics appropriate to the active period. Anyone can open the leaderboard without signing in. A signed-in website user may also see their current position in the active list, while the [creator dashboard](/features/creator-dashboard) provides private best ranks and finalized history.

## Limits and uncertainty

Live totals can move until a period closes. Deduplication, authentication, non-author requirements, moderation, rate limits, and finalization all affect whether an event or candidate qualifies. A recorded copy does not prove a successful Codex import, and a high rank does not certify design quality, accessibility, or compatibility.

Themes removed by moderation no longer participate. Service interruptions can also delay what the UI shows, so the final stored period result is more authoritative than a transient countdown or screenshot.

DexThemes is community-built, open source, and not affiliated with OpenAI.
