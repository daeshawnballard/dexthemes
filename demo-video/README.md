# DexThemes Build Week Demo

This directory contains the edit-neutral production plan for the Build Week demo.

- [`storyboard.json`](./storyboard.json) is the machine-readable 2:55 timeline.
- [`../docs/DEMO-VIDEO-PRODUCTION.md`](../docs/DEMO-VIDEO-PRODUCTION.md) contains the narration, capture checklist, edit specification, and release gates.

No generated avatar, synthetic product footage, or rendering dependency is committed here. Capture the real deployed Codex/plugin workflow first. The resulting clips can then be placed in a Remotion composition without changing the proof shown to judges. Captions should be generated from the final narration as timestamped Remotion `Caption[]` JSON rather than guessed from the storyboard.

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
