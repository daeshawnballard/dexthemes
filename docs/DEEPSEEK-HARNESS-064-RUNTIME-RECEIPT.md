# DeepSeek Harness plugin 0.6.4 release receipt

Date: 2026-08-17 EDT

Outcome: **PUBLIC_NPM_RUNTIME_PASS** for exact registry provenance, real-Harness discovery, paired preview, Apply, process-restart restoration, Revert, anonymous catalog fallback, GitHub Device Flow, connected account data, client-reported Connected Apps activity, bounded Statsig delivery, and Creator-mode chat Apply/Stop.

## Artifact and host identity

- Package: `@dexthemes/deepseek-harness-plugin@0.6.4`
- Registry tarball: `https://registry.npmjs.org/@dexthemes/deepseek-harness-plugin/-/deepseek-harness-plugin-0.6.4.tgz`
- Registry integrity: `sha512-k2ixkdySR9mIOnUsl/fT21vJV5fDGlZJXtEDhTxcQG7l5lzmYOB8y63jLp3sKYjDLVxQORABhiMJt9FqmeQRWg==`
- Registry shasum: `2adcd6d8c1a819f892fb25d06a9d82253acdba12`
- Installed client-bundle SHA-256: `bf6ae700127d675504b97b8f31e82b6560edaa949448271f8876e6944509586c`
- Installed package-manifest SHA-256: `174b6b425738229fd6316e40721c8855a81e9addf4dd419b237f08378c9f72be`
- Harness CLI: `0.1.0-rc.5`
- Harness commit: `47f943859bef60e4160492346772ded9b24f765a`
- Source merges: private `87f788d84081af99e2ab32f4f885a61c350ec5ac`; public `b921f69fd12fdb530f3a94933026cfba2cfe13a0`
- Browser: Playwright WebKit

The exact public package was installed into a fresh isolated Harness home and profile. Its dependency graph contained no `file:`, `link:`, workspace, or local-tarball resolution. The settings surface exposed `data-dexthemes-harness-plugin="0.6.4"` from the served client bundle.

## Loaded plugin behavior

1. **Discovery and preview:** **Settings -> Plugins -> DexThemes** loaded 111 themes from the bundled plus public/community catalog. The preview modal exposed side-by-side, dark-only, and light-only paired modes.
2. **Apply and Revert:** applying Alibaba changed the Harness surface, active theme, and action state; Revert restored the native Harness default.
3. **Process restart:** after a full stop and relaunch against the same isolated profile, Alibaba restored when the DexThemes settings surface remounted. The loaded marker remained `0.6.4`.
4. **Anonymous resilience:** while the public catalog request was blocked, the plugin retained 100 bundled themes including the native DeepSeek palette. Restoring the request returned the connected 111-theme catalog.
5. **Device Flow:** **Connect DexThemes** displayed a complete validated code, **Copy code** copied that exact complete code only after the user clicked, and GitHub authorization completed. The plugin then loaded six published themes and eight achievements. The code, GitHub token, and one-hour DexThemes credential did not enter the page URL, Harness configuration, prompt, workspace, or analytics.
6. **Connected Apps activity:** a connected Apply moved the account panel through recording to **Connected Apps activity recorded.** The production `POST /plugin/deepseek-harness/use` returned HTTP 200 with `{"recorded":true,"evidence":"client_reported"}`. The request remains a separately scoped, replay-deduped client activity receipt and cannot grant an entitlement.
7. **Statsig:** the package-owned client eventually completed initialization with HTTP 200 and delivered event batches with HTTP 202 receipts. One earlier initialization attempt failed closed with `ERR_CONNECTION_CLOSED`; the plugin remained usable and later delivery succeeded.

The connected account already contained the **Harnessed / Deep Current** achievement record. This gate proves that the authenticated unlock response returned it, not that this particular reconnection newly awarded an already-existing achievement.

## Loaded Creator-mode chat behavior

The configured `web` profile was upgraded from npm to exact `0.6.4` and loaded the same plugin marker. In a real DeepSeek Harness Creator-mode session, the prompt `Color me lucky` produced a paired **Lunar Orchard** theme and used the restricted DexThemes tools to generate, validate, preview, and prepare it. Harness then registered and ran the guarded Cordis package after approval.

- Dark surface: `#160E0E`; dark accent: `#E45874`
- Light surface: `#F9F6F6`; light accent: `#BD1F3E`
- Applied body surface: `rgb(22, 14, 14)`
- After **Stop**: native Harness surface `rgb(21, 21, 23)` and `0 running`

The observed tool path was `color_me_lucky` -> `render_theme_preview` -> `prepare_deepseek_apply` -> `cordis_define` -> approved `cordis_run` -> `cordis_stop`. No file or workspace edit was used to apply or revert the theme.

## Evidence boundary

This receipt does not claim:

- a DeepSeek Harness marketplace listing or native Appearance placement
- a submitted or accepted upstream Harness change
- silent website-to-local-Harness application
- automatic cross-environment theme synchronization
- that an already-present achievement was newly awarded by this reconnect
- compatibility with Harness versions other than the identified `0.1.0-rc.5` contract

GitHub authorization and Cordis activation were explicit user approvals. No npm credential, GitHub access token, DexThemes bearer token, API key, account identifier, or workspace content is included in this receipt.
