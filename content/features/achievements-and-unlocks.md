---
title: DexThemes Achievements and Unlocks
description: Earn account-bound reward themes through creation, community participation, qualified rankings, and supported integrations.
slug: achievements-and-unlocks
kind: feature
section: Features
answer: DexThemes records verified or client-observable milestones for a signed-in account and unlocks one-time reward themes without exposing protected palettes beforehand.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes 1.0.0 unlock, account, and popularity source as of 2026-07-30
related: /features/leaderboard, /features/creator-dashboard, /features/codex-plugin
---

DexThemes achievements turn supported product milestones into account-bound reward themes. A locked reward can appear in the catalog, but its detailed palette and preview stay protected until the signed-in account has the corresponding unlock. Each normal achievement is granted once per account.

## Participation and creation rewards

The current implementation maps these supported actions to reward themes:

- Signing in can unlock **Cupid's Code**.
- Liking a theme can unlock **Heartbeat**.
- Using the DexThemes X share action can unlock **Mint Condition**.
- Using Color Me Lucky can unlock **Kaleidoscope**.
- Creating and publishing a first community theme can unlock **Seraphim**.
- Publishing both dark and light variants, or adding the missing side later, can unlock **Yin & Yang**.
- Completing the authenticated API demo or publishing through a DexThemes API key can unlock **The Builder**.
- Registering an authenticated agent key can unlock **Agent Claw**.
- Completing the supported installed-app flow can unlock **Homebase**.

Some of these actions are observable from the client, while others are verified at the server. For example, publication, API use, account identity, and variant ownership are checked by account-bound routes. Opening an external share composer is observable to DexThemes, but DexThemes cannot promise that a social post was ultimately submitted.

## Plugin and identity rewards

The implemented DexThemes MCP app adds two plugin milestones:

- The first authenticated plugin use can unlock **Plugged In**.
- Creating and publishing a theme through the plugin can unlock **Voiceprint**.

The additive **Harnessed** milestone has a paired **Deep Current** reward and an OAuth-protected DeepSeek Harness completion route. The installed settings plugin uses an optional OAuth device connection that keeps the access token in memory and awards the milestone only after a successful connected apply. The generic Harness MCP connector remains anonymous, and anonymous theme applies never claim the reward.

An optional verified eligibility claim can unlock the **Human Spark** reward. The implementation stores the eligibility boolean rather than retaining or returning the work email used to establish it. The palette is original, and the achievement is not an OpenAI endorsement.

Plugin rewards depend on a functioning OAuth connection and the required scope. Anonymous theme discovery, drafting, validation, previews, apply handoff, and leaderboards do not create these account records by themselves.

## Popularity rewards

Three achievements connect to finalized [leaderboard](/features/leaderboard) results:

- **Golden Hour** follows a qualified number-one finish for a closed UTC day, with at least three copies and one signed-in non-author adoption.
- **Headliner** follows a qualified number-one finish for a closed Monday-through-Sunday UTC week, with at least five copies and two signed-in non-author adoptions.
- **Summit** follows a finalized Top 10 placement for a closed UTC month, with at least three qualified adoptions.

A live rank is only a current view. These rewards are decided from the stored result after the period closes. A repeat daily or weekly win adds another creator-history result but does not duplicate the one-time reward theme.

## Supporter and hidden rewards

The **Patron** reward is tied to a verified supporter flow. Supporter status can be revoked when the source support is refunded or cancelled, and public supporter listing is a separate opt-in choice. Patron data is intentionally omitted from plugin account tools even though the standalone website can display eligible supporter state.

DexThemes also contains a hidden interaction reward. Its completion details are intentionally not documented here; the point of a hidden reward is discovery, not a checklist that reveals it in advance.

## Where progress appears

The signed-in website profile shows achievement cards, overall progress, and whether each visible reward is locked or unlocked. The plugin's `themes:read` account tools can show supported achievements and render the unlocked reward themes inside the conversation. Anonymous users can see public feature explanations but cannot ask the service for someone else's collection.

## Limits and failure boundaries

An on-screen action is not always proof that its server record succeeded. Authentication expiry, network failure, rate limits, an unavailable OAuth configuration, or a rejected publication can prevent an unlock. Some eligibility-linked rewards can be revoked if the verified eligibility no longer applies.

Achievements do not certify that a theme imported successfully, that a creator owns third-party intellectual property, or that OpenAI approved DexThemes. They are product milestones under the current source rules. Final account state, not a toast or screenshot, is authoritative.

DexThemes is community-built, open source, and not affiliated with OpenAI.
