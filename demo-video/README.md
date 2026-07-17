# DexThemes Build Week Demo

This directory contains the reproducible production plan and Remotion edit for the OpenAI Build Week product demo.

- [`storyboard.json`](./storyboard.json) is the machine-readable `1:35` timeline.
- [`../docs/DEMO-VIDEO-PRODUCTION.md`](../docs/DEMO-VIDEO-PRODUCTION.md) maps every scene to the judging criteria, capture plan, edit rules, and release checks.
- [`remotion/`](./remotion/) contains the checked-in Remotion project, narration, captions, cleared music, and package lock.

The approved composition uses verified product captures from the MCP visual-QA flow, the same interaction states exposed to plugin users, and a neutral Build Week product-demo label. It is the reproducible source for the public submission master.

To render the submission master:

```bash
cd remotion
npm ci
npm run render:master
```

The V10 cut reaches the product value immediately, completes the create → preview → apply happy path by `0:28`, and treats achievements as one collective progression system rather than a featured reward.

Do not add real tokens, emails, OAuth callbacks containing codes, private repository names, or unrelated account recordings to Git.
