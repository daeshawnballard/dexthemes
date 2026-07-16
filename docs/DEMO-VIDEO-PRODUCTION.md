# Build Week Demo Video Production

This packet is the production source of truth for the public Build Week demo. The final video must be a real, judge-reproducible product capture, not a simulated product video.

## Deliverable

- **Working title:** Speak a Vibe. Build a Codex Theme.
- **Target length:** 2:55 maximum (`175` seconds)
- **Format:** 1920x1080, 16:9, 30 fps, H.264 video, AAC audio
- **Destination:** Public YouTube URL
- **Required spoken coverage:** what DexThemes for Codex does, how Codex was used to build it, and how GPT-5.6 is used in the experience
- **Primary proof:** a continuous real capture of Codex invoking the deployed DexThemes plugin
- **Creative constraint:** use original DexThemes visuals and cleared narration only; do not use team logos, match footage, game art, or copyrighted music

The recommended production stack is:

1. Record the real Codex/plugin workflow after the production MCP and OAuth paths pass preflight.
2. Use Remotion for the edit, captions, cursor emphasis, crop/zoom, and end card.
3. Add narration after the script and product claims are locked, using Daeshawn's recorded voice or a dedicated text-to-speech tool.

HeyGen's installed video workflow is optimized for presenter-led generated video, not narration-only. If HeyGen is used, limit it to an optional presenter intro/outro after approval; do not use an AI avatar or prompt-generated video as the primary demo. Judges need to see the real plugin working.

## Story arc

| Time | Product proof | Spoken point |
| --- | --- | --- |
| 0:00–0:08 | Codex and DexThemes title card, then the real chat | A workspace theme can begin as a sentence, not a settings scavenger hunt. |
| 0:08–0:29 | Speak/type the Argentina-at-night prompt with the custom name | Voice-friendly creation; the user may always supply the name. |
| 0:29–0:48 | GPT-5.6 returns an original dark/light pair and visual preview | Personalized palette reasoning, naming, and DexThemes validation. |
| 0:48–1:08 | Prepare the import, open the fixed Codex Settings route, import, and show the applied result | The theme payload is validated JSON; no theme is silently published. |
| 1:08–1:28 | Search community themes, inspect one inline, and switch Today/This Week leaderboard cards | Discovery and community momentum stay visual inside the thread. |
| 1:28–1:48 | GitHub sign-in, all-period ranks, repeat-win history, and achievement reward previews | GitHub identity joins plugin and website activity without user IDs in tool arguments. |
| 1:48–2:12 | Exact app review, user presses Publish, then published result | Public writes require the signed-in user and an explicit payload-bound confirmation. |
| 2:12–2:26 | Prepare a redacted GitHub Issue and stop on the GitHub review page | Open-source feedback is easy, but never silently posted. |
| 2:26–2:46 | Source tree, tests, MCP app, and Codex task | Codex built and hardened the integration; GPT-5.6 drives palette reasoning. |
| 2:46–2:55 | Gallery/end card with repository and project URL | Open-source invitation and final product promise. |

The machine-readable timing and exact per-shot narration live in [`demo-video/storyboard.json`](../demo-video/storyboard.json).

## Locked narration script

> Your coding workspace should feel like yours. With DexThemes for Codex, a new theme can start as a sentence.
>
> I can say, “Create a dark and light theme inspired by Argentina football at night, and name it Albiceleste Afterglow.” The custom name is preserved. GPT-5.6 interprets the mood, creates an original palette, and reasons about contrast while DexThemes validates every supported color and renders both variants.
>
> From the same conversation, I can prepare the exact Codex import. The plugin never hides a community write inside this step: it gives me validated theme data, opens the fixed Codex Settings destination, and I choose to import it. Now the workspace has the new look.
>
> DexThemes is also a discovery layer. Search results open as full Codex mockups inside the thread. I can compare official, DexThemes, and community themes, then switch between today's, this week's, monthly, and all-time leaderboards.
>
> GitHub sign-in shows every rank, repeat daily and weekly win history, finalized monthly Top 10 placements, and reward themes. Repeat results grow the stats; each achievement unlocks once. Golden Hour and Headliner reward qualified themes of the day and week. Builder of AGI is the verified OpenAI-work-domain bonus: “OpenAI is nothing without its people.” Only eligibility is stored.
>
> Publishing is deliberately explicit. The app shows the exact name, summary, dark and light palettes, and identity. Only after I press Publish does the short-lived confirmation authorize that exact payload. The model cannot invent an owner or reuse the review for a different theme.
>
> Because DexThemes is open source, I can also describe a bug and prepare a GitHub Issue. DexThemes applies best-effort redaction for common secrets, paths, emails, and tokens, then warns me to review every character. GitHub still asks me to submit the exact draft.
>
> I used Codex throughout Build Week to understand the existing codebase, build the MCP app and plugin skill, connect authentication and achievements, trace the color pipeline, and add contract and security tests. GPT-5.6 supplies the creative palette reasoning inside the live experience.
>
> Speak a vibe. Make Codex yours. And, if you love it, share it with the DexThemes community.

Read at a calm product-demo pace. Do not accelerate the final security/build section to fit; shorten pauses or capture transitions first.

## Capture checklist

### Before recording

- Production `https://www.dexthemes.com/api/mcp` returns a valid MCP response.
- OAuth protected-resource metadata and the OpenAI challenge are live as literal resources.
- Privacy, terms, and support pages return `200`.
- GitHub OAuth completes in the judge-ready account without MFA, SMS, or private-network access.
- The account has no private themes, private repository names, personal email, access token, or unrelated notifications visible.
- Browser bookmarks, terminal environment values, account menus, and notification center are hidden.
- A disposable, original demo theme name and publication plan are approved.
- Codex, browser, and capture display use a consistent 16:9 layout at 100% scaling.

### Required takes

1. **Hero take:** one uninterrupted flow from the voice/text request through preview and Codex import.
2. **Community take:** search with inline theme selection, Today/This Week leaderboards, personal ranks and repeat-win history, and reward-theme previews.
3. **Publication take:** exact app review, visible user click, successful community result.
4. **Feedback take:** best-effort redacted draft, explicit review warning, and GitHub's final review page; do not press GitHub's submit button for the demo unless the issue is real and approved.
5. **Build take:** repository tree, MCP app, plugin skill, and a clean test result.
6. **Safety take:** close crop of the reviewed payload and fixed settings handoff, if the hero take is too small to read.

Record each take without narration. This makes timing and accessibility captions easier to revise.

## Remotion edit specification

- Composition ID: `BuildWeekDemo`
- Canvas: `1920x1080`
- Frame rate: `30`
- Maximum frames: `5250`
- Safe area: keep key text at least 96 px from the sides and 100 px from the top and bottom
- Captions: two lines maximum, sentence case, high-contrast background, no word-by-word karaoke animation
- Transitions: hard cuts or 6–10 frame dissolves only
- Zooms: use only to make a real interaction readable; do not fabricate UI states
- Cursor: one subtle ring on clicks that matter—Import, Sign in, Publish, and Continue to GitHub
- Music: optional, original/cleared, mixed at least 18 dB below narration
- End card: “Speak a vibe. Make Codex yours.”, DexThemes wordmark, `dexthemes.com`, public repository URL, and “Open source”

Implement each scene with frame-based Remotion `<Sequence>` components, load captures with `<Video>` and narration with `<Audio>` from `@remotion/media`, and reference local media through `staticFile()`. Do not use CSS transitions, CSS animations, or Tailwind animation classes; they are not deterministic in Remotion renders.

After the final narration file exists, transcribe it to a JSON array using Remotion's `Caption` shape (`text`, `startMs`, `endMs`, `timestampMs`, and `confidence`). Keep caption rendering in a separate component and derive its frame ranges from those timestamps. Do not invent word timings from this storyboard.

The edit should preserve enough uncut interaction around each result that a judge can distinguish a working tool call from a static mockup.

## Narration and HeyGen gate

The available HeyGen catalog includes English presenter voices such as Cody and Aria, but the installed HeyGen video workflow is not the right tool for a narration-only track. Use it only if the final cut intentionally includes a presenter. Generate any paid or externally hosted media only after:

- the real product capture is complete;
- all spoken claims match the deployed behavior;
- the final script is approved;
- a pronunciation test confirms “DexThemes,” “Codex,” “Albiceleste,” “GPT-5.6,” and “GitHub”; and
- the chosen voice/avatar and licensing terms permit the public YouTube submission.

For narration, produce one dry master and one alternate take. Do not bake music or sound effects into the voice file.

## Final review

- [ ] Runtime shown is the deployed judge path, not localhost or a mock.
- [ ] Video is less than three minutes after YouTube processing.
- [ ] Spoken audio explicitly covers the product, Codex, and GPT-5.6.
- [ ] Custom naming is visible.
- [ ] The user—not the model—performs the final public write.
- [ ] Daily, weekly, monthly, and all-time personal ranks plus repeat-win history and achievement previews are shown.
- [ ] Builder of AGI is described accurately and not portrayed as unlocked by an ineligible account.
- [ ] The GitHub Issue is reviewed and not silently submitted.
- [ ] No secrets, personal email, access token, private repository, or copyrighted third-party asset appears.
- [ ] Captions have been manually reviewed.
- [ ] YouTube visibility is Public, not Unlisted or Private.
- [ ] Public URL works in a signed-out browser window.

## Remaining gates before production

The storyboard and narration are ready for capture, but the final video must wait for:

1. the production MCP, OAuth, and legal/support endpoints to be deployed and verified;
2. the current local Build Week work to be reviewed and synchronized to the submission repository;
3. an approved demo account and disposable public theme;
4. a real capture of the end-to-end flow; and
5. explicit approval to generate paid narration, upload publicly, and use the final URL in Devpost.
