const baseTheme = {
  fonts: { code: null, ui: null },
  opaqueWindows: true,
};

const themes = [
  {
    id: "ichigo-bankai",
    name: "Ichigo / Bankai",
    category: "Anime",
    summary:
      "High-contrast orange, ash-black surfaces, and a stripped-down silhouette pulled from Bankai energy.",
    light: {
      accent: "#F97316",
      contrast: 46,
      ink: "#121212",
      semanticColors: {
        diffAdded: "#16A34A",
        diffRemoved: "#DC2626",
        skill: "#F59E0B",
      },
      surface: "#FFF7F2",
    },
    dark: {
      accent: "#FF7A1A",
      contrast: 64,
      ink: "#FFF4EC",
      semanticColors: {
        diffAdded: "#22C55E",
        diffRemoved: "#EF4444",
        skill: "#F59E0B",
      },
      surface: "#121111",
    },
  },
  {
    id: "naruto-hidden-leaf",
    name: "Naruto / Hidden Leaf Ember",
    category: "Anime",
    summary:
      "Warm amber and charcoal with a ramen-shop glow instead of a generic neon orange anime palette.",
    light: {
      accent: "#F59E0B",
      contrast: 48,
      ink: "#1A1A1A",
      semanticColors: {
        diffAdded: "#16A34A",
        diffRemoved: "#DC2626",
        skill: "#EA580C",
      },
      surface: "#FFF8ED",
    },
    dark: {
      accent: "#FF9F1C",
      contrast: 66,
      ink: "#F7F3EA",
      semanticColors: {
        diffAdded: "#22C55E",
        diffRemoved: "#F97316",
        skill: "#F59E0B",
      },
      surface: "#101418",
    },
  },
  {
    id: "luffy-grand-line",
    name: "Luffy / Grand Line",
    category: "Anime",
    summary:
      "Straw-hat tan, sea-night navy, and the kind of bright red accent that still feels playful rather than aggressive.",
    light: {
      accent: "#DC2626",
      contrast: 44,
      ink: "#152033",
      semanticColors: {
        diffAdded: "#16A34A",
        diffRemoved: "#DC2626",
        skill: "#2563EB",
      },
      surface: "#FFF8E7",
    },
    dark: {
      accent: "#F87171",
      contrast: 62,
      ink: "#F8F1DC",
      semanticColors: {
        diffAdded: "#22C55E",
        diffRemoved: "#EF4444",
        skill: "#60A5FA",
      },
      surface: "#0F172A",
    },
  },
  {
    id: "apple-precision",
    name: "Apple / Precision Glass",
    category: "Brands",
    summary:
      "Clean aluminum neutrals, reserved blue accents, and a softer foreground contrast tuned for a premium utility feel.",
    light: {
      accent: "#2563EB",
      contrast: 38,
      ink: "#111827",
      semanticColors: {
        diffAdded: "#16A34A",
        diffRemoved: "#DC2626",
        skill: "#3B82F6",
      },
      surface: "#F5F7FA",
    },
    dark: {
      accent: "#5AA3FF",
      contrast: 58,
      ink: "#F9FAFB",
      semanticColors: {
        diffAdded: "#22C55E",
        diffRemoved: "#EF4444",
        skill: "#60A5FA",
      },
      surface: "#14171C",
    },
  },
  {
    id: "nintendo-switch",
    name: "Nintendo / Switch Split",
    category: "Games",
    summary:
      "A split red-and-cyan look that stays sharp without turning the whole interface into toy plastic.",
    light: {
      accent: "#E11D48",
      contrast: 50,
      ink: "#141414",
      semanticColors: {
        diffAdded: "#14B8A6",
        diffRemoved: "#E11D48",
        skill: "#06B6D4",
      },
      surface: "#FFF4F5",
    },
    dark: {
      accent: "#22D3EE",
      contrast: 68,
      ink: "#F8FAFC",
      semanticColors: {
        diffAdded: "#14B8A6",
        diffRemoved: "#FB7185",
        skill: "#22D3EE",
      },
      surface: "#11131A",
    },
  },
  {
    id: "github-midnight",
    name: "GitHub / Midnight Merge",
    category: "Editors",
    summary:
      "A merge-heavy dark scheme with punchier diff colors and less washed-out chrome than standard developer dark themes.",
    light: {
      accent: "#0969DA",
      contrast: 42,
      ink: "#0F172A",
      semanticColors: {
        diffAdded: "#1A7F37",
        diffRemoved: "#CF222E",
        skill: "#8250DF",
      },
      surface: "#F8FAFC",
    },
    dark: {
      accent: "#2F81F7",
      contrast: 63,
      ink: "#F0F6FC",
      semanticColors: {
        diffAdded: "#3FB950",
        diffRemoved: "#F85149",
        skill: "#A371F7",
      },
      surface: "#0D1117",
    },
  },
  {
    id: "spotify-wave",
    name: "Spotify / Night Wave",
    category: "Brands",
    summary:
      "A music-first palette with acid green highlights and a darker graphite floor that keeps code readable.",
    light: {
      accent: "#1DB954",
      contrast: 45,
      ink: "#122117",
      semanticColors: {
        diffAdded: "#16A34A",
        diffRemoved: "#DC2626",
        skill: "#10B981",
      },
      surface: "#F2FFF7",
    },
    dark: {
      accent: "#1ED760",
      contrast: 65,
      ink: "#F7FDF9",
      semanticColors: {
        diffAdded: "#22C55E",
        diffRemoved: "#F87171",
        skill: "#34D399",
      },
      surface: "#121614",
    },
  },
  {
    id: "shonen-sunset",
    name: "Shonen Sunset",
    category: "Originals",
    summary:
      "A blended orange-red original tuned for Codex specifically, sitting between anime heat and terminal polish.",
    light: {
      accent: "#EA580C",
      contrast: 47,
      ink: "#161616",
      semanticColors: {
        diffAdded: "#16A34A",
        diffRemoved: "#DC2626",
        skill: "#7C3AED",
      },
      surface: "#FFF7E8",
    },
    dark: {
      accent: "#FB923C",
      contrast: 67,
      ink: "#FFF7ED",
      semanticColors: {
        diffAdded: "#22C55E",
        diffRemoved: "#EF4444",
        skill: "#A855F7",
      },
      surface: "#111827",
    },
  },
];

const state = {
  activeCategory: "All",
  query: "",
  selectedId: themes[0].id,
};

const categoryFilter = document.querySelector("#category-filter");
const themeGrid = document.querySelector("#theme-grid");
const searchInput = document.querySelector("#search-input");
const copyLightButton = document.querySelector("#copy-light");
const copyDarkButton = document.querySelector("#copy-dark");

const selectedName = document.querySelector("#selected-name");
const selectedCollection = document.querySelector("#selected-collection");
const selectedSummary = document.querySelector("#selected-summary");
const lightPreview = document.querySelector("#light-preview");
const darkPreview = document.querySelector("#dark-preview");
const lightString = document.querySelector("#light-string");
const darkString = document.querySelector("#dark-string");

function themeVariantToShareString(theme, variant) {
  return `codex-theme-v1:${JSON.stringify({
    codeThemeId: "codex",
    theme: {
      ...baseTheme,
      ...theme,
    },
    variant,
  })}`;
}

function getCategories() {
  return ["All", ...new Set(themes.map((theme) => theme.category))];
}

function getVisibleThemes() {
  const query = state.query.trim().toLowerCase();

  return themes.filter((theme) => {
    const matchesCategory =
      state.activeCategory === "All" || theme.category === state.activeCategory;

    const matchesQuery =
      !query ||
      theme.name.toLowerCase().includes(query) ||
      theme.category.toLowerCase().includes(query) ||
      theme.summary.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });
}

function renderCategoryFilter() {
  categoryFilter.replaceChildren();

  for (const category of getCategories()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${category === state.activeCategory ? " is-active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      state.activeCategory = category;
      render();
    });
    categoryFilter.append(button);
  }
}

function createSwatch(color) {
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.background = color;
  return swatch;
}

function renderThemeCard(theme) {
  const template = document.querySelector("#theme-card-template");
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".theme-card");

  fragment.querySelector(".theme-card-category").textContent = theme.category;
  fragment.querySelector(".theme-card-title").textContent = theme.name;
  fragment.querySelector(".theme-card-summary").textContent = theme.summary;

  const swatchRow = fragment.querySelector(".swatch-row");
  [
    theme.dark.accent,
    theme.dark.surface,
    theme.dark.ink,
    theme.light.accent,
    theme.light.surface,
  ].forEach((color) => swatchRow.append(createSwatch(color)));

  fragment.querySelector(".button-card").addEventListener("click", () => {
    state.selectedId = theme.id;
    renderSelectedTheme();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if (theme.id === state.selectedId) {
    card.style.borderColor = "rgba(255, 122, 26, 0.45)";
    card.style.background = "rgba(30, 20, 16, 0.82)";
  }

  return fragment;
}

function renderThemeGrid() {
  const visibleThemes = getVisibleThemes();
  themeGrid.replaceChildren();

  if (!visibleThemes.some((theme) => theme.id === state.selectedId)) {
    state.selectedId = visibleThemes[0]?.id ?? themes[0].id;
  }

  if (visibleThemes.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No themes matched that search. Try a broader term or another category.";
    themeGrid.append(emptyState);
    return;
  }

  visibleThemes.forEach((theme) => themeGrid.append(renderThemeCard(theme)));
}

function renderThemeFrame(container, theme, variantLabel) {
  container.replaceChildren();
  container.style.background = theme.surface;
  container.style.color = theme.ink;

  const header = document.createElement("div");
  header.className = "theme-frame-header";

  const brand = document.createElement("span");
  brand.className = "theme-frame-brand";
  brand.textContent = "Codex";

  const badge = document.createElement("span");
  badge.className = "theme-frame-badge";
  badge.textContent = variantLabel;
  badge.style.color = theme.accent;

  header.append(brand, badge);

  const sidebar = document.createElement("div");
  sidebar.className = "theme-frame-sidebar";
  sidebar.style.outline = `1px solid ${theme.accent}33`;

  for (let index = 0; index < 3; index += 1) {
    const line = document.createElement("span");
    line.style.background = index === 0 ? `${theme.accent}55` : `${theme.ink}22`;
    sidebar.append(line);
  }

  container.append(header, sidebar);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
}

async function copyText(button, text) {
  const label = button.textContent;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else if (!fallbackCopyText(text)) {
      throw new Error("Clipboard unavailable");
    }

    button.textContent = "Copied";
    button.classList.add("is-copied");
    window.setTimeout(() => {
      button.textContent = label;
      button.classList.remove("is-copied");
    }, 1400);
  } catch {
    button.textContent = "Copy failed";
    window.setTimeout(() => {
      button.textContent = label;
    }, 1600);
  }
}

function renderSelectedTheme() {
  const theme = themes.find((entry) => entry.id === state.selectedId) ?? themes[0];
  const lightShareString = themeVariantToShareString(theme.light, "light");
  const darkShareString = themeVariantToShareString(theme.dark, "dark");

  selectedName.textContent = theme.name;
  selectedCollection.textContent = theme.category;
  selectedSummary.textContent = theme.summary;

  renderThemeFrame(lightPreview, theme.light, "light");
  renderThemeFrame(darkPreview, theme.dark, "dark");

  lightString.textContent = lightShareString;
  darkString.textContent = darkShareString;

  copyLightButton.onclick = () => copyText(copyLightButton, lightShareString);
  copyDarkButton.onclick = () => copyText(copyDarkButton, darkShareString);
}

function render() {
  renderCategoryFilter();
  renderThemeGrid();
  renderSelectedTheme();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.currentTarget.value;
  render();
});

render();
