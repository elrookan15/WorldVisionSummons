# Working Notes

## Goal
FEATURE: Official WorldVision Summons logo brand pack — done this turn.

## Constraints
- Exact owner art; portal crop for favicons only.
- No secrets / .env / Gemini gate edits.
- Branch `Cursor/jonathan-official-logo-branding-9268`; draft PR #27 to main; do not merge.

## Current plan
Complete. Verification green. Screenshots + demo video in `/opt/cursor/artifacts/`.

## Confirmed facts
- Assets live under `public/` → Vite copies into `dist/` → `express.static` before SPA `*`.
- Prod curl: brand/favicon = image/*; unknown route = text/html.
- Gates: lint exit 0; vitest 71/71; build exit 0.
- Header/footer show logo; favicons are portal crops (left=297, top=420, size=430).

## Open questions
- Absolute `og:image` URL once Cloud Run canonical host is designated.

## Rejected hypotheses
- Auto luminance crop at y≈726 (stairs) — rejected for mid portal crop.

## Next step
Operator review of draft PR #27. Do not merge.
