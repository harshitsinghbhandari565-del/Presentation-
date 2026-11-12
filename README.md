# Harshit Presentation Hub

A premium educational resource discovery hub for students. Find presentations, notes and practice material by subject, course, topic and source — then open the original document directly. **No uploads, no cloud sync, no student accounts.**

## What works locally

- Editorial animated landing page with real featured resources and subject previews
- Searchable library with composable filters, sorting, pagination and shareable URL state
- Canonical document pages with metadata, original/presentation/backup links and opt-in preview
- Subject/course browsing, command palette, dark/light/system themes and projector mode
- Responsive mobile navigation/filter disclosure and reduced-motion support
- SQL Workbench: real in-browser SQLite sandbox, sample databases, SQL editor and CSV/SQL export; see `docs/SQL_WORKBENCH.md` for scope and limitations
- Private admin source with server-side administrator checks, CRUD/archive/confirmed delete, categories and preview
- SEO metadata, canonical/OG routes, robots/sitemap and LearningResource structured data
- Supabase migration/seed with RLS, constraints, indexes and full-text search

Without Supabase configuration, the app serves the compatibility catalog, which is currently empty. Admin shows setup instructions rather than fake persistence.

## Stack

Next.js 16.4.3 · React 19.2.6 · TypeScript 5.9.3 · Tailwind CSS 4 · Framer Motion · Lucide · local Geist/Newsreader fonts · Supabase JS/SSR · PostgreSQL/RLS · Playwright/axe · PGlite policy tests. The existing optional Drizzle/PostgreSQL health scaffold is retained.

## Quick start

```bash
npm ci
cp .env.example .env.local   # optional; fill only real values
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Open http://localhost:3000. Node 22+ is required.

## Verify

```bash
npm run check          # lint, typecheck, unit + PostgreSQL policy tests, production build
npx playwright install chromium
npm run test:e2e       # browser + axe checks
npm audit --omit=dev --audit-level=high
```

See `VERIFICATION.md` for historical verification and `docs/SQL_WORKBENCH.md` for the workbench test scope and current limitations. Run the commands above for current results.

## External setup still required

For a new installation, follow `DEVELOPMENT_GUIDE.md` to configure Supabase/Auth, apply the reviewed migration/seed, grant administrator membership, verify original sharing permissions, set `NEXT_PUBLIC_SITE_URL` and deploy only after approval. Never expose a service-role/secret key in frontend code.

## Project map

- `src/lib/catalog.ts` — centralized public catalog boundary
- `src/lib/urls.ts`, `search.ts`, `document-validation.ts` — safety and discovery logic
- `src/app/` — public, admin, SEO and API routes
- `src/components/` — landing, library, documents, admin, theme/projector and layout
- `supabase/` — reviewed migration and idempotent real-resource seed
- `src/data/presentations.json` — compatibility catalog
- `tests/` — unit, PostgreSQL policy and browser/accessibility tests

## Continuity docs

`REPOSITORY_AUDIT.md` · `PROJECT_CONTEXT.md` · `IMPLEMENTATION_PLAN.md` · `PROGRESS.md` · `DECISIONS.md` · `KNOWN_ISSUES.md` · `DEVELOPMENT_GUIDE.md` · `VERIFICATION.md`

## License

MIT, as in the original repository.
