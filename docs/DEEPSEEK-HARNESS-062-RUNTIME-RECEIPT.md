# DeepSeek Harness plugin 0.6.2 loaded-runtime receipt

Date: 2026-08-14 EDT

Outcome: **PUBLIC_NPM_RUNTIME_PASS** for public-package provenance, real-Harness discovery, paired preview, Apply, process-restart recovery, Revert, anonymous catalog fallback, and controlled disconnect-failure behavior. **PRODUCTION_AUTH_UNPROVEN** because this gate did not use a real GitHub Device Flow or production account session.

## Artifact and host identity

- Package: `@dexthemes/deepseek-harness-plugin@0.6.2`, installed into a fresh isolated Harness profile from `https://registry.npmjs.org`
- Registry integrity: `sha512-bx9bGAnHdBR1l3+dWxB5g2eOG1bWbapL/SfzMQlOJPhK4p7O9+7rvHSJZEiTl/Us48MrUpU9aP4TLHqZdv869g==`
- Registry shasum: `81c419ee9f88680ddf3836ee487d94537710e588`
- Loaded client-bundle revision: `552ffb228c70`
- Loaded client-bundle SHA-256: `f2fc27e8a61aebe950f20f2a9be1f1e19c4e9c9dd666010657ce4512431fec58`
- Harness CLI: `0.1.0-rc.5`
- Harness commit: `47f943859bef60e4160492346772ded9b24f765a`
- Browser: Playwright WebKit with a fresh persistent profile

The isolated profile's dependency and lockfile resolved exact version `0.6.2` with the registry integrity above. No `file:`, `link:`, workspace, or local-tarball resolution was present. The bundle served by the running Harness matched the installed profile's `lib/client.js` byte-for-byte and contained the `0.6.2` marker.

## Loaded behavior proven

1. **Discovery and preview:** Harness exposed **Settings -> Plugins -> DexThemes**. The connected public catalog showed 111 themes, and Alibaba rendered distinct dark and light preview panes.
2. **Apply:** Harness semantic tokens changed from its native defaults to Alibaba values, including `--dsw-alias-bg-base: #FFF9F4`, `--dsw-alias-brand-primary: #D95300`, and `--dsw-alias-label-primary: #2B1A10`.
3. **Process restart:** the isolated Harness listener was fully stopped and relaunched against the same profile. The saved Alibaba intent survived and restored the same tokens when the DexThemes surface remounted and hydrated its catalog.
4. **Revert:** Revert returned the sampled tokens to Harness defaults and cleared the saved desired theme.
5. **Anonymous resilience:** with the public catalog GET replaced by a controlled 503, the plugin retained 100 bundled themes, search/browse, and the Connect action.
6. **Disconnect failure:** an isolated fake account flow plus a controlled DELETE 503 left the UI connected, retained the Disconnect action, surfaced a visible error, and preserved reconnect state. No production account endpoint was contacted for this test.

Restart restoration was not observed at the shell's first paint; it occurred when the DexThemes settings surface remounted. This is the proven lifecycle boundary for `0.6.2`.

## Not proven by this gate

- production GitHub Device Flow and production Convex session behavior
- immediate `Harnessed` / `Deep Current` appearance after a verified production Connect
- production connected-Apply reporting
- production Disconnect failure handling
- Harness marketplace approval or a native Appearance integration

The production implementation and source tests cover the server-verified reward grant and separately scoped, client-reported use receipt, but those are not promoted here into loaded production-auth proof.

## Safety boundary

Statsig configuration was blocked before navigation. The catalog-failure and account/disconnect phases were locally intercepted. No prompt, workspace content, account identifier, credential, production token, production Disconnect, source edit, push, merge, deploy, or publish occurred during this runtime gate.

The sealed local evidence receipt used to prepare this public summary has SHA-256 `7cf42e021bd56cfd17ea5f255b6d2231a4b2b6fce1c3a975ccd0bd0e9dce2bd6`.
