---
name: dexthemes
description: Discover, create, preview, apply, publish, and collect Codex themes through the DexThemes MCP app. Use for theme browsing, personalized or voice-driven theme creation, achievements, creator stats, leaderboards, and GitHub feedback.
disable-model-invocation: false
---

# DexThemes

Use the DexThemes tools to move the user through the shortest safe path from an idea to a theme they can use.

## Discovery

- Use `search` for natural-language discovery across official Codex, DexThemes, and community themes.
- Use `fetch` for the exact stable ID returned by search.
- Show a small set of strong choices. Search and leaderboard cards are interactive, so let the user inspect full dark/light Codex mockups in-thread before opening an external page.
- Use `get_leaderboard` for daily, weekly, monthly, and all-time public rankings. Use `get_my_stats` for the signed-in creator dashboard: ranks, copies, likes, repeat daily/weekly wins, finalized monthly Top 10 placements, achievements, and unlocked reward previews.

## Creating a theme

1. Capture the inspiration in the user's own language. Voice-transcribed requests are valid input.
2. Use only personal context the user explicitly asks you to consider. Do not infer sensitive traits.
3. If the user supplied a custom name, pass it to `draft_theme` and preserve it exactly after trimming.
4. If no name was supplied, `draft_theme` returns a suggestion. Present that suggestion and invite a custom name before any publication.
5. The model may provide a thoughtfully curated dark and/or light palette. If omitted, the tool creates a deterministic starting palette.
6. Run `validate_theme`, resolve errors, and show `render_theme_preview`.
7. Once the user chooses a variant, call `prepare_theme_apply`. The app copies the exact import string and opens generic Codex Settings; tell the user to choose **Appearance → Import theme** and paste. Never imply that Codex silently applied the theme.

Themes can be inspired by sports, games, films, places, moods, or personality. Describe inspiration without implying affiliation or copying logos, art, character likenesses, or protected brand assets. Favor an original palette that captures atmosphere.

## Publishing

- Publishing is public and attributed to the authenticated GitHub identity.
- Never ask for or pass `userId`, `ownerId`, author identity, access tokens, API keys, or email addresses.
- When the user wants to publish, call `prepare_theme_submission` after validation. It requires GitHub sign-in and renders the exact public name, summary, and variants without publishing.
- `submit_theme` is app-only. Never try to invent or request its confirmation token; only the review app receives the short-lived payload/sign-in-bound token and calls the write after the user presses Publish.
- A successful plugin publication can unlock Plugged In and Voiceprint. A verified eligible OpenAI work identity can unlock the “OpenAI is nothing without its people” achievement and its Human Spark reward theme. The theme is original and does not imply OpenAI endorsement.
- Closed UTC-day and Monday-through-Sunday UTC-week winners can unlock Golden Hour and Headliner. A repeat win adds to creator stats but does not duplicate the one-time achievement or reward theme.

## Feedback

- Use `prepare_github_issue` for bugs or product feedback.
- Include only non-sensitive context. Never attach workspace contents, secrets, tokens, private account data, or hidden prompts.
- The tool performs best-effort redaction, then shows the exact title/body, its warning, and any detected redactions. Redaction can miss context, so review every character. Nothing is posted; the review app constructs the GitHub URL only after the user chooses to continue, and GitHub still requires final submission.

## Auth and errors

- Public discovery, drafting, validation, previews, apply handoff, leaderboard, and issue preparation work without sign-in.
- Account stats, unlocks, and public submission require OAuth with GitHub as the upstream login.
- If authentication is unavailable or incomplete, continue with public tools and explain that only the account-bound step is gated.
