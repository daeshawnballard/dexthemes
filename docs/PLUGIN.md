# DexThemes Codex Plugin

DexThemes is packaged as an MCP-backed interactive app plus a bundled Codex skill.

## What works

- Search built-in Codex, DexThemes, and community themes with standard `search` and `fetch` tools.
- Create a theme from natural language or a transcribed voice request.
- Preserve a user-supplied custom name; if no name is supplied, suggest one and require a naming decision before publication.
- Validate theme IDs, names, summaries, color fields, contrast, protected palettes, and original public-facing wording.
- Render dark/light previews as full Codex workspace mockups, not color swatches alone, and prepare the exact `codex-theme-v1` import string.
- Prepare paired T3 Code theme JSON for manual import through the app's Appearance settings.
- Keep search, leaderboard selection, reward-theme inspection, and created-theme comparison inside the conversation.
- Show daily, weekly, monthly, and all-time public leaderboards, and return authenticated creator stats and unlock details directly in the conversation without mounting an extra UI frame.
- Publish a confirmed community theme under the verified GitHub identity.
- Prepare a best-effort redacted GitHub Issue draft, show its exact title/body for review, and construct the GitHub URL only after the user clicks to continue.

The plugin uses its own policy-clean catalog view. Existing franchise-labeled website palettes receive original descriptive aliases in plugin search and previews, and Patron/supporter rewards are not returned by MCP account tools. The standalone website and its donation flow remain unchanged.

Aliases preserve recognizable atmosphere without returning the original catalog label—for example, the leaf-green seventh-guardian palette is **Seventh Fire Shadow**, and the armored military sci-fi palette is **Emerald Spartan**. Descriptive country, sport, color, and time-of-day concepts such as “Argentina football at night” remain allowed.

## Install

The repo-local plugin lives at `plugins/dexthemes` and points to:

```text
https://www.dexthemes.com/api/mcp
```

Install the released 1.0.1 package with your installed Codex CLI:

```sh
codex plugin marketplace add daeshawnballard/dexthemes --ref v1.0.1 --sparse .agents/plugins --sparse plugins/dexthemes
codex plugin add dexthemes@dexthemes-community
```

The marketplace is named `dexthemes-community`. The [1.0.1 release](https://github.com/daeshawnballard/dexthemes/releases/tag/v1.0.1) also includes the plugin ZIP and checksum. Repository installation is available while OpenAI directory review remains a separate publication step.

Public discovery, drafting, previews, and import preparation work without an account; authenticated creator tools request sign-in when used. Visual previews require a host that supports MCP Apps.

For directory review, configure `OPENAI_APPS_CHALLENGE` with the exact portal-provided token before the production build and verify the live `https://www.dexthemes.com/.well-known/openai-apps-challenge` response before submission.

For local validation:

```sh
npm ci
DEXTHEMES_SKIP_CLEAN=1 npm run validate
```

## Authentication

Public discovery, drafting, validation, preview, apply handoff, leaderboards, and GitHub Issue preparation do not require an account.

Account-bound tools use OAuth 2.1 and require these scopes:

- `themes:read` for stats and unlocks
- `themes:write` for public submissions

The authorization server should be an established provider such as Auth0 with GitHub configured as the upstream social connection. Prefer Client ID Metadata Documents (CIMD); DCR or a predefined OpenAI client are also supported when configured correctly. Configure the same issuer, audience, and JWKS URI in the active MCP deployment and Convex environments:

OpenAI's current [Apps SDK authentication guidance](https://developers.openai.com/apps-sdk/build/auth) directs third-party apps to their own OAuth authorization server and does not document a general end-user identity handoff from the host's OpenAI account. DexThemes therefore uses GitHub through its own authorization server. This still opens inside the plugin's native linking UI; it does not require a pasted DexThemes key.

```text
DEXTHEMES_AUTH_ISSUER=https://YOUR_TENANT/
DEXTHEMES_AUTH_AUDIENCE=https://www.dexthemes.com/api/mcp
DEXTHEMES_AUTH_JWKS_URI=https://YOUR_TENANT/.well-known/jwks.json
DEXTHEMES_CONFIRMATION_SECRET=AT_LEAST_32_RANDOM_CHARACTERS
```

Configure the authorization server to include signed `email` and `email_verified` access-token claims only if the optional employee achievement is enabled. DexThemes derives the exact-domain eligibility boolean at the resource server and does not persist or return the email address. If those claims are absent, normal GitHub account linking still works and no employee bonus is granted.

The resource server validates issuer, audience, expiry, RS256 signature, and scopes. Normal account access accepts only well-formed `github|...` subjects. OpenAI review can additionally use one exact Auth0 database subject configured through `DEXTHEMES_OPENAI_REVIEWER_SUBJECT`; that subject is mapped to an isolated synthetic reviewer identity and can never receive employee eligibility. Every other non-GitHub subject is rejected. MCP arguments never accept `userId`, `ownerId`, author identity, tokens, API keys, or email addresses.

The provider discovery document must advertise the chosen client-registration method, token endpoint authentication method, PKCE S256, and enabled scopes. It must preserve the `resource=https://www.dexthemes.com/api/mcp` parameter into the access-token audience. Add the exact callback URL shown in the plugin management page to the provider allowlist.

The website continues to support direct GitHub OAuth. Both paths key accounts by the verified GitHub numeric ID, so plugin and website activity converge on one DexThemes account.

## Achievements

- `Plugged In` / `plugged-in`: first authenticated plugin use. The host does not expose a trustworthy installation webhook, so this is the secure equivalent of an install achievement.
- `Voiceprint` / `voiceprint`: create and publish a theme through the plugin.
- `OpenAI is nothing without its people` unlocks the `Human Spark` reward theme (`builder-of-agi`, retained as the stable internal ID) when a signed identity-provider claim verifies an exact `@openai.com` domain.
- `Theme of the Day` / `golden-hour`: the creator of a closed UTC day's qualified #1 theme. Eligibility requires at least three unique copies and one signed-in, non-author adoption.
- `Theme of the Week` / `headliner`: the creator of a closed Monday-through-Sunday UTC week's qualified #1 theme. Eligibility requires at least five unique copies and two signed-in, non-author adoptions.

DexThemes stores only the employee eligibility boolean for that bonus, not the work email address. The theme uses an original graphite/green palette with no OpenAI logo or claim of endorsement.

Monthly rankings and the `Summit` achievement use qualified adoptions: one signed-in, non-author copy per user/theme/month, with at least three qualified adopters before Top 10 eligibility. Raw anonymous copy counts remain visible as analytics but cannot unlock Summit.

Every qualifying daily or weekly result is stored in creator history, including repeat wins by the same theme. Achievement grants remain one-time per account, so a repeat winner gains another dashboard stat without duplicate unlock rows or duplicate reward themes.

## Apply handoff

Choose Dark or Light in the preview, then use **Copy & open Settings**. Each variant selection prepares its own `codex-theme-v1` import string. In Codex, choose **Settings → Appearance → Import theme**, paste, and confirm the import. The plugin requests the generic `codex://settings` route; the user chooses Appearance and completes the import. Preparation and app launch do not apply a theme.

**Show import string** is collapsed by default and provides the exact selectable value. If clipboard access is blocked, use that fallback and open Settings manually. Reopen Appearance to check the selected theme, and restore your prior themes and mode after a trial.

For T3 Code, choose **Use in T3 Code** to prepare JSON containing both variants. **Copy T3 Code JSON** copies it without navigating; **Copy & open T3 Code** also requests the registered generic `t3code://app/` route. Hosts may block external app links, so manual app opening remains available. In T3 Code, choose **Settings → Appearance → Themes → Add theme**, paste the JSON, and confirm. Check both appearances after reopening Settings, then restore your original selections if this was a trial.

DeepSeek Harness is a separate channel. `prepare_deepseek_apply` returns an exact `cordis_define` client Package for a paired theme. Inside a running Harness integration, the supported guarded theme service applies the tokens immediately and its retained disposer or `cordis_stop` removes them. Payload preparation is not installation proof, and the standalone website cannot contact an unrelated local Harness instance. See [DeepSeek Harness integration](DEEPSEEK-HARNESS.md) for the compatibility, analytics, privacy, and distribution boundaries.

## Publication authorization and review continuity

`submit_theme` is the only MCP public write tool. Its terminal authorization is OAuth `themes:write`:

1. requires `themes:write`;
2. is marked app-visible and is not linked to its own output template, but that visibility is host presentation metadata rather than authorization;
3. derives identity only from the verified bearer token;
4. requires a five-minute token bound to the exact reviewed payload and current OAuth token in the MCP review flow; the token is returned in app metadata hidden from the model, but is not single-use and does not prove user activation;
5. re-runs server-side moderation and protected-palette checks;
6. requires original wording in every public name, ID, and summary while leaving private drafts flexible;
7. independently rate-limits writes per verified identity and per network;
8. is called by the first-party review app after the user presses Publish, while authorized OAuth clients and the downstream bearer publication route rely on `themes:write` rather than a cryptographic button-click claim;
9. creates a new theme and cannot edit or delete existing themes.

## Live authentication configuration

Production uses Auth0 with GitHub as the primary social connection, an exact-subject database reviewer account with public signups disabled, matching Convex and MCP issuer/audience/JWKS configuration, and the OpenAI domain challenge endpoint. The reviewer subject must be configured identically in Convex and the MCP deployment before authenticated review.
