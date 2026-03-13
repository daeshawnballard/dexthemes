# DexThemes

Small static site for browsing, previewing, and copying Codex-compatible appearance theme import strings.

This project is intentionally simple: no framework, no build step, and no dependency install. It exists to make Codex theme sharing easy while the feature is still new.

## What it does

- previews light and dark variants side by side
- copies real `codex-theme-v1:` import strings
- filters by category and search query
- keeps the project easy to fork, customize, and host anywhere

## Project structure

- `index.html` app shell and content structure
- `styles.css` visual system and responsive layout
- `app.js` theme data, filtering, preview rendering, and clipboard behavior
- `themes.schema.json` JSON schema for future community submissions
- `theme-submission-example.json` example contribution payload

## Run locally

Because this is a static app, any file server works.

```sh
python3 -m http.server 4173
```

Then open [http://127.0.0.1:4173/dexthemes/](http://127.0.0.1:4173/dexthemes/).

## Theme format

The app generates strings in the same shape that current Codex appearance import accepts:

```json
{
  "codeThemeId": "codex",
  "theme": {
    "accent": "#0169cc",
    "contrast": 60,
    "fonts": {
      "code": null,
      "ui": null
    },
    "ink": "#fcfcfc",
    "opaqueWindows": true,
    "semanticColors": {
      "diffAdded": "#00a240",
      "diffRemoved": "#e02e2a",
      "skill": "#b06dff"
    },
    "surface": "#111111"
  },
  "variant": "dark"
}
```

The full import string is that payload prefixed with `codex-theme-v1:`.

## Notes

- Imported themes may apply without appearing in the built-in preset dropdown.
- Fonts, pointer cursors, and font sizes are separate Codex appearance settings and are not part of the import string.
- Theme names in this repo are descriptive and inspired-by, not official brand or character packs.
