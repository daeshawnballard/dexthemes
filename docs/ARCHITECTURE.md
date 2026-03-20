# DexThemes Architecture

This document is the 10-minute mental model for the repo. Read this before you start moving code around.

## Product Shape

DexThemes is a static frontend backed by Convex HTTP routes.

- The website is served from `https://www.dexthemes.com`
- The public browse surface lives at `https://www.dexthemes.com/api/themes`
- Direct category routes live at `/themes`, `/themes/community`, `/themes/codex`, and `/themes/dexthemes/:subgroup`
- Authenticated and generator endpoints are served from the Convex deployment
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

- [`src/theme-contracts.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/theme-contracts.js)
- [`src/theme-engine.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/theme-engine.js)

Rule of thumb:

- put pure theme shape logic in `theme-contracts.js`
- put DOM rendering and CSS-variable application in `theme-engine.js`

## Frontend Module Boundaries

The frontend is deliberately split into four layers.

### 1. State, catalog, and config

- [`src/state.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/state.js)
- [`src/theme-catalog.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/theme-catalog.js)
- [`src/preview-examples.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-examples.js)
- [`src/unlocks.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/unlocks.js)
- [`src/config.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/config.js)
- [`src/app-state.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/app-state.js)

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

- [`src/sidebar.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/sidebar.js)
- [`src/preview-shell.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-shell.js)
- [`src/preview-chat.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-chat.js)
- [`src/preview-attribution.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-attribution.js)
- [`src/leaderboard-view.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/leaderboard-view.js)
- [`src/mobile-browse.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/mobile-browse.js)

The shared delegated click/input router now lives in:

- [`src/delegated-actions.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/delegated-actions.js)

### 3. Side effects and network/auth

These modules own HTTP calls, auth, write flows, and external handoffs.

- [`src/api.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/api.js)
- [`src/toasts.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/toasts.js)
- [`src/community-themes-api.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/community-themes-api.js)
- [`src/theme-submission-api.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/theme-submission-api.js)
- [`src/moderation-api.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/moderation-api.js)
- [`src/unlock-api.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/unlock-api.js)
- [`src/auth.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/auth.js)
- [`src/preview-actions.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-actions.js)
- [`src/locked-themes.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/locked-themes.js)

### 4. Orchestration and startup

- [`src/main.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/main.js)
- [`src/lazy-modules.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/lazy-modules.js)

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
- the repo API guide at [`docs/API.md`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/docs/API.md)

Runtime routes are split between:

- website-facing static/API surface on `www.dexthemes.com`
- direct Convex HTTP endpoints for authenticated and low-level routes

Main backend entry:

- [`convex/http.ts`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http.ts)

Route families now live in:

- [`convex/http_auth_routes.ts`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http_auth_routes.ts)
- [`convex/http_theme_routes.ts`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http_theme_routes.ts)
- [`convex/http_unlock_routes.ts`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http_unlock_routes.ts)
- [`convex/http_color_me_lucky_routes.ts`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http_color_me_lucky_routes.ts)
- [`convex/http_helpers.ts`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http_helpers.ts)

Important backend domains:

- `users.ts`: sessions, OAuth users, API-key users
- `themes.ts`: community themes, protections, public list shaping
- `unlocks.ts`: unlock state, leaderboard shaping, public supporters
- `supporters.ts`: Buy Me a Coffee claim and revocation logic
- `flags.ts`: reporting and moderation

## Unlocks

Unlock definitions are declared in [`src/unlocks.js`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/unlocks.js) as `UNLOCK_THEMES`.

The frontend uses those definitions for:

- locked theme messaging
- deeplink/action routing
- profile progress

The backend uses unlock records to drive:

- supporter state
- public supporter wall
- leaderboard decorations

Revoked supporter benefits are preserved as history but excluded from active UI.

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

- [`styles/index.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/index.css): import manifest used by the build
- [`styles/tokens.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/tokens.css): variables and design tokens
- [`styles/base.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/base.css): reset and shared primitives
- [`styles/layout.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/layout.css): shell, main area, and panel layout
- [`styles/sidebar.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/sidebar.css): sidebar, search, categories, auth chrome
- [`styles/preview.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/preview.css): preview window and attribution surfaces
- [`styles/builder.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/builder.css): builder panel and submission surfaces
- [`styles/mobile.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/mobile.css): responsive and compact/mobile flows
- [`styles/overlays.css`](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/styles/overlays.css): overlays, leaderboard, profile, toasts, modals

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
