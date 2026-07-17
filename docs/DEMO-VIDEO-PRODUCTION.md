# Build Week Demo Video Production

This packet is the production source of truth for the public OpenAI Build Week demo. The cut is a product demonstration for judges: define DexThemes, show what the new Codex plugin enables, prove one complete happy path, and then give concise evidence for the judging criteria.

Internal test counts, implementation housekeeping, and individual achievement lore do not belong in the story.

## Deliverable

- **Title:** DexThemes for Codex — Make Codex Feel Like Yours
- **Target length:** `1:38` (`98` seconds)
- **Format:** 1920x1080, 16:9, 30 fps, H.264 video, AAC audio
- **Destination:** public YouTube URL for the Build Week submission
- **Product promise:** turn an idea into a named, validated dark/light Codex theme; preview and apply it without an account; optionally discover, publish, progress, and contribute through the community
- **Primary proof:** real Codex footage invoking the deployed DexThemes visual MCP app
- **Creative constraint:** original DexThemes visuals, real product captures, cleared narration, and cleared music only

The final edit uses Remotion for deterministic scene timing, crop/zoom, captions, graphics, and the end card. HeyGen supplies voice-over audio only; no avatar is needed.

## What judges should understand

| Build Week lens | Visible evidence |
| --- | --- |
| Quality of the idea | Any personal reference can become a complete Codex workspace theme inside the conversation. |
| Thoughtful GPT-5.6 and Codex use | GPT-5.6 interprets creative intent; deterministic MCP tools validate names, semantic colors, identity, and public actions; the visual app keeps choices in context. |
| Design and user experience | Full Codex mockups appear in-thread, the anonymous happy path comes first, and identity is requested only for community actions. |
| Technical implementation | The product shows generated state, validation, deferred GitHub OAuth, explicit public writes, interactive previews, stats, and reviewed issue creation. |
| Potential impact | The plugin joins personalization, discovery, creator attribution, rankings, achievements, and open-source contribution in one community loop. |
| Problem, solution, and approach | The first sentence states the value, the first 29 seconds prove it, and the architecture beat makes the implementation legible. |

## Editorial principles applied

- Start inside the value: the completed theme is visible from the first frame and the core promise is spoken in the first three seconds.
- Keep the product on screen. Use graphics to direct attention, not to replace working product proof.
- Complete the create → preview → apply happy path by `0:29`; every later scene adds one new evaluative signal.
- Prefer short value statements and concrete actions over feature descriptions.
- Use visual state changes every few seconds: prompt, result, contextual preview, apply handoff, leaderboard scope, publish steps, dashboard pan, issue review, architecture pipeline, close.
- Treat achievements as one collective progression system. No single achievement receives a hero scene.
- End with one clear product promise and open-source/community direction.

The approach follows Google's current ABCD guidance to start big, keep the product central, use audio intentionally, and give viewers a clear direction: https://www.thinkwithgoogle.com/_qs/documents/15987/ABCDs_PDFPlaybook_April2022_Final.pdf. It also follows Wistia's product-video guidance to show the product early, demonstrate it in action, and use music to establish pace: https://wistia.com/blog/product-video-best-practices.

## Story arc

| Time | Product proof | Judge takeaway |
| --- | --- | --- |
| 0:00–0:17 | Product result, natural-language prompt, visible custom name | DexThemes is a theme studio and community; the plugin brings it into Codex. |
| 0:17–0:29 | Full workspace preview, then exact apply handoff | The design is contextual and the useful path needs no account. |
| 0:29–0:42.5 | Unified catalog plus daily, weekly, monthly, and all-time scopes | The idea extends into a discoverable community. |
| 0:42.5–0:53.5 | Deferred GitHub OAuth, review, explicit Publish | Identity and public writes are intentional and user-controlled. |
| 0:53.5–1:04.5 | Dashboard pan from themes and wins into the full achievement collection | Creator progress is legible without centering one reward. |
| 1:04.5–1:14 | Reviewed GitHub Issue draft | Open-source contribution is accessible and still controlled by the user. |
| 1:14–1:28 | GPT-5.6 → MCP → Apps SDK implementation pipeline | The technical split is creative, deterministic, and context-preserving. |
| 1:28–1:38 | Product montage and close | Personalization, discovery, and recognition form one Codex community experience. |

The machine-readable timing lives in [`demo-video/storyboard.json`](../demo-video/storyboard.json).

## Locked narration script

> Turn any idea into a complete Codex theme. This Build Week release brings DexThemes, a theme studio and community, directly into the conversation. I asked for Argentina football at night, and named it Albiazul Afterglow.
>
> DexThemes creates a validated dark and light pair, then previews the full workspace, not just swatches. I can check code, diffs, and contrast, then apply it with no account.
>
> The plugin makes the catalog conversational: search Codex, DexThemes, and community themes, compare full previews, and see what is trending today, this week, this month, or all time.
>
> GitHub sign-in appears only when I publish. I review the name and both variants, approve the public action, and keep verified creator credit.
>
> Creators get one dashboard for themes, ranks, repeat daily and weekly wins, and the complete achievement collection. Stats accumulate; each achievement reward unlocks once.
>
> Because DexThemes is open source, users can turn reviewed feedback into a GitHub issue, without anything posting automatically.
>
> GPT-5.6 interprets the creative intent. The MCP server validates names, colors, identity, and public actions. The visual app keeps every preview and decision in context.
>
> Personal themes, community discovery, and creator recognition, all in one Codex conversation. DexThemes is open source and built for the community.

The script is `203` words. The delivery is intentionally brisk, with visual pauses carried by scene transitions rather than extra narration.

## Capture checklist

### Before recording

- The production MCP and OAuth paths pass plugin preflight.
- Privacy, terms, and support pages return `200`.
- GitHub OAuth completes in the judge-ready account without private-network access.
- The desktop shows no private themes, repository names, email addresses, tokens, unrelated notifications, or browser chrome.
- The original demo theme and publication plan are approved.
- Codex and capture display use a consistent 16:9 layout at 100% scaling.

### Required takes

1. **Create take:** request a theme, provide the custom name, and reveal the validated dark/light result.
2. **Preview/apply take:** compare the complete variants, choose one, copy the exact import, and open Appearance.
3. **Discovery take:** search, open a full preview, and move through Today, This week, This month, and All time.
4. **Publication take:** trigger GitHub linking from Publish, return to the exact review, press Publish, and show creator credit.
5. **Creator take:** show themes, current ranks, repeat-win history, and the achievement collection as a group.
6. **Feedback take:** prepare a GitHub Issue, review the draft, and stop before submission unless the issue is real and approved.
7. **Closing take:** gallery or community montage using real DexThemes product footage.

Record each take without narration. Leave clean interaction handles before and after tool results so the edit can accelerate without hiding the working app.

## Visual edit rules

- Composition ID: `BuildWeekDemo`
- Canvas: `1920x1080`
- Frame rate: `30`
- Total frames: `2940`
- Product footage occupies most of every product scene.
- Use one primary value statement and at most one proof line; do not turn the demo into a slide deck.
- Keep key text at least 80 px from the sides and 100 px from the top and bottom.
- Favor crisp 6–14 frame entrances and motivated hard cuts; avoid ornamental transitions.
- Use crop/zoom only to make real interactions readable; never fabricate product states.
- Use animated annotations for prompt, apply handoff, time scope, identity, and public-action boundaries.
- The end card retains `dexthemes.com` and `Open source`.

Use frame-based Remotion `<Sequence>` components and local media through `staticFile()`. Do not use CSS animations or CSS transitions in the composition.

## Voice and sound plan

- **Voice:** `Radiant Riley — Friendly` (`0ed165284d1c4dc9b600d3129821146a`) from HeyGen's public English Starfish catalog.
- **Speed:** `1.04x`.
- **Direction:** friendly, confident, product-literate, and concise; no presenter cadence or exaggerated sales emphasis.
- Generate one file per scene so the edit follows interaction rather than stretching footage around one master.
- Use synthesis-only phonetic substitutions while captions retain official spelling: `decks themes`, `Coh-dex`, `G P T five point six`, `M C P`, `ahl-byah-SOOL`, and `GIT-hub`.
- Preserve HeyGen word timestamps and use them for Remotion caption timing.
- **Music:** `Close Up` by Michael Ramir C. from Mixkit, recorded in [`demo-video/remotion/public/music/LICENSE.md`](../demo-video/remotion/public/music/LICENSE.md).
- Keep music roughly `12 dB` beneath narration and fade it at both ends.
- Normalize the final review mix to `-16 LUFS`, with true peak no higher than `-1.5 dBTP`.

## Final review

- [ ] The runtime shown is the deployed judge path, not localhost or a simulated app.
- [ ] The first three seconds state the value and show the product.
- [ ] The first 29 seconds show the idea, custom name, complete pair, contextual preview, and apply handoff.
- [ ] Full dark and light Codex previews—not only swatches—are readable.
- [ ] Create, preview, discover, and apply are visibly useful without sign-in.
- [ ] GitHub linking starts only when the demo chooses an authenticated community feature.
- [ ] Daily, weekly, monthly, and all-time rankings are visible.
- [ ] Repeat wins remain in creator stats while each achievement reward unlocks once.
- [ ] Achievements appear as a collective; none receives a special feature scene.
- [ ] The creator performs the final public theme action.
- [ ] The GitHub Issue stays a reviewed draft until the user explicitly continues.
- [ ] The implementation pipeline clearly distinguishes GPT-5.6 interpretation, MCP validation/security, and Apps SDK presentation.
- [ ] Captions have been manually reviewed against narration.
- [ ] Music supports pacing without masking words.
- [ ] The final video is public on YouTube and works signed out.

## Remaining production gates

1. Verify the deployed MCP, OAuth, legal, and support routes.
2. Capture the real end-to-end product takes.
3. Replace the previsualization stills with live captures and render the final master.
4. Manually review the complete edit, narration, captions, pronunciation, and music balance.
5. Upload the approved video publicly, verify it signed out, and use its URL in Devpost.
