# WorldVision Summons

WorldVision Summons is a multi-genre RPG lore architect, statistical engine, and AI-powered visual codex generator tailored for tabletop roleplaying game masters, players, and worldbuilders. It bridges narrative backstory generation, quantitative stat block calculation, and high-fidelity concept art synthesis into a unified platform.

---

## Core System Modules

| Module | Purpose & Capabilities |
| :--- | :--- |
| **Character Architecture** | • Generates canonical character names, archetypes, and 2–3 sentence lore backstories detailing origins, core conflicts, and active oaths.<br>• Synthesizes biometric data, including height, weight, build, and distinguishing features.<br>• Organizes structured inventory loadouts across primary weapons, secondary foci, armor, utility tools, consumables, and relics. |
| **Statistical Engine** | • Calculates core attributes (STR, DEX, CON, INT, WIS, CHA) on a 1–20 scale balanced around the character archetype.<br>• Computes derived combat statistics: Hit Points (HP), Armor Class (AC), initiative modifiers, movement speed, and level scaling.<br>• Allocates specialized class-based resources (Mana, Ki Points, Energy Cells, Rage Charges, Grit, or Spell Slots).<br>• Tracks passive skill proficiencies and faction or moral alignments. |
| **Persona & Dialogue System** | • Generates 10 concrete psychological traits: reputation, vice, virtue, fear, obsession, tell, loyalty, blind spot, survival instinct, and legacy fear.<br>• Formats inputs using the C-TRACES-GOAL prompt framework to ground tone, style, and constraints.<br>• Integrates an interactive Gemini-powered lore chat to let users converse directly with the summoned character persona regarding tactical choices and campaign hooks. |
| **Visual Codex & Theming** | • Implements 10 genre aesthetics: Gothic Dark Fantasy, Cyberpunk, Steampunk, Cosmic Horror, Samurai Era, High Fantasy, 8-Bit Retro RPG, Post-Apocalyptic, Eldritch Arcane, and Victorian Gothic.<br>• Adjusts typographic scales, tokenized color palettes, and thematic borders dynamically based on the chosen theme.<br>• Structures layouts using responsive cards, stat bars, and pull-quote callouts. |
| **Asset Generation Pipeline** | • Drives full-body concept art synthesis via the NanoBanana diffusion adapter with automated request timeouts and idempotency tracking.<br>• Injects style-specific lighting and atmospheric matrices (e.g., chiaroscuro and oxblood for Gothic Dark Fantasy; neon rim lighting and rain-slick asphalt for Cyberpunk).<br>• Appends negative prompt constraints to prevent cropped limbs, malformed anatomy, and anachronistic artifacts.<br>• Includes an image-to-image reference suite with drag-and-drop uploads and a side-by-side comparison pane. |

---

## Technical Architecture

```text
                       ┌────────────────────────────────────────┐
                       │          React Frontend (Vite)         │
                       │  • App.tsx (State, Themes, Workflow)   │
                       │  • ImageEditorModal & GeminiChatModal  │
                       │  • Strongly Typed Interfaces           │
                       └───────────────────┬────────────────────┘
                                           │
                                  API Requests (JSON)
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │             Express Backend            │
                       │  • Secure Proxy & Secret Isolation     │
                       │  • Error Resilience & Fallbacks        │
                       └──────┬──────────────────────────┬──────┘
                              │                          │
                              ▼                          ▼
                     ┌──────────────────┐      ┌───────────────────┐
                     │  Gemini AI API   │      │ NanoBanana Neural │
                     │  (Lore & Chat)   │      │ (Image Synthesis) │
                     └──────────────────┘      └───────────────────┘
```

- **Frontend Layer**: Built with React and Vite, styled via Tailwind CSS. Manages local state, theme switching, interactive modals (`ImageEditorModal`, `GeminiChatModal`), and image provider adapters (`NanoBananaProvider`) within a strictly typed TypeScript environment.
- **Backend Layer**: Powered by Express to act as a secure proxy. Isolates Gemini AI and NanoBanana API keys from the client, enforces procedural generation fallbacks, and manages API error handling.
- **Build & Deployment**: Packaged using `esbuild` and optimized for containerized hosting on Google Cloud Run. Persistent codex management supports saving, updating, and exporting completed summon records.

### Gemini proxy auth (`WVS_API_SECRET`)

Routes `/api/generate-sheet`, `/api/generate-image`, `/api/summons/image`, `/api/chat`, and `/api/summons/chat` are gated:

| `WVS_API_SECRET` | `NODE_ENV` | Behavior |
| --- | --- | --- |
| unset | not `production` | Open (local/dev) |
| unset | `production` | **403** fail-closed |
| set | any | Require `X-WVS-API-Key: <secret>` or `Authorization: Bearer <secret>` |

Mirror the same value as `VITE_WVS_API_SECRET` so the Vite client attaches the header. See `.env.example`. `/api/health` reports `apiAuth.gateMode` without exposing the secret.

Those same routes, plus `/api/codex/snapshots`, are limited to 60 requests per minute per client IP (`429` + `Retry-After`). The process trusts one proxy hop so Cloud Run's `X-Forwarded-For` is the client address.

Production static hosting uses Express 4's `*` SPA fallback (`attachProductionFrontend`). The Express 5 pattern `*all` does not match on this server.

### Launch (Cloud Run)

The container listens on `PORT` (Cloud Run sets this; local production uses `8080` via the image, local dev stays on `3000`). `GET /api/health` is the probe. `SIGTERM` drains in-flight requests for up to 10 seconds.

Secrets stay in Secret Manager and are injected at runtime. They are not copied into the image.

```bash
# Once per project
gcloud secrets create GEMINI_API_KEY --replication-policy=automatic
gcloud secrets create WVS_API_SECRET --replication-policy=automatic
printf '%s' "$GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
printf '%s' "$WVS_API_SECRET" | gcloud secrets versions add WVS_API_SECRET --data-file=-

# Grant the Cloud Run runtime service account secretAccessor on both secrets, then:
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_VITE_WVS_API_SECRET="$WVS_API_SECRET",_REGION=us-central1
```

`VITE_WVS_API_SECRET` must equal `WVS_API_SECRET`. It is compiled into the browser bundle as a shared gate, not a user login. If it is omitted, production API routes fail closed (403 when the server secret is also unset, 401 when the server secret is set and the header is missing).

Rollback (previous revision keeps its image):

```bash
gcloud run revisions list --service=worldvision-summons --region=us-central1
gcloud run services update-traffic worldvision-summons \
  --region=us-central1 \
  --to-revisions=REVISION_NAME=100
```

This repo does not auto-deploy from GitHub. A launch is an explicit `gcloud builds submit`.
