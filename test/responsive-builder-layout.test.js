import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const builderCssUrl = new URL('../styles/builder.css', import.meta.url);
const mobileCssUrl = new URL('../styles/mobile.css', import.meta.url);

test('builder fields use a bounded label and control grid', async () => {
  const css = await readFile(builderCssUrl, 'utf8');
  const fieldRule = css.match(/\.builder-field\s*\{(?<body>[^}]+)\}/)?.groups?.body || '';

  assert.match(fieldRule, /display:\s*grid/);
  assert.match(fieldRule, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/);
  assert.match(fieldRule, /column-gap:\s*12px/);
  assert.doesNotMatch(fieldRule, /justify-content:\s*space-between/);
});

test('compact builder keeps controls near labels and gives the name field breathing room', async () => {
  const css = await readFile(mobileCssUrl, 'utf8');

  assert.match(css, /\.panel\.mobile-active\s+\.builder-field\s*\{[^}]*grid-template-columns:\s*minmax\(116px,\s*148px\)\s+auto[^}]*justify-content:\s*start[^}]*column-gap:\s*clamp\(12px,\s*2vw,\s*20px\)/s);
  assert.match(css, /\.builder-panel\s*\{\s*padding:\s*12px 16px 0;/);
  assert.match(css, /\.builder-name-input\s*\{[^}]*margin-bottom:\s*12px/s);
});

test('compact browse removes the stacked search-to-category gutter', async () => {
  const css = await readFile(mobileCssUrl, 'utf8');

  assert.match(css, /\.search-bar-wrapper\s*\{[^}]*padding:\s*8px 16px 2px/s);
  assert.match(css, /\.mobile-cat-pills\s*\{[^}]*padding:\s*2px 16px 5px/s);
  assert.match(css, /@media \(max-width:\s*768px\)[\s\S]*\.search-bar-wrapper\s*\{\s*padding:\s*6px 12px 2px;/);
  assert.match(css, /--mobile-browse-pills-top:\s*0px/);
});
