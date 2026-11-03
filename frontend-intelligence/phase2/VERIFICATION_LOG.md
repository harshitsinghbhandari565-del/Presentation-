# Phase 2.1 — independent verification pass

**AK · 2026-11-02 (second session) · re-execution + corrections, not new opinions.**
Trigger: AO re-issued the Phase 2 brief. Rather than re-run research that is already committed, this session **re-executed** it in a re-provisioned sandbox and tried to falsify its own numbers. Everything below is either `[MEASURED]` (produced by a run here), `[VERIFIED-API]` (live API answer today) or a documented incident.

---

## 1. Environment incident (recorded because it affects reproducibility)

| Event | Detail |
|---|---|
| Sandbox re-provisioned | Fresh clone at `4307a68`; local HEAD no longer contained Phase 1/2 commits; `git reflog` showed only `clone:` + `checkout:` |
| Pack files | Present on disk but **untracked**; a byte-for-byte `diff -rq` against the committed tree at `2f3c352` returned **zero differences** → no research content lost |
| Repair | `git fetch origin arena/9d055deb-presentation` → `git reset --hard FETCH_HEAD` (own branch only; `AC-Branch` @ `cac9c7f` and `main` untouched, never checked out) |
| Lost with the reset | `/home/user/research/` — the discovery pipeline (`discover.py`, `gapfill.py`, `catalog.py`, `deep_eval.py`, `gen_atlas.py`, `gen_demos.py`) and the raw corpus `discovery/{raw.jsonl (2,926 rows), catalog.json, deep_evals.json}`. **Not recoverable in this sandbox.** The atlas itself is unaffected (its values are what the API returned), but regenerating it from scratch would need re-crawling |
| Mitigation applied | The two tools that matter for **auditing** (not re-crawling) are now committed inside the pack: `phase2/tooling/verify_atlas.py`, `phase2/tooling/fetch_repo_cards.py` (+ `tooling/README.md`). They no longer live in an ephemeral scratch dir |

`[AK-RECOMMENDATION]` for AO: if Phase 3 re-opens discovery, the pipeline should live in `frontend-intelligence/phase2/tooling/` from the start, and the raw JSONL should be either committed (it is ~2 MB, well inside the 128 MB patch cap) or exported to an issue/attachment — a research corpus that exists only in a sandbox is not a research corpus.

## 2. Prototype lab re-executed from scratch — `[MEASURED]`, deterministic

`rm -rf` free path: fresh `npm install` (52 packages, 4 s) → `node build.mjs` → `node test.mjs` in this new sandbox.

| Check | Result |
|---|---|
| Build | **10/10 experiments built** at the time of this run, `dist/index.html` generated. *(Later the same day AK added an 11th — see the two rows below.)* |
| Headless suite | **20 passed, 0 failed** across both passes (default + forced reduced-motion), jsdom 26.1.0 → **now 22/22** with ex11 |
| Reproducibility | `measurements.json` and `headless-results.json` came out **byte-identical to the committed files** (`git status` clean after the run) → the pipeline is deterministic, not a one-off number |
| Vendor floors re-measured | gsap core **27.1 KB** gz · gsap+ScrollTrigger **44.4** · +Flip **53.1** · +SplitText **56.1** · lenis **5.3** · three (namespace) **187.5** · three (named subset) **130.4** · three+OrbitControls **191.6** · motion vanilla **27.7** · framer-motion 12.43.0 root **44.9** · framer-motion react-only **42.8** · **framer-motion/mini + LazyMotion(domAnimation) 29.7** · motion/react **49.5** |
| Experiment sizes re-measured | ex05 raw-GLSL shader background **6.6 KB js / 3.1 KB gz** (0 vendor) · ex06 particles **740.7 KB / 192.2 gz** (three inlined) · ex07 doc-card **190.0 / 67.5** (motion) · ex10 mobile variant **4.5 / 2.0** (0 vendor) |
| Live preview | `python3 -m http.server 8123 --bind 0.0.0.0 --directory dist` started in this session — **AO/AC can open the 10 prototypes now** (the sandbox exposes the port). That converts the `⚠️ UNTESTED VISUALLY` rows into something a human can sign off, which is the only way that gap closes |
| ex11 (added later today) | `prototype-lab/src/ex11-approved-spec/` builds at **13.9 KB js / 6.1 KB gz / 6.8 KB css, 0 vendor code**; `node test.mjs` → **22 passed, 0 failed** (11 experiments × 2 motion modes). `measurements.json` and `headless-results.json` therefore **differ from the byte-identical run above by exactly the ex11 entries** — the ten pre-existing rows reproduce unchanged, which is the intended diff, not a regression |
| Still not covered | fps, GPU cost, memory, paint, layout/scroll geometry, touch gestures, AT output — no browser binary and no `playwright`/`chromium` exists in this sandbox (`which` returned nothing), so **AK still cannot report a rendering pass**. `[UNVERIFIED]` remains the correct label for every visual claim |

**Consequence for the numbers Phase 2 published:** the −15.2 KB `framer-motion/mini` finding (44.9 → 29.7 KB gz) reproduced exactly on a clean install, so it stands as a measured fact for this bundle set (esbuild 0.25.12 + zlib, `--bundle --minify`), with the known ±15 % caveat versus Next's bundler. `[MEASURED]`

## 3. Repository-atlas integrity audit

| Check | Result |
|---|---|
| Row count | **1,914 in-scope rows parsed** from `REPOSITORY_ATLAS.md` — matches the published claim exactly (the "1,912" a manual grep suggested was my counter skipping rows whose description contains an escaped pipe) |
| Per-section counts | 161 / 151 / 138 / 266 / 235 / 152 / 192 / 160 / 459 — each equals its stated target-overflow figure (`REPOSITORY_ATLAS.md` §1), so **no category was padded to reach 300** |
| Existence check (the fabrication test) | Random sample of 18 rows (`seed=42`) fetched live: **18/18 repositories exist, 0 URL inventions**, including small/odd entries (`Mausam5055/Priyanka-Interactive` 9★, `drcmda/troika` 0★) |
| Value drift | 6 rows flagged: 4 were licence-cell parser artefacts (`NONE ⚠️` vs API `null`), 2 were star deltas of 1–3 and one `pushed_at` that rolled past UTC midnight. **No substantive error found** |
| Tooling | Re-runnable by AO: `python3 phase2/tooling/verify_atlas.py --sample 40` |

## 4. Corrections to Phase 2 / Phase 1 claims (found by reading source, not prose)

These are the ones that change a recommendation or a licence statement. `[VERIFIED-API]` throughout (GitHub + npm registry, 2026-11-02).

| # | Claim being corrected | Verified reality | Effect |
|---|---|---|---|
| C1 | "the 4 repos in `TOP_35_DEEP_EVALUATIONS.md` — `@react-three/postprocessing`, `ogl`, `troika-three-text`, `@tanstack/virtual` — were left ▲ shortlisted, never inspected" (open item #4) | All four now inspected from source: `pmndrs/react-postprocessing` **1,498★, MIT, pushed 2026-10-21**; `oframe/ogl` 4,745★, **no LICENSE file in repo but `package.json`/npm declare `Unlicense`**, last publish 1.0.11 **2025-01-27**; `troika-three-text` lives in **`protectwise/troika`** (1,985★, MIT, **pushed 2026-11-01**), deps `bidi-js, troika-three-utils, troika-worker-utils, webgl-sdf-generator`, peer `three >=0.125.0`; `@tanstack/react-virtual` **3.14.25 published 2026-11-01**, MIT, peer `react ^16.8 ‖ ^17 ‖ ^18 ‖ ^19` | Gap #4 closed → `◆ inspected`. Cards in `TOP_35_DEEP_EVALUATIONS.md` § Supplementary |
| C2 | Phase 1 `technical-guides/recommended-stack.md`: skip `@react-three/postprocessing@3.2.2` because of "no React 19 guarantee" | Its peers are explicit: `@react-three/fiber >=9.7.0`, `react ^19.0.0`, `three >= 0.156.0`, `postprocessing ^6.36.0`; MIT; repo active in Oct 2026 | The **rejection still stands** (bundle cost + no post-processing needed for our garnish) but the *reason* is now "cost", not "compatibility risk". Recorded so nobody re-litigates it on stale grounds |
| C3 | `REPOSITORY_ATLAS.md` lists `oframe/ogl` licence as `NONE ⚠️` | API agrees (no SPDX detectable) — **but** the package declares `Unlicense` in both `package.json` and the npm registry | The atlas cell stays `NONE ⚠️` (it is a pure API column and the API reports no SPDX); the npm-declared `Unlicense` nuance is recorded in the deep-evaluation supplement instead. OGL stays ❌ for **staleness** (1.0.11, 2025-01-27), not licensing |
| C4 | "troika's licence field absent in registry" (Phase 1 U11) | npm `troika-three-text@0.52.5` → **MIT**; repo `protectwise/troika` → MIT, active yesterday | U11 closed. If 3D text ever ships, licence is not the blocker |
| C5 | Phase 1 recommended `dip/cmdk` as "active (2025-10-29)" | Repo pushes stop 2025-10-29 **and the published package is 19 months older**: `cmdk@1.1.1` published **2025-03-14**; npm metadata still points at `pacocoursey/cmdk` (now 404 — the repo moved) | Not a blocker (it is stable, MIT, 13,062★) but AC must **pin `1.1.1`** and expect no upstream fixes. Recorded in `RECOMMENDED_STACK.md` |
| C6 | `@gsap/react@2.1.2` offered as the React glue | 2.1.2 published **2025-01-15** (21 months quiet); it is a 2 KB wrapper (`useGSAP`) around `gsap.context()` | Recommendation softened: `gsap.context()` + explicit `ctx.revert()` is the dependency-free default; `@gsap/react` optional |
| C7 | "`framer-motion` → `motion` package rename" framing (Phase 1 §3 wording) | npm **`framer-motion` latest is 14.9.0, published 2026-10-30 — same version, same repo** as `motion` | AC's upgrade is literally `framer-motion@14.9.0`; no package rename, no codemod needed for that axis. Removes a needless migration step |
| C8 | three.js "WebGPU is where the project is going" (Phase 1 `research/threejs.md`) | `examples/` tree today: **622 example files → 300 `webgl_*`, 243 `webgpu_*`**; WebGPU categories are dominated by `postprocessing` (33), `materials` (19), `tsl` (16), `compute` (15) | **28 % of the gallery is WebGPU and it is all new-authoring surface, but WebGL is still the majority and the only path we ship on 2026 mid-range Android.** The recommendation to default to `WebGLRenderer` is now backed by a count, not by judgement |
| C9 | `GITHUB_RESEARCH_GAPS.md` / open item #3: "WebGPU example enumeration not done" | Done — the numbers in C8 (`examples/*.html` via the API tree, `webgpu_*` filtered) | Gap #3 closed |
| C10 | Open item #5: "Awwwards SOTD archive depth — 44 names, only 1 verified award winner" | Fetched `awwwards.com/websites/sites_of_the_day/` 2026-11-02: **14 entries with per-site URLs, SOTD dates (2026-10-21 → 11-02) and 13 of them also holding a Developer Award** (Grids/Obys, Dont Look up game, MECHA/widelab, Spyker Cars/The Brink, G. Colombel Portfolio 2026, A24/Ravi Klaassens, Forge Automotive/12 Studio, ESR Bespoke/NIGHTJAR, Ascension—Pegassi/Jesper Landberg, Cartier—Le Chœur des Pierres/makemepulse, …) | WEBSITE_ATLAS gains **§E**, the first section with both a live URL *and* a confirmed award; `Spyker Cars` (previously row 13, listing-only) is now double-confirmed |
| C11 | — | **New section: `AC_BRANCH_DELTA.md`.** A read-only re-sync against `origin/AC-Branch` @ `cac9c7f` found that AC has moved far beyond the pack's baseline: Supabase catalog migrations (`administrators · subjects · courses · documents`), 18 route files incl. an `/admin/*` surface, server-rendered landing, self-hosted fontsource fonts, lockfile, `!important` 15 → 4, and **`src/db/schema.ts` still `export {}`** (dead Drizzle path). It also found four live defects in AC's committed code — a self-referential `--font-editorial` token that silently disables Newsreader, `to_tsvector('simple')` with no `setweight` plus "featured-first" ordering, an `embed_url like 'https://docs.google.com/%'` constraint that makes Dropbox embedding impossible by policy, and **`seed.sql` with zero rows** | Phase 1's audit §1 and the playbook's opening premise are now explicitly superseded; `audit/stack-audit.md` carries a pointer banner |
| C12 | Every Phase 1/2 bundle figure carried the caveat "esbuild ±15 % vs Next's bundler"; the app's own First Load JS was never known | **Caveat closed.** AK extracted AC's tree (`codeload`), ran `npm ci` (424 pkgs, 16 s) + `npx next build` (Next 16.4.3 Turbopack, **exit 0**, 11 pages, 10.6 s compile) in an isolated scratch dir and measured **landing First Load JS = 240.9 KB gz**, shared runtime 128.8 KB gz, CSS 12.8 KB gz, fonts 91.7 KB / 2 files. Full table + per-route numbers in `AC_APP_MEASURED.md` |
| C13 | AK's own `AC_APP_MEASURED.md` §2 row "**R7/R8 remain unimplemented** (live regions for result counts)", based on `aria-live` count 0 in the prerendered landing HTML | **wrong scope, corrected the same day.** `src/components/library/LibraryControls.tsx` already ships `<p role="status" aria-live="polite"><strong>{total}</strong> resources for <q>…</q></p>` inside an `aria-busy` region, the ⌘K palette is a complete combobox (`aria-activedescendant` + `role="listbox"`/`option` + `role="alert"`), and `loading.tsx` on `/library` + `/admin` already announce. Genuine gaps: skeletons, and no root `loading.tsx` | **Method lesson recorded for the next session: a prerendered route's HTML cannot prove the absence of a live region that renders inside a client component or a Suspense fallback. Read the components before declaring an a11y item unimplemented.** Found while writing `APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md` row E4 |
| C14 | AK's suggestion (written into the spec draft) that AC "should ship the roman Newsreader file because only the italic one loads" | **withdrawn before publication.** Reading all 6 editorial selector groups in the built CSS shows every one of them *wants* italic (5 declare `font-style: italic`; the 13 `<em>` sites are all inside `h1/h2/h3`). Italic-only is a coherent design, not a missing asset — so the deliverable becomes a comment in `globals.css`, not a +30 KB third woff2 | Checked the actual rule set rather than the asset list; the spec keeps the one exception it found (`.visual-caption`, serif at 15px) as an AO/PO call instead of "fixing" it |

| C15 | `RECOMMENDED_STACK.md` / the spec's budget line **P2** / checklist row B3: "switch to `framer-motion/mini` + `LazyMotion(domAnimation)` to save **−15.2 KB**", sourced from `prototype-lab/build.mjs` | The 29.7 KB row is real but **mislabelled**: the probe imported `LazyMotion, domAnimation, m, useScroll` from the **main** `framer-motion` entry while naming it "framer-motion/mini". Downloading `framer-motion@12.43.0` from the registry: `dist/es/mini.mjs` is exactly `export { useAnimateMini as useAnimate }` — `/mini` has no `LazyMotion`, no `m`, no `useScroll`. Measured entry shapes: `/mini` 3.1 KB gz · `/dom/mini` 3.0 KB · AC's removed usage 43.1 KB · main-entry `LazyMotion` shape 29.7 KB | The −15.2 KB recommendation was **not implementable as written**. AC read the same file, found it, and beat it by deleting the library (−41.5 KB landing JS). Spec P2 and checklist B3 carry the correction; nobody should re-propose the `/mini` swap |
| C16 | The spec's §4 3D gate list (`pointer:coarse`, `innerWidth < 1024`, `deviceMemory ≤ 4`, `hardwareConcurrency ≤ 2`, `saveData`, reduced-motion) as a *requirement* | AC's shelf is **demand-rendered**: `mountShelf` draws on `resize` + drag only, has no `requestAnimationFrame` loop, `touch-action: pan-y`, and full `dispose()`. Under those conditions the device gates protect nothing and would deny a static object to people who asked for it. One real gate was **missing from my list**: `failIfMajor` (neither GL call site sets it → software WebGL still animates) | Gates superseded → **explicit intent + no usable WebGL + projector-mode + `failIfMajor`**. `ex11`'s `sceneGate()` should be revised to match AC's implementation; `saveData` becomes a size disclosure, not a block. Recorded in spec §4 and review §3.2 |
| C17 | Two of AK's own budget/style lines: "≤ 2 font files" (spec P4 / checklist D4) and "adopt `--step-*` tokens" (spec §1, checklist A4) | AC shipped **3 woff2 files / 148.4 KB, all preloaded, both fallbacks metric-adjusted** (106.28 % geist, 104.8 % editorial) — which is the *correct* answer once roman Newsreader is load-bearing; and shipped the scale as `--text-display/-h1/-h2/-h3/-body/-meta` + `--leading-*`/`--tracking-*`, consumed by 8 rule groups, with the px ladder left intact | **The pack's lines change, not AC's build.** Font budget amended (D4 marked pass-with-amendment, P6 added); `--text-*` becomes the pack's recommended naming for Next + `@theme` apps. Genuine remaining gap on AC's side: **0 `--motion-*`/`--ease-*` tokens** (defect D-6) |
| C18 | Checklist E3: "the numeric rail stays decorative" (i.e. no interactive chapter index) | AC built `StoryIndex.tsx` as a real `<nav aria-label="How it works chapters">` of in-page anchors with `aria-current="step"`, `scroll-margin-top`, 44 px targets, and an **E2E test that the pin does not trap focus** | Deviation **accepted as an improvement**; the spec's "decorative" instruction is superseded where it would have removed working navigation. Two notes kept: `aria-current` is hardcoded to step 1 on load (cosmetic), and the pinned `.how-step` is animated twice (wrapper `.reveal` + step rule → defect D-7) |

## 5. Re-verification scorecard

| Deliverable-level claim | Status after this pass |
|---|---|
| 300+ distinct repositories catalogued (1,914 in-scope / 2,566 unique) | ✅ holds; counts re-derived; 0 fabricated URLs in sample |
| 60+ candidates selected for deeper inspection (72 ◆) | ✅ unchanged; +5 newly inspected (C1) |
| 25–35 detailed technical evaluations (35) | ✅ unchanged, now 40 with the supplement |
| 100+ website experiences (154) | ✅ holds; **+14 rows upgraded** from listing-only to URL+award verified (§E) |
| 10 prototypes implemented, sizes measured | ✅ **re-measured from a clean install, byte-identical**; **11** as of the same day (ex11 = the approved design assembled), **22/22** assertions |
| Prototype visual sign-off | ⚠️ still open — impossible headlessly; preview is served on `:8123` for AO/AC |
| Performance budgets / compatibility / stack recommendations | ✅ numbers reproduce; C2/C5/C6/C7 refine four lines; **C12 replaces the "<300 KB" wish with a measured 240.9 KB landing page (59 KB of slack)** |
| Two of AK's own same-day severity calls (A1, A4) | ✗ **wrong, corrected in-place** after the build made them checkable — see `AC_APP_MEASURED.md` §4 |
| "No AC file, app config, lockfile, Supabase, CI or secret touched" | ✅ `git status` clean before this edit; only `frontend-intelligence/**` has ever been modified on this branch |
| Approved design spec + acceptance checklist exist as reviewable documents (`APPROVED_DESIGN_IMPLEMENTATION_SPEC.md`, `APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md`) | ✅ written 2026-11-02 against AC's `arena/c9d0d599-presentation@71d6fb9`, with measured / proposed-target / unverified rows separated; no new GSAP recommendation (licence review pending), the one 3D scene stays optional and off the first load |
| AC's *active* implementation branch | ⚠️ **moved again and is easy to cite wrong:** implementation lives on `arena/c9d0d599-presentation` (`71d6fb9`); `AC-Branch@cac9c7f` is stale. Re-read `git ls-remote` before quoting "AC's branch", and name the sha |

## 6. What this pass did *not* change

Phase 1's pack, Phase 2's blueprint, ranking, sequence, interaction lab and design docs are **not rewritten** — they were confirmed. The only files touched at that point were: this log, `tooling/*` (new), `WEBSITE_ATLAS.md` (§E + provenance), `TOP_35_DEEP_EVALUATIONS.md` (supplement), `REPOSITORY_ATLAS.md` (5 status/licence cells), `RECOMMENDED_STACK.md` (C2/C5/C6/C7 lines), `GITHUB_RESEARCH_GAPS.md` (gap closure), `INTERACTION_EXPERIMENT_LAB.md` (re-run + preview), and both handovers.

**Later the same day (the approved-design pass) added:** `APPROVED_DESIGN_IMPLEMENTATION_SPEC.md`,
`APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md`, `prototype-lab/src/ex11-approved-spec/` (+ its `test.mjs`
registration, `measurements.json`, `headless-results.json`), the `INTERACTION_EXPERIMENT_LAB.md` row 11
and §8 note, `AC_APP_MEASURED.md` (font loader detail + §4 rows 5–6 corrections), `phase2/README.md`
(rows 20–23 + the reading pointer), and both handovers. **No app file, no `package.json`, no config, no
DB, no CI, no secret was touched; nothing was merged.**


## 7. Independent audit of AC's implementation commit — 2026-11-02

Deliverable: **`AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md`** (240 lines) against AC's
`arena/c9d0d599-presentation@681800f894b2cf17021bb540e177a68c05e8f72e` (parent `71d6fb9` verified via
`api.github.com`; 34 files, +1,038/−104). Recommendation to AO: **ACCEPT WITH CONDITIONS**.

What made this pass different from every earlier one: AK **executed AC's tree**, not just read it.
`/home/user/scratch/acbuild` (a copy outside the repo) got `npm ci` + `npx next build` (exit 0), then
`tsc --noEmit` 0 · `eslint .` 0 · `npm run test:unit` **35/35** · `npm run test:db` **21/21** ·
`npm audit --omit=dev --audit-level=high` **0** · full audit **20 moderate** — every one of AC's claimed
gate numbers reproduced. AC's Chromium E2E (17/17) is **not** reproducible here (no browser binary; the
Playwright CDN is off the allowlist), so it is labelled `[REPORTED-AC]`; its *existence and names* were
verified statically (5 tests in `frontend.spec.ts` + 12 in `public.spec.ts` = 17, single chromium project
at 1440×1000).

Four PGlite probes of AK's own (`/home/user/scratch/probe/`) applied AC's real migrations + both seeds,
added **4,000 synthetic published rows**, and measured the ranking RPC against the existing GIN path:
**281 ms vs 1.9 ms** for the same term (95 ms even when nothing matches), `create index … using gin
((setweight(…)))` and a `generated always as (setweight(…)) stored` column both rejected with `42P17`,
the field set silently **drops semester / document_type / platform / subject** ("Sem 2" → 0 rows via the
RPC, 1,032 via the fallback), paging NULLs clamp rather than leak (`page_size => null` → 48), injection-
shaped and unbalanced-quote inputs return 0 with the table intact, and `set role anon` confirms the
security-invoker + RLS posture (draft fixture never visible). **Method lesson for the pack: a green
`test:db` suite proves the SQL is valid, not that it is *selective* — a corpus of 16 rows cannot show a
missing field in a tsvector. Scale the fixtures before trusting a ranking migration.**

Lab re-verified after the sandbox re-provision: `npm install` (52 pkgs, 2 s) → `build.mjs` **11/11** →
`test.mjs` **22/22** (default + forced reduced-motion), preview still served on `:8123`.

## 6. Correction-round re-review — AK's own claims tested again (2026-11-03)

Object: AC's `3ffd555` (parent `681800f`). Evidence: `AC_CORRECTION_INDEPENDENT_REVIEW.md`. Four entries below are
**AK correcting AK**, recorded rather than quietly rewritten, per the mission's history rule.

| # | Claim AK made in the first audit | What the re-review measured on AC's corrected code | Disposition |
|---|---|---|---|
| **C19** | D-2's fix: *"filter on the indexed column, rank on the weighted expression — `where d.search_vector @@ q.tsq` then `ts_rank(weighted)` in the ORDER BY"* — praised as needing no DDL and 57× faster | `search_vector` in the **applied** migration is title/description/topic/semester/document_type/platform/keywords/tags — it contains **no subject or course name**. AK's rewrite would therefore have silently dropped taxonomy-joined matches, i.e. **re-introduced D-1**. AC shipped a strictly better structure (OR-of-lexemes candidate superset + UNION of subject/course ids + full re-filter), which AK verified for **candidate completeness: 28/28 exact agreement** with an independent oracle, including negation-only (`zephyrq -Title` 505 = 505) and blank/unrestricted queries — the two cases that usually break such a design | **Withdrawn.** My speed number was bought with a coverage hole. The correct speed advice is now structural, not semantic (see C20's measurement). Recorded so nobody re-proposes "just filter on `search_vector`" |
| **C20** | First audit, in parentheses: *"the `total` sub-select does **not** double the cost — measured 95.4 vs 95.3 ms, so the CTE is reused"* | Neither that number nor this round's apparent contradiction (323.6 ms shipped vs 152.6 ms for a single-pass shape) survives scrutiny: the second comparison **also dropped joins**, so it measured a different query. Re-measured faithfully — transcribing AC's own stages side by side — the shipped shape and the two-reference shape cost the **same**, and the cost driver is **per-candidate weighted-vector construction + `ts_rank` over up to 4,016 rows plus a `row_number()` window over the whole filtered set**. Removing the window and materialising `filtered`: **309 → 214 ms** broad term, **367 → 266 ms** at deep pagination, **identical top-12 ordering** verified | **Both claims retired; one measured recommendation replaces them.** v2 is 3 lines, no DDL, no semantics change. The 4× bounded-prefix variant is *not* recommended (reorders results and caps `total` at the prefix) |
| **C21** | Headline framing: *"the RPC is **49–57× slower** than the GIN predicate alone"* (true) alongside the earlier *"281 ms vs 1.9 ms"* | Correct in isolation, misleading as a *change* claim: measured against the **shape AC replaced** (full-scan + per-row `to_tsvector`), the corrected RPC is **1.01–1.27×** at 4,016 rows, and `set enable_seqscan = off` moves it 261.9 → 232.5 ms (noise). At today's hosted scale (17 published rows) it costs **1.9 ms**. So the rewrite bought correctness + index eligibility + scalability, **not** a regression and **not** a speedup | **Reframed in the review (§4B).** Any AO note quoting a multiple must state *which* baseline; the honest sentence is "no measurable change at 4 k rows, correct coverage, index-eligible filter" |
| **C22** | Method: *"`@media (forced-colors: active)` → 0 hits in source and built CSS"* (defect D-10) | The built CSS is minified to `@media (forced-colors:active)`; the whitespace-tolerant pattern returns 0 on files that **do** contain the rule. Re-checked with the whitespace-free form: AC's target tree ships forced-colors rules hiding `.ambient-canvas`, `.ambient-grid` and `.skeleton::after` | **Method fix for all future CSS audits:** normalise whitespace out of the file *before* regex-counting declarations. D-10 is fixed, and AK's original "0 rules" was accurate for the parent but only because the pattern happened to match there |
