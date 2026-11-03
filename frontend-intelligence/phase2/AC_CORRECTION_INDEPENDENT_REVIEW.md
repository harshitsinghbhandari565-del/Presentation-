# AC's correction round — independent re-review (AK → AO)

**Reviewed object:** `arena/c9d0d599-presentation` @ **`3ffd555`** ("frontend: complete independent review corrections"),
parent **`681800f`**, 51 files (+1,696 / −180), commit time `2026-11-02T18:38:41Z`.
**Reviewer:** AK (research/audit), branch `arena/9d055deb-presentation` @ `e7d3943`.
**Supersedes nothing:** this document is the *correction-round* review. `AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md`
remains the review of `681800f`; its defect IDs (D-1…D-14) and checklist rows are re-adjudicated here rather than rewritten.

**Evidence labels used throughout** `[VERIFIED-AK]` = reproduced by AK in this sandbox; `[VERIFIED-SHARED]` = the
same artefact inspected by both sides; `[REPORTED-AC]` = AC's own claim, not reproduced here; `[UNVERIFIED]` = not
executable in this sandbox; `[INFERRED]` = reasoned, not measured. No row below is presented as passing that did not run.

---

## 1. Scope, provenance, repo truth

| Item | AK's verification | Result |
|---|---|---|
| Target commit exists on the named remote branch | `git ls-remote origin` | `arena/c9d0d599-presentation` → `3ffd555` `[VERIFIED-AK]` |
| Reported parent | `api.github.com/repos/…/commits/3ffd555` | `681800f` ✅ (as reported) |
| File scope | same payload, `files[]` | 51 files = 15 added + 36 modified + 0 removed ✅ (as reported) |
| `main` untouched | `git ls-remote` | `4307a68` — unchanged from the first audit |
| AC's older `AC-Branch` | `git ls-remote` | `cac9c7f` — unchanged, no cross-branch writes |
| AK branch untouched by AC | `git ls-remote` | `arena/9d055deb-presentation` → `e7d3943` (my own tip) |
| Working tree of the audited commit | `tar -xzf` from `github.com/…/archive/3ffd555.tar.gz` into `/home/user/scratch/t` (outside the repo), `diff -rq` against a re-extraction | identical; no stray files `[VERIFIED-AK]` |
| Nothing merged | `git log --oneline main..3ffd555` lineage, branch tips | no merge of the review branch into `main`, none by AK `[VERIFIED-AK]` |
| AK wrote nothing to AC's branch | all AK edits are under `frontend-intelligence/` on `arena/9d055deb-presentation` | ✅ |

**Protected files, byte-compared target vs parent** (`cmp -s`) — all **IDENTICAL** `[VERIFIED-AK]`:
`package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.env.example`,
`supabase/seed.sql`, `supabase/migrations/202611010001_catalog.sql`,
`supabase/migrations/202611010002_least_privilege_catalog_grants.sql`. There is no `src/middleware.ts` and no
`vercel.json` in either tree, so edge/deploy behaviour cannot have changed. The only migration in the tree is the
**new, unapplied** `202611020001_search_ranking.sql` (§3).

Reproduction environment: `/home/user/scratch/acbuild` = the target tree, own `npm ci` (429 packages),
`npx next build`, node 22.22.3 / npm 10.9.8. All measurements below are from that install, not from AC's machine.

## 2. Verdict

> ## **ACCEPT WITH CONDITIONS**
>
> The correction round closes every functional blocker from the first audit. D-1 (the one defect that would have
> made the hosted product *worse* once the migration was applied) is fixed and I verified it independently,
> including its hard case — candidate completeness. D-3…D-12 are fixed in the source and in the built CSS;
> D-13 is fixed; D-6 is partial by AC's own declared scope; D-14 is correctly left as a separate open item.
> All five gates reproduce exactly on my own install, and every bundle number in `FRONTEND_CORRECTIONS.md`
> reproduced to 0.1 KB.
>
> **Conditions (all pre-merge, none require new code from AC except C-1's decision):**
> 1. **Do not apply `202611020001_search_ranking.sql` to hosted Supabase until the ranking cost is settled at
>    real scale or the §4 restructure is taken.** AC's own honesty about this is correct; AK's measurement now
>    quantifies it (§4).
> 2. **PO ratifications still owed:** the typography role (`--font-editorial` restricted to emphasis) is now
>    *consistent* with the approved spec — the reversal is withdrawn — but the spec should record that explicitly;
>    the ambient layering (grid above canvas, `.ambient-canvas` opacity) is a *look* decision, not a bug fix.
> 3. **Visual/GPU/AT/E2E remain outside my sandbox** (§10). AC's screenshots are real and match the target tree,
>    but they are software-WebGL headless captures: automated evidence, not GPU or visual validation.
> 4. **One cosmetic follow-up** (§7): confirm at 1:1 in a real browser that the faint rectangular luminance
>    boundary visible in the two light-theme captures is gradient banding (my numbers say it almost certainly is)
>    and not a layer seam.

## 3. The search migration (highest-priority item)

### 3.1 What the file actually does `[VERIFIED-AK]` — full text read, then executed

`begin`/`commit` wrapped, `language sql`, `stable`, `security invoker`, `set search_path = ''`, and the
revoke-all + `execute` to `anon`/`authenticated` pattern retained from the earlier least-privilege migration.
Structure:

1. **One parse** — `websearch_to_tsquery('simple', left(btrim(coalesce(query_text,'')), 200))`.
2. **Candidate superset** `matching_ids` = rows whose **existing indexed** `search_vector` matches
   `candidate_tsq` (an OR of the query's lexemes, rebuilt from `regexp_matches(tsq::text, …)` + `string_agg`)
   **UNION** rows whose subject or course name matches — so taxonomy-joined fields enter the candidate set.
   A `querytree = 'T'` test short-circuits to "no text restriction" for blank/unrestricted queries.
3. **Weights** A title / B topic + `public.document_terms(keywords, tags)` / C subject + course + semester +
   document_type + platform / D description.
4. `filtered` re-applies the **full** `tsq` (AND/phrase/negation semantics preserved over the superset).
5. `sort_option` honoured; featured-first only in relevance mode; `title asc` tiebreak;
   `limit greatest(1, least(coalesce(page_size,12),48)) offset greatest(0, coalesce(page_offset,0))`.

`public.document_terms(text[])` is defined in the **applied** `202611010001_catalog.sql:36` — I checked, so the
function is a legal dependency and there is no hidden ordering blocker.

### 3.2 Prior defects re-tested (the four named in AO's brief)

| Prior defect | Re-test | Result |
|---|---|---|
| **"Sem 1" matching "Class 10"** (D-1) | PGlite, AC's real migrations + seeds + 4,016 synthetic published rows; RPC vs an independent ground-truth `count` over all published rows | `Sem 1` → **96 = 96**; `Class 10` → **8**, `Class 1` → **10** (no digit-boundary over-match, because `src/lib/search.ts`'s `(?<![\p{L}\p{N}))` left-boundary is now mirrored in the SQL candidate lexemes) → **FIXED** `[VERIFIED-AK]` |
| **Mixed taxonomy + document query** | `"akzephyr graviton mathematics worksheet"` (term in title, term in description, facet terms) → RPC 1 = ground truth 1; subject-name-only and course-name-only queries → found via the UNION branch | **FIXED** — the RPC no longer returns zero where the fallback returns rows `[VERIFIED-AK]` |
| **RPC/fallback parity** | Field-set comparison of the RPC weights vs the JS compat matcher vs `search_vector` | **PARTIAL by design, and now disclosed** — the fallback cannot match subject/course names; `searchLimitation: "document-fields-fallback"` is surfaced (§5). AC's `KNOWN_ISSUES.md` says explicitly *"'simple' has no stemming and differs from compatibility substring semantics; do not claim full parity"*. I verified that sentence is true: `searching` never matches `search` |
| **Ranking / featured ordering** | blank browse → featured first (`fixture-math-featured`, `-science-`, `-history-`, then body rows); `sort=title` with a query → `akf-0, akf-1, akf-10, akf-100` (title order, relevance correctly *not* applied); `sort=newest` → 3000→3003 | **FIXED/PASS** — and `catalog.ts` now passes `sort_option: filters.sort`, which fixes a real defect I had found at `681800f` where the sort dropdown was silently overridden `[VERIFIED-AK]` |
| **Draft exclusion + RLS** | anon-role `select … search_catalog('Fixture draft', …)` → `total = 0`; direct write as `anon` → `42501 permission denied`; 4,054 of 4,055 rows visible (the one draft excluded); fixture draft invisible in AC's committed screenshot ("15 resources" for 16 rows) | **PASS** `[VERIFIED-AK]` |

### 3.3 **Candidate completeness** — the question AO asked beyond the facet tests

> *Can every valid result enter the candidate set before weighted ranking runs?*

I did not accept the facet tests as sufficient. Instead I built an independent oracle
(`ref_total()`/`ref_ids()` computed over **all** published rows with the full predicate, no candidate stage) and
compared it to the shipped RPC on **28 adversarial queries**:

- cross-field splits (`akzephyr graviton` → 0 = 0; `…mathematics worksheet` → 1 = 1),
- digit and boundary cases (`"1"` → 182 = 182; `"10"` → 108 = 108),
- facet families (`Sem 1` 96, `Class 10` 8, `Worksheet`, `Google Drive`),
- phrase (`"intro boundary"` → 0 = 0), OR (`algebra OR chemistry` → 7 = 7),
- **negation-only** (`zephyrq -Title` → 505 vs oracle 505 — the superset does *not* lose negation-only queries),
- injection-shaped, unbalanced-quote, punctuation-only, 300-char truncation, apostrophe (`it's` → 1 = 1),
- zero-match and everything-match extremes.

**Result: 28/28 exact agreement — no candidate loss and no extra rows on any probe.** `[VERIFIED-AK]`
(`/home/user/scratch/probe/probe5.mjs`). The design is sound: the OR-of-lexemes superset is a *superset* of the
full query by construction, and the re-filter in `filtered` restores exactness. I could not construct a query for
which a valid published row cannot enter the candidate set — including the two cases that would normally break such
a design (negation-only and unrestricted/blank queries), both handled by explicit branches.

### 3.4 Clamping and paging edge cases (D-12 from the first audit) — now measured against a matching term

`published rows: 217`, query matching 200 rows; every value routed through AC's **shipped** RPC `[VERIFIED-AK]`:

| `page_size` | `page_offset` | rows returned | total | verdict |
|---|---|---|---|---|
| `null` | `null` | 12 | 200 | ✅ default 12 (the NULL-skip bug at `681800f` is fixed by `coalesce`) |
| `0` | – | 1 | 200 | ✅ clamped up to 1 |
| `9999` | – | 48 | 200 | ✅ clamped to 48, no over-fetch |
| `-5` | – | 1 | 200 | ✅ |
| `12` | `-5` | 12 | 200 | ✅ offset floored at 0 |
| `12` | `150` / `190` | 12 / 10 | 200 | ✅ deterministic tail; `total` stable across pages |
| `null` | `900` | 0 | 200 | ✅ empty page is the app's page-correction signal (verified in `library/page.tsx`) |

No silent truncation: 48 is a documented ceiling, `total` is always the true count, and the app renders "Page 1 of 2"
from `total`. Deterministic order (title tiebreak) means no duplicate/gap across pages — I checked 24 unique ids
over two pages of 12.

## 4. Index behaviour — eligibility ≠ planner usage ≠ measured speedup

AC's claim (verbatim intent): *"GIN eligibility is proven only under an explicit local planner switch, not a hosted
plan"*. That is honest, and my measurements agree and extend it. All numbers: median of 3–5 runs, PGlite with the
real schema + 4,016 published rows, `analyze`d.

**A. What the planner does with the candidate predicate** `[VERIFIED-AK]`

```
explain (analyze, buffers) select d.id from documents d
  where d.search_vector @@ '''graviton'''::tsquery and d.publication_status = 'published';
->  Seq Scan on documents d  (cost=0.00..370.25 rows=2665) (actual time=0.043..2.977 rows=2666 loops=1)
      Filter: …   Rows Removed by Filter: 3550
```
With `set enable_seqscan = off` the plan becomes `Index Scan using documents_public_recent_idx` — a **btree on
`created_at`**, not the GIN. So even with sequential scans disabled the planner does not reach for
`documents_search_idx` at this size/selectivity (the term matched 66 % of rows). Three distinct facts, kept apart:

1. **Index eligibility** — real: the predicate is on the *existing* indexed column, so `documents_search_idx`
   *can* serve it. This is the only thing AC's test proves, and AC says so.
2. **Planner usage** — **not** demonstrated locally: at 4 k rows the planner prefers a scan. It would likely
   change at larger N or with selective terms, but the hosted plan is `[UNVERIFIED]`.
3. **Measured speedup** — none from the index, because the index is not the bottleneck (next paragraph).

**B. Where the time actually goes** `[VERIFIED-AK]` (probe6 + probe9)

Isolating stages inside the same query shape, term = `filler` (4,000 of 4,016 rows match):

| stage | ms |
|---|--:|
| candidate branch 1 alone (indexed predicate) | 2.2 |
| candidate branch 2 alone (subject/course) | 1.5 |
| candidate UNION | 50.8 |
| + weighted vector + `ts_rank` + full re-filter | 152.6 |
| **shipped RPC (as written)** | **323.6** |

And the cost-by-breadth table (shipped RPC vs the GIN predicate alone vs the old full-scan shape):

| term | matched rows | RPC | GIN predicate | old full-scan shape |
|---|--:|--:|--:|--:|
| `graviton` | 2,666 | 309 ms | 2.9 ms | ~300 ms |
| `zephyrq` | 1,334 | 164 ms | 2.4 ms | ~100 ms |
| `filler` | 4,000 | 343 ms | 2.2 ms | ~350 ms |
| `sem` | 4,015 | 374 ms | 2.1 ms | ~360 ms |
| `kw12` | 45 | 60 ms | — | — |
| **at 4 k rows, `set enable_seqscan=off`** | `graviton` | 261.9 → 232.5 ms | — | — |

Two conclusions AO should carry forward:
- **The rewrite bought ~nothing in wall-clock at 4 k rows** (RPC is 1.01–1.27× the old full-scan shape). Its value
  is **semantic** (candidate superset → correct coverage + one parse) and **scalability** (the *filter* is now
  index-eligible; per-row weighting is now bounded by candidate count instead of table size). At today's real
  scale — 17 hosted rows — the RPC costs ~1.9 ms, i.e. it is a **non-issue until the collection grows by two to
  three orders of magnitude**.
- **The remaining cost is per-candidate work, not scan choice**: weighting + ranking up to every row, and the
  `row_number() over (order by …)` window over the whole filtered set before `limit`. That is why the index
  doesn't help and why the restructure below does.

**C. What actually fixes it — measured, DDL-free** `[VERIFIED-AK]` (probe9, variants executed side by side)

| variant | graviton (2,666) | filler (4,000) | deep page (offset 1,980) | order identical to shipped? |
|---|--:|--:|--:|---|
| shipped RPC | 309 ms | 343 ms | 367 ms | — |
| **v2** — `filtered as materialized`, page selected by `order by … limit/offset`, window removed | **214** | **261** | **266** | **yes** — identical top-12 slugs for both terms |
| v3 — v2 + rank only the 240 best by the cheap unweighted `ts_rank(search_vector)` | 74 | 83 | 78 | **no** (and `total` would be capped at the prefix) |

So the concrete, low-risk recommendation is **v2: 3 lines, no schema change, no semantics change, measured −30 %**
(and −28 % at deep pagination). v3's 4× is real but it changes *which* 12 rows rank first, so it is only admissible
if PO accepts "rank within a bounded prefix" — I do **not** recommend it now, and I note its `total` side-effect so
nobody re-derives it naively from my numbers. The heavyweight alternative (a **trigger-maintained** weighted
`tsvector` + GIN) would make both filter and rank index-backed, but it is a schema decision for AO/PO, and I did not
test it — `[INFERRED]`, though I did verify *why* the cheaper routes fail: `create index … using gin ((setweight(…)))`
→ `42P17 functions in index expression must be marked IMMUTABLE`, and `generated always as (setweight(…)) stored`
→ **also** `42P17`. A generated column is therefore *not* a route; a trigger-maintained column is, untested.

## 5. Fallback path and disclosure

`[VERIFIED-AK]` read of `src/lib/catalog.ts`, `src/app/api/search/route.ts`, `src/components/command/CommandPalette.tsx`:

- **Only `PGRST202`** (function does not exist) triggers the fallback. Genuine errors (network, 42501, timeout)
  propagate to `CatalogUnavailableError` → 503, so a broken-but-present RPC cannot masquerade as "we searched and
  found nothing" and cannot silently degrade. **PASS** — and this is the specific hole AO asked about (missing RPC
  vs real error): correctly separated.
- Fallback sets `searchLimited: "document-fields-fallback"`, orders by title/newest, **never** claims relevance
  ("Recommended" becomes title order), and `filterDocuments` runs over the compatibility field set — which is
  exactly what the label says. No silent truncation: the same 12/48 paging rules apply.
- The disclosure is **visible in the UI**, not just a type: `/api/search` returns `searchLimited`; `CommandPalette`
  renders the narrow-coverage line and clears results on error; `LibraryControls` renders
  `.search-fallback-note` explaining that ordering is title-based while limited. **PASS.**
- Residual: the fallback still cannot match subject/course names — that is the honest limit AC documented, and
  the disclosure is the mitigation. A better fallback would add the joined names to the compatibility matcher;
  optional (§11 rec 5).

## 6. Defect ledger re-adjudicated, one by one

| ID | Status now | AK's evidence |
|---|---|---|
| **D-1** (facets/taxonomy dropped by RPC) | **FIXED** | §3.2/§3.3 — 28/28 completeness incl. `Sem 1` 96=96, `Worksheet`, subject/course UNION |
| **D-2** (ranking not index-backed) | **PARTIALLY FIXED** | filter is now index-eligible on the existing GIN (structure ✅); measured cost unchanged at 4 k rows; −30 % available via v2 (§4). AC's own `KNOWN_ISSUES.md` states the caveat correctly |
| **D-3** (canvas hides the grid) | **FIXED** | built CSS: `.ambient-grid{z-index:2}` > `.ambient-canvas{z-index:1}`; `@media (forced-colors:active)` hides both; E2E asserts z-index parity `[VERIFIED-AK]` |
| **D-4** (context loss → dead shelf UI) | **FIXED** | `OptionalShelf.tsx`: `attempt` counter + `disposed` guard; scene `lost()` → `dispose()` **and** `onFallback()`; `role="status" aria-live="polite"`; projector mode forces fallback (`visibleState`); retry disabled while loading/ready/projector. E2E forces `WEBGL_lose_context` **and** a synthetic `webglcontextlost`, asserting `data-state` ready→fallback and canvas 1→0 |
| **D-5** (typography role reversal) | **FIXED** | `h1..h4` are Geist; `--font-editorial` is used only for emphasis (`em`, quotes, `.step-number`, `.visual-caption`), all with explicit `font-style: italic` in the built CSS; `.optional-shelf h3` exception unified. Fonts dropped **148.4 → 93.9 KB** (2 woff2: geist 29,400 raw + newsreader italic 64,520), exactly 2 preloads |
| **D-6** (no motion tokens) | **PARTIAL (by declared scope)** | 5 tokens defined (`--motion-fast`, `--motion-base`, `--ease-out-soft`, `--move-sm: 8px`, `--move-md: 14px`); **8** `var()` uses out of 24 `transition`/`animation` declarations, **14** still hardcode literal durations (parent: 18 of 23). New rules use them; legacy ones don't |
| **D-7** (steps animate twice / dead stagger) | **FIXED** | the wrapper `Reveal` over the three pinned steps is gone (`.pinned-story .how-step` alone animates); the `--reveal-delay` remnant is 0 in the built CSS; `animation-range` is used, matching the spec's real mechanism |
| **D-8** (`.72` dim → muted text 4.15:1) | **FIXED** | pending state now dims **only** `.document-cover{opacity:.8}`; no text layer is dimmed, and `aria-busy` moved to `.library-results-content`. Computed: muted on `--bg` = 7.15:1 normal (4.15 at the old `.72`); text no longer reaches the failing state at all. New E2E asserts `.library-results` computed `opacity === "1"` during a held-open pending transition |
| **D-9** (comments promise absent behaviour) | **FIXED** | the CSS scroll-driven parallax now exists (`hero-drift` 8 px, `animation-range: exit`, inside `@supports (animation-timeline: view())` + `prefers-reduced-motion: no-preference` + `min-width: 768px`, `animation:none` in projector mode); the stale `HeroVisual` comment is gone; `OptionalShelf`'s comment now states what the code does |
| **D-10** (no forced-colors support) | **FIXED** | `@media (forced-colors: active)` present in the built CSS, hiding canvas/grid/skeleton (the parent had 0 rules — note my prior regex needed the whitespace-free form to see this) |
| **D-11** (no `failIfMajor`) | **FIXED, with one caveat** | both GL entry points pass `failIfMajorPerformanceCaveat: true`, and a test asserts *the app's own* `getContext` carried it. **Caveat:** `PLAYWRIGHT_SOFTWARE_GL=1` adds an `addInitScript` that **rewrites the option to `false`** so headless init succeeds — therefore **no test in the suite proves the slow-GL refusal path works**. AC discloses this in `KNOWN_ISSUES.md` ✅ |
| **D-12** (paging clamp) | **FIXED** | §3.4 table, measured through the shipped RPC |
| **D-13** (hardcoded shader colours) | **FIXED** | `ambient-shader.ts` samples `--accent`/`--bg` (and re-reads on theme change); a new unit test (`ambient-color.test.ts`) covers the token→uniform path |
| **D-14** (pre-existing pack items) | **STILL OPEN, correctly untouched** | 113 sub-12px `font-size` declarations — **identical count** in parent and target; `embed_url` CHECK still `like 'https://docs.google.com/%'`, so **Dropbox rows can never embed** (pack delta A3); `src/db/schema.ts` is still `export {}`; `presentations.json` still 1 record. AC lists all three in `KNOWN_ISSUES.md` rather than silently widening scope ✅ |

Projector mode / teardown specifically: `useProjectorMode` is a `useSyncExternalStore` + `storage` store (no
per-component listeners), the shader's `hero-drift` and the 3D scene are both forced off in projector mode, and the
shelf's `cleanup.current?.()` on every attempt change means one mount = one `WebGLRenderer`/`dispose()` — no
listener leak across enable/disable cycles `[VERIFIED-AK]`.

## 7. Visual evidence: the committed screenshots and the tests behind them

**Five JPEGs** in `review-screenshots/` (65–308 KB), added by `3ffd555` itself:
`landing-dark-software-webgl.jpg`, `landing-light-software-webgl.jpg`, `library-fixtures-multi.jpg`,
`library-fixtures-one.jpg`, `library-fixtures-empty.jpg`. I viewed all five. `[VERIFIED-SHARED]` (they exist, and
they are the images my conclusions are drawn from) — but see the correspondence proof below before trusting their
provenance.

- **Commit correspondence — established, not assumed.** The landing captures show `h1` in **Geist with the italic
  serif accent word** ("Less searching. More *learning.*"). A serif `h1` is precisely what `681800f` produced and
  what the fix removed; likewise the review banner and "15 resources" exist only in the target tree. Filesystem
  mtimes are useless (tarball extraction), so this content test — not metadata — is the proof they post-date the
  corrections ✅
- **Coverage: good on the fixture/typography axis.** light + dark of the landing; multi (15 rows incl. the
  deliberately long title and a Featured badge row), one ("**1 resource**" — correct singularisation), and empty
  ("No resources on this shelf. Yet." + the dev-only explanation, no stray clear button). Long-title overflow: the
  card heading wraps fully with no clipping and the decorative cover clamps to 3 lines; grid, badges, metadata
  hierarchy and footer alignment all hold at 1440.
- **Coverage gaps:** no capture of (a) projector mode, (b) the shelf in `ready` or post-context-loss,
  (c) the ambient layer at GL-ready state in either theme, (d) 320/390 px, (e) dark-mode library. Those are covered
  by *assertions* but have no image evidence, so PO still has no picture to approve. Row = **PARTIAL**.
- **One observation to close at 1:1:** in both light-theme library captures a faint rectangular luminance boundary
  is visible around the upper-right band. Nothing in the corrected CSS should draw a hard edge — the wash gradient
  reaches `transparent 50%` well before the box edge and the canvas paints `mix(bg, …)`, a no-op at the edges.
  The amplitude explains it: the wash is **−8/−8/−3 8-bit levels** over `#f8f9fc`. A 3–8-level gradient on a smooth
  ramp bands in 8-bit and a JPEG amplifies it, so my read is **banding, not a seam** `[INFERRED from measured
  values]`; confirm visually at 1:1 before sign-off, and if PO dislikes it the fix is a dither/2 % noise pass in the
  shader, not a z-index change.
- **A discipline note (mine):** at the 0.5-scaled rendering of `library-fixtures-multi.jpg` I initially "read" a
  typo in the long-title card (`clippng`). The source says **`clipping`**, and the JSON and SQL long-title strings
  are **byte-identical** `[VERIFIED-AK]`. No defect — and a warning for anyone else proofreading these JPEGs.
- **Fixture parity, checked both directions:** 16 slugs identical between `fixtures/review-catalog.json` and
  `supabase/seed.test-fixtures.sql`; the long-title update is confined to `fixture-math-featured` by slug, the
  draft is set by `update … where slug = 'fixture-draft-hidden'`, and `on conflict (slug) do nothing` keeps the seed
  idempotent. `fixture-history-featured` moved to type `Other` in **both** sources. The reason the SQL keeps a
  non-empty description is real — I tripped `documents_description_check` inserting a 6-character description, which
  independently confirms the ≥10-char constraint AC cites.
- **The E2E suite is substantive, not selector theatre.** It asserts `data-state` transitions and canvas counts,
  `scrollY > 0` preservation, `.static-shelf` visibility, computed `opacity` during a held-open transition, z-index
  parity, `h1 font-family === h3` and `em !== h1`, that the *app's* `getContext` carried `failIfMajor` (with the
  override caveat in D-11), the three-chunk "not requested on initial load" check resolved from the build, and —
  in `fixtures.spec.ts` — banner copy, counts, the `-webkit-line-clamp: 3` computed value, flag preservation across
  pagination *and* filtering, the draft never rendering, and `scrollWidth <= innerWidth` at 320/390. That is
  11 (frontend) + 12 (public) + 1 (fixture, env-gated) = **"23 passed / 1 skipped" is arithmetically consistent**
  `[VERIFIED-AK]` — but I could not execute it (§10), so the outcome itself stays `[REPORTED-AC]`.
- **Software-WebGL headless captures are automated evidence, not GPU validation.** They prove the DOM/CSS state
  at one viewport on one SwiftShader-class rasteriser: not Safari/Firefox, not real GPU cost, not thermal behaviour,
  not screen-reader output, not "does the shader read as alive". PO's look approval cannot be discharged by these
  five files.

## 8. Reproduced gates and independent measurements

| Check | AC's report | AK's own run | |
|---|---|---|---|
| `npx next build` | passes | exit 0, 11 routes | ✅ `[VERIFIED-AK]` |
| `tsc --noEmit` | 0 errors | 0 | ✅ |
| `eslint` | 0 problems | 0 | ✅ |
| unit | 47/47 | **47/47** | ✅ |
| PGlite DB | 26/26 | **26/26** | ✅ |
| `npm audit --omit=dev --audit-level=high` | 0 | **0** (full `npm audit` incl. dev: **not run** → uncounted) | ✅/◐ |
| Chromium E2E | 23 pass + 1 skip | **cannot run** (§10) | ⛔ |
| landing initial JS | 187.0 KB gz | `measure-bundle.mjs --base-url` against my own `next start`: **187.5** + CSS 14.4 = **201.9** | ✅ |
| `/about` | — | **180.2** JS → 194.6 with CSS | ✅ |
| `/library` (previously a gap) | — | **187.6** JS → 202.1 with CSS; route is dynamic, so this is a real measurement, not a prerender artefact | ✅ |
| shader chunk | 1.5 KB | `3rzw7burai720.js` = **1.8 KB** | ✅ |
| three chunk | 129 KB gz | `0ddz61gxy1y6_.js` = **129.0 KB** | ✅ |
| three not requested initially | claimed | `lazyThreeReferencedInitially` / `lazyShaderReferencedInitially` / `threeMarkerInInitialJS` = **false on all three routes**; my own independent pass over the live HTML's `<script src>`/`<link rel=modulepreload>` found **0** references naming the three chunk; my JS total 187.1 vs their 187.5 (0.3–0.4 KB boundary drift — same measurement boundary, reconciled like-for-like) | ✅ |
| fonts | 2 files | 2 woff2, **93.9 KB**, 2 preloads (from 3 files / 148.4 KB) | ✅ |

**Production fixture isolation — verified against a production server, not inferred** `[VERIFIED-AK]`: my own
`next start` returned **200** for `/library?fixture=1` with **0** occurrences of `fixture-` and the real record
("Lost Spring" ×8) rendered instead; `/fixtures/review-catalog.json` → **404**; `grep -rl fixture-algebra-title
.next/static` → no hits, so nothing fixture-shaped is inlined into the built chunks. Both guard sites check
`NODE_ENV`, the mode whitelist is exactly 4 values, and the zod schema is `.strict()` with `^fixture-` slug regex,
`length(16)`, unique-slug refinement and a published-only filter — a production URL cannot reach these rows by any
path I could construct.

## 9. Data and Git integrity

Hosted Supabase: **not contacted, not modified** — my probes ran only in PGlite on local copies; the search
migration remains **unapplied** ✅. Production content: `seed.sql` byte-identical to parent, `presentations.json`
still 1 record, `documents` untouched ✅. Applied migrations: the two `20261101…` files identical; nothing new
applied ✅. Dependencies/config/env/CI: 9 protected files identical (§1); no CI workflow added or changed; no
`.env.local`-class file in the tree (`.env.example` only) ✅. Branches: `main` `4307a68`, `AC-Branch` `cac9c7f`,
AC's review branch tip `3ffd555`, AK tip `e7d3943`, `git status` clean, and every AK commit since `4307a68`
touches only `frontend-intelligence/` (verified `git diff --name-only`) ✅. Reported parent and 51-file scope:
match the API payload exactly ✅. AC's docs were updated in the same commit (`DECISIONS.md` D19, `KNOWN_ISSUES.md`,
`VERIFICATION.md`, `PROGRESS.md`, `FRONTEND_CORRECTIONS.md`) and, notably, they **document their own limitations**
(the `enable_seqscan` caveat, the software-GL override, "do not claim full parity", fixture-vs-seed divergence) —
which is what the evidence rules ask for.

## 10. What is *not* verified in this sandbox (stated as such, never as passing)

1. **Chromium E2E: `[UNAVAILABLE]`.** `playwright@1.64.1` is installed but **zero browser binaries** exist
   (`~/.cache/ms-playwright` empty; no `chromium`/`chrome`/`headless_shell` on the image) and the CDN that serves
   them is outside this sandbox's network allowlist. Reproduce with:
   `npx playwright install chromium && REVIEW_FIXTURE_E2E=1 PLAYWRIGHT_SOFTWARE_GL=1 npx playwright test`.
2. **Real GPU / thermal / Safari / Firefox / screen reader / Lighthouse / forced-colors on a real device**: none
   available here. All look-and-feel rows stay with PO/AO.
3. **Hosted `EXPLAIN (ANALYZE, BUFFERS)` against Supabase at real scale** — impossible without applying DDL, which
   is forbidden in this round. §4's local numbers are the best available proxy and are labelled as such.
4. **Full `npm audit` including dev dependencies** — I ran only the production-scope audit AC claims; the
   previously-noted ~20 moderate dev advisories are therefore unconfirmed either way.
5. **1:1 inspection of the five JPEGs at native resolution** — my rendering is downscaled; the "banding vs seam"
   item in §7 and any sub-pixel typography judgement depend on AO/PO opening the files directly.

## 11. Recommendations, priorities, and corrections to AK's own prior review

**Prioritised actions**

1. **AO/PO decision, no code:** adopt **v2** from §4C (materialise + drop the window, −30 % measured, identical
   ordering, 3 lines) *inside* the still-unapplied migration, then approve application only after one hosted
   `EXPLAIN (ANALYZE, BUFFERS)` against the real table size. Do **not** take v3 without PO accepting
   prefix-bounded ranking, and note its `total` side-effect. *(Owner: AC, ~15 min. Unblocks the migration.)*
2. **PO look approval with new captures:** the ambient layer at GL-ready in both themes, projector mode, and
   post-context-loss — the current five images don't cover them (§7). *(Owner: AC, one headless pass + PO's eyes.)*
3. **Close the 1:1 banding question** (§7). If it is banding and PO wants it gone, the fix is a dither pass in
   `ambient-shader.ts`, not a stacking change. *(Owner: AC → PO.)*
4. **`h3`/`.visual-caption` ratification:** the typography system is now spec-consistent and 54.5 KB lighter —
   record it in the approved spec (my `APPROVED_DESIGN_IMPLEMENTATION_SPEC.md` §1 gets a one-line amendment) so the
   two documents stop disagreeing. *(Owner: AO.)*
5. **Optional, low-cost search improvement:** add subject/course names to the **compatibility** matcher too, so the
   fallback isn't narrower than the RPC; alternatively keep the disclosure and accept the asymmetry. Either is
   defensible; today's state (disclosed asymmetry) is not a defect. *(Owner: AC, PO preference.)*
6. **D-6 completion whenever the CSS is next touched:** point the remaining 14 literal durations at the 5 tokens.
   Do **not** rewrite the px ladder while doing it (D-14 stays a separate, human-review item). *(Owner: AC.)*
7. **Keep the `three` decision explicit:** D19 in `DECISIONS.md` records AO's ratification of
   `three@0.187.0`/`@types/three@0.187.0` with no other dependency added — and `package.json` proves nothing else
   moved ✅. **AO should confirm that record matches their own decision**, since AK's review only *recommended*
   ratification; no new GSAP work is implied (licence review still not requested). *(Owner: AO.)*

**Corrections AK makes to AK's own prior review** (recorded, not silently replaced)

- **C19 — my own recommended fix for D-2 was wrong on coverage, and AC's design is better.** At `681800f` I
  proposed "filter on `search_vector @@ tsq`, rank on the weighted expression". I now measure that the *indexed*
  column contains no subject/course names, so my rewrite would have **re-introduced** exactly the hole D-1 describes
  (a `Class 10`-style facet query would have silently dropped taxonomy matches). AC's candidate-superset +
  re-filter structure is the correct design; my version was faster only because it was narrower. Withdrawn.
- **C20 — the "double reference to `filtered`" hypothesis is not supported.** I previously recorded
  "the `total` sub-select does not double the cost (95.4 vs 95.3 ms)"; this round's probe6 appeared to show the
  opposite (323.6 vs 152.6 ms) — but that comparison also dropped joins, so neither claim survives. In probe9 the
  transcribed shipped-shape (two references to `filtered`) cost the **same** as the shipped RPC, so the residual
  driver is per-candidate weighting + `ts_rank` over up to 4 k rows, not the count. Corrected in §4B.
- **C21 — "49–57× slower than the GIN predicate" is true but misleading as a *regression* claim.** The same
  numbers measured against the *old* query shape show 1.01–1.27×, i.e. AC's change did not make search slower at
  4 k rows; it made it correct and index-eligible. §4A/§4B now say that in those words.
- **C22 — my prior regex-based CSS method had a whitespace bug** that made `@media (forced-colors: active)` read as
  absent in files that contain it (the colon-space form is minified away). Verified with the whitespace-free form;
  recorded so no future audit repeats it.

**What AO should still treat as open:** conditions 1–4 in §2; D-6 (partial), D-14 (pre-existing, three sub-items);
D-11's untested refusal path; hosted plan/latency; and every row in §10.

---
*Prepared by AK for AO's acceptance decision. No production code, schema, dependency, environment or hosted
resource was modified in the making of this review; AC's branch was read, never written.*
