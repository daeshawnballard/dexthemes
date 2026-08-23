# Qwen Code runtime evidence — 2026-08-23

## Scope and result

This is a local, isolated Qwen Code runtime check for the DexThemes Qwen
export and anonymous MCP registration. It makes no production, publication, or
real-profile claim.

**Result: 50/100.** The reversible theme-mutation half is proved. The MCP
inventory connected, but no model-authenticated Qwen session was available to
invoke `mcp__dexthemes__search` or `fetch`, so the MCP-call half remains
unproved.

## Runtime and MCP inventory

- Runtime executed: Qwen Code `0.22.0`. A requested temporary `0.21.15`
  launch updated its own isolated runtime before interactive use; the final
  checks invoked the pinned `0.22.0` `cli.js` directly.
- Profile: a fresh temporary home under the local account home. The real
  `~/.qwen` profile was not edited.
- Registration: `dexthemes` → `https://www.dexthemes.com/api/mcp`, HTTP,
  `30000` ms timeout, with only `search` and `fetch` enabled.
- `qwen mcp list` reported:

  ```text
  ✓ dexthemes: https://www.dexthemes.com/api/mcp (http) - Connected
  ```

- A non-interactive prompt explicitly requesting one DexThemes `search` call
  stopped before model execution with `No auth type is selected`. Its result
  recorded `num_turns: 0`, `input_tokens: 0`, and `output_tokens: 0`; therefore
  it is not a real MCP invocation.
- The interactive runtime opened its provider-selection screen, including the
  terms/privacy link. No provider was selected and no terms were accepted.

## Theme apply and exact rollback

- Generated artifact: `dist/host-exports/qwen/themes/adapter-test-dark.json`
  (`531` bytes, SHA-256
  `798fa4a92475b90e2bc9aa17a715f575d23d6f52cd8bff1ab8faf4a98af424d0`).
- Before apply, the isolated `settings.json` had no `ui.theme` key:
  `{"present":false}`.
- Applied value:
  `ui.theme = "/Users/daeshawnballard/.dexthemes-qwen-runtime.5D0F4w/.qwen/themes/adapter-test-dark.json"`.
- The direct Qwen `0.22.0` terminal runtime rendered its provider-selection
  surface without the previous `Theme ... not found` warning, proving that it
  accepted the DexThemes custom-theme file before the provider-auth gate.
- Rollback removed only `ui.theme`; it preserved Qwen's unrelated
  `ui.autoModeAcknowledged` write. The resulting exact theme state was again
  `{"present":false}`. A final Qwen restart showed no stale theme-path warning.

## Validation

```text
npm run build:host-exports
node --test test/qwen-integration-guide.test.js test/host-theme-contracts.test.js test/host-export-build.test.js

15 passed, 0 failed
```

## Runtime notes

Qwen's theme loader canonicalizes the candidate file but compares it against
the non-canonical `os.homedir()` path. A temporary home rooted in `/tmp` fails
on macOS because the file resolves beneath `/private/tmp`; the runtime then
rejects it as outside home. Placing the isolated home beneath the actual user
home avoids that Qwen host behavior. This does not require a DexThemes adapter
or package change.

## Remaining terminal gate

Daeshawn must authenticate a Qwen provider and, if required, accept its terms
in a real Qwen session. Then rerun a fresh session with an explicit request to
call the configured DexThemes `search` or `fetch` tool and retain the Qwen
tool-call receipt. No profile installation, publication, push, or deployment
was performed here.
