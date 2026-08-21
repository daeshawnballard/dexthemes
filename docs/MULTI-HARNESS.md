# Multi-harness architecture

DexThemes keeps one canonical theme representation and treats the selected harness as delivery context, not theme identity. A platform change never renames a theme, rewrites its ID, or hides unrelated Codex, DeepSeek, DexThemes, or Community collections.

## Runtime flow

```text
canonical DexThemes theme
        |
        +--> selected platform registry entry
                  |
                  +--> implemented adapter --> validated payload
                  |                              |
                  |                              +--> copy/import (Codex)
                  |                              +--> guarded Apply/Revert (installed DeepSeek plugin)
                  |                              +--> deterministic file/package export
                  |                              +--> review-only extension source (Cursor)
                  |
                  +--> setup guidance (documented external theme contract)
                  |
                  +--> disabled Unknown/Coming soon (no stable theme contract)
```

The website stores the non-default platform in `?platform=` while keeping canonical theme paths such as `/mancity/dark`. Precedence is explicit URL, then the local `dexthemes-platform` preference, then Codex. An invalid explicit URL value fails safely to Codex rather than silently using a recipient's local preference.

## Surface boundary

Capability and delivery are separate facts. DeepSeek Harness exposes a supported guarded theme runtime, but the standalone website cannot contact an unrelated Harness process. Therefore:

- the website offers the real npm plugin setup destination;
- **Settings → Plugins → DexThemes** in the installed package owns immediate Apply and Revert;
- the package retains and invokes the `ThemeRuntime.overrideTokens()` disposer;
- the website never labels MCP payload preparation as Apply;
- fonts and unsupported effects are omitted.

Codex keeps its existing `codex-theme-v1` clipboard/import handoff and `codex://settings` action. No Codex data or event is migrated.

## Compatibility matrix

| Harness | Website action | Delivered DexThemes artifact | Host-owned next step | Effect status | Evidence boundary |
| --- | --- | --- | --- | --- | --- |
| Codex | Copy for Codex | Existing `codex-theme-v1` import string | User reviews and imports one variant in Settings → Appearance | Solid only | Existing explicit copy/import contract; no website-host bridge |
| DeepSeek Harness | Install plugin | Installed Cordis plugin with guarded Apply/Revert | User approves inside Harness | Solid paired colors | Existing loaded-host Apply/Revert proof; website remains setup-only |
| Claude Code | View export setup | Separate dark/light JSON files | User copies to `~/.claude/themes` and selects with `/theme` | Solid; fixed host token effects are not general motion | Official file contract; loaded runtime not performed |
| Google Antigravity | Coming soon | Preview-only platform collection; no exporter | None until Google publishes a stable payload/import/restore contract | Unknown and disabled | No setup path, plugin claim, runtime action, or integration article eligibility |
| Qwen Code | View export setup | Separate dark/light JSON files | User keeps the file under home and selects it by setting `ui.theme` to its path | Solid; documented `GradientColors` remains bounded | Official source/docs; loaded runtime not performed |
| OpenCode | View export setup | One paired JSON file | User places it in a supported themes folder and selects with `/theme` | Solid; no arbitrary effects | Official source/docs; loaded runtime not performed |
| Pi | View package setup | Code-free package containing JSON themes only | User reviews/loads or installs the package, then selects a theme | Solid only | Package source/build proof; loaded runtime not performed |
| Zed | View export setup | Local Theme Family JSON | User places it in Zed’s local themes folder and selects it | Opaque solid output; broader alpha/appearance fields omitted | Official `zed.dev` schema/source; loaded runtime not performed |
| Cursor | View theme docs | Review-only VS Code extension source | Authorized publisher review and marketplace availability are still required | Cursor-specific effects Unknown and disabled | Docs/source only; installed proof invalid |
| T3 Code | View export setup | Stable v1 paired JSON without nightly-only fields | User imports via Settings → Appearance → Themes → Add theme | Solid paired variants | First-party source proof; loaded runtime not performed |
| Conductor | Coming soon | None | None without a supported custom-theme contract | Unknown and disabled | Official docs show no proven custom-theme seam; no integration article eligibility |
| Grok Build | View limited color setup | Preview pack plus separate light/dark `pager.toml` snippets with exactly five keys | User reviews and manually merges one variant, then restarts | Five solid pager colors only; complete palette stays preview-only | Limited source contract; no mutator or loaded runtime proof |

Unknown, experimental, or undelivered capabilities remain disabled. Every richer treatment has a solid fallback; no adapter emits DOM injection, arbitrary CSS, external images, selectors, executable expressions, or model-generated code.

For new host-export integration articles, eligibility is limited to the eight deterministic export hosts: Claude Code, Qwen Code, OpenCode, Pi, Zed, Cursor source-only, T3 Code, and Grok Build limited snippets. Eligibility does not upgrade source/build proof to installed or loaded-runtime proof.

## DexThemes AI prompt creation

The creator sends only a bounded theme description and the normalized platform ID to the server-side OpenAI Responses API integration. DexThemes AI currently uses `gpt-5.6-luna` internally for a strict JSON-schema result containing a name, short summary, and complete light/dark canonical palettes. The route does not send workspace contents, files, source code, chat history, account secrets, credentials, or MCP payloads.

Generated output is treated as an untrusted draft. It must pass the same deterministic theme validation used by manual and community themes. HTML, JavaScript, CSS, selectors, URLs, unknown properties, and executable instructions are outside the schema. A result is previewed and remains editable; it is not saved, submitted, copied, or applied until the user takes the separate action. Manual creation remains available if the model route is unavailable.

Analytics records only coarse lifecycle events such as attempt, success, failure, revision, acceptance, validation, setup, copy, Apply, restore, Revert, and capability detection. Every bounded platform event derives its own action/outcome so callers cannot contradict the lifecycle. Raw prompts, raw model output, exception text, credentials, workspace data, files, and source code are not analytics properties.

`OPENAI_API_KEY` is server-only. Local development may place it in ignored `.env.local`; deployment configuration is a separate operator action. Production also requires `CONVEX_SITE_URL` plus the same independently generated `DEXTHEMES_LUNA_RATE_LIMIT_SECRET` in Vercel and Convex. Before any provider call, Vercel sends only a SHA-256 network key and the fixed generation action to a secret-authenticated Convex route backed by the existing `rateLimits` table. Missing, denied, or unavailable durable quota enforcement fails closed; neither prompts nor generated output are sent to Convex. The source/build tests do not prove model availability, production configuration, spend controls, or a deployed endpoint.

## Data and authentication compatibility

Existing theme rows and models are reused unchanged: IDs, names, summaries, light/dark palettes, accents, authorship, and community metadata stay canonical. Platform ID, adapter version, apply mode, creation mode, and optional prepared payload are delivery metadata, not new database columns. No schema migration or theme fork is required.

Existing catalog, detail, community, validation, preview, Codex apply-preparation, DeepSeek apply-preparation, MCP, and account endpoints remain reusable. DeepSeek's installed account connection continues to use GitHub Device Flow plus Convex. Codex/ChatGPT standards-based MCP OAuth remains separate. Anonymous MCP profiles cannot publish, overwrite account themes, or award authenticated achievements.

The existing `use_deepseek_harness` achievement is awarded only after Convex verifies the installed integration's GitHub Device Flow identity and revokes GitHub's temporary token. Client-reported Apply activity cannot grant it. A DexThemes AI or multi-harness achievement remains blocked until the server has an authenticated, non-spoofable acceptance event. Adding a visible unlock prematurely would also change existing achievement completion denominators, so no speculative unlock or migration is included.

## Analytics compatibility and privacy

New events use additive platform metadata: platform ID, theme ID when applicable, source, variant, source surface, action, attempted/succeeded/failed outcome, apply mode, adapter/plugin/Harness version when authoritative, creation mode, effect kind, validation result, and a bounded error category. Codex copy-only handoffs emit `theme_copied`; bounded copy attempt/success/failure attribution is additive, while `theme_applied` remains reserved for a host-confirmed runtime application.

The allowlisted lifecycle is: `harness_selected`, `theme_source_opened`, `theme_previewed`, `variant_previewed`, `creator_opened`, `manual_creation_started`, `prompt_generation_attempted`, `prompt_generation_succeeded`, `prompt_generation_failed`, `generated_draft_revised`, `generated_draft_accepted`, `validation_completed`, `copy_attempted`, `copy_succeeded`, `copy_failed`, `apply_attempted`, `apply_succeeded`, `apply_failed`, `revert_attempted`, `revert_succeeded`, `revert_failed`, `mcp_setup_opened`, `mcp_connection_confirmed`, `api_setup_opened`, `platform_setup_opened`, `effect_previewed`, and `effect_fallback_shown`. A source may emit only what it can observe; for example, the website cannot emit DeepSeek Apply success, and install success requires a real installer receipt.

Never collect prompts, chat contents, workspace contents, source code, credentials, tokens, files, raw MCP payloads, raw model output, or sensitive exception strings. Install success is recorded only by a real installer receipt; Harness version is omitted when the host does not expose it.

## Effects evidence boundary

`string` color fields do not imply CSS support. DeepSeek token pairs remain six-digit colors. Qwen's documented `GradientColors` array is bounded to that host field; it is not arbitrary CSS. Zed's wider alpha/window-appearance schema is intentionally reduced to opaque six-digit output here. Cursor-specific effects and every Antigravity capability remain Unknown and disabled. Grok Build emits exactly five solid pager color keys and never treats the complete preview palette as a runtime payload.

The optional `dexthemes-effect-intent-v1` layer is typed preview/preparation data, not CSS and not a promise of delivery. It permits only bounded gradient, alpha, and blur intents over known palette slots, requires solid, high-contrast, and reduced-motion fallbacks, rejects unknown keys and payloads over 2 KB, and resolves through the selected platform registry. Unsupported, unknown, and experimental capabilities deterministically return a solid fallback with an omission reason. Only a future delivered adapter may translate an allowed intent into a host payload.
