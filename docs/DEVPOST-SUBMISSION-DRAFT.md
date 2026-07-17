# Devpost Submission Draft

## Project overview

**Project name:** DexThemes for Codex

**Tagline:** Speak a vibe. Create a Codex theme. Share it with the community.

**Track:** Developer Tools

**Repository:** https://github.com/daeshawnballard/dexthemes

**Project URL:** https://www.dexthemes.com/

**Current Devpost project:** [DexThemes for Codex](https://devpost.com/software/dexthemes-for-codex) (`1339089`, project page published; Build Week `submitted_at` remains empty)

**Submission deadline:** Tuesday, July 21, 2026 at 5:00 PM PT

## Inspiration

Developer tools are deeply personal, but changing their feel is usually a scavenger hunt across settings, copied snippets, and disconnected galleries. DexThemes already made Codex themes easier to browse and preview. Build Week made the next step possible: make theme discovery and creation conversational, visual, and community-powered directly inside Codex.

## What it does

DexThemes for Codex lets a user describe a mood, team, game, event, or personality and receive an original dark/light theme with a name, validation, and visual preview. A custom name is always honored; if the user did not choose one, the plugin suggests a name and asks for a decision before publication.

Users can search official, DexThemes, and community catalogs and inspect results without leaving the conversation. Every theme is rendered as a dark/light Codex workspace mockup rather than a row of swatches. The plugin prepares the exact Codex import string, uses an explicit Copy & open Settings handoff, shows daily, weekly, monthly, and all-time leaderboards, exposes personal ranks and repeat-win history, previews unlocked achievement themes, and publishes a confirmed theme under the user's GitHub identity. It can also prepare a best-effort redacted GitHub Issue; the exact draft and a review warning are shown first, and nothing is silently posted.

## How it was built

- OpenAI Apps SDK / MCP app resource for interactive theme cards and previews
- Model Context Protocol server with explicit tool schemas and safety annotations
- Codex plugin manifest plus a bundled DexThemes skill
- Convex for accounts, community themes, unlocks, leaderboards, moderation, and rate limits
- Vercel for the website and MCP endpoint
- OAuth 2.1 resource-server flow with GitHub as the upstream identity
- Vanilla JavaScript, Zod, JOSE, esbuild, and Node contract tests

Codex helped research the current plugin and Apps SDK contracts, scaffold the app-plus-skill bundle, implement the tool/UI/backend integration, harden identity and achievement boundaries, and build the review/preflight artifacts. GPT-5.6 powers the creative reasoning that turns natural-language inspiration into intentional palettes.

## Challenges

The hardest design constraint was making public discovery frictionless while keeping account writes safe. The plugin therefore exposes public read/compute tools without auth, triggers GitHub OAuth only for personal data or publication, derives identity solely from the verified token, and puts publication behind an exact visual review plus a user-pressed Publish button. Its short-lived confirmation token is bound to both the reviewed payload and OAuth session, returned only in app metadata hidden from the model, and accepted only by an app-only write tool.

The second challenge was preserving delight without turning achievements into a client-side trust boundary. Server-verifiable achievements now come from real actions. Daily and weekly winners are finalized from closed UTC periods with minimum unique-copy and qualified-adopter thresholds; every repeat win remains in creator stats, while each reward theme unlocks once. Monthly ranking rewards also require unique signed-in non-author adoptions, likes resolve a real visible theme, protected theme IDs come from the canonical catalog, and the OpenAI employee bonus stores only a verified eligibility boolean rather than an email address.

We also hardened the plugin as an account surface: GitHub OAuth state is bound to the initiating browser and PKCE verifier, signed access tokens must include expiry, identity and network quotas cannot be reset as one compound key, theme colors are validated before storage/render/apply, stale OAuth state is cleaned on a schedule, and supporter-wall visibility is explicit opt-in.

## Accomplishments

- Voice-friendly, custom-named theme creation with live dark/light previews
- A short apply path from conversation to a valid Codex import payload
- One plugin spanning discovery, creation, community, stats, unlocks, and feedback
- Full dark/light Codex workspace mockups for search, creation, leaderboard, apply, and review flows
- Five new achievement themes: Plugged In, Voiceprint, Human Spark, Golden Hour, and Headliner
- Daily and weekly winner history that counts repeat wins without duplicating one-time unlocks
- “OpenAI is nothing without its people” is reserved for signed-in users whose upstream identity provides a verified exact `@openai.com` email; it unlocks Human Spark, and DexThemes persists only the eligibility result, not the work email address
- GitHub feedback with automatic secret/path/email redaction and an exact user-review gate instead of auto-posting
- Twelve MCP tools with output schemas, explicit safety annotations, and a model/app publication boundary
- Five positive and three negative app review tests
- Zero known npm audit vulnerabilities in the local preflight

## What is next

After Build Week: community collections and follows, theme remix lineage, expanded creator profiles, additional accessibility checks, and a first-class Codex apply API if the host exposes one.

## Judge test instructions

Use the install and test path in `docs/BUILD-WEEK-2026.md`. Authenticated tools require the live GitHub OAuth connection; discovery, drafting, preview, validation, apply handoff, public leaderboard, and GitHub Issue preparation are available without an account.

Supported platforms: Codex and ChatGPT plugin hosts on desktop and web. The deployment target is `https://www.dexthemes.com/api/mcp`; it is not yet judge-testable because the current production route returns the gallery HTML instead of MCP. The public gallery at `https://www.dexthemes.com/` remains available for catalog and preview inspection.

## Live submission fields

- **Submitter Type (`27945`):** pending user confirmation
- **Country of Residence (`27946`):** pending user confirmation
- **Category (`27947`):** Developer Tools
- **Repository (`27948`):** https://github.com/daeshawnballard/dexthemes
- **Judge URL and instructions (`27949`):** after the production deployment is verified, use `https://www.dexthemes.com/api/mcp`; sign in with GitHub only for personal stats, unlocks, and publication; public discovery, drafting, preview, apply handoff, leaderboard, and GitHub Issue review require no account
- **`/feedback` Session ID (`27950`):** pending
- **Plugin installation and testing (`27951`):** connect `https://www.dexthemes.com/api/mcp` in the unified Codex/ChatGPT plugin host, then follow the six-step judge path in `docs/BUILD-WEEK-2026.md`

## Judging alignment

- **Technological Implementation:** twelve schema-bound MCP tools, an Apps SDK view, OAuth-gated personal operations, a model/app write boundary, and repository-grounded security hardening.
- **Design:** a complete voice-to-name-to-full-workspace-preview-to-apply/publish experience, plus in-thread discovery and creator dashboards, rather than a tool-only proof of concept.
- **Potential Impact:** removes theme discovery and creation friction for Codex users while giving an open-source community a safe contribution loop.
- **Quality of the Idea:** combines conversational personalization, visual tooling, community progression, and in-context open-source feedback in a native plugin surface.

## Submission fields still required

- Public demo video URL
- `/feedback` Codex session ID
- Final live MCP test confirmation
- Final repository visibility check
- Synchronize this Build Week implementation to the public MIT repository; the currently public repository is accessible but its latest verified push predates the plugin work
- Team/member details requested by Devpost
- Explicit approval before the final Devpost submission action
