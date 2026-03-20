# DexThemes

> The theme gallery for [Codex](https://openai.com/codex). Browse, preview, and hand off beautiful themes to Codex in a couple of clicks.

<p align="center">
  <a href="https://dexthemes.com">
    <img src="logos/logo-github-transparent.png" alt="DexThemes" width="200">
  </a>
</p>

<p align="center">
  <a href="https://dexthemes.com">dexthemes.com</a> · <a href="https://x.com/DexThemes">@DexThemes</a> · <a href="https://buymeacoffee.com/daeshawn">Support the project</a>
</p>

---

## What it does

- **Browse 100+ themes** across anime, video games, movies, comics, zodiacs, and more
- **Live preview** — see how each theme looks with real code, dark and light variants side by side
- **Codex handoff** — copies the import string and opens Codex Settings for you
- **Create your own** — the built-in theme builder lets you design and share custom themes
- **Color Me Lucky** — random theme generator with 6 color harmonies and ~5000+ name combos
- **Community themes** — sign in with GitHub and submit your creations
- **Leaderboard** — monthly and all-time creator rankings

## Quick start

Static site frontend with a generated, hashed app shell.

```sh
git clone https://github.com/daeshawnballard/dexthemes.git
cd dexthemes
npm install
npm run build
python3 -m http.server 4173
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/) and you're in.

## Read this first

- [Architecture guide](docs/ARCHITECTURE.md)
- [Contributing guide](CONTRIBUTING.md)
- [Open source readiness plan](docs/OPEN_SOURCE_READINESS.md)
- [API guide](docs/API.md)

## Project structure

```
index.html                 → App shell
templates/                 → Source templates for the generated shell and service worker
  index.template.html      → Source template for the generated shell
  sw.template.js           → Source template for the generated service worker
styles/                    → CSS split by domain (tokens, layout, sidebar, preview, builder, mobile, overlays)
  index.css                → Manifest entry for domain-scoped stylesheets
src/                       → Frontend source modules
  main.js                  → App entry point
  preview-shell.js         → Preview rendering, shell, and window controls
  preview-actions.js       → Preview-side effects, unlock actions, and external handoffs
  preview-chat.js          → Preview delighters, handoff cards, system prompts
  preview-attribution.js   → Theme attribution and reporting UI
  theme-contracts.js       → Pure theme-shape helpers and import-string builder
  theme-attribution-model.js → Pure author attribution rules
  api.js                   → Frontend API client compatibility barrel
dist/assets/               → Hashed frontend build output served in production
scripts/build.mjs          → Build pipeline for hashed assets + shell generation
theme-data/dexthemes/      → Theme packs organized by category
  helpers.js               → createDexTheme() and registerDexThemesPack()
  anime.js                 → Anime-inspired themes (Bleach, Naruto, JJK, etc.)
  games.js                 → Video game themes
  movies.js                → Movie-inspired themes
  comics.js                → Comic book themes
  zodiacs.js               → Zodiac sign themes
  lunar.js                 → Lunar animal themes
  originals.js             → Original DexThemes designs
  liger-zero.js            → Liger Zero pack (Zoids)
  supporter.js             → Unlockable themes
convex/                    → Backend (Convex) — auth, likes, community themes
  schema.ts                → Database schema
  users.ts                 → User management and sessions
  likes.ts                 → Like/unlike system
  themes.ts                → Community theme submissions
  http.ts                  → HTTP route composition entrypoint
api/                       → Vercel edge/serverless endpoints (`/api/themes`, OG, share, warm-cache)
docs/themes.schema.json    → JSON schema for theme submissions
docs/theme-submission-example.json → Example contribution payload
```

## Theme format

Codex themes use this import string format:

```
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#0169cc","contrast":60,"fonts":{"code":null,"ui":null},"ink":"#fcfcfc","opaqueWindows":true,"semanticColors":{"diffAdded":"#00a240","diffRemoved":"#e02e2a","skill":"#b06dff"},"surface":"#111111"},"variant":"dark"}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to submit themes, report bugs, and set up the backend locally.

If you want a small place to start, prefer issues labeled `good first issue` or `help wanted`. The intended early-contributor surface is theme packs, docs, pure helpers, and focused UI polish rather than auth or deployment plumbing.

## Backend

The backend runs on [Convex](https://convex.dev) and handles:

- GitHub OAuth (PKCE + HMAC-signed state)
- Agent self-registration and API key issuance (`/auth/agent` preferred)
- Browser session management (HttpOnly same-site cookies in production, token handoff only for localhost/dev)
- Community theme submissions and moderation
- Like/unlike with optimistic UI
- Apply tracking
- Color Me Lucky API endpoints

Copy [.env.example](.env.example) to `.env.local` to get started. All secrets live in Convex environment variables — nothing is committed to the repo.

## Dependency Note

DexThemes is built on top of Codex theme import and settings behavior that this repo does not control. That is an intentional tradeoff for the project: the codebase is maintainable on its own terms, but Codex compatibility can still shift independently of DexThemes.

## Security

- All OAuth state parameters are HMAC-SHA256 signed and time-limited
- Session tokens are 256-bit cryptographically random hex strings
- CORS is environment-gated (localhost only in development)
- All user input is escaped through `escapeHtml()` before rendering
- No secrets in the codebase — environment variables only

## Validation

Use the contributor-safe validation path before opening a PR:

```sh
npm run validate
```

That runs the lightweight contract tests, documentation checks, and production build.

For visible-flow browser coverage, run:

```sh
npm run smoke:browser
```

## Support

DexThemes is free and open source. If it's useful to you:

- [Buy me a coffee](https://buymeacoffee.com/daeshawn) — supporters get exclusive themes and a badge
- [Sponsor on GitHub](https://github.com/sponsors/daeshawnballard)
- Star the repo — it helps others find it
- Share a theme on X — every share helps grow the community

## License

[MIT](LICENSE) — built with love by [@Daeshawn](https://x.com/daeshawn).

Community-built. Not affiliated with OpenAI.
