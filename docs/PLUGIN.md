# DexThemes Codex Plugin

DexThemes is packaged as an MCP-backed interactive app plus a bundled Codex skill.

## What works

- Search official Codex, DexThemes, and community themes with standard `search` and `fetch` tools.
- Create a theme from natural language or a transcribed voice request.
- Preserve a user-supplied custom name; if no name is supplied, suggest one and require a naming decision before publication.
- Validate theme IDs, names, summaries, color fields, contrast, and protected palettes.
- Render dark/light previews as full Codex workspace mockups, not color swatches alone, and prepare the exact `codex-theme-v1` import string.
- Keep search, leaderboard selection, reward-theme inspection, and created-theme comparison inside the conversation.
- Show daily, weekly, monthly, and all-time public leaderboards plus an authenticated creator dashboard with ranks, win history, unlocks, and achievement reward previews.
- Publish a confirmed community theme under the verified GitHub identity.
- Prepare a best-effort redacted GitHub Issue draft, show its exact title/body for review, and construct the GitHub URL only after the user clicks to continue.

## Install

The repo-local plugin lives at `plugins/dexthemes` and points to:

```text
https://www.dexthemes.com/api/mcp
```

For directory review, set `OPENAI_APPS_CHALLENGE` to the exact portal-provided token before the production build. The build emits a literal static file at `https://www.dexthemes.com/.well-known/openai-apps-challenge`; Vercel does not support rewrites under its reserved `/.well-known` namespace.

Until the public plugin directory listing is approved, install the plugin from this repository or connect the MCP endpoint directly in Codex developer settings. The supported host is the unified Codex/ChatGPT plugin surface on desktop and web; visual previews adapt to compact layouts.

For local validation:

```sh
npm install
npm test
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/dexthemes
```

## Authentication

Public discovery, drafting, validation, preview, apply handoff, leaderboards, and GitHub Issue preparation do not require an account.

Account-bound tools use OAuth 2.1 and require these scopes:

- `themes:read` for stats and unlocks
- `themes:write` for public submissions

The authorization server should be an established provider such as Auth0 with GitHub configured as the upstream social connection. Prefer Client ID Metadata Documents (CIMD); DCR or a predefined OpenAI client are also supported when configured correctly. Configure the same issuer, audience, and JWKS URI in the Vercel and Convex environments:

OpenAI's current [Apps SDK authentication guidance](https://developers.openai.com/apps-sdk/build/auth) directs third-party apps to their own OAuth authorization server and does not document a general end-user identity handoff from the host's OpenAI account. DexThemes therefore uses GitHub through its own authorization server. This still opens inside the plugin's native linking UI; it does not require a pasted DexThemes key.

```text
DEXTHEMES_AUTH_ISSUER=https://YOUR_TENANT/
DEXTHEMES_AUTH_AUDIENCE=https://www.dexthemes.com/api/mcp
DEXTHEMES_AUTH_JWKS_URI=https://YOUR_TENANT/.well-known/jwks.json
DEXTHEMES_CONFIRMATION_SECRET=AT_LEAST_32_RANDOM_CHARACTERS
```

Configure the authorization server to include signed `email` and `email_verified` access-token claims only if the optional employee achievement is enabled. DexThemes derives the exact-domain eligibility boolean at the resource server and does not persist or return the email address. If those claims are absent, normal GitHub account linking still works and no employee bonus is granted.

The resource server validates issuer, audience, expiry, RS256 signature, and scopes. Only `github|...` subjects are accepted. MCP arguments never accept `userId`, `ownerId`, author identity, tokens, API keys, or email addresses.

The provider discovery document must advertise the chosen client-registration method, token endpoint authentication method, PKCE S256, and enabled scopes. It must preserve the `resource=https://www.dexthemes.com/api/mcp` parameter into the access-token audience. Add the exact callback URL shown in the plugin management page to the provider allowlist.

The website continues to support direct GitHub OAuth. Both paths key accounts by the verified GitHub numeric ID, so plugin and website activity converge on one DexThemes account.

## Achievements

- `Plugged In` / `plugged-in`: first authenticated plugin use. The host does not expose a trustworthy installation webhook, so this is the secure equivalent of an install achievement.
- `Voiceprint` / `voiceprint`: create and publish a theme through the plugin.
- `Builder of AGI` / `builder-of-agi`: a signed identity-provider claim verifies an exact `@openai.com` domain. Its achievement line is: “OpenAI is nothing without its people.”
- `Theme of the Day` / `golden-hour`: the creator of a closed UTC day's qualified #1 theme. Eligibility requires at least three unique copies and one signed-in, non-author adoption.
- `Theme of the Week` / `headliner`: the creator of a closed Monday-through-Sunday UTC week's qualified #1 theme. Eligibility requires at least five unique copies and two signed-in, non-author adoptions.

DexThemes stores only the employee eligibility boolean for that bonus, not the work email address. The theme uses an original graphite/green palette with no OpenAI logo or claim of endorsement.

Monthly rankings and the `Summit` achievement use qualified adoptions: one signed-in, non-author copy per user/theme/month, with at least three qualified adopters before Top 10 eligibility. Raw anonymous copy counts remain visible as analytics but cannot unlock Summit.

Every qualifying daily or weekly result is stored in creator history, including repeat wins by the same theme. Achievement grants remain one-time per account, so a repeat winner gains another dashboard stat without duplicate unlock rows or duplicate reward themes.

## Apply handoff

The current Codex desktop build supports `codex-theme-v1` imports and the generic `codex://settings` route, but does not expose a documented Appearance deep link or public silent theme-apply API. The app therefore requests clipboard-write permission, feature-detects clipboard support, and uses an explicit **Copy & open Settings** control. If clipboard access is blocked, it leaves the exact import string selectable and offers a separate Settings button. The user then chooses **Appearance → Import theme** and pastes; the plugin never claims that a theme was silently applied.

## Publication safety

`submit_theme` is the only public write tool. It is app-only and:

1. requires `themes:write`;
2. derives identity only from the verified bearer token;
3. requires a five-minute token bound to the exact reviewed payload and current OAuth token; the token is returned only in app metadata hidden from the model;
4. re-runs server-side moderation and protected-palette checks;
5. independently rate-limits writes per verified identity and per network;
6. is called only by the review app after the user presses Publish;
7. creates a new theme and cannot edit or delete existing themes.

## Remaining live configuration gate

The code and local contract tests are complete, but authenticated plugin tools are not live until an OAuth tenant is configured and both Convex and Vercel are deployed with matching environment variables. Domain verification also needs the portal-provided challenge token at production build time, and authenticated review needs a reviewer-ready login path. Public tools can still be reviewed locally without those credentials.
