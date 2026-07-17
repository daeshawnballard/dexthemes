# Security Best Practices Report

## Executive Summary

The source-level security issues in the DexThemes backend are fixed in this pass.

The biggest improvement is that the Convex backend no longer exposes any non-HTTP public functions. Before this change, server-only queries and mutations, including webhook helpers and auth-related helpers, were published as public Convex functions and were callable outside the intended HTTP API surface. Those functions are now internal-only, and the production function spec shows `NO_PUBLIC_FUNCTIONS` beyond the explicit HTTP routes.

One operational concern remains: the production Convex deployment still responds to `npx convex run admin:updateAuthorName ...` from a developer-authenticated CLI session even though that function is not present in the production public function spec and the local source no longer depends on it. Based on the runtime evidence after this fix, that behavior appears to be a Convex deployment/runtime drift or developer-tooling artifact, not a public application vulnerability.

## Fixed

### SBP-001: Server-only Convex functions were publicly callable

- Severity: Critical
- Status: Fixed
- Location:
  - [convex/flags.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/flags.ts)
  - [convex/likes.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/likes.ts)
  - [convex/oauthStates.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/oauthStates.ts)
  - [convex/rateLimit.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/rateLimit.ts)
  - [convex/supporters.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/supporters.ts)
  - [convex/themes.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/themes.ts)
  - [convex/unlocks.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/unlocks.ts)
  - [convex/users.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/users.ts)
  - [convex/http.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http.ts)
- What was wrong:
  - Backend helpers were exported as public Convex `query` and `mutation` functions even though the product only intended them to be called through the explicit HTTP routes.
  - That left the app relying on hidden function names as a security boundary.
  - The highest-risk cases were the Buy Me a Coffee webhook helpers, because they were intended to be callable only from the signed webhook route.
- Fix:
  - Converted backend-only Convex functions from `query`/`mutation` to `internalQuery`/`internalMutation`.
  - Updated [convex/http.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http.ts) to call `internal.*` instead of `api.*`.
- Verification:
  - Production deploy succeeded.
  - `CONVEX_DEPLOYMENT=prod:acrobatic-corgi-867 npx convex function-spec --prod` now reports no non-HTTP public functions.

### SBP-002: Buy Me a Coffee webhook mutations were directly callable outside the webhook route

- Severity: High
- Status: Fixed
- Location:
  - [convex/supporters.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/supporters.ts)
  - [convex/http.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/http.ts)
- What was wrong:
  - `claimSupportFromWebhook` and `revokeSupportFromWebhook` were public mutations.
  - That meant the signed webhook route was not the only callable path into supporter grant/revocation logic.
- Fix:
  - Converted both webhook handlers to `internalMutation`.
  - Kept the signature-verified `/bmc/webhook` HTTP action as the only exposed entrypoint.
- Verification:
  - Unsigned `POST https://acrobatic-corgi-867.convex.site/bmc/webhook` returns `401`.
  - Production function spec no longer exposes the webhook helper mutations publicly.

## Operational Note

### OPS-001: Deleted `admin:*` name still resolves from developer CLI sessions

- Severity: Medium
- Status: Open operational issue
- Location: Production Convex deployment `prod:acrobatic-corgi-867`
- Evidence:
  - The production public function spec no longer exposes any non-HTTP public functions.
  - However, a developer-authenticated CLI call still resolves `admin:updateAuthorName`:
    ```bash
    CONVEX_DEPLOYMENT=prod:acrobatic-corgi-867 npx convex run admin:updateAuthorName '{"fromName":"__none__","toName":"__none__"}'
    ```
    Result:
    ```json
    {
      "fromName": "__none__",
      "toName": "__none__",
      "updated": 0
    }
    ```
- Assessment:
  - After the public-surface fix, this no longer reads like a public application vulnerability.
  - It does still indicate runtime drift or developer-tooling inconsistency in the Convex deployment.
- Recommendation:
  - Treat this as a platform/runtime cleanup task.
  - If you need the old name fully gone, recreate the production deployment or escalate to Convex support with the reproduction above.

## Verified Improvements

- No non-HTTP Convex functions remain publicly callable in the production function spec.
- Webhook-only supporter grant/revocation logic is internal-only.
- Public supporter UI still excludes agent/test accounts:
  - [convex/unlocks.ts](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/convex/unlocks.ts)
- Mobile submit modal remains focus-managed:
  - [src/mobile-submit.js](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/mobile-submit.js)
- Preview/system messages remain on the shared assistant-card foundation:
  - [src/preview-chat.js](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-chat.js)
  - [src/preview-attribution.js](/Users/daeshawnballard/.codex/worktrees/706f/dexthemes/src/preview-attribution.js)

## Residual Risk

There is no known source-level critical vulnerability remaining from this pass.

The main residual risk is operational: the Convex deployment still has a developer-CLI-visible `admin:*` name that does not appear in the public production function spec. That should be cleaned up, but it is no longer evidence of a live public app exploit path.
