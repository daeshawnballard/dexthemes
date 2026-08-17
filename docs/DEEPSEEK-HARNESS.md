# DeepSeek Harness integration

DexThemes maps paired light and dark palettes to DeepSeek Harness's public client-side theme service. This is an additive channel: the Codex import flow and its existing data remain unchanged.

## Supported seams

The primary user-facing seam is the separate `@dexthemes/deepseek-harness-plugin` package in this repository. Harness loads its client bundle through the supported external-bundle contract, and the package registers **Settings → Plugins → DexThemes**. Its apply controller calls:

```js
return {
  inject: ['slots'],
  apply(ctx) {
    ctx.inject(['theme'], (themeCtx) => {
      const dispose = themeCtx.theme.overrideTokens('dexthemes', {
        '--dsw-alias-bg-base': { light: '#FFFFFF', dark: '#111111' },
        // The generated payload includes all supported semantic token pairs.
      })
      themeCtx.effect(() => dispose)
    })
  },
}
```

The theme service is feature-detected rather than hard-required. The Settings tab remains visible if the service is absent or malformed, exposes a visible alert, disables Apply, and lets the user forget a saved selection. When available, the package retains the disposer. Applying another theme installs the next validated layer and disposes the previous one; **Revert** disposes the current layer and restores the Harness default. Package teardown also disposes its layer. Applying is user-initiated, and no DeepSeek Harness source change is required.

The installed package has its own additive **DeepSeek** collection. Version 0.6 contains a paired palette matched to Harness's published semantic defaults plus twelve unofficial company-color tributes selected from documented DeepSeek integrations or deployments: Huawei, Tencent, Alibaba, Ant Group, ByteDance, Baidu, SiliconFlow, JD Cloud, China Telecom, China Mobile, HONOR, and Lenovo. Each tribute links to the public evidence that motivated inclusion. The UI explicitly disclaims partnership and endorsement, and the package includes no company logos, fonts, or other brand assets.

This collection is package-owned delivery metadata, not a duplicate theme database or a backend schema migration. Shared compatible DexThemes and community palettes continue to use the existing catalog. Codex-origin themes remain in the Codex channel and are filtered out of the DeepSeek plugin.

Harness also exposes `cordis_define`, `cordis_run`, and `cordis_stop` to its model runtime. DexThemes retains that dynamic-package payload as the agentic apply-preparation seam. It is separate from the installed catalog UI and does not turn the standalone website into a remote controller.

## Public payload

For a catalog theme with both variants:

```http
GET /api/deepseek-theme?theme=codex
```

The response contains:

- the validated light/dark Harness token pairs;
- an exact `cordis_define` input under `cordisDefine`;
- the supported `cordis_run` activation mode;
- the `cordis_stop` reversal path;
- an explicit `fonts.supported: false` declaration.

The palette adapter maps base, overlay, sidebar, accent, text, and state colors directly where the semantic role matches. It derives absent sidebar/overlay colors, raised surfaces, secondary text, and borders through deterministic RGB mixing, then adjusts text, strong borders, accent, and state colors to the relevant WCAG contrast floor against the base surface. Fonts are intentionally omitted because the inspected Harness theme contract exposes color tokens, not font controls.

Agents can request the same validated object with the public read-only MCP tool `prepare_deepseek_apply`. The installed package connects Harness's supported `@deepseek-ai/dsh-mcp-client` to a distinct `/api/deepseek-mcp` profile. It exposes only eight anonymous, read-only tools: `search`, `fetch`, `draft_theme`, `color_me_lucky`, `validate_theme`, `render_theme_preview`, `prepare_deepseek_apply`, and `get_leaderboard`. Full structured results are repeated as bounded JSON text because Harness preserves MCP text—not MCP App resources—in model context.

The full `/api/mcp` endpoint is deliberately not connected. Harness's generic bridge does not enforce MCP OAuth or app-only visibility metadata, so account, submission, Codex-apply, and feedback tools fail closed at the server-side profile rather than appearing unusably or unsafely in Harness.

## Optional DexThemes account connection

Harness does not need to share its identity with DexThemes. The installed settings package owns an optional OAuth Device Authorization flow for account features:

1. **Connect DexThemes** requests a short-lived device and user code from GitHub through the rate-limited Convex proxy.
2. The plugin shows the bounded user code, a **Copy code** action, and GitHub's exact `https://github.com/login/device` verification link. Copy uses the browser Clipboard API only after the user's click; paste transfers the complete code without storing it in a URL. The opaque device code remains in memory.
3. Convex polls GitHub using the shared **DexThemes Connect** OAuth application for installed integrations and requests no OAuth scope. The GitHub access token is used only inside that server request to fetch `/user`, then revoked through the server-held app secret; it is neither stored nor returned to Harness.
4. Convex links the verified GitHub identity to the existing DexThemes user, records explicit `DexThemes Connect` / `DeepSeek Harness` connection evidence with the bounded plugin version when available, grants the idempotent **Harnessed** / **Deep Current** reward from that server-verified condition, and returns a one-hour `dxd_…` session with separate `themes:read` and `harness:use` scopes. Only the session's SHA-256 hash is stored; the credential stays in the running plugin closure and is never persisted in browser storage, Harness configuration, prompts, URLs, analytics, or workspace files.
5. Authenticated stats and unlocks use bearer-only wildcard CORS routes; cookie-backed website writes keep their existing origin allowlist.
6. After Harness accepts a connected card or preview Apply, one explicit client coordinator calls the separately scoped `/plugin/deepseek-harness/use` route with a random UUID receipt. The account panel shows recording, acknowledgement, or a bounded failure. A retry reuses that exact in-memory receipt. Convex dedupes it and records the last-used time and count as explicitly client-reported activity; this claim cannot grant a protected reward. No theme, palette, prompt, workspace, or token enters that record. Disconnect marks the integration inactive only after Convex acknowledges session revocation; failures remain connected and retryable, and expiry is the final credential fallback.

Only a versioned desired theme ID, account-only flag, and reconnect-needed boolean persist through Harness's snapshot-store engine. On restart, bundled/public themes restore when the catalog and optional theme service are ready. Account-only themes wait until the user explicitly completes Device Flow again. The `dxd_…` credential remains memory-only and is never silently restored from browser storage.

The generic Harness MCP connection remains anonymous. Device authorization requires **Enable Device Flow** on the DexThemes-owned **DexThemes Connect** GitHub OAuth application plus `DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_ID` and `DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_SECRET` in Convex. DexThemes Connect is the shared entry point for installed integrations; it is not a DeepSeek-specific account or data silo. This follows GitHub's documented [OAuth App Device Flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow) without requiring a Harness source change. The website's GitHub browser flow and the Auth0/JWT contract used for standards-compliant Codex/ChatGPT MCP OAuth remain separate and unchanged.

After signing into the website with the same GitHub identity, **Connected Apps** shows only explicit active evidence: DexThemes Connect, DeepSeek Harness, plugin version when reported, last observed connection/use, client-reported theme activity, and **Disconnect**. It does not reconstruct past installations from achievements or analytics. Website disconnect revokes only DeepSeek client sessions and leaves website GitHub OAuth, MCP OAuth/Auth0, Codex behavior, and API keys unchanged.

## Installation and one-click boundary

The public package is `@dexthemes/deepseek-harness-plugin`. Install the verified release from the DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add @dexthemes/deepseek-harness-plugin@0.6.4
pnpm dsh web
```

Version `0.6.4` is published and includes both the user-initiated complete Device Flow code copy action and the `0.6.3` Connected Apps receipt fix. Its exact registry artifact has loaded-runtime proof for installation, Apply/Revert, restart restoration, offline fallback, Device Flow, connected activity acknowledgement, Statsig delivery, and Creator-mode chat Apply/Stop. Upgrade a published version with `plugin ... add @dexthemes/deepseek-harness-plugin@<published-version>`, inspect it with `plugin ... why`, and remove it with `plugin ... remove @dexthemes/deepseek-harness-plugin`. Revert/forget the saved theme and Disconnect before removal. See the [0.6.4 release receipt](DEEPSEEK-HARNESS-064-RUNTIME-RECEIPT.md).

For local development against a source checkout, use the source directory instead:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/dexthemes/packages/deepseek-harness-plugin
pnpm dsh web
```

Refresh the Harness browser tab after adding the package, then open **Settings → Plugins → DexThemes**. Version `0.6.4` was installed from the public npm registry into a fresh isolated Harness profile with the lockfile resolving the registry's published SHA-512 integrity and no local/workspace source. The bundle served by real Harness `0.1.0-rc.5` matched the installed package and exposed its `0.6.4` marker. The loaded plugin exposed 111 bundled and connected public/community themes, rendered paired previews, applied through Harness's guarded theme service, restored the saved intent after a full process restart when the DexThemes surface remounted, reverted to the native Harness default, and retained 100 bundled themes during a controlled catalog failure. See the [0.6.4 release receipt](DEEPSEEK-HARNESS-064-RUNTIME-RECEIPT.md).

A separate loaded Creator-mode thread completed `color_me_lucky` → validation → paired preview → `prepare_deepseek_apply` → user-approved `cordis_run` → runtime confirmation → `cordis_stop` → stopped/default confirmation without editing files. This proves public npm publication, registry installation, one-click inside the installed plugin, and the reversible supported agentic path. It does not prove a separate Harness marketplace approval or the standalone DexThemes website contacting an unrelated Harness process.

Production auth was repeated with the public npm `0.6.4` bundle on 2026-08-17. Fresh Device Flow connected; the account panel showed six published themes and eight achievements; the complete validated code copied only after the user selected **Copy code**; and a connected Apply advanced through recording to visible acknowledgement. Production `/plugin/deepseek-harness/use` returned HTTP 200 with `recorded: true` and `evidence: client_reported`, closing the failed `0.6.2` boundary. **Deep Current** was already present, so this does not claim that the reconnect newly awarded an existing achievement. See the [0.6.4 release receipt](DEEPSEEK-HARNESS-064-RUNTIME-RECEIPT.md) and the superseded [0.6.2 production-auth receipt](DEEPSEEK-HARNESS-062-PRODUCTION-AUTH-RECEIPT.md).

The inspected Harness contract exposes `cordis_define` and `cordis_run` as in-process model tools. The Host runner says that `define` has no wire face and that only a model tool call can define a dynamic Package; `run` also has no wire face. No supported custom URL scheme or cross-origin browser bridge was found. Therefore the standalone website's **Apply to DeepSeek** action remains disabled unless a future supported bridge supplies the guarded service. The real one-click path is the installed Harness plugin.

DexThemes does not use clipboard/import, DOM injection, hard-coded Harness selectors, localhost probing, local configuration edits, or invented DeepSeek APIs for this path.

The `0.6.4` contract targets DeepSeek Harness CLI `0.1.0-rc.5` at commit `47f943859bef60e4160492346772ded9b24f765a`. Required client contracts are the Module Loader, `settings.plugins.tab`, persisted `defineStore`, optional Cordis service injection, and `ThemeRuntime.overrideTokens(source, pairedTokens) → disposer`. No broader Harness semver range is claimed. Harness version is not added to analytics unless the client exposes an authoritative value.

## Compatibility matrix

| Capability or contract | Reused unchanged | Additive DeepSeek surface | Current boundary |
| --- | --- | --- | --- |
| Search and discovery | `/api/themes`, category/community endpoints, MCP `search` and `fetch`, static catalog | Each public theme may expose `integrations.deepseek` | Existing catalog behavior is unchanged |
| Theme details and preview | Website details, dark/light mockups, MCP preview | Paired preview and apply state inside the installed plugin | Loaded locally in the running Harness UI |
| Stored theme model | Existing `dark`, `light`, `accents`, author/community data | None | No `platform` column or migration is needed; DeepSeek capability is derived |
| Draft and validation | MCP `draft_theme`, `validate_theme`, `render_theme_preview` | Restricted Harness MCP profile plus paired `color_me_lucky` and `prepare_deepseek_apply` | Single-variant themes remain valid DexThemes themes but are DeepSeek-ineligible |
| Codex apply | `prepare_theme_apply`, `codex-theme-v1`, copy/open Settings | None | Preserved as-is and remains separate |
| DeepSeek apply | Theme palettes | Installed package, `/api/deepseek-theme`, semantic-token adapter, guarded `overrideTokens` click | Immediate inside the running installed plugin; website-to-local is unsupported |
| Revert and restart | None | Retained installed-plugin disposer, persisted bounded theme intent, `cordis_stop` for a dynamic Package | Registry-loaded `0.6.4` proves full process restart restoration on DexThemes-surface remount plus both settings Revert and Creator-mode Stop to Harness defaults |
| Public/community themes | Existing publication, moderation, aliases, catalog | Paired public themes receive derived eligibility | No platform-specific duplicate theme rows |
| Account features | Existing OAuth bearer identity, stats, unlocks, and protected rewards | Optional in-memory DexThemes Connect session plus explicit post-restart reconnect; verified Device Flow grants `Harnessed` → `Deep Current`, while `/plugin/deepseek-harness/use` records separately scoped client-reported activity | Registry-loaded `0.6.4` completed Device Flow and received the bounded activity acknowledgement; anonymous use remains entitlement-free |
| Adoption/copy counts | Existing Codex-oriented copy endpoint and leaderboards | None | A DeepSeek apply is not counted as a Codex copy |
| Analytics storage | Existing Statsig project and public client-key config | Package-owned Statsig client with allowlisted platform/source/version/theme/variant/action/outcome metadata and lifecycle disposal | Registry-loaded `0.6.4` received HTTP 200 initialization and HTTP 202 event-batch receipts; an earlier failed initialization remained fail-safe and later recovered |

### Additive discriminator and payload fields

The stored theme is deliberately platform-neutral. Platform support is exposed at the delivery edge:

- `integrations.deepseek.eligible`
- `integrations.deepseek.mechanism: "cordis-theme-override"`
- `integrations.deepseek.packageUrl`
- `integrations.deepseek.applyPreparationUrl`
- `integrations.deepseek.requiresInstalledCordisSurface: true`
- `integrations.deepseek.installedPluginPackage: "@dexthemes/deepseek-harness-plugin"`
- `integrations.deepseek.installedPluginSurface: "settings.plugins.dexthemes"`
- `integrations.deepseek.oneClickScope: "installed-plugin"`
- `integrations.deepseek.fontsSupported: false`

The payload uses `schemaVersion`, `target: "deepseek-harness"`, validated `tokens`, `cordisDefine`, `activation`, `reversal`, and `fonts.supported: false`. Existing `codeThemeId` fields remain Codex-specific and are neither removed nor reused for Harness.

## Analytics taxonomy and privacy

DeepSeek events use an additive namespace so existing Codex dashboards and stored events require no rewrite:

| Event | Emitted when | Allowed context |
| --- | --- | --- |
| `deepseek_plugin_install_started` | A future supported distribution surface starts installation | source surface, Harness/plugin version |
| `deepseek_plugin_install_succeeded` | That surface confirms installation | source surface, Harness/plugin version |
| `deepseek_plugin_install_failed` | That surface returns a bounded failure code | source surface, versions, failure code |
| `deepseek_theme_previewed` | A DeepSeek-specific preview is shown | source surface, theme ID, variant, versions |
| `deepseek_theme_apply_started` | User clicks the connected Apply action | source surface, theme ID, variant, versions |
| `deepseek_theme_apply_succeeded` | `overrideTokens` returns its disposer | source surface, theme ID, variant, versions |
| `deepseek_theme_apply_failed` | The guarded service rejects or is unavailable | source surface, theme ID, variant, versions, bounded failure code |
| `deepseek_theme_restore_started` | A saved validated theme is ready after restart | startup source, theme ID, variant, plugin version |
| `deepseek_theme_restore_succeeded` | The restored override returns its disposer | startup source, theme ID, variant, plugin version |
| `deepseek_theme_restore_failed` | The restore contract rejects the layer | startup source, theme ID, variant, plugin version, bounded failure code |
| `deepseek_theme_revert_started` | User initiates removal of the owned layer | source surface, theme ID, variant, versions |
| `deepseek_theme_revert_succeeded` | The retained disposer removes the layer | source surface, theme ID, variant, versions |
| `deepseek_theme_revert_failed` | The retained disposer rejects removal | source surface, theme ID, variant, versions, bounded failure code |
| `deepseek_theme_reverted` | The retained disposer removes the layer | source surface, theme ID, variant, versions |
| `deepseek_theme_capability_available` | Optional theme-service detection succeeds | capability source, plugin version |
| `deepseek_theme_capability_unavailable` | The service is absent, malformed, or collapses | capability source, plugin version, bounded failure code |

Every event receives fixed `platform: deepseek_harness`, `platform_id: deepseek`, `mechanism: cordis_theme_override`, plugin version, paired variant, and event-derived `action`/`outcome`. Source surface is explicit; theme ID is included when applicable. The remaining values are short allowlisted identifiers only. Do not send prompts, theme-generation prose, workspace contents or paths, file names, credentials, tokens, user-entered error messages, account identity, or other sensitive/free-form data. Raw exceptions are converted to a bounded failure code.

The website source emits apply start/success/failure and revert only when a real guarded service has connected. The installed package sends preview, apply start/success/failure, and revert attempt/success/failure through a package-owned Statsig client. The original `deepseek_theme_reverted` success event remains additive for dashboard compatibility. It uses a fixed non-account user key, disables SDK storage and page-URL attachment, sanitizes every field, and shuts down with the plugin lifecycle. Installation events belong to a future registry/marketplace installer and are not fabricated on module load. The plugin version is allowlisted; an authoritative Harness version is omitted until Harness provides it to the client package.

The registry-installed `0.6.4` package received HTTP 200 Statsig initialization and HTTP 202 event-batch receipts during loaded Apply/Revert testing. A connected Apply also received HTTP 200 from `/plugin/deepseek-harness/use` and surfaced the acknowledgement in the account panel. These close the delivery gaps recorded for `0.6.2`; the bounded privacy contract remains unchanged. No prompt, workspace, URL, account, credential, or palette data is permitted in either path.

## Installed plugin information architecture

The implemented initial home is **Settings → Plugins → DexThemes**:

1. **Discover** — bundled DeepSeek and DexThemes catalog, current public/community merge, local search, and DeepSeek/DexThemes/Community source filters.
2. **Theme detail** — paired dark/light preview, eligibility, **Apply to DeepSeek**, and **Revert**.
3. **Active theme** — the current DexThemes layer and one-click return to Harness default.
4. **Create with chat** — a compact prompt guide for `draft_theme` and `color_me_lucky`; tool calls return both palettes for validation and apply preparation. Harness's shipped **Creator mode** adds the guarded `cordis_define`, `cordis_run`, and `cordis_stop` tools required for chat-driven apply and revert; Standard mode intentionally omits them.
5. **DexThemes account** — optional secure device connection for creator stats, achievements, unlocked reward palettes, and visibly acknowledged client-reported Connected Apps activity.

Agentic discovery, drafting, validation, preview, and apply preparation use the restricted public MCP profile. A tool call transmits only its explicit arguments; it does not automatically send the prompt history or workspace. Publishing and likes stay on the existing DexThemes confirmation surfaces. The installed settings UI can read creator stats and verified unlocks after device authorization. It rejects account-only reward palettes from anonymous bundled and remote catalog input, accepts them only from the bearer unlock response, and never copies credentials into Harness configuration or analytics.

An upstream **Appearance** integration can be considered later if Harness exposes a stable registration/navigation surface for third-party themes. This implementation does not assume or patch such a surface.

## Backward compatibility and follow-on gaps

- Existing Codex imports, analytics names, `themeCopyEvents`, stored theme records, and `codeThemeId` values are unchanged.
- `use_deepseek_harness` is an additive unlock action. Its paired reward needs no data migration or backfill, but adding it intentionally increases visible achievement progress denominators.
- The default palette and twelve company-color tributes share one checked-in source consumed by both the website and the separate Harness package. No browser-origin detection or unsupported cross-tab control is claimed.
- `Harness default` is not a static DexThemes palette. Revert removes the owned override and returns control to Harness's native light/dark/system theme runtime.
- New integration metadata is optional and additive for catalog consumers. Consumers that ignore unknown fields continue to work.
- Single-variant themes and invalid color pairs fail closed for DeepSeek without changing their Codex eligibility.
- Website-to-local one-click is not supported by the inspected Harness contract. One click is real only inside an installed/connected Harness integration.
- A separate Harness marketplace listing or approval, authoritative Harness version reporting, and optional Appearance placement remain unproven. They are not required for the published Settings plugin path. Public npm installation, hosted `/api/deepseek-mcp`, earlier installed Statsig receipts, and production DexThemes Connect authorization/account loading are proven. A newly awarded `Harnessed` / `Deep Current` result and an acknowledged connected-Apply activity receipt remain unproven.
- DeepSeek applies should gain a dedicated server-side adoption model only after product semantics, identity, anti-abuse, and leaderboard policy are defined; they must not silently reuse Codex copy metrics.
