# Repository audit — Phase 0

Audit date: 2026-11-01  
Baseline: `4307a6884527e22af27541cd76722867e5e6bb14` (`Initial upload of Harshit Presentation Hub`)  
Scope: all 34 tracked files, application behavior, build/tooling, database placeholders, and connected service inventory. No production or database changes were made during the audit.

## Executive summary

This is an existing, deliberately styled classroom presentation hub, not an empty repository. It contains one real educational resource, a featured-card dashboard, a resource detail route, a command palette, persistent theme/projector controls, and backup-link/copy actions. The visual foundation is worth preserving. It is not yet the broader document-discovery product described in the project brief.

The most urgent issues are a production build coupled to unavailable Google font downloads, dashboard search that does not render its results, and the lack of a real resource data/admin layer. There is no evidence of an existing deployed backend or live resource database to migrate.

## 1. Existing architecture and stack

- Next.js 16.2.6, App Router, React 19.2.6, strict TypeScript 5.9.
- Tailwind CSS 4 plus a custom CSS design system in `src/app/globals.css`.
- Framer Motion 12 and Lucide icons.
- Google Fonts through `next/font/google`: Geist and Newsreader italic.
- Central JSON source: `src/data/presentations.json`, with one real record.
- Shared TypeScript resource/backup types; small presentation and search helpers.
- PostgreSQL/Drizzle/pg dependencies, but `src/db/schema.ts` exports nothing. No models, migrations, policies, or content queries exist.
- `/api/health` is the only API route. It requires `DATABASE_URL` at module initialization.
- No authentication, authorization, admin routes, mutations, uploads, or storage integrations.
- No tests, lockfile, `.gitignore`, environment example, CI, sitemap, robots file, or deployment configuration at baseline.
- Git history is a shallow/grafted initial commit; earlier decisions are not available. The README is the main record of original intent.

### Existing routes

| Route | Actual baseline behavior |
| --- | --- |
| `/` | Client-rendered featured resource, subject filter, search count, quick stats, hardcoded backup card |
| `/presentation/[id]` | Server-rendered resource detail, external launch and backup/copy actions; unknown ID renders a 404-style message with HTTP 200 |
| `/api/health` | Database `select 1`; without configuration returns an error, observed as an HTML 500 in development |
| Other routes | Next.js not-found page |

## 2. Content and functionality already present

- One real resource: `english-lost-spring-mcqs`, “MCQs Practice”, English, “Ch 2 – The Lost Spring”.
- Original Google Slides URL, separate presentation/embed URLs, and a Dropbox backup URL. These must be preserved exactly; their external permission/availability was not verified.
- `pinned`, tags, subject, topic, description and platform metadata.
- External anchors already use `target="_blank"` and `rel="noopener noreferrer"`.
- Clipboard API with a legacy fallback.
- Dark/light/system cycling and projector preference stored in localStorage.
- Early theme initialization and system-theme subscription.
- Command/Ctrl+K command palette with resource search and route navigation.
- Glass cards, ambient background, staggered entry motion, reduced-motion CSS and a skip link.
- Responsive baseline: no horizontal page overflow observed at 390px or 1440px.
- Lint and TypeScript checks pass at baseline.

“Implemented in source” does not imply production-ready. No student login is required, which already matches the product vision.

## 3. Confirmed bugs and incomplete behavior

### P0 — production build fails in this environment

`npm run build` fails while fetching Geist and Newsreader from Google Fonts. The development server substitutes fallback fonts. This couples deployment to a third-party build-time network request and changes the intended typography.

Safe fix: self-host the same font families using licensed npm font packages and `next/font/local`.

### P1 — dashboard discovery does not actually filter displayed resources

Typing `not-present` leaves “MCQs Practice” visible. `filtered` is used only for the count; the dashboard always renders the same pinned card. There is no results grid or empty state. Search omits descriptions and uses case-sensitive tag comparison. Search logic is duplicated in three places.

Safe fix: one typed query/filter/sort module; render actual results, result counts and recovery actions.

### P1 — light theme is fragile and low-contrast

The theme overrides escaped literal Tailwind class names with `!important`. Fixed text colors remain on several surfaces. The fixed ambient vignette darkens the light page background. Screenshots confirm inconsistent surfaces and weak muted/footer contrast. Static token combinations such as `#94a3b8` on white do not meet normal-text contrast requirements. Automated axe did not flag every visual contrast issue, so it is not a substitute for token review.

Safe fix: semantic theme variables and reusable component styles instead of class-name overrides; test both themes.

### P1 — mobile hierarchy and touch targets

At 390px, the absolutely positioned Featured badge overlaps the resource heading. Header controls are 32px high and several chip/action targets are smaller than the README’s claimed 48px minimum. Search appears below the entire featured card on mobile.

Safe fix: intentional mobile navigation, in-flow badges, larger touch targets and discovery-first content order where appropriate.

### P1 — command dialog accessibility

The dialog has no focus trap, background inertness or explicit focus restoration. Escape handling is attached only to the input. Arrow scrolling uses the previous selected index. The “Recent” heading actually shows pinned resources, not recently opened resources.

Safe fix: native modal dialog or a complete focus-management implementation, accurate labels, correct active-descendant selection and scroll behavior.

### P1 — unsafe/unvalidated future link input

Existing links are HTTP(S), but no shared validator exists for future administrator input. The primary action uses `presentUrl` rather than the original URL. A generic document platform must not silently turn a sharing URL into a presentation URL or claim download/preview availability.

Safe fix: canonical external-link component, HTTP(S)-only validation, reject credentials and unsafe schemes, preserve original URLs, and keep presentation mode explicitly optional.

### P1 — no resource persistence or administration

The database schema is empty. All content changes require a source edit/redeploy. No auth or write API exists. A hardcoded Dropbox backup on the dashboard is unrelated to the active filter and duplicates data.

Safe fix: a relational metadata model and authenticated admin CRUD. Do not add document uploads or storage-provider OAuth.

### P2 — health and not-found semantics

The missing database configuration causes a module-level throw rather than a structured unavailable response. Unknown document routes render “not found” without calling `notFound()`.

Safe fix: optional configured database health with JSON 503 when unconfigured; true not-found handling.

### P2 — motion, clipboard and SEO gaps

- CSS reduced-motion rules do not disable Framer Motion’s JavaScript transforms; use `MotionConfig` as well.
- The legacy copy fallback can report success even when `execCommand('copy')` returns false; timers are not cleaned up.
- Resource titles/descriptions are not used for route metadata; favicon is not linked; canonical/OG/sitemap/structured data are absent.
- No course, semester, document type, publication status or timestamps exist in the resource model.

## 4. Design and UX assessment

Preserve: the Harshit identity, dark-first editorial direction, indigo accent, glass surfaces, real classroom use case, backup access and projector mode.

Improve: product-level hero and navigation; consistent semantic tokens; clear Open Document action; genuine resource cards and thumbnails; search/filter/sort visibility; subject/course organization; responsive header; accessible empty/error states; intentional scroll and hover motion. Avoid fake resource counts, fake availability indicators and decorative play buttons that do not behave like buttons.

The existing “Ready to Present” indicator is not a live availability check. New UI should describe the source, not imply verified uptime.

## 5. Database and external services

- Connected Supabase: authenticated tool access works; project list is empty.
- Connected Vercel: authenticated tool access works; project list is empty.
- No live database migration was attempted; there is no existing data to overwrite.
- `drizzle.config.json` contains a local development PostgreSQL example, not a deployed service or an application secret.
- No Supabase/Vercel project was created during this audit. Provisioning, cost/region and an administrator identity remain deployment decisions.
- The original Google/Dropbox resources remain externally hosted. Their sharing permissions must be checked by the owner before launch.

## 6. Verification performed

| Check | Baseline result |
| --- | --- |
| `npm install` | Successful; generated a lockfile locally |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run build` | Fail: Google Fonts network fetch |
| Home/detail in Chromium | Rendered; desktop and mobile screenshots inspected |
| Search with no matches | Bug reproduced: featured card remains visible |
| Theme toggle | Works when app hydrates; light visual defects confirmed |
| Command palette | Input receives focus; no focus trap |
| axe WCAG A/AA scan | One serious `aria-prohibited-attr` finding on StatusOrb; visual review found additional concerns |
| Database health | Unconfigured failure; no successful DB operation claimed |
| Responsive overflow | No horizontal overflow at 390/1440px |
| Production deployment | Not present/not tested |

Testing note: an initial browser request to `127.0.0.1` hit Next.js’s development-origin protection and prevented hydration. Repeating on `localhost` produced valid interactive results. Preview/dev origin configuration must explicitly support the Arena proxy; that environment issue was not counted as an application theme bug.

## 7. Technical debt and recommended direction

1. Make builds deterministic and protect local environment/generated files.
2. Introduce a richer document model while retaining a read-only JSON compatibility source until a database is provisioned.
3. Centralize validation, search and external-link handling; stop importing raw JSON into multiple components.
4. Replace literal-color overrides with semantic tokens. Keep Tailwind/Framer Motion; no framework rewrite.
5. Build public discovery before admin writes; preserve `/presentation/[id]` links.
6. Use Supabase Auth/Postgres with row-level security for the hosted backend. The existing PostgreSQL/Drizzle code can remain a compatibility health integration, not a second competing content store.
7. Add unit, browser and accessibility coverage, then verify a real authenticated admin workflow after service setup.
8. Deploy only after build, public flows and access-control checks pass. Never describe a local preview as a production deployment.

## 8. Prioritized roadmap

- **Phase 0:** this audit and continuity records — complete.
- **Phase 1:** self-host fonts, environment safety, richer metadata, validation, centralized queries and test harness.
- **Phase 2:** polished landing page, responsive navigation, semantic themes, restrained motion, preserved projector mode.
- **Phase 3:** real searchable library with subject/course/semester/topic/type/platform filters and sorting.
- **Phase 4:** canonical document detail pages, original-link opening, related resources, honest previews and legacy redirects.
- **Phase 5:** Supabase schema/RLS and private admin CRUD; live activation requires project configuration and an administrator account.
- **Phase 6:** browser/unit/a11y regression tests, SEO, performance and security review.
- **Phase 7:** verified hosting/database deployment, production smoke tests and operational handoff.

The current implementation milestone covers Phases 1–4 and prepares Phase 5. A feature is not marked live or complete until its required services and behavior are verified. See `PROGRESS.md` for the actual current state.

---

## Implementation update — 2026-11-01

The baseline findings above are preserved as historical evidence. Since the audit, the existing Next.js/React architecture was extended (not replaced): local fonts, centralized catalog/validation, premium responsive public experience, URL-driven discovery, canonical/legacy document routes, private admin source, Supabase migration/RLS/seed, SEO/error surfaces and automated tests were added. The original JSON resource and its URLs remain unchanged.

Local verification now passes lint, typecheck, 14 unit tests, 8 PGlite PostgreSQL/RLS tests, production build, 11 production-server Playwright tests and axe checks in both themes. Production dependency audit is clean. See `VERIFICATION.md` for exact scope.

**Still unresolved externally:** no Supabase project/administrator/applied migration, no Vercel project/deployment, no confirmed production origin, and no owner verification of external sharing permissions. Hosted admin persistence/auth and deployment are not claimed complete. The Arena public proxy URL could not be fetched from inside the sandbox; local production browser checks passed. Current blockers and next actions are in `KNOWN_ISSUES.md`, `PROGRESS.md` and `DEVELOPMENT_GUIDE.md`.
