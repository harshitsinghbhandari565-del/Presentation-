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
| Build | **10/10 experiments built**, `dist/index.html` generated |
| Headless suite | **20 passed, 0 failed** across both passes (default + forced reduced-motion), jsdom 26.1.0 |
| Reproducibility | `measurements.json` and `headless-results.json` came out **byte-identical to the committed files** (`git status` clean after the run) → the pipeline is deterministic, not a one-off number |
| Vendor floors re-measured | gsap core **27.1 KB** gz · gsap+ScrollTrigger **44.4** · +Flip **53.1** · +SplitText **56.1** · lenis **5.3** · three (namespace) **187.5** · three (named subset) **130.4** · three+OrbitControls **191.6** · motion vanilla **27.7** · framer-motion 12.43.0 root **44.9** · framer-motion react-only **42.8** · **framer-motion/mini + LazyMotion(domAnimation) 29.7** · motion/react **49.5** |
| Experiment sizes re-measured | ex05 raw-GLSL shader background **6.6 KB js / 3.1 KB gz** (0 vendor) · ex06 particles **740.7 KB / 192.2 gz** (three inlined) · ex07 doc-card **190.0 / 67.5** (motion) · ex10 mobile variant **4.5 / 2.0** (0 vendor) |
| Live preview | `python3 -m http.server 8123 --bind 0.0.0.0 --directory dist` started in this session — **AO/AC can open the 10 prototypes now** (the sandbox exposes the port). That converts the `⚠️ UNTESTED VISUALLY` rows into something a human can sign off, which is the only way that gap closes |
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

## 5. Re-verification scorecard

| Deliverable-level claim | Status after this pass |
|---|---|
| 300+ distinct repositories catalogued (1,914 in-scope / 2,566 unique) | ✅ holds; counts re-derived; 0 fabricated URLs in sample |
| 60+ candidates selected for deeper inspection (72 ◆) | ✅ unchanged; +5 newly inspected (C1) |
| 25–35 detailed technical evaluations (35) | ✅ unchanged, now 40 with the supplement |
| 100+ website experiences (154) | ✅ holds; **+14 rows upgraded** from listing-only to URL+award verified (§E) |
| 10 prototypes implemented, sizes measured | ✅ **re-measured from a clean install, byte-identical** |
| Prototype visual sign-off | ⚠️ still open — impossible headlessly; preview is served on `:8123` for AO/AC |
| Performance budgets / compatibility / stack recommendations | ✅ numbers reproduce; C2/C5/C6/C7 refine four lines |
| "No AC file, app config, lockfile, Supabase, CI or secret touched" | ✅ `git status` clean before this edit; only `frontend-intelligence/**` has ever been modified on this branch |

## 6. What this pass did *not* change

Phase 1's pack, Phase 2's blueprint, ranking, sequence, interaction lab and design docs are **not rewritten** — they were confirmed. The only files touched today are: this log, `tooling/*` (new), `WEBSITE_ATLAS.md` (§E + provenance), `TOP_35_DEEP_EVALUATIONS.md` (supplement), `REPOSITORY_ATLAS.md` (5 status/licence cells), `RECOMMENDED_STACK.md` (C2/C5/C6/C7 lines), `GITHUB_RESEARCH_GAPS.md` (gap closure), `INTERACTION_EXPERIMENT_LAB.md` (re-run + preview), and both handovers.
