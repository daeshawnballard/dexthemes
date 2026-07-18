import { App } from "@modelcontextprotocol/ext-apps";

const root = document.getElementById("app");
const app = new App(
  { name: "DexThemes", version: "1.1.0" },
  {},
  { autoResize: true, strict: true },
);
const HEX = /^#[0-9A-Fa-f]{6}$/;

const ACHIEVEMENTS = {
  create_theme: { icon: "🎨", label: "Theme Creator", reward: "Seraphim" },
  share_x: { icon: "📣", label: "Shared Signal", reward: "Mint Condition" },
  sign_in: { icon: "💘", label: "Signed In", reward: "Cupid's Code" },
  like_theme: { icon: "♥", label: "First Like", reward: "Heartbeat" },
  top10_monthly: { icon: "🏔", label: "Monthly Top 10", reward: "Summit" },
  use_api: { icon: "🧱", label: "API Builder", reward: "The Builder" },
  color_me_lucky: { icon: "✦", label: "Color Me Lucky", reward: "Kaleidoscope" },
  agent_use: { icon: "🤖", label: "Agent Use", reward: "Agent Claw" },
  install_pwa: { icon: "⌂", label: "Home Screen", reward: "Homebase" },
  complete_pair: { icon: "☯", label: "Complete Pair", reward: "Yin & Yang" },
  use_plugin: { icon: "⌁", label: "Plugin Connected", reward: "Plugged In" },
  create_theme_with_plugin: { icon: "◉", label: "Plugin Creator", reward: "Voiceprint" },
  openai_employee: { icon: "◎", label: "OpenAI is nothing without its people", reward: "Human Spark" },
  theme_of_day: { icon: "☀", label: "Theme of the Day", reward: "Golden Hour" },
  theme_of_week: { icon: "★", label: "Theme of the Week", reward: "Headliner" },
  window_controls: { icon: "•••", label: "Easter Egg", reward: "Easter Egg" },
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function safeHex(value, fallback) {
  return HEX.test(String(value || "")) ? String(value).toUpperCase() : fallback;
}

function setVariantProperties(node, variant = {}) {
  node.style.setProperty("--theme-surface", safeHex(variant.surface, "#111318"));
  node.style.setProperty("--theme-ink", safeHex(variant.ink, "#F4F5F7"));
  node.style.setProperty("--theme-accent", safeHex(variant.accent, "#6F7CFF"));
  node.style.setProperty("--theme-skill", safeHex(variant.skill, "#B596F4"));
  node.style.setProperty("--theme-added", safeHex(variant.diffAdded, "#46C889"));
  node.style.setProperty("--theme-removed", safeHex(variant.diffRemoved, "#E65E68"));
  node.style.setProperty("--theme-sidebar", safeHex(variant.sidebar, safeHex(variant.surface, "#0C0E12")));
  node.style.setProperty("--theme-code", safeHex(variant.codeBg, safeHex(variant.surface, "#0A0C10")));
}

function makeButton(className, label, handler) {
  const node = element("button", className, label);
  node.type = "button";
  if (handler) node.addEventListener("click", handler);
  return node;
}

function renderLoading(message = "Loading DexThemes…") {
  const shell = element("main", "shell loading-shell");
  shell.append(element("span", "loading-orb"), element("p", "empty", message));
  root.replaceChildren(shell);
}

function errorText(result, fallback) {
  return result?.content?.find((item) => item.type === "text")?.text || fallback;
}

async function callToolAndRender(name, args, back) {
  renderLoading();
  try {
    const result = await app.callServerTool({ name, arguments: args });
    if (result?.isError) {
      const shell = element("main", "shell");
      shell.append(element("span", "brand", "DEXTHEMES"));
      shell.append(element("h2", "theme-name", "That did not work"));
      shell.append(element("p", "notice", errorText(result, "DexThemes could not complete that request.")));
      if (back) shell.append(makeButton("secondary-button", "Go back", () => renderResult({ structuredContent: back })));
      root.replaceChildren(shell);
      return;
    }
    renderResult(result, { back });
  } catch {
    const shell = element("main", "shell");
    shell.append(element("h2", "theme-name", "Connection interrupted"));
    shell.append(element("p", "notice", "The host could not complete that DexThemes action. Nothing was changed."));
    if (back) shell.append(makeButton("secondary-button", "Go back", () => renderResult({ structuredContent: back })));
    root.replaceChildren(shell);
  }
}

function miniCodexPreview(theme, preferredVariant) {
  const variant = theme?.[preferredVariant] || theme?.dark || theme?.light || {};
  const preview = element("div", "mini-codex");
  setVariantProperties(preview, variant);
  const titlebar = element("div", "mini-titlebar");
  const dots = element("span", "window-dots");
  dots.append(element("i"), element("i"), element("i"));
  titlebar.append(dots, element("span", "mini-title", "Codex"));
  const body = element("div", "mini-body");
  const rail = element("span", "mini-rail");
  rail.append(element("i"), element("i"), element("i"));
  const content = element("span", "mini-content");
  content.append(element("i", "mini-line mini-line--accent"));
  content.append(element("i", "mini-line mini-line--long"));
  content.append(element("i", "mini-line"));
  content.append(element("i", "mini-line mini-line--code"));
  body.append(rail, content);
  preview.append(titlebar, body);
  return preview;
}

function codexMock(variant) {
  const preview = element("div", "codex-mock");
  setVariantProperties(preview, variant);
  const titlebar = element("div", "mock-titlebar");
  const dots = element("span", "window-dots");
  dots.append(element("i"), element("i"), element("i"));
  titlebar.append(dots, element("span", "mock-window-title", "Codex"), element("span", "mock-status", "Local"));

  const workspace = element("div", "mock-workspace");
  const sidebar = element("aside", "mock-sidebar");
  sidebar.append(element("span", "mock-logo", "D"));
  sidebar.append(element("span", "mock-nav mock-nav--active"));
  sidebar.append(element("span", "mock-nav"));
  sidebar.append(element("span", "mock-nav"));

  const thread = element("section", "mock-thread");
  const prompt = element("div", "mock-user-message", "Make the workspace feel focused and unmistakably mine.");
  const answer = element("div", "mock-answer");
  answer.append(element("span", "mock-answer-label", "Theme preview"));
  answer.append(element("strong", "", "Done — both the interface and code colors stay in balance."));
  const answerCopy = element("span", "mock-answer-copy", "Accent, skill, added, and removed states remain distinct at a glance.");
  answer.append(answerCopy);
  const diff = element("div", "mock-diff");
  const diffHeader = element("span", "mock-diff-header", "theme.config.json");
  const removed = element("span", "mock-diff-line mock-diff-line--removed", "−  \"accent\": \"default\"");
  const added = element("span", "mock-diff-line mock-diff-line--added", `+  \"accent\": \"${safeHex(variant.accent, "#6F7CFF")}\"`);
  diff.append(diffHeader, removed, added);
  const composer = element("div", "mock-composer");
  composer.append(element("span", "", "Ask anything…"), element("span", "mock-send", "↑"));
  thread.append(prompt, answer, diff, composer);
  workspace.append(sidebar, thread);
  preview.append(titlebar, workspace);
  return preview;
}

function swatchRow(variant) {
  const swatches = element("div", "swatches");
  const values = {
    accent: variant.accent,
    skill: variant.skill,
    added: variant.diffAdded,
    removed: variant.diffRemoved,
  };
  for (const [name, rawColor] of Object.entries(values)) {
    const color = safeHex(rawColor, "#777777");
    const swatch = element("span", "swatch");
    const dot = element("i", "dot");
    dot.style.backgroundColor = color;
    swatch.append(dot, element("span", "swatch-label", name), element("code", "swatch-code", color));
    swatches.append(swatch);
  }
  return swatches;
}

function variantCard(mode, variant, onSelect, interactive = true) {
  const card = element("section", `variant${interactive ? " selectable" : ""}`);
  card.dataset.variant = mode;
  if (interactive) {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", "false");
  }
  setVariantProperties(card, variant);
  const header = element("div", "variant-heading");
  header.append(element("span", "eyebrow", mode), element("span", "selection-label", "Select"));
  card.append(header, codexMock(variant), swatchRow(variant));
  if (interactive) {
    const select = () => onSelect(mode);
    card.addEventListener("click", select);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });
  }
  return card;
}

function renderTheme(theme, extras = {}) {
  const shell = element("main", "shell");
  const header = element("header", "header");
  const copy = element("div", "header-copy");
  copy.append(element("span", "brand", extras.brand || "DEXTHEMES STUDIO"));
  copy.append(element("h2", "theme-name", theme.name));
  if (theme.summary) copy.append(element("p", "summary", theme.summary));
  header.append(copy);
  shell.append(header);

  const variants = element("div", "variant-grid");
  const cards = new Map();
  const available = ["dark", "light"].filter((mode) => theme?.[mode]);
  let selectedVariant = available.includes(extras.initialVariant) ? extras.initialVariant : available[0] || null;
  let applyButton = null;
  const selectVariant = (mode) => {
    selectedVariant = mode;
    cards.forEach((card, cardMode) => {
      const selected = cardMode === mode;
      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
      card.querySelector(".selection-label").textContent = selected
        ? "Selected"
        : extras.lockVariant
          ? "Preview"
          : "Select";
    });
    if (applyButton) applyButton.textContent = `Use ${mode} in Codex`;
  };
  for (const mode of available) {
    const card = variantCard(mode, theme[mode], selectVariant, !extras.lockVariant);
    cards.set(mode, card);
    variants.append(card);
  }
  if (available.length) shell.append(variants);
  selectVariant(selectedVariant);

  if (extras.needsNameConfirmation) {
    shell.append(element("p", "notice", "This name was suggested automatically. Choose or confirm the name before publishing it to the community."));
  }

  if (!extras.hideActions && selectedVariant) {
    const actions = element("div", "action-bar");
    const sourceData = extras.sourceData || { kind: "theme", theme };
    applyButton = makeButton("primary-button", `Use ${selectedVariant} in Codex`, () => {
      callToolAndRender("prepare_theme_apply", { theme, variant: selectedVariant }, sourceData);
    });
    actions.append(applyButton);
    shell.append(actions);
  }
  return shell;
}

function renderThemeList(data) {
  const results = data.results || [];
  const shell = element("main", "shell");
  shell.append(element("span", "brand", "DEXTHEMES DISCOVERY"));
  shell.append(element("h2", "theme-name", `${results.length} visual match${results.length === 1 ? "" : "es"}`));
  shell.append(element("p", "summary", "Choose a theme to inspect its full dark and light Codex mockups without leaving this thread."));
  const list = element("div", "theme-list");
  for (const theme of results) {
    const card = element("button", "theme-tile");
    card.type = "button";
    card.append(miniCodexPreview(theme));
    const text = element("span", "theme-tile-copy");
    text.append(element("strong", "", theme.name));
    text.append(element("small", "", [theme.category, theme.authorName].filter(Boolean).join(" · ") || "DexThemes"));
    if (theme.summary) text.append(element("span", "theme-tile-summary", theme.summary));
    card.append(text);
    card.addEventListener("click", () => callToolAndRender("fetch", { id: theme.id || theme.themeId }, data));
    list.append(card);
  }
  if (!results.length) list.append(element("p", "empty", "No themes matched that idea yet."));
  shell.append(list);
  return shell;
}

function periodName(key) {
  return ({ daily: "Today", weekly: "This week", monthly: "This month", allTime: "All time" })[key] || key;
}

function renderLeaderboard(data) {
  const shell = element("main", "shell");
  shell.append(element("span", "brand", "DEXTHEMES LEADERBOARD"));
  shell.append(element("h2", "theme-name", "What the community is using"));
  shell.append(element("p", "summary", "Rankings favor qualified signed-in adoptions, then unique copies and likes. Select any row for an inline Codex preview."));
  const tabs = element("div", "tabs");
  const board = element("div", "rank-board");
  const keys = ["daily", "weekly", "monthly", "allTime"];

  const show = (activeKey) => {
    [...tabs.children].forEach((tab) => tab.classList.toggle("active", tab.dataset.key === activeKey));
    board.replaceChildren();
    const entries = data[activeKey] || [];
    if (activeKey === "daily" || activeKey === "weekly") {
      const notice = activeKey === "daily"
        ? "The closed-day winner unlocks Golden Hour at 3 unique copies and 1 qualified adoption."
        : "The closed-week winner unlocks Headliner at 5 unique copies and 2 qualified adoptions.";
      board.append(element("p", "ranking-note", notice));
    }
    entries.slice(0, 10).forEach((entry, index) => {
      const row = element("button", "rank-row");
      row.type = "button";
      row.append(element("span", "rank", index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1));
      row.append(miniCodexPreview(entry));
      const main = element("span", "rank-main");
      main.append(element("strong", "rank-name", entry.name));
      main.append(element("small", "", entry.authorName ? `by ${entry.authorName}` : "Community theme"));
      const stats = element("span", "rank-stats");
      const qualified = entry.qualifiedAdoptions ?? (entry.rankingMetric === "qualifiedAdoptions" ? entry.copies : 0);
      stats.append(element("strong", "", `${qualified} qualified`));
      stats.append(element("small", "", `${entry.rawCopies ?? entry.copies ?? 0} copies · ${entry.likes ?? 0} likes`));
      row.append(main, stats);
      row.addEventListener("click", () => callToolAndRender("fetch", { id: entry.themeId }, data));
      board.append(row);
    });
    if (!entries.length) board.append(element("p", "empty", `No ${periodName(activeKey).toLowerCase()} activity yet.`));
  };

  keys.forEach((key) => {
    const tab = makeButton("tab", periodName(key), () => show(key));
    tab.dataset.key = key;
    tabs.append(tab);
  });
  shell.append(tabs, board);
  show("daily");
  return shell;
}

function metricCard(value, label, detail) {
  const card = element("section", "metric-card");
  card.append(element("strong", "metric-value", value ?? 0), element("span", "metric-label", label));
  if (detail) card.append(element("small", "metric-detail", detail));
  return card;
}

function rankCard(key, rank) {
  return metricCard(rank ? `#${rank.rank}` : "—", periodName(key), rank?.name || "No active rank");
}

function formatUtcDate(timestamp) {
  if (!Number.isFinite(timestamp)) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function renderAchievementGrid(unlocks, backData) {
  const byAction = new Map((unlocks || []).map((unlock) => [unlock.action, unlock]));
  const grid = element("div", "achievement-grid");
  for (const [action, info] of Object.entries(ACHIEVEMENTS)) {
    const unlock = byAction.get(action);
    const card = element(unlock?.theme ? "button" : "section", `achievement-card${unlock ? " unlocked" : " locked"}`);
    if (card.tagName === "BUTTON") card.type = "button";
    card.append(element("span", "achievement-icon", info.icon));
    const copy = element("span", "achievement-copy");
    copy.append(element("strong", "", info.label));
    copy.append(element("small", "", unlock ? `Unlocked ${info.reward}` : `Unlocks ${info.reward}`));
    if (action === "openai_employee") copy.append(element("em", "", "Unlocked when GitHub verifies an eligible @openai.com email. DexThemes stores only eligibility."));
    card.append(copy);
    if (unlock?.theme) {
      card.append(miniCodexPreview(unlock.theme));
      card.addEventListener("click", () => renderResult({ structuredContent: { kind: "theme", theme: unlock.theme } }, { back: backData }));
    }
    grid.append(card);
  }
  return grid;
}

function renderProfile(stats) {
  const shell = element("main", "shell profile-shell");
  const user = stats.user || {};
  shell.append(element("span", "brand", "MY DEXTHEMES"));
  shell.append(element("h2", "theme-name", user.displayName || user.username || "Creator dashboard"));
  shell.append(element("p", "summary", "Your themes, current ranks, popularity wins, and achievement collection — all inside the plugin."));

  const totals = stats.creatorTotals || stats.totals || {};
  const metrics = element("div", "metric-grid");
  metrics.append(
    metricCard(totals.submittedThemes || 0, "Published themes"),
    metricCard(totals.totalCopies || 0, "Total copies"),
    metricCard(totals.totalLikes || 0, "Total likes"),
    metricCard(totals.totalQualifiedAdoptions || 0, "Qualified adoptions"),
  );
  shell.append(metrics);

  const rankSection = element("section", "dashboard-section");
  rankSection.append(element("h3", "section-title", "Current best ranks"));
  const ranks = element("div", "rank-summary-grid");
  const leaderboard = stats.leaderboard || {};
  for (const key of ["daily", "weekly", "monthly", "allTime"]) ranks.append(rankCard(key, leaderboard[key]));
  rankSection.append(ranks);
  shell.append(rankSection);

  const wins = stats.popularityWins || {};
  const winsSection = element("section", "dashboard-section");
  winsSection.append(element("h3", "section-title", "Popularity wins"));
  const winMetrics = element("div", "win-metrics");
  winMetrics.append(
    metricCard(wins.daily || 0, "Days at #1", "Every closed UTC day"),
    metricCard(wins.weekly || 0, "Weeks at #1", "Monday–Sunday UTC"),
    metricCard(wins.monthlyTop10 || 0, "Monthly Top 10s", "Final closed UTC months"),
    metricCard(wins.total || 0, "Total wins", "Repeat wins stay in your stats"),
  );
  winsSection.append(winMetrics);
  const history = element("div", "win-history");
  (wins.recent || []).forEach((win) => {
    const row = element("div", "win-row");
    const resultType = win.periodType === "monthly"
      ? `Month #${win.rank || "—"}`
      : win.periodType === "weekly" ? "Week" : "Day";
    row.append(element("span", "win-type", resultType));
    row.append(element("strong", "", win.name || win.themeId));
    row.append(element("span", "", formatUtcDate(win.periodStart)));
    history.append(row);
  });
  if (!(wins.recent || []).length) history.append(element("p", "empty", "Your first finalized popularity result will appear here."));
  winsSection.append(history);
  shell.append(winsSection);

  const achievements = element("section", "dashboard-section");
  const unlockedCount = (stats.achievements || []).length;
  achievements.append(element("h3", "section-title", `Achievements · ${unlockedCount}/${Object.keys(ACHIEVEMENTS).length}`));
  achievements.append(renderAchievementGrid(stats.achievements || [], { kind: "my-stats", stats }));
  shell.append(achievements);
  return shell;
}

function renderUnlocks(data) {
  const shell = element("main", "shell profile-shell");
  shell.append(element("span", "brand", "DEXTHEMES ACHIEVEMENTS"));
  shell.append(element("h2", "theme-name", `${data.unlocks.length} unlocked`));
  shell.append(element("p", "summary", "Unlocked reward themes can be previewed here; select one to see its full Codex mockups."));
  shell.append(renderAchievementGrid(data.unlocks, data));
  return shell;
}

function renderIssue(data) {
  const shell = element("main", "shell");
  shell.append(element("span", "brand", "GITHUB FEEDBACK"));
  shell.append(element("h2", "theme-name", data.title));
  shell.append(element("p", "summary", "Nothing has been posted. This draft is only best-effort redacted; review every character before opening GitHub."));
  if (data.redactionNotice) shell.append(element("p", "notice", data.redactionNotice));
  if (data.redactions?.length) shell.append(element("p", "notice", `Redacted: ${data.redactions.join(", ")}.`));
  const review = element("section", "issue-review");
  review.append(element("strong", "", "Title"), element("pre", "issue-copy", data.title));
  review.append(element("strong", "", "Body"), element("pre", "issue-copy", data.body));
  shell.append(review);
  shell.append(makeButton("primary-button", "Review GitHub issue", () => {
    const url = new URL("https://github.com/daeshawnballard/dexthemes/issues/new");
    url.searchParams.set("title", data.title);
    url.searchParams.set("body", data.body);
    url.searchParams.set("labels", "feedback,plugin");
    app.openLink({ url: url.toString() });
  }));
  return shell;
}

function renderSubmissionReview(data, meta) {
  const shell = renderTheme(data.theme, {
    brand: "PUBLIC SUBMISSION REVIEW",
    hideActions: true,
    hideExternal: true,
  });
  const review = element("section", "submission-review");
  review.append(element("p", "summary", data.publicNotice));
  review.append(element("p", "notice", "Nothing is public yet. Publish only if the exact name, summary, and both mockups are correct."));
  const confirmationToken = meta?.["dexthemes/confirmationToken"];
  const publish = makeButton("primary-button publish-button", "Publish to DexThemes community");
  if (!confirmationToken) {
    publish.disabled = true;
    publish.textContent = "Review token unavailable";
  } else {
    publish.addEventListener("click", async () => {
      publish.disabled = true;
      publish.textContent = "Publishing…";
      try {
        const result = await app.callServerTool({
          name: "submit_theme",
          arguments: { theme: data.theme, confirmationToken },
        });
        if (result.isError) {
          review.append(element("p", "notice", errorText(result, "Theme publication failed.")));
          publish.disabled = false;
          publish.textContent = "Publish to DexThemes community";
          return;
        }
        renderResult(result);
      } catch {
        review.append(element("p", "notice", "The host could not publish the theme. Nothing was changed; review it again before retrying."));
        publish.disabled = false;
        publish.textContent = "Publish to DexThemes community";
      }
    });
  }
  review.append(publish);
  shell.append(review);
  return shell;
}

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the user-gesture fallback below.
    }
  }
  const textarea = element("textarea", "clipboard-fallback");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
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

function renderApply(data) {
  const shell = renderTheme(data.theme, {
    brand: "READY FOR CODEX",
    hideActions: true,
    hideExternal: true,
    initialVariant: data.variant,
    lockVariant: true,
  });
  const handoff = element("section", "apply-handoff");
  handoff.append(element("span", "brand", "SAFE APPLY HANDOFF"));
  handoff.append(element("h3", "section-title", `Import the ${data.variant} variant`));
  const steps = element("ol", "apply-steps");
  steps.append(element("li", "", "Copy the exact import string."));
  steps.append(element("li", "", "Open Codex Settings and choose Appearance."));
  steps.append(element("li", "", "Choose Import theme and paste."));
  handoff.append(steps);
  const code = element("code", "apply-code", data.importString);
  code.tabIndex = 0;
  handoff.append(code);
  const status = element("p", "handoff-status", "No account or community data changes are made by applying a theme.");
  const button = makeButton("primary-button", "Copy & open Settings", async () => {
    button.disabled = true;
    const copied = await copyToClipboard(data.importString);
    if (!copied) {
      status.textContent = "Clipboard access was blocked. Select the import string above and copy it, then open Settings.";
      status.classList.add("handoff-status--warning");
      button.disabled = false;
      button.textContent = "Try copying again";
      if (!handoff.querySelector(".settings-only")) {
        const settingsOnly = makeButton("secondary-button settings-only", "Open Settings", () => app.openLink({ url: data.settingsUrl }));
        handoff.append(settingsOnly);
      }
      return;
    }
    status.textContent = "Copied. Opening Codex Settings — choose Appearance, then Import theme.";
    button.textContent = "Copied — opening Settings…";
    app.openLink({ url: data.settingsUrl });
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = "Copy & open Settings";
    }, 1200);
  });
  handoff.append(status, button);
  shell.append(handoff);
  return shell;
}

function renderSubmitted(data) {
  const shell = element("main", "shell success-shell");
  shell.append(element("span", "success-mark", "✓"));
  shell.append(element("span", "brand", "PUBLISHED"));
  shell.append(element("h2", "theme-name", data.theme?.name || "Theme published"));
  shell.append(element("p", "summary", "The community theme is live under your verified DexThemes identity."));
  if (data.achievements?.length) {
    shell.append(element("p", "notice", `Unlocked: ${data.achievements.map((item) => item.themeName || item.themeId).join(", ")}.`));
  }
  return shell;
}

function addBackNavigation(shell, back) {
  if (!back) return;
  const nav = element("nav", "back-nav");
  nav.append(makeButton("back-button", "← Back", () => renderResult({ structuredContent: back })));
  shell.prepend(nav);
}

function renderResult(params, options = {}) {
  const data = params?.structuredContent;
  let view;
  if (!data) {
    view = element("main", "shell");
    view.append(element("p", "empty", params?.isError ? "DexThemes could not complete that request." : "No preview data returned."));
  } else if (data.kind === "theme" || data.kind === "theme-draft") {
    view = renderTheme(data.theme, { ...data, sourceData: data });
  } else if (data.kind === "theme-submission-review") {
    view = renderSubmissionReview(data, params?._meta);
  } else if (data.kind === "theme-apply") {
    view = renderApply(data);
  } else if (data.kind === "theme-list") {
    view = renderThemeList(data);
  } else if (data.metadata?.dark || data.metadata?.light) {
    view = renderTheme(data.metadata, { sourceData: data });
  } else if (data.kind === "leaderboard") {
    view = renderLeaderboard(data);
  } else if (data.kind === "my-stats") {
    view = renderProfile(data.stats || {});
  } else if (data.kind === "my-unlocks") {
    view = renderUnlocks(data);
  } else if (data.kind === "github-issue") {
    view = renderIssue(data);
  } else if (data.kind === "theme-submitted") {
    view = renderSubmitted(data);
  } else {
    view = element("pre", "json", JSON.stringify(data, null, 2));
  }
  addBackNavigation(view, options.back);
  root.replaceChildren(view);
}

app.addEventListener("toolresult", renderResult);
app.addEventListener("hostcontextchanged", (context) => {
  document.documentElement.dataset.hostTheme = context.theme || "light";
});

await app.connect();
