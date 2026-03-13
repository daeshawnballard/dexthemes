// ================================================
// DexThemes — app.js
// Theme data, preview rendering, and UI logic
// ================================================

const THEMES = [
  {
    id: 'codex-default',
    name: 'Codex Default',
    category: 'official',
    dark: {
      surface: '#111111', ink: '#fcfcfc', accent: '#0169cc', contrast: 60,
      diffAdded: '#00a240', diffRemoved: '#e02e2a', skill: '#b06dff',
      sidebar: '#151515', codeBg: '#0a0a0a'
    },
    light: {
      surface: '#f8f8f8', ink: '#1a1a1a', accent: '#0169cc', contrast: 60,
      diffAdded: '#008c38', diffRemoved: '#c0241f', skill: '#9550e8',
      sidebar: '#f0f0f0', codeBg: '#eaeaea'
    },
    accents: ['#0169cc', '#0a84ff', '#30b0c7']
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    category: 'dexthemes',
    dark: {
      surface: '#0e0e14', ink: '#e8e6ff', accent: '#7c3aed', contrast: 65,
      diffAdded: '#10b981', diffRemoved: '#ef4444', skill: '#f59e0b',
      sidebar: '#13131a', codeBg: '#08080e'
    },
    light: {
      surface: '#faf9ff', ink: '#1e1a3c', accent: '#7c3aed', contrast: 65,
      diffAdded: '#059669', diffRemoved: '#dc2626', skill: '#d97706',
      sidebar: '#f3f0ff', codeBg: '#ede8ff'
    },
    accents: ['#7c3aed', '#8b5cf6', '#a78bfa']
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'dexthemes',
    dark: {
      surface: '#0d1210', ink: '#d4ead6', accent: '#22c55e', contrast: 58,
      diffAdded: '#4ade80', diffRemoved: '#f87171', skill: '#fbbf24',
      sidebar: '#111a13', codeBg: '#080d09'
    },
    light: {
      surface: '#f7fdf8', ink: '#1a2e1c', accent: '#16a34a', contrast: 58,
      diffAdded: '#15803d', diffRemoved: '#dc2626', skill: '#d97706',
      sidebar: '#ecfdf5', codeBg: '#dcfce7'
    },
    accents: ['#22c55e', '#16a34a', '#84cc16']
  },
  {
    id: 'rose-dawn',
    name: 'Rose Dawn',
    category: 'dexthemes',
    dark: {
      surface: '#110d0e', ink: '#fde8ec', accent: '#e11d48', contrast: 62,
      diffAdded: '#10b981', diffRemoved: '#f43f5e', skill: '#f59e0b',
      sidebar: '#180e11', codeBg: '#0a0608'
    },
    light: {
      surface: '#fff1f3', ink: '#1f0c10', accent: '#e11d48', contrast: 62,
      diffAdded: '#059669', diffRemoved: '#e11d48', skill: '#d97706',
      sidebar: '#ffe4e8', codeBg: '#fecdd3'
    },
    accents: ['#e11d48', '#f43f5e', '#fb7185']
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'dexthemes',
    dark: {
      surface: '#0b0f14', ink: '#d6eeff', accent: '#0ea5e9', contrast: 60,
      diffAdded: '#34d399', diffRemoved: '#f87171', skill: '#818cf8',
      sidebar: '#0e1520', codeBg: '#07090f'
    },
    light: {
      surface: '#f0f9ff', ink: '#0c1a2e', accent: '#0369a1', contrast: 60,
      diffAdded: '#059669', diffRemoved: '#dc2626', skill: '#4f46e5',
      sidebar: '#e0f2fe', codeBg: '#bae6fd'
    },
    accents: ['#0ea5e9', '#0369a1', '#38bdf8']
  },
  {
    id: 'amber-night',
    name: 'Amber Night',
    category: 'dexthemes',
    dark: {
      surface: '#100e08', ink: '#fef3c7', accent: '#f59e0b', contrast: 63,
      diffAdded: '#34d399', diffRemoved: '#f87171', skill: '#a78bfa',
      sidebar: '#16120a', codeBg: '#0a0905'
    },
    light: {
      surface: '#fffbeb', ink: '#1c1507', accent: '#d97706', contrast: 63,
      diffAdded: '#059669', diffRemoved: '#dc2626', skill: '#7c3aed',
      sidebar: '#fef9c3', codeBg: '#fde68a'
    },
    accents: ['#f59e0b', '#d97706', '#fbbf24']
  },
  {
    id: 'nord',
    name: 'Nord',
    category: 'community',
    dark: {
      surface: '#2e3440', ink: '#eceff4', accent: '#88c0d0', contrast: 55,
      diffAdded: '#a3be8c', diffRemoved: '#bf616a', skill: '#b48ead',
      sidebar: '#272e3b', codeBg: '#242933'
    },
    light: {
      surface: '#eceff4', ink: '#2e3440', accent: '#5e81ac', contrast: 55,
      diffAdded: '#a3be8c', diffRemoved: '#bf616a', skill: '#b48ead',
      sidebar: '#e5e9f0', codeBg: '#d8dee9'
    },
    accents: ['#88c0d0', '#5e81ac', '#81a1c1']
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    category: 'community',
    dark: {
      surface: '#111111', ink: '#d4d4d4', accent: '#888888', contrast: 50,
      diffAdded: '#a3a3a3', diffRemoved: '#666666', skill: '#c0c0c0',
      sidebar: '#161616', codeBg: '#0a0a0a'
    },
    light: {
      surface: '#fafafa', ink: '#1a1a1a', accent: '#444444', contrast: 50,
      diffAdded: '#555555', diffRemoved: '#999999', skill: '#777777',
      sidebar: '#f0f0f0', codeBg: '#e0e0e0'
    },
    accents: ['#888888', '#aaaaaa', '#555555']
  }
];

const CATEGORIES = [
  { id: 'official', name: 'Official Codex', icon: 'shield' },
  { id: 'dexthemes', name: 'DexThemes', icon: 'palette' },
  { id: 'community', name: 'Community', icon: 'users' }
];

// ================================================
// State
// ================================================

let selectedTheme = THEMES[0];
let selectedVariant = 'dark';
let selectedAccentIdx = 0;
let expandedCategories = { official: true, dexthemes: true, community: true };

// ================================================
// Import string builder
// ================================================

function buildImportString(theme, variant, accentIdx) {
  const v = theme[variant];
  const acc = theme.accents[accentIdx] || v.accent;
  return `codex-theme-v1:${JSON.stringify({
    codeThemeId: 'codex',
    theme: {
      accent: acc, contrast: v.contrast,
      fonts: { code: null, ui: null },
      ink: v.ink, opaqueWindows: true,
      semanticColors: { diffAdded: v.diffAdded, diffRemoved: v.diffRemoved, skill: v.skill },
      surface: v.surface
    },
    variant: variant
  })}`;
}

// ================================================
// Helpers
// ================================================

function isDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function hexToRgb(hex) {
  return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`;
}

function blendColor(hex, amount) {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ================================================
// Shell theming — update CSS vars on :root
// ================================================

function applyShellTheme(theme, variant) {
  const v = theme[variant];
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const dark = isDark(v.surface);
  const root = document.documentElement.style;

  root.setProperty('--bg', v.surface);
  root.setProperty('--sidebar-bg', v.sidebar);
  root.setProperty('--surface', blendColor(v.surface, dark ? 15 : -8));
  root.setProperty('--surface-raised', blendColor(v.surface, dark ? 25 : -15));
  root.setProperty('--border', dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
  root.setProperty('--border-strong', dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)');
  root.setProperty('--text-primary', v.ink);
  root.setProperty('--text-secondary', dark ? blendColor(v.ink, -60) : blendColor(v.ink, 60));
  root.setProperty('--text-muted', dark ? blendColor(v.surface, 70) : blendColor(v.surface, -70));
  root.setProperty('--accent', acc);
  root.setProperty('--accent-hover', blendColor(acc, 20));
  root.setProperty('--accent-dim', `rgba(${hexToRgb(acc)}, 0.12)`);
  root.setProperty('--accent-border', `rgba(${hexToRgb(acc)}, 0.25)`);
}

// ================================================
// Preview rendering — main chat window
// ================================================

function applyPreview(theme, variant) {
  const v = theme[variant];
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const win = document.getElementById('preview-window');
  const titlebar = document.getElementById('preview-titlebar');
  const chat = document.getElementById('preview-chat');
  const inputBar = document.getElementById('preview-input-bar');
  const inputInner = document.getElementById('preview-input-inner');
  const inputText = document.getElementById('preview-input-text');
  const sendBtn = document.getElementById('preview-send-btn');
  const winTitle = win.querySelector('.preview-window-title');

  win.style.background = v.surface;
  win.style.borderColor = borderColor;
  titlebar.style.background = v.sidebar;
  titlebar.style.borderBottomColor = borderColor;
  winTitle.style.color = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  win.querySelectorAll('.preview-dot').forEach(d => {
    d.style.background = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  });
  chat.style.background = v.surface;
  inputBar.style.background = v.sidebar;
  inputBar.style.borderTopColor = borderColor;
  inputInner.style.background = v.codeBg;
  inputInner.style.border = `1px solid ${borderColor}`;
  inputText.style.color = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  sendBtn.style.background = acc;
  sendBtn.querySelector('svg').style.color = '#fff';

  document.getElementById('preview-theme-name').textContent = theme.name;
  renderChatContent(v, acc, 'preview-chat');
}

// ================================================
// Render chat content (reused for main + mini previews)
// ================================================

function renderChatContent(v, acc, containerId) {
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const c = document.getElementById(containerId);

  c.innerHTML = `
    <div class="user-msg" style="background:${acc}22;color:${v.ink};">
      Add authentication middleware to the Express router
    </div>
    <div class="assistant-msg" style="color:${v.ink};">
      <p>Sure — here's a JWT middleware you can mount before your routes:</p>
      <div class="code-block" style="background:${v.codeBg};border:1px solid ${borderColor};color:${v.ink};">
        <span style="color:${mutedColor}">// middleware/auth.ts</span><br>
        <span style="color:${acc}">import</span> jwt <span style="color:${acc}">from</span> <span style="color:${v.diffAdded}">'jsonwebtoken'</span>;<br><br>
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
    <div class="user-msg" style="background:${acc}22;color:${v.ink};">
      Now write a test for it using Vitest
    </div>
  `;
}

// ================================================
// Mini preview cards (right panel)
// ================================================

function renderMiniPreview(containerId, theme, variant) {
  const v = theme[variant];
  const acc = theme.accents[selectedAccentIdx] || v.accent;
  const dark = isDark(v.surface);
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const mutedColor = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';

  const el = document.getElementById(containerId);
  el.style.background = v.surface;

  el.innerHTML = `
    <div class="mini-user" style="background:${acc}22;color:${v.ink};">Add auth middleware</div>
    <div class="mini-assistant" style="color:${v.ink};">
      Sure — here's a JWT middleware:
      <div class="mini-code" style="background:${v.codeBg};border:1px solid ${borderColor};">
        <span style="color:${acc}">import</span> <span style="color:${v.ink}">jwt</span> <span style="color:${acc}">from</span> <span style="color:${v.diffAdded}">'jsonwebtoken'</span>;<br>
        <span style="color:${acc}">export const</span> <span style="color:${v.skill}">requireAuth</span> = ...
      </div>
    </div>
  `;
}

function renderRightPanel() {
  renderMiniPreview('mini-dark', selectedTheme, 'dark');
  renderMiniPreview('mini-light', selectedTheme, 'light');
  updateVariantCards();
  renderAccentDots();
}

function updateVariantCards() {
  document.getElementById('card-dark').classList.toggle('selected', selectedVariant === 'dark');
  document.getElementById('card-light').classList.toggle('selected', selectedVariant === 'light');
  document.getElementById('variant-hint').textContent = `${selectedVariant} variant`;
}

// ================================================
// Sidebar — project/thread structure
// ================================================

function renderSidebar() {
  const el = document.getElementById('category-list');
  el.innerHTML = CATEGORIES.map(cat => {
    const themes = THEMES.filter(t => t.category === cat.id);
    const expanded = expandedCategories[cat.id];
    const iconSvg = getCategoryIcon(cat.icon);

    return `
      <div class="category">
        <div class="category-header" onclick="toggleCategory('${cat.id}')">
          <svg class="category-chevron ${expanded ? 'expanded' : ''}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          ${iconSvg}
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${themes.length}</span>
        </div>
        <div class="category-threads ${expanded ? 'expanded' : ''}">
          ${themes.map(t => `
            <div class="thread-item ${t.id === selectedTheme.id ? 'active' : ''}"
                 data-theme-id="${t.id}"
                 onclick="selectThemeById('${t.id}')">
              <div class="thread-swatch" style="background:${t.dark.accent}"></div>
              <span class="thread-title">${t.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryIcon(icon) {
  switch (icon) {
    case 'shield':
      return '<svg class="category-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    case 'palette':
      return '<svg class="category-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';
    case 'users':
      return '<svg class="category-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
    default:
      return '';
  }
}

function toggleCategory(catId) {
  expandedCategories[catId] = !expandedCategories[catId];
  renderSidebar();
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
  applyShellTheme(selectedTheme, selectedVariant);
  applyPreview(selectedTheme, selectedVariant);
  renderRightPanel();
  renderSidebar();
}

function selectAccent(idx) {
  selectedAccentIdx = idx;
  applyShellTheme(selectedTheme, selectedVariant);
  applyPreview(selectedTheme, selectedVariant);
  renderRightPanel();
}

function selectVariant(v) {
  selectedVariant = v;
  applyShellTheme(selectedTheme, selectedVariant);
  applyPreview(selectedTheme, selectedVariant);
  updateVariantCards();
}

// ================================================
// Copy to clipboard
// ================================================

function copyTheme() {
  const str = buildImportString(selectedTheme, selectedVariant, selectedAccentIdx);
  const btn = document.getElementById('copy-btn');

  const reset = () => {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

renderSidebar();
renderRightPanel();
applyShellTheme(selectedTheme, selectedVariant);
applyPreview(selectedTheme, selectedVariant);
