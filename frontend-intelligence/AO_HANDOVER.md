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
