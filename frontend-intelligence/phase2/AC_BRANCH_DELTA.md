# AC branch delta — the pack re-synced against AC's real code

**AK · 2026-11-02 · read-only inspection of `origin/AC-Branch` @ `cac9c7f145abe99bd12a8831cc371e370fbe35d5`** ("Refresh Auth handovers and verification records after hardening").
Method: GitHub contents + git-trees API on that exact SHA — every `[VERIFIED-FILE]` below is a line I read today. **Nothing in AC's branch was modified**; per mission rules the findings are reported, not fixed.

**Why this file exists:** `audit/stack-audit.md` (Phase 1) described 26 files / 1,861 LOC / 1 JSON record / "no Supabase". AC has since built the real thing. Several Phase 1 premises — and therefore some Phase 2 sentences — are stale. This is the correction, so AO and AC never plan against the old baseline.

---

## 1. Baseline shift (measured today)

| dimension | pack's Phase-1 baseline | AC @ `cac9c7f` | consequence for the pack |
|---|---|---|---|
| `src/` files | 26 files, 1,861 LOC | **75 files**; 48 `.tsx`, **18 with `"use client"`** | "tiny codebase, no component zoo" framing is out of date; the design-system rules matter **more** now |
| routes | 4 (`/`, `/presentation/[id]`, `/api/health`, not-found) | **18 route files**: `/`, `/library`, `/subjects`, `/subjects/[slug]`, `/resources/[slug]`, `/presentation/[id]`, `/about`, `/api/health`, `/api/search`, `admin/{login,logout-error,access-denied,page,categories,resources/new,[id]/edit}` + `admin/layout` | **Phase 2's blueprint covered public routes only — it is incomplete.** Admin CRUD needs the same tokens/surfaces/states; `FRONTEND_IMPLEMENTATION_SEQUENCE.md` gets a new step (see §4) |
| data layer | "no Supabase/admin/auth; `src/db/schema.ts` = `export {}`" | `@supabase/supabase-js 2.118.0` + `@supabase/ssr 0.12.7`, **`supabase/migrations/202611010001_catalog.sql` (8.4 KB) with tables `administrators · subjects · courses · documents`**, RLS via `is_administrator()`, plus `…0002_least_privilege_catalog_grants.sql` | **D1 closed by AC.** Any pack line that says "decide the backend first" is obsolete |
| `src/db/schema.ts` | `export {}` | still **155 bytes, zero tables** | The Drizzle path is dead weight next to the Supabase migration — **AO decision**: keep both or delete `src/db/*` + `drizzle.config.json`. Flagged, not touched |
| lockfile | none committed | **present** | Phase 1 §1 "no lockfile" risk closed |
| `next` / `react` | 16.2.6 / 19.2.6 | **16.4.3 / 19.2.6** | Half of D2 done. **React is still 19.2.6** → React's `<ViewTransition>` element is still unavailable; the *native* VT API works. `COMPATIBILITY_MATRIX.md`'s note is confirmed, not stale |
| fonts | `next/font/google` | **`@fontsource-variable/geist@5.3.0` + `@fontsource-variable/newsreader@5.3.0`** (self-hosted; AC's `KNOWN_ISSUES.md` says the move was forced by a build-time Google Fonts failure) | The `next/font` metric-adjustment/FOUT story is gone; my audit §5.5 note must be read as "fontsource + a broken token" (see §2) |
| motion libs | framer-motion ^12.43.0 only | **unchanged**: framer-motion ^12.43.0, no `gsap`, no `lenis`, no `three`, **0 `animation-timeline` in 63 KB of CSS**, **0 motion/easing tokens**, 2 `@keyframes`, 3 `backdrop-filter`, 1 `prefers-reduced-motion` block, no `<canvas>` | `RECOMMENDED_STACK.md` Tier 0/1 is still exactly the right prescription — nothing has been adopted yet |
| theme mechanics | `data-theme` + ~15 `!important` | `data-theme` ×10, **`!important` count 4**, **0 `dark:` utilities anywhere in 48 tsx files**, `@theme` block present, **no `@custom-variant dark`** | Phase 1 recipe **R2 is largely done** — and my `@custom-variant dark` suggestion is now **optional, not required** (there are no `dark:` utilities to redirect). The remaining `!important`s are the residual, not the architecture |
| `html { scroll-behavior: smooth }` | present | **still present** | Only matters if Lenis lands (Tier 1): it must be removed then `[VERIFIED-DOC]`. Recorded so AC doesn't have to rediscover it |

## 2. Four live defects found in AC's committed CSS/SQL (report, don't fix)

| # | evidence @ `cac9c7f` | why it matters | fix (one line each) |
|---|---|---|---|
| **A1** | `src/app/globals.css`: `--font-editorial: var(--font-editorial), Georgia, serif;` — a custom property that references **itself** | CSS treats a self-referential custom property as invalid **at computed-value time**, so every consumer (`em`, `.step-number`, `.visual-caption`, `.sheet-middle > span`, …) silently falls back to the inherited family. **Newsreader is not being applied through that token at all** — and this is also the exact bug `ACCESSIBILITY_GUIDELINES.md` §8 and Phase 1 §5.5 flagged, still present after the font migration | `--font-editorial: var(--font-newsreader), Georgia, serif;` (whatever the fontsource variable is) — or inline the family name once |
| **A2** | `search_vector` is `to_tsvector('simple', title \|\| ' ' \| description \|\| … )` with **no `setweight`**, and `searchCatalog()` does `.order("is_featured",{ascending:false})` **then** `.textSearch(...)` | Title matches are weighted the same as a passing word in a 3,000-char description; and "featured first" outranks relevance in practice, so a good title match can sit below a weak match on a featured doc | `setweight(to_tsvector('simple', coalesce(title,'')), 'A')` + B/C on topic/tags/description, and order by `ts_rank` with featured as a *tie-breaker*. 20-query before/after per `ACCESSIBILITY_GUIDELINES.md` §7 |
| **A3** | `documents.embed_url` check constraint: `embed_url like 'https://docs.google.com/%'` | **Dropbox documents cannot be embedded by policy** — so on Dropbox rows the detail page is link-only. Any design that assumes "every card has a live preview" is wrong; the card must look complete *without* a preview (which is what `VISUAL_DESIGN_PATTERNS.md`'s generated-cover spec already delivers) | product decision: either widen the check to a Dropbox preview host allow-list, or design the Dropbox state explicitly (I recommend the latter first) |
| **A4** | `supabase/seed.sql` contains **0 insert rows**; `documents` therefore starts empty in every fresh environment | The **empty state is the default state** of this product today. Phase 2's "showcase for a collection" premise is still unmet, and the first thing a reviewer will see is nothing at all | seed the migration with 12–24 realistic rows (AO to supply real metadata); design review should happen against seeded data, not an empty DB |

## 3. What AC has already shipped from the pack (credit where due)

Server-rendered landing (`src/app/page.tsx` has no `"use client"`, uses `await`) → **recipe R1 done**. `GET /api/search` + `searchCatalog()` + `getFacets()` + `Promise.all` + `limit` defaults → the discovery spine of R7 exists. Graceful degradation when Supabase is unconfigured (`if (!client) return searchDocuments(compatibilityDocuments, …)` + a `CatalogUnavailableError`) → the R8 "must not break without the DB" principle implemented. Tight DB validation (slug/title length, URL must not contain userinfo, `backup_links` jsonb array ≤5, `keywords`/`tags` ≤20, partial indexes on `publication_status='published'`) → this is a **design-system opportunity**: those checks mean cards can rely on 3–160-char titles and ≤20 tags, so the metadata hierarchy can be fixed-height without ellipsis surprises. `[VERIFIED-FILE]`

## 4. Revised implementation order for AC (delta to `FRONTEND_IMPLEMENTATION_SEQUENCE.md`)

| step | was | now |
|---|---|---|
| 1 | fix tokens/R2 theme refactor | **replace with A1 + A2** (the font token + the search weights) — R2 is ~done, these two are not |
| 2 | `framer-motion@14.9.0` upgrade + `/mini` for −15.2 KB gz | unchanged, still the cheapest measured win; `framer-motion` needs no package rename (`14.9.0` exists for both names) |
| 3 | Tier-0 motion tokens + reveals | unchanged — **63 KB of CSS with 2 keyframes and 0 scroll-driven rules** means the entire reveal/progress layer is still ahead of us; add `--motion-*`/`--ease-*`/`--move-*` to the existing `@theme` block |
| 4 | hero + card polish | unchanged, and now must respect A3 (no embed for Dropbox rows) |
| 5 | seed data (was "ask the owner") | **blocking**: A4 — no seeded data, no review |
| 6 | React 19.3.1 bump for `<ViewTransition>` | unchanged, still optional; native VT is available now |
| **+7** | — | **NEW: bring `/admin/*` into the system** — 7 admin route files exist and will otherwise drift into a second, undesigned UI. Same tokens, same focus/skeleton/empty-state rules; explicitly **no** transition softening on `admin/access-denied` (fail-closed must stay instant) |
| 8 | Tier-1 Lenis gate (needs `html{scroll-behavior:smooth}` removed) | unchanged |
| 9 | Tier-2 3D (D3 approval) | unchanged |

## 5. Decisions — current state after the delta

| ID | question | state |
|---|---|---|
| **D1** | data source | ✅ **closed by AC** — Supabase + `supabase/migrations/*_catalog.sql`, least-privilege grants, RLS |
| **D7** | `semester` normalised vs string | ✅ **closed by AC as `semester text` (1–60 chars)** — note the trade-off now on the record: facet lists will show free-text variants ("Sem 4" / "4th" / "2024-25 Sem 4") until a `terms` lookup table exists; the frontend must **not** invent a normalised label format, and `courses` (already a table with `name`/`slug`) is the pattern to follow if the PO wants clean facets |
| **D6** | keep Newsreader | ✅ effectively closed — both faces are now self-hosted via fontsource |
| **A1/A2/A3/A4** | the four defects | → **new AO/AC items**, this file is the evidence |
| `src/db/*` + `drizzle.config.json` | dead or intentional? | **open** — delete-or-keep is AC/AO's call |
| **D3** 3D scope · **D4** GSAP licence · **D5** `cmdk` · **D8** `content-visibility` | | **all still open** (nothing in AC's tree touches them: 0 `<canvas>`, no `gsap`, `cmdk` absent — and the palette itself is now `/api/search`-backed, which strengthens D5) |

## 6. Net effect on the pack

Nothing in `REPOSITORY_ATLAS.md`, `WEBSITE_ATLAS.md`, `prototype-lab/`, `TECHNOLOGY_COMPARISON.md`, `PERFORMANCE_BUDGETS.md` is invalidated by AC's progress — they are library/technique facts. What shifts is **emphasis**: the remaining frontend opportunity is now (1) the motion layer on top of an already-correct, already-server-rendered, already-tokenised app, (2) fixing A1/A2/A4 so design review happens against real data and real type, and (3) extending the system to `/admin` and the no-preview Dropbox case. `AC_IMPLEMENTATION_PLAYBOOK.md` §1 still opens with "no Supabase, 1 record", which is now wrong — AC should read **this file first** and treat that section as history.
