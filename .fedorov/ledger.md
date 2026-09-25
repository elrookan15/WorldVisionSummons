# FEDOROV Defect Ledger

| Date | Title | Category | Persona | Status |
|------|-------|----------|---------|--------|
| 2026-09-25 | MotifPalette missing bg/bg2 after elevation | typing | frontend | Active |
| 2026-09-25 | Unauthenticated Gemini proxy routes | security | security | Active |
| 2026-09-24 | Review and locked Codex shared one mutable screen | ui-theming | frontend | Active |
| 2026-09-24 | Saved plate style overrode the parchment genre default | ui-theming | frontend | Active |
| 2026-09-24 | Codex plate zones and PNG export diverged from the integration contract | ui-theming | frontend | Active |
| 2026-09-24 | Codex finalizer page was a dashboard, not a plate | ui-theming | frontend | Active |
| 2026-09-22 | Character Codex + dice tray missing on main | ui-state | frontend | Active |
| 2026-09-22 | Genre page backgrounds lack style motif props | ui-theming | frontend | Active |
| 2026-09-22 | FEDOROV_AI Arch-Chronologer lore persona | build-config | other | Active |
| 2026-09-22 | Genre clash accents (complementary opposite colors) | ui-theming | frontend | Active |
| 2026-09-20 | Prompt Book Cursor rules alongside FEDOROV | build-config | devops | Active |
| 2026-09-14 | Genres shared one dossier grid (palette-only) | ui-theming | frontend | Active |
| 2026-09-14 | Dead Clerk middleware + orphan approval UI | build-config | frontend | Active |
| 2026-09-14 | Live portrait silent fallback (quota limit 0) | provider-integration | integration | Active |
| 2026-09-14 | HP/resource +/- stale-closure under rapid clicks | ui-state | frontend | Active |
| 2026-09-13 | Dossier page atmospheric backgrounds | ui-theming | frontend | Active |
| 2026-09-14 | Lore/Stats blend presence too quiet | ui-theming | frontend | Active |

## [2026-09-25] MotifPalette missing bg/bg2 after elevation
- Category: typing
- Persona: frontend
- File(s): src/lib/sheetGenreMotifs.ts
- Root Cause: Motif elevation (#18) used `p.bg` / `p.bg2` in SVG drawers while `MotifPalette` only declared accent/accent2/clash; runtime passed full `BgPalette` so UI worked and `tsc` failed.
- Patch: Extend `MotifPalette` with `bg` + `bg2` (exported; matches BgPalette plate colors).
- Red Test: `npm run lint` → TS2339 ×7 on sheetGenreMotifs.ts
- Green Test: `npm run lint` clean; motif Vitest cases still pass
- Regression Guard: CI workflow runs `npm run lint` on PRs
- Residual Risk: MotifPalette and BgPalette remain duplicate shapes (no shared import to avoid cycles)
- Recurrence Count: 1
- Status: Active

## [2026-09-25] Unauthenticated Gemini proxy routes
- Category: security
- Persona: security
- File(s): src/lib/apiAuth.ts, src/lib/apiClientHeaders.ts, server.ts, .env.example, README.md, src/App.tsx, GeminiChatModal, NanoBanana providers
- Root Cause: Express Gemini routes had no requester auth; production deploy would expose billed Gemini traffic.
- Patch: `evaluateApiAuth` / `requireWvsApiAuth` — optional `WVS_API_SECRET`; open in non-prod when unset; 403 fail-closed in production when unset; header `X-WVS-API-Key` (or Bearer) when set. Client sends via `VITE_WVS_API_SECRET`.
- Red Test: production + unset secret → 403; set secret + missing header → 401
- Green Test: `src/__tests__/apiAuth.test.ts`; authorized header → ok
- Regression Guard: Vitest apiAuth suite + health `apiAuth.gateMode`
- Residual Risk: `VITE_*` secret is client-visible (deploy gate, not OAuth); NanoBanana `Authorization` Bearer may overwrite Bearer path when `VITE_NANO_BANANA_API_KEY` set — `X-WVS-API-Key` remains authoritative
- Recurrence Count: 1
- Status: Active

## [2026-09-24] Review and locked Codex shared one mutable screen
- Category: ui-theming
- Persona: frontend
- File(s): src/components/CodexPage.tsx, src/components/CodexFinalizer.tsx, src/lib/codex/styles/, src/App.tsx, src/__tests__/codexFinalizer.test.tsx
- Root Cause: Style picking, the plate, and the locked export chrome were one component, and older revisions could not be reopened. Style tokens lived in a single table.
- Patch: CodexPage renders a snapshot only. The style picker hides after Lock. A revision select reloads stored snapshots for the same source key without rewriting them. Seventeen style files carry border, callout medium, and footer device. Finalize Codex is disabled until name and class are present.
- Red Test: No revision select; minting a second snapshot could have been untested against the first hash.
- Green Test: `npm test` 40 passed. Browser: picker gone after lock, badge “Revision 3 · finalized 2026-09-24”, Export PNG enabled.
- Regression Guard: `mints the next revision without rewriting the previous character` and the six-callout / long-name case.
- Residual Risk: The review chrome still lives in CodexFinalizer rather than a separate modal file. Server snapshot storage is still in-memory.
- Recurrence Count: 1
- Status: Active

## [2026-09-24] Saved plate style overrode the parchment genre default
- Category: ui-theming
- Persona: frontend
- File(s): src/components/CodexFinalizer.tsx, src/codex-finalizer.css, src/lib/codex/finalizer.ts, src/lib/codexSnapshot.ts
- Root Cause: `resolvePlateStyle` restored a previous localStorage skin, so Gothic Gelbinor opened as a light plate instead of Illuminated Parchment. The crest had also left the title cartouche.
- Patch: Review opens from `defaultCodexStyleForGenre` and a frozen draft snapshot. Illuminated Parchment uses a dark mottled ground and a double gold rule. The shield crest sits at the top left again; the bottom strip still has a heraldry panel.
- Red Test: A stored plate snapshot could select a non-genre skin before Lock.
- Green Test: Browser colophon reads Illuminated Parchment; dark ground; top-left crest; gold double frame. `npm test` 37 passed.
- Regression Guard: Gothic sheet test still expects `data-codex-style="illuminated-parchment"`.
- Residual Risk: After Lock, style is baked. A new review of the same character starts at the genre default again, not the last locked skin.
- Recurrence Count: 1
- Status: Active

## [2026-09-24] Codex plate zones and PNG export diverged from the integration contract
- Category: ui-theming
- Persona: frontend
- File(s): src/components/CodexFinalizer.tsx, src/codex-finalizer.css, src/lib/codexRaster.ts, src/__tests__/codexFinalizer.test.tsx
- Root Cause: Bonds sat in the bottom strip and the crest sat in the title, so zone D/E did not match the integration brief. Export offered JSON and print only. A style click after lock minted a revision immediately.
- Patch: Bonds render inside the lore column. Heraldry is a bottom-strip panel with the sigil fallback. PNG rasterizes the same plate DOM at 300 DPI (A4 2480×3508, US Letter 2550×3300). Style or page-size changes after lock stay a preview until Mint revision.
- Red Test: Filled markup put “The grave choir” in the bottom strip and had no Export PNG control.
- Green Test: `npm test` 37 passed; lore slice contains bonds; bottom slice contains heraldry and omits the ally line; `codexPngPixels` matches 300 DPI.
- Regression Guard: `renders live sheet zones for a filled character` and `sizes the shared plate raster at 300 DPI`.
- Residual Risk: PNG depends on `html-to-image` foreignObject capture; cross-origin portraits can fail and the UI falls back to Print PDF. Vignettes remain ink sigils tinted by the style, not painted plates.
- Recurrence Count: 1
- Status: Active

## [2026-09-24] Codex finalizer page was a dashboard, not a plate
- Category: ui-theming
- Persona: frontend
- File(s): src/components/CodexFinalizer.tsx, src/codex-finalizer.css, src/lib/codexPageModel.ts, src/App.tsx
- Root Cause: The live dossier is an editable multi-section web sheet. There was no single print plate with parchment, border, central portrait, and annotated equipment callouts.
- Patch: One A4 Codex page bound to UiSheetData. Empty fields collapse. Missing portrait renders a framed sigil. Header control opens it; print uses A4 @page.
- Red Test: No `data-codex-page` markup; empty equipment still had no omission rule.
- Green Test: `src/__tests__/codexFinalizer.test.tsx` — empty sheet omits panels; filled Gelbinor renders weapon, quote, combat, live portrait.
- Regression Guard: `codex finalizer page` vitest cases.
- Residual Risk: Item vignettes are ink drawings, not per-item AI plates. Browser print is the 300 DPI path (vector/text), not a rasterized PNG export.
- Recurrence Count: 1
- Status: Active

## [2026-09-22] Character Codex + dice tray missing on main
- Category: ui-state
- Persona: frontend
- File(s): src/lib/characterCodex.ts, src/lib/dice.ts, src/components/CharacterCodex.tsx, src/components/DiceTray.tsx, src/App.tsx, src/lib/prompts/generators.ts, src/__tests__/codex-and-dice.test.ts
- Root Cause: PR #7 shipped Codex roster + dice tray against a stale base (pre genre chrome / Arch-Chronologer / motifs). Features never landed on current `main`; portrait prompts still ignored `equipment.primaryWeapon`.
- Patch: Reimplement Codex (`localStorage` save/load/duplicate/delete) and polyhedral/ability/initiative dice tray on current `main` using `UiSheetData` (no parallel dossier type fork). Header controls + clash-accent chrome. Ground `compilePortraitPrompt` in live equipment. Surface summon failures on the status banner. Supersedes PR #7.
- Red Test: No Codex/dice modules on `main`; portrait prompt fell through to “Obsidian Catalyst Staff” when only `equipment.primaryWeapon` was set.
- Green Test: Vitest Codex persistence + dice modifier/advantage math + equipment-grounded portrait; `npm test` + `npm run lint`.
- Regression Guard: `src/__tests__/codex-and-dice.test.ts`.
- Residual Risk: Codex stores full sheets in `localStorage` (quota may drop data-URL portraits); dice tray is client-only RNG, not seeded campaign logs.
- Recurrence Count: 1
- Status: Active

## [2026-09-22] Genre page backgrounds lack style motif props
- Category: ui-theming
- Persona: frontend
- File(s): src/lib/sheetGenreMotifs.ts, src/lib/sheetPageBackgrounds.ts, src/__tests__/summons.test.ts
- Root Cause: Page atmospheres were abstract ornaments only — no recognizable genre props — so Cyberpunk/map themes didn’t read as “skateboard / cyborg / laptop” or “sword / chest / ship.” PR #13 landed on a side branch and never reached `main`.
- Patch: Three local SVG motifs per genre scattered across every dossier page plate (positions nudged per page); Physical quieter; Post-Apocalyptic uses pirate treasure-map set; Cyberpunk uses laser-skateboard, cyborg, futuristic-laptop. Re-applied onto current `main` (clash + blend preserved).
- Red Test: Page SVGs had no `data-motif` markers for those props.
- Green Test: Vitest asserts 3 motifs × 10 themes × 8 pages + explicit Cyberpunk/pirate examples.
- Regression Guard: `should scatter three style-specific image motifs across every genre page background`.
- Residual Risk: Motifs are illustrative SVG line-art, not photographic props; opacity may need eye-tune on bright themes (Steampunk/Post-Apoc).
- Recurrence Count: 1
- Status: Active

## [2026-09-22] FEDOROV_AI Arch-Chronologer lore persona
- Category: build-config
- Persona: other (FEDOROV_AI)
- File(s): .cursor/rules/fedorov-ai-arch-chronologer.mdc, src/lib/prompts/archChronologer.ts, src/lib/prompts/generators.ts, AGENTS.md, .cursor/rules/README.md
- Root Cause: No first-class FEDOROV creative AI module for lore/character architecture; Arch-Chronologer persona lived only as an external upload.
- Patch: Add scoped Cursor rule (not alwaysApply) with full Five-Fold Blueprint + coexistence; runtime `archChronologer.ts` composed into missing-field generators; docs + Vitest export/schema guards. FEDOROV engineering `fedorov-*.mdc` substance unchanged.
- Red Test: No `fedorov-ai-arch-chronologer.mdc`; lore prompts lacked Arch-Chronologer preamble / Five-Fold anchors.
- Green Test: `npm test` asserts exports + five-fold sections + lore prompt preamble; `npm run lint` clean.
- Regression Guard: AGENTS.md + rules README document FEDOROV_AI; unit test on `archChronologer.ts` exports.
- Residual Risk: `**/*character*` / `**/*lore*` globs may attach on type files; coexistence block defers engineering authority. `/api/generate-sheet` now binds `archChronologerSheetSystemInstruction`; portrait/image prompts still use atmospheric matrices only (not full Vaelith system prompt).
- Recurrence Count: 1
- Status: Active

## [2026-09-22] Genre clash accents (complementary opposite colors)
- Category: ui-theming
- Persona: frontend
- File(s): src/App.tsx, src/sheet-themes.css, src/lib/sheetPageBackgrounds.ts, src/__tests__/summons.test.ts
- Root Cause: Each genre palette stayed within one temperature family (rust-on-parchment, brass-on-cream, blood-on-charcoal), so sheets never got a true complementary spark.
- Patch: Add `clash` / `clashText` tokens per theme (e.g. Post-Apocalyptic lime `#a3e635`, Steampunk turquoise `#14b8a6`); inject `--wv-clash`; use on section badges, lore kickers, ability rails, focus rings, theme chip swatches, and a subtle SVG spark in page atmospheres.
- Red Test: Themes had only accent/accent2 harmony colors; no opposite token in App or backgrounds.
- Green Test: Vitest asserts each theme's clash hex + `data-clash-spark` in page SVGs.
- Regression Guard: `should give every genre a complementary clash accent opposite its primary palette`.
- Residual Risk: Clash is intentionally loud on badges — if it fights readability on a specific theme, dial opacity not the hue.
- Recurrence Count: 1
- Status: Active

## [2026-09-20] Prompt Book Cursor rules alongside FEDOROV
- Category: build-config
- Persona: devops
- File(s): .cursor/rules/c-traces-goal.mdc, .cursor/rules/persona-*.mdc, AGENTS.md, .cursor/rules/README.md
- Root Cause: Repo had FEDOROV spine only; Prompt Book v2.0 C-TRACES-GOAL OS and stack-mapped personas were not installed as Cursor rules.
- Patch: Add complementary alwaysApply C-TRACES-GOAL + lean personas (Neon Blue, Jade Teal, Crimson Red, Ash Gray, Glowing Emerald, Rust Copper) adapted for React/Vite/Express; brief coexistence docs. FEDOROV untouched.
- Red Test: N/A (markdown rules); asserted FEDOROV files still present with prior content.
- Green Test: `npm test` + `npm run lint` still pass; FEDOROV `fedorov-*.mdc` unchanged.
- Regression Guard: AGENTS.md + rules README document coexistence; do not gut FEDOROV when editing Prompt Book rules.
- Residual Risk: Description-only personas (Crimson) rely on AI relevance; operators may still invoke skipped book personas ad hoc.
- Recurrence Count: 1
- Status: Active

## [2026-09-14] Genres shared one dossier grid (palette-only)
- Category: ui-theming
- Persona: frontend
- File(s): src/sheet-themes.css, src/__tests__/summons.test.ts
- Root Cause: Genre chrome changed frames/borders/atmosphere but Overview→Stats kept one shared CSS grid, so themes felt like recolors of the same document.
- Patch: Per-theme structural layout tokens (`--sheet-layout`) and grid overrides (manuscript, HUD, blueprint, cartridge, triptych, non-Euclidean, kakemono, scrap board, crystal lattice, broadsheet).
- Red Test: Ten themes resolving to the same default mosaic/hero/lore grids.
- Green Test: Vitest asserts unique `--sheet-layout` token per `SHEET_THEME_IDS` entry.
- Regression Guard: `should give every genre a distinct structural sheet layout token`.
- Residual Risk: High-Fantasy `display:contents` triptych depends on trait chip DOM order; mobile collapses to single column.
- Recurrence Count: 1
- Status: Active

## [2026-09-14] Dead Clerk middleware + orphan approval UI
- Category: build-config
- Persona: frontend
- File(s): middleware.ts (deleted), src/components/CharacterSheetApproval.tsx (deleted)
- Root Cause: Next.js/Clerk middleware and unwired approval modal remained in a Vite+Express app, breaking `tsc --noEmit` and implying auth routes that do not exist.
- Patch: Delete both orphans; add `.cursor/environment.json`, expand `.gitignore`, document Gemini image billing in `.env.example`.
- Red Test: `npm run lint` failed on missing `@clerk/nextjs/server` / `next/server`.
- Green Test: `npm run lint` clean; no imports reference deleted modules.
- Regression Guard: Lint in CI/dev; ledger entry.
- Residual Risk: If product later needs OAuth approval flow, rebuild against Express routes — do not resurrect Next middleware.
- Recurrence Count: 1
- Status: Active

## [2026-09-14] Live portrait silent fallback (quota limit 0)
- Category: provider-integration
- Persona: integration
- File(s): server.ts, src/lib/geminiImageErrors.ts, src/lib/providers/NanoBananaProvider.ts, src/App.tsx
- Root Cause: `/api/generate-image` swallowed Gemini 429 RESOURCE_EXHAUSTED (free-tier `limit: 0` on image models) and returned a procedural SVG without `error`, so the UI treated the dossier plate as a successful live portrait. Imagen retries also ran against AI Studio keys (Vertex-only) and wasted latency.
- Patch: Classify image failures; short-circuit on billing/auth; skip Imagen unless Vertex project env set; return `fallback` + structured `error`; provider + App surface message under the portrait.
- Red Test: Live `/api/generate-image` returned Procedural Codex with no error field while Gemini image models returned limit:0.
- Green Test: Vitest `geminiImageErrors.test.ts`; API response includes `error.code=BILLING_REQUIRED` and `fallback:true`.
- Regression Guard: Unit tests for quota-zero / retryable quota / vertex-only / auth classifiers; health lists Nano Banana model cascade.
- Residual Risk: Live raster still requires billed Gemini image quota — no code path can mint Nano Banana pixels on free-tier limit 0.
- Recurrence Count: 1
- Status: Active

## [2026-09-14] HP/resource +/- stale-closure under rapid clicks
- Category: ui-state
- Persona: frontend
- File(s): src/App.tsx
- Root Cause: HP and class-resource buttons read `sheetData` from the render closure, so burst clicks all applied against the same stale current value (only ±1 landed).
- Patch: `adjustDerivedResource` uses functional `setSheetData` so each click chains off latest state; clamps still via `clampResource`.
- Red Test: Five rapid `-` clicks left HP at 73 instead of 69.
- Green Test: Puppeteer burst → HP 74→69→0→74; Quiet Solace 6→3→0→6.
- Regression Guard: Existing `clampResource` unit tests; core-feature browser matrix.
- Residual Risk: Other delta widgets using closed-over state could share the pattern (none found for combat orbs).
- Recurrence Count: 1
- Status: Active

## [2026-09-14] Lore/Stats blend presence too quiet
- Category: ui-theming
- Persona: frontend
- File(s): src/sheet-themes.css, src/lib/sheetPageBackgrounds.ts, src/__tests__/summons.test.ts
- Root Cause: Global genre opacity overrides (esp. Cyberpunk/8-Bit `screen` at 0.18) suppressed Lore/Stats plates; ornament/vignette opacities were also too soft for manuscript + HUD pages.
- Patch: Raise `--page-bg-opacity` only for `.sheet-page--lore` / `--stats` (incl. genre overrides); strengthen lore/stats SVG composition + vignette; leave Physical/other pages unchanged.
- Red Test: `sheetPageBackgroundOpacity("lore"|"stats") < 0.45` or Cyberpunk lore inheriting 0.18.
- Green Test: Opacity helpers ≥0.45 for lore/stats, ≤0.16 for physical; louder vignette stop-opacity on lore/stats SVGs only.
- Regression Guard: Vitest assertions on opacity helper + vignette stop-opacity split by page.
- Residual Risk: Louder lore/stats may still feel soft on washed-out monitors; wallpaper risk if opacity pushed further without mask.
- Recurrence Count: 1 (related to 2026-09-13 blend entry)
- Status: Active

## [2026-09-13] Dossier page atmospheric backgrounds
- Category: ui-theming
- Persona: frontend
- File(s): src/lib/sheetPageBackgrounds.ts, src/sheet-themes.css, src/App.tsx, src/__tests__/summons.test.ts
- Root Cause: Genre sheets had chrome/layout differentiation but dossier pages lacked per-page atmospheric plates, so scrolling felt like the same surface with section headers.
- Patch: Procedural local SVG atmospheres (8 pages × 10 genres) injected as CSS vars; `.sheet-page::before` soft-light/screen/multiply blend + dual mask fade so plates dissolve into theme colors.
- Red Test: Asserting page backgrounds would fail — no `--sheet-bg-*` vars, no `data-page-bg` SVG markers.
- Green Test: `npm test` — new case covers all page×genre SVG data URLs, no Unsplash/http, distinct artifact+metaphor markers.
- Regression Guard: Vitest matrix over SHEET_PAGE_IDS × SHEET_THEME_IDS; print CSS hides `::before`.
- Residual Risk: Blend opacity is eye-tuned; extreme custom theme colors could shift perceived contrast on non-card text.
- Recurrence Count: 2
- Status: Active
