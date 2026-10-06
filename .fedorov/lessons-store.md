# Lessons Store

Schema: id, date, language/framework, task_type, situation, symptom, root_cause_pattern, strategy, detection_check, evidence, confidence, times_applied / times_succeeded, status (candidate | validated | deprecated).

Cap: 12 active. Merge duplicates. Patterns only — no secrets, no proprietary snippets.

## SIL-001
- Date: 2026-10-04
- Language/framework: React + Vite + Express / git apply
- Task_type: FEATURE (AI Studio patch port)
- Situation: Operator drops a `.patch` against an older App.tsx index.
- Symptom: Hunks miss Instant Summon, draft hydrate, or current line numbers.
- Root_cause_pattern: Patch index ≠ live tree. Applying the whole patch overwrites newer ports.
- Strategy: `git apply --include=<new-file>` for greenfield files. Hand-wire App/server. Extract parsers/IO to `src/lib/*` + Vitest. Drop competing persist instead of gating it.
- Detection_check: `git apply --check` or first hunk context grep fails.
- Evidence: wv-port2 (draft), wv-port3 (personas), wv-port4 (13 themes). Vitest 39/39 after port4. tsc exit 0.
- Confidence: medium
- Times_applied / succeeded: 4 / 4
- Status: validated

## SIL-002
- Date: 2026-10-04
- Language/framework: Express chat proxy
- Task_type: FEATURE (persona engine)
- Situation: Client chat UI needs multiple voices.
- Symptom: Naive port lets the body set `systemInstruction`, or drops `!res.ok` handling.
- Root_cause_pattern: Trusting client prompt text. Treating error-path deletion as a cleanup.
- Strategy: Allowlist `personaId` via `findPersonaById`. Unknown id → keep C-TRACES character voice. Clip context fields. Keep `res.json().catch` + status check + clipboard fallback.
- Detection_check: grep `/api/summons/chat` for `systemInstruction` sourced from `req.body`.
- Evidence: `server.ts` uses `findPersonaById`; `federovPersonas.test.ts` unknown id undefined / UI fallback archivist.
- Confidence: medium
- Times_applied / succeeded: 1 / 1
- Status: candidate

## SIL-003
- Date: 2026-10-04
- Language/framework: PowerShell + Node on Windows
- Task_type: DEBUG / environment
- Situation: Local verify (`npx vitest`, `npx tsc`, `npm run dev`).
- Symptom: `&&` parse errors; `npx` silent for minutes; second `npm run dev` `EADDRINUSE :3000`.
- Root_cause_pattern: PowerShell is not bash. Cold tsc is slow. An existing listener is success, not a missing server.
- Strategy: Separate statements or `;`. Wait for tsc up to ~8 min. If EADDRINUSE, hit the bound `127.0.0.1:3000`. Do not kill the user's listener without asking.
- Detection_check: Shell is powershell; `listen EADDRINUSE`.
- Evidence: port3 tsc ~121s exit 0; second dev server exit 1 EADDRINUSE; browser still served the app.
- Confidence: high
- Times_applied / succeeded: 4 / 4
- Status: validated

## SIL-004
- Date: 2026-10-04
- Language/framework: Cursor rules / git
- Task_type: FEATURE (rules install)
- Situation: A `.fedorov` store is missing on disk but still tracked in HEAD.
- Symptom: A directory listing shows only `ledger.md`. Writing an empty lessons file deletes validated rows.
- Root_cause_pattern: Create-if-missing treats a deleted worktree file as absent. HEAD still holds the rows.
- Strategy: Run `git show HEAD:<path>` before creating a store. If headings exist, restore them and append. Do not write an empty table over them.
- Detection_check: `git diff` against that path removes `## SIL-` headings or flips the file to a header-only table.
- Evidence: This install's first write replaced the store. `git checkout -- .fedorov/lessons-store.md` restored SIL-001 through SIL-003. Not promoted: one recovery, no second-task re-run yet.
- Confidence: high
- Times_applied / succeeded: 1 / 1
- Status: candidate

## SIL-005
- Date: 2026-10-04
- Language/framework: Express + React / WorldVision Summons
- Task_type: FEATURE (theme port follow-up)
- Situation: A style-list edit lands on `handleChatTurn` after the persona port.
- Symptom: `tsc` reports TS1005 at the chat prompt, and theme ids exist while `.texture-*` rules for those ids are missing.
- Root_cause_pattern: A partial delete leaves `persona` and `response` referenced without the `generateContent` call, and page-wash CSS is edited separately from the THEMES array.
- Strategy: Restore `personaId` lookup plus the generateContent block from the last compiling commit. Grep `App.tsx` for each new `texture:` id's CSS class. Do not paste the patch's server style-list hunk.
- Detection_check: `npx tsc --noEmit` TS1005 in `server.ts`; `data-sheet` set with no matching `.texture-<id>` rule.
- Evidence: This turn, tsc exit 2 at `server.ts:583` before restore, exit 0 after. Browser `eighties3DRender` and `bioMechanical` layouts switched.
- Confidence: medium
- Times_applied / succeeded: 1 / 1
- Status: candidate

## SIL-006
- Date: 2026-10-06
- Language/framework: Vite + Express static / branding
- Task_type: FEATURE (logo / favicon pack)
- Situation: Owner supplies a dense 1024 full-scene logo for app chrome and favicons.
- Symptom: At 16×16/32×32 the full scene (title + heroes + portal) turns to mush; SPA `*` can look like it swallowed assets if `public/` is missing from `dist`.
- Root_cause_pattern: Favicon crops need a high-contrast center (portal vortex), not the full composition. Vite only emits root static files from `public/`; Express must `express.static(dist)` before SPA fallback.
- Strategy: Keep original art under `public/brand/`. Generate portal center-crop icons. Assert `/brand/*` and `/favicon.ico` return non-HTML in `productionServer.test.ts`. Verify with `NODE_ENV=production` curl content-types.
- Detection_check: Tiny favicon looks like noise; curl `/favicon.ico` returns `text/html`.
- Evidence: 2026-10-06 branding PR — lint/test/build green; prod :8080 served image/* for brand/favicon and text/html for unknown routes.
- Confidence: medium
- Times_applied / succeeded: 1 / 1
- Status: candidate

## Regression set (fixed)
1. Instant Summon — `src/__tests__/fedorovInstantGenerator.test.ts`
2. Draft IO — `src/__tests__/characterDraft.test.ts`
3. Personas / proposal parse — `src/__tests__/federovPersonas.test.ts`
4. `npx tsc --noEmit`
5. Production static brand paths — `src/__tests__/productionServer.test.ts`

Re-run these after each port. If any fail, do not add lessons — fix the regression first.
