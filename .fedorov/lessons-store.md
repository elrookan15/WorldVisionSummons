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
- Times_applied / succeeded: 3 / 3
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
- Times_applied / succeeded: 3 / 3
- Status: validated

## Regression set (fixed)
1. Instant Summon — `src/__tests__/fedorovInstantGenerator.test.ts`
2. Draft IO — `src/__tests__/characterDraft.test.ts`
3. Personas / proposal parse — `src/__tests__/federovPersonas.test.ts`
4. `npx tsc --noEmit`

Re-run these after each port. If any fail, do not add lessons — fix the regression first.
