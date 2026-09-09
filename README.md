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
