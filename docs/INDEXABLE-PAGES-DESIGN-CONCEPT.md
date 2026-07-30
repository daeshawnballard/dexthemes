# DexThemes Indexable Pages — Design Concept

## Concept: the catalog has two doors

DexThemes should feel like one product even though people arrive in two different ways:

1. **Inside the app**, a person is choosing a theme. They should stay in the three-column workspace and switch the center pane between **Chat preview** and **Theme details**.
2. **From search, social, or an AI answer**, a person needs a complete public page that explains the theme before asking them to open the interactive app.

These are two presentations of the same catalog record, not two competing products.

## Information architecture

Use one canonical origin: `https://www.dexthemes.com`.

| Surface | Production route | Purpose |
| --- | --- | --- |
| App | `/` | Browse, preview, create, like, and import themes |
| Public theme page | `/:theme/:variant` | Indexable theme explanation and share destination |
| Guide hub | `/guides` | Answer-first learning paths |
| Install guide | `/guides/how-to-install-a-codex-theme` | Accurate copy, Settings, Appearance, Import flow |
| Creation guide | `/guides/create-a-custom-codex-theme` | Theme-building workflow |
| Troubleshooting | `/guides/codex-theme-import-troubleshooting` | Symptom-first import help |
| Collection hub | `/collections` | Browse by intent |
| Dark collection | `/collections/dark` | Themes with a dark variant |
| Light collection | `/collections/light` | Themes with a light variant |
| Editor classics | `/collections/editor-classics` | Familiar editor palettes |
| Community | `/collections/community` | Published community work |

`/themes` remains the existing API namespace, so editorial category pages use `/collections`.

## In-app experience

### Sidebar

Add an **Explore** section above account and project credits in the lower-left sidebar:

- Theme collections
- Guides

On compact layouts, repeat these destinations beneath the mobile theme grid.

### Center pane

Replace the header share icon with a two-option view control:

- **Chat preview** keeps the current faux Codex workspace.
- **Theme details** replaces the center canvas with a scrollable, theme-colored page.

Theme details contain:

- Classification and variant availability
- Theme name and summary
- A labeled, contextual **Share theme** action
- Palette swatches and exact color values
- “What changes” facts
- Accurate import steps
- A note explaining the role of the public URL

The right-hand variant and import panel remains the action authority.

### Sharing

“Theme details” and “Share theme” are different concepts, but they are not sibling navigation buttons.

- **Theme details** changes the current in-app view.
- **Share theme** copies or invokes the system share sheet for the canonical public URL.
- The existing X-specific unlock flow remains available only where that achievement explicitly asks for an X share.

## Public page aesthetic

Direction: **editorial catalog after dark**.

- Near-black canvas with the selected theme’s accent used sparingly
- Large, tightly tracked display type for the theme name
- Fine mono labels for provenance, variant, and section numbers
- A real rendered Codex preview image rather than decorative illustration
- Palette values treated like material samples
- Long-form sections separated by precise rules and generous negative space
- Compact, useful cards for related themes

The page should feel authored and catalog-specific, not like a generic SaaS landing page.

## Public-page hierarchy

1. Persistent DexThemes header with Collections, Community, and Guides
2. Breadcrumb
3. Classification, theme name, summary, author/source, and variant
4. Primary **Open interactive preview** CTA
5. Rendered theme preview
6. Palette details
7. What changes
8. Exact install steps
9. Related themes
10. Product truth and attribution footer

## Product truth

Every surface must say what the product actually does:

1. DexThemes copies a `codex-theme-v1` import string.
2. It can open general Codex Settings on supported desktop systems.
3. The user chooses **Appearance → Import theme**, pastes, and approves the final change.
4. DexThemes does not silently modify Codex files or claim a public one-click apply API.

## Search and answer-engine principles

- Every indexable page returns meaningful HTML without requiring JavaScript.
- Unknown themes and unavailable variants return `404`.
- Temporary community-catalog failures return a retryable server error, not a fake theme page.
- Structured data repeats only claims visible on the page.
- The sitemap contains only useful `200` pages and uses the canonical `www` origin.
- Agent docs answer what DexThemes is, whether it is official, how import works, licensing, file behavior, and catalog provenance near the top.

## Approved prototype

The isolated interaction prototype remains in:

`product-concepts/dexthemes-indexable-pages-2026-07-29/`

It is a design reference, not a runtime dependency.
