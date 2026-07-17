# DexThemes API

DexThemes exposes two public-facing surfaces:

- the website/published docs surface on `https://www.dexthemes.com`
- the direct Convex HTTP surface on `https://acrobatic-corgi-867.convex.site`

Use the website for public browsing and discovery docs. Use the direct Convex base URL for authenticated and generator HTTP examples.

## Public discovery surface

- Theme catalog: `https://www.dexthemes.com/api/themes`
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

- Browser users on [dexthemes.com](https://dexthemes.com) authenticate with a secure session cookie after OAuth sign-in.
- Agents and scripts authenticate with a `dxt_...` API key issued only after GitHub sign-in and send it in `Authorization: Bearer <token>`.
- The Codex/ChatGPT plugin uses OAuth 2.1 bearer tokens with GitHub as the upstream identity. The resource server validates signature, issuer, audience, expiry, and `themes:read` or `themes:write` scope.
- Localhost/dev-only OAuth bootstrap may still pass a temporary session token through the callback hash so the browser can convert it into the local session mode. That is not the intended public production contract.

Account identity is derived by the server. No authenticated endpoint or MCP tool accepts `userId`, `ownerId`, author identity, an email address, or a token in its JSON arguments.

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

For browser use on [dexthemes.com](https://dexthemes.com), the app authenticates with its secure session cookie after sign-in.
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
  "message": "Theme submitted to DexThemes! View it at https://dexthemes.com"
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

DexThemes applies IP and user-based rate limiting on sensitive routes. Public reads are intentionally generous; authenticated writes are tighter.

## Codex/ChatGPT plugin

- MCP endpoint: `https://www.dexthemes.com/api/mcp`
- Protected-resource metadata: `https://www.dexthemes.com/.well-known/oauth-protected-resource`
- Public tools: theme search/fetch, drafting, validation, full Codex-style previews, apply preparation, daily/weekly/monthly/all-time leaderboards, and GitHub Issue preparation
- OAuth `themes:read`: personal creator stats, current ranks, daily/weekly win history, achievements, and unlocked reward-theme previews
- OAuth `themes:write`: confirmed public theme submission

`submit_theme` is the only plugin tool that creates public state. It is app-only and accepts a short-lived confirmation token bound to the exact reviewed payload and current OAuth token; only the review app receives that token in model-hidden metadata. It re-validates server-side, publishes under the GitHub identity derived from the signed token, and cannot edit or delete another theme.

## License

The Color Me Lucky API is free to use. The generated themes and import strings are yours to keep. Attribution is appreciated but not required.

Built by [@Daeshawn](https://x.com/daeshawn) · [dexthemes.com](https://www.dexthemes.com)
