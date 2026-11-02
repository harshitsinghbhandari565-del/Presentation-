# AO — final frontend blueprint (Phase 2)

For AO + PO. Everything here is written against **AC's committed code**, read on 2026-11-02 from
`origin/arena/c9d0d599-presentation` (`git show`, never checked out) and the sibling `arena/019fbda9-presentation`.
AK has changed **no** app file, no manifest, no schema, no deployment config. Sizes are [MEASURED] in
`prototype-lab/`; anything AK could not execute is marked.

## 0. The five premises this rests on

1. **Real stack:** Next 16.4.3 app router, React 19.2.6, Tailwind 4.1.17, **framer-motion ^12.43.0 already installed**, Supabase (`@supabase/ssr` 0.12.7) + Drizzle 0.45.2, zod 4.6.7, lucide-react, Playwright 1.64 + axe 4.14 in CI [VERIFIED-FILE].
2. **Real data shape** (`types/document.ts`): `EducationalDocument` = `id, slug, title, description, originalUrl, platform, subject(+slug/id), course(+slug/id) | null, semester | null, topic, documentType, thumbnailUrl | null, keywords[], tags[], isFeatured, publicationStatus, createdAt, updatedAt, presentationUrl | null, embedUrl | null, backupLinks[{label, platform, url, description?}]`; `LibraryFilters` = `q, subject, course, semester, topic, type, platform, featured, sort(relevance|newest|title), page`; `PAGE_SIZE = 12` [VERIFIED-FILE].
3. **Real decisions (D1–D8)** that bind the design: extend-don't-rewrite; metadata + original links only, **never** upload/copy/sync/proxy; `noopener noreferrer` new tabs; user-initiated embeds; single `lib/catalog.ts` boundary with honest `compatibility` mode; missing fields stay `null`; Supabase for persistence/admin only, never service-role; archive-first; URL-driven discovery with `search_vector` + GIN, exact counts, facets via security-invoker RPC (`get_catalog_facets()`), bounded related window, no 1,000-row cap [VERIFIED-FILE DECISIONS.md].
4. **Zero 3D/GSAP/Lenis today:** `git grep -iE "gsap|lenis|three"` → no hits on either branch [VERIFIED-FILE]. Every recommendation below is therefore additive and removable in one commit.
5. **Measured economics:** CSS + `@property` motion ≈ 0 KB; framer-motion root **44.9 KB gz** / mini **29.7 KB**; Lenis **5.3 KB**; GSAP+ScrollTrigger **44.4 KB** (custom licence); raw WebGL2 background **2.9 KB**; three.js floor **130.4–187.5 KB** [MEASURED].

**Consequence for the whole document:** the "premium, futuristic" brief is achievable almost entirely with
typography, spacing, layering and CSS motion. The expensive options (3D, pinned storytelling) are *one decision*
for PO, not a direction for the project.

---

## 1. Design direction, in one setting per dial

| dial | setting | what it means in code |
|---|---|---|
| Editorial authority | **high** | serif display + mono metadata; big type-scale jumps; generous measure; no stock hero |
| Depth | **medium** | 5 CSS layers on cards, one ambient radial per screen; no stacked blur |
| Motion | **low-count, high-craft** | ≤ 1 hero-class animation per viewport + micro-states at 150 ms |
| Futurism | **by light, not by effects** | accent glow, vignette, optional single GLSL mesh (2.9 KB) — no particles on the product surfaces |
| Density | **medium on landing, high on discovery** | discovery shows more rows and smaller type; landing shows less and bigger type |

---

## 2. Landing page — section by section

Server-rendered (AC's current `page.tsx` is an async RSC with `revalidate = 60` and
`Promise.all([getCatalogHighlights(), getFacets()])` [VERIFIED-FILE] — **keep that shape**; every animated piece
below is a client child, never the root).

| # | section | content (real fields) | motion mechanism | added cost | reduced-motion / fallback |
|--:|---|---|---|--:|---|
| 1 | **Hero** | `title` line ≤ 2 lines (serif, `clamp(2.6rem,6.4vw,5.4rem)`), one lead sentence, search field (posts to `/library`), subject count chips from `getCatalogHighlights()` | EX01 CSS line reveal + variable-weight settle; search field grows on focus (`--motion-micro`) | 0 KB | final state immediately; no weight animation |
| 2 | **Ambient layer** *(optional, PO dial 3)* | none (pure background) | EX05 raw WebGL2, fixed, `aria-hidden`, mounted after LCP via `requestIdleCallback` | **2.9 KB** | one static frame; `?fallback=1` = CSS radial mesh, already in DOM |
| 3 | **Find by subject / course** | subject rail from facets: `subject`, `count`; second level `course` | EX08 measured pill + framer-motion `animate`; roving tabindex | 0 KB | pill jumps, still visible |
| 4 | **Featured resources** | `isFeatured` docs → EX07 card spec (type label, `documentType`, `title`, `subject · course`, `semester`/`topic`, `displayHost(originalUrl)`) | CSS layers + `@property` spotlight, 3 px lift, tilt ≤ 7° | ~4 KB | no tilt/spotlight; hairline + ring remain |
| 5 | **How it works (storytelling)** | 3 chapters: find → open → share, each = heading + 1 sentence + a synthetic visual (never a document screenshot) | **PO decision:** CSS `view-timeline` version (0 KB, no pin) **or** EX04 pinned + ScrollTrigger (44.4 KB + licence review) | 0 **or** 44.4 KB | stacked list, `IntersectionObserver` index (EX04's `stack` mode) |
| 6 | **Projector / themes strip** | existing `presentation-hub-theme` + `-projector` flags [VERIFIED-FILE] | EX09 circular-clip View Transition from the button rect | 0 KB | plain swap |
| 7 | **Conversion** | one primary CTA ("Browse the library") + one secondary ("Send a link to a class group"); no fake urgency, no testimonials we cannot source | hover/active states at 150 ms, `:focus-visible` ring | 0 KB | states only |
| — | **Nav** | wordmark, `Library`, `Subjects`, `About`, theme toggle; sticky band with `backdrop-filter` ≤ 64 px | 220 ms translate on scroll-down/hide (single element) | 0 KB | always visible, no hide-on-scroll |

**Landing budget:** 0 KB new JS for rows 1,3–7; **2.9 KB** if the ambient layer is approved; **+44.4 KB** if the
pinned chapter is approved. LCP element = hero text (server HTML) in every variant; the ambient layer must never be
the LCP node, and the story visual is CSS/SVG so nothing blocks paint.

## 3. Document discovery (`/library`)

### 3.1 Search architecture — one change request, everything else UI
- **Keep URL-driven state** (D8). Filters in the query string = shareable, restorable, testable: `?q&subject&course&semester&topic&type&platform&featured&sort&page`.
- **The real gap is ranking, not animation** [VERIFIED-FILE `lib/search.ts` + `api/search/route.ts`]: the SQL path builds `to_tsvector('simple')` over a concatenated string **with no `setweight`, no `tsquery` operators and no `ts_rank`**. Proposal for AO (AC PR, not AK): weight `title` A / `topic`,`keywords`,`tags` B / `description` D, use `websearch_to_tsquery`, order by `ts_rank` then `updated_at desc`. UI consequence: "relevance" becomes a *real* sort option instead of an alphabetical-ish guess.
- **Compat mode** (no Supabase client): AC's `getCatalogMode() === "compatibility"` uses `filterDocuments` + `matchesSearch` (substring AND) [VERIFIED-FILE]. Suggested: `await import("fuse.js")` **on first keystroke** in compat mode only (+~6–11 KB, [UNVERIFIED] here — not measured in the lab), so the demo/preview build feels like the real one. Keep it out of the Supabase path.
- **Debounce:** 220 ms client, `router.replace(..., { scroll: false })`; results region `role="status"` + `aria-live="polite"` with the exact count AC already returns.

### 3.2 Facet filters — rendered from the RPC, never invented
Facet UI = `get_catalog_facets()` output only [VERIFIED-FILE D8]. Rules: counts shown as returned (no "1k+"), zero-count options rendered disabled **with** the count (informative, not broken), multi-select via URL arrays not local state, applied chips with per-chip remove labelled `Remove filter: {value}`, "Clear all" only when ≥ 1 filter. No facet field is added to the UI that `EducationalDocument` doesn't carry — `semester` may legitimately be `null` for every row in the legacy data (`normalizeLegacy` sets `semester: null` [VERIFIED-FILE]) → **the semester facet must collapse when empty rather than render an empty list.** That is the difference between "premium" and "template with holes".

### 3.3 Cards, metadata hierarchy, sorting, pagination
- Card = §VISUAL_DESIGN_PATTERNS §8 spec; hierarchy **type → title → subject·course → semester/topic → host**; a `null` field is not rendered at all.
- Grid: `repeat(auto-fill, minmax(300px,1fr))`, `PAGE_SIZE = 12` → 3–4 columns desktop; skeletons match final geometry (CLS rule in `PERFORMANCE_BUDGETS.md` §3).
- Sort: a segmented control of the 3 real options; changing it does not scroll and does not animate the grid.
- Pagination: numbered + Prev/Next, `aria-current="page"`, focus stays on the control, results heading announced. `page` in the URL. No infinite scroll on a discovery product — the count of what you missed matters.
- **Motion budget on this route:** 150 ms chip/facet transitions, 220 ms sheet, **zero** on the grid. This route's job is finding resources; an animated grid is an obstruction (mission rule: *nothing that obstructs finding resources*).

### 3.4 Empty states (a first-class screen here)
Three distinct cases, because users meet all three: (a) no results for the query → echo the query, offer "remove {facet}" chips and a subject shortcut list; (b) no documents in a subject at all → explain it's a catalogue gap, CTA "Suggest a resource"; (c) catalog unavailable → AC's friendly 503 copy from `api/search/route.ts` [VERIFIED-FILE] + retry. Copy is factual, never cheerful; the illustration is a 40-line SVG, no Lottie.

### 3.5 Mobile filtering
Bottom sheet (EX10, 2.0 KB): trigger in the sticky bar with the applied count, `role="dialog"` `aria-modal`, Escape + backdrop close, focus return, safe-area padding, 44–48 px targets, `aria-pressed` option chips, "Show N results" as the primary action **inside** the sheet (count updates live from the facet RPC). Desktop = persistent rail. **No** horizontal-scroll filter strip that hides active filters off-screen — the active chip row must always be visible above results.

## 4. Document detail (`/resources/[slug]`)

| block | content | behaviour |
|---|---|---|
| Header | `documentType` label, `title`, `description`, `subject · course · semester · topic` | 220 ms fade-up on entry only |
| **Open document** | primary CTA → `originalUrl`, `target="_blank" rel="noopener noreferrer"`, host via `displayHost`, "opens in a new tab" in the accessible name | keeps AC's wording; the CTA is the most important pixel on the page — nothing animates near it |
| Alternates | `presentationUrl`, `embedUrl`, `backupLinks[]` (`label`, `platform`, `description?`) | each row = host icon + label + arrow; 150 ms hover only |
| Preview | **user-initiated** iframe via `embedUrl` (D2) | button first ("Show preview"), then a lazy `iframe` with `loading="lazy"`, `title`, a11y note "content is on {host}", and a visible "Open in {host}" escape hatch if the embed is blocked; **never** an auto-load, never a proxy |
| Metadata table | `createdAt`/`updatedAt` (mono, tabular, only if non-null), `tags`, `keywords` | copy-to-clipboard on the canonical link (breakdown §10) |
| Related | AC's bounded related window from the RPC [VERIFIED-FILE D8] | same card component, smaller density; **no** carousel with hidden items — a 3–4 item grid |
| Safety | external-link host display, no auto-redirect, no `dangerouslySetInnerHTML`, no thumbnail fetch from Drive | AC's `safeExternalUrl` already gates stored URLs [VERIFIED-FILE] |
| Responsive | 1 col ≤ 900 px; preview keeps 16:9 via `aspect-ratio`; sticky CTA bar on mobile (bottom, 56 px) | — |
| Motion | title 220 ms fade; card→detail morph via `view-transition-name: doc-{slug}` where supported | 0 KB; instant where VT is unsupported |

## 5. Design system — what to add to AC's tokens (naming follows their existing convention)

```css
/* colour: keep AC's tokens; add the 4 that the animated surfaces need */
--surface-raised      /* card top-stop; used by EX07 layer 1 */
--accent-soft         /* selected chip fill; 12 % color-mix, never opaque */
--glare-max: .75      /* spotlight ceiling; light theme overrides to .18 + multiply */
--edge-ambient        /* hairline-on-hover = color-mix(accent 55%, border) */

/* motion: adopt Vault's set verbatim (019fbda9) and point framer-motion at it */
--motion-micro: 150ms; --motion-short: 220ms; --motion-exit: 200ms; --motion-story: 420ms;
--ease-default: cubic-bezier(0.16, 1, 0.3, 1);   /* PO picks this OR Reveal's (0.22,1,0.36,1) — one, not both */
--move-rise: 18px; --move-slide: 8px;            /* AC's Reveal already uses y:18 [VERIFIED-FILE] */
@media (prefers-reduced-motion: reduce) { --motion-*: 150ms; }   /* keep transitions, shorten them (Vault policy) */

/* radius / shadow / spacing: unchanged from AC; add only */
--radius-card: 18px; --radius-chip: 999px; --shadow-lift: 0 8px 24px -12px rgb(0 0 0 / .45);
```
**Interaction-state matrix** every component must implement (this is the review checklist): rest · hover ·
focus-visible · active · selected · disabled · loading · empty · error. `transition: all` is banned (found in
019fbda9's `button.css` [VERIFIED-FILE] — reported, not fixed).

## 6. Responsive & capability architecture

| axis | desktop ≥ 1024 | tablet 768–1023 | mobile ≤ 767 | touch (any width) | reduced motion | low power / no WebGL |
|---|---|---|---|---|---|---|
| hero | 2 lines, big scale | 2–3 | 3–4, smaller clamp | same | static final frame | same |
| ambient layer | optional GL pass | CSS mesh | **none** | none | one static frame | none (CSS mesh in DOM) |
| story section | pinned (if approved) or scroll reveals | scroll reveals | stacked cards (EX04 `stack`) | same | stacked | stacked |
| discovery facets | left rail | collapsible rail | bottom sheet | sheet with 44 px targets | no slide animation | same |
| cards | spotlight+tilt | spotlight only | press state only | no hover-only info | ring + lift only | no tilt/glare layers |
| nav pill | spring 360 ms | same | instant | same | instant, visible | instant |
| detail preview | button→embed | button→embed | button→embed + sticky CTA | same | no fade | same |
| DPR cap | 1.25 | 1.0 | 1.0 (**1.0 for any GL**) | — | — | 0.75 for GL |

Capability ladder (the implementation rule, from the lab's `hasWebGL()`/`lowPower()`/`safe()`):
**L0** content in DOM, server-rendered → **L1** CSS states + `@property` → **L2** `@supports (animation-timeline: view())` reveals → **L3** framer-motion orchestration → **L4** WebGL/3D behind capability + intent + `try/catch` + `destroy()`. Every level is legible alone; L4 is additive; nothing at L3+ may change what L0 renders.

## 7. What AC installs (final answer to "what do we add?")

| priority | change | new dependency | size |
|---|---|---|--:|
| P0 | switch to `framer-motion/mini` + `LazyMotion(domAnimation)` in the components that use it | **no** | **−15.2 KB** |
| P0 | CSS `@property` card system (EX07 layers), measured pill nav (EX08), sheet (EX10), skeletons, VT theme flip (EX09) | no | +4–8 KB own code |
| P1 | `setweight`/`ts_rank` ranking fix in `lib/search.ts` (AO-approved AC PR, separate concern) | no | 0 |
| P1 | raw WebGL2 ambient background (EX05, one file, dynamic import) | **no** | +2.9 KB |
| P2 | Lenis behind a user toggle, desktop only | `lenis@1.3.27` | +5.3 KB |
| P2 | pinned story chapter | `gsap@3.15.0` + ScrollTrigger + **licence review** | +44.4 KB |
| P3 | one 3D moment (R3F + drei), post-LCP, interaction-gated, mobile-excluded | `three` `@react-three/fiber` `@react-three/drei` | +130 KB → |
| never | `motion` (rename), `lottie-web`, carousel libs, `react-virtualized`, CSS-in-JS, `@view-transitions/react` (React 19.2.6) | — | — |

## 8. Risks AO should carry into the decision

1. **Licence:** GSAP is not MIT [VERIFIED-LICENSE]; legal read required before it enters `package.json`.
2. **Two scroll authorities:** AC's `html{scroll-behavior:smooth}` + Lenis/ScrollTrigger (must be removed in the same PR if either lands).
3. **Two type identities across AC's branches** (Geist+Newsreader vs Inter+Space Grotesk) → PO must pick; the `c9d0d599` serif is italic-only **and** self-referential in `@theme` (two real file-level bugs, reported not fixed).
4. **No frame-rate evidence exists yet** — the visual/60 fps claims in this pack are lab-verified for *logic and size* only; AC must run the §5 checks in `INTERACTION_EXPERIMENT_LAB.md`.
5. **Search UX is the highest-value, lowest-glamour work:** an animated landing over weak ranking is a premium shell on a mediocre product. §3.1's ranking fix outranks any Tier-2 effect.
6. **Category coverage gaps** (honest, in `GITHUB_RESEARCH_GAPS.md`): no `embla`/carousel-quality entry and no `size-limit`/bundlewatch config precedent found in the qualified set; drei/postprocessing wrappers shortlisted but not inspected.

## 9. What AO must answer (the 12 questions, short form)

| question | AK's answer |
|---|---|
| visual direction | editorial type + light-as-depth, five CSS layers, one ambient source; "futuristic by lighting, not by effects" (`VISUAL_DESIGN_PATTERNS.md` §0–§5) |
| landing feel | 7 sections, one hero animation, optional moving mesh, optional one pinned chapter; LCP stays text (§2) |
| which 3D earns its place | **none by default**; if anything: one synthetic 3D "shelf/stack" on the landing after interaction, mobile-excluded (§6, `TECHNOLOGY_COMPARISON.md` §1/§9) |
| R3F or three | R3F + drei if approved (React lifecycle correctness); raw GLSL for a background (190 KB → 2.9 KB, measured) |
| GSAP / Motion / both | Motion-as-already-installed for components; GSAP only for a scrubbed pinned chapter, licence-reviewed; **never both on one element** |
| Lenis or native | native by default; Lenis as a 5.3 KB user toggle on desktop only |
| what AC installs | §7 table — P0 row is a **size reduction with no new dependency** |
| what AC avoids | §7 "never" row + `VISUAL_DESIGN_PATTERNS.md` §9 anti-pattern list |
| top repos for AC | `TOP_15_AC_REFERENCES.md` (15 ranked, do-this/not-this each) |
| top websites | `WEBSITE_ATLAS.md` §A (44 curated) + §C/§D (62 live, zero-install references) |
| perf risks | `PERFORMANCE_BUDGETS.md` §1–§5 — biggest: a landing library imported into the shared layout; `backdrop-filter` inside animated parents; `import * as THREE` |
| mobile/low-power degradation | different implementation, not a shrunk desktop: EX10 at 2.0 KB; ambient/tilt/blur off; sheet for filters; GL DPR 1.0 or absent |
| implementation order | `FRONTEND_IMPLEMENTATION_SEQUENCE.md` (Phase 2 update): design tokens → card system → discovery polish → search ranking → landing motion → optional ambient → optional pin → optional 3D |
| tests per phase | each step in that file ends in a Playwright/axe assertion AK has written in `ACCESSIBILITY_GUIDELINES.md` §7 + `PERFORMANCE_BUDGETS.md` §7 |

---
*Evidence index: `REPOSITORY_ATLAS.md` (1,914 in-scope rows), `REPOSITORY_QUALITY_RANKING.md`, `TOP_35_DEEP_EVALUATIONS.md`, `TOP_15_AC_REFERENCES.md`, `WEBSITE_ATLAS.md` (154 entries), `INTERACTION_EXPERIMENT_LAB.md` (10 built + 20/20 headless), `prototype-lab/measurements.json` (sizes). Machine files: `/home/user/research/discovery/{raw.jsonl,catalog.json,deep_evals.json,chain.log}`.*
