import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
import { applyHarnessThemeWithConnectedActivity } from './apply-coordinator.js';
import { copyDeviceUserCode } from './device-code-handoff.js';
import { createThemeStateStore, normalizeThemeState } from './theme-state.js';

export const inject = ['slots'];

const PLUGIN_CSS = `
  @container dexthemes-settings (max-width: 520px) {
    .dexthemes-plugin-header {
      grid-template-columns: minmax(0, 1fr) !important;
      grid-template-areas: "copy" "account" "intro" !important;
    }
    .dexthemes-account-shell { justify-self: stretch !important; width: 100% !important; }
    .dexthemes-account-trigger { width: 100% !important; }
    .dexthemes-plugin-intro { white-space: normal !important; }
  }
  @container dexthemes-settings (max-width: 540px) {
    .dexthemes-feature-strip { grid-template-columns: minmax(0, 1fr) !important; }
    .dexthemes-create-segment {
      border-left: 0 !important;
      border-top: 1px solid var(--dsw-alias-border-l1) !important;
    }
    .dexthemes-plugin-controls { grid-template-columns: minmax(0, 1fr) !important; }
  }
`;

const ui = Object.freeze({
  root: { width: '100%', maxWidth: 980, color: 'var(--dsw-alias-label-primary)', display: 'flex', flexDirection: 'column', gap: 12, container: 'dexthemes-settings / inline-size' },
  header: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 220px', gridTemplateAreas: '"copy account" "intro intro"', alignItems: 'start', columnGap: 12, rowGap: 4 },
  headerCopy: { gridArea: 'copy', minWidth: 0 },
  intro: { gridArea: 'intro', margin: '2px 0 0', whiteSpace: 'nowrap' },
  eyebrow: { margin: 0, color: 'var(--dsw-alias-brand-primary)', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' },
  title: { margin: '4px 0 0', fontSize: 24, lineHeight: 1.25 },
  body: { margin: '6px 0 0', color: 'var(--dsw-alias-label-secondary)', fontSize: 13, lineHeight: 1.5 },
  featureStrip: { display: 'grid', gridTemplateColumns: 'minmax(190px,.8fr) minmax(0,1.2fr)', minHeight: 70, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 10, overflow: 'hidden' },
  featureSegment: { minWidth: 0, padding: '8px 12px', boxSizing: 'border-box', display: 'grid', alignItems: 'center' },
  active: { gridTemplateColumns: '42px minmax(0,1fr) auto', gap: 12 },
  compactPalette: { width: 42, height: 42, display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 7, overflow: 'hidden', flex: '0 0 auto' },
  activeCopy: { minWidth: 0 },
  activeLabel: { display: 'block', color: 'var(--dsw-alias-label-secondary)', fontSize: 11 },
  activeName: { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', overflowWrap: 'anywhere', marginTop: 2, maxHeight: '2.4em', fontSize: 13, lineHeight: 1.2, fontWeight: 700 },
  compactRevert: { width: 28, height: 28, border: '1px solid var(--dsw-alias-border-l2)', background: 'transparent', color: 'var(--dsw-alias-state-error-primary)', borderRadius: 7, padding: 0, font: 'inherit', fontSize: 15, cursor: 'pointer' },
  createCallout: { gridTemplateColumns: '30px minmax(0,1fr)', gap: 10, borderLeft: '1px solid var(--dsw-alias-border-l1)' },
  createIcon: { width: 28, height: 28, color: 'var(--dsw-alias-label-primary)' },
  createCopy: { display: 'grid', gap: 3, minWidth: 0 },
  controls: { display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) auto', gap: 10 },
  search: { width: '100%', boxSizing: 'border-box', border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', borderRadius: 8, minHeight: 38, padding: '0 12px', font: 'inherit' },
  filters: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filter: { border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-secondary)', borderRadius: 999, minHeight: 34, padding: '0 12px', font: 'inherit', fontSize: 12, cursor: 'pointer' },
  filterActive: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)' },
  status: { margin: 0, color: 'var(--dsw-alias-label-secondary)', fontSize: 12 },
  accountShell: { gridArea: 'account', position: 'relative', justifySelf: 'end', width: 220, maxWidth: '100%' },
  accountTrigger: { width: '100%', minHeight: 44, border: '1px solid var(--dsw-alias-brand-primary)', background: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-layer-1))', color: 'var(--dsw-alias-label-primary)', borderRadius: 9, padding: '5px 8px', display: 'grid', gridTemplateColumns: '28px minmax(0,1fr) auto', alignItems: 'center', gap: 8, textAlign: 'left', font: 'inherit', cursor: 'pointer', boxSizing: 'border-box' },
  accountAvatar: { position: 'relative', width: 28, height: 28, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-bg-base)', fontSize: 14, fontWeight: 750 },
  accountOnline: { position: 'absolute', right: -2, bottom: -1, width: 8, height: 8, borderRadius: 999, background: 'var(--dsw-alias-state-success-primary)', border: '2px solid var(--dsw-alias-bg-layer-1)' },
  accountTriggerCopy: { minWidth: 0, display: 'grid', gap: 1 },
  accountTitle: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700 },
  accountMeta: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-secondary)', fontSize: 10.5 },
  accountChevron: { color: 'var(--dsw-alias-label-secondary)', fontSize: 18, lineHeight: 1, transformOrigin: 'center', transition: 'transform 140ms ease' },
  accountPopover: { position: 'absolute', zIndex: 100, top: 'calc(100% + 8px)', right: 0, width: 340, maxWidth: 'min(340px,calc(100vw - 48px))', border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-overlay)', borderRadius: 10, padding: 12, boxShadow: '0 16px 42px rgba(0,0,0,.22)', boxSizing: 'border-box' },
  accountCopy: { display: 'grid', gap: 5, minWidth: 0 },
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

function CompactPalettePreview({ theme }) {
  const darkSurface = theme?.dark?.surface || 'var(--dsw-alias-bg-base)';
  const lightSurface = theme?.light?.surface || 'var(--dsw-alias-bg-layer-2)';
  return <span style={ui.compactPalette} aria-hidden="true">
    <span style={{ background: darkSurface }} />
    <span style={{ background: lightSurface }} />
  </span>;
}

function ThemeDialog({ theme, controller, account, active, capabilityAvailable, onClose }) {
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
              onClick={() => {
                if (applyHarnessThemeWithConnectedActivity(
                  controller,
                  account,
                  theme,
                  { sourceSurface: 'settings_plugin_preview' },
                )) onClose();
              }}
            >{capabilityAvailable ? 'Apply to DeepSeek' : 'Theme service unavailable'}</button>}
      </div>
    </section>
  </div>;
}

function AccountPanel({ account }) {
  const state = useSyncExternalStore(account.subscribe, account.getSnapshot, account.getSnapshot);
  const [codeCopyStatus, setCodeCopyStatus] = useState('idle');
  const [expanded, setExpanded] = useState(false);
  const shellRef = useRef(null);
  const busy = state.status === 'connecting';
  const connected = state.status === 'connected';
  const disconnecting = state.status === 'disconnecting';
  const waiting = state.status === 'awaiting_authorization';
  const publishedThemes = Array.isArray(state.stats?.themes) ? state.stats.themes.length : 0;
  const unlockCount = state.unlocks.length;
  const triggerTitle = connected
    ? 'DexThemes account'
    : waiting
      ? 'Finish connecting'
      : busy
        ? 'Connecting…'
        : state.reconnectRequired
          ? 'Reconnect DexThemes'
          : 'Sign in to DexThemes';
  const triggerMeta = connected
    ? `${publishedThemes} themes · ${unlockCount} achievements`
    : waiting
      ? `${state.userCode || 'GitHub code'} · Continue with GitHub`
      : state.error
        ? 'Account needs attention'
        : 'Creator stats & achievements';

  useEffect(() => {
    setCodeCopyStatus('idle');
  }, [state.userCode, waiting]);

  useEffect(() => {
    if (!expanded) return undefined;
    const closeOnOutsidePress = (event) => {
      if (!shellRef.current?.contains(event.target)) setExpanded(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      setExpanded(false);
    };
    globalThis.document?.addEventListener('pointerdown', closeOnOutsidePress);
    globalThis.addEventListener?.('keydown', closeOnEscape, true);
    return () => {
      globalThis.document?.removeEventListener('pointerdown', closeOnOutsidePress);
      globalThis.removeEventListener?.('keydown', closeOnEscape, true);
    };
  }, [expanded]);

  useEffect(() => {
    if (waiting || state.error) setExpanded(true);
  }, [state.error, waiting]);

  const openAccount = () => {
    if (!connected && !waiting && !busy && !disconnecting) {
      setExpanded(true);
      void account.connect();
      return;
    }
    setExpanded((value) => !value);
  };

  return <div ref={shellRef} className="dexthemes-account-shell" style={ui.accountShell}>
    <button
      type="button"
      className="dexthemes-account-trigger"
      style={ui.accountTrigger}
      aria-expanded={expanded}
      aria-controls="dexthemes-account-popover"
      onClick={openAccount}
    >
      <span style={ui.accountAvatar} aria-hidden="true">
        D
        {connected ? <span style={ui.accountOnline} /> : null}
      </span>
      <span style={ui.accountTriggerCopy}>
        <span style={ui.accountTitle}>{triggerTitle}</span>
        <span style={ui.accountMeta}>{triggerMeta}</span>
      </span>
      <span style={{ ...ui.accountChevron, transform: expanded ? 'rotate(90deg)' : 'none' }} aria-hidden="true">›</span>
    </button>
    {expanded ? <section id="dexthemes-account-popover" style={ui.accountPopover} aria-label="DexThemes account">
      <div style={ui.accountCopy}>
        <strong>{connected ? 'DexThemes account' : waiting ? 'Connect with GitHub' : 'Sign in to DexThemes'}</strong>
        <span style={ui.status}>{connected
          ? `${publishedThemes} published themes · ${unlockCount} achievements`
          : waiting
            ? `Enter code ${state.userCode} to finish connecting.`
            : state.reconnectRequired
              ? 'Reconnect after restart to recover creator stats, achievements, and account-only themes.'
              : 'Sign in for creator stats, achievements, and account-only themes.'}</span>
        {state.error ? <span role="alert" style={{ ...ui.status, color: 'var(--dsw-alias-state-error-primary)' }}>{state.error}</span> : null}
        {waiting && codeCopyStatus === 'copied'
          ? <span role="status" style={ui.status}>Code copied. Paste it into GitHub.</span>
          : waiting && codeCopyStatus === 'failed'
            ? <span role="alert" style={{ ...ui.status, color: 'var(--dsw-alias-state-error-primary)' }}>Copy unavailable. Select the code above.</span>
            : null}
        {connected && state.activityStatus === 'recording'
          ? <span role="status" style={ui.status}>Recording Connected Apps activity…</span>
          : connected && state.activityStatus === 'recorded'
            ? <span role="status" style={ui.status}>Connected Apps activity recorded.</span>
            : null}
        {connected && state.activityError
          ? <span role="alert" style={{ ...ui.status, color: 'var(--dsw-alias-state-error-primary)' }}>{state.activityError}</span>
          : null}
      </div>
      <div style={{ ...ui.accountActions, marginTop: 10 }}>
        {waiting && state.userCode
          ? <button
              type="button"
              style={ui.button}
              onClick={() => {
                void copyDeviceUserCode(state.userCode).then((result) => {
                  setCodeCopyStatus(result.copied ? 'copied' : 'failed');
                });
              }}
            >{codeCopyStatus === 'copied' ? 'Code copied' : 'Copy code'}</button>
          : null}
        {waiting && state.verificationUrl
          ? <a style={ui.link} href={state.verificationUrl} target="_blank" rel="noreferrer">Continue with GitHub</a>
          : null}
        {connected || disconnecting
          ? <>
              {connected && state.canRetryActivity
                ? <button type="button" style={ui.button} onClick={() => { void account.retryHarnessUse().catch(() => {}); }}>Retry activity</button>
                : null}
              <button
                type="button"
                style={ui.button}
                disabled={disconnecting}
                onClick={() => {
                  void account.disconnect().then((disconnected) => {
                    if (disconnected) setExpanded(false);
                  });
                }}
              >{disconnecting ? 'Signing out…' : 'Sign out'}</button>
            </>
          : waiting || busy
            ? <button type="button" style={ui.button} onClick={() => { void account.disconnect(); }}>{busy ? 'Cancel sign in' : 'Cancel'}</button>
            : <button type="button" style={{ ...ui.button, ...ui.primary }} onClick={() => { void account.connect(); }}>{state.reconnectRequired ? 'Reconnect with GitHub' : 'Sign in with GitHub'}</button>}
      </div>
    </section> : null}
  </div>;
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

  const currentTheme = active || desired;
  const currentThemeName = currentTheme?.name || runtime.desiredThemeId || 'Harness default';
  const currentThemePreview = currentTheme
    || accessibleThemes.find((theme) => theme.id === 'deepseek-default')
    || null;

  return <div style={ui.root} data-dexthemes-harness-plugin={PLUGIN_VERSION}>
    <style>{PLUGIN_CSS}</style>
    <header className="dexthemes-plugin-header" style={ui.header}>
      <div style={ui.headerCopy}>
        <p style={ui.eyebrow}>DexThemes for DeepSeek</p>
        <h2 style={ui.title}>Find your vibe. Stay in flow.</h2>
      </div>
      <AccountPanel account={account} />
      <p className="dexthemes-plugin-intro" style={{ ...ui.body, ...ui.intro }}>Explore DeepSeek, DexThemes, and community themes. Preview light and dark, then apply.</p>
    </header>
    <div className="dexthemes-feature-strip" style={ui.featureStrip} data-dexthemes-feature-row="true">
      <aside style={{ ...ui.featureSegment, ...ui.active }} aria-live="polite">
        <CompactPalettePreview theme={currentThemePreview} />
        <span style={ui.activeCopy}>
          <span style={ui.activeLabel}>{active ? 'Active theme' : runtime.desiredThemeId ? 'Saved theme' : 'Active theme'}</span>
          <strong style={ui.activeName} title={currentThemeName}>{currentThemeName}</strong>
        </span>
        {runtime.desiredThemeId ? <button
          type="button"
          style={ui.compactRevert}
          title={active ? 'Revert theme' : 'Forget saved theme'}
          aria-label={active ? 'Revert theme' : 'Forget saved theme'}
          onClick={() => controller.revert()}
        >↶</button> : null}
      </aside>
      <div className="dexthemes-create-segment" style={{ ...ui.featureSegment, ...ui.createCallout }}>
        <svg style={ui.createIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.48 8.7 8.7 0 0 1-3.18-.83L4 20l1.7-4.2A7.5 7.5 0 1 1 20 11.5Z" />
        </svg>
        <span style={ui.createCopy}>
          <strong>Create with your words</strong>
          <span style={ui.status}>In a new thread, try “Color me lucky.”</span>
        </span>
      </div>
    </div>
    <div className="dexthemes-plugin-controls" style={ui.controls}>
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
                : <button
                    type="button"
                    style={{ ...ui.button, ...ui.primary }}
                    disabled={!capabilityAvailable}
                    onClick={() => applyHarnessThemeWithConnectedActivity(
                      controller,
                      account,
                      theme,
                      { sourceSurface: 'settings_plugin_card' },
                    )}
                  >{capabilityAvailable ? 'Apply' : 'Unavailable'}</button>}
            </div>
          </div>
        </article>;
      })}
    </div>
    {visible.length === 0 ? <p style={ui.status}>No themes match this search.</p> : null}
    {preview ? <ThemeDialog theme={preview} controller={controller} account={account} active={runtime.activeThemeId === preview.id} capabilityAvailable={capabilityAvailable} onClose={() => setPreview(null)} /> : null}
  </div>;
}

export function apply(ctx) {
  const analytics = createPluginAnalytics();
  const preferences = createThemeStateStore(defineStore);
  const persisted = normalizeThemeState(preferences.getSnapshot());
  const account = createHarnessAccountClient({
    pluginVersion: PLUGIN_VERSION,
    reconnectRequired: persisted.reconnectRequired,
    onConnected: () => preferences.actions.rememberAccount(),
    onDisconnected: () => preferences.actions.forgetAccount(),
  });
  const controller = createHarnessThemeController(null, {
    preferences,
    onEvent: (event) => analytics.track(event),
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
