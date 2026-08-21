# Host customization export and setup guide

DexThemes keeps host application changes user-controlled. `npm run build:host-exports` produces deterministic review artifacts under `dist/host-exports/`; it does not install packages, launch a host, write a host profile, or publish anything. The canonical registry contains exactly 12 harnesses, while only proven seams receive exports.

## Exported hosts

### Codex

The existing website handoff copies one `codex-theme-v1` import string. Review it, open Codex Settings → Appearance, and import it. This remains explicit copy/import; there is no website-to-app control path.

### DeepSeek Harness

The existing `@dexthemes/deepseek-harness-plugin` is the only delivered native integration. Installation is a separate user action. Inside the installed plugin, Harness owns the approval boundary for Apply and Revert. The standalone website only links to setup.

### Claude Code

DexThemes exports `themes/<slug>-dark.json` and `themes/<slug>-light.json` separately. Copy reviewed files into `~/.claude/themes/`, then select one with `/theme`. Claude Code does not document automatic pairing of custom dark and light files. Creating `~/.claude/themes/` for the first time requires a Claude Code restart.

### Qwen Code

DexThemes exports separate dark and light JSON files. Keep a reviewed file inside the user home directory and set Qwen Code's `ui.theme` to that file path; the setting selects the file directly. Remove or change `ui.theme` to reverse it. Qwen Code documents that `/theme` changes are unavailable while `ui.theme` pins a name or file, so this flow does not claim a separate `/theme` selection step. The export is a theme file, not a theme-extension manifest.

### OpenCode

DexThemes exports one JSON file whose values contain paired `dark` and `light` colors. Place it in `.opencode/themes` for a project or `$XDG_CONFIG_HOME/opencode/themes` (normally `~/.config/opencode/themes`) for the user, then select it with `/theme`. The advertised schema endpoint returned 404 during verification, so DexThemes does not emit `$schema`.

### Pi

DexThemes exports a code-free package: `package.json` plus two JSON theme files and no scripts, dependencies, or executable entrypoint. Review the entire package, load it temporarily with `pi -e <export-directory>` or install it with `pi install <export-directory>`, then select a theme. Package discovery and loaded appearance were not exercised in this run.

### Zed

DexThemes exports one Theme Family JSON file under `themes/`. Copy the reviewed file to `~/.config/zed/themes`, then use Zed's Theme Selector. The exporter uses the official v0.2.0 shape and forces `background.appearance` to `opaque`. Official destinations use `zed.dev`.

### Cursor

DexThemes exports private, review-only VS Code color-theme extension source. It retains `publisher: "replace-with-authorized-publisher"`, version `0.0.0`, and `private: true`. Do not treat this source as a Cursor install package or marketplace listing. Authorized publisher review, Cursor marketplace availability, installed behavior, Agent-surface coverage, and reversal remain unproven. No Cursor command or profile action is part of setup.

### T3 Code

DexThemes exports one stable v1 JSON file with all 57 supported color roles and an opposite-appearance `variants` entry when both palettes exist. It deliberately omits `collection`, `managed`, and `sidebarArtwork`. Copy or download the JSON, then import it through Settings → Appearance → Themes → Add theme. T3 Code accepts file selection, paste, or drop and keeps installation/selection under user control.

### Grok Build — limited pager colors

DexThemes exports separate light and dark `*.pager.toml` snippets containing exactly five documented paths:

- `scrollback.scrollbar.scrollbar_bg`
- `scrollback.scrollbar.scrollbar_fg`
- `scrollback.blocks.edit.accent`
- `scrollback.blocks.thinking.accent`
- `scrollback.blocks.execute.running_accent`

Choose one variant, inspect the existing `~/.grok/pager.toml`, record its exact bytes and SHA-256, and manually merge only the five keys after reviewing the diff. Restart Grok Build as the official docs require. Restore the saved preimage only if the current file is otherwise unchanged. DexThemes ships no local mutator, never reads `auth.json`, and does not call this a full theme, plugin, or MCP integration.

## No generated integration

### Google Antigravity

First-party settings prove that appearance/custom-theme controls exist, but the stable payload/token schema, import or write path, extension theme contribution point, and exact restore/remove contract are Unknown. DexThemes therefore generates no Antigravity exporter, plugin, setup destination, or runtime claim. Preview-only DexThemes palettes remain separate from Antigravity integration support.

### Conductor

No supported custom-theme seam was proven. DexThemes generates no Conductor payload or setup destination and keeps the registry entry Coming soon.

## Reproducible local checks

```sh
npm run build:host-exports
npm run test:host-exports
```

These commands prove deterministic source and generated-file behavior only. They do not prove publication, marketplace acceptance, host installation, loaded appearance, or production availability.
