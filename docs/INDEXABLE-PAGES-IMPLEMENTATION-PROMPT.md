# DexThemes Indexability and AEO — Master Implementation Prompt

Implement the approved DexThemes indexable-pages concept in the existing repository. Treat the current app, catalog, API, plugin, OAuth, theme import, and community publication contracts as additive constraints.

## Outcome

Turn DexThemes from a primarily single-page gallery into:

- A complete interactive app
- One real indexable page for every valid public theme variant
- Answer-first guide and collection pages
- A live sitemap that includes static and community themes
- Accurate structured data and agent-facing documentation
- Measurable conversion paths from search, social, and AI referrals

## Required implementation

### 1. Real theme pages

Upgrade `/:theme/:variant` from a redirect shell to meaningful server-rendered HTML. Every valid page must include:

- Unique title and description
- One H1
- Summary and source or author
- Variant availability
- Rendered preview image
- Palette details
- Exact import instructions
- Related themes
- “Open interactive preview” CTA
- Contextual share action
- Canonical URL, Open Graph, and Twitter metadata

### 2. Correct routing

- Remove self-referencing refresh behavior.
- Return `404` for unknown theme IDs, invalid variants, and unavailable variants.
- Preserve legacy public aliases with a permanent redirect to the canonical public identity.
- Use `https://www.dexthemes.com` for every canonical, sitemap, and structured-data URL.
- Preserve root/query SPA navigation and all API rewrites.
- Keep `/themes` as the API namespace; use `/collections` for editorial category pages.

### 3. Live sitemap and IndexNow

- Generate the static sitemap from the checked-in catalog.
- Serve a live sitemap that merges current published community themes.
- Include guides, collections, policy pages, and only valid theme variants.
- Use real catalog dates for `lastmod`.
- Schedule an IndexNow notification only after a community publication mutation commits.
- Host the matching IndexNow verification key at the canonical origin.
- Treat IndexNow failure as non-blocking for publication.

### 4. Answer-first guides and collections

Add:

- `/guides`
- `/guides/how-to-install-a-codex-theme`
- `/guides/create-a-custom-codex-theme`
- `/guides/codex-theme-import-troubleshooting`
- `/collections`
- `/collections/dark`
- `/collections/light`
- `/collections/editor-classics`
- `/collections/community`

Every route must return meaningful server HTML, internal links, a canonical URL, and a real `404` for unknown slugs.

### 5. Truthful structured data

- Remove unsupported aggregate ratings.
- Add accurate homepage `WebSite` and `WebApplication` data.
- Add theme-page `WebPage`, `BreadcrumbList`, and `ImageObject` data.
- Add appropriate page and breadcrumb data to guides and collections.
- Keep every structured claim visible on its page.
- Include verified GitHub and X profiles in `sameAs`.

### 6. AEO precision

Near the top of agent-facing documentation, directly answer:

- What is DexThemes?
- Is it official?
- How do imports work?
- Is it free and open source?
- Does it modify Codex files?
- What is the difference between Codex, curated DexThemes, and Community themes?

Explicitly allow OAI-SearchBot in `robots.txt`. Keep `llms.txt` supplemental and make its URLs and claims accurate.

### 7. Discovery and measurement

- Add relevant GitHub repository topics.
- Link README documentation to the public guide and collection routes.
- Track in-app Details views, Explore navigation, public-theme-page entries, theme-page conversions, and AI/search referral classes without collecting direct personal identifiers.
- Document the Search Console and referral metrics to review after release.

## Approved in-app behavior

- Add bottom-left Explore links for Theme collections and Guides.
- Replace the header share icon with a Chat preview / Theme details view switch.
- Render the complete theme explanation inside the center pane.
- Keep Share theme contextual inside Theme details.
- Preserve the right variant rail and accurate Copy theme / Settings handoff.
- Preserve the X-specific achievement flow separately.
- Never reveal a locked theme’s palette through Details.

## Verification gates

- Full repository validation passes.
- Every static catalog theme’s available variants return useful `200` HTML.
- Unknown themes and unavailable variants return `404`.
- Community pages and community sitemap entries are covered with deterministic mocked tests.
- Legacy aliases redirect to canonical public identities.
- Homepage schema contains no aggregate rating.
- App preview, Details, Explore, Guides, Collections, and public theme pages are visually checked in WebKit at desktop and 390px mobile widths.
- No console errors.
- Existing API, plugin, auth, builder, import-string, OG image, and community submission tests remain green.

## Delivery boundary

Do not silently deploy or merge. Produce source, generated artifacts, tests, screenshots, and a clear environment-variable or external-configuration handoff for anything that cannot be completed from the repository alone.
