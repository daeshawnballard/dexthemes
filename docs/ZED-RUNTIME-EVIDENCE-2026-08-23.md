# Zed runtime evidence — 2026-08-23

## Outcome

`BLOCKED_REALITY_GATE`, score `0` under the strict 50-point MCP / 50-point
visible-mutation rubric. No DexThemes source, package, registry, generated
catalog, Zed profile, or Zed installation was changed.

## Installed-host check

Read-only checks found no `zed` executable on `PATH`, no
`/Applications/Zed.app`, and no user Applications Zed bundle. Consequently,
the installed Zed version, loaded MCP inventory, MCP result, theme selection,
and restoration are all `NOT_PERFORMED`.

Zed was not installed, launched, signed into, configured, or given a local
theme file. No terms, account, credential, or permission prompt was accepted.

## Official Zed contracts checked

On 2026-08-23, the first-party documentation established these current seams:

- [Themes](https://zed.dev/docs/themes) says local JSON themes belong in
  `~/.config/zed/themes` on macOS/Linux; the Theme Selector previews themes
  and saves a confirmed selection to Zed's settings.
- [Theme extensions](https://zed.dev/docs/extensions/themes) identifies the
  [`v0.2.0` theme-family schema](https://zed.dev/schema/themes/v0.2.0.json): a
  family has `name`, `author`, and `themes`; every theme has `name`,
  `appearance` (`light` or `dark`), and `style`.
- [Model Context Protocol](https://zed.dev/docs/ai/mcp) says Zed supports MCP
  Tools and Prompts. Custom local or remote servers are configured under
  Settings → AI → MCP Servers as `context_servers`; a remote server without an
  Authorization header can trigger standard MCP OAuth in the Zed UI.

These documented contracts establish a possible proof path. They do not prove
that DexThemes was loaded or called in Zed.

## Adapter export proof (non-scoring)

The checked-in `zed-theme-v1` adapter emits an opaque paired family at
`themes/adapter-test.json` for the canonical fixture. It passed the official
`v0.2.0` schema with dark and light entries. The exact serialized export
SHA-256 was:

```text
2bfe62b8b4539f962bb9aef9d4cc92051ff9b7990fc000e5f21c5d5ef33feb57
```

Focused host-export and platform tests passed: 51 passed, 0 failed. This is
source/export evidence only; it earns no runtime-rubric points.

## What 100 requires

In one real Zed profile, retain all of the following evidence:

1. Zed app/version and the exact loaded DexThemes MCP tool inventory.
2. One actual DexThemes MCP invocation and its in-app result.
3. The preexisting selected Zed theme, visibly applying the DexThemes local
   theme family through the supported Theme Selector, and visibly restoring
   that exact preexisting theme.

## Smallest user action

Daeshawn must personally install Zed from [zed.dev](https://zed.dev), review
and accept any installer/terms/account prompts, and then explicitly authorize
Zed-profile configuration and this reversible runtime check. Until then, do
not write `context_servers`, place a file in `~/.config/zed/themes`, or claim
any MCP, Apply, or restore proof.
