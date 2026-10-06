# Working Notes

## Goal
FEATURE: Make the owner-supplied 1024×1024 WorldVision Summons PNG the official brand identity (static assets, header/footer UI, favicons, OG/Twitter meta). Do not regenerate art. Do not touch secrets, .env, or Gemini gate logic.

## Constraints
- FEDOROV L0 wins on Kernel, Gate, ledger, secrets, no Gemini from `/src`.
- Exact artwork from uploads; portal center-crop for favicon sizes only.
- `npm run lint`, `npm test`, `npm run build` must pass.
- Branch: `Cursor/jonathan-official-logo-branding-9268`. PR to main, do not merge.
- Step budget: 12.

## Current plan
1. Copy original + generate WebP/PNG derivatives + portal-crop favicon set under `public/`.
2. Wire `index.html` favicons + OG/Twitter + `site.webmanifest`.
3. Feature logo in App header/footer without changing sheet layouts.
4. Extend productionServer static-asset regression test.
5. Verify lint/test/build; screenshot UI + favicon listing; commit/push/PR.

## Confirmed facts
- Source art: `/home/ubuntu/.cursor/projects/workspace/uploads/worldvision-summons-logo_9b19.png` (1024×1024 RGB PNG).
- Vite has no prior `public/`; `express.static(dist)` runs before SPA `*`; Vite copies `public/` into `dist/`.
- Header previously used a "WV" circle + text wordmark (`src/App.tsx`).
- Portal favicon crop: left=297, top=420, size=430 (rune ring + vortex).

## Open questions
- Production absolute `og:url` / absolute `og:image` host — relative `/brand/og-image.jpg` until a canonical Cloud Run URL is designated.

## Rejected hypotheses
- Auto luminance hotspot (y≈726) — too low; included stairs. Mid crop preferred.
- Regenerating/redrawing the logo — forbidden by owner.

## Next step
Commit + push pre-test; run lint/test/build; screenshot; finalize PR.
