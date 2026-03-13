// ================================================
// DexThemes — app.js
// Theme data, preview rendering, and UI logic
// ================================================

const THEMES = [
  {
    id: 'codex-default',
    name: 'Codex Default',
    type: 'builtin',
    dark: {
      surface: '#111111',
      ink: '#fcfcfc',
      accent: '#0169cc',
      contrast: 60,
      diffAdded: '#00a240',
      diffRemoved: '#e02e2a',
      skill: '#b06dff',
      sidebar: '#151515',
      codeBg: '#0a0a0a'
    },
    light: {
      surface: '#f8f8f8',
      ink: '#1a1a1a',
      accent: '#0169cc',
      contrast: 60,
      diffAdded: '#008c38',
      diffRemoved: '#c0241f',
      skill: '#9550e8',
      sidebar: '#f0f0f0',
      codeBg: '#eaeaea'
    },
    accents: ['#0169cc', '#0a84ff', '#30b0c7']
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    type: 'community',
    dark: {
      surface: '#0e0e14',
      ink: '#e8e6ff',
      accent: '#7c3aed',
      contrast: 65,
      diffAdded: '#10b981',
      diffRemoved: '#ef4444',
      skill: '#f59e0b',
      sidebar: '#13131a',
      codeBg: '#08080e'
    },
    light: {
      surface: '#faf9ff',
      ink: '#1e1a3c',
      accent: '#7c3aed',
      contrast: 65,
      diffAdded: '#059669',
      diffRemoved: '#dc2626',
      skill: '#d97706',
      sidebar: '#f3f0ff',
      codeBg: '#ede8ff'
    },
    accents: ['#7c3aed', '#8b5cf6', '#a78bfa']
  },
  {
    id: 'forest',
    name: 'Forest',
    type: 'community',
    inspired: 'Nature',
    dark: {
      surface: '#0d1210',
      ink: '#d4ead6',
      accent: '#22c55e',
      contrast: 58,
      diffAdded: '#4ade80',
      diffRemoved: '#f87171',
      skill: '#fbbf24',
      sidebar: '#111a13',
      codeBg: '#080d09'
    },
    light: {
      surface: '#f7fdf8',
      ink: '#1a2e1c',
      accent: '#16a34a',
      contrast: 58,
      diffAdded: '#15803d',
      diffRemoved: '#dc2626',
      skill: '#d97706',
      sidebar: '#ecfdf5',
      codeBg: '#dcfce7'
    },
    accents: ['#22c55e', '#16a34a', '#84cc16']
  },
  {
    id: 'rose-dawn',
    name: 'Rose Dawn',
    type: 'community',
    dark: {
      surface: '#110d0e',
      ink: '#fde8ec',
      accent: '#e11d48',
      contrast: 62,
      diffAdded: '#10b981',
      diffRemoved: '#f43f5e',
      skill: '#f59e0b',
      sidebar: '#180e11',
      codeBg: '#0a0608'
    },
    light: {
      surface: '#fff1f3',
      ink: '#1f0c10',
      accent: '#e11d48',
      contrast: 62,
      diffAdded: '#059669',
      diffRemoved: '#e11d48',
      skill: '#d97706',
      sidebar: '#ffe4e8',
      codeBg: '#fecdd3'
    },
    accents: ['#e11d48', '#f43f5e', '#fb7185']
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'community',
    dark: {
      surface: '#0b0f14',
      ink: '#d6eeff',
      accent: '#0ea5e9',
      contrast: 60,
      diffAdded: '#34d399',
      diffRemoved: '#f87171',
      skill: '#818cf8',
      sidebar: '#0e1520',
      codeBg: '#07090f'
    },
    light: {
      surface: '#f0f9ff',
      ink: '#0c1a2e',
      accent: '#0369a1',
      contrast: 60,
      diffAdded: '#059669',
      diffRemoved: '#dc2626',
      skill: '#4f46e5',
      sidebar: '#e0f2fe',
      codeBg: '#bae6fd'
    },
    accents: ['#0ea5e9', '#0369a1', '#38bdf8']
  },
  {
    id: 'amber-night',
    name: 'Amber Night',
    type: 'community',
    dark: {
      surface: '#100e08',
      ink: '#fef3c7',
      accent: '#f59e0b',
      contrast: 63,
      diffAdded: '#34d399',
      diffRemoved: '#f87171',
      skill: '#a78bfa',
      sidebar: '#16120a',
      codeBg: '#0a0905'
    },
    light: {
      surface: '#fffbeb',
      ink: '#1c1507',
      accent: '#d97706',
      contrast: 63,
      diffAdded: '#059669',
      diffRemoved: '#dc2626',
      skill: '#7c3aed',
      sidebar: '#fef9c3',
      codeBg: '#fde68a'
    },
    accents: ['#f59e0b', '#d97706', '#fbbf24']
  },
  {
    id: 'nord',
    name: 'Nord',
    type: 'community',
    inspired: 'Nord palette',
    dark: {
      surface: '#2e3440',
      ink: '#eceff4',
      accent: '#88c0d0',
      contrast: 55,
      diffAdded: '#a3be8c',
      diffRemoved: '#bf616a',
      skill: '#b48ead',
      sidebar: '#272e3b',
      codeBg: '#242933'
    },
    light: {
      surface: '#eceff4',
      ink: '#2e3440',
      accent: '#5e81ac',
      contrast: 55,
      diffAdded: '#a3be8c',
      diffRemoved: '#bf616a',
      skill: '#b48ead',
      sidebar: '#e5e9f0',
      codeBg: '#d8dee9'
    },
    accents: ['#88c0d0', '#5e81ac', '#81a1c1']
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    type: 'community',
    dark: {
      surface: '#111111',
      ink: '#d4d4d4',
      accent: '#888888',
      contrast: 50,
      diffAdded: '#a3a3a3',
      diffRemoved: '#666666',
      skill: '#c0c0c0',
      sidebar: '#161616',
      codeBg: '#0a0a0a'
    },
    light: {
      surface: '#fafafa',
      ink: '#1a1a1a',
      accent: '#444444',
      contrast: 50,
      diffAdded: '#555555',
      diffRemoved: '#999999',
      skill: '#777777',
      sidebar: '#f0f0f0',
      codeBg: '#e0e0e0'
    },
    accents: ['#888888', '#aaaaaa', '#555555']
  }
];

// ================================================
// State
// ================================================

let selectedTheme = THEMES[0];
let selectedVariant = 'dark';
let activeFilter = 'all';
let selectedAccentIdx = 0;

// ================================================
// Import string builder
// Matches the real Codex theme v1 export format
// ================================================

function buildImportString(theme, variant, accentIdx) {
  const v = theme[variant];
  const acc = theme.accents[accentIdx] || v.accent;
  const payload = {
    codeThemeId: 'codex',
    theme: {
      accent: acc,
      contrast: v.contrast,
      fonts: { code: null, ui: null },
      ink: v.ink,
      opaqueWindows: true,
      semanticColors: {
        diffAdded: v.diffAdded,
        diffRemoved: v.diffRemoved,
        skill: v.skill
      },
      surface: v.surface
    },
    variant: variant
  };
  return `codex-theme-v1:${JSON.stringify(payload)}`;
}

// ================================================
// Preview rendering
// ================================================

function applyPreview(theme, variant) {
  const v = theme[variant];
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const win = document.getElementById('codex-window');
  const editor = document.getElementById('preview-editor');
  const input = document.getElementById('preview-input');
  const inputRow = document.getElementById('preview-input-row');
  const tabBar = win.querySelector('.codex-tab-bar');
  const titlebar = win.querySelector('.codex-titlebar');
  const codexSidebar = win.querySelector('.codex-sidebar');
  const activeTab = win.querySelector('.codex-tab.active');

  win.style.background = v.surface;
  win.style.borderColor = isDark(v.surface) ? '#2a2a2a' : '#d0d0d0';

  titlebar.style.background = v.sidebar;
  titlebar.style.borderBottomColor = isDark(v.surface) ? '#2a2a2a' : '#d0d0d0';

  tabBar.style.background = adjustBrightness(v.sidebar, -5);
  tabBar.style.borderBottomColor = isDark(v.surface) ? '#2a2a2a' : '#d0d0d0';
  if (activeTab) {
    activeTab.style.background = v.surface;
    activeTab.style.color = v.ink;
  }
  win.querySelectorAll('.codex-tab:not(.active)').forEach(t => {
    t.style.color = isDark(v.surface) ? '#555' : '#aaa';
  });

  codexSidebar.style.background = v.sidebar;
  codexSidebar.style.borderRightColor = isDark(v.surface) ? '#2a2a2a' : '#d0d0d0';

  const activeSidebarItem = codexSidebar.querySelector('.codex-sidebar-item.active');
  if (activeSidebarItem) {
    activeSidebarItem.style.color = acc;
    activeSidebarItem.style.background = acc + '18';
  }
  codexSidebar.querySelectorAll('.codex-sidebar-item:not(.active)').forEach(el => {
    el.style.color = isDark(v.surface) ? '#555' : '#aaa';
  });

  editor.style.background = v.surface;
  editor.style.color = v.ink;

  input.style.background = v.codeBg;
  input.style.color = isDark(v.surface) ? '#444' : '#bbb';
  input.style.border = `1px solid ${isDark(v.surface) ? '#2a2a2a' : '#d0d0d0'}`;

  inputRow.style.background = v.sidebar;
  inputRow.style.borderTopColor = isDark(v.surface) ? '#2a2a2a' : '#d0d0d0';
  inputRow.querySelector('svg').style.color = isDark(v.surface) ? '#444' : '#bbb';

  document.getElementById('preview-label').textContent = theme.name;

  renderPreviewContent(v, acc);
}

function isDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function adjustBrightness(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function renderPreviewContent(v, acc) {
  const borderColor = isDark(v.surface) ? '#2a2a2a' : '#d0d0d0';
  const c = document.getElementById('preview-content');

  c.innerHTML = `
    <div class="user-bubble" style="
      background:${acc}20;
      border:1px solid ${acc}38;
      color:${v.ink};
    ">Add authentication middleware to the Express router</div>

    <div class="assistant-bubble" style="
      background:${v.sidebar};
      border:1px solid ${borderColor};
      color:${v.ink};
    ">
      Sure — here's a JWT middleware you can mount before your routes:
      <div class="code-block" style="
        background:${v.codeBg};
        border:1px solid ${borderColor};
      ">
        <span style="color:${isDark(v.surface) ? '#555' : '#bbb'}">// middleware/auth.ts</span><br>
        <span style="color:${acc}">import</span> jwt <span style="color:${acc}">from</span> <span style="color:${v.diffAdded}">'jsonwebtoken'</span>;<br>
        <br>
        <span style="color:${acc}">export const</span> <span style="color:${v.skill}">requireAuth</span> = (<br>
        &nbsp;&nbsp;req: Request, res: Response, next: NextFunction<br>
        ) <span style="color:${acc}">=&gt;</span> {<br>
        &nbsp;&nbsp;<span style="color:${acc}">const</span> token = req.headers.<span style="color:${v.skill}">authorization</span><br>
        &nbsp;&nbsp;&nbsp;&nbsp;?.<span style="color:${v.skill}">split</span>(<span style="color:${v.diffAdded}">' '</span>)[1];<br>
        &nbsp;&nbsp;<span style="color:${acc}">if</span> (!token) <span style="color:${acc}">return</span> res.<span style="color:${v.skill}">sendStatus</span>(401);<br>
        &nbsp;&nbsp;<span style="color:${acc}">try</span> {<br>
        &nbsp;&nbsp;&nbsp;&nbsp;req.user = jwt.<span style="color:${v.skill}">verify</span>(token, process.env.JWT_SECRET!);<br>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:${v.skill}">next</span>();<br>
        &nbsp;&nbsp;} <span style="color:${acc}">catch</span> { res.<span style="color:${v.skill}">sendStatus</span>(403); }<br>
        };
      </div>
    </div>

    <div class="user-bubble" style="
      background:${acc}20;
      border:1px solid ${acc}38;
      color:${v.ink};
    ">Now write a test for it using Vitest</div>
  `;
}

// ================================================
// Thread list (sidebar recent)
// ================================================

function renderThreadList() {
  const el = document.getElementById('thread-list');
  el.innerHTML = THEMES.slice(0, 6).map((t, i) => `
    <div class="thread-item${i === 0 ? ' active' : ''}" data-theme-id="${t.id}" onclick="selectThemeById('${t.id}')">
      <div class="thread-title">${t.name}</div>
      <div class="thread-subtitle">${t.type === 'builtin' ? 'Built-in' : 'Community'}</div>
    </div>
  `).join('');
}

// ================================================
// Theme list (right panel)
// ================================================

function renderThemeList() {
  const el = document.getElementById('theme-list');
  const q = document.getElementById('search-input').value.toLowerCase().trim();

  const filtered = THEMES.filter(t => {
    const matchesTab =
      activeFilter === 'all' ||
      (activeFilter === 'builtin' && t.type === 'builtin') ||
      (activeFilter === 'community' && t.type !== 'builtin');
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      (t.inspired || '').toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const builtins = filtered.filter(t => t.type === 'builtin');
  const community = filtered.filter(t => t.type !== 'builtin');

  let html = '';

  if (builtins.length && (activeFilter === 'all' || activeFilter === 'builtin')) {
    html += `<div class="section-divider">Built-in</div>`;
    html += builtins.map(t => themeItemHTML(t)).join('');
  }

  if (community.length) {
    if (activeFilter === 'all') {
      html += `<div class="section-divider">Community</div>`;
    }
    html += community.map(t => themeItemHTML(t)).join('');
  }

  if (!filtered.length) {
    html = `<div style="padding:20px 12px;font-size:11px;color:var(--text-muted);text-align:center">No themes match</div>`;
  }

  el.innerHTML = html;

  document.getElementById('theme-count').textContent = `${filtered.length} theme${filtered.length !== 1 ? 's' : ''}`;

  el.querySelectorAll('.theme-item').forEach(item => {
    item.addEventListener('click', () => selectThemeById(item.dataset.themeId));
    if (item.dataset.themeId === selectedTheme.id) {
      item.classList.add('selected');
    }
  });
}

function themeItemHTML(t) {
  const d = t.dark;
  const l = t.light;
  const tags = [];
  if (t.type === 'builtin') tags.push('<span class="tag tag-builtin">Built-in</span>');
  else tags.push('<span class="tag tag-community">Community</span>');
  if (t.inspired) tags.push(`<span class="tag tag-inspired">Inspired by ${t.inspired}</span>`);

  return `
    <div class="theme-item${t.id === selectedTheme.id ? ' selected' : ''}" data-theme-id="${t.id}">
      <div class="theme-swatch">
        <div class="swatch-half swatch-dark" style="background:${d.surface}"></div>
        <div class="swatch-half swatch-light" style="background:${l.surface}"></div>
        <div class="swatch-accent-bar" style="background:${d.accent}"></div>
      </div>
      <div class="theme-info">
        <div class="theme-name">${t.name}</div>
        <div class="theme-tags">${tags.join('')}</div>
      </div>
    </div>
  `;
}

// ================================================
// Accent dots
// ================================================

function renderAccentDots() {
  const el = document.getElementById('accent-dots');
  el.innerHTML = selectedTheme.accents.map((a, i) => `
    <div
      class="accent-dot${i === selectedAccentIdx ? ' selected' : ''}"
      style="background:${a}"
      title="${a}"
      onclick="selectAccent(${i})"
    ></div>
  `).join('');
}

// ================================================
// Selection handlers
// ================================================

function selectThemeById(id) {
  const t = THEMES.find(x => x.id === id);
  if (!t) return;
  selectedTheme = t;
  selectedAccentIdx = 0;
  applyPreview(selectedTheme, selectedVariant);
  renderAccentDots();
  renderThemeList();
  renderThreadList();
  updateThreadActive();
}

function updateThreadActive() {
  document.querySelectorAll('.thread-item').forEach(el => {
    el.classList.toggle('active', el.dataset.themeId === selectedTheme.id);
  });
}

function selectAccent(idx) {
  selectedAccentIdx = idx;
  applyPreview(selectedTheme, selectedVariant);
  renderAccentDots();
}

function setVariant(v) {
  selectedVariant = v;
  document.getElementById('variant-dark-btn').classList.toggle('active', v === 'dark');
  document.getElementById('variant-light-btn').classList.toggle('active', v === 'light');
  document.getElementById('variant-hint').textContent = `${v} variant`;
  applyPreview(selectedTheme, selectedVariant);
}

// ================================================
// Filter / search
// ================================================

function filterThemes() {
  renderThemeList();
}

function filterTab(type, el) {
  activeFilter = type;
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderThemeList();
}

// ================================================
// Copy to clipboard
// ================================================

function copyTheme() {
  const str = buildImportString(selectedTheme, selectedVariant, selectedAccentIdx);
  const btn = document.getElementById('copy-btn');

  const reset = () => {
    btn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
      Copy import string
    `;
    btn.classList.remove('copied');
  };

  const confirm = () => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(reset, 1600);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(confirm).catch(() => fallbackCopy(str, confirm));
  } else {
    fallbackCopy(str, confirm);
  }
}

function fallbackCopy(str, cb) {
  const ta = document.createElement('textarea');
  ta.value = str;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (e) {}
  document.body.removeChild(ta);
}

// ================================================
// Init
// ================================================

renderThreadList();
renderThemeList();
renderAccentDots();
applyPreview(selectedTheme, selectedVariant);
