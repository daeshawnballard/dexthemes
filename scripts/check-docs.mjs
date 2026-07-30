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
