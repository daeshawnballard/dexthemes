---
title: Grok Build Limited Pager Overrides
description: DexThemes now exports two limited Grok Build pager.toml snippets with exactly five reviewed color overrides for manual merging.
slug: grok-build-limited-pager-overrides
kind: article
section: Articles
answer: DexThemes exports separate dark and light Grok Build `pager.toml` snippets with exactly five color overrides. Review one, save your current pager file, manually merge only those keys, then restart Grok Build.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-21
dateModified: 2026-08-21
testedWith: Deterministic five-key pager export and grammar checks reviewed 2026-08-21; no installed Grok Build runtime was exercised
related: /articles/t3-code-v1-theme-import, /articles/how-we-test-codex-themes, /reference/codex-theme-format
---

DexThemes now exports a narrowly scoped Grok Build customization: a dark and a light `pager.toml` snippet, each containing exactly five reviewed pager color overrides. This is limited support for pager colors, not a full Grok Build theme.

## Exactly five keys

Each chosen variant contains only these paths: `scrollback.scrollbar.scrollbar_bg`, `scrollback.scrollbar.scrollbar_fg`, `scrollback.blocks.edit.accent`, `scrollback.blocks.thinking.accent`, and `scrollback.blocks.execute.running_accent`. The export does not add a `[theme]` table, plugin settings, MCP configuration, executable instructions, or any other profile mutation.

That small contract is intentional. The full DexThemes preview palette is not claimed as a Grok Build runtime payload, and the five values should not be generalized into a complete host theme.

## Manual merge, with a recovery point

Choose one variant and inspect its snippet alongside your existing `~/.grok/pager.toml`. Before editing, save the exact preimage and record its SHA-256 hash. Manually merge only the five exported keys after reviewing the diff, then restart Grok Build as its documentation requires.

If you later want to reverse the change, restore the saved preimage only when the current file is otherwise unchanged. That protects unrelated edits from being overwritten. DexThemes does not ship a helper that writes the file, reads `auth.json`, or performs an automatic reversal.

## Evidence boundary

The release candidate proves deterministic generation of two five-key TOML snippets. The contract checks verify the key names, TOML output, safe paths, and the absence of unsupported profile-mutating behavior. This is source/build proof, not proof that an installed Grok Build release loaded the values after restart.

No Grok Build process, account, host profile, plugin, or MCP surface was touched for this delivery. There is no Direct Apply claim, no installed runtime claim, and no assertion that every host version recognizes the overrides. Use the snippet as a limited, reviewable pager adjustment and verify the result locally.

For the distinction between deterministic files and runtime evidence, see [How We Test Codex Themes](/articles/how-we-test-codex-themes). DexThemes is independent and not affiliated with xAI or Grok Build.
