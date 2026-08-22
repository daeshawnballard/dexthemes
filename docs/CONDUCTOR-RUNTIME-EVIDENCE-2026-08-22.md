# Conductor runtime evidence — 2026-08-22

## Outcome

`BLOCKED_REALITY_GATE`, score `0` under the strict 50-point MCP / 50-point
mutation rubric.

## Host and installation

- Official Apple Silicon DMG downloaded from Conductor's website endpoint.
- SHA-256:
  `75b475f32af84ae015cc1cddc62f21be7f5df753190b0976ea48d8d7d50bc345`.
- Installed app: Conductor `0.82.6`, bundle ID `com.conductor.app`.
- Signature: `Developer ID Application: Charlie Holtz (27XN666UJ7)`.
- Gatekeeper result: accepted, notarized Developer ID; stapled notarization
  ticket present.
- Real local workspace: `kyiv`, created from `origin/main`; Conductor reported
  461 files copied and zero changes before the smoke request.

## MCP evidence

The original runtime check was conducted before the least-privilege correction.
It discovered a user-scoped unrestricted endpoint alongside the restricted
discovery endpoint. That configuration is evidence of the finding, not current
setup guidance.

The corrected Conductor setup uses Claude Code's `local` scope and the existing
server-enforced `https://www.dexthemes.com/api/cursor-mcp` profile. Its exact
non-account tool inventory is:

- `search`;
- `fetch`;
- `draft_theme`;
- `color_me_lucky`;
- `validate_theme`;
- `get_leaderboard`.

The profile excludes Apply, submission, publication, account statistics,
unlocks, GitHub issue preparation, and every account-bound tool. Prompt text
does not enforce that boundary; the scoped registration and profile do.

In the real Conductor `kyiv` workspace, the refreshed `/mcp-status` dialog
showed green status rows for the discovered DexThemes servers and `CONDUCTOR`.
This proves host discovery only.

The first fresh Claude Code session attempted a read-only DexThemes inventory
and search prompt. It failed before any MCP tool call with:

```text
Claude Code error: Failed to authenticate. API Error: 401 OAuth access token
has expired. Re-authenticate to continue.
```

Therefore the exact loaded DexThemes tool inventory and a real tool result are
`NOT_PROVEN`. Direct endpoint calls, CLI health, and the green status rows do
not substitute for that missing session invocation.

Codex was also checked as a fallback. Conductor's configured system launcher
pointed at a missing x86_64 payload. The signed Codex desktop binary and
Conductor's bundled Codex both then stopped on the shared custom model catalog:

```text
failed to parse model_catalog_json path
`/Users/daeshawnballard/.codex/model-catalog-openai-plus-ox.json` as JSON:
missing field `supports_parallel_tool_calls`
```

The shared catalog was not edited or bypassed.

## Mutation evidence

The live Conductor Appearance screen showed only built-in host and code-theme
choices. No custom theme import, extension, palette, CSS, or theme API was
present in the supported UI or current official documentation.

No theme mutation was attempted. Conductor's database and undocumented storage
were not modified.

## Smallest next action

With explicit authorization, refresh the existing Claude Code authentication
through Conductor, start a new session, and repeat the read-only inventory and
search prompt. A successful call can raise the score to 50. The score cannot
reach 100 until Conductor publishes a supported custom-theme mutation and
restoration seam.

After the experiment, remove only the local entry with `claude mcp remove
dexthemes --scope local`; do not remove an unrelated user- or project-scoped
server.
