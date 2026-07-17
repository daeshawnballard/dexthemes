# DexThemes Build Week Demo

This directory contains the reproducible production plan and Remotion edit for the OpenAI Build Week product demo.

- [`storyboard.json`](./storyboard.json) is the machine-readable `1:35` timeline.
- [`../docs/DEMO-VIDEO-PRODUCTION.md`](../docs/DEMO-VIDEO-PRODUCTION.md) maps every scene to the judging criteria, capture plan, edit rules, and release gates.
- [`remotion/`](./remotion/) contains the checked-in Remotion project, narration, captions, cleared music, and package lock.

The current composition is deliberately labeled `PREVIS · LIVE CAPTURE PENDING`. It uses real MCP visual-QA captures to review narrative, pacing, motion, narration, and mix, but it is not yet the public submission master. Replace the still captures with recordings of the deployed Codex/plugin workflow before removing the watermark.

To review the previsualization:

```bash
cd remotion
npm ci
npm run render:previs
```

The V9 cut reaches the product value immediately, completes the create → preview → apply happy path by `0:28`, and treats achievements as one collective progression system rather than a featured reward.

Do not add real tokens, emails, OAuth callbacks containing codes, private repository names, or unrelated account recordings to Git.
