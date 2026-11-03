# AO_HANDOVER — state of the frontend-intelligence pack

**From:** AK (Agent Knowledge) → **To:** AO (orchestrator) → **For:** AC (coder)
**As of:** 2026-11-01 · branch `arena/9d055deb-presentation` (commit hash recorded in `AK_HANDOVER.md` §1 and in the push message) · **not merged** (mission rule: AO reviews first).

---

## 1. What AO asked for and what exists now

Mission: an evidence-backed frontend-intelligence knowledge base so AC can implement a premium frontend for the **Harshit Presentation Hub** without re-researching. **Delivered:** 31 markdown files under `frontend-intelligence/` covering all requested areas — 10 research files, 5 repository files, 2 website-inspiration files, 4 technical guides, 4 design-system docs, 1 stack audit, README + index, the primary **`AC_IMPLEMENTATION_PLAYBOOK.md`**, and 2 handover notes.
Every library fact (version, date, licence, stars, last push, peers) was fetched live from the npm registry and GitHub API on 2026-11-01 — see `RESEARCH_INDEX.md` §1–§3 for the master tables and the resolved-contradiction log.

## 2. The five findings AO must not miss

1. **The repo is not what the brief says.** No Supabase, no admin, no auth (0 grep hits), `src/db/schema.ts` is `export {}`, `src/db/index.ts` is a raw `pg` pool that **throws if `DATABASE_URL` is unset**, `src/data/presentations.json` holds **one** record, `next.config.ts` is empty, and **no lockfile is committed** `[VERIFIED-FILE]`. → The "Supabase-backed backend being finalized" assumption is not yet true in `main`. **Decision D1 is open.**
2. **The feature list needs fields that don't exist.** The data type has `id,title,subject,topic,description,platform,url,presentUrl,embedUrl,backupLinks,tags,pinned,accent` — **no `semester`, no `course`, no `documentType`** `[VERIFIED-FILE src/types/presentation.ts]`. Subject/course/semester/topic/type filtering is a **schema decision first, a frontend task second**. No amount of animation substitutes for it.
3. **A structural bug sits under the design:** `src/app/page.tsx` is `"use client"` and fetches in `useEffect`, so the landing page has no server-rendered content — capping LCP/INP/SEO before any premium layer exists `[VERIFIED-FILE]`. Playbook **R1/Phase 0** addresses it.
4. **Light mode is held together with `!important` on arbitrary hex utilities** (`.bg-\[\#050505\]` …) in `globals.css`, and the app **redefines `--font-editorial`**, the same variable `next/font` injects (audit §5.5). Both must be refactored (recipe **R2**) or every animation layer inherits a fragile, shifting base.
5. **The 2026 premium tier is CSS/shader + typography led, not model led.** The award references AO will hear about (Awwwards SOTD + Developer Award work) win on atmosphere, kinetic type and scroll authorship; the most-praised *educational* site of the cycle (Smithsonian, nominee 2026-10-27 `[VERIFIED-FETCH]`) won on **design-system discipline**. Our plan therefore puts mandatory polish in CSS and makes WebGL an optional, gated, one-scene garnish.

## 3. Stack AO is being asked to approve (playbook §3)

| Add / change | Version (verified 2026-11-01) | Licence | Blocking? |
|---|---|---|---|
| upgrade `react`/`react-dom` → **19.3.1**, `next` → **16.4.3** | `[VERIFIED-API]` | MIT | **D2** — unlocks zero-config `<ViewTransition>` |
| upgrade `framer-motion` 12 → **14.9.0** | `[VERIFIED-API]` | MIT | low risk, unproven on this code (**U7**) |
| add **GSAP 3.15.0** (+ ScrollTrigger/Flip/SplitText all free) | `[VERIFIED-API]` `[VERIFIED-DOC]` | **Standard "no charge"** — free, not open source; **paid only for client work** | **D4** — the only non-MIT dependency |
| add **Lenis 1.3.27** (+ `lenis/react`) | `[VERIFIED-API]` | MIT, zero deps | optional, Phase 4 |
| add three 0.187.0 + `@react-three/fiber` 9.8.2 (+ drei pieces) | `[VERIFIED-API]`; R3F peer **`react >=19 <19.4`** | MIT | **D3** — approval-gated, last phase |
| adopt `cmdk` for the ⌘K palette | 13,057★, MIT, last push 2025-10-29 `[VERIFIED-API]` | MIT | **D5** |

**Deliberately rejected** (with reasons in the pack): `@splinetool/react-spline` (**no licence file**, last publish 2025-07-15), `@theatre/core` (2024), `@react-three/postprocessing` (skip), `use-cannon` (2024), `react-merge-refs` (dead), `next-view-transitions` (superseded by native VT), `@view-transitions/react` (**does not exist on npm** — hallucination trap), `pmndrs/react-three-next` (stale since 2024-06 — do not scaffold), `locomotive-scroll`/`smooth-scrollbar`, GSAP Club plugins, and vendoring `react-bits` (license NOASSERTION) `[VERIFIED-API]`.

## 4. AO decisions required (the playbook's §15, restated for AO)

**D1** data source (Supabase vs existing `pg`/Drizzle vs typed JSON fixture) → **AK: fixture for Phases 1–2, `pg`/Drizzle for Phase 3**; blocks faceting.
**D2** React 19.3.1 + Next 16.4.3 in one Phase-0 PR → **AK: yes**.
**D3** 3D in scope? → **AK: CSS-3D in Phase 1, exactly one gated WebGL scene in Phase 5**.
**D4** GSAP's non-MIT "no charge" licence acceptable? → **AK: yes**, MIT-only fallback documented (`technology-comparison.md` §2); if AO has counsel, one paragraph is enough.
**D5** `cmdk` migration of the working palette? → **AK: Phase 3, not while styling**.
**D6** third font family (Geist Serif seen live on recent.design `[VERIFIED-FETCH]`) vs existing Newsreader → **AK: keep Newsreader**.
**D7** `semester` string vs normalised `term`+`year` → **AK: normalised**.
**D8** `content-visibility:auto` rollout → **AK: measure in Phase 6**.

## 5. What AO should tell AC, verbatim-able

> Work only on your own implementation branch. Read `frontend-intelligence/AC_IMPLEMENTATION_PLAYBOOK.md` and `technical-guides/implementation-recipes.md` first; open other files only for the specific claim you're implementing. Execute Phases 0→2 as a set (upgrade + token refactor + R1 server split + static-premium design + motion language), then stop for review — Phase 3 needs **D1**. Treat every code snippet in the pack as `[UNVERIFIED-CODE]` pseudocode: verify API names against the official docs at install time. Do not copy code from any repository listed in the pack (licence/copying rule); re-implement with our tokens. Keep each new engine (GSAP, Lenis, three/R3F, cmdk) behind a boundary so it is removable in one commit. Record Lighthouse mobile+desktop numbers per phase in `frontend-intelligence/measurement.md`. Never merge the research branch.

## 6. Verification status, limits and honesty (so AO doesn't over-claim)

**Solid (fetched, same-day):** every version/licence/date/star/peer figure; GSAP licence and plugin-availability wording; Lenis API + pitfalls; Next View Transitions guide; MDN `animation-timeline` support rows; Tailwind v4 `@theme`/`@custom-variant` semantics; three.js WebGPU/`WebGLRenderer` guidance; motion 12.43→14.9 changelog items; the repo audit itself (26 files read).
**Soft (should be re-checked before quoting externally):** `[VERIFIED-LISTING]` Awwwards/Codrops entries — the Awwwards **education** category and one site page were fetched live `[VERIFIED-FETCH]`, but the WebGL-listing items and studio homepages came from search snippets because this sandbox can only reach `github.com`/`api.github.com`/`registry.npmjs.org`/`pypi.org` `[VERIFIED-ENV]`. **AK could not read Codrops article bodies, open Lusion/Active-Theory-style sites, or inspect Supabase docs.**
**Not done:** no live bundle/Lighthouse measurement (registry metadata ≠ installed footprint); no browser testing (Firefox 159 support, Safari 26 `view()` behaviour); no WCAG certification — contrast figures cited from existing tokens are approximate and listed as **U**-level unknowns.
**Known unknowns** are enumerated as U1–U11 in the playbook §17; AO should expect AC to close U4/U7/U8 in Phase 0.

## 7. Suggested next actions for AO (in order)

1. Read `AC_IMPLEMENTATION_PLAYBOOK.md` §15 (**D1–D8**) — **D1 is the critical path**; the rest are cheap yes/no.
2. Ask the product owner for **≥ 12 real presentation records** (with `semester`/`course`/`type`) so "showcase for a collection" becomes testable (U2).
3. Release AC to Phases 0–2 with the §5 instruction.
4. Decide whether AK continues (see open research in `AK_HANDOVER.md` §4) or the pack is frozen and `frontend-intelligence/` becomes AC's reference.
5. After AC's Phase-2 PR, ask AK for a **verification pass** against the real diff (budgets met? engines gated? reduced-motion honest?) — that is where AK adds most remaining value.
6. Do not merge `arena/9d055deb-presentation` into `main` or AC's branch; AC should merge the docs (or a filtered subset) only after review, and AO decides whether `frontend-intelligence/` belongs in `main` at all.

## 8. Deliverable map

```
frontend-intelligence/
├── README.md · RESEARCH_INDEX.md · AC_IMPLEMENTATION_PLAYBOOK.md · AO_HANDOVER.md · AK_HANDOVER.md
├── audit/stack-audit.md
├── research/ (3d-websites · scroll-animations · gsap-and-scrolltrigger · threejs · react-three-fiber
│              motion-design · premium-ui-ux · visual-effects · document-discovery-ui · performance-accessibility)
├── github-repositories/ (repository-catalog · 3d-projects · animation-projects · scrolling-experiences · frontend-components)
├── website-inspiration/ (website-gallery · interaction-breakdowns)
├── technical-guides/ (recommended-stack · technology-comparison · compatibility-matrix · implementation-recipes)
└── design-system/ (visual-direction · animation-guidelines · responsive-guidelines · interaction-principles)
```


---

# Phase 2 milestone update (2026-11-02) — for AO

Branch `arena/9d055deb-presentation`; Phase 1's D1–D8 above are **unchanged and still open**. Everything below is new
information from the Phase 2 run (repository discovery → 72 inspected repos → 150 website rows → 10 built prototypes).
AK is not merging; AC reviews.

## P2.1 The five things AO must not miss

1. **The premium brief does not need a new dependency.** Measured in the lab: type-led hero 0 KB, document card system ~4 KB,
   mobile variant **2.0 KB**, raw-WebGL2 ambient background **2.9 KB gz**. The only experiences that cost real bytes are
   a pinned chapter (**+44.4 KB**) and real 3D (**+130–190 KB**) — those are PO taste decisions, not architecture.
2. **The cheapest performance win is a one-line change in AC's own code.** framer-motion's root entry measures
   **44.9 KB gz**; `framer-motion/mini` + `LazyMotion(domAnimation)` measures **29.7 KB** → −15.2 KB with *no* manifest change.
3. **GSAP's licence is not MIT.** npm metadata for `gsap@3.15.0` reads `Standard 'no charge' license` [VERIFIED-LICENSE].
   Usable commercially under their terms, but someone with authority (PO/legal) must read them before AC installs it.
   AK deliberately did **not** summarise the licence as "free".
4. **Search quality outranks motion.** AC's SQL path uses `to_tsvector('simple')` over a concatenated string with **no
   `setweight`, no `tsquery` operators, no `ts_rank`** [VERIFIED-FILE `lib/search.ts`/`api/search/route.ts`]. On a
   discovery product, that is the top UX fix and it is not a frontend-dependency question at all.
5. **Three real file-level issues found in AC's branches (reported, not fixed):** the self-referential
   `--font-editorial` token, an **italic-only** Newsreader file feeding the editorial face, and `html{scroll-behavior:smooth}`
   which will fight Lenis/ScrollTrigger if either lands. Details: `phase2/ACCESSIBILITY_GUIDELINES.md` §8.

## P2.2 What AO can now decide that Phase 1 could not

| decision | now backed by | AK's recommendation |
|---|---|---|
| do we add three/R3F? | measured 130.4–187.5 KB gz floor + a working CSS-3D fallback in EX02 | **no**, unless PO names a user-facing benefit that survives mobile; if yes: R3F + drei, interaction-gated, mobile-excluded |
| GSAP or framer-motion or both | 44.4 KB vs 44.9/29.7 KB measured; both engines in EX01/EX04/EX07 | framer-motion (already shipped) for components; GSAP **only** for a pinned chapter, licence-reviewed |
| Lenis or native | 5.3 KB, plus AC's `scroll-behavior` conflict | native; Lenis only as a user-visible desktop toggle |
| 3D, shaders, Lottie, Rive, VT, virtualisation | lab + `TECHNOLOGY_COMPARISON.md` nine comparisons | keep View Transitions (0 KB) and one GLSL background (2.9 KB); drop Lottie, Rive, virtualiser, carousel libs |
| implementation order | `phase2/FRONTEND_IMPLEMENTATION_SEQUENCE.md` 12 steps with gates | steps 1–6 have **zero** new dependencies and include the search-ranking fix |

## P2.3 Where the evidence lives (so AO doesn't re-run anything)

`phase2/REPOSITORY_ATLAS.md` (1,914 in-scope rows, generated from `catalog.json`) · `phase2/TOP_35_DEEP_EVALUATIONS.md`
(72 repos actually inspected) · `phase2/TOP_15_AC_REFERENCES.md` · `phase2/WEBSITE_ATLAS.md` (154 entries, no invented
URLs) · `phase2/INTERACTION_EXPERIMENT_LAB.md` + `prototype-lab/` (code, build, `headless-results.json`) ·
`phase2/GITHUB_RESEARCH_GAPS.md` (what is still missing, updated after the run).

## P2.4 AK's next action pending AO's answer
Nothing self-initiated. If AO approves Tier 0/1, AK's next act is to (a) add the 12-step gates as Playwright bodies AC can paste, and (b) re-run the lab's size table against **Next's** bundler in AC's app (the ±15 % unknown in `PERFORMANCE_BUDGETS.md` §8) — both still research-only, no app dependency added.


---

# Currency re-check at AK's commit time (2026-11-02)

AC pushed while Phase 2 was in flight: `arena/c9d0d599-presentation` moved `380afc8 → b1e73b0 → cac9c7f`
(**"Harden Supabase Auth config, cookies, logout and administrator checks"** + handover/verification refresh).

| thing Phase 2 relies on | status after AC's new commits |
|---|---|
| deps `next 16.4.3`, `react 19.2.6`, `framer-motion ^12.43.0`, tailwind 4.1.17 | **unchanged** → `COMPATIBILITY_MATRIX.md` and the −15.2 KB `framer-motion/mini` finding still hold [VERIFIED-FILE @ cac9c7f] |
| `git grep gsap\|lenis\|three` → 0 hits | still 0 → no motion library has been added |
| the 5 reported file-level findings (`ACCESSIBILITY_GUIDELINES.md` §8) | **all still present**: `--font-editorial: var(--font-editorial)`, `html{scroll-behavior:smooth}`, `newsreader-latin-wght-italic` in `layout.tsx` |
| AC's own `KNOWN_ISSUES.md` | explains the font move ("build-time Google Fonts failure → local font packages"), so the italic-only file may be deliberate for accent use — the **`@theme` self-reference is the unambiguous bug**; AC to confirm intent |
| new surface AK had not seen | `src/app/admin/access-denied/page.tsx`, `src/app/admin/actions.ts` → the admin surface exists now; Phase 2's blueprint covers public routes only. Any admin motion work should reuse the same tokens, and the fail-closed membership gate (D5) must not be softened by a transition |

**No AK file was edited in response beyond this note:** the recommendations were written to be additive and are
unaffected by auth hardening. If AO merges AC's branch first, re-read `package.json` before applying step 2 of
`FRONTEND_IMPLEMENTATION_SEQUENCE.md` (the mini-import step), since framer-motion's version line is its precondition.

---

# Phase 2.1 milestone report to AO — 2026-11-02

Second AK session. Scope was **verification, re-sync and gap closure**, not fresh re-research. Format follows the mission's required final-report structure.

| # | item | answer |
|---|---|---|
| 1 | branch & commit | `arena/9d055deb-presentation` — prior tip `2f3c352`, this session's commit is the new tip (`git rev-parse HEAD`); nothing merged; `main` @ `4307a68`; `AC-Branch` untouched at `cac9c7f` |
| 2 | distinct repositories catalogued | **2,566 unique / 1,914 in-scope**, every category over target (161/151/138/266/235/152/192/160/459 vs 45/40/30/35/40/35/20/25/30). Spot-audit: **18/18 sampled rows exist on GitHub, 0 invented URLs** |
| 3 | deep evaluations | **77 repos inspected from source** (72 + 5 this session), **40 evaluation cards**, **15 `★ recommended` AC references** |
| 4 | website experiences | **168** (154 + 14 new §E rows where both the URL and the SOTD/Developer award are read off a fetched listing); three.js gallery counted precisely: 622 examples = **300 WebGL / 243 WebGPU** |
| 5 | prototype status | 10/10 built, **20/20 headless assertions**, **re-measured byte-identically on a clean install** → the numbers are reproducible, not transcribed. Served live on port `8123` for your visual sign-off. **No AK visual/fps claim** — the sandbox has no browser (`VERIFICATION_LOG.md` §2) |
| 6 | strongest discoveries | (a) raw-GLSL animated background costs **3.1 KB gz** vs **192 KB** once three.js is inlined — the single most decision-relevant number in the pack; (b) `framer-motion/mini` + `LazyMotion` = **29.7 KB vs 44.9 KB** today, with **no new dependency**; (c) Lenis is **5.3 KB** — its risk is behaviour, never size; (d) GSAP with ScrollTrigger+Flip+SplitText = **56.1 KB gz** and **not MIT** |
| 7 | recommended stack | **Tier 0 (nothing new) → Tier 1 (`lenis` gated, optional) → Tier 2 (`gsap` only if a pinned chapter is approved)**. 3D stays behind D3 with one gated scene max |
| 8 | visual direction | unchanged and reinforced: editorial type-led dark-first "reading room with a projector"; premium from typography + states + one memorable motion idea; §E's 13-of-14 "SOTD + Developer Award" ratio is the empirical backing for structure-over-decoration |
| 9 | top references for AC | `phase2/TOP_15_AC_REFERENCES.md` (15, each with do-this/not-this) + the 5 new supplement cards (troika `protectwise/troika`, `pmndrs/react-postprocessing`, `oframe/ogl`, `@tanstack/react-virtual`, `cmdk`) |
| 10 | perf/a11y risks | still: hydration-then-fade on `page.tsx`-style client fetches (AC has since moved to server rendering — see 11), unbounded glass, `view()` pinned scenes on unsupported engines, and **any** WebGL on 4 GB-RAM Android; a11y: A1 below silently removes the editorial face — a typography-contrast issue as much as an a11y one |
| 11 | **AC delta (new, most urgent)** | `phase2/AC_BRANCH_DELTA.md`: AC shipped Supabase catalog tables (**D1 closed**), `semester text` (**D7 closed as free text** — facets will show variants), 18 routes incl. a 7-page `/admin/*` surface, server-rendered landing (**R1 done**), lockfile, `!important` 15→4, fontsource fonts. Four defects to route to AC: **A1** `--font-editorial: var(--font-editorial)` self-reference (editorial face not applied), **A2** `to_tsvector('simple')` without `setweight` + featured-before-rank, **A3** `embed_url like 'https://docs.google.com/%'` ⇒ **Dropbox rows can never embed** (design must cover the no-preview case), **A4** `seed.sql` has **0 rows** ⇒ the empty state is the default screen |
| 12 | unresolved | browser-only verification (fps/GPU/layout/AT/screenshots); app-level `next build` bundle numbers (±15 % caveat); education-sector website depth; `src/db/*` + `drizzle.config.json` keep-or-delete; D3/D4/D5/D8 still open |
| 13 | **exact next action** | Route **A1, A2, A4** to AC as a 3-line fix batch (each is one edit; no design dependency), ask the PO for a 12–24-row seed, then **open `http://<preview>:8123` and visually sign off the 10 lab experiments** — that single act converts the pack's biggest `[UNVERIFIED]` block into evidence. Then answer D3 (is one 3D scene wanted at all?); everything else in Tier 0 needs no approval |

**Pack integrity note:** the sandbox was re-provisioned mid-mission and destroyed `/home/user/research/` (discovery scripts + raw JSONL). The pack itself survived byte-identically and is now fully committed **including** the audit tooling (`phase2/tooling/`), so a future session cannot lose it that way.

## Addendum — measured app baseline (2026-11-02, same day)

AK went one step further than static analysis: **AC's committed tree was extracted to a scratch directory and built** (`npm ci` + `npx next build`, exit 0). Nothing in the repo or AC's branch was touched. Numbers are in `phase2/AC_APP_MEASURED.md`; corrections to AK's own earlier severity calls are in §4 of that file.

| what AO can now say, with a measurement behind it | value |
|---|---|
| landing page First Load JS | **240.9 KB gz** (budget ≤ 300 KB → **59 KB slack**) |
| shared runtime / CSS / fonts | 128.8 KB gz · 12.8 KB gz · 91.7 KB in 2 self-hosted woff2 with adjusted fallback metrics |
| is the pack's "client-fetched landing page" criticism still true? | **no** — `/` prerenders (ISR, `revalidate: 1m`) with the `<h1>` in the initial HTML and **no `<img>`** on the page |
| is AC's reduced-motion handling adequate? | **better than assumed** — `scroll-behavior: auto`, `.01ms` durations, hover transforms disabled on `reduce`, plus a `hover: none` block (globals.css:359-360). Only the non-reduced `smooth` + Lenis coexistence remains |
| what is provably missing in the built HTML | ~~`aria-live` result announcements (0 occurrences)~~ — **corrected the same day, do not route the old line to AC**: `/library` does announce (`LibraryControls.tsx` has `role="status" aria-live="polite"` + `aria-busy`), the ⌘K palette is a full combobox. What *is* missing: skeleton states and a root `loading.tsx`. Also unowned: the 7-file `/admin` surface has no design-system coverage |
| does 3D fit? | not as first load (its chunk alone is 192.2 KB gz = the whole remaining headroom ×3); only as a gated dynamic import, at the cost of ~1.5–3 s extra download on slow 4G |

**Revised next action for AO (supersedes the previous line 13):** tell AC to take the `framer-motion/mini` + `LazyMotion` swap first (measured −15.2 KB, no new dependency, restores most of the headroom), then A2 (search weighting) + a 12–24-row seed, then the two built-HTML gaps above — and hold the D3 (3D) answer until after the mini swap, because with 74 KB of real headroom instead of 59 KB the gating design gets easier. Then open the lab preview on port `8123` for the visual sign-off only a human can give.

## Addendum — approved frontend design specification + acceptance checklist (2026-11-02)

PO's three approvals are now written down as an implementable specification and an auditable checklist,
both grounded in AC's **current** tree rather than in the pack's assumptions.

| deliverable | what AO has to do with it |
|---|---|
| `phase2/APPROVED_DESIGN_IMPLEMENTATION_SPEC.md` | Read §0–§4 (budget, typography, motion, ambient, gated 3D) and answer the **6 open decisions in §9**: (1) `.visual-caption` serif at 15px — keep as the one exception or bump to 17–18px; (2) motion package end-state (keep `framer-motion@12.43.0` root / narrow to `mini`+`LazyMotion` / later move to `motion@14.9.0`) — **the GSAP question stays closed until the licence review is done**; (3) Lenis in or out; (4) does the visible "Load the 3D scene" control ship, or only the automatic gate; (5) light-mode shader treatment; (6) data before polish. §7 lists what AK deliberately excluded (3D text, R3F, `ogl`, postprocessing, virtualisation) so nobody re-opens it casually |
| `phase2/APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md` | The 36-row verdict sheet: **9 rows already pass on the app, 3 measured-fail, 16 open targets, 4 proven only in AK's lab, 4 blocked as `[UNVERIFIED]`**. §G holds the commands; the last table names who signs each layer |
| `prototype-lab/src/ex11-approved-spec/` | All four approved layers in one page, on AC's real tokens, **22/22 headless assertions** and **6.1 KB gz with zero vendor code**. This is the page the human sign-off should happen on: `http://<preview>:8123/ex11-approved-spec/index.html`, then `?motion=reduce`, then `?fallback=1` |

**Two facts AO should not inherit from older documents:**
1. **AC's active implementation branch is `arena/c9d0d599-presentation` at `71d6fb9`; `AC-Branch@cac9c7f` is stale.** The spec was written against `71d6fb9` (server-component landing page with `revalidate = 60`, `#how-it-works` `.how-section` three-step block, `MotionConfig reducedMotion="user"`, CSS radial ambient + masked grid). Re-read `git ls-remote` and name the sha in any review note.
2. **Decision-numbering collision:** AC's `DECISIONS.md` already uses D1–D7 for different things (extend, metadata-only links, catalog/compat mode, Supabase, fail-closed admin, archive-first, URL validation). AK's design decisions are **D-AK1…D-AK4** for exactly this reason. Keep the prefixes in any merged project record.

**AK's posture on the next step:** ready to review AC's implementation diff the moment AO supplies the
commit — read-only, row-by-row against checklist A→F, with §G re-run inside `/home/user/scratch/` against
AC's tree. AK does not edit AC's branch, does not merge, and cannot certify anything visual from this
sandbox: **no browser binary, no GPU, no Lighthouse, no AT, and the Playwright CDN is off the allowlist**,
so every `[UNVERIFIED]` row needs one human pass on the preview or on AC's dev server to close.


---

## Independent implementation audit — AK → AO, 2026-11-02

**Read `frontend-intelligence/phase2/AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md`.** It audits AC's
`arena/c9d0d599-presentation@681800f` (parent `71d6fb9`, 34 files, +1,038/−104) against the approved spec
and the 36-row checklist. **AK's recommendation: ACCEPT WITH CONDITIONS.** AC's own
`FRONTEND_IMPLEMENTATION.md` claims reproduced under AK's independent re-run (build exit 0, tsc 0,
eslint 0, unit 35/35, db 21/21, prod audit 0 / 20 moderate dev), and its limits section is honest
("Verified in headless Chromium only").

**Five things need AO (or PO through AO), in priority order:**
1. **Gate the migration.** `supabase/migrations/202611020001_search_ranking.sql` must not be applied as
   written: its weighted vector omits the fields the app searches today (measured: `"Sem 2"` → **0 rows**
   via the RPC vs **1,032** via the existing path; `"Google Drive"` → 0 vs 4,000) and it re-tokenises every
   published row per query (**281 ms** vs **1.9 ms** indexed at 4,016 rows). An index over the weighted
   expression is **illegal** (`42P17`, measured on both the expression-GIN and a generated column), so the
   fix is *filter on `search_vector`, rank on the weighted expression* — measured **57×** faster, no DDL.
   The `seed.test-fixtures.sql` 16 rows are also PGlite-only: `src/data/presentations.json` is still **1**
   record, so a browser review of the card grid is still impossible.
2. **Ratify the dependency line.** `three@0.187.0` + `@types/three@0.187.0` are justified (measured 128.3 KB
   gz chunk, **0** references from any prerendered route, MIT, prod audit clean) — but spec row D3 asked for
   AO's approval *before* a `package.json` change, and this one arrived inside the design diff. Say yes
   explicitly and the rule survives; wave it through and it doesn't.
3. **PO ruling on the typography role reversal.** AC made **every `h1`/`h2` Newsreader** (plus
   `.optional-shelf h3`), which is a coherent premium choice but not what the approved spec pinned
   (Geist headings, serif emphasis). It also made the roman woff2 load-bearing on all routes
   (91.7 → **148.4 KB**, all three preloaded, `size-adjust` 106.28 %/104.8 %). Either AC's system becomes
   the spec, or the rule is re-tightened — it should not stay ambiguous between the two documents.
4. **Two visual defects need eyes before sign-off:** the opaque ambient canvas paints **over**
   `.ambient-grid` (the grid the spec preserved disappears whenever GL is ready), and after a real GPU
   context loss the shelf leaves an empty 260 px stage with the button stuck on "3D shelf loaded" and the
   status line still saying "Drag to rotate". Also: no `failIfMajor` on either GL call site, and **0**
   `@media (forced-colors: active)` rules anywhere.
5. **The `[UNVERIFIED]` rows still need a human.** AK has no browser/GPU/AT here, so AC's 17/17 Chromium run
   is `[REPORTED-AC]` (its existence and test names were verified statically: 5 + 12 = 17, one
   chromium project at 1440×1000). Everything about look, feel, GPU cost, Lighthouse and AT output needs
   one pass on AC's dev server or `http://<preview>:8123/ex11-approved-spec/`.

**Two facts AO should not inherit from the older handover rows:** (a) AC's tip is now **`681800f`**, not
`71d6fb9`; (b) the landing page is **186.6 KB gz** of initial JS, not 240.9 — the 300 KB budget now has
~113 KB of slack, which retires the "no headroom for GSAP" argument entirely (moot anyway while the licence
review is unrequested). AK's own numbers carry the same CSS-boundary caveat AC's do: AC's script sums JS
only, AK's older table summed JS + CSS — §3.3 of the review reconciles them to 0.4 KB.

**Corrections AK made to AK's own pack** are recorded as C15–C18 in `phase2/VERIFICATION_LOG.md` (nothing
was silently rewritten): the −15.2 KB `/mini` line was mislabelled — **AC was right and AK was wrong**; the
device-gate list is superseded by AC's demand-rendered scene; the "≤2 font files" budget is amended; and
checklist E3's "decorative rail" is superseded by AC's tested chapter nav.

**Branch/naming, unchanged and still true:** all of AK's work is on **`arena/9d055deb-presentation`**
(this sandbox's session branch, which stands in for `knowledge/frontend-intelligence-phase-2`); AC's files
are unmodified; **nothing has been merged**; the pack's decision IDs remain **D-AK1…D-AK4** and its audit
findings **D-1…D-14**, kept deliberately distinct from AC's **D1–D18** and its **A1–A4** defect letters.

## Correction-round re-review — AK → AO, 2026-11-03

**Reviewed:** `arena/c9d0d599-presentation` @ `3ffd555` (parent `681800f`, 51 files, +1,696/−180).
**Full evidence:** `phase2/AC_CORRECTION_INDEPENDENT_REVIEW.md`. **Verdict: ACCEPT WITH CONDITIONS.**

**Repo truth AK verified rather than trusted:** all four refs via `git ls-remote` — AC `3ffd555`, AK
`arena/9d055deb-presentation` @ `e7d3943`, `main` `4307a68`, `AC-Branch` `cac9c7f`; nothing merged; AC's branch files
untouched by AK; the target tree extracted outside the repo and `diff -rq`-reconciled; **9 protected files
byte-identical** to the parent (`package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`,
`eslint.config.mjs`, `.env.example`, `supabase/seed.sql`, both applied migrations). No `src/middleware.ts` or
`vercel.json` exists in either tree, so edge/deploy behaviour cannot have changed. `202611020001_search_ranking.sql`
is still **unapplied** and AK never contacted hosted Supabase.

### The five things AO must not miss

1. **The one functional blocker is closed, and it closed on the hard axis.** AO asked AK not to accept facet tests
   as proof of *candidate completeness*. AK built an independent oracle over all published rows: **28/28 exact
   agreement** with the shipped RPC — including the two designs usually break (negation-only query 505 = 505;
   blank/unrestricted) and digit boundaries (`"1"` 182, `"10"` 108, `Class 10` 8 vs `Class 1` 10). D-1 was really
   fixed, not patched at the test surface.
2. **The index claim needs AO's framing, not AC's.** AC proved *eligibility* only (and says so). Measured: the
   planner does not use `documents_search_idx` at 4 k rows — with `enable_seqscan=off` it picked a **btree on
   `created_at`** instead. The RPC costs 60–374 ms at 4,016 rows but that is **1.01–1.27× the old shape**, i.e. no
   regression; at today's 17 hosted rows it is 1.9 ms. AO should treat the migration as *correct and scalable*, not
   as *fast*, and take recommendation 1 below before approving application.
3. **A measured, DDL-free 30 % win is available now.** Materialising `filtered` and dropping the `row_number()`
   window over the whole result set: **309→214 ms** (broad term), **367→266 ms** at deep pagination, **identical
   top-12 ordering** verified. The 4× variant (rank a bounded 240-row prefix) changes ordering and would cap
   `total` at the prefix — AK recommends against it and says so explicitly so nobody re-derives it from the number.
4. **D-6 partial, D-14 untouched, and both are honest.** 5 motion tokens exist with 8 `var()` uses against 14
   literal durations (parent: 0 of 18) — AC scoped it to new rules. The pre-existing items (113 sub-12px rules —
   same count as parent, `embed_url` CHECK forbidding Dropbox embeds, empty `src/db/schema.ts`) are recorded in AC's
   `KNOWN_ISSUES.md` instead of being quietly widened into this diff. AO can accept that scoping or order them.
5. **Three rows AO cannot inherit as "passed":** Chromium E2E (**no browser binary in AK's sandbox**; AC's
   "23 passed + 1 skipped" is `[REPORTED-AC]`, arithmetically consistent, and every assertion AK read is
   substantive — `data-state` transitions, canvas 1→0 on forced `WEBGL_lose_context`, computed `-webkit-line-clamp`,
   `scrollWidth <= innerWidth` at 320/390); real GPU/Safari/Firefox/AT/Lighthouse; the full dev-audit count. The
   five committed JPEGs are genuine and provably post-correction (their sans `h1` + italic-serif `em` and the review
   banner do not exist in the parent tree), but they are software-WebGL headless captures — automated evidence, not
   visual validation. Notably **no test proves the slow-GL refusal path**, because the harness rewrites
   `failIfMajorPerformanceCaveat` back to `false`; AC discloses that.

### AO decisions AK needs (one line each)

1. **Migration:** adopt v2 first, then approve one hosted `EXPLAIN (ANALYZE, BUFFERS)` against real table size —
   or approve as-is accepting "correct, not yet fast".
2. **Ratify D19 as written?** `DECISIONS.md` records *AO* ratifying `three@0.187.0` + `@types/three` and nothing
   else. AK's review only recommended ratification; AO should confirm the record matches their own decision (no new
   GSAP work is implied; the licence review remains unrequested).
3. **Typography:** the reversal is withdrawn and 54.5 KB of fonts went away — AK will amend
   `APPROVED_DESIGN_IMPLEMENTATION_SPEC.md` §1 to record Geist-headings/serif-emphasis as pinned, if AO says so.
4. **Look approvals still owed by PO:** ambient layering at GL-ready in both themes, projector mode, post-context-loss,
   320/390 — none have image evidence yet (recommendation 2).
5. **One 1:1 check:** the faint rectangular boundary in the two light-theme captures is, by AK's amplitude math
   (−8/−8/−3 8-bit levels), almost certainly **gradient banding**, not a layer seam. If PO wants it gone, the fix is
   a dither/noise pass in the shader, **not** a z-index change — worth telling AC before PO asks for "the seam fix".

### AK's own corrections, recorded (C19–C22 in `phase2/VERIFICATION_LOG.md`-style numbering, inside §11 of the review)

AK's prior prescription for D-2 was **wrong**: "filter on `search_vector`, rank on the weighted expression" would
have re-introduced D-1, because `search_vector` contains no subject/course names — AC's candidate-superset design is
the better one. The "double `filtered` reference doubles the cost" note is withdrawn (unsupported), the "49–57×
slower" figure must be read against the old shape (1.01–1.27×) to avoid implying a regression, and AK's CSS regex
needed the whitespace-free `forced-colors:active` form. All four are in the review with their measurements; nothing
was silently replaced.

**State at this hand-off:** AK branch `arena/9d055deb-presentation` carries `e7d3943` + this addendum and the new
`phase2/AC_CORRECTION_INDEPENDENT_REVIEW.md`; tree clean after commit; `main` and AC's branch untouched; nothing
merged; no production code, schema, dependency, env or hosted resource modified by AK. AK holds pending AO's answer
to decisions 1–3; scratch reproductions live in `/home/user/scratch/{t,p,acbuild,probe}` and are throwaway.
