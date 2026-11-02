# Correction-round update — pending AK review (2026-11-02)

The independent review of implementation `681800f` prompted corrections; the historical report below remains as evidence of the **earlier** milestone, not the current typography/search verdict. Geist now owns h1–h4/UI; Newsreader italic is editorial emphasis. The roman face is no longer preloaded. Ambient grid is above the shader; shader colours follow cached theme tokens. Shelf context loss updates React state/poster/retry/status; projector mode enforces a static scene; both GL contexts request `failIfMajorPerformanceCaveat`. Pinned steps animate only once; pending text remains fully opaque; forced-colors decorations are suppressed.

The local ranking migration has C-weight taxonomy/facets and GIN-eligible document candidates; combined query semantics and NULL paging have local DB tests. **It remains unapplied to hosted Supabase and is not accepted for deployment.** A missing RPC uses the explicitly disclosed narrower document-only fallback; other errors fail honestly. Browser-only synthetic fixture views are behind a literal development guard. Full detail, shortcomings and tests: `FRONTEND_CORRECTIONS.md`; checklist: `FRONTEND_ACCEPTANCE_CHECKLIST.md`.

**MEASURED-AC:** 47/47 unit, 26/26 DB, build/lint/typecheck, production Chromium 23 passed/1 dev-only skipped plus fixture dev 1/1, production audit 0. Landing 187.5 KB JS-only, `/about` 180.2 KB, dynamic `/library` 187.6 KB; shader 1.8 KB and Three 129.0 KB lazy. See `FRONTEND_CORRECTIONS.md` for explicit JS+CSS boundaries and software-GL/browser limits. AK's re-review and AO acceptance remain pending.

---

# Approved frontend implementation — AC

Date: 2026-11-02
Branch: `arena/c9d0d599-presentation`
Reconciliation reference: `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`
Starting HEAD verified before implementation: `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`, clean working tree.

## Product Owner decisions implemented

1. **Typography: Geist + Newsreader.** Geist remains the interface/body face. Newsreader is loaded in normal + italic variable files and used for editorial display headings/selected emphasis. The self-referential `--font-editorial` `@theme` collision was removed; responsive type tokens were added.
2. **Motion: pinned storytelling + one optional 3D scene.** The landing “How it works” chapter uses a sticky intro, chapter index and CSS scroll-driven reveals behind `@supports`/reduced-motion. No GSAP, Lenis or scroll-jacking. One optional 3D shelf loads only after explicit user intent.
3. **Ambient background: GLSL with CSS fallback.** A lazy raw-WebGL shader layer is additive over the existing CSS grid/radial fallback. It is decorative, `aria-hidden`, pauses when hidden/offscreen/reduced-motion/projector, and falls back on WebGL/shader/context-loss failure.

## Search / seed / accessibility / cards

- Compatibility search now uses weighted relevance mirroring title A / topic-keywords-tags B / description D. Query relevance is not overridden by featured status.
- Added reviewed but **unapplied** migration `supabase/migrations/202611020001_search_ranking.sql`: security-invoker `search_catalog` RPC using `setweight`, `websearch_to_tsquery`, `ts_rank`, explicit filters/sorts and least-privilege execute grants. The Supabase catalog path prefers the RPC when present and falls back to the existing RLS-safe text search when the migration has not been applied.
- Added **test-fixture-only** seed `supabase/seed.test-fixtures.sql` with 16 clearly identified fixture rows. It is not applied to hosted Supabase and does not alter the original resource/production seed.
- Library result count is an atomic polite live region; pending updates are announced; skeleton loading matches card geometry without hiding essential content.
- Document cards follow type → title → subject/course → semester/topic → host hierarchy, with visible focus, 44px CTA targets, no hover-only information and reduced blur/tilt.

## Dependencies

- Removed: `framer-motion`. The installed 12.43.0 `mini` entry exports only `useAnimate`; the required reveal/parallax behavior was preserved with native CSS scroll-driven animation, removing the motion runtime from the initial bundle.
- Added: `three@0.187.0` (exact) for the single optional lazy scene; `@types/three@0.187.0` (dev, exact).
- Avoided: GSAP, Lenis, R3F/drei, postprocessing, Spline, Lottie, namespace Three imports.

## Production bundle measurements

Measured with `scripts/measure-bundle.mjs` from production HTML initial script references, gzip level 9.

| Route | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Landing initial JS | 228.7 KB gz | 187.0 KB gz | **-41.7 KB gz** |
| About initial JS | 180.8 KB gz | 179.9 KB gz | -0.9 KB gz |

Lazy chunks measured separately:

- Ambient shader chunk: ~1.5 KB gz (raw GLSL path; below the ~3.1 KB research target).
- Optional Three.js shelf chunk: ~128.9 KB gz, not requested on initial landing load.

These are this branch’s production-build measurements, not AK’s reference measurements.

## Verification actually executed

- `npm ci`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:unit`: **35/35**.
- `npm run test:db`: **21/21**, including local PGlite application of the unapplied ranking migration + fixture seed, ranking order, draft exclusion, filters, anonymous RPC execute and write denial.
- `npm run build`: passed.
- Production-server Playwright/Chromium E2E: **17/17**, including reduced motion, WebGL unavailable fallback, optional 3D lazy-load guard, keyboard navigation beyond the pinned chapter, animation-initialization failure, search announcements, mobile overflow and axe.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities. Full audit still reports 20 moderate development-toolchain advisories.
- Headless Chromium screenshots captured under `/home/user/audit/frontend-*.png`.

Initial E2E runs exposed two test/implementation issues that were fixed and rerun: a strict-mode locator ambiguity, and scroll-reveal opacity reducing axe contrast. Reveal animation now transforms only; content opacity/contrast remains stable.

## Browser/device limitations

Verified in headless Chromium only. No real-device, physical GPU, Safari/Firefox, screen-reader or assistive-technology testing was performed. WebGL fallback was tested by forcing `getContext` to return null; actual GPU shader appearance/performance remains unverified. The optional 3D scene was not loaded in the initial-bundle test; its lazy chunk size was measured from the production build.

## Approval boundaries preserved

No deployment, Vercel setting change, AK branch merge, hosted Supabase schema/Auth change, administrator membership change or production document-data change. The ranking migration and fixture seed are repository deliverables only and require explicit approval before hosted application. Original JSON, production seed, Auth/admin code and applied migrations are unchanged.

## Remaining risks / next actions

1. Obtain approval before applying `202611020001_search_ranking.sql` to hosted Supabase; until then the app uses the fallback path.
2. Hosted Supabase env/deployment and interactive owner login remain gated from the prior backend milestone.
3. Review the optional 3D scene on real devices/GPUs; keep it disabled by default.
4. Health route still checks optional `DATABASE_URL`, not Supabase readiness.
5. CSP/HSTS, HttpOnly/server-owned login, MFA challenge flow and broader browser/AT coverage remain open.
