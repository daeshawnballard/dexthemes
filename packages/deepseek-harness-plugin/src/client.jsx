import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
import {
  BUNDLED_HARNESS_THEMES,
  loadPublicHarnessThemes,
  mergeHarnessThemes,
  mergeUnlockedHarnessThemes,
  searchHarnessThemes,
} from './catalog.js';
import { createHarnessThemeController, PLUGIN_VERSION } from './theme-controller.js';
import { createPluginAnalytics } from './analytics.js';
import { createHarnessAccountClient } from './account.js';
import { createThemeStateStore, normalizeThemeState } from './theme-state.js';

export const inject = ['slots'];

const ui = Object.freeze({
  root: { width: '100%', maxWidth: 980, color: 'var(--dsw-alias-label-primary)', display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' },
  eyebrow: { margin: 0, color: 'var(--dsw-alias-brand-primary)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' },
  title: { margin: '4px 0 0', fontSize: 24, lineHeight: 1.25 },
  body: { margin: '6px 0 0', maxWidth: 620, color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: 1.55 },
  featureRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 12, alignItems: 'stretch' },
  active: { border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 10, padding: '10px 12px', minWidth: 0, height: '100%', boxSizing: 'border-box' },
  activeLabel: { display: 'block', color: 'var(--dsw-alias-label-secondary)', fontSize: 11 },
  activeName: { display: 'block', marginTop: 3, fontSize: 13, fontWeight: 700 },
  controls: { display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) auto', gap: 10 },
  search: { width: '100%', boxSizing: 'border-box', border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', borderRadius: 8, minHeight: 38, padding: '0 12px', font: 'inherit' },
  filters: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filter: { border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-secondary)', borderRadius: 999, minHeight: 34, padding: '0 12px', font: 'inherit', fontSize: 12, cursor: 'pointer' },
  filterActive: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)' },
  status: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 12 },
  createCallout: { border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: 10, padding: '11px 12px', display: 'grid', gap: 6, alignContent: 'start', height: '100%', boxSizing: 'border-box' },
  account: { border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 10, padding: '11px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', alignContent: 'space-between', gap: 12, flexWrap: 'wrap', height: '100%', boxSizing: 'border-box' },
  accountCopy: { display: 'grid', gap: 3, minWidth: 220, flex: 1 },
  accountActions: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 },
  card: { border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 12, overflow: 'hidden', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 },
  cardActive: { borderColor: 'var(--dsw-alias-brand-primary)', boxShadow: '0 0 0 1px var(--dsw-alias-brand-primary)' },
  swatches: { height: 94, display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 9, overflow: 'hidden' },
  palette: { padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 },
  paletteDivider: { borderLeft: '1px solid var(--dsw-alias-border-l1)' },
  paletteFooter: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  modeBadge: { display: 'inline-flex', alignItems: 'center', minHeight: 20, borderRadius: 999, padding: '0 7px', background: 'rgba(0,0,0,.16)', color: 'inherit', fontSize: 9, fontWeight: 750, letterSpacing: '.08em', textTransform: 'uppercase' },
  line: { display: 'block', width: '78%', height: 5, borderRadius: 99, opacity: .85 },
  dot: { display: 'block', width: 17, height: 17, borderRadius: 99 },
  cardContent: { border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', borderRadius: 9, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  cardName: { fontSize: 14, fontWeight: 700 },
  tag: { color: 'var(--dsw-alias-label-secondary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' },
  summary: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 12, lineHeight: 1.45, minHeight: 34 },
  context: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 11, lineHeight: 1.4 },
  link: { color: 'var(--dsw-alias-brand-primary)', fontWeight: 650 },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' },
  button: { border: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', color: 'var(--dsw-alias-label-primary)', borderRadius: 7, minHeight: 34, padding: '0 10px', font: 'inherit', fontSize: 12, fontWeight: 650, cursor: 'pointer' },
  primary: { background: 'var(--dsw-alias-label-primary)', borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-bg-base)' },
  danger: { color: 'var(--dsw-alias-state-error-primary)' },
  dialogBackdrop: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', display: 'grid', placeItems: 'center', padding: 24 },
  dialog: { width: 'min(620px,100%)', maxHeight: 'min(720px,88vh)', overflow: 'auto', background: 'var(--dsw-alias-bg-overlay)', color: 'var(--dsw-alias-label-primary)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 14, padding: 18, boxShadow: '0 24px 70px rgba(0,0,0,.35)' },
  previewToolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, flexWrap: 'wrap' },
  previewToolbarLabel: { color: 'var(--dsw-alias-label-secondary)', fontSize: 11, fontWeight: 650 },
  previewSwitch: { display: 'inline-grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, padding: 3, gap: 3, background: 'var(--dsw-alias-bg-layer-1)' },
  previewSwitchButton: { border: 0, background: 'transparent', color: 'var(--dsw-alias-label-secondary)', borderRadius: 5, minHeight: 30, padding: '0 10px', font: 'inherit', fontSize: 11, fontWeight: 650, cursor: 'pointer' },
  previewSwitchActive: { background: 'var(--dsw-alias-label-primary)', color: 'var(--dsw-alias-bg-base)' },
  dialogPreview: { display: 'grid', gap: 12, margin: '12px 0 16px' },
  previewPane: { minHeight: 220, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)' },
  previewPaneHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  code: { borderRadius: 7, padding: 10, display: 'grid', gap: 7 },
});

const FILTERS = Object.freeze([
  ['all', 'All'],
  ['deepseek', 'DeepSeek'],
  ['dexthemes', 'DexThemes'],
  ['community', 'Community'],
]);

const PREVIEW_MODES = Object.freeze([
  ['both', 'Side by side'],
  ['dark', 'Dark'],
  ['light', 'Light'],
]);

function PalettePreview({ theme, expanded = false, mode = 'both' }) {
  const panes = [
    { id: 'dark', label: 'Dark', palette: theme.dark },
    { id: 'light', label: 'Light', palette: theme.light },
  ];
  if (!expanded) {
    return <div style={ui.swatches} aria-hidden="true">
      {panes.map(({ id, label, palette }, index) => <div key={id} style={{ ...ui.palette, ...(index ? ui.paletteDivider : {}), background: palette.surface, color: palette.ink }}>
        <span style={{ ...ui.line, background: palette.ink }} />
        <span style={ui.paletteFooter}>
          <span style={ui.modeBadge}>{label}</span>
          <span style={{ ...ui.dot, background: palette.accent }} />
        </span>
      </div>)}
    </div>;
  }
  const visiblePanes = mode === 'both' ? panes : panes.filter((pane) => pane.id === mode);
  return <div style={{ ...ui.dialogPreview, gridTemplateColumns: mode === 'both' ? 'repeat(2,minmax(0,1fr))' : '1fr' }}>
    {visiblePanes.map(({ id, label, palette }) => <div key={id} style={{ ...ui.previewPane, background: palette.surface, color: palette.ink }}>
      <span style={ui.previewPaneHeader}>
        <strong>{label} mode</strong>
        <span style={{ ...ui.dot, background: palette.accent }} />
      </span>
      <span style={{ ...ui.line, background: palette.ink }} />
      <div style={{ ...ui.code, background: palette.codeBg || palette.surface, border: `1px solid ${palette.accent}` }}>
        <span style={{ ...ui.line, width: '88%', background: palette.ink }} />
        <span style={{ ...ui.line, width: '62%', background: palette.accent }} />
        <span style={{ ...ui.line, width: '74%', background: palette.diffAdded }} />
      </div>
    </div>)}
  </div>;
}

function ThemeDialog({ theme, controller, active, capabilityAvailable, onClose }) {
  const [previewMode, setPreviewMode] = useState('both');
  useEffect(() => {
    controller.preview(theme);
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    globalThis.addEventListener?.('keydown', onKey);
    return () => globalThis.removeEventListener?.('keydown', onKey);
  }, [controller, onClose, theme]);
  return <div style={ui.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section style={ui.dialog} role="dialog" aria-modal="true" aria-labelledby="dexthemes-preview-title">
      <div style={ui.header}>
        <div>
          <p style={ui.eyebrow}>DexThemes preview</p>
          <h2 id="dexthemes-preview-title" style={ui.title}>{theme.name}</h2>
        </div>
        <button type="button" style={ui.button} onClick={onClose} aria-label="Close preview">Close</button>
      </div>
      <div style={ui.previewToolbar}>
        <span style={ui.previewToolbarLabel}>Preview mode</span>
        <div style={ui.previewSwitch} role="group" aria-label="Preview mode">
          {PREVIEW_MODES.map(([id, label]) => <button
            key={id}
            type="button"
            aria-pressed={previewMode === id}
            style={{ ...ui.previewSwitchButton, ...(previewMode === id ? ui.previewSwitchActive : {}) }}
            onClick={() => setPreviewMode(id)}
          >{label}</button>)}
        </div>
      </div>
      <PalettePreview theme={theme} expanded mode={previewMode} />
      <p style={ui.body}>{theme.summary || 'A paired light and dark palette mapped to Harness semantic tokens.'}</p>
      {theme.evidenceUrl ? <p style={ui.context}>
        Included for: {theme.sourceLabel || 'a documented DeepSeek integration'}.{' '}
        <a style={ui.link} href={theme.evidenceUrl} target="_blank" rel="noreferrer">View source</a>
      </p> : null}
      <div style={{ ...ui.actions, marginTop: 16 }}>
        <button type="button" style={ui.button} onClick={onClose}>Keep browsing</button>
        {active
          ? <button type="button" style={{ ...ui.button, ...ui.danger }} onClick={() => { if (controller.revert()) onClose(); }}>Revert theme</button>
          : <button
              type="button"
              style={{ ...ui.button, ...ui.primary }}
              disabled={!capabilityAvailable}
              onClick={() => { if (controller.apply(theme, { sourceSurface: 'settings_plugin_preview' })) onClose(); }}
            >{capabilityAvailable ? 'Apply to DeepSeek' : 'Theme service unavailable'}</button>}
      </div>
    </section>
  </div>;
}

function AccountPanel({ account }) {
  const state = useSyncExternalStore(account.subscribe, account.getSnapshot, account.getSnapshot);
  const busy = state.status === 'connecting';
  const connected = state.status === 'connected';
  const waiting = state.status === 'awaiting_authorization';
  const publishedThemes = Array.isArray(state.stats?.themes) ? state.stats.themes.length : 0;
  const unlockCount = state.unlocks.length;

  return <section style={ui.account} aria-label="DexThemes account">
    <div style={ui.accountCopy}>
      <strong>DexThemes account</strong>
      <span style={ui.status}>{connected
        ? `${publishedThemes} published themes · ${unlockCount} achievements`
        : waiting
          ? `Enter code ${state.userCode} to finish connecting.`
          : state.reconnectRequired
            ? 'Reconnect after restart to recover creator stats, achievements, and account-only themes.'
            : 'Optional: connect for creator stats, achievements, and the Harnessed reward.'}</span>
      {state.error ? <span role="alert" style={{ ...ui.status, color: 'var(--dsw-alias-state-error-primary)' }}>{state.error}</span> : null}
    </div>
    <div style={ui.accountActions}>
      {waiting && state.verificationUrl
        ? <a style={ui.link} href={state.verificationUrl} target="_blank" rel="noreferrer">Continue with GitHub</a>
        : null}
      {connected
        ? <button type="button" style={ui.button} onClick={() => account.disconnect()}>Disconnect</button>
        : waiting
          ? <button type="button" style={ui.button} onClick={() => account.disconnect()}>Cancel</button>
          : <button type="button" style={{ ...ui.button, ...ui.primary }} disabled={busy} onClick={() => { void account.connect(); }}>{busy ? 'Connecting…' : state.reconnectRequired ? 'Reconnect DexThemes' : 'Connect DexThemes'}</button>}
    </div>
  </section>;
}

export function DexThemesSettings({ controller, account }) {
  const runtime = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const accountState = useSyncExternalStore(account.subscribe, account.getSnapshot, account.getSnapshot);
  const [themes, setThemes] = useState(BUNDLED_HARNESS_THEMES);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [preview, setPreview] = useState(null);
  const [catalogState, setCatalogState] = useState('bundled');

  useEffect(() => {
    let current = true;
    loadPublicHarnessThemes().then(
      (remote) => {
        if (!current) return;
        setThemes(mergeHarnessThemes(BUNDLED_HARNESS_THEMES, remote));
        setCatalogState('live');
      },
      () => { if (current) setCatalogState('offline'); },
    );
    return () => { current = false; };
  }, []);

  const accessibleThemes = useMemo(
    () => mergeUnlockedHarnessThemes(themes, accountState.unlocks),
    [themes, accountState.unlocks],
  );
  const visible = useMemo(
    () => searchHarnessThemes(accessibleThemes, query, category),
    [accessibleThemes, query, category],
  );
  const active = accessibleThemes.find((theme) => theme.id === runtime.activeThemeId) || null;
  const desired = accessibleThemes.find((theme) => theme.id === runtime.desiredThemeId) || null;
  const capabilityAvailable = runtime.capability === 'available';

  useEffect(() => {
    controller.setCatalog(accessibleThemes);
  }, [accessibleThemes, controller]);

  return <div style={ui.root} data-dexthemes-harness-plugin={PLUGIN_VERSION}>
    <header style={ui.header}>
      <div>
        <p style={ui.eyebrow}>DexThemes for DeepSeek</p>
        <h2 style={ui.title}>Find your vibe. Stay in flow.</h2>
        <p style={ui.body}>Explore the DeepSeek palette, unofficial ecosystem tributes, DexThemes originals, and community themes. Preview light and dark, then apply in one click. No partnerships or endorsements are implied.</p>
      </div>
    </header>
    <div style={ui.featureRow} data-dexthemes-feature-row="true">
      <aside style={ui.active} aria-live="polite">
        <span style={ui.activeLabel}>{active ? 'Active theme' : runtime.desiredThemeId ? 'Saved theme' : 'Active theme'}</span>
        <strong style={ui.activeName}>{active?.name || desired?.name || runtime.desiredThemeId || 'Harness default'}</strong>
        {runtime.desiredThemeId ? <button type="button" style={{ ...ui.button, ...ui.danger, width: '100%', marginTop: 9 }} onClick={() => controller.revert()}>{active ? 'Revert' : 'Forget saved theme'}</button> : null}
      </aside>
      <div style={ui.createCallout}>
        <strong>Create with chat</strong>
        <span style={ui.status}>Ask any session “Make me a theme inspired by…” or “Color me lucky.” Choose Creator mode to apply and revert from chat. DexThemes tools do not read your workspace.</span>
      </div>
      <AccountPanel account={account} />
    </div>
    <div style={ui.controls}>
      <input style={ui.search} type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search themes…" aria-label="Search DexThemes" />
      <div style={ui.filters} aria-label="Filter themes">
        {FILTERS.map(([id, label]) => <button key={id} type="button" aria-pressed={category === id} style={{ ...ui.filter, ...(category === id ? ui.filterActive : {}) }} onClick={() => setCategory(id)}>{label}</button>)}
      </div>
    </div>
    <p style={ui.status}>{visible.length} themes · {catalogState === 'live' ? 'Public and community catalog connected' : catalogState === 'offline' ? 'Bundled catalog available offline' : 'Loading current community themes…'}</p>
    {runtime.notice ? <p role="status" style={ui.status}>{runtime.notice}</p> : null}
    {runtime.error ? <p role="alert" style={{ ...ui.status, color: 'var(--dsw-alias-state-error-primary)' }}>{runtime.error} Preview and account controls remain available.</p> : null}
    <div style={ui.grid}>
      {visible.map((theme) => {
        const isActive = runtime.activeThemeId === theme.id;
        return <article key={theme.id} style={{ ...ui.card, ...(isActive ? ui.cardActive : {}) }} data-theme-id={theme.id} data-active={isActive ? 'true' : undefined}>
          <PalettePreview theme={theme} />
          <div style={ui.cardContent}>
            <div style={ui.cardTop}><strong style={ui.cardName}>{theme.name}</strong><span style={ui.tag}>{theme.category}</span></div>
            <p style={ui.summary}>{theme.summary || 'Paired light and dark semantic palette.'}</p>
            <div style={ui.actions}>
              <button type="button" style={ui.button} onClick={() => setPreview(theme)}>Preview</button>
              {isActive
                ? <button type="button" style={{ ...ui.button, ...ui.danger }} onClick={() => controller.revert()}>Revert</button>
                : <button type="button" style={{ ...ui.button, ...ui.primary }} disabled={!capabilityAvailable} onClick={() => controller.apply(theme, { sourceSurface: 'settings_plugin_card' })}>{capabilityAvailable ? 'Apply' : 'Unavailable'}</button>}
            </div>
          </div>
        </article>;
      })}
    </div>
    {visible.length === 0 ? <p style={ui.status}>No themes match this search.</p> : null}
    {preview ? <ThemeDialog theme={preview} controller={controller} active={runtime.activeThemeId === preview.id} capabilityAvailable={capabilityAvailable} onClose={() => setPreview(null)} /> : null}
  </div>;
}

export function apply(ctx) {
  const analytics = createPluginAnalytics();
  const preferences = createThemeStateStore(defineStore);
  const persisted = normalizeThemeState(preferences.getSnapshot());
  const account = createHarnessAccountClient({
    reconnectRequired: persisted.reconnectRequired,
    onConnected: () => preferences.actions.rememberAccount(),
    onDisconnected: () => preferences.actions.forgetAccount(),
  });
  const controller = createHarnessThemeController(null, {
    preferences,
    onEvent: (event) => analytics.track(event),
    onApplied: () => account.recordHarnessUse(),
  });
  void analytics.start();
  ctx.inject(['theme'], (themeCtx) => {
    const detach = controller.attach(themeCtx.theme);
    themeCtx.effect(() => detach, 'dexthemes: optional theme capability');
  });
  ctx.effect(() => () => {
    controller.destroy();
    account.destroy();
    void analytics.destroy();
  }, 'dexthemes: theme and analytics lifecycle');
  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'dexthemes',
    order: 1,
    label: 'DexThemes',
  }, () => <DexThemesSettings controller={controller} account={account} />));
}
