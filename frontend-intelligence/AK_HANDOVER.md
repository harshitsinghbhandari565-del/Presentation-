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
