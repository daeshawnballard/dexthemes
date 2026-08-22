# DexThemes for Qwen Code

Qwen Code uses its native MCP registry and a user-controlled theme path. This
integration ships neither a Qwen extension nor a profile mutator.

## MCP registration

Register the remote DexThemes endpoint with Qwen's supported CLI. Keep the
allow-list to anonymous, non-publication tools:

```sh
qwen mcp add dexthemes https://www.dexthemes.com/api/mcp \
  --scope user --transport http --timeout 30000 \
  --include-tools search \
  --include-tools fetch \
  --include-tools color_me_lucky \
  --include-tools validate_theme \
  --include-tools prepare_theme_apply
```

Verify the fresh Qwen process can connect with `qwen mcp list`. Then start a
new Qwen session and make an explicit read-only request, such as asking it to
use `color_me_lucky`. A connected registry entry alone does not prove a model
session invoked a tool; Qwen must have a configured model auth type before
that runtime check can succeed.

On Qwen Code 0.21.15, repeat `--include-tools` once per tool. Although its
help describes a comma-separated list, one comma-separated argument is stored
as one literal name and consequently enables no tools.

## Theme path contract

Build the dark or light Qwen JSON export, review it, and place that file inside
the user's home directory. Qwen Code only loads custom theme files from there.

### Snapshot before applying

Before setting `ui.theme`, snapshot both its **presence** and its exact JSON
string value from `~/.qwen/settings.json`. Keep that small record locally and
out of source control. The value is not interchangeable with another valid
theme setting:

| Previous state | Snapshot | Exact rollback |
| --- | --- | --- |
| `ui.theme` absent | `absent` | Remove only the `theme` key from `ui`; do not remove unrelated `ui` settings. |
| Auto | the exact string `"auto"` | Restore `"theme": "auto"`. |
| Named built-in/custom theme | its exact string, for example `"Dracula"` | Restore that same string; do not coerce it to `"auto"`. |
| Custom theme file path | its exact absolute path | Restore that same path; do not remove or rewrite it. |

For a read-only snapshot, this command distinguishes an absent key from a
present value without printing any other settings:

```sh
jq 'if (.ui | type) == "object" and (.ui | has("theme"))
    then { present: true, value: .ui.theme }
    else { present: false }
    end' ~/.qwen/settings.json
```

After recording the result, set `ui.theme` to the reviewed DexThemes file path,
restart Qwen, and inspect the loaded terminal surface. A pinned path prevents
`/theme` from overriding it.

### Restore exactly

After the runtime check, restore the saved state from the table above, restart
Qwen again, and confirm the restored selection. Never use a generic “remove
`ui.theme`” rollback: that is correct only when the key was absent before the
DexThemes check.

The file export and the MCP registration are separate seams. Neither enables
direct theme application through MCP, and neither is proof of a loaded theme
or successful tool call until the real Qwen session demonstrates it.
