# DeepSeek Harness integration

DexThemes maps paired light and dark palettes to DeepSeek Harness's public client-side theme service. This is an additive channel: the Codex import flow and its existing data remain unchanged.

## Supported seams

The primary user-facing seam is the separate `@dexthemes/deepseek-harness-plugin` package in this repository. Harness loads its client bundle through the supported external-bundle contract, and the package registers **Settings → Plugins → DexThemes**. Its apply controller calls:

```js
return {
  inject: ['theme'],
  apply(ctx) {
    ctx.theme.overrideTokens('dexthemes', {
      '--dsw-alias-bg-base': { light: '#FFFFFF', dark: '#111111' },
      // The generated payload includes all supported semantic token pairs.
    })
  },
}
```

The installed package retains that disposer. Applying another theme installs the next validated layer and disposes the previous one; **Revert** disposes the current layer and restores the Harness default. Package teardown also disposes its layer. Applying is user-initiated, and no DeepSeek Harness source change is required.

The installed package has its own additive **DeepSeek** collection. Version 0.4 contains twelve paired, unofficial company-color tributes selected from documented DeepSeek integrations or deployments: Huawei, Tencent, Alibaba, Ant Group, ByteDance, Baidu, SiliconFlow, JD.com, China Telecom, China Mobile, HONOR, and Lenovo. Each entry links to the public evidence that motivated inclusion. The UI explicitly disclaims partnership and endorsement, and the package includes no company logos, fonts, or other brand assets.

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

1. **Connect DexThemes** requests a short-lived device and user code from the rate-limited Convex proxy.
2. The plugin shows only the user code and the provider's HTTPS verification link. The opaque device code remains in memory.
3. The proxy polls the configured OAuth Native Application using the public client ID, the DexThemes API audience, and `themes:read`.
4. The returned access token stays only in the running plugin closure. It is never persisted in browser storage, Harness configuration, prompts, URLs, analytics, or workspace files.
5. Authenticated stats and unlocks use bearer-only wildcard CORS routes; cookie-backed website writes keep their existing origin allowlist.
6. A successful connected theme apply calls `/plugin/deepseek-harness/use`. The verified bearer identity receives the idempotent **Harnessed** achievement and **Deep Current** reward, which enters only that connected session's catalog.

The generic Harness MCP connection remains anonymous. Device authorization requires a configured OAuth Native Application with Device Code enabled, token endpoint authentication set to `None`, the DexThemes API audience, and no refresh/offline scope. This follows the provider's [Device Authorization Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/device-authorization-flow/call-your-api-using-the-device-authorization-flow) contract without requiring a Harness source change.

## Installation and one-click boundary

The public package is `@dexthemes/deepseek-harness-plugin`. Install the verified release from the DeepSeek Harness checkout:

```sh
pnpm dsh plugin --profile web add @dexthemes/deepseek-harness-plugin@0.4.1
pnpm dsh web
```

For local package development, use the source directory instead:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/dexthemes/packages/deepseek-harness-plugin
pnpm dsh web
```

Refresh the Harness browser tab after adding the package, then open **Settings → Plugins → DexThemes**. Version `0.4.1` was installed from the public npm registry into a clean Harness profile dependency, with the lockfile resolving the registry's published SHA-512 integrity. The registry-installed package loaded the live public/community catalog, applied Alibaba through Harness's theme service, followed Harness's light and dark appearance modes, and reverted to the native Harness default. Earlier local-package QA also exercised search, paired preview, and replacement by a second theme.

This proves public npm publication, registry installation, and one-click inside the installed plugin. It does not prove a separate Harness marketplace approval or the standalone DexThemes website contacting an unrelated Harness process.

The inspected Harness contract exposes `cordis_define` and `cordis_run` as in-process model tools. The Host runner says that `define` has no wire face and that only a model tool call can define a dynamic Package; `run` also has no wire face. No supported custom URL scheme or cross-origin browser bridge was found. Therefore the standalone website's **Apply to DeepSeek** action remains disabled unless a future supported bridge supplies the guarded service. The real one-click path is the installed Harness plugin.

DexThemes does not use clipboard/import, DOM injection, hard-coded Harness selectors, localhost probing, local configuration edits, or invented DeepSeek APIs for this path.

## Compatibility matrix

| Capability or contract | Reused unchanged | Additive DeepSeek surface | Current boundary |
| --- | --- | --- | --- |
| Search and discovery | `/api/themes`, category/community endpoints, MCP `search` and `fetch`, static catalog | Each public theme may expose `integrations.deepseek` | Existing catalog behavior is unchanged |
| Theme details and preview | Website details, dark/light mockups, MCP preview | Paired preview and apply state inside the installed plugin | Loaded locally in the running Harness UI |
| Stored theme model | Existing `dark`, `light`, `accents`, author/community data | None | No `platform` column or migration is needed; DeepSeek capability is derived |
| Draft and validation | MCP `draft_theme`, `validate_theme`, `render_theme_preview` | Restricted Harness MCP profile plus paired `color_me_lucky` and `prepare_deepseek_apply` | Single-variant themes remain valid DexThemes themes but are DeepSeek-ineligible |
| Codex apply | `prepare_theme_apply`, `codex-theme-v1`, copy/open Settings | None | Preserved as-is and remains separate |
| DeepSeek apply | Theme palettes | Installed package, `/api/deepseek-theme`, semantic-token adapter, guarded `overrideTokens` click | Immediate inside the running installed plugin; website-to-local is unsupported |
| Revert | None | Retained installed-plugin disposer; `cordis_stop` for a dynamic Package | Apply replacement and user-initiated revert are locally proven |
| Public/community themes | Existing publication, moderation, aliases, catalog | Paired public themes receive derived eligibility | No platform-specific duplicate theme rows |
| Account features | Existing OAuth bearer identity, stats, unlocks, and protected rewards | Optional in-memory device connection plus `/plugin/deepseek-harness/use` and `Harnessed` → `Deep Current` | Source/build/test proven; live award requires OAuth Native Application configuration and deployment; anonymous use never grants it |
| Adoption/copy counts | Existing Codex-oriented copy endpoint and leaderboards | None | A DeepSeek apply is not counted as a Codex copy |
| Analytics storage | Existing Statsig project and public client-key config | Package-owned Statsig client with allowlisted metadata and lifecycle disposal | Source/build/test proven; hosted delivery is not proven until deployment and a loaded runtime receipt |

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
| `deepseek_theme_reverted` | The retained disposer removes the layer | source surface, theme ID, variant, versions |

Every event receives fixed `platform: deepseek_harness` and `mechanism: cordis_theme_override`. The remaining values are short allowlisted identifiers only. Do not send prompts, theme-generation prose, workspace contents or paths, file names, credentials, tokens, user-entered error messages, account identity, or other sensitive/free-form data. Raw exceptions are converted to a bounded failure code.

The website source emits apply start/success/failure and revert only when a real guarded service has connected. The installed package now sends preview, apply start/success/failure, and revert through a package-owned Statsig client. It uses a fixed non-account user key, disables SDK storage and page-URL attachment, sanitizes every field, and shuts down with the plugin lifecycle. Installation events belong to a future registry/marketplace installer and are not fabricated on module load. The plugin version is allowlisted; an authoritative Harness version is omitted until Harness provides it to the client package.

## Installed plugin information architecture

The implemented initial home is **Settings → Plugins → DexThemes**:

1. **Discover** — bundled DeepSeek and DexThemes catalog, current public/community merge, local search, and DeepSeek/DexThemes/Community source filters.
2. **Theme detail** — paired dark/light preview, eligibility, **Apply to DeepSeek**, and **Revert**.
3. **Active theme** — the current DexThemes layer and one-click return to Harness default.
4. **Create with chat** — a compact prompt guide for `draft_theme` and `color_me_lucky`; tool calls return both palettes for validation and apply preparation. Harness's shipped **Creator mode** adds the guarded `cordis_define`, `cordis_run`, and `cordis_stop` tools required for chat-driven apply and revert; Standard mode intentionally omits them.
5. **DexThemes account** — optional secure device connection for creator stats, achievements, unlocked reward palettes, and the connected-apply milestone.

Agentic discovery, drafting, validation, preview, and apply preparation use the restricted public MCP profile. A tool call transmits only its explicit arguments; it does not automatically send the prompt history or workspace. Publishing and likes stay on the existing DexThemes confirmation surfaces. The installed settings UI can read creator stats and verified unlocks after device authorization. It rejects account-only reward palettes from anonymous bundled and remote catalog input, accepts them only from the bearer unlock response, and never copies credentials into Harness configuration or analytics.

An upstream **Appearance** integration can be considered later if Harness exposes a stable registration/navigation surface for third-party themes. This implementation does not assume or patch such a surface.

## Backward compatibility and follow-on gaps

- Existing Codex imports, analytics names, `themeCopyEvents`, stored theme records, and `codeThemeId` values are unchanged.
- `use_deepseek_harness` is an additive unlock action. Its paired reward needs no data migration or backfill, but adding it intentionally increases visible achievement progress denominators.
- The twelve company-color tributes currently ship only with the separate Harness package. Adding multi-harness website navigation and exposing these themes through the web catalog is a separate additive follow-up; no browser-origin detection or unsupported cross-tab control is claimed here.
- `Harness default` is not a static DexThemes palette. Revert removes the owned override and returns control to Harness's native light/dark/system theme runtime.
- New integration metadata is optional and additive for catalog consumers. Consumers that ignore unknown fields continue to work.
- Single-variant themes and invalid color pairs fail closed for DeepSeek without changing their Codex eligibility.
- Website-to-local one-click is not supported by the inspected Harness contract. One click is real only inside an installed/connected Harness integration.
- Registry publication or marketplace approval, remote installation, hosted `/api/deepseek-mcp`, installed Statsig receipts, live device authorization/achievement award, authoritative Harness version reporting, and optional Appearance placement remain unproven until release and provider configuration. The supported local-path theme UI behavior and device-flow source contract are proven only for this development checkout.
- DeepSeek applies should gain a dedicated server-side adoption model only after product semantics, identity, anti-abuse, and leaderboard policy are defined; they must not silently reuse Codex copy metrics.
