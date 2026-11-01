# Educational Document Discovery UX

**AK · 2026-11-01 · Domain G — the brief's most product-specific domain.**

> Context from `audit/stack-audit.md`: the committed product has **1** document, one subject (`English`), **no** `course`/`semester`/`type` fields, and search is a client-side `includes()` over 4 fields `[VERIFIED-FILE]`. This document therefore separates *(a) what to build now* from *(b) what to build when the taxonomy exists*. Do not present (b) to the Product Owner as ready.

## 1. Research findings: how good discovery interfaces are actually built

| Finding | Evidence | Status |
|---|---|---|
| **Search must never be hidden behind an icon**; keep the field visible with a magnifier + a button, and put it on every page | EdTech search-design study, 8 insights | `[REPORTED S11]` |
| Input width ≥ 27 characters (60+ desktop, 45 mobile) | same | `[REPORTED S11]` |
| **Autosuggest immediately**, show 8–10 results (4–8 mobile), no scrollbar inside the suggestion list, highlight the differing part of the match | same | `[REPORTED S11]` |
| Support partial words, misspellings, stemming, synonyms; ignore stop words | same | `[REPORTED S11]` |
| **Faceted navigation, applied live, no "Apply" button on desktop**; filters on left or top, always visible | same + SRP design guide | `[REPORTED S11]` |
| Result counts **on each facet value**, multi-select per facet | Alma repository-search UX notes; SRP guide | `[REPORTED S11]` |
| **Pagination or "Load more", not infinite scroll** for task/conversion-oriented results (place-keeping, screen-reader announcement, sense of an end) | EdTech guide + SRP guide | `[REPORTED S11]` |
| Sort by **Most Relevant / Newest / Most Popular**; **never default to alphabetical** | EdTech guide | `[REPORTED S11]` |
| Search-results page = clarity (layout/typography) + control (facets/sort) + speed (skeletons, LQIP); measure query volume, refinement, CTR, **zero-result rate** | SRP guide | `[REPORTED S11]` |
| Skeletons matched to final layout to prevent jarring shifts; defer heavy images | SRP guide | `[REPORTED S11]` |
| A11y of the results grid: proper roles + live regions announcing result counts | SRP guide | `[REPORTED S11]` |
| Library/portal sites win on **one persistent search + clear action-oriented IA + responsive grids + accessibility**, not on effects | 25-best-library-sites analysis (NYPL, LA, SFPL, Oak Park…) | `[REPORTED S12]` |

**Read-through:** the research consensus is that discovery quality is *information architecture + latency + feedback*, and that premium sites in this category (museums, libraries, archives) earn their awards through **editorial typography, restraint and rhythm** — not scroll theatrics. That is a strategically important finding for AO: the brief's ambition ("futuristic storytelling") must be spent on the landing narrative and card *material*, while the results surface stays boringly excellent. `[AK-RECOMMENDATION]`

## 2. Card anatomy for a *document* (not a product)

Field priority, for a student deciding in ~1.2 s whether this is the right deck:

```
┌───────────────────────────────────────────────┐
│ [texture: generated from subject+id]     ●LIVE │  ← 16:9 band; accent-tinted
├───────────────────────────────────────────────┤
│ ENGLISH · SEM 4                    [Slides]    │  ← 10px caps, tracking .12em
│ The Lost Spring — MCQ Set                      │  ← Newsreader 20/26, line-clamp-2
│ Literature · Chapter 4 · 24 slides             │  ← secondary text
│ ▸ PDF ▸ PPTX · updated 12 Sep                  │  ← document-type chips + date
│ [ Present ↗ ] [ Copy ] [ Preview ]      1–12 ⌘K│  ← action row (hover/focus reveal)
└───────────────────────────────────────────────┘
```
Rules: **title is the link** (whole card clickable via a stretched pseudo-element so the accessible name stays the title, not "Open"); `type` and `platform` are visually distinct (type = what it *is*, platform = *where it lives*); "updated" matters academically (freshness signal for revision material); never bury the *Present* action — the whole product is one click away from classroom use `[VERIFIED-FILE]` (`presentUrl` is already the primary CTA in `BackupLinks`).

## 3. Facet taxonomy spec (for when the fields exist)

| Facet | Type | Cardinality | UI | Notes |
|---|---|---|---|---|
| Subject | multi-select | 5–30 | chip row → sidebar | currently the **only** available facet |
| Course | multi-select | 3–15 | sidebar group | **field missing** |
| Semester | single or range | 1–8 | segmented control | **field missing**; ordinal, so a segmented control beats a list |
| Topic | multi-select | high | sidebar with **search-within-facet** | Alma pattern `[REPORTED S11]` |
| Document type | multi-select | 4–8 | icon chips (Slides/PDF/PPTX/Video/Notes) | **field missing** (only free-text `platform` exists) |
| Language / Board / Year | optional | low | sidebar | only if the Product Owner has the data |
| "Has backup link" | boolean | — | switch | **implementable today** from `backupLinks.length` `[VERIFIED-FILE]` |
| "Pinned only" | boolean | — | switch | implementable today from `pinned` |

Pattern: **sidebar on `lg`, bottom-sheet on mobile** (SRP guide: "Modal/Bottom sheet (mobile): full-screen space for complex filtering without losing context"), sticky "active filters" summary with per-chip remove + clear-all, and `?subject=&course=&q=` **URL state** so a filtered view is shareable in a class group — a genuinely high-value, low-cost product feature for this audience. `[AK-RECOMMENDATION]`

## 4. Search quality on 20 LOC of code we already have

Current: `includes()` on `title|topic|subject|tags`, plus a separate `lib/search.ts` that duplicates the logic `[VERIFIED-FILE]`.

Upgrades, cheapest first:
1. **Unify** `page.tsx` and `lib/search.ts` into one function (dedupe). Trivial.
2. **Normalise**: `NFKD` + diacritic strip + lowercase once; tokenise the query and require **AND** over tokens rather than substring of the whole string (fixes "spring lost" returning nothing).
3. **Field weighting** (title 4 > topic 2 > tags 1.5 > subject 1 > description 0.5) + a score-sorted result order — this alone moves perceived relevance dramatically.
4. **Prefix matching** per token (starts-with bonus) and a 1-edit-distance fallback for typos (small hand-rolled Levenshtein on ≤400 records is microseconds).
5. **Highlight matches** in titles (research finding: highlight the difference — `[REPORTED S11]`).
6. **Zero-result strategy**: never an empty page — show "no match" + relaxed suggestions (top 3 by subject) + a "clear filters" action; log the query string client-side for the Product Owner (zero-result rate is the metric to watch).
7. **Fuse.js** only if fuzzy matching above still misses; it's ~20 KB gz. At n≤500, hand-rolled scoring wins on bundle. `[AK-RECOMMENDATION]` Server-side `pg_trgm` once the DB is real.
8. **⌘K** stays the power path; give it *sections* (Documents / Subjects / Actions: "Open projector mode", "Toggle theme") — palette-as-command-surface is the 2026 SaaS convention.

## 5. Detail page (`/presentation/[id]`) — the highest-leverage screen

It is a server component reading the JSON `[VERIFIED-FILE]`. Discoverability ends here, so:
- **Shared-element morph** from the card (`<ViewTransition name>` — see `motion-design.md` §3).
- **Slide preview**: `embedUrl` exists in the model but is *never rendered* `[VERIFIED-FILE]` — embedding the Slides `preview` URL in a lazy iframe (`loading="lazy"`, poster overlay + click-to-load so we don't pay for a third-party frame on the critical path) is the single biggest "premium" upgrade available. It also fixes the barren `preview-area` placeholder block.
- **Related documents** (same `topic` → same `subject` → same tag, weighted): solves "what do I read next", currently absent.
- **Metadata rail**: subject, course/semester when they exist, type, presenter/class, updated date, tags as filter links.
- **Backup links** are already well-handled (copy + `Open Backup`, with a `Check`/`Copy` state `[VERIFIED-FILE]`) — keep, and surface *why* a backup exists (the description field is unused in the card).
- **Keyboard**: `P` = present, `Esc` = back, `←/→` = prev/next in subject (pairs with `Observer` from GSAP if a step-through is built).
- **Print/OG**: no per-page `generateMetadata` today `[VERIFIED-FILE]` — a shareable document hub needs an OG image per document (a `next/og`-generated card is the natural "premium" surface and needs no client JS at all).

## 6. Recently-added / featured / "your syllabus" surfaces

| Surface | Today | Recommended |
|---|---|---|
| Featured (pinned) | one card, 8 cols `[VERIFIED-FILE]` | keep; add spotlight-ring + real preview; degrade to "Recently added" when nothing is pinned |
| Recently added | **absent** | 6-card strip sorted by `updatedAt` (needs the field) with a "new" badge for ≤14 days |
| Continue where you left off | absent | localStorage of last-viewed ids (no account needed) — 3 cards, high perceived intelligence for ~30 LOC |
| Stats | Total/Pinned `[VERIFIED-FILE]` | make them **facets you can click** (Total→all, Pinned→filter) — turns decoration into navigation |
| Subject chips | flat list `[VERIFIED-FILE]` | counts per chip + selected-state with `layoutId` pill + horizontal scroll on mobile |
| Empty states | raw string "No featured presentation available." `[VERIFIED-FILE]` | designed empty tile with an action (this is where a hub with 1 record will live for a while — invest here) |

## 7. Anti-patterns for an education audience (evidence-backed)

Infinite scroll (place-losing, SR-hostile `[REPORTED S11]`) · filter modals on desktop · "Apply" buttons · alphabetical default sort · search behind an icon · hiding result counts · hover-only actions · carousel-style horizontal scroll for primary results · full-screen overlays with no `Esc` · animation that delays the first useful interaction · thumbnails of stock document photos (misleading; use the generated texture instead).

## 8. What the "premium" version of this screen feels like

Not: parallax everywhere. Yes: instant keystroke-to-result latency (<50 ms perceived), a card whose texture tells you the subject at a glance, filter changes where the grid *travels* with `Flip` instead of popping, a URL you can paste into a class group, a shared-element morph into a page that already shows the slides, and an ambient field that stays out of the way. **Every one of those is achievable within the recommended stack and within the performance budgets** (`performance-accessibility.md`).
