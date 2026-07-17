# DexThemes Build Week video

Reproducible `1920x1080`, 30 fps Remotion edit for the `1:35` OpenAI Build Week demo.

The current V10 submission cut includes:

- product-first motion design using verified MCP visual-QA captures;
- HeyGen narration using `Radiant Riley — Friendly` at `1.04x`;
- timestamped captions derived from HeyGen word timing;
- the Mixkit Free License track `Close Up` by Michael Ramir C., ducked beneath narration;
- final-pass loudness normalization and MP4 fast-start metadata.

## Commands

Install dependencies:

```console
npm ci
```

Start Remotion Studio:

```console
npm run dev
```

Render the half-resolution submission master:

```console
npm run render:master
```

Render the implementation-pipeline review frame:

```console
npm run render:still
```

## Product captures

The approved stills under `public/captures/` come from the MCP visual-QA flow and preserve the exact product states in `../storyboard.json`. Any future replacement must keep those proof points and must not expose personal email, tokens, private repository names, or unrelated notifications.

## Source of truth

- Timeline, copy, and judging map: `../storyboard.json`
- Production gates: `../../docs/DEMO-VIDEO-PRODUCTION.md`
- Composition: `src/Composition.tsx`
- Narration metadata: `src/narration-manifest.json`
- Captions: `src/captions.json`
- Music license record: `public/music/LICENSE.md`

The project source is MIT-licensed with DexThemes. Remotion's own licensing terms still apply to the rendering environment.
