# Open Source Readiness

This is the staged plan for turning DexThemes from a fast-moving product repo into a contributor-friendly open source project.

## Milestone 1: Readability and Safety Rails

Goals:

- make the codebase understandable in one sitting
- make contributor setup predictable
- add cheap checks for the product contracts that regress most easily

Scope:

- architecture documentation
- contributor guide and setup docs
- canonical API/public-surface documentation
- lightweight tests for pure contracts
- validation command for docs + build + tests

## Milestone 2: Architecture Cleanup

Continue carving responsibilities out of the remaining hotspots:

- `src/api.js`
- `convex/http.ts`
- inline/delegated interaction wiring
- `styles/index.css` ownership and domain boundaries

Rules:

- separate state/model from rendering
- separate rendering from side effects
- prefer extracting pure helper modules before touching DOM-heavy code

## Milestone 3: Contributor Depth

Potential follow-ups once the repo is public:

- broaden automated tests around unlocks, mobile transitions, and webhook flows
- add visual regression or smoke checks for major UI contracts
- tighten any remaining naming inconsistencies and dead paths

## Dependency Note

DexThemes is intentionally built on top of Codex import and settings behavior that this repo does not control.

That is acceptable for the project thesis, but contributors should understand the tradeoff clearly:

- theme import strings are shaped for Codex compatibility, not an independent DexThemes theme runtime
- some UX affordances, such as opening Codex Settings, depend on external app behavior staying stable
- upstream Codex changes can break handoff flows, import assumptions, or theme compatibility without any change in this repo

This is a product constraint, not a bug in the architecture. The repo should stay honest about it in docs and code review.

## Performance Follow-up

This is intentionally a separate track from OSS readiness.

Remaining worthwhile work:

- deeper desktop-side chunk consolidation
- deferring more of the sidebar tree on first load
- re-measuring startup after those changes

This work should happen after the repo is legible, not before.

## Contributor-Readiness Checklist

- [x] architecture doc exists
- [x] contributor guide reflects the real build/dev flow
- [x] docs point at the current module structure
- [x] public API guidance is explicit about website vs direct Convex routes
- [x] validation command exists
- [x] stable pure contracts have tests
- [x] `state.js` ownership is split behind a compatibility barrel
- [ ] larger frontend orchestration files are further reduced
- [x] Convex HTTP surface is split into smaller route domains
- [x] delegated `data-action` handling covers the shell, sidebar, preview shell, builder, auth, leaderboard, preview chat, and compact browse flows
- [x] browser smoke coverage exists for the main desktop and compact/mobile flows
- [x] stylesheet ownership is split into domain files behind a manifest `styles/index.css`
