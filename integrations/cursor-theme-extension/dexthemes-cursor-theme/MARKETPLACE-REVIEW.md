# Cursor extension marketplace review packet

Date: 2026-08-23 EDT

Status: **PACKAGED; NOT_SUBMITTED; NOT_ACCEPTED**.

## Checked artifact

- Package: `dexthemes-cursor-theme@0.1.0`
- Extension ID: `dexthemes-local.dexthemes-cursor-theme`
- Artifact: `dexthemes-cursor-theme-0.1.0.vsix`
- SHA-256: `474b05d61a6f7ab435d445804eede9ea1b31e68a93d443d1ebe8f1053c9faa7d`
- Contents: manifest, README, LICENSE, extension entrypoint, reversible theme controller, and one dark color theme.
- Checks: `npm ci --ignore-scripts`, `npm test` (**9/9 passed**), and `npm run package` passed. `vsce` produced an 8-file, 6.28 KB VSIX.

The artifact is locally packaged. It has not been installed into a user Cursor profile for this release gate, submitted to any marketplace, accepted by a marketplace, or loaded in a current Cursor runtime.

## Current distribution routes

Cursor documents VS Code-compatible extension use and the package's local installation path is `cursor --install-extension <VSIX>`. I found no current Cursor-owned public publisher-portal or review/submission protocol. Do not describe a Visual Studio Marketplace or Open VSX listing as a Cursor marketplace acceptance.

For an external VS Code Marketplace listing, [Microsoft's current publishing guidance](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) requires a Marketplace publisher whose unique ID matches `package.json`; publisher IDs cannot be changed after creation. It packages with `vsce` and then publishes through the authenticated publisher account or the management portal.

[Open VSX publishing guidance](https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions) separately requires an account, Publisher Agreement acceptance, an access token, and creation of the matching namespace before upload; its optional verification is a distinct owner claim.

The current `publisher` is `dexthemes-local`. It is structurally valid in the packaged VSIX, but ownership of that external Marketplace publisher/Open VSX namespace is **UNKNOWN**. The immutable identity decision is the first terminal gate.

## Submission checklist and approval gates

1. Confirm the intended immutable publisher ID and that its account/namespace is owned. If it is not `dexthemes-local`, update the manifest before another package build; do not claim the existing VSIX is ready for the replacement ID.
2. Obtain explicit action-time approval to choose the Microsoft/Open VSX identity, log in, accept terms, create a publisher or namespace, and create/store any token. None of those actions is authorized by this packet.
3. Re-run `npm ci --ignore-scripts`, `npm test`, and `npm run package`; inspect the fresh VSIX contents and SHA-256.
4. Review the package page fields, icon decision, README, license, repository, support URL, categories, keywords, and publish target. Confirm that the listing says VS Code-compatible and never promises silent Cursor apply, marketplace acceptance, or an MCP capability.
5. With a specific target and fresh approval, submit exactly one checked VSIX through that target's authenticated publisher flow. Stop for the resulting review/scanning outcome; submission is not acceptance.
6. Only after a public listing is visible, record the canonical URL and perform a fresh install/load/Apply/Revert check. This package has no such public or loaded-runtime proof yet.

## Claude Code comparison

Claude Code marketplace distribution is repository-marketplace based, not a VSIX registry flow: it uses a marketplace source and plugin metadata rather than this extension manifest, VSIX package, VS Code publisher, or Open VSX namespace. Claude-specific implementation and marketplace files are intentionally outside this packet's ownership and were not edited.
