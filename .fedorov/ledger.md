# FEDOROV Defect Ledger

| Date | Title | Category | Persona | Status |
|------|-------|----------|---------|--------|
| 2026-09-13 | Dossier page atmospheric backgrounds | ui-theming | frontend | Active |

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
- Recurrence Count: 1
- Status: Active
