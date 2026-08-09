---
title: Customize the Codex Status Line
description: Configure the Codex CLI status line with /statusline, safe one-off tests, documented config, validation, and rollback steps.
slug: customize-codex-status-line
kind: guide
section: Guides
answer: Customize the Codex CLI status line with `/statusline`: select and reorder built-in footer fields, confirm the choice, then check the footer immediately and after a relaunch. The ordered selection persists as `tui.status_line` in Codex configuration and changes the CLI only—not DexThemes, the desktop app, or an IDE.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-08-08
dateModified: 2026-08-09
testedWith: Official OpenAI Codex configuration reference, developer commands, advanced configuration guide, and published CLI status-line source reviewed 2026-08-09.
related: /guides/codex-app-themes-vs-cli-themes, /guides/install-custom-tmtheme-codex-cli, /guides/change-codex-font-size
---

A **Codex status line** is the configurable row at the bottom of the interactive Codex CLI. It keeps selected facts—such as model, Git branch, directory, context, usage, tokens, or version—visible while you work. It changes only the CLI footer's built-in fields and order; it does not change the desktop app, an IDE extension, or a DexThemes import.

## What the Codex CLI status line is—and is not

Do not confuse the passive footer with `/status`:

- **`/statusline`** opens the picker for the footer row. You can select fields and arrange their order.
- **`/status`** prints a fuller session summary, including active configuration and token usage.
- **`/debug-config`** helps explain why the effective setting differs from the file you edited.

OpenAI’s [developer commands reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli) documents `/statusline` as an interactive way to select and reorder footer items. Its current options cover model information, context statistics, rate limits, Git branch, token counters, session information, current directory or project root, and the Codex version. Some fields depend on live information: a Git branch is only meaningful in a Git workspace, and a context or usage value may be unavailable for a particular session.

The current published implementation also includes a **Use theme colors** picker option. That option styles the status line from the active CLI `/theme`; it is not another `tui.status_line` field and does not connect the footer to a DexThemes desktop import. Source on the default branch can be newer than an installed CLI, so rely on the picker your installed version actually shows.

The documented contract is an ordered `tui.status_line` list of built-in identifiers. It is not a generic shell-script hook or arbitrary text template. Prefer the installed picker and current [configuration reference](https://developers.openai.com/codex/config-reference) over a third-party callback example.

## Configure a Codex custom status line with `/statusline`

Use the picker first. It is the most reliable path because it presents the fields supported by the installed CLI and writes the correct ordered configuration for you.

1. Start the interactive CLI by running `codex` with no subcommand.
2. In a chat, enter `/statusline`.
3. Toggle the fields you want to see, then reorder the selected fields in the picker.
4. Confirm the choice.
5. Read the footer at your normal terminal width, then enter `/status` to compare the summary with the information you chose to display.

OpenAI says the footer updates immediately and the picker persists the ordered field selection to `tui.status_line` in `config.toml`. Start with three or four fields. Model with reasoning, Git branch, and context remaining is a compact first layout; replace branch with current directory for a calmer, non-repository-specific row.

## Inspect the effective setting before troubleshooting

Codex configuration can come from more than one layer. The [configuration basics guide](https://developers.openai.com/codex/config-basic) says command-line flags and `--config` overrides have the highest precedence; trusted project `.codex/config.toml` files can override a profile or user-level setting. That means a correct edit in `$CODEX_HOME/config.toml` may not be the value you see in one repository.

If the status line does not look as expected:

1. Run `/status` to inspect the active session values.
2. Run `/debug-config` to see loaded configuration layers and policy sources.
3. Check whether a trusted project configuration overrides `tui.status_line`.
4. Return to `/statusline`; a missing field can mean its data is unavailable, not that the setting failed.

## Try a layout once before saving it

You can test a specific Codex CLI status line for one launch without editing a configuration file. OpenAI’s [advanced configuration guide](https://developers.openai.com/codex/config-advanced) documents `--config` for a single-run override and specifies that its value is TOML, not JSON.

```sh
codex --config 'tui.status_line=["model-with-reasoning","git-branch","context-remaining"]'
```

This example uses the current canonical identifiers for those three picker fields. The published [OpenAI Codex status-line source](https://github.com/openai/codex/blob/main/codex-rs/tui/src/bottom_pane/status_line_setup.rs) defines them as `model-with-reasoning`, `git-branch`, and `context-remaining`; it also explains that Git and context fields can be omitted when their data is unavailable.

Exit the test session and start `codex` normally to return to the prior persistent setup. If you keep the layout, use `/statusline` to save it instead of putting the test command in a shell profile.

## Use `tui.status_line` directly only when you need a managed layout

The current [configuration reference](https://developers.openai.com/codex/config-reference) defines `tui.status_line` as an array of strings or `null`: an ordered list of TUI footer item identifiers, with `null` disabling the status line. A hand-authored user or trusted project configuration can therefore express a known layout:

```toml
[tui]
status_line = [
  "model-with-reasoning",
  "git-branch",
  "context-remaining",
]
```

Use only exact identifiers supported by the installed CLI; these are built-in fields, not variables or renameable labels. Manual configuration is most useful for an intentional project profile or repeatable setup. For an everyday change, let `/statusline` write the representation. Record the old array before editing by hand.

## Validate the result and roll back cleanly

Validate the result in the interactive CLI, not only in a configuration editor:

1. Confirm the fields and order.
2. If you selected `git-branch`, check it in a repository.
3. Compare context, token, or usage values with `/status`; an absent value is not zero.
4. Check your normal terminal width, then relaunch Codex and check again.

For rollback, reopen `/statusline` and restore the recorded selection. A one-off `--config` test disappears when you relaunch normally. For a hand-edited array, restore the prior value or remove only that override so the next configuration layer can apply.

## DexThemes boundary: this is not a desktop theme feature

DexThemes does not configure the Codex status line. A DexThemes `codex-theme-v1:` value belongs to the desktop Appearance import flow. `/theme` and a `.tmTheme` control CLI syntax styling; a current build may reuse those colors in the footer, but they do not add, remove, or reorder status fields.

- Use `/statusline` for the Codex CLI footer.
- Use `/theme` or a `.tmTheme` for Codex CLI syntax highlighting.
- Use DexThemes and the desktop Appearance import flow for an app theme.
- Use terminal or IDE settings for host-specific appearance.

## Sources and limits

This guide relies on OpenAI’s current [configuration reference](https://developers.openai.com/codex/config-reference), [developer commands reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli), [configuration basics](https://developers.openai.com/codex/config-basic), [advanced configuration guide](https://developers.openai.com/codex/config-advanced), and [published CLI status-line implementation](https://github.com/openai/codex/blob/main/codex-rs/tui/src/bottom_pane/status_line_setup.rs).

Codex fields and identifiers can change with a CLI release. Use `/statusline` as the first source of truth for the version you have installed, and do not infer desktop-app, IDE, DexThemes, or arbitrary script support from a CLI footer setting.

## Related guides

- [Compare Codex app and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Install a custom `.tmTheme` in Codex CLI](/guides/install-custom-tmtheme-codex-cli)
- [Change Codex font size](/guides/change-codex-font-size)
