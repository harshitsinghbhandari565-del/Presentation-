# Current update — catalog ordering (2026-11-03)

AO accepted deterministic V1; migration unchanged/unapplied. Document browse, disclosed fallback, palette, rails, related candidates and compatibility/fixture comparators now add ID only after existing keys. Related score ties keep server candidate precedence. Local tests and hosted-plan preparation: `CATALOG_ORDERING_REVIEW.md`. Hosted `get_catalog_facets` name-tie ordering remains separately gated; no v2, hosted action, deployment or merge. Slow-GL refusal and physical GPU/device/AT remain unverified.

---

# Follow-up: deterministic V1 search ordering (2026-11-03)

Added UUID ASC as final tie-break in the **unapplied** V1 window ordering, preserving relevance and aggregation by row number. Local duplicate-score/title/deep-page tests and independent full-set oracle passed; 4,000 rows concatenated without gaps or duplicates. V2 remains rejected; no application/fallback code changed. Offset stability assumes unchanged visible data between calls; non-RPC fallback/browse still lacks a unique key. Native slow-GL refusal is unverified. Full evidence and local performance baseline: `SEARCH_V2_VALIDATION.md`.

---

# Follow-up: search v2 validation (2026-11-03)

**REJECTED / not implemented.** AK's exact probe scripts and SQL were unavailable; a local reconstructed v2 failed exact ordering/page membership on equal-title ties. V1 is itself not uniquely ordered. The 28 reconstructed candidate ID sets/totals matched an independent scan oracle; large AK-reported gains were not reproduced. Details, measurements, current checks and E2E retry: `SEARCH_V2_VALIDATION.md`. Migration still unapplied; disclosed narrower fallback unchanged. Native slow-GL refusal remains **UNVERIFIED**, not proven by the software override or generic null stub.

---

# Consolidated frontend correction round — AC

Date: 2026-11-02
Branch: `arena/c9d0d599-presentation`
Reviewed starting commit: `681800f894b2cf17021bb540e177a68c05e8f72e`
Verified parent: `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`
Independent input: AK `frontend-intelligence/phase2/AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md`, read through `git show origin/arena/9d055deb-presentation:…` at `e7d3943a410fd67cfb40e6b4f5e0c315a070cf5d`.

## Pre-implementation verification and audit

The fresh sandbox initially pointed at baseline `4307a68`, with the implementation present as working-tree changes. Before changing the index, AC compared all 127 tracked files against the remote reviewed commit by SHA-1: no missing or differing files. A **mixed-only** reset restored HEAD `681800f`; no files were discarded. The resulting tree was clean and matched origin. Node 22.22.3 / npm 10.9.8; the reviewed dependency versions are unchanged. `npm ci` and the unmodified baseline production build passed.

The independent review and both handovers were read in full. AK's original specification/checklist were also read; their historical findings remain intact. This document records AC's correction evidence, not AK's acceptance.

| Finding | Verified root cause and impact | Scoped correction / proof planned |
| --- | --- | --- |
| D-1 search coverage | RPC weights only document fields; the generated document vector also excludes joined subject/course names. Compatibility search includes all these facets. | Add C-weight taxonomy/facet group using actual joins/columns. Compare SQL and compatibility result sets for semester, type, platform, subject, course and cross-field queries. |
| D-2 index filtering | RPC computes a weighted vector for every eligible row before matching. An expression index/generated column for this expression is invalid (`42P17`, REPORTED by AK). | Restrict document candidates with existing `search_vector @@ tsquery`; add joined-taxonomy candidates; tokenize/rank only candidates. No table/index/generated-column change. Test the existing GIN predicate and SQL structure. |
| D-3 grid layering | Opaque canvas follows the grid with no explicit child layers. | Explicit background wash → shader → independent grid layer order; retain CSS fallback; inspect source colours and headless screenshots in both themes. |
| D-4 shelf context loss | Scene writes DOM state but React remains `ready`; disposal leaves a blank stage and disabled control. | Explicit `onFallback` callback, idempotent disposal, React fallback/retry/status restoration, post-initialization context-loss E2E. |
| D-5 typography | Blanket h1/h2 serif and shelf-only h3 serif contradict the now-final PO role decision. | Geist for all heading levels/UI; Newsreader for existing intentional emphasis/editorial devices. Remove unused roman font request rather than preload an unused face; retain token fix, italic variable font, swap and adjusted fallback. |
| D-6 motion vocabulary | New hover/reveal/fade rules duplicate durations, easing and distances. | Five tokens: fast/base duration, soft easing, small/medium translation. Keep the existing `--text-*` tokens and pixel override ladder. |
| D-7 story motion | Steps have both a Reveal parent and their own timeline; scroll-time `animation-delay` does not stagger. | Remove step wrappers and ineffective delay mechanism; retain one transform-only timeline per step and the accessible stacked fallback. |
| D-8 pending contrast | Both parent-opacity rules (`.65` and `.72`) can dim normal-size muted text below 4.5:1. | Remove text dimming; dim only non-text document covers, preserving busy/live/skeleton behaviour. Hold a pending transition open for axe and computed-opacity checks. |
| D-9 comment accuracy | Hero parallax is claimed but absent; unused scroll data attribute; shelf comment incorrectly describes mobile/reduced-motion blocking. | Add a small guarded CSS-only hero-stack translation, remove unused attribute, describe actual intent-based shelf behaviour. |
| D-10 forced colors | Decorative canvas/grid/shimmer have no forced-colors treatment. | Hide these decorations in forced-colors mode; test emulated computed styles and axe. Physical Windows High Contrast remains unverified. |
| D-11 software GL | Neither GL initialization path sets `failIfMajor`. | Set `failIfMajor: true` on ambient context and Three renderer; preserve low-power preference and test requested options/fallback. |
| D-12 NULL paging | SQL NULL skips `least`/`greatest`, producing 48 rather than 12. | Explicit `coalesce(page_size,12)` / `coalesce(page_offset,0)` before clamping; document all defaults; focused NULL/default/clamp tests. |
| D-13 shader palette | Shader hardcodes colours and reparses/selects them every frame. | Read `--accent`/`--bg` once per theme mount, parse defensively, cache uniforms; existing theme observer remounts on theme changes. Test parsing and theme-switch uniform updates. |
| Projector mode | Shelf ignores the existing classroom setting. | Reuse the existing projector store; prevent loading, dispose an active scene on enable, show poster/status, do not auto-load on disable. |
| F1 fixtures | SQL fixtures only reach PGlite; browser sees one real record; edge cases are missing. | Server-side, development-only `?fixture=1` source outside `public/`, with explicit empty/one/multi collections. Preserve the flag through library navigation. Production guard precedes file access/import; verify production ignores it and client output contains no fixture data. |
| E4b loading | Root loading boundary is absent; admin spinner says it is loading the public collection. | Add geometry-matched, accessible root and admin skeletons with accurate transient status text; no permanent simulated loading. |
| Search fallback | Missing RPC falls back to document-only search/title ordering; unexpected RPC errors do the same silently. | Keep no-Supabase compatibility unchanged. Explicitly disclose the known missing-RPC document-field/title-order limitation in the library. Unexpected RPC failures fail honestly instead of presenting narrower results as complete. |

## Boundaries and acceptance status

- No hosted SQL/schema/Auth/membership/document change, migration application, deployment, Vercel setting, AK merge or architecture replacement.
- No new project dependency. AO-ratified `three@0.187.0` and dev `@types/three@0.187.0` remain exact and lazy.
- Dropbox embed validation, the optional empty Drizzle scaffold and existing micro-typography are tracked, not changed in this round.
- Browser evidence will be labelled **MEASURED-AC** only after execution. Physical GPU/device, Safari/Firefox, Lighthouse field metrics and assistive-technology output remain **UNVERIFIED** unless actually tested.
- This round is **not fully accepted**. After implementation and validation, request AK's independent re-review; AO retains the acceptance decision.

Implementation results and exact final Git identity will be appended after the gates run.

## Implementation results — MEASURED-AC (not AK acceptance)

| Defect | Corrected files and executable evidence | Status |
| --- | --- | --- |
| D-1 | `202611020001_search_ranking.sql`: C-weight semester, document type, platform, subject and course names; `tests/database/search-ranking.test.ts` checks SQL vs compatibility sets for every facet, plus mixed document/taxonomy terms. `src/lib/search.ts` stops digit `1` matching unrelated `10`. | Local implementation complete; **hosted migration unapplied**. Compatibility substring search and PostgreSQL `simple` full-text search intentionally have different general tokenization; parity tests cover the named representative facets, not all strings. |
| D-2 | `matching_ids` unions the GIN-eligible `d.search_vector @@ q.candidate_tsq` with taxonomy-ID matches. The candidate query ORs parsed lexemes so cross-field AND queries are not lost; original full `websearch_to_tsquery` is applied to the weighted vectors **after** candidate selection. Taxonomy is tokenized on subject/course rows, not per-document weighted vectors. No index or table alteration. | Local test asserts function text, runs 4,016 synthetic rows and confirms GIN **eligibility** via `EXPLAIN` with `enable_seqscan=off`. With normal PGlite planner costs that small test chose a sequential scan; no claim that PostgreSQL must choose GIN in every case. Blank browse, negation-only and unselective taxonomy queries can still be broad. Hosted plan/latency **UNVERIFIED**. |
| D-3 | `globals.css`: wash beneath shader z=1, independent grid z=2; forced-colors removes decorative layers. `review-screenshots/landing-{dark,light}-software-webgl.jpg`. | Source and headless screenshots reviewed. The grid is subtle but remains a separate visible layer. Physical GPU/PO visual sign-off **UNVERIFIED**. |
| D-4 | `shelf-scene.ts`, `OptionalShelf.tsx`: idempotent geometry/material/renderer disposal, `onFallback` -> state/poster/retry/polite status. `tests/e2e/frontend.spec.ts` loses context after successful renderer initialization. | Passed with Chromium software rendering and the browser's `WEBGL_lose_context` extension (not a physical GPU). |
| D-5 | `globals.css`, `layout.tsx`: Geist h1–h4 and UI; Newsreader italic for approved emphasis/selected editorial accents. Removed blanket serif heading and shelf h3 exception. Removed unused roman font preload; kept next/font variable token, `display:swap`, adjusted fallback. | Source/computed-style browser checks passed. No global pixel-type rewrite. |
| D-6 | Five CSS tokens: `--motion-fast`, `--motion-base`, `--ease-out-soft`, `--move-sm`, `--move-md`; new fade/hover/reveal/drift rules use them. | Complete; original `--text-*` and responsive pixel ladder retained. |
| D-7 | `page.tsx`, `Reveal.tsx`, `globals.css`: direct step articles, one timeline each, no scroll-timeline delay; no stagger claimed. | DOM order and keyboard walk tested. Reduced motion and unsupported-timeline content remain visible. |
| D-8 | `globals.css` removes both parent opacity rules and only dims decorative document covers; text stays opacity 1. `frontend.spec.ts` holds a real navigation pending, checks busy/status and runs axe. | Automated pending-state axe passed in Chromium. |
| D-9 | `HeroVisual.tsx`/`globals.css`: guarded 8px CSS scroll-driven hero-stack drift (not the former 55px JS animation); `layout.tsx` drops unused attribute; shelf comments describe actual mobile/reduced-motion behaviour. | Complete; reduced-motion/projector disable the drift. |
| D-10 | `globals.css` hides canvas/grid/shimmer and uses system colours for skeleton borders in forced-colors; emulated styles tested. | Emulated Chromium passed; physical Windows High Contrast remains **UNVERIFIED**. |
| D-11 | Both context paths request **`failIfMajorPerformanceCaveat: true`**, the actual WebGL/Three option corresponding to the audit's shorthand `failIfMajor`, plus `powerPreference: "low-power"`. | Browser intercept verifies the requested attributes. Headless software-GL tests deliberately override this flag only in the test harness to exercise successful initialization; app code does not. |
| D-12 | SQL explicitly coalesces NULL page size to 12 and offset to 0, clamps size 1–48 and offset ≥0; function comment lists all defaults. | NULL/default/clamp tests passed. |
| D-13 | `ambient-shader.ts` reads/parses `--bg`/`--accent` once per mount; `AmbientGL.tsx` remounts on theme changes; defensive hex/RGB parser plus defaults. | Unit parse tests and browser uniform-value assertions for both themes passed; no per-frame parsing. |
| Projector | Shared projector store and subscriber prevent loading on enabled projector, tear down an active scene, restore static poster, disable retry until projector is off, leave scrolling intact. | E2E covers enabled at startup and switching while ready. |
| F1/F2 | `fixtures/review-catalog.json`, `src/lib/review-catalog.ts`, `src/app/library/page.tsx` / `LibraryControls.tsx`: development-only `?fixture=1`, `?fixture=one`, `?fixture=empty`, explicit banner and filter/pagination flag retention. 16 synthetic rows include 15 published + 1 hidden draft, six types, a blank description, 150-character title and Dropbox URL. | Dev browser 1/1 passed (including 320/390 overflow); production `?fixture=1` yields the original record and `/fixtures/review-catalog.json` is 404. JSON is outside `public/`; production import guarded by `NODE_ENV`. Synthetic card links are for **layout review only** and are not real resources or persisted detail records. SQL schema requires descriptions ≥10 characters, so the blank-description edge case exists only in browser JSON; SQL counterpart keeps a valid description. `DocumentCover` clamps decorative long title; full card heading stays visible. |
| E4b | `src/app/loading.tsx`, `src/app/admin/loading.tsx`, `src/app/library/loading.tsx`: route-shaped skeletons, named polite status outside the `aria-busy` region; decorative shapes `aria-hidden`. The search status likewise sits outside its busy results-content region, so assistive technologies do not have to defer the pending announcement. | Server-rendered unit test passed; no artificial timeout or permanent loading. Admin loading copy no longer describes the public collection. |

### Search failure and fallback semantics

No Supabase config continues to use the original JSON compatibility path. With Supabase configured and a query, the RPC is used for relevance, title **and** newest sorts. Unknown subject/course slugs return zero rather than accidentally becoming NULL/unfiltered RPC arguments. When PostgREST explicitly reports a missing RPC (`PGRST202`), the old RLS-safe document-vector path remains usable but cannot search joined subject/course names. The library **visibly discloses** that limited coverage: relevance falls back to title order, explicit title/newest sorts remain. The command palette also discloses the limitation and retains its featured-first fallback. Any other RPC error or empty response fails honestly (`CatalogUnavailableError`/503), not silently as a narrower success; regression tests mock actual Supabase HTTP. For no results, the existing recovery text now suggests complete words/broader terms/clearing filters. `simple` does not stem; no trigram/English index or new search dependency was added without a broader search review. No full parity is claimed for substring, phrase, negation, punctuation, collation or stemming semantics.

### Measurements and validation

All numbers below are **MEASURED-AC**, gzip level 9, binary KB (1024 bytes). `node scripts/measure-bundle.mjs --base-url http://localhost:3000` fetches complete production HTTP responses, including streamed dynamic `/library`, then sums unique referenced local JS and CSS separately; fonts, HTML/RSC payload and later interaction requests are excluded. Lazy chunks are identified from client build content. The same method was run against baseline `681800f` before corrections and against this correction build.

| Route | Baseline JS-only | Corrected JS-only | Corrected CSS-only | Corrected JS+CSS |
| --- | ---: | ---: | ---: | ---: |
| `/` | 187.0 KB | **187.5 KB** | 14.4 KB | 201.9 KB |
| `/about` | 179.9 KB | 180.2 KB | 14.4 KB | 194.6 KB |
| `/library` dynamic | 187.2 KB | 187.6 KB | 14.4 KB | 202.1 KB |

Shader lazy chunk `3rzw7burai720.js`: **1.8 KB gz**. Three shelf lazy chunk `0ddz61gxy1y6_.js`: **129.0 KB gz**, absent from initial landing HTML asset references, initial script contents and captured initial Chromium requests. JS-only landing remains under 300 KB. Asset hashes can change with rebuilds; the measurement tool discovers them by content. Baseline and corrected totals are independently rounded, so displayed sum columns can differ by 0.1 KB.

- `npm ci`: passed; no manifest/lockfile dependency changes.
- `npm run lint`: passed. `npm run typecheck`: passed.
- `npm run test:unit`: **47/47**.
- `npm run test:db`: **26/26** in local PGlite, including RLS/grants, facet parity, NULL paging, phrase/OR/NOT, candidate filtering and fixture idempotence/original row preservation. Not hosted verification.
- `npm run build`: passed; `next start --hostname 0.0.0.0 --port 3000` restarted after the build.
- `npm audit --omit=dev --audit-level=high`: **0 vulnerabilities**. `npm ci` reported 20 moderate dev-toolchain advisories; do not force a breaking fix.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium PLAYWRIGHT_SOFTWARE_GL=1 LD_LIBRARY_PATH=/tmp/al2023/lib:$LD_LIBRARY_PATH npm run test:e2e -- --workers=1`: **23 passed, 1 skipped** (development-only fixture test deliberately skipped on production).
- `REVIEW_FIXTURE_E2E=1 PLAYWRIGHT_BASE_URL=http://localhost:3001 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium LD_LIBRARY_PATH=/tmp/al2023/lib:$LD_LIBRARY_PATH npm run test:e2e -- tests/e2e/fixtures.spec.ts`: **1/1 passed** on `next dev`.
- An earlier full browser run had a test-harness pending-request synchronization failure and a command timeout during concurrent software rendering; the hold-open gate was fixed and the full rerun above passed. The fixture test initially had a strict locator violation; fixed and rerun. One subsequent full run failed to save a Chromium trace because production and development Playwright processes concurrently cleared the same `test-results` directory; rerunning serially produced 23 passed / 1 intentionally skipped. Initial newly added unit/database tests also exposed the numeric-term/parity/EXPLAIN issues addressed above. No failed run is represented as a pass.
- `git diff --exit-code 681800f -- src/data/presentations.json supabase/seed.sql supabase/migrations/202611010001_catalog.sql supabase/migrations/202611010002_least_privilege_catalog_grants.sql package.json package-lock.json`: passed before commit; the full original SQL row was also compared before/after fixture reapplication in PGlite. The hosted record was not modified or queried in this round; its previous fingerprint remains **REPORTED**, not freshly measured.

### Screenshots and limitations

`review-screenshots/landing-dark-software-webgl.jpg`, `landing-light-software-webgl.jpg`, `library-fixtures-{empty,one,multi}.jpg` are captured headlessly. The canvas successfully rendered using software WebGL **only because the screenshot/test harness overrode the major-performance-caveat option**; this is not evidence of app GPU performance or hardware colour fidelity. The source values are dark `--bg:#090b10`, `--accent:#a5aaff`; light `--bg:#f8f9fc`, `--accent:#5157c4`. Screenshots demonstrate layout/theme/grid, not PO acceptance. The development fixture screenshots include Next's local dev indicator.

**UNVERIFIED / pending:** real physical GPU/device/thermal behaviour and visual sign-off; Safari/Firefox; physical forced-colours and 200% zoom; screen readers/assistive technology; Lighthouse/RUM LCP/INP/CLS; hosted Postgres plan/latency and migration application; hosted interactive owner login; Vercel configuration/deployment; AK re-review and AO decision. The existing micro-typography, Dropbox embedding restriction, optional Drizzle scaffold, health/security/MFA/preview-isolation items remain tracked in `KNOWN_ISSUES.md`.

**Next action:** AK independently reviews this correction commit against its `681800f` parent, reproduces gates and examines the migration candidate/GIN strategy and the screenshots without modifying AC's branch. AO decides acceptance and separately approves any hosted migration or deployment. No work in this round applied the migration or touched hosted database/Auth/membership/data/Vercel state.
