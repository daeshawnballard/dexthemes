import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  getPreviewWindowState,
  PREVIEW_WINDOW_STATE,
} from '../src/preview-window-state.js';

test('preview window controls are reversible from every expanded state', () => {
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.NORMAL, 'minimize'),
    PREVIEW_WINDOW_STATE.MINIMIZED,
  );
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.MINIMIZED, 'minimize'),
    PREVIEW_WINDOW_STATE.NORMAL,
  );
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.NORMAL, 'maximize'),
    PREVIEW_WINDOW_STATE.FULLSCREEN,
  );
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.FULLSCREEN, 'maximize'),
    PREVIEW_WINDOW_STATE.NORMAL,
  );
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.FULLSCREEN, 'minimize'),
    PREVIEW_WINDOW_STATE.MINIMIZED,
  );
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.MINIMIZED, 'maximize'),
    PREVIEW_WINDOW_STATE.FULLSCREEN,
  );
  assert.equal(
    getPreviewWindowState(PREVIEW_WINDOW_STATE.CLOSED, 'reopen'),
    PREVIEW_WINDOW_STATE.NORMAL,
  );
});

test('preview traffic lights are native buttons handled by delegated actions', async () => {
  const [template, actions] = await Promise.all([
    readFile(new URL('../templates/index.template.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/delegated-actions.js', import.meta.url), 'utf8'),
  ]);

  for (const action of [
    'close-preview-window',
    'minimize-preview-window',
    'maximize-preview-window',
  ]) {
    assert.match(template, new RegExp(`<button[^>]+data-action="${action}"`));
    assert.match(actions, new RegExp(`case '${action}'`));
  }

  assert.match(template, /aria-label="Close preview"/);
  assert.match(template, /aria-label="Minimize preview"/);
  assert.match(template, /aria-label="Maximize preview"/);
});
