# OpenAI Build Week 2026

DexThemes for Codex is being prepared for the **Developer Tools** track. The submission extends an existing open-source theme gallery with a new conversational plugin built during the eligible Build Week window.

Official event references:

- [OpenAI Build Week](https://openai.com/build-week/)
- [Build Week on Devpost](https://openai.devpost.com/)

## Eligible extension after July 13

Before Build Week, DexThemes already provided a website gallery, previews, a browser theme builder, community submissions, leaderboards, and unlockable themes.

The Build Week extension adds:

- an installable Codex plugin bundle with a DexThemes skill;
- a stateless MCP server and interactive Apps SDK view;
- standard `search` and `fetch` discovery across official, DexThemes, and community catalogs;
- personalized, voice-friendly theme drafting with custom naming;
- full dark/light Codex workspace mockups, validation, and an explicit copy-and-Settings import handoff inside the conversation;
- daily, weekly, monthly, and all-time visual leaderboards with in-thread theme inspection;
- OAuth-gated personal stats, all-period leaderboard ranks, repeat-win history, unlocks, and app-confirmed public submission with a model-hidden payload-bound review token;
- `Plugged In`, `Voiceprint`, `OpenAI is nothing without its people`, `Theme of the Day`, and `Theme of the Week` achievements and original unlock themes, including the Human Spark reward;
- best-effort redacted, exact-review GitHub Issue preparation for open-source feedback;
- browser-bound GitHub OAuth state plus PKCE, hashed API keys, server-derived achievements, expiry-enforced scoped JWT validation, independent identity/network rate limits, and account-bound plugin sessions;
- canonical theme-ID and palette protection, validated colors at storage/render/apply boundaries, and qualified-adoption leaderboard achievements;
- opt-in supporter-wall visibility with Patron access independent from public listing;
- privacy, terms, support, review tests, and submission metadata.

Git history and the files above provide timestamped evidence of the extension. Do not squash away the Build Week implementation history before judging.

## Codex and GPT-5.6 collaboration

Codex was used to inspect the existing architecture, research current OpenAI plugin/App SDK requirements, scaffold the plugin, implement MCP tools and the interactive view, harden authentication and unlock boundaries, generate review metadata, and run contract/security preflight. GPT-5.6 should be demonstrated in the submitted product flow for theme ideation and palette reasoning.

Required `/feedback` session ID: **pending final submission run**. Run `/feedback` in the completed Codex task and paste the returned session ID into Devpost before submission.

## Live Devpost requirements

Verified from the OpenAI Build Week Devpost project on July 17, 2026:

- submissions close **Tuesday, July 21, 2026 at 5:00 PM PT** (`2026-07-22T00:00:00Z`);
- the category is **Developer Tools**;
- the demo must be a public YouTube video under three minutes with spoken coverage of what was built, how Codex was used, and how GPT-5.6 was used;
- the repository may be public with a relevant license, or private with access granted to `testing@devpost.com` and `build-week-event@openai.com`;
- plugin submissions must include installation instructions, supported platforms, and a judge-ready path that does not require rebuilding from scratch;
- `/feedback` session ID is required.

Judging is based on Technological Implementation, Design, Potential Impact, and Quality of the Idea. The demo and write-up should therefore show the complete voice-to-theme experience, not only the MCP contract.

### Production preflight status

The July 16, 2026 production probe confirms the source is ready for deployment, but the judge path is **not live yet**:

- a real MCP `initialize` POST to `https://www.dexthemes.com/api/mcp` currently returns the gallery's HTML social page rather than an MCP response;
- both required `/.well-known` resources currently return HTML rather than the OAuth metadata and literal OpenAI challenge token;
- `/privacy`, `/terms`, and `/support` currently return `404`.

Do not describe the deployed plugin as judge-testable until a production deployment replaces those responses and the authenticated flow is exercised end to end.

The July 17 local release preflight is green: all 81 automated tests pass, the docs and production builds pass, the plugin bundle validates, `npm audit` reports zero known vulnerabilities, and the 95.1-second video master passes full audio/video decode, caption-range, fast-start, loudness, and frame-level visual checks.

## Judge setup

Supported surfaces: Codex/ChatGPT unified plugin hosts on desktop and web.

Public test path after deployment:

1. Connect `https://www.dexthemes.com/api/mcp` or install `plugins/dexthemes` from the public repository.
2. Ask: “Create a dark and light DexTheme inspired by Argentina football at night. Name it Argentina Afterglow.”
3. Preview and prepare the dark variant for Codex without publishing.
4. Ask for three community themes, inspect one inside the thread, then switch between today's and this week's visual leaderboards.
5. Sign in with GitHub to view personal ranks, repeat daily/weekly wins, achievement reward themes, open the exact publication review, and press Publish in the app.
6. Ask the plugin to prepare a GitHub Issue and verify the exact best-effort redacted draft is shown before GitHub opens and nothing is posted until GitHub's form is submitted.

Local source verification:

```sh
npm install
npm test
npm audit
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/dexthemes
```

## Demo video (under three minutes)

The locked 1:35 production plan, narration, capture checklist, Remotion specification, and YouTube gates live in [`docs/DEMO-VIDEO-PRODUCTION.md`](./DEMO-VIDEO-PRODUCTION.md). Its machine-readable timeline is [`demo-video/storyboard.json`](../demo-video/storyboard.json), and the reproducible render command is `npm run render:master` from `demo-video/remotion`.

The edit uses verified product captures from the MCP visual-QA flow, HeyGen voice-over, and Remotion for deterministic motion, captions, pacing, and the cleared music bed. It uses only original product visuals and licensed audio; it does not include third-party logos, match footage, game art, or unlicensed assets.

## Submission gates

- [ ] Auth0 tenant configured with GitHub upstream login, CIMD preferred (or verified DCR/predefined client), PKCE S256, the exact MCP resource/audience, and `themes:read` / `themes:write` scopes.
- [ ] Auth0 access-token claim mapping verified: standard `email` + `email_verified` are signed when the employee bonus is enabled; no raw work email reaches DexThemes persistence.
- [ ] Matching OAuth environment variables configured in Vercel and Convex.
- [ ] A unique 32+ character `DEXTHEMES_CONFIRMATION_SECRET` is configured in Vercel for app-only publication review tokens.
- [ ] Convex and Vercel deployments completed and live endpoint tested.
- [ ] Developer/domain identity verified in the OpenAI submission portal.
- [ ] Portal domain challenge token supplied at production build time and verified as a literal static `/.well-known/openai-apps-challenge` file (no Vercel rewrite).
- [ ] Reviewer-ready authenticated test path works without MFA, SMS, email confirmation, or private-network access.
- [ ] Privacy, terms, and support URLs confirmed live.
- [ ] Public repository URL and MIT license confirmed accessible to judges.
- [ ] Current Build Week plugin code synchronized to the public MIT repository; the public repository exists but its latest verified push predates this implementation.
- [x] Local release preflight passes: 81 tests, docs/build, plugin validation, zero known npm vulnerabilities, and complete media validation.
- [x] Versioned plugin archive and 1:35 submission master rendered with recorded SHA-256 checksums.
- [ ] Demo video uploaded publicly with audio and under three minutes.
- [ ] `/feedback` session ID added.
- [ ] Devpost draft reviewed and final submission explicitly approved.
