# DexThemes Architecture

This document is the 10-minute mental model for the repo. Read this before you start moving code around.

## Product Shape

DexThemes is a static frontend backed by Convex HTTP routes, plus a stateless MCP app endpoint for the Codex/ChatGPT plugin.

- The website is served from `https://www.dexthemes.com`
- The public browse surface lives at `https://www.dexthemes.com/api/themes`
- Direct category routes live at `/themes`, `/themes/community`, `/themes/codex`, and `/themes/dexthemes/:subgroup`
- Authenticated and generator endpoints are served from the Convex deployment
- The plugin is served from `https://www.dexthemes.com/api/mcp`; its visual resource is bundled from `mcp-app/`
- Build output is a hashed static shell under `dist/assets/*`

The product has three primary user loops:

1. Browse and preview themes
2. Create and submit themes
3. Unlock supporter / achievement themes through actions

## External Dependency Risk

DexThemes is a durable codebase built around a non-durable integration surface: Codex theme import and settings behavior.

Concretely:

- DexThemes does not own the Codex import format
- DexThemes does not control Codex deep-link behavior or settings navigation
- DexThemes can improve the handoff UX, but some final steps still depend on upstream Codex behavior

For this project, that tradeoff is intentional. Contributors should still treat Codex compatibility as an external constraint that can shift independently of this repo.

## Theme Model

Themes are plain objects with a stable shape shared across built-in, DexThemes-pack, and community content.

Core fields:

- `id`: stable slug
- `name`: display name
- `category`: `official`, `dexthemes`, or `community` in the frontend model, normalized to `codex`, `dexthemes`, and `community` on the HTTP catalog surface
- `dark` / `light`: variant payloads
- `accents`: list of selectable accent colors
- `codeThemeId`: string or per-variant object for Codex import compatibility

Useful model helpers live in:

- [`src/theme-contracts.js`](../src/theme-contracts.js)
- [`src/theme-engine.js`](../src/theme-engine.js)

Rule of thumb:

- put pure theme shape logic in `theme-contracts.js`
- put DOM rendering and CSS-variable application in `theme-engine.js`

## Frontend Module Boundaries

The frontend is deliberately split into four layers.

### 1. State, catalog, and config

- [`src/state.js`](../src/state.js)
- [`src/theme-catalog.js`](../src/theme-catalog.js)
- [`src/preview-examples.js`](../src/preview-examples.js)
- [`src/unlocks.js`](../src/unlocks.js)
- [`src/config.js`](../src/config.js)
- [`src/app-state.js`](../src/app-state.js)

Ownership is now split intentionally:

- `theme-catalog.js` owns built-in themes, taxonomy, and DexThemes pack expansion
- `preview-examples.js` owns the center-pane example conversation data
- `unlocks.js` owns unlock definitions and reverse lookup helpers
- `config.js` owns runtime configuration like the Convex base URL
- `app-state.js` owns mutable UI/session state and setters
- `state.js` is a temporary compatibility barrel while callers migrate

Do not add DOM behavior to these modules.

### 2. View rendering

View modules render UI and should avoid network and auth logic where possible.

- [`src/sidebar.js`](../src/sidebar.js)
- [`src/preview-shell.js`](../src/preview-shell.js)
- [`src/preview-chat.js`](../src/preview-chat.js)
- [`src/preview-attribution.js`](../src/preview-attribution.js)
- [`src/leaderboard-view.js`](../src/leaderboard-view.js)
- [`src/mobile-browse.js`](../src/mobile-browse.js)

The shared delegated click/input router now lives in:

- [`src/delegated-actions.js`](../src/delegated-actions.js)

### 3. Side effects and network/auth

These modules own HTTP calls, auth, write flows, and external handoffs.

- [`src/api.js`](../src/api.js)
- [`src/toasts.js`](../src/toasts.js)
- [`src/community-themes-api.js`](../src/community-themes-api.js)
- [`src/theme-submission-api.js`](../src/theme-submission-api.js)
- [`src/moderation-api.js`](../src/moderation-api.js)
- [`src/unlock-api.js`](../src/unlock-api.js)
- [`src/connected-apps.js`](../src/connected-apps.js)
- [`src/auth.js`](../src/auth.js)
- [`src/preview-actions.js`](../src/preview-actions.js)
- [`src/locked-themes.js`](../src/locked-themes.js)

### 4. Orchestration and startup

- [`src/main.js`](../src/main.js)
- [`src/lazy-modules.js`](../src/lazy-modules.js)

`main.js` should stay focused on boot order, global wiring, and viewport branching. If a feature needs its own business logic, it should not be implemented inline in `main.js`.

## Mobile vs Desktop

The app uses a behavioral breakpoint at `1024px`.

- `> 1024px`: desktop, full sidebar + preview layout
- `<= 1024px`: compact/mobile-stack layout with browse / preview / create navigation
- `769px–1024px`: tablet uses the compact layout but gets richer inline handoff guidance
- `<= 768px`: phone uses the most compact handoff and messaging copy

Compact behavior is booted lazily so phones do not pay for desktop preview code on first load.

## Convex and Public API Structure

Public docs live on the website:

- [`/llms.txt`](https://www.dexthemes.com/llms.txt)
- [`/.well-known/openapi.json`](https://www.dexthemes.com/.well-known/openapi.json)
- the repo API guide at [`docs/API.md`](../docs/API.md)

Runtime routes are split between:

- website-facing static/API surface on `www.dexthemes.com`
- direct Convex HTTP endpoints for authenticated and low-level routes

Main backend entry:

- [`convex/http.ts`](../convex/http.ts)

Plugin entry points:

- `api/mcp.js`: stateless Streamable HTTP MCP transport and first JWT verification boundary
- `server/dexthemes-mcp.js`: tool schemas, annotations, output schemas, OAuth challenges, and app resource registration
- `server/theme-tools.js`: pure/search-fetch theme operations, drafting, validation, apply payloads, and GitHub Issue preparation
- `mcp-app/src/`: sandboxed visual theme cards and preview UI
- `convex/http_plugin_routes.ts`: account-bound stats, unlocks, and confirmed publishing
- `convex/pluginAuth.ts`: second JWT/scope verification boundary before Convex account access
- `convex/pluginUsers.ts`: GitHub-identity linking and short-lived hashed plugin sessions
- `convex/connectedApps.ts`: durable installed-integration evidence, safe account projection, and integration-scoped disconnect
- `plugins/dexthemes/`: installable plugin manifest, MCP configuration, assets, and bundled skill

The MCP server can perform public discovery and local computation without authentication. Personal stats/unlocks require `themes:read`; publishing requires `themes:write`. Identity always comes from the verified GitHub-backed bearer token, never a tool argument.

Route families now live in:

- [`convex/http_auth_routes.ts`](../convex/http_auth_routes.ts)
- [`convex/http_theme_routes.ts`](../convex/http_theme_routes.ts)
- [`convex/http_unlock_routes.ts`](../convex/http_unlock_routes.ts)
- [`convex/http_color_me_lucky_routes.ts`](../convex/http_color_me_lucky_routes.ts)
- [`convex/http_helpers.ts`](../convex/http_helpers.ts)

Important backend domains:

- `users.ts`: sessions, OAuth users, API-key users
- `connectedApps.ts`: durable installed-integration connection and bounded usage evidence; never bearer material
- `themes.ts`: community themes, protections, public list shaping
- `unlocks.ts`: unlock state, leaderboard shaping, public supporters
- `supporters.ts`: Buy Me a Coffee claim and revocation logic
- `flags.ts`: reporting and moderation

## Unlocks

Unlock definitions are declared in [`src/unlocks.js`](../src/unlocks.js) as `UNLOCK_THEMES`.

The frontend uses those definitions for:

- locked theme messaging
- deeplink/action routing
- profile progress

The backend uses unlock records to drive:

- supporter state
- public supporter wall
- leaderboard decorations

Revoked supporter benefits are preserved as history but excluded from active UI.

## Account identity and Connected Apps

DexThemes has one GitHub-backed user identity shared by the website and installed integrations. The credentials remain intentionally separate:

- the website uses its existing cookie or legacy website session;
- Codex/ChatGPT MCP keeps the standards-compliant Auth0/JWT verifier and short-lived internal bridge session;
- DeepSeek Harness uses GitHub Device Flow and a one-hour `dxd_…` bearer held only in the running plugin;
- Connected Apps stores no bearer, provider token, credential, prompt, workspace content, or Statsig identifier.

The additive `connectedApps` table is durable account evidence, not a session table. Its first supported row is created only after a successful DeepSeek Device Flow connection. There is no existing-user backfill. The website account view reads a safe projection through `GET /me/connected-apps`; post-Apply activity is separately scoped and explicitly labeled client-reported, while disconnect marks the row inactive and revokes only client-usable sessions mapped to that integration. The installed client retains only a pending random receipt in memory after an ambiguous failure and reuses that exact receipt on retry so replay deduplication prevents double counting.

Cross-environment preference sync is not implemented. Its approved decision design is documented in [`docs/CROSS-ENVIRONMENT-THEME-SYNC.md`](CROSS-ENVIRONMENT-THEME-SYNC.md); preference, suggestion, and application remain separate states, and application stays explicit and reversible.

## Performance Shape

Startup is intentionally staged.

- hashed assets are immutable cached
- service worker precaches the app shell
- compact view avoids desktop preview startup work
- builder, auth, leaderboard, and preview actions are lazy-loaded
- telemetry is deferred and skipped on constrained or compact sessions

There is still a separate performance follow-up track for deeper desktop chunk consolidation and sidebar deferral. That is intentionally not mixed into the first open-source-readiness milestone.

## Stylesheet Ownership

The stylesheet is now split by domain behind a manifest entry:

- [`styles/index.css`](../styles/index.css): import manifest used by the build
- [`styles/tokens.css`](../styles/tokens.css): variables and design tokens
- [`styles/base.css`](../styles/base.css): reset and shared primitives
- [`styles/layout.css`](../styles/layout.css): shell, main area, and panel layout
- [`styles/sidebar.css`](../styles/sidebar.css): sidebar, search, categories, auth chrome
- [`styles/preview.css`](../styles/preview.css): preview window and attribution surfaces
- [`styles/builder.css`](../styles/builder.css): builder panel and submission surfaces
- [`styles/mobile.css`](../styles/mobile.css): responsive and compact/mobile flows
- [`styles/overlays.css`](../styles/overlays.css): overlays, leaderboard, profile, toasts, modals

## Safe Next Refactors

These are the safest remaining extractions:

1. `src/api.js`
2. `convex/http.ts`
3. delegated UI actions in `index.html` and runtime-generated markup
4. broader pure/browser coverage for compact mobile flows and supporter webhook behavior

When refactoring:

- move pure rules into small testable modules first
- keep rendering modules DOM-focused
- keep network/auth side effects separate from view code
- avoid broad rewrites that collapse working module boundaries back together
