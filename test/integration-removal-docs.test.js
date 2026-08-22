import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('integration removal guidance targets only the installed connector surfaces', async () => {
  const [antigravity, cursorPlugin, cursorVsix, opencode, pi] = await Promise.all([
    read('../integrations/antigravity-plugin/dexthemes-preview/README.md'),
    read('../integrations/cursor-plugin/dexthemes-cursor/README.md'),
    read('../integrations/cursor-theme-extension/dexthemes-cursor-theme/README.md'),
    read('../integrations/opencode/dexthemes/README.md'),
    read('../integrations/pi-extension/dexthemes-pi/README.md'),
  ]);

  assert.match(antigravity, /Remove only this manually added plugin/);
  assert.match(antigravity, /dexthemes-preview.*Trash/is);
  assert.match(antigravity, /Customizations.*dexthemes-preview.*absent/is);
  assert.match(cursorPlugin, /Remove only this physical local plugin/);
  assert.match(cursorPlugin, /~\/\.cursor\/plugins\/local\/dexthemes-cursor/);
  assert.match(cursorPlugin, /package, its `dexthemes` MCP entry,\n+and its skill are all absent/);
  assert.match(cursorVsix, /cursor --uninstall-extension dexthemes-local\.dexthemes-cursor-theme/);
  assert.match(cursorVsix, /cursor --list-extensions --show-versions/);
  assert.match(opencode, /remove only the `dexthemes` member of the\n+`mcp` object/i);
  assert.match(opencode, /opencode mcp list/);
  assert.match(opencode, /do not substitute `logout`/i);
  assert.match(pi, /pi remove \/absolute\/path\/to\/integrations\/pi-extension\/dexthemes-pi/);
  assert.match(pi, /pi remove \/absolute\/path\/to\/dist\/host-exports\/pi/);
  assert.match(pi, /Do not remove unrelated packages, extensions, themes, or\nsettings entries/);
});
