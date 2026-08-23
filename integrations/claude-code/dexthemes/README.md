# DexThemes for Claude Code

This is the Claude Code marketplace package for the canonical DexThemes MCP
service. It adds one remote MCP server:

```text
https://www.dexthemes.com/api/mcp
```

## Install from a checkout

From the repository root, first add the marketplace and then install the
plugin through Claude Code:

```sh
/plugin marketplace add /absolute/path/to/dexthemes
/plugin install dexthemes@dexthemes
```

Validate the package before sharing it:

```sh
claude plugin validate .
```

## Boundaries

The MCP endpoint and its OAuth behavior remain canonical and host-controlled.
This package does not embed credentials, create an account, publish a theme,
or change a Claude Code theme.

Claude Code custom themes remain separate user-reviewed JSON exports. To use a
DexThemes export, copy a reviewed file into `~/.claude/themes` and select it
with Claude Code's `/theme` flow. The marketplace package does not install or
apply those files automatically.

## Marketplace status

The package is source-ready for Claude Code's git-hosted marketplace format.
It is not listed in Anthropic's marketplace or plugin directory until an
authorized maintainer submits it and Anthropic accepts it.

Official references:

- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/plugins-reference
