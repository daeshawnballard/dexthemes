# DexThemes MCP connector for Devin (experimental)

This package uses Devin CLI's documented project MCP configuration to expose the restricted DexThemes read/draft profile. It is a connector template, not proof of installation, marketplace availability, or Devin appearance control.

## Package shape

```text
dexthemes-devin/
├── .devin/
│   ├── config.json
│   ├── mcp_config.json
│   └── skills/dexthemes-connector/SKILL.md
├── connector.json
├── package.json
├── scripts/verify-remote.mjs
└── test/contract.test.mjs
```

Devin documents project MCP servers in `.devin/mcp_config.json`, project permissions in `.devin/config.json`, and project skills in `.devin/skills/<name>/SKILL.md`. Run Devin from this package directory to let nested project configuration take precedence. No user-level configuration is needed.

Official references:

- <https://docs.devin.ai/cli/extensibility/mcp/overview>
- <https://docs.devin.ai/cli/extensibility/mcp/configuration>
- <https://docs.devin.ai/cli/reference/configuration/global-vs-local>
- <https://docs.devin.ai/cli/reference/permissions>
- <https://docs.devin.ai/cli/extensibility/skills/creating-skills>

## Restricted profile

The remote endpoint is server-enforced and anonymous:

```text
https://www.dexthemes.com/api/cursor-mcp
```

Its exact allowed inventory is `search`, `fetch`, `draft_theme`, `color_me_lucky`, `validate_theme`, and `get_leaderboard`. Known apply, preview, account, feedback, and publication tools are also denied in the Devin project permission file as defense in depth. A future unknown tool is not pre-approved.

The endpoint path predates this package. Reusing that server-enforced six-tool profile does not make this a Cursor package and does not add Devin to any shared DexThemes website catalog.

## Evidence and score

Adapter completeness is scored as two equal parts:

- MCP discovery/invocation: 50 points, implemented in package source.
- Host mutation plus restore: 50 points, unavailable because no supported Devin appearance mutation surface is proven.

The ceiling is therefore **50/100**. The package must never be described as changing Devin's own appearance.

Source tests validate the package, permission allowlist, explicit denylist, rubric ceiling, and non-advertising boundary. The optional remote verifier confirms the current production MCP inventory and invokes one `search` call, but that is service proof—not loaded Devin proof.

```bash
npm test
npm run verify:remote
```

## Loaded-runtime gate

Loaded proof requires an already available Devin CLI and a fresh session started from this directory. Confirm that Devin discovers exactly the six `mcp__dexthemes__*` tools, then ask it to make one explicit read-only search call. Do not install Devin, enroll in a beta, modify user configuration, authenticate an account, accept terms, or provide credentials merely to close this gate.

Devin's separate plugin system is currently documented as closed beta. This package intentionally uses the generally documented project MCP configuration instead.
