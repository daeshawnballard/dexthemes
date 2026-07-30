#!/usr/bin/env node
// ================================================
// Warm Vercel edge cache for all OG images + share pages
// Run after deploy: node scripts/warm-cache.mjs
// ================================================

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themeMap = JSON.parse(
  readFileSync(join(__dirname, '..', 'api', 'theme-map.json'), 'utf-8')
);

const BASE = process.env.BASE_URL || 'https://www.dexthemes.com';
const CONCURRENCY = 6; // parallel fetches at a time
const themeIds = Object.keys(themeMap);

// Build all URLs to warm
const urls = [];
for (const id of themeIds) {
  const theme = themeMap[id];
  for (const variant of ['dark', 'light']) {
    if (theme[variant]) {
      // OG image endpoint (the expensive one — generates PNG)
      urls.push(`${BASE}/api/og?theme=${encodeURIComponent(id)}&variant=${variant}`);
      // Share page endpoint (lightweight HTML, but also edge-cached)
      urls.push(`${BASE}/api/share?theme=${encodeURIComponent(id)}&variant=${variant}`);
    }
  }
}

console.log(`🔥 Warming ${urls.length} URLs across ${themeIds.length} themes...\n`);

let success = 0;
let failed = 0;
let idx = 0;

async function fetchUrl(url) {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const ms = Date.now() - start;
    const cached = res.headers.get('x-vercel-cache') || '—';
    const type = url.includes('/api/og') ? 'OG ' : 'SHR';
    const status = res.ok ? '✓' : `✗ ${res.status}`;
    console.log(`  ${type} ${status} ${ms}ms [${cached}] ${url.split('?')[1]}`);
    if (res.ok) success++;
    else failed++;
  } catch (e) {
    const ms = Date.now() - start;
    console.log(`  ✗ ${ms}ms ERR ${url.split('?')[1]} — ${e.message}`);
    failed++;
  }
}

// Process in batches
async function run() {
  const startTime = Date.now();

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(fetchUrl));
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done in ${elapsed}s — ${success} cached, ${failed} failed`);
}

run();
