---
title: Codex Theme v1 Format Reference
description: Field-by-field reference for the DexThemes codex-theme-v1 import string, including validation errors, examples, and limits.
slug: codex-theme-format
kind: reference
section: Reference
answer: A DexThemes Codex theme import is codex-theme-v1: followed by JSON containing a canonical codeThemeId, one normalized theme object, and exactly one dark or light variant.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-08-09
testedWith: DexThemes shared theme contract and serializer plus ChatGPT desktop 26.803.41515 build 6321 importer schema reviewed 2026-08-09; installed-app acceptance remains the final gate.
related: /guides/how-to-install-a-codex-theme, /guides/codex-theme-import-troubleshooting, /guides/codex-app-themes-vs-cli-themes
---

The **Codex theme v1 format** used by DexThemes is the literal prefix `codex-theme-v1:` followed by one JSON object. The JSON output always has `codeThemeId`, `theme`, and `variant`; it represents one dark or light import at a time.

This is a DexThemes serialization and validation contract, not a public OpenAI compatibility guarantee. The field and validation details below track the project's [public shared import contract](https://github.com/daeshawnballard/dexthemes/blob/main/shared/codex-theme-contract.js). OpenAI controls the Codex importer and its rendering, so an installed app can change what it accepts or how it displays a valid DexThemes string. DexThemes is community-built and is not affiliated with OpenAI.

To apply a generated string, copy it in full, open Codex Settings → Appearance, and choose **Import** in the matching Dark or Light section. Paste and review the string in the **Import theme** dialog, approve it, and then inspect the loaded result. OpenAI's [Appearance settings documentation](https://learn.chatgpt.com/docs/reference/settings) describes the app-level theme, color, and font controls; this page documents the separate DexThemes payload shape.

## Codex theme v1 format at a glance

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#0169cc","contrast":60,"fonts":{"code":null,"ui":null},"ink":"#fcfcfc","opaqueWindows":true,"semanticColors":{"diffAdded":"#00a240","diffRemoved":"#e02e2a","skill":"#b06dff"},"surface":"#111111"},"variant":"dark"}
```

Everything before the first `{` is the required format prefix. Everything from that brace through the last `}` is a JSON object. DexThemes currently writes compact JSON. Treat the field names and values as meaningful; do not use spacing or object-key order as an identifier.

One string carries one variant. A theme with both dark and light palettes needs two separately generated import strings and two approvals.

## Top-level fields

### `codeThemeId`

`codeThemeId` is the canonical Codex code-theme family for the chosen variant:

```json
"codeThemeId": "codex"
```

It is not a DexThemes catalog ID, display name, filename, or path. When source data omits a code-theme family, DexThemes resolves it to `codex`. A source theme can use one family for both variants or name a family per variant; the final import always contains one resolved string.

### `theme`

`theme` is the normalized appearance object. It contains the selected colors, contrast setting, fonts, opacity preference, and semantic colors for the one variant being imported.

### `variant`

`variant` is exactly one of:

```json
"variant": "dark"
```

```json
"variant": "light"
```

No other value is valid in the DexThemes contract.

## Theme object fields

### `accent`

`accent` is a six-digit hex color:

```json
"accent": "#0169cc"
```

Source data can include an optional `accents` list of up to ten choices. DexThemes validates every listed color, resolves the selected choice, and emits only that one `accent` value in the import.

### `contrast`

`contrast` is an integer from `0` through `100`, inclusive:

```json
"contrast": 60
```

It is a theme parameter, not a WCAG contrast ratio. Check the actual foreground and background colors for readable text.

### `fonts`

`fonts` always contains `code` and `ui`:

```json
"fonts": {"code": null, "ui": null}
```

Each value is either `null` or a string of no more than 100 characters:

```json
"fonts": {"code": "Example Mono", "ui": "Example Sans"}
```

The strings name fonts; they do not include font files, grant a license, or guarantee that a font is installed. If a source font value is omitted, DexThemes emits `null` for that slot.

### `ink` and `surface`

`ink` is the primary foreground color and `surface` is the primary background color:

```json
"ink": "#fcfcfc",
"surface": "#111111"
```

Both are required six-digit hex colors. A syntactically valid color pair is not necessarily accessible, so evaluate the resulting contrast separately.

### `opaqueWindows`

`opaqueWindows` is a boolean:

```json
"opaqueWindows": true
```

When a source variant omits the setting, DexThemes emits `true`. Do not substitute a quoted boolean such as `"true"` or a numeric value such as `1`.

### `semanticColors`

`semanticColors` contains three required six-digit hex colors:

```json
"semanticColors": {
  "diffAdded": "#00a240",
  "diffRemoved": "#e02e2a",
  "skill": "#b06dff"
}
```

- `diffAdded` is the addition-related color.
- `diffRemoved` is the removal-related color.
- `skill` is the skill or function-related color.

Codex decides where and how these roles render. Keep the roles distinguishable and do not rely on hue alone to communicate meaning.

## Color syntax

Every color that DexThemes validates for this import must match:

```text
#[0-9A-Fa-f]{6}
```

Examples: `#111111`, `#A1B2C3`, and `#00a240`.

Three-digit shorthand, eight-digit alpha values, CSS color names, gradients, and CSS variables do not pass the DexThemes contract.

## Accepted code-theme families

The current DexThemes contract recognizes these canonical family IDs for both dark and light variants:

- `absolutely`, `catppuccin`, `codex`, `everforest`, `github`, `gruvbox`, `linear`, `notion`, `one`, `raycast`, `rose-pine`, `solarized`, `vercel`, `vscode-plus`, and `xcode`.

Dark-only families are `ayu`, `dracula`, `lobster`, `material`, `matrix`, `monokai`, `night-owl`, `nord`, `oscurange`, `sentry`, `temple`, and `tokyo-night`. `proof` is light-only.

The serializer also recognizes a small set of legacy source aliases, then writes their canonical family:

- `github-dark-default` → `github` for dark
- `github-light-default` → `github` for light
- `gruvbox-dark-hard` → `gruvbox` for dark
- `one-dark-pro` → `one` for dark

New strings should use the emitted canonical family. Do not infer additional aliases from a bundle filename, a gallery name, or an older import string. The canonical IDs and variant availability above also matched the installed ChatGPT desktop build named in `testedWith`; that observation is not a promise that every future version will keep the same registry.

## DexThemes validation errors

DexThemes validates source data before it builds an import string. When validation fails, it returns no import string. The error messages below are representative of the exact contract messages; replace `dark` with `light` where applicable.

- `Theme variant must be dark or light.` — the requested variant is not `dark` or `light`.
- `dark variant is not available for this theme.` — the requested source variant is missing, not an object, or is an array.
- `Theme accents must be an array.` — `accents` is present but is not an array.
- `A maximum of 10 accents is allowed.` — the source accent list is too long.
- `accents[0] must be a six-digit hex color.` — an item in the source accent list has invalid color syntax.
- `dark.surface must be a six-digit hex color.` — the same check applies to `ink`, `accent`, `diffAdded`, `diffRemoved`, and `skill`.
- `dark import accent must be a six-digit hex color.` — the selected accent cannot be resolved to a valid color.
- `dark.contrast must be an integer between 0 and 100.` — contrast is not an integer in the supported range.
- `Theme fonts must be an object.` — `fonts` is present but has the wrong shape.
- `dark.fonts.code must be at most 100 characters.` — a `code` or `ui` font value is not a valid string within the limit.
- `dark.opaqueWindows must be a boolean.` — opacity is present but is not `true` or `false`.
- `Unsupported Codex code theme ID "example" for dark.` — the family is unknown, cannot be used with the requested variant, or uses a legacy alias for the wrong variant.

The contract removes duplicate messages before returning them. Passing its checks establishes only that DexThemes can serialize the string; successful import, persistence, and rendering remain decisions of the installed Codex app.

## What the format does not configure

The import payload deliberately omits more than a complete DexThemes theme record can contain. It does not include:

- A display name, author, catalog ID, summary, publication data, or other DexThemes metadata.
- `sidebar` or `codeBg` preview values.
- An `accents` array; only the selected `accent` is emitted.
- Font files or a guarantee that named fonts exist on another computer.
- Silent application, OpenAI endorsement, or a guarantee of identical rendering across devices or future app versions.

It also does not configure the Codex CLI terminal theme. The CLI has its own [customization workflow](https://learn.chatgpt.com/docs/cli-customization): use `/theme` to choose a terminal theme, and use a custom `.tmTheme` file for CLI-specific theming. Do not paste a `codex-theme-v1` app import into the CLI or treat a CLI `.tmTheme` file as an Appearance import.

## Safe import checklist

1. Generate the string from DexThemes or another source you trust instead of hand-editing compact JSON. Do not import a payload whose origin or surrounding instructions you cannot account for.
2. Confirm the literal `codex-theme-v1:` prefix is present once.
3. If inspecting manually, parse only the text after the prefix as JSON.
4. Check `codeThemeId`, `theme`, and `variant`, plus each color and type described above.
5. Use a canonical family that supports the selected variant.
6. In Codex, open Settings → Appearance, choose **Import** for the matching variant, review the string in the **Import theme** dialog, and approve it.
7. Verify the appearance in the installed app before treating the import as successful.

## Related guides

- [Install a Codex theme](/guides/how-to-install-a-codex-theme)
- [Troubleshoot a rejected import string](/guides/codex-theme-import-troubleshooting)
- [Compare Codex app and CLI themes](/guides/codex-app-themes-vs-cli-themes)
- [Share a custom theme](/guides/share-a-custom-codex-theme)
