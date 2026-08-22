# DexThemes Cursor Theme

This local Cursor/VS Code UI extension installs the **DexThemes Nocturnal Vigil Dark** color theme and exposes two host-supported commands:

- **DexThemes: Apply Nocturnal Vigil** stores the current `workbench.colorTheme` value, then selects the bundled DexThemes theme.
- **DexThemes: Revert Previous Theme** restores the stored theme and clears the saved reversal state.

The extension uses Cursor's VS Code-compatible color-theme contribution and configuration APIs. It does not edit Cursor databases, undocumented profile files, Agent-shell styling, or unrelated extensions and MCP servers.

## Local build and install

Install the extension-local, integrity-locked build dependency first. Then invoke the installed binary directly; this workflow does not resolve a package at packaging time:

```sh
npm ci --ignore-scripts
npm run package
cursor --install-extension dexthemes-cursor-theme-0.1.0.vsix
```

Reload Cursor, open the Command Palette, and run **DexThemes: Apply Nocturnal Vigil**. Use **DexThemes: Revert Previous Theme** to restore the exact prior color-theme selection.

This repository package is for authorized local installation and verification. It is not a marketplace submission or publication claim.

## Uninstall and verify

Restore the prior theme first with **DexThemes: Revert Previous Theme**. Then
use Cursor's supported extension CLI with this package's exact extension ID:

```sh
cursor --uninstall-extension dexthemes-local.dexthemes-cursor-theme
cursor --list-extensions --show-versions
```

Verify the listed extensions no longer contain
`dexthemes-local.dexthemes-cursor-theme`, then reload Cursor and confirm both
DexThemes commands are absent. This removes only the VSIX extension; it does
not remove the Cursor MCP physical plugin or alter unrelated extensions.
