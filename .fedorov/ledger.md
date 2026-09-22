# FEDOROV Defect Ledger

| Date | Title | Category | Persona | Status |
|------|-------|----------|---------|--------|
| 2026-09-22 | FEDOROV_AI Arch-Chronologer lore persona | build-config | other | Active |
| 2026-09-22 | Genre clash accents (complementary opposite colors) | ui-theming | frontend | Active |
| 2026-09-20 | Prompt Book Cursor rules alongside FEDOROV | build-config | devops | Active |
| 2026-09-14 | Genres shared one dossier grid (palette-only) | ui-theming | frontend | Active |
| 2026-09-14 | Dead Clerk middleware + orphan approval UI | build-config | frontend | Active |
| 2026-09-14 | Live portrait silent fallback (quota limit 0) | provider-integration | integration | Active |
| 2026-09-14 | HP/resource +/- stale-closure under rapid clicks | ui-state | frontend | Active |
| 2026-09-13 | Dossier page atmospheric backgrounds | ui-theming | frontend | Active |
| 2026-09-14 | Lore/Stats blend presence too quiet | ui-theming | frontend | Active |

## [2026-09-22] FEDOROV_AI Arch-Chronologer lore persona
- Category: build-config
- Persona: other (FEDOROV_AI)
- File(s): .cursor/rules/fedorov-ai-arch-chronologer.mdc, src/lib/prompts/archChronologer.ts, src/lib/prompts/generators.ts, AGENTS.md, .cursor/rules/README.md
- Root Cause: No first-class FEDOROV creative AI module for lore/character architecture; Arch-Chronologer persona lived only as an external upload.
- Patch: Add scoped Cursor rule (not alwaysApply) with full Five-Fold Blueprint + coexistence; runtime `archChronologer.ts` composed into missing-field generators; docs + Vitest export/schema guards. FEDOROV engineering `fedorov-*.mdc` substance unchanged.
- Red Test: No `fedorov-ai-arch-chronologer.mdc`; lore prompts lacked Arch-Chronologer preamble / Five-Fold anchors.
- Green Test: `npm test` asserts exports + five-fold sections + lore prompt preamble; `npm run lint` clean.
- Regression Guard: AGENTS.md + rules README document FEDOROV_AI; unit test on `archChronologer.ts` exports.
- Residual Risk: `**/*character*` / `**/*lore*` globs may attach on type files; coexistence block defers engineering authority.
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
