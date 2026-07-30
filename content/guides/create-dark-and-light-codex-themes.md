---
title: Create Dark and Light Codex Themes
description: Design paired dark and light variants that share an identity without relying on automatic color inversion.
slug: create-dark-and-light-codex-themes
kind: guide
section: Guides
answer: Build dark and light as separate palettes, keep their accent and semantic meaning related, test each on its own surfaces, then import each variant separately.
author: Daeshawn Ballard
authorUrl: https://x.com/daeshawn
datePublished: 2026-07-30
dateModified: 2026-07-30
testedWith: DexThemes current dual-variant builder and theme import contract
related: /guides/create-a-custom-codex-theme, /guides/codex-theme-accessibility, /guides/how-to-install-a-codex-theme
---

A good dark-and-light pair is two designed palettes with a shared identity, not one palette with every color numerically inverted. Keep the accent family and semantic roles recognizable, but tune luminance, saturation, and surrounding surfaces for each mode.

DexThemes stores dark and light builder drafts separately in the current browser. Its Codex import format also exports one variant at a time, so you can refine and install each independently.

## Establish the shared identity

Before choosing exact hex values, write down what should remain consistent:

- The primary accent family.
- The emotional tone, such as calm, technical, warm, or high-energy.
- The meaning of added, removed, and skill colors.
- The intended level of surface separation.
- Any accessibility target or display constraint.

Consistency does not require identical accent hex values. A bright cyan that reads clearly on a dark surface may need to become deeper and less luminous on a pale surface. The role remains the same even when the value changes.

## Build the dark variant

1. Open **Create a theme** in DexThemes.
2. Choose the dark variant.
3. Start with a low-luminance surface that is comfortable rather than necessarily pure black.
4. Choose an ink color that makes long text readable without creating excessive glare.
5. Add subtle sidebar and code-background separation in the preview.
6. Select an accent that remains distinct against all nearby dark surfaces.
7. Tune added, removed, and skill colors.
8. Inspect prose, code, and diffs at normal screen brightness.
9. Save the draft by leaving it in the builder and copy the import string when it is ready.

Dark themes often benefit from slightly muted semantic colors. A fully saturated color on near-black can feel brighter than expected even when a contrast calculation passes.

## Build the light variant

1. Switch the builder to the light variant.
2. Choose a light surface with enough separation from white window chrome and panels.
3. Use dark ink that remains comfortable for paragraphs and small labels.
4. Adapt the accent rather than copying it blindly from dark mode.
5. Darken semantic colors enough to remain legible on pale diff backgrounds.
6. Check borders, selections, and secondary text in the preview.
7. Compare the variant with the dark design for identity, not pixel parity.
8. Copy the light import string separately.

Avoid assuming that a tinted surface is automatically readable because it is “light.” Very pale accent text and low-contrast gray labels are common failure points.

## Preserve semantic meaning

Keep the meaning of each role stable:

- `diffAdded` should continue to represent additions.
- `diffRemoved` should continue to represent removals.
- `skill` should remain distinguishable from both diff states and the main accent.
- `accent` should continue to identify emphasis or interaction.

Do not rely on hue alone. People with color-vision differences may not distinguish a red-green pair even when it looks obvious to you. Test luminance and observe the shapes, labels, and diff markers that Codex provides around the colors.

The current import payload includes these semantic colors, but Codex controls the final rendering and supporting cues.

## Compare with a repeatable checklist

Use the same sample task for both variants:

- A long assistant response with inline code.
- A fenced code block with comments, strings, and keywords.
- A file diff with additions and removals.
- Buttons and selected items.
- Disabled and secondary labels.
- A skill or function indicator.

Then change environmental conditions:

- Test in a bright room and a dim room.
- Reduce and increase display brightness.
- Use your normal text scaling.
- Check a second display if the theme will be shared widely.

The DexThemes preview is useful for rapid iteration, but the imported theme in Codex is the final visual check.

## Export and import the pair

Each copied value has one top-level `variant`:

```json
"variant":"dark"
```

or:

```json
"variant":"light"
```

Copy the dark string, open Codex Settings, choose Appearance, and import it into the dark theme control. Repeat with the light string and the light control. Do not merge the JSON objects.

When sharing the pair, label each string and keep them in plain text. Read [Share a custom Codex theme](/guides/share-a-custom-codex-theme) for a portable handoff.

## Submit both variants carefully

The current builder can retain a separately touched draft for each side and include both in a community submission. It can also support adding a missing variant to a community theme you own.

Before submitting:

- Give both variants the same theme identity and name.
- Verify that neither side is still an untouched default.
- Check protected-palette and community guidelines.
- Inspect both imported results in Codex.

A submission is not automatically proof of publication. Wait until the theme is visible in the community catalog before presenting it as public.

## Know what does not carry through

DexThemes previews sidebar and code-background colors, but the current compact Codex import does not emit those as separate fields. It emits `surface`, `ink`, `accent`, semantic colors, contrast, fonts, opacity, variant, and a code-theme family ID.

The builder also does not currently expose font controls. Set UI and code fonts in Codex Appearance and test them with both palettes. OpenAI's [official settings documentation](https://learn.chatgpt.com/docs/reference/settings) confirms those Appearance controls.

DexThemes is community-built and is not affiliated with OpenAI. Codex can change import and rendering behavior independently, so keep both import strings and retest after significant app updates.

## Related guides

- [Create a custom Codex theme](/guides/create-a-custom-codex-theme)
- [Design for theme accessibility](/guides/codex-theme-accessibility)
- [Install each variant](/guides/how-to-install-a-codex-theme)
- [Share the finished pair](/guides/share-a-custom-codex-theme)
