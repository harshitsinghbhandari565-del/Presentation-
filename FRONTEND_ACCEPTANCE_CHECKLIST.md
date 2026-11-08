# Current addendum — catalog tie ordering (2026-11-03)

| Gate | State |
| --- | --- |
| RPC V1 | **AO ACCEPTED** deterministic ordering; migration unchanged and unapplied. |
| Document paths | **MEASURED-AC PASS** ID after existing keys for live browse/fallback, command, rails, related candidate, JS compatibility/fixtures and admin lists. Related tie scores preserve candidate ordering. |
| Facet options | **OPEN** existing hosted `get_catalog_facets` RPC sorts names without ID; separate schema review required. |
| Search | **MEASURED-AC PASS** reconstructed 28+20 independent oracle cases, 4,000 rows across 84 pages; original AK scratch inputs remain unavailable. |
| Tests | 53 unit, 28 DB, lint/typecheck/build; production browser 23 pass/1 dev-only skip; production audit 0. |
| Hosted plan | **PREPARED, NOT EXECUTED** pending separate authorization; exact SQL/parameters in `docs/HOSTED_SEARCH_PLAN_REVIEW.md`. |
| Slow-GL / visual | genuine strict refusal, physical GPU/device/AT/visual review **UNVERIFIED**. |

Fixed snapshot and cross-mode collation/semantics limits: `CATALOG_ORDERING_REVIEW.md`.

---

# Current addendum — deterministic V1 search (2026-11-03)

| Gate | State |
| --- | --- |
| RPC deterministic ties | **MEASURED-AC PASS** fixed snapshot: UUID ASC follows original ranking/featured/title/newest keys; window pagination and aggregate share row numbers. |
| Page completeness | **MEASURED-AC PASS** 150 controlled tie cases in four modes; independent 4,000-row/84-page concatenation equals full order without duplicates. |
| Candidate/facets/bounds/RLS | **MEASURED-AC PASS** 28 reconstructed + 20 additional full-set, ordered-page and total oracle cases, role/draft/write and existing DB tests. Original AK scratch inputs unavailable. |
| Performance | V1 baseline only, local PGlite; natural scans and forced GIN eligibility distinct. Hosted latency unverified. |
| Limitations | Concurrent changes can shift offsets; pre-existing fallback/browse ties are not fixed. Slow-GL strict refusal unverified. |
| Activation | **BLOCKED**: migration unapplied pending separate AO approval; no v2 implementation. |

Details: `SEARCH_V2_VALIDATION.md`.

---

# Current addendum — search v2 and slow-GL (2026-11-03)

| Gate | State |
| --- | --- |
| Exact order / page boundaries | **FAIL** reconstructed v2; duplicate sort/title ties cause order/membership changes and repeated adjacent-page row. V1 is not totally ordered either. |
| Candidate completeness | **MEASURED-AC** 28 reconstructed exact candidate ID sets and v1/v2 totals match independent all-row oracle; original AK scripts/cases unavailable. |
| Scale improvement | **NOT MET**: 4,016-row PGlite, small noisy differences, not AK's reported gains; natural plans scanned. |
| Slow-GL refusal | **UNVERIFIED**: native browser accepted true on SwiftShader; software override and unconditional null do not prove actual strict refusal. |
| Hosted migration / deployment | **BLOCKED**, AO approval separate; no hosted actions. |
| Current gates | `npm run check` passed; E2E initially 22 pass/1 fail/1 skip, isolated retry pass, serial full 23 pass/1 skip. |

Complete evidence and commands: `SEARCH_V2_VALIDATION.md`.

---

# Correction-round acceptance checklist for AK and AO

This is AC's evidence map for the independent review of `681800f`; it **does not replace or erase** AK's historical `frontend-intelligence/phase2/APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md` or its independent audit. Labels: **MEASURED-AC** executed here; **REPORTED** from another review; **UNVERIFIED** not executed. Full audit table, exact commands, failures, results, limitations and parent commit: `FRONTEND_CORRECTIONS.md`.

| Original area | Correction evidence / state |
| --- | --- |
| A1–A4 / D-5–D-6 | Geist heading/UI and Newsreader italic emphasis; same `--text-*` scale, five motion tokens; font fallback/swap retained. **MEASURED-AC** source + browser computed fonts. No blanket typography rewrite. |
| A5 / D-3 / D-13 | Shader uses cached dark/light `--bg`/`--accent`, grid above shader, fallback; theme uniform checks and `review-screenshots/landing-{dark,light}-software-webgl.jpg`. **MEASURED-AC** software rendering; PO/hardware appearance **UNVERIFIED**. |
| B1/B1b/B2 / D-7/D-9 | Single step animation, no scroll-delay stagger, CSS-only hero drift, reduced-motion fallback and keyboard walk. **MEASURED-AC**. |
| C1–C8 / D-4/D-11/projector | Raw GLSL lazy, WebGL option `failIfMajorPerformanceCaveat`, CSS fallback; 3D explicit intent, context-loss callback/disposal, retry/status, projector startup and teardown. **MEASURED-AC** with test-only software GL override; physical GPU **UNVERIFIED**. |
| C9 | Ambient continues its throttled loop while the demand-rendered shelf is visible; no continuous 3D loop. Independent audit marked this partial and recommended pausing ambient; AO did not require a change. **DEFERRED / real GPU cost UNVERIFIED**. |
| D1–D4 | Production landing **187.5 KB JS-only**, shader 1.8 KB and Three 129.0 KB lazy, hashed Three chunk absent from initial requests; route CSS and `/about`/dynamic `/library` measured separately in `FRONTEND_CORRECTIONS.md`. AO ratified exact Three/types. **MEASURED-AC**. |
| D5 | Lighthouse/RUM LCP/INP/CLS/long frames and device thermal cost **UNVERIFIED**. |
| E1–E5 / D-8/D-10/E4b | Reduced motion, chapter keyboard order, forced-colors CSS emulation, root/admin/library skeletons/status, readable pending state with axe and live count. **MEASURED-AC**; 200% zoom, physical forced colours and real assistive technology **UNVERIFIED**. |
| F1/F2 | Dev-only 16-record synthetic source (15 public, one draft) with blank description, 150-character title and Dropbox URL; empty/one/multi screenshots. Production switch ignored. **MEASURED-AC**; human design acceptance **UNVERIFIED**. |
| F3 / D-1/D-2/D-12 | Local, unapplied SQL has A/B/C/D ranking, indexed document candidate filtering + taxonomy candidates, cross-field full-query verification, NULL paging and explicit grants/RLS. 26 PGlite tests passed. `EXPLAIN` proves GIN eligibility only under forced planner setting, not a hosted plan. Missing-RPC fallback visibly discloses narrower document-only coverage. **MEASURED-AC** local; hosted apply/plan **BLOCKED pending AO approval**. |

## Re-review protocol

AK: inspect this correction commit and parent `681800f`, review SQL semantics/performance/privilege boundaries and screenshots, rerun the listed tests and dynamic-route measurements, identify regressions or unverified criteria independently; do not modify or merge AC's branch. AO makes the acceptance decision after AK reports. Do not apply the SQL, change hosted state, deploy, or merge as part of this review.
