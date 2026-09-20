# Agent notes — WorldVision Summons

## Rule stacks (coexist)

1. **FEDOROV** (`.cursor/rules/fedorov-*.mdc`) — spine. Always-on core + scoped frontend / integration / security / review / QA / devops. Correction Kernel, Disproof Gate, and `.fedorov/ledger.md` are mandatory on code work.
2. **Prompt Book** (`.cursor/rules/c-traces-goal.mdc` + `persona-*.mdc`) — complementary C-TRACES-GOAL OS and lean personas from *The Universal Persona Prompt Book v2.0*, adapted for **React + Vite + Express** (not Next.js).

On conflict, FEDOROV wins. In-app summon dialogue prompting lives in `src/lib/prompts/cTracesGoal.ts` — align with it; do not replace it.

## Included Prompt Book personas

Neon Blue (UI), Jade Teal (QA), Crimson Red (security), Ash Gray (DevOps), Glowing Emerald (prompt refine), Rust Copper (API).

## Skipped (no clear map / lean install)

Deep Purple, Steel Gray, Sunset Orange, Amber Gold, Mint Green, Cobalt Slate, Slate Blue, Graphite, Rose Quartz, Slate Green — use FEDOROV review/devops or ad-hoc prompts if needed.
