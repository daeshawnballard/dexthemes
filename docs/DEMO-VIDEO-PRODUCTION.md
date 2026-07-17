# Build Week Demo Video Production

This packet is the production source of truth for the public OpenAI Build Week demo. The cut is a product demo first: judges should understand the problem, see the complete happy path, and leave knowing why DexThemes is useful and distinctive. Internal test counts, scan rounds, and implementation housekeeping do not belong in the story.

## Deliverable

- **Title:** One Sentence. A Codex That Feels Yours.
- **Target length:** 2:19 (`139` seconds)
- **Format:** 1920x1080, 16:9, 30 fps, H.264 video, AAC audio
- **Destination:** Public YouTube URL for the Build Week submission
- **Product promise:** turn an idea into a named, validated dark/light Codex theme; preview it in context; apply it without an account; and optionally publish it to the community
- **Primary proof:** real Codex footage invoking the deployed DexThemes visual MCP app
- **Creative constraint:** use original DexThemes visuals, real product captures, cleared narration, and cleared music only

The final edit uses Remotion for deterministic scene timing, crop/zoom, captions, and the end card. HeyGen supplies voice-over audio only; it does not replace the real product footage and no avatar is needed.

## What judges should understand

| Build Week lens | Visible evidence |
| --- | --- |
| Quality of the idea | A coding workspace can become personal from one natural-language idea. |
| Thoughtful GPT-5.6 use | GPT-5.6 interprets a creative reference into semantic color intent; DexThemes validates the named dark/light result. |
| Design and user experience | Full Codex mockups appear inside the thread, the anonymous happy path comes first, and identity is requested only for community actions. |
| Technical implementation | A visual MCP app coordinates generation, validation, previews, a safe apply handoff, GitHub identity, explicit publication, stats, and feedback. |
| Potential impact | Creators can publish, discover, rank, collect achievements, and improve an open-source theme ecosystem without leaving the conversation. |
| Problem, solution, and approach | The hook states the ownership problem; the product flow demonstrates the solution; the final line summarizes the GPT-5.6 → DexThemes → Codex approach. |

## Story arc

| Time | Product proof | Viewer takeaway |
| --- | --- | --- |
| 0:00–0:07 | Product hook, then real Codex thread | One sentence can make Codex feel personally yours. |
| 0:07–0:27 | Voice/text request with the visible custom name `Albiazul Afterglow` | GPT-5.6 interprets the brief; DexThemes validates and names both variants. |
| 0:27–0:41 | Full dark/light Codex mockups in the thread | Users choose in context, not from swatches alone. |
| 0:41–0:55 | Exact import and Codex Appearance handoff | The useful path works without an account. |
| 0:55–1:08 | Search plus daily, weekly, monthly, and all-time leaderboards | Discovery and community momentum stay visual. |
| 1:08–1:23 | Optional GitHub sign-in, exact theme review, and user-pressed Publish | Identity appears only when needed, and the creator controls the public action. |
| 1:23–1:37 | Personal ranks, repeat-win history, and achievements | Repeat wins remain in stats while each reward unlocks once. |
| 1:37–1:53 | Human Spark dark/light preview | A small people-first achievement delights eligible OpenAI builders without claiming employment. |
| 1:53–2:03 | Reviewed GitHub Issue draft | Open-source feedback is easy and still user-controlled. |
| 2:03–2:19 | Gallery montage and closing product promise | Personal creation can become community discovery. |

The machine-readable timing and exact per-shot narration live in [`demo-video/storyboard.json`](../demo-video/storyboard.json).

## Locked narration script

> What if one sentence could turn Codex into a workspace that feels unmistakably yours?
>
> By voice or text, I ask Codex for dark and light themes inspired by Argentina football at night, and name it Albiazul Afterglow. GPT-5.6 interprets the brief; DexThemes validates both variants and makes sure every theme has a name.
>
> Before I switch, DexThemes renders both variants as full Codex workspaces in the thread, not just swatches, so I can judge code, diffs, contrast, and accents in context.
>
> I copy the exact import, open Codex Appearance, and apply it. No account is required to create, preview, discover, or use a theme. Value comes before sign-in.
>
> I can search official, DexThemes, and community themes, compare full previews, and see what people love today, this week, this month, or all time.
>
> Only when I choose Publish does DexThemes ask for GitHub. I review the name and both previews, approve the public action, and my verified GitHub identity is credited as the creator.
>
> Signed-in creators see achievements, ranks, and every daily or weekly win. A theme can win repeatedly and its totals keep growing, while each achievement reward unlocks only once.
>
> Eligible OpenAI builders unlock Human Spark and the achievement, OpenAI is nothing without its people. GitHub verifies an openai.com address; DexThemes stores only eligibility, never the address.
>
> Because DexThemes is open source, I can review feedback and explicitly open a GitHub issue from the same conversation.
>
> Every theme starts personal and can become something the Codex community discovers. GPT-5.6 interprets the idea, DexThemes validates it, and the visual app keeps creation, preview, and sharing in one conversation.

The script is `272` words, averaging about `117` words per minute. Do not accelerate the close; let product footage provide the breathing room.

## Capture checklist

### Before recording

- The production MCP and OAuth paths pass plugin preflight.
- Privacy, terms, and support pages return `200`.
- GitHub OAuth completes in the judge-ready account without private-network access.
- The account and desktop show no private themes, repository names, email addresses, tokens, unrelated notifications, or browser chrome.
- The original demo theme and publication plan are approved.
- Codex and capture display use a consistent 16:9 layout at 100% scaling.

### Required takes

1. **Create take:** one uninterrupted flow from the voice/text request through the named dark/light preview.
2. **Apply take:** select a variant, copy the exact import, open Appearance, and show the applied result.
3. **Discovery take:** search, open a full preview, and move through Today, This week, This month, and All time.
4. **Publication take:** trigger GitHub linking only from Publish, return to the exact review, press Publish, and show the community result.
5. **Creator take:** show personal ranks, repeat-win history, achievements, and the Human Spark reward preview.
6. **Feedback take:** prepare a GitHub Issue, review the draft, and stop before GitHub submission unless the issue is real and approved.
7. **Closing take:** gallery or community montage using real DexThemes product footage.

Record each take without narration. Keep enough interaction before and after tool results for a judge to distinguish a working app from a static mockup.

## Visual edit rules

- Composition ID: `BuildWeekDemo`
- Canvas: `1920x1080`
- Frame rate: `30`
- Total frames: `4170`
- Product footage should occupy most of every feature scene.
- Use one primary value statement, narration captions, and at most one small proof line; avoid turning the demo into a slide deck.
- Keep key text at least 96 px from the sides and 100 px from the top and bottom.
- Use hard cuts or 6–10 frame dissolves only.
- Use crop/zoom only to make real interactions readable; never fabricate product states.
- Add one subtle click ring only for actions that matter: select variant, apply, sign in, Publish, and Review GitHub issue.
- Optional cleared music should sit at least 18 dB below narration.
- The end card must retain `dexthemes.com`, the public repository, and `Open source`.

Use frame-based Remotion `<Sequence>` components, `<Video>` and `<Audio>` from `@remotion/media`, and local media through `staticFile()`. Do not use CSS animations or CSS transitions in the Remotion composition.

## HeyGen voice-over plan

- **Primary voice:** `Affable Aaron` (`184c9014f94142ae949363089aaf53dd`), verified in HeyGen's public English catalog with Starfish support for a warmer, human-first delivery.
- **Alternates:** `Smooth Dev` (`07d2ba65847541feb97abc9b60181555`) for a more technical delivery; `Chill Brian` (`d2f4f24783d04e22ab49ee8fdc3715e0`) for a more relaxed founder take.
- Generate one file per scene so the edit can follow the product interaction instead of stretching footage around one fixed master.
- Target a warm, intelligent, conversational builder voice: confident and technically credible, never hypey or commercial.
- Use `inputType: text`, `language: en`, and `speed: 1.0`; adjust no higher than `1.03` only after measuring the generated files.
- Use plain text with synthesis-only phonetic substitutions while captions retain official spelling: `decks themes`, `COH-decks`, `G P T five point six`, `ahl-byah-SOOL`, `GIT-hub`, and `open A I dot com`.
- Keep one dry master and one alternate take; do not bake music or effects into narration.
- Preserve HeyGen word timestamps when available and use them to create Remotion `Caption` records.
- Mix narration around `-16 LUFS` with peaks below `-1 dBTP`; keep music about 10–12 dB beneath narration.

Scene timing is shaped around Affable Aaron: curious hook, personable creation, assured apply path, brighter discovery, reassuring publication, crisp creator stats, warm Human Spark moment, collaborative feedback, and a confident quiet close.

## Final review

- [ ] Runtime shown is the deployed judge path, not localhost or a simulated app.
- [ ] The first 25 seconds show the idea, custom name, GPT-5.6 interpretation, and validated pair.
- [ ] Full dark and light Codex previews—not only swatches—are readable.
- [ ] Create, preview, discover, and apply are visibly useful without sign-in.
- [ ] GitHub linking starts only when the demo chooses an authenticated community feature.
- [ ] Daily, weekly, monthly, and all-time rankings are visible.
- [ ] Repeat wins remain in creator stats while each achievement reward unlocks once.
- [ ] The achievement is named `OpenAI is nothing without its people` and unlocks the `Human Spark` reward theme.
- [ ] The video says only that GitHub verified an eligible exact `@openai.com` address; it does not claim to prove employment.
- [ ] The creator performs the final public theme action.
- [ ] The GitHub Issue stays a reviewed draft until the user explicitly continues.
- [ ] The closing frame makes GPT-5.6, DexThemes validation, the Codex visual app, community impact, and open source legible.
- [ ] Captions have been manually reviewed.
- [ ] The final video is public on YouTube and works signed out.

## Remaining production gates

1. Verify the deployed MCP, OAuth, legal, and support routes.
2. Capture the real end-to-end product takes.
3. Replace all previsualization stills with live captures and render the final master.
4. Manually review the complete edit, narration, captions, and pronunciation.
5. Upload the approved video publicly, verify it signed out, and use its URL in Devpost.
