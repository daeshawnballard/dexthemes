# Security Best Practices Report

## Scope and result

This report covers the Build Week DexThemes plugin changes: the MCP endpoint and app view, GitHub-linked OAuth, account-bound stats and publishing, achievements, API-key issuance, GitHub Issue preparation, and the affected website/Convex routes.

An initial sealed Codex Security scan against the Build Week working tree validated ten findings: one High, six Medium, and three Low. After those fixes, a sealed security diff scan validated nine additional findings: four Medium and five Low, with no Critical or High result. This working tree now contains targeted remediations and regression checks for both rounds. Target-aware exploit probes from the follow-up scan no longer match the vulnerable source shapes, but the post-fix tree has not been represented as a new production attestation. Closure is therefore **locally remediated, pending review/live verification**. The MCP tests, documentation checks, production build, plugin validator, dependency audit, browser smoke suite, and MCP visual QA pass. Auth0 configuration, Convex type generation, deployment, edge controls, and live endpoint behavior remain explicit release gates.

A July 16 targeted source-to-sink review of the color pipeline found one additional secondary-path gap: the author-only add-variant mutation omitted exact-hex checks for optional `sidebar` and `codeBg` values before `codeBg` reached an HTML style template. The shared server validator now covers every persisted color, browser renderers apply their own exact-hex guard for legacy data, builder state is normalized on load, and the Codex import boundary rejects malformed colors and contrast values. Adversarial HTML, CSS, JSON, newline, Unicode, length, and contrast cases are covered by regression tests.

## Sealed-scan remediation status

- **C-S09-001, stored XSS through accents (High):** exact six-digit hex validation now exists in MCP schemas, local validation, Convex submission, preview/apply preparation, and the legacy accent renderer now creates DOM nodes instead of interpolating `innerHTML`.
- **C-S05-001, OAuth login CSRF (Medium):** OAuth state is bound to an HttpOnly/Secure/SameSite=Lax browser cookie hash as well as the PKCE verifier; a mismatched browser cannot consume the state.
- **C-S06-001, JWT without expiry (Medium):** both Vercel and Convex JOSE verifiers require `exp` in addition to signature, issuer, audience, algorithm, and scope checks.
- **C-S06-003, compound identity/IP quota reset (Medium):** plugin and agent-key limits now use independent identity and network buckets.
- **C-S07-001, self-copy Summit unlock (Medium):** Summit uses one signed-in non-author adoption per user/theme/month and requires three qualified adopters before Top 10 eligibility; raw copies remain analytics.
- **C-S07-002, nonexistent-theme Heartbeat unlock (Medium):** likes resolve a visible static theme or a published community theme before insertion or achievement grant.
- **C-S10-002, protected static ID collision (Medium):** the generated static catalog is the canonical protected ID and palette boundary, including hidden unlock themes.
- **C-S02-001, unredacted GitHub feedback (Low):** deterministic token/header/secret/email/home-path redaction runs before output; the widget displays the exact best-effort redacted title/body with a review warning and constructs the GitHub URL only after a user click.
- **C-S05-002, abandoned OAuth state storage (Low):** OAuth start has network/global limits and a scheduled mutation deletes expired rows in bounded batches.
- **C-S12-001, supporter privacy disclosure (Low):** supporter-wall listing is explicit opt-in, Patron access is independent of listing, retained claim fields and purposes are disclosed, and support handles privacy requests.

## Follow-up diff-scan remediation status

- **Theme submission and flagging pre-auth state growth (Medium):** low-cardinality network buckets now run before bearer-derived work, verified user identity is resolved before user quotas, expired limiter rows have an indexed bounded cleanup, and raw/token-derived limiter keys were removed from these routes.
- **API-demo pre-auth catalog work (Medium):** the network gate runs first, authoritative user resolution runs second, and the user quota is enforced before published-theme queries or achievement work.
- **Missing-rank Summit grant (Medium) and mutable open-month Summit award (Low):** the live `findIndex()` award path is removed. Summit is granted only by an idempotent finalizer over the previous closed UTC month, after the qualified-adoption threshold is applied.
- **OAuth shared-budget starvation (Low):** the per-network budget is charged and enforced before the global OAuth-start budget.
- **Misplaced like quotas (Low):** like network and verified-user limits are enforced on the like route before mutation and no longer consume submission quota rows.
- **Anonymous MCP result amplification (Low):** theme IDs, names, summaries, categories, code-theme IDs, font names, and palette arrays have explicit schema and semantic length bounds; oversized MCP calls are regression-tested.
- **GitHub feedback redaction gaps (Low):** the best-effort redactor now covers private keys, credential URLs, bearer/session/cookie headers, major token families, cloud access IDs, secret assignments, email addresses, and private paths. The tool and widget explicitly warn that redaction can miss context and require character-by-character review before GitHub opens.

## Security properties implemented

### Identity and authorization

- MCP bearer tokens are verified with RS256, issuer, audience, expiry, and requested scope checks.
- Only a signed `github|...` subject is accepted by account-bound Convex plugin routes.
- Account identity is derived from that verified subject. MCP tool arguments do not accept `userId`, `ownerId`, author identity, access tokens, API keys, or email addresses.
- GitHub remains the upstream login for both the website and plugin, so the same verified GitHub numeric identity maps to one DexThemes account.
- Direct website GitHub OAuth uses single-use, time-limited, browser-bound state and PKCE S256.

### Secrets and sessions

- Newly issued `dxt_` API keys are shown once and stored only as SHA-256 digests plus a short non-secret prefix.
- Anonymous agent-key creation is removed; an active GitHub-authenticated account is required.
- Internal `dxp_` plugin sessions are random, hashed at rest, account-bound, and expire after two minutes.
- OAuth access tokens stay in protocol authorization metadata and are not copied into tool arguments, theme records, logs, or app-view state by DexThemes code.

### Writes, achievements, and account isolation

- `submit_theme` is the only public-write MCP tool. It is app-only and requires `themes:write`, server-side validation/moderation, identity-derived authorship, and a short-lived HMAC token bound to the exact reviewed payload and OAuth token. The token is delivered only in model-hidden app metadata and used after the user presses Publish.
- The tool creates a new public theme; it cannot edit or delete an existing theme or access another user's private account data.
- Plugin reads and writes are rate-limited independently by verified identity and network. Theme submission is additionally protected by server-side moderation, exact color validation, and canonical static/database uniqueness checks.
- Account, theme, like, API-use, leaderboard, plugin-use, plugin-creation, and employee achievements are granted from server-observed events rather than arbitrary client action names.
- The generic achievement route is limited to low-risk cosmetic actions (`share_x`, `color_me_lucky`, and `install_pwa`) and still requires an authenticated account.
- A plugin install itself is not observable by DexThemes; `Plugged In` truthfully represents first authenticated plugin use.

### Employee bonus privacy

- `Builder of AGI` requires a signed identity-provider claim with `email_verified === true` and an exact case-insensitive `openai.com` domain. Suffix matches such as `openai.com.example` are rejected.
- DexThemes persists only `isOpenAIEmployee: boolean`; it does not store or return the work email for this achievement.
- A later signed, verified non-OpenAI email revokes the achievement. Missing email claims do not silently grant it.
- The unlock theme is an original graphite/green palette with no OpenAI logo and the public terms state that DexThemes is independent and not endorsed by OpenAI.

### UI and feedback safety

- The MCP app registers listeners before connecting, uses `textContent` for tool-provided values, and declares empty CSP network/resource/frame allowlists.
- GitHub feedback receives best-effort redaction before output and is displayed with an exact title/body review plus an explicit warning that redaction can miss sensitive context. The widget constructs a prefilled Issue URL only after a click; the tool cannot post an issue, open a pull request, or transmit workspace files by itself.
- The supporter wall is explicit opt-in and does not control Patron access. Supporter-claim retention and public fields are disclosed in the UI and privacy policy.
- Public submission, privacy, terms, and support behavior are documented for review.
- Every accepted color is restricted to the fixed language `#` plus six ASCII hexadecimal characters. The same invariant is enforced at MCP schema/compute boundaries, initial and add-variant persistence, builder-state restoration, browser HTML/CSS rendering, and `codex-theme-v1` import serialization.

## Open release gates

### SEC-GATE-001: OAuth tenant and claims are not live-verified

- Severity if misconfigured: High
- Status: Release blocker for authenticated plugin tools
- Required evidence:
  - Auth0 (or equivalent OAuth 2.1 provider) uses GitHub upstream login and PKCE S256.
  - The access token audience is exactly `https://www.dexthemes.com/api/mcp`.
  - `themes:read` and `themes:write` are issued separately and enforced.
  - The JWKS, issuer, and audience values match in Vercel and Convex.
  - `DEXTHEMES_CONFIRMATION_SECRET` is a unique 32+ character production secret in Vercel and is not reused for another purpose.
  - If the employee bonus is enabled, signed `email` and boolean `email_verified` claims are present; otherwise the bonus remains disabled.
  - CIMD is preferred and verified, or the chosen DCR/predefined OpenAI client path is verified with the provider.

### SEC-GATE-002: Legacy credential migration remains

- Severity: Medium
- Status: Open migration task
- New API keys are hash-only, but the schema and lookup code retain a temporary compatibility path for legacy plaintext `apiKey` values.
- Before public launch, inventory legacy keys, rotate/reissue them, clear plaintext values, remove the `by_api_key` fallback/index, and verify no backup/export still contains active plaintext credentials.
- Existing long-lived website session tokens are also looked up by raw value. A follow-up should store session-token hashes and rotate active sessions.

### SEC-GATE-003: Public MCP edge abuse controls need deployment proof

- Severity: Medium
- Status: Release blocker for an advertised public endpoint
- Authenticated Convex operations have independent identity/network limits, but public local compute tools and invalid-JWT traffic also need Vercel Firewall/rate-limit rules, request-size limits, concurrency monitoring, and alerting at the deployed MCP edge.
- Convex request metadata is preferred as the authoritative client-IP signal; verify that production exposes it consistently and that fallback forwarded headers cannot weaken the deployed edge policy.
- Validate `429` behavior, retry headers, log redaction, and host rejection from the live production domain.

### SEC-GATE-004: Production backend and protocol checks are pending

- Severity: Medium
- Status: Verification blocker
- This checkout does not have `CONVEX_DEPLOYMENT`, so Convex code generation/typechecking and the production function spec were not run in this pass.
- The MCP endpoint, OAuth metadata discovery, authenticated challenge, scope denial, cross-account denial, submission confirmation, and employee claim/revocation cases must be exercised against the deployed stack.
- Confirm the unified host preserves app-only tool visibility, model-hidden result metadata, and the app-triggered write path in the deployed connector. The payload/OAuth-bound token prevents a model-only call from bypassing review, while the host may add its own write confirmation UX.
- Domain verification must return only the portal-provided plain-text token from `/.well-known/openai-apps-challenge`, and reviewer authentication must not depend on MFA, SMS, email confirmation, or a private network.
- Vercel reserves `/.well-known` from rewrites. The production build now emits literal metadata/challenge files; verify both from the live custom domain.

## Local verification recorded

- `npm test`: 81/81 passing.
- `npm run check:docs`: passing.
- `DEXTHEMES_SKIP_CLEAN=1 npm run build`: passing; the generated MCP widget module parses successfully.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `chatgpt-app-submission.json`: valid JSON with 12 tools, 5 positive tests, and 3 negative tests.
- Official plugin-creator validator: passing for `plugins/dexthemes`.
- Convex HTTP/cron entrypoints bundle successfully with generated modules treated as external; full Convex code generation/typechecking remains blocked locally because `CONVEX_DEPLOYMENT` is not configured.
- Browser smoke: desktop discovery, variant switching, creation, locked-reward handling, and signed-out account prompts pass.
- MCP visual QA: full dark/light preview, Copy/open Settings handoff, all-period leaderboard, and creator dashboard scenarios render successfully.
- Follow-up target-aware exploit probes for API-demo bearer rotation, GitHub redaction gaps, MCP string amplification, and open-month Summit grants now reject the remediated source shape; permanent regressions cover the remaining source-order findings.
- Secret-pattern scan: no private keys, GitHub tokens, OpenAI-style API keys, or live DexThemes tokens found outside ignored dependencies/build output.

## Release decision

Local source remediation/preflight: **pass with gates**.

Public authenticated launch: **no-go until SEC-GATE-001 through SEC-GATE-004 have live evidence**. Public discovery/drafting code can continue through local review, but it should not be represented to Devpost or the OpenAI plugin directory as a working deployed integration until those gates are closed.
