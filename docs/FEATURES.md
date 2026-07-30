# DexThemes — Features, Benefits & Value

## Core Product

### Theme Gallery & Browser
- **100+ curated themes** across official Codex themes, DexThemes originals, and community submissions
- **Categorized browsing**: Official (Codex built-in), DexThemes (anime, games, movies, comics, zodiacs, lunar animals, companies, originals, unlockables), Community
- **Collapsible sidebar** with category tree, subgroup folders, and theme count badges
- **Search** with debounced input across all theme names
- **Filter by variant**: All themes, Dark only, Light only, Both variants
- **Sort options**: Default, Trending (by copies), Newest, A-Z, Z-A
- **Subgroup pin/unpin**: Double-click to pin subgroups open; single-click for accordion behavior

### Theme Preview
- **Live preview window** styled as a Codex-like chat interface
- **Dark/light variant toggle** for themes with both variants
- **Multiple accent color support** — click accent dots to switch
- **Fullscreen, minimize, close, reopen** window controls
- **Animated onboarding chat** that walks new users through the app on first visit

### Apply in Codex (Primary KPI)
- **One-click copy** of `codex-theme-v1:` import string to clipboard
- **Validated format**: `codeThemeId` uses base theme name (e.g., `"codex"`), `variant` field handles dark/light — confirmed working in Codex's Import Theme dialog
- **Works for all themes**: Official, DexThemes packs, community submissions, and builder-created themes

### Theme Builder
- **Full color customization**: Surface, ink, accent, sidebar, code background, diff added/removed, skill
- **Dark/light variant selector**
- **Contrast slider** (30-100)
- **Live preview** updates in real-time as you adjust colors
- **Color Me Lucky** — randomize all colors with one click (three-star icon)
- **Reset** to defaults
- **Copy theme code** or **Apply in Codex** directly from builder
- **Submit to community** with name validation, content moderation, and color protection
- **Code of Conduct prompt** — shown once on first builder visit after sign-in
- **Add variant for existing theme** — author can open builder pre-filled to add the missing dark/light variant

---

## Social & Community

### Authentication
- **GitHub sign-in** via OAuth
- **Agent registration** for API-based access
- **Session management** with expiring tokens that fall back to signed-out UI when invalid
- **User menu** with profile, achievements, leaderboard, logout

### Likes
- **Like any theme** (requires sign-in — shows friendly chat prompt if not signed in)
- **Like counts** displayed on theme cards and OG share images
- **One like per user per theme** (enforced server-side)

### Sharing
- **Share on X** generates tweet with vanity URL (e.g., `dexthemes.com/terminator-future-war/dark`)
- **Dynamic OG cards** — each theme gets a custom 1200x630 PNG with code preview, color palette, theme name, and like count
- **Edge-cached OG images** (24h on Vercel CDN, 7-day stale-while-revalidate)
- **Cache warm-up system** — `npm run warm-cache` pre-populates edge cache for all ~200 theme URLs; also runs daily via Vercel cron at 6am UTC with secret-gated API access

### Variant Request System
- **Non-authors** can request the missing variant ("Request Light Variant") — one request per user per theme, tracked in localStorage + backend
- **Authors** see a card: "Complete the set — Add Light Variant" with request count
- **Add variant flow** opens the builder pre-filled with the theme's name and existing accent, targeting the opposite variant

### Leaderboard
- **Monthly leaderboard** ranking theme creators by total copies
- **Tabs**: This Month / All Time
- **Accessible** from the user menu
- **Voided stats** for themes removed by moderation

---

## Gamification & Unlockables

### 11 Unlockable Themes
Each tied to a specific user action — creates a collection incentive loop:

| Action | Unlock Theme | Description |
|--------|-------------|-------------|
| Buy a Coffee | **Patron** | Opulent gold/luxury |
| Create a Theme | **Seraphim** | Angelic/ethereal |
| Share on X | **Mint Condition** | Money/prosperity greens |
| Sign In | **Cupid's Code** | Romantic rose pinks |
| Like a Theme | **Heartbeat** | Cherry-red pulse |
| Top 10 Monthly | **Summit** | Alpine slate with gold |
| Use the API | **The Builder** | Industrial workshop orange |
| Color Me Lucky | **Kaleidoscope** | Vibrant prismatic rainbow |
| AI Agent Usage | **Agent Claw** | PCB green traces |
| Install as PWA | **Homebase** | Warm amber/wood tones |
| Complete Both Variants | **Yin & Yang** | Pure black/white duality |

### Achievement System
- **Profile panel** shows unlocked themes and progress
- **Locked themes** shown with lock icon in sidebar
- **Deeplinks** in unlock notifications navigate to the unlocked theme

---

## Safety & Moderation

### Anti-Abuse Flag System
- **Account age gate**: Must be 24h+ old to flag
- **Daily flag cap**: 3 flags per user per day
- **No self-flagging**: Can't flag your own themes
- **Automated moderation at threshold**: When a theme hits 5 flags, the system re-runs content moderation (name, ID, summary) — if clean, flags reset to 0 (false report protection); if violation confirmed, theme auto-removed
- **Color release on removal**: Protected color combinations freed when flagged theme is removed
- **Stat voiding**: Leaderboard stats from removed themes are voided
- **Content moderation**: Checks theme name, ID, and summary against profanity/slur list on submission

### Color Protection
- **Official Codex, DexThemes originals, and unlock theme color palettes** are protected — submissions that are too similar (< 15 distance across surface/ink/accent) are rejected
- **Dual enforcement**: Client-side warning + server-side rejection
- **Community submissions stay flaggable**: new community themes are not auto-protected from reports

---

## Technical Platform

### API
- **Public theme catalog API** at `https://www.dexthemes.com/api/themes`
- **Authenticated/Convex API** at `https://acrobatic-corgi-867.convex.site/`
- **Preferred public docs surface**: `https://www.dexthemes.com/api/themes`, `https://www.dexthemes.com/llms.txt`, `https://www.dexthemes.com/.well-known/openapi.json`
- **Endpoints**: `/themes` (all themes + create on POST), `/themes/community`, `/themes/codex`, `/themes/dexthemes`, `/themes/dexthemes/:subgroup`, `/themes/likes/counts`, `/themes/flag`, `/themes/request-variant`, `/themes/add-variant`, `/leaderboard`, `/auth/agent`, `/api/color-me-lucky`
- **API key auth** for programmatic access (`dxt_` prefixed keys)
- **Rate limiting**: Sliding window per IP and per user
- **LLMs.txt** and **OpenAPI spec** for AI/agent discoverability

### Performance
- **Theme flash prevention**: Inline `<head>` script reads cached theme colors from localStorage before first paint
- **Immutable hashed assets** for the generated app shell and split JS/CSS chunks
- **Service worker app-shell caching** for better repeat visits and install resilience
- **Lazy-loaded frontend modules** for builder, auth, leaderboard, and preview actions
- **Debounced search** (200ms)

### Mobile
- **Responsive layout** at 1024px breakpoint
- **Bottom navigation**: Browse, Preview, Create
- **Mobile browse cards** with category/subgroup switching
- **Mobile submit flow**

### SEO & Discoverability
- **Truthful structured data** (JSON-LD) for the app, theme pages, guides, breadcrumbs, images, and collections
- **Server-rendered theme pages** with visible content, rendered previews, accurate import steps, and related themes
- **Real route status**: unknown themes and unavailable variants return 404
- **Canonical URLs**: `www.dexthemes.com/:themeId/:variant`
- **Answer-first guides and collections** under `/guides` and `/collections`
- **Live sitemap** combines the checked-in catalog with published community themes
- **IndexNow publication hook** announces new community theme pages
- **llms.txt** and **llms-full.txt** for AI agent discovery
- **OpenAPI specification** at `/.well-known/openapi.json`

---

## Value Proposition

### For Users
- Browse and discover themes without leaving the browser
- One-click apply to Codex — no manual color picking
- Both dark and light variants for most themes
- Community-driven — request variants, submit your own, vote with likes

### For Theme Creators
- Instant publishing with moderation
- See copy counts, likes, and leaderboard ranking
- Variant request signals tell you what users want
- Unlock exclusive themes by participating

### For the Platform
- **Copy count tracking** — knows which themes people are actually using (Codex doesn't track this)
- **Like data** — engagement signal for trending/quality
- **Unlock funnel** — incentivizes sign-in, sharing, creating, and returning
- **API access** — enables agents, bots, and integrations to browse/apply themes programmatically
- **OG cards** — every share is a branded visual ad for DexThemes
