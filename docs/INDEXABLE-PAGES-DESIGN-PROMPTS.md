# DexThemes Indexable Pages — Design Prompts

These prompts are reusable design briefs. The production implementation must still use the repository’s current catalog, import, auth, API, and plugin contracts.

## 1. In-app Explore and Theme details

Design a production-quality extension of the existing DexThemes three-column app. Preserve its compact dark workspace, theme-driven CSS variables, left catalog sidebar, central faux Codex preview, right variant rail, and existing mobile navigation.

Add an “Explore” group above the account area in the lower-left sidebar with two quiet navigation rows: “Theme collections” and “Guides.” Each row needs a small outlined icon, a concise secondary label, and a subtle chevron. Repeat these destinations beneath the mobile theme grid.

In the main header, remove the outbound share icon and introduce a restrained segmented control with “Chat preview” and “Theme details.” Keep the heart action separate. “Chat preview” shows the current faux Codex workspace. “Theme details” replaces only the center canvas with a scrollable full-page treatment for the selected theme while the sidebar and right variant rail remain in place.

The Details view should feel like an editorial specimen sheet inside a developer tool: oversized theme name, mono provenance label, short summary, contextual labeled “Share theme” button, six palette swatches with hex values, a “What changes” facts grid, three accurate import steps, and a quiet explanatory note. Use the selected theme’s accent, preserve keyboard focus and pressed states, and avoid dashboard-card clutter.

The memorable interaction is the instant center-pane transformation from a simulated workspace into an authored catalog page without leaving the product.

## 2. Public theme landing page

Design an indexable, server-rendered landing page for one Codex theme. It is the canonical destination for search, social cards, and AI citations, while the interactive DexThemes app remains the place to try and import the theme.

Use an “editorial catalog after dark” aesthetic: near-black atmospheric canvas, sharply controlled accent color, large tightly tracked display typography, restrained mono metadata, precise horizontal rules, and generous negative space. Avoid gradients-as-decoration, generic SaaS cards, and an oversized rounded hero container.

The page must visibly include a breadcrumb, one H1, theme summary, source or community author, variant availability, rendered Codex preview image, palette values, what changes, exact copy-and-import instructions, related themes, and an “Open interactive preview” CTA. A contextual “Share theme” action may copy the canonical page URL. Keep all structured claims visible in the interface.

The result should be useful before JavaScript loads and should still look deliberately designed when the selected palette is unusually bright, muted, or low contrast.

## 3. Guide hub and answer-first guides

Design a small documentation layer that belongs to DexThemes rather than looking like a separate docs product.

The guide hub should open with a short answer-first headline and three numbered routes: install a Codex theme, create a custom Codex theme, and troubleshoot an import. Give each route an editorial title, task-oriented summary, and clear “Read the guide” affordance.

Individual guides should start by answering the question in two or three sentences. Follow with numbered steps, compact “Good to know” callouts, and direct links back to the app and relevant theme collections. Use strong typographic rhythm, section rules, mono step numbers, accessible link contrast, and no decorative screenshots unless they teach a real action.

Never describe the import as silent or one-click. The canonical flow is copy, open Codex Settings, choose Appearance, import, and approve.

## 4. Theme collection pages

Design browse pages for Dark, Light, Editor classics, and Community themes under `/collections`.

Lead with intent rather than filter mechanics. Each page should explain who the collection is for, show the number of available themes, and render compact theme specimens using real catalog colors. Every card links to the canonical theme-and-variant page and exposes the theme name, category or author, variant, accent, and a short visible summary when available.

Use an asymmetric editorial introduction followed by a dense but calm catalog grid. Cards should feel like color material samples, not generic product tiles. Preserve excellent scanability across 20–100 themes and collapse to one column without losing hierarchy.

## 5. Responsive and accessibility review

Review the complete DexThemes public and in-app experience at desktop, tablet, and 390px mobile widths.

Confirm:

- The in-app view switch is keyboard operable and exposes pressed state.
- Theme details never reveal protected reward palettes.
- Share actions have visible labels and clear success feedback.
- Mobile users can reach Guides and Collections without a desktop sidebar.
- Public-page headings form one logical outline.
- Every palette value has a text label; color is never the only signal.
- Focus rings remain visible against both dark and light selected themes.
- Motion respects `prefers-reduced-motion`.
- Unknown routes render a real `404` with no indexable soft-error content.

Return concrete visual and interaction corrections, not general taste notes.
