# FEDOROV Defect Ledger

| Date | Title | Category | Persona | Status |
|------|-------|----------|---------|--------|
| 2026-09-14 | HP/resource +/- stale-closure under rapid clicks | ui-state | frontend | Active |
| 2026-09-13 | Dossier page atmospheric backgrounds | ui-theming | frontend | Active |
| 2026-09-14 | Lore/Stats blend presence too quiet | ui-theming | frontend | Active |

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
