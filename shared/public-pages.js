import {
  CANONICAL_ORIGIN,
  COLLECTION_ROUTES,
  EDITORIAL_ROUTES,
  EDITOR_CLASSIC_THEME_IDS,
  getCatalogThemeId,
  getCatalogThemeVariants,
} from "./seo.js";
import {
  CONTENT_ITEMS,
} from "./generated-content.js";

const SITE_NAME = "DexThemes";
const DEFAULT_OG_IMAGE = `${CANONICAL_ORIGIN}/logos/logo-github-transparent.png`;
const AUTHOR_NAME = "Daeshawn Ballard";
const AUTHOR_URL = "https://x.com/daeshawn";
const SAME_AS = [
  "https://github.com/daeshawnballard/dexthemes",
  "https://x.com/DexThemes",
];

const CONTENT_SECTION_CONFIG = Object.freeze({
  guides: {
    label: "Guides",
    eyebrow: "Learn · DexThemes guides",
    title: "Make Codex yours,\nwith confidence.",
    description: "Answer-first instructions for choosing, creating, importing, sharing, and troubleshooting Codex themes.",
    kicker: "Choose a task",
    prompt: "Start with what you need to do.",
    accent: "#47adff",
    action: "Read the guide",
  },
  features: {
    label: "Features",
    eyebrow: "Explore · DexThemes features",
    title: "One theme system,\nfrom idea to import.",
    description: "See how discovery, previews, creation, community publishing, rankings, rewards, and developer tools fit together.",
    kicker: "Explore the product",
    prompt: "Everything DexThemes can do.",
    accent: "#f15bb5",
    action: "Explore the feature",
  },
  articles: {
    label: "Articles",
    eyebrow: "Read · DexThemes journal",
    title: "Better themes begin\nwith better decisions.",
    description: "Field notes, comparisons, and practical design guidance for building a Codex workspace that stays readable.",
    kicker: "From the studio",
    prompt: "Comparisons, methods, and design thinking.",
    accent: "#f4b942",
    action: "Read the article",
  },
  reference: {
    label: "Reference",
    eyebrow: "Reference · Theme contracts",
    title: "The details,\nwithout the guesswork.",
    description: "Technical reference for the DexThemes theme format and its safe handoff into Codex.",
    kicker: "Technical reference",
    prompt: "Use the exact contract.",
    accent: "#8ee3c8",
    action: "Open reference",
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

export function getContentItem(section, slug) {
  return CONTENT_ITEMS.find(
    (item) => item.routeSection === section && item.slug === slug,
  ) || null;
}

export function renderContentHub(section) {
  const config = CONTENT_SECTION_CONFIG[section];
  if (!config) {
    return renderNotFoundPage({
      title: "Section not found",
      message: "That section is not part of the DexThemes content catalog.",
    });
  }

  const items = CONTENT_ITEMS.filter((item) => item.routeSection === section);
  const canonicalUrl = `${CANONICAL_ORIGIN}/${section}`;
  const cards = items.map((item, index) => `
    <a class="hub-card" href="${escapeHtml(item.path)}">
      <span class="hub-card-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="hub-card-label">${escapeHtml(item.section)}</span>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.description)}</p>
      <span class="hub-card-action">${escapeHtml(config.action)} <span aria-hidden="true">→</span></span>
    </a>
  `).join("");
  const pageData = buildPageStructuredData({
    type: "CollectionPage",
    title: `DexThemes ${config.label}`,
    description: config.description,
    canonicalUrl,
    breadcrumbs: [
      { name: "DexThemes", url: `${CANONICAL_ORIGIN}/` },
      { name: config.label, url: canonicalUrl },
    ],
  });
  pageData["@graph"].push({
    "@type": "ItemList",
    "@id": `${canonicalUrl}#items`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: `${CANONICAL_ORIGIN}${item.path}`,
    })),
  });

  return renderDocument({
    title: `DexThemes ${config.label} | Codex Theme Resources`,
    description: config.description,
    canonicalUrl,
    accent: config.accent,
    body: `
      <main id="main-content">
        <section class="hub-hero">
          ${renderBreadcrumbs([{ label: config.label }])}
          <p class="eyebrow">${escapeHtml(config.eyebrow)}</p>
          <h1>${config.title.split("\n").map(escapeHtml).join("<br>")}</h1>
          <p class="hero-copy">${escapeHtml(config.description)}</p>
          <div class="route-meta"><code>/${escapeHtml(section)}</code><span>${items.length} ${items.length === 1 ? "page" : "pages"}</span></div>
        </section>
        <section class="hub-content" aria-labelledby="${escapeHtml(section)}-start-title">
          <div class="hub-section-heading">
            <div><p class="section-kicker">${escapeHtml(config.kicker)}</p><h2 id="${escapeHtml(section)}-start-title">${escapeHtml(config.prompt)}</h2></div>
            <a class="button button-secondary" href="/?source=${escapeHtml(section)}_hub">Back to the app <span aria-hidden="true">↗</span></a>
          </div>
          <div class="hub-card-grid">${cards}</div>
        </section>
      </main>
    `,
    structuredData: pageData,
    pageType: "hub",
  });
}

export function renderContentPage(section, slug) {
  const config = CONTENT_SECTION_CONFIG[section];
  const item = getContentItem(section, slug);
  if (!config || !item) {
    return renderNotFoundPage({
      title: `${config?.label?.replace(/s$/, "") || "Page"} not found`,
      message: "That page is not part of the DexThemes content catalog.",
    });
  }

  const canonicalUrl = `${CANONICAL_ORIGIN}${item.path}`;
  const markdownUrl = `${canonicalUrl}.md`;
  const pageData = buildPageStructuredData({
    type: "WebPage",
    title: item.title,
    description: item.description,
    canonicalUrl,
    breadcrumbs: [
      { name: "DexThemes", url: `${CANONICAL_ORIGIN}/` },
      { name: config.label, url: `${CANONICAL_ORIGIN}/${section}` },
      { name: item.title, url: canonicalUrl },
    ],
  });
  pageData["@graph"].push(
    {
      "@type": item.kind === "article" || item.kind === "feature" ? "Article" : "TechArticle",
      "@id": `${canonicalUrl}#article`,
      headline: item.title,
      description: item.description,
      datePublished: item.datePublished,
      dateModified: item.dateModified,
      author: { "@id": `${CANONICAL_ORIGIN}/#daeshawn-ballard` },
      publisher: { "@id": `${CANONICAL_ORIGIN}/#daeshawn-ballard` },
      mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
    },
    {
      "@type": "Person",
      "@id": `${CANONICAL_ORIGIN}/#daeshawn-ballard`,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      sameAs: [AUTHOR_URL],
    },
  );

  const relatedHtml = item.related.length
    ? `<nav class="related-links" aria-label="Related resources">
        ${item.related.map((route) => {
          const related = CONTENT_ITEMS.find((candidate) => candidate.path === route);
          return `<a href="${escapeHtml(route)}">${escapeHtml(related?.title || titleFromSlug(route.split("/").filter(Boolean).at(-1)))} <span aria-hidden="true">→</span></a>`;
        }).join("")}
      </nav>`
    : "";

  return renderDocument({
    title: `${item.title} | DexThemes`,
    description: item.description,
    canonicalUrl,
    markdownUrl,
    accent: config.accent,
    body: `
      <main id="main-content">
        <article class="content-page">
          ${renderBreadcrumbs([
            { label: config.label, href: `/${section}` },
            { label: item.title },
          ])}
          <header class="content-hero">
            <p class="eyebrow">${escapeHtml(item.section)} · DexThemes</p>
            <h1>${escapeHtml(item.title)}</h1>
            <p class="answer-first">${escapeHtml(item.answer)}</p>
            <div class="content-byline">
              <span>Written by <a href="${AUTHOR_URL}" target="_blank" rel="author noopener">${AUTHOR_NAME}</a></span>
              <span>Updated <time datetime="${escapeHtml(item.dateModified)}">${escapeHtml(formatDisplayDate(item.dateModified))}</time></span>
              <span>${item.wordCount.toLocaleString("en-US")} words</span>
            </div>
            <div class="guide-actions">
              <a class="button button-primary" href="/?source=${escapeHtml(item.kind)}_page">Open DexThemes <span aria-hidden="true">↗</span></a>
              <a class="button button-secondary" href="${escapeHtml(`${item.path}.md`)}">Read as Markdown</a>
            </div>
          </header>
          <div class="content-layout">
            <aside class="content-context">
              <p class="section-kicker">Verified against</p>
              <p>${escapeHtml(item.testedWith)}</p>
              <a href="${AUTHOR_URL}" target="_blank" rel="author noopener">@daeshawn on X <span aria-hidden="true">↗</span></a>
            </aside>
            <div class="prose">${item.bodyHtml}</div>
          </div>
          ${relatedHtml}
        </article>
      </main>
    `,
    structuredData: pageData,
    pageType: item.kind,
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
  markdownUrl = "",
  body,
  structuredData,
  accent = "#47adff",
  surface = "#0d0f12",
  ogImageUrl = DEFAULT_OG_IMAGE,
  noindex = false,
  pageType = "page",
  shareUrl = "",
}) {
  const ogType = ["guide", "feature", "article", "reference"].includes(pageType)
    ? "article"
    : "website";
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
  ${markdownUrl ? `<link rel="alternate" type="text/markdown" href="${escapeHtml(markdownUrl)}">` : ""}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/public-pages.css">
  <meta name="theme-color" content="${escapeHtml(surface)}">
  <meta property="og:type" content="${ogType}">
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
      <a href="/features">Features</a>
      <a href="/guides">Guides</a>
      <a href="/articles">Articles</a>
    </nav>
    <a class="header-app-link" href="/">Open DexThemes <span aria-hidden="true">↗</span></a>
  </header>`;
}

function renderSiteFooter() {
  return `<footer class="public-footer">
    <div><strong>DexThemes</strong><p>Discover, preview, and create themes for Codex.</p></div>
    <nav aria-label="Footer">
      <a href="/features">Features</a>
      <a href="/guides">Guides</a>
      <a href="/articles">Articles</a>
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

function formatDisplayDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
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
  ...EDITORIAL_ROUTES,
  ...COLLECTION_ROUTES,
]);
