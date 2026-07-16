# DexThemes Build Week Demo

This directory contains the reproducible production plan and first Remotion previsualization for the Build Week demo.

- [`storyboard.json`](./storyboard.json) is the machine-readable 2:55 timeline.
- [`../docs/DEMO-VIDEO-PRODUCTION.md`](../docs/DEMO-VIDEO-PRODUCTION.md) contains the narration, capture checklist, edit specification, and release gates.
- [`remotion/`](./remotion/) contains the checked-in Remotion project and package lock.

The current composition is deliberately labeled `PREVIS · LIVE CAPTURE PENDING`. It uses real MCP visual-QA captures for layout review, but it is not the public submission video. Capture the real deployed Codex/plugin workflow before the final render. The resulting clips can replace the QA captures without changing the proof shown to judges. Captions should be generated from the final narration as timestamped Remotion `Caption[]` JSON rather than guessed from the storyboard.

To review the previsualization:

```bash
cd remotion
npm ci
npm run render:previs
```

Suggested capture filenames:

```text
01-hero-voice-create-import.mov
02-community-leaderboard.mov
03-github-auth-achievements.mov
04-review-and-publish.mov
05-github-issue-review.mov
06-codex-build-and-tests.mov
```

Suggested audio filenames:

```text
narration-master.wav
narration-alt.wav
music-cleared.wav
```

Do not add real tokens, emails, OAuth callbacks containing codes, or unredacted account recordings to Git.
