import {
  CANONICAL_ORIGIN,
  COLLECTION_ROUTES,
  EDITOR_CLASSIC_THEME_IDS,
  GUIDE_ROUTES,
  getCatalogThemeId,
  getCatalogThemeVariants,
} from "./seo.js";

const SITE_NAME = "DexThemes";
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/logos/logo-github-transparent.png`;
const SAME_AS = [
  "https://github.com/daeshawnballard/dexthemes",
  "https://x.com/DexThemes",
];

export const GUIDE_PAGES = Object.freeze({
  "how-to-install-a-codex-theme": {
    eyebrow: "Getting started",
    title: "How to install a Codex theme",
    description: "Copy a DexThemes import string, open Codex Settings, and approve the theme from Appearance.",
    answer: "Choose a theme and variant in DexThemes, copy its import string, then open Codex Settings. In Appearance, choose Import theme, paste the string, and approve the change.",
    steps: [
      {
        title: "Choose a theme and variant",
        body: "Open any theme in DexThemes and select an available dark or light variant. The right panel always shows which variant is active.",
      },
      {
        title: "Copy the import string",
        body: "Use Copy theme & open Settings on desktop, or Copy theme on compact layouts. DexThemes copies the complete codex-theme-v1 payload.",
      },
      {
        title: "Open Appearance",
        body: "DexThemes can open general Codex Settings. Choose Appearance yourself; Codex does not currently expose a public Appearance-specific deep link.",
      },
      {
        title: "Import and approve",
        body: "Choose Import theme, paste the copied string, review the result, and approve the appearance change in Codex.",
      },
    ],
    calloutTitle: "Does DexThemes modify Codex files?",
    calloutBody: "No. DexThemes prepares and copies the import payload. Codex owns the final import and the user approves the appearance change.",
    related: [
      { href: "/collections/dark", label: "Browse dark themes" },
      { href: "/collections/light", label: "Browse light themes" },
    ],
  },
  "create-a-custom-codex-theme": {
    eyebrow: "Theme creator",
    title: "Create a custom Codex theme",
    description: "Turn a visual direction into a complete Codex palette, preview it in context, and publish it when it is ready.",
    answer: "Start with a surface, readable ink, and one purposeful accent. Complete the semantic colors, preview the palette in the DexThemes workspace, then copy it for private use or sign in to publish an original community theme.",
    steps: [
      {
        title: "Name the visual direction",
        body: "Describe the mood or working style before choosing colors. A clear direction keeps the palette coherent and makes the public summary useful.",
      },
      {
        title: "Build the core contrast",
        body: "Choose the main surface and ink first. Verify that navigation, body copy, code, and controls remain legible before adding accents.",
      },
      {
        title: "Assign semantic colors",
        body: "Use distinct colors for actions, additions, removals, and skills. The preview shows these roles together so clashes are visible early.",
      },
      {
        title: "Preview, copy, or publish",
        body: "Test the palette in the faux Codex conversation. Copy the import for your own use, or sign in with GitHub to review and publish an original community theme.",
      },
    ],
    calloutTitle: "What can be published?",
    calloutBody: "Community names and summaries must use original wording. DexThemes also protects built-in, curated, and reward palettes from direct cloning.",
    related: [
      { href: "/collections/community", label: "See community themes" },
      { href: "/", label: "Open the theme creator" },
    ],
  },
  "codex-theme-import-troubleshooting": {
    eyebrow: "Troubleshooting",
    title: "Fix a Codex theme import",
    description: "Diagnose the copy-and-import handoff by symptom without guessing or editing Codex files directly.",
    answer: "Most import problems come from an incomplete clipboard payload, choosing an unavailable variant, or stopping in Settings before opening Appearance. Copy the theme again, confirm the full codex-theme-v1 prefix, then import from Appearance.",
    steps: [
      {
        title: "Nothing was pasted",
        body: "Allow clipboard access or use the selectable fallback string, then copy again. Compact layouts intentionally copy without trying to open a desktop deep link.",
      },
      {
        title: "Codex rejected the string",
        body: "Confirm the payload begins with codex-theme-v1: and was copied in full. Avoid adding quotation marks or copying only the JSON portion.",
      },
      {
        title: "The requested variant is missing",
        body: "Return to DexThemes and choose a variant shown as available. Theme URLs for unavailable variants correctly return 404.",
      },
      {
        title: "Settings opened to the wrong section",
        body: "Choose Appearance manually, then Import theme. DexThemes opens general Settings because there is no documented public Appearance-specific apply route.",
      },
    ],
    calloutTitle: "Still stuck?",
    calloutBody: "Open a GitHub issue with the theme URL, variant, Codex version, and the stable error text. Never include tokens, account details, or private screenshots.",
    related: [
      { href: "/guides/how-to-install-a-codex-theme", label: "Review the install steps" },
      { href: "https://github.com/daeshawnballard/dexthemes/issues", label: "Report an issue", external: true },
    ],
  },
});

const COLLECTION_DEFINITIONS = Object.freeze({
  dark: {
    eyebrow: "Low-glare collection",
    title: "Dark Codex themes",
    description: "Dark palettes for focused work, from true-black minimalism to warm editor classics.",
    filter: (theme) => Boolean(theme.dark),
    variant: "dark",
  },
  light: {
    eyebrow: "Daylight collection",
    title: "Light Codex themes",
    description: "Bright workspaces with measured contrast, clear hierarchy, and confident accent colors.",
    filter: (theme) => Boolean(theme.light),
    variant: "light",
  },
  "editor-classics": {
    eyebrow: "Familiar palettes",
    title: "Editor classic themes",
    description: "Recognizable coding palettes translated across the full Codex workspace.",
    filter: (theme) => EDITOR_CLASSIC_THEME_IDS.includes(getCatalogThemeId(theme)),
    variant: null,
  },
  community: {
    eyebrow: "Published by creators",
    title: "Community Codex themes",
    description: "Original palettes from DexThemes creators, each with a canonical page worth sharing.",
    filter: (theme) => theme.category === "community",
    variant: null,
  },
});

export function renderThemePage({ theme, variant, relatedThemes = [], imageVersion = "1" }) {
  const themeId = getCatalogThemeId(theme);
  const palette = getVariantPalette(theme, variant);
  if (!themeId || !palette) {
    return renderNotFoundPage({
      title: "Theme not found",
      message: "That theme or variant is not available in the public DexThemes catalog.",
    });
  }

  const name = cleanText(theme.name, titleFromSlug(themeId));
  const summary = getThemeSummary(theme, variant);
  const source = getThemeSource(theme);
  const availableVariants = getCatalogThemeVariants(theme);
  const canonicalUrl = `${CANONICAL_ORIGIN}/${encodeURIComponent(themeId)}/${variant}`;
  const appUrl = `${CANONICAL_ORIGIN}/?theme=${encodeURIComponent(themeId)}&variant=${variant}&source=theme_page`;
  const ogImageUrl = `${CANONICAL_ORIGIN}/api/og?theme=${encodeURIComponent(themeId)}&variant=${variant}&v=${encodeURIComponent(imageVersion)}`;
  const title = `${name} Codex Theme — Preview & Import | DexThemes`;
  const description = `${summary} Preview the ${variant} palette and follow the exact Codex import steps.`;
  const accent = palette.accent;

  const paletteItems = [
    ["Surface", palette.surface],
    ["Sidebar", palette.sidebar],
    ["Accent", palette.accent],
    ["Added", palette.diffAdded],
    ["Removed", palette.diffRemoved],
    ["Skill", palette.skill],
  ];

  const relatedHtml = relatedThemes.length
    ? `<section class="public-section related-section" aria-labelledby="related-title">
        <div class="section-heading">
          <span class="section-number">03</span>
          <div>
            <p class="section-kicker">Continue browsing</p>
            <h2 id="related-title">Related themes</h2>
          </div>
        </div>
        <div class="theme-card-grid">
          ${relatedThemes.map((related) => renderThemeCard(related.theme, related.variant)).join("")}
        </div>
      </section>`
    : "";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
        primaryImageOfPage: { "@id": `${canonicalUrl}#primaryimage` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "DexThemes", item: `${CANONICAL_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: "Collections", item: `${CANONICAL_ORIGIN}/collections` },
          { "@type": "ListItem", position: 3, name, item: canonicalUrl },
        ],
      },
      {
        "@type": "ImageObject",
        "@id": `${canonicalUrl}#primaryimage`,
        contentUrl: ogImageUrl,
        url: ogImageUrl,
        width: 1200,
        height: 630,
        caption: `${name} ${variant} Codex theme preview`,
        representativeOfPage: true,
      },
    ],
  };

  const body = `
    <main id="main-content">
      <article class="theme-page">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">DexThemes</a><span aria-hidden="true">/</span>
          <a href="/collections">Collections</a><span aria-hidden="true">/</span>
          <span aria-current="page">${escapeHtml(name)}</span>
        </nav>

        <section class="theme-hero">
          <div class="theme-hero-copy">
            <p class="eyebrow">${escapeHtml(source.label)} · ${escapeHtml(variant)} variant</p>
            <h1>${escapeHtml(name)}</h1>
            <p class="hero-copy">${escapeHtml(summary)}</p>
            <dl class="theme-meta">
              <div><dt>Source</dt><dd>${escapeHtml(source.detail)}</dd></div>
              <div><dt>Available</dt><dd>${escapeHtml(availableVariants.join(" + "))}</dd></div>
              <div><dt>Accent</dt><dd><code>${escapeHtml(accent)}</code></dd></div>
            </dl>
            <div class="hero-actions">
              <a class="button button-primary" href="${escapeHtml(appUrl)}">Open interactive preview <span aria-hidden="true">↗</span></a>
              <button class="button button-secondary" type="button" data-share-url="${escapeHtml(canonicalUrl)}">Share theme</button>
            </div>
            <p class="action-note">The interactive preview opens the existing DexThemes app. Nothing is applied until you approve the import in Codex.</p>
          </div>

          <figure class="theme-preview-frame">
            <img src="${escapeHtml(ogImageUrl)}" width="1200" height="630" alt="${escapeHtml(`${name} ${variant} theme rendered in a Codex-style workspace`)}">
            <figcaption>Rendered from the current ${escapeHtml(variant)} palette.</figcaption>
          </figure>
        </section>

        <section class="palette-strip" aria-labelledby="palette-title">
          <div class="palette-intro">
            <p class="section-kicker">Palette</p>
            <h2 id="palette-title">The working colors</h2>
          </div>
          ${paletteItems.map(([label, value]) => `
            <div class="palette-sample">
              <i style="--swatch:${escapeHtml(value)}" aria-hidden="true"></i>
              <span>${escapeHtml(label)}</span>
              <code>${escapeHtml(value)}</code>
            </div>
          `).join("")}
        </section>

        <section class="public-section" aria-labelledby="changes-title">
          <div class="section-heading">
            <span class="section-number">01</span>
            <div>
              <p class="section-kicker">What changes</p>
              <h2 id="changes-title">One palette across the workspace</h2>
            </div>
          </div>
          <div class="facts-grid">
            <div><span>Main workspace</span><strong>${escapeHtml(palette.surface)}</strong></div>
            <div><span>Navigation</span><strong>${escapeHtml(palette.sidebar)}</strong></div>
            <div><span>Primary action</span><strong>${escapeHtml(palette.accent)}</strong></div>
            <div><span>Code surface</span><strong>${escapeHtml(palette.codeBg)}</strong></div>
          </div>
          <div class="answer-grid">
            <article>
              <h3>Is this an official DexThemes product?</h3>
              <p>DexThemes is free, open source, and community-built. It is not affiliated with OpenAI. ${escapeHtml(source.answer)}</p>
            </article>
            <article>
              <h3>Does DexThemes modify Codex files?</h3>
              <p>No. DexThemes prepares an import string. Codex owns the final Appearance import and asks you to approve the change.</p>
            </article>
          </div>
        </section>

        <section class="public-section" aria-labelledby="install-title">
          <div class="section-heading">
            <span class="section-number">02</span>
            <div>
              <p class="section-kicker">How to use it</p>
              <h2 id="install-title">Copy, open Appearance, import</h2>
            </div>
          </div>
          <ol class="step-grid">
            <li><b>1</b><div><strong>Open the interactive preview</strong><span>Confirm the ${escapeHtml(variant)} variant and palette in context.</span></div></li>
            <li><b>2</b><div><strong>Copy the theme</strong><span>DexThemes copies the complete codex-theme-v1 import string.</span></div></li>
            <li><b>3</b><div><strong>Approve it in Codex</strong><span>Open Settings → Appearance → Import theme, paste, and approve.</span></div></li>
          </ol>
          <a class="text-link" href="/guides/how-to-install-a-codex-theme">Read the complete install guide <span aria-hidden="true">→</span></a>
        </section>

        ${relatedHtml}
      </article>
    </main>
  `;

  return renderDocument({
    title,
    description,
    canonicalUrl,
    ogImageUrl,
    accent,
    surface: palette.surface,
    body,
    structuredData,
    pageType: "theme",
    shareUrl: canonicalUrl,
  });
}

export function renderGuidesHub() {
  const canonicalUrl = `${CANONICAL_ORIGIN}/guides`;
  const cards = Object.entries(GUIDE_PAGES).map(([slug, guide], index) => `
    <a class="hub-card" href="/guides/${escapeHtml(slug)}">
      <span class="hub-card-number">0${index + 1}</span>
      <span class="hub-card-label">${escapeHtml(guide.eyebrow)}</span>
      <h2>${escapeHtml(guide.title)}</h2>
      <p>${escapeHtml(guide.description)}</p>
      <span class="hub-card-action">Read the guide <span aria-hidden="true">→</span></span>
    </a>
  `).join("");

  return renderDocument({
    title: "DexThemes Guides — Install, Create & Troubleshoot Codex Themes",
    description: "Answer-first guides for installing, creating, and troubleshooting Codex themes with DexThemes.",
    canonicalUrl,
    accent: "#f15bb5",
    body: `
      <main id="main-content">
        <section class="hub-hero">
          ${renderBreadcrumbs([{ label: "Guides" }])}
          <p class="eyebrow">Learn · DexThemes guides</p>
          <h1>Make Codex yours,<br>with confidence.</h1>
          <p class="hero-copy">Short, answer-first guides for installing, creating, and fixing themes without digging through product documentation.</p>
          <div class="route-meta"><code>/guides</code><span>Three starting guides</span></div>
        </section>
        <section class="hub-content" aria-labelledby="guide-start-title">
          <div class="hub-section-heading">
            <div><p class="section-kicker">Choose a task</p><h2 id="guide-start-title">Start with what you need to do.</h2></div>
              <a class="button button-secondary" href="/?source=guide_page">Back to the app <span aria-hidden="true">↗</span></a>
          </div>
          <div class="hub-card-grid">${cards}</div>
        </section>
      </main>
    `,
    structuredData: buildPageStructuredData({
      type: "CollectionPage",
      title: "DexThemes Guides",
      description: "Answer-first guides for installing, creating, and troubleshooting Codex themes.",
      canonicalUrl,
      breadcrumbs: [{ name: "DexThemes", url: `${CANONICAL_ORIGIN}/` }, { name: "Guides", url: canonicalUrl }],
    }),
    pageType: "hub",
  });
}

export function renderGuidePage(slug) {
  const guide = GUIDE_PAGES[slug];
  if (!guide) {
    return renderNotFoundPage({
      title: "Guide not found",
      message: "That guide is not part of the DexThemes documentation catalog.",
    });
  }

  const canonicalUrl = `${CANONICAL_ORIGIN}/guides/${slug}`;
  const howToSteps = guide.steps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.title,
    text: step.body,
    url: `${canonicalUrl}#step-${index + 1}`,
  }));
  const pageData = buildPageStructuredData({
    type: "WebPage",
    title: guide.title,
    description: guide.description,
    canonicalUrl,
    breadcrumbs: [
      { name: "DexThemes", url: `${CANONICAL_ORIGIN}/` },
      { name: "Guides", url: `${CANONICAL_ORIGIN}/guides` },
      { name: guide.title, url: canonicalUrl },
    ],
  });
  pageData["@graph"].push({
    "@type": "HowTo",
    "@id": `${canonicalUrl}#howto`,
    name: guide.title,
    description: guide.answer,
    step: howToSteps,
  });

  return renderDocument({
    title: `${guide.title} | DexThemes Guides`,
    description: guide.description,
    canonicalUrl,
    accent: "#47adff",
    body: `
      <main id="main-content">
        <article class="guide-page">
          ${renderBreadcrumbs([
            { label: "Guides", href: "/guides" },
            { label: guide.title },
          ])}
          <header class="guide-hero">
            <p class="eyebrow">${escapeHtml(guide.eyebrow)}</p>
            <h1>${escapeHtml(guide.title)}</h1>
            <p class="answer-first">${escapeHtml(guide.answer)}</p>
            <div class="guide-actions">
              <a class="button button-primary" href="/?source=guide_page">Open DexThemes <span aria-hidden="true">↗</span></a>
              <a class="button button-secondary" href="/collections">Browse collections</a>
            </div>
          </header>
          <section class="guide-steps" aria-label="${escapeHtml(guide.title)} steps">
            ${guide.steps.map((step, index) => `
              <section class="guide-step" id="step-${index + 1}">
                <span class="section-number">${String(index + 1).padStart(2, "0")}</span>
                <div><h2>${escapeHtml(step.title)}</h2><p>${escapeHtml(step.body)}</p></div>
              </section>
            `).join("")}
          </section>
          <aside class="guide-callout">
            <p class="section-kicker">Good to know</p>
            <h2>${escapeHtml(guide.calloutTitle)}</h2>
            <p>${escapeHtml(guide.calloutBody)}</p>
          </aside>
          <nav class="related-links" aria-label="Related resources">
            ${guide.related.map((item) => `<a href="${escapeHtml(item.href)}"${item.external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(item.label)} <span aria-hidden="true">→</span></a>`).join("")}
          </nav>
        </article>
      </main>
    `,
    structuredData: pageData,
    pageType: "guide",
  });
}

export function renderCollectionsHub() {
  const canonicalUrl = `${CANONICAL_ORIGIN}/collections`;
  const cards = [
    ["01", "Dark themes", "Low-glare Codex palettes ranging from true black minimalism to warm editor classics.", "/collections/dark", ["#58a6ff", "#f15bb5", "#7aa2f7", "#a7c080"]],
    ["02", "Light themes", "Bright workspaces with measured contrast, clear hierarchy, and confident accents.", "/collections/light", ["#ffffff", "#f5f3ed", "#fdf6e3", "#e7e2ff"]],
    ["03", "Editor classics", "Familiar palettes from years of coding, now previewed across the full Codex workspace.", "/collections/editor-classics", ["#ff79c6", "#fe8019", "#88c0d0", "#7aa2f7"]],
    ["04", "Community", "Original palettes published by DexThemes creators, with a page worth sharing.", "/collections/community", ["#2f7480", "#6cb4ee", "#d4a54a", "#bc8cff"]],
  ].map(([number, title, description, href, colors]) => `
    <a class="collection-card" href="${href}">
      <div class="collection-card-palette">${colors.map((color) => `<i style="--swatch:${color}"></i>`).join("")}</div>
      <span class="hub-card-number">${number}</span>
      <h2>${title}</h2>
      <p>${description}</p>
      <span class="hub-card-action">Open collection <span aria-hidden="true">→</span></span>
    </a>
  `).join("");

  return renderDocument({
    title: "Codex Theme Collections | DexThemes",
    description: "Browse dark, light, editor-classic, and community Codex theme collections.",
    canonicalUrl,
    accent: "#f15bb5",
    body: `
      <main id="main-content">
        <section class="hub-hero">
          ${renderBreadcrumbs([{ label: "Theme collections" }])}
          <p class="eyebrow">Browse · Theme collections</p>
          <h1>Find your corner<br>of the catalog.</h1>
          <p class="hero-copy">Start with the way you work: low-glare dark palettes, bright daylight themes, familiar editor classics, or original community work.</p>
          <div class="route-meta"><code>/collections</code><span>Four curated entrances</span></div>
        </section>
        <section class="hub-content" aria-labelledby="collection-start-title">
          <div class="hub-section-heading">
            <div><p class="section-kicker">Browse with intent</p><h2 id="collection-start-title">Choose a starting point.</h2></div>
            <a class="button button-secondary" href="/?source=collection_page">Back to the app <span aria-hidden="true">↗</span></a>
          </div>
          <div class="collection-card-grid">${cards}</div>
        </section>
      </main>
    `,
    structuredData: buildPageStructuredData({
      type: "CollectionPage",
      title: "Codex Theme Collections",
      description: "Browse dark, light, editor-classic, and community Codex theme collections.",
      canonicalUrl,
      breadcrumbs: [{ name: "DexThemes", url: `${CANONICAL_ORIGIN}/` }, { name: "Collections", url: canonicalUrl }],
    }),
    pageType: "hub",
  });
}

export function renderCollectionPage(slug, themes) {
  const definition = COLLECTION_DEFINITIONS[slug];
  if (!definition) {
    return renderNotFoundPage({
      title: "Collection not found",
      message: "That collection is not part of the public DexThemes catalog.",
    });
  }

  const filtered = themes
    .filter((theme) => getCatalogThemeId(theme) && definition.filter(theme))
    .sort((a, b) => cleanText(a.name).localeCompare(cleanText(b.name)));
  const canonicalUrl = `${CANONICAL_ORIGIN}/collections/${slug}`;
  const itemList = filtered.map((theme, index) => {
    const variant = definition.variant || (theme.dark ? "dark" : "light");
    const themeId = getCatalogThemeId(theme);
    return {
      "@type": "ListItem",
      position: index + 1,
      name: cleanText(theme.name, titleFromSlug(themeId)),
      url: `${CANONICAL_ORIGIN}/${encodeURIComponent(themeId)}/${variant}`,
    };
  });
  const structuredData = buildPageStructuredData({
    type: "CollectionPage",
    title: definition.title,
    description: definition.description,
    canonicalUrl,
    breadcrumbs: [
      { name: "DexThemes", url: `${CANONICAL_ORIGIN}/` },
      { name: "Collections", url: `${CANONICAL_ORIGIN}/collections` },
      { name: definition.title, url: canonicalUrl },
    ],
  });
  structuredData["@graph"].push({
    "@type": "ItemList",
    "@id": `${canonicalUrl}#themes`,
    name: definition.title,
    numberOfItems: itemList.length,
    itemListElement: itemList,
  });

  return renderDocument({
    title: `${definition.title} | DexThemes`,
    description: definition.description,
    canonicalUrl,
    accent: slug === "light" ? "#f0b429" : slug === "community" ? "#f15bb5" : "#47adff",
    body: `
      <main id="main-content">
        <section class="collection-hero">
          ${renderBreadcrumbs([
            { label: "Collections", href: "/collections" },
            { label: definition.title },
          ])}
          <p class="eyebrow">${escapeHtml(definition.eyebrow)}</p>
          <h1>${escapeHtml(definition.title)}</h1>
          <p class="hero-copy">${escapeHtml(definition.description)}</p>
          <div class="route-meta"><code>/collections/${escapeHtml(slug)}</code><span>${filtered.length} ${filtered.length === 1 ? "theme" : "themes"}</span></div>
        </section>
        <section class="catalog-section" aria-label="${escapeHtml(definition.title)} catalog">
          <div class="catalog-heading">
            <p>Every card opens a complete public theme page. Use the interactive preview when you are ready to try one in context.</p>
            <a class="button button-secondary" href="/?source=collection_page">Open DexThemes <span aria-hidden="true">↗</span></a>
          </div>
          <div class="theme-card-grid">
            ${filtered.map((theme) => renderThemeCard(theme, definition.variant || (theme.dark ? "dark" : "light"))).join("")}
          </div>
        </section>
      </main>
    `,
    structuredData,
    pageType: "collection",
  });
}

export function renderNotFoundPage({
  title = "Page not found",
  message = "That page is not available.",
  statusLabel = "404",
} = {}) {
  const canonicalUrl = `${CANONICAL_ORIGIN}/`;
  return renderDocument({
    title: `${title} | DexThemes`,
    description: message,
    canonicalUrl,
    accent: "#f85149",
    noindex: true,
    body: `
      <main id="main-content" class="error-page">
        <p class="eyebrow">${escapeHtml(statusLabel)} · DexThemes</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero-copy">${escapeHtml(message)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="/">Open DexThemes</a>
          <a class="button button-secondary" href="/collections">Browse collections</a>
        </div>
      </main>
    `,
    structuredData: null,
    pageType: "error",
  });
}

export function getRelatedThemes(theme, catalog, variant, limit = 3) {
  const currentId = getCatalogThemeId(theme);
  const currentAccent = getVariantPalette(theme, variant)?.accent;
  return catalog
    .filter((candidate) => {
      const candidateId = getCatalogThemeId(candidate);
      return candidateId && candidateId !== currentId && Boolean(candidate[variant]);
    })
    .map((candidate) => ({
      theme: candidate,
      variant,
      distance: colorDistance(currentAccent, getVariantPalette(candidate, variant)?.accent),
    }))
    .sort((a, b) => a.distance - b.distance || cleanText(a.theme.name).localeCompare(cleanText(b.theme.name)))
    .slice(0, limit);
}

function renderDocument({
  title,
  description,
  canonicalUrl,
  body,
  structuredData,
  accent = "#47adff",
  surface = "#0d0f12",
  ogImageUrl = DEFAULT_OG_IMAGE,
  noindex = false,
  pageType = "page",
  shareUrl = "",
}) {
  const schema = structuredData
    ? `<script type="application/ld+json">${jsonForScript(structuredData)}</script>`
    : "";
  const shareScript = shareUrl
    ? `<script>
      (() => {
        const button = document.querySelector("[data-share-url]");
        if (!button) return;
        button.addEventListener("click", async () => {
          const url = button.dataset.shareUrl;
          const original = button.textContent;
          try {
            if (navigator.share) {
              await navigator.share({ title: document.title, url });
              button.textContent = "Shared";
            } else {
              await navigator.clipboard.writeText(url);
              button.textContent = "Link copied";
            }
          } catch (error) {
            if (error && error.name === "AbortError") return;
            button.textContent = "Copy the address above";
          }
          window.setTimeout(() => { button.textContent = original; }, 1800);
        });
      })();
    </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/public-pages.css">
  <meta name="theme-color" content="${escapeHtml(surface)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:site_name" content="DexThemes">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">
  ${schema}
</head>
<body class="public-site public-site--${escapeHtml(pageType)}" style="--page-accent:${escapeHtml(accent)};--theme-surface:${escapeHtml(surface)}">
  <a class="skip-link" href="#main-content">Skip to content</a>
  ${renderSiteHeader()}
  ${body}
  ${renderSiteFooter()}
  ${shareScript}
</body>
</html>`;
}

function renderSiteHeader() {
  return `<header class="public-header">
    <a class="public-brand" href="/" aria-label="DexThemes app">
      <img src="/favicon.svg" width="34" height="34" alt="">
      <span><strong>DexThemes</strong><small>Make Codex yours</small></span>
    </a>
    <nav aria-label="DexThemes">
      <a href="/collections">Collections</a>
      <a href="/collections/community">Community</a>
      <a href="/guides">Guides</a>
    </nav>
    <a class="header-app-link" href="/">Open DexThemes <span aria-hidden="true">↗</span></a>
  </header>`;
}

function renderSiteFooter() {
  return `<footer class="public-footer">
    <div><strong>DexThemes</strong><p>Discover, preview, and create themes for Codex.</p></div>
    <nav aria-label="Footer">
      <a href="/guides">Guides</a>
      <a href="/collections">Theme collections</a>
      <a href="https://github.com/daeshawnballard/dexthemes" target="_blank" rel="noopener">GitHub</a>
    </nav>
    <p>Free and open source. Community-built and not affiliated with OpenAI.</p>
  </footer>`;
}

function renderBreadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">DexThemes</a>
    ${items.map((item) => `<span aria-hidden="true">/</span>${item.href ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>` : `<span aria-current="page">${escapeHtml(item.label)}</span>`}`).join("")}
  </nav>`;
}

function renderThemeCard(theme, variant) {
  const themeId = getCatalogThemeId(theme);
  const palette = getVariantPalette(theme, variant);
  if (!themeId || !palette) return "";
  const name = cleanText(theme.name, titleFromSlug(themeId));
  const summary = getThemeSummary(theme, variant);
  const source = getThemeSource(theme);
  return `<a class="theme-card" href="/${encodeURIComponent(themeId)}/${variant}" style="--card-surface:${escapeHtml(palette.surface)};--card-ink:${escapeHtml(palette.ink)};--card-accent:${escapeHtml(palette.accent)}">
    <div class="theme-card-preview" aria-hidden="true">
      <i></i><span></span><span></span><b></b>
    </div>
    <div class="theme-card-copy">
      <span class="theme-card-source">${escapeHtml(source.label)} · ${escapeHtml(variant)}</span>
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(summary)}</p>
      <span class="theme-card-action">View theme <span aria-hidden="true">→</span></span>
    </div>
  </a>`;
}

function getVariantPalette(theme, variant) {
  const source = theme?.[variant];
  if (!source) return null;
  const surface = safeHex(source.surface, variant === "light" ? "#ffffff" : "#0d0f12");
  const ink = safeHex(source.ink, variant === "light" ? "#171717" : "#f5f5f2");
  return {
    surface,
    ink,
    accent: safeHex(source.accent, "#47adff"),
    sidebar: safeHex(source.sidebar, surface),
    codeBg: safeHex(source.codeBg, surface),
    diffAdded: safeHex(source.diffAdded, "#3fb950"),
    diffRemoved: safeHex(source.diffRemoved, "#f85149"),
    skill: safeHex(source.skill, "#bc8cff"),
  };
}

function getThemeSummary(theme, variant = "dark") {
  const explicit = cleanText(theme?.summary || theme?._summary);
  if (explicit) return explicit;
  const name = cleanText(theme?.name, "This theme");
  const palette = getVariantPalette(theme, variant) || getVariantPalette(theme, theme?.dark ? "dark" : "light");
  if (!palette) return `${name} is a Codex theme available through DexThemes.`;
  return `${name} pairs ${palette.surface} surfaces with ${palette.accent} accents for a focused Codex workspace.`;
}

function getThemeSource(theme) {
  const category = String(theme?.category || "").toLowerCase();
  if (category === "community") {
    const author = cleanText(theme?.authorName || theme?._authorName, "a DexThemes creator");
    return {
      label: "Community theme",
      detail: `Created by ${author}`,
      answer: `This is a community theme created by ${author}.`,
    };
  }
  if (category === "dexthemes") {
    return {
      label: "Curated DexThemes palette",
      detail: "Curated by DexThemes",
      answer: "This is a curated DexThemes palette, not a built-in Codex theme.",
    };
  }
  return {
    label: "Codex catalog theme",
    detail: "Built into the Codex theme catalog",
    answer: "This palette comes from the built-in Codex theme catalog; DexThemes provides the preview and import handoff.",
  };
}

function buildPageStructuredData({ type, title, description, canonicalUrl, breadcrumbs }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        url: `${CANONICAL_ORIGIN}/`,
        name: SITE_NAME,
        sameAs: SAME_AS,
      },
    ],
  };
}

function colorDistance(a, b) {
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return Number.MAX_SAFE_INTEGER;
  return Math.sqrt(
    ((rgbA.r - rgbB.r) ** 2)
    + ((rgbA.g - rgbB.g) ** 2)
    + ((rgbA.b - rgbB.b) ** 2),
  );
}

function hexToRgb(value) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(value || ""));
  if (!match) return null;
  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

function safeHex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
}

function cleanText(value, fallback = "") {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text || fallback;
}

function titleFromSlug(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const CONTENT_ROUTE_PATHS = Object.freeze([
  ...GUIDE_ROUTES,
  ...COLLECTION_ROUTES,
]);
