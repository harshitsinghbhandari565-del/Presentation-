# Current decision — UUID as V1 final tie-break (2026-11-03)

AO requested a deterministic V1 order. Preserve existing relevance/featured/title/newest precedence and window pagination; append ascending document UUID. This intentionally specifies formerly arbitrary tied-row order for a fixed snapshot; it does not provide cross-request snapshot consistency or change fallback behavior. No v2 optimization or hosted migration. Evidence: `SEARCH_V2_VALIDATION.md`.

---

# Current decision — 2026-11-03: reject reconstructed search v2

Do not remove the window ranking or add an unapproved UUID tie-break: v2 changed tied results/pages and measured improvements did not meet the requested reproduction. V1 itself is not guaranteed stable across ties. AO must decide a tie contract and review new completeness/scale evidence before migration approval. No bounded-prefix v3. `SEARCH_V2_VALIDATION.md` records the reconstructed comparison and limits.

---

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

## D15 — Administrator access is owner-created, UUID-authorized, and signup-disabled

Phase 3 uses the existing Supabase Auth email/password login and `public.administrators` membership boundary. Public signup should be disabled while the Email provider remains enabled for administrator login. The owner creates their own Auth user in the Supabase dashboard; the application/chat never invents credentials. Administrator membership is granted only after the actual Auth UUID is read through the authorized Supabase workflow and confirmed with the owner. Email strings supplied by an unverified user are never an authorization source. Auth cookie/logout/config hardening must be verified before claiming production-ready administrator sessions.


## D16 — Auth hardening preserves the existing SSR flow and gates membership through AO

Approved Phase 3 hardening uses a shared public-key config guard, explicit production Secure/SameSite=Lax/host-only cookies, honest logout failure recovery, and centralized fail-closed UUID membership authorization. HttpOnly is not enabled while the browser client manages login cookies; a server-owned login/refresh flow would require separate design approval. Administrator membership for the verified owner UUID required AO confirmation with the Product Owner before insertion. That gate is now satisfied by AO’s consolidated directive; see D17. Local hardening tests do not replace hosted login/cookie/CRUD verification.


## D17 — Reconcile architecture by commit and provision only the AO-approved membership

AK’s named baseline `4307a68` is the initial `main` upload; the active AC branch carries the Supabase catalog/Auth/admin implementation. The empty Drizzle stub and optional health scaffold do not describe the catalog runtime. Preserve the working architecture and use `ARCHITECTURE_RECONCILIATION.md` as the branch/commit source of truth. AO’s consolidated directive records explicit Product Owner confirmation/approval for UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`; AC inserted exactly that row into `public.administrators` with `on conflict do nothing` and verified count/FK/idempotency. No schema redesign, new Auth account, unrelated user change, document-record change, Vercel env change or deployment was authorized or performed. Hosted browser login/CRUD remains separately gated.


## D18 — Approved frontend direction and lazy-only 3D

PO approved Geist + Newsreader, pinned storytelling + one optional 3D scene, and GLSL ambient with CSS fallback. AC removed framer-motion after verifying the installed mini entry did not provide the required LazyMotion path, preserving behavior with native CSS. Three.js is exact-pinned and loaded only after explicit intent. GSAP/Lenis/R3F/drei are not added. Search-ranking SQL and fixture seed are reviewed but unapplied; hosted application requires separate approval.

## D19 — AO correction decisions, local search and dev fixtures (2026-11-02)

PO clarified the existing pair: Geist is the heading/UI face; Newsreader is reserved for intentional editorial emphasis. Preserve `--text-*`, introduce five small motion tokens, retain CSS-first storytelling, raw GLSL with CSS fallback, and exactly one Three scene fetched only after intent. AO ratifies `three@0.187.0` and dev `@types/three@0.187.0`; no other dependency was added. Projector mode keeps the scene static; context loss reverts to the poster. Tests may override WebGL's major-caveat flag only in the headless test harness, never application code.

The ranking RPC remains an **unapplied local proposal**. It uses an OR lexeme candidate superset (existing document GIN plus separately matched subject/course IDs), then applies the original full websearch query and A/B/C/D ranking to candidates, retaining security invoker/RLS/grants and exact filter/sort/pagination rules. No hosted schema or index alteration is authorized. The existing document-vector fallback cannot match joined names, so its reduced scope is made visible; other RPC failures are errors. Existing no-Supabase compatibility remains. Browser visual fixtures are synthetic, outside `public/`, guarded by `NODE_ENV=development` and never a hosted/production catalog or seed. See `FRONTEND_CORRECTIONS.md` for exceptions and evidence.
