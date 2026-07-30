# Contributing to DexThemes

Thanks for your interest in making DexThemes better. This guide covers the real local workflow, not an aspirational one.

## Submitting a theme

Themes live in `theme-data/dexthemes/` organized by category. To add a new theme:

1. Pick the right category file (e.g. `anime.js`, `games.js`, `originals.js`).
2. Add a `createDexTheme({...})` entry to the array in that file.
3. Every theme needs at minimum:
   - `id` — unique kebab-case string (e.g. `my-cool-theme`)
   - `name` — display name
   - `dark` and/or `light` — variant object with `surface`, `ink`, `accent` colors
4. Test locally (see below) to make sure the preview looks good.
5. Open a pull request with a screenshot of the theme in the preview.

See `docs/theme-submission-example.json` and `docs/themes.schema.json` for the full schema.

### Theme variant colors

Each variant (dark/light) needs these colors:

| Field | Purpose |
|-------|---------|
| `surface` | Main background color |
| `ink` | Primary text color |
| `accent` | Accent/highlight color |
| `diffAdded` | (optional) Color for added code |
| `diffRemoved` | (optional) Color for removed code |
| `skill` | (optional) Color for skill/function highlights |
| `sidebar` | (optional) Auto-derived from surface if omitted |
| `codeBg` | (optional) Auto-derived from surface if omitted |

## Reporting bugs

Open a [GitHub issue](https://github.com/daeshawnballard/dexthemes/issues) with:

- What you expected
- What happened instead
- Browser and OS
- Screenshot if it's a visual bug

If you want a small starter task, look for issues labeled `good first issue` or `help wanted`. Those should avoid OAuth, deployment, and deep layout surgery.

## Running locally

Install dependencies and build the generated shell first.

```sh
git clone https://github.com/daeshawnballard/dexthemes.git
cd dexthemes
npm install
npm run build

# Serve locally (any static server works)
python3 -m http.server 4173
```

Then open http://127.0.0.1:4173/.

For active frontend work, use:

```sh
npm run watch
```

That rebuilds the hashed shell and assets as files change.

`dist/` is generated output only. Build it locally when you need it, but do not commit it.

Root-served static files like `manifest.json`, `robots.txt`, `sitemap.xml`, `llms*.txt`, and the app icons are sourced from `public/` and emitted to the deploy root during `npm run build`. Edit the files under `public/`, not the generated root copies.

### Guides, features, and articles

Public editorial pages are authored in `content/` Markdown. Read [docs/CONTENT.md](docs/CONTENT.md) before editing them. Run `npm run content:generate` after a content change; do not edit `shared/generated-content.js` directly.

The author identity is intentionally consistent across the visible byline and structured data:

- Daeshawn Ballard
- https://x.com/daeshawn

### Backend (Convex)

If you want to work on auth, likes, or community themes:

1. Copy `.env.example` to `.env.local`
2. Fill in the Convex and OAuth values you need for your local workflow
3. Run `npx convex dev` to start the Convex dev server

The frontend reads `window.__CONVEX_SITE_URL` when present; production defaults are baked into the app, but local backend work should use your own dev deployment.

### Local backend environments

Use the website routes when you are checking the public product surface:

- `https://www.dexthemes.com/api/themes`
- `https://www.dexthemes.com/llms.txt`
- `https://www.dexthemes.com/.well-known/openapi.json`

Use the direct Convex base when you are working on authenticated or generator flows:

- theme submission
- likes / flags / unlocks
- OAuth and agent auth
- supporter claims and webhooks

In local frontend work, `window.__CONVEX_SITE_URL` should point at your dev deployment if the feature depends on live backend behavior. Static-only UI work can still be done against the generated shell without running Convex.

For browser auth in production, DexThemes uses secure same-site cookies. In localhost/dev flows you may still see a temporary session token handoff during OAuth callback bootstrap; that is a local development convenience, not the public production contract.

## Validate before opening a PR

Run:

```sh
npm run validate
```

That currently covers:

- focused Node tests for stable product contracts
- doc consistency checks
- full production build

If you touch Convex runtime behavior, also run:

```sh
npx convex codegen
```

## Code style

- No framework — vanilla JS, HTML, CSS
- All user-controlled strings go through `escapeHtml()` before innerHTML
- Prefer small pure helpers for model rules before touching DOM-heavy modules
- Keep state/model, rendering, and side effects in separate modules when possible
- Update docs when you change public behavior or file boundaries

## Pull requests

- Keep PRs focused on one thing
- Include a screenshot for visual changes
- Theme PRs: include both dark and light variants when possible
- If you change onboarding, unlocks, mobile transitions, or webhook behavior, include the validation steps you ran
- Follow the repository pull request template so API/docs changes, screenshots, and validation steps stay easy to review

Thank you for contributing!
