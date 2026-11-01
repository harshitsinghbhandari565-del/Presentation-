# Architecture and product decisions

Updated: 2026-11-01

## D1 — Extend the existing project, do not rewrite it
The baseline already had Next.js App Router, React, Tailwind, Framer Motion, Harshit branding, theme/projector controls, a command palette and one real resource. These were retained and refactored behind shared boundaries. The original JSON file and all three original URLs remain unchanged. Legacy `/presentation/[id]` redirects to canonical `/resources/[slug]`.

## D2 — Metadata and original links only
The platform never uploads, copies, syncs or proxies documents. “Open Document” uses the original external URL directly in a new tab with `noopener noreferrer`. No Drive/Dropbox API or OAuth integration is needed merely to redirect. Optional Google embeds are user-initiated and permission-dependent.

## D3 — Centralized catalog with honest compatibility mode
`src/lib/catalog.ts` is the public data boundary. Without Supabase env values it serves the untouched original JSON record; with configuration it reads published Supabase rows. Components never hardcode document cards. Missing semester/dates/thumbnails stay null rather than being invented. The UI labels compatibility mode.

## D4 — Supabase for persistence and administrator Auth only
A backend is genuinely needed for private, durable CRUD. Supabase was chosen per the product preference. The app uses public/publishable keys plus RLS and SSR cookie sessions; it never uses a service-role key. The existing optional Drizzle/PostgreSQL health scaffold was retained rather than deleted.

## D5 — Explicit administrator membership, fail closed
Authentication alone is not authorization. Server pages and actions require an authenticated user whose UUID exists in owner-controlled `public.administrators`. A restricted `SECURITY DEFINER` membership function with empty search path supports RLS. Unconfigured mode shows setup instructions, not fake persistence. Public signup should be disabled by the owner for this single-admin product.

## D6 — Archive first, destructive delete confirmed
Archiving hides a resource while retaining metadata and is reversible through editing. Permanent metadata deletion requires typing the exact slug and never touches the external document. Category deletion is not exposed; foreign keys protect associations and categories can be renamed.

## D7 — Defense-in-depth URL validation
Shared validation allows only public HTTP(S), rejects dangerous schemes, embedded credentials, whitespace/control characters, localhost/internal suffixes and IP literals. Database constraints provide a second layer. Validation never fetches the destination or changes permissions. Source availability is not represented as live uptime.

## D8 — URL-driven discovery and bounded queries
Search/filter/sort/pagination state lives in the URL. PostgreSQL uses a generated simple-text search vector, GIN index and targeted indexes; compatibility mode uses equivalent normalized matching. Landing uses limited featured/recent queries and exact counts; facets come from a security-invoker RPC; related resources use a bounded candidate window; subject pages paginate; sitemap/export reads use batches. No silent 1,000-record discovery cap.

## D9 — Editorial visual system, mobile-first behavior
Local Geist + Newsreader, restrained indigo accents, semantic dark/light tokens, document-stack hero and intentional scroll reveals replace inconsistent glass/gradient overrides. Mobile uses a real navigation menu and filter disclosure rather than a shrunk desktop sidebar. Motion respects reduced-motion preferences; decorative floating animation is disabled on touch/reduced motion.

## D10 — Verification before completion claims
Local gates include lint, typecheck, unit tests, PGlite migration/RLS tests, production build, production-server Playwright/axe and screenshot inspection. PGlite is not hosted Supabase; local browser success is not deployment success. External setup and hosted admin verification remain explicit blockers in `KNOWN_ISSUES.md`.

## D11 — Dependency security without destructive forced fixes
Next.js/eslint-config-next were upgraded to 16.4.3 and PostCSS to 8.5.32; production audit is clean. Moderate development-only advisories in retained Drizzle Kit/ESLint toolchains are documented rather than “fixed” by npm’s suggested breaking downgrades.


## D12 — Production activation is audited and non-destructive

The 2026-11-01 read-only audit (`SUPABASE_AUDIT.md`) found an existing empty Supabase project and an existing Vercel deployment. Reuse both. Confirm the database target before applying the exact reviewed transactional migration and non-overwriting seed. Preserve the original JSON and external URLs. Keep administrator membership owner-controlled, use only public client keys, and do not enable writable preview deployments against production data without an explicit isolation decision. Address the documented cookie/config/logout/health findings within the existing architecture before claiming production readiness.


## D13 — Hosted default privileges require explicit least-privilege remediation

The hosted Supabase verification found default privileges broader than the reviewed migration intended, including `TRUNCATE` for `anon` and `authenticated` on catalog tables. RLS blocked unauthorized DML probes, but `TRUNCATE` is not RLS-controlled. Do not treat the database as production-ready until a separate approved transactional migration revokes excess grants and re-grants only intended privileges. Do not alter global default privileges or use destructive workarounds without explicit review.

## D14 — Apply catalog least-privilege grants without changing global defaults

The owner approved and the project applied `202611010002_least_privilege_catalog_grants.sql` as hosted migration `20261101153928`. `anon` receives SELECT only on `subjects`, `courses` and `documents`; `authenticated` receives SELECT/INSERT/UPDATE/DELETE, with existing RLS policies remaining the authorization boundary. Neither role receives TRUNCATE, REFERENCES, TRIGGER or MAINTAIN. Global Supabase default privileges were intentionally left unchanged, so every future public table migration must include explicit least-privilege grants and post-migration privilege verification.
