# Working Notes

## Goal
FEATURE: Hero banner for official logo on PR #27 — in progress / verifying.

## Constraints
- Same branch `Cursor/jonathan-official-logo-branding-9268`. Do not merge.
- Keep favicons, OG meta, sheet layouts. Primary actions stay reachable (sticky header).
- Respect prefers-reduced-motion.

## Confirmed facts
- `BrandHeroBanner` at `src/components/BrandHeroBanner.tsx` uses full art + webp srcset.
- Header wordmark simplified to portal mark + "Summon Engine".
- lint/test/build green after hero add.

## Next step
Desktop + mobile screenshots; update PR #27 description.
