# AK_HANDOVER — research state, continuity notes, remaining open items

**From:** AK (Agent Knowledge) · **To:** AO (orchestrator), and to **any successor AK session** that resumes this work
**Written:** 2026-11-01 · **Branch:** `arena/9d055deb-presentation` (Arena-pinned working branch for this session)
**Pack commit:** `ae5767f1354596f6b0d74c7e048adcfdca5c02a4` — "docs(frontend-intelligence): add AK knowledge pack…" (30 files, 3,123 lines). This handover note is the **tip commit** on the branch (`git rev-parse HEAD`).
**Merged into anything?** **No.** Mission rule: research branch is never merged into AC's application branch or `main`. AO reviews first.

---

## 1. Mission status — COMPLETE for the delivered scope

| Requested area | Delivered | File(s) |
|---|---|---|
| Research: 3D websites · scroll · GSAP · three.js · R3F · motion · premium UI/UX · effects · document discovery · perf/a11y | ✅ all ten | `research/*.md` |
| GitHub repositories: catalog · 3D · animation · scrolling · components | ✅ all five (14-attribute cards, live metadata) | `github-repositories/*.md` |
| Website inspiration: gallery + interaction breakdowns | ✅ (with explicit verification tiers) | `website-inspiration/*.md` |
| Technical guides: recommended stack · **6** technology comparisons · compatibility matrix · implementation recipes | ✅ | `technical-guides/*.md` |
| Design system: visual direction · animation · responsive · interaction principles | ✅ | `design-system/*.md` |
| Repo audit (read-only, before any recommendation) | ✅ | `audit/stack-audit.md` |
| **Primary output for AC** (16 sections incl. section architecture, per-section animation, 3D, scroll, components, mobile, a11y, budgets, sequence, testing, references) | ✅ | `AC_IMPLEMENTATION_PLAYBOOK.md` |
| Index + evidence tiers + limitations | ✅ | `README.md`, `RESEARCH_INDEX.md` |
| Handovers to AO and to successor | ✅ | `AO_HANDOVER.md`, this file |

**Not done (deliberate):** no application code changes (branch rules + AK's role), no live bundle/Lighthouse measurement, no WCAG certification claim.

## 2. Ground rules a successor MUST keep

1. **Never** checkout/commit/push/merge/rebase/reset AC's application branch or `main`; only `frontend-intelligence/` docs on AK's branch. No repo-wide settings, CI, secrets or permission changes. If app code must change → report to AO instead of doing it.
2. Research-only posture: no features, no redesign, no dependency installs in the repo.
3. **Never copy code** from any repository or tutorial — read, then re-implement with our tokens. All snippets in this pack are AK-authored pseudocode and are labelled `[UNVERIFIED-CODE]`.
4. Every claim carries a tier: `[VERIFIED-FILE]` `[VERIFIED-API]` `[VERIFIED-DOC]`/`[VERIFIED-FETCH]` `[VERIFIED-README]` `[REPORTED]` `[AK-RECOMMENDATION]` `[UNVERIFIED-*]`. New work must state its research date and use the same tiers; do not silently promote `[REPORTED]` to `[VERIFIED]`.
5. Quality over quantity: the pack cites ~45 repos and ~25 sites deliberately, not an unvetted list of hundreds.

## 3. Environment facts that shape what's verifiable

| Item | Detail |
|---|---|
| Sandbox network allow-list | `github.com`, `api.github.com`, `codeload.github.com`, `registry.npmjs.org`, `pypi.org`, `files.pythonhosted.org` `[VERIFIED-ENV]`. **`fetch_page` reaches arbitrary public sites; raw `curl` does not.** Use `fetch_page` for docs/sites, `curl` only for registry/API |
| Tooling built during this mission (in `/home/user/research/`, **not** deliverables) | `gh_search.sh` (repo search), `gh_repo.sh` (owner/repo → stars/forks/pushed/created/SPDX/license/archived), `npm_check.sh` (latest/date/license/deps), `npm_peer.sh` (peerDeps + exports keys), `gh_readme.py` (README or any repo file → decoded windows). **All still working — reuse them instead of re-deriving** |
| Credentials | `GH_TOKEN` present, rate limit was 4988/5000 at session start; node v22.22.3, npm 10.9.8 |
| Repo state | default branch `origin/main` @ `4307a68` "Initial upload of Harshit Presentation Hub"; 26 `src/` files; no `.github/`, no `.env*`, no lockfile |
| Connected apps for this conversation | `supabase`, `vercel` (not used by AK; relevant to AO/AC for D1) |

## 4. Remaining research AK could do if AO asks (prioritised)

| # | Task | Why | Cost |
|---|---|---|---|
| R-1 | **Verify the `[VERIFIED-LISTING]` Awwwards URLs** (`awwwards.com/sites/<slug>` for the WebGL tier + studio homepages) and open 2–3 of them for real technique notes | today the *names/awards/dates* are confirmed but not the technique detail | ~10 `fetch_page` calls |
| R-2 | **Read 3–4 Codrops tutorials in full** (Sticky Grid Scroll, SVG Mask Transitions, Reactive Depth, Flip gallery) and extract exact option values into `website-inspiration/interaction-breakdowns.md` | currently only the sticky-grid values are exact | medium |
| R-3 | **After AC's Phase 0/1 PR: verification pass against the real diff** — budgets met, engines gated, reduced-motion honest, no leaked ScrollTriggers, license note per dependency | highest-value remaining AK work (AO_HANDOVER §7.5) | needs AC's PR |
| R-4 | **Measure what the pack can only predict**: `npm ci` + `next build` + Lighthouse on the real app, replacing the ≤300 KB / LCP ≤ 2.5 s *targets* with measurements (closes U4) | turns budgets into facts | needs app-code build access = AC's lane |
| R-5 | **Supabase data-layer research** for D1: schema for `documents(subject, course, semester, topic, type, links[])`, RLS/postgres policies, search via `tsvector`/`websearch_to_tsquery`, storage vs external-link trade-offs | the brief assumed a Supabase backend that isn't in the repo (U1) | medium; also AC-adjacent |
| R-6 | **Facet/field naming workshop output** (D7: normalised `term`+`year` vs string) with a migration sketch | unblocks Phase 3 | small |
| R-7 | Print/PDF + projector legibility research (a real classroom need: `content-visibility`, print stylesheets, 8 m legibility type scale) | niche but differentiating | small |
| R-8 | Update versions **only if the pack goes stale**: re-run `npm_check.sh`/`gh_repo.sh` sweeps (all figures are 2026-11-01) | drift risk is real (React 20 will break R3F's `<19.4` peer) | small |

**Explicitly *not* worth researching further:** more 3D template repos (the credible candidates are catalogued; generic search returns ≤7★ junk), "AI website builder" tools, Lottie-vs-Rive beyond the comparison already made, `embla-carousel`/`vaul`-style utility deps (either unnecessary or 404 — see §5).

## 5. Dead ends — do **not** re-try (all confirmed by a 404 or a failed lookup on 2026-11-01)

`tmcw/webgl-hub` · `etherlos/troika-three` · `patriciogonzalezvivo/bookOfShaders` · `gsap-dev/GSAP` (use `greensock/GSAP`) · `darkroomengineering/lenis-react` (merged into `darkroomengineering/lenis`, exports `lenis/react`) · `drcmda/threejs-to-canvas` · `Tympanus/codrops` (org doesn't exist; `codrops/ScrollBasedLayoutAnimations` does) · `admille/vaul` · `emblajs/embla-carousel` · `pacocoursey/cmdk` (→ `dip/cmdk`) · npm `@view-transitions/react` · `nextjs.org` `viewTransition` config page (404 — the *guide* is the current doc) · `motiondivision/motion/releases` (empty; use `CHANGELOG.md`) · `godly.website` (redirects to `recent.design`) · `siteinspire.com/inspiration/filters/site-type:education` (404; browse at `/websites`).
Also: high-star generic WebGL hits (`img2threejs`, `pascalorg/editor`, `git-city`, `Astral3D`, anatomy projects) are **off-domain** for a premium educational hub, and no credible open-source "premium document-discovery UI" repo exists (searched exhaustively — closest domain analogue `aurorascharff/next16-conferences`, 167★).

## 6. Findings a successor must not accidentally "fix" back

1. `@react-three/fiber@9.8.2` peers are **`react >=19 <19.4`** → React 19.3.1 is the *ceiling-compatible* choice; React 20 breaks it. Keep the React/Next pairing pinned in one PR.
2. **Motion 14.9.0** (not 12.x) is latest; 13.0.0 removed `@emotion/is-prop-valid` in favour of `<MotionConfig isValidProp>`; 13.2.0 added `threeEffect`/`vgpuEffect`; 13.4.0 added `AnimateView`; 14.0.0 was a major with **no public export removals**; 14.1.0 added accelerated independent transforms + delayed animation when the main thread is busy.
3. **GSAP 3.15.0** — the whole standard package including ScrollTrigger, Flip **and SplitText** is free for our use; "Standard no charge" ≠ open source; only client work requires a licence; `gsap-trial` must not be used.
4. **`html { scroll-behavior: smooth }` conflicts with Lenis** and the repo has it (`globals.css` line 27 area) — remove it when Lenis lands; never `autoRaf:true` **and** `gsap.ticker.add`.
5. **CSS scroll-driven animation:** Chrome/Edge 115 · Opera 101 · Safari 26 (incl. iOS 26) · Samsung 23 · **Firefox 159** — full support per MDN, **yet flagged not Baseline** ⇒ always `@supports (animation-timeline: view())`.
6. **View Transitions are config-free in Next 16.4 + React 19.3**; `share="morph"` **requires** `default="none"` on the same element; the morph is DOM-only and must never wrap the Slides/Dropbox iframe.
7. **Tailwind v4 theming:** colours defined inside `@theme inline` are *baked* and break runtime switching → use raw channels in `:root`/`[data-theme="dark"]` + plain `@theme { --color-x: var(--x) }`, plus `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` to match this repo's `data-theme` toggle and delete its `!important` overrides.
8. **Avoid `WebGPU`:** three 0.187.0 exports `./webgpu`/`./tsl`, but for a mid-range-Android audience in 2026 the recommendation is `WebGLRenderer` + capability probe + poster fallback.
9. **Repo-specific traps:** the whole landing page is `"use client"` with a `useEffect` fetch; `--font-editorial` is redefined by `globals.css` while `next/font` injects the same variable; light mode uses `!important` on arbitrary hex classes; `src/db/index.ts` throws without `DATABASE_URL`; `src/db/schema.ts` is `export {}`. These are the load-bearing constraints for D1 and Phases 0/3.

## 7. Pointers

- Evidence tiers, the full verified version table, the resolved-contradiction log and the limitations list: **`RESEARCH_INDEX.md`** (read before re-verifying anything — the work is already recorded there).
- What AO must decide: **`AO_HANDOVER.md` §4** (D1–D8; **D1 is the critical path**).
- What AC executes, in order: **`AC_IMPLEMENTATION_PLAYBOOK.md` §12** (Phases 0–6) with recipes **R1–R9**.
- The one-line product truth: this is a 26-file, 1-record, single-purpose classroom hub, so premium must come from **typography, states, speed and one memorable motion idea** — not from a 3D engine bolted onto an empty catalogue.

*End of AK handover. No further AK action is pending unless AO requests items from §4.*


---

# Phase 2 continuation notes (2026-11-02) — for the next AK session

**State:** Phase 2 complete and committed on `arena/9d055deb-presentation`. Phase 1's R-1…R-9 above remain valid; the
corrections are in `../README.md` ("Phase 2 added on top") and `phase2/GITHUB_RESEARCH_GAPS.md` (post-run status).

## Executed, so do not re-run
- `python3 /home/user/research/{discover,gapfill,catalog,deep_eval,gen_atlas,gen_demos}.py` → `discovery/{raw.jsonl(2,926 rows),catalog.json(2,566 unique/1,914 in-scope),deep_evals.json(72),chain.log}`; atlas regenerated with ◆/★ marks.
- `prototype-lab`: `npm install` (three 0.187.0, gsap 3.15.0, lenis 1.3.27, motion 14.9.0, framer-motion 12.43.0, esbuild 0.25.12, jsdom 26.1.0) → `node build.mjs` (10/10 built + vendor floors) → `node test.mjs` (**20 passed, 0 failed**) → `python3 -m http.server 8123 --bind 0.0.0.0 --directory dist` for AO's preview.
- Deliverables written in `frontend-intelligence/phase2/`: README, AO_FINAL_FRONTEND_BLUEPRINT, INTERACTION_EXPERIMENT_LAB, RECOMMENDED_STACK, TECHNOLOGY_COMPARISON, PERFORMANCE_BUDGETS, ACCESSIBILITY_GUIDELINES, COMPATIBILITY_MATRIX, REPOSITORY_ATLAS, REPOSITORY_QUALITY_RANKING, TOP_35_DEEP_EVALUATIONS, TOP_15_AC_REFERENCES, WEBSITE_ATLAS, INTERACTION_BREAKDOWNS, VISUAL_DESIGN_PATTERNS, FRONTEND_IMPLEMENTATION_SEQUENCE, GITHUB_RESEARCH_GAPS (updated).

## Traps for the next session (each cost AK a retry)
1. **Never patch Node globals to fake a browser for these bundles** — jsdom's webidl layer recurses ("Maximum call stack"). Correct pattern: build a second **IIFE + `globalName:"__LAB"` + `footer:"globalThis.__LAB=__LAB;"`** target and `window.eval` it *inside* jsdom (`build.mjs` + `test.mjs`).
2. **`"use strict"` + `window.eval`** ⇒ a `var` does not become a window property; publish explicitly or the harness sees no exports.
3. **jsdom has no `getContext`** → GL experiments can only be verified on their fallback path; the "Not implemented" notices are filtered into `harnessNotes`, which is honest but must never be reported as a WebGL pass.
4. **`devicePixelRatio`/`deviceMemory` absence ≠ low power** — `navigator.deviceMemory || 4` made every desktop look weak; use `?? 8` and gate on the API's presence (fixed in `src/_shared/lab.js`).
5. **`@theme` / Tailwind token names** are AC's, not AK's: any token suggestion must extend `--motion-*`/`--ease-*`/`--move-*` from `019fbda9`, not invent a parallel set.
6. **esbuild probe for React libs needs `external:["react","react-dom","react/jsx-runtime"]`** or the size row is react, not the library (that bug produced 0 KB rows first, then a react-inflated one).

## Still open, in priority order
1. Next-bundler verification of the 130.4 KB three.js figure (±15 % unknown) — needs AC's app, so it is AO's call.
2. FPS / GPU / memory / visual sign-off of all 10 experiments — impossible in this sandbox (`INTERACTION_EXPERIMENT_LAB.md` §5 lists the exact runs).
3. WebGPU example enumeration in three.js (`webgpu_*` filter fix in `gen_demos.py`) — 10 minutes, no new sources needed.
4. `@react-three/postprocessing`, `ogl`, `troika-three-text`, `@tanstack/virtual` — ▲ shortlisted, never inspected.
5. Awwwards SOTD archive depth (44 names, 1 verified winner) and any education-sector premium sites — 2–3 more `fetch_page` calls at most.

## Constraints that do not relax
Own branch only (`arena/9d055deb-presentation`); never touch AC's branch, the app manifest, `node_modules` of the app,
Supabase/auth/Vercel/CI, or secrets. Read-only `git show` of AC's refs is allowed and is what produced every
`[VERIFIED-FILE]` claim above. **Verify `git ls-remote origin` + `git status` before every commit — this session hit a
silent local HEAD reset and `git reset --soft <remote-tip>` was the repair.**


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

# Phase 2.1 — verification + AC re-sync (2026-11-02, second AK session)

**Trigger:** AO re-issued the Phase 2 brief. Instead of re-running finished research, this session **re-executed and tried to falsify** it, then re-synced against AC's code.

## State at hand-off

| item | value |
|---|---|
| branch | `arena/9d055deb-presentation` (unchanged; the mission's `knowledge/frontend-intelligence-phase-2` name is unavailable — the environment pins this branch) |
| tip before this session | `2f3c352` (Phase 2 + first re-verify note) |
| commit added by this session | the Phase 2.1 verification commit — resolve with `git rev-parse HEAD`; **not merged anywhere** |
| files added | `phase2/VERIFICATION_LOG.md`, `phase2/AC_BRANCH_DELTA.md`, `phase2/tooling/{README.md,verify_atlas.py,fetch_repo_cards.py}` |
| files updated | `phase2/{WEBSITE_ATLAS,TOP_35_DEEP_EVALUATIONS,REPOSITORY_ATLAS,RECOMMENDED_STACK,GITHUB_RESEARCH_GAPS,README,INTERACTION_EXPERIMENT_LAB}.md`, `README.md`, `RESEARCH_INDEX.md`, `audit/stack-audit.md` (banner), `AC_IMPLEMENTATION_PLAYBOOK.md` (§1 pointer) — **Phase 1 text otherwise untouched, nothing deleted** |
| AC files touched | **none** (read-only API inspection of `origin/AC-Branch@cac9c7f`; no checkout, no branch writes, `main` @ `4307a68`) |

## Executed this session (do not repeat)

1. Sandbox was re-provisioned mid-mission: fresh clone at `4307a68`, pack files present but untracked, **`/home/user/research/` (pipeline + raw corpus) destroyed**. Repaired with `git fetch` + `git reset --hard FETCH_HEAD` after confirming `diff -rq` showed the disk copy byte-identical to `2f3c352`. **Tooling now lives inside the pack** (`phase2/tooling/`).
2. `prototype-lab`: fresh `npm install` → `node build.mjs` (10/10) → `node test.mjs` (**20/20**) → `measurements.json` + `headless-results.json` reproduced **byte-identically**. Served `dist/` on `:8123` for AO/AC's visual sign-off (that preview is the only path to closing the browser-only gap).
3. `verify_atlas.py --sample 18 --seed 42` → 1,914 rows parsed, **18/18 repos exist, 0 fabricated URLs**; the 6 flagged diffs were star drift / UTC rollover / licence-cell parsing (the licence parser was then fixed).
4. Closed the four "shortlisted-but-uninspected" items + `cmdk` with `fetch_repo_cards.py` → 5 new cards in `TOP_35_DEEP_EVALUATIONS.md` §5, atlas rows promoted ▲→◆ (72 → **77** inspected).
5. Awwwards depth closed: fetched `sites_of_the_day` → `WEBSITE_ATLAS.md` §E, 14 rows with URL **and** award verified (13 also Developer Award); total websites **154 → 168**. three.js example counts measured: 622 files = **300 `webgl_*` / 243 `webgpu_*`**.
6. AC re-sync (`AC_BRANCH_DELTA.md`): D1 and D7 are **closed by AC** (Supabase catalog migration with `subjects/courses/documents`, `semester text`, `document_type` enum); R1 server split, lockfile and the `!important` refactor are **done**; **four live defects in AC's code** are flagged (A1 self-referential `--font-editorial`, A2 unweighted `to_tsvector('simple')` + featured-first ordering, A3 `embed_url like 'https://docs.google.com/%'` blocks Dropbox embeds by policy, A4 `seed.sql` has 0 rows).

## Corrections a successor must not "fix back" (new since last handover)

- `troika-three-text` upstream is **`protectwise/troika`** (MIT, active) — `etherlos/troika` and `etherlos/troika-three-text` 404.
- `@react-three/postprocessing`'s repo is **`pmndrs/react-postprocessing`** (MIT, pushed 2026-10-21) and its peers **require React 19**; the rejection reason is bundle cost only.
- `oframe/ogl`: no `LICENSE` file, `Unlicense` declared in `package.json`/npm, last publish 2025-01-27 → rejected for staleness.
- `cmdk@1.1.1` last **published** 2025-03-14 (19 months); `@gsap/react@2.1.2` 2025-01-15 → prefer `gsap.context()`.
- `framer-motion@14.9.0` exists (same version/repo as `motion`) → the upgrade is **not** a package rename.
- Phase 1's `@custom-variant dark` recipe: AC now has **0 `dark:` utilities**, so it is optional, not required.
- Do not quote the atlas's "459 doc-discovery rows" (or its 227 ≥18 subset) as "search-UX references" — the hand-checked subset is ~35.

## Remaining work, in priority order (unchanged unless noted)

1. **A1/A2/A4 to AC via AO** — the font-token bug, the search weighting, and a 12–24-row seed so design review isn't against an empty DB. (All file-level, each one-line fixes; AK deliberately did not patch AC's code.)
2. **Visual/fps sign-off of the 10 lab experiments** — needs a human browser; preview served on `:8123`. `[UNVERIFIED]` stays on every visual claim until then.
3. `next build` measurement on AC's app to convert the ±15 %-caveated esbuild floors into app-level numbers (needs AC's tree, so AO's call).
4. If Phase 3 re-opens discovery: rebuild the pipeline **inside** `phase2/tooling/`, keep `raw.jsonl` in the pack, and re-run `verify_atlas.py` after regenerating.
5. Optional depth: per-origin URLs for the 14 §E SOTD entries (one click each) and education-sector premium sites beyond Smithsonian.
