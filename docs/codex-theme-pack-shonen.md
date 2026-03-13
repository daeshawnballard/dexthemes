# Codex Theme Pack: Ichigo, Naruto, Luffy

Codex import expects a raw theme share string, not a full JSON pack.

Use each string in the matching `Import` field for either `Light theme` or `Dark theme`.

Global settings like `Use pointer cursors`, `UI font`, `Code font`, `UI font size`, and `Code font size` are separate controls and are not part of the import string.

Recommended global settings:

- `Use pointer cursors`: on
- `UI font`: `"Avenir Next", "Segoe UI", sans-serif`
- `Code font`: `"JetBrains Mono", "SFMono-Regular", Menlo, monospace`
- `UI font size`: `13`
- `Code font size`: `12`

Schema note:

- `surface` is the background color
- `ink` is the foreground color
- `variant` must be `light` or `dark`

## Ichigo / Bankai

Light import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#F97316","contrast":46,"fonts":{"code":null,"ui":null},"ink":"#121212","opaqueWindows":true,"semanticColors":{"diffAdded":"#16A34A","diffRemoved":"#DC2626","skill":"#F59E0B"},"surface":"#FFF7F2"},"variant":"light"}
```

Dark import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#FF7A1A","contrast":64,"fonts":{"code":null,"ui":null},"ink":"#FFF4EC","opaqueWindows":true,"semanticColors":{"diffAdded":"#22C55E","diffRemoved":"#EF4444","skill":"#F59E0B"},"surface":"#121111"},"variant":"dark"}
```

## Naruto / Hidden Leaf Ember

Light import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#F59E0B","contrast":48,"fonts":{"code":null,"ui":null},"ink":"#1A1A1A","opaqueWindows":true,"semanticColors":{"diffAdded":"#16A34A","diffRemoved":"#DC2626","skill":"#EA580C"},"surface":"#FFF8ED"},"variant":"light"}
```

Dark import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#FF9F1C","contrast":66,"fonts":{"code":null,"ui":null},"ink":"#F7F3EA","opaqueWindows":true,"semanticColors":{"diffAdded":"#22C55E","diffRemoved":"#F97316","skill":"#F59E0B"},"surface":"#101418"},"variant":"dark"}
```

## Luffy / Grand Line

Light import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#DC2626","contrast":44,"fonts":{"code":null,"ui":null},"ink":"#152033","opaqueWindows":true,"semanticColors":{"diffAdded":"#16A34A","diffRemoved":"#DC2626","skill":"#2563EB"},"surface":"#FFF8E7"},"variant":"light"}
```

Dark import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#F87171","contrast":62,"fonts":{"code":null,"ui":null},"ink":"#F8F1DC","opaqueWindows":true,"semanticColors":{"diffAdded":"#22C55E","diffRemoved":"#EF4444","skill":"#60A5FA"},"surface":"#0F172A"},"variant":"dark"}
```

## Trio Fusion / Shonen Sunset

Light import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#EA580C","contrast":47,"fonts":{"code":null,"ui":null},"ink":"#161616","opaqueWindows":true,"semanticColors":{"diffAdded":"#16A34A","diffRemoved":"#DC2626","skill":"#7C3AED"},"surface":"#FFF7E8"},"variant":"light"}
```

Dark import string:

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#FB923C","contrast":67,"fonts":{"code":null,"ui":null},"ink":"#FFF7ED","opaqueWindows":true,"semanticColors":{"diffAdded":"#22C55E","diffRemoved":"#EF4444","skill":"#A855F7"},"surface":"#111827"},"variant":"dark"}
```
