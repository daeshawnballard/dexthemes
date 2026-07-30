---
title: Codex Theme Format Reference
description: Field-by-field reference for the codex-theme-v1 string generated and validated by DexThemes.
slug: codex-theme-format
kind: reference
section: Reference
answer: A DexThemes Codex theme is the codex-theme-v1 prefix followed by JSON with codeThemeId, one theme object, and a dark or light variant.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes shared theme contract checked against installed Codex desktop 26.721.81911 build 5973 appearance registry
related: /guides/how-to-install-a-codex-theme, /guides/codex-theme-import-troubleshooting, /guides/codex-app-themes-vs-cli-themes
---

The current DexThemes import format is the literal prefix `codex-theme-v1:` followed by one JSON object. That object contains a registered `codeThemeId`, one normalized `theme` object, and one `variant` set to `dark` or `light`.

This page documents the DexThemes contract verified against the Codex build named in `testedWith`. It is not a public compatibility guarantee from OpenAI. Codex owns the importer and can change accepted values or rendering in later builds.

DexThemes is community-built and is not affiliated with OpenAI.

## Canonical example

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#0169cc","contrast":60,"fonts":{"code":null,"ui":null},"ink":"#fcfcfc","opaqueWindows":true,"semanticColors":{"diffAdded":"#00a240","diffRemoved":"#e02e2a","skill":"#b06dff"},"surface":"#111111"},"variant":"dark"}
```

Everything before the first `{` is the format prefix. Everything from `{` through the final `}` is JSON.

DexThemes emits compact JSON without decorative whitespace. JSON object key order should not be used as identity; field names and values define the payload.

## Top-level object

The JSON object has three fields.

### codeThemeId

`codeThemeId` is a string naming a registered Codex code-theme family that supports the selected variant.

```json
"codeThemeId":"codex"
```

It is not a DexThemes catalog ID, display name, theme filename, or arbitrary path. A gallery theme named “GitHub Dark,” for example, can serialize the canonical family ID `github`.

The final import payload always contains one string. DexThemes source data can choose different family IDs for dark and light, but the serializer resolves the active variant before emitting the payload.

### theme

`theme` is the normalized appearance object. It contains the active accent, contrast parameter, fonts, foreground, opacity preference, semantic colors, and surface.

### variant

`variant` is exactly:

```json
"variant":"dark"
```

or:

```json
"variant":"light"
```

One import string carries one variant. A complete pair requires two strings and two imports.

## Theme object fields

### accent

`accent` is a six-digit hex color:

```json
"accent":"#0169cc"
```

DexThemes source themes can offer an `accents` array with up to ten choices. The serializer resolves the selected accent and emits only that one color.

### contrast

`contrast` is an integer from `0` through `100`, inclusive:

```json
"contrast":60
```

This is a Codex theme parameter carried by DexThemes. It is not a WCAG contrast ratio. Measure actual foreground and background colors independently.

### fonts

`fonts` is an object with `code` and `ui`:

```json
"fonts":{"code":null,"ui":null}
```

Each value is either a string of at most 100 characters or `null`.

```json
"fonts":{"code":"Example Mono","ui":"Example Sans"}
```

Font strings name fonts; they do not embed files, grant licenses, or guarantee availability. `null` means the payload does not name that font. Codex and the operating system determine the effective fallback behavior.

The current DexThemes builder does not expose font fields and therefore emits `null` values. Some catalog themes can include explicit names.

### ink

`ink` is the primary foreground color as six-digit hex:

```json
"ink":"#fcfcfc"
```

Test it against `surface` for body text and small labels. A valid hex value is not automatically readable.

### opaqueWindows

`opaqueWindows` is a boolean:

```json
"opaqueWindows":true
```

When the source variant does not set this value, the current DexThemes serializer emits `true`. The import payload itself contains the resolved boolean.

Do not substitute quoted strings such as `"true"` or integers such as `1`.

### semanticColors

`semanticColors` contains three required six-digit hex values:

```json
"semanticColors":{"diffAdded":"#00a240","diffRemoved":"#e02e2a","skill":"#b06dff"}
```

- `diffAdded` colors addition-related content.
- `diffRemoved` colors removal-related content.
- `skill` colors skill or function-related content.

Codex decides where and how these values are rendered. Theme authors should keep the roles distinguishable and avoid relying on hue alone.

### surface

`surface` is the main background color as six-digit hex:

```json
"surface":"#111111"
```

It forms the primary contrast relationship with `ink`.

## Hex color rules

Every color emitted by the current DexThemes validator must match:

```text
#[0-9A-Fa-f]{6}
```

Valid examples include:

- `#111111`
- `#A1B2C3`
- `#00a240`

The current contract does not accept three-digit shorthand, eight-digit alpha colors, named CSS colors, gradients, or CSS variables.

## Current registered code theme families

The DexThemes contract currently recognizes these family and variant combinations.

### Dark and light

- `absolutely`
- `catppuccin`
- `codex`
- `everforest`
- `github`
- `gruvbox`
- `linear`
- `notion`
- `one`
- `raycast`
- `rose-pine`
- `solarized`
- `vercel`
- `vscode-plus`
- `xcode`

### Dark only

- `ayu`
- `dracula`
- `lobster`
- `material`
- `matrix`
- `monokai`
- `night-owl`
- `nord`
- `oscurange`
- `sentry`
- `temple`
- `tokyo-night`

### Light only

- `proof`

This list is versioned evidence from the current DexThemes contract, not a promise that every Codex release has the same registry. Recheck after an app update if a formerly valid family is rejected.

## Canonical legacy mappings

Older DexThemes entries used several internal syntax-theme filenames. The current source validator recognizes only these known aliases and emits the registered family:

- `github-dark-default` maps to `github` for dark.
- `github-light-default` maps to `github` for light.
- `gruvbox-dark-hard` maps to `gruvbox` for dark.
- `one-dark-pro` maps to `one` for dark.

New import strings should use the canonical emitted value. Do not infer new aliases from application bundle filenames.

## DexThemes source data versus import data

A theme as stored or edited by DexThemes can contain more information than the Codex import:

- Catalog `id`, name, summary, category, attribution, and dates.
- Separate `dark` and `light` variant objects.
- An array of selectable accents.
- Sidebar and code-background preview colors.
- Copy counts or community publication metadata.
- A code-theme family selection for each variant.

The serializer selects one variant and emits only the supported import fields. In particular:

- Theme name and author are not in the import payload.
- `sidebar` is not a separate import field.
- `codeBg` is not a separate import field.
- The accents array becomes one `accent`.
- Community or catalog metadata is not included.

Do not paste a DexThemes contribution file or API response directly into Codex Appearance unless it already contains the complete `importString`.

## Current DexThemes validation behavior

Before producing a string, the shared contract checks:

- Variant is `dark` or `light`.
- The selected variant exists.
- An accents value, when present in source data, is an array with no more than ten entries.
- Every accent and required theme color is a six-digit hex value.
- Contrast is an integer from `0` through `100`.
- Fonts are an object when present.
- Font values are strings no longer than 100 characters or `null`.
- `opaqueWindows`, when present in source data, is a boolean.
- The code-theme family exists and supports the selected variant.

If validation fails, DexThemes returns no import string. Duplicate validation messages are collapsed in the current result.

That is DexThemes validation. Successful import and persistence in the installed Codex app remain separate evidence.

## Safe inspection and editing

Prefer regenerating a string from DexThemes over editing compact JSON. If you must inspect it:

1. Verify the exact prefix.
2. Copy everything after the prefix into a JSON-aware editor.
3. Check the three top-level fields.
4. Check every theme color and type.
5. Use a canonical code-theme family.
6. Reassemble the prefix and complete JSON without adding outer quotes.
7. Import through Codex Settings, Appearance, and Import theme.
8. Verify the result in the installed app.

Do not add commands, URLs, secrets, repository data, or arbitrary keys. DexThemes does not emit them, and this reference does not claim how Codex handles unknown fields.

## What this format does not configure

The app import format does not configure the Codex CLI syntax theme. The CLI uses `/theme`, persists `tui.theme`, and can load custom `.tmTheme` files from `$CODEX_HOME/themes`, according to OpenAI's [official CLI customization documentation](https://learn.chatgpt.com/docs/cli-customization).

The import also does not:

- Install font files.
- Carry a theme display name or author.
- Publish a theme to DexThemes.
- Prove OpenAI endorsement.
- Apply without user approval.
- Guarantee matching rendering across machines.

OpenAI's [official desktop settings documentation](https://learn.chatgpt.com/docs/reference/settings) confirms the broader Appearance controls, including base theme, colors, UI and code fonts, and sharing. The `codex-theme-v1` serialization details on this page are grounded in the current DexThemes source contract.

## Related guides

- [Install a Codex theme](/guides/how-to-install-a-codex-theme)
- [Troubleshoot a rejected string](/guides/codex-theme-import-troubleshooting)
- [Compare app and CLI formats](/guides/codex-app-themes-vs-cli-themes)
- [Share a custom theme](/guides/share-a-custom-codex-theme)
