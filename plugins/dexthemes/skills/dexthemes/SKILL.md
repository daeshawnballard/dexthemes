---
name: dexthemes
description: Discover, create, validate, preview, and safely install themes through DexThemes. Use for Codex, T3 Code, or Claude Code theming, community browsing, personalized creation, publication, achievements, creator stats, leaderboards, and GitHub feedback.
metadata: {"version":"1.2.2"}
---

# DexThemes

Use the DexThemes tools to move the user through the shortest safe path from an idea to a validated theme they can use in their current host.

## Discovery

- Use `search` for natural-language discovery across built-in Codex, DexThemes, and community themes.
- Use `fetch` for the exact stable ID returned by search.
- Show a small set of strong choices. When the host renders interactive cards, let the user inspect the full dark/light previews in-thread.
- Use `get_leaderboard` for daily, weekly, monthly, and all-time public rankings. Use `get_my_stats` for the signed-in creator dashboard: ranks, copies, likes, repeat daily/weekly wins, finalized monthly Top 10 placements, achievements, and unlocked reward previews.

## Creating a theme

Use `color_me_lucky` when the user asks for a surprise. It returns a private paired draft and does not publish, apply, or alter account state.

1. Capture a short description of colors, mood, or atmosphere. Voice-transcribed aesthetic requests are valid input; do not pass full transcripts or conversation history.
2. For a theme based on the user, translate explicitly requested, non-sensitive preferences into aesthetic terms. Never request or send sensitive traits, contact details, account identifiers, credentials, private workspace content, or a child's personal information. Do not infer sensitive traits. DexThemes is for ages 13 and above; decline requests explicitly directed at a child under 13 and offer an adult-oriented, non-personal palette instead.
3. If the user supplied a custom name, pass it to `draft_theme` and preserve it exactly after trimming.
4. If no name was supplied, `draft_theme` returns a suggestion. Present that suggestion and invite a custom name before any publication.
5. The model may provide a thoughtfully curated dark and/or light palette. If omitted, the tool creates a deterministic starting palette.
6. Run `validate_theme`, resolve structural errors, and show `render_theme_preview`.
7. Use the host-specific application workflow below. Never imply that previewing, exporting, or installing a file changed the active theme.

Private themes can be inspired by sports, games, films, places, moods, or aesthetic preferences. Describe inspiration without implying affiliation or copying logos, art, character likenesses, or protected brand assets. Favor an original palette that captures atmosphere. A private draft may retain the user's requested reference; a public community name, ID, and summary must use original descriptive wording without personal or sensitive details.

## Applying in Codex

Once the user chooses a Codex variant, call `prepare_theme_apply`. The app copies the exact import string and opens generic Codex Settings; tell the user to choose **Appearance → Import theme** and paste. Never imply that Codex silently applied the theme.

## Importing into T3 Code

Once the user chooses a theme and variant for T3 Code, call `prepare_t3code_export`. The app prepares the exact validated T3 Code JSON without changing any settings. Have the user note their current appearance and use the app's **Copy & open T3 Code** control. The registered link opens the app only and does not navigate to Appearance, so direct the user to **Settings → Appearance → Themes → Add theme**, then paste the JSON. If clipboard access fails, use the selectable JSON and separate **Open T3 Code** control, followed by the same manual navigation. Confirm the selected theme and visible appearance after reopening settings; copying or opening the app alone is not an import. When the user requests a temporary test, restore the exact prior selection and confirm its appearance. Do not claim T3 Code support when this tool is unavailable in the current connection.

## Installing in Claude Code

This section applies only inside the separate DexThemes Claude Code package, where `CLAUDE_PLUGIN_ROOT`, the conversion script, and bundled themes are available. Do not attempt these package-local commands from ChatGPT or the Codex plugin. Claude Code plugins can contribute bundled themes. The DexThemes Claude Code package ships reviewed dark and light variants in its `themes/` directory; they become choices in Claude Code's `/theme` picker when the plugin is installed. Claude Code owns final selection and persistence.

For a searched community theme or a newly generated private theme:

1. Use `search` then `fetch`, or `draft_theme`, to obtain the exact theme. For a draft, run `validate_theme` and resolve every structural error.
2. Show `render_theme_preview`, then materialize only the selected theme's bounded canonical fields in a workspace JSON file: `id`, `name`, optional `summary` and `accents`, plus the available `dark` and/or `light` palette. Do not include remote prose, credentials, account data, or hidden metadata.
3. Run `node "$CLAUDE_PLUGIN_ROOT/scripts/claude-theme-workflow.mjs" prepare --input <theme.json> --output-dir <empty-review-directory>`. This uses the same Claude theme contract as the bundled files, validates every token, writes review artifacts outside the Claude profile, and prints the exact JSON paths and SHA-256 digests. Preparation does not install or select anything.
4. Show the exact generated JSON and digest for the requested variant. Ask for explicit confirmation to install that exact digest. A general request to find or preview a theme is not installation approval.
5. Only after confirmation, run `node "$CLAUDE_PLUGIN_ROOT/scripts/claude-theme-workflow.mjs" install --receipt <receipt.json> --variant <dark-or-light> --confirm-sha256 <digest>`. The CLI installs only to the default `~/.claude/themes` directory, checks existing destination components for symlinks immediately before its exclusive create, and refuses traversal, changed receipts, and conflicting filenames. It never overwrites a different file or edits Claude settings. This local workflow assumes the user's own Claude profile directories are not concurrently replaced during that write.
6. Tell the user the installed theme name, then let them select it with `/theme`. Before selection, have them note the exact current theme shown by Claude. To restore, select that exact prior theme again with `/theme` and confirm its visible appearance. Do not choose a theme or restore a different approximation on the user's behalf.

If Claude Code later documents a supported programmatic selection API, it may be used only after the same explicit confirmation. Until then, installation can be automated but final `/theme` selection remains a host-owned step. Removing the DexThemes plugin removes its bundled contributions; separately installed custom files remain user-owned and are never deleted by the plugin.

## Publishing

- Publishing is public and attributed to the authenticated DexThemes identity. Normal users sign in with GitHub; the isolated OpenAI reviewer account exists only for marketplace review.
- Never ask for or pass `userId`, `ownerId`, author identity, access tokens, API keys, or email addresses.
- When the user wants to publish, run `validate_theme` with `forPublication: true`, then call `prepare_theme_submission`. Both enforce original public-facing wording. If validation suggests replacement names and a summary, keep the private draft intact and let the user choose or provide custom public wording. Preparation requires DexThemes sign-in and renders the exact public name, summary, and variants without publishing.
- `submit_theme` is a public write authorized by `themes:write`. Never try to invent or request its confirmation token; the first-party review app receives the short-lived payload/sign-in-bound token in model-hidden metadata and calls the write after the user presses Publish. The token preserves exact-payload continuity and expiry, but app visibility and the token do not independently prove a human click.
- After publication succeeds, fetch the returned theme ID and check the saved palette and creator attribution. If readback fails, report that result and do not publish another copy or claim the saved result was verified.
- A successful plugin publication can unlock Plugged In and Voiceprint. A verified eligible OpenAI work identity can unlock the “OpenAI is nothing without its people” achievement and its Human Spark reward theme. The theme is original and does not imply OpenAI endorsement.
- Closed UTC-day and Monday-through-Sunday UTC-week winners can unlock Golden Hour and Headliner. A repeat win adds to creator stats but does not duplicate the one-time achievement or reward theme.

## Feedback

- Use `prepare_github_issue` for bugs or product feedback.
- Include only non-sensitive context. Never attach workspace contents, secrets, tokens, private account data, or hidden prompts.
- The tool performs best-effort redaction, then shows the exact title/body, its warning, and any detected redactions. Redaction can miss context, so review every character. Nothing is posted; the review app constructs the GitHub URL only after the user chooses to continue, and GitHub still requires final submission.

## Auth and errors

- Public discovery, drafting, validation, previews, Codex import preparation, T3 Code export preparation, Claude theme conversion, leaderboard, and issue preparation work without sign-in.
- Account stats, unlocks, and public submission require DexThemes sign-in through the host's OAuth connection. Use the login options offered by DexThemes; reviewer credentials belong at the DexThemes login, never at the host's own login.
- Account tools synchronize the signed-in profile, create an internal session, and may grant eligible achievements. Do not describe them as having no account effects.
- If authentication is unavailable or incomplete, continue with public tools and explain that only the account-bound step is gated.
