# DexThemes Build Week video

Reproducible `1920x1080`, 30 fps Remotion edit for the `1:38` OpenAI Build Week demo.

The current V5 review cut includes:

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

Render the half-resolution review MP4:

```console
npm run render:previs
```

Render the implementation-pipeline review frame:

```console
npm run render:still
```

## Asset replacement

Replace the stills under `public/captures/` with final deployed takes, or update the scene renderers in `src/Composition.tsx`. Final recordings must preserve the proof in `../storyboard.json` and must not expose personal email, tokens, private repository names, or unrelated notifications.

Keep the `PREVIS · LIVE CAPTURE PENDING` watermark until every runtime shot is real and the deployed OAuth path has been verified.

## Source of truth

- Timeline, copy, and judging map: `../storyboard.json`
- Production gates: `../../docs/DEMO-VIDEO-PRODUCTION.md`
- Composition: `src/Composition.tsx`
- Narration metadata: `src/narration-manifest.json`
- Captions: `src/captions.json`
- Music license record: `public/music/LICENSE.md`

The project source is MIT-licensed with DexThemes. Remotion's own licensing terms still apply to the rendering environment.
