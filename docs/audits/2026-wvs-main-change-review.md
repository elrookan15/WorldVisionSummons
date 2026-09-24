# WorldVision Summons — Main Branch Engineering Review

**Repo:** [elrookan15/WorldVisionSummons](https://github.com/elrookan15/WorldVisionSummons)  
**Reviewed tip:** `dacf454` — `feat(theming): elevate genre motifs into prominent high-contrast visual props (#18)`  
**Date:** 2026-09-24  
**Scope:** Read-only audit of current `main`. No feature work in this deliverable.  
**Reviewer posture:** FEDOROV-REVIEW (diagnose before rewrite; Blocking vs Nits).

---

## Executive summary

**Verdict:** Main is a coherent React/Vite + Express/Gemini summon sheet product with a strong visual-theming stack (10 genres × 8 dossier pages, clash accents, local SVG atmospheres + motifs) and useful tabletop adjuncts (Codex + dice). Engineering rules (FEDOROV / Prompt Book / Arch-Chronologer) are installed and partially wired. The product surface works without a Gemini key via procedural fallbacks. It is **not** production-hardened: unauthenticated API proxy, a failing typecheck after motif elevation, a 2.5k-line `App.tsx` monolith, dead Next/Prisma/Firebase ballast, and stale open PRs that would regress install/deploy if merged.

**Top 5 findings**

1. **`npm run lint` fails on `main`** — `MotifPalette` in `src/lib/sheetGenreMotifs.ts` lacks `bg` / `bg2` used by PR #18 high-contrast motif fills (7× `TS2339`). Vitest still passes.
2. **Unauthenticated Express Gemini proxy** — `POST /api/generate-sheet`, `/api/generate-image`, `/api/chat` (and `/api/summons/*` aliases) consume `GEMINI_API_KEY` with no auth, rate limit, or origin check (`server.ts`).
3. **Stale open PRs #3 / #4 are hazardous relative to current main** — #3 deletes `bun.lock` and revives PostCSS; #4’s PostCSS delete already landed via #8; `package-lock.json` is gitignored; Cloud Agent env still says `npm install`.
4. **Arch-Chronologer is half-wired** — `archChronologerFieldPreamble` is composed into `generateMissingFieldsPrompts` (`generators.ts`); `ARCH_CHRONOLOGER_SYSTEM_PROMPT` is never used by `server.ts` sheet generation (inline Federov prompt instead).
5. **Dead / dual stacks remain** — `next.config.js`, `next-env.d.ts`, Prisma schema + adapter examples, Firebase `workspaceAuth` / Sheets export sit beside the live Vite+Express path; footer claims “PRISMA PERSISTENCE” while Codex is `localStorage`.

---

## 1. Architecture walk (current main)

```text
Browser (React 19 + Vite 6 + Tailwind 4)
  App.tsx  — themes, summon workflow, sheet pages, Codex, dice, Google Sheets hooks
  components/ — CharacterCodex, DiceTray, GeminiChatModal, ImageEditorModal, StatsRadarComparison
  lib/ — themeMap, sheetMapper, sheetPageBackgrounds, sheetGenreMotifs, characterCodex, dice,
         prompts/{generators,archChronologer,cTracesGoal}, providers/NanoBanana*, geminiImageErrors
        │
        │  fetch JSON / data URLs
        ▼
Express (tsx server.ts :3000)
  Vite middleware (dev) or dist static (prod)
  /api/generate-sheet  → Gemini text JSON or procedural fallback
  /api/generate-image (+ /api/summons/image) → Nano Banana models / Imagen / SVG plate
  /api/chat (+ /api/summons/chat) → C-TRACES persona chat + fallback
  /api/health
        │
        ▼
  GEMINI_API_KEY (server-only)  ·  optional Vertex Imagen env
```

| Layer | Location | Role |
|-------|----------|------|
| Entry UI | `src/main.tsx`, `src/App.tsx` (~2541 lines) | Single-page sheet workshop |
| Sheet CSS | `src/sheet-themes.css`, `src/index.css` | Genre structure (`--sheet-layout`), page atmospheres (`::before` soft-light blend), clash tokens |
| Theme IDs | `src/lib/themeMap.ts`, `THEMES` in `App.tsx` | 10 canonical styles ↔ theme ids + clash/clashText |
| Atmospheres | `src/lib/sheetPageBackgrounds.ts` | Local SVG data-URL backgrounds; `THEME_ARTIFACT`, `PAGE_METAPHOR` |
| Motifs | `src/lib/sheetGenreMotifs.ts` | 3 SVG props per genre; `genreMotifLayer` |
| Prompts | `src/lib/prompts/generators.ts`, `archChronologer.ts`, `cTracesGoal.ts` | Portrait / inventory / missing fields / chat |
| Codex | `src/lib/characterCodex.ts`, `components/CharacterCodex.tsx` | `localStorage` key `worldvision_character_codex` |
| Dice | `src/lib/dice.ts`, `components/DiceTray.tsx` | Polyhedral + ability/initiative checks |
| Server | `server.ts` | Secret isolation for Gemini; image billing classification |
| Cursor rules | `.cursor/rules/fedorov-*.mdc`, `fedorov-ai-arch-chronologer.mdc`, `c-traces-goal.mdc`, `persona-*.mdc` | Engineering + creative AI + Prompt Book |
| Defect ledger | `.fedorov/ledger.md` | Correction history for recent theme/Codex/prompt work |
| Tests | `src/__tests__/{summons,codex-and-dice,archChronologer,geminiImageErrors}.test.ts` | Vitest |

**Not on the live summon path (present but peripheral):** `prisma/schema.prisma`, `src/lib/pipeline/persist-adapter-prisma.ts`, `src/examples/wire-orchestrator-prisma.ts`, `neon.ts`, `next.config.js` / `next-env.d.ts`, Firebase `src/lib/workspaceAuth.ts` + `firebase-applet-config.json` + `src/lib/sheetsService.ts`.

---

## 2. Context claims vs repo (verified)

| Claim | Verdict | Evidence |
|-------|---------|----------|
| Genre sheet chrome / distinct layouts (~PR #6) | **Mostly accurate; completed by #10** | #6 landed per-genre sheet designs; #10 added unique `--sheet-layout` tokens per theme in `sheet-themes.css` and removed Clerk orphans (middleware gone; Next stubs remain). |
| Blended atmospheres; Lore/Stats louder, Physical quieter (~PR #8) | **Accurate** | `sheetPageBackgrounds.ts` + `sheet-themes.css` soft-light `::before`; `sheetPageBackgroundOpacity`: physical `0.35`, lore `0.70`, stats `0.72`; wash opacities 0.42 vs 0.28. |
| Complementary clash / 3-color scheme (~PR #12) | **Accurate** | `clash` / `clashText` on each theme in `App.tsx`; `--wv-clash`; `data-clash-spark` in backgrounds; e.g. post-apoc `#a3e635`, steampunk `#14b8a6`. |
| Three genre motifs (~PR #15 / recovered #13) | **Accurate** | #13 merged to side branch only; #15 re-applied on main; tip #18 elevated contrast. `THEME_MOTIFS` + Vitest motif markers. |
| Prompt Book / FEDOROV rules (~PR #11; FEDOROV earlier #5) | **Accurate** | `c-traces-goal.mdc` + lean `persona-*.mdc`; FEDOROV spine from #5; coexistence in `AGENTS.md`. |
| Arch-Chronologer FEDOROV_AI / Vaelith (~PR #14) | **Accurate with wiring caveat** | Rule + `archChronologer.ts`; preamble in missing-field generators; full system prompt unused by Express sheet gen. |
| Character Codex + dice (~PR #16, superseded #7) | **Accurate** | #7 closed unmerged to current main; #16 reimplemented on current main. |
| Stale open PRs #3 Vercel, #4 Vite env | **Accurate; also #19/#20 open** | See §6. |

HEAD `#18` (motif elevation) is later than the user’s list but directly continues the motif thread.

---

## 3. What major merged changes actually did (code, not titles)

### PR #5 — FEDOROV Cursor rules
Installed `.cursor/rules/fedorov-*.mdc` + Correction Kernel / Disproof Gate / `.fedorov/ledger.md` discipline. No runtime app change.

### PR #6 — Widgets, portraits, per-genre sheet designs
Tightened summon UI and portrait pipeline; established per-genre visual identity in `App.tsx` / CSS (followed by layout structure in #10).

### PR #8 — Blend atmospheric backgrounds
Introduced `src/lib/sheetPageBackgrounds.ts` (procedural SVG plates, no remote/Unsplash), wired CSS vars `--sheet-bg-*` from `App.tsx`, soft-light blend + mask fade in `sheet-themes.css`. Removed broken `postcss.config.js` (ESM/`module` crash). Tuned Lore/Stats louder vs Physical quieter.

### PR #9 — Live portrait billing gate
`src/lib/geminiImageErrors.ts` classifies quota/billing failures; server returns procedural SVG + explicit codes (e.g. `BILLING_REQUIRED` / `MISSING_API_KEY`) instead of silent “success” stock art. Tests in `geminiImageErrors.test.ts`.

### PR #10 — Genre structural layouts + Clerk cleanup
Per-theme `--sheet-layout` values (`gothic-manuscript`, `cyber-hud`, `steam-blueprint`, `pixel-cartridge`, `heraldic-triptych`, `non-euclidean`, `kakemono-scroll`, `scrap-board`, `crystal-lattice`, `broadsheet-gazette`) and genre-specific grid/chrome rules in `sheet-themes.css`. Removed dead Clerk middleware; stopped tracking `package-lock.json` (keep `bun.lock`).

### PR #11 — Universal Persona Prompt Book
Always-apply `c-traces-goal.mdc` + lean personas (Neon Blue, Jade Teal, Crimson Red, Ash Gray, Glowing Emerald, Rust Copper). Documents coexistence with FEDOROV; in-app chat still uses `src/lib/prompts/cTracesGoal.ts`.

### PR #12 — Complementary clash accents
Third palette axis: `clash` / `clashText` on every theme; injected as `--wv-clash`; used on badges, lore kickers, ability rails, focus rings, theme chip swatches, SVG clash spark.

### PR #13 → #15 — Genre motif props
Three local SVG motifs per genre (`THEME_MOTIFS`), scattered via `genreMotifLayer`, page-nudged placements, quieter on Physical. Cyberpunk: laser-skateboard / cyborg / futuristic-laptop; Post-Apocalyptic: pirate-sword / gold-chest / pirate-ship. #13 never reached main; #15 did.

### PR #14 — FEDOROV_AI Arch-Chronologer
`.cursor/rules/fedorov-ai-arch-chronologer.mdc` (not alwaysApply); `src/lib/prompts/archChronologer.ts` (`ARCH_CHRONOLOGER_SYSTEM_PROMPT`, `FIVE_FOLD_BLUEPRINT_*`, `archChronologerFieldPreamble`); preamble prefixed into all `generateMissingFieldsPrompts.*` in `generators.ts`; docs in `AGENTS.md`.

### PR #16 — Character Codex + dice tray
`characterCodex.ts` (upsert/load/delete/duplicate, portrait size/quota trimming), `CharacterCodex.tsx` drawer, `dice.ts` + `DiceTray.tsx`, header controls in `App.tsx`, portrait grounding on `equipment.primaryWeapon`, regression tests `codex-and-dice.test.ts`. Supersedes closed #7.

### PR #18 — Elevate motifs (current tip)
Raised motif fill/stroke contrast and page opacity defaults so props read as visual set pieces rather than faint ornaments. Introduced the `MotifPalette` type hole that breaks `tsc`.

### PR #17 (note)
Merged into the Codex branch base, **not** `main`. npm lockfile / `npm ci` story did **not** land on `main`. `package-lock.json` remains gitignored.

---

## 4. Quality review

### Strengths

- **Theming system is real structure, not palette-only.** Distinct `--sheet-layout` per genre, per-page metaphors, local SVG atmospheres, clash accents, and motif props — with Vitest guards that decode SVG and assert markers (`data-artifact`, `data-metaphor`, `data-motif`, `data-clash-spark`).
- **Provider honesty.** Image path classifies billing/auth failures and falls back to character-specific SVG plates (`portraitFallback.ts`) instead of pretending live art succeeded.
- **Prompt hygiene for genres.** `GENRE_ATMOSPHERIC_MATRICES` with negative constraints; portrait compiler grounds physicals + equipment.
- **Codex/dice are pragmatic.** Quota-aware portrait drop, max 32 entries, seeded RNG for dice tests, clash chrome consistent with themes.
- **Agent ops.** FEDOROV ledger + multi-stack Cursor rules reduce silent regression of the exact defects this release train fixed.
- **Test suite is focused and green** (see §7): 32 tests covering theming, prompts, Codex, dice, image error taxonomy, Arch-Chronologer exports.

### Bugs / risks (Blocking-oriented)

| ID | Severity | Finding |
|----|----------|---------|
| B1 | **Blocking (CI/typecheck)** | `src/lib/sheetGenreMotifs.ts`: `MotifPalette` is `{ accent, accent2, clash }` but motif drawers reference `p.bg2` / `p.bg`. `npm run lint` → 7× `TS2339`. Runtime works because `BgPalette` is passed structurally. Fix: extend `MotifPalette` (or reuse `BgPalette`). |
| B2 | **Blocking (security if exposed)** | Unauthenticated Gemini spend/proxy on all generation routes. Fine for local Cloud Agent; unsafe for a public Cloud Run / Vercel URL without a gate. |
| B3 | **High (ops)** | Merging open **PR #3** would delete `bun.lock` and reintroduce PostCSS CJS — regresses #8/#10 install story. **PR #4** is partly obsolete (PostCSS already gone) and its narrative conflicts with current `.cursor/environment.json` (`npm install`). |
| B4 | **Medium** | `ARCH_CHRONOLOGER_SYSTEM_PROMPT` / Five-Fold full schema are Cursor/docs assets only; live `/api/generate-sheet` uses a separate inline JSON prompt — Arch-Chronologer voice does not govern primary summons. |
| B5 | **Medium** | Firebase web API key + OAuth client id committed in `firebase-applet-config.json`. Expected for Firebase client apps, but Sheets scopes + unused-looking path increase attack surface if Auth is enabled without App Check / domain lockdown. |

### Inconsistencies

- Footer copy in `App.tsx` advertises “PRISMA PERSISTENCE & GEMINI AI” while roster persistence is Codex `localStorage`; Prisma is example/adapter only.
- Dual package managers: `bun.lock` present, `package-lock.json` gitignored, environment install uses `npm install`, README/history oscillate.
- Theme palettes duplicated: `App.tsx` `THEMES[].tokens` vs `THEME_PALETTES` in `sheetPageBackgrounds.ts` (must stay hex-synced; clash tests only scrape `App.tsx` for clash hex).
- Genre lists triplicated: `CANONICAL_SHEET_STYLES`, `ARCH_CHRONOLOGER_GENRES`, `GENRE_ATMOSPHERIC_MATRICES` keys (tests assert Arch ↔ matrices alignment only).
- `compilePortraitPrompt(char: any)` and several server helpers remain loosely typed despite Zod schemas in `src/types/character.ts` for an orchestrator path that is not the main UI flow.

### Dead / orphan code

- `next.config.js`, `next-env.d.ts` (Next leftovers after Clerk cleanup).
- `neon.ts`, Prisma models + `PrismaPersistAdapter` + `wire-orchestrator-prisma.ts` (not driven by `server.ts`).
- `ARCH_CHRONOLOGER_SYSTEM_PROMPT` unused at runtime (only tested / Cursor-consumed).
- Google Sheets import/export path depends on popup OAuth; easy to treat as first-class persistence when Codex is the durable local store.

### UX / accessibility (sheets, Codex, dice)

- **Good:** Codex `role="dialog"` + close `aria-label`; dice collapse labeled; HP/resource steppers labeled; theme clash swatches `aria-hidden`; SVG atmospheres `aria-hidden`; print CSS strips decorative `::before`.
- **Gaps:** Codex backdrop click-to-close without Escape / focus trap / `aria-modal`; DiceTray is not a modal (no focus management); large sheet is one long scroll with many textareas — limited landmark structure beyond section `id`s; no `prefers-reduced-motion` for theme pulse dots (only `prefers-reduced-transparency` for atmospheres); motif SVGs are decorative (OK) but high-contrast fills after #18 may still fight text contrast on light themes (Steampunk / Post-Apoc) — residual risk already noted in ledger.
- **Codex UX honesty:** UI warns that oversized data-URL portraits may drop — correct; no sync/export beyond JSON copy / optional Sheets.

### Test coverage gaps

- No HTTP/integration tests for `server.ts` routes (fallback sheet, image billing payload, chat).
- No React component tests for `App.tsx`, Codex drawer, DiceTray.
- No visual/regression tests for CSS layout tokens (only string presence of `--sheet-layout`).
- No quota/stress test for Codex `localStorage` beyond portrait-drop branch.
- Lint is **not** gated by the green Vitest run — typecheck can fail while tests pass (current state).

---

## 5. Security notes (API keys & localStorage)

| Surface | Status |
|---------|--------|
| `GEMINI_API_KEY` | Server-only via `dotenv` + `getAiClient()` — correct isolation pattern. |
| Client `VITE_NANO_BANANA_API_KEY` | Optional Bearer in `NanoBananaProvider.ts` — do not set a privileged key in Vite env. |
| Health endpoint | Exposes `geminiConfigured` boolean and model list — low risk. |
| Body limit | `express.json({ limit: "16mb" })` — needed for reference images; increases DoS weight without auth. |
| Codex / favorites / idempotency | `localStorage` — XSS in the origin can exfiltrate full sheets; no encryption; single-browser scope. |
| Firebase config | Public client config committed; Sheets/Drive scopes in `workspaceAuth.ts`. |

---

## 6. Leftover debt & open PR hygiene

**Open PRs (observed 2026-09-24):**

| PR | State | Note |
|----|-------|------|
| #3 Fix Vercel build | OPEN | Deletes `bun.lock`, renames PostCSS — **do not merge as-is** against current main. |
| #4 Vite env / Cloud Agent | OPEN | PostCSS delete already on main via #8; env story partially superseded; reconcile then close. |
| #7 Codex/dice | CLOSED | Superseded by #16. |
| #19 / #20 Codex page finalizer | OPEN | Feature work ahead of main — out of scope for this audit. |

**Ordered next priorities (sensible, not estimated in calendar time):**

1. **Unblock typecheck** — extend `MotifPalette` with `bg`/`bg2` (or pass typed `BgPalette`); add `npm run lint` to CI so #18-class drifts fail the gate.
2. **Close or rewrite stale #3/#4** — document install SOFT (`bun.lock` vs npm); align `.cursor/environment.json` with how agents actually install; decide Vercel build path without deleting the working lockfile.
3. **Gate the Gemini proxy** before any public deploy — shared secret header, session auth, or network policy + rate limits; keep procedural fallback for local/demo.
4. **Finish or quarantine Arch-Chronologer** — either inject preamble/system constraints into `/api/generate-sheet`, or mark the full system prompt as Cursor-only to stop the “wired” illusion.
5. **Delete or quarantine dead stacks** — Next stubs, Neon stub, Prisma example path vs Codex; fix footer persistence claim.
6. **Decompose `App.tsx`** — theme tokens, summon actions, dossier pages into modules; reduce token-duplication with `sheetPageBackgrounds`.
7. **A11y pass on Codex/Dice** — Escape, focus trap, `aria-modal`, reduced-motion.
8. **Server/route tests** — health, fallback generate-sheet, billing-classified generate-image.
9. **Then** consider #19/#20 Codex plate finalizer / export features.

---

## 7. Test run (this review)

Environment: Node `v22.14.0`, `npm install` succeeded on main (peer warnings around Prisma 8 RC; engine wants `>=22.18.0`).

| Command | Result |
|---------|--------|
| `npm test` (`vitest run`) | **PASS** — 4 files, **32/32** tests |
| `npm run lint` (`tsc --noEmit`) | **FAIL** — 7 errors in `src/lib/sheetGenreMotifs.ts` (`bg` / `bg2` on `MotifPalette`) |

Vitest files: `summons.test.ts`, `codex-and-dice.test.ts`, `archChronologer.test.ts`, `geminiImageErrors.test.ts`.

---

## 8. Key file index (symbols)

| Concern | Path / symbol |
|---------|----------------|
| Themes + clash | `App.tsx` `THEMES`, CSS vars `--wv-clash` |
| Layout tokens | `sheet-themes.css` `[data-sheet="…"] { --sheet-layout: … }` |
| Atmospheres | `buildSheetPageBackground`, `sheetPageBackgroundOpacity`, `THEME_ARTIFACT`, `PAGE_METAPHOR` |
| Motifs | `THEME_MOTIFS`, `genreMotifLayer`, `MotifPalette` |
| Style canonicalize | `canonicalizeSheetStyle`, `themeIdForStyle` |
| Missing-field prompts | `generateMissingFieldsPrompts` + `archChronologerFieldPreamble` |
| Arch-Chronologer | `ARCH_CHRONOLOGER_SYSTEM_PROMPT`, `FIVE_FOLD_BLUEPRINT_SECTIONS` |
| Chat prompts | `buildCTracesGoalPrompt` |
| Portrait compile | `compilePortraitPrompt` |
| Codex | `CODEX_STORAGE_KEY`, `upsertCodexEntry`, `persistCodex` |
| Dice | `rollCheck`, `abilityModifier`, `parseInitiativeModifier` |
| Server routes | `app.post("/api/generate-sheet"\|"/api/generate-image"\|"/api/chat")` |
| Image errors | `classifyGeminiImageError`, `NANO_BANANA_IMAGE_MODELS` |

---

## 9. DISPROOF GATE

1. **Failure Vector:** Review of CSS “presence” and motif readability is code/test grounded, not eye-verified in a browser this turn; public-deploy risk assumes the Express app is reachable without an edge auth layer (not verified against a live Cloud Run config).
2. **Verified Evidence:** Tip `dacf454`; PR list via `gh`; file reads of `server.ts`, `App.tsx` (themes/Codex wiring), `sheetPageBackgrounds.ts`, `sheetGenreMotifs.ts`, `archChronologer.ts`, `generators.ts`, `characterCodex.ts`, `dice.ts`, `sheet-themes.css`, tests, `.fedorov/ledger.md`, `AGENTS.md`; `npm test` 32 pass; `npm run lint` 7 fail.
3. **Unverified Boundaries:** Production hosting config; whether Firebase Auth is used in real sessions; content of open PRs #19/#20 beyond titles; Prisma DB ever provisioned.
4. **User Decision Points:** (a) Close/rewrite #3/#4 vs keep open; (b) bun vs npm SOFT; (c) whether Arch-Chronologer must bind into `/api/generate-sheet` before more lore work; (d) public API auth requirement before deploy.

---

*Document only. No application code changed in the review PR that lands this file.*
