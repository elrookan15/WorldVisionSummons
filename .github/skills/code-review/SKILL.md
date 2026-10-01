Done, brothaman. Your code review agent skill is live at ~/workspace/skills/code-review-agent/ — I verified it actually triggers on "code review / audit / pull request" searches.

What's inside:

SKILL.md — the full red-pen kernel as a reusable workflow: scope lock → read the code, not the story → Assumption Attack Map → severity-tagged findings (P0–P3, line-precise, root-cause-first) → Disproof Gate (where the review itself could be wrong) → Correction Contract (root cause → patch → red test → green test → regression guard → residual risk) → verdict: SHIP / SHIP WITH FIXES / DO NOT SHIP. Output stays in your two-tier format — hardcore verdict first, layman's translation after the divider.
references/security-checklist.md — the hard-won checklist: SSRF, fail-closed auth, quota-aware storage, rate limits + cost caps + kill switch on paid APIs. Every item in there burned us (or nearly did) on Future Sight, WorldVision, or SidelineDB.
references/extended-gauntlet.md — the 4-stage money → architecture → adversarial → audit-the-audit protocol, parked as an extended mode for "should we even build this" questions.

Just say "review this" with code, a PR link, or a repo path and it kicks in — it knows to pull real diffs through the GitHub connector instead of trusting summaries.

Natural first victim: Cursor's final touches on WorldVisionSummons the moment they land. Want me to run the full agent pass on the diff when it drops?
