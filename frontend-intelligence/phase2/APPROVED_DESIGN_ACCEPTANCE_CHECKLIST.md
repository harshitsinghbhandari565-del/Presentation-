# Acceptance checklist — approved frontend design (PO-approved direction, 2026-11-02)

Companion to `APPROVED_DESIGN_IMPLEMENTATION_SPEC.md`. Same rule as the rest of the pack: a line is
**measured** only if a command was run or a committed artifact was read. AO and AC must be able to
tell these apart at a glance, so every row carries its label.

| Label | Meaning in this file |
|---|---|
| `[MEASURED]` | AK ran it in this sandbox (build, bundle math, `grep` of a committed file). Reproducible with the commands in §D |
| `[PROPOSED-TARGET]` | A number this spec asks AC to hit. A **target**, never a claim about the app |
| `[UNVERIFIED]` | Cannot be settled here — no browser binary, no GPU, no AT, no real network, no Lighthouse |

**Current scorecard (2026-11-02, against AC's `arena/c9d0d599-presentation@71d6fb9`) — 36 rows:**

| bucket | n | rows | what it means |
|---|--:|---|---|
| already passes on the app | **9** | A2, A3, B4, C8, D3, D4, E1, E2, E4 | AO can skip these in review; A3 passes *by behaviour* only (see its row) |
| measured-fail today | **3** | A1 (token self-reference), E4b (no skeletons / no root `loading.tsx`), F3 (search ordering + unweighted index) | the spec's starting state, not new defects |
| open `[PROPOSED-TARGET]` | **16** | A2b, A4, B1, B1b, B2, B3, B6, C1, C6, C7, C9, D1, D2, E3, F1, F2 | to be decided by AO/PO or closed by AC's PRs |
| proven in AK's lab only | **4** | C2, C3, C4, C5 | ex11 asserts pass in both harness modes; that is *not* app evidence |
| blocked `[UNVERIFIED]` here | **4** | A5, B5, D5, E5 | no browser binary, no GPU, no AT, no Lighthouse, no real network — must run on a device |


---

## A. Design language

| # | Acceptance criterion | Label | How it is proven | State today |
|---|---|---|---|---|
| A1 | `--font-sans` and `--font-editorial` resolve through *their own* declaration, not through a self-reference that next/font happens to win | `[MEASURED]` fail → `[PROPOSED-TARGET]` fix | build + read the compiled `@theme` output: the `var()` must name a *different* custom property | `globals.css` `@theme` self-references both (`AC_APP_MEASURED.md` §2, delta A1) |
| A2 | Editorial face stays an emphasis-only device: 6 selector groups today (`em`, `.sheet-middle > span`, `.visual-caption`, `.step-number`, `.filter-note p`, `.detail-aside-note p`) `[MEASURED]`; all 13 `<em>` occurrences sit inside `h1`/`h2`/`h3` | `[MEASURED]` | `grep -o '[^}]*--font-editorial[^}]*}' src/app/globals.css` + `grep -rc '<em' src/app` | **passes**, with one documented exception: `.visual-caption` renders the serif at 15px, under the 18px floor |
| A2b | That exception is *decided*, not inherited: PO keeps it or bumps it to 17–18px; no new editorial use below 18px is added | `[PROPOSED-TARGET]` | review note on the PR | open (AO/PO call) |
| A3 | Italic-only is written down as the design (comment beside `@theme`) instead of looking like a missing file; every editorial rule declares `font-style: italic` | `[MEASURED]` | `layout.tsx:10` passes `style:"italic"` and 5 of 6 rules declare `font-style: italic`; bare `em` relies on the UA default | passes by behaviour, fails as documentation — one comment + one declaration |
| A4 | New rules consume `--step-*`; the existing px ladder (≈120 declarations across 3 `@media` blocks) is **not** rewritten in the same PR | `[PROPOSED-TARGET]` | `git diff --stat` on `globals.css` + `grep -E "font-size:[^;]*[0-9.]+vw" src/app/globals.css` → raw `vw` only inside `clamp()` | 0 tokens today; hero `clamp(48px,5.2vw,73px)` desktop / `clamp(47px,11.8vw,65px)` at ≤480 `[MEASURED]` |
| A5 | Light theme legibility: ambient wash re-tuned for `#f8f9fc`, not the dark alpha ×2 | `[UNVERIFIED]` | screenshot pair per theme, PO sign-off | not runnable here |

## B. Motion

| # | Acceptance criterion | Label | How it is proven | State today |
|---|---|---|---|---|
| B1 | Pinned storytelling on the existing `.how-section`: sticky `.how-intro`, `view()` timeline on `.how-step`, wrapped in `@supports (animation-timeline: view())`, **no** new runtime dependency | `[PROPOSED-TARGET]` | diff review + `git diff main...HEAD -- package.json` must be empty | motion layer is entirely ahead of AK's spec: 0 `animation-timeline`, 0 motion tokens `[MEASURED]` |
| B1b | Only one motion system touches the steps: the per-step `<Reveal delay={index*0.05}>` is removed or neutralised inside the pinned section | `[MEASURED]` prerequisite + `[PROPOSED-TARGET]` | read the PR diff for `.how-steps` markup | today every step is wrapped in `Reveal` `[MEASURED]` |
| B2 | Reduced motion → section degrades to a stacked list, identical DOM order, no transform | `[MEASURED]` + `[PROPOSED-TARGET]` | `?motion=reduce` in the lab; app already has `@media (prefers-reduced-motion: reduce)` at `globals.css:359` | CSS block exists; must be extended to new keyframes |
| B3 | Framer-motion stays the single motion library, and the `/mini` + `LazyMotion` swap is *evaluated* (not silently skipped) | `[PROPOSED-TARGET]` −15.2 KB gz | lab table §2b; re-measure on AC's build with the same script as §D | AC ships root `framer-motion@12.43.0` (44.9 KB gz) `[MEASURED]` |
| B4 | **No new GSAP line in `package.json` until the licence review is closed** | `[MEASURED]` constraint | `git diff` on `package.json`; GSAP+ScrollTrigger = +44.4 KB gz `[MEASURED]` | passes today: no gsap dependency `[MEASURED]` |
| B5 | Every scroll/hover animation is `transform`/`opacity` (+`color`/`border-color`) only | `[MEASURED]` + `[UNVERIFIED]` | `grep -nE "transition: [^;]*(width|height|top|left|margin|filter)" src/app/globals.css`; paint cost needs a real trace | today: card hover animates `transform`/`border-color`/`box-shadow` at `.2s` `[MEASURED]` |
| B6 | Lenis only if §2's removal condition is met: `html{scroll-behavior:smooth}` deleted in the same PR | `[PROPOSED-TARGET]` | diff review | `globals.css:2` sets it `[MEASURED]` |

## C. Ambient background + 3D

| # | Acceptance criterion | Label | How it is proven | State today |
|---|---|---|---|---|
| C1 | One `<canvas>` max, `aria-hidden`, `pointer-events:none`, `z-index:-1`, inside the existing 920 px band | `[PROPOSED-TARGET]` | `grep -c "<canvas" ` prerendered HTML + diff | landing page has **0** canvas elements `[MEASURED]` |
| C2 | Shader ships without a 3D library: ≤ 8 KB gz added JS for the ambient layer | `[MEASURED]` in lab | `ex05` 3,162 B gz; `ex11` whole page 6,240 B gz + 7,003 B CSS (`prototype-lab/measurements.json`); three.js route 187.5 KB (namespace) / 130.4 KB (shaken) | n/a in the app |
| C3 | Context loss / shader-compile failure / absent WebGL → CSS fallback, no black rectangle, no layout shift | `[MEASURED]`-in-lab | `?fallback=1` headless pass + `webglcontextlost` handler | ex11 passes both harness modes `[MEASURED]` |
| C4 | Loop stops when off-screen, hidden, or reduced-motion; reduced motion = still frame or CSS branch | `[MEASURED]`-in-lab | `io` + `document.hidden` guard; harness asserts `api.ambient === "css"` under reduce | ex11 `[MEASURED]`; real GPU cost `[UNVERIFIED]` |
| C5 | Shader colours read `--accent` / `--bg` from the cascade and re-read on `data-theme` change (app has 0 `dark:` utilities `[MEASURED]`) | `[MEASURED]`-in-lab | `cssColor()` in ex11 + theme toggle | n/a yet |
| C6 | 3D is **optional and never blocks initial content**: 0 KB on first load, dynamic import, `ssr: false`, mounted after idle + in-view | `[PROPOSED-TARGET]` | route manifest + `.next/static/chunks` diff: no new chunk referenced by `/` | n/a yet |
| C7 | Gate reasons observable (status line or `data-*`), and a visible "Load the 3D scene" control exists if AO wants it demoable | `[PROPOSED-TARGET]` | page readout; ex11 has both | ex11 `[MEASURED]` in lab |
| C8 | No 3D text atlas; metadata stays DOM text | `[MEASURED]` | `grep -rn "troika\|Text" src/app src/components` → 0 hits | passes |
| C9 | One motion producer at a time: while a 3D scene draws, the ambient loop is paused | `[PROPOSED-TARGET]` | diff + fps overlay | n/a yet |

## D. Performance

| # | Acceptance criterion | Label | How it is proven | State today |
|---|---|---|---|---|
| D1 | Landing First Load JS ≤ 300 KB gz | `[MEASURED]` baseline, `[PROPOSED-TARGET]` after | `npx next build` then sum gzip of the assets `/` references (`AC_APP_MEASURED.md` §1) | **240.9 KB** → 59 KB headroom `[MEASURED]` |
| D2 | Approved additions stay inside the headroom: ambient ≤8 KB, mini-swap ≤0 KB, 3D chunk 0 KB on first load; total after ≤ 300 KB | `[PROPOSED-TARGET]` | same measurement, before/after numbers in the PR description | n/a |
| D3 | No new dependency line without an AO-approved entry here first | `[MEASURED]` | `git diff main...HEAD -- package.json package-lock.json` must be empty for design PRs | passes at `71d6fb9` |
| D4 | Landing: 0 `<img>`, 0 external requests, ≤2 font files, `display:swap` with metric-adjusted fallbacks, and the approved layers add no blocking request | `[MEASURED]` | prerendered HTML `grep -o "<img"` → 0; built CSS `size-adjust: 89.08%` + ascent/descent overrides | passes `[MEASURED]`; CLS impact `[UNVERIFIED]` |
| D5 | LCP ≤ 2.5 s p75 on 4G, INP ≤ 200 ms p75, CLS ≤ 0.1, long frames ≤ 1 per scroll chapter | `[UNVERIFIED]` | Lighthouse CI + Playwright trace + RUM | not runnable in this sandbox — must be run by AC/AO |

## E. Accessibility

| # | Acceptance criterion | Label | How it is proven | State today |
|---|---|---|---|---|
| E1 | `<MotionConfig reducedMotion="user">` retained; new CSS motion has its own reduced guard | `[MEASURED]` | `grep -n "reducedMotion" src/app/layout.tsx`; `@media` block extended in the same PR | passes `[MEASURED]` |
| E2 | Skip link + focus-visible ring + ≥44 px targets on every new control | `[MEASURED]` partial | skip link exists on `/`; `.button{min-height:44px}` exists `[MEASURED]`; new controls must inherit | passes today |
| E3 | Pinning must not change DOM order or `Tab` order. Steps are `<article>`s in `<div class="how-steps">` today `[MEASURED]` — promoting them to `<ol>/<li>` is welcome, reordering them is not; the numeric rail stays decorative | `[PROPOSED-TARGET]` | markup diff of the PR | n/a |
| E4 | Results region announces its count with `role="status" aria-live="polite"` + `aria-busy` on the region | `[MEASURED]` **pass** | read `src/components/library/LibraryControls.tsx`, not only the prerendered `/` HTML | **already implemented.** This row corrects AK's earlier claim from the same day (`AC_APP_MEASURED.md` §4 row 5); the ⌘K palette is a full combobox (`aria-activedescendant`, `role="listbox"`, `role="alert"`) `[MEASURED]` |
| E4b | Loading *shape*: skeleton blocks matching the grid, plus a root `loading.tsx` — a pending search today is a spinner + `opacity:.65` | `[MEASURED]` fail → `[PROPOSED-TARGET]` | `ls src/app/loading.tsx` → absent; `grep -ri "skeleton" src/` → 0 hits | fails; the a11y item the design work must not skip |
| E5 | `forced-colors: active`, 200 % zoom, 320 px width, and keyboard-only walk of the pinned section | `[UNVERIFIED]` | manual AT/zoom pass (procedure in spec §5 of the lab doc) | ex11 has the CSS block `[MEASURED]` in source only |

## F. Reproducibility on real data

| # | Acceptance criterion | Label | How it is proven | State today |
|---|---|---|---|---|
| F1 | Design reviewed against ≥ 12 records (≥ 3 per category, ≥ 1 with no description, ≥ 1 with a broken/long title, ≥ 1 Dropbox-type URL) | `[PROPOSED-TARGET]` | `select count(*) …` + seeded fixture in compatibility mode | **3** `documents` rows / **1** `document_compatibility` row `[MEASURED]` → 3/1 |
| F2 | Empty, one-item and overflow states each reviewed once; no state exists only in a mockup | `[PROPOSED-TARGET]` | screenshots in the design PR | blocked by F1 `[MEASURED]` |
| F3 | Search ordering (`is_featured` before `textSearch`) and the `to_tsvector('simple')` unweighted index resolved **before** visual polish, or recorded as an accepted follow-up | `[MEASURED]` | read `src/lib/catalog.ts` + the migration | deltas A2/A3 still live `[MEASURED]` |

---

## G. Commands that settle the `[MEASURED]` rows (run these, don't argue)

```bash
# 1. typography tokens + editorial usage
grep -n "font-editorial\|font-sans\|@theme" src/app/globals.css | head
grep -nE "font-size:[^;]*[0-9.]+vw" src/app/globals.css

# 2. budget + payload: the only trustworthy measurement is a real build
npx next build
python3 - <<'PY'   # sum gzip of the assets the prerendered page references
import gzip, pathlib, re
h = pathlib.Path(".next/server/app/index.html").read_text()
print(sum(len(gzip.compress(pathlib.Path(".next", *m.split('/')).read_bytes(), 9))
          for m in re.findall(r'src="(/_next/static/[^"]+)"', h) if not m.endswith(".css")) / 1024, "KB gz")
PY

# 3. first-load purity for the gated scene: '/' must not reference the new chunk
grep -c "Scene\|canvas" .next/server/app/index.html

# 4. accessibility surfaces
grep -c "aria-live\|role=\"status\"" .next/server/app/index.html
grep -n "reducedMotion" src/app/layout.tsx

# 5. the lab's own proof (fallback paths, both motion modes)
cd frontend-intelligence/prototype-lab && npm install && node build.mjs && node test.mjs   # 22/22
```

## What AK can and cannot sign off

- **AK signs off:** the diff-level items (A1–A4, B1–B6, C1–C3, C5–C9, D1–D4, E1–E4, F1–F3) — all of
  them are settled by reading the diff and re-running §G against AC's tree.
- **AK cannot sign off (no browser here):** A5, D5, E5, and every statement about how the pin *feels*,
  how the shader *looks*, GPU time, and AT output. Those need AO/PO on a device — the procedure is
  `INTERACTION_EXPERIMENT_LAB.md` §5, and ex11 exists precisely so that pass has
  a page to look at: `http://127.0.0.1:8123/ex11-approved-spec/index.html` with `?motion=reduce` and
  `?fallback=1`.
- **Review protocol for AC's implementation diff (AO supplies the commit):** AK reads the diff against
  rows A→F, re-runs §D on AC's tree in `/home/user/scratch/` (never in the shared repo), and reports
  per row: `pass` / `fail` / `blocked-unverified`. AK does not edit AC's branch and does not merge.

## Sign-off table

| Layer | Approves | Evidence required at sign-off |
|---|---|---|
| Typography roles + tokens | PO (visual) + AO (cascade fix) | built CSS read + one screenshot pair per theme |
| Pinned storytelling | AO (a11y, budget) | §D commands + reduced-motion + mobile stacked state on a device |
| Ambient shader | AO (perf) + PO (look) | ≤ 8 KB gz delta, kill switches demonstrated, light-mode pair |
| Optional 3D scene | PO (is it wanted?) + AO (gate) | first-load chunk list unchanged, gate reasons shown |
| Motion library end-state | **blocked on the GSAP licence review** | AO's ruling; until then B3 is evaluate-only |
