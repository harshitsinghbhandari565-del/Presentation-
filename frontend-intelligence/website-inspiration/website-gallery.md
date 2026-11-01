# Website Gallery — verified references with technique analysis

**AK · 2026-11-01 · Domain F**

## 0. Verification honesty (read before using)

| Tag | Means |
|---|---|
| `[VERIFIED-FETCH]` | I fetched this exact URL on 2026-11-01 and read its content |
| `[VERIFIED-LISTING]` | The entry appeared in a live Awwwards category listing I fetched (name, studio, award, date); **the site itself was not opened** — because this sandbox's network allow-list excludes arbitrary hosts |
| `[REPORTED]` | Named in a 2026 secondary source (award roundups / articles) |
| `[UNVERIFIED-URL]` | URL inferred, **not confirmed** — AC must click-verify before quoting to the Product Owner |

**Discovery about the sources themselves `[VERIFIED-FETCH]`:** `godly.website` now **redirects to `recent.design`** (a feed of interface/web/motion work). Useful, but its feed items are short-form; it is not an archive of full site breakdowns any more. `siteinspire.com/inspiration/filters/site-type:education` returns **404** — the working browse path is `https://www.siteinspire.com/websites`. Older briefs that cite Godly/SiteInspire filter URLs are stale.

---

## 1. Education / institution / archive — the sites closest to our product

| Site | URL | Verification | What it proves | Steal this |
|---|---|---|---|---|
| **Smithsonian Institution** | https://www.si.edu/ | `[VERIFIED-FETCH]` (via its Awwwards nominee page, 2026-10-27) | A **design system scalable across 100+ subdomains** for the world's largest museum/archive complex, built on WordPress/Drupal + Figma, tagged Culture & Education / Institutions / Clean / Flat / Minimal / Navigation / Responsive / UI. Awarded as a *nominee* on design & usability, **not** on WebGL | The lesson our Product Owner needs to hear: the most lauded educational-archive site of this cycle won on **systematic layout, navigation and content architecture**. Our premium signal must come from typography, rhythm and states — plus *one* memorable motion idea |
| **Awwwards "Education" category** | https://www.awwwards.com/websites/education/ | `[VERIFIED-FETCH]` | The current live page is dominated by **nominees, not showreels**: *The Little Match Girl* (DxL.agency), *YOLO.EXE* (DxL.agency), *Monet 100* (übernatural), *Michelle Kaye – Fine Arts*, *Cleal – Kakuta Paper* (Leapy), *YOYU DESIGN* (B&J), **Sparkle — Stars to Habits**, *Levi Gavrilut*, *Smithsonian*, *fromearth/2050*, *The First Fifty*, *Die PANKOW Zeitmaschine*, *Later's Made You Look* (WLCR), *Les Intranquilles*, *Dérive*, *FŪDO — Climate Shapes Culture* | Read as evidence that "education" awards reward **narrative + craft**, not 3D density. Each name links to `awwwards.com/sites/<slug>` (those URLs are `[VERIFIED-LISTING]`) |
| *Sparkle — Stars to Habits* | https://www.awwwards.com/sites/sparkle-stars-to-habits | `[VERIFIED-LISTING]` | A learning-habit product page — our audience's visual register (friendly, legible, motion-light) | Motion *language* for a young student audience without cartoonishness |
| *The First Fifty* / *Die PANKOW Zeitmaschine* / *FŪDO — Climate Shapes Culture* | `awwwards.com/sites/<slug>` | `[VERIFIED-LISTING]` | Scroll-storytelling about **documents, history and datasets** — i.e. real content carrying the narrative, not decoration | The scroll-narrative structure to imitate for "How discovery works" |
| **New York / Los Angeles / San Francisco / Oak Park public libraries** (top picks in a 2026 library-site analysis) | nypl.org, lapl.org, sfpl.org, opld.net | `[REPORTED S12]` | What real discovery platforms prioritise: persistent search on every page, auto-suggest + filtered results, clear action-oriented IA (Catalog / Events / Digital Resources / Services), accessibility, responsive grids | The **IA and search placement** decisions. Note: none of it is about animation — and these are the sites students actually use |

## 2. WebGL / 3D award tier — technique donors

From live Awwwards WebGL listings `[VERIFIED-LISTING]` (names, studios, awards, months as they appeared on `awwwards.com/websites/webgl/?page=3` and `?page=5`):

| Site | Studio | Recognition (as listed) | Why it matters to us |
|---|---|---|---|
| Sobha Privy Collection | Vide Infra | **SOTD + Developer Award, 2026-09-23** | Real-estate catalogue with WebGL — the closest thing to "premium *catalogue* with 3D" |
| Noho | Eugene Morev | SOTD + Dev, 2026-09-18 | Restraint + precision motion; typography-led |
| L.I.S.A. | Locomotive | SOTD + Dev, 2026-09-16 | Scroll choreography reference (Locomotive's own tooling history is instructive: they've since moved to lighter scroll tech) |
| Grail | denormalized | Honorable Mention, 2026-09-20 | |
| The Tuscan Journey Begins | MONOGRID | SOTD, 2026-09-13 | Narrative scroll over *places/documents* |
| USAvionix | basement studio | SOTD + Dev, 2026-09-09 | Technical product storytelling |
| Cartier – Le Chœur des Pierres | makemepulse | HM + Dev, 2026-09-15 | Luxury-level shader polish; also **playful, performant brand interaction** `[REPORTED S10]` |
| Spotify Wrapped Party | Active Theory | SOTD + Dev, 2026-07-24 | **Data → spectacle**: the pattern we want at small scale (our stats become visual) |
| Lacoste – Polo Factory | Merci-Michel | SOTD + Dev, 2026-07-21 | |
| IZANAMI | baqemono.inc. | SOTD + Dev, 2026-07-18 | |
| RISK | FLOT NOIR | SOTD + Dev, 2026-07-15 | |
| Vectr | Utsubo | SOTD + Dev, 2026-07-11 | A developer-led studio site; the same author publishes the three.js/WebGPU performance guidance cited in `research/threejs.md` `[REPORTED S5]` |
| Microsoft Windows | OFF+BRAND | HM, 2026-07-23 | Brand-led real-time build |
| 21 Hrs On The Moon | Studio 28K | SOTD, 2026-07-10 | |

Studios named as the 2026 craft bar `[REPORTED S10]`: **Lusion** (shader/particle research-grade; EverSwap SOTD+Dev Jun 2026), **makemepulse** (Apechain SOTD+Dev Jun 2026), **Noomo** (self-initiated *The Power of Storytelling*, SOTD+Dev Jun 2026), **Unseen Studio** (Hubtown SOTD+Dev Jun 2026), **Vide Infra** (Springs SOTD+Dev Mar 2026), **Psychoactive** (NZ; explicitly "award-level 3D, **performance-budgeted**"), **OFF+BRAND** (Steven.com SOTD+Dev Jun 2026 — *and it appears as a Lenis sponsor `[VERIFIED-FETCH lenis README]`, a good signal of the smooth-scroll ecosystem's centre of gravity*). Individual studio homepages: `[UNVERIFIED-URL]` (lusion.co, activetheory.net, makemepulse.com, noomo.com, unseenstudio.com, videinfra.com, psychoactive.co.nz, offbrand.agency) — **verify before citing**.

## 3. Educational-tutorial tier — the most directly usable "websites" for us

These are pages that *explain* the techniques with source, i.e. the highest value-per-click for AC.

| Source | URL | Verification | Content |
|---|---|---|---|
| Codrops — Sticky Grid Scroll (2026-03-02) | https://tympanus.net/codrops/2026-03-02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/ | `[VERIFIED-FETCH]` (article text retrieved) | GSAP + ScrollTrigger + Lenis sticky grid; exact `lerp: 0.08`, `wheelMultiplier: 1.4`, timeline overlap `"-=0.6"`, parallax `yPercent: -100`, `toggleActions: "play none none reset"` |
| Codrops — SVG Mask Transitions on Scroll (2026-03-11) | https://tympanus.net/codrops/2026-03-11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/ | `[VERIFIED-LISTING]` | 4 mask-reveal patterns; `viewBox="0 0 100 100"` maths; `scrub: 2.0–2.5` |
| Codrops — Scroll-Reactive 3D Gallery, velocity + mood backgrounds (2026-03-09) | `tympanus.net/codrops/2026-03-09/…` | `[VERIFIED-LISTING]` | Velocity-driven WebGL — the "feels alive without being busy" trick |
| Codrops — Reactive Depth: scroll-driven 3D image **tube** in R3F (2026-02-17) | `tympanus.net/codrops/2026-02-17/…` | `[VERIFIED-LISTING]` | Shaders + inertia + unified motion system in R3F |
| Codrops — Infinite GSAP Scroll Gallery with Parallax and **Flip** fullscreen transitions (2026-07-30) | `tympanus.net/codrops/tag/scroll/` | `[VERIFIED-LISTING]` | Flip for grid→fullscreen — our card→detail pattern, pre-View-Transition |
| Codrops — Scroll-driven 3D gallery via **Blender camera path** (2026-07-07) | same tag page | `[VERIFIED-LISTING]` | Authored camera paths (needs an asset pipeline we don't have) |
| Codrops — Creating 3D Scroll-Driven Text Animations with **CSS and GSAP** (2025-11-04) | same | `[VERIFIED-LISTING]` | High-performance 3D-ish text **without WebGL** — our constraint exactly |
| Codrops — Joffrey Spitzer Portfolio: minimalist Astro + GSAP with reveals, Flip, **subtle** motion (2026-02-18) | same | `[VERIFIED-LISTING]` | "Crafted with restraint and precision" — the temperament to copy |
| Codrops — Async Page Transitions in Vanilla JS (2026-02-26) | same | `[VERIFIED-LISTING]` | Leave/enter orchestration by hand — useful to understand what native VT is doing for us |
| MDN — `animation-timeline` | https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline | `[VERIFIED-FETCH]` | Support table read directly: Chrome/Edge 115 · Firefox **159** · Safari **26** · "not Baseline" banner |
| Next.js — Designing view transitions | https://nextjs.org/docs/app/guides/view-transitions | `[VERIFIED-FETCH]` | See `research/motion-design.md` §3 — this is our Phase 1 spec |
| recent.design (formerly Godly destination) | https://recent.design/ | `[VERIFIED-FETCH]` | Micro-inspiration feed (e.g. "Morphing UI Controls", "Fold Toolbar interaction", "Infinite Scroll 3D concept", "Geist Serif" — note: **Geist is our UI font**, so Vercel's Geist Serif release is a candidate display pairing) |
| hontran.dev — "10 Best Award-Winning Websites of 2026 (judged by a juror)" + three.js perf guides | https://www.hontran.dev/blog/best-award-winning-websites-2026 | `[REPORTED S10/S5]` | A juror's breakdown of *why* sites win: By-Kin (SOTD + **Developer Award** + FWA + CSSDA), Iventions (CSSDA WOTM + SOTD + Dev), Mat Voyce (SOTD + GSAP SOTY nomination; kinetic typography), Uncommon Studio, Minh Pham (SOTD, dev score 7.77). **Pattern: the Developer Award is the one that correlates with engineering quality** |
| psychoactive.co.nz — Best WebGL & 3D agencies 2026 | https://www.psychoactive.co.nz/content-hub/best-webgl-interactive-3d-agencies | `[REPORTED S10]` | Studio-level craft analysis; "performance-budgeted award work" as a positioning |

## 4. What this gallery tells us to build (AK's synthesis)

1. **Two different awards exist for two different jobs.** Awwwards "education/institution" winners (Smithsonian) are won by **systems**; SOTD+Developer winners are won by **engineering in service of a story**. Our hub can only credibly aim at the first, with a taste of the second in exactly one scene. `[AK-RECOMMENDATION]`
2. **The 2026 premium-3D tier is shader-and-typography led, not model led.** Nobody in the lists above is winning with a GLTF product spin; they win with atmosphere, kinetic type and scroll authorship. That's good news for a project with no 3D assets.
3. **`Spotify Wrapped Party` is the single best analogue for "data made spectacular"** — our `StatsBar` (Total/Pinned today) is the seed of that idea at ~0 cost `[VERIFIED-FILE]`.
4. **Lenis appears in nearly every award-tier scroll build** (and its sponsors *are* these studios) `[VERIFIED-FETCH]` — but note the counter-trend: MDN's own support data now lets CSS do much of what ScrollTrigger was needed for. Copy the *taste*, not the dependency list.
5. **Geist Serif** `[VERIFIED-FETCH recent.design]` is a real candidate to pair with our existing Geist/Newsreader — flag for the Product Owner rather than deciding unilaterally.
