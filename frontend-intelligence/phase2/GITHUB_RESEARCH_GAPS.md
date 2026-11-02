# Phase 1 Audit, Superseded Claims, Research Gaps

**AK · 2026-11-02 · Phase 2 opening deliverable.** Purpose: audit my own Phase 1 pack, re-verify it against the repo's *current* reality, and state exactly what Phase 2 must add. Nothing here deletes Phase 1 content — `frontend-intelligence/` history is preserved; where a Phase 1 claim is now wrong or stale it is marked and the correction is given here.

---

## 1. Why the audit changed the picture: AC has moved on two sibling branches

Phase 1 was grounded in `main` @ `4307a68` (26 `src/` files, 1,861 LOC, one JSON record, no backend) `[VERIFIED-FILE]`. That is still true of `main`. It is **no longer true of the project**.

| Ref | Tip | `src/` files | LOC | Data layer | Tests / CI | Animation | Design foundation |
|---|---|---|---|---|---|---|---|
| `main` | `4307a68` | 26 | 1,861 | `presentations.json` (1 record) | none | framer-motion ^12.43, 1 usage | Geist + Newsreader via `next/font/google`; `!important` light mode |
| `origin/arena/019fbda9-presentation` | `64abe95` "Phase 3: Micro Polish" | **88** | **4,155** | `presentations.json`, **client-side** (`"use client"` + static import + `mounted` flag) | **0** supabase/playwright/`.github` hits | framer-motion ^12.43 | **"Vault/obsidian"**: `src/tokens/{colors,typography,spacing,motion,shadows,z-index}.css`, `src/themes/{dark,light}.css`, `.ov-*` primitives (`button`,`card`,`badge`,`modal`,`skeleton`,`toast`,`toggle`…), **Inter + Space Grotesk + JetBrains Mono** via `next/font/google` |
| `origin/arena/c9d0d599-presentation` | `380afc8` | **71** | **1,874** | **Supabase + Drizzle**: `documents` table (slug, `subject_id`, `course_id`, `semester`, `topic`, `document_type`, `keywords[]`, `tags[]`, `publication_status`, `embed_url`, `backup_links jsonb`, generated `search_vector` + GIN), `get_catalog_facets()` RPC, RLS + `is_administrator()`, `supabase/migrations/202611010001_catalog.sql`, `.env.example` | **Playwright 1.64 + `@axe-core/playwright` 4.14 + pglite + `tests/{unit,e2e,database}` + `.github/workflows/ci.yml`** | framer-motion ^12.43 + `<MotionConfig reducedMotion="user">` in `layout.tsx` | tokenised CSS custom properties (`--bg/--surface/--accent/--text-*`), `:root[data-theme="light"]` (no `!important`), `next/font/local` over `@fontsource-variable/{geist,newsreader}` woff2 (variable weights), robots/sitemap/LearningResource JSON-LD |

Evidence: `git ls-tree`/`git show`/`git grep` on those refs, 2026-11-02 `[VERIFIED-FILE]`. Both branches are read-only inspections — AK changed nothing on them.

**Consequence for this pack:** the frontend-intelligence layer must now be designed against a *server-component + Supabase + Playwright/aXe* codebase (`c9d0d599`) that already implements ~70 % of Phase 1's Phase-0 recommendations, and it must not be designed against `main`.

## 2. Phase 1 claims, re-audited one by one

| # | Phase 1 claim (where) | Status today | Correction / action |
|---|---|---|---|
| 1 | "No Supabase, admin or auth anywhere; brief's backend premise unverified" (`audit/stack-audit.md` §1, playbook §1, `AO_HANDOVER.md` §2.1, U1) | ✅ true of `main`, ❌ **superseded** by `c9d0d599` | Decision **D1 is answered**: Supabase + Drizzle + RLS. Phase 2 designs against the real schema (facets from `get_catalog_facets()`, search from `search_vector`) |
| 2 | "Faceting needs `semester`/`course`/`documentType`, which don't exist" (playbook §1.2, §15 D1/D7) | ❌ **resolved on `c9d0d599`** | All three exist as real columns with CHECK constraints; `semester` is free text (≤60) — so **D7 (normalised term+year)** is still open and is now a *migration* decision, not a greenfield one |
| 3 | "Landing page is `"use client"` + `useEffect` fetch → no SSR" (R1, audit §5.1) | ❌ **fixed on `c9d0d599`** (`async` server component, `revalidate = 60`, `Promise.all([getCatalogHighlights(), getFacets()])`) · ⚠️ still client-only on `019fbda9` (static JSON import) | R1 stays valid as a *pattern*; re-scoped to "bring the Vault branch to the same server/data boundary" |
| 4 | "Light mode is `!important` overrides on arbitrary hex utilities; fix with `@custom-variant dark` + plain `@theme`" (audit §5.2, R2) | ❌ superseded on `c9d0d599` (proper `:root` + `[data-theme="light"]` token blocks); ⚠️ `019fbda9` uses its own token files instead | R2 was right in spirit; the *implementation now on the table* is "CSS custom-property tokens + per-component `.css` files" (Vault) vs "@theme + utilities" (Tailwind). Phase 2 must recommend **one** — see `AO_FINAL_FRONTEND_BLUEPRINT.md` §4 |
| 5 | "`next/font` collision on `--font-editorial`" (audit §5.5) | ⚠️ **partially fixed, one real defect remains** on `c9d0d599`: `@theme { --font-editorial: var(--font-editorial), Georgia, serif }` is a **self-referential declaration** (Tailwind's `:root` token and next/font's html-scoped variable share a name). Every *consumer* re-states `var(--font-editorial), Georgia, serif`, so the visible failure mode is limited to the Tailwind `font-editorial` utility being invalid-at-computed-value-time; but two writers on one property at `:root` is cascade-order-dependent and fragile | **Report to AO/AC (do not fix from here):** rename the Tailwind token (e.g. `--font-display: var(--font-editorial), Georgia, serif`) and keep `--font-editorial` owned solely by `next/font/local`. Also note the *consequence I got wrong in Phase 1*: because the variable now points at `@fontsource-variable/newsreader` **italic-only** woff2 with `style:"italic"`, non-italic serif is not available — the serif is italic by construction on `c9d0d599` |
| 6 | "`html{scroll-behavior:smooth}` conflicts with Lenis — delete it when Lenis lands" (`audit`, R5) | ⚠️ still present on `c9d0d599` (`html { scroll-behavior: smooth; scroll-padding-top: 105px }`) **plus** a new `data-scroll-behavior="smooth"` attribute on `<html>` | Guidance unchanged and still needed; the attribute suggests AC is already gating smooth-scroll, which is the right shape for a Lenis toggle |
| 7 | "Upgrade `next` 16.2.6 → 16.4.3 and React → 19.3.1 for zero-config View Transitions" (D2, playbook §3) | ⚠️ **half-taken**: `c9d0d599` is on next **16.4.3**, both branches on react **19.2.6** | The `<ViewTransition>` component still needs React 19.3.x. Re-verified on 2026-11-02 that react latest = 19.3.1 → **D2 stays open**, and now it is a small, isolated change on top of 16.4.3 |
| 8 | "framer-motion 12 → 14 upgrade" (playbook §3) | ❌ not taken on either branch (both `^12.43.0`) | Still a recommendation, not a fact; must be re-verified against the **12.43 → 14.9 breaking surface** in Phase 2 (Vigia removals, `isValidProp`) before AC attempts it |
| 9 | "No 3D, no GSAP, no Lenis installed" (audit §1, playbook §1) | ✅ still true on both AC branches (`git grep -iE "gsap\|lenis\|three"` → 0 hits) `[VERIFIED-FILE]` | Phase 2's additions remain additive and removable — the "one engine per job, every engine removable" rule survives contact |
| 10 | "No tests, no CI, no lockfile" (audit §1/§7) | ❌ superseded on `c9d0d599` (lockfile committed, `playwright.config.ts`, unit/e2e/**database-policy** tests, CI workflow) | **Opportunity**: Phase 2 perf/a11y acceptance criteria must be written as *assertions AC can add to that Playwright suite* (axe 0-violations, CLS/LCP via CDP traces, reduced-motion snapshot diffs), not as prose. New deliverable `PERFORMANCE_BUDGETS.md` + `ACCESSIBILITY_GUIDELINES.md` will target that harness |
| 11 | "Product identity: Geist + Newsreader serif" (`design-system/visual-direction.md` §5) | ⚠️ **contradicted by `019fbda9`** (Inter + Space Grotesk + JetBrains Mono) while `c9d0d599` keeps Geist + Newsreader-variable-italic | **This is a Product-Owner decision, not a research finding** — the two AC branches disagree on type identity, which is the single loudest "premium" signal. Phase 2 documents both options with trade-offs (`VISUAL_DESIGN_PATTERNS.md` §6) and asks AO to pick |
| 12 | "Awwwards/Codrops entries `[VERIFIED-LISTING]` — URLs not individually opened" (U5) | ⚠️ still only partly verifiable (network allow-list) | Phase 2 re-fetches listing pages and promotes entries to `[VERIFIED-FETCH]` where the fetch succeeds; anything still unopened stays flagged and is **excluded from recommendation-grade claims** |
| 13 | "No live measurement; budgets are targets" (U4) | ⚠️ still no measurement *of AC's app* (their branches aren't mine to build) | Phase 2 changes this where I can: the prototype lab measures the **techniques** (bundle bytes, rAF cost, DPR, paint times) in isolation, so budgets become measurements for everything except their page composition |
| 14 | "Do not adopt `pmndrs/react-three-next` (stale)" + "`@splinetool/react-spline` unlicensed" (playbook §14) | ✅ re-confirmed 2026-11-02 by re-reading the API fields | unchanged |
| 15 | "Motion `layout`/`layoutId` for grid relayout; native VT for cross-route morph" | ⚠️ untested against AC's actual detail route (`/resources/[slug]`, `document.slug`-based) | Phase 2 prototype #9 measures a real card→detail morph (incl. whether the `slug`-named `view-transition-name` survives Next's prefetch/route-announcer), then the playbook states it as measured |

## 3. Gaps Phase 1 left open (self-reported, mapped to the Phase 2 mission)

**Coverage gaps**

| Gap | Phase 1 state | Phase 2 target | Status now |
|---|---|---|---|
| Distinct repositories | 73 | ≥ 300 in-scope | **done** — 1,153 unique discovered, **549 in-scope**, 306 above the quality bar (`REPOSITORY_ATLAS.md`) |
| Deep evaluations | ~14 with attribute lists | 60 shortlisted / 25–35 deep | README + `package.json` **source-level** reads for the shortlist → `TOP_35_DEEP_EVALUATIONS.md` |
| Website experiences | ~25 entries, mostly listing-grade | ≥ 100 analysed | `WEBSITE_ATLAS.md` (live fetches + verification tiers) |
| Prototype implementations | 0 (documentation only) | 10 experiments, run + measured | `INTERACTION_EXPERIMENT_LAB.md` + `prototype-lab/` |

**Subject-matter gaps** (not covered, or covered too shallowly, in Phase 1 — all required by the Phase 2 brief)

1. **Static 3D assets vs runtime-generated scenes** — required comparison, absent. Needs real numbers: GLTF+Draco/KTX2 sizes, `troika` SDF text cost, vs procedural geometry (0 bytes, shader time).
2. **Client rendering vs server-rendered content** — required comparison; Phase 1 asserted R1 without ever quantifying it. Must be measured against AC's real `revalidate = 60` server component.
3. **GSAP vs native CSS scroll-driven animations** — Phase 1 compared CSS-vs-JS generally; the *scroll* head-to-head (range() easing control, `sibling-index()` staggering, `view()` vs ScrollTrigger in low-end devices) needs its own treatment.
4. **WebGPU reality check** — Phase 1 said "use WebGL"; it never verified the WebGPU + R3F path, `tgpu`/TSL maturity, or what happens on iOS Safari 26.
5. **Texture & geometry budget methodology** — no numbers for "how big may a document-cover texture be" (KTX2 vs basis vs PNG, mip cost, VRAM on 4 GB Android).
6. **3D-specific accessibility** — beyond `aria-hidden`: canvas focus management, screen-reader narration of a scene, `prefers-contrast` interactions with bloom/vignette.
7. **`prefers-reduced-transparency` and `prefers-reduced-data`** — never addressed, and *directly* relevant because both AC branches lean on `backdrop-filter` glass and heavy imagery.
8. **`forced-colors`/Windows High Contrast with glass + gradient borders** — Phase 1 mentioned it in one bullet.
9. **`content-visibility: auto` × `position: sticky` × View Transitions** — three features AC would plausibly combine; the interaction is documented as buggy in Chromium for sticky+contain — needs verification.
10. **`document.startViewTransition` inside React 19 / Next router** (navigation API ownership, `transitionTypes`) and Firefox 159's actual VT state (Phase 1 read the Next guide, not Firefox).
11. **Search UX against AC's real SQL** — `search_vector` is `to_tsvector('simple', …)` over a *concatenated* string with no weights (`setweight`), no ranking function, no `tsquery` operators → ranking quality is currently "contains-ish". Phase 1 recommended weights in JS; the right Phase 2 advice is SQL-side weighting + `ts_rank` + `plainto_`/`websearch_to_tsquery` + trigram fallback (`pg_trgm`) for partials.
12. **Empty/zero-result, pagination and facet-count behaviour** in AC's actual `/library` (PAGE_SIZE, `libraryHref`) — Phase 1 recommended patterns without reading theirs.
13. **Motion-design tooling for a two-person team** (Rive editor cost, Lottie asset sourcing with licence hygiene, Spline lock-in) — one paragraph in Phase 1, needs a decision-grade write-up.
14. **Iconography licensing** — `lucide-react` registry field is not ISC-clear from the API; need the actual `LICENSE` (it is ISC for code + CC-BY 4.0 for artwork *by contributors*) verified from the repo file, not from memory.
15. **"Premium" evidence base** — Phase 1 relied on award listings. Missing: a `VISUAL_DESIGN_PATTERNS.md` pattern grammar (layering, type-vs-space ratio, texture, motion density) derived from *inspected* sites rather than from nominations.

**Process gaps**

16. Phase 1 stated some things as verified that were really "the search index said so" — that tier is now separated explicitly, and Phase 2 re-fetches.
17. Phase 1's `README.md`/`RESEARCH_INDEX.md` file maps now omit 20+ Phase 2 files → updated at the end of Phase 2.
18. Phase 1's handover said "19 of ~28 files" mid-flight and the session then *lost the local git state* (working tree kept the files, HEAD was reset by the sandbox). Recorded in `AK_HANDOVER.md` §0 so a successor checks `git rev-parse HEAD` before trusting "committed" claims — **this actually happened**, so it is a real risk, not a hypothetical.

## 4. What Phase 2 explicitly will *not* do

No application-code changes (AC's branches stay untouched); no installs into the app; no merge; no claims about AC's runtime behaviour that aren't measured in the isolated lab; no padding of the repo count with off-topic stars (the 604 out-of-scope repos found are excluded from the atlas counts and listed as excluded, not recommended).

## 5. Immediate notifications for AO (per mission §14)

1. **Two AC branches, two different design systems and type identities** (`019fbda9` Vault/Inter/Space-Grotesk, no backend, no tests vs `c9d0d599` Supabase/Geist-Newsreader-italic, tests+CI). A premium frontend cannot be specced until one base is chosen. **Recommended:** make `c9d0d599` the base (it has the data layer, server components, a11y primitives, Playwright+aXe, CI) and *port* the Vault token/primitive discipline onto it.
2. **Font cascade collision** (`--font-editorial` written by both `@theme` and `next/font/local`, italic-only variable file) — one-line fix, worth an AC ticket (§2.5).
3. `html{scroll-behavior:smooth}` + Lenis incompatibility is still live in code (§2.6) — cheap ticket before any smooth-scroll work.
4. **Their search has no weighting/ranking function** (§3.11) — the single highest-value UX fix available to them, and it is SQL-side, not animation-side.
5. Reduced-motion on the Vault branch maps durations to `150ms` rather than removing motion, and `.ov-button` uses `transition: all` — both contradict the animation contract in `design-system/animation-guidelines.md` §6/§7 (§3.6, `ACCESSIBILITY_GUIDELINES.md` §4).

---
*Next Phase 2 files to appear: `REPOSITORY_ATLAS.md` (generated from the live catalogue), `TOP_35_DEEP_EVALUATIONS.md`, `REPOSITORY_QUALITY_RANKING.md`, `WEBSITE_ATLAS.md`, `INTERACTION_BREAKDOWNS.md` (uppercase Phase-2 version), `VISUAL_DESIGN_PATTERNS.md`, `TECHNOLOGY_COMPARISON.md`, `RECOMMENDED_STACK.md`, `COMPATIBILITY_MATRIX.md`, `PERFORMANCE_BUDGETS.md`, `ACCESSIBILITY_GUIDELINES.md`, `INTERACTION_EXPERIMENT_LAB.md` + `prototype-lab/`, `AO_FINAL_FRONTEND_BLUEPRINT.md`, `FRONTEND_IMPLEMENTATION_SEQUENCE.md`, updated `AC_IMPLEMENTATION_PLAYBOOK.md`, `README.md`, `RESEARCH_INDEX.md`, both handovers.*

---

# Post-run status (2026-11-02, after `chain.sh` completed)

The gap analysis above was written *before* the gap-fill + deep-evaluation run finished. Current state, from `discovery/chain.log`:

| category | Phase-2 target | in-scope | score ≥ 18 | verdict |
|---|--:|--:|--:|---|
| Three.js / R3F / Drei | 45 | 161 | **100** | ✅ target met |
| GSAP / ScrollTrigger / scroll | 40 | 151 | **75** | ✅ |
| Motion / Framer Motion / UI animation | 30 | 138 | **79** | ✅ |
| WebGL / GLSL / shaders | 35 | 266 | **190** | ✅ |
| Premium website implementations | 40 | 235 | **136** | ✅ |
| Creative frontend components | 35 | 152 | **88** | ✅ |
| Typography / visual design systems | 20 | 192 | **115** | ✅ |
| Performance / accessibility | 25 | 160 | **97** | ✅ |
| Document discovery / search UX | 30 | 459 | **227** | ✅ |
| **totals** | **≥300** | **1,914** in-scope of 2,566 unique (2,926 raw) | **1,107 ≥18 / 882 ≥25** | ✅ every target met, none padded |

Deeper-inspection targets: **≥60 candidates → 72 shortlisted and inspected** (README + `package.json` fetched per repo) ✅;
**25–35 detailed evaluations → 35** ✅; **10–15 references → 15** ✅.

## Still open after the run (do not treat these as covered)

1. **three.js `webgpu_*` family never enumerated** — `gen_demos.py` filtered on `webgl_`, so WebGPU example counts are unknown. Recorded, not guessed.
2. **`Document discovery / search UX` is over-tagged by the rules**: 227 includes any repo whose topics mention docs/search (e.g. `three.js`, `pixijs`). The *hand-checked* subset is ~35 (Fuse, meilisearch, PhotoSwipe, react-virtualized, nextra, zag, SaaS boilerplates). Do not quote 227 as "227 search-UX references".
3. **`@react-three/postprocessing`, `ogl`, `troika-three-text`, `@tanstack/virtual`, lottie alternatives** were shortlisted (▲) but **not** fetched for `package.json` → they remain *discovered/shortlisted*, never "inspected".
4. **Awwwards depth:** 44 names from three fetched category pages, **1** verified award winner. SOTD archives, education-specific sites and Godly-style galleries are still under-covered; `godly.website` redirects to recent.design and was never usable.
5. **No browser ⇒ no visual/fps verification of anything**, including the 10 prototypes (see `INTERACTION_EXPERIMENT_LAB.md` §0).
6. **`size-limit`/bundle-size CI precedent:** no qualified repo found in the corpus → the §7 proposal in `PERFORMANCE_BUDGETS.md` is AK's construction, not a copied pattern.
7. **Search-quality claims about AC's SQL** are file-level observations (`to_tsvector('simple')`, no `setweight`) [VERIFIED-FILE]; the *impact* on our users' query set is unmeasured — AC must run the 20-query before/after.
