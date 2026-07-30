// ================================================
// DexThemes — Statsig Analytics
// ================================================

import { StatsigClient } from '@statsig/js-client';
import * as state from './state.js';

let statsigClient = null;
let statsigInitPromise = null;
let statsigReady = false;

function getStatsigUser() {
  if (state.currentUser) {
    return {
      userID: state.currentUser._id,
      email: state.currentUser.username || undefined,
      custom: {
        provider: state.currentUser.provider,
        signed_in: true,
        username: state.currentUser.username,
      },
    };
  }
  return {
    custom: {
      signed_in: false,
    },
  };
}

export async function initStatsig() {
  let clientKey = '';
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const config = await res.json();
      clientKey = config.statsigClientKey;
    }
  } catch (e) {
    console.warn('Failed to fetch config:', e);
  }
  if (!clientKey) return;

  try {
    statsigClient = new StatsigClient(clientKey, getStatsigUser());
    statsigInitPromise = statsigClient.initializeAsync()
      .then(() => {
        statsigReady = true;
        trackEvent('site_loaded', null, {
          surface: 'gallery',
          landing_source: state.landingContext.source,
          referral_channel: state.landingContext.referralChannel,
        });
      })
      .catch((error) => {
        console.warn('Statsig init failed:', error);
      });
  } catch (error) {
    console.warn('Statsig unavailable:', error);
  }
}

export async function syncStatsigUser() {
  if (!statsigClient || typeof statsigClient.updateUserAsync !== 'function') return;

  try {
    if (statsigInitPromise) await statsigInitPromise;
    await statsigClient.updateUserAsync(getStatsigUser());
  } catch (error) {
    console.warn('Statsig user sync failed:', error);
  }
}

export function trackEvent(name, value, metadata) {
  if (!statsigClient) return;

  const log = () => {
    try {
      statsigClient.logEvent(
        name,
        typeof value === 'number' || typeof value === 'string' ? value : null,
        metadata || {},
      );
    } catch (error) {
      console.warn(`Statsig event failed: ${name}`, error);
    }
  };

  if (statsigReady) {
    log();
    return;
  }

  if (statsigInitPromise) {
    statsigInitPromise.then(log).catch(() => {});
  }
}
