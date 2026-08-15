# DexThemes API

DexThemes exposes two public-facing surfaces:

- the website/published docs surface on `https://www.dexthemes.com`
- the direct Convex HTTP surface on `https://acrobatic-corgi-867.convex.site`

Use the website for public browsing and discovery docs. Use the direct Convex base URL for authenticated and generator HTTP examples.

## Public discovery surface

- Theme catalog: `https://www.dexthemes.com/api/themes`
- DeepSeek Harness apply-preparation payload: `https://www.dexthemes.com/api/deepseek-theme?theme={id}`
- DeepSeek Harness restricted MCP profile: `https://www.dexthemes.com/api/deepseek-mcp`
- Natural-language paired draft: `POST https://www.dexthemes.com/api/generate-theme`
- Category routes:
  - `https://acrobatic-corgi-867.convex.site/themes`
  - `https://acrobatic-corgi-867.convex.site/themes/community`
  - `https://acrobatic-corgi-867.convex.site/themes/codex`
  - `https://acrobatic-corgi-867.convex.site/themes/dexthemes`
  - `https://acrobatic-corgi-867.convex.site/themes/dexthemes/video-games`
- LLM docs: `https://www.dexthemes.com/llms.txt`
- OpenAPI: `https://www.dexthemes.com/.well-known/openapi.json`

## Direct API base URL

`https://acrobatic-corgi-867.convex.site`

## Authentication model

- Browser users on [dexthemes.com](https://www.dexthemes.com) authenticate with a secure session cookie after OAuth sign-in.
- Agents and scripts authenticate with a `dxt_...` API key issued only after GitHub sign-in and send it in `Authorization: Bearer <token>`.
- The Codex/ChatGPT plugin uses OAuth 2.1 bearer tokens with GitHub as the upstream identity. The resource server validates signature, issuer, audience, expiry, and `themes:read` or `themes:write` scope.
- Localhost/dev-only OAuth bootstrap may still pass a temporary session token through the callback hash so the browser can convert it into the local session mode. That is not the intended public production contract.

Account identity is derived by the server. No authenticated endpoint or MCP tool accepts `userId`, `ownerId`, author identity, an email address, or a token in its JSON arguments.

## DeepSeek Harness theme payload

```http
GET /api/deepseek-theme?theme={public-theme-id}
```

This public read returns a validated client-only Cordis Package definition for themes with both dark and light palettes. It uses Harness `theme.overrideTokens(source, tokens)` with `{ light, dark }` string pairs and declares `cordis_stop` as the reversible removal path. It does not return a clipboard import, mutate Harness configuration, or claim font support.

The endpoint is an agentic apply-preparation artifact, not an external Harness installation API. In the inspected Harness checkout, `cordis_define` and `cordis_run` are in-process model tools without a public wire face. Human one-click apply lives in the separately installed `@dexthemes/deepseek-harness-plugin` package under **Settings → Plugins → DexThemes**; the standalone website cannot control an unrelated Harness tab. See [DeepSeek Harness integration](DEEPSEEK-HARNESS.md) for the exact boundary.

The installed package connects Harness to `/api/deepseek-mcp`, a fail-closed anonymous profile containing only `search`, `fetch`, `draft_theme`, `color_me_lucky`, `validate_theme`, `render_theme_preview`, `prepare_deepseek_apply`, and `get_leaderboard`. It excludes the Codex apply, OAuth account, submission, publication, and feedback tools because Harness's generic MCP bridge does not enforce their security/app metadata. Harness receives complete JSON in text blocks so drafts and apply payloads remain model-visible.

Responses:

- `200`: a validated `dexthemes-deepseek-theme-v1` payload
- `400`: missing `theme` query parameter
- `404`: unknown or unavailable theme
- `422`: the theme lacks a valid light/dark pair

## Natural-language theme draft

```http
POST /api/generate-theme
Content-Type: application/json

{"prompt":"A cozy forest theme with moss accents and readable amber warnings","platformId":"deepseek"}
```

This server-side DexThemes AI route asks `gpt-5.6-luna` for a strict structured draft, rejects unknown or unsafe fields, normalizes six-digit colors deterministically, and runs the existing theme validator. It returns an editable draft; it does not save, publish, copy, apply, or submit anything. Only the bounded prompt and platform constraints are sent to OpenAI. Workspace contents, source files, credentials, account secrets, chat history, and analytics identifiers are excluded. Raw prompts and model output are not logged or placed in analytics.

The creator keeps manual editing available on API failure. `OPENAI_API_KEY` is server-only and production configuration is independent from source/build proof. Production generation also fails closed behind a durable Convex quota backed by the existing `rateLimits` table. The Vercel route and Convex deployment must share `DEXTHEMES_LUNA_RATE_LIMIT_SECRET` (a separately generated printable secret of at least 32 characters), and Vercel must set its HTTPS `CONVEX_SITE_URL`. The quota request contains only a SHA-256 network key and the fixed `luna_theme_generation` action; prompts and generated output never reach the quota route. A bounded per-instance Vercel limiter remains the first abuse-control layer.

Responses:

- `200`: an unapproved, validated paired canonical theme draft
- `400`, `413`, `415`: invalid or oversized request
- `422`: refused, incomplete, or invalid generated draft
- `429`: bounded instance or durable quota reached
- `503`, `504`: durable quota/provider unavailable or generation timeout; manual editing remains available

---

## Generate a random theme

```
GET /api/color-me-lucky
```

This route is currently documented and served from the direct Convex API base.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `variant` | `dark` \| `light` | `dark` | Theme variant to generate |
| `name` | `string` | *(auto-generated)* | Custom name for the theme. If omitted, a random name is generated from ~5000+ combinations |

### Response

```json
{
  "name": "Astral Pulse",
  "variant": "dark",
  "harmony": "split-complementary",
  "baseHue": 220,
  "colors": {
    "surface": "#0f1219",
    "ink": "#e8ecf5",
    "accent": "#5a8fe6",
    "sidebar": "#0b0e15",
    "codeBg": "#090c11",
    "diffAdded": "#3dbe6e",
    "diffRemoved": "#c44a4a",
    "skill": "#b87ee0",
    "contrast": 62
  },
  "importString": "codex-theme-v1:{\"codeThemeId\":\"codex\",\"theme\":{...},\"variant\":\"dark\"}"
}
```

### Color Fields

| Field | Purpose |
|-------|---------|
| `surface` | Main background color |
| `ink` | Primary text color |
| `accent` | Accent/highlight color |
| `sidebar` | Sidebar background |
| `codeBg` | Code block background |
| `diffAdded` | Color for added lines in diffs |
| `diffRemoved` | Color for removed lines in diffs |
| `skill` | Color for function/skill highlights |
| `contrast` | Contrast level (0–100) |

### Color Harmonies

Each generated theme uses one of six color harmony strategies:

- **complementary** — two colors opposite on the color wheel
- **analogous** — three adjacent colors
- **triadic** — three evenly spaced colors
- **split-complementary** — a base color plus two colors adjacent to its complement
- **tetradic** — four evenly spaced colors
- **monochromatic** — single hue with saturation/lightness variations

### Examples

```sh
# Generate a random dark theme
curl https://acrobatic-corgi-867.convex.site/api/color-me-lucky

# Generate a light theme
curl https://acrobatic-corgi-867.convex.site/api/color-me-lucky?variant=light

# Generate with a custom name
curl "https://acrobatic-corgi-867.convex.site/api/color-me-lucky?variant=dark&name=Ocean+Breeze"
```

### Applying the Theme

The `importString` field is ready to paste into Codex:

1. Copy the `importString` value
2. Open Codex → **Settings → Appearance → Import theme**
3. Paste and import

---

## Submit a Theme

Submit a generated theme to the [DexThemes gallery](https://www.dexthemes.com). Requires authentication.

```
POST /api/color-me-lucky/submit
```

### Authentication

You must be signed in to DexThemes.

For browser use on [dexthemes.com](https://www.dexthemes.com), the app authenticates with its secure session cookie after sign-in.
For scripted calls, prefer an API key (`dxt_...`) from the agent/auth flow and send it as:

```http
Authorization: Bearer <your-dexthemes-api-key>
```

Creating or replacing an API key requires an active GitHub-authenticated browser session. The secret is shown once and only its SHA-256 digest and a short non-secret prefix are stored.

### Request Body

```json
{
  "name": "Ocean Breeze",
  "variant": "dark",
  "colors": {
    "surface": "#0f1219",
    "ink": "#e8ecf5",
    "accent": "#5a8fe6",
    "sidebar": "#0b0e15",
    "codeBg": "#090c11",
    "diffAdded": "#3dbe6e",
    "diffRemoved": "#c44a4a",
    "skill": "#b87ee0",
    "contrast": 62
  },
  "summary": "A cool ocean-inspired dark theme"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Theme display name (1–80 chars) |
| `variant` | `dark` \| `light` | No | Defaults to `dark` |
| `colors` | `object` | No | If omitted, fresh random colors are generated |
| `summary` | `string` | No | Short description (defaults to "Generated with Color Me Lucky") |

### Response

```json
{
  "success": true,
  "theme": {
    "_id": "...",
    "themeId": "ocean-breeze"
  },
  "message": "Theme submitted to DexThemes! View it at https://www.dexthemes.com"
}
```

### Errors

| Status | Error | Cause |
|--------|-------|-------|
| 401 | `Sign in to DexThemes first` | Missing or invalid auth token |
| 400 | `A theme name is required` | Empty or missing `name` field |
| 400 | `A theme with this ID already exists` | Duplicate theme name |

---

## CORS

Credentialed browser account routes allow the production DexThemes origins, plus explicit localhost origins when `ENVIRONMENT=development`. Public catalog/generator routes and explicit Bearer-token protocol surfaces may use wildcard CORS; browser cookies are not usable with wildcard origins, and CLI clients do not rely on browser CORS.

The MCP endpoint uses wildcard CORS because protocol clients can run in multiple hosts; it separately validates the HTTP host, JWT issuer/audience/signature/expiry, OAuth scopes, and account identity before any authenticated tool reaches Convex.

## Rate limits

DexThemes applies IP and user-based rate limiting on sensitive routes. Public reads are intentionally generous; authenticated writes are tighter. DexThemes AI generation uses both a bounded Vercel-instance backstop and a secret-authenticated, durable Convex network/global quota. Missing or unavailable durable quota configuration rejects production generation before the OpenAI provider is called.

## Codex/ChatGPT plugin

- MCP endpoint: `https://www.dexthemes.com/api/mcp`
- Protected-resource metadata: `https://www.dexthemes.com/.well-known/oauth-protected-resource`
- Public tools: theme search/fetch, drafting, validation, full Codex-style previews, apply preparation, daily/weekly/monthly/all-time leaderboards, and GitHub Issue preparation
- OAuth `themes:read`: personal creator stats, current ranks, daily/weekly win history, achievements, and unlocked reward-theme previews
- OAuth `themes:write`: confirmed public theme submission

`submit_theme` is the only plugin tool that creates public state. It is app-only and accepts a short-lived confirmation token bound to the exact reviewed payload and current OAuth token; only the review app receives that token in model-hidden metadata. It re-validates server-side, publishes under the GitHub identity derived from the signed token, and cannot edit or delete another theme.

## DeepSeek Harness account milestone

The installed Harness settings package uses these bearer-only, wildcard-CORS routes; none accepts cookies or caller-supplied identity:

- `POST /plugin/deepseek-harness/auth/start` requests a bounded code from GitHub Device Flow through Convex using the shared **DexThemes Connect** OAuth application for installed integrations and no requested OAuth scope.
- `POST /plugin/deepseek-harness/auth/poll` accepts the opaque device code and an optional normalized plugin version. Convex exchanges the code with GitHub, verifies `/user` server-side, revokes that exact GitHub token, idempotently grants `Harnessed` / `Deep Current`, and returns a one-hour `dxd_…` DexThemes session with separate `themes:read` and `harness:use` scopes. Only its hash is stored at rest. The version is bounded integration evidence, not identity or authority.
- `DELETE /plugin/deepseek-harness/session` revokes that client-usable DexThemes session. The client persists a disconnected state only after HTTP success with `{ revoked: true }`; failures retain a retryable in-memory session.
- `GET /plugin/me/stats` and `GET /plugin/me/unlocks` return the verified account's sanitized creator data and reward themes.
- `POST /plugin/deepseek-harness/use` requires the dedicated `harness:use` scope and accepts only a UUID receipt plus an optional normalized plugin version—never an action, user, platform, prompt, workspace, credential, theme, or palette payload. It updates replay-deduped, explicitly client-reported Connected Apps activity and cannot grant a protected reward. The installed client retains a failed receipt in memory and reuses that exact UUID on explicit retry, preventing a lost response from double counting.

The plugin keeps the device code and DexThemes session in memory only and accepts only GitHub's exact device verification origin. It never receives a GitHub access token, requests no refresh/offline scope, and clears local authority on disconnect or unload. The restricted Harness MCP profile stays anonymous; anonymous applies do not award the milestone. The standards-compliant Codex/ChatGPT MCP OAuth verifier remains a separate unchanged contract.

## Connected Apps account routes

Connected Apps is an account view over durable installed-integration evidence. It does not expose or extend bearer sessions, does not read Statsig, and does not infer historical installations.

- `GET /me/connected-apps` requires the existing GitHub-authenticated website session; `dxt_…` API keys and plugin bearer sessions are rejected. It returns only active known integrations with integration/platform labels, optional plugin version, connection and last-use timestamps, a bounded count labeled `client_reported`, and disconnect capability.
- `DELETE /me/connected-apps` requires the same website session and an exact known `integrationId`. It marks that account connection disconnected and revokes client-usable sessions belonging to that integration source. It does not revoke website GitHub OAuth, Auth0/MCP OAuth, API keys, or unrelated plugin sessions.

The initial integration ID is `deepseek_harness`. A durable row is created only after successful DeepSeek GitHub Device Flow identity verification. Existing users receive no fabricated or backfilled row. Disconnect preserves the bounded record as inactive history while omitting it from the active account response.

## License

The Color Me Lucky API is free to use. The generated themes and import strings are yours to keep. Attribution is appreciated but not required.

Built by [@Daeshawn](https://x.com/daeshawn) · [dexthemes.com](https://www.dexthemes.com)
