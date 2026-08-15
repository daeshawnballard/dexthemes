import { CONVEX_SITE_URL } from './config.js';
import { authFetch } from './session-auth.js';
import { escapeHtml } from './utils.js';
import {
  getConnectedAppDefinition,
  projectConnectedAppRecord,
} from '../shared/connected-apps-contract.js';

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function boundedError(value, fallback) {
  const normalized = String(value || fallback).replace(/[\r\n\t]+/g, ' ').trim();
  return normalized.slice(0, 160) || fallback;
}

export async function fetchConnectedApps({
  fetchImpl = authFetch,
  apiBaseUrl = CONVEX_SITE_URL,
} = {}) {
  const response = await fetchImpl(`${apiBaseUrl}/me/connected-apps`, { cache: 'no-store' });
  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(boundedError(payload.error, 'Connected Apps could not be loaded'));
  }
  return Object.freeze((Array.isArray(payload.apps) ? payload.apps : [])
    .map(projectConnectedAppRecord)
    .filter(Boolean));
}

export async function disconnectConnectedApp(integrationId, {
  fetchImpl = authFetch,
  apiBaseUrl = CONVEX_SITE_URL,
} = {}) {
  if (!getConnectedAppDefinition(integrationId)) {
    throw new TypeError('Unsupported connected app');
  }
  const response = await fetchImpl(`${apiBaseUrl}/me/connected-apps`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ integrationId }),
  });
  const payload = await parseJson(response);
  if (!response.ok) {
    throw new Error(boundedError(payload.error, 'Connected app could not be disconnected'));
  }
  return payload.disconnected === true;
}

export function formatConnectedAppDate(value) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 'Not recorded';
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderConnectedAppCard(app) {
  const applyCount = app.usage.recordedThemeApplies;
  const applyLabel = `${applyCount} recorded theme ${applyCount === 1 ? 'apply' : 'applies'}`;
  const versionLabel = app.pluginVersion
    ? `Plugin ${escapeHtml(app.pluginVersion)}`
    : 'Plugin version unavailable';
  return `
    <article class="connected-app-card">
      <div class="connected-app-copy">
        <div class="connected-app-heading">
          <span class="connected-app-name">${escapeHtml(app.integrationName)}</span>
          <span class="connected-app-badge">Installed integration</span>
        </div>
        <div class="connected-app-platform">${escapeHtml(app.platformName)}</div>
        <div class="connected-app-meta">
          <span>${versionLabel}</span>
          <span>Last used ${escapeHtml(formatConnectedAppDate(app.lastUsedAt))}</span>
          <span>${escapeHtml(applyLabel)}</span>
        </div>
      </div>
      ${app.canDisconnect ? `
        <button
          class="connected-app-disconnect-btn"
          type="button"
          data-action="disconnect-connected-app"
          data-integration-id="${escapeHtml(app.integrationId)}"
        >Disconnect</button>
      ` : ''}
    </article>
  `;
}

export function renderConnectedAppsSection({
  status = 'ready',
  apps = [],
  error = '',
} = {}) {
  const projectedApps = (Array.isArray(apps) ? apps : [])
    .map(projectConnectedAppRecord)
    .filter(Boolean);
  const statusContent = status === 'loading'
    ? '<div class="connected-app-status" role="status">Loading connected apps…</div>'
    : status === 'error'
      ? `<div class="connected-app-error" role="alert">
          <span>${escapeHtml(boundedError(error, 'Connected Apps could not be loaded'))}</span>
          <button type="button" data-action="retry-connected-apps">Retry</button>
        </div>`
      : '';
  const content = projectedApps.length
    ? `<div class="connected-app-list">${projectedApps.map(renderConnectedAppCard).join('')}</div>`
    : status === 'loading'
      ? ''
      : `<div class="connected-app-empty">
          No installed apps are connected yet. An app appears here only after verified DexThemes Connect authorization.
        </div>`;

  return `
    <section class="profile-metric-section connected-apps-section" id="connected-apps-section" aria-labelledby="connected-apps-title">
      <div class="connected-app-section-header">
        <div>
          <div class="profile-section-title" id="connected-apps-title">Connected Apps</div>
          <p>Installed integrations connected to this DexThemes account.</p>
        </div>
      </div>
      ${statusContent}
      ${content}
    </section>
  `;
}
