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

## DeepSeek Harness release cut

The `DeepSeekHarnessRelease*` compositions use genuine Playwright recordings from the isolated local Harness runtime. The 41-second edit has master (`1920x1080`), vertical (`1080x1920`), and square (`1080x1080`) variants. The admitted footage was captured after installing `@dexthemes/deepseek-harness-plugin@0.6.2` from the npm registry under `latest` and verifying the loaded `0.6.2` runtime marker.

```console
npm run render:deepseek:stills
npm run render:deepseek:all
```

The admitted recordings and state-verification screenshots live under `public/deepseek-release/captures/`. Public DexThemes endpoints were blocked during capture; the chat segment used Harness's real MCP path against a local restricted DexThemes MCP server and deterministic local LLM transport. The registry integrity, installed bundle hashes, capture assertions, and rendered-output checksums are recorded in the production receipt alongside the final assets.
