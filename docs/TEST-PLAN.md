# DexThemes — Exhaustive Test Plan

Use this checklist to verify all features are working correctly. Tests are grouped by feature area. Each test includes steps and expected outcome.

---

## 1. Theme Import (Critical Path — Primary KPI)

### 1.1 DexThemes dark theme imports into Codex
- [ ] Browse to any DexThemes theme (e.g., Terminator Future War)
- [ ] Select dark variant
- [ ] Click "Copy theme" button
- [ ] **Expected**: Button confirms "Theme copied to clipboard"
- [ ] Open Codex → Settings → Appearance → Import Dark Theme
- [ ] Paste the copied string
- [ ] **Expected**: Import button is active (not grayed out), theme applies successfully

### 1.2 DexThemes light theme imports into Codex
- [ ] Select a theme with a light variant
- [ ] Switch to light variant
- [ ] Click "Copy theme"
- [ ] Open Codex → Settings → Appearance → Import Light Theme
- [ ] Paste the copied string
- [ ] **Expected**: Import button is active, theme applies

### 1.3 Cross-variant rejection
- [ ] Copy a dark theme code from DexThemes
- [ ] Try to paste it into Codex's Light theme Import field
- [ ] **Expected**: Import button stays grayed out (Codex rejects variant mismatch)

### 1.4 Official Codex theme import
- [ ] Select an official theme (e.g., Codex, Dracula, Nord)
- [ ] Click "Copy theme"
- [ ] Paste into Codex Import
- [ ] **Expected**: Works correctly

### 1.5 DeepSeek Harness theme application

- [ ] Open a theme that includes both light and dark palettes
- [ ] Confirm **Apply to DeepSeek** is enabled only when the DexThemes Cordis integration has connected the Harness theme service
- [ ] Click **Apply to DeepSeek** once
- [ ] **Expected**: the running Harness UI updates immediately through `theme.overrideTokens`; no clipboard or import instructions appear
- [ ] Stop the DexThemes Cordis Plugin
- [ ] **Expected**: the override layer is removed and the previous Harness palette returns
- [ ] Open a single-variant theme
- [ ] **Expected**: no DeepSeek apply action is offered

### 1.6 DeepSeek Harness agent tools and privacy

- [ ] Confirm the installed bundle contains a second `@deepseek-ai/dsh-mcp-client` row targeting only `/api/deepseek-mcp`
- [ ] Confirm Harness lists the eight `mcp__dexthemes__*` public tools and no Codex apply, account, submission, publishing, or feedback tools
- [ ] Ask “Color me lucky,” validate the returned paired draft, and prepare it for DeepSeek
- [ ] Confirm the tool result text contains the complete bounded JSON needed for the next call
- [ ] Confirm calls send only explicit tool arguments—not transcript, workspace paths, credentials, or account identity
- [ ] Preview, apply, and revert once, then confirm Statsig metadata contains only the event/source/theme/variant/plugin-version/failure-code allowlist
- [ ] Confirm every platform event includes platform, source surface, plugin version, theme ID/variant when applicable, event-derived action, and attempted/succeeded/failed outcome
- [ ] Confirm Standard mode can discover, draft, validate, preview, and prepare, while Creator mode additionally completes explicit `cordis_define` → approved `cordis_run` → `cordis_stop`
- [ ] **Expected**: no install event or `harness_version` is fabricated, and no account achievement is granted without OAuth

### 1.7 DeepSeek Harness optional account flow

- [ ] Configure the shared **DexThemes Connect** GitHub OAuth application with **Enable Device Flow**, then set its `DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_ID` and `DEXTHEMES_DEEPSEEK_GITHUB_CLIENT_SECRET` in Convex
- [ ] In **Settings → Plugins → DexThemes**, choose **Connect DexThemes**
- [ ] **Expected**: the plugin shows a bounded user code, **Copy code**, and the exact `https://github.com/login/device` link; copying transfers the complete code, reports success or a bounded failure, and does not put it in a URL, analytics, storage, or configuration
- [ ] Complete GitHub authorization and return to Harness
- [ ] **Expected**: creator stats, `Harnessed`, and `Deep Current` appear after Convex verifies Device Flow identity and revokes GitHub's temporary token; neither that GitHub token nor the short-lived DexThemes session appears in browser storage, URL, Harness configuration, prompts, workspace, or analytics
- [ ] Apply a theme while connected
- [ ] **Expected**: the account panel advances from recording to acknowledgement; the dedicated `harness:use` scope sends only a random receipt and bounded plugin version; Connected Apps labels the deduped activity client-reported, and the route cannot grant an entitlement
- [ ] Repeat with the first activity response blocked after request dispatch, then choose **Retry activity**
- [ ] **Expected**: the panel exposes a bounded failure, retry sends the same UUID rather than fabricating a second activity, and a replay acknowledgement clears the failure
- [ ] Sign into `www.dexthemes.com` with the same GitHub identity and open the account profile
- [ ] **Expected**: Connected Apps shows DexThemes Connect, DeepSeek Harness, the reported plugin version, last used, and the client-reported activity count; no token, prompt, workspace, theme payload, or Statsig identity is present
- [ ] Choose **Disconnect** on the website, then retry an authenticated plugin account request
- [ ] **Expected**: only DeepSeek client sessions are revoked, the app leaves the active Connected Apps list, and website GitHub OAuth, API keys, MCP OAuth/Auth0, and Codex behavior remain unchanged
- [ ] Disconnect and refresh
- [ ] **Expected**: Convex acknowledges revocation before the plugin persists disconnected state; a 429/5xx or `{ revoked: false }` keeps the session connected with a retryable error, while successful disconnect removes the credential and account-only reward from the running client and anonymous browse/apply still work
- [ ] Use an existing account that has never completed DexThemes Connect Device Flow
- [ ] **Expected**: Connected Apps is empty; achievements, Statsig activity, and historical account age do not fabricate a row

### 1.7.1 DeepSeek Harness full restart and unavailable capability

The public-registry `0.6.2` receipt proves fresh exact-package installation, loaded bundle identity, Apply, full process restart with restoration on DexThemes-surface remount, Revert, 100-theme offline fallback, and retryable controlled Disconnect failure. A later production-auth receipt proves fresh Device Flow, account data loading, connected Apply/Revert, connection-preserving remount, and safe Disconnect. It does not prove a newly awarded `Harnessed` / `Deep Current` result because that reward was pre-existing, and two connected Applies produced no observable activity request. The reviewed `0.6.3` publication candidate must be rebuilt from merged source, installed from the registry artifact, and observed sending and acknowledging `/plugin/deepseek-harness/use` before connected activity is promoted to loaded proof. See [the original runtime receipt](DEEPSEEK-HARNESS-062-RUNTIME-RECEIPT.md) and [the production-auth receipt](DEEPSEEK-HARNESS-062-PRODUCTION-AUTH-RECEIPT.md).

- [ ] Start from a fresh isolated Harness home/profile and install the current published npm package; record the resolved version and integrity separately from candidate proof
- [ ] Upgrade that isolated profile to the candidate tarball/local package, open **Settings → Plugins → DexThemes**, connect through an approved test Device Flow, and Apply a paired theme
- [ ] Quit only the isolated Harness process, relaunch the same profile, and reopen DexThemes
- [ ] **Expected**: no token, prompt, workspace content, palette, or account identifier is persisted; the UI explicitly requests Device Flow reconnect while the validated saved theme restores when its required catalog is available
- [ ] Complete the approved test reconnect when an account-only theme is under test
- [ ] **Expected**: the verified unlock catalog returns and the saved theme restores without a second Apply click
- [ ] Choose **Revert**, then **Disconnect**, quit, and relaunch once more
- [ ] **Expected**: neither theme intent nor reconnect intent returns
- [ ] In a separate isolated profile, omit the Harness theme provider while keeping Settings available
- [ ] **Expected**: the DexThemes tab remains visible, a `role="alert"` explains the missing capability, Preview/account controls work, Apply is disabled, and **Forget saved theme** is safe

### 1.8 Community theme import
- [ ] Select a community-submitted theme
- [ ] Click "Copy theme"
- [ ] Paste into Codex Import
- [ ] **Expected**: Works correctly

### 1.9 Builder-created theme import
- [ ] Open Builder, customize colors
- [ ] Click "Copy theme" from builder
- [ ] Paste into Codex Import
- [ ] **Expected**: Works correctly

### 1.10 Import string format validation
- [ ] Copy any theme code and inspect in a text editor
- [ ] **Expected**: Format is `codex-theme-v1:{"codeThemeId":"codex","theme":{...},"variant":"dark"|"light"}`
- [ ] **Expected**: `codeThemeId` is a simple string (never `"codex-dark"` or object format)
- [ ] **Expected**: `variant` matches the selected variant
- [ ] **Expected**: All color values are valid hex (e.g., `#DC2626`)

### 1.11 Accent color applied correctly
- [ ] Select a theme with multiple accents (e.g., Monokai has 3)
- [ ] Click different accent dots
- [ ] Copy theme code after each accent change
- [ ] **Expected**: The `accent` value in the import string matches the selected accent dot

---

## 2. Theme Browsing & Sidebar

### 2.1 Category expansion/collapse
- [ ] Click each category header (Official, DexThemes, Community)
- [ ] **Expected**: Category expands/collapses, chevron rotates

### 2.2 Subgroup expansion (DexThemes)
- [ ] Expand DexThemes category
- [ ] Click a subgroup (e.g., Anime, Games)
- [ ] **Expected**: Subgroup expands, others collapse (accordion behavior)

### 2.3 Subgroup pinning
- [ ] Double-click a subgroup header
- [ ] **Expected**: Pin icon appears, subgroup stays open when others are clicked
- [ ] Double-click again to unpin

### 2.4 Search
- [ ] Type "termin" in the search bar
- [ ] **Expected**: Only themes matching "termin" appear (e.g., Terminator Future War)
- [ ] Clear search
- [ ] **Expected**: All themes restored

### 2.5 Filter — All themes
- [ ] Click filter dropdown, select "All themes"
- [ ] **Expected**: All themes shown in every category

### 2.6 Filter — Dark only
- [ ] Select "Dark only"
- [ ] **Expected**: Shows all themes that HAVE a dark variant (inclusive, not exclusive)
- [ ] **Expected**: Themes with both dark+light variants should still appear
- [ ] **Expected**: Light-only themes (e.g., Proof, GitHub Light) should NOT appear

### 2.7 Filter — Light only
- [ ] Select "Light only"
- [ ] **Expected**: Shows all themes that HAVE a light variant
- [ ] **Expected**: Dark-only themes should NOT appear

### 2.8 Filter — Both variants
- [ ] Select "Both variants"
- [ ] **Expected**: Only themes with BOTH dark and light variants appear

### 2.9 Sort — Trending
- [ ] Select sort → Trending
- [ ] **Expected**: Themes ordered by copy count (highest first) within each category

### 2.10 Sort — Newest
- [ ] Select sort → Newest
- [ ] **Expected**: Themes ordered by dateAdded (most recent first)

### 2.11 Sort — A-Z / Z-A
- [ ] Test both alphabetical sort options
- [ ] **Expected**: Theme names in correct alphabetical order

### 2.12 Theme count badges
- [ ] Check category count numbers in sidebar
- [ ] **Expected**: Numbers match the actual count of visible themes (respecting active filters)

### 2.13 Active theme highlight
- [ ] Click a theme in sidebar
- [ ] **Expected**: Selected theme has `active` class highlight
- [ ] Select a different theme
- [ ] **Expected**: Previous highlight removed, new one applied

---

## 3. Theme Preview Panel

### 3.1 Preview loads on theme select
- [ ] Click any theme in sidebar
- [ ] **Expected**: Right panel shows theme name, variant cards, accent dots, "Copy theme" button
- [ ] **Expected**: Preview window updates with theme colors

### 3.2 Variant switching
- [ ] Select a theme with both variants
- [ ] Click the light variant card, then dark
- [ ] **Expected**: Preview updates colors, shell background changes, accent dots may update

### 3.3 Accent dot switching
- [ ] Select a theme with multiple accents
- [ ] Click different accent dots
- [ ] **Expected**: Preview accent color changes, shell theme updates

### 3.4 Window controls
- [ ] Click minimize (yellow dot) → window minimizes
- [ ] Click reopen → window restores
- [ ] Click fullscreen (green dot) → window expands
- [ ] Click close (red dot) → window closes with message
- [ ] Click reopen → window restores

### 3.5 Missing variant card (author view)
- [ ] Sign in as the author of a single-variant community theme
- [ ] **Expected**: Shows "Complete the set — Add [variant] Variant" card with CTA

### 3.6 Missing variant card (non-author view)
- [ ] View a single-variant community theme while signed in as a different user
- [ ] **Expected**: Shows "Request [variant] Variant" card
- [ ] Click request
- [ ] **Expected**: Shows "Requested" confirmation, chat message appears

### 3.7 Locked theme display
- [ ] View an unlockable/supporter theme while NOT having it unlocked
- [ ] **Expected**: Lock icon shown in sidebar, unlock prompt shown in preview

---

## 4. Theme Builder

### 4.1 Toggle builder mode
- [ ] Click "Submit a theme" / builder toggle button
- [ ] **Expected**: Right panel switches to builder with color inputs
- [ ] Click back
- [ ] **Expected**: Returns to browse/preview mode

### 4.2 Color inputs
- [ ] Adjust each color: surface, ink, accent, sidebar, codeBg, diffAdded, diffRemoved, skill
- [ ] **Expected**: Preview updates in real-time for each change

### 4.3 Variant selector
- [ ] Switch between dark and light in builder
- [ ] **Expected**: Preview updates, default colors adjust for selected variant

### 4.4 Contrast slider
- [ ] Adjust contrast slider
- [ ] **Expected**: Value updates, preview reflects change

### 4.5 Color Me Lucky
- [ ] Click the three-star (Color Me Lucky) button
- [ ] **Expected**: All colors randomize, preview updates
- [ ] **Expected**: `color_me_lucky` unlock triggers (if signed in)

### 4.6 Reset
- [ ] Customize colors, then click Reset
- [ ] **Expected**: All colors return to defaults

### 4.7 Theme name validation
- [ ] Try to submit/copy with empty name
- [ ] **Expected**: Warning shown, name input focused
- [ ] Enter a valid name
- [ ] **Expected**: Warning clears

### 4.8 Copy theme code from builder
- [ ] Enter a name, customize colors
- [ ] Click "Copy theme" from builder
- [ ] **Expected**: Button confirms "Theme copied to clipboard"
- [ ] **Expected**: Valid `codex-theme-v1:` string copied to clipboard with `codeThemeId: "codex"`

### 4.9 Code of Conduct prompt
- [ ] Sign in (if not already)
- [ ] Open builder for the first time
- [ ] **Expected**: One-time code of conduct prompt appears
- [ ] Dismiss it
- [ ] Close and reopen builder
- [ ] **Expected**: Prompt does NOT appear again

---

## 5. Theme Submission

### 5.1 Submit from builder (requires sign-in)
- [ ] Sign in, open builder, customize a theme, enter a name
- [ ] Click Submit
- [ ] **Expected**: Theme submitted successfully, toast shown, `create_theme` unlock triggers
- [ ] **Expected**: Theme appears in Community category in sidebar

### 5.2 Duplicate name rejection
- [ ] Try to submit with a name that already exists
- [ ] **Expected**: Error toast shown

### 5.3 Protected color rejection
- [ ] Create a theme with colors nearly identical to an unlockable theme
- [ ] **Expected**: Warning/rejection about protected colors

### 5.4 Content moderation
- [ ] Try to submit a theme with an offensive name
- [ ] **Expected**: Rejection with moderation error

### 5.5 Submit JSON modal
- [ ] Click "Submit JSON" option
- [ ] Paste valid theme JSON
- [ ] **Expected**: Theme submitted

### 5.6 Add variant for existing theme
- [ ] As theme author, click "Add [variant]" on a single-variant theme
- [ ] **Expected**: Builder opens pre-filled with theme name (locked) and opposite variant
- [ ] Submit the variant
- [ ] **Expected**: Variant added, `complete_pair` unlock triggers, "Yin & Yang" unlocked toast

---

## 6. Authentication

### 6.1 GitHub sign-in
- [ ] Click Sign In → GitHub
- [ ] **Expected**: Redirects to GitHub OAuth, returns with user logged in
- [ ] **Expected**: Ordinary sign-in requests public-profile access only and does not request email-address permission
- [ ] Select the locked Human Spark theme and choose its email-verification action
- [ ] **Expected**: Only this explicit verification path requests read-only email-address permission
- [ ] **Expected**: `sign_in` unlock triggers

### 6.2 User menu
- [ ] Click user avatar/menu
- [ ] **Expected**: Dropdown with Profile, Achievements, Leaderboard, Logout

### 6.3 Logout
- [ ] Click Logout
- [ ] **Expected**: User signed out, UI reverts to signed-out state

### 6.4 Session persistence
- [ ] Sign in, reload page
- [ ] **Expected**: User remains signed in

---

## 7. Likes

### 7.1 Like requires sign-in
- [ ] Sign out
- [ ] Click Like on any theme
- [ ] **Expected**: Chat prompt appears: "Sign in to like this theme. Sign in with GitHub →"
- [ ] **Expected**: Does NOT auto-redirect to GitHub

### 7.2 Like while signed in
- [ ] Sign in
- [ ] Click Like on a theme
- [ ] **Expected**: Like registers, heart fills/animates, count increments

### 7.3 Unlike / duplicate like prevention
- [ ] Like a theme twice
- [ ] **Expected**: Second click either unlikes or is ignored (no duplicate)

### 7.4 Like unlock
- [ ] Like a theme for the first time
- [ ] **Expected**: `like_theme` unlock triggers → Heartbeat theme unlocked

---

## 8. Sharing

### 8.1 Contextual share and X achievement
- [ ] Open Theme details and click Share theme
- [ ] **Expected**: Native share opens when supported; otherwise the canonical theme-page link is copied
- [ ] Start the explicit Share on X achievement
- [ ] **Expected**: Twitter intent window opens with theme name and vanity URL
- [ ] **Expected**: `share_x` unlock triggers → Mint Condition theme unlocked

### 8.2 Public theme page and OG card render
- [ ] Open a theme URL directly: `https://www.dexthemes.com/codex/dark`
- [ ] **Expected**: A complete server-rendered landing page appears without a meta refresh
- [ ] **Expected**: H1, summary, preview image, palette, import steps, source, and related themes are visible
- [ ] Click Open interactive preview
- [ ] **Expected**: The existing app loads with Codex dark selected
- [ ] Paste URL in Twitter/Slack/Discord
- [ ] **Expected**: Rich preview card shows with theme name, code preview, color palette

### 8.3 Vanity URL routing
- [ ] Visit `https://www.dexthemes.com/chrome-future-hunter/dark`
- [ ] **Expected**: A canonical public page loads
- [ ] Visit an unknown theme or unavailable variant
- [ ] **Expected**: HTTP 404 with a noindex error page

### 8.4 In-app Theme details
- [ ] Click Theme details in the main header
- [ ] **Expected**: The center workspace becomes a complete palette/source/import view without leaving the app
- [ ] Switch theme, variant, and accent
- [ ] **Expected**: Details update in place and protected reward palettes remain hidden
- [ ] Click Chat preview
- [ ] **Expected**: The faux chat workspace returns with the selected theme unchanged

---

## 9. Unlockable Themes

### 9.1 Sign-in unlock
- [ ] Sign in for the first time
- [ ] **Expected**: Toast: "You unlocked Cupid's Code!" — theme appears in Unlockables

### 9.2 Create theme unlock
- [ ] Submit a theme from builder
- [ ] **Expected**: Seraphim unlocked

### 9.3 Share unlock
- [ ] Share a theme on X
- [ ] **Expected**: Mint Condition unlocked

### 9.4 Like unlock
- [ ] Like any theme
- [ ] **Expected**: Heartbeat unlocked

### 9.5 Color Me Lucky unlock
- [ ] Click Color Me Lucky in builder
- [ ] **Expected**: Kaleidoscope unlocked

### 9.6 Complete pair unlock
- [ ] Add the missing variant to a theme you authored
- [ ] **Expected**: Yin & Yang unlocked

### 9.7 Locked theme display
- [ ] View Unlockables category before unlocking any
- [ ] **Expected**: Themes show lock icons, clicking shows unlock prompt

### 9.8 Achievement panel
- [ ] Open Profile/Achievements
- [ ] **Expected**: Shows all 11 actions with locked/unlocked status

---

## 10. Anti-Abuse & Moderation

### 10.1 Flag a theme
- [ ] Sign in (account must be 24h+ old)
- [ ] Click flag/report on a community theme
- [ ] **Expected**: Flag registered, toast shown

### 10.2 Flag caps
- [ ] Flag 3 themes in one day
- [ ] Try to flag a 4th
- [ ] **Expected**: Daily limit message shown

### 10.3 No self-flagging
- [ ] Try to flag your own theme
- [ ] **Expected**: Error: "Cannot flag your own theme"

### 10.4 New account restriction
- [ ] Sign in with a brand new account
- [ ] Try to flag a theme
- [ ] **Expected**: Error: "Account must be at least 24 hours old"

### 10.5 Automated moderation at threshold
- [ ] (Requires admin/test setup) Get a theme to 5 flags
- [ ] **Expected**: System re-runs moderation — if theme name/ID is clean, flags reset to 0; if violation, theme auto-removed

### 10.6 Stat voiding on removal
- [ ] After a theme is removed by moderation
- [ ] **Expected**: That theme's copies are removed from leaderboard totals

---

## 11. Leaderboard

### 11.1 Access leaderboard
- [ ] Sign in → User menu → Leaderboard (or click leaderboard icon)
- [ ] **Expected**: Leaderboard panel opens

### 11.2 Monthly tab
- [ ] Select the current month tab
- [ ] **Expected**: Shows creators ranked by copies this month

### 11.3 All Time tab
- [ ] Select "All Time" tab
- [ ] **Expected**: Shows all-time rankings

### 11.4 Personal monthly rank
- [ ] Sign in as an author with a monthly-ranked theme
- [ ] Open the leaderboard
- [ ] **Expected**: Personal rank appears using the signed-in author account

---

## 12. Theme Flash Prevention

### 12.1 No flash on reload
- [ ] Select a non-default theme (e.g., Dracula)
- [ ] Reload the page
- [ ] **Expected**: Theme loads instantly — no flash of default Codex blue theme

### 12.2 Variant persistence
- [ ] Select a light variant theme
- [ ] Reload
- [ ] **Expected**: Light variant persists, no dark flash

### 12.3 First visit (no cache)
- [ ] Clear site data / local storage
- [ ] Visit site
- [ ] **Expected**: Default Codex theme loads (may have brief flash, acceptable)

---

## 13. Mobile

### 13.1 Mobile layout
- [ ] Open site on mobile or resize browser to < 1024px
- [ ] **Expected**: Bottom navigation appears (Browse, Preview, Create)
- [ ] **Expected**: Sidebar becomes full-screen browse view

### 13.2 Mobile browse
- [ ] Tap Browse
- [ ] **Expected**: Theme cards displayed in grid/list
- [ ] Switch categories
- [ ] **Expected**: Cards update

### 13.3 Mobile search
- [ ] Type in search on mobile
- [ ] **Expected**: Results filter in real-time

### 13.4 Mobile theme select
- [ ] Tap a theme card
- [ ] **Expected**: Switches to Preview tab with theme loaded

### 13.5 Mobile builder
- [ ] Tap Create
- [ ] **Expected**: Builder interface loads with color inputs

### 13.6 Mobile submit
- [ ] Fill in builder on mobile, submit
- [ ] **Expected**: Submission works, toast shown

---

## 14. API

### 14.1 GET /api/themes (public)
- [ ] `curl https://www.dexthemes.com/api/themes`
- [ ] **Expected**: JSON object with `count` and `themes`, covering Codex, DexThemes, and Community categories

### 14.2 GET /themes/likes/counts
- [ ] `curl https://acrobatic-corgi-867.convex.site/themes/likes/counts`
- [ ] **Expected**: JSON object mapping themeId → like count

### 14.3 POST /themes (authenticated)
- [ ] Submit a theme via API with a signed-in browser session or valid `dxt_...` API key
- [ ] **Expected**: Theme created, returns success

### 14.4 Rate limiting
- [ ] Make many rapid requests to a rate-limited endpoint
- [ ] **Expected**: 429 response after limit exceeded

### 14.5 API key authentication
- [ ] Create an API key, use it to access protected endpoints
- [ ] **Expected**: Works with `Authorization: Bearer dxt_...` header

---

## 15. OG Image Cache Warming

### 15.1 Local warm-up script
- [ ] Run `npm run warm-cache`
- [ ] **Expected**: Script fetches all ~200 OG image URLs, shows progress with cache hit/miss status

### 15.2 API warm-up endpoint
- [ ] `curl "https://www.dexthemes.com/api/warm-cache?secret=$WARM_CACHE_SECRET"`
- [ ] **Expected**: JSON response with `warmed`, `failed`, `total` counts when the secret is valid
- [ ] **Expected**: Missing/invalid secret returns an error response and does not warm cache

### 15.3 Verify cached images
- [ ] After warm-up, visit `https://www.dexthemes.com/api/og?theme=codex&variant=dark`
- [ ] **Expected**: Image loads quickly, `x-vercel-cache: HIT` header present

---

## 16. Edge Cases

### 16.1 Theme with no accents array
- [ ] Check that all themes have at least one accent
- [ ] **Expected**: No crashes when rendering accent dots

### 16.2 Very long theme name
- [ ] Submit a theme with a 50+ character name
- [ ] **Expected**: Name truncates gracefully in sidebar, preview, OG card

### 16.3 Special characters in theme name
- [ ] Submit a theme with quotes, ampersands, angle brackets in the name
- [ ] **Expected**: Properly escaped in HTML, no XSS, no broken layout

### 16.4 Empty community themes
- [ ] Check site behavior when no community themes exist
- [ ] **Expected**: Community category shows "No community themes yet" or is hidden

### 16.5 Network failure
- [ ] Disconnect internet, try to like/submit/flag
- [ ] **Expected**: Graceful error handling, no unhandled promise rejections

### 16.6 Concurrent users
- [ ] Two users flag the same theme simultaneously
- [ ] **Expected**: Both flags register, no race condition errors
