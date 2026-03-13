const baseTheme = {
  fonts: { code: null, ui: null },
  opaqueWindows: true,
};

const themes = [
  {
    id: "codex-default",
    name: "Codex / Default",
    category: "Built-ins",
    source: "Codex",
    tags: ["Built-in", "Default"],
    summary:
      "Matches the shipped Codex baseline closely, with the dark variant taken from a real export and the light side aligned to the current appearance panel values.",
    light: {
      accent: "#0285FF",
      contrast: 45,
      ink: "#0D0D0D",
      semanticColors: {
        diffAdded: "#00A240",
        diffRemoved: "#E02E2A",
        skill: "#B06DFF",
      },
      surface: "#FFFFFF",
    },
    dark: {
      accent: "#0169CC",
      contrast: 60,
      ink: "#FCFCFC",
      semanticColors: {
        diffAdded: "#00A240",
        diffRemoved: "#E02E2A",
        skill: "#B06DFF",
      },
      surface: "#111111",
    },
  },
  {
    id: "ichigo-bankai",
    name: "Ichigo / Bankai",
    category: "Anime",
    source: "DexThemes",
    tags: ["Inspired", "Anime"],
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
    source: "DexThemes",
    tags: ["Inspired", "Anime"],
    summary:
      "Warm amber and charcoal with a ramen-shop glow instead of a generic neon-orange anime palette.",
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
    source: "DexThemes",
    tags: ["Inspired", "Anime"],
    summary:
      "Straw-hat tan, sea-night navy, and a bright red accent tuned to stay playful rather than aggressive.",
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
    source: "DexThemes",
    tags: ["Inspired", "Brand"],
    summary:
      "Clean aluminum neutrals, reserved blue accents, and a softer foreground contrast for a premium utility feel.",
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
    source: "DexThemes",
    tags: ["Inspired", "Game"],
    summary:
      "A split red-and-cyan look that stays sharp without making the interface feel like toy plastic.",
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
    source: "DexThemes",
    tags: ["Inspired", "Editor"],
    summary:
      "A merge-heavy dark scheme with punchier diff colors and less washed-out chrome than standard dev themes.",
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
    source: "DexThemes",
    tags: ["Inspired", "Brand"],
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
    source: "DexThemes",
    tags: ["Original", "Anime"],
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
  activeSource: "All",
  query: "",
  selectedId: themes[0].id,
};

const categoryFilter = document.querySelector("#category-filter");
const sourceFilter = document.querySelector("#source-filter");
const themeGrid = document.querySelector("#theme-grid");
const searchInput = document.querySelector("#search-input");
const copyLightButton = document.querySelector("#copy-light");
const copyDarkButton = document.querySelector("#copy-dark");

const selectedName = document.querySelector("#selected-name");
const selectedCategory = document.querySelector("#selected-category");
const selectedSource = document.querySelector("#selected-source");
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

function getSources() {
  return ["All", ...new Set(themes.map((theme) => theme.source))];
}

function getVisibleThemes() {
  const query = state.query.trim().toLowerCase();

  return themes.filter((theme) => {
    const matchesCategory =
      state.activeCategory === "All" || theme.category === state.activeCategory;

    const matchesSource =
      state.activeSource === "All" || theme.source === state.activeSource;

    const matchesQuery =
      !query ||
      theme.name.toLowerCase().includes(query) ||
      theme.category.toLowerCase().includes(query) ||
      theme.source.toLowerCase().includes(query) ||
      theme.summary.toLowerCase().includes(query) ||
      theme.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesCategory && matchesSource && matchesQuery;
  });
}

function renderFilterRow(container, values, activeValue, onSelect) {
  container.replaceChildren();

  for (const value of values) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${value === activeValue ? " is-active" : ""}`;
    button.textContent = value;
    button.addEventListener("click", () => onSelect(value));
    container.append(button);
  }
}

function renderCategoryFilter() {
  renderFilterRow(categoryFilter, getCategories(), state.activeCategory, (value) => {
    state.activeCategory = value;
    render();
  });
}

function renderSourceFilter() {
  renderFilterRow(sourceFilter, getSources(), state.activeSource, (value) => {
    state.activeSource = value;
    render();
  });
}

function createSwatch(color) {
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.background = color;
  return swatch;
}

function createTag(tagText) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = tagText;
  return tag;
}

function buildCodexWindow(theme, variantLabel, compact = false) {
  const windowEl = document.createElement("div");
  windowEl.className = "codex-window";
  windowEl.style.background = theme.surface;
  windowEl.style.color = theme.ink;

  const topbar = document.createElement("div");
  topbar.className = "codex-window-topbar";
  topbar.style.background = `${theme.ink}08`;

  const traffic = document.createElement("div");
  traffic.className = "codex-traffic";

  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");
    traffic.append(dot);
  }

  const titlebar = document.createElement("div");
  titlebar.className = "codex-titlebar";
  titlebar.textContent = "Codex";

  const badge = document.createElement("span");
  badge.className = "codex-titlebar-badge";
  badge.textContent = variantLabel;
  badge.style.color = theme.accent;
  titlebar.append(badge);

  topbar.append(traffic, titlebar);

  const body = document.createElement("div");
  body.className = "codex-window-body";

  const sidebar = document.createElement("aside");
  sidebar.className = "codex-sidebar";
  sidebar.style.background = `${theme.ink}08`;

  const sidebarLabel = document.createElement("div");
  sidebarLabel.className = "codex-sidebar-label";
  sidebarLabel.textContent = "Threads";
  sidebar.append(sidebarLabel);

  ["Theme gallery", "Import test", "Prompt pack"].forEach((label, index) => {
    const row = document.createElement("div");
    row.className = `codex-nav-item${index === 0 ? " is-active" : ""}`;
    row.style.background = index === 0 ? `${theme.accent}22` : "transparent";
    row.style.color = index === 0 ? theme.accent : theme.ink;

    const dot = document.createElement("span");
    dot.className = "codex-nav-item-dot";
    const text = document.createElement("span");
    text.textContent = compact ? label.split(" ")[0] : label;

    row.append(dot, text);
    sidebar.append(row);
  });

  const main = document.createElement("section");
  main.className = "codex-main";

  const threadHeader = document.createElement("div");
  threadHeader.className = "codex-thread-header";
  threadHeader.style.background = `${theme.ink}04`;

  const title = document.createElement("span");
  title.className = "codex-thread-title";
  title.textContent = compact ? "Preview" : "Theme preview";

  const meta = document.createElement("span");
  meta.className = "codex-thread-meta";
  meta.textContent = compact ? "Codex" : `${theme.accent} accent`;

  threadHeader.append(title, meta);

  const chat = document.createElement("div");
  chat.className = "codex-chat";

  const userMessage = document.createElement("div");
  userMessage.className = "codex-message is-user";
  userMessage.style.background = `${theme.accent}18`;
  userMessage.style.borderColor = `${theme.accent}2F`;
  userMessage.textContent = compact
    ? "Try this theme"
    : "Show me what this theme looks like in Codex.";

  const assistantMessage = document.createElement("div");
  assistantMessage.className = "codex-message";
  assistantMessage.style.background = `${theme.ink}08`;
  assistantMessage.textContent = compact
    ? "Preview ready"
    : "Compact app preview with sidebar, thread chrome, diff colors, and input state.";

  const codeCard = document.createElement("div");
  codeCard.className = "codex-code";
  codeCard.style.background = `${theme.ink}07`;

  ["is-mid", "is-short", ""].forEach((lineType, index) => {
    const line = document.createElement("div");
    line.className = `codex-code-line${lineType ? ` ${lineType}` : ""}`;
    line.style.background = index === 0 ? `${theme.accent}44` : `${theme.ink}20`;
    codeCard.append(line);
  });

  const diffRow = document.createElement("div");
  diffRow.className = "codex-code-diff";

  const diffAdded = document.createElement("span");
  diffAdded.style.background = `${theme.semanticColors.diffAdded}88`;
  const diffRemoved = document.createElement("span");
  diffRemoved.style.background = `${theme.semanticColors.diffRemoved}88`;
  const diffSkill = document.createElement("span");
  diffSkill.style.background = `${theme.semanticColors.skill}88`;
  diffRow.append(diffAdded, diffRemoved, diffSkill);
  codeCard.append(diffRow);

  chat.append(userMessage, assistantMessage, codeCard);

  const inputRow = document.createElement("div");
  inputRow.className = "codex-input-row";

  const input = document.createElement("div");
  input.className = "codex-input";
  input.style.background = `${theme.ink}07`;
  input.style.borderColor = `${theme.ink}14`;

  const inputText = document.createElement("span");
  inputText.textContent = compact ? "Theme input" : "Paste import string or ask for a new palette";

  const send = document.createElement("span");
  send.textContent = "Send";
  send.style.background = `${theme.accent}20`;
  send.style.color = theme.accent;

  input.append(inputText, send);
  inputRow.append(input);

  main.append(threadHeader, chat, inputRow);
  body.append(sidebar, main);
  windowEl.append(topbar, body);

  return windowEl;
}

function renderThemeCard(theme) {
  const template = document.querySelector("#theme-card-template");
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".theme-card");

  fragment.querySelector(".theme-card-category").textContent = theme.category;
  fragment.querySelector(".theme-card-source").textContent = theme.source;
  fragment.querySelector(".theme-card-title").textContent = theme.name;
  fragment.querySelector(".theme-card-summary").textContent = theme.summary;

  const preview = fragment.querySelector(".theme-card-preview");
  preview.append(buildCodexWindow(theme.dark, "dark", true));

  const swatchRow = fragment.querySelector(".swatch-row");
  [
    theme.dark.accent,
    theme.dark.surface,
    theme.dark.ink,
    theme.light.accent,
    theme.light.surface,
  ].forEach((color) => swatchRow.append(createSwatch(color)));

  const tagRow = fragment.querySelector(".theme-card-tags");
  theme.tags.forEach((tagText) => tagRow.append(createTag(tagText)));

  fragment.querySelector(".button-card").addEventListener("click", () => {
    state.selectedId = theme.id;
    renderSelectedTheme();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if (theme.id === state.selectedId) {
    card.style.borderColor = "rgba(255, 122, 26, 0.38)";
    card.style.background = "rgba(27, 18, 14, 0.86)";
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
    emptyState.textContent =
      "No themes matched that filter. Try another category, source, or search term.";
    themeGrid.append(emptyState);
    return;
  }

  visibleThemes.forEach((theme) => themeGrid.append(renderThemeCard(theme)));
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
  selectedCategory.textContent = theme.category;
  selectedSource.textContent = theme.source;
  selectedSummary.textContent = theme.summary;

  lightPreview.replaceChildren(buildCodexWindow(theme.light, "light"));
  darkPreview.replaceChildren(buildCodexWindow(theme.dark, "dark"));

  lightString.textContent = lightShareString;
  darkString.textContent = darkShareString;

  copyLightButton.onclick = () => copyText(copyLightButton, lightShareString);
  copyDarkButton.onclick = () => copyText(copyDarkButton, darkShareString);
}

function render() {
  renderCategoryFilter();
  renderSourceFilter();
  renderThemeGrid();
  renderSelectedTheme();
}

searchInput.addEventListener("input", (event) => {
  state.query = event.currentTarget.value;
  render();
});

render();
