import { readFile } from 'node:fs/promises';

const checks = [
  {
    file: 'README.md',
    forbidden: ['preview.js', 'dist/app.js'],
    required: ['docs/ARCHITECTURE.md', 'docs/CONTENT.md', 'CONTRIBUTING.md'],
  },
  {
    file: 'CONTRIBUTING.md',
    forbidden: ['no build step required'],
    required: ['npm run build', 'npm run validate', 'npm run content:generate'],
  },
  {
    file: 'docs/CONTENT.md',
    forbidden: [],
    required: ['Daeshawn Ballard', 'https://x.com/daeshawn', 'X-Robots-Tag: noindex'],
  },
  {
    file: 'packages/deepseek-harness-plugin/README.md',
    forbidden: ['@dexthemes/deepseek-harness-plugin@0.4.1'],
    required: [
      '@dexthemes/deepseek-harness-plugin@0.6.2',
      '0.1.0-rc.5',
      'No broader Harness semver range is claimed',
      'Restart recovery',
      'plugin --profile web remove',
      'CHANGELOG.md',
      'issues/new?template=bug_report.md',
    ],
  },
  {
    file: 'packages/deepseek-harness-plugin/CHANGELOG.md',
    forbidden: [],
    required: ['0.6.3 — Unreleased', '0.6.2 — 2026-08-14', '0.6.1 — 2026-08-14', '0.6.0 — 2026-08-14'],
  },
  {
    file: 'docs/DEEPSEEK-HARNESS.md',
    forbidden: ["inject: ['theme']"],
    required: [
      "ctx.inject(['theme']",
      '0.1.0-rc.5',
      'explicit post-restart reconnect',
      'deepseek_theme_restore_succeeded',
      'deepseek_theme_capability_unavailable',
    ],
  },
  {
    file: 'public/support.html',
    forbidden: [],
    required: ['Harness CLI version', 'DexThemes plugin version', 'install source', 'CHANGELOG.md'],
  },
];

let failed = false;

for (const check of checks) {
  const content = await readFile(new URL(`../${check.file}`, import.meta.url), 'utf8');

  for (const token of check.forbidden) {
    if (content.includes(token)) {
      console.error(`${check.file} still contains forbidden text: ${token}`);
      failed = true;
    }
  }

  for (const token of check.required) {
    if (!content.includes(token)) {
      console.error(`${check.file} is missing required text: ${token}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('docs check passed');
