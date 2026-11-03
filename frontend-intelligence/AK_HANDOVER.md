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

## Addendum (later the same day) — the app was actually built

To close the last "estimated" caveat, AK extracted AC's exact tree **outside** the repo (`codeload` tarball → `/home/user/scratch/Presentation--AC-Branch`), ran `npm ci` (424 pkgs / 16 s) and `npx next build` (Next 16.4.3 Turbopack, **exit 0**, 11 pages, 10.6 s compile), then measured the output. Repo, AC's branch and every app file remained untouched.

* New deliverable: **`phase2/AC_APP_MEASURED.md`** — per-route First Load JS (**landing 240.9 KB gz**, `/resources/[slug]` 238.1, `/subjects` 231.1, legacy `/presentation/[slug]` 167.2; shared runtime 128.8; CSS 12.8; fonts 91.7 KB in 2 woff2), route graph, built-CSS font cascade.
* That number turns the pack's `<300 KB` guidance into **59 KB of slack**, which reorders AC's priorities (mini-swap first, GSAP only after it, 3D only as a dynamic import).
* **Two of AK's own same-day calls were wrong and are corrected in place**: A1 (the `--font-editorial` self-reference is *not* disabling the face — next/font's unlayered class wins; downgraded to fragility) and A4 (`seed.sql` has **3** inserts, not 0; my first grep pattern was bad). Lesson for the next session: **if a claim can be settled by building, build — do not reason from a grep.**
* Method that worked and is repeatable in ~90 s: `curl codeload.github.com/<owner>/<repo>/tar.gz/refs/heads/<branch>` → extract to scratch → `npm ci` → `npx next build` → sum `gzip` of the assets each prerendered `/_next/...` route HTML references. No browser needed for sizes.
* Still impossible here: Lighthouse/LCP/INP/CLS, fps, GPU, screenshots (no browser binary, no Vercel network).


## Addendum — the approved frontend design specification (2026-11-02, later the same day)

AO relayed PO's three approvals (typography Geist + Newsreader · motion pinned storytelling with one
optional 3D scene · ambient GLSL background with a CSS fallback) and asked AK to turn them into a
specification plus an acceptance checklist, then to be ready to review AC's implementation diff.

**Delivered (all inside `frontend-intelligence/`, nothing else):**

| File | What it is |
|---|---|
| `phase2/APPROVED_DESIGN_IMPLEMENTATION_SPEC.md` | D-AK1…D-AK4: rules, tokens, budgets, the 4-PR sequence for AC, the out-of-scope list, and the 6 items still needing AO/PO sign-off. Numbering is **D-AK** because AC's own `DECISIONS.md` already uses D1–D7 for different decisions — the two lists must not be merged |
| `phase2/APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md` | 36 rows in 6 groups (A design language · B motion · C ambient + 3D · D performance · E accessibility · F real data), each labelled `[MEASURED]` / `[PROPOSED-TARGET]` / `[UNVERIFIED]`, plus §G = the exact commands that settle every measured row, and a sign-off table naming who approves what |
| `prototype-lab/src/ex11-approved-spec/` | A runnable reference for all four layers at once on AC's real tokens: fixed editorial token, raw-WebGL2 ambient (context-loss + restore-refusal + reduced-motion + theme-reactive uniforms reading `--accent`/`--bg`), CSS-only pinned 3-step story (`animation-timeline` + `position:sticky` + `@supports`), and a **gated** 3D slot with `sceneGate()` printing its own reason. **11/11 build, 22/22 headless assertions** (default + forced reduced-motion), 6.1 KB gz with zero vendor code |
| Updated | `AC_APP_MEASURED.md` (font-loader detail + §4 corrections 5–6), `INTERACTION_EXPERIMENT_LAB.md` (row 11, §8, counts 10→11 / 20→22), `VERIFICATION_LOG.md` (C13, C14, scorecard rows, "what changed" list), `phase2/README.md` (rows 20–22 — note: row 20 for `AC_APP_MEASURED.md` was described in the previous handover but had never actually been added; it is now), pack `README.md` (third load-bearing row) |

**Design positions AK took, and why they are safe to review:**

1. **Motion is CSS-first, not GSAP-first.** No new GSAP line is recommended anywhere in the pack pending
   the licence review; the pinned story is `@supports (animation-timeline: view())` + `position: sticky`,
   whose fallback is the app's already-shipped stacked list. If the licence review later lands, the pack
   already carries the arithmetic (+44.4 KB gz for gsap+ScrollTrigger against 59 KB of measured slack).
2. **The 3D scene's deliverable is the gate, not the geometry.** 0 KB on first load, dynamic import,
   `ssr:false`, one canvas per page, blocked on reduced-motion / touch / narrow / low-power / saveData /
   **`projector-mode`** (an existing app concept AC already uses to suppress hover transforms — reusing
   it is free), plus a visible "Load the 3D scene" control so PO/AO can demo it without a device farm.
3. **The ambient layer must obey the app's lighting, not invent its own** — the shader samples
   `--accent`/`--bg` and matches `.ambient-background`'s `80% 25%` hotspot and 920 px band, because the
   app has 0 `dark:` utilities and theme switching is `[data-theme]` token reassignment.
4. **The design is affordable.** Measured landing First Load JS is 240.9 KB gz against a 300 KB budget;
   the approved feature set costs +3.1 KB (shader) and −15.2 KB (the `framer-motion/mini` swap, which the
   spec asks AC to *evaluate*, not adopt blindly). Nothing in the approved direction needs a new dependency.
5. **3D text was formally dropped** in favour of DOM metadata (atlas cost scales with the catalogue, breaks
   selection/AT/Devanagari) — and with **3** seed rows / **1** compatibility record today `[MEASURED]`,
   the spec says plainly that data precedes polish.

**AK's honesty ledger for this pass** (two of AK's own claims died during it, both recorded in place):
- the "live regions for result counts remain unimplemented" claim was **wrong in scope** → C13.
- the "ship the roman Newsreader file" recommendation was **withdrawn** after reading all 6 editorial
  rules → C14; instead the spec hands PO one real decision (`.visual-caption` sets serif at 15px, under
  the spec's own 18px floor).

**Still impossible here, unchanged:** any visual/rendering sign-off. There is no browser binary, no GPU,
no Lighthouse and no AT in this sandbox, and the Playwright CDN is off the network allowlist, so ex11's
`[UNVERIFIED]` rows stay `[UNVERIFIED]` no matter how green the headless suite is. AO/AC open
`http://127.0.0.1:8123/ex11-approved-spec/index.html` (then `?motion=reduce` and `?fallback=1`) — that is
the only way those rows close.

**AK's next action (as written before the audit):** ~~wait for AO to supply AC's implementation commit~~ —
**that action is now complete**, see the section below. AK still does not edit AC's branch, does not merge,
and does not touch `package.json`, config, DB, Supabase, CI or secrets.


---

## 9. AK's independent audit of AC's implementation — 2026-11-02

**Branch AK worked on:** `arena/9d055deb-presentation` (this sandbox binds the session to it; AK's pack
lives only there — every commit since `4307a68` touches `frontend-intelligence/**` and nothing else).

**Audited:** `arena/c9d0d599-presentation@681800f894b2cf17021bb540e177a68c05e8f72e` (parent `71d6fb9`
confirmed against `api.github.com`, 34 files, +1,038/−104). Deliverable:
**`phase2/AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md`**. Recommendation to AO: **ACCEPT WITH CONDITIONS.**

How AK worked: AC's tree was fetched as a **codeload tarball of the exact sha** and built in
`/home/user/scratch/acbuild` (never in the repo). AK re-ran AC's own gates and they all reproduced
(tsc 0 · eslint 0 · unit **35/35** · db **21/21** · `next build` exit 0 · prod audit 0 · full audit
20 moderate), re-measured the bundle independently (**186.6 KB gz** landing JS vs AC's 187.0 — the 12.2 KB
gap between AC's "before" and AK's older 240.9 KB is CSS inclusion, arithmetic shown in §3.3), and wrote
**four PGlite probes** that applied AC's real migrations, grew the table to **4,016 published rows**, and
measured the ranking RPC: **281 ms** per call vs **1.9 ms** for the existing GIN path, an index over the
weighted expression rejected with **`42P17`**, and the field set silently **dropping semester /
document_type / platform / subject** ("Sem 2" → 0 rows via the RPC, 1,032 via the fallback). That is the
one finding that could escalate: **do not apply `202611020001_search_ranking.sql` until D-1/D-2 land.**

Corrections AK made to AK's own documents (C15–C18 in `phase2/VERIFICATION_LOG.md`, amended in place in the
spec/checklist rather than deleted):
- **C15** the "`framer-motion/mini` −15.2 KB" line was **mislabelled** (that subpath exports only
  `useAnimate`, 3.1 KB); AC found this by reading the file and beat the recommendation by removing the
  library. `RECOMMENDED_STACK.md`'s motion row should now say: *prefer CSS scroll-driven reveals; if a JS
  motion runtime is ever needed, the LazyMotion path costs 29.7 KB on the main entry, not via `/mini`.*
- **C16** AK's device gates for the 3D scene are **superseded by AC's simpler, better-reasoned gate**
  (explicit intent + no-usable-WebGL + projector-mode **+ `failIfMajor`**, which AK had missed). `ex11`'s
  `sceneGate()` should be revised to match AC's implementation.
- **C17** the pack's "≤2 font files" budget is amended (3 preloaded, metric-adjusted files is right once
  roman Newsreader is load-bearing), and the pack adopts AC's **`--text-*`** token naming instead of
  `--step-*`.
- **C18** checklist E3's "rail stays decorative" is superseded by AC's tested chapter `<nav>`; AK's
  "don't animate a step twice" warning, meanwhile, **did** catch a real defect (D-7).

Fourteen defects filed (1 HIGH-latent, 4 MEDIUM, 8 LOW, 2 INFO) with file-level evidence and a fix sized
in lines, plus eight items credited explicitly — transform-only reveals, demand-rendered 3D with full
`dispose()`, DPR 1.25 + ~20 fps throttle, geometry-matched skeletons, 44 px card CTAs, and an E2E assertion
that no `three` script is requested on first load.

**AK's next actions, in order:** (1) hand this review to AO and hold; (2) if AO asks, re-run anything in
`/home/user/scratch/acbuild` — it is a throwaway copy, `npm ci` + `npx next build` reproduce all numbers;
(3) apply C15–C18 to `RECOMMENDED_STACK.md`/`INTERACTION_EXPERIMENT_LAB.md`/`ex11` only when AO confirms the
audit is accepted, so the pack changes once, not speculatively; (4) `prototype-lab` was re-verified green
after this sandbox was re-provisioned (`npm install` → `build.mjs` **11/11** → `test.mjs` **22/22**), preview
served on `:8123`. **Nothing in AC's tree, `main`, or any config/DB/secret was modified; nothing merged.**

## 10. AK's re-review of AC's correction commit — 2026-11-02/03

**Object:** `arena/c9d0d599-presentation` @ `3ffd555` (parent `681800f`, 51 files, +1,696/−180,
`2026-11-02T18:38:41Z`). **Deliverable:** `phase2/AC_CORRECTION_INDEPENDENT_REVIEW.md` (11 sections).
**Verdict: ACCEPT WITH CONDITIONS** — 4 conditions, all pre-merge; no functional blocker left open.

Verified independently, all on AK's own `npm ci` of the target tree (`/home/user/scratch/acbuild`, 429 packages,
node 22.22.3): build exit 0 (11 routes), `tsc` 0, `eslint` 0, unit **47/47**, PGlite DB **26/26**, production-scope
`npm audit --omit=dev --audit-level=high` **0**. Every bundle number in AC's `FRONTEND_CORRECTIONS.md` reproduced
(landing 187.5 KB gz JS + 14.4 CSS; `/library` 187.6 — the previously-measured gap is now a real dynamic-route
measurement; shader 1.8; three 129.0; three **not** referenced initially on all three routes by both AC's script and
AK's independent live-HTML pass; fonts 148.4 → **93.9 KB**, 2 files, 2 preloads).

The migration was re-attacked on the axis AO asked for — **candidate completeness** — with an independent oracle over
all published rows: **28/28 exact agreement** across cross-field, digit-boundary (`"1"` 182, `"10"` 108), facet
(`Sem 1` 96), phrase, OR, negation-only (`zephyrq -Title` 505), injection-shaped, truncated and zero-match queries.
D-1 is genuinely fixed; D-12's clamp is now measured (null→12, 0→1, 9999→48, −5→1, offset −5→0); D-3/D-4/D-5/D-7/
D-8/D-9/D-10/D-11/D-13 fixed; **D-6 partial** (5 tokens, 8 `var()` uses vs 14 literal durations); **D-14 open and
correctly untouched** (113 sub-12px rules — same count as parent, `embed_url` Google-Docs-only CHECK, empty
`src/db/schema.ts`).

Index reality, kept explicitly apart: **eligible** (existing `documents_search_idx` can serve the candidate
predicate) ≠ **used** (the planner scans at 4 k rows, and even with `enable_seqscan=off` chose a *btree on
created_at*, not the GIN) ≠ **fast** (RPC 60–374 ms vs 2.1–2.9 ms for the predicate alone, but only 1.01–1.27× the
*old* shape — the rewrite bought correctness and scalability, not speed at today's 17 hosted rows where it costs
1.9 ms). Measured DDL-free fix: materialise `filtered` + drop the `row_number()` window = **−30 %, identical
order**; prefix-bounded ranking = −76 % but changes ordering and caps `total` → not recommended.

**Four corrections to AK's own prior review are recorded as C19–C22** (nothing silently rewritten): C19 AK's
"filter indexed, rank weighted" prescription was **wrong** — `search_vector` has no subject/course names, so it
would have re-introduced D-1; AC's superset design is better. C20 the "double reference to `filtered` doubles the
cost" hypothesis is unsupported (probe6 confounded joins; probe9's transcription costs the same as shipped).
C21 "49–57× slower than the GIN predicate" is true but must be read against the old shape (1.01–1.27×) or it
misrepresents a regression. C22 AK's CSS regex needed the whitespace-free `forced-colors:active` form.

**Executed, do not re-run:** all of the above; plus 9 protected files `cmp -s` IDENTICAL to parent (incl.
`package.json`, lockfile, `next.config.ts`, `tsconfig.json`, `supabase/seed.sql`, both applied migrations); production
`next start` fixture isolation (`/library?fixture=1` → 200 with **0** `fixture-` occurrences, real "Lost Spring" ×8;
`/fixtures/review-catalog.json` → 404; no fixture strings in `.next/static`); `fixtures/review-catalog.json` vs
`seed.test-fixtures.sql` slug-by-slug parity (16/16, long-title strings **byte-identical**); the five committed JPEGs
viewed (light/dark landing + fixture empty/one/multi) with **commit correspondence proven by content** (sans `h1` +
italic serif `em`, and the review banner, exist only in the target tree); `git ls-remote` all four refs.

**Never executed here — say so, don't imply:** Chromium E2E (`playwright@1.64.1` present, **0 browser binaries**, the
CDN is off-allowlist; AC's "23 passed + 1 skipped" is `[REPORTED-AC]` but *arithmetically consistent* with
11 + 12 + 1 and every assertion read as substantive); full `npm audit` incl. dev; hosted `EXPLAIN`; real
GPU/Safari/Firefox/AT/Lighthouse; 1:1 review of the JPEGs (AK's render is downscaled — AK briefly mis-read
"clippng" and corrected against source).

**Harness artefacts worth keeping:** `/home/user/scratch/probe/probe5|6|9|10.mjs` (probe8's text-substitution
approach is the one to *avoid* — see below), `/home/user/scratch/t` + `/home/user/scratch/p` (target/parent trees),
`/home/user/scratch/acbuild` (working install + completed build). Throwaway, outside the repo, safe to delete.

**New probe traps (AK cost time on each; a successor should skip them):**
1. A probe term that matches **nothing** makes every clamp/paging probe vacuous — probe5's `ak` returned `{"c":0}`
   for NULL/0/9999 alike and looked "consistent". Use a term that matches most rows (`filler`), and print the
   match count next to every clamp result.
2. **Deriving a SQL variant by string-substituting the migration's own body looks faithful but fails silently** —
   probe8's replaces missed (`syntax error at or near "$"`) and every variant then returned the *same* empty result
   at 0.2 ms, i.e. a plausible-looking 100 % "improvement". Transcribe the query yourself (probe9) and assert
   non-zero, differing row counts before believing any timing.
3. `.catch(() => null)` around a probe query turns a bug into a **false PASS** — two "identical payloads ✓" rows
   came from two `undefined`s. Remove the catches; let it throw.
4. `String.replace("x", "y")` fixes only the first occurrence; their body has two.
5. `EXPLAIN` of a `language sql` function shows only a `Result` node — plan the extracted `SELECT` with literals;
   PGlite rejects `EXPLAIN` of a parameterised call with `0P01`.
6. PGlite error objects dump the bundled module source (≈15 KB of noise) — log `e.code` + first line only.
7. `insert … description` under 10 chars trips `documents_description_check` (that is AC's constraint, correctly
   documented; the probe just has to satisfy it).

## 11. AK's review of AC's deterministic-V1 ordering — 2026-11-03

**Object:** AC branch `arena/c9d0d599-presentation` @ **`c5c6ce3ca65113680be614c20ff2c12be95b0954`**
("fix: make ranked search pagination deterministic"), parent
**`2b46c60d8945a6a10a9f05be49994b32d5939343`** ("review: reject search v2 after local validation", 13 files +204/−0),
itself a child of `3ffd555…` (the commit of §10) and `681800f…`. 14 files, +294/−2, 2026-11-03T00:36:59Z.
**Deliverable:** `phase2/AC_DETERMINISTIC_SEARCH_REVIEW.md`. **Verdict: ACCEPT** (three conditions attach to *hosted
application*: A1 hosted `EXPLAIN`, A2 the non-RPC tie decision, A3 optional narrow-then-fetch speedup).

**Git truth at this hand-off** (`git ls-remote`, verified at start **and** before commit): AK
`arena/9d055deb-presentation` was at `4d7c56cee8cc34c2daeb1ac0ff53a102ae9af9f5` when the review was written and this
entry is committed directly on top of it; `main` `4307a6884527e22af27541cd76722867e5e6bb14` (nothing merged);
`AC-Branch` `cac9c7f145abe99bd12a8831cc371e370fbe35d5`. The sandbox was **re-provisioned again** at the start of this
round (pack showed untracked at `4307a68`); restored by `git fetch` + `git reset --hard 4d7c56c` before any work.

**What was reproduced on AK's own install** (`/home/user/scratch2/acbuild` = the target tree + own `npm ci`, 329
packages, node 22.22.3): `next build` exit 0, `tsc` 0, `eslint` 0, unit **47/47**, DB **27/27**, `npm audit
--omit=dev --audit-level=high` **0**, AC's `scripts/evaluate-search-ordering.mjs` end to end (28/28 + 20/20 oracle
cases, 84 pages of 48 with 0 duplicates, RLS roles, plan dumps; AK's medians 5–10 % above AC's on the same script).
**AK's own verifier** (`/home/user/scratch2/probe11.mjs`, now committed as `phase2/tooling/verify-search-ordering.mjs`):
own corpus + own oracle → **36/36 exact** totals and ordered pages, 400-tie walks at size 12 and 48 run twice with 0
duplicates and stable `total`, adjacency/deep/tail/beyond offsets, clamps (0→1, −5→1, 9999→48, null→12, 49→48,
offset −5→0), facets, draft invisible, `42501` on direct writes for both roles, table intact.
**The decisive control:** AC's new test run against the **parent** migration fails exactly as AC said it would
(`not ok 10 … relevance/tieprobe: offset 0`, 9 other DB tests pass); restored → 27/27.
**Cost of the fix** (A/B in one session, same data, alternating, median 5–7): +1.4 % / +5.5 % / +0.4 % / −0.6 % /
+1.0 % with a **node-for-node identical plan** (`Limit → Sort → WindowAgg → Sort → CTE Scan`) — i.e. free.
**v2 confirmed absent:** `grep -c materialized` = 0, `row_number() over` retained, only the 5-line hunk + comment
changed. **Non-RPC paths remain non-total** (`catalog.ts:186–189` browse + fallback, `:232–234` rails, `:252`
related; `search.ts:78–82` comparators end in `localeCompare(title)`, but compat mode is deterministic because the
input is a static module) — consequence and a ≈8-line fix are in review §9. `src/proxy.ts` matches `/admin/*` only, so
it neither masks nor worsens this.

**Executed, do not re-run:** everything above; plus full migration/test/script/doc reads, `2b46c60`'s parent check
(`3ffd555`), `documents.id uuid primary key default gen_random_uuid()` at
`202611010001_catalog.sql:41` (the reason the ordering claim is a *proof*, not a measurement), and the 11-doc
consistency diff (`SEARCH_V2_VALIDATION.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `FRONTEND_ACCEPTANCE_CHECKLIST.md`,
`FRONTEND_CORRECTIONS.md`, both handovers, `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`,
`DEVELOPMENT_GUIDE.md`) — no contradictions; the only nit is that `npm run check` excludes `test:db`.

**Never executed here (say so):** Chromium E2E (playwright 1.64.1, **0 browser binaries**, CDN off-allowlist →
AC's `23 pass + 1 skip` stays `[REPORTED-AC]`); strict slow-GL refusal (AC measured no reproducible refusal
condition — honest `UNVERIFIED`); full dev-audit count; hosted plans; real GPU/AT/Lighthouse.

**New probe traps (each cost AK a retry; a successor should skip them):** (1) parameter-count mismatch — an oracle
taking the RPC's 11-arg array while declaring 9 placeholders fails with `08P01 bind message supplies 11 parameters`;
slice. (2) building a SQL variant by string surgery must assert **both** the anchor match *and* paren balance —
dropping `order by o.rn` from `jsonb_agg(…) order by o.rn) from …` needs `)) from`, not `) from`. (3) narrow-CTE
variants must carry the **ordering** columns (id/title/created_at/is_featured/rank), not just id, or the window
loses `f.title`. (4) `slug like 'ak-%'` also matches a `ak-draft` sentinel → `cast(substring(…) as int)` explodes;
use `~ '^ak-[0-9]+$'`. (5) UUID literals in hand-built `insert` values need quotes. (6) `db.escape` is not a PGlite
API — avoid. (7) **ESM `node_modules` resolution follows the script's own directory**, so a tooling script committed in the pack cannot import the app's dependencies when run from elsewhere — copy it into the target tree (or symlink `node_modules` beside it) and say so in the header. (8) `bash -c` with nested `"` inside `python3 - <<PY` heredocs breaks; keep the patch script free of
quotes-within-quotes.

**AK's next actions:** hold for AO's answer to A1–A3; if AO accepts, the pack should record the total-order contract
in `APPROVED_DESIGN_IMPLEMENTATION_SPEC.md` (one line) and drop the `.order("id")` recommendation into AC's queue.
`prototype-lab` is untouched this round (no dependency work); its `node_modules`/`dist` are still absent after
re-provision and rebuild with `npm install && node build.mjs && node test.mjs` if a lab number is needed again.
