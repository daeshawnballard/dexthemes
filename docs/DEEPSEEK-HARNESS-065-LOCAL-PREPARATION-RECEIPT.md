# DeepSeek Harness plugin 0.6.5 local preparation receipt

Date: 2026-08-20 EDT

Outcome: **LOCAL_UNPUBLISHED_RELEASE_PREPARATION_PASS**. This records one reproducible local package byte set only. It is not an npm publication, tag, registry receipt, marketplace approval, loaded-Harness-runtime result, production authorization, or endorsement claim.

## Scope and source lock

- Package: `@dexthemes/deepseek-harness-plugin@0.6.5`
- Base revision before this local preparation: `1f246a3f88f8835fa7801b013a50e76af15e7a06`
- Prepared byte set: the uncommitted `0.6.5` working-tree changes described and hashed in this receipt; those bytes are not contained in the base revision above.
- Historical evidence intentionally retained: [0.6.4 release receipt](DEEPSEEK-HARNESS-064-RUNTIME-RECEIPT.md)
- Historical 0.6.4 client SHA-256 remains `bf6ae700127d675504b97b8f31e82b6560edaa949448271f8876e6944509586c`; it is not rewritten or attributed to 0.6.5.

## Reproducibility evidence

From the repository root, this command builds the checked-in bundles twice and fails if either bundle hash changes. It also rejects lifecycle scripts and a pack manifest that contains anything outside the explicit package allowlist.

```sh
npm --prefix packages/deepseek-harness-plugin run verify:release
```

Observed values:

- `package.json` SHA-256: `4b28d1c3e3aa1157d899ca96801f18add2ae5358d283730e5d1fdd721a92d154`
- `src/catalog.generated.js` SHA-256: `20cba2183d92486f7f743d5a9e243bb0300afd002d70bf3ea21cb6fa22e7cd65`
- Build 1 `lib/client.js` SHA-256: `c93f0951fbe82c8023c5d8f2563a19a05f6118089b5e00fb997c8ae135b9ee8e`
- Build 2 `lib/client.js` SHA-256: `c93f0951fbe82c8023c5d8f2563a19a05f6118089b5e00fb997c8ae135b9ee8e`
- Build 1 and 2 `lib/index.js` SHA-256: `1a1b763bb184e3f986a8fa095f461cc40032829d729386893d28f5a0073fff01`

The generated catalog was independently regenerated from the base revision in an isolated temporary copy and byte-compared with the prepared working tree's `src/catalog.generated.js`; the result was `MATCH` with the SHA-256 above. This avoided writing shared website outputs in the working tree.

## Pack inspection

The verifier ran exactly:

```sh
npm pack --dry-run --json --ignore-scripts
```

It produced no tarball. The resulting canonical pack-manifest SHA-256 was `a63a78045f5853db27f64b0fec1ddc2be8cd7b9fe7d5d8bb09c51c57fef23d85` and listed only:

```text
CHANGELOG.md
cordis.patch.yml
lib/client.js
lib/index.js
LICENSE
package.json
README.md
```

The package declares no npm lifecycle scripts (`prepublish`, `prepare`, `prepublishOnly`, `prepack`, `postpack`, or `postpublish`). The verifier also found no high-signal opaque credential pattern in any packed file. The allowlist excludes source directories, verification scripts, local receipts, node modules, credentials, and other private files.

## Evidence boundary

This receipt proves local source/build/pack consistency only. It does not provide a registry tarball SHA or integrity value because `0.6.5` has not been packed for distribution or published. It also does not prove package installation, discovery, Apply/Revert, account connection, MCP behavior, or any loaded DeepSeek Harness runtime behavior.
