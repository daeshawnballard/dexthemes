const pageRoot = document.querySelector('#page-content');
const toast = document.querySelector('#toast');
let appShellMode = 'preview';

const icon = {
  arrow: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M8 5h7v7"/>
    </svg>`,
  chevron: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m7 4 6 6-6 6"/>
    </svg>`,
  search: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="9" cy="9" r="5.7"></circle>
      <path d="m13.3 13.3 3.2 3.2"></path>
    </svg>`,
  copy: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="6.5" y="6.5" width="9" height="9" rx="2"></rect>
      <path d="M4.5 13.5h-.3a2 2 0 0 1-2-2V4.2a2 2 0 0 1 2-2h7.3a2 2 0 0 1 2 2v.3"></path>
    </svg>`,
  grid: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.4"></rect>
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.4"></rect>
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.4"></rect>
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.4"></rect>
    </svg>`,
  book: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 3.5h4.2A2.8 2.8 0 0 1 10 6.3v10.2a2.8 2.8 0 0 0-2.8-2.8H3z"></path>
      <path d="M17 3.5h-4.2A2.8 2.8 0 0 0 10 6.3v10.2a2.8 2.8 0 0 1 2.8-2.8H17z"></path>
    </svg>`,
  heart: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M16.8 4.2a4 4 0 0 0-5.7 0L10 5.3 8.9 4.2a4 4 0 1 0-5.7 5.7L10 16.7l6.8-6.8a4 4 0 0 0 0-5.7Z"></path>
    </svg>`,
  share: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="14.8" cy="4.3" r="2.2"></circle>
      <circle cx="5.2" cy="10" r="2.2"></circle>
      <circle cx="14.8" cy="15.7" r="2.2"></circle>
      <path d="m7.1 8.9 5.8-3.4M7.1 11.1l5.8 3.4"></path>
    </svg>`,
};

const themes = {
  githubDark: {
    id: 'github-dark',
    name: 'GitHub Dark',
    category: 'Official',
    variant: 'Dark',
    summary: 'GitHub’s familiar deep canvas and high-signal blue, translated for focused work in Codex.',
    surface: '#0d1117',
    sidebar: '#090c10',
    codeBg: '#070a0f',
    ink: '#e6edf3',
    accent: '#58a6ff',
    added: '#3fb950',
    removed: '#f85149',
    skill: '#bc8cff',
  },
  githubLight: {
    id: 'github-light',
    name: 'GitHub Light',
    category: 'Official',
    variant: 'Light',
    summary: 'Crisp white surfaces, familiar blue actions, and GitHub-style contrast.',
    surface: '#ffffff',
    sidebar: '#f6f8fa',
    codeBg: '#f0f2f4',
    ink: '#1f2328',
    accent: '#0969da',
    added: '#1a7f37',
    removed: '#cf222e',
    skill: '#8250df',
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    category: 'Official',
    variant: 'Dark',
    summary: 'A vivid editor classic with pink actions and unmistakable purple depth.',
    surface: '#282a36',
    sidebar: '#21222c',
    codeBg: '#1d1e28',
    ink: '#f8f8f2',
    accent: '#ff79c6',
    added: '#50fa7b',
    removed: '#ff5555',
    skill: '#bd93f9',
  },
  tokyoNight: {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    category: 'Official',
    variant: 'Dark',
    summary: 'Midnight indigo, cool blue signals, and soft neon syntax.',
    surface: '#1a1b26',
    sidebar: '#13141d',
    codeBg: '#101018',
    ink: '#c0caf5',
    accent: '#7aa2f7',
    added: '#9ece6a',
    removed: '#f7768e',
    skill: '#bb9af7',
  },
  oneDark: {
    id: 'one-dark',
    name: 'One Dark',
    category: 'Official',
    variant: 'Dark',
    summary: 'The Atom-era palette recast as a calm, balanced Codex workspace.',
    surface: '#282c34',
    sidebar: '#21252b',
    codeBg: '#1d2025',
    ink: '#abb2bf',
    accent: '#61afef',
    added: '#98c379',
    removed: '#e06c75',
    skill: '#c678dd',
  },
  gruvbox: {
    id: 'gruvbox',
    name: 'Gruvbox',
    category: 'Official',
    variant: 'Dark',
    summary: 'Warm retro contrast with amber actions and an easy-on-the-eyes canvas.',
    surface: '#1d2021',
    sidebar: '#171819',
    codeBg: '#131415',
    ink: '#ebdbb2',
    accent: '#fe8019',
    added: '#b8bb26',
    removed: '#fb4934',
    skill: '#d3869b',
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    category: 'Official',
    variant: 'Dark',
    summary: 'Cool arctic blues and low-noise contrast for long focused sessions.',
    surface: '#2e3440',
    sidebar: '#272c36',
    codeBg: '#242830',
    ink: '#eceff4',
    accent: '#88c0d0',
    added: '#a3be8c',
    removed: '#bf616a',
    skill: '#b48ead',
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    category: 'Official',
    variant: 'Dark',
    summary: 'True black surfaces, clean typography, and electric blue actions.',
    surface: '#000000',
    sidebar: '#000000',
    codeBg: '#000000',
    ink: '#ededed',
    accent: '#006efe',
    added: '#00ad3a',
    removed: '#f13342',
    skill: '#9540d5',
  },
  catppuccinLight: {
    id: 'catppuccin',
    name: 'Catppuccin Latte',
    category: 'Official',
    variant: 'Light',
    summary: 'A soft daylight palette with expressive mauve signals.',
    surface: '#eff1f5',
    sidebar: '#e6e9ef',
    codeBg: '#dce0e8',
    ink: '#4c4f69',
    accent: '#8839ef',
    added: '#40a02b',
    removed: '#d20f39',
    skill: '#8839ef',
  },
  solarizedLight: {
    id: 'solarized',
    name: 'Solarized Light',
    category: 'Official',
    variant: 'Light',
    summary: 'Warm paper, measured contrast, and a blue accent developers know by heart.',
    surface: '#fdf6e3',
    sidebar: '#f5eedb',
    codeBg: '#eee8d5',
    ink: '#657b83',
    accent: '#268bd2',
    added: '#859900',
    removed: '#dc322f',
    skill: '#6c71c4',
  },
  everforestLight: {
    id: 'everforest',
    name: 'Everforest Light',
    category: 'Official',
    variant: 'Light',
    summary: 'A warm, organic palette with soft green hierarchy.',
    surface: '#fdf6e3',
    sidebar: '#f5efdd',
    codeBg: '#eee9d7',
    ink: '#5c6a72',
    accent: '#93b259',
    added: '#8da101',
    removed: '#f85552',
    skill: '#df69ba',
  },
  notionLight: {
    id: 'notion',
    name: 'Notion Light',
    category: 'Official',
    variant: 'Light',
    summary: 'Minimal white space and a clean blue action system.',
    surface: '#ffffff',
    sidebar: '#f7f6f3',
    codeBg: '#ffffff',
    ink: '#37352f',
    accent: '#3183d8',
    added: '#00a240',
    removed: '#ba2623',
    skill: '#924ff7',
  },
  xcodeLight: {
    id: 'xcode',
    name: 'Xcode Light',
    category: 'Official',
    variant: 'Light',
    summary: 'Bright native surfaces and crisp blue interaction states.',
    surface: '#ffffff',
    sidebar: '#f4f4f5',
    codeBg: '#ffffff',
    ink: '#000000',
    accent: '#0e0eff',
    added: '#00a240',
    removed: '#c41a16',
    skill: '#0e0eff',
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai',
    category: 'Official',
    variant: 'Dark',
    summary: 'An enduring high-energy editor palette with punchy pink actions.',
    surface: '#272822',
    sidebar: '#1f201b',
    codeBg: '#1b1c17',
    ink: '#f8f8f2',
    accent: '#f92672',
    added: '#a6e22e',
    removed: '#f92672',
    skill: '#ae81ff',
  },
  mistlake: {
    id: 'mistlake',
    name: 'Mistlake',
    category: 'Community',
    author: 'Nomad-stack-design',
    variant: 'Dark + light',
    summary: 'Cool lake water, soft teal signals, and a quiet misty surface.',
    surface: '#14272b',
    sidebar: '#102125',
    codeBg: '#0e1e22',
    ink: '#d7e2e3',
    accent: '#70b4be',
    added: '#76c29c',
    removed: '#ec8792',
    skill: '#b5a1dd',
  },
  sageEmber: {
    id: 'sage-ember',
    name: 'Sage & Ember',
    category: 'Community',
    author: 'topothemorn',
    variant: 'Dark + light',
    summary: 'Earthy sage surfaces with a bright ember action color.',
    surface: '#20241c',
    sidebar: '#171b15',
    codeBg: '#262c22',
    ink: '#ede7d8',
    accent: '#e67e22',
    added: '#5fbf72',
    removed: '#f25c3a',
    skill: '#f2b84b',
  },
  terracottaForest: {
    id: 'terracotta-forest',
    name: 'Terracotta Forest',
    category: 'Community',
    author: 'abc0008',
    variant: 'Dark + light',
    summary: 'Forest greens, kiln-fired terracotta, and warm grounded neutrals.',
    surface: '#1c1c1c',
    sidebar: '#1f352a',
    codeBg: '#3f3f3f',
    ink: '#ffffff',
    accent: '#cf5436',
    added: '#52664d',
    removed: '#cf5436',
    skill: '#c89b3c',
  },
  solarDrift: {
    id: 'solar-drift',
    name: 'Solar Drift',
    category: 'Community',
    author: 'Daeshawn Ballard',
    variant: 'Dark',
    summary: 'Deep orbital graphite with a vivid violet signal.',
    surface: '#121117',
    sidebar: '#0e0d12',
    codeBg: '#0c0b0f',
    ink: '#e4e3e8',
    accent: '#6144e4',
    added: '#d16147',
    removed: '#47d161',
    skill: '#c5d775',
  },
  solace: {
    id: 'solace-and-serenity',
    name: 'Solace and Serenity',
    category: 'Community',
    author: 'Daeshawn Ballard',
    variant: 'Dark + light',
    summary: 'Still water, soft teal, and a place of quiet focus.',
    surface: '#0e1a1e',
    sidebar: '#091316',
    codeBg: '#060f12',
    ink: '#d4e9ef',
    accent: '#4db6ac',
    added: '#80cbc4',
    removed: '#ef9a9a',
    skill: '#90caf9',
  },
  journey: {
    id: 'journey-for-wisdom',
    name: 'The Journey for Wisdom',
    category: 'Community',
    author: 'Daeshawn Ballard',
    variant: 'Dark + light',
    summary: 'Ancient gold, parchment, and the warmth of earned knowledge.',
    surface: '#1a1610',
    sidebar: '#141009',
    codeBg: '#100c06',
    ink: '#e8dcc8',
    accent: '#d4a030',
    added: '#81c784',
    removed: '#e57373',
    skill: '#ba68c8',
  },
};

const guides = {
  'guide-install': {
    url: '/guides/how-to-install-a-codex-theme',
    eyebrow: 'Guide · Getting started',
    title: 'Install a Codex theme in under a minute.',
    lede: 'A clear, screenshot-friendly walkthrough for moving any DexThemes palette into Codex without implying a one-click install.',
    answer: 'Choose a theme and variant, copy its exact import string, then open Codex Settings → Appearance → Import theme and paste it. DexThemes opens Settings for you, but Codex always keeps the final import under your control.',
    accent: '#4aa7f8',
    readTime: '3 min read',
    visual: 'install',
    sections: [
      {
        title: 'Choose a theme and the right variant',
        body: 'Preview the full Codex mockup before copying anything. Some themes include dark and light variants; others are intentionally one-sided.',
        points: [
          'Open a theme page and inspect the complete interface preview.',
          'Choose Dark or Light when both variants are available.',
          'Confirm the theme name and selected variant beside the copy action.',
        ],
      },
      {
        title: 'Copy the exact import string',
        body: 'Use the copy action on the selected theme. The import string carries the palette Codex needs, so there is no file editing or manual color entry.',
        points: [
          'Copy the complete string without trimming or changing it.',
          'DexThemes does not need access to your local Codex files.',
          'Nothing is applied until you approve the import inside Codex.',
        ],
        callout: 'If your browser blocks clipboard access, select the visible import string and copy it manually.',
      },
      {
        title: 'Import it from Appearance',
        body: 'DexThemes opens Codex Settings. From there, choose Appearance, select Import theme, paste the string, and review the result.',
        points: [
          'Open Settings → Appearance.',
          'Choose Import theme and paste the copied string.',
          'Confirm the imported theme, then switch back whenever you want.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does DexThemes apply the theme automatically?',
        a: 'No. It copies the exact import string and opens Codex Settings. You choose Appearance, import the theme, and approve the final change.',
      },
      {
        q: 'Does importing a theme modify my project files?',
        a: 'No. The theme changes Codex appearance; it does not edit the repository or project you are working in.',
      },
      {
        q: 'Can I switch back later?',
        a: 'Yes. You can select a different appearance in Codex Settings whenever you want.',
      },
    ],
  },
  'guide-create': {
    url: '/guides/create-a-custom-codex-theme',
    eyebrow: 'Guide · Theme creator',
    title: 'Create a Codex theme that feels unmistakably yours.',
    lede: 'Turn a mood, place, or working style into a complete dark and light palette, then preview it in a Codex-shaped workspace before using it.',
    answer: 'Start with the atmosphere you want, define the core surface, text, accent, and semantic colors, then inspect both variants in a realistic Codex preview. Keep the result private or prepare an original public version for the community.',
    accent: '#8a62f2',
    readTime: '6 min read',
    visual: 'create',
    sections: [
      {
        title: 'Begin with a feeling, not a hex code',
        body: 'Describe the atmosphere you want while you work: quiet and coastal, high-energy and neon, warm and editorial, or something entirely your own.',
        points: [
          'Name the mood, environment, or creative reference.',
          'Say whether you want dark, light, or a coordinated pair.',
          'Add a custom name now or choose one after the first preview.',
        ],
      },
      {
        title: 'Balance the complete color system',
        body: 'A useful Codex theme needs more than a background and accent. Text, sidebar, code surface, added, removed, and skill states all need to remain distinct.',
        points: [
          'Keep foreground text readable against the main surface.',
          'Give added and removed states distinct semantic colors.',
          'Use the accent for action and focus, not every visual detail.',
        ],
        callout: 'The strongest themes have a clear dominant surface and one confident signal color.',
      },
      {
        title: 'Preview, import, then decide whether to publish',
        body: 'Inspect the theme inside a realistic Codex mockup. Once the palette feels right, import it for yourself. Publishing is a separate, explicit step.',
        points: [
          'Review both variants at full size when both exist.',
          'Import the private version before making it public.',
          'Use original public naming and wording for community themes.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I create a theme without publishing it?',
        a: 'Yes. A custom theme can stay private and still be previewed and imported into Codex.',
      },
      {
        q: 'Can a theme have only one variant?',
        a: 'Yes. You can create a dark-only or light-only theme when that is the strongest expression of the idea.',
      },
      {
        q: 'What changes when I publish?',
        a: 'Publishing makes the approved public version discoverable and attributes it to your signed-in DexThemes identity.',
      },
    ],
  },
  'guide-troubleshoot': {
    url: '/guides/codex-theme-import-troubleshooting',
    eyebrow: 'Guide · Troubleshooting',
    title: 'Fix a Codex theme import without guesswork.',
    lede: 'A symptom-first guide for the few places the copy-and-import handoff can go wrong.',
    answer: 'Start by copying the import string again from the exact theme variant, then paste it in Codex Settings → Appearance → Import theme. If Settings opened but nothing changed, that is expected: the theme is never applied until you complete the import in Codex.',
    accent: '#ed5aaf',
    readTime: '4 min read',
    visual: 'troubleshoot',
    sections: [
      {
        title: 'Settings opened, but the theme did not change',
        body: 'Opening Settings is only the handoff. DexThemes cannot silently change your appearance, so Codex waits for you to choose Appearance and import the copied string.',
        points: [
          'Choose Appearance inside the Settings window.',
          'Select Import theme.',
          'Paste the copied string and approve the import.',
        ],
      },
      {
        title: 'Codex rejected the import',
        body: 'The most common cause is an incomplete or edited copy. Return to the theme page, select the intended variant, and copy the full import string again.',
        points: [
          'Do not remove punctuation or surrounding characters.',
          'Avoid copying from a wrapped screenshot or formatted post.',
          'Use the DexThemes copy action or select the full visible string.',
        ],
        callout: 'If clipboard access was denied, the page should keep the import string visible so you can copy it manually.',
      },
      {
        title: 'The theme imported, but it looks different',
        body: 'First confirm that the imported variant matches the one you previewed. Some themes are dark-only or light-only, and system appearance can affect which variant Codex displays.',
        points: [
          'Check the selected variant on the theme page.',
          'Confirm the active appearance in Codex Settings.',
          'Re-import the intended variant if you copied the other one.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Why does the button open general Settings?',
        a: 'DexThemes uses the supported Codex Settings handoff. Choose Appearance from the Settings navigation to finish the import.',
      },
      {
        q: 'Why can’t I find a light variant?',
        a: 'Some themes intentionally ship only a dark or light palette. The theme page should list only variants that actually exist.',
      },
      {
        q: 'Can I retry without damaging anything?',
        a: 'Yes. Copying and reopening Settings does not modify project files or publish community data.',
      },
    ],
  },
};

const categories = {
  'category-dark': {
    url: '/collections/dark',
    eyebrow: 'Browse · Dark themes',
    title: 'Dark themes for deeper focus.',
    lede: 'Low-glare Codex palettes ranging from true black minimalism to warm editor classics.',
    answer: 'Dark Codex themes reduce the brightness of the workspace while keeping actions, diffs, and code states easy to distinguish. Preview the full interface before importing a palette.',
    accent: '#58a6ff',
    chips: ['All dark', 'Official', 'Warm', 'High contrast'],
    themes: [themes.githubDark, themes.dracula, themes.tokyoNight, themes.oneDark, themes.gruvbox, themes.nord],
  },
  'category-light': {
    url: '/collections/light',
    eyebrow: 'Browse · Light themes',
    title: 'Light themes that stay crisp all day.',
    lede: 'Bright Codex workspaces with measured contrast, clear hierarchy, and confident accent colors.',
    answer: 'Light Codex themes use bright surfaces and darker foregrounds for daytime work. Every preview shows the sidebar, code surface, actions, and semantic colors together.',
    accent: '#93b259',
    chips: ['All light', 'Official', 'Warm', 'Minimal'],
    themes: [themes.githubLight, themes.catppuccinLight, themes.solarizedLight, themes.everforestLight, themes.notionLight, themes.xcodeLight],
  },
  'category-classics': {
    url: '/collections/editor-classics',
    eyebrow: 'Collection · Editor classics',
    title: 'The editor classics, tuned for Codex.',
    lede: 'Familiar palettes from years of coding, now previewed across the full Codex workspace.',
    answer: 'Editor-classic themes bring recognizable palettes such as GitHub Dark, Dracula, Monokai, One Dark, Gruvbox, and Solarized into Codex. Use the preview to see how each one treats more than code.',
    accent: '#fe8019',
    chips: ['All classics', 'Dark', 'Light available', 'Warm'],
    themes: [themes.githubDark, themes.dracula, themes.monokai, themes.oneDark, themes.gruvbox, themes.solarizedLight],
  },
  'category-community': {
    url: '/collections/community',
    eyebrow: 'Browse · Community',
    title: 'Themes made by people, not presets.',
    lede: 'Original palettes published by the DexThemes community, each with a creator, a point of view, and a page worth sharing.',
    answer: 'Community themes are original Codex palettes published by DexThemes creators. Creator attribution, available variants, and a full interface preview stay together on the canonical theme page.',
    accent: '#ed5aaf',
    chips: ['All community', 'Dark + light', 'Dark only', 'Newest'],
    themes: [themes.mistlake, themes.sageEmber, themes.terracottaForest, themes.solarDrift, themes.solace, themes.journey],
  },
};

function themeStyle(theme) {
  return [
    `--card-surface:${theme.surface}`,
    `--card-sidebar:${theme.sidebar}`,
    `--card-code:${theme.codeBg}`,
    `--card-ink:${theme.ink}`,
    `--card-accent:${theme.accent}`,
    `--card-added:${theme.added}`,
    `--card-removed:${theme.removed}`,
  ].join(';');
}

function codexStyle(theme) {
  return [
    `--theme-surface:${theme.surface}`,
    `--theme-sidebar:${theme.sidebar}`,
    `--theme-code:${theme.codeBg}`,
    `--theme-ink:${theme.ink}`,
    `--theme-accent:${theme.accent}`,
    `--theme-added:${theme.added}`,
    `--theme-removed:${theme.removed}`,
    `--theme-skill:${theme.skill}`,
  ].join(';');
}

function miniApp(theme) {
  return `
    <div class="mini-app" style="${themeStyle(theme)}" aria-hidden="true">
      <div class="mini-app__bar">Codex</div>
      <div class="mini-app__body">
        <div class="mini-app__rail"><i></i><i></i><i></i></div>
        <div class="mini-app__thread">
          <span class="mini-app__bubble"></span>
          <span class="mini-app__line"></span>
          <span class="mini-app__line mini-app__line--short"></span>
          <span class="mini-app__code"><i></i><i></i></span>
        </div>
      </div>
    </div>`;
}

function codexWindow(theme, compact = false) {
  return `
    <div class="codex-window${compact ? ' codex-window--compact' : ''}" style="${codexStyle(theme)}">
      <div class="codex-titlebar">
        <span class="window-dots"><i></i><i></i><i></i></span>
        <span>Codex</span>
        <span class="codex-status">Local</span>
      </div>
      <div class="codex-workspace">
        <aside class="codex-sidebar" aria-hidden="true">
          <span class="codex-logo">D</span>
          <i class="codex-rail codex-rail--active"></i>
          <i class="codex-rail"></i>
          <i class="codex-rail"></i>
        </aside>
        <div class="codex-thread">
          <div class="codex-user">Make this workspace feel focused and unmistakably mine.</div>
          <div class="codex-answer">
            <small>Theme preview</small>
            <strong>Done — the interface and code colors stay in balance.</strong>
            <p>Actions, skills, additions, and removals remain distinct at a glance.</p>
          </div>
          <div class="codex-diff">
            <span>theme.config.json</span>
            <span class="removed">− &nbsp;"accent": "default"</span>
            <span class="added">+ &nbsp;"accent": "${theme.accent}"</span>
          </div>
          <div class="codex-composer">
            <span>Ask anything…</span>
            <span class="codex-send">↑</span>
          </div>
        </div>
      </div>
    </div>`;
}

function themeCard(theme) {
  const author = theme.author ? `by ${theme.author}` : theme.category;
  const isMockedDetail = theme.id === 'github-dark';
  const href = isMockedDetail ? '#theme-github-dark' : '#theme-github-dark';
  const demoAttribute = isMockedDetail ? '' : ` data-placeholder-theme="${theme.name}"`;

  return `
    <a class="theme-card" href="${href}" style="${themeStyle(theme)}" data-search="${[
      theme.name,
      theme.category,
      theme.variant,
      theme.author || '',
    ].join(' ').toLowerCase()}"${demoAttribute}>
      <div class="theme-card__preview">${miniApp(theme)}</div>
      <div class="theme-card__body">
        <div class="theme-card__meta">
          <span><i></i>${author}</span>
          <span>${theme.variant}</span>
        </div>
        <h3>${theme.name}</h3>
        <p>${theme.summary}</p>
        <span class="theme-card__link">
          ${isMockedDetail ? 'View mocked landing page' : 'Theme page template'}
          ${icon.arrow}
        </span>
      </div>
    </a>`;
}

function breadcrumb(parts) {
  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="#app-shell">DexThemes</a>
      ${parts.map((part, index) => `
        ${icon.chevron}
        ${index === parts.length - 1 ? `<span aria-current="page">${part}</span>` : `<span>${part}</span>`}
      `).join('')}
    </nav>`;
}

function appChatView(theme) {
  return `
    <div class="app-preview-canvas">
      <div class="app-preview-label">
        <span>Interactive workspace preview</span>
        <small>Type in the composer to test the palette in context</small>
      </div>
      ${codexWindow(theme)}
    </div>`;
}

function appThemeDetailsView(theme) {
  const palette = [
    ['Surface', theme.surface],
    ['Sidebar', theme.sidebar],
    ['Accent', theme.accent],
    ['Added', theme.added],
    ['Removed', theme.removed],
    ['Skill', theme.skill],
  ];

  return `
    <article class="app-theme-details">
      <header class="app-details-hero">
        <div>
          <p class="app-details-eyebrow">Official Codex theme · Dark only</p>
          <h2>GitHub <em>Dark</em></h2>
          <p>${theme.summary}</p>
        </div>
        <button class="app-context-action" type="button" data-demo-action="share">
          ${icon.share}
          Share theme
        </button>
      </header>

      <div class="app-details-palette" aria-label="GitHub Dark palette">
        ${palette.map(([label, value]) => `
          <div style="--detail-color:${value}">
            <i></i>
            <span>${label}</span>
            <code>${value.toUpperCase()}</code>
          </div>
        `).join('')}
      </div>

      <section class="app-details-section">
        <div class="app-details-section__heading">
          <span>01</span>
          <div>
            <h3>What changes</h3>
            <p>The palette extends across navigation, conversation surfaces, code, and semantic states.</p>
          </div>
        </div>
        <div class="app-details-facts">
          <div><span>Main workspace</span><strong>#0D1117</strong></div>
          <div><span>Navigation</span><strong>#090C10</strong></div>
          <div><span>Primary action</span><strong>#58A6FF</strong></div>
          <div><span>Code surface</span><strong>#070A0F</strong></div>
        </div>
      </section>

      <section class="app-details-section">
        <div class="app-details-section__heading">
          <span>02</span>
          <div>
            <h3>How to use it</h3>
            <p>DexThemes prepares the exact palette while Codex keeps the final import under your control.</p>
          </div>
        </div>
        <ol class="app-details-steps">
          <li><b>1</b><span><strong>Copy the theme</strong><small>Use the selected dark variant in the panel.</small></span></li>
          <li><b>2</b><span><strong>Open Appearance</strong><small>DexThemes opens general Codex Settings.</small></span></li>
          <li><b>3</b><span><strong>Paste and import</strong><small>You approve the final appearance change.</small></span></li>
        </ol>
      </section>

      <aside class="app-details-note">
        <span>Good to know</span>
        <p>Viewing theme details does not leave the app or change the selected palette. The public URL remains useful for search, social links, and people arriving from outside DexThemes.</p>
      </aside>
    </article>`;
}

function renderAppShell() {
  const theme = themes.githubDark;
  const detailsSelected = appShellMode === 'details';
  document.title = 'DexThemes app navigation and theme details concept';
  pageRoot.innerHTML = `
    <section class="app-concept page-enter" style="${codexStyle(theme)}">
      <aside class="app-concept-sidebar">
        <div class="app-concept-sidebar__header">
          <a class="app-concept-brand" href="#app-shell" aria-label="DexThemes">
            <img src="../../logos/logo.png" alt="" width="32" height="32">
            <span><strong>DexThemes</strong><small>Discover &amp; create Codex themes</small></span>
          </a>
          <button class="app-create-button" type="button" data-demo-action="create">
            <span>＋</span>
            Create a theme
          </button>
          <label class="app-search">
            ${icon.search}
            <input type="search" placeholder="Search themes…" aria-label="Search themes in the app mockup">
          </label>
        </div>

        <nav class="app-theme-nav" aria-label="Theme catalog">
          <div class="app-theme-group">
            <button type="button"><span>Codex</span><small>27</small></button>
            <div>
              <a class="active" href="#app-shell"><i style="--nav-color:#58a6ff"></i>GitHub Dark</a>
              <a href="#app-shell"><i style="--nav-color:#cba6f7"></i>Catppuccin</a>
              <a href="#app-shell"><i style="--nav-color:#ff79c6"></i>Dracula</a>
            </div>
          </div>
          <div class="app-theme-group">
            <button type="button"><span>DexThemes</span><small>90</small></button>
          </div>
          <div class="app-theme-group">
            <button type="button"><span>Community</span><small>12</small></button>
          </div>
        </nav>

        <div class="app-concept-sidebar__footer">
          <nav class="app-explore" aria-label="Explore DexThemes">
            <span class="app-explore__label">Explore</span>
            <a href="#collection-hub">
              <span class="app-explore__icon">${icon.grid}</span>
              <span><strong>Theme collections</strong><small>Browse by mood and source</small></span>
              ${icon.chevron}
            </a>
            <a href="#guide-hub">
              <span class="app-explore__icon">${icon.book}</span>
              <span><strong>Guides</strong><small>Install, create, troubleshoot</small></span>
              ${icon.chevron}
            </a>
          </nav>
          <button class="app-signin" type="button" data-demo-action="signin">
            <span class="app-avatar">D</span>
            <span>Continue with GitHub</span>
          </button>
          <p>Made with love by <strong>@Daeshawn</strong></p>
          <small>Community-built. Not affiliated with OpenAI.</small>
        </div>
      </aside>

      <section class="app-concept-stage">
        <header class="app-stage-header">
          <div class="app-stage-title">
            <h1>GitHub Dark</h1>
            <p>${detailsSelected ? 'Palette, installation, and provenance in one scrollable view.' : 'GitHub’s familiar deep canvas and high-signal blue.'}</p>
          </div>
          <div class="app-stage-actions">
            <div class="app-view-switch" role="group" aria-label="Choose theme view">
              <button type="button" data-app-view="preview" aria-pressed="${!detailsSelected}" class="${!detailsSelected ? 'active' : ''}">
                Chat preview
              </button>
              <button type="button" data-app-view="details" aria-pressed="${detailsSelected}" class="${detailsSelected ? 'active' : ''}">
                Theme details
              </button>
            </div>
            <button class="app-icon-button" type="button" aria-label="Like GitHub Dark" data-demo-action="like">
              ${icon.heart}
            </button>
          </div>
        </header>

        <div class="app-stage-content" data-app-stage-content>
          ${detailsSelected ? appThemeDetailsView(theme) : appChatView(theme)}
        </div>
      </section>

      <aside class="app-concept-panel">
        <div class="app-panel-heading">
          <span>Variants</span>
          <small>1 available</small>
        </div>
        <button class="app-variant-card selected" type="button" aria-pressed="true">
          <span class="app-variant-card__label">
            <strong>Dark</strong>
            <small>Selected</small>
          </span>
          ${miniApp(theme)}
        </button>
        <button class="app-variant-missing" type="button" data-demo-action="request-light">
          <span>☼</span>
          <span><strong>Light unavailable</strong><small>Request this variant</small></span>
        </button>
        <div class="app-panel-palette">
          <span>Accent color</span>
          <div><i style="--dot:#58a6ff"></i><code>#58A6FF</code></div>
        </div>
        <div class="app-panel-spacer"></div>
        <button class="app-panel-apply" type="button" data-demo-action="copy">
          ${icon.copy}
          Copy theme &amp; open Settings
        </button>
        <p class="app-panel-hint">Then choose Appearance → Import theme in Codex.</p>
      </aside>
    </section>`;
}

function renderGuideHub() {
  document.title = 'DexThemes guides hub — page concept';
  pageRoot.innerHTML = `
    <div class="hub-page page-enter" style="--page-accent:#4aa7f8">
      <section class="hub-hero">
        ${breadcrumb(['Guides'])}
        <p class="eyebrow">Learn · DexThemes guides</p>
        <h1 class="display-title">Make Codex yours, with confidence.</h1>
        <p class="lede">Short, answer-first guides for installing, creating, and fixing themes without digging through product documentation.</p>
        <div class="meta-row">
          <span class="meta-pill"><i></i> /guides</span>
          <span class="meta-pill">Three starting guides</span>
        </div>
      </section>
      <section class="hub-content" aria-labelledby="guide-hub-heading">
        <div class="section-header">
          <h2 id="guide-hub-heading">Start with what you need to do.</h2>
          <a class="button" href="#app-shell">Back to the app ${icon.arrow}</a>
        </div>
        <div class="hub-card-grid">
          ${Object.entries(guides).map(([id, guide], index) => `
            <a class="hub-card" href="#${id}" style="--hub-accent:${guide.accent}">
              <span class="hub-card__number">0${index + 1}</span>
              <span class="hub-card__eyebrow">${guide.eyebrow.replace('Guide · ', '')}</span>
              <h3>${guide.title}</h3>
              <p>${guide.lede}</p>
              <span class="hub-card__link">Read the guide ${icon.arrow}</span>
            </a>
          `).join('')}
        </div>
      </section>
    </div>`;
}

function renderCollectionHub() {
  document.title = 'DexThemes collections hub — page concept';
  pageRoot.innerHTML = `
    <div class="hub-page page-enter" style="--page-accent:#ed5aaf">
      <section class="hub-hero">
        ${breadcrumb(['Theme collections'])}
        <p class="eyebrow">Browse · Theme collections</p>
        <h1 class="display-title">Find your corner of the catalog.</h1>
        <p class="lede">Start with the way you work: low-glare dark palettes, bright daylight themes, familiar editor classics, or original community work.</p>
        <div class="meta-row">
          <span class="meta-pill"><i></i> /collections</span>
          <span class="meta-pill">Four curated entrances</span>
        </div>
      </section>
      <section class="hub-content" aria-labelledby="collection-hub-heading">
        <div class="section-header">
          <h2 id="collection-hub-heading">Browse with an intent, not a filter panel.</h2>
          <a class="button" href="#app-shell">Back to the app ${icon.arrow}</a>
        </div>
        <div class="collection-hub-grid">
          ${Object.entries(categories).map(([id, category], index) => `
            <a class="collection-hub-card" href="#${id}" style="--hub-accent:${category.accent}">
              <div class="collection-hub-card__rail">
                ${category.themes.slice(0, 4).map((theme) => `<i style="--rail-color:${theme.accent}"></i>`).join('')}
              </div>
              <span class="hub-card__number">0${index + 1}</span>
              <h3>${category.eyebrow.split(' · ').at(-1)}</h3>
              <p>${category.lede}</p>
              <span class="hub-card__link">Open collection ${icon.arrow}</span>
            </a>
          `).join('')}
        </div>
      </section>
    </div>`;
}

function renderThemePage() {
  const theme = themes.githubDark;
  document.title = 'GitHub Dark Codex Theme — page concept | DexThemes';
  pageRoot.innerHTML = `
    <div class="page-enter">
      <section class="theme-hero">
        ${breadcrumb(['Official themes', 'GitHub Dark'])}
        <div class="theme-hero__grid">
          <div>
            <p class="eyebrow">Official Codex theme · Dark</p>
            <h1 class="display-title">GitHub <em>Dark</em></h1>
            <p class="lede">${theme.summary}</p>
            <div class="meta-row" aria-label="Theme details">
              <span class="meta-pill"><i></i> Dark variant</span>
              <span class="meta-pill">Created by Codex</span>
              <span class="meta-pill">Free to use</span>
            </div>
            <div class="button-row">
              <button class="button button--primary" type="button" data-demo-action="copy">
                ${icon.copy}
                Copy theme &amp; open Settings
              </button>
              <a class="button" href="../../?theme=github-dark&amp;variant=dark">
                Open interactive preview
                ${icon.arrow}
              </a>
            </div>
          </div>
          ${codexWindow(theme)}
        </div>
      </section>

      <section class="palette-rail" aria-label="GitHub Dark palette">
        <div class="palette-intro">
          <span>Palette anatomy</span>
          <strong>Six roles, one focused system</strong>
        </div>
        ${[
          ['Surface', theme.surface, theme.ink],
          ['Sidebar', theme.sidebar, theme.ink],
          ['Accent', theme.accent, theme.sidebar],
          ['Added', theme.added, theme.sidebar],
          ['Removed', theme.removed, theme.sidebar],
          ['Skill', theme.skill, theme.sidebar],
        ].map(([label, value, swatchInk]) => `
          <div class="palette-swatch" style="--swatch:${value};--swatch-ink:${swatchInk}">
            <span>${label}</span>
            <code>${value.toUpperCase()}</code>
          </div>
        `).join('')}
      </section>

      <section class="answer-section">
        <div class="answer-section__inner">
          <div class="answer-grid">
            <div>
              <span class="answer-kicker">How to install</span>
              <h2 class="answer-heading">Your choice stays in your hands.</h2>
            </div>
            <p class="answer-copy">DexThemes copies the exact GitHub Dark import string and opens Codex Settings. You choose <strong>Appearance → Import theme</strong>, paste it, and approve the result.</p>
          </div>
          <div class="step-grid">
            <article class="step-card">
              <span>01</span>
              <h3>Preview the full workspace</h3>
              <p>Check interface, code, action, skill, added, and removed states before importing.</p>
            </article>
            <article class="step-card">
              <span>02</span>
              <h3>Copy the exact theme string</h3>
              <p>One action copies the selected dark variant without asking for project or account access.</p>
            </article>
            <article class="step-card">
              <span>03</span>
              <h3>Approve it in Codex</h3>
              <p>Open Settings, choose Appearance and Import theme, then paste and confirm.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-header">
          <h2>Built for familiar, low-noise focus.</h2>
          <p>Theme pages can answer the practical questions searchers ask while keeping the full interactive preview one click away.</p>
        </div>
        <div class="detail-grid">
          <article class="detail-card">
            <h3>What GitHub Dark changes</h3>
            <p>The theme brings GitHub’s deep neutral canvas and crisp blue action color across the whole Codex interface, not only the code editor.</p>
            <ul class="detail-list">
              <li><span>Main workspace</span><strong>#0D1117</strong></li>
              <li><span>Navigation and chrome</span><strong>#090C10</strong></li>
              <li><span>Primary action</span><strong>#58A6FF</strong></li>
              <li><span>Code background</span><strong>#070A0F</strong></li>
            </ul>
          </article>
          <article class="detail-card">
            <h3>Good to know</h3>
            <p>This is a dark-only official Codex palette. DexThemes is community-built, free and open source, and does not modify your repository when you import a theme.</p>
            <ul class="detail-list">
              <li><span>Available variants</span><strong>DARK</strong></li>
              <li><span>Theme source</span><strong>CODEX</strong></li>
              <li><span>Project file access</span><strong>NONE</strong></li>
              <li><span>Import approval</span><strong>YOU</strong></li>
            </ul>
          </article>
        </div>
      </section>

      <section class="detail-section" aria-labelledby="related-heading">
        <div class="section-header">
          <h2 id="related-heading">More dark themes with sharp blue signals.</h2>
          <a class="button" href="#category-dark">Browse all dark themes ${icon.arrow}</a>
        </div>
        <div class="related-grid">
          ${[themes.oneDark, themes.tokyoNight, themes.vercel].map(themeCard).join('')}
        </div>
      </section>
    </div>`;
}

function guideVisual(type, accent) {
  if (type === 'create') {
    return `
      <div class="guide-visual" style="--page-accent:${accent}">
        <div class="guide-visual__bar"><span>Theme creator</span><span>Live preview</span></div>
        <div class="palette-lab">
          <div class="palette-lab__controls">
            ${[
              ['Surface', '#13131A'],
              ['Ink', '#EEF0F6'],
              ['Accent', '#8A62F2'],
              ['Added', '#61C994'],
              ['Removed', '#F26D82'],
            ].map(([name, value]) => `
              <div class="color-control" style="--control-color:${value}">
                <i></i>
                <span><strong>${name}</strong><small>${value}</small></span>
              </div>
            `).join('')}
          </div>
          ${miniApp({
            surface: '#13131a',
            sidebar: '#0d0d12',
            codeBg: '#09090d',
            ink: '#eef0f6',
            accent: '#8a62f2',
            added: '#61c994',
            removed: '#f26d82',
          })}
        </div>
      </div>`;
  }

  if (type === 'troubleshoot') {
    return `
      <div class="guide-visual" style="--page-accent:${accent}">
        <div class="guide-visual__bar"><span>Import check</span><span>3 steps</span></div>
        <div class="diagnostic">
          <div class="diagnostic__status" style="--status-color:#63c98f">
            <i></i>
            <span><strong>Theme variant selected</strong> · GitHub Dark</span>
          </div>
          <div class="diagnostic__arrow">↓</div>
          <div class="diagnostic__status" style="--status-color:#63c98f">
            <i></i>
            <span><strong>Import string copied</strong> · Complete</span>
          </div>
          <div class="diagnostic__arrow">↓</div>
          <div class="diagnostic__status" style="--status-color:${accent}">
            <i></i>
            <span><strong>Waiting for approval</strong> · Appearance → Import theme</span>
          </div>
          <div class="diagnostic__arrow">↓</div>
          <div class="diagnostic__status" style="--status-color:#f0bc5d">
            <i></i>
            <span><strong>Nothing applied automatically</strong> · Expected</span>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="guide-visual" style="--page-accent:${accent}">
      <div class="guide-visual__bar"><span>Safe import handoff</span><span>No project access</span></div>
      <div class="install-flow">
        <div class="install-flow__row">
          <span>01</span>
          <span><strong>Choose a theme</strong><small>GitHub Dark · dark variant</small></span>
          <code>#0D1117 · #58A6FF</code>
        </div>
        <div class="install-flow__row">
          <span>02</span>
          <span><strong>Copy the import string</strong><small>Exact palette payload</small></span>
          <code>{"name":"GitHub…</code>
        </div>
        <div class="install-flow__row">
          <span>03</span>
          <span><strong>Approve inside Codex</strong><small>Settings → Appearance → Import theme</small></span>
          <code>Your final choice</code>
        </div>
      </div>
    </div>`;
}

function renderGuide(pageId) {
  const guide = guides[pageId];
  document.title = `${guide.title} — page concept | DexThemes`;
  pageRoot.innerHTML = `
    <div class="page-enter" style="--page-accent:${guide.accent}">
      <section class="guide-hero">
        ${breadcrumb(['Guides', guide.url.split('/').at(-1).replaceAll('-', ' ')])}
        <p class="eyebrow">${guide.eyebrow}</p>
        <h1 class="display-title">${guide.title}</h1>
        <p class="lede">${guide.lede}</p>
        <div class="meta-row">
          <span class="meta-pill"><i></i> Answer-first guide</span>
          <span class="meta-pill">${guide.readTime}</span>
          <span class="meta-pill">${guide.url}</span>
        </div>
        <div class="guide-hero__bottom">
          <div class="answer-block">
            <span>Short answer</span>
            <p>${guide.answer}</p>
          </div>
          ${guideVisual(guide.visual, guide.accent)}
        </div>
      </section>

      <section class="article-shell">
        <div class="article-layout">
          <aside class="article-toc">
            <span>In this guide</span>
            <ol>
              ${guide.sections.map((section, index) => `
                <li><a href="#section-${index + 1}" data-scroll-target="section-${index + 1}">${index + 1}. ${section.title}</a></li>
              `).join('')}
              <li><a href="#frequently-asked" data-scroll-target="frequently-asked">FAQs</a></li>
            </ol>
          </aside>

          <article class="article-content">
            ${guide.sections.map((section, index) => `
              <section class="article-section" id="section-${index + 1}">
                <span class="article-section__number">0${index + 1}</span>
                <h2>${section.title}</h2>
                <p>${section.body}</p>
                <ul class="article-points">
                  ${section.points.map((point) => `<li>${point}</li>`).join('')}
                </ul>
                ${section.callout ? `<div class="article-callout"><strong>Good to know:</strong> ${section.callout}</div>` : ''}
              </section>
            `).join('')}

            <section class="article-section faq-section" id="frequently-asked">
              <span class="article-section__number">FAQ</span>
              <h2>Frequently asked questions</h2>
              <div class="faq-list">
                ${guide.faqs.map((faq) => `
                  <article class="faq-item">
                    <h3>${faq.q}</h3>
                    <p>${faq.a}</p>
                  </article>
                `).join('')}
              </div>
            </section>

            <aside class="article-cta">
              <div>
                <strong>${pageId === 'guide-create' ? 'Ready to shape your own palette?' : 'Ready to see the themes?'}</strong>
                <p>${pageId === 'guide-create' ? 'Open the existing creator when you want to move from guide to product.' : 'Preview the complete interface before you copy anything.'}</p>
              </div>
              <a class="button button--primary" href="${pageId === 'guide-create' ? '../../' : '#category-dark'}">
                ${pageId === 'guide-create' ? 'Open the creator' : 'Browse dark themes'}
                ${icon.arrow}
              </a>
            </aside>
          </article>
        </div>
      </section>
    </div>`;
}

function renderCategory(pageId) {
  const category = categories[pageId];
  document.title = `${category.title} — page concept | DexThemes`;
  pageRoot.innerHTML = `
    <div class="page-enter" style="--page-accent:${category.accent}">
      <section class="category-hero">
        ${breadcrumb(['Collections', category.url.split('/').at(-1).replaceAll('-', ' ')])}
        <div class="category-hero__grid">
          <div>
            <p class="eyebrow">${category.eyebrow}</p>
            <h1 class="display-title">${category.title}</h1>
            <p class="lede">${category.lede}</p>
            <div class="meta-row">
              <span class="meta-pill"><i></i> Curated collection</span>
              <span class="meta-pill">${category.url}</span>
            </div>
          </div>
          <div class="category-answer">
            <span>What you will find</span>
            <p>${category.answer}</p>
          </div>
        </div>
      </section>

      <section aria-label="Theme catalog">
        <div class="catalog-toolbar">
          <label class="catalog-toolbar__search">
            ${icon.search}
            <input type="search" placeholder="Search this collection…" aria-label="Search this theme collection" data-theme-search>
          </label>
          <div class="chip-row" aria-label="Theme filters">
            ${category.chips.map((chip, index) => `
              <button class="chip${index === 0 ? ' active' : ''}" type="button" data-filter-chip>${chip}</button>
            `).join('')}
          </div>
        </div>
        <div class="catalog-section">
          <div class="theme-grid" data-theme-grid>
            ${category.themes.map(themeCard).join('')}
          </div>
          <div class="catalog-note">
            <span><strong>Mock catalog:</strong> six representative cards are shown to review the page system and information density.</span>
            <span>Production would render from the live catalog contract.</span>
          </div>
        </div>
      </section>
    </div>`;
}

function showToast(message) {
  window.clearTimeout(showToast.timeout);
  toast.textContent = message;
  toast.classList.add('visible');
  showToast.timeout = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

function currentPageId() {
  const requested = window.location.hash.slice(1);
  if (
    requested === 'app-shell' ||
    requested === 'theme-github-dark' ||
    requested === 'guide-hub' ||
    requested === 'collection-hub' ||
    guides[requested] ||
    categories[requested]
  ) {
    return requested;
  }
  return 'app-shell';
}

function updateActiveNavigation(pageId) {
  document.querySelectorAll('[data-page-link]').forEach((link) => {
    const isActive = link.dataset.pageLink === pageId;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function render() {
  const pageId = currentPageId();
  updateActiveNavigation(pageId);
  document.body.classList.toggle('app-shell-active', pageId === 'app-shell');

  if (pageId === 'app-shell') renderAppShell();
  else if (pageId === 'theme-github-dark') renderThemePage();
  else if (pageId === 'guide-hub') renderGuideHub();
  else if (pageId === 'collection-hub') renderCollectionHub();
  else if (guides[pageId]) renderGuide(pageId);
  else renderCategory(pageId);

  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.addEventListener('click', (event) => {
  const scrollLink = event.target.closest('[data-scroll-target]');
  if (scrollLink) {
    event.preventDefault();
    document.getElementById(scrollLink.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const appView = event.target.closest('[data-app-view]');
  if (appView) {
    appShellMode = appView.dataset.appView;
    renderAppShell();
    return;
  }

  const copyAction = event.target.closest('[data-demo-action="copy"]');
  if (copyAction) {
    showToast('Mockup only — no theme was copied and Codex Settings was not opened.');
    return;
  }

  const demoAction = event.target.closest('[data-demo-action]');
  if (demoAction) {
    const messages = {
      share: 'Share is contextual here: production would copy the public GitHub Dark page link.',
      like: 'Mockup only — GitHub Dark was not liked.',
      create: 'This would open the existing theme creator.',
      signin: 'Mockup only — no sign-in flow was started.',
      'request-light': 'Mockup only — no light-variant request was submitted.',
    };
    showToast(messages[demoAction.dataset.demoAction] || 'Mockup only — no action was taken.');
    return;
  }

  const placeholderTheme = event.target.closest('[data-placeholder-theme]');
  if (placeholderTheme) {
    event.preventDefault();
    showToast(`${placeholderTheme.dataset.placeholderTheme} would use this same landing-page template. GitHub Dark is the fully mocked example.`);
    return;
  }

  const filterChip = event.target.closest('[data-filter-chip]');
  if (filterChip) {
    filterChip.parentElement.querySelectorAll('[data-filter-chip]').forEach((chip) => chip.classList.remove('active'));
    filterChip.classList.add('active');
    showToast(`Visual filter state: ${filterChip.textContent.trim()}. The mock catalog remains fixture-backed.`);
  }
});

document.addEventListener('input', (event) => {
  if (!event.target.matches('[data-theme-search]')) return;
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('[data-theme-grid] .theme-card').forEach((card) => {
    card.hidden = query && !card.dataset.search.includes(query);
  });
});

window.addEventListener('hashchange', render);
render();
