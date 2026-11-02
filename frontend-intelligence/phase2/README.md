# Phase 2 — deep repository, website, technology and prototype research (AK)

Branch `arena/9d055deb-presentation`. Phase 1's 31-file pack is **unchanged and still valid** for the stack audit;
this folder is the Phase 2 layer on top of it. Where Phase 1 estimated, Phase 2 measured — and the corrections are
listed, not hidden.

## Read in this order

| # | file | what it answers | headline |
|--:|---|---|---|
| 1 | **`AO_FINAL_FRONTEND_BLUEPRINT.md`** | the product blueprint: landing, discovery, detail, design system, responsive architecture, what to install | Tier 0 delivers ~85 % of the brief for **0 KB**; three PO dials decide the rest |
| 2 | **`INTERACTION_EXPERIMENT_LAB.md`** | the 10 prototypes, their real sizes, what passed headlessly, what no browser could prove | **10/10 build, 20/20 headless assertions**; raw GLSL background **2.9 KB** vs three.js **192 KB** |
| 3 | `RECOMMENDED_STACK.md` | what to add, what to avoid, what's already there | the cheapest win is `framer-motion/mini`: **−15.2 KB gz, no new dependency** |
| 4 | `TECHNOLOGY_COMPARISON.md` | the nine comparisons with measured numbers | GSAP is 44.4 KB **and not MIT**; Lenis is 5.3 KB and the risk is behaviour, not size |
| 5 | `PERFORMANCE_BUDGETS.md` | route budgets, CWV targets, WebGL rules, CI gate | a 150 KB gz 3D budget is unreachable; here is what is |
| 6 | `ACCESSIBILITY_GUIDELINES.md` | motion states, keyboard contracts, test plan, AC-side findings | 5 reported file-level issues in AC's branches (not fixed by AK) |
| 7 | `COMPATIBILITY_MATRIX.md` | does any of this fight AC's real code? | no ❌ anywhere; 8 named constraints/conflicts instead |
| 8 | `REPOSITORY_ATLAS.md` | the discovery record: every repo, category, licence, activity, status | **1,914 in-scope rows** of 2,566 unique; **77 inspected**, 40 evaluated, 15 recommended |
| 9 | `REPOSITORY_QUALITY_RANKING.md` | how the shortlist was scored, and what was deliberately dropped | ranking alone would have promoted 18 off-topic repos |
| 10 | `TOP_35_DEEP_EVALUATIONS.md` | 35 evaluated from fetched README + `package.json` | deps/libs read from source, not from prose |
| 11 | `TOP_15_AC_REFERENCES.md` | the 15 references AC should actually open | each has a do-this / not-this line |
| 12 | `WEBSITE_ATLAS.md` | **168** experiences, 10 fields, observed vs verified kept apart | §E adds 14 entries with URL **and** award both verified (13 also hold a Developer Award) |
| 13 | `INTERACTION_BREAKDOWNS.md` | 14 patterns from effect → mechanism → code → cost | "premium" is mostly CSS + one measured exception |
| 14 | `VISUAL_DESIGN_PATTERNS.md` | type, grid, depth, glass, gradients, dark/light, card spec, anti-patterns | the card spec is ready to paste |
| 15 | `FRONTEND_IMPLEMENTATION_SEQUENCE.md` | 12 steps, each with a gate | steps 1–6 add no dependency at all |
| 16 | `GITHUB_RESEARCH_GAPS.md` | what's missing and why, updated after the run + closure pass | 3 of 7 open items closed with evidence; 4 remain and stay honest |
| 17 | **`VERIFICATION_LOG.md`** | the 2026-11-02 second-session pass: re-run lab, atlas audit, 11 corrections | the lab reproduces **byte-identically**; 18/18 sampled atlas rows exist, 0 invented URLs |
| 18 | **`AC_BRANCH_DELTA.md`** | what AC actually shipped since the pack was written + 4 live defects in AC's code | D1 and D7 are closed by AC; read this before `AC_IMPLEMENTATION_PLAYBOOK.md` §1 |
| 19 | `tooling/` | the audit scripts, committed so a re-provisioned sandbox can't lose them | `verify_atlas.py --sample 40` re-checks the atlas against the API |

## Method, in three lines

- **Discovery:** 50 GitHub topic feeds + 18 maintainer-org listings + ~158 paced searches (`/home/user/research/discover.py`, `gapfill.py`), resumable, API-only; **2,926 raw records → 2,566 unique → 1,914 in-scope** after dedupe + scope rules.
- **Inspection:** per shortlisted repo, `README.md` + `package.json` fetched and parsed (`deep_eval.py`) → 72 repos moved from *discovered* to **◆ inspected**; the ★ recommended set is 35, hand-picked for relevance.
- **Measurement:** every library number comes from a real esbuild + zlib run against pinned versions in an isolated `node_modules` (`prototype-lab/`), never from a blog post or a memory.

## Status legend used across these files

`· discovered` (metadata only) → `▲ shortlisted` (score ≥ 25) → `◆ inspected` (README + package.json read) → `★ recommended` (AK endorses for our product).

## Evidence labels

`[VERIFIED-API]` GitHub REST metadata · `[VERIFIED-FILE]` a file AK read (app branch via `git show`, or a fetched README/`package.json`) · `[VERIFIED-LICENSE]` npm registry licence field · `[VERIFIED-LISTING]` name/data read off a fetched listing page · `[VERIFIED-DEMO]` a live URL enumerated from a repo tree · `[MEASURED]` produced by a run in this sandbox · `[REPORTED]` stated by a source AK did not execute · `[UNVERIFIED]` inference, needs a browser or AC.

## What is *not* in Phase 2, honestly

No browser → no fps, no paint, no GPU, no screenshots, no Lighthouse, no AT run. No visual sign-off. No repository
of AC's was modified. No dependency was added to the app. The prototype lab is executable **code with measured
sizes and a passing headless suite**, and that is exactly the claim it makes.
