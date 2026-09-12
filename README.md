# WorldVision Summons

WorldVision Summons is a multi-genre TTRPG dossier studio for game masters, players, and worldbuilders. It turns a name, class, lore snippet, and genre into a full character sheet: identity, physical presence, psychological DNA, derived combat stats, equipment architecture, portrait art, and an in-character chat persona.

The problem it solves is fragmentation. Most tables bounce between a notes app, a stat calculator, Midjourney, and a chatbot. This app keeps lore, numbers, and visuals in one themed dossier that you can edit, print, export, and (now) keep as a local campaign roster.

---

## Core features

| Module | What it does |
| :--- | :--- |
| **Summon engine** | `POST /api/generate-sheet` asks Gemini for a structured JSON sheet, or falls back to a procedural generator when `GEMINI_API_KEY` is missing. |
| **Editable dossier** | Overview, physical, lore, abilities, gear, psyche, bonds, and STR–CHA stats with HP / class-resource trackers. |
| **Visual Codex** | Ten cinematic themes restyle typography and color tokens. Portrait synthesis goes through the NanoBanana / Imagen proxy with Unsplash fallbacks, plus an image editor (filters, crop, img2img). |
| **Persona chat** | “Ask Federov AI” opens a first-person chat grounded in the live sheet (C-TRACES-GOAL prompt on the server). |
| **Presets** | 50+ archetypes with search, category tabs, and localStorage favorites. |
| **Character Codex** | Save, load, duplicate, and delete summons on-device so a GM can keep a party / NPC roster instead of overwriting the last generate. |
| **Dice tray** | Tabletop d4–d100 plus ability checks and initiative using the loaded character’s modifiers, with advantage / disadvantage and a short roll history. |
| **Export** | Copy JSON, print, and Google Sheets import/export (Sheets now maps the live dossier fields: `derivedStats`, `signatureAttributes`, `equipment`). |

---

## Tech stack & architecture

```text
Browser (React 19 + Vite 6 + Tailwind 4)
  App.tsx dossier + themes + summon form
  CharacterCodex  ·  DiceTray  ·  GeminiChatModal  ·  ImageEditorModal
           │  JSON fetch
           ▼
Express (server.ts :3000)
  /api/generate-sheet   lore + stats JSON
  /api/generate-image   Imagen / Unsplash
  /api/chat             persona turn
  /api/health
           │
     Gemini  ·  Imagen
```

- **UI:** React 19, Vite 6, TypeScript, Tailwind CSS 4, lucide-react, recharts, motion
- **Server:** Express + `tsx` in dev; `esbuild` bundle (`dist/server.cjs`) in prod
- **AI:** `@google/genai` (Gemini text, Imagen portraits). Keys stay on the server.
- **Auth / Sheets:** Firebase Google popup with Sheets + Drive scopes (browser-side)
- **Persistence:** browser `localStorage` (favorites, last run snapshot, Codex roster)
- **Tests:** Vitest

Prisma, Neon, and a Clerk-style `middleware.ts` exist as unused scaffolding. Express does not mount a database. The footer no longer claims Prisma persistence.

---

## How it runs

### Install

```bash
npm install
# or: bun install
```

### Environment

Copy `.env.example` to `.env` (dotenv loads `.env` by default):

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | No | Real Gemini / Imagen calls. Without it, sheet, chat, and images still work via procedural / Unsplash fallbacks. |
| `DATABASE_URL` | No | Only if you later wire Prisma. Unused by the live server. |
| `DISABLE_HMR` | No | Turns off Vite HMR/watch. |
| `VITE_NANO_BANANA_API_URL` / `VITE_NANO_BANANA_API_KEY` | No | Optional client image-provider override. |

### Scripts

```bash
npm run dev      # http://localhost:3000  (tsx server.ts + Vite middleware)
npm run test     # vitest run
npm run lint     # tsc --noEmit
npm run build    # vite build + esbuild server.ts → dist/server.cjs
npm run start    # NODE_ENV=production node dist/server.cjs
```

Production serves `dist/` statically from Express. The original packaging target is containerized hosting (e.g. Cloud Run).

---

## Functional audit (this pass)

**Works as intended**

- Theme tiles, preset search / favorites / apply, summon form, dossier field edits, nav scroll, HP and resource ±, stat sliders, radar overlay + adopt baseline, copy JSON, print, chat modal, image editor / reroll, Google sign-in buttons.

**Fixed in this pass**

- Default theme id did not match any tile (`obsidianCult` vs `gothicDarkFantasy`), so no theme appeared selected on load.
- `postcss.config.js` used CommonJS `module.exports` while `package.json` is `"type": "module"`, so Vite threw a full-screen overlay and the SPA never hydrated. The unused PostCSS file was removed (`@tailwindcss/vite` already processes CSS).
- Google Sheets export/import used a different schema than the live dossier (`overview.hp`, `stats.label`, `traits.*`), which left exports empty and could break the stats radar after import.
- Portrait reroll ignored live `equipment.primaryWeapon` and fell back to a generic staff.
- Preset styles like “Wasteland Scavenger” / “Neon Ronin” did not switch the theme.
- Summon failures failed silently. Sign-out existed in code but had no button.
- Copy claimed 12 themes and Prisma persistence.

**Still unwired / leftover**

- `CharacterSheetApproval` is never mounted; `/api/character/:id` and `/api/orchestrator/*` do not exist.
- `src/lib/pipeline/persist-adapter-prisma.ts`, `neon.ts`, `middleware.ts`, and `next.config.js` are unused.
- Prisma client (`^7`) and CLI (`8 rc`) are version-skewed; skip them unless you wire a real database.
- Express `/api/*` has no auth. Do not expose a keyed instance to the public internet without a gateway.
- Firebase web config is committed in `firebase-applet-config.json` (expected for a Firebase web app, but it is still a client identifier).

---

## New in this branch

1. **Character Codex** — header **Codex** opens a local roster. Save the current dossier, load another NPC, duplicate, or delete. Storage is `localStorage` (`worldvision_character_codex`), capped at 32 entries; oversized base64 portraits are dropped if quota is hit.
2. **Dice tray** — floating **Dice Tray** rolls polyhedral dice and ability / initiative checks from the loaded sheet, with advantage, disadvantage, crit/fail callouts, and history.
