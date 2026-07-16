# DexThemes Build Week video

Reproducible `1920x1080`, 30 fps Remotion edit for the under-three-minute Build Week demo. The current composition is a silent previsualization using verified local MCP visual-QA captures. It is visibly watermarked until real deployed product recordings replace every placeholder.

## Commands

Install dependencies:

```console
npm install
```

Start Remotion Studio:

```console
npm run dev
```

Render the half-resolution review MP4:

```console
npm run render:previs
```

Render a representative review frame:

```console
npm run render:still
```

## Asset replacement

Replace files under `public/captures/` with the final deployed takes using the same names, or update `captureByScene` in `src/Composition.tsx`. Final product recordings must preserve the storyboard timing and must not expose personal email, tokens, private repository names, or unrelated notifications.

The final narration and captions are intentionally absent. After the dry narration master is approved, add it through `@remotion/media`, transcribe it into Remotion `Caption` JSON, and remove the previsualization watermark only after every runtime shot is real.

## Source of truth

- Timeline and narration: `../storyboard.json`
- Production gates: `../../docs/DEMO-VIDEO-PRODUCTION.md`
- Composition: `src/Composition.tsx`

The project source is MIT-licensed with DexThemes. Remotion's own licensing terms still apply to the rendering environment.
