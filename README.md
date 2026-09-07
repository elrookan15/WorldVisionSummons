# WorldVisionSummons

An early-stage Next.js application scaffold configured with authentication, a serverless Postgres database, and generative AI integration. The project appears to be laying the groundwork for a content platform with protected `/library`, `/review`, and `/projects` sections — features consistent with an AI-assisted document/content summarization and management tool ("Summons").

> **Status:** This repository currently contains project scaffolding and configuration only (no `app/` routes, pages, or UI components have been implemented yet). This README documents the technology stack and setup that has been established so far, so contributors can start building on a consistent foundation.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (React 19) |
| Language | TypeScript (strict mode) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + `tailwind-merge` / `clsx` for class management |
| Authentication | [Clerk](https://clerk.com/) (`@clerk/nextjs`) |
| Database | [Neon](https://neon.tech/) serverless Postgres (`@neondatabase/serverless`, `@neon/config`, `@neon/env`) |
| AI / Generative | [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Google Gemini API client) |
| Validation | [Zod](https://zod.dev/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Testing | [Vitest](https://vitest.dev/) (unit), [Playwright](https://playwright.dev/) + `@axe-core/playwright` (e2e / accessibility) |
| Linting | ESLint (`eslint-config-next`) |

## Project Structure

```
.
├── middleware.ts          # Clerk-based route protection (guards /library, /review, /projects)
├── neon.ts                # Neon database configuration entry point
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS content paths & theme
├── postcss.config.js      # PostCSS config (Tailwind plugin)
├── tsconfig.json          # TypeScript compiler options, "@/*" path alias
├── vitest.config.ts       # Vitest test runner configuration
├── skills-lock.json       # Locked references to Neon "agent-skills" used for AI-assisted DB tooling
└── package.json           # Scripts and dependencies
```

As the application grows, expect an `app/` directory (Next.js App Router) containing routes such as `app/library`, `app/review`, and `app/projects`, plus shared `components/` and `lib/` directories referenced by the Tailwind content globs already configured in `tailwind.config.js`.

## Key Files

- **`middleware.ts`** — Wraps requests with Clerk's `clerkMiddleware`, protecting the `/library`, `/review`, and `/projects` route groups. Falls back to passing requests through unmodified if no Clerk publishable key is configured, allowing the app to run without auth in local/dev environments.
- **`neon.ts`** — Defines the Neon database configuration using `@neon/config`.
- **`tsconfig.json`** — Configures the `@/*` import alias mapped to the project root, targeting ES2022 with strict type-checking enabled.
- **`skills-lock.json`** — Pins versions of Neon's "agent-skills" (Postgres, branching, egress optimization, object storage, AI gateway) used to assist AI coding agents working with the Neon database.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A [Neon](https://neon.tech/) Postgres database (connection string)
- A [Clerk](https://clerk.com/) application (publishable/secret keys) — optional for local dev, as middleware gracefully no-ops without it
- A Google Generative AI API key (for `@google/genai`)

### Environment Variables

Create a `.env.local` file (already git-ignored) with the variables required by Clerk, Neon, and the Google GenAI SDK, for example:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GOOGLE_GENAI_API_KEY=
```

### Installation

```bash
npm install
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint (via `next lint`) |
| `npm test` | Run the Vitest unit test suite |

## Testing

- **Unit tests** run via Vitest (`npm test`), configured with the `@/*` path alias matching the app's TypeScript setup.
- **End-to-end and accessibility tests** are supported via Playwright and `@axe-core/playwright`, though test files/config for these have not yet been added to the repository.

## Contributing

This project is in its initial scaffolding phase. When adding new routes or components, follow the existing conventions:
- Use the `@/*` import alias for root-relative imports.
- Place route-protected pages under paths matched by `middleware.ts` (`/library`, `/review`, `/projects`) if they require authentication.
- Keep Tailwind class usage compatible with the `content` globs defined in `tailwind.config.js` (`app/`, `pages/`, `components/`).
